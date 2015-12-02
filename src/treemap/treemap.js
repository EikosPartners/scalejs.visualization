define([
    'scalejs!core',
    'knockout',
    'd3',
    'underscore',
    'text!./view.html',
    'text!./template.html',
    './bindings.js',
    'scalejs.mvvm'
], function (
    core,
    ko,
    d3,
    _,
    view,
    template,
    bindings
) {
    'use strict';

    core.mvvm.registerBindings(bindings);
    core.mvvm.registerTemplates(template);

    //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object#answer-1042676
    function extend(from, to)
    {
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

    return {
        viewModel: function(params) {
            this.data = ko.observable();
            this.nodeTemplate = params.nodeTemplate;

            ko.computed(function () {
                //deep clone params.data because array order was being modified
                var data = {};
                extend(params.data, data);
                d3.layout.treemap()
                    .round(false)
                    .sticky(true)
                    .value(function (d) {
                        if(params.value) {
                            if(_.isFunction(params.value)) {
                                return ko.unwrap(params.value(d));
                            } else {
                                return ko.unwrap(d[params.value]);
                            }
                        } else {
                            return ko.unwrap(d.size);
                        }
                    })
                    .nodes(data);
                this.data(data);
            }.bind(this));
        },
        template: view
    }
})
