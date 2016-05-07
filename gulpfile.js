var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var _ = require('underscore');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var webpack = require('webpack-stream');
var merge = require('merge-stream');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');
var sass = require('gulp-sass');


var jsFilesGlobs = {
    ru: ['./src/translations/ru.js', './src/js/core/**/*.js', './src/js/main/main.js', './src/js/main/main-ru.js', './src/js/modules/**/*.js', './extras/**/config.js', './themes/**/config.js'],
    en: ['./src/js/core/**/*.js', './src/js/main/main.js', './src/js/main/main-en.js', './src/js/modules/**/*.js', './extras/**/config.js', './themes/**/config.js']
};
var cssFilesGlob = ['./src/css/main.scss'];
var buildForLangs = ['ru', 'en'];

var getFullJSGlob = function () {
    var jsFilesGlob = [];

    _.each(buildForLangs, function (lang) {
        if (_.isArray(jsFilesGlobs[lang])) {
            jsFilesGlob = jsFilesGlob.concat(jsFilesGlobs[lang]);
        }
    });

    return jsFilesGlob;
};


gulp.task('default', ['build-js', 'build-css', 'watch']);


gulp.task('test-js', function () {
    return gulp.src(getFullJSGlob())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});


gulp.task('build-js', function () {
    var streams = [];
    _.each(buildForLangs, function (lang) {
        if (_.isArray(jsFilesGlobs[lang])) {
            var stream = gulp.src(jsFilesGlobs[lang])
                .pipe(plumber())
                .pipe(webpack({
                    module: {
                        noParse: [/other_vendors\\jquery\.mousewheel\.js/]
                    }
                }))
                .pipe(rename('cytube-enhanced.js'))
                .pipe(gulp.dest('./build/' + lang))
                .pipe(rename('cytube-enhanced.min.js'))
                .pipe(uglify({mangle: false, preserveComments: ''}))
                .pipe(gulp.dest('./build/'+lang));

            streams.push(stream);
        }
    });

    return merge.apply(null, streams);
});


gulp.task('build-css', function (cb) {
    var streams = [];
    _.each(buildForLangs, function (lang) {
        var stream = gulp.src(cssFilesGlob)
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['last 5 versions', 'ie 8', 'ie 9'],
                cascade: false
            }))
            .pipe(concat('cytube-enhanced.css'))
            .pipe(gulp.dest('./build/' + lang))
            .pipe(rename('cytube-enhanced.min.css'))
            .pipe(cleanCSS({
                compatibility: 'ie8',
                keepSpecialComments: 0
            }))
            .pipe(gulp.dest('./build/' + lang));

        streams.push(stream);
    });

    return merge.apply(null, streams);
});


gulp.task('clean-css', function () {
    return gulp.src(cssFilesGlob)
        .pipe(plumber())
        .pipe(cleanCSS({
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


gulp.task('watch', function() {
    watch(['./src/**/*.js', './other_vendors/**/*.js'], function() {
        gulp.start('build-js');
    });

    watch(['./src/**/*.css', './src/**/*.scss'], function() {
        gulp.start('build-css');
    });
});