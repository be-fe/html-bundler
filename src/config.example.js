module.exports = {
    src: './src',

    entries: ['./src/html/**', './src/*.html'],

    devMod: {
        output: './dev',
        minify: false,
        bundle: true,
        concat: false,
        sourcemap: true,
        less: true,
        inline: false,
        imgFolder: './src/imgs',
        watchFolder: {
            css: ['./src/css'],
            js: ['./src/js'],
            imgs: ['./src/imgs'],
            any: ['./src/html']
        },
        server: true,
        buildTarget: 'default'
    },

    destMod: {
        output: './dist',
        minify: true,
        bundle: true,
        concat: false,
        less: true,
        inline: false,
        imgFolder: './src/imgs',
        sourcemap: false,
        watchFolder: null,
        server: false,

        buildTarget: {
            js: './js/',
            css: './css/',
            imgs: './image/',
            html: './html/'
        },
    },

    birdConfig: {
        basePath: "./",
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

    }
}

/*
 * buildTarget用于设置dist后的目录结构，如果选择default,则默认为css, js, html
 * 如果选择same, 则和原目录结构保持一致
 * 如果是一个对象，则表示自定义，不过目前只支持按照文件类型进行分类。
 */


