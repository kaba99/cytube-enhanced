var gulp = require('gulp');

var concat = require('gulp-concat');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var globby = require('globby');
var through = require('through2');

var jsFilesGlob = ['./src/js/main/main.js', './src/js/main/user-config/user-config.js', './src/js/main/ui/ui.js', './src/js/main/settings/settings.js', './src/js/main/settings/tab.js', './src/js/main/main-en.js', './src/js/core/**/*.js', './src/js/extras/**/config.js'];
var cssFilesGlob = ['./src/css/cytube-enhanced.css', './src/css/videojs-progress.css'];


gulp.task('default', ['build-js', 'build-css']);

gulp.task('test-js', function () {
    return gulp.src(jsFilesGlob)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build-js', function () {
    // gulp expects tasks to return a stream, so we create one here.
    var bundledStream = through();

    bundledStream
        // turns the output bundle stream into a stream containing
        // the normal attributes gulp plugins expect.
        .pipe(source('cytube-enhanced.js'))
        .pipe(buffer())
        // Add gulp plugins to the pipeline here.
        .pipe(gulp.dest('./build/en'))
        .pipe(rename('cytube-enhanced.min.js'))
        .pipe(uglify({mangle: false, preserveComments: ''}))
        .pipe(gulp.dest('./build/en'));

    // "globby" replaces the normal "gulp.src" as Browserify
    // creates it's own readable stream.
    globby(jsFilesGlob, function(err, entries) {
        // ensure any errors from globby are handled
        if (err) {
            bundledStream.emit('error', err);
            return;
        }

        // create the Browserify instance.
        var b = browserify({entries: entries});

        // pipe the Browserify stream into the stream we created earlier
        // this starts our gulp pipeline.
        b.bundle().pipe(bundledStream);
    });

    // finally, we return the stream, so gulp knows when this task is done.
    return bundledStream;
});


gulp.task('build-css', function () {
    return gulp.src(cssFilesGlob)
        .pipe(concat('cytube-enhanced.css'))
        .pipe(autoprefixer({
            browsers: ['last 7 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./build/en'))
        .pipe(rename('cytube-enhanced.min.css'))
        .pipe(minifyCss({
            compatibility: 'ie8',
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest('./build/en'));
});


gulp.task('clean-css', function () {
    return gulp.src(cssFilesGlob)
        .pipe(minifyCss({
            compatibility: 'ie8',
            keepBreaks: true,
            keepSpecialComments: '*',
            aggressiveMerging: true, //can remove comments
            advanced: true, //can remove comments
            restructuring: true //can remove comments
        }))
        .pipe(gulp.dest('./src/css'))
        .pipe(shell([
            './node_modules/.bin/cssunminifier <%= file.path %> <%= file.path %>'
        ]));
});
