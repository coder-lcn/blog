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
