'use strict';

var gulp = require('gulp'),
    runSequence = require('gulp4-run-sequence');

gulp.task('default', function(callback) {
    runSequence('images', 'scripts', 'styles', 'node_modules', 'connect', 'watch', callback);
});
