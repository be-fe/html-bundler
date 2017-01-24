# html-bundler

### Why html-bundler
目前最流行的打包工具是webpack和gulp，都有着良好的生态和海量的用户，但是在我们使用的过程中发现了以下一些问题：

- webpack的上手难度较高,官方文档比较差
- 所有资源都用webpack打包的情况下性能较差
- gulp虽然上手简单，但是插件众多，如何进行选择和最佳实践是一个大问题
- 每做一个项目都需要修改构建程序.

html-bundler的特点：

- html-bundler以html为入口文件，自动寻找引入的资源文件进行构建处理，这对绝大多数项目是通用的.
- 通过一个简单易理解的配置文件使得构建流程可配置，
- 一些简单的项目可以直接只做简单的less => css转换，production模式进行压缩合并以及版本号处理即可
- 复杂的项目则引入webpack对js进行模块化的处理，并暴露接口让用户自己修改webpack配置文件
- 集成了一些优化和日志工具，提升构建的性能和可维护性

后续的改进点：

- bug修复，目前在一些排列组合上存在bug。
- 暴露接口让用户可以添加自定义任务。
- 文档优化


### Globle Mod
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