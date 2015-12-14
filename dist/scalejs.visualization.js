

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
define('line/line.js',[
    'scalejs!core',
    'knockout',
    'd3',
    'underscore',
    'scalejs.mvvm'
], function (
    core,
    ko,
    d3,
    _
) {
    'use strict';

    //https://github.com/gustavnikolaj/knockout-d3-line-graph
    function getPaintingMethods(data, element, options) {

      function mergeArrays(memo, element) {
        if(element.constructor === Array) {
          memo.concat(element);
        } else {
          memo.push(element);
        }
        return memo;
      }

        var elementRect = element.getBoundingClientRect(),
            padding = options.padding(),
            width = elementRect.width - padding.left - padding.right,
            height = elementRect.height - padding.top - padding.bottom,
            scalerX = options.xScale().domain(d3.extent(_.reduce(data, mergeArrays, []), options.x)).range([0, width]),
            scalerY = options.yScale().domain(d3.extent(_.reduce(data, mergeArrays, []), options.y)).range([height, 0]);

        return {
            line: d3.svg.line().interpolate(options.interpolate)
                .x(function (d, i) { return scalerX(options.x(d, i)); })
                .y(function (d) { return scalerY(options.y(d)); }),
            area: d3.svg.area().interpolate(options.interpolate)
                .x(function (d, i) { return scalerX(options.x(d, i)); })
                .y0(height)
                .y1(function (d) { return scalerY(options.y(d)); }),
            scaleX: scalerX,
            scaleY: scalerY
        };
    }


    ko.bindingHandlers.linegraph = {
        init: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.linegraph.options);
            ko.utils.extend(options, allBindings.get('linegraph'));

            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var elementRect = element.getBoundingClientRect();
            var data = bindingContext.value ? bindingContext.value() : bindingContext;
            var padding = options.padding();

            var shapes = getPaintingMethods(data, element, options);

            var svg = d3.select(element).append('svg');

            svg.attr('width', elementRect.width)
               .attr('height', elementRect.height);

            var plot = svg.append('g')
              .attr('class', 'plot')
              .attr('width', elementRect.width - padding.left - padding.right + 1)
              .attr('height', elementRect.height - padding.top - padding.bottom + 1)
              .attr('transform', 'translate(' + (padding.left + 1) + ',' + (padding.top - 1) + ')');

            plot.append('rect').attr('class', 'bg').attr('width', elementRect.width - padding.left - padding.right)
              .attr('height', elementRect.height - padding.top - padding.bottom)
              .attr('fill', 'none');

            plot.append('path').attr('class', 'area').attr('d', shapes.area(data));
            plot.append('path').attr('class', 'path').attr('d', shapes.line(data));

            if (options.showAxes) {
                var xAxis = d3.svg.axis()
                  .scale(shapes.scaleX)
                  .orient('bottom');

                svg.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(' + padding.left + ',' + (elementRect.height - padding.bottom) + ')')
                  .call(xAxis);

                var yAxis = d3.svg.axis()
                  .scale(shapes.scaleY)
                  .orient('left');

                svg.append('g')
                  .attr('class', 'y axis')
                  .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
                  .call(yAxis);

            }
        },
        update: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.linegraph.options);
            ko.utils.extend(options, allBindings.get('linegraph'));
            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var data = bindingContext.value ? bindingContext.value() : bindingContext;
            var shapes = getPaintingMethods(data, element, options);

            var svg = d3.select(element).select('svg');

            if (options.showAxes) {
                var xAxis = d3.svg.axis()
                  .scale(shapes.scaleX)
                  .orient('bottom');

                options.xAxisOptions(xAxis, svg.select('g.x'));

                svg.select('g.x')
                  .interrupt()
                  .transition()
                  .ease('linear')
                  .duration(250)
                  .call(xAxis);

                var yAxis = d3.svg.axis()
                  .scale(shapes.scaleY)
                  .orient('left');

                options.yAxisOptions(yAxis, svg.select('g.y'));

                svg.select('g.y')
                  .interrupt()
                  .transition()
                  .ease('linear')
                  .duration(250)
                  .call(yAxis);
            }

            svg.select('path.area')
               .interrupt()
               .transition()
               .ease('linear')
               .duration(250)
               .attr('d', shapes.area(data));

            svg.select('path.path')
               .interrupt()
               .transition()
               .ease('linear')
               .duration(250)
               .attr('d', shapes.line(data));
        },
        options: {
                   showAxes: false,
                   padding: function () {
                       return this.showAxes ? { top: 15, right: 20, left: 40, bottom: 25 } : { top: 0, right: 0, left: 0, bottom: 0 };
                   },
                   x: function (d, i) { return i; },
                   y: function (d) { return d; },
                   xScale: d3.scale.linear,
                   yScale: d3.scale.linear,
                   xAxisOptions: function (axis) { },
                   yAxisOptions: function (axis) { }

                 }
    };
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
    //line creates ko.bindingHandlers.linegraph
})
;
