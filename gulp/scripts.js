'use strict';

var _ = require('lodash'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    concat = require('gulp-concat'),
    conf = require('./conf'),
    connect = require('gulp-connect'),
    derequire = require('gulp-derequire'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    notifier = require('node-notifier'),
    notify = require('gulp-notify'),
    path = require('path'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify');

var entryFile = path.join(conf.paths.src, '/index.js');

function error(err) {
    notifier.notify({message: 'Error: ' + err.message});
    gutil.log(gutil.colors.red('Error: ' + err));
    this.emit('end');
}

function buildScript(filename, mode) {
    var bundleFilename = 'index.js';

    var browserifyConfig = {
        standalone: 'Neo4jd3'
    };

    var bundler;

    if (mode === 'dev') {
        bundler = browserify(filename, _.extend(browserifyConfig, { debug: true }));
    } else if (mode === 'prod') {
        bundler = browserify(filename, browserifyConfig);
    } else if (mode === 'watch') {
        if (cached[filename]) {
            return cached[filename].bundle();
        }

        bundler = watchify(browserify(filename, _.extend(browserifyConfig, watchify.args, { debug: true })));
        cached[filename] = bundler;
    }

    function rebundle() {
        var stream = bundler.bundle()
            .on('error', function(err) {
                error.call(this, err);
            });

        return stream
            .pipe(plumber({ errorHandler: error }))
            .pipe(source(bundleFilename))
            .pipe(derequire())
            .pipe(buffer())
            .pipe(gulpif(mode === 'prod', uglify({ mangle: true })))
            .pipe(concat('neo4jd3.js'))
            .pipe(gulp.dest(conf.paths.docs + '/js'));
    }

    // listen for an update and run rebundle
    bundler.on('update', function() {
        rebundle();
        gutil.log('Rebundle...');
    });

    // run it once the first time buildScript is called
    return rebundle();
}

gulp.task('scripts:jshint', function(done) {
    gulp.src('src/main/scripts/neo4jd3.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'));

    done();
});

gulp.task('scripts:derequire', function(done) {
    buildScript(entryFile, 'dev');

    done();
});

gulp.task('scripts:external', function(done) {
    gulp.src([
        'node_modules/d3/build/d3.min.js'
    ])
        .pipe(gulp.dest(conf.paths.docs + '/js'))
        .pipe(connect.reload());

    done();
});

gulp.task('scripts:internal', gulp.series('scripts:jshint','scripts:derequire', function(done) {
    gulp.src(conf.paths.docs + '/js/neo4jd3.js')
        .pipe(concat('neo4jd3.js'))
        .pipe(gulp.dest(conf.paths.docs + '/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(conf.paths.docs + '/js'))
        .pipe(connect.reload());

    done();
}));

gulp.task('scripts', gulp.series('scripts:external', 'scripts:internal', function(done) {
     gulp.src([
            conf.paths.docs + '/js/neo4jd3.js',
            conf.paths.docs + '/js/neo4jd3.min.js'
        ])
        .pipe(gulp.dest(conf.paths.dist + '/js'));

     done();
}));



