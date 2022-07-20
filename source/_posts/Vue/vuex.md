---
title: vuex的使用方法
date: 2019-11-04 01:01:45
categories:
  - Vue
  - 状态
tags: 实践
---

<div></div>

<!-- more -->

## 官方定义

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

## 注入 vuex

```javascript
import store from "./store";

new Vue({
  store,
});
```

`store.js`

```javascript
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    msg: "hello world",
  },
  mutations: {},
  actions: {},
});
```

## 获取状态

这样在任何一个组件里，都可以这样获取到这个 `msg`

```javascript
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h2>{{$store.state.msg}}</h2>
  </div>
</template>
```

## 修改状态

让 `mutations` 提供一个修改状态的方法

```javascript
mutations: {
  setMsg(state, newMsg) {
    state.msg = newMsg
  }
}
```

再让 `actions` 来提交修改的请求

```javascript
actions: {
  setMsg ({ commit }) {
    commit('setMsg', 'hello')
  }
}
```

修改的动作，在其它组件里去触发

```javascript
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h2>{{$store.state.msg}}</h2>
  </div>
</template>

<script>
export default {
  mounted () {
    this.$store.dispatch('setMsg')
  }
}
</script>
```

## 思考

上例属于简单的状态管理，`state` 在存放状态、`mutations` 提供了修改状态的方法、`actions` 负责触发修改状态的方法，并提交修改的数据；上例 `actions` 里是手动修改的数据，工作中应该是提交请求的数据。但是上例中有个明显的问题，谁都可以修改（`dispatch`）状态。

## 命名空间

如果项目足够复杂，那么可以使用 vuex 提供的命名空间来修改状态。使用的前提还需要使用 ` vuex` 的 `modules`。`modules`是个对象，其结构也是由`state`、 `mutations` 、`actions`组成。区别是它多了一个`namespaced` 属性，以此来使用命名空间。

## 修改状态的三种方法

### dispatch

先把原来写的内容提取到一个 `modules` 里

`store.js`

```javascript
import Vue from "vue";
import Vuex from "vuex";
import home from "./modules/home";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    home,
  },
});
```

`./modules/home.js`

```javascript
export default {
  namespaced: true,
  state: {
    msg: "hello world",
  },
  actions: {
    setMsg({ commit }) {
      commit("setMsg", "hello");
    },
  },
  mutations: {
    setMsg(state, newMsg) {
      state.msg = newMsg;
    },
  },
};
```

最后取状态和修改状态

```javascript
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h2>{{$store.state.home.msg}}</h2>
  </div>
</template>

<script>
export default {
  mounted () {
    this.$store.dispatch('home/setMsg')
  }
}
</script>
```

观察最后修改时和之前的不同，无非是取状态和修改状态都多了一层 `home` ，提高了一定的使用门槛。尽管这样，但至少可以识别操作的是哪个模块的状态。

上例再通过 `modules` 修改 状态还有另一种等价的写法

### mapActions

```javascript
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h2>{{$store.state.home.msg}}</h2>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('home', ['setMsg'])
  },
  mounted () {
    this.setMsg()
  }
}
</script>
```

`mapActions` 执行完后返回的是一个对象，通过扩展运算法展开后，会在当前实例里添加一个 setMsg 方法。调用这个方法就会触发状态的修改。

### createNamespacedHelpers

上面两个方法都有一个很明显的问题，如果在当前组件里，需要修改的状态有很多个。那么就意味着有很多层 `home`。通过 `vuex` 的 `createNamespacedHelpers` 方法，可以很友好的解决这个问题。

```javascript
<template>
  <div class='about'>
    <h1>This is an about page</h1>
    <h2>{{$store.state.home.msg}}</h2>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions } = createNamespacedHelpers('home')

export default {
  methods: {
    ...mapActions(['setMsg'])
  },
  mounted () {
    this.setMsg()
  }
}
</script>
```

## 简化取值

之前的例子一直没有提到取值的问题，实际工作中也不推荐那么去做；`vuex` 提供了一个 mapState 的方法，可以简化取值。

```javascript
<template>
  <div class='about'>
    <h1>This is an about page</h1>
    <h2>{{msg}}</h2>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
const { mapActions, mapState } = createNamespacedHelpers('home')

export default {
  computed: {
    ...mapState(['msg'])
  },
  methods: {
    ...mapActions(['setMsg'])
  },
  mounted () {
    this.setMsg()
  }
}
</script>
```

## 提取变量

回忆一下 `setMsg` 这个字眼出现的次数，在组件里使用出现过，在 `store` 或 `modules` 里出现过。这时提倡的做法，就是将这个 `setMsg` 提取出来，用一个常量保存；

`./store/action-type.js`

```javascript
export const SET_MSG = "setMsg";
```

使用的时候，尽量避免直接使用 `setMsg`，这样便于自己或其他人去维护。

## 总结

`vuex` 的便利性不言而喻，根据项目的复杂度，它提供了渐进增强的方案。当项目很简单时，不用 `modules` 就能解决基本需求。如果复杂度上升了，`modules` 自然是不二选择。如果模块儿的个数并不多，大可只用 `dispatch`。即便模块儿多了起来，`createNamespacedHelpers` 也为后续工作铺好了路。
