---
slug: /44-netty-tcp-fast-open
---

# 68. netty系列之:让TCP连接快一点,再快一点



# 简介

经典的TCP三次握手大家应该很熟悉了，三次握手按道理说应该是最优的方案了，当然这是对于通用的情况来说的。那么在某些特殊的情况下是不是可以提升TCP建立连接的速度呢？

答案是肯定的，这就是今天我们要讲的TCP fast open和netty。

# TCP fast open

什么是TCP fast open呢？

TCP fast open也可以简写为TFO，它是TCP协议的一种扩展。为什么是fast open呢？这是因为TFO可以在初始化建立连接的时候就带上部分数据，这样在TCP连接建立之后，可以减少和服务器交互的次数，从而在特定的情况下减少响应的时间。

既然TFO这么好，为什么我们很少见到使用TFO协议的呢？

这是因为TFO是有缺陷的，因为TFO会在sync包中带上一些数据信息，那么当sync包重发的时候，就会造成接收方接受到重复的数据。

所以，如果是用TFO，那么接收方则需要具有能够处理重复数据的能力。

在程序界，防止数据重复提交有一个好听的名字叫做幂等性，只有具有幂等性的服务器才能够使用TFO。

# 开启TFO

既然TFO这么优秀，怎么才能开启TFO呢？

TFO的开启首先需要操作系统的支持，如果你是mac系统，恭喜你，mac默认情况下已经支持TFO了，你不需要进行任何操作。

如果你是Linux系统，那么需要查看/proc/sys/net/ipv4/tcp_fastopen这个文件。

tcp_fastopen可以有四种值，如下所示：

0 -- 表示TFO未开启
1 -- 表示TFO开启了，但是只对客户端有效
2 -- 表示TFO开启了，但是只对服务器端有效
3 -- 表示TFO开启了，同时对客户端和服务器端有效

通过上面的设置，我们就在操作系统层开启了TFO的支持。

接下来，我们看一下如何在netty中使用TFO。

# netty对TFO的支持

首先我们看下如何在netty的服务器端开启TFO支持。

在这之前，我们先回顾一下如何建议一个普通的netty服务器：

```
EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new TFOServerHandler());
                        }
                    })
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // 绑定端口并开始接收连接
            ChannelFuture f = b.bind(port).sync();
```

上面的代码中，我们看到ServerBootstrap可以设置option参数，ChannelOption中包含了所有可以设置的channel的参数，对应的TFO的参数是ChannelOption.TCP_FASTOPEN, 所以我们只需要添加到ServerBootstrap中即可：

```
sb.option(ChannelOption.TCP_FASTOPEN, 50)
```

ChannelOption.TCP_FASTOPEN的值表示的是socket连接中可以处于等待状态的fast-open请求的个数。

对于客户端来说，同样需要进行一些改动，先来看看传统的client端是怎么工作的：

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
                     p.addLast(new TFOClientHandler());
                 }
             });

            // 连接服务器
            ChannelFuture f = b.connect(HOST, PORT).sync();
```

client要支持TFO，需要添加这样的操作：

```
b.option(ChannelOption.TCP_FASTOPEN_CONNECT, true)
```

还记得TFO是做什么的吗？TFO就是在sync包中发送了一些数据。所以我们需要在client端对发送的数据进行处理,也就是说在client和server端建立连接之前就需要向channel中发送消息。

要获得非建立连接的channel，则可以调用Bootstrap的register方法来获取channel：

```
Channel channel = b.register().sync().channel();
```

然后向该channel中写入byteBuf：

```
ByteBuf fastOpenData = directBuffer();
            fastOpenData.writeBytes("TFO message".getBytes(StandardCharsets.UTF_8));
            channel.write(fastOpenData);
```

最后再和服务器建立连接：

```
// 连接服务器
            SocketAddress serverAddress =  SocketUtils.socketAddress("127.0.0.1", 8000);
            ChannelFuture f = channel.connect(serverAddress).sync();
```

# 总结

这样一个一个支持TFO的客户端和服务器就完成了。尽情使用吧。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)




