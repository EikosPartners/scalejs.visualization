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

    ko.bindingHandlers.donut = {
        init: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.donut.options);
            ko.utils.extend(options, allBindings.get('donut'));

            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var elementRect = element.getBoundingClientRect();
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var padding = options.padding();

            var svg = d3.select(element).append('svg');

            svg.attr('width', elementRect.width)
                .attr('height', elementRect.height);

            var PLOT_WIDTH = elementRect.width - padding.left - padding.right + 1;
            var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom + 1;
            var PLOT_RADIUS = Math.min(PLOT_WIDTH, PLOT_HEIGHT) / 2;

            var arc = d3.svg.arc()
                .outerRadius(PLOT_RADIUS - 10)
                .innerRadius(PLOT_RADIUS - 70);

            var pie = d3.layout.pie()
                .sort(null)
                .value(options.y);

            svg
                .attr('width', PLOT_WIDTH)
                .attr('height', PLOT_HEIGHT)
                .append('g')
                .attr('transform', 'translate(' + PLOT_WIDTH / 2 + ',' + PLOT_HEIGHT / 2 + ')');

            var g = svg.selectAll('.arc')
                .data(pie(data))
                .enter().append('g')
                .attr('class', 'arc');

            g.append('path')
                .attr('d', arc)
                .attr('class', options.x);

            g.append('text')
                .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                .attr('dy', '.35em')
                .text(options.x);

        },
        update: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.donut.options);
            ko.utils.extend(options, allBindings.get('donut'));
            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var elementRect = element.getBoundingClientRect();
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var padding = options.padding();

            var PLOT_WIDTH = elementRect.width - padding.left - padding.right + 1;
            var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom + 1;
            var PLOT_RADIUS = Math.min(PLOT_WIDTH, PLOT_HEIGHT) / 2;

            var svg = d3.select(element).select('svg');

            var arc = d3.svg.arc()
                .outerRadius(PLOT_RADIUS - 10)
                .innerRadius(PLOT_RADIUS - 70);

            var pie = d3.layout.pie()
                .sort(null)
                .value(options.y);

            var g = svg.selectAll('.arc')
                .data(pie(data))
                .enter().append('g')
                .attr('class', 'arc');

            g.append('path')
                .attr('d', arc)
                .attr('class', options.x);

            g.append('text')
                .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                .attr('dy', '.35em')
                .text(options.x);
        },
        options: {
            x: function (d) {
                return d.x;
            },
            y: function (d) {
                return d.y;
            },
            padding: function () {
                return this.showAxes ? { top: 15, right: 20, left: 40, bottom: 25 } : { top: 0, right: 0, left: 0, bottom: 0 };
            }
        }
    };
});
