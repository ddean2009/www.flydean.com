---
slug: /34-netty-multiple-server
---

# 58. netty系列之:一个价值上亿的网站速度优化方案



# 简介

其实软件界最赚钱的不是写代码的，写代码的只能叫马龙，高级点的叫做程序员，都是苦力活。那么有没有高大上的职业呢？这个必须有，他们的名字就叫做咨询师。

咨询师就是去帮企业做方案、做架构、做优化的，有时候一个简单的代码改动、一个架构的调整都可以让软件或者流程更加高效的运行，从而为企业节省上亿的开支。

今天除了要给大家介绍一下如何在netty中同时支持http和https协议之外，还给大家介绍一个价值上亿的网站数据优化方案，有了这个方案，年薪百万不是梦！

# 本文的目标

本文将会给大家介绍一下如何在一个netty服务中同时支持http和http2两种协议，在这两个服务器中，提供了对多图片的访问支持，我们介绍如何从服务器端返回多个图片。最后介绍一个价值上亿的速度优化方案，肯定大家会受益匪浅。

# 支持多个图片服务

对于服务器端来说，是通过ServerBootstrap来启动服务的，ServerBootstrap有一个group方法用来指定acceptor的group和client的group。

```
    public ServerBootstrap group(EventLoopGroup group) 
    public ServerBootstrap group(EventLoopGroup parentGroup, EventLoopGroup childGroup) 
```

当然你可以指定两个不同的group，也可以指定同一个group，它提供了两个group方法，效果上没太大的区别。

这里我们现在主服务器中创建一个EventLoopGroup，然后将其传入到ImageHttp1Server和ImageHttp2Server中。然后分别在两个server中调用group方法，然后配置handler即可。

先看一下ImageHttp1Server的构造：

```
        ServerBootstrap b = new ServerBootstrap();
        b.option(ChannelOption.SO_BACKLOG, 1024);
        b.group(group).channel(NioServerSocketChannel.class).handler(new LoggingHandler(LogLevel.INFO))
        .childHandler(new ChannelInitializer<SocketChannel>() {
            @Override
            protected void initChannel(SocketChannel ch){
                ch.pipeline().addLast(new HttpRequestDecoder(),
                                      new HttpResponseEncoder(),
                                      new HttpObjectAggregator(MAX_CONTENT_LENGTH),
                                      new Http1RequestHandler());
            }
        });
```

我们传入了netty自带的HttpRequestDecoder、HttpResponseEncoder和HttpObjectAggregator。还有一个自定义的Http1RequestHandler。

再看一下ImageHttp2Server的构造：

```
ServerBootstrap b = new ServerBootstrap();
        b.option(ChannelOption.SO_BACKLOG, 1024);
        b.group(group).channel(NioServerSocketChannel.class).childHandler(new ChannelInitializer<SocketChannel>() {
            @Override
            protected void initChannel(SocketChannel ch)  {
                ch.pipeline().addLast(sslCtx.newHandler(ch.alloc()), new CustProtocolNegotiationHandler());
            }
        });
```

为了简单起见，我们默认如果从http来访问的话，就使用http1服务，如果是从https来访问的话，就使用http2服务。

所以在http2服务中，我们只需要自定义ProtocolNegotiationHandler即可，而不用处理clear text升级的请求。

# http2处理器

在TLS环境中，我们通过自定义CustProtocolNegotiationHandler，继承自ApplicationProtocolNegotiationHandler来进行客户端和服务器端协议的交互。

对于http2协议来说，使用了netty自带的InboundHttp2ToHttpAdapterBuilder和HttpToHttp2ConnectionHandlerBuilder将http2 frame转换成为http1的FullHttpRequest对象。这样我们直接处理http1格式的消息即可。

转换过程如下：

```
DefaultHttp2Connection connection = new DefaultHttp2Connection(true);
        InboundHttp2ToHttpAdapter listener = new InboundHttp2ToHttpAdapterBuilder(connection)
                .propagateSettings(true).validateHttpHeaders(false)
                .maxContentLength(MAX_CONTENT_LENGTH).build();

        ctx.pipeline().addLast(new HttpToHttp2ConnectionHandlerBuilder()
                .frameListener(listener)
                .connection(connection).build());

        ctx.pipeline().addLast(new Http2RequestHandler());
```

转换转换的http2 handler和普通的http1的handler唯一不同的是需要额外设置一个streamId属性到请求头和响应头中。

并且不需要处理http1特有的100-continue和KeepAlive。其他的和http1 handler没什么两样。

# 处理页面和图像

因为我们使用转换器将http2的frame转换成了http1的普通对象，所以对请求相应的页面和图像来说，跟http1的处理没什么太大区别。

对于页面来说，我们需要获取要返回的html，然后设置CONTENT_TYPE为"text/html; charset=UTF-8"，返回即可：

```
    private void handlePage(ChannelHandlerContext ctx, String streamId,  FullHttpRequest request) throws IOException {
        ByteBuf content =ImagePage.getContent();
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK, content);
        response.headers().set(CONTENT_TYPE, "text/html; charset=UTF-8");
        sendResponse(ctx, streamId, response, request);
    }
```

对于图像来说，我们获取到要返回的图像，将其转换成为ByteBuf，然后设置CONTENT_TYPE为"image/jpeg"，返回即可：

```
    private void handleImage(String id, ChannelHandlerContext ctx, String streamId,
            FullHttpRequest request) {
        ByteBuf image = ImagePage.getImage(parseInt(id));
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, OK, image);
        response.headers().set(CONTENT_TYPE, "image/jpeg");
        sendResponse(ctx, streamId, response, request);
    }
```

这样，我们就能够在netty服务器端同时处理页面请求和图片请求了。

# 价值上亿的速度优化方案

终于要到本文中最精彩的部分了，价值上亿的速度优化方案是什么呢？

在讲这个方案之前，先给大家讲一个抗洪抢险的故事。有两个县都住在一条大河的旁边。这条大河很不安稳，经常会发洪灾，但是两个县的县长做法很不同。

A县的县长认真负责，派人定期巡逻检查所属的河段，筑堤、种树、巡视，一刻都放松，在他的任期平平安安，没有发生任何洪水溃堤的情况。

B县的县长从来不巡检，一道河水泛滥的时候，B县长就组织人抗洪抢险，然后媒体全都报道的是B县长抗洪的丰功伟绩，最后B县长由于政绩突出，升任市长。

好了，故事讲完了，接下来是我们的优化。不管是用户请求页面还是图片，最终都需要调用ctx.writeAndFlush(response)方法进行响应回写。

如果将其放入一个定时任务中，来定时执行，如下所示：


```
ctx.executor().schedule(new Runnable() {
            @Override
            public void run() {
                ctx.writeAndFlush(response);
            }
        }, latency, TimeUnit.MILLISECONDS);
```

那么服务器在经过latency指定的毫秒之后，才会发送对应的响应。比如这里我们设置latency的值为5秒。

当然5秒是不能够让人满意的，于是领导或者客户找到你，说让你给优化一下。你说这个性能问题是很难的，涉及到了麦克斯韦方程组和热力学第三定律，需要一个月时间。领导说好，撸起袖子加油干，下个月给你工资涨50%。

一个月后，你把latency改成2.5秒，性能提升了100%，这个优化值不值几个亿？

# 总结

当然，上一节给大家开个玩笑，不过在netty响应中使用定时任务的技巧，大家也应该牢牢掌握，原因你懂的！

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)












