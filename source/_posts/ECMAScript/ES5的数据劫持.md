---
title: ES5的数据劫持
date: 2021-03-26 13:42:52
categories:
  - ECMAScript
  - es5
tags: ECMAScript
---

<div></div>

<!-- more -->

## 数据属性与访问器属性

### 数据属性

```javascript
let obj = {};
obj.a = 100;

Object.defineProperty(obj, "a", {
  enumerable: true, // 是否可枚举
  configurable: true, // 是否可删除
  writable: true, // 是否可以设置值
  value: 1, // 默认设置属性值
});

console.log(obj.a); // 1
```

### 访问器属性

```javascript
let obj = {};
let a = 100;

Object.defineProperty(obj, "a", {
  enumerable: true,
  configurable: true,
  get() {
    return a;
  },
  set(val) {
    a = val;
  },
});

obj.a = 200;

console.log(obj.a);
```

> 和数据属性的区别，就是少了两个配置属性，多了两个配置方法。这就是访问器属性，可以通过 set 方法做一些数据的监听，比较常用。

### 用访问器实现数据劫持

```javascript
let obj = [1, 2, 3];
let proto = Object.create(Array.prototype);
["pop", "push", "shift", "unshift", "reverse", "sort", "splice"].forEach(
  (method) => {
    proto[method] = function () {
      update(); // 更新
      let old = Array.prototype[method];
      return old.call(this, ...arguments); // 调用原来原型上的方法
    };
  }
);

function update() {
  console.log("更新视图");
}

function observer(obj) {
  if (Array.isArray(obj)) {
    return (obj.__proto__ = proto);
  }
  if (typeof obj !== "object") return obj;
  for (let key in obj) {
    defineReactive(obj, key, obj[key]);
  }
}

function defineReactive(obj, key, value) {
  // 数据劫持 深度劫持
  observer(value); // 如果是对象继续定义getter和setter
  Object.defineProperty(obj, key, {
    get() {
      // 在get中收集
      return value;
    },
    set(newValue) {
      if (typeof newValue === "object") {
        observer(newValue);
      }
      update();
      value = newValue;
    },
  });
}
observer(obj);
obj.push(4);
console.log(obj);
```
