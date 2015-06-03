define([
    'scalejs!core',
    'knockout',
    'd3',
    'text!./view.html',
    'text!./template.html',
    './bindings.js',
    'scalejs.mvvm'
], function (
    core,
    ko,
    d3,
    view,
    template,
    bindings
) {
    'use strict';
    var registerTemplates = core.mvvm.registerTemplates;

    core.mvvm.registerBindings(bindings);
    registerTemplates(template);

    return {
        viewModel: function(params) {
            this.data = ko.observable();
            this.nodeTemplate = params.nodeTemplate;

            ko.computed(function () {
                var data = ko.unwrap(params.data);
                d3.layout.treemap()
                    .round(false)
                    .sticky(true)
                    .value(function (d) {return d.size})
                    .nodes(data);
                this.data(data);
            }.bind(this));
        },
        template: view
    }
})
