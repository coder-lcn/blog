---
title: discord bot 开发
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





## 创建一个机器人账户



### 创建应用

前往 https://discord.com/developers/applications 页面，点击`New Application`创建一个应用。



### Build-A-Bot

![WeChatc43c25da9f5c3a54b7456174174e43c3](https://tva1.sinaimg.cn/large/e6c9d24ely1h1l1bqb3gjj21gv0cddgy.jpg)



## hello world

### 登录机器人账号

对于 discord 而言，bot 也是一个用户。所以在使用 bot 开发前，需要先使用

```js
const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login("token");
```
