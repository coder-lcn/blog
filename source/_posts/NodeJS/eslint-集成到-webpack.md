---
title: eslint 集成到 webpack
toc: true
date: 2019-10-19 22:22:01
categories:
  - NodeJS
tags: NodeJS
---

eslint 的语法校验功能，已经成了很多框架为了做好规范的必备工具，来看看它在 webpack 中是怎么用的。

<!-- more -->

## 安装依赖

```
npm install eslint -D
```

如果需要支持 `es6` 语法

```js
npm install babel-eslint -D
```

## eslint 配置

```json
{
  "parser": "babel-eslint", // 支持解析 es6 语法校验
  "rules": {
    "semi": [
      // 结尾分号控制
      "error",
      "always" // 必须加分号
    ],
    "quotes": [
      // 引号控制
      "error",
      "single" // 必须是单引号
    ]
  }
}
```

## webpack 配置

```js
{
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: 'eslint-loader',
        include: resolve('src'),
        exclude: resolve('node_modules')
      }
    ]
  },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        options: {
          eslint: {
            configFile: resolve('.eslintrc.json'),
            failOnWarning: true, // eslint 报 warning 就停止 webpack 编译
            failOnError: false, // eslint 报 error 就停止 webpack 编译
            cache: true // 开启缓存，加快编译速度
          }
        }
      })
    ]
}
```

## 小结

webpack 在配置 eslint-loader 的时候，有一个 `inforce: 'pre'` 的配置项。这个和 webpack 的 loader 的执行顺序有关，关于这个就是另一个话题了。

<!-- 555 -->
