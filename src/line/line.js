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
            line: d3.svg.line().interpolate('basis')
                .x(function (d, i) { return scalerX(options.x(d, i)); })
                .y(function (d) { return scalerY(options.y(d)); }),
            area: d3.svg.area().interpolate('basis')
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

                options.xAxisOptions(xAxis);

                svg.select('g.x')
                  .interrupt()
                  .transition()
                  .ease('linear')
                  .duration(250)
                  .call(xAxis);

                var yAxis = d3.svg.axis()
                  .scale(shapes.scaleY)
                  .orient('left');

                options.yAxisOptions(yAxis);

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
