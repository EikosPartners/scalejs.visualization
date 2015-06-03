

define('text!treemap/view.html',[],function () { return '<ul class="root">\n    <!-- ko template: {name: \'treemap_recurse\', data: data} -->\n    <!-- /ko -->\n</ul>\n';});


define('text!treemap/template.html',[],function () { return '<script id="treemap_recurse">\n    <li class="node" data-class="treemap_node">\n        <!-- ko if: $component.nodeTemplate -->\n            <!-- ko template: $component.nodeTemplate -->\n            <!-- /ko -->\n        <!-- /ko -->\n        <!-- ko if: $data.children -->\n            <ul>\n                <!-- ko template: {name: \'treemap_recurse\', foreach: children} -->\n                <!-- /ko -->\n            </ul>\n        <!-- /ko -->\n    </li>\n</script>\n';});

define('treemap/bindings.js',[
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
;
define('treemap/treemap.js',[
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
            this.nodeBindings = params.nodeBindings;
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
;
define('scalejs.visualization',[
    'knockout',
    './treemap/treemap.js'
], function (
    ko,
    treemap
) {
    'use strict';
    ko.components.register('treemap', treemap);
})
;
