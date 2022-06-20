---
title: ES6基础
date: 2021-03-24 10:31:32
categories:
  - ECMAScript
tags: ECMAScript
---

<div></div>

<!-- more -->

## let

### 特点

- 不会污染全局变量
- 配合花括号，可以产生块级作用域
- 暂存死区，例如：

```javascript
let a = 1;
{
  console.log(a);
  let a = 2;
}
```

> 打印的结果表明 a 未定义，因为对于块级作用域来说，已经用 let 声明了一个 a，所以它不会去往上找。但是对于打印语句来说，它并不知道 a 已经被声明了，即所谓的暂存死区。

## Symbol

### 特点

- 具备元编程能力：可以对原生 js 的操作进行修改
- 是个独一无二的基本数据类型

```javascript
let s1 = Symbol();
let s2 = Symbol();
console.log(s1 === s2); // false
```

- 增加标识（一般放 number 、 string）

```javascript
let s1 = Symbol("jiangwen");
```

- 作为属性的 key 时，这个 key 是不可枚举的（可以通过 Object.getOwnPropertySymbols 方法，拿到所在对象的所有 Symbol 类型的属性集合）
- 通过 for 方法声明的 Symbol 是一样的
  - 通过 for 方法声明时穿进去的值，可以通过 keyFor 取到

```javascript
let s5 = Symbol.for("jiangwen");
let s6 = Symbol.for("jiangwen"); // 此次赋值，由于此次用 for 声明的 Symbol 在上面已经声明过一次了，所以这次的赋值是用的上面那个

console.log(s5 === s6, Symbol.keyFor(s5)); // true 'jiangwen'
```

### 应用

#### 对象的遍历

```javascript
function arg() {
  // Symbol.iterator可以被迭代的方法
  let arr = [
    ...{
      0: 1,
      1: 2,
      2: 3,
      3: 4,
      length: 4,
      [Symbol.iterator]: function () {
        let index = 0;
        return {
          next: () => {
            return { done: this.length == index, value: this[index++] };
          },
        };
      },
    },
  ];
  console.log(arr);
}

arg(1, 2, 3); // [1, 2, 3]
```

#### 是否展开拼接

```javascript
let arr = [1, 2, 3];
arr[Symbol.isConcatSpreadable] = false;

console.log([].concat(arr, [1, 2, 3])); // [ [ 1, 2, 3, [Symbol(Symbol.isConcatSpreadable)]: false ], 1, 2, 3 ]
```

#### 修改匹配结果

```javascript
let obj = {
  [Symbol.match](value) {
    return value.length === 3;
  },
};

console.log("abc".match(obj)); // true
```

> 类似  split search 等方法也可以这么做

#### 设置衍生对象

```javascript
class MyArray extends Array {
  constructor(...args) {
    super(...args);
  }
  static get [Symbol.species]() {
    return Array;
  }
}

let v = new MyArray(1, 2, 3);
let c = v.map((item) => (item *= 2));

console.log(c instanceof MyArray); // false
```

> 上面的 c 是 v 的衍生对象，不做任何处理时，c 应该是 MyArray 的一个实例。上面第五行的方法，修改了这个衍生对象，指向了 Array，c 就被作为了 Array 的一个实例对象。

#### 修改类型转换行为

```javascript
let obj = {
  [Symbol.toPrimitive](type) {
    console.log(type);
    return 123;
  },
};

console.log(obj + ""); // 123
```

#### 自定义数据类型

```javascript
let obj = {
  [Symbol.toStringTag]: "xxx",
};

console.log(Object.prototype.toString.call(obj)); // [object xxx]
```

#### 查看不在作用域内的方法或属性

```javascript
let arr = [];
with (arr) {
  console.log(find);
}
```

> 上面通过 with 语法，可以直接在其花括号内，直接去取穿进去的对象上的方法；比如 find 方法，不用 with 就必须用 arr.find 去使用，用了的话就像上面这样直接取，在当前 with 中的作用域内取。但存在在作用域内取不到的方法或属性。这个时候就可以通过 Symbol 的一个属性查看到。

```javascript
let arr = [];
console.log(arr[Symbol.unscopables]); // 打印所有不在作用域内的方法或属性

with (arr) {
  console.log(find);
}
```

## 特殊语法

```javascript
let a = 1;
let obj = {
  [a]: 1, // 把 a 作为一个字符串的 key
};

console.log(obj[a]); // 取的时候就只能这么取
```

## Set、Map、WeakMap

### Set

#### 特点

- 传进去的数组，会做一个去重处理；但是返回的是一个类数组对象

```javascript
let arr = [1, 2, 3, 4, 5, 1, 2];
let s = new Set(arr); // set {1, 2, 3, 4, 5}

console.log([...s]); // 通过扩展运算符，得到一个新数组 [1, 2, 3, 4, 5]
```

#### 应用

##### 并集

```javascript
let arr1 = [1, 2, 3, 1, 2];
let arr2 = [3, 4, 5, 3, 1];

function union() {
  let s1 = new Set([...arr1, ...arr2]); // [1,2,3,4,5]
  let all = [...s1];
  return all;
}
```

##### 交集

```javascript
let arr1 = [1, 2, 3, 1, 2];
let arr2 = [3, 4, 5, 3, 1];

function inserction() {
  let s1 = new Set(arr1);
  let s2 = new Set(arr2);
  return [...s1].filter(function (a) {
    return s2.has(a);
  });
}
```

##### 差集

```javascript
let arr1 = [1, 2, 3, 1, 2];
let arr2 = [3, 4, 5, 3, 1];

function diff() {
  let s1 = new Set(arr1);
  let s2 = new Set(arr2);
  return [...s2].filter(function (a) {
    return !s1.has(a);
  });
}
```

### Map

#### 特点

- 接受一个二维数组参数
  - 二维数组的每一项数组元素，有两个；第一个是 key ，第二个是 value

```javascript
// map的key可以是任意类型
// let map = new Map([['name','zf'],['age','9'],['age','100']]); weakMap
class A {}
let a = new A();
let map = new Map();
map.set(a, 1);
a = null; // a没有被释放掉
```

> Map 属于强链接，与之对应的 WeakMap 属于弱连接，它们的用法一样，但区别是：
>
> - 在把一个对象当成 key 的时候，如果这个对象被赋值为 null，试图销毁。Map 不会释放这个对象，间接就可能导致内存泄露。而 WeakMap 会释放掉，节约了内存消耗。
> - Map 的 key 可以是任意数据类型， 但是 WeakMap 的 key 必须是对象

### 深拷贝

> 深拷贝的实现主要就是遍历加递归，但处理这些之前，必须对一些特殊的值做处理；比如 null、正则对象、日期对象等，因为这样的值是不需要遍历的，需要直接返回。

```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj == null) return obj;
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Date) return new Date(obj);
  // ...
  if (typeof obj !== "object") return obj;
  if (hash.has(obj)) return hash.get(obj); // 如果当前的 WeakMap 上存过了一次，就直接取。避免循环引用
  let instance = new obj.constructor();
  hash.set(obj, instance); // 将当前对象存到 WeakMap 上
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 判断是不是当前对象上的方法，避免拷贝原型上的方法
      instance[key] = deepClone(obj[key], hash); // 如果是对象就继续深拷贝，并把当前的 WeakMap 作为下一次调用时的 hash 表
    }
  }
  return instance;
}
```

>
