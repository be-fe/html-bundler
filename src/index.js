module.exports = function(env, port) {
    var gulp = require('gulp');
    var gulpif = require('gulp-if');
    var inline = require('gulp-inline');
    var inlinesource = require('gulp-inline-source');
    var htmlmin = require('gulp-minify-html');
    var base64 = require('gulp-base64');
    var del = require('del');


    var handleServer = require('./functions/server.js');
    var handleWatch = require('./functions/watch.js');
    var handleJS = require('./functions/handleJS.js');
    var handleCSS = require('./functions/handleCSS.js');
    var handleImage = require('./functions/handleImage.js');

    var through = require('through2');
    var cheerio = require('cheerio');
    var path = require('path');
    var process = require('process');
    var is = require('is_js');

    var logger = require('./utils/logger.js');
    var isIgnore = require('./utils/isIgnore.js');

    var currentPath = process.cwd();

    var getAbsolutePath = function(origin, extra) {
        if (!extra) {
            var extra = '';
        }
        if (is.string(origin)) {
            origin = path.join(currentPath, origin, extra);
        }
        else if (is.array(origin)) {
            origin.forEach(function(item, i) {
                origin[i] = path.join(currentPath, item, extra);
            })
        }
    }

    try {
        var config = require(path.join(currentPath, './html-bundler.config'));
    } catch(e) {
        logger.error('配置文件不存在');
        return
    }

    /*
     *  config filter & judge env
     */
    var conf = {};

    var options = [
        'output',
        'minify',
        'bundle',
        'sourcemap',
        'concat',
        'less',
        'inline',
        'server',
        'watchFolder',
        'imgFolder',
        'buildTarget'];

    options.forEach(function(item) {
        if (env === 'dest') {
            conf[item] = config.destMod[item];
        }
        else {
            conf[item] = config.devMod[item];
        }
    })

    /*
     *  handle buildTarget
     */
    var defaultBuildTarget = {
        js: './js/',
        css: './css/',
        imgs: './images/',
        html: './html/'
    };

    if (!conf.buildTarget || conf.buildTarget === 'default') {
        conf.buildTarget = defaultBuildTarget;
    }
    else if (is.object(conf.buildTarget)) {
        conf.buildTarget.js = conf.buildTarget.js || './js/';
        conf.buildTarget.css = conf.buildTarget.css || './css/';
        conf.buildTarget.imgs = conf.buildTarget.imgs || './images/';
        conf.buildTarget.html = conf.buildTarget.html || './html/';
    }
    else if (conf.buildTarget === 'same') {
        conf.buildTarget = {
            js: '',
            css: '',
            imgs: '',
            html: ''
        }
    }


    conf.src = path.join(currentPath, config.src);
    conf.output = path.join(currentPath, conf.output);
    conf.imgSrc = path.join(currentPath, config.imgFolder, './**');

    getAbsolutePath(config.entries);

    /*
     *  handle watchFolder
     */
    if (is.object(conf.watchFolder)) {
        getAbsolutePath(conf.watchFolder.css, '**');
        getAbsolutePath(conf.watchFolder.js, '**');
        getAbsolutePath(conf.watchFolder.imgs, '**');
        getAbsolutePath(conf.watchFolder.any, '**');
    }

    /*
     * 给所有资源添加inline属性，供gulp-inline-source使用
     */
    var addInlineAttr = function() {
        return through.obj(function (file, enc, cb) {
            if (file.isNull()) {
                this.push(file);
                return cb();
            }

            if (file.isStream()) {
                return cb();
            }

            var content = file.contents.toString();
            var $ = cheerio.load(content, {xmlMode: false});

            $('script').each(function(i, item) {
                var src = $(item).attr('src');
                if (!is.url(src)) {
                    $(item).attr('inline', 'inline');
                }
            });
            $('link').each(function(i, item) {
                var href = $(item).attr('href');
                if (!is.url(href)) {
                    $(item).attr('inline', 'inline');
                }
            });
            $('img').attr('inline', 'inline');

            file.contents = new Buffer($.html());
            this.push(file);
            cb();
        });
    }

    /*
     * 主处理函数
     */
    var findResource = function(handleLimit) {
        return through.obj(function (file, enc, cb) {
            if (file.isNull()) {
                this.push(file);
                return cb();
            }

            if (file.isStream()) {
                return cb();
            }

            var jsArr = [];
            var cssArr = [];
            var imgArr = [];
            var content = file.contents.toString();
            var $ = cheerio.load(content);
            var filename = file.path.replace(file.base, '').replace('.html', '');
            var cwd = file.cwd;

            var getPath = function(item, arr, attr) {
                var originPath = item.attr(attr);
                if (is.string(originPath) && !is.url(originPath)) {
                    var result = path.join(file.base, originPath);
                    if (!isIgnore(result, config.ignore)) {
                        arr.push(result);
                    }
                }
            }

            $('script').each(function(i, item) {
                getPath($(item), jsArr, 'src');
            })

            $('link').each(function(i, item) {
                getPath($(item), cssArr, 'href');
            })

            $('img').each(function(i, item) {
                getPath($(item), imgArr, 'src');
            });

            var replaceResource = function() {
                var htmlOutput = path.join(conf.output, conf.buildTarget.html);
                var jsOutput = path.join(conf.output, conf.buildTarget.js);
                var cssOutput = path.join(conf.output, conf.buildTarget.css);
                var imgsOutput = path.join(conf.output, conf.buildTarget.imgs);
                var timeStamp = new Date().getTime();
                var jsPath = path.join(path.relative(htmlOutput, jsOutput), filename +'.js') + '?v=' + timeStamp;
                var cssPath = path.join(path.relative(htmlOutput, cssOutput), filename +'.css') + '?v=' + timeStamp;;

                $('script').each(function(i, item) {
                    var src = $(item).attr('src');
                    if (!is.url(src) && !isIgnore(path.join(file.base, src), config.ignore)) {
                        $(item).remove();
                    }
                });
                $('body').append('<script src="' + jsPath + '"></script>');

                $('link').each(function(i, item) {
                    var href = $(item).attr('href');
                    if (!is.url(href) && !isIgnore(path.join(file.base, href), config.ignore)) {
                        $(item).remove();
                    }
                });
                $('head').append('<link href="' + cssPath + '"/>');
            }

            var addVersion = function() {
                $('script').each(function(i, item) {
                    var origin = $(this).attr('src').replace(/.\w+$/g, '.js');
                    $(this).attr('src', origin + '?v=' + new Date().getTime());
                })

                $('link').each(function(i, item) {
                    var origin = $(this).attr('href').replace(/.\w+$/g, '.css');
                    $(this).attr('href', origin + '?v=' + new Date().getTime());
                })
            }

            if (conf.concat || conf.bundle) {          //如果bundle成一个文件
                replaceResource();
            }
            else {
                addVersion();
            }

            if (handleLimit === 'js') {
                handleJS(jsArr, conf, filename, env);
            }
            else if (handleLimit === 'css') {
                handleCSS(cssArr, conf, filename, env);
            }
            else if (handleLimit === 'imgs') {
                handleImage(imgArr, conf, filename, env);
            }
            else {
                handleJS(jsArr, conf, filename, env);
                handleCSS(cssArr, conf, filename, env);
                handleImage(imgArr, conf, filename, env);
            }

            file.contents = new Buffer($.html());
            this.push(file);

            cb();
        });

    }

    var run = function(env) {
        logger.info('build begin!!');
        var getTarget = function(type) {
            if (!conf.buildTarget[type]){
                var target = function(file){
                    return path.dirname(path.join(conf.output, path.relative(conf.src, file.path)));
                }
            }
            else {
                var target = path.join(conf.output, conf.buildTarget[type]);
            }
            return target;
        }

        var htmlTarget = getTarget('html');
        var imageTarget = getTarget('imgs');

        var promise = new Promise((resolve, reject) => {
            if (env !== 'js' && env !== 'css') {
                logger.notice('执行图片复制');
                gulp.src(conf.imgSrc)
                    .on('error', reject)
                    .pipe(gulp.dest(imageTarget))
                    .on('end', resolve)
            }
            else {
                resolve();
            }
        });

        promise.then(function() {
            gulp.src(config.entries)
                .pipe(gulpif(!conf.inline, findResource(env)))
                .pipe(gulpif(conf.inline, addInlineAttr()))
                .pipe(gulpif(conf.inline, inlinesource()))
                .pipe(gulpif(conf.minify, htmlmin()))
                .on('error', function() {
                    logger.notice('构建失败::>_<::');
                })
                .pipe(gulp.dest(htmlTarget))
                .on('end', function() {
                    logger.notice('构建完成=^_^=');
                })
        })


    }


    /*
     * del output folder & run first
     */
    del(conf.output).then(paths => {
        run();
    });

    /*
     * watch the files change
     */
    handleWatch(run, conf);

    /*
     * run dev server
     */
    handleServer(conf.server, config, port);
}
