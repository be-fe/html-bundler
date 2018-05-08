/* eslint-disable */
var webpack = require('webpack');
var HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: 4 });

var commonConf = {
    module: {
        //各种加载器，即让各种文件格式可用require引用
        loaders: [
            {
                test: /\.tag$/,
                exclude: /node_modules/,
                loader: ['babel-loader', 'riotjs-loader']
            },
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
    }
};

var webpackConf = {
    dev: {
        devtool: "inline-source-map",  //生成sourcemap,便于开发调试
        //devtool: "cheap-eval-source-map",  //快速打包
        cache: true,
        plugins: [
            new HappyPack({
                id: 'js',
                cache: true,
                verbose: false,
                threadPool: happyThreadPool,
                loaders: [ 'babel-loader' ]
            }),
        ],
        module: commonConf.module,
        resolve: commonConf.resolve

    },

    dest: {
        devtool: false,
        cache: false,
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new HappyPack({
                id: 'js',
                cache: true,
                verbose: false,
                threadPool: happyThreadPool,
                loaders: [ 'babel-loader' ]
            }),
        ],
        module: commonConf.module,
        resolve: commonConf.resolve
    }
};

try {
    var dllref = new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('./manifest.json'),
    });
    webpackConf.dev.plugins.unshift(dllref);
    webpackConf.dest.plugins.unshift(dllref);
}
catch(e) {
    console.log('没有生成webpack DllReferencePlugin插件所需的 manifest.json');
}

//一般来说，RD环境和QA环境打包配置和dest是一致的，但是需要不同的环境变量配置一些参数
webpackConf.rd = Object.assign(webpackConf.dest, {});
webpackConf.qa = Object.assign(webpackConf.dest, {});

module.exports = webpackConf;