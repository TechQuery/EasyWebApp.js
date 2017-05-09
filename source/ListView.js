define(['jquery', 'View', 'HTMLView'],  function ($, View, HTMLView) {

    function ListView() {

        var _This_ = View.apply(this, arguments);

        if (this != _This_)  return _This_;

        this.__HTML__ = this.$_View.html();

        this.clear();
    }

    return  View.extend(ListView, {
        is:    $.expr[':'].list
    }, {
        splice:     Array.prototype.splice,
        clear:      function () {
            this.$_View.empty();

            this.splice(0, Infinity);

            return this;
        },
        insert:     function (iData, Index) {

            var Item = (new HTMLView(this.__HTML__, this.__data__)).parse();

            Item.$_View.insertTo(this.$_View, Index);

            iData.__index__ = Index || 0;

            this.splice(iData.__index__,  0,  Item.render( iData ));

            return Item;
        },
        render:     function (iList) {

            if ($.likeArray( iList ))
                $.map(iList,  this.insert.bind( this ));

            return this;
        },
        indexOf:    function ($_Item) {

            $_Item = ($_Item instanceof $)  ?  $_Item  :  $( $_Item );

            return (
                ($_Item[0].parentNode == this.$_View[0])  ?
                    $_Item  :  $_Item.parentsUntil( this.$_View )
            ).index();
        },
        remove:     function (Index) {

            var Item = this.splice(
                    $.isNumeric( Index )  ?  Index  :  this.indexOf( Index ),  1
                )[0];

            Item.$_View.remove();

            return Item;
        },
        childOf:    function () {

            return  $.map(this,  function () {

                return  arguments[0].__child__;
            });
        }
    });
});