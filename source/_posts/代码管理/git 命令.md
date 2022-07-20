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

## 生成 `SSH Key`

```shell
ssh-keygen -t rsa -C "youremail@example.com"
```

## 仓库多平台管理

比如某个仓库，在推送到 `github` 时，同时推送到 `gitee` ，那么该命令的使用场景就非常合适

### 查看当前仓库有多少个地址

```shell
git remote -v
```

### 添加仓库地址

```
git remote add <name> <url>
```

### 删除仓库地址

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

后面可以追加一个索引序号，表示需要提取哪个收藏

### 在没有提取之前，预览收藏

```shell
git stash show -p
```

后面可以追加一个索引序号，表示需要预览哪个收藏

### 删除收藏

```shell
git stash drop
```

后面可以追加一个索引序号，表示删除指定的收藏

### 清空所有收藏

```shell
git stash clear
```
