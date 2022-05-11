---
title: NodeJS事件环
date: 2022-04-27 14:12:52
categories:
  - NodeJS
  - 事件处理
tags: 事件
---

<div></div>

<!-- more -->

# 事件环

## 宏任务与微任务

### 分类

- 宏任务：setImmediate（比定时器快）、定时器
- 微任务：promise.then、、nextTick（node中的方法，比then快）

## Node中的事件环

### 和浏览器的区别
![node事件环.jpg](/images/1558394349175-d70b9d1e-0ba6-46c5-b3b1-12e33436a959.jpeg)
node事件环的机制和浏览器基本一致，但是node的队列有多个；每个队列中的每个事件执行完时，都会再次清空微任务队列。清空队列后，会先走timers，timers如果走完了，再开始走i/o；到了i/o这里，它会检查check里面有没有事件要执行，如果没有，就会卡在这，不会走check，避免无限循环。卡在i/o的同时，如果timers里面有时间到了的事件需要执行，此时执行流程会回到timers中，当timers走完了，继续走i/o。如果check中有事件需要执行，那么在check执行完后，执行流程会再次回到timers里。

> 在老版本的node里，会等到每个队列里的事件都执行完了，才会清空微任务队列。


### 受性能影响的事件环
```javascript
setImmediate(()=>{
    console.log('immediate')
});
setTimeout(()=>{
    console.log('timeout');
})
```

按照正常流程，应该时setTimeout先走，但如果在全局去执行这两个方法时，执行顺序会受到电脑性能的影响；假设node的启动时间为6s，定时器的执行时间为8s。此时node启动时间比定时器快，就会正常的去走 timers => i/o => check 这一流程。可是如果node的启动时间为6s，定时器的执行时间为4s时。这意味着定时器还在node没启动之前就需要执行，而node还在启动中，那么当node启动好后，事件环就会认为 timers 已经走完了，就会接着走 i/o => check，导致 setImmediate 先执行。为了保证正常的执行顺序，这样的代码应该包一层，确保node启动好了，再去执行，就不会受到性能影响。
