var gulp = require('gulp');

var concat = require('gulp-concat');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');


gulp.task('default', ['combine-js', 'combine-css']);


gulp.task('combine-js', function() {
    return gulp.src(['./files/js/main.js', './files/js/jquery.mousewheel.js', './files/js/*.js'])
        .pipe(concat('animach-enhanced.js'))
        .pipe(gulp.dest('./build'))
        .pipe(rename('animach-enhanced.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});

gulp.task('combine-css', function() {
    return gulp.src(['./files/css/animach.css', './files/css/*.css'])
        .pipe(concat('animach-enhanced.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./build'))
        .pipe(rename('animach-enhanced.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./build'));
});
