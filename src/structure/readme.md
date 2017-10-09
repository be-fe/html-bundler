## 使用手册

### Globle Mod
适用于一些较简单的项目

```sh
npm install html-bundler -g
```

```sh
hb create project
hb create project -w //add webpack.config.js local
```


```sh
cd project && npm install
```


```sh
hb dev -p 8080
```


```sh
hb dest
```

### Local Mod
适用于正式项目

```sh
cd your-project
npm install html-bundler --save-dev
```

自动生成html-bundler.config.js

```sh
npm install html-bundler -g
hb init
hb init -w  //自动生成webpack.config.js
```

create a js file (e.g: bundle.js)and write:

```js
require('html-bundler')

```

```sh
node bundle.js dev -p 8080
```

```sh
node bundle.js dest
```

### DLL优化
需要在webpack.dll.js的vendors中配置业务需要静态化的包，然后执行

```sh
node webpack.dll.js

```
执行完成后会生成一个manifest.json文件，每次修改vendors配置后需要重新生成。

### 配置文件解析
```js
/* eslint-disable */
module.exports = {
    src: './src',                               //源代码所在路径

    entries: ['./src/html/**', './src/*.html'], //html入口文件

    ignore: ['./src/js/lib', './src/css/lib'],  //不进行任何处理的路径

    imgFolder: './src/imgs',                    //图片目录

    moveList: ['./src/fonts', './src/a.js'],    //需要平移的目录和文件

    devMod: {                                   //开发模式
        output: './dev',                        //开发模式下打包后的输出位置
        minify: false,                          //是否最小化，如果开启，则js、css都会进行压缩
        minifyHTML: false,                      //是否压缩html，如果开启，则会对html文件进行压缩
        bundle: true,                           //是否使用webpack进行打包
        concat: false,                          //是否合并文件
        sourcemap: true,                        //是否进行sourcemap
        less: true,                             //是否进行less预处理
        inline: false,                          //是否把所有资源打成inline（目前不能和bundle配合使用）
        watchFolder: {                          //文件分类进行监听，这样修改js不会编译css，提高性能
            css: ['./src/css'],
            js: ['./src/js'],
            imgs: ['./src/imgs'],
            html: ['./src/html']
        },
        custom: {                               //自定义任务, 格式样例[{func: sass, opts: {logger: true}}, {func: task, opts: null }]
            js: [],
            css: [],
            imgs: [],
            html: []
        },
        server: true,                           //是否开启server，默认集成gulp-connect，如果配置为'bird',则使用bird。
        buildTarget: 'default'                  //buildTarget用于设置dist后的目录结构，如果选择default,则默认为css, js, html,如果是一个对象，则表示自定义，不过目前只支持按照文件类型进行分类。
    },

    destMod: {                                  //生产模式，配置项和开发模式完全相同
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
        },
        server: false,
        buildTarget: {
            js: './js/',
            css: './css/',
            imgs: './images/',
            html: './html/'
        },
    },

    rdMod: {
        //rd环境配置项,内容同上
    },

    qaMod: {
        //qa环境配置项,内容同上
    },

    birdConfig: {                               //bird 配置项
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

    serverConfig: {                             //gulp connect 配置项
        root: './dev'
    }
}

```
