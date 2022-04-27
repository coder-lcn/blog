---
title: NodeJS 内置模块实践
date: 2022-04-26 13:12:52
categories:
  - NodeJS
  - 内置模块
  - 实践
tags: 实践
---

<div></div>

<!-- more -->

## 206 - 范围请求
### 简单示例

```javascript
let http = require('http');
let fs = require('fs');
let path = require('path')
let downloadPath = path.join(__dirname,'download.txt');
let total = fs.statSync(downloadPath).size;

http.createServer((req,res)=>{
  if(req.url === '/'){
    let range =  req.headers['range'];
    // 如果是范围请求
    if(range){
      // 拿到请求的范围
      let [,start,end] = range.match(/(\d*)-(\d*)/);
      start = start?Number(start):0;
      end = end ? Number(end):total-1;
      // 指定状态码
      res.statusCode = 206;
      res.setHeader('Content-Length',end-start+1);
      // 设置范围请求的头，指定请求的范围与数据总大小
      res.setHeader('Content-Range',`bytes ${start}-${end}/${total}`)
      // 读取指定范围的数据，并将读流pipe给res，返回给客户端
      fs.createReadStream(downloadPath,{start,end}).pipe(res);
    }else{
      fs.createReadStream(downloadPath).pipe(res);
    }
  }else{
    res.statusCode = 404;
    res.end();
  }
}).listen(3000);
```

### 基于范围请求，实现断点续传
> 断点续传就是把一个数据拆分成一个指定的范围来传送，每次返回指定范围大小的数据后，对范围进行一个累加，再递归调用请求，直到数据全部返回完成。


#### 模拟客户端

```javascript
let http = require('http');
let limit = 4;
let start = 0;
let fs = require('fs')
// 当用户输入 p 标示暂停   输入r的时候 表示恢复
let flowing = true;
process.stdin.on('data',function(data){
  if(data.toString().includes('p')){
    flowing = false;
  }else if(data.toString().includes('r')){
    flowing = true;
    downLoad();
  }
})

let ws = fs.createWriteStream('xxxxx.txt')

function downLoad(){
  http.get({
    hostname:'localhost',
    port:3000,
    headers:{
      Range:`bytes=${start}-${start+limit}`
    }
  },function(res){
    let total = res.headers['content-range'].split('/')[1];
    res.pipe(ws,{end:false});
    start = start+1+limit;
    if(total >= start && flowing){
      setTimeout(() => {
        downLoad();
      }, 1000);
    }
  });
}

downLoad();

```

#### 拓展
> 在下载一个很大的文件时，可以通过上面的示例，实现一个文件下载的暂停和继续下载的功能；同时根据断点续传，可以在客户端实时的反馈出下载的真实进度



## 国际化

```javascript
// 多语言  网站拆分成 多个网站 /zh-cn  /en  前端

// accept-language: zh-CN,zh;q=0.9,en;q=0.8 我当前客户端支持什么语言
// 前端搞一个按钮 

// [{name:'zc-CN',q:1},{name:'zc-CN',q:1},{name:'zc-CN',q:1}]
let http = require('http');

let language = {
  en:"hello",
  'zh-CN':"你好",
  'jp':'xxxxx'
}
let defaultLanguage = 'en';
http.createServer((req,res)=>{
  let languages = req.headers['accept-language'];
  if(languages){
    let lans = languages.split(',').map(lan=>{
      let [l,q='q=1'] = lan.split(';');
      let obj = {};
      obj['name'] = l;
      obj['q'] = q.split('=')[1];
      return obj
    }).sort((a,b)=>b.q-a.q); // 根据不同的语言进行排序 ，拿到语言包的列表
    let current = lans.find(item=>{ // 去看支持哪种语言，返回对应的结果， webpack-loader i8nss
      let name = item.name;
      return language[name]
    });
    if(!current) return res.end(language[defaultLanguage]);
    res.end(language[current.name]);
  }else{
    let r = language[defaultLanguage];
    res.end(r);
  }
}).listen(3000);
```


## 防盗链（防止盗取链接资源）

> 主要通过 referer 头来实现；作用就是防止其它的网站，直接引用自己的网站资源；我们可以拿到 referer 头，来判断获取资源的服务器。和本机进行校验后，再决定怎么处理其它服务器的不礼貌行为。


```javascript
let http = require('http');
let fs = require('fs');
let path = require('path');
let urlParser = require('url');

// 白名单，指定可以正常访问的域名，在返回正确资源前，再做一个安全处理。
let whiteList = [
  'b.zhufeng.cn'
]
http.createServer((req,res)=>{
  let url = path.join(__dirname,req.url);
  fs.stat(url,function(err,statObj){
    if(err){
      res.statusCode = 404;
      res.end();
    }else{
      // 拿到当前的引用来源和 当前资源的主机名 比较如果相等就正常返回 ，不想等返回错误内容
      let referer = req.headers['referer'] || req.headers['referrer'];
      if(referer){
        let r = urlParser.parse(referer).hostname;
        let host = req.headers.host.split(':')[0];
        if(r === host){
          fs.createReadStream(path.resolve(__dirname,'1.jpg')).pipe(res);
        }else{
          fs.createReadStream(path.resolve(__dirname,'2.jpg')).pipe(res);
        }
      }
      fs.createReadStream(url).pipe(res);
    }
  })  

}).listen(3000);
```


## 压缩

> 在访问一个文件时，如果这个文件太大了，那么可以在客户端请求这个文件时，服务端对这个文件进行压缩；**可以节省带宽。**客户端浏览器接到服务端返回的压缩文件后，会根据 Content-Encoding 响应头去判断，是否需要解压，如果指定了，就解压并返回获取解压后的内容，渲染到浏览器上；没有的话，浏览器会自动把这个压缩包下载到本地。


```javascript
let http = require('http');
let zlib = require('zlib');
let fs = require('fs');
let path = require('path');

http.createServer((req,res)=>{
  let encodings =  req.headers['accept-encoding'];
  if(encodings){
    // 使用 gzip 压缩
    if(encodings.match(/\bgzip\b/)){
      res.setHeader('Content-Encoding','gzip')
      fs.createReadStream(path.resolve(__dirname,'1.txt')).pipe(zlib.createGzip()).pipe(res);
    }else if(encodings.match(/\bdeflate\b/)){ // 使用 deflate 压缩
      res.setHeader('Content-Encoding','deflate')
      fs.createReadStream(path.resolve(__dirname,'1.txt')).pipe(zlib.createDeflate()).pipe(res);
    }
  }
}).listen(3000);
```

