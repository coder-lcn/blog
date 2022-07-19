---
title: cookie设置不上
date: 2022-07-19 17:45:24
categories:
  - HTTP
  - cookie
---

<div></div>

<!-- more -->

## 背景

- 项目需要在局域网环境运行，但是连接的接口服务是从外网来的。
- 在调用登陆接口时，该接口的响应头会携带 `cookie` 过来，但是设置不上。`warning` 提示为：`this attempt to set a cookie via a set-cookie header was blocked because it had the secure`。

## 分析

因为这个 `cookie` 具备安全性，也就是需要 `ssl` 的支持。那么先在局域网生成一个证书来支持(参考：https://github.com/FiloSottile/mkcert)

然后在本地的 `nginx` 服务上配置下 `ssl`

```nginx
server {
  listen 80;
  server_name aa.bb.com;

  ssl_certificate  *.pem;
  ssl_certificate_key *.pem;
  listen 443 ssl;

  ...
}
```

还不够，因为这个 `cookie` 还携带设置了 `domain` ，这个属性限定了支持设置 `cookie` 的域名。它携带过来的值为 `.test.com`，那么在配置完 `ssl` 后，再把 `server_name` 设置为例如 `aa.test.com` 这样的域名。最后将这个自建的局域网域名，添加到路由表上面。最终即可将 `cookie` 成功设置到客户端上，实现局域网部署。
