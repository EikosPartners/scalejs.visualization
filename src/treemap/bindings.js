define([
    'underscore'
], function (
    _
) {
    'use strict';

    function toPercent(value) {
        return value * 100 + '%';
    }
    return {
        /*jshint camelcase: false */
        treemap_node: function ( ctx ) {
            var parent = ctx.$parent.hasOwnProperty('x') &&
                         ctx.$parent.hasOwnProperty('y') &&
                         ctx.$parent.hasOwnProperty('dx') &&
                         ctx.$parent.hasOwnProperty('dy')
                ? ctx.$parent : {x: 0, y: 0, dx: 1, dy: 1};
            return _.extend({
                style: {
                    position: 'absolute',
                    left: toPercent((this.x - parent.x) / parent.dx),
                    top: toPercent((this.y - parent.y) / parent.dy),
                    width: toPercent(this.dx / parent.dx),
                    height: toPercent(this.dy / parent.dy),
                }
            }, _.isFunction(ctx.$component.nodeBindings) ? ctx.$component.nodeBindings.apply(this) : {});
        }
    };
})
