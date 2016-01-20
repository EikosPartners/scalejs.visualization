# scalejs.visualization

## How to use

### Knockout Component bindings
```
component: {
    name: 'treemap',
    params: {
        data: {
         'name': 'flare',
         'children': [
          {
           'name': 'analytics',
           'children': [
            {
             'name': 'cluster',
             'children': [
              {'name': 'AgglomerativeCluster', 'size': 3938},
              {'name': 'CommunityStructure', 'size': 3812},
              {'name': 'MergeEdge', 'size': 743}
             ]
            },
            {
             'name': 'graph',
             'children': [
              {'name': 'BetweennessCentrality', 'size': 3534},
              {'name': 'LinkDistance', 'size': 5731}
             ]
            }
           ]
          }
         ]
        },
        value: function (item) {
            return item.value;
        },
        nodeTemplate: 'treemap_node_template'
    }
}
```
based on https://github.com/gustavnikolaj/knockout-d3-line-graph
```
linegraph: {
    value: this.data_drill, //array of objects
    //   interpolate: 'basis',
    y: ['Max', 'Value'],    //y-axis properties (can be function like x too)
    x: function(d) {
        return d.ValueDate;
    },
    xScale: d3.time.scale,
    xAxisOptions: function(axis) {
        axis.ticks(20).tickFormat(function (d) {
            return moment(d).format('YYYY-MM-DD');
        });
    },
    xAxisSvgOptions: function (axis) {
        axis
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)');
    },
    yAxisOptions: function(axis) {
        axis.tickFormat(function (v) {
            return v + ' Bn';
        });
    },
    showAxes: true,
    padding: function () {
        return {
            top: 15,
            right: 20,
            left: 75,
            bottom: 75
        };
    }
}
```
