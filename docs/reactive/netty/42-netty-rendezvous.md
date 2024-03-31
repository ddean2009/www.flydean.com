---
slug: /42-netty-rendezvous
---

# 66. netty系列之:真正的平等--UDT中的Rendezvous



# 简介

在我们之前提到的所有netty知识中，netty好像都被分为客户端和服务器端两部分。服务器端监听连接，并对连接中的消息进行处理。而客户端则向服务器端建立请求连接，从而可以发送消息。

但是这一切都要在UDT协议中被终结，因为UDT提供了Rendezvous，一种平等的连接类型，节点之间是对等关系。

从来都没有救世主，也没有神仙和皇帝，只有同为节点的好兄弟。

# 建立支持Rendezvous的服务器

因为是对等的关系，所以这里不需要使用到ServerBootstrap,使用普通的Bootstrap就够了。

group还是要的，这里使用NioEventLoopGroup，NioEventLoopGroup需要提供了SelectorProvider。UDT提供了两种provider,分别是NioUdtProvider.BYTE_PROVIDER 和 NioUdtProvider.MESSAGE_PROVIDER,分别表示stream和message两种格式：

```
final NioEventLoopGroup connectGroup = new NioEventLoopGroup(1,
                connectFactory, NioUdtProvider.BYTE_PROVIDER);

final NioEventLoopGroup connectGroup = new NioEventLoopGroup(1,
                connectFactory, NioUdtProvider.MESSAGE_PROVIDER);
```

接下来就是创建Bootstrap，并绑定group和设置channelFactory.

当然，这里的channelFactory也有两种，分别是NiNioUdtProvider.BYTE_RENDEZVOUS和NioUdtProvider.BYTE_RENDEZVOUS。

那么可以有下面两种创建的方法,第一种是byte stream的：

```
 final Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(connectGroup)
                    .channelFactory(NioUdtProvider.BYTE_RENDEZVOUS)
                    .handler(new ChannelInitializer<UdtChannel>() {
                        @Override
                        protected void initChannel(UdtChannel ch) throws Exception {
                            ch.pipeline().addLast(
                                    new LoggingHandler(LogLevel.INFO),
                                    new UDTByteHandler(messageSize));
```

第二种是message的：

```
final Bootstrap boot = new Bootstrap();
            boot.group(connectGroup)
                    .channelFactory(NioUdtProvider.MESSAGE_RENDEZVOUS)
                    .handler(new ChannelInitializer<UdtChannel>() {
                        @Override
                        public void initChannel(final UdtChannel ch)
                                throws Exception {
                            ch.pipeline().addLast(
                                    new LoggingHandler(LogLevel.INFO),
                                    new UDTMsgHandler(messageSize));
                        }
                    });
```

至此，两个支持不同UDT类型的Rendezvous服务器就建立起来了。

接下来就是对消息的处理了。

# 处理不同的消息

有了支持byte和message两种格式的服务器，接下来就是如何处理对应的消息了。

对于byte格式的UDT，channel中传输的消息就是ByteBuf，我们只需要构建ByteBuf的消息，然后在channel中传输即可：

```
private final ByteBuf message
message = Unpooled.buffer(messageSize);
message.writeBytes("www.flydean.com".getBytes(StandardCharsets.UTF_8));
ctx.writeAndFlush(message);
```

对应message格式的UDT，netty提供了一个专门的类UdtMessage对其进行封装，UdtMessage继承值DefaultByteBufHolder，他就是对ByteBuf的封装。

我们可以这样创建一个UdtMessage并发送它：

```
private final UdtMessage message;
final ByteBuf byteBuf = Unpooled.buffer(messageSize);
byteBuf.writeBytes("www.flydean.com".getBytes(StandardCharsets.UTF_8));
message = new UdtMessage(byteBuf);

ctx.writeAndFlush(message);
```

# 节点之间的交互

上面我们分别建立了两个节点，这两个节点是对等关系，那么怎么将这两个节点联系起来呢？

我们调用Bootstrap的connect方法如下：

```
final ChannelFuture f = boot.connect(peer, self).sync();
            f.channel().closeFuture().sync();
```

这里的connect传入两个SocketAddress参数，第一个参数是remoteAddress,第二个参数表示的是localAddress.

当然，connect还有一种常用的用法就是连接到远程的服务器：

```
public ChannelFuture connect(String inetHost, int inetPort)
```

这也是我们最常见的那种用法。

# 总结

以上就是UDT中的Rendezvous的使用。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)











