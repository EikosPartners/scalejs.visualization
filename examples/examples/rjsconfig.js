/*jshint ignore:start*/
requirejs({
    scalejs: {
        extensions: [
            'scalejs.mvvm',
            'scalejs.statechart-scion',
            'scalejs.visualization'
        ]
    },
    map: {
        '*': {
            sandbox: 'scalejs.sandbox',
            bindings: 'scalejs.mvvm.bindings',
            views: 'scalejs.mvvm.views',
            styles: 'scalejs.styles-less'
        }
    },
    paths: {
        chai: '../bower_components/chai/chai',
        mocha: '../bower_components/mocha/mocha',
        jquery: '../bower_components/jquery/dist/jquery',
        knockout: '../bower_components/knockout/dist/knockout',
        'rx.backpressure': '../bower_components/rxjs/dist/rx.backpressure.min',
        requirejs: '../bower_components/requirejs/require',
        'scalejs.expression-jsep': '../bower_components/scalejs.expression-jsep/dist/scalejs.expression-jsep',
        'rx.async': '../bower_components/rxjs/dist/rx.async.min',
        'rx.experimental': '../bower_components/rxjs/dist/rx.experimental.min',
        'scalejs.mvvm': '../bower_components/scalejs.mvvm/dist/scalejs.mvvm',
        almond: '../bower_components/almond/almond',
        'rx.coincidence': '../bower_components/rxjs/dist/rx.coincidence.min',
        'rx.joinpatterns': '../bower_components/rxjs/dist/rx.joinpatterns.min',
        'rx.async.compat': '../bower_components/rxjs/dist/rx.async.compat.min',
        'rx.all.compat': '../bower_components/rxjs/dist/rx.all.compat.min',
        'scalejs.reactive': '../bower_components/scalejs.reactive/dist/scalejs.reactive.min',
        'rx.compat': '../bower_components/rxjs/dist/rx.compat.min',
        'rx.lite.compat': '../bower_components/rxjs/dist/rx.lite.compat.min',
        jsep: '../bower_components/jsep/build/jsep',
        moment: '../bower_components/moment/moment',
        lodash: '../bower_components/lodash/lodash',
        'rx.binding': '../bower_components/rxjs/dist/rx.binding.min',
        'scalejs.functional': '../bower_components/scalejs.functional/dist/scalejs.functional.min',
        'scalejs.ajax-jquery': '../bower_components/scalejs.ajax-jquery/dist/scalejs.ajax-jquery.min',
        rx: '../bower_components/rxjs/dist/rx.min',
        text: '../bower_components/text/text',
        'rx.aggregates': '../bower_components/rxjs/dist/rx.aggregates.min',
        'knockout.mapping': '../bower_components/knockout.mapping/knockout.mapping',
        'rx.virtualtime': '../bower_components/rxjs/dist/rx.virtualtime.min',
        'rx.all': '../bower_components/rxjs/dist/rx.all.min',
        'rx.testing': '../bower_components/rxjs/dist/rx.testing.min',
        scalejs: '../bower_components/scalejs/dist/scalejs.min',
        'rx.lite': '../bower_components/rxjs/dist/rx.lite.min',
        'rx.time': '../bower_components/rxjs/dist/rx.time.min',
        'scalejs.metadataFactory': '../bower_components/scalejs.metadataFactory/dist/scalejs.metadataFactory',
        linqjs: '../bower_components/linqjs/linq',
        'scalejs.statechart-scion': '../bower_components/scalejs.statechart-scion/dist/scalejs.statechart-scion.min',
        'scalejs.linq-linqjs': '../bower_components/scalejs.linq-linqjs/dist/scalejs.linq-linqjs.min',
        less: '../bower_components/less/dist/less-1.5.0',
        'scalejs.styles-less': '../bower_components/scalejs.styles-less/scalejs.styles',
        'scalejs.visualization': '../bower_components/scalejs.visualization/dist/scalejs.visualization',
        d3: '../bower_components/d3/d3',
        underscore: '../bower_components/underscore/underscore'
    },
    shim: {
        chai: {
            exports: 'chai'
        },
        mocha: {

        }
    },
    baseUrl: 'src',
    packages: [

    ]
});
/*jshint ignore:end*/
