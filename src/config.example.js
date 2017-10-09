var destMod = {
    output: './dist/dest',
    minify: true,
    minifyHTML: true,
    bundle: true,
    concat: true,
    less: true,
    inline: false,
    codeCount: true, //代码统计
    sourcemap: false,
    watchFolder: null,
    custom: {
        js: [],
        css: [],
        imgs: [],
        html: []
    },//自定义任务
    define: {
        __DEST__: true,
        __DEV__: false,
        __RD__: false,
        __QA__: false
    },
    server: false,
    buildTarget: {
        js: './js/',
        css: './css/',
        imgs: './images/',
        html: './html/'
    },
};

var rdMod = Object.assign({}, destMod);
var qaMod = Object.assign({}, destMod);

rdMod.output = './dist/rd';
qaMod.output = './dist/qa';
rdMod.define = {
    __DEST__: false,
    __DEV__: false,
    __RD__: true,
    __QA__: false
};
qaMod.define = {
    __DEST__: false,
    __DEV__: false,
    __RD__: false,
    __QA__: true
};

/* eslint-disable */
module.exports = {
    src: './src',

    entries: ['./src/html/**', './src/*.html'],

    ignore: ['./src/lib'],

    imgFolder: './src/images',

    moveList: ['./src/lib'], //需要平移的目录和文件

    devMod: {
        entries: ['./src/html/**', './src/*.html'], //每种模式下内部的entries会覆盖外部的
        output: './dev',
        minify: false,
        minifyHTML: false,
        bundle: true,
        concat: false,
        sourcemap: true,
        less: true,
        inline: false,
        codeCount: false, //代码统计
        watchFolder: {
            css: ['./src/css'],
            js: ['./src/js'],
            imgs: ['./src/images'],
            html: ['./src/html']
        },
        define: {
            __DEST__: false,
            __DEV__: true,
            __RD__: false,
            __QA__: false
        }, //webpack环境变量定义，非webpack模式不生效
        custom: {
            js: [],
            css: [],
            imgs: [],
            html: []
        },//自定义任务, 格式样例[{func: sass, opts: {logger: true}}, {func: task, opts: null }]
        server: true,
        buildTarget: 'default'
    },

    destMod: destMod,

    rdMod: rdMod,

    qaMod: qaMod,

    birdConfig: {
        basePath: "./dev",
        targetServer: {
            port: "8276",
            host: "your server host",
            headers: {
                cookie: ""
            }
        },
        ajaxOnly: false,
        toolsConf: {
            weinre: {
                open: false, //和移动调试工具条中的vconsole冲突, 当为true时vconsole自动关闭
                port: 9001
            },

            showTools: true //移动端调试工具条，PC端开发可关闭
        }
    },

    serverConfig: {
        root: './dev'
    }
}

/*
 * buildTarget用于设置dist后的目录结构，如果选择default,则默认为css, js, html
 * 如果是一个对象，则表示自定义，不过目前只支持按照文件类型进行分类。
 */


