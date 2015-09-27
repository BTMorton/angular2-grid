/* global System */
/* global __karma__ */
/* global System */
/* global __karma__ */

// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function () { };

// Set the base url of our scripts
System.baseURL = '/base/';
// Here we set all the preffixes so that we'll
// be able for example to import 'test/test_name'
// instead of 'scripts/build/test_name'
System.config({
	transpiler: 'babel',
	defaultJSExtensions: true,
	paths: {
	    'test/*': 'test/*',
	    'src/*': 'dist/*',
	    'angular2/*': 'node_modules/angular2/*',
	    'rx': 'node_modules/angular2/node_modules/rx/dist/rx.min.js'
	}
})

// paths that include spec and ends with .js
function onlySpecFiles(path) {
    return /spec\.js$/.test(path);
}

// takes paths and normalize them to module names
// by removing a base url preffix and .js suffix
function karmaFileToModule(fileName) {
    return fileName.replace(System.baseURL, '')
        .replace('.js', '');
}

Promise.all(
    Object.keys(window.__karma__.files) // Takes all files that served by karma
        .filter(onlySpecFiles)  // choose only test files
        .map(karmaFileToModule) // normalize them to module names
        .map(function (moduleName) {
            return System.import(moduleName) // import each module
                .then(function (module) {
                    if (module.hasOwnProperty('main')) {
                        module.main(); //expose the tests
                    } else {
                        throw new Error('Module ' + moduleName + ' does not implement main() method.');
                    }
                });
        })).then(function () {
            __karma__.start(); // after all tests were exposed 
        }, function (error) {
            console.error(error.stack || error);
            __karma__.start();
        });
