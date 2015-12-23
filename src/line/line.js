define([
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

            var scales = ko.observable(getScales(data, element, options));
            if(ko.isObservable(bindingContext.value)) {
                bindingContext.value.subscribe(function (data) {
                    scales(getScales(data, element, options));
                });
            }

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

            var bg = plot.append('rect').attr('class', 'bg')
                .attr('width', elementRect.width - padding.left - padding.right)
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

            var xAxis,
                xAxisSvg,
                yAxis,
                yAxisSvg;

            if (options.showAxes) {
                xAxis = d3.svg.axis()
                  .scale(scales().scaleX)
                  .orient('bottom');

                options.xAxisOptions(xAxis);

                xAxisSvg = svg.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(' + padding.left + ',' + (elementRect.height - padding.bottom) + ')')
                  .call(xAxis);

                options.xAxisSvgOptions(xAxisSvg);

                yAxis = d3.svg.axis()
                  .scale(scales().scaleY)
                  .orient('left');

                options.yAxisOptions(yAxis);

                yAxisSvg = svg.append('g')
                  .attr('class', 'y axis')
                  .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
                  .call(yAxis);

                options.yAxisSvgOptions(yAxisSvg);
            }

            var focus = plot.append('g')
                .attr('class', 'focus');
                // .style('display', 'none');

            var line = focus.append('line').attr('y1', 0).attr('y2', PLOT_HEIGHT);

            if(options.y.constructor === Array) {
                options.y.forEach(function (prop) {
                    var container = focus.append('g')
                        .attr('class', prop);

                    container.append('circle')
                        .attr('r', options.circleRadius);

                    container.append('text')
                        .attr('x', 9)
                        .attr('dy', '.35em');
                });
            } else {
                var container = focus.append('g')
                    .attr('class', 'circlecontainer');

                container.append('circle')
                    .attr('r', options.circleRadius);

                container.append('text')
                    .attr('x', 9)
                    .attr('dy', '.35em');
            }


            var rect = svg.append('rect')
                .attr('class', 'overlay')
                .attr('width', PLOT_WIDTH)
                .attr('height', PLOT_HEIGHT)
                .attr('overflow', 'scroll')
                .attr('transform', 'translate(' + (padding.left + 1) + ',' + (padding.top - 1) + ')');

            d3.select('body').on('mousemove', move(d3.mouse));
            d3.select('body').on('touchmove', move(function (c) {
                return d3.touches(c).pop();
            }));

            d3.select(window).on('resize', _.throttle(resize, 100));

            function resize() {
                // update width
                var elementRect = element.getBoundingClientRect();
                var PLOT_WIDTH = elementRect.width - padding.left - padding.right + 1;
                var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom + 1;
                scales(getScales(data, element, options));

                svg.attr('width', elementRect.width)
                   .attr('height', elementRect.height);

                plot.attr('width', PLOT_WIDTH)
                    .attr('height', PLOT_HEIGHT);

                bg.attr('width', elementRect.width - padding.left - padding.right)
                    .attr('height', elementRect.height - padding.top - padding.bottom);

                line.attr('y2', PLOT_HEIGHT);

                rect.attr('width', PLOT_WIDTH)
                    .attr('height', PLOT_HEIGHT);

                if (options.showAxes) {
                    xAxis = d3.svg.axis()
                      .scale(scales().scaleX)
                      .orient('bottom');

                    options.xAxisOptions(xAxis);

                    xAxisSvg
                      .attr('transform', 'translate(' + padding.left + ',' + (elementRect.height - padding.bottom) + ')')
                      .call(xAxis);

                    options.xAxisSvgOptions(xAxisSvg);

                    yAxis = d3.svg.axis()
                      .scale(scales().scaleY)
                      .orient('left');

                    options.yAxisOptions(yAxis);

                    yAxisSvg
                      .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
                      .call(yAxis);

                    options.yAxisSvgOptions(yAxisSvg);
                }

                if(options.y.constructor === Array) {
                    options.y.forEach(function (prop) {
                        var propAccessor = function (d) {
                            return d[prop];
                        }

                        var shapes = getPaintingMethods(data, element, _.extend(_.clone(options), {y: propAccessor}), scales());

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

            }

            function move(moveType) {
                var container = rect[0][0],
                    sortedData = ko.computed(function () {
                        return _.sortBy(bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext, options.x);
                    }),
                    bisectX = d3.bisector(options.x).left;

                function coordWithinBounds(coords, element) {
                    var x = coords[0];
                    var y = coords[1];
                    var width = parseInt(element.getAttribute('width'), 10);
                    var height = parseInt(element.getAttribute('height'), 10)
                    return x > 0 && x < width && y > 0 && y < height;
                }

                return function mousemove() {
                    var CONTAINER_WIDTH = parseInt(container.getAttribute('width'), 10);
                    var coords = moveType(container);
                    if (!coordWithinBounds(coords, container)) {
                        return;
                    }
                    d3.event.preventDefault();
                    data = sortedData();
                    var x0 = scales().scaleX.invert(coords[0]);
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
                            var xText = xAxis.tickFormat() ? xAxis.tickFormat()(options.x(d)) : options.x(d);
                            var yText = yAxis.tickFormat() ? yAxis.tickFormat()(d[prop]) : d[prop];
                            var text = circle.select('text');
                            text.text(prop + ': (' + xText + ', ' + yText + ')');
                            var textWidth = text.node().getComputedTextLength();
                            if(x + textWidth > CONTAINER_WIDTH) {
                                text.attr('transform', 'translate(' + (-textWidth - (options.circleRadius * 2 * 2)) + ',' + 0 + ')');
                            } else {
                                text.attr('transform', null);
                            }
                        });
                    } else {
                        var y = scales().scaleY(options.y(d));
                        var circle = focus.select('g.circlecontainer');
                        circle.attr('transform', 'translate(' + 0 + ',' + scales().scaleY(options.y(d)) + ')');
                        var xText = xAxis.tickFormat() ? xAxis.tickFormat()(options.x(d)) : options.x(d);
                        var yText = yAxis.tickFormat() ? yAxis.tickFormat()(options.y(d)) : options.y(d);
                        var text = circle.select('text');
                        text.text('(' + xText + ', ' + yText + ')');
                        var textWidth = text.node().getComputedTextLength();
                        if(x + textWidth > CONTAINER_WIDTH) {
                            text.attr('transform', 'translate(' + (-textWidth - (options.circleRadius * 2 * 2)) + ',' + 0 + ')');
                        } else {
                            text.attr('transform', null);
                        }
                    }



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
           circleRadius: 4.5,
           xAxisOptions: function (axis) { },
           yAxisOptions: function (axis) { },
           xAxisSvgOptions: function (axis) { },
           yAxisSvgOptions: function (axis) { }
       };
})
