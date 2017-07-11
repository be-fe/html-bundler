Array.prototype.unique = function () {
    var res = [];
    var json = {};
    for (var i = 0; i < this.length; i++) {
        if (!json[this[i]]) {
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
}

module.exports = function(env, port, hbconfig, wpconfig) {
    var gulp = require('gulp');
    var gulpif = require('gulp-if');
    var inlinesource = require('gulp-inline-source');
    var htmlmin = require('gulp-minify-html');
    var base64 = require('gulp-base64');
    var del = require('del');


    var handleServer = require('./functions/server.js');
    var handleWatch = require('./functions/watch.js');
    var handleJS = require('./functions/handleJS.js');
    var handleCSS = require('./functions/handleCSS.js');
    var handleImage = require('./functions/handleImage.js');
    var handleCount = require('./functions/handleCount.js');

    var through = require('through2');
    var cheerio = require('cheerio');
    var path = require('path');
    var fs = require('fs-extra');
    var process = require('process');
    var is = require('is_js');

    var logger = require('./utils/logger.js');
    var isIgnore = require('./utils/isIgnore.js');

    var currentPath = process.cwd();

    var getAbsolutePath = function(origin, extra) {
        if (!origin) {
            return;
        }
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

    /*
     * 文件缺失容错处理
     */
    // if (!fs.existsSync(path.join(currentPath, './html-bundler.config.js'))) {
    //     logger.error('当前目录下缺少html-bundler.config.js 配置文件，请使用`hb init`或自己手动创建。');
    //     return
    // }

    try {
        var config = hbconfig || require(path.join(currentPath, './html-bundler.config'));
    } catch(e) {
        logger.error('html-bundler.config.js 配置文件出现错误');
        return
    }

    if (!fs.existsSync(path.join(currentPath, './webpack.config.js'))) {
        logger.info('当前目录下没有webpack.config.js文件 ，将使用默认配置，如果需要自定义，请使用`hb init -w`命令进行创建。');
    }

    /*
     *  config filter & judge env
     */
    var conf = {};

    var options = [
        'entries',
        'output',
        'minify',
        'minifyHTML',
        'bundle',
        'sourcemap',
        'concat',
        'less',
        'inline',
        'server',
        'custom',
        'codeCount',
        'watchFolder',
        'imgFolder',
        'define',
        'buildTarget'];

    options.forEach(function(item) {
        conf[item] = config[env + 'Mod'][item];
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
    config.imgFolder && (conf.imgSrc = path.join(currentPath, config.imgFolder, './**'));

    if (conf.entries) {
        getAbsolutePath(conf.entries);
    }
    getAbsolutePath(config.entries);
    getAbsolutePath(config.moveList);


    /*
     *  handle watchFolder
     */
    if (is.object(conf.watchFolder)) {
        getAbsolutePath(conf.watchFolder.css, '**');
        getAbsolutePath(conf.watchFolder.js, '**');
        getAbsolutePath(conf.watchFolder.imgs, '**');
        getAbsolutePath(conf.watchFolder.html, '**');
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
            var $ = cheerio.load(content, {xmlMode: false, decodeEntities: false});

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
            var ignoreArr = [];
            var content = file.contents.toString();
            var $ = cheerio.load(content);
            var filename = file.path.replace(file.base, '').replace('.html', '');
            var cwd = file.cwd;

            /*
             *  将所有相对路径改为绝对路径，以适应不同目录结构
             */
            var getPath = function(item, arr, attr) {
                var originPath = item.attr(attr);
                if (is.string(originPath) && !is.url(originPath)) {
                    var htmlPath = path.dirname(file.path);
                    var result = path.join(htmlPath, originPath);
                    if (!isIgnore(result, config.ignore)) {
                        arr.push(result);
                    }
                    else {
                        ignoreArr.push(result);
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

            /*
             *  先去重以提升编译效率
             */
            imgArr.unique();
            cssArr.unique();
            jsArr.unique();
            ignoreArr.unique();


            var replaceResource = function(type) {
                var htmlDir = path.relative(file.base, path.dirname(file.path));
                var htmlOutput = path.join(conf.output, conf.buildTarget.html, htmlDir);
                var jsOutput = path.join(conf.output, conf.buildTarget.js);
                var cssOutput = path.join(conf.output, conf.buildTarget.css);
                var imgsOutput = path.join(conf.output, conf.buildTarget.imgs);
                var timeStamp = new Date().getTime();
                var jsPath = path.join(path.relative(htmlOutput, jsOutput), filename +'.js') + '?v=' + timeStamp;
                var cssPath = path.join(path.relative(htmlOutput, cssOutput), filename +'.css') + '?v=' + timeStamp;;
                if (type !== 'css') {
                    var JSAppended = false;
                    $('script').each(function(i, item) {
                        var src = $(item).attr('src');
                        var parent = $(item).parent();
                        $(item).remove();
                        if (src && !is.url(src) && !isIgnore(path.join(file.base, src), config.ignore)) {
                            if (!JSAppended) {
                                parent.append('<script type="text/javascript" src="' + jsPath + '"></script>');
                                JSAppended = true;
                            }
                        }
                        else {
                            parent.append($(item));
                        }
                    });
                }

                if (type !== 'js') {
                    var CSSAppended = false;
                    $('link').each(function(i, item) {
                        var href = $(item).attr('href');
                        var parent = $(item).parent();
                        $(item).remove();
                        if (href && !is.url(href) && !isIgnore(path.join(file.base, href), config.ignore)) {
                            if (!CSSAppended) {
                                parent.append('<link rel="stylesheet" type="text/css" href="' + cssPath + '"/>');
                                CSSAppended = true
                            }
                        }
                        else {
                            parent.append($(item));
                        }
                    });
                }
            }

            var addVersion = function(type) {
                if (type !== 'css') {
                    $('script').each(function(i, item) {
                        var src = $(this).attr('src')
                        if (src) {
                            var origin = src.replace(/.\w+$/g, '.js');
                            $(this).attr('src', origin + '?v=' + new Date().getTime());
                        }

                    })
                }

                if (type !== 'js') {
                    $('link').each(function(i, item) {
                        var href = $(this).attr('href');
                        if (href) {
                            var origin = href.replace(/.\w+$/g, '.css');
                            $(this).attr('href', origin + '?v=' + new Date().getTime());
                        }
                    })
                }
            }

            if (conf.concat) {          //如果bundle成一个文件
                replaceResource();
            }
            else if (conf.bundle) {
                replaceResource('js');
                addVersion('css');
            }
            else {
                addVersion();
            }

            if (handleLimit === 'js') {
                handleJS(jsArr, conf, filename, env, wpconfig);
            }
            else if (handleLimit === 'css') {
                handleCSS(cssArr, conf, filename, env);
            }
            else if (handleLimit === 'imgs') {
                handleImage(imgArr, conf, filename, env);
            }
            else {
                handleJS(jsArr, conf, filename, env, wpconfig);
                handleCSS(cssArr, conf, filename, env);
                handleImage(imgArr, conf, filename, env);
            }

            /*
             * 被忽略的文件以不变的目录结构放到
             */
            if (ignoreArr.length) {
                gulp.src(ignoreArr)
                    .pipe(gulp.dest(function(file){
                        return path.dirname(path.join(conf.output, path.relative(conf.src, file.path)));
                    }));
            }

            file.contents = new Buffer($.html({xmlMode: false, decodeEntities: false}));
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
                if (conf.imgSrc) {
                    logger.notice('执行图片复制');
                    gulp.src(conf.imgSrc)
                        .on('error', reject)
                        .pipe(gulp.dest(imageTarget))
                        .on('end', resolve)
                }
            }
            else {
                resolve();
            }
        });

        promise.then(function() {
            var entries = conf.entries || config.entries;
            var stream = gulp.src(entries)
                .pipe(gulpif(!conf.inline, findResource(env)))

            if (conf.custom && conf.custom.html && conf.custom.html.length) {
                conf.custom.html.forEach(function (task) {
                    stream = stream.pipe(task.func(task.opts));
                });
            }

            stream = stream.pipe(gulpif(conf.inline, addInlineAttr()))
                .pipe(gulpif(conf.inline, inlinesource()))
                .pipe(gulpif(conf.minifyHTML, htmlmin()))
                .on('error', function() {
                    logger.notice('构建失败::>_<::');
                })
                .pipe(gulp.dest(htmlTarget))
                .on('end', function() {
                    if (conf.codeCount) {
                       handleCount();
                    }
                    logger.notice('构建完成=^_^=');
                })
        });

        /*
         * 将需要copy的目录和文件平移到output目录
         */
        if (config.moveList && config.moveList.length) {
            config.moveList.forEach(function (moveItem) {
                var pathArr = moveItem.split('/');
                pathArr.forEach(function(item, index) {
                    if (!item) {
                        pathArr.splice(index, 1);
                    }
                })
                var moveItemName = pathArr[pathArr.length - 1];
                if (fs.existsSync(moveItem)) {
                    fs.copySync(moveItem, path.join(conf.output, moveItemName));
                }

            })
        }



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
