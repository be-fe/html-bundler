var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemap = require('gulp-sourcemaps');
var webpack = require('webpack-stream');
var changed = require('gulp-changed');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var path = require('path');
var is = require('is_js');
var currentPath = process.cwd();

try {
    var webpackConfig = require(path.join(currentPath, './webpack.config'));
}
catch(e) {
    console.log(e);
    var webpackConfig = require('../webpack.config.default.js');
}

var generateWebpackConf = function(webpackConfig, filename, env) {
    var originConf = webpackConfig[env];
    if (!is.object(originConf)) {
        return
    }
    else {
        originConf.output = {filename: filename + ".js"}
    }

    return originConf;
}


var handleJS = function(jsArr, conf, filename, env) {
    if (!conf.buildTarget.css && !conf.bundle && !conf.concat){
        var target = function(file){
            return path.dirname(path.join(conf.output, path.relative(conf.src, file.path)));
        }
    }
    else {
        var target = path.join(conf.output, conf.buildTarget.js);
    }
    gulp.src(jsArr)
        .pipe(gulpif(env !== 'dest', changed(target)))
        .pipe(gulpif(conf.sourcemap, sourcemap.init()))
        .pipe(gulpif(conf.bundle, webpack(generateWebpackConf(webpackConfig, filename, env))))
        .pipe(gulpif(conf.minify, uglify()))
        .pipe(gulpif(conf.concat, concat(filename + '.js')))
        // .pipe(gulpif(conf.base64, base64(conf.base64)))
        .pipe(gulpif(conf.sourcemap, sourcemap.write()))
        .pipe(gulp.dest(target))
}

module.exports = handleJS;