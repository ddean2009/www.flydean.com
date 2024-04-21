---
slug: /25-netty-websocket-client
---

# 49. netty系列之:使用netty搭建websocket客户端



# 简介

在网速快速提升的时代，浏览器已经成为我们访问各种服务的入口，很难想象如果离开了浏览器，我们的网络世界应该如何运作。现在恨不得把操作系统都搬上浏览器。但是并不是所有的应用都需要浏览器来执行，比如服务器和服务器之间的通信，就需要使用到自建客户端来和服务器进行交互。

本文将会介绍使用netty客户端连接websocket的原理和具体实现。

# 浏览器客户端

在介绍netty客户端之前，我们先看一个简单的浏览器客户端连接websocket的例子：

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

这里使用了浏览器最通用的语言javascript，并使用了浏览器提供的websocket API进行操作，非常的简单。

那么用netty客户端实现websocket的连接是否和javascript使用一样呢？我们一起来探索。

# netty对websocket客户端的支持

先看看netty对websocket的支持类都有哪些，接着我们看下怎么具体去使用这些工具类。

## WebSocketClientHandshaker

和websocket server一样，client中最核心的类也是handshaker，这里叫做WebSocketClientHandshaker。这个类有什么作用呢？一起来看看。

这个类主要实现的就是client和server端之间的握手。

我们看一下它的最长参数的构造类：

```
   protected WebSocketClientHandshaker(URI uri, WebSocketVersion version, String subprotocol,
                                        HttpHeaders customHeaders, int maxFramePayloadLength,
                                        long forceCloseTimeoutMillis, boolean absoluteUpgradeUrl) 
```

参数中有websocket连接的URI，像是："ws://flydean.com/mypath"。

有请求子协议的类型subprotocol，有自定义的HTTP headers：customHeaders，有最大的frame payload的长度：maxFramePayloadLength，有强制timeout关闭的时间，有使用HTTP协议进行升级的URI地址。

怎么创建handshaker呢？同样的，netty提供了一个WebSocketClientHandshakerFactory方法。

WebSocketClientHandshakerFactory提供了一个newHandshaker方法，可以方便的创建各种不同版本的handshaker:

```
        if (version == V13) {
            return new WebSocketClientHandshaker13(
                    webSocketURL, V13, subprotocol, allowExtensions, customHeaders,
                    maxFramePayloadLength, performMasking, allowMaskMismatch, forceCloseTimeoutMillis);
        }
        if (version == V08) {
            return new WebSocketClientHandshaker08(
                    webSocketURL, V08, subprotocol, allowExtensions, customHeaders,
                    maxFramePayloadLength, performMasking, allowMaskMismatch, forceCloseTimeoutMillis);
        }
        if (version == V07) {
            return new WebSocketClientHandshaker07(
                    webSocketURL, V07, subprotocol, allowExtensions, customHeaders,
                    maxFramePayloadLength, performMasking, allowMaskMismatch, forceCloseTimeoutMillis);
        }
        if (version == V00) {
            return new WebSocketClientHandshaker00(
                    webSocketURL, V00, subprotocol, customHeaders, maxFramePayloadLength, forceCloseTimeoutMillis);
        }
```

可以看到，根据传入协议版本的不同，可以分为WebSocketClientHandshaker13、WebSocketClientHandshaker08、WebSocketClientHandshaker07、WebSocketClientHandshaker00这几种。

## WebSocketClientCompressionHandler

通常来说，对于webSocket协议，为了提升传输的性能和速度，降低网络带宽占用量，在使用过程中通常会带上额外的压缩扩展。为了处理这样的压缩扩展，netty同时提供了服务器端和客户端的支持。

对于服务器端来说对应的handler叫做WebSocketServerCompressionHandler，对于客户端来说对应的handler叫做WebSocketClientCompressionHandler。

通过将这两个handler加入对应pipline中，可以实现对websocket中压缩协议扩展的支持。

对于协议的扩展有两个级别分别是permessage-deflate和perframe-deflate，分别对应PerMessageDeflateClientExtensionHandshaker和DeflateFrameClientExtensionHandshaker。

至于具体怎么压缩的，这里就不详细进行讲解了， 感兴趣的小伙伴可以自行了解。

# netty客户端的处理流程

前面讲解了netty对websocket客户端的支持之后，本节将会讲解netty到底是如何使用这些工具进行消息处理的。

首先是按照正常的逻辑创建客户端的Bootstrap，并添加handler。这里的handler就是专门为websocket定制的client端handler。

除了上面提到的WebSocketClientCompressionHandler，就是自定义的handler了。

在自定义handler中，我们需要处理两件事情，一件事情就是在channel ready的时候创建handshaker。另外一件事情就是具体websocket消息的处理了。

## 创建handshaker

首先使用WebSocketClientHandshakerFactory创建handler：

```
TestSocketClientHandler handler =
     new TestSocketClientHandler(
        WebSocketClientHandshakerFactory.newHandshaker(
              uri, WebSocketVersion.V13, null, true, new DefaultHttpHeaders()));

```

然后在channel active的时候使用handshaker进行握手连接：

```
    public void channelActive(ChannelHandlerContext ctx) {
        handshaker.handshake(ctx.channel());
    }
```

然后在进行消息接收处理的时候还需要判断handshaker的状态是否完成，如果未完成则调用handshaker.finishHandshake方法进行手动完成：

```
        if (!handshaker.isHandshakeComplete()) {
            try {
                handshaker.finishHandshake(ch, (FullHttpResponse) msg);
                log.info("websocket Handshake 完成!");
                handshakeFuture.setSuccess();
            } catch (WebSocketHandshakeException e) {
                log.info("websocket连接失败!");
                handshakeFuture.setFailure(e);
            }
            return;
        }
```

当handshake完成之后，就可以进行正常的websocket消息读写操作了。

## websocket消息的处理

websocket的消息处理比较简单，将接收到的消息转换成为WebSocketFrame进行处理即可。

```
        WebSocketFrame frame = (WebSocketFrame) msg;
        if (frame instanceof TextWebSocketFrame) {
            TextWebSocketFrame textFrame = (TextWebSocketFrame) frame;
            log.info("接收到TXT消息: " + textFrame.text());
        } else if (frame instanceof PongWebSocketFrame) {
            log.info("接收到pong消息");
        } else if (frame instanceof CloseWebSocketFrame) {
            log.info("接收到closing消息");
            ch.close();
        }
```

# 总结

本文讲解了netty提供的websocket客户端的支持和具体的对接流程，大家可以在此基础上进行扩展，以实现自己的业务逻辑。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)

