---
slug: /18-netty-http-request
---

# 42. netty系列之:轻轻松松搭个支持中文的服务器



# 简介

之前讲了那么多关于netty的文章，都是讲netty的底层原理和实现，各位小伙伴一定都在想了，看了这么多篇文章，netty到底能干啥呢？今天让我们来使用netty简简单单搭一个支持中文的服务器，展示一下netty的威力。

# netty的HTTP支持

今天我们搭的服务器是支持HTTP1.1的服务器。在netty中搭建服务器就像是拼房子，找到合适的工具就可以事半功倍。那么要搭建HTTP的房子，netty提供了什么样的工具呢？

在讲解netty对HTTP的支持之前，我们先看一下HTTP的版本发展情况。

HTTP的全称是Hypertext Transfer Protocol，是在1989年World Wide Web发展起来之后出现的标准协议，用来在WWW上传输数据。HTTP/1.1是1997年在原始的HTTP协议基础上进行的补充和优化。

到了2015年，为了适应快速发送的web应用和现代浏览器的需求，发展出了新的HTTP/2协议，主要在手机浏览器、延时处理、图像处理和视频处理方面进行了优化。

基本上所有的现代浏览器都支持HTTP/2协议了，但是还有很多应用程序使用的是老的HTTP/1.1协议。netty为HTTP2和HTTP1提供了不同的支持包，对于HTTP1的支持包叫做netty-codec-http,对HTTP2支持的包叫做netty-codec-http2。

本文会讲解netty对HTTP1的支持，将会在后续的文章中继续HTTP2的介绍。

netty-codec-http提供了对HTTP的非常有用的一些封装。

首先是代表HTTP中传输对象的类HttpObject，这个类代表着传输中的所有对象。继承这个类的对象有两个非常重要的对象，分别是HttpMessage和HttpContent。

HttpMessage可能跟我想象的不太一样，它实际上只包含了两部分内容，分别是HttpVersion和HttpHeaders，但是并不包含任何内容。

```
public interface HttpMessage extends HttpObject {

    HttpVersion protocolVersion();

    HttpMessage setProtocolVersion(HttpVersion version);

    HttpHeaders headers();
}

```

这里HttpVersion只支持HTTP/1.0和HTTP/1.1协议。而HttpHeaders就是对HTTP请求中头对象的封装。

HttpMessage的子类是HttpRequest和HttpResponse，所以这两个类本身是不带请求内容的。

而具体请求的内容是在HttpContent中，HttpContent继承自ByteBufHolder，表示它中间可以带有ByteBuf的内容信息。

而HttpContent真正的实现类就是DefaultFullHttpRequest和DefaultFullHttpResponse，这两个内包含了HTTP头和HTTP请求响应内容信息。

那么问题来了，为什么要把HTTP头和HTTP内容分开呢？

这就涉及到HTTP1.1中消息传输中的压缩机制了。为了提升传输的效率，一般来说在传输的的过程中都会对象消息进行压缩，但是对于HTTP1.1来说，头部的内容是没办法压缩的，只能压缩content部分，所以需要区别对待。

# netty中使用HTTP的原理

我们知道netty底层是客户端和服务器端构建通道，通过通道来传输ByteBuf消息。那么netty是怎么支持HTTP请求呢？

当客户端向服务器端发送HTTP请求之后，服务器端需要把接收到的数据使用解码器解码成为可以被应用程序使用的各种HttpObject对象，从而能够在应用程序中对其解析。

netty提供了HttpResponseEncoder和HttpRequestDecoder类，来对HTTP的消息进行编码和解码。

如果不想分别使用两个类来进行编码和解码，netty还提供了HttpServerCodec类来进行编码和解码工作。

这个类包含了HttpRequestDecoder和HttpResponseEncoder两部分的工作，可以同时用来进行编码和解码。

## 100 (Continue) Status

在HTTP中有一个独特的功能叫做，100 (Continue) Status，就是说client在不确定server端是否会接收请求的时候，可以先发送一个请求头，并在这个头上加一个"100-continue"字段，但是暂时还不发送请求body。直到接收到服务器端的响应之后再发送请求body。

为了处理这种请求，netty提供了一个HttpServerExpectContinueHandler对象，用来处理100 Status的情况。

当然，如果你的客户端没有这种请求，那么可以直接使用HttpObjectAggregator来将HttpMessage和HttpContent和合并成为FullHttpRequest或者FullHttpResponse。

# 为netty搭建HTTP服务器

有了上面的工作，我们就可以使用netty搭建http服务器了。最关键的一点就是在HttpRequestServerInitializer添加对应的codec和自定义handler。

```
    public void initChannel(SocketChannel ch) {
        ChannelPipeline p = ch.pipeline();
        p.addLast(new HttpServerCodec());
        p.addLast(new HttpServerExpectContinueHandler());
        p.addLast(new HttpRequestServerHandler());
    }
```

在自定义的handler中，我们需要实现一个功能，就是当收到客户端的请求时候，需要返回给客户端一段欢迎语。

首先将获得的HttpObject转换成为HttpRequest对象，然后根据请求对象构建一个DefaultFullHttpResponse对象，然后设置该response对象的头，最后将该对象写到channel中。


对应的关键代码如下：

```
 private static final byte[] CONTENT = "欢迎来到www.flydean.com!".getBytes(StandardCharsets.UTF_8);

    public void channelRead0(ChannelHandlerContext ctx, HttpObject msg) {
        if (msg instanceof HttpRequest) {
            HttpRequest req = (HttpRequest) msg;

            boolean keepAlive = HttpUtil.isKeepAlive(req);
            FullHttpResponse response = new DefaultFullHttpResponse(req.protocolVersion(), OK,
                                                                    Unpooled.wrappedBuffer(CONTENT));
            response.headers()
//                    .set(CONTENT_TYPE, TEXT_PLAIN)
                    .set(CONTENT_TYPE, "text/plain;charset=utf-8")
                    .setInt(CONTENT_LENGTH, response.content().readableBytes());

            if (keepAlive) {
                if (!req.protocolVersion().isKeepAliveDefault()) {
                    //设置header connection=keep-alive
                    response.headers().set(CONNECTION, KEEP_ALIVE);
                }
            } else {
                // 如果keepAlive是false，则设置header connection=close
                response.headers().set(CONNECTION, CLOSE);
            }
            ChannelFuture f = ctx.write(response);
            if (!keepAlive) {
                f.addListener(ChannelFutureListener.CLOSE);
            }
        }
    }
```

上面的关键代码中CONTENT包含了中文字符串，我们使用getBytes将其转换成了UTF-8编码的byte数组。那么如果要想客户端能够正确识别UTF-8编码，需要在response的header中设置内容类型文件为："text/plain;charset=utf-8"。

最后，使用下面的代码启动server：

```
 // server配置
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.option(ChannelOption.SO_BACKLOG, 1024);
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new HttpRequestServerInitializer());

            Channel ch = b.bind(PORT).sync().channel();
            log.info("请打开你的浏览器，访问 http://127.0.0.1:8000/");
            ch.closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
```

# 总结

现在，使用你的浏览器访问你搭建的服务器地址，你就可以得到"欢迎来到www.flydean.com!"。到此一个简单的netty服务器就完成了。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)








