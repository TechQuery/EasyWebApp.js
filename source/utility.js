/**
 * Merge own properties of two or more objects together into the first object
 * by their descriptor
 *
 * @param {Object}    target - An object that will receive the new properties
 *                             if `source` are passed in
 * @param {...Object} source - Additional objects containing properties to merge in
 *
 * @return {Object} The `target` parameter
 */
export function extend(target, ...source) {

    for (let object of source)  if (object instanceof Object) {

        let descriptor = Object.getOwnPropertyDescriptors( object );

        if (target instanceof Function) {

            delete descriptor.name;
            delete descriptor.length;
            delete descriptor.prototype;

            Object.defineProperties(
                target.prototype,
                Object.getOwnPropertyDescriptors( object.prototype )
            );
        }

        Object.defineProperties(target, descriptor);
    }

    return target;
}


var depth = 0;

/**
 * Traverse Object-tree & return Node array through the filter
 *
 * @param {object}        node     - Object tree
 * @param {string}        fork_key - Key of children list
 * @param {MapTreeFilter} filter   - Map filter
 *
 * @return {Array}  Result list of Map filter
 */
export function mapTree(node, fork_key, filter) {

    var children = node[fork_key], list = [ ];    depth++ ;

    for (var i = 0, value;  i < children.length;  i++) {
        /**
         * @typedef {function} MapTreeFilter
         *
         * @param {object} child
         * @param {number} index
         * @param {number} depth
         *
         * @return {?object}  `Null` or `Undefined` to **Skip the Sub-Tree**,
         *                    and Any other Type to Add into the Result Array.
         */
        try {
            value = filter.call(node, children[i], i, depth);

        } catch (error) {

            depth = 0;    throw error;
        }

        if (! (value != null))  continue;

        list.push( value );

        if ((children[i] != null)  &&  (children[i][fork_key] || '')[0])
            list.push.apply(
                list,  mapTree(children[i], fork_key, filter)
            );
    }

    depth-- ;

    return list;
}
