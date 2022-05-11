---
title: mysql 指令
date: 2022-04-25 01:30:07
categories:
  - 数据库
  - mysql
tags: mysql
---

<div></div>

<!-- more -->

## 创建（Create）

### 插入表数据

单个或多个数据的插入

```sql
insert into `表名`(`字段名`) VALUES (值1),(值2)；
```

### 字段

添加某个表字段和数据类型。后面的 `null` 表示这个字段可以为 `null`，要设置为非 `null`，调整为 `not null` 即可。

```sql
alter talbe 表名 add 新字段名 数据类型 null;
```

## 更新（Update）

### 字段

更新某个表字段的数据类型。后面的 `null` 表示这个字段可以为 `null`，要设置为非 `null`，调整为 `not null` 即可。

```sql
alter table 表名 modify 字段名 类型 null;
```

如果表里 `code` 字段的长度大于 8，就把 `code` 里整个字符串左边的 8 位，重新赋值给 `code`

```sql
update 表名 set code=left(code,8) where length(code)>8;
```

## 读取（Retrieve）

### 表

获取表里的所有数据

```sql
select * from 表名;
```

统计表数据的总数

```sql
select count(*) from 表名;
```

查看表里某个字段为非 `null` 的所有数据

```sql
select * from 表名 where 字段名 is not null;
```

## 删除（Delete）

### 表

删除表里 `字段名A` 为 `null` ，并且 `字段名B` 包含了英文的数据

```sql
delete from 表名 where 字段名A is null and 字段名B regex '[a-z]';
```
