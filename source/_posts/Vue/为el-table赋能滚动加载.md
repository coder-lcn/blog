---
title: 为el-table赋能滚动加载
date: 2022-06-24 14:22:43
categories:
  - Vue
tags: 实践
---

<div></div>

<!-- more -->

## 背景

### 版本介绍

- element-plus 2.2.5
- vue 3.2.37

### 前提

这个赋能，必须是在设置了 `el-table` 的高度的情况下实现（固定表头）。整个页面的滚动加载，和表格就无关了。

### 核心 API

`IntersectionObserver`

参考资料：https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html

## 实现思路

- 监听表格内的滚动事件
- 在滚动的过程中，实时监听表格的最后一行元素，是否在可视区域内
- 通过缓存监听实例和监听对象，防止滚动期间的重复监听
- 当监听对象在可视区域内，就触发 `loadmore` 方法

### 完整代码

```typescript
<script lang="ts" setup>
import { onMounted, ref } from "vue";

interface Props {
  height?: number | string;
  onLoadMore?: () => Promise<void>;
}

const { onLoadMore } = defineProps<Props>();

const table = ref(null);
let intersectionObserver: IntersectionObserver | null = null;
let lastChild: HTMLElement | null = null;

const observer = (dom: HTMLElement) => {
  if (!dom) return;
  if (lastChild === dom) return; // 当前正在监听这个 dom 了
  if (intersectionObserver) intersectionObserver.disconnect(); // 当表格数据变化，最后一个 dom 变了时。断开上一次的监听。

  lastChild = dom;

  intersectionObserver = new IntersectionObserver(async (entries) => {
    if (entries[0].intersectionRatio <= 0) return; // 如果不可见，就返回
    onLoadMore!();
  });

  intersectionObserver.observe(dom);
};

const registerScrollEvent = () => {
  const target = table.value as any;
  const scrollContainer = target.$refs.tableWrapper.querySelector(".el-scrollbar__wrap") as HTMLElement;
  const tbody = target.$refs.tableBody.querySelector("tbody") as HTMLElement;

  scrollContainer.addEventListener("scroll", function (e) {
    observer(tbody.lastElementChild as HTMLElement);
  });
};

onMounted(() => {
  onLoadMore && registerScrollEvent();
});
</script>

<template>
  <el-table ref="table" :height="height ? height : 'auto'">
    <el-table-column />
  </el-table>
</template>
```

### 使用

```typescript
<script lang="ts" setup>
const onLoadMore = () => {
  console.log('加载更多');
}
</script>


<Table :onLoadMore="onLoadMore" height="1000px" />
```
