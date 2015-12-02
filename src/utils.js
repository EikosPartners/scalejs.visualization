define([
], function (
) {
    'use strict';

    return {
      //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object#answer-1042676
      extend: function extend(from, to) {
        if (from === null || typeof from !== 'object') {
            return from;
        }
        if (from.constructor !== Object && from.constructor !== Array) {
            return from;
        }
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean) {
            return new from.constructor(from);
        }

        to = to || new from.constructor();

        for (var name in from)
        {
            if(from.hasOwnProperty(name)) {
                to[name] = typeof to[name] == 'undefined' ? extend(from[name], null) : to[name];
            }
        }

        return to;
    }
  }

})
