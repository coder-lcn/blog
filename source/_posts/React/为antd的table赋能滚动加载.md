---
title: 为antd的table赋能滚动加载
date: 2022-07-04 14:16:05
categories:
  - React
tags: 实践
---

<div></div>

<!-- more -->

## 背景

### 版本介绍

- antd 4.19.5
- react 17.0.0

### 前提

这个赋能，必须是在设置了 `Table` 的 `scroll={y: xxx}` 的情况下实现（固定表头）。整个页面的滚动加载，和表格就无关了。

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
import { DependencyList, useCallback, useEffect, useRef } from "react";

export const useLoadMore = (
  ref: React.MutableRefObject<HTMLDivElement | null>,
  callback: () => void,
  // 为了确保 callback 里的操作，可以拿到最新的状态，额外再依赖一下外部状态来同步
  dep: DependencyList = []
) => {
  const scrollTarget = useRef<HTMLDivElement | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const lastChild = useRef<HTMLElement | null>(null);

  const observer = (dom: HTMLElement) => {
    if (!dom) return;
    if (lastChild.current === dom) return;
    if (intersectionObserver.current) intersectionObserver.current.disconnect();

    lastChild.current = dom;

    intersectionObserver.current = new IntersectionObserver(async (entries) => {
      if (entries[0].intersectionRatio <= 0) return; // 不可见拦截
      callback();
    });

    intersectionObserver.current.observe(dom);
  };

  const onScroll = () => {
    if (!scrollTarget.current) return;

    const lastChild = scrollTarget.current.querySelector("tbody")!
      .lastElementChild as HTMLElement;
    observer(lastChild);
  };

  const reset = useCallback(() => {
    scrollTarget.current && (scrollTarget.current.scrollTop = 0);
  }, [scrollTarget]);

  useEffect(() => {
    if (!ref.current) return;
    const tbody = ref.current.querySelector(
      ".ant-table-body"
    ) as HTMLDivElement;
    scrollTarget.current = tbody;
    tbody && tbody.addEventListener("scroll", onScroll);

    return () => {
      tbody && tbody.removeEventListener("scroll", onScroll);
    };
  }, [ref.current, ...dep]);

  useEffect(() => {
    return () => {
      scrollTarget.current = null;
      intersectionObserver.current && intersectionObserver.current.disconnect();
      intersectionObserver.current = null;
      lastChild.current = null;
    };
  }, []);

  return {
    reset,
  };
};
```

### 使用

```typescript
const ref = useRef<HTMLDivElement | null>(null);
const loadmore = () => {
  console.log("加载更多");
};
useLoadMore(ref, loadmore);

<Table ref={ref} scroll={{ y: "60vh" }} />;
```
