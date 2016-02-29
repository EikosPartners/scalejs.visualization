define([
    'knockout',
    './treemap/treemap',
    './line/line',
    './donut/donut',
    './barchart/barchart'
], function (
    ko,
    treemap,
    line,
    donut,
    barchart
) {
    'use strict';
    ko.components.register('treemap', treemap);
    //line creates ko.bindingHandlers.linegraph
});
