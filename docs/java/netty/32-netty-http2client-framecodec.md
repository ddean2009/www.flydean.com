---
slug: /32-netty-http2client-framecodec
---

# 56. netty系列之:手持framecodec神器,创建多路复用http2客户端



# 简介

在之前的文章中，我们实现了支持http2的netty服务器，并且使用支持http2的浏览器成功的进行访问。虽然浏览器非常通用，但是有时候我们也需要使用特定的netty客户端去和服务器进行通信。

今天我们来探讨一下netty客户端对http2的支持。

# 配置SslContext

虽然http2并不强制要求支持TLS，但是现代浏览器都是需要在TLS的环境中开启http2，所以对于客户端来说，同样需要配置好支持http2的SslContext。客户端和服务器端配置SslContext的内容没有太大的区别，唯一的区别就是需要调用SslContextBuilder.forClient()而不是forServer()方法来获取SslContextBuilder，创建SslContext的代码如下:

```
SslProvider provider =
                    SslProvider.isAlpnSupported(SslProvider.OPENSSL)? SslProvider.OPENSSL : SslProvider.JDK;
            sslCtx = SslContextBuilder.forClient()
                  .sslProvider(provider)
                  .ciphers(Http2SecurityUtil.CIPHERS, SupportedCipherSuiteFilter.INSTANCE)
                  // 因为我们的证书是自生成的，所以需要信任放行
                  .trustManager(InsecureTrustManagerFactory.INSTANCE)
                  .applicationProtocolConfig(new ApplicationProtocolConfig(
                          Protocol.ALPN,
                          SelectorFailureBehavior.NO_ADVERTISE,
                          SelectedListenerFailureBehavior.ACCEPT,
                          ApplicationProtocolNames.HTTP_2,
                          ApplicationProtocolNames.HTTP_1_1))
                  .build();
```

如果使用SSL，那么ssl handler必须是pipline中的第一个handler，所以将SslContext加入到pipline中的代码如下：

```
ch.pipeline().addFirst(sslCtx.newHandler(ch.alloc()));
```

# 客户端的handler

## 使用Http2FrameCodec

netty的channel默认只能接收ByteBuf消息，对于http2来说，底层传输的是一个个的frame，直接操作底层的frame对于普通程序员来说并不是特别友好，所以netty提供了一个Http2FrameCodec来对底层的http2 frame进行封装成Http2Frame对象，方便程序的处理。

在服务器端我们使用Http2FrameCodecBuilder.forServer()来创建Http2FrameCodec，在客户端我们使用Http2FrameCodecBuilder.forClient()来创建Http2FrameCodec：

```
Http2FrameCodec http2FrameCodec = Http2FrameCodecBuilder.forClient()
            .initialSettings(Http2Settings.defaultSettings())
            .build();
```

然后将其加入到pipline中即可使用：

```
        ch.pipeline().addLast(http2FrameCodec);
```

## Http2MultiplexHandler和Http2MultiplexCodec

我们知道对于http2来说一个TCP连接中可以创建多个stream，每个stream又是由多个frame来组成的。考虑到多路复用的情况，netty可以为每一个stream创建一个单独的channel，对于新创建的每个channel来说，都可以使用netty的ChannelInboundHandler来对channel的消息进行处理，从而提升netty处理http2的效率。

而这个对stream创建新channel的支持，在netty中有两个专门的类，他们是Http2MultiplexHandler和Http2MultiplexCodec。

他们的功能是一样的，Http2MultiplexHandler继承自Http2ChannelDuplexHandler，它必须和 Http2FrameCodec一起使用。而Http2MultiplexCodec本身就是继承自Http2FrameCodec，已经结合了Http2FrameCodec的功能。

```
public final class Http2MultiplexHandler extends Http2ChannelDuplexHandler

@Deprecated
public class Http2MultiplexCodec extends Http2FrameCodec 
```

但是通过检查源代码，我们发现Http2MultiplexCodec是不推荐使用的API，所以这里我们主要介绍Http2MultiplexHandler。

对于Http2MultiplexHandler来说，每次新创建一个stream，都会创建一个新的对应的channel，应用程序使用这个新创建的channel来发送和接收Http2StreamFrame。

新创建的子channel会被注册到netty的EventLoop中，所以对于一个有效的子channel来说，并不是立刻就会被匹配到HTTP/2 stream上去，而是当第一个Http2HeadersFrame成功被发送或者接收之后，才会触发Event事件，进而进行绑定操作。

因为是子channel，所以对于connection level的事件，比如Http2SettingsFrame 和 Http2GoAwayFrame会首先被父channel进行处理，然后再广播到子channel中进行处理。

同时，虽然Http2GoAwayFrame 和 Http2ResetFrame表示远程节点已经不再接收新的frame了，但是因为channel本身还可能有queue的消息，所以需要等待Channel.read()为空之后，才会进行关闭操作。

另外对于子channel来说，因为不能知道connection-level流控制window，所以如果有溢出的消息会被缓存在父channel的buff中。

有了Http2MultiplexHandler，将其加入client的pipline就可以让客户端支持多路的channel了：

```
ch.pipeline().addLast(new Http2MultiplexHandler(new SimpleChannelInboundHandler() {
            @Override
            protected void channelRead0(ChannelHandlerContext ctx, Object msg) {
                // 处理inbound streams
                log.info("Http2MultiplexHandler接收到消息: {}",msg);
            }
        }))
```

## 使用子channel发送消息

从上面的介绍我们知道，一旦使用了Http2MultiplexHandler，那么具体的消息处理就是在子channel中了。那么怎么才能从父channel中获取子channel，然后使用子channel来发送信息呢？

netty提供Http2StreamChannelBootstrap类，它提供了open方法，来创建子channel：

```
        final Http2StreamChannel streamChannel;
        try {
            if (ctx.handler() instanceof Http2MultiplexCodec) {
                streamChannel = ((Http2MultiplexCodec) ctx.handler()).newOutboundStream();
            } else {
                streamChannel = ((Http2MultiplexHandler) ctx.handler()).newOutboundStream();
            }
```

我们要做的就是调用这个方法，来创建子channel：

```
final Http2StreamChannel streamChannel = streamChannelBootstrap.open().syncUninterruptibly().getNow();
```

然后将自定义的，专门处理Http2StreamFrame的Http2ClientStreamFrameHandler，添加到子channel的pipline中即可：

```
final Http2ClientStreamFrameHandler streamFrameResponseHandler =
                    new Http2ClientStreamFrameHandler();
streamChannel.pipeline().addLast(streamFrameResponseHandler);
```

准备完毕，构建http2消息，使用streamChannel进行发送：

```
// 发送HTTP2 get请求
            final DefaultHttp2Headers headers = new DefaultHttp2Headers();
            headers.method("GET");
            headers.path(PATH);
            headers.scheme(SSL? "https" : "http");
            Http2HeadersFrame headersFrame = new DefaultHttp2HeadersFrame(headers, true);
            streamChannel.writeAndFlush(headersFrame);
```

# 总结

以上就是使用netty的framecode构建http2的客户端和服务器端进行通信的基本操作了。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)




