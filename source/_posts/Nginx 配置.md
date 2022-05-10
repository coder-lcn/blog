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

## 默认配置

```nginx
user nginx;
worker_processes 1;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections  1024;
}

http {
  proxy_cache_path /opt/nginx/proxy_cache levels=1:2 keys_zone=content:20m inactive=1d max_size=100m;

  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

  # 日志文件
  access_log  /var/log/nginx/access.log  main;

  sendfile        on;
  #tcp_nopush     on;

  keepalive_timeout  65;

  # 指定以 .conf 结尾的配置文件
  include /etc/nginx/conf.d/*.conf;
  # 指定目录下的任何文件为配置文件
  include /etc/nginx/sites-enabled/*;
}

```

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
