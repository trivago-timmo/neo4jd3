'use strict';

var autoprefixer = require('gulp-autoprefixer'),
    conf = require('./conf'),
    connect = require('gulp-connect'),
    cssnano = require('gulp-cssnano'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass');

gulp.task('styles:build', function(done) {
    gulp.src([
        conf.paths.docs + '/css/neo4jd3.css',
        conf.paths.docs + '/css/neo4jd3.min.css'
    ])
        .pipe(sass())
        .pipe(gulp.dest(conf.paths.dist + '/css'));
    done();
});

gulp.task('styles', gulp.series('styles:build', function(done) {
    gulp.src('src/main/styles/neo4jd3.scss')
        .pipe(sass())
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(conf.paths.docs + '/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssnano())
        .pipe(gulp.dest(conf.paths.docs + '/css'))
        .pipe(connect.reload());
    done();
}));