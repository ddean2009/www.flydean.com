---
slug: /06-netty-cheerup-china
---

# 16. netty系列之:中国加油



# 简介

之前的系列文章中我们学到了netty的基本结构和工作原理，各位小伙伴一定按捺不住心中的喜悦，想要开始手写代码来体验这神奇的netty框架了，刚好最近东京奥运会，我们写一个netty的客户端和服务器为中国加油可好？

# 场景规划

那么我们今天要搭建什么样的系统呢？

首先要搭建一个server服务器，用来处理所有的netty客户的连接，并对客户端发送到服务器的消息进行处理。

还要搭建一个客户端，这个客户端负责和server服务器建立连接，并发送消息给server服务器。在今天的例子中，客户端在建立连接过后，会首先发送一个“中国”消息给服务器，然后服务器收到消息之后再返回一个”加油！“ 消息给客户端，然后客户端收到消息之后再发送一个“中国”消息给服务器.... 以此往后，循环反复直到奥运结束！

我们知道客户端和服务器端进行消息处理都是通过handler来进行的，在handler里面，我们可以重写channelRead方法，这样在读取channel中的消息之后，就可以对消息进行处理了，然后将客户端和服务器端的handler配置在Bootstrap中启动就可以了，是不是很简单？一起来做一下吧。

# 启动Server

假设server端的handler叫做CheerUpServerHandler，我们使用ServerBootstrap构建两个EventLoopGroup来启动server，有看过本系列最前面文章的小伙伴可能知道，对于server端需要启动两个EventLoopGroup，一个bossGroup，一个workerGroup，这两个group是父子关系，bossGroup负责处理连接的相关问题，而workerGroup负责处理channel中的具体消息。

启动服务的代码千篇一律，如下所示：

```
 // Server配置
        //boss loop
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        //worker loop
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        final CheerUpServerHandler serverHandler = new CheerUpServerHandler();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
              // tcp/ip协议listen函数中的backlog参数,等待连接池的大小
             .option(ChannelOption.SO_BACKLOG, 100)
              //日志处理器
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new ChannelInitializer<SocketChannel>() {
                 @Override
                 //初始化channel，添加handler
                 public void initChannel(SocketChannel ch) throws Exception {
                     ChannelPipeline p = ch.pipeline();
                     //日志处理器
                     p.addLast(new LoggingHandler(LogLevel.INFO));
                     p.addLast(serverHandler);
                 }
             });

            // 启动服务器
            ChannelFuture f = b.bind(PORT).sync();

            // 等待channel关闭
            f.channel().closeFuture().sync();
```

不同的服务，启动服务器的代码基本都是一样的，这里我们需要注意这几点。

在ServerBootstrap中，我们加入了一个选项：ChannelOption.SO_BACKLOG，ChannelOption.SO_BACKLOG对应的是tcp/ip协议listen(int socketfd,int backlog)函数中的backlog参数，用来初始化服务端可连接队列，backlog参数指定了这个队列的大小。因为对于一个连接来说，处理客户端连接请求是顺序处理的，所以同一时间只能处理一个客户端连接，多个客户端来的时候，服务端将不能处理的客户端连接请求放在队列中等待处理，

另外我们还添加了两个LoggingHandler，一个是给handler添加的，一个是给childHandler添加的。LoggingHandler主要监控channel中的各种事件，然后输出对应的消息，非常好用。

比如在服务器启动的时候会输出下面的日志：

```
 [nioEventLoopGroup-2-1] INFO  i.n.handler.logging.LoggingHandler - [id: 0xd9b41ea4] REGISTERED
 [nioEventLoopGroup-2-1] INFO  i.n.handler.logging.LoggingHandler - [id: 0xd9b41ea4] BIND: 0.0.0.0/0.0.0.0:8007
 [nioEventLoopGroup-2-1] INFO  i.n.handler.logging.LoggingHandler - [id: 0xd9b41ea4, L:/0:0:0:0:0:0:0:0:8007] ACTIVE
```

这个日志是第一个LoggingHandler输出的，分别代表了服务器端的REGISTERED、BIND和ACTIVE事件。从输出我们可以看到，服务器本身绑定的是0.0.0.0:8007。

在客户端启动和服务器端建立连接的时候会输出下面的日志：

```
[nioEventLoopGroup-2-1] INFO  i.n.handler.logging.LoggingHandler - [id: 0x37a4ba9f, L:/0:0:0:0:0:0:0:0:8007] READ: [id: 0x6dcbae9c, L:/127.0.0.1:8007 - R:/127.0.0.1:54566]
[nioEventLoopGroup-2-1] INFO  i.n.handler.logging.LoggingHandler - [id: 0x37a4ba9f, L:/0:0:0:0:0:0:0:0:8007] READ COMPLETE
```

上面日志表示READ和READ COMPLETE两个事件，其中 L:/127.0.0.1:8007 - R:/127.0.0.1:54566 代表本地服务器的8007端口连接了客户端的54566端口。

对于第二个LoggingHandler来说，会输出一些具体的消息处理相关的消息。比如REGISTERED、ACTIVE、READ、WRITE、FLUSH、READ COMPLETE等事件，这里面就不一一列举了。

# 启动客户端

同样的，假设客户端的handler名称叫做ChinaClientHandler，那么可以类似启动server一样启动客户端，如下：

```
// 客户端的eventLoop
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioSocketChannel.class)
             .option(ChannelOption.TCP_NODELAY, true)
             .handler(new ChannelInitializer<SocketChannel>() {
                 @Override
                 public void initChannel(SocketChannel ch) throws Exception {
                     ChannelPipeline p = ch.pipeline();
                     //添加日志处理器
                     p.addLast(new LoggingHandler(LogLevel.INFO));
                     p.addLast(new ChinaClientHandler());
                 }
             });
            // 启动客户端
            ChannelFuture f = b.connect(HOST, PORT).sync();
```

客户端启动使用的是Bootstrap，我们同样为他配置了一个LoggingHandler，并添加了自定义的ChinaClientHandler。

# 消息处理

我们知道有两种handler，一种是inboundHandler,一种是outboundHandler,这里我们是要监控从socket读取数据的事件，所以这里客户端和服务器端的handler都继承自ChannelInboundHandlerAdapter即可。

消息处理的流程是客户端和服务器建立连接之后，会首先发送一个”中国“的消息给服务器。

客户端和服务器建立连接之后，会触发channelActive事件，所以在客户端的handler中就可以发送消息了：

```
    public void channelActive(ChannelHandlerContext ctx) {
        ctx.writeAndFlush("中国");
    }
```

服务器端在从channel中读取消息的时候会触发channelRead事件，所以服务器端的handler可以重写channelRead方法：

```
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        log.info("收到消息:{}",msg);
        ctx.writeAndFlush("加油!");
    }
```

然后客户端从channel中读取到"加油!"之后，再将”中国“写到channel中，所以客户端也需要重写方法channelRead：

```
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        ctx.writeAndFlush("中国");
    }
```

这样是不是就可以循环往复的进行下去了呢？

# 消息处理中的陷阱

事实上，当你执行上面代码你会发现，客户端确实将”中国“ 消息写入了channel，但是服务器端的channelRead并没有被触发。为什么呢？

研究发现，如果写入的对象是一个String，程序内部会有这样的错误，但是这个错误是隐藏的，你并不会在运行的程序输出中看到，所以对新手小伙伴还是很不友好的。这个错误就是：

```
DefaultChannelPromise@57f5c075(failure: java.lang.UnsupportedOperationException: unsupported message type: String (expected: ByteBuf, FileRegion))
```

从错误的信息可以看出，目前支持的消息类型有两种，分别是ByteBuf和FileRegion。

好了，我们将上面的消息类型改成ByteBuf试一试：

```
        message = Unpooled.buffer(ChinaClient.SIZE);
        message.writeBytes("中国".getBytes(StandardCharsets.UTF_8));
        
        public void channelActive(ChannelHandlerContext ctx) {
        log.info("可读字节:{},index:{}",message.readableBytes(),message.readerIndex());
        log.info("可写字节:{},index:{}",message.writableBytes(),message.writerIndex());
        ctx.writeAndFlush(message);
    }
```

上面我们定义了一个ByteBuf的全局message对象，并将其发送给server，然后在server端读取到消息之后，再发送一个ByteBuf的全局message对象给client，如此循环往复。

但是当你运行上面的程序之后会发现，服务器端确实收到了”中国“，客户端也确实收到了”加油！“，但是客户端后续发送的”中国“消息服务器端却收不到了，怎么回事呢？

我们知道ByteBuf有readableBytes、readerIndex、writableBytes、writerIndex、capacity和refCnt等属性，我们将这些属性在message发送前和发送之后进行对比：

在消息发送之前：

```
可读字节:6,readerIndex:0
可写字节:14,writerIndex:6
capacity:20,refCnt:1

```

在消息发送之后：

```
可读字节:6,readerIndex:0
可写字节:-6,writerIndex:6
capacity:0,refCnt:0
```

于是问题找到了，由于ByteBuf在处理过一次之后，refCnt变成了0，所以无法继续再次重复写入，怎么解决呢？

简单的办法就是每次发送的时候再重新new一个ByteBuf，这样就没有问题了。

但是每次都新建一个对象好像有点浪费空间，怎么办呢？既然refCnt变成了0，那么我们调用ByteBuf中的retain()方法增加refCnt不就行了？

答案就是这样，但是要注意，需要在发送之前调用retain()方法，如果是在消息被处理过后调用retain()会报异常。

# 总结

好了，运行上面的程序就可以一直给中国加油了，YYDS！

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)



