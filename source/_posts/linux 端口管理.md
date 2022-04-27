---
title: linux 端口管理
date: 2020-05-23 12:13:10
categories:
  - Linux
  - 基础操作
tags: linux
---

来源：https://www.cnblogs.com/yanglang/p/10711826.html

<!-- more -->

## 一、查看系统防火墙状态（如果返回 running 代表防火墙启动正常）

```shell
firewall-cmd --state
```

## 二、开启端口外网访问

添加端口 返回 success 代表成功（--permanent 永久生效，没有此参数重启后失效）

```shell
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
```

开放多个端口

```shell
firewall-cmd --zone=public --add-port=80-85/tcp --permanent
```

2、重新载入 返回 success 代表成功

```shell
firewall-cmd --reload
```

3、查看 返回 yes 代表开启成功

```shell
firewall-cmd --zone=public --query-port=80/tcp
```

## 三、关闭端口

1、删除端口 返回 success 代表成功

```shell
firewall-cmd --zone=public --remove-port=80/tcp --permanent
```

2、重新载入 返回 success 代表成功

```shell
firewall-cmd --reload
```

## 四、基本操作

```shell

#启动服务
systemctl start firewalld.service

#关闭服务
systemctl stop firewalld.service

#重启服务
systemctl restart firewalld.service

#显示服务的状态
systemctl status firewalld.service

#开机自动启动
systemctl enable firewalld.service

#禁用开机自动启动
systemctl disable firewalld.service

#查看版本
firewall-cmd –version

#查看帮助
firewall-cmd –help

#显示状态
firewall-cmd –state

#查看所有打开的端口
firewall-cmd –zone=public –list-ports

#更新防火墙规则
firewall-cmd –reload

#查看区域信息
firewall-cmd –get-active-zones

#查看指定接口所属区域
firewall-cmd –get-zone-of-interface=eth0

#拒绝所有包
firewall-cmd –panic-on

#取消拒绝状态
firewall-cmd –panic-off

#查看是否拒绝
firewall-cmd –query-panic
```
