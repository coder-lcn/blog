---
title: 使用moment.js
date: 2022-04-25 15:48:52
categories:
  - NodeJS
  - 常用工具
tags: 工具
---

<div></div>

<!-- more -->

## 获取特殊时间

### 获取一个月的起止时间

```js
moment().startOf("month").format("YYYY-MM-DD hh:mm");
moment().endOf("month").format("YYYY-MM-DD hh:mm");
```

### 获取当前月份的英文描述名称

```js
moment().subtract(1, "month").startOf("month").format("MMMM");
```

## 运行结果

<iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/lichangnan-programmer/embed/wvpLqey?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/lichangnan-programmer/pen/wvpLqey">
  Untitled</a> by 李昌南 (<a href="https://codepen.io/lichangnan-programmer">@lichangnan-programmer</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
