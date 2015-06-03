define([
    'knockout',
    './treemap/treemap.js'
], function (
    ko,
    treemap
) {
    'use strict';
    ko.components.register('treemap', treemap);
})
