var webpack = require('webpack');
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 8 });
var logger = require('./utils/logger');

logger.info('Using Default webpackConfig~');



var commonConf = {
    module: {
        //各种加载器，即让各种文件格式可用require引用
        preLoaders: [
            {
                test: /\.tag$/,
                exclude: /node_modules/,
                loader: ['riotjs-loader', 'babel-loader'],
                query: { type: 'none' }
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['happypack/loader?id=js']
            },
            {
                test: /\.(jpeg|jpg|png|gif)$/,
                loader: 'url-loader?limit=10240'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.json$/, loader: 'json-loader'
            },
            {
                test: /\.woff(\?.+)?$/, loader: "url?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.woff2(\?.+)?$/, loader: "url?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.ttf(\?.+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream"
            },
            {
                test: /\.eot(\?.+)?$/, loader: "file"
            },
            {
                test: /\.svg(\?.+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml"
            }
        ]
    },
    resolve: {
        //配置别名，在项目中可缩减引用路径
        // alias: {
        //     jquery: srcDir + "/js/lib/jquery.min.js",
        //     core: srcDir + "/js/core",
        //     ui: srcDir + "/js/ui"
        // }
    },
};

var webpackConf = {
    dev: {
        devtool: "inline-source-map",  //生成sourcemap,便于开发调试
        //devtool: "eval",  //快速打包
        cache: true,
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new HappyPack({
                id: 'js',
                cache: true,
                threadPool: happyThreadPool,
                loaders: [ 'babel-loader?cacheDirectory' ]
            })
        ],
        module: commonConf.module,
        resolve: commonConf.resolve

    },

    dest: {
        devtool: null,
        cache: false,
        plugins: [
            new HappyPack({
                id: 'js',
                cache: false,
                threadPool: happyThreadPool,
                loaders: [ 'babel-loader' ]
            })
        ],
        module: commonConf.module,
        resolve: commonConf.resolve
    }

};

module.exports = webpackConf;