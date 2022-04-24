---
title: discord bot 开发入门
date: 2022-04-21 09:57:53
categories:
  - 机器人脚本
  - discord
tags: Discord
---

首先需要先知道的是，对于 discord 来说，bot 也是一个用户。也就意味着要使用 bot 开发之前，需要先登录上去。

<!-- more -->

> 本文围绕 `discord.js` 的 v3 版本来编写机器人脚本。
> discord 机器人的开发是比较简单有趣的，但是过程中还是会遇到一些限制。特别是从 v2 过渡期到 v3 时。
> 参考https://discordjs.guide/additional-info/changes-in-v13.html#before-you-start

## 登录机器人

### 创建应用

前往 https://discord.com/developers/applications 页面，点击 `New Application` 创建一个应用。

### Build-A-Bot

![](/images/e6c9d24ely1h1l1bqb3gjj21gv0cddgy.jpg)

创建完成后，需要对机器人账户做一个初始化操作。`Add Bot` 之后，这个机器人账户就可以登录使用了。

### 获取 Token

![](/images/20220424230317.png)

`Add Bot` 完成后，就可以在这个位置获取到机器人的 `Token`

### 登录

根据官方给出的 demo，只需要机器人的 `Token` ，就可以通过下列方式登录

```js
const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login("token");
```

## 运用到社区里

### 前言

其实到这一步，就可以开始机器人的开发了，但是有很多功能目前用起来可能看不到效果。原因是**机器人必须被邀请到一个社区里**去。比如让机器人给某个频道(channel)发送消息

```js
const channel = client.channels.cache.get(频道id);
channel && channel.message.sned("hello world");
```

我们需要先知道这个频道 id 是多少才可以，然而机器人只是用户，要想知道就必须处在这个频道所在的社区里。

> 频道 id、userId，guidId 等这样的唯一 id，需要打开开发者模式，就可以把鼠标移动到频道名、用户名右键时看到。具体方法：在 discord 左下角的用户设置按钮里，找到高级设置，点进去就可以看到。

### 获取邀请机器人的链接

![](/images/20220424230311237.png)

通过上图的 3 步，就可以获取到链接了，意思为：

1. 添加 bot 的 scopes 范围
2. 给 bot 添加最高的管理员权限（具体的业务最好再细化一下）
3. 获取邀请链接

管理员通过这个链接，把机器人邀请进去后，就可以为社区写有意义的脚本了。
