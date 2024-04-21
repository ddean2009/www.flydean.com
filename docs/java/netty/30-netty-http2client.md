---
slug: /30-netty-http2client
---

# 54. netty系列之:搭建客户端使用http1.1的方式连接http2服务器



# 简介

对于http2协议来说，它的底层跟http1.1是完全不同的，但是为了兼容http1.1协议，http2提供了一个从http1.1升级到http2的方式，这个方式叫做cleartext upgrade,也可以简称为h2c。

在netty中，http2的数据对应的是各种http2Frame对象，而http1的数据对应的是HttpRequest和HttpHeaders。一般来说要想从客户端发送http2消息给支持http2的服务器，那么需要发送这些http2Frame的对象，那么可不可以像http1.1这样发送HttpRequest对象呢？

今天的文章将会给大家揭秘。

# 使用http1.1的方式处理http2

netty当然考虑到了客户的这种需求，所以提供了两个对应的类，分别是：InboundHttp2ToHttpAdapter和HttpToHttp2ConnectionHandler。

他们是一对方法，其中InboundHttp2ToHttpAdapter将接收到的HTTP/2 frames 转换成为HTTP/1.x objects，而HttpToHttp2ConnectionHandler则是相反的将HTTP/1.x objects转换成为HTTP/2 frames。 这样我们在程序中只需要处理http1的对象即可。

他们的底层实际上调用了HttpConversionUtil类中的转换方法，将HTTP2对象和HTTP1对象进行转换。

# 处理TLS连接

和服务器一样，客户端的连接也需要区分是TLS还是clear text，TLS简单点，只需要处理HTTP2数据即可，clear text复杂点，需要考虑http升级的情况。

先看下TLS的连接处理。

首先是创建SslContext，客户端的创建和服务器端的创建没什么两样，这里要注意的是SslContextBuilder调用的是forClient()方法：

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

然后将sslCtx的newHandler方法传入到pipeline中：

```
pipeline.addLast(sslCtx.newHandler(ch.alloc(), CustHttp2Client.HOST, CustHttp2Client.PORT));
```

最后加入ApplicationProtocolNegotiationHandler，用于TLS扩展协议的协商：

```
pipeline.addLast(new ApplicationProtocolNegotiationHandler("") {
            @Override
            protected void configurePipeline(ChannelHandlerContext ctx, String protocol) {
                if (ApplicationProtocolNames.HTTP_2.equals(protocol)) {
                    ChannelPipeline p = ctx.pipeline();
                    p.addLast(connectionHandler);
                    p.addLast(settingsHandler, responseHandler);
                    return;
                }
                ctx.close();
                throw new IllegalStateException("未知协议: " + protocol);
            }
        });
```

如果是HTTP2协议，则需要向pipline中加入三个handler，分别是connectionHandler，settingsHandler和responseHandler。

connectionHandler用于处理客户端和服务器端的连接，这里使用HttpToHttp2ConnectionHandlerBuilder来构建一个上一节提到的HttpToHttp2ConnectionHandler，用来将http1.1对象转换成为http2对象。

```
Http2Connection connection = new DefaultHttp2Connection(false);
        connectionHandler = new HttpToHttp2ConnectionHandlerBuilder()
                .frameListener(new DelegatingDecompressorFrameListener(
                        connection,
                        new InboundHttp2ToHttpAdapterBuilder(connection)
                                .maxContentLength(maxContentLength)
                                .propagateSettings(true)
                                .build()))
                .frameLogger(logger)
                .connection(connection)
                .build();
```

但是连接其实是双向的，HttpToHttp2ConnectionHandler是将http1.1转换成为http2，它实际上是一个outbound处理器，我们还需要一个inbound处理器，用来将接收到的http2对象转换成为http1.1对象，这里通过添加framelistener来实现。

frameListener传入一个DelegatingDecompressorFrameListener，其内部又传入了前一节介绍的InboundHttp2ToHttpAdapterBuilder用来对http2对象进行转换。

settingsHandler用来处理Http2Settings inbound消息，responseHandler用来处理FullHttpResponse inbound消息。

这两个是自定义的handler类。

# 处理h2c消息

从上面的代码可以看出，我们在TLS的ProtocolNegotiation中只处理了HTTP2协议，如果是HTTP1协议，直接会报错。如果是HTTP1协议，则可以通过clear text upgrade来实现，也就是h2c协议。

我们看下h2c需要添加的handler：

```
    private void configureClearText(SocketChannel ch) {
        HttpClientCodec sourceCodec = new HttpClientCodec();
        Http2ClientUpgradeCodec upgradeCodec = new Http2ClientUpgradeCodec(connectionHandler);
        HttpClientUpgradeHandler upgradeHandler = new HttpClientUpgradeHandler(sourceCodec, upgradeCodec, 65536);

        ch.pipeline().addLast(sourceCodec,
                              upgradeHandler,
                              new CustUpgradeRequestHandler(this),
                              new UserEventLogger());
    }
```

首先添加的是HttpClientCodec作为source编码handler，然后添加HttpClientUpgradeHandler作为upgrade handler。最后添加自定义的CustUpgradeRequestHandler和事件记录器UserEventLogger。

自定义的CustUpgradeRequestHandler负责在channelActive的时候，创建upgradeRequest并发送到channel中。

因为upgradeCodec中已经包含了处理http2连接的connectionHandler，所以还需要手动添加settingsHandler和responseHandler。

```
ctx.pipeline().addLast(custHttp2ClientInitializer.settingsHandler(), custHttp2ClientInitializer.responseHandler());
```

# 发送消息

handler配置好了之后，我们就可以直接以http1的方式来发送http2消息了。

首先发送一个get请求：

```
// 创建一个get请求
                FullHttpRequest request = new DefaultFullHttpRequest(HTTP_1_1, GET, GETURL, Unpooled.EMPTY_BUFFER);
                request.headers().add(HttpHeaderNames.HOST, hostName);
                request.headers().add(HttpConversionUtil.ExtensionHeaderNames.SCHEME.text(), scheme.name());
                request.headers().add(HttpHeaderNames.ACCEPT_ENCODING, HttpHeaderValues.GZIP);
                request.headers().add(HttpHeaderNames.ACCEPT_ENCODING, HttpHeaderValues.DEFLATE);
                responseHandler.put(streamId, channel.write(request), channel.newPromise());
```

然后是一个post请求：

```
// 创建一个post请求
                FullHttpRequest request = new DefaultFullHttpRequest(HTTP_1_1, POST, POSTURL,
                        wrappedBuffer(POSTDATA.getBytes(CharsetUtil.UTF_8)));
                request.headers().add(HttpHeaderNames.HOST, hostName);
                request.headers().add(HttpConversionUtil.ExtensionHeaderNames.SCHEME.text(), scheme.name());
                request.headers().add(HttpHeaderNames.ACCEPT_ENCODING, HttpHeaderValues.GZIP);
                request.headers().add(HttpHeaderNames.ACCEPT_ENCODING, HttpHeaderValues.DEFLATE);
                responseHandler.put(streamId, channel.write(request), channel.newPromise());
```

和普通的http1请求没太大区别。

# 总结

通过使用InboundHttp2ToHttpAdapter和HttpToHttp2ConnectionHandler可以方便的使用http1的方法来发送http2的消息，非常方便。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)









