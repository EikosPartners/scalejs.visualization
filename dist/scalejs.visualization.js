

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

    //gets the scales independently from which y value we want to paint
    function getScales(data, element, options) {
        var yDomain = function (data, yAccessor) {
            if(yAccessor.constructor === Array) {
                return d3.extent(_.chain(yAccessor).map(function (prop) {
                    return _.map(data, prop);
                }).reduce(function (memo, value) {
                    return memo.concat(value);
                }, []).value());
            } else {
                return d3.extent(data, yAccessor);
            }
        }

        var elementRect = element.getBoundingClientRect(),
            padding = options.padding(),
            width = elementRect.width - padding.left - padding.right,
            height = elementRect.height - padding.top - padding.bottom,
            scalerX = options.xScale().domain(d3.extent(data, options.x)).range([0, width]),
            scalerY = options.yScale().domain(yDomain(data, options.y)).range([height, 0]);

        return {
            scaleX: scalerX,
            scaleY: scalerY
        };

    }

    //https://github.com/gustavnikolaj/knockout-d3-line-graph
    function getPaintingMethods(data, element, options, scales) {

        var elementRect = element.getBoundingClientRect(),
            padding = options.padding(),
            width = elementRect.width - padding.left - padding.right,
            height = elementRect.height - padding.top - padding.bottom;

        return {
            line: d3.svg.line().interpolate(options.interpolate)
                .x(function (d, i) { return scales.scaleX(options.x(d, i)); })
                .y(function (d) { return scales.scaleY(options.y(d)); }),
            area: d3.svg.area().interpolate(options.interpolate)
                .x(function (d, i) { return scales.scaleX(options.x(d, i)); })
                .y0(height)
                .y1(function (d) { return scales.scaleY(options.y(d)); }),
        };
    }


    ko.bindingHandlers.linegraph = {
        init: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.linegraph.options);
            ko.utils.extend(options, allBindings.get('linegraph'));

            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var elementRect = element.getBoundingClientRect();
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var padding = options.padding();

            var scales = ko.computed(function () {
                var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
                return getScales(data, element, options)
            });
            var shapes = getPaintingMethods(data, element, options, scales());

            var svg = d3.select(element).append('svg');

            svg.attr('width', elementRect.width)
               .attr('height', elementRect.height);

            var PLOT_WIDTH = elementRect.width - padding.left - padding.right + 1;
            var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom + 1;
            var plot = svg.append('g')
              .attr('class', 'plot')
              .attr('width', PLOT_WIDTH)
              .attr('height', PLOT_HEIGHT)
              .attr('transform', 'translate(' + (padding.left + 1) + ',' + (padding.top - 1) + ')');

            plot.append('rect').attr('class', 'bg').attr('width', elementRect.width - padding.left - padding.right)
              .attr('height', elementRect.height - padding.top - padding.bottom)
              .attr('fill', 'none');

            if(options.y.constructor === Array) {
                options.y.forEach(function (prop) {
                    var propAccessor = function (d) {
                        return d[prop];
                    }

                    shapes = getPaintingMethods(data, element, _.extend(_.clone(options), {y: propAccessor}), scales());
                    plot.append('path').attr('class', 'area ' + prop).attr('d', shapes.area(data));
                    plot.append('path').attr('class', 'path ' + prop).attr('d', shapes.line(data));
                });
            } else {
                plot.append('path').attr('class', 'area').attr('d', shapes.area(data));
                plot.append('path').attr('class', 'path').attr('d', shapes.line(data));
            }

            if (options.showAxes) {
                var xAxis = d3.svg.axis()
                  .scale(scales().scaleX)
                  .orient('bottom');

                svg.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(' + padding.left + ',' + (elementRect.height - padding.bottom) + ')')
                  .call(xAxis);

                var yAxis = d3.svg.axis()
                  .scale(scales().scaleY)
                  .orient('left');

                svg.append('g')
                  .attr('class', 'y axis')
                  .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
                  .call(yAxis);

            }

            var focus = plot.append('g')
                .attr('class', 'focus')
                .style('display', 'none');

            focus.append('line').attr('y1', 0).attr('y2', PLOT_HEIGHT);

            if(options.y.constructor === Array) {
                options.y.forEach(function (prop) {
                    var container = focus.append('g')
                        .attr('class', prop);

                    container.append('circle')
                        .attr('r', 4.5);

                    container.append('text')
                        .attr('x', 9)
                        .attr('dy', '.35em');
                });
            } else {
                var container = focus.append('g')
                    .attr('class', 'circlecontainer');

                container.append('circle')
                    .attr('r', 4.5);

                container.append('text')
                    .attr('x', 9)
                    .attr('dy', '.35em');
            }


            svg.append('rect')
                .attr('class', 'overlay')
                .attr('width', PLOT_WIDTH)
                .attr('height', PLOT_HEIGHT)
                .attr('transform', 'translate(' + (padding.left + 1) + ',' + (padding.top - 1) + ')')
                .on('mouseover', function() { focus.style('display', null); })
                .on('mouseout', function() { focus.style('display', 'none'); })
                .on('mousemove', mousemove);


            var sortedData = ko.computed(function () {
                return _.sortBy(bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext, options.x);
            });

            var bisectX = d3.bisector(options.x).left;

            function mousemove() {
                data = sortedData();
                var x0 = scales().scaleX.invert(d3.mouse(this)[0]);
                var i = bisectX(data, x0, 1, data.length-1);
                var d0 = data[i - 1];
                var d1 = data[i];
                var d = x0 - options.x(d0) > options.x(d1) - x0 ? d1 : d0;
                var x = scales().scaleX(options.x(d));

                focus.attr('transform', 'translate(' + x + ',' + 0 + ')');

                if(options.y.constructor === Array) {
                    options.y.forEach(function (prop) {
                        var circle = focus.select('g.' + prop);
                        circle.attr('transform', 'translate(' + 0 + ',' + scales().scaleY(d[prop]) + ')');
                        circle.select('text').text(options.x(d) + ': ' + d[prop]);
                    });
                } else {
                    var y = scales().scaleY(options.y(d));
                    var circle = focus.select('g.circlecontainer');
                    circle.attr('transform', 'translate(' + 0 + ',' + scales().scaleY(options.y(d)) + ')');
                    circle.select('text').text(options.x(d) + ': ' + options.y(d));
                }



            }

        },
        update: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.linegraph.options);
            ko.utils.extend(options, allBindings.get('linegraph'));
            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var scales = getScales(data, element, options);
            var shapes = getPaintingMethods(data, element, options, scales);

            var svg = d3.select(element).select('svg');

            if (options.showAxes) {
                var xAxis = d3.svg.axis()
                  .scale(scales.scaleX)
                  .orient('bottom');

                options.xAxisOptions(xAxis);

                var xAxisSvg = svg.select('g.x')
                  .interrupt()
                  .transition()
                  .ease('linear')
                  .duration(250)
                  .call(xAxis);

                options.xAxisSvgOptions(xAxisSvg);

                var yAxis = d3.svg.axis()
                  .scale(scales.scaleY)
                  .orient('left');

                options.yAxisOptions(yAxis);

                var yAxisSvg = svg.select('g.y')
                  .interrupt()
                  .transition()
                  .ease('linear')
                  .duration(250)
                  .call(yAxis);

                options.yAxisSvgOptions(yAxisSvg);
            }

            if(options.y.constructor === Array) {
                options.y.forEach(function (prop) {
                    var propAccessor = function (d) {
                        return d[prop];
                    }

                    var scales = getScales(data, element, options);
                    shapes = getPaintingMethods(data, element, _.extend(_.clone(options), {y: propAccessor}), scales);

                    svg.select('path.area.' + prop)
                        .interrupt()
                        .transition()
                        .ease('linear')
                        .duration(250)
                        .attr('d', shapes.area(data));

                    svg.select('path.path.' + prop)
                        .interrupt()
                        .transition()
                        .ease('linear')
                        .duration(250)
                        .attr('d', shapes.line(data));
                });
            } else {
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
            }
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
           yAxisOptions: function (axis) { },
           xAxisSvgOptions: function (axis) { },
           yAxisSvgOptions: function (axis) { }
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
