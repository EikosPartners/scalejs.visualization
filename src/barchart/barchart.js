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

            xAxis = options.xAxisOptions.call({x: x, y: y, PLOT_WIDTH: PLOT_WIDTH, PLOT_HEIGHT: PLOT_HEIGHT, padding: padding}, xAxis);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickSize(0)
                .tickPadding(6);

            yAxis = options.yAxisOptions.call({x: x, y: y, PLOT_WIDTH: PLOT_WIDTH, PLOT_HEIGHT: PLOT_HEIGHT, padding: padding}, yAxis);

            var svg = d3.select(element).append('svg')
                .attr('width', PLOT_WIDTH + padding.left + padding.right)
                .attr('height', PLOT_HEIGHT + padding.top + padding.bottom)
                .append('g')
                .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
                .attr('width', PLOT_WIDTH)
                .attr('height', PLOT_HEIGHT);

            var yMinMax = d3.extent(data, options.y);
            if(options.hasOwnProperty('yMin') && typeof options.yMin === 'number') {
                yMinMax[0] = Math.min(yMinMax[0], options.yMin);
            }
            if(options.hasOwnProperty('yMax') && typeof options.yMax === 'number') {
                yMinMax[1] = Math.max(yMinMax[1], options.yMax);
            }
            x.domain(yMinMax).nice();    //y traditionally has the value
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

            var xAxisSvg = svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + PLOT_HEIGHT + ')')
                .call(xAxis);

            options.xAxisSvgOptions(xAxisSvg);

            var yAxisSvg = svg.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + x(0) + ',0)')
                .call(yAxis);

            options.yAxisSvgOptions(yAxisSvg);

            if(clickHandler && _.isFunction(clickHandler)) {
                rect.on('click', function(d,i){
                    clickHandler.call(d, d, i);
                });
            }

            //namespace resize call: http://stackoverflow.com/questions/26409078/how-to-have-multiple-d3-window-resize-events
            d3.select(window).on('resize.' + Math.random().toString(36).substring(7), _.throttle(resize, 100));

            function resize() {
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

                xAxis = options.xAxisOptions.call({x: x, y: y, PLOT_WIDTH: PLOT_WIDTH, PLOT_HEIGHT: PLOT_HEIGHT, padding: padding}, xAxis);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient('left')
                    .tickSize(0)
                    .tickPadding(6);

                yAxis = options.yAxisOptions.call({x: x, y: y, PLOT_WIDTH: PLOT_WIDTH, PLOT_HEIGHT: PLOT_HEIGHT, padding: padding}, yAxis);

                var svg = d3.select(element).select('svg')
                    .attr('width', PLOT_WIDTH + padding.left + padding.right)
                    .attr('height', PLOT_HEIGHT + padding.top + padding.bottom)
                    .select('g')
                    .attr('width', PLOT_WIDTH)
                    .attr('height', PLOT_HEIGHT);

                var yMinMax = d3.extent(data, options.y);
                if(options.hasOwnProperty('yMin') && typeof options.yMin === 'number') {
                    yMinMax[0] = Math.min(yMinMax[0], options.yMin);
                }
                if(options.hasOwnProperty('yMax') && typeof options.yMax === 'number') {
                    yMinMax[1] = Math.max(yMinMax[1], options.yMax);
                }
                x.domain(yMinMax).nice();    //y traditionally has the value
                y.domain(data.map(options.x));  //x is the label

                var plot = svg.select('g.plot');

                var rect = plot.selectAll('.bar').data(data).transition().duration(1000)
                    .attr('class', function(d) { return 'bar bar-' + (options.y(d) < 0 ? 'negative' : 'positive'); })
                    .attr('x', function(d) { return x(Math.min(0, options.y(d))); })
                    .attr('y', function(d) { return y(options.x(d)); })
                    .attr('width', function(d) { return Math.abs(x(options.y(d)) - x(0)); })
                    .attr('height', y.rangeBand());

                var xAxisSvg = svg.select('g.x.axis')
                    .transition().duration(1000)
                    .attr('transform', 'translate(0,' + PLOT_HEIGHT + ')')
                    .call(xAxis);

                options.xAxisSvgOptions(xAxisSvg);

                var yAxisSvg = svg.select('g.y.axis')
                    .transition().duration(1000)
                    .attr('transform', 'translate(' + x(0) + ',0)')
                    .call(yAxis);

                options.yAxisSvgOptions(yAxisSvg);
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

            xAxis = options.xAxisOptions.call({x: x, y: y, PLOT_WIDTH: PLOT_WIDTH, PLOT_HEIGHT: PLOT_HEIGHT, padding: padding}, xAxis);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .tickSize(0)
                .tickPadding(6);

            yAxis = options.yAxisOptions.call({x: x, y: y, PLOT_WIDTH: PLOT_WIDTH, PLOT_HEIGHT: PLOT_HEIGHT, padding: padding}, yAxis);

            var svg = d3.select(element).select('svg').select('g');

            var yMinMax = d3.extent(data, options.y);
            if(options.hasOwnProperty('yMin') && typeof options.yMin === 'number') {
                yMinMax[0] = Math.min(yMinMax[0], options.yMin);
            }
            if(options.hasOwnProperty('yMax') && typeof options.yMax === 'number') {
                yMinMax[1] = Math.max(yMinMax[1], options.yMax);
            }
            x.domain(yMinMax).nice();    //y traditionally has the value
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

            var xAxisSvg = svg.select('g.x.axis')
                .transition().duration(1000)
                .call(xAxis);

            options.xAxisSvgOptions(xAxisSvg);

            var yAxisSvg = svg.select('g.y.axis')
                .transition().duration(1000)
                .attr('transform', 'translate(' + x(0) + ',0)')
                .call(yAxis);

            options.yAxisSvgOptions(yAxisSvg);

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
            },
            xAxisOptions: function (axis) { return axis; },
            yAxisOptions: function (axis) { return axis; },
            xAxisSvgOptions: function (axis) { },
            yAxisSvgOptions: function (axis) { }
        }
    };
});
