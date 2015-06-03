#scalejs.visualization#

## How to use

### Knockout Component bindings
component: {
    name: 'treemap',
    params: {
        data: {
         "name": "flare",
         "children": [
          {
           "name": "analytics",
           "children": [
            {
             "name": "cluster",
             "children": [
              {"name": "AgglomerativeCluster", "size": 3938},
              {"name": "CommunityStructure", "size": 3812},
              {"name": "MergeEdge", "size": 743}
             ]
            },
            {
             "name": "graph",
             "children": [
              {"name": "BetweennessCentrality", "size": 3534},
              {"name": "LinkDistance", "size": 5731}
             ]
            }
           ]
          }
         ]
        },
        nodeBindings: {
            click: function () {
                console.log("clicked!");
            }
        }
    }
}
