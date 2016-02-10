define([
    'knockout',
    './treemap/treemap.js',
    './line/line.js',
    './donut/donut.js'
], function (
    ko,
    treemap,
    line,
    donut
) {
    'use strict';
    ko.components.register('treemap', treemap);
    //line creates ko.bindingHandlers.linegraph
})
