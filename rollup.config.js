export default {
  entry: 'dist/main.js',
  dest: 'dist/bundles/NgGrid.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'ng.grid',
  globals: {
    '@angular/core': 'ng.core',
    'rxjs/Observable': 'Rx',
    'rxjs/ReplaySubject': 'Rx',
    'rxjs/add/operator/map': 'Rx.Observable.prototype',
    'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
    'rxjs/add/observable/fromEvent': 'Rx.Observable',
    'rxjs/add/observable/of': 'Rx.Observable'
  },
  external: [
    "@angular/core",
    'rxjs/Observable',
    'rxjs/add/observable/fromEvent'
  ]
}
