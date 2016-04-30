// Karma configuration
// Generated on Fri Sep 18 2015 20:03:51 GMT+0000 (UTC)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
            'node_modules/core-js/client/shim.min.js',
            'dist/lib/es6-shim.min.js',
            'dist/lib/system.js',
            'node_modules/reflect-metadata/Reflect.js',
            'test-main.js',
            { pattern: 'node_modules/angular2/*.js', included: false, serve: true, watch: false },
            { pattern: 'node_modules/angular2/src/**/*.js', included: false, serve: true, watch: false },
            { pattern: 'dist/**/*.js', included: false, serve: true, watch: true },
            { pattern: 'rxjs/**/*.js', included: false, serve: true, watch: false },
            {
                pattern: 'test/**/*spec.js',
                included: false,
                serve: true,
                watch: true
            }
        ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    	'dist/NgGrid.js': 'coverage'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-phantomjs-launcher'
    ]
  })
}
