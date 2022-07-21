---
title: jotai使用教程
date: 2022-07-20 17:29:20
categories:
  - React
  - 状态
tags: 实践
---

<div></div>

<!-- more -->

## 简介

`Jotai` 采用由 `Recoil` 启发的原子模型，采用自下而上的方法进行 `React` 状态管理。可以通过组合原子来构建状态，并且渲染基于原子依赖性进行优化。这解决了 `React` 上下文的额外重新渲染问题，并消除了对 `memoization` 技术的需求「摘录官网」

## hello world

```typescript
import { atom, useAtom } from "jotai";

const count = atom(0);

const HelloWorld = () => {
  const [value] = useAtom(count);
  return <div>{value}</div>;
};

const Controller = () => {
  const [_, setCount] = useAtom(count);
  return <button onClick={() => setCount((pre) => pre + 1)}>+</button>;
};

const App = () => {
  return (
    <div>
      <HelloWorld />
      <Controller />
    </div>
  );
};
```

通过 `atom` 方法的调用结果，可以通过 `useAtom` 来拿到相应的状态和修改状态的方法。并且状态都是**同步更新**的

除了这两个 `hook`，官方还提供了 `useAtomValue` 和 `useSetAtom` 的便于取值和改值的 `hook` 来辅助处理

## 进阶

### 依赖追踪

实际业务场景中，通常会依赖某个状态的值，来产生一个新的状态。比如存在一个控制字符串的 `atom`，需要一个新的 `atom` 将其转换成大写，又不影响原来的使用。在 `React` 中，通常使用 `useMemo` 来解决，使用 `jotai` 可以：

```typescript
const msg = atom("");
const UpperMsg = atom((get) => get(msg).toUpperCase());
```

`atom` 内部可以互相去取值，取的 `atom` 发生变化时，相应的使用到的 `atom` 也会变。此时 `UpperMsg` 是通过依赖某个 `atom` 来取值的，如果要 `set`，像这样是行不通的：

```typescript
const App = () => {
  const [upperMsg, setUpperMsg] = useAtom(upperMsg);

  const onClick = () => {
    // error: not writable atom
    setUpperMsg("hello");
  };
};
```

如果想要继续 `set`，需要在 `get` 之后定义 `writable`，像这样

```typescript
const msg = atom("");

const UpperMsg = atom(
  (get) => get(msg).toUpperCase(),
  (get, set, newValue) => {
    set(setUpperMsg, newValue);
  }
);
```

像这样定义好后，上面的 `setUpperMsg` 就可以生效了。不过因为 `UpperMsg` 依赖了 `msg`，只要 `msg` 变了，还是会先 `toUpperCase` 一下。所以在定义 `writable` 时，最好确认清楚，后续的 `UpperMsg` 不会因为 `msg` 的变化而变化。

### 异步调用

```typescript
const userInfo = () => fetch("/api/userInfo");
const userInfoAtom = atom(userInfo);
```

`atom` 传入的是一个 `Promise` 函数时，它会等这个函数执行完，然后变更状态。等价写法还可以这么做：

```typescript
const userInfoAtom = atom(async () => {
  const data = await fetch("/api/userInfo");
  return data;
});
```

### Suspense 支持

`jotai` 在支持异步的 `atom` 时，会在异步处理期间，自动触发 `React` 的 `Suspense` 加载机制，如下：

```typescript
import { atom, useAtomValue } from "jotai";

const userInfoAtom = atom(async () => {
  const data = await fetch("/api/userInfo");
  return data;
});

const App = () => {
  const userInfo = useAtomValue(userInfoAtom);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>展示用户数据</div>
    </Suspense>
  );
};
```

上例中， `userInfoAtom` 是一个异步行为，在 `userInfo` 拿到请求后的值之前，就会一直展示 `fallback` 里的元素，更加智能化。

### 持久化

在官方提供的 `jotai/utils` 里，提供了相应持久化的处理方案，例如存到 `localStorage` 里的 `hook`

```typescript
import { atomWithStorage } from "jotai/utils";
const msg = atomWithStorage("msg", "");
```

## 实现原理

`atom` 里，每次调用会针对一个值，生成一个配置对象。结合 `weakMap` 建立一个索引关系，useAtom 内部还是依赖 `useState` 实现的，不同的是在定义值的时候，先使用 `weakMap` 拿到索引的 `atom` 的值，然后把相应的 `setState` 捆绑到对应的 `weakMap` 上。在修改值的时候，会先修改 weakMap 上的索引值，然后把捆绑上的所有 `setState` 循环执行一遍。

官方源码示例「初版」：

```typescript
import { useState, useEffect } from "react";

// atom function returns a config object which contains initial value
export const atom = (initialValue) => ({ init: initialValue });

// we need to keep track of the state of the atom.
// we are using weakmap to avoid memory leaks
const atomStateMap = new WeakMap();
const getAtomState = (atom) => {
  let atomState = atomStateMap.get(atom);
  if (!atomState) {
    atomState = { value: atom.init, listeners: new Set() };
    atomStateMap.set(atom, atomState);
  }
  return atomState;
};

// useAtom hook returns a tuple of the current value
// and a function to update the atom's value
export const useAtom = (atom) => {
  const atomState = getAtomState(atom);
  const [value, setValue] = useState(atomState.value);
  useEffect(() => {
    const callback = () => setValue(atomState.value);

    // same atom can be used at multiple components, so we need to
    // keep listening for atom's state change till component is mounted.
    atomState.listeners.add(callback);
    callback();
    return () => atomState.listeners.delete(callback);
  }, [atomState]);

  const setAtom = (nextValue) => {
    atomState.value = nextValue;

    // let all the subscribed components know that the atom's state has changed
    atomState.listeners.forEach((l) => l());
  };

  return [value, setAtom];
};
```

## 总结

`jotai` 是一个摆脱了 `React` 上下文的状态管理工具，不同于以往的工具过于笨重。它让组件间的状态管理，不再依赖于组件层级的关系。而是穿插了一个中间的 `weakMap` 来统一协调处理。`get` 和 `set` 非常方便，使用门槛低，同时对 `ts` 的支持也很好。是个很值得在项目里面使用的库。
