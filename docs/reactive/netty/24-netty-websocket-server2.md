---
slug: /24-netty-websocket-server2
---

# 48. netty系列之:分离websocket处理器



# 简介

在上一篇文章中，我们使用了netty构建了可以处理websocket协议的服务器，在这个服务器中，我们构建了特制的handler用来处理HTTP或者websocket请求。

在一个handler中处理两种不同的请求，对于某些有代码洁癖的人可能忍受不了。那么，有没有可能将普通的HTTP请求和websocket请求使用不同的handler来进行处理呢？答案是肯定的。

# netty的消息处理

我们知道netty中所有的消息处理都是通过handler来实现的，为了方便起见，netty提供了一个简单的消息处理类SimpleChannelInboundHandler，大家通过继承它来重写channelRead0方法即可：

```
protected abstract void channelRead0(ChannelHandlerContext ctx, I msg) throws Exception;
```
我们再看一下SimpleChannelInboundHandler的定义：

```
public abstract class SimpleChannelInboundHandler<I> extends ChannelInboundHandlerAdapter
```

可以看到SimpleChannelInboundHandler本身是带有泛型I的，而这个I就是我们要探讨的方向。

如果我们要使用这个handler来处理所有的消息，那么可以将I取值为Object。

如果我们只需要处理String消息，那么可以这样：

```
       public class StringHandler extends
               SimpleChannelInboundHandler<String> {
  
            @Override
           protected void channelRead0(ChannelHandlerContext ctx, String message)
                   throws Exception {
               System.out.println(message);
           }
       }
```

同样的，如果要同时处理HTTP和WebSocket消息，只需要将I设置为不同的类型即可。

对于WebSocketFrame，我们有：

```
public class Server2FrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> 
```

对于FullHttpRequest，我们有：

```
public class Server2HttpHandler extends SimpleChannelInboundHandler<FullHttpRequest> 
```

## 处理WebSocketFrame

对于WebSocketFrame消息，从上一节我们知道它有6种类型，分别是：

```
BinaryWebSocketFrame
CloseWebSocketFrame
ContinuationWebSocketFrame
PingWebSocketFrame
PongWebSocketFrame
TextWebSocketFrame
```

其中真正包含内容的是TextWebSocketFrame和BinaryWebSocketFrame，这里我们对TextWebSocketFrame进行专门处理：

```
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) throws Exception {

        if (frame instanceof TextWebSocketFrame) {
            // 将接收到的消息转换成为大写
            String request = ((TextWebSocketFrame) frame).text();
            ctx.channel().writeAndFlush(new TextWebSocketFrame(request.toUpperCase(Locale.CHINA)));
        } else {
            String message = "不支持的Frame类型: " + frame.getClass().getName();
            throw new UnsupportedOperationException(message);
        }
    }
```

## 处理HTTP

对于HTTP请求中的FullHttpRequest，我们就安装正常的HTTP服务请求的处理流程来就行。

这里不做过多阐述。

## 编码和解码器 

等等，我们是不是忘记了什么东西？对，那就是编码和解码器。

在上一节中，我们使用的是WebSocketServerHandshaker来对websocket消息进行编码和解码。不过其实是放在我们自定义的hadler代码里面的，使用起来略显不优雅。

没关系，netty为我们提供了一个WebSocketServerProtocolHandler类，专门负责websocket的编码和解码问题。

除了处理正常的websocket握手之外，WebSocketServerProtocolHandler类还为我们处理了Close, Ping, Pong这几种通用的消息类型。而我们只需要专注于真正的业务逻辑消息即可，十分的方便。

对于剩下的Text或者Binary frame数据，会被交由pipline中的下一个handler进行处理。

其中Handshake有两个状态，分别是：

HANDSHAKE_COMPLETE 和 HANDSHAKE_TIMEOUT。

而HandshakeComplete又包含了requestUri，requestHeaders和selectedSubprotocol这三个方面的信息。

最后，将WebSocketServerProtocolHandler加入到pipeline中，最终得到：

```
    public void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();

        pipeline.addLast(new HttpServerCodec());
        pipeline.addLast(new HttpObjectAggregator(65536));
        pipeline.addLast(new WebSocketServerCompressionHandler());
        pipeline.addLast(new WebSocketServerProtocolHandler(WEBSOCKET_PATH, null, true));
        pipeline.addLast(new Server2HttpHandler());
        pipeline.addLast(new Server2FrameHandler());
    }
```

# 总结

一个分离了HTTP请求和webSocket请求的服务器就完成了。简单直观才是一个程序员追求的世界！

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)
