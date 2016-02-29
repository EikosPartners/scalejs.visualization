/*global define,sandbox */
define([
    'scalejs.sandbox!main',
], function (
    sandbox
) {
    'use strict';

    return function () {
        var observable = sandbox.mvvm.observable,
            observableArray = sandbox.mvvm.observableArray,
            data = observableArray([]),
            text = observable();

        function generateRandomDataPoint() {
            return {
                Tag: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                Value: Math.floor(Math.random() * 500) + -250
            }
        }

        for(var i = 0; i < 6; i++) {
            data.push(generateRandomDataPoint());
        }

        setInterval(function () {
            data.pop();
            data.unshift(generateRandomDataPoint());
        }, 1000);

        return {
            text: text,
            data: data
        };
    };
});
