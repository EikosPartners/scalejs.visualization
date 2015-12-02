/*jshint ignore:start*/
requirejs({
    scalejs: {
        extensions: [
            'scalejs.mvvm'
        ]
    },
    map: {
        '*': {
            sandbox: 'scalejs.sandbox',
            bindings: 'scalejs.mvvm.bindings',
            views: 'scalejs.mvvm.views'
        }
    },
    baseUrl: 'src',
    paths: {
        almond: '../bower_components/almond/almond',
        requirejs: '../bower_components/requirejs/require',
        scalejs: '../bower_components/scalejs/dist/scalejs.min',
        'scalejs.mvvm': '../bower_components/scalejs.mvvm/dist/scalejs.mvvm',
        knockout: '../bower_components/knockout/dist/knockout',
        'knockout.mapping': '../bower_components/knockout.mapping/knockout.mapping',
        'scalejs.functional': '../bower_components/scalejs.functional/dist/scalejs.functional.min',
        text: '../bower_components/text/text',
        d3: '../bower_components/d3/d3',
        underscore: '../bower_components/underscore/underscore'
    },
    packages: [

    ],
    shim: {

    }
});
/*jshint ignore:end*/
