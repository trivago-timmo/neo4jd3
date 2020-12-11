'use strict';

var conf = require('./conf'),
    connect = require('gulp-connect'),
    gulp = require('gulp');

gulp.task('connect', function(done) {
    connect.server({
        port: 8888,
        livereload: true,
        root: conf.paths.docs
    });

    done();
});
