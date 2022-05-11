---
title: Nginx 配置
toc: true
date: 2020-04-27 19:16:42
categories:
  - web 服务器
  - nginx
tags: nginx
---

<div></div>

<!-- more -->


## 反向代理

```nginx
server {
  location /api {
    proxy_pass http://127.0.0.1:3001;
  }
}
```

## 配置 https

```nginx
server {
  # 开启 https 访问端口
  listen 443 ssl;

  # 引用证书
  ssl_certificate /etc/nginx/cert/5166600_yhejiu.com.pem;
  ssl_certificate_key /etc/nginx/cert/5166600_yhejiu.com.key;
}
```

## 页面刷新 404

```nginx
location / {
  try_files  $uri $uri/ /index.html;
}
```
