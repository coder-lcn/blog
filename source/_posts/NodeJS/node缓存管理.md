---
title: NodeJS缓存管理
date: 2022-06-06 16:14:35
categories:
  - NodeJS
  - 缓存
tags: NodeJS
---

<div></div>

<!-- more -->

## 背景

数据缓存是非常常见的编程共识，常用场景都是：**多请求 + 数据变化幅度小**

## 案例

### 获取用户总量

```sql
select count(*) from users;
```

背后是这样的一条 `sql` 语句，如果数据量达到了百万、千万，那么查询的开销就会越来越大了。通常的做法是使用缓存来处理。比如每十分钟更新一次数据。

```typescript
import NodeCahe from "node-cache";

//缓存时间 15分钟
const time = 60 * 15;
const cache = new NodeCache({
  stdTTL: time, // 数据缓存时间（单位：秒）
  checkperiod: time, // 缓存多久后删除数据（单位：秒）。设置 deleteOnExpire 为 false 会保留下来。
  useClones: false,
});

const getData = () => {
  if (cache.has("user")) {
    // ...
  } else {
    // 查询 sql，更新缓存
    cache.set("user", 新数据);
  }
};
```
