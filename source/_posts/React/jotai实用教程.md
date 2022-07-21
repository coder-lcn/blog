---
title: jotai实用教程
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
    set(UpperMsg, newValue);
  }
);
```

像这样定义好后，上面的 `setUpperMsg` 就可以生效了。不过因为 `UpperMsg` 依赖了 `msg`，只要 `msg` 变了，还是会先 `toUpperCase` 一下。所以在定义 `writable` 时，最好确认清楚，后续的 `UpperMsg` 不会因为 `msg` 的变化而变化。

如果只是在第一次 `get` 时需要依赖 `msg` 的话，后面还是自己去 `set`，可以使用更便捷的工具方法

```typescript
import { atomWithDefault } from "jotai/utils";

const msg = atom("");
const UpperMsg = atomWithDefault((get) => get(msg).toUpperCase());
```

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

如果有多个异步的 `atom`，可以支持所有的异步 `atom` 取值完成

```typescript
import { waitForAll } from "jotai/utils";

const dogsAtom = atom(async (get) => {
  const response = await fetch("/dogs");
  return await response.json();
});

const catsAtom = atom(async (get) => {
  const response = await fetch("/cats");
  return await response.json();
});

const App = () => {
  const [dogs, cats] = useAtomValue(waitForAll([dogsAtom, catsAtom]));
};
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

如果希望手动的去管理这种状态，可以使用 `jotai/utils` 提供的 `loadable` 来处理

```typescript
import { loadable } from "jotai/utils"

const asyncAtom = atom(async (get) => ...)
const loadableAtom = loadable(asyncAtom)

// 不需要再用 <Suspense> 来包裹了
const Component = () => {
  const value = useAtom(loadableAtom)

  if (value.state === 'hasError') return <Text>{value.error}</Text>

  if (value.state === 'loading') {
    return <Text>Loading...</Text>
  }

  console.log(value.data) // 最终数据
  return <Text>Value: {value.data}</Text>
}
```

### 持久化

在官方提供的 `jotai/utils` 里，提供了相应持久化的处理方案，例如存到 `localStorage` 里的 `hook`

```typescript
import { atomWithStorage } from "jotai/utils";
const msg = atomWithStorage("msg", "");
```

### reducer

```typescript
import { atom } from "jotai";
import { useReducerAtom } from "jotai/utils";

const countReducer = (prev, action) => {
  if (action.type === "inc") return prev + 1;
  if (action.type === "dec") return prev - 1;
  throw new Error("unknown action type");
};

const countAtom = atom(0);

const Counter = () => {
  const [count, dispatch] = useReducerAtom(countAtom, countReducer);
  return (
    <div>
      {count}
      <button onClick={() => dispatch({ type: "inc" })}>+1</button>
      <button onClick={() => dispatch({ type: "dec" })}>-1</button>
    </div>
  );
};
```

### 分裂 atom

当在处理一个 `list`，并且 `list` 里每一项都是个 `atom` 时，对这个列表的读取和修改的场景，这个功能就显得非常实用，官方 `demo` 如下：

```typescript
import { Provider, atom, useAtom, PrimitiveAtom } from "jotai";
import { splitAtom } from "jotai/utils";

const initialState = [
  {
    task: "help the town",
    done: false,
  },
  {
    task: "feed the dragon",
    done: false,
  },
];

const todosAtom = atom(initialState);
// 分裂出新的 atom list
const todoAtomsAtom = splitAtom(todosAtom);

type TodoType = typeof initialState[number];

const TodoItem = ({
  todoAtom,
  remove,
}: {
  todoAtom: PrimitiveAtom<TodoType>;
  remove: () => void;
}) => {
  const [todo, setTodo] = useAtom(todoAtom);
  return (
    <div>
      <input
        value={todo.task}
        onChange={(e) => {
          setTodo((oldValue) => ({ ...oldValue, task: e.target.value }));
        }}
      />
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => {
          setTodo((oldValue) => ({ ...oldValue, done: !oldValue.done }));
        }}
      />
      <button onClick={remove}>remove</button>
    </div>
  );
};

const TodoList = () => {
  // 下面 dispatch 的行为，就是 aplitAtom 赋能的，除了 remove，还有 insert 和 move */
  const [todoAtoms, dispatch] = useAtom(todoAtomsAtom);

  return (
    <ul>
      {todoAtoms.map((todoAtom) => (
        <TodoItem
          todoAtom={todoAtom}
          remove={() => dispatch({ type: "remove", atom: todoAtom })}
        />
      ))}
    </ul>
  );
};

const App = () => (
  <Provider>
    <TodoList />
  </Provider>
);

export default App;
```

## 实现原理

`atom` 里，每次调用会针对一个值，生成一个配置对象。结合 `weakMap` 建立一个引用关系，useAtom 内部还是依赖 `useState` 实现的，不同的是在定义值的时候，先使用 `weakMap` 拿到引用的 `atom` 的值，然后把相应的 `setState` 捆绑到对应的 `weakMap` 上。在修改值的时候，会先修改 weakMap 上的引用值，然后把捆绑上的所有 `setState` 循环执行一遍。

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
