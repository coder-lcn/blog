---
title: 使用moment.js
date: 2022-04-25 15:48:52
categories:
  - 前端
  - 常用工具
tags: 时间工具
---

<div></div>

<!-- more -->

## 获取特殊时间

### 获取一个月的起止时间

```js
moment().startOf("month").format("YYYY-MM-DD hh:mm");
moment().endOf("month").format("YYYY-MM-DD hh:mm");
```
