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

    ko.bindingHandlers.barchart = {
        init: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.barchart.options);
            ko.utils.extend(options, allBindings.get('barchart'));

            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var elementRect = element.getBoundingClientRect();
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var clickHandler = bindingContext.click;
            var padding = options.padding();

            var PLOT_WIDTH = elementRect.width - padding.left - padding.right;
            var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom;

            var x = d3.scale.linear()
                .range([0, PLOT_WIDTH]);

            var y = d3.scale.ordinal()
                .rangeRoundBands([0, PLOT_HEIGHT], 0.1);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickSize(0)
                .tickPadding(6);

            var svg = d3.select(element).append('svg')
                .attr('width', PLOT_WIDTH + padding.left + padding.right)
                .attr('height', PLOT_HEIGHT + padding.top + padding.bottom)
                .append('g')
                .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

            x.domain(d3.extent(data, options.y)).nice();    //y traditionally has the value
            y.domain(data.map(options.x));  //x is the label

            var plot = svg.append('g').attr('class', 'plot');

            var rect = plot.selectAll('.bar')
                .data(data)
                .enter().append('rect')
                .attr('class', function(d) { return 'bar bar-' + (options.y(d) < 0 ? 'negative' : 'positive'); })
                .attr('x', function(d) { return x(Math.min(0, options.y(d))); })
                .attr('y', function(d) { return y(options.x(d)); })
                .attr('width', function(d) { return Math.abs(x(options.y(d)) - x(0)); })
                .attr('height', y.rangeBand());

            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + PLOT_HEIGHT + ')')
                .call(xAxis);

            svg.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + x(0) + ',0)')
                .attr('transition', '1s')
                .call(yAxis);


            if(clickHandler && _.isFunction(clickHandler)) {
                rect.on('click', function(d,i){
                    clickHandler.call(d.data, d, i);
                });
            }

        },
        update: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.barchart.options);
            ko.utils.extend(options, allBindings.get('barchart'));

            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var elementRect = element.getBoundingClientRect();
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var clickHandler = bindingContext.click;
            var padding = options.padding();

            var PLOT_WIDTH = elementRect.width - padding.left - padding.right;
            var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom;

            var x = d3.scale.linear()
                .range([0, PLOT_WIDTH]);

            var y = d3.scale.ordinal()
                .rangeRoundBands([0, PLOT_HEIGHT], 0.1);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient('bottom');

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickSize(0)
                .tickPadding(6);

            var svg = d3.select(element).select('svg').select('g');

            x.domain(d3.extent(data, options.y)).nice();    //y traditionally has the value
            y.domain(data.map(options.x));  //x is the label

            var plot = svg.select('.plot');
            plot.selectAll('.bar').data(data).transition().duration(1000)
                .attr('class', function(d) { return 'bar bar-' + (options.y(d) < 0 ? 'negative' : 'positive'); })
                .attr('x', function(d) { return x(Math.min(0, options.y(d))); })
                .attr('y', function(d) { return y(options.x(d)); })
                .attr('width', function(d) { return Math.abs(x(options.y(d)) - x(0)); })
                .attr('height', y.rangeBand());

            plot.selectAll('.bar')
                .data(data)
                .enter().append('rect')
                .transition()
                .duration(1000)
                .attr('class', function(d) { return 'bar bar-' + (options.y(d) < 0 ? 'negative' : 'positive'); })
                .attr('x', function(d) { return x(Math.min(0, options.y(d))); })
                .attr('y', function(d) { return y(options.x(d)); })
                .attr('width', function(d) { return Math.abs(x(options.y(d)) - x(0)); })
                .attr('height', y.rangeBand());

            plot.selectAll('.bar')
                .data(data).exit()
                .transition()
                .duration(1000)
                .ease('exp')
                .attr('width', 0)
                .remove();

            svg.select('g.x.axis')
                .transition().duration(1000)
                .call(xAxis);

            svg.select('g.y.axis')
                .transition().duration(1000)
                .attr('transform', 'translate(' + x(0) + ',0)')
                .call(yAxis);

        },
        options: {
            x: function (d) {
                return d.x;
            },
            y: function (d) {
                return d.y;
            },
            padding: function () {
                return { top: 15, right: 20, left: 40, bottom: 25 };
            }
        }
    };
});
