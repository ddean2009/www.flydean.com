---
slug: /23-netty-websocket-server
---

# 47. netty系列之:使用netty搭建websocket服务器



# 简介

websocket是一个优秀的协议，它是建立在TCP基础之上的，兼容HTTP的网络协议。通过Websocket我们可以实现客户端和服务器端的即时通讯，免除了客户端多次轮循带来的性能损耗。

既然websocket这么优秀，那么怎么在netty中使用websocket呢？

# netty中的websocket

虽然websocket是一个单独的和HTTP协议完全不同的协议，但是在netty中还是将其放到了http包中。我们回想一下netty中对于各种协议的支持。如果要支持这种协议，肯定需要一个decoder和encoder编码和解码器用于对协议进行编解码。将传输的数据从ByteBuf转换到协议类型，或者将协议类型转换成为ByteBuf。

这是netty的工作核心原理，也是后续自定义netty扩展的基础。

那么对于websocket来说，是怎么样的呢？

## websocket的版本

WebSocket作为一种协议，自然不是凭空而来的，通过不断的发展才到了今天的WebSocket协议。具体的webSocket的发展史我们就不去深究了。我们先看下netty提供的各种WebSocket的版本。

在WebSocketVersion类中，我们可以看到：

```
UNKNOWN(AsciiString.cached(StringUtil.EMPTY_STRING)),

    V00(AsciiString.cached("0")),

    V07(AsciiString.cached("7")),

    V08(AsciiString.cached("8")),

    V13(AsciiString.cached("13"));
```

WebSocketVersion是一个枚举类型，它里面定义了websocket的4个版本，除了UNKNOWN之外，我们可以看到websocket的版本有0，7，8，13这几个。

## FrameDecoder和FrameEncoder

我们知道websocket的消息是通过frame来传递的，因为不同websocket的版本影响到的是frame的格式的不同。所以我们需要不同的FrameDecoder和FrameEncoder来在WebSocketFrame和ByteBuf之间进行转换。

既然websocket有四个版本，那么相对应的就有4个版本的decoder和encoder：

```
WebSocket00FrameDecoder
WebSocket00FrameEncoder
WebSocket07FrameDecoder
WebSocket07FrameEncoder
WebSocket08FrameDecoder
WebSocket08FrameEncoder
WebSocket13FrameDecoder
WebSocket13FrameEncoder
```

至于每个版本之间的frame有什么区别，我们这里就不细讲了，感兴趣的朋友可以关注我的后续文章。

熟悉netty的朋友应该都知道，不管是encoder还是decoder都是作用在channel中对消息进行转换的。那么在netty中对websocket的支持是怎么样的呢？

## WebSocketServerHandshaker

netty提供了一个WebSocketServerHandshaker类来统一使用encoder和decoder的使用。netty提供一个工厂类WebSocketServerHandshakerFactory根据客户端请求header的websocket版本不同，来返回不同的WebSocketServerHandshaker。

```
public WebSocketServerHandshaker newHandshaker(HttpRequest req) {

        CharSequence version = req.headers().get(HttpHeaderNames.SEC_WEBSOCKET_VERSION);
        if (version != null) {
            if (version.equals(WebSocketVersion.V13.toHttpHeaderValue())) {
                // Version 13 of the wire protocol - RFC 6455 (version 17 of the draft hybi specification).
                return new WebSocketServerHandshaker13(
                        webSocketURL, subprotocols, decoderConfig);
            } else if (version.equals(WebSocketVersion.V08.toHttpHeaderValue())) {
                // Version 8 of the wire protocol - version 10 of the draft hybi specification.
                return new WebSocketServerHandshaker08(
                        webSocketURL, subprotocols, decoderConfig);
            } else if (version.equals(WebSocketVersion.V07.toHttpHeaderValue())) {
                // Version 8 of the wire protocol - version 07 of the draft hybi specification.
                return new WebSocketServerHandshaker07(
                        webSocketURL, subprotocols, decoderConfig);
            } else {
                return null;
            }
        } else {
            // Assume version 00 where version header was not specified
            return new WebSocketServerHandshaker00(webSocketURL, subprotocols, decoderConfig);
        }
    }
```

同样的， 我们可以看到，netty为websocket也定义了4种不同的WebSocketServerHandshaker。


WebSocketServerHandshaker中定义了handleshake方法，通过传入channel，并向其添加encoder和decoder
```
public final ChannelFuture handshake(Channel channel, FullHttpRequest req,
                                            HttpHeaders responseHeaders, final ChannelPromise promise) 

            p.addBefore(ctx.name(), "wsencoder", newWebSocketEncoder());
            p.addBefore(ctx.name(), "wsdecoder", newWebsocketDecoder());
```

而添加的这两个newWebSocketEncoder和newWebsocketDecoder就是各个WebSocketServerHandshaker的具体实现中定义的。

## WebSocketFrame

所有的ecode和decode都是在WebSocketFrame和ByteBuf中进行转换。WebSocketFrame继承自DefaultByteBufHolder，表示它是一个ByteBuf的容器。除了保存有ByteBuf之外，它还有两个额外的属性，分别是finalFragment和rsv。

finalFragment表示该frame是不是最后一个Frame。对于大数据量的消息来说，会将消息拆分成为不同的frame，这个属性特别有用。

我们再看一下websocket协议消息的格式：

```

      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```

rsv代表的是消息中的扩展字段，也就是RSV1,RSV2和RSV3。

除此之外就是ByteBuf的一些基本操作了。

WebSocketFrame是一个抽象类，它的具体实现类有下面几种：

```
BinaryWebSocketFrame
CloseWebSocketFrame
ContinuationWebSocketFrame
PingWebSocketFrame
PongWebSocketFrame
TextWebSocketFrame
```

BinaryWebSocketFrame和TextWebSocketFrame很好理解，他们代表消息传输的两种方式。

CloseWebSocketFrame是代表关闭连接的frame。ContinuationWebSocketFrame表示消息中多于一个frame的表示。

而PingWebSocketFrame和PongWebSocketFrame是两个特殊的frame，他们主要用来做服务器和客户端的探测。

这些frame都是跟Websocket的消息类型一一对应的，理解了websocket的消息类型，对应理解这些frame类还是很有帮助的。

# netty中使用websocket

讲了这么多websocket的原理和实现类，接下来就是实战了。

在这个例子中，我们使用netty创建一个websocket server，然后使用浏览器客户端来对server进行访问。

创建websocket server和普通netty服务器的过程没有什么两样。只是在ChannelPipeline中，需要加入自定义的WebSocketServerHandler：

```
pipeline.addLast(new WebSocketServerHandler());
```

这个WebSocketServerHandler需要做什么事情呢？

它需要同时处理普通的HTTP请求和webSocket请求。

这两种请求可以通过接收到的msg类型的不同来进行判断：

```
    public void channelRead0(ChannelHandlerContext ctx, Object msg) throws IOException {
        //根据消息类型，处理两种不同的消息
        if (msg instanceof FullHttpRequest) {
            handleHttpRequest(ctx, (FullHttpRequest) msg);
        } else if (msg instanceof WebSocketFrame) {
            handleWebSocketFrame(ctx, (WebSocketFrame) msg);
        }
    }
```

在客户端进行websocket连接之前，需要借用当前的channel通道，开启handleshake:

```
        // websocket握手
        WebSocketServerHandshakerFactory wsFactory = new WebSocketServerHandshakerFactory(
                getWebSocketLocation(req), null, true, 5 * 1024 * 1024);
        handshaker = wsFactory.newHandshaker(req);
        if (handshaker == null) {
            WebSocketServerHandshakerFactory.sendUnsupportedVersionResponse(ctx.channel());
        } else {
            handshaker.handshake(ctx.channel(), req);
        }
```

我们得到handshaker之后，就可以对后续的WebSocketFrame进行处理：

```
private void handleWebSocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {

        // 处理各种websocket的frame信息
        if (frame instanceof CloseWebSocketFrame) {
            handshaker.close(ctx, (CloseWebSocketFrame) frame.retain());
            return;
        }
        if (frame instanceof PingWebSocketFrame) {
            ctx.write(new PongWebSocketFrame(frame.content().retain()));
            return;
        }
        if (frame instanceof TextWebSocketFrame) {
            // 直接返回
            ctx.write(frame.retain());
            return;
        }
        if (frame instanceof BinaryWebSocketFrame) {
            // 直接返回
            ctx.write(frame.retain());
        }
    }
```

这里我们只是机械的返回消息，大家可以根据自己业务逻辑的不同，对消息进行解析。

有了服务器端，客户端该怎么连接呢？很简单首选构造WebSocket对象，然后处理各种回调即可：

```
socket = new WebSocket("ws://127.0.0.1:8000/websocket");
socket.onmessage = function (event) { 

}
socket.onopen = function(event) {
        };
socket.onclose = function(event) {
        };
```

# 总结

以上就是使用netty搭建websocket服务器的完整流程，本文中的服务器可以同时处理普通HTTP请求和webSocket请求，但是稍显复杂，有没有更加简单的方式呢？敬请期待。


本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)
