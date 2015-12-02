

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
define('utils.js',[
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
;
define('treemap/treemap.js',[
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
;

define('text!line/view.html',[],function () { return '';});

;
define("line/bindings.js", function(){});

define('line/line.js',[
    'scalejs!core',
    'knockout',
    'd3',
    'underscore',
    'text!./view.html',
    './bindings.js',
    '../utils.js',
    'scalejs.mvvm'
], function (
    core,
    ko,
    d3,
    _,
    view,
    bindings,
    utils
) {
    'use strict';

    core.mvvm.registerBindings(bindings);

    return {
        viewModel: function(params, componentInfo) {
            this.data = ko.observable();
            var domNode = componentInfo.element;

            ko.computed(function () {
                //deep clone params.data because array order was being modified
                var data = {};
                utils.extend(params.data, data);

                var vis = d3.select(domNode),
                  WIDTH = domNode.clientWidth,
                  HEIGHT = domNode.clientHeight,
                  MARGINS = {
                      top: 20,
                      right: 20,
                      bottom: 20,
                      left: 50
                  },
                  xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([2000, 2010]),
                  yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([134, 215]),

                  xAxis = d3.svg.axis()
                  .scale(xScale),

                  yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient('left');

                  vis.append('svg:g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
                        .call(xAxis);
                    vis.append('svg:g')
                        .attr('class', 'y axis')
                        .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
                        .call(yAxis);
                    var lineGen = d3.svg.line()
                        .x(function(d) {
                            return xScale(d.x);
                        })
                        .y(function(d) {
                            return yScale(d.y);
                        })
                        .interpolate('basis');

                    data.forEach(function (line) {
                      vis.append('svg:path')
                          .attr('d', lineGen(line))
                          .attr('stroke', 'green')
                          .attr('stroke-width', 2)
                          .attr('fill', 'none');
                    });


            }.bind(this));
        },
        template: view
    }
})
;
define('scalejs.visualization',[
    'knockout',
    './treemap/treemap.js',
    './line/line.js'
], function (
    ko,
    treemap,
    line
) {
    'use strict';
    ko.components.register('treemap', treemap);
    ko.components.register('line', line);
})
;
