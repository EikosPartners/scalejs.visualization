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
            var centerText = ko.utils.unwrapObservable(bindingContext.centerText);
            var clickHandler = bindingContext.click;
            var padding = options.padding();

            var PLOT_WIDTH = elementRect.width - padding.left - padding.right + 1;
            var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom + 1;
            var PLOT_RADIUS = Math.min(PLOT_WIDTH, PLOT_HEIGHT) / 2;

            var arc = d3.svg.arc()
                .outerRadius(options.outerRadius(PLOT_RADIUS))
                .innerRadius(options.innerRadius(PLOT_RADIUS));

            var pie = d3.layout.pie()
                .sort(null)
                .value(options.y);

            var svg = d3.select(element).append('svg')
                .attr('width', PLOT_WIDTH)
                .attr('height', PLOT_HEIGHT)
                .append('g')
                .attr('transform', 'translate(' + PLOT_WIDTH / 2 + ',' + PLOT_HEIGHT / 2 + ')');

            svg.append('text')
                .attr('dy', '.35em')
                .attr('text-anchor', 'middle')
                .text(centerText);

            var g = svg.selectAll('.arc')
                .data(pie(data))
                .enter().append('g')
                .attr('class', 'arc');

            var path = g.append('path')
                .attr('d', arc)
                .attr('class', function (d) { return options.x(d.data); });


            if(clickHandler && _.isFunction(clickHandler)) {
                path.on('click', function(d,i){
                    clickHandler.call(d.data, d, i);
                });
            }

            g.append('text')
                .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                .attr('dy', '.35em')
                .attr('text-anchor', 'middle')
                .text(function (d) { return options.x(d.data); });

            //namespace resize call: http://stackoverflow.com/questions/26409078/how-to-have-multiple-d3-window-resize-events
            d3.select(window).on('resize.' + Math.random().toString(36).substring(7), _.throttle(resize, 100));

            function resize() {
                var elementRect = element.getBoundingClientRect();
                var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
                var centerText = ko.utils.unwrapObservable(bindingContext.centerText);
                var PLOT_WIDTH = elementRect.width - padding.left - padding.right + 1;
                var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom + 1;
                var PLOT_RADIUS = Math.min(PLOT_WIDTH, PLOT_HEIGHT) / 2;

                var arc = d3.svg.arc()
                    .outerRadius(options.outerRadius(PLOT_RADIUS))
                    .innerRadius(options.innerRadius(PLOT_RADIUS));

                var svg = d3.select(element).select('svg')
                    .attr('width', PLOT_WIDTH)
                    .attr('height', PLOT_HEIGHT)
                    .select('g')
                    .attr('transform', 'translate(' + PLOT_WIDTH / 2 + ',' + PLOT_HEIGHT / 2 + ')');

                // svg.select('text')
                //     .attr('dy', '.35em')
                //     .attr('text-anchor', 'middle')
                //     .text(centerText);

                svg.selectAll('.arc').remove();

                var g = svg.selectAll('.arc')
                    .data(pie(data))
                    .enter().append('g')
                    .attr('class', 'arc');

                var path = g.append('path')
                    .attr('d', arc)
                    .attr('class', function (d) { return options.x(d.data); });

                if(clickHandler && _.isFunction(clickHandler)) {
                    path.on('click', function(d,i){
                        clickHandler.call(d.data, d, i);
                    });
                }

                g.append('text')
                    .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                    .attr('dy', '.30em')
                    .attr('text-anchor', 'middle')
                    .text(function (d) { return options.x(d.data); });
            }

        },
        update: function (element, valueAccessor, allBindings) {
            var options = {};
            ko.utils.extend(options, ko.bindingHandlers.donut.options);
            ko.utils.extend(options, allBindings.get('donut'));
            var bindingContext = ko.utils.unwrapObservable(valueAccessor());
            var elementRect = element.getBoundingClientRect();
            var data = bindingContext.value ? ko.utils.unwrapObservable(bindingContext.value) : bindingContext;
            var centerText = ko.utils.unwrapObservable(bindingContext.centerText);
            var clickHandler = bindingContext.click;
            var padding = options.padding();

            var PLOT_WIDTH = elementRect.width - padding.left - padding.right + 1;
            var PLOT_HEIGHT = elementRect.height - padding.top - padding.bottom + 1;
            var PLOT_RADIUS = Math.min(PLOT_WIDTH, PLOT_HEIGHT) / 2;

            var svg = d3.select(element).select('svg').select('g');

            svg.select('text')
                .attr('text-anchor', 'middle')
                .text(centerText);

            var arc = d3.svg.arc()
                .outerRadius(options.outerRadius(PLOT_RADIUS))
                .innerRadius(options.innerRadius(PLOT_RADIUS));

            var pie = d3.layout.pie()
                .sort(null)
                .value(options.y);

            svg.selectAll('.arc').remove();

            var g = svg.selectAll('.arc')
                .data(pie(data))
                .enter().append('g')
                .attr('class', 'arc');

            var path = g.append('path')
                .attr('d', arc)
                .attr('class', function (d) { return options.x(d.data); });

            if(clickHandler && _.isFunction(clickHandler)) {
                path.on('click', function(d,i){
                    clickHandler.call(d.data, d, i);
                });
            }

            g.append('text')
                .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                .attr('dy', '.30em')
                .attr('text-anchor', 'middle')
                .text(function (d) { return options.x(d.data); });
        },
        options: {
            x: function (d) {
                return d.x;
            },
            y: function (d) {
                return d.y;
            },
            innerRadius: function (plotRadius) {
                return plotRadius - 70;
            },
            outerRadius: function (plotRadius) {
                return plotRadius - 10;
            },
            padding: function () {
                return this.showAxes ? { top: 15, right: 20, left: 40, bottom: 25 } : { top: 0, right: 0, left: 0, bottom: 0 };
            }
        }
    };
});
