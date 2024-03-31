---
slug: /11-netty-udp
---

# 21. netty系列之:使用UDP协议



# 简介

在之前的系列文章中，我们到了使用netty做聊天服务器，聊天服务器使用的SocketChannel，也就是说底层的协议使用的是基于TCP的Socket协议。今天我们将会给大家介绍如何在netty中使用UDP协议。

# UDP协议

UDP（ User Datagram Protocol )，也叫用户数据报协议。

UDP 的主要功能和亮点并不在于它引入了什么特性，而在于它忽略的那些特性：不保证消息交付，不保证交付顺序，不跟踪连接状态，不需要拥塞控制。

我们来看一下UDP的数据包：

![](https://img-blog.csdnimg.cn/20200617170251803.png)

UDP是一种无连接的协议，发送者只管发送数据包即可，并不负责处理和保证数据是否成功发送，数据是否被处理完成等。它的唯一作用就是发送。

在JDK中表示UDP的有一个专门的类叫做：java.net.DatagramPacket,在NIO中还有一个java.nio.channels.DatagramChannel,专门负责处理UDP的channel。

这里我们要将的是netty，netty中对于UDP协议也有上面的两个类，名字虽然是一样的，但是对应的包不同。他们分别是：

io.netty.channel.socket.DatagramPacket 和 io.netty.channel.socket.DatagramChannel，当然netty中的这两个类是对JDK自带类的增强。

先看一下netty中DatagramPacket的定义：

```
public class DatagramPacket
        extends DefaultAddressedEnvelope<ByteBuf, InetSocketAddress> implements ByteBufHolder 
```

DatagramPacket类实现了ByteBufHolder接口，表示它里面存放的是ByteBuf。然后他又继承自DefaultAddressedEnvelope，这个类是对地址的封装，其中ByteBuf表示传递消息的类型，InetSocketAddress表示目标的地址，它是一个IP地址+端口号的封装。

从上面的UDP协议我们知道，UDP只需要知道目标地址和对应的消息即可，所以DatagramPacket中包含的数据已经够用了。

DatagramChannel是用来传递DatagramPacket的，因为DatagramChannel是一个接口，所以一般使用NioDatagramChannel作为真正使用的类。

# String和ByteBuf的转换

之前我们讲到过，netty中的channel只接受ByteBuf数据类型，如果直接写入String会报错，之前的系列文章中，我们讲过两种处理方法，第一种是使用ObjectEncoder和ObjectDecoder在写入ByteBuf之前，对对象进行序列化，这一种不仅适合String，也适合Object对象。

第二种是使用StringEncoder和StringDecoder专门处理String的encode和decode，这种处理只能处理String的转换，对Object无效。

如果你不想使用这些encoder和decoder还可以直接使用ByteBuf和String进行转换。

比如要将String写入ByteBuf可以调用Unpooled.copiedBuffer的命令如下：

```
Unpooled.copiedBuffer("开始广播", CharsetUtil.UTF_8)
```

将ByteBuf转换成为String则可以调用：

```
byteBuf.toString(CharsetUtil.UTF_8)
```

# 构建DatagramPacket

DatagramPacket总共可以接受三个参数，分别是要发送的数据data,要接收数据包的地址和要发送数据包的地址。

这里我们并不关心发送数据包的地址，那么只需要两个参数即可，对于客户端来说，我们发送一个”开始广播“的消息给服务器端，告诉服务器端可以向客户发送回复消息了，如下所示：

```
new DatagramPacket(
                    Unpooled.copiedBuffer("开始广播", CharsetUtil.UTF_8),
                    SocketUtils.socketAddress("255.255.255.255", PORT))
```

上我们使用SocketUtils.socketAddress创建了一个特殊的地址，255.255.255.255是一个特殊的广播地址，意味着所有的主机，因为我们的客户端并不知道服务器的地址，所以使用255.255.255.255来广播。

构建好的DatagramPacket，里面有一个sender()方法，可以用来获取客户端的地址，所以在服务器端可以这样构建要发送的packge：

```
new DatagramPacket(
                    Unpooled.copiedBuffer("广播: " + nextQuote(), CharsetUtil.UTF_8), packet.sender())
```

# 启动客户端和服务器

UDP的客户端和服务器启动和socket稍微有所不同，如果是socket，那么使用的channel是NioSocketChannel，如果是UDP，则使用的是NioDatagramChannel。如下是服务器端启动的代码：

```
EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioDatagramChannel.class)
             .option(ChannelOption.SO_BROADCAST, true)
             .handler(new UDPServerHandler());

            b.bind(PORT).sync().channel().closeFuture().await();
        } finally {
            group.shutdownGracefully();
        }
```

> 注意，这里我们需要设置ChannelOption.SO_BROADCAST为true，因为UDP是以广播的形式发送消息的。

客户端的实现和socket稍微有所不同，下面是客户端的启动实现：

```
 EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioDatagramChannel.class)
             .option(ChannelOption.SO_BROADCAST, true)
             .handler(new UDPClientHandler());

            Channel ch = b.bind(0).sync().channel();
```

对于UDP来说，并不存在地址绑定一说，所以上Bootstrap调用bind(0)。

# 总结

本文讲解了netty中UDP协议的实现，UDP相较于Socket连接而言更加简单。


本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)

