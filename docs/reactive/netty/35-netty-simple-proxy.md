---
slug: /35-netty-simple-proxy
---

# 59. netty系列之:手把手教你做一个简单的代理服务器



# 简介

爱因斯坦说过:所有的伟大，都产生于简单的细节中。netty为我们提供了如此强大的eventloop、channel通过对这些简单东西的有效利用，可以得到非常强大的应用程序，比如今天要讲的代理。

# 代理和反向代理 

相信只要是程序员应该都听过nginx服务器了，这个超级优秀nginx一个很重要的功能就是做反向代理。那么有小伙伴要问了，有反向代理肯定就有正向代理，那么他们两个有什么区别呢？

先讲一下正向代理，举个例子，最近流量明星备受打击，虽然被打压，但是明星就是明星，一般人是见不到的，如果有人需要跟明星对话的话，需要首先经过明星的经纪人，有经纪人将话转达给明星。这个经纪人就是正向代理。我们通过正向代理来访问要访问的对象。

那么什么是反向代理呢？比如现在出现了很多人工智能，假如我们跟智能机器人A对话，然后A把我们之间的对话转给了后面的藏着的人，这个人用他的智慧，回答了我们的对话，交由智能机器人A输出，最终实现了人工智能。这个过程就叫做反向代理。

# netty实现代理的原理

那么在netty中怎么实现这个代理服务器呢？

首选我们首先代理服务器是一个服务器，所以我们需要在netty中使用ServerBootstrap创建一个服务器：

```
EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new SimpleDumpProxyInitializer(REMOTE_HOST, REMOTE_PORT))
             .childOption(ChannelOption.AUTO_READ, false)
             .bind(LOCAL_PORT).sync().channel().closeFuture().sync();
```

在这个local服务器中，我们传入ProxyInitializer。在这个handler初始化器中，我们传入自定义的handler：

```
    public void initChannel(SocketChannel ch) {
        ch.pipeline().addLast(
                new LoggingHandler(LogLevel.INFO),
                new SimpleDumpProxyInboundHandler(remoteHost, remotePort));
    }
```

在自定义的handler中，我们使用Bootstrap创建一个client，用来连接远程要代理的服务器，我们将这个client端的创建放在channelActive方法中：

```
// 开启outbound连接
        Bootstrap b = new Bootstrap();
        b.group(inboundChannel.eventLoop())
         .channel(ctx.channel().getClass())
         .handler(new SimpleDumpProxyOutboundHandler(inboundChannel))
         .option(ChannelOption.AUTO_READ, false);
        ChannelFuture f = b.connect(remoteHost, remotePort);
```

然后在client建立好连接之后，就可以从inboundChannel中读取数据了：

```
outboundChannel = f.channel();
        f.addListener(future -> {
            if (future.isSuccess()) {
                // 连接建立完毕，读取inbound数据
                inboundChannel.read();
            } else {
                // 关闭inbound channel
                inboundChannel.close();
            }
        });
```

因为是代理服务，所以需要将inboundChannel读取的数据，转发给outboundChannel，所以在channelRead中我们需要这样写：

```
    public void channelRead(final ChannelHandlerContext ctx, Object msg) {
        // 将inboundChannel中的消息读取，并写入到outboundChannel
        if (outboundChannel.isActive()) {
            outboundChannel.writeAndFlush(msg).addListener((ChannelFutureListener) future -> {
                if (future.isSuccess()) {
                    // flush成功，读取下一个消息
                    ctx.channel().read();
                } else {
                    future.channel().close();
                }
            });
        }
    }
```

当outboundChannel写成功之后，再继续inboundChannel的读取工作。

同样对于client的outboundChannel来说，也有一个handler，在这个handler中，我们需要将outboundChannel读取到的数据反写会inboundChannel中：

```
    public void channelRead(final ChannelHandlerContext ctx, Object msg) {
        // 将outboundChannel中的消息读取，并写入到inboundChannel中
        inboundChannel.writeAndFlush(msg).addListener((ChannelFutureListener) future -> {
            if (future.isSuccess()) {
                ctx.channel().read();
            } else {
                future.channel().close();
            }
        });
    }
```

当inboundChannel写成功之后，再继续outboundChannel的读取工作。

如此一个简单的代理服务器就完成了。

# 实战

如果我们将本地的8000端口，代理到www.163.com的80端口，会发生什么情况呢？运行我们的程序，访问http://localhost:8000, 我们会看到下面的页面：

![](https://img-blog.csdnimg.cn/f025f1e1e9d94e8db5b0e0979e136116.png)

为什么没有如我们想象的那样展示正常的页面呢？那是因为我们代理过去之后的域名是localhost，而不是正常的www.163.com, 所以服务器端不认识我们的请求，从而报错。

# 总结

本文的代理服务器之间简单的转发请求，并不能够处理上述的场景，那么该怎么解决上面的问题呢？ 敬请期待我的后续文章！

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)



