var gulp = require('gulp');
var csslint = require('gulp-csslint');
var jslint = require('gulp-jshint');
var spawn = require("gulp-spawn");
var watch = require("gulp-watch");
var livereload = require("gulp-livereload");
var plumber = require("gulp-plumber");
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');

var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname + "/build";
var LIVERELOAD_PORT = 35729;


function startExpress() {
  var express = require("express");
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(__dirname + "/pages"));
  app.listen(4000);
}

gulp.task("csslint", function() {
  return gulp.src("pages/*/css/*.css")
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task("jslint", function() {
  return gulp.src("pages/*/js/*.js")
    .pipe(jslint())
    .pipe(jslint.reporter("default"));
});

gulp.task("serve", function() {
  startExpress();
  gulp.src(['pages/*/index.html', 'pages/*/js/*.js', 'pages/*/css/*.css'])
    .pipe(watch(function(files) {
      return files.pipe(livereload())
    }))
});

gulp.task("update", function() {
  gulp.src('libs/utk-ol3js-controls/build/js/*.js')
    .pipe(gulp.dest('pages/trains/js'));
  gulp.src('libs/utk-ol3js-controls/build/css/*.css')
    .pipe(gulp.dest('pages/trains/css'));
});

gulp.task('compress-libs', function() {
  gulp.src('libs/utk-ol3js-controls/src/css/*.css')
    .pipe(minifyCSS({
      keepBreaks: true
    }))
    .pipe(gulp.dest('libs/utk-ol3js-controls/build/css'));
  gulp.src('libs/utk-ol3js-controls/src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('libs/utk-ol3js-controls/build/js'));
});

gulp.task('default', ['serve']);
gulp.task('libs', ["compress-libs", "update"]);
