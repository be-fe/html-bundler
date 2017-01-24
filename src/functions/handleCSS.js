var concat = require('gulp-concat');
var less = require('gulp-less');
var sourcemap = require('gulp-sourcemaps');
var cleancss = require('gulp-clean-css');
var changed = require('gulp-changed');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var path = require('path');
var cwd = process.cwd();
var debug = require('gulp-debug');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');


var handleCSS = function(cssArr, conf, filename, env) {
    if (!conf.buildTarget.css && !conf.bundle && !conf.concat){
        var target = function(file){
            return path.dirname(path.join(conf.output, path.relative(conf.src, file.path)));
        }
    }
    else {
        var target = path.join(conf.output, conf.buildTarget.css);
    }

    gulp.src(cssArr)
        .pipe(gulpif(env !== 'dest', changed(target, {extension: '.css'})))
        .pipe(plumber())
        .pipe(gulpif(conf.sourcemap, sourcemap.init()))
        .pipe(gulpif(true, debug({title: 'style file build:'})))
        .pipe(gulpif(conf.less, less()))
        .pipe(gulpif(conf.concat, concat(filename + '.css')))
        .pipe(postcss([ autoprefixer({ browsers: ['last 5 versions'] }) ]))
        .pipe(gulpif(conf.minify, cleancss()))
        // .pipe(gulpif(conf.base64, base64(conf.base64)))
        .pipe(gulpif(conf.sourcemap, sourcemap.write()))
        .pipe(gulp.dest(target))

}

module.exports = handleCSS;