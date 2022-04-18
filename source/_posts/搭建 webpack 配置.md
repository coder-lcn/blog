---
title: 搭建 webpack 配置
toc: true
date: 2019-11-2 19:30:04
categories: 程序员
tags: webpack
---
  
  
## 1.什么是Webpack？

webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler),当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle
![](https://cdn.nlark.com/yuque/0/2019/jpeg/283097/1568701889785-4273ad7b-70f1-40bd-ac4a-44db3dcb58eb.jpeg#align=left&display=inline&height=362&originHeight=362&originWidth=779&size=0&status=done&width=779)
  
  
<!-- more -->
  


使用Webpack作为前端构建工具：

- 代码转换：TypeScript 编译成 JavaScript、SCSS 编译成 CSS 等。
- 文件优化：压缩 JavaScript、CSS、HTML 代码，压缩合并图片等。
- 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
- 模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
- 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
- 代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
- 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。

**在`webpack`应用中有两个核心**:

- 

  1. 模块转换器，用于把模块原内容按照需求转换成新内容，可以加载非 JS 模块
- 

  1. 扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。

## 2.初始化项目

```bash
├── src   # 源码目录
│   ├── a-module.js
│   └── index.js
```

编写 _a-module.js_

```javascript
module.exports = 'hello';
```

编写 _index.js_

```javascript
let a = require('./a-module');
console.log(a);
```

> 这里我们使用`CommonJS`模块的方式引入，这种方式默认在浏览器上是无法运行的，我们希望通过 `webpack` 来进行打包！


## 3.webpack快速上手

### 3.1 安装

```bash
npm init -y
npm install webpack webpack-cli --save-dev
```

`webpack`默认支持0配置,配置`scripts`脚本

```json
"scripts": {
  "build": "webpack"
}
```

执行`npm run build`,默认会调用 `node_modules/.bin`下的`webpack`命令，内部会调用`webpack-cli`解析用户参数进行打包。默认会以 `src/index.js` 作为入口文件。

> 这里也可以使用`npx webpack`,`npx` 是 5.2版本之后`npm`提供的命令可以执行`.bin`下的可执行文件


![](https://cdn.nlark.com/yuque/0/2019/png/283097/1568701889662-085bdeb5-c41a-4015-a084-f7d71a842261.png#align=left&display=inline&height=394&originHeight=394&originWidth=1047&size=0&status=done&width=1047)

我们可以发现已经产生了`dist`目录，此目录为最终打包出的结果。`main.js`可以在html中直接引用,这里还提示我们默认`mode` 为`production`

### 3.2 webpack.config.js

我们打包时一般不会采用0配置，`webpack`在打包时默认会查找当前目录下的 `webpack.config.js or webpackfile.js` 文件。

通过配置文件进行打包

```javascript
const path = require('path');
module.exports = {
    entry: './src/index.js',
    output: {
        filename:'bundle.js', // 打包出的结果文件
        path:path.resolve(__dirname,'dist') // 打包到dist目录下
    }
}
```

### 3.3 配置打包的mode

我们需要在打包时提供`mode`属性来区分是开发环境还是生产环境,来实现配置文件的拆分

```bash
├── build
│   ├── webpack.base.js
│   ├── webpack.dev.js
│   └── webpack.prod.js
```

**我们可以通过指定不同的文件来进行打包**

配置`scripts`脚本

```json
"scripts": {
  "build": "webpack --config ./build/webpack.prod",
  "dev": "webpack --config ./build/webpack.dev"
}
```

可以通过 `config` 参数指定,使用哪个配置文件来进行打包

**通过env参数区分**

```json
"scripts": {
    "build": "webpack --env.production --config ./build/webpack.base",
    "dev": "webpack --env.development --config ./build/webpack.base"
}
```

改造`webpack.base`文件默认导出函数，会将环境变量传入到函数的参数中

```javascript
module.exports = (env)=>{
    console.log(env); // { development: true }
}
```

**合并配置文件**

我们可以判断当前环境是否是开发环境来加载不同的配置,这里我们需要做配置合并
安装`webpack-merge`:

```bash
npm install webpack-merge --save-dev
```

`webpack.dev`配置

```javascript
module.exports = {
    mode:'development'
}
```

`webpack.prod`配置

```javascript
module.exports = {
    mode:'production'
}
```

`webpack.base`配置

```javascript
const path = require('path');
const merge = require('webpack-merge');
// 开发环境
const dev = require('./webpack.dev');
// 生产环境
const prod = require('./webpack.prod');

const base = { // 基础配置
    entry:'./src/index.js',
    output:{
        filename:'bundle.js',
        path:path.resolve(__dirname,'../dist')
    }
}

module.exports = (env) =>{
    if(env.development){
        return merge(base,dev);
    }else{
        return merge(base,prod)
    }
}
```

后续的开发中，我们会将公共的逻辑放到`base`中,开发和生产对的配置也分别进行存放！

## 4.webpack-dev-server

配置开发服务器，可以在实现在内存中打包,并且自动启动服务

```bash
npm install webpack-dev-server --save-dev
```

```json
"scripts": {
    "build": "webpack --env.production --config ./build/webpack.base",
    "dev": "webpack-dev-server --env.development --config ./build/webpack.base"
}
```

通过执行`npm run dev`来启启动开发环境

![](https://cdn.nlark.com/yuque/0/2019/png/283097/1568701889609-6f39304f-4c9a-4ab6-b046-ec88995a31e7.png#align=left&display=inline&height=279&originHeight=279&originWidth=805&size=0&status=done&width=805)

默认会在当前根目录下启动服务

**配置开发服务的配置**

```javascript
const path = require('path')
module.exports = {
    mode:'development',
    devServer:{
        // 更改静态文件目录位置
        contentBase:path.resolve(__dirname,'../dist'),
        compress:true, // 开启gzip
        port:3000, // 更改端口号
    }
}
```

## 5.打包Html插件

### 5.1 单入口打包

自动产生html，并引入打包后的文件

编辑`webpack.base`文件

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
plugins:[
    new HtmlWebpackPlugin({
        filename:'index.html', // 打包出来的文件名
        template:path.resolve(__dirname,'../public/index.html'),
        hash:true, // 在引用资源的后面增加hash戳
        minify:{
            removeAttributeQuotes:true // 删除属性双引号
        }
    })
]
```

### 5.2 多入口打包

根据不同入口 生成多个js文件，引入到不同html中

```bash
── src
    ├── entry-1.js
    └── entry-2.js
```

多入口需要配置多个entry

```javascript
entry:{
    jquery:['jquery'], // 打包jquery
    entry1:path.resolve(__dirname,'../src/entry-1.js'),
    entry2:path.resolve(__dirname,'../src/entry-2.js')
},
output:{
    filename:'[name].js',
    path:path.resolve(__dirname,'../dist')
},
```

产生多个Html文件

```javascript
new HtmlWebpackPlugin({
    filename:'index.html', 
    template:path.resolve(__dirname,'../public/template.html'),
    hash:true, 
    minify:{
        removeAttributeQuotes:true
    },
    chunks:['jquery','entry1'], // 引入的chunk 有jquery,entry
}),
new HtmlWebpackPlugin({
    filename:'login.html',
    template:path.resolve(__dirname,'../public/template.html'),
    hash:true,
    minify:{
        removeAttributeQuotes:true
    },
    inject:false, // inject 为false表示不注入js文件
    // 默认打包后引入文件的顺序，是根据入口的顺序来的。可以在这里设置 chunksSortMode，指定顺序为 chunks 里的顺序来 
    chunksSortMode:'manual', 
    chunks:['entry2','jquery']
})
```

以上的方式不是很优雅，每次都需要手动添加`HtmlPlugin`应该动态产生`html`文件，可以像这样优化:

```javascript
let htmlPlugins = [
  {
    entry: "entry1",
    html: "index.html"
  },
  {
    entry: "entry2",
    html: "login.html"
  }
].map(
  item =>
    new HtmlWebpackPlugin({
      filename: item.html,
      template: path.resolve(__dirname, "../public/template.html"),
      hash: true,
      minify: {
        removeAttributeQuotes: true
      },
      chunks: ["jquery", item.entry]
    })
);

plugins: [...htmlPlugins]
```

## 6.清空打包结果

可以使用`clean-webpack-plugin`手动清除某个文件夹内容:

**安装**

```bash
npm install --save-dev clean-webpack-plugin
```

```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
new CleanWebpackPlugin({
    // 清空匹配的路径
    cleanOnceBeforeBuildPatterns: [path.resolve('xxxx/*'),'**/*'],
})
```

这样就可以清空指定的目录了,我们可以看到`webpack`插件的基本用法就是 `new Plugin`并且放到`plugins`中


# Webpack中必须掌握的配置

loader主要用于把模块原内容按照需求转换成新内容，可以加载非 JS 模块！
通过使用不同的Loader，Webpack可以把不同的文件都转成JS文件,比如CSS、ES6/7、JSX等。

我们来看看这些我们必须掌握的loader!

## 1.配置 loader

### 1.1 loader的使用

- test：匹配处理文件的扩展名的正则表达式
- use：loader名称，就是你要使用模块的名称
- include/exclude:手动指定必须处理的文件夹或屏蔽不需要处理的文件夹
- options:为loaders提供额外的设置选项

默认`loader`的顺序是**从下到上**、**从右向左**执行，当然执行顺序也可以手动定义的，接下来我们依次介绍常见的loader，来感受`loader`的魅力!

我们基于这个基础配置来继续编写:

```javascript
const path = require("path");
const dev = require("./webpack.dev");
const prod = require("./webpack.prod");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const base = {
  entry:'./src/index.js',
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "../dist")
  },
  plugins: [
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, "../public/template.html"),
        hash: true,
        minify: {
            removeAttributeQuotes: true
        }
    }),
    new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [path.resolve('xxxx/*'),'**/*'],
    }),
  ]
};
module.exports = env => {
  if (env.development) {
    return merge(base, dev);
  } else {
    return merge(base, prod);
  }
};
```

## 2.处理CSS文件

### 2.1 解析css样式

我们在`js`文件中引入css样式！

```javascript
import './index.css';
```

再次执行打包时，会提示css无法解析

```bash
ERROR in ./src/index.css 1:4
Module parse failed: Unexpected token (1:4)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
```

**安装loader**

```bash
npm install style-loader css-loader --save-dev
```

```javascript
module: {
  rules: [
    {
       test: /\.css$/,
       use: ["style-loader", "css-loader"]
    }
  ]
}
```

### 2.2 抽离样式文件

默认只在打包时进行样式抽离

```javascript
module.exports = env => {
  let isDev = env.development;
  const base = {/*source...*/}
  if (isDev) {
    return merge(base, dev);
  } else {
    return merge(base, prod);
  }
};
```

安装抽离插件

```bash
npm install mini-css-extract-plugin --save-dev
```

配置抽离插件

```javascript
{
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    !isDev && MiniCssExtractPlugin.loader,
                    isDev && 'style-loader',
                    "css-loader"
                ].filter(Boolean)
            }
        ]
    },
    plugins: [
         !isDev && new MiniCssExtractPlugin({
            filename: "css/[name].css"
        })
    ].filter(Boolean)
}

```

> `plugins` 里的成员，不能是一个布尔值，否则会报错；而上面的配置在开发环境下会是个 `false` 。那么我们就可以通过数组的 `filter`  方法做个简单的过滤处理。



最终文件配置:

```javascript
const path = require("path");
const dev = require("./webpack.dev");
const prod = require("./webpack.prod");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = env => {
  let isDev = env.development;
  const base = {
    entry: "./src/index.js",
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../dist")
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            !isDev && MiniCssExtractPlugin.loader,
            isDev && 'style-loader',
            "css-loader"
          ].filter(Boolean)
        }
      ]
    },
    plugins:[
        !isDev && new MiniCssExtractPlugin({
          filename: "css/[name].css"
        }),
        new HtmlWebpackPlugin({
          filename: "index.html",
          template: path.resolve(__dirname, "../public/template.html"),
          hash: true,
          minify: {
            removeAttributeQuotes: true
          }
        }),
      ].filter(Boolean)
  };
  if (isDev) {
    return merge(base, dev);
  } else {
    return merge(base, prod);
  }
};
```

### 2.3 css预处理器

不同的css预处理器要安装不同的loader来进行解析

| **预处理器** | **需要的 loader** |
| --- | --- |
| sass | sass-loader、node-sass |
| less | less-loader、less |
| stylus | stylus-loader、stylus |



使用`sass`

```javascript
{
    test:/\.scss$/,
    use:[
        !isDev && MiniCssExtractPlugin.loader,
        isDev && 'style-loader',
        "css-loader",
        "sass-loader"
    ].filter(Boolean)
}
```

在css文件中可能会使用`@import`语法引用`css`文件,被引用的`css`文件中可能还会导入 `scss` 。这样在编译 `css`
的时候，scss 代码不会被编译；可以这么配置：
```javascript
{
    test: /\.css$/,
    use: [
    !isDev && MiniCssExtractPlugin.loader,
    isDev && 'style-loader',
    {
        loader:"css-loader",
        options:{
            importLoaders: 1
        }
    },
    "sass-loader"
    ].filter(Boolean)
},
```

> 把 `css-loader` 的用法改成对象，在配置里面设置 `importLoaders` 。表示在使用 `css-loader` 编译之前，如果 `css` 里面使用了 `@import` 语法引入了一个 `scss` 文件，就先用 **1** 个放置在在后面的 `loader` 先编译一次；也就用 `sass-loader` 编译一次。再继续用 `css-loader` 编译，就会编译引入的那个 `scss`。



### 2.4 处理样式前缀

使用`postcss-loader`增加样式前缀

```bash
npm install postcss-loader autoprefixer
```

在处理css前先增加前缀

```javascript
{
    test: /\.css$/,
    use: [
    !isDev && MiniCssExtractPlugin.loader,
    isDev && 'style-loader',
    {
        loader:"postcss-loader",
        options:{
            plugins:[require('autoprefixer')]
        }
    },
    "sass-loader"
    ].filter(Boolean)
}
```

或者也可以创建`postcss`的配置文件`postcss.config.js`

```javascript
module.exports = {
    plugins:[
        require('autoprefixer')
    ]
}
```

然后

```javascript
{
    test: /\.css$/,
    use: [
    !isDev && MiniCssExtractPlugin.loader,
    isDev && 'style-loader',
    "postcss-loader",
    "sass-loader"
    ].filter(Boolean)
}
```

可以配置浏览器的兼容性范围，在项目根目录下建一个 [.browserslistrc](https://github.com/browserslist/browserslist) 文件：

```javascript
cover 99.5%
```

> 这里表示覆盖的浏览器范围


### 2.5 css压缩

在生产环境下我们需要压缩`css`文件,配置`minimizer`选项,安装压缩插件

```bash
npm i optimize-css-assets-webpack-plugin terser-webpack-plugin --save-dev
```

在`webpack.prod.js`文件中配置压缩

```javascript
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
optimization:{
    minimizer:[new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
}
```

### 2.6 文件指纹

- Hash整个项目的hash值
- chunkhash 根据入口产生hash值
- contentHash 根据每个文件的内容产生的hash值

我们可以合理的使用`hash`戳，进行文件的缓存

```javascript
!isDev && new MiniCssExtractPlugin({
    filename: "css/[name].[contentHash].css"
})
```

## 3.处理文件类型

### 3.1 处理引用的图片

```javascript
import logo from './webpack.png';
let img = document.createElement('img');
img.src = logo;
document.body.appendChild(img);
```

使用`file-loader`,会将图片进行打包，并将打包后的路径返回

```javascript
{
    test:/\.jpe?g|png|gif/,
    use:{
        loader:'file-loader',
        options:{
            name:`img/[name].[ext]`
        }
    }
}
```

### 3.2 处理icon

二进制文件也是使用`file-loader`来打包

```javascript
{
    test:/woff|ttf|eot|svg|otf/,
    use:{
        loader:'file-loader'
    }
}
```

### 3.3 转化成base64

使用`url-loader`将满足条件的图片转化成base64,不满足条件的`url-loader`会自动调用`file-loader`来进行处理

```javascript
{
    test:/\.jpe?g|png|gif/,
    use:{
        loader:'url-loader',
        options:{
            limit:100*1024,
            name:`img/[name].[ext]`
        }
    }
}
```

## 4.处理JS模块

### 4.1 将`es6`代码编译成`es5`代码

代码的转化工作要交给`babel`来处理

```bash
npm install @babel/core @babel/preset-env babel-loader --save-dev
```

`@babel/core`是babel中的核心模块，`@babel/preset-env` 的作用是es6转化es5插件的插件集合，`babel-loader`是`webpack`和`loader`的桥梁。

```javascript
const sum = (a, b) => {
  return a + b;
};
```

增加`babel`的配置文件 `.babelrc`

```json
{
    "presets": [
       ["@babel/preset-env"]
    ]
}
```

**配置loader**

```javascript
module: {
	rules: [{ test: /\.js$/, use: "babel-loader" }]
},
```

现在打包已经可以成功的将es6语法转化成es5语法！

### 4.2 解析装饰器

```bash
npm i @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators --save-dev
```

```json
"plugins": [
  ["@babel/plugin-proposal-decorators", { "legacy": true }],
  ["@babel/plugin-proposal-class-properties",{"loose":true}]
]
```

`legacy:true`表示继续使用装饰器装饰器，loose为false时会采用`Object.defineProperty`定义属性

- Plugin会运行在Preset之前
- Plugin 会从第一个开始顺序执行，Preset则是相反的

### 4.3 polyfill

根据`.browserslistrc`文件，转化使用到的浏览器api

```javascript
"presets": [
    ["@babel/preset-env",{
        "useBuiltIns":"usage", // 按需加载
        "corejs":2 // corejs 替代了以前的pollyfill
    }]
]
```

安装corejs

```bash
npm install core-js@2 --save
```

> **使用`transform-runtime`**
> A plugin that enables the re-use of Babel's injected helper code to save on codesize.可以帮我们节省代码


```bash
npm install --save-dev @babel/plugin-transform-runtime @babel/runtime
```

在`.babelrc`中配置插件

```json
"plugins": [
    "@babel/plugin-transform-runtime"
]
```

### 4.4 添加eslint

安装`eslint`

```bash
npm install eslint
npx eslint --init # 初始化配置文件
```

```
{
    test:/\.js/,
    enforce:'pre',
    use:'eslint-loader'
},
```

> 配置`eslint-loader`可以实时校验js文件的正确性,`pre`表示在所有`loader`执行前执行


## 5.source-map

- eval 生成代码 每个模块都被eval执行,每一个打包后的模块后面都增加了包含sourceURL
- source-map 产生map文件
- inline 不会生成独立的 .map文件,会以dataURL形式插入
- cheap 忽略打包后的列信息，不使用loader中的sourcemap
- module 没有列信息，使用loader中的sourcemap(没有列信息)

```javascript
devtool:isDev?'cheap-module-eval-source-map':false
```

> 每个库中采用的`sourcemap`方式不一,可以根据自己的需要自行配置


## 6.resolve解析

想实现使用require或是import的时候,可以自动尝试添加扩展名进行匹配

```javascript
resolve: {
    extensions: [".js", ".jsx", ".json", ".css", ".ts", ".tsx", ".vue"]
},
```

## 7.拷贝静态文件

有些时候在打包时希望将一些静态资源文件进行拷贝,可以使用`copy-webpack-plugin`

安装插件

```bash
npm i copy-webpack-plugin --save-dev
```

使用拷贝插件

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');
new CopyWebpackPlugin([
    {from:path.resolve('./src/static'),to:path.resolve('./dist')},
])
```


## 8.配置代理

设置服务端接口

```javascript
const express = require('express');
const app = express();
app.get('/api/list', (req, res) => {
  res.send(['香蕉', '苹果', '橘子']);
});
app.listen(4000);
```

安装`axios`获取数据

```javascript
npm install axios --save-dev
```

配置接口请求

```html
<template>
    <div>
        <div v-for="(todo,index) in todos" :key="index">
            {{todo}}
        </div>
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import {Component ,Vue} from 'vue-property-decorator';
@Component
export default class Todo extends Vue{
    public todos:string[] =[];
    async mounted(){
        let { data } =  await axios.get('/api/list');
        this.todos = data
    }
}
</script>
```

配置服务器代理路由

```javascript
proxy: {
    '/api': {
    target: 'http://localhost:4000',
    },
}
```

