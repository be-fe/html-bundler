# html-bundler

### Why html-bundler
目前最流行的打包工具是webpack和gulp，都有着良好的生态和海量的用户，但是在我们使用的过程中发现了以下一些问题：

- webpack的上手难度较高,官方文档比较差
- 所有资源都用webpack打包的情况下性能较差
- gulp虽然上手简单，但是插件众多，如何进行选择和最佳实践是一个大问题
- 每做一个项目都需要修改构建程序.

html-bundler以html为入口文件，自动寻找引入的资源文件进行构建处理，这对绝大多数项目是通用的，无需修改配置文件

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