---
title: js实现websocket连接
date: 2019-06-05 19:57:42
desc: websocket教程
comments: true
categories: js
categorie: js
layout: true
category: 1
archive: 1
tag: 1
tags: '教程'
cover: /img/Random-img/5.jpg # 文章缩略图
---
websocket实现方式是后台启动服务监听，前端连接后台监听服务，本文后台是node.js。
先看下最终效果：
{% img border_round /img/demo/socket_demo_01.gif 300 200 效果图 %}

## 先安装socket.io
``` bash
$ npm install socket.io
```

## 后台监听
``` js main.js
var io = require("socket.io").listen(80); // 启动socket服务 端口80
io.sockets.on("connection", function (socket) {
  console.log('有用户连接进来了');
});
console.log('socket服务已启动 done...');
```

## 启动服务
``` bash
$ node main.js
```
socket服务已启动 done...

## 前端连接
``` html index.html
<script src="./socket.io.js"></script>
<script>
  socket = io.connect('http://localhost');
  socket.on('connect', function () {
    console.log('socket连接成功');
  });
</script>
```
说明：socket.io.js 存在于node-modules/socket.io-client/dist文件夹下

前端连接成功之后后台向所有用户发送一条消息，更改一下main.js
``` js main.js
var io = require("socket.io").listen(80); // 启动socket服务 端口80
io.sockets.on("connection", function (socket) {
  console.log('有用户连接进来了');
  socket.emit('message', JSON.stringify({ // 触发前端监听的message事件，前端需要有监听
    'EVENT' : 'LOGIN',
    'user' : new Date().getTime() + ''  // 用户
  }));
});
console.log('socket服务已启动 done...');
```

前端需要添加监听message事件，更改indx.html
``` html index.html
<script src="./socket.io.js"></script>
<script>
  socket = io.connect('http://localhost');
  socket.on('connect', function () {
    console.log('socket连接成功');
  });
  socket.on("message",function(msg){
    console.log(msg);
    //  {"EVENT":"LOGIN","user":"1559136283110"}
  });
</script>
```
至此，可以看到前端输出了 {"EVENT":"LOGIN","user":"1559136283110"}，那我们就可以通过EVENT事件类型来判断用户的消息类型了

最终效果完整代码请点击这里下载：[点击下载](http://www.sunfengfeng.com/websocket/websocket.zip)

