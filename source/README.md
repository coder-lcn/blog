---
title: 更换icarus主题记录
date: 2019-04-02 15:23:22
categories: 独立博客
tags:
  - hexo
---

[TOC]


> NexT: https://github.com/iissnan/hexo-theme-next
>
> icarus: https://github.com/ppoffice/hexo-theme-icarus

两者效果图如下: 

- NexT

  ![NexT主题](https://ww1.sinaimg.cn/large/007rAy9hly1g1obi5l56hj31hc0r541k.jpg)

- icarus

  ![icarus主题](https://ww1.sinaimg.cn/large/007rAy9hly1g1objx5er7j31hc0q1akg.jpg)



相较NexT, icarus使用的人数没有很多, 想要改什么在网上搜到的基本都是关于NexT的

虽然icarus也提供了很多配置, 但还是有些地方想按照自己意思做些修改, 强迫症~

有些无法通过配置完成的, 只能改源码了

作为后端开发前端知识匮乏, 还好icarus使用的是ejs, 一种模版语言, 类似以前用过的FreeMarker和Thymeleaf



### 变动日志

主题配置文件`_config.yml`的更改不记录了, 可参考文档: [Documentation](http://ppoffice.github.io/hexo-theme-icarus/categories/)

主要记录源码部分的变动如下: 

#### 修改navbar导航栏左边的logo配置方式

因为不会设计Logo, 就改成"icon+文字"的方式, 并加入`logo.img`配置项

- `themes/hexo-theme-icarus/layout/common/navbar.ejs`



#### 修改navbar导航栏右边的搜索功能

原版`2.3.0`只有一个小的搜索icon, 加入搜索输入框并嵌入搜索icon

- `themes/hexo-theme-icarus/layout/common/navbar.ejs`
- `themes/hexo-theme-icarus/source/css/style.styl`



#### 修改个人信息页中的几个links

原版是通过`socialLinks`动态配置的, 不支持微信, 码云, 微博这几个常用, 这里为了方便我使用`<a>+<img>`标签写死

- `themes/hexo-theme-icarus/layout/widget/profile.ejs`



#### 友情链接标题前加入icon, 为了好看

- `themes/hexo-theme-icarus/layout/widget/links.ejs`



#### 修改文章页(index页和post页)的文章时间

加入判断, 如果是列表页显示例如`几月前`, 文章页显示具体日期, 例如`2018-12-22`

- `themes/hexo-theme-icarus/layout/common/article.ejs`



#### 修改文章详情页面不显示文章图片thumbnail

在阅读文章时感觉有点花, 默认是index页和post页都会显示

- `themes/hexo-theme-icarus/layout/common/article.ejs`



#### 修改首页文章列表摘要信息不显示样式

去掉Markdown生成的html标签, 类似简书上的文章排版, 整洁一点

- `themes/hexo-theme-icarus/layout/common/article.ejs`



#### 修改文章页面布局

原版的主页和文章页都使用三栏布局, 在文章页阅读会显得内容很窄, 尤其是代码部分, 需要左右滚动, 故修改文章页为两栏布局

- `themes/hexo-theme-icarus/includes/helpers/layout.js`
- `themes/hexo-theme-icarus/layout/common/widget.ejs`
- `themes/hexo-theme-icarus/layout/layout.ejs`
- `themes/hexo-theme-icarus/source/css/style.styl`



#### 目录的开启方式改为默认就开启文章目录

这样可以不用每个md文件都去写`toc: true`

- `themes/hexo-theme-icarus/includes/helpers/config.js`



#### 修改开启目录后的显示问题

默认目录在滚动文章时如果太长会显示不全, 所以增加目录粘性布局

- `themes/hexo-theme-icarus/layout/widget/toc.ejs`



#### 文章页增加版权声明

- `themes/hexo-theme-icarus/layout/common/article.ejs`
- `themes/hexo-theme-icarus/source/css/style.styl`



#### 修改底部footer的显示信息

- `themes/hexo-theme-icarus/layout/common/footer.ejs`