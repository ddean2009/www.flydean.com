---
slug: /41-netty-udt-byte-message
---

# 65. netty系列之:选byte还是选message?这是一个问题



# 简介

UDT给了你两种选择，byte stream或者message,到底选哪一种呢？经验告诉我们，只有小学生才做选择题，而我们应该全都要！

# 类型的定义

UDT的两种类型是怎么定义的呢？

翻看com.barchart.udt包，可以发现这两种类型定义在TypeUDT枚举类中。

```
	STREAM(1),
	DATAGRAM(2), 
```

一个叫做STREAM，它的code是1。一个叫做DATAGRAM，他的code是2.

根据两个不同的类型我们可以创建不同的selectorProvider和channelFactory。而这两个正是构建netty服务所需要的。

在NioUdtProvider这个工具类中，netty为我们提供了TypeUDT和KindUDT的六种组合ChannelFactory，他们分别是：

用于Stream的：BYTE_ACCEPTOR,BYTE_CONNECTOR,BYTE_RENDEZVOUS。

和用于Message的：MESSAGE_ACCEPTOR,MESSAGE_CONNECTOR和MESSAGE_RENDEZVOUS。

同样的，还有两个对应的SelectorProvider,分别是:

```
BYTE_PROVIDER 和 MESSAGE_PROVIDER.
```

# 搭建UDT stream服务器

如果要搭建UDT stream服务器，首先需要使用NioUdtProvider.BYTE_PROVIDER来创建NioEventLoopGroup:

```
        final NioEventLoopGroup acceptGroup = new NioEventLoopGroup(1, acceptFactory, NioUdtProvider.BYTE_PROVIDER);
        final NioEventLoopGroup connectGroup = new NioEventLoopGroup(1, connectFactory, NioUdtProvider.BYTE_PROVIDER);

```

这里，我们创建两个eventLoop，分别是acceptLoop和connectLoop。

接下来就是在ServerBootstrap中绑定上面的两个group，并且指定channelFactory。这里我们需要NioUdtProvider.BYTE_ACCEPTOR：

```
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
                                    new UDTByteEchoServerHandler());
                        }
                    });
```

就这么简单。

# 搭建UDT message服务器

搭建UDT message服务器的步骤和stream很类似，不同的是需要使用NioUdtProvider.MESSAGE_PROVIDER作为selectorProvider：

```
        final NioEventLoopGroup acceptGroup =
                new NioEventLoopGroup(1, acceptFactory, NioUdtProvider.MESSAGE_PROVIDER);
        final NioEventLoopGroup connectGroup =
                new NioEventLoopGroup(1, connectFactory, NioUdtProvider.MESSAGE_PROVIDER);
```

然后在绑定ServerBootstrap的时候使用NioUdtProvider.MESSAGE_ACCEPTOR作为channelFactory:

```
final ServerBootstrap boot = new ServerBootstrap();
            boot.group(acceptGroup, connectGroup)
                    .channelFactory(NioUdtProvider.MESSAGE_ACCEPTOR)
                    .option(ChannelOption.SO_BACKLOG, 10)
                    .handler(new LoggingHandler(LogLevel.INFO))
                    .childHandler(new ChannelInitializer<UdtChannel>() {
                        @Override
                        public void initChannel(final UdtChannel ch)
                                throws Exception {
                            ch.pipeline().addLast(
                                    new LoggingHandler(LogLevel.INFO),
                                    new UDTMsgEchoServerHandler());
                        }
                    });
```

同样很简单。

# Stream和Message的handler

不同的UDT类型，需要使用不同的handler。

对于Stream来说，它的底层是byte,所以我们的消息处理也是以byte的形式进行的,我们以下面的方式来构建message：

```
private final ByteBuf message;
message = Unpooled.buffer(UDTByteEchoClient.SIZE);
        message.writeBytes("www.flydean.com".getBytes(StandardCharsets.UTF_8));
```

然后使用ctx.writeAndFlush(message)将其写入到channel中。

对于message来说，它实际上格式对ByteBuf的封装。netty中有个对应的类叫做UdtMessage：

```
public final class UdtMessage extends DefaultByteBufHolder
```

UdtMessage是一个ByteBufHolder，所以它实际上是一个ByteBuf的封装。

我们需要将ByteBuf封装成UdtMessage：

```
private final UdtMessage message;
final ByteBuf byteBuf = Unpooled.buffer(UDTMsgEchoClient.SIZE);
        byteBuf.writeBytes("www.flydean.com".getBytes(StandardCharsets.UTF_8));
        message = new UdtMessage(byteBuf);
```

然后将这个UdtMessage发送到channel中：

```
ctx.writeAndFlush(message);
```

这样你就学会了在UDT协议中使用stream和message两种数据类型了。

# 总结

大家可能觉得不同的数据类型原来实现起来这么简单。这全都要归功于netty优秀的封装和设计。

感谢netty！

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)

