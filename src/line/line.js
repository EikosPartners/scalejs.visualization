define([
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
