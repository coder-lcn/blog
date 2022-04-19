---
title: ejs 原理实现
date: 2019-10-30 04:43:05
categories: 前端
tags: JavaScript
---

模板引擎是前端框架都会实现的技术，作为最早在前端框架中流行起来的模板引起，它的实现原理是怎样的呢？

<!-- more -->

### html 模板

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body>
    <% arr.forEach(item => { %>
    <li><%=item%></li>
    <% }) %>
  </body>
</html>
```

### 使用

```javascript
let fs = require("fs");
let ejs = require("ejs");

let template = fs.readFileSync("上面的模板路径", "utf8");
ejs.render(template, { arr: [1, 2, 3] });
```

### 渲染结果

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body>
    <li>1</li>

    <li>2</li>

    <li>3</li>
  </body>
</html>
```

### 思路分析

- 根据 "<%" 或者 "%>"，代码可以分为三个部分
  - <%前面的 html 代码
  - <% 到 %> 之间的 js 代码
  - %>后面的 html 代码
- 处理逻辑
  - 处理 <% js 代码 %> 之间的代码
    - 将 <% 和 %>之间的 js 代码取出来
    - 再把提取出来的 js 代码用一个函数包起来（这里 arr 变量的使用，靠 with 语法实现）
    - 接着将这个函数，通过 new Function 的形式去声明并调用
  - 处理 <%= item %>，即取值的情况
    - 将匹配到的结果，用模板字符串的 ${} 包起来

---

**_with 语法：_**

```html
let obj = { name: 1 } //
传入一个对象，花括号里面可以直接使用这个对象的属性，而不需要用点去调用
with(obj){ console.log(name) }
```

·

### 模拟实现

```javascript
function render(template, obj) {
  let html = "let str = '';\r\n";
  html += "with(obj){\r\n";
  html += "str += `";

  let content = template.replace(/<%([\s\S]+?)%>/g, (souceCode, targetCode) => {
    return "`\r\n" + targetCode + "\r\nstr+=`";
  });

  template = template.replace(/<%=([\s\S]+?)%>/g, (souceCode, targetCode) => {
    return "${" + targetCode + "}";
  });

  let result = html + content + "`}\r\n return str";
  let fn = new Function("obj", result);
  return fn(obj);
}
```
