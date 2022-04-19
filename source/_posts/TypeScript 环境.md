---
title: TypeScript 环境
toc: true
date: 2019-11-2 19:47:48
categories: 程序员
tags: TypeScript
---

纯 ts 开发配置和前端框架配合 ts 的方法

<!-- more -->

## 配置 TS 环境到 webpack

### 使用 ts-loader

使用`ts`需要安装`ts`相关配置

```bash
npm install typescript ts-loader --save-dev
```

生成`ts`的配置文件

```bash
npx tsc --init
```

配置`ts-loader`

```javascript
{
    test:/\.tsx?/,
    use: ['ts-loader'],
    exclude: /node_modules/
}
```

将入口文件更改成`ts`文件

```javascript
let a: string = "hello";
console.log(a);
```

执行`npm run dev`发现已经可以正常的解析`ts`文件啦！

### 使用 preset-typescript

不需要借助`typescript`

```bash
npm install @babel/preset-typescript
```

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 2
      }
    ],
    "@babel/preset-react",
    [
      "@babel/preset-typescript",
      {
        "allExtensions": true
      }
    ]
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    "@babel/plugin-transform-runtime"
  ]
}
```

## 配置 ts+react 环境

安装`react`相关模块

```bash
npm i @babel/preset-react --save # 解析jsx语法
npm i react @types/react @types/react-dom react react-dom typescript
```

```typescript
import React from "react";
import ReactDOM from "react-dom";
const state = { number: 0 };
type State = Readonly<typeof state>;
class Counter extends React.Component<object, State> {
  state: State = state;
  handleClick = () => {
    this.setState({ number: this.state.number + 1 });
  };
  render() {
    const { number } = this.state;
    return (
      <div>
        <button onClick={this.handleClick}>点击</button>
        {number}
      </div>
    );
  }
}
ReactDOM.render(<Counter></Counter>, document.getElementById("root"));
```

## 配置 ts+vue 环境

安装`vue`所需要的模块

```
npm install vue-loader  vue-template-compiler --save-dev
npm install vue vue-property-decorator
```

配置`ts-loader`

```javascript
{
    test: /\.tsx?/,
    use: {
        loader:'ts-loader',
        options: {
            appendTsSuffixTo: [/\.vue$/],
        },
    },
    exclude: /node_modules/
}
```

使用`vue-loader`插件

```javascript
const VueLoaderPlugin = require("vue-loader/lib/plugin");
new VueLoaderPlugin();
```

配置解析`.vue`文件

```javascript
{
    test:/\.vue$/,
    use:'vue-loader'
}
```

增加`vue-shims.d.ts`，可以识别`.vue`文件

```
declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
```

`index.tsx`文件

```javascript
import Vue from "vue";
import App from "./App.vue";
let vm = new Vue({
  render: (h) => h(App),
}).$mount("#root");
```

`App.vue文件`

```html
<template>
  <div>
    <div v-for="(todo,index) in todos" :key="index">{{todo}}</div>
  </div>
</template>
<script lang="ts">
  import { Component, Vue } from "vue-property-decorator";
  @Component
  export default class Todo extends Vue {
    public todos = ["香蕉", "苹果", "橘子"];
  }
</script>
```
