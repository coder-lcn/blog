---
title: git 命令
date: 2022-07-06 14:09:12
categories:
  - 代码管理
  - git
tags: git
---

<div></div>

<!-- more -->

## 仓库多平台管理

多平台，也指多 origin

### 查看当前仓库有多少 origin

```shell
git remote -v
```

### 添加 origin

```
git remote add <name> <url>
```

### 删除 origin

```
git remote remove <name>
```

## 收藏当前修改的代码

当我们在处理某个需求，突然需要马上去修改线上的 bug 时，收藏当前改动的代码就很有必要了，避免去推送没有处理完的代码

### 查看收藏列表

```shell
git stash list
```

### 添加到收藏

```shell
git stash
```

### 提取收藏

```shell
git stash pop
```

### 删除收藏

```shell
git stash drop
```
