---
title: vmware下的centos
date: 2022-05-11 02:29:03
categories:
  - 操作系统
  - centos
tags: vmware
---

<div></div>

<!-- more -->

## 网络配置

 当系统刚装好时，vmware 默认的 net 网络适配模式下，会无法访问互联网。解决办法：

 - `cd /etc/sysconfig/network-scripts/`
 - 找到 `ifcfg-ens33` 文件，把 `onboot=no` 改成 `onboot=yes`
 - 通过 `service network restart` 重启网络即可

## 命令找不到

### ifconfig

```shell
sudo yum install net-tools
```
