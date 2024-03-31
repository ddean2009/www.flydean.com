小学生都能读懂的网络协议之:WebSocket

[toc]

# 简介

服务端和客户端应该怎么进行通信呢？我们常见的方法就是客户端向服务器端发送一个请求，然后服务器端向客户端发送返回的响应。这种做法比较简单，逻辑也很清晰，但是在某些情况下，这种操作方式并不好使。

比如在服务器端的某些变动需要通知客户端的情况，因为客户端并不知道服务器端的变动是否完成，所以需要不停的使用轮循去检测服务器的状态。这种做法的缺点就是太过于浪费资源。如果希望及时性好的话，需要不断的减少轮循的时间间隔，导致极大的服务器压力和资源的浪费。

那么有没有好的解决办法呢？

既然不能使用查询，那么就改成服务器推送就行了。我们知道在HTTP/2中，提供了一种服务器推送的方式，但是这种方式是单向的，也就是说在同一个TCP连接之上，并不能实现客户端和服务器端的交互。

于是我们需要一个能够双向交互的网络协议，这个协议就是WebSocket。

# webSocket vs HTTP

webSocket是一个基于底层TCP协议的一个双向通信网络协议。这个双向通信是通过一个TCP连接来实现的。webSocket于2011年以RFC 6455发布成为IETF的标准。

同样作为基于TCP协议的标准协议，它和HTTP有什么区别呢？

如果以OSI的七层模型来说，两者都位于七层协议的第四层。但是两者是两种不同的协议。鉴于HTTP已经如此流行了，为了保证webSocket的通用性，webSocket也对HTTP协议进行了兼容。也就是说能够使用HTTP协议的地方也就可以使用webScoket。

这个和之前讨论的HTTP3有点类似，虽然HTTP3是一个新的协议，但是为了保证其广泛的应用基础，HTTP3还是在现有的UDP协议上进行重写和构建。目的就是为了兼容。

实时上，webSocket使用的是HTTP upgrade header，从HTTP协议升级成为webSocket协议。

# HTTP upgrade header

什么是HTTP upgrade header呢？

HTTP upgrade header是在HTTP1.1中引入的一个HTTP头。当客户端觉得需要升级HTTP协议的时候，会向服务器端发送一个升级请求，服务器端会做出相应的响应。

对于websocket来说，客户端在和服务器端建立连接之后，会首先发送给服务器端 Upgrade: WebSocket 和 Connection: Upgrade 头。服务器端接收到客户端的请求之后，如果支持webSocket协议，那么会返回同样的Upgrade: WebSocket和Connection: Upgrade 头到客户端。客户端接收到服务器端的响应之后，就知道服务器端支持websocket协议了，然后就可以使用WebSocket协议发送消息了。

# websocket的优点 

其实前面我们也讲过了，相对于传统的HTTP拉取，webSocket可以借助于一个TCP连接实现数据的实时传输。可以在减少服务器压力的同时，实现服务器和客户端的实时通信。

# webScoket的应用

WebSocket使用的是ws和wss作为URI的标记符。其中ws表示的是websocket，而wss表示的是WebSocket Secure。

因为通常来说我们使用的web浏览器来和服务器进行通信。浏览器就是我们的web客户端，对于现代浏览器来说，基本上都支持WebSocket协议，所以大家可以放心应用，不用担心协议兼容的问题。

对于浏览器客户端来说，可以使用标准的浏览器WebSocket对象，来和服务器进行通信，我们看一个简单的javascript客户端使用webSocket进行通信的例子：

```
// 使用标准的WebSocket API创建一个socket连接
const socket = new WebSocket('ws://www.flydean.com:8000/webscoket');

// 监听webSocket的open事件
socket.onopen = function () {
  setInterval(function() {
    if (socket.bufferedAmount == 0)
      socket.send(getUpdateData());
  }, 50);
};

// 监听接收消息事件
socket.onmessage = function(event) {
  handleUpdateData(event.data);
};

// 监听socket关闭事件
socket.onclose = function(event) {
  onSocketClose(event);
};

// 监听error事件
socket.onerror = function(event) {
  onSocketError(event);
};
```

上述代码主要就是各种监听socket的事件，然后进行处理，非常简单。

# websocket的握手流程

上面我们讲过了，websocket是从HTTP协议升级的，客户端通过发送：

```
Upgrade: websocket
Connection: Upgrade

```

到服务器端，对协议进行升级。我们举一个具体的例子：

```
GET /webscoket HTTP/1.1
Host: www.flydean.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x123455688xafe=
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
Origin: http://flydean.com
```

对应的server端的返回：

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: Qhfsfew12445m=
Sec-WebSocket-Protocol: chat
```

在上面的例子中，除了使用Upgrade头之外，客户端还向服务器端发送了Sec-WebSocket-Key header。这个header包含的是一个 base64 编码的随机字节。server对应的会返回这个key的hash值，并将其设置在Sec-WebSocket-Accept header中。

这里并不是为了安全操作，而是为了避免上一次的连接缓存情况。

# WebSocket API 

要想在浏览器端使用WebSocket，那么就需要用到客户端API，而客户端API中最主要的就是WebSocket。

它提供了对websocket的功能封装。它的构造函数是这样的：

```
WebSocket(url[, protocols])
```

url就是要连接的websocket的地址，那么可选的protocols是什么呢？protocols可以传入单个协议字符串或者是协议字符串数组。它指的是 WebSocket 服务器实现的子协议。

子协议是在WebSocket协议基础上发展出来的协议，主要用于具体的场景的处理，它是是在WebSocket协议之上，建立的更加严格的规范。

比如，客户端请求服务器时候，会将对应的协议放在Sec-WebSocket-Protocol头中：

```
GET /socket HTTP/1.1
...
Sec-WebSocket-Protocol: soap, wamp
```

服务器端会根据支持的类型，做对应的返回，如：

```
Sec-WebSocket-Protocol: soap
```

WebSocket API有四种状态，分别是：

状态定义 | 取值
---------|----------
WebSocket.CONNECTING | 0 
WebSocket.OPEN | 1
WebSocket.CLOSING | 2
WebSocket.CLOSED | 3

通过调用close或者Send方法，会触发相应的events事件，WebSocket API 的事件主要有：close,error,message,open这4种。

下面是一个具体使用的例子：

```
// 创建连接
const socket = new WebSocket('ws://localhost:8000');

// 开启连接
socket.addEventListener('open', function (event) {
    socket.send('没错，开启了!');
});

// 监听消息
socket.addEventListener('message', function (event) {
    console.log('监听到服务器的消息 ', event.data);
});
```

# 总结

以上就是websocket的简单介绍和使用，有想知道Websocket到底是怎么进行消息传输的，敬请期待我的下一篇文章。








