---
title: vue静态文件分析
date: 2022-06-16 23:33:03
categories:
  - Vue
  - 路由
tags: webpack
---

<div></div>

<!-- more -->

## 背景

针对 `vue` 文件内容的静态分析，可以帮助我们解决一些，在运行时很难办到的事情。比如

- 自动导入
- 语法检测
- 组件内容读取
  ...等等

## 配置

以 `vue2.x` 的 `vue.config.js` 为例，配置一个自定义的 `loader`：

```javascript
module.exports = {
  // ...
  resolveLoader: {
    modules: ["node_modules", "./loader/"], // 在 `./loader` 目录中去解析 `loader`
  },
  chainWebpack(config) {
    config.module
      .rule("vue")
      .use("statistics-api-loader")
      .loader("statistics-api-loader") // 把 statistics-api-loader.js 文件导出的函数，作为 loader 执行
      .end();
  },
  // ...
};
```

`./loader/statistics-api-loader.js` 内容

```javascript
module.exports = (code) => {
  // do something
  return code;
};
```

## 实践

### 自动引入

以自动引入为例，比如只要是 `vue` 组件，都希望它可以自动引入一个工具方法，在组件内可以直接使用 `utils` 对象来调用方法。

`utils.js`

```javascript
export const utils = {
  add(a, b) {
    return a + b;
  },
};
```

### 修改 `loader`

```javascript
module.exports = (code) => {
  // 1、匹配 script 标签
  // 2、在 script 标签后面，插入一句 `import { utils } from './utils.js'`
  // 3、组合好原有的代码，即可完成自动引入
  return code;
};
```
