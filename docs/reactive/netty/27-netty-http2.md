---
slug: /27-netty-http2
---

# 51. netty系列之:使用netty实现支持http2的服务器



# 简介

上一篇文章中，我们提到了如何在netty中配置TLS，让他支持HTTP2。事实上TLS并不是http2的一个必须要求，它只是建议的标准。那么除了TLS之外，还需要如何设置才能让netty支持http2呢？一起来看看吧。

# 基本流程

netty支持http2有两种情况，第一种情况是使用tls，在这种情况下需要添加一个ProtocolNegotiationHandler来对握手之后的协议进行协商，在协商之后，需要决定到底使用哪一种协议。

上一篇文章，我们已经介绍TLS支持http2的细节了，这里不再赘述，感兴趣的朋友可以查看我之前的文章。

如果不使用tls，那么有两种情况，一种是直接使用http1.1了，我们需要为http1.1添加一个ChannelInboundHandler即可。

另一种情况就是使用clear text从HTTP1.1升级到HTTP2。

HTTP/2 ClearText也叫做h2c,我们看一个简单的升级请求，首先是客户端请求：

```
GET /index HTTP/1.1
Host: server.flydean.com
Connection: Upgrade, HTTP2-Settings
Upgrade: h2c 
HTTP2-Settings: (SETTINGS payload) 
```

然后是服务器端的响应，如果服务器端不支持升级，则返回：

```

HTTP/1.1 200 OK 
Content-length: 100
Content-type: text/html

(... HTTP/1.1 response ...)
```

如果服务器支持升级，则返回：

```
HTTP/1.1 101 Switching Protocols 
Connection: Upgrade
Upgrade: h2c

(... HTTP/2 response ...)
```

# CleartextHttp2ServerUpgradeHandler

有了上面的基本流程，我们只需要在netty中提供对应的handler类就可以解决netty对http2的支持了。

不过上面的升级流程看起来比较复杂，所以netty为我们提供了一个封装好的类：CleartextHttp2ServerUpgradeHandler来实现h2c的功能。

这个类需要传入3个参数，分别是HttpServerCodec、HttpServerUpgradeHandler和ChannelHandler。

HttpServerCodec就是处理http server的编码类，一般我们使用HttpServerCodec。

HttpServerUpgradeHandler是从http1.1升级到http2的处理类。

netty也提供了一个现成的类：HttpServerUpgradeHandler，来处理升级的编码。

HttpServerUpgradeHandler需要两个参数，一个是sourceCodec，也就是http原始的编码类HttpServerCodec，一个是用来返回UpgradeCodec的工厂类，返回netty自带的Http2ServerUpgradeCodec。

```
    public HttpServerUpgradeHandler(SourceCodec sourceCodec, UpgradeCodecFactory upgradeCodecFactory) {
        this(sourceCodec, upgradeCodecFactory, 0);
    }
```

ChannelHandler是真正处理HTTP2的handler，我们可以根据需要对这个handler进行自定义。

有了UpgradeHandler，将其加入ChannelPipeline即可。

# Http2ConnectionHandler

不管是HttpServerUpgradeHandler，还是CleartextHttp2ServerUpgradeHandler，都需要传入一个真正能够处理http2的handler。这个handler就是Http2ConnectionHandler。

Http2ConnectionHandler是一个实现类，它已经实现了处理各种inbound frame events的事件，然后将这些事件委托给 Http2FrameListener。

所以Http2ConnectionHandler需要跟Http2FrameListener配合使用。

这里要详细讲解一下Http2FrameListener，它主要处理HTTP2 frame的各种事件。

先来看下http2FrameListener中提供的event trigger方法：

![](https://img-blog.csdnimg.cn/27a9e2a6aea945e6a6cca440a8f09eff.png)

从上图可以看到，主要是各种frame的事件触发方法，其中http2中有这样几种frame：

* DATA frame
* HEADERS frame
* PRIORITY frame
* RST_STREAM frame
* SETTINGS acknowledgment frame
* SETTINGS frame
* PING frame
* PING acknowledgment
* PUSH_PROMISE frame
* GO_AWAY frame
* WINDOW_UPDATE frame
* Unknown Frame

这几种frame基本上列举了http2 frame中所有的类型。

我们要做的就是自定义一个handler类，继承Http2ConnectionHandler，然后实现Http2FrameListener接口即可。

```
    public final class CustHttp2Handler extends Http2ConnectionHandler implements Http2FrameListener
```

在使用clear text从HTTP1.1升级到HTTP2的过程中，我们需要处理两个事情，第一个事情就是处理http1.1使用http头升级到http2,可以重写继承自Http2ConnectionHandler的userEventTriggered方法，通过判断event的类型是否是UpgradeEvent，来触发对应的Http2FrameListener接口中的方法，比如这里的onHeadersRead：

```

    /**
     * 处理HTTP upgrade事件
     */
    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if (evt instanceof HttpServerUpgradeHandler.UpgradeEvent) {
            HttpServerUpgradeHandler.UpgradeEvent upgradeEvent =
                    (HttpServerUpgradeHandler.UpgradeEvent) evt;
            onHeadersRead(ctx, 1, upgradeToHttp2Headers(upgradeEvent.upgradeRequest()), 0 , true);
        }
        super.userEventTriggered(ctx, evt);
    }
```

upgradeToHttp2Headers方法将传入的FullHttpRequest，转换成为Http2Headers：

```
    private static Http2Headers upgradeToHttp2Headers(FullHttpRequest request) {
        CharSequence host = request.headers().get(HttpHeaderNames.HOST);
        Http2Headers http2Headers = new DefaultHttp2Headers()
                .method(HttpMethod.GET.asciiName())
                .path(request.uri())
                .scheme(HttpScheme.HTTP.name());
        if (host != null) {
            http2Headers.authority(host);
        }
        return http2Headers;
    }
```

还有一个要实现的方法，就是sendResponse方法，将数据写回给客户端，回写需要包含headers和data两部分，如下所示：

```
    /**
     * 发送响应数据到客户端
     */
    private void sendResponse(ChannelHandlerContext ctx, int streamId, ByteBuf payload) {
        Http2Headers headers = new DefaultHttp2Headers().status(OK.codeAsText());
        encoder().writeHeaders(ctx, streamId, headers, 0, false, ctx.newPromise());
        encoder().writeData(ctx, streamId, payload, 0, true, ctx.newPromise());
    }
```

# 总结

到此，一个处理clear text从HTTP1.1升级到HTTP2的handler就做好了。加上之前讲解的TLS扩展协议的支持，就构成了一个完整的支持http2的netty服务器。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)






