---
title: webpack 优化
toc: true
date: 2019-11-7 19:26:42
categories:
  - 前端
  - webpack
tags: webpack
---

了解 webpack 常见的配置之后，再来看看如何实现 webpack 中的优化

<!-- more -->

```javascript
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = (mode) => {
  return {
    mode: mode,
    entry: "./src/main.js",
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif)$/,
          use: "file-loader",
        },
        {
          test: /\.js$/,
          use: "babel-loader", // .babelrc已经配置支持react
        },
        {
          test: /\.css$/,
          use: [
            mode !== "development"
              ? MiniCssExtractPlugin.loader
              : "style-loader",
            "css-loader",
          ],
        },
      ],
    },
    plugins: [
      new PurgecssPlugin({
        paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, {
          nodir: true,
        }), // 不匹配目录，只匹配文件
      }),
      mode !== "development" &&
        new MiniCssExtractPlugin({
          filename: "css/[name].css",
        }),
      new HtmlWebpackPlugin({
        template: "./src/template.html",
        filename: "index.html",
      }),
    ].filter(Boolean),
  };
};
```

`.babelrc`配置文件

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
```

## 1.删除无用的 Css 样式

先来看编写的代码

```javascript
import "./style.css";
import React from "react";
import ReactDOM from "react-dom";

ReactDOM.render(<div>hello</div>, document.getElementById("root"));
```

```css
body {
  background: red;
}

.class1 {
  background: red;
}
```

> 这里的`.class1`显然是无用的，我们可以搜索`src`目录下的文件，删除无用的样式

```javascript
const glob = require('glob');
const PurgecssPlugin = require('purgecss-webpack-plugin');

// 需要配合mini-css-extract-plugin插件
mode !== "development" && new PurgecssPlugin({
    paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, { nodir: true }) // 不匹配目录，只匹配文件
}),
```

> **注意：动态 class 会被删掉**

## 2.图片压缩插件

将打包后的图片进行优化

```
npm install image-webpack-loader --save-dev
```

在 file-loader 之前使用压缩图片插件

```javascript
{
	loader: "image-webpack-loader",
  options: {
    mozjpeg: {
      progressive: true,
      quality: 65
    },
    optipng: {
      enabled: false,
    },
    pngquant: {
      quality: [0.90, 0.95],
      speed: 4
    },
    gifsicle: {
      interlaced: false,
    },
    webp: {
      quality: 75
    }
  }
}
```

> 可以发现图片大小是有了明显的变化

## 3.CDN 加载文件

我们希望通过 cdn 的方式引入资源

```javascript
const AddAssetHtmlCdnPlugin = require("add-asset-html-cdn-webpack-plugin");
new AddAssetHtmlCdnPlugin(true, {
  jquery: "https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js",
});
```

但是在代码中还希望引入`jquery`来获得提示

```javascript
import $ from "jquery";
console.log("$", $);
```

但是打包时依然会将`jquery`进行打包

```javascript
externals:{
  'jquery':'$'
}
```

那么就在配置文件中设置 `externals` ，标注`jquery`是外部的，这样打包时就不会将 jquery 进行打包了

## 4.Tree-shaking && Scope-Hoisting

### 4.1 Tree-shaking

顾名思义就是将没用的内容摇晃掉,来看下面代码

`main.js`

```javascript
import { minus } from "./calc";
console.log(minus(1, 1));
```

`calc.js`

```javascript
import { test } from "./test";

export const sum = (a, b) => {
  return a + b + "sum";
};

export const minus = (a, b) => {
  return a - b + "minus";
};
```

`test.js`

```javascript
export const test = () => {
  console.log("hello");
};
console.log(test());
```

> 观察上述代码其实我们主要使用`minus`方法,`test.js`代码属于副作用代码!

默认`mode:production`时，会自动`tree-shaking`,但是副作用代码却不会清除掉。打包后`'hello'`依然会被打印出来,这时候我们需要在`package.json`中，配置不使用副作用。

```json
"sideEffects":false,
```

这样设置后，副作用代码就不会被打包，但是对于`css`文件就会有影响了，因为我们 `css` 也是通过`import './style.css'`来引入的。

这里重点就来了,`tree-shaking`主要针对**es6 模块**,我们可以使用`require`语法导入 css,但是这样用起来有点格格不入,所以我们可以配置`css`文件不是副作用

```javascript
"sideEffects":[
    "**/*.css"
]
```

在开发环境下默认`tree-shaking`不会生效, 可以配置标识提示只能在开发模式下使用。

```javascript
optimization: {
  usedExports: true;
}
```

### 4.2 Scope Hoisting

作用域提升,可以减少代码体积，节约内存。（webpack 自带了，无需配置）

```javascript
let a = 1;
let b = 2;
let c = 3;
let d = a + b + c;

export default d;

// 引入d
import d from "./d";
console.log(d);
```

> 最终打包后的结果会变成 `console.log(6)`

- 代码量明显减少
- 减少多个函数后内存占用也将减少

## 5.DllPlugin && DllReferencePlugin

每次构建时第三方模块都需要重新构建，这个性能消耗比较大，我们可以先把第三方库打包成动态链接库，以后构建时只需要查找构建好的库就好了，这样可以大大节约构建时间

```javascript
import React from "react";
import ReactDOM from "react-dom";

ReactDOM.render(<h1>hello</h1>, document.getElementById("root"));
```

### 5.1 DllPlugin

> 这里我们可以先将`react`、`react-dom`单独进行打包

单独打包创建`webpack.dll.js`

```javascript
const path = require("path");
const DllPlugin = require("webpack/lib/DllPlugin");

module.exports = {
  entry: ["react", "react-dom"],
  mode: "production",
  output: {
    filename: "react.dll.js",
    path: path.resolve(__dirname, "dll"),
    library: "react",
  },
  plugins: [
    new DllPlugin({
      name: "react",

      // 生成的第三方模块映射表，便于快速查找
      path: path.resolve(__dirname, "dll/manifest.json"),
    }),
  ],
};
```

执行`"webpack --config webpack.dll.js`命令，可以看到 dll 目录下创建了两个文件分别是`manifest.json`,`react.dll.js`

关系是这个酱紫的，到时候我们会通过`manifest.json`找到`react.dll.js`文件中的模块进行加载

### 5.2 DllReferencePlugin

在我们的项目中可以引用刚才打包好的动态链接库

```javascript
const DllReferencePlugin = require("webpack/lib/DllReferencePlugin");
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");

plugins: [
  // 构建时会引用动态链接库的内容
  new DllReferencePlugin({
    manifest: path.resolve(__dirname, "dll/manifest.json"),
  }),

  // 需要手动引入react.dll.js
  new AddAssetHtmlWebpackPlugin({
    filepath: path.resolve(__dirname, "dll/react.dll.js"),
  }),
];
```

使用 DllPlugin 可以大幅度提高构建速度

## 6.动态加载

实现点击后动态加载文件

```javascript
let btn = document.createElement("button");
btn.innerHTML = "点击加载视频";
btn.addEventListener("click", () => {
  import("./video").then((res) => {
    console.log(res.default);
  });
});
document.body.appendChild(btn);
```

给动态引入的文件增加名字

```javascript
output: {
  chunkFilename: "[name].min.js";
}

// 下面的注释是魔术字符串
import(/* webpackChunkName: "video" */ "./video").then((res) => {
  console.log(res.default);
});
```

> 这样打包后的结果最终的文件就是 `video.min.js`

## 7.打包文件分析工具

安装`webpack-bundle-analyzer`插件

```
npm install --save-dev webpack-bundle-analyzer
```

使用插件

```javascript
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

mode !== "development" && new BundleAnalyzerPlugin();
```

默认就会展现当前应用的分析图表

## 8.SplitChunks

> **注意：不要和动态链接库的配置一起写，会有冲突。一般动态链接库在开发模式下用，代码分割在生产模式下用。**

我们在来看下 SplitChunks 这个配置，他可以在编译时抽离第三方模块、公共模块

将项目配置成多入口文件

```javascript
entry:{
  a:'./src/a.js',
  b:'./src/b.js'
}
```

我们让 a,b 两个模块同时引用`jquery`, 别忘了去掉之前的`externals`配置

`SplitChunks`插件的默认配置

```javascript
optimization: {
	splitChunks: {
    chunks: 'async', // 分割异步模块。可选参数：inital 同步、async 异步、all 所有
    minSize: 30000, // 分割的文件最小大小，单位：字节
    maxSize: 0,
    minChunks: 1, // 引用次数
    maxAsyncRequests: 5, // 最大异步请求数，简单来说，不能用超过五个 script 加载
    maxInitialRequests: 3, // 最大初始化请求数
    automaticNameDelimiter: '~', // 抽离的命名分隔符
    automaticNameMaxLength: 30, // 名字最大长度
    name: true,

    /*
      缓存组：主要用于匹配抽离模块的位置。
      下面的 vendors 配置，如果在 node_modules 里找不到，就会去 default 里找
    */

    cacheGroups: {
      // 指定分割 react、react-dom
      react: {
        test: /[\\/]node_modules[\\/](react)|(react-dom)/,
        priority: 1 // 优先级
      }
      ,
      // 分割第三方
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10
      },

      // 再分割自定义模块
      default: {
        minChunks: 2, // 覆盖原来的配置，至少引用2次才分割
        priority: -20,
        reuseExistingChunk: true
      }
    }
  }
}
```

> 我们将`async`改为`initial`

我们在为每个文件动态导入`lodash`库,并且改成`async`

```javascript
import("lodash");
```

> 为每个入口引入`c.js`,并且改造配置文件

```javascript
splitChunks: {
  chunks: 'all',
  name: true,
  cacheGroups: {
    vendors: {
      test: /[\\/]node_modules[\\/]/,
      priority: -10
    },
    default: {
      minSize:1, // 不是第三方模块，被引入两次也会被抽离
      minChunks: 2,
      priority: -20,
    }
  }
}
```

> 这样再反过来看`chunks`的参数是不是就了然于胸啦！

## 9.热更新

模块热替换（HMR - Hot Module Replacement）是 webpack 提供的最有用的功能之一。它允许在运行时替换，添加，删除各种模块，而无需进行完全刷新重新加载整个页面

- 保留在完全重新加载页面时丢失的应用程序的状态
- 只更新改变的内容，以节省开发时间
- 调整样式更加快速，几乎等同于就在浏览器调试器中更改样式

启用热更新，默认样式可以支持热更新，如果不支持热更新则采用强制刷新

```javascript
devServer:{
  hot:true
}
new webpack.NamedModulesPlugin(),
```

让`js`支持热更新

```javascript
import sum from "./sum";
console.log(sum(1, 2));
if (module.hot) {
  // 如果支持热更新
  module.hot.accept(); // 当入口文件变化后重新执行当前入口文件
}
```

## 10.IgnorePlugin

忽略 `import`和`require`语法

```javascript
new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/);
```

## 11.费时分析

可以计算每一步模块执行的运行速度

```javascript
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");
const smw = new SpeedMeasureWebpackPlugin();

// 包裹所有配置
module.exports = smw.wrap({});
```

## 12.noParse

`module.noParse`，对类似 jq 这类依赖库，内部不会引用其他库，我们在打包的时候就没有必要去解析，这样能够增加打包速率

```javascript
noParse: /jquery/;
```

## 13.resolve

```javascript
resolve: {
  extensions: [".js",".jsx",".json",".css"],
  alias:{}, // 配置别名
  modules:['node_modules']
},
```

## 14.include/exclude

在使用`loader`时,可以指定哪些文件不通过`loader`,或者指定哪些文件通过`loader`

```javascript
{
  test: /\.js$/,
  use: "babel-loader",
  // include:path.resolve(__dirname,'src'),
  exclude:/node_modules/
},
```

## 15.多线程打包

多线程打包，我们可以将不同的逻辑交给不同的线程来处理。

> **注意：当项目比较大的时候使用比较和好，因为分配线程本身就需要消耗内存的，如果项目规模很小，一个线程就足够了，那么用更多的线程反而更加浪费。**

```bash
npm install --save-dev happypack
```

使用插件

```javascript
const HappyPack = require("happypack");

rules: [
  {
    test: /\.js$/,
    use: "happypack/loader?id=jsx",
  },

  {
    test: /\.less$/,
    use: "happypack/loader?id=styles",
  },
];

new HappyPack({
  id: "jsx",
  threads: 4,
  loaders: ["babel-loader"],
}),
  new HappyPack({
    id: "styles",
    threads: 2,
    loaders: ["style-loader", "css-loader", "less-loader"],
  });
```
