define([
    'jquery', 'Observer', 'InnerLink', 'TreeBuilder', 'HTMLView', 'View'
],  function ($, Observer, InnerLink, TreeBuilder, HTMLView, View) {

    function WebApp(Page_Box, API_Root) {

        if (this instanceof $)
            return  new arguments.callee(this[0], Page_Box, API_Root);

        var _This_ = $('*:data("_EWA_")').data('_EWA_') || this;

        if (_This_ !== this)  return _This_;

        Observer.call( this ).$_Page = $( Page_Box ).data('_EWA_', this);

        this.apiRoot = API_Root || '';

        var iPath = self.location.href.split('?')[0];

        this.pageRoot = $.filePath(
            iPath  +  (iPath.match(/\/([^\.]+\.html?)?/i) ? '' : '/')
        ) + '/';

        this.length = 0;
        this.lastPage = -1;
        this.loading = { };

        this.listenDOM().listenBOM().boot();
    }

    return  $.inherit(Observer, WebApp, null, {
        indexOf:      Array.prototype.indexOf,
        splice:       Array.prototype.splice,
        push:         Array.prototype.push,
        setRoute:     function (iLink) {

            if (++this.lastPage != this.length)
                this.splice(this.lastPage, Infinity);

            self.history.pushState(
                {index: this.length},
                document.title = iLink.title,
                '#!' + self.btoa(
                    iLink.href  +  (iLink.src  ?  ('?data=' + iLink.src)  :  '')
                )
            );
            this.push( iLink );
        },
        getRoute:     function () {
            return self.atob(
                (self.location.hash.match(/^\#!(.+)/) || '')[1]  ||  ''
            );
        },
        getCID:       function () {
            return  arguments[0].replace(this.pageRoot, '')
                .replace(/\.\w+(\?.*)?/i, '.html');
        },
        loadView:     function (iLink, iHTML) {

            var $_Target,  $_Template;

            switch ( iLink.target ) {
                case '_blank':    return;
                case '_self':     {
                    var iPrev = View.instanceOf(this.$_Page, false);

                    if ( iPrev )  iPrev.destructor();

                    if (this.indexOf( iLink )  ==  -1)  this.setRoute( iLink );

                    $_Target = this.$_Page;    break;
                }
                default:          {
                    $_Target = iLink.$_View;

                    if ( iLink.href ) {
                        $_Template = $_Target[0].innerHTML;

                        $_Target.empty();
                    }
                }
            }

            return  ((! iHTML)  ?  Promise.resolve('')  :  $_Target.htmlExec(
                this.emit(
                    $.extend(iLink.valueOf(), {type: 'template'}),  iHTML
                )
            )).then(function () {

                if (! $_Target.find('script[src]:not(head > *)')[0])
                    iLink.emit('load');

                return  TreeBuilder($_Target, $_Template);
            });
        },
        load:         function (iLink) {

            if (iLink instanceof Element)
                iLink = new InnerLink(iLink, this.apiRoot);

            this.loading[ iLink.href ] = iLink;

            var iData,  iEvent = iLink.valueOf(),  _This_ = this,  JS_Load,  iView;

            return  iLink.load().then(function () {

                iData = arguments[0][1];

                if (iData != null)
                    iData = _This_.emit($.extend(iEvent, {type: 'data'}),  iData);

                JS_Load = iLink.on('load');

                return  _This_.loadView(iLink, arguments[0][0]);

            }).then(function () {

                iView = arguments[0];

                return JS_Load;

            }).then(function (iFactory) {

                delete _This_.loading[ iLink.href ];

                if ( iFactory )  iData = iFactory.call(iView, iData)  ||  iData;

                _This_.emit(
                    $.extend(iEvent,  {type: 'ready'}),
                    (typeof iData == 'object')  ?  iView.render(iData)  :  iView
                );
            });
        },
        listenDOM:    function () {
            var _This_ = this;

            $(document).on('input change',  ':field',  $.throttle(function () {

                var iView = HTMLView.instanceOf( this );

                if ( iView )
                    iView.render(
                        this.name || this.getAttribute('name'),
                        $(this).value('name')
                    );
            })).on('click submit',  'a[href], form[action]',  function () {

                var CID = (this.href || this.action).match(_This_.pageRoot);

                if ((CID || '').index === 0) {

                    arguments[0].preventDefault();

                    _This_.load( this );
                }
            });

            return this;
        },
        listenBOM:    function () {
            var _This_ = this;

            $(self).on('popstate',  function () {

                var Index = (arguments[0].originalEvent.state || '').index;

                if (_This_[Index]  &&  (_This_.lastPage != Index))
                    _This_.load(_This_[Index]).then(function () {

                        _This_.lastPage = Index;

                        document.title = _This_[Index].title;
                    });
            });

            return this;
        },
        boot:         function () {

            var $_Init = $('[data-href]').not( this.$_Page.find('[data-href]') ),
                _This_ = this;

            return  ($_Init[0]  ?  this.load( $_Init[0] )  :  Promise.resolve(''))
                .then(function () {

                    var Init = _This_.getRoute();

                    if ( Init )
                        return  _This_.load( $('<a />',  {href: Init})[0] );

                    $('a[href][data-autofocus]').eq(0).click();
                });
        }
    });
});