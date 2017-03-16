/* eslint-disable */
module.exports = {
    src: './src',

    entries: ['./src/html/**', './src/*.html'],

    ignore: ['./src/js/lib', './src/css/lib'],

    imgFolder: './src/imgs',

    // moveList: ['./src/fonts', './src/a.js'], //需要平移的目录和文件

    devMod: {
        output: './dev',
        minify: false,
        minifyHTML: false,
        bundle: true,
        concat: false,
        sourcemap: true,
        less: true,
        inline: false,
        watchFolder: {
            css: ['./src/css'],
            js: ['./src/js'],
            imgs: ['./src/images'],
            html: ['./src/html']
        },
        custom: {
            js: [],
            css: [],
            imgs: [],
            html: []
        },//自定义任务, 格式样例[{func: sass, opts: {logger: true}}, {func: task, opts: null }]
        server: true,
        buildTarget: 'default'
    },

    destMod: {
        output: './dist',
        minify: true,
        minifyHTML: true,
        bundle: true,
        concat: true,
        less: true,
        inline: false,
        sourcemap: false,
        watchFolder: null,
        custom: {
            js: [],
            css: [],
            imgs: [],
            html: []
        },//自定义任务
        server: false,
        buildTarget: {
            js: './js/',
            css: './css/',
            imgs: './images/',
            html: './html/'
        },
    },

    birdConfig: {
        basePath: "./dev",
        targetServer: {
            port: "8276",
            host: "your server host",
            headers: {
                cookie: ""
            }
        },
        ajaxOnly: false
    },

    serverConfig: {
        root: './dev'
    }
}

/*
 * buildTarget用于设置dist后的目录结构，如果选择default,则默认为css, js, html
 * 如果是一个对象，则表示自定义，不过目前只支持按照文件类型进行分类。
 */


