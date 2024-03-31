---
slug: /33-netty-multiplex-http2server
---

# 57. netty系列之:性能为王!创建多路复用http2服务器



# 简介

在之前的文章中，我们提到了在netty的客户端通过使用Http2FrameCodec和Http2MultiplexHandler可以支持多路复用，也就是说在一个连接的channel基础上创建多个子channel，通过子channel来处理不同的stream，从而达到多路复用的目的。

既然客户端可以做到多路复用，同样的服务器端也可以，今天给大家介绍一下如何在netty的服务器端打造一个支持http2协议的多路复用服务器。

# 多路复用的基础

netty中对于http2多路复用的基础类是Http2FrameCodec、Http2MultiplexHandler和Http2MultiplexCodec。

Http2FrameCodec是将底层的HTTP/2 frames消息映射成为netty中的Http2Frame对象。

有了Http2Frame对象就可以通过Http2MultiplexHandler对新创建的stream开启不同的channel。

Http2MultiplexCodec是Http2FrameCodec和Http2MultiplexHandler的结合体，但是已经不再被推荐使用了。

因为Http2FrameCodec继承自Http2ConnectionHandler，而Http2MultiplexHandler继承自Http2ChannelDuplexHandler，所以这两个类可以同时在客户端和服务器端使用。

客户端使用Http2FrameCodecBuilder.forClient().build()来获得Http2FrameCodec，而服务器端通过Http2FrameCodecBuilder.forServer().build()来获得Http2FrameCodec。

# 多路复用在server端的使用

## 配置TLS处理器

对于服务器端，同样需要处理TLS和普通clear text两种情况。对于TLS来说，我们需要自建ProtocolNegotiationHandler继承自ApplicationProtocolNegotiationHandler，然后实现configurePipeline方法，在其中分别处理http2和http1.1的连接：

```
    protected void configurePipeline(ChannelHandlerContext ctx, String protocol) {
        if (ApplicationProtocolNames.HTTP_2.equals(protocol)) {
            //添加多路复用支持
            ctx.pipeline().addLast(Http2FrameCodecBuilder.forServer().build());
            ctx.pipeline().addLast(new Http2MultiplexHandler(new CustMultiplexHttp2Handler()));
            return;
        }

        if (ApplicationProtocolNames.HTTP_1_1.equals(protocol)) {
            ctx.pipeline().addLast(new HttpServerCodec(),
                                   new HttpObjectAggregator(MAX_CONTENT_LENGTH),
                                   new CustHttp1Handler("ALPN Negotiation"));
            return;
        }

        throw new IllegalStateException("未知协议: " + protocol);
    }
```

首先添加Http2FrameCodec，然后添加Http2MultiplexHandler。因为Http2MultiplexHandler已经封装了多路复用的细节，所以自定义的handler只需要实现正常的消息处理逻辑即可。

因为Http2FrameCodec已经对消息进行了转换成为HTTP2Frame对象，所以只需要处理具体的Frame对象：

```
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if (msg instanceof Http2HeadersFrame) {
            onHeadersRead(ctx, (Http2HeadersFrame) msg);
        } else if (msg instanceof Http2DataFrame) {
            onDataRead(ctx, (Http2DataFrame) msg);
        } else {
            super.channelRead(ctx, msg);
        }
    }
```

## 配置clear text upgrade

对于h2c的升级来说，需要向pipline中传入sourceCodec和upgradeHandler两个处理器。

sourceCodec可以直接使用HttpServerCodec。

upgradeHandler可以使用HttpServerUpgradeHandler。

HttpServerUpgradeHandler的构造函数需要传入一个sourceCodec和一个upgradeCodecFactory。

sourceCodec我们已经有了，再构造一个upgradeCodecFactory即可：

```
    private static final UpgradeCodecFactory upgradeCodecFactory = protocol -> {
        if (AsciiString.contentEquals(Http2CodecUtil.HTTP_UPGRADE_PROTOCOL_NAME, protocol)) {
            return new Http2ServerUpgradeCodec(
                    Http2FrameCodecBuilder.forServer().build(),
                    new Http2MultiplexHandler(new CustMultiplexHttp2Handler()));
        } else {
            return null;
        }
    };
```

从代码中可以看出，upgradeCodecFactory内部又调用了Http2FrameCodec和Http2MultiplexHandler。这和使用TLS的处理器是一致的。

```
        final ChannelPipeline p = ch.pipeline();
        final HttpServerCodec sourceCodec = new HttpServerCodec();
        p.addLast(sourceCodec);
        p.addLast(new HttpServerUpgradeHandler(sourceCodec, upgradeCodecFactory));
```

# 总结

通过上述方式，就可以创建出支持多路复用的http2 netty服务器了。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)









