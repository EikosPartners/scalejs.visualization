/*global define */
/*jslint sloppy: true*/
define({
    treemap: function () {
        return {
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
                    }
                }
            }
        };
    },
    donut: function () {
        return {
            donut: {
                value: this.data, //array of objects optionally in an observable
                centerText: _.reduce(this.data(), function(memo, d){ return memo + d.Value; }, 0),
                y: function (d) {
                    return Math.abs(d.Value);
                },
                x: function(d) {
                    return d.Tag;
                },
                innerRadius: function (plotRadius) {
                    return plotRadius - 70;
                },
                outerRadius: function (plotRadius) {
                    return plotRadius;
                }
            }
        };
    },
    barchart: function () {
        return {
            barchart: {
                value: this.data, //array of objects optionally in an observable
                y: function (d) {
                    return d.Value;
                },
                x: function(d) {
                    return d.Tag;
                }
            }
        };
    }
});
