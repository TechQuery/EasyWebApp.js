import View from './View';

import ObjectView from './ObjectView';


/**
 * View for Array model
 */
export default  class ArrayView extends View {
    /**
     * @param {Element} element
     */
    constructor(element) {

        if (! super(element,  'array',  [ ]).booted) {

            this.template = element.innerHTML.trim();  this.clear();
        }
    }

    clear() {

        this.length = 0;

        this.content.innerHTML = '';

        return this;
    }

    valueOf() {  return  Array.from(this,  view => view.valueOf());  }

    /**
     * @param {Iterable} list
     *
     * @return {ArrayView}
     */
    render(list) {

        const data = this.data;

        this.content.append(... [ ].concat(
            ... Array.from(list,  item => {

                const view = this[ this.length ] = new ObjectView( this.template );

                data[ data.length ] = view.data;

                return  view.render( item ).content;
            })
        ));

        return this;
    }

    push(... item) {

        return  this.render( item ).length;
    }
}
