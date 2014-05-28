var gulp = require('gulp');
var csslint = require('gulp-csslint');
var jslint = require('gulp-jshint');
var spawn = require("gulp-spawn");
var watch = require("gulp-watch");
var livereload = require("gulp-livereload");
var plumber = require("gulp-plumber");

var EXPRESS_PORT = 4000;
var EXPRESS_ROOT = __dirname + "/build";
var LIVERELOAD_PORT = 35729;


function startExpress() {
  var express = require("express");
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(__dirname + "/map"));
  app.listen(4000);
}

gulp.task("csslint", function () {
  return gulp.src("map/css/*.css")
    .pipe(csslint())
    .pipe(csslint.reporter());
});

gulp.task("jslint", function () {
  return gulp.src("map/js/*.js")
    .pipe(jslint())
    .pipe(jslint.reporter("default"));
});

gulp.task("serve", function () {
  startExpress();
  gulp.src(['map/index.html', 'map/js/*.js'])
    .pipe(watch(function(files){
      return files.pipe(livereload())
    }))

});

gulp.task('default', ['serve']);