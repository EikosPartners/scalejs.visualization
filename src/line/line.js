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

    //https://github.com/gustavnikolaj/knockout-d3-line-graph
    function getPaintingMethods(data, element, options) {

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
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
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

            if(options.y.constructor === Array) {
                options.y.forEach(function (prop) {
                    var propAccessor = function (d) {
                        return d[prop];
                    }

                    shapes = getPaintingMethods(data, element, _.extend(_.clone(options), {y: propAccessor}));
                    plot.append('path').attr('class', 'area ' + prop).attr('d', shapes.area(data));
                    plot.append('path').attr('class', 'path ' + prop).attr('d', shapes.line(data));
                });
            } else {
                plot.append('path').attr('class', 'area').attr('d', shapes.area(data));
                plot.append('path').attr('class', 'path').attr('d', shapes.line(data));
            }

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

            var focus = svg.append("g")
                .attr("class", "focus")
                .style("display", "none");

            focus.append("circle")
                .attr("r", 4.5);

            focus.append("text")
                .attr("x", 9)
                .attr("dy", ".35em");

            svg.append("rect")
                .attr("class", "overlay")
                .attr("width", elementRect.width)
                .attr("height", elementRect.height)
                .on("mouseover", function() { focus.style("display", null); })
                .on("mouseout", function() { focus.style("display", "none"); })
                .on("mousemove", mousemove);

            function mousemove() {
                debugger;
                data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
                shapes = getPaintingMethods(data, element, options);
                var bisectDate = d3.bisector(function(d) { return d.ValueDate; }).left;
                var x0 = shapes.scaleX.invert(d3.mouse(this)[0]);
                var i = bisectDate(data, x0, 1);
                var d0 = data[i - 1];
                var d1 = data[i];
                var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                focus.attr("transform", "translate(" + shapes.scaleX(d.ValueDate) + "," + shapes.scaleY(d.Max) + ")");
                focus.select("text").text(d.Max);
            }

        },
        update: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.linegraph.options);
            ko.utils.extend(options, allBindings.get('linegraph'));
            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var shapes = getPaintingMethods(data, element, options);

            var svg = d3.select(element).select('svg');

            if (options.showAxes) {
                var xAxis = d3.svg.axis()
                  .scale(shapes.scaleX)
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
                  .scale(shapes.scaleY)
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

                    shapes = getPaintingMethods(data, element, _.extend(_.clone(options), {y: propAccessor}));

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
