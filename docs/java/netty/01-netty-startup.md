---
slug: /01-netty-startup
---

# 1. netty系列之:netty初探

# 简介

我们常用浏览器来访问web页面得到相关的信息，通常来说使用的都是HTTP或者HTTPS协议，这些协议的本质上都是IO，客户端的请求就是In，服务器的返回就是Out。但是在目前的协议框架中，并不能完全满足我们所有的需求。比如使用HTTP下载大文件，可能需要长连接等待等。
我们也知道IO方式有多种多样的，包括同步IO，异步IO，阻塞IO和非阻塞IO等。不同的IO方式其性能也是不同的，而netty就是一个基于异步事件驱动的NIO框架。

本系列文章将会探讨netty的详细使用，通过原理+例子的具体结合，让大家了解和认识netty的魅力。

# netty介绍

netty是一个优秀的NIO框架，大家对IO的第一映像应该是比较复杂，尤其是跟各种HTTP、TCP、UDP协议打交道，使用起来非常复杂。但是netty提供了对这些协议的友好封装，通过netty可以快速而且简洁的进行IO编程。netty易于开发、性能优秀同时兼具稳定性和灵活性。如果你希望开发高性能的服务，那么使用netty总是没错的。

netty的最新版本是4.1.66.Final,事实上这个版本是官方推荐的最稳定的版本，netty还有5.x的版本，但是官方并不推荐。

如果要在项目中使用，则可以引入下面的代码：

```
        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-all</artifactId>
            <version>4.1.66.Final</version>
        </dependency>

```

下面我们将会从一个最简单的例子，体验netty的魅力。

# netty的第一个服务器

什么叫做服务器？能够对外提供服务的程序就可以被称为是服务器。建立服务器是所有对外服务的第一步，怎么使用netty建立一个服务器呢？服务器主要负责处理各种服务端的请求，netty提供了一个ChannelInboundHandlerAdapter的类来处理这类请求，我们只需要继承这个类即可。

在NIO中每个channel都是客户端和服务器端沟通的通道。ChannelInboundHandlerAdapter定义了在这个channel上可能出现一些事件和情况，如下图所示：

![](https://img-blog.csdnimg.cn/8ed5c09fd5d4443487994e57ad5a8bb8.png)

如上图所示，channel上可以出现很多事件，比如建立连接，关闭连接，读取数据，读取完成，注册，取消注册等。这些方法都是可以被重写的，我们只需要新建一个类，继承ChannelInboundHandlerAdapter即可。

这里我们新建一个FirstServerHandler类，并重写channelRead和exceptionCaught两个方法，第一个方法是从channel中读取消息，第二个方法是对异常进行处理。

```
public class FirstServerHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        // 对消息进行处理
        ByteBuf in = (ByteBuf) msg;
        try {
            log.info("收到消息:{}",in.toString(io.netty.util.CharsetUtil.US_ASCII));
        }finally {
            ReferenceCountUtil.release(msg);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        // 异常处理
        log.error("出现异常",cause);
        ctx.close();
    }
}

```

上面例子中，我们收到消息后调用release()方法将其释放，并不进行实际的处理。调用release方法是在消息使用完成之后常用的做法。上面代码将msg进行了ByteBuf的强制转换，如果并不想进行转换的话，可以直接这样使用：

```
        try {
            // 消息处理
        } finally {
            ReferenceCountUtil.release(msg);
        }
```

在异常处理方法中，我们打印出异常信息，并关闭异常的上下文。

有了Handler,我们需要新建一个Server类用来使用Handler创建channel和接收消息。接下来我们看一下netty的消息处理流程。

在netty中，对IO进行处理是使用多线程的event loop来实现的。netty中的EventLoopGroup就是这些event loop的抽象类。

我们来观察一下EventLoopGroup的类结构。

![](https://img-blog.csdnimg.cn/fe7d545f9a3647fc8383e57c8e3391d8.png)

可以看出EventLoopGroup继承自EventExecutorGroup，而EventExecutorGroup继承自JDK自带的ScheduledExecutorService。

所以EventLoopGroup本质是是一个线程池服务，之所以叫做Group，是因为它里面包含了很多个EventLoop,可以通过调用next方法对EventLoop进行遍历。

EventLoop是用来处理注册到该EventLoop的channel中的IO信息，一个EventLoop就是一个Executor,通过不断的提交任务进行执行。当然，一个EventLoop可以注册多个channel，不过一般情况下并不这样处理。

EventLoopGroup将多个EventLoop组成了一个Group，通过其中的next方法，可以对Group中的EventLoop进行遍历。另外EventLoopGroup提供了一些register方法，将Channel注册到当前的EventLoop中。

从上图可以看到，register的返回结果是一个ChannelFuture，Future大家都很清楚，可以用来获得异步任务的执行结果，同样的ChannelFuture也是一个异步的结果承载器，可以通过调用sync方法来阻塞Future直到获得执行结果。

可以看到，register方法还可以传入一个ChannelPromise对象，ChannelPromise它同时是ChannelFuture和Promise的子类，Promise又是Future的子类，它是一个特殊的可以控制Future状态的Future。

EventLoopGroup有很多子类的实现，这里我们使用NioEventLoopGroup，Nio使用Selector对channel进行选择。还有一个特性是NioEventLoopGroup可以添加子EventLoopGroup。

对于NIO服务器程序来说，我们需要两个Group，一个group叫做bossGroup，主要用来监控连接，一个group叫做worker group，用来处理被boss accept的连接，这些连接需要被注册到worker group中才能进行处理。

将这两个group传给ServerBootstrap，就可以从ServerBootstrap启动服务了，相应的代码如下：

```
//建立两个EventloopGroup用来处理连接和消息
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new FirstServerHandler());
                        }
                    })
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // 绑定端口并开始接收连接
            ChannelFuture f = b.bind(port).sync();

```

我们最开始创建的FirstServerHandler最作为childHandler的处理器在初始化Channel的时候就被添加进去了。

这样，当有新建立的channel时，FirstServerHandler就会被用来处理该channel的数据。

上例中，我们还指定了一些ChannelOption，用于对channel的一些属性进行设定。

最后，我们绑定了对应的端口，并启动服务器。

# netty的第一个客户端

上面我们已经写好了服务器，并将其启动，现在还需要一个客户端和其进行交互。

如果不想写代码的话，可以直接telnet localhost 8000和server端进行交互即可，但是这里我们希望使用netty的API来构建一个client和Server进行交互。

构建netty客户端的流程和构建netty server端的流程基本一致。首先也需要创建一个Handler用来处理具体的消息，同样，这里我们也继承ChannelInboundHandlerAdapter。

上一节讲到了ChannelInboundHandlerAdapter里面有很多方法，可以根据自己业务的需要进行重写，这里我们希望当Channel active的时候向server发送一个消息。那么就需要重写channelActive方法，同时也希望对异常进行一些处理，所以还需要重写exceptionCaught方法。如果你想在channel读取消息的时候进行处理，那么可以重写channelRead方法。

创建的FirstClientHandler代码如下：

```
@Slf4j
public class FirstClientHandler extends ChannelInboundHandlerAdapter {

    private ByteBuf content;
    private ChannelHandlerContext ctx;

    @Override
    public void channelActive(ChannelHandlerContext ctx) {
        this.ctx = ctx;
        content = ctx.alloc().directBuffer(256).writeBytes("Hello flydean.com".getBytes(StandardCharsets.UTF_8));
        // 发送消息
        sayHello();
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        // 异常处理
        log.error("出现异常",cause);
        ctx.close();
    }
    
    private void sayHello() {
        // 向服务器输出消息
        ctx.writeAndFlush(content.retain());
    }
}
```

上面的代码中，我们首先从ChannelHandlerContext申请了一个ByteBuff，然后调用它的writeBytes方法，写入要传输的数据。最后调用ctx的writeAndFlush方法，向服务器输出消息。

接下来就是启动客户端服务了，在服务端我们建了两个NioEventLoopGroup，是兼顾了channel的选择和channel中消息的读取两部分。对于客户端来说，并不存在这个问题，这里只需要一个NioEventLoopGroup即可。

服务器端使用ServerBootstrap来启动服务，客户端使用的是Bootstrap，其启动的业务逻辑基本和服务器启动一致：

```
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioSocketChannel.class)
             .handler(new ChannelInitializer<SocketChannel>() {
                 @Override
                 protected void initChannel(SocketChannel ch) throws Exception {
                     ChannelPipeline p = ch.pipeline();
                     p.addLast(new FirstClientHandler());
                 }
             });

            // 连接服务器
            ChannelFuture f = b.connect(HOST, PORT).sync();
```

# 运行服务器和客户端

有了上述的准备工作，我们就可以运行了。首先运行服务器，再运行客户端。

如果没有问题的话，应该会输出下面的内容：

```
[nioEventLoopGroup-3-1] INFO com.flydean01.FirstServerHandler - 收到消息:Hello flydean.com

```

# 总结

一个完整的服务器，客户端的例子就完成了。我们总结一下netty的工作流程，对于服务器端，首先建立handler用于对消息的实际处理，然后使用ServerBootstrap对EventLoop进行分组，并绑定端口启动。对于客户端来说，同样需要建立handler对消息进行处理，然后调用Bootstrap对EventLoop进行分组，并绑定端口启动。

有了上面的讨论就可以开发属于自己的NIO服务了。是不是很简单？ 后续文章将会对netty的架构和背后的原理进行深入讨论，敬请期待。


本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)







