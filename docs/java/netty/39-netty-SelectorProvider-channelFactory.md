---
slug: /39-netty-SelectorProvider-channelFactory
---

# 63. netty系列之:好马配好鞍,为channel选择配套的selector



# 简介

我们知道netty的基础是channel和在channel之上的selector,当然作为一个nio框架，channel和selector不仅仅是netty的基础，也是所有nio实现的基础。

同样的，我们知道netty很多种不同的协议，这些协议都是在channel上进行通讯的，那么对于不同的协议来说，使用的channel和selector会有所不同吗？

带着这个疑问，我们一起来深入探究一下吧。

# netty服务的基本构建方式

netty可以分为客户端和服务器端，实际上客户端和服务器端的构造方式差别不大，这里为了简单起见，以netty中服务器端的构建为例子进行研究。

回顾一下我们最开始搭建的netty服务器，其对应的代码如下：

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

我们要注意的是两个地方，一个是ServerBootstrap的group方法，一个是它的channel方法。

## EventLoopGroup

group有两种实现方式，可以带一个参数，也可以带两个参数。参数都是EventLoopGroup,EventLoopGroup主要用来注册channel, 供后续的Selector进行选择。

如果使用一个参数的形式，则一个EventLoopGroup同时处理acceptor和client的事件，如果使用两个参数，则会将两者分开。

当然，这都不是今天要讲的重点，今天要讲的是EventLoopGroup的构建在不同的协议中有什么不同。

EventLoopGroup本身是一个接口，他有很多种实现,但是本质上还是两种EventLoop:SingleThreadEventLoop和MultithreadEventLoopGroup.

也就是用单线程进行EventLoop处理和多线程进行EventLoop处理。

比如上面我们常用的NioEventLoopGroup，就是一个单线程的EventLoop。

NioEventLoopGroup通常我们使用的是无参的构造函数，实际上NioEventLoopGroup可以传入ThreadFactory,thread的个数，SelectorProvider和SelectStrategyFactory.

netty只提供了一个SelectStrategyFactory的实现：DefaultSelectStrategyFactory。

而对应SelectorProvider来说，默认的实现是SelectorProvider.provider(), 我们看下这个方法的具体实现:

```
    public static SelectorProvider provider() {
        synchronized (lock) {
            if (provider != null)
                return provider;
            return AccessController.doPrivileged(
                new PrivilegedAction<SelectorProvider>() {
                    public SelectorProvider run() {
                            if (loadProviderFromProperty())
                                return provider;
                            if (loadProviderAsService())
                                return provider;
                            provider = sun.nio.ch.DefaultSelectorProvider.create();
                            return provider;
                        }
                    });
        }
    }
```

可以看到默认情况下，SelectorProvider有三种创建方式。

第一种就是从系统属性中查找：java.nio.channels.spi.SelectorProvider：

```
String cn = System.getProperty("java.nio.channels.spi.SelectorProvider");
Class<?> c = Class.forName(cn, true,
                                       ClassLoader.getSystemClassLoader());
            provider = (SelectorProvider)c.newInstance();
```

如果有定义，则创建一个实例返回。

如果没有的话，则会从"META-INF/services/"中加载service Loader :

```
    private static boolean loadProviderAsService() {

        ServiceLoader<SelectorProvider> sl =
            ServiceLoader.load(SelectorProvider.class,
                               ClassLoader.getSystemClassLoader());
        Iterator<SelectorProvider> i = sl.iterator();
```

如果servie也没有找到的话，则会使用最后默认的sun.nio.ch.DefaultSelectorProvider.

## channel

默认情况下，我们使用的是NioServerSocketChannel。他实际是从上面提到的默认的SelectorProvider来创建的。

```
private static final SelectorProvider DEFAULT_SELECTOR_PROVIDER = SelectorProvider.provider();
return DEFAULT_SELECTOR_PROVIDER.openServerSocketChannel();
```

所以使用的channel需要跟selector相匹配。 

我们可以直接使用channel，也可以使用ChannelFactory,通过这些Factory来生成channel。

如果要使用ChannelFactory，则可以调用ServerBootstrap的channelFactory方法。

# 多种构建方式

上面提到了最基本的netty server构建方式。对应的是socket协议。

如果是要进行UDP连接，对应的channel应该换成NioDatagramChannel,如下：

```
EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioDatagramChannel.class)
             .option(ChannelOption.SO_BROADCAST, true)
             .handler(new UDPServerHandler());

            b.bind(PORT).sync().channel().closeFuture().await();
```

EventLoopGroup可以保持不变。

因为netty底层是基于Socket进行通讯的，socket底层又是基于TCP或者UDP协议，所以在netty中实现的http或者http2或者SOCKS协议都是在socket连接基础上进行的。

所以对http或者http2来说，channel还是NioServerSocketChannel。

可以看到只有UDP协议有所不同。同样的基于UDP协议之上的UDT协议也是不同的，其使用如下：

```
 final NioEventLoopGroup acceptGroup = new NioEventLoopGroup(1, acceptFactory, NioUdtProvider.BYTE_PROVIDER);
        final NioEventLoopGroup connectGroup = new NioEventLoopGroup(1, connectFactory, NioUdtProvider.BYTE_PROVIDER);

 final ServerBootstrap boot = new ServerBootstrap();
            boot.group(acceptGroup, connectGroup)
                    .channelFactory(NioUdtProvider.BYTE_ACCEPTOR)
                    .option(ChannelOption.SO_BACKLOG, 10)
                    .handler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new ChannelInitializer<UdtChannel>() {
                        @Override
                        public void initChannel(final UdtChannel ch) {
                            ch.pipeline().addLast(
                                    new LoggingHandler(LogLevel.INFO),
                                    new UDTEchoServerHandler());
                        }
                    });
```

UDT使用的是NioUdtProvider中提供的BYTE_PROVIDER和BYTE_ACCEPTOR分别作为selector和channelFactory。

# 其他的channel

除了NioSocketChannel之外，还有EpollChannel、KQueueChannel、SctpChannel,这些channel都是针对不同协议来使用的。我们会在后续的文章中详细进行介绍。

# 总结

channel和selector是netty的基础，在这基础之上，netty可以扩展适配所有基于tcp和udp的协议，可以说非常的强大。













