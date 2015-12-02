define([
    'scalejs!core',
    'knockout',
    'd3',
    'underscore',
    'text!./view.html',
    'text!./template.html',
    './bindings.js',
    '../utils.js',
    'scalejs.mvvm'
], function (
    core,
    ko,
    d3,
    _,
    view,
    template,
    bindings,
    utils
) {
    'use strict';

    core.mvvm.registerBindings(bindings);
    core.mvvm.registerTemplates(template);

    return {
        viewModel: function(params) {
            this.data = ko.observable();
            this.nodeTemplate = params.nodeTemplate;

            ko.computed(function () {
                //deep clone params.data because array order was being modified
                var data = {};
                utils.extend(params.data, data);
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
