---
title: ES6的数据劫持
date: 2021-03-26 13:42:52
categories:
  - ECMAScript
tags: ECMAScript
---

<div></div>

<!-- more -->

```javascript
let obj = [[1, 2, 3]];
function update() {
  console.log("数据更新");
}

let handler = {
  set(target, key, value) {
    if (key === "length") return true;
    update();
    return Reflect.set(target, key, value);
  },
  get(target, key) {
    // 如果当前对象是object 继续做代理 ，返回当前这个对象的代理
    if (typeof target[key] === "object") {
      return new Proxy(target[key], handler);
    }
    return Reflect.get(target, key);
  },
};
let proxyObj = new Proxy(obj, handler);
proxyObj[0].push(123);

console.log(obj);
```
