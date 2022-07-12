---
title: git hooks
date: 2022-07-12 17:03:13
categories:
  - 代码管理
  - git
tags: 实践
---

<div></div>

<!-- more -->

## 背景

如果想在 `commit` 之前，自动做一个 `eslint --fix` 的操作。怎么办？

## 方法

任何一个 `git` 仓库，在项目根目录下都有一个 `.git` 的目录。在 `.git/hooks` 下面，有很多以 `.sample` 结尾的文件。这些文件里的第一行代码很关键：`#!/bin/sh` 。这表示可以在这个文件里面，编写命令行代码

去掉 `.sample` 后缀，这个文件就会在相应的周期自动执行。要完成上述需求，可以把 `pre-commit.sample` 文件的后缀去掉，在第一行写 `eslint --fix` 即可实现。


