---
title: 菜单路由到tab路由的功能设计
date: 2022-06-27 14:49:55
categories:
  - Vue
  - 路由
tags: 实践
---

<div></div>

<!-- more -->

## 背景

一个管理后台，通常侧边栏都是菜单路由的形式。此时如果要给路由页面，添加 `tab` 形式的路由，来方便做页面间的切换和关闭，同时需要保存着页面的状态，应该如何做？以 `vue3 + vue-router` 为核心依赖，来介绍落地过程。

## 功能分析

### Tabs 组件

编写一个 `Tabs` 的组件，该组件需要具备的功能：

- 维护一个数组，记录打开过的路由，并遍历渲染到 `Tab` 上
- 每个 `Tab` 可以切换路由和关闭 tab，并实时记录当前打开的路由
- 当页面刷新时，维护的数组里，只记录当前页面的路由

### 状态

最后页面状态的保留，使用 `vue-router` 的 `keep-alive` 就好

## 具体代码

```typescript
<script lang="ts" setup>
import { reactive, onMounted, defineProps } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

interface IState {
  routers: { label: string; pathname: string }[];
  fullPath: string;
  deleteAble: Boolean;
}

const { fullPath } = useRoute();
const router = useRouter();
const state = reactive<IState>({ routers: [], fullPath, deleteAble: false });

const getRouter = (path: string) => {
  const target = /* 从路由配置里，结合 path 参数 find 出相应的配置 */

  if (target) {
    return { label: target.name, pathname: target.pathName };
  } else {
    console.warn(`初始化 tab 路由失败，找不到 ${fullPath} 路径的路由配置`);
    return false;
  }
};

const initRouters = () => {
  const firstRoute = getRouter(fullPath);

  if (firstRoute) {
    state.routers.push(firstRoute);
  } else {
    console.warn(`初始化 tab 路由失败，找不到 ${fullPath} 路径的路由配置`);
  }
};

const close = (path: string, event: MouseEvent) => {
  event.preventDefault();
  const index = state.routers.findIndex((item) => item.pathname === path);

  if (index === -1) {
    console.warn(`关闭[${path}]路由失败`, state.routers);
  } else {
    state.routers.splice(index, 1);
    state.deleteAble = state.routers.length > 1;

    const closeEle = event.target as HTMLSpanElement;
    const parent = closeEle.parentNode as HTMLAnchorElement;
    // vue-router 的 router-link 组件独有的样式类处理
    const isActive = parent.classList.contains('router-link-active');

    // 如果关闭的路由，是当前已经激活的路由页面。就 replace 到 state.routers 里的最后一个路由上
    if (isActive) {
      router.replace(state.routers[state.routers.length - 1].pathname);
    }
  }
};

onBeforeRouteUpdate((route) => {
  state.fullPath = route.fullPath;
  const newRouter = getRouter(route.fullPath);

  if (newRouter) {
    const isExist = state.routers.some((item) => item.pathname === newRouter.pathname);

    if (isExist === false) {
      state.routers.push(newRouter);
      state.deleteAble = true;
    }
  } else {
    console.warn(`更新 tab 路由失败，找不到 ${fullPath} 路径的路由配置`);
  }
});

onMounted(() => {
  initRouters();
});
</script>

<template>
  <div class="tabs-container">
    <router-link
      v-for="item in state.routers"
      :class="['tab', state.deleteAble ? 'delete-able' : '']"
      :to="{ path: item.pathname }"
    >
      {{ item.label }}
      <span v-if="state.deleteAble" @click="close(item.pathname, $event)">x</span>
    </router-link>
  </div>
</template>

<style scoped>
.tabs-container {
  background-color: #fff;
  overflow: auto hidden;
  border-bottom: 1px solid #ddd;
  white-space: nowrap;
}

.tab {
  padding: 20px;
  text-decoration: none;
  background-color: #56f48166;
  font-size: 14px;
  line-height: 40px;
  color: #000;
}

.tab.delete-able {
  padding-right: 0;
}

.tab span {
  display: inline-block;
  padding: 0 10px;
  transition: all 0.1s linear;
  transform: scale(1) translate(0, -1px);
}

.tab span:hover {
  transform: scale(1.6) translate(0, -1px);
}

.tab + .tab {
  border-left: 1px solid #fff;
}

.tab.router-link-active {
  background-color: #56f481f0;
}
</style>

```

最后将 `Tabs` 组件放置到对应的 `view-router` 之上就好。
