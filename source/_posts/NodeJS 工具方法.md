---
title: NodeJS 工具方法
toc: true
date: 2022-04-27 19:16:42
categories:
  - NodeJS
  - 工具方法
tags: NodeJS
---

<div></div>

<!-- more -->

## 系统相关

### 获取本地 ip
```javaScript
function getLocalIP() {
  var interfaces = require("os").networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
        return alias.address;
      }
    }
  }
}
```
