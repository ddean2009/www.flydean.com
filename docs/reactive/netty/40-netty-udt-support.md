---
slug: /40-netty-udt-support
---

# 64. netty系列之:请netty再爱UDT一次



# 简介

UDT是一个非常优秀的协议，可以提供在UDP协议基础上进行高速数据传输。但是可惜的是在netty 4.1.7中，UDT传输协议已经被标记为Deprecated了!

意味着在后面的netty版本中，你可能再也看不到UDT协议了.

优秀的协议怎么能够被埋没，让我们揭开UDT的面纱，展示其优秀的特性，让netty再爱UDT一次吧。

# netty对UDT的支持

netty对UDT的支持体现在有一个专门的UDT包来处理UDT相关事情：package io.netty.channel.udt。

这个包里面主要定义了UDT的各种channel、channel配置、UDT消息和提供ChannelFactory和SelectorProvider的工具类NioUdtProvider.

## 搭建一个支持UDT的netty服务

按照netty的标准流程，现在是需要创建一个netty服务的时候了。

netty创建server服务无非就是创建EventLoop、创建ServerBootstrap、绑定EventLoop、指定channel类型就完了，非常的简单。

唯一不同的就是具体的childHandler,可能根据具体协议的不同使用不同的处理方式。

当然，如果不是NioSocketChannel，那么对应的ChannelFactory和SelectorProvider也会有所变化。

没关系，我们先看下如何创建支持UDT的netty服务：

```
 final ThreadFactory acceptFactory = new DefaultThreadFactory("accept");
        final ThreadFactory connectFactory = new DefaultThreadFactory("connect");
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
            // 开启服务
            final ChannelFuture future = boot.bind(PORT).sync();
```

可以看到，UDT和普通netty socket服务不同的地方在于它的selector和channelFactory都是由NioUdtProvider来提供了。

NioUdtProvider是netty核心包中的内容，他提供了对UDT的有用封装，我们不需要要懂太多UDT内部的实现，就可以使用UDT协议，是不是很美妙。

## 异常来袭

如果有小伙伴兴冲冲的拿上面这段代码去尝试运行，那么很可惜你会得到异常，异常大概类似下面的情况：

```
包com.barchart.udt找不到！
```

什么？直接使用netty包中的类居然会报错？是可忍孰不可忍！

我们来仔细分析一下，这里只有一个新的类就是NioUdtProvider，打开NioUdtProvider的源码，在import一栏，我们赫然发现居然引用了不属于netty的包，就是这些包报错了：

```
import com.barchart.udt.SocketUDT;
import com.barchart.udt.TypeUDT;
import com.barchart.udt.nio.ChannelUDT;
import com.barchart.udt.nio.KindUDT;
import com.barchart.udt.nio.RendezvousChannelUDT;
import com.barchart.udt.nio.SelectorProviderUDT;
```

虽然很诡异，但是我们要想程序跑起来还是需要找出这些依赖包，经过本人的跋山涉水、翻山越岭终于功夫不负苦心人，下面的依赖包找到了：

```
<dependency>
            <groupId>com.barchart.udt</groupId>
            <artifactId>barchart-udt-core</artifactId>
            <version>2.3.0</version>
        </dependency>

        <dependency>
            <groupId>com.barchart.udt</groupId>
            <artifactId>barchart-udt-bundle</artifactId>
            <version>2.3.0</version>
        </dependency>
```

netty核心包居然要依赖与第三方库，这可能就是netty准备删除对UDT支持的原因吧。

## TypeUDT和KindUDT

如果你去查看barchart中类的具体信息，就会发现这个包的作者有个癖好，喜欢把类后面带上一个UDT。

当你看到满屏的类都是以UDT结尾的时候，没错，它就是netty UDT依赖的包barchart本包了。

大牛们开发的包我们不能说他不好，只能说看起来有点累....

barchart包中有两个比较核心的用来区分UDT type和kind的两个类，分别叫做TypeUDT和KindUDT.

Type和kind翻译成中文好像没太大区别。但是两者在UDT中还是有很大不同的。

TypeUDT表示的是UDT socket的模式。它有两个值，分别是stream和datagram:

```
	STREAM(1),
	DATAGRAM(2),
```

表示数据传输是以字节流的形式还是以数据报文消息的格式来进行传输。

KindUDT则用来区分是服务器端还是客户端,它有三种模式：

```
ACCEPTOR,
CONNECTOR,
RENDEZVOUS
```

server模式对应的是ACCEPTOR,用来监听和接收连接.它的代表是ServerSocketChannelUDT，通过调用accept()方法返回一个CONNECTOR.

CONNECTOR模式可以同时在客户端和服务器端使用，它的代表类是SocketChannelUDT.

如果是在server端,则是通过调用server端的accept方法生成的。如果是在客户端，则表示的是客户端和服务器端之间的连接。

还有一种模式是RENDEZVOUS模式。这种模式表示的是连接的每一侧都有对称对等的channel。也就是一个双向的模式，它的代表类是RendezvousChannelUDT。

## 构建ChannelFactory

上面提到的两种Type和三种Kind都是用来定义channel的，所以如果将其混合，会生成六种不同的channelFactory，分别是：

```
public static final ChannelFactory<UdtServerChannel> BYTE_ACCEPTOR = new NioUdtProvider<UdtServerChannel>(
            TypeUDT.STREAM, KindUDT.ACCEPTOR);

public static final ChannelFactory<UdtChannel> BYTE_CONNECTOR = new NioUdtProvider<UdtChannel>(
            TypeUDT.STREAM, KindUDT.CONNECTOR);

public static final ChannelFactory<UdtChannel> BYTE_RENDEZVOUS = new NioUdtProvider<UdtChannel>(
            TypeUDT.STREAM, KindUDT.RENDEZVOUS);

public static final ChannelFactory<UdtServerChannel> MESSAGE_ACCEPTOR = new NioUdtProvider<UdtServerChannel>(
            TypeUDT.DATAGRAM, KindUDT.ACCEPTOR);

public static final ChannelFactory<UdtChannel> MESSAGE_CONNECTOR = new NioUdtProvider<UdtChannel>(
            TypeUDT.DATAGRAM, KindUDT.CONNECTOR);

public static final ChannelFactory<UdtChannel> MESSAGE_RENDEZVOUS = new NioUdtProvider<UdtChannel>(
            TypeUDT.DATAGRAM, KindUDT.RENDEZVOUS);

```

这些channelFactory通过调用newChannel()方法来生成新的channel。

但是归根节点，这些channel最后是调用SelectorProviderUDT的from方法来生成channel的。

## SelectorProviderUDT

SelectorProviderUDT根据TypeUDT的不同有两种，分别是：

```
public static final SelectorProviderUDT DATAGRAM = 
	new SelectorProviderUDT(TypeUDT.DATAGRAM);

	public static final SelectorProviderUDT STREAM = 
	new SelectorProviderUDT(TypeUDT.STREAM);
```

可以通过调用他的三个方法来生成对应的channel：

```
	public RendezvousChannelUDT openRendezvousChannel() throws IOException {
		final SocketUDT socketUDT = new SocketUDT(type);
		return new RendezvousChannelUDT(this, socketUDT);
	}

    	public ServerSocketChannelUDT openServerSocketChannel() throws IOException {
		final SocketUDT serverSocketUDT = new SocketUDT(type);
		return new ServerSocketChannelUDT(this, serverSocketUDT);
	}

    	public SocketChannelUDT openSocketChannel() throws IOException {
		final SocketUDT socketUDT = new SocketUDT(type);
		return new SocketChannelUDT(this, socketUDT);
	}
```

# 使用UDT

搭建好了netty服务器，剩下就是编写Handler对数据进行处理了。

这里我们简单的将客户端写入的数据再回写。客户端先创建一个message：

```
message = Unpooled.buffer(UDTEchoClient.SIZE);
 message.writeBytes("www.flydean.com".getBytes(StandardCharsets.UTF_8));
```

再写入到server端：

```
    public void channelActive(final ChannelHandlerContext ctx) {
        log.info("channel active " + NioUdtProvider.socketUDT(ctx.channel()).toStringOptions());
        ctx.writeAndFlush(message);
    }
```

服务器端通过channelRead方法来接收：

```
public void channelRead(final ChannelHandlerContext ctx, Object msg) {
        ctx.write(msg);
    }
```

# 总结

以上就是netty中使用UDT的原理和一个简单的例子。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)

