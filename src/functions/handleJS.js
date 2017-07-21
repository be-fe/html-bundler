var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemap = require('gulp-sourcemaps');
var webpack = require('webpack-stream');
var originWebpack = require('webpack');
var changed = require('gulp-changed');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var path = require('path');
var is = require('is_js');
var currentPath = process.cwd();
var debug = require('gulp-debug');
var fs = require('fs');
var logger = require('../utils/logger');
var network = require('../utils/network');
var gulpFileCount = require('../utils/gulpFileCount');
var _ = require('lodash');
var gutil = require('gulp-util');

var htmlCount = 0;

var handleJS = function(jsArr, conf, filename, env, wpconfig) {
    if (conf.bundle) {
        if (wpconfig) {
            var webpackConfig = wpconfig;
        }
        else {
            if (!fs.existsSync(path.join(currentPath, './webpack.config.js'))) {
                var webpackConfig = require('../webpack.config.example.js');
            }
            else {
                var webpackConfig = require(path.join(currentPath, './webpack.config'));
            }
        }

        var generateWebpackConf = function(webpackConfig, filename, env) {
            var originConf = webpackConfig[env];
            var hasDefinePlugin;
            if (!is.object(originConf)) {
                return
            }
            else {
                if (originConf.output) {
                    originConf.output = _.assign({}, originConf.output);
                    originConf.output.filename = filename + ".js";
                }
                else {
                    originConf.output = {filename: filename + ".js"};
                }
            }

            for (var i = 0; i < originConf.plugins.length; i++) {
                if (originConf.plugins[i] instanceof originWebpack.DefinePlugin) {
                    hasDefinePlugin = true;
                }
            }

            //definePlugin规则：webpack.conf中的声明 > hb.conf中的声明 > 默认规则
            if (!hasDefinePlugin) {
                if (!conf.define || (typeof conf.define !== 'object')) {
                    var defineObj = {'process.env.NODE_ENV': env};
                    defineObj['__' + env.toUpperCase() + '__'] = true;
                    originConf.plugins.push(
                        new originWebpack.DefinePlugin(defineObj)
                    );
                }
                else {
                    var defineObj = Object.assign({'process.env.NODE_ENV': env}, conf.define);
                    originConf.plugins.push(
                        new originWebpack.DefinePlugin(defineObj)
                    );
                }
            }
            return originConf;
        }
    }
    else {
        var generateWebpackConf = function() {};
    }


    if (!conf.buildTarget.js && !conf.bundle && !conf.concat){
        var target = function(file){
            return path.dirname(path.join(conf.output, path.relative(conf.src, file.path)));
        }
    }
    else {
        var target = path.join(conf.output, conf.buildTarget.js);
    }
    var stream = gulp.src(jsArr)
        // .pipe(gulpif(env !== 'dest', changed(target, {extension: '.js'})))
        .pipe(gulpif(true, debug({title: 'JS file build:'})))
        .pipe(gulpif(conf.sourcemap, sourcemap.init()))

    if (conf.custom && conf.custom.css && conf.custom.css.length) {
        conf.custom.js.forEach(function (task) {
            stream = stream.pipe(task.func(task.opts));
        })
    }

    stream = stream.pipe(gulpif(conf.bundle, webpack(generateWebpackConf(webpackConfig, filename, env))))
        .on('error', function(err) {
            // 这样语法错误不会打断watcher和server
            gutil.log('WEBPACK ERROR', gutil.colors.red(err.message));
            this.emit('end');
        })
        .pipe(gulpif(conf.minify, uglify()))
        .pipe(gulpif(conf.concat, concat(filename + '.js')))
        .pipe(gulpif(conf.sourcemap, sourcemap.write()))
        .pipe(gulp.dest(target))
        .on('end', function(res) {
            //这是每个entry打包后end的时候，不是所有entry打包完成后，所以不能在这里输出end
            htmlCount ++;
            if(gulpFileCount.filecount && gulpFileCount.filecount === htmlCount) {
                htmlCount = 0;
                logger.notice('构建完成=^_^=');
                conf.server ? logger.info('Server Address: ' + 'http://' + network.getIPAddress() + ':' + network.port) : null;
            }
        })
}

module.exports = handleJS;
