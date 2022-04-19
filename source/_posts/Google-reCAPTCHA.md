---
title: Google reCAPTCHA
date: 2022-04-19 09:47:21
tags: Google Product
categories: 互联网产品
---

单独说 Google reCAPTCHA，可能鲜有人知道具体是什么。但是见过下面这个验证的，大概知道是啥了。

<!-- more -->

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e287bfa863384be6b92145537fb30caf~tplv-k3u1fbpfcp-watermark.image?)

如果还不够的话，再看看这个

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00308dbd84ad4a1a8be7236d756900a0~tplv-k3u1fbpfcp-watermark.image?)

笔者经常和这个验证器打交道，用多了时就会觉得它太难了。但细细一想也很人性化，因为它确实需要人用心去验证，才会大概率验证通过。这也是笔者采用这个产品，来做安全防护的原因。

## 背景

公司对根据 ip 给用户提供的激活码，有人通过模拟 ip 的手段，瞬间刷走了几千个。原因在于领取激活码的接口，只对 ip 做了限制。再一个就是接口本身，可以直接通过调用来获取，原本应该从页面上获取的。在和同事的讨论下决定，采用 Google reCAPTCHA v2 的 Checkbox 来进行安全防护，就是上图中的控件。

## 获取 API key

首先需要前往 https://www.google.com/recaptcha/admin/create ，为网站创建一个**第 2 版“进行人机身份验证”复选框的** 配置。创建完成后，我们会得到两个密钥。

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1d9f6dbdce634470a8d058365177c0cb~tplv-k3u1fbpfcp-watermark.image?)

网站密钥，是在客户端发起验证使用的。而下面的通信密钥，则是为了在服务端做 [Verifying the user's response](https://developers.google.com/recaptcha/docs/verify?hl=en) 用的。

## 客户端

### 控件的结构与简单样式

```html
<div id="robot"></div>
```

```css
#robot {
  position: fixed;
  left: 50%;
  transform: translate(-50%, 0);
  bottom: 270px;
}

@media screen and (max-width: 768px) {
  #robot {
    bottom: 200px;
  }
}
```

> 样式可以自行根据页面需要来调整

### 脚本

在编写 js 之前，需要先加载一个资源进来。

```html
<script
  src="https://www.google.com/recaptcha/api.js?render=explicit"
  async
  defer
></script>
```

之后就可以编写代码了

```javascript
export const googleVerify = () => {
  if (!grecaptcha.render) return;

  grecaptcha.render("robot", {
    sitekey: "网站密钥",
    callback: function (token) {
      // 验证通过
    },
  });
};
```

`googleVerify` 方法被调用时，它会通过 `render` 方法渲染控件到页面上。当验证通过时，`callback` 会被执行，并回传一个 `token` 过来，要做好一个完备的安全防护，就需要把它传递给后端，做最后的验证。

## 服务端

参考 https://developers.google.com/recaptcha/docs/verify?hl=en#api_request 即可知道，服务端要做的就是使用 Google reCAPTCHA 的一个 API 发送验证请求。以 Express 的中间件为例，具体处理过程为：

```TypeScript
const verifyGoogleToken: RequestHandler = async (req, res, next) => {
  const { token } = req.body;

  const { data } = await axios({
    url: "https://www.google.com/recaptcha/api/siteverify",
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: `secret=${通信密钥}&response=${token}`,
  });

  if (data && data.success) {
    next();
  } else {
    res.send("google verify failed");
  }
};

```

这样一个完整的验证过程就完成了。
