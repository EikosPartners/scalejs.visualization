define([
    'knockout',
    './treemap/treemap.js',
    './line/line.js'
], function (
    ko,
    treemap,
    line
) {
    'use strict';
    ko.components.register('treemap', treemap);
    //line creates ko.bindingHandlers.linegraph
})
