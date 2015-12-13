var del = require('del');
var gulp = require('gulp');
var typescript = require('gulp-typescript');
var uglify = require('gulp-uglify');
var symlink = require('gulp-symlink');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var merge = require('merge2');
var KarmaServer = require('karma').Server;

var tsProject = typescript.createProject({
	"target": "ES5",
    "module": "commonjs",
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "noImplicitAny": false,
	"declarationFiles": true
});

var PATHS = {
	src: {
		ts: ['!src/*.d.ts', 'src/*.ts'],
		html: 'src/*.html',
		css: 'src/*.css',
		test: 'test/*.ts',
		typings: 'src/*.d.ts'
	},
	libs: [
		'bower_components/bootstrap/dist/css/bootstrap.min.css',
		'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
		'node_modules/angular2/bundles/angular2.min.js',
		'node_modules/systemjs/dist/system.js',
		'node_modules/systemjs/dist/system-polyfills.js',
		'node_modules/es6-shim/es6-shim.min.js'
	],
	rx: 'node_modules/rxjs/**/*.js',
	typings: [
		'node_modules/angular2/*.d.ts',
		'node_modules/angular2/src/**/*.d.ts',
		'node_modules/angular2/manual_typings/*.d.ts',
		'node_modules/angular2/typings/**/*.d.ts',
	],
	testTypings: [
		'node_modules/angular2/*.d.ts',
		'node_modules/angular2/src/**/*.d.ts',
		'node_modules/angular2/manual_typings/*.d.ts',
		'node_modules/angular2/typings/**/*.d.ts',
		'dist/*.d.ts'
	],
};

gulp.task('clean', function (done) {
	return del(['dist'], done);
});

gulp.task('ts', function () {
	var tsResult = gulp.src(PATHS.src.ts.concat(PATHS.typings))
		.pipe(sourcemaps.init())
		.pipe(typescript(tsProject));

	return merge([
		tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest('dist')),//.pipe(uglify())
		tsResult.dts.pipe(gulp.dest('src')).pipe(gulp.dest('dist'))
	]);
});

gulp.task('test-clean-build', function(done) {
	return del(['test/*.js'], done)
});

gulp.task('test-build', ['test-clean-build'], function () {
	var tsResult = gulp.src([PATHS.src.test, PATHS.src.typings].concat(PATHS.testTypings))
		.pipe(sourcemaps.init())
		.pipe(typescript(tsProject));

	return tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest('test'));
});

gulp.task('test', ['test-build'], function(done) {
	runSequence('test-link', 'test-run', ['test-link-clean', 'test-clean-build'], done);
});
gulp.task('test-link-clean', function(done) {
	return del(['rxjs'], done);
});
gulp.task('test-link', ['test-link-clean'], function() {
	return gulp.src('node_modules/rxjs/').pipe(symlink('rxjs'));
});
gulp.task('test-run', function(done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
});

gulp.task('test-watch', ['test-build'], function(done) {
	var karma = new KarmaServer({
        configFile: __dirname + '/karma.conf.js'
    }).start();
    gulp.watch([PATHS.src.test], [tasks.testBuild]);
});

gulp.task('html', function () {
	return gulp.src(PATHS.src.html).pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
	return gulp.src(PATHS.src.css).pipe(gulp.dest('dist'));
});

gulp.task('rx', function () {
	return gulp.src(PATHS.rx, {base: 'node_modules/'}).pipe(gulp.dest('dist/'));
});

gulp.task('libs', ['rx'], function () {
	return gulp.src(PATHS.libs).pipe(gulp.dest('dist/lib'));
});

gulp.task('build', function() {
	return gulp.start('libs', 'html', 'css', 'ts');
});

gulp.task('rebuild', ['clean'], function() {
	return gulp.start('build');
});

gulp.task('watch', ['build'], function () {
	gulp.watch(PATHS.src.ts, ['ts']);
	gulp.watch(PATHS.src.html, ['html']);
	gulp.watch(PATHS.src.css, ['css']);
});

gulp.task('default', function() {
	return gulp.start('rebuild');
});