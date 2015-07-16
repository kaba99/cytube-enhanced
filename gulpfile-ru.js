var gulp = require('gulp');

var concat = require('gulp-concat');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');


gulp.task('default', ['combine-js', 'combine-css']);

gulp.task('combine-js', function () {
    return gulp.src(['./src/js/main/main.js', './src/js/main/main-ru.js', './src/translations/ru.js', './src/js/jquery.mousewheel.js', './src/js/modules/*.js', './src/extra/quotes_for_!q/ru/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat('cytube-enhanced.js'))
        .pipe(gulp.dest('./build/ru'))
        .pipe(rename('cytube-enhanced.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('./build/ru'));
});

gulp.task('combine-css', function () {
    return gulp.src(['./src/css/cytube-enhanced.css'])
        .pipe(concat('cytube-enhanced.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./build/ru'))
        .pipe(rename('cytube-enhanced.min.css'))
        .pipe(minifyCss({
            compatibility: 'ie8',
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest('./build/ru'));
});


gulp.task('clean-css', function () {
    return gulp.src(['./src/css/*.css'])
        .pipe(minifyCss({
            compatibility: 'ie8',
            keepBreaks: true,
            keepSpecialComments: '*'
        }))
        .pipe(gulp.dest('./src/css'))
        .pipe(shell([
            './node_modules/.bin/cssunminifier <%= file.path %> <%= file.path %>'
        ]));
});
