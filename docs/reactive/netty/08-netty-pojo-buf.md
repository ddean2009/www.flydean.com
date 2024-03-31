---
slug: /08-netty-pojo-buf
---

# 18. netty系列之:使用POJO替代buf



# 简介

在之前的文章中我们提到了，对于NioSocketChannel来说，它不接收最基本的string消息，只接收ByteBuf和FileRegion。但是ByteBuf是以二进制的形式进行处理的，对于程序员来说太不直观了，处理起来也比较麻烦，有没有可能直接处理java简单对象呢？本文将会探讨一下这个问题。

# decode和encode

比如我们需要直接向channel中写入一个字符串，在之前的文章中，我们知道这是不可以的，会报下面的错误：


```
DefaultChannelPromise@57f5c075(failure: java.lang.UnsupportedOperationException: unsupported message type: String (expected: ByteBuf, FileRegion))
```

也就说ChannelPromise只接受ByteBuf和FileRegion，那么怎么做呢？

既然ChannelPromise只接受ByteBuf和FileRegion，那么我们就需要把String对象转换成ByteBuf即可。

也就是说在写入String之前把String转换成ByteBuf，当要读取数据的时候，再把ByteBuf转换成String。

我们知道ChannelPipeline中可以添加多个handler，并且控制这些handler的顺序。

那么我们的思路就出来了，在ChannelPipeline中添加一个encode，用于数据写入的是对数据进行编码成ByteBuf，然后再添加一个decode,用于在数据写出的时候对数据进行解码成对应的对象。

encode,decode是不是很熟悉？对了，这就是对象的序列化。

# 对象序列化

netty中对象序列化是要把传输的对象和ByteBuf直接互相转换，当然我们可以自己实现这个转换对象。但是netty已经为我们提供了方便的两个转换类：ObjectEncoder和ObjectDecoder。

先看ObjectEncoder，他的作用就是将对象转换成为ByteBuf。

这个类很简单，我们对其分析一下：

```
public class ObjectEncoder extends MessageToByteEncoder<Serializable> {
    private static final byte[] LENGTH_PLACEHOLDER = new byte[4];

    @Override
    protected void encode(ChannelHandlerContext ctx, Serializable msg, ByteBuf out) throws Exception {
        int startIdx = out.writerIndex();

        ByteBufOutputStream bout = new ByteBufOutputStream(out);
        ObjectOutputStream oout = null;
        try {
            bout.write(LENGTH_PLACEHOLDER);
            oout = new CompactObjectOutputStream(bout);
            oout.writeObject(msg);
            oout.flush();
        } finally {
            if (oout != null) {
                oout.close();
            } else {
                bout.close();
            }
        }

        int endIdx = out.writerIndex();

        out.setInt(startIdx, endIdx - startIdx - 4);
    }
}
```

ObjectEncoder继承了MessageToByteEncoder，而MessageToByteEncoder又继承了ChannelOutboundHandlerAdapter。为什么是OutBound呢？这是因为我们是要对写入的对象进行转换，所以是outbound。

首先使用ByteBufOutputStream对out ByteBuf进行封装，在bout中，首先写入了一个LENGTH_PLACEHOLDER字段，用来表示stream中中Byte的长度。然后用一个CompactObjectOutputStream对bout进行封装，最后就可以用CompactObjectOutputStream写入对象了。

对应的，netty还有一个ObjectDecoder对象，用于将ByteBuf转换成对应的对象，ObjectDecoder继承自LengthFieldBasedFrameDecoder，实际上他是一个ByteToMessageDecoder，也是一个ChannelInboundHandlerAdapter，用来对数据读取进行处理。

我们看下ObjectDecoder中最重要的decode方法：

```
    protected Object decode(ChannelHandlerContext ctx, ByteBuf in) throws Exception {
        ByteBuf frame = (ByteBuf) super.decode(ctx, in);
        if (frame == null) {
            return null;
        }

        ObjectInputStream ois = new CompactObjectInputStream(new ByteBufInputStream(frame, true), classResolver);
        try {
            return ois.readObject();
        } finally {
            ois.close();
        }
    }
```

上面的代码可以看到，将输入的ByteBuf转换为ByteBufInputStream，最后转换成为CompactObjectInputStream，就可以直接读取对象了。

# 使用编码和解码器

有了上面两个编码解码器，直接需要将其添加到client和server端的ChannelPipeline中就可以了。

对于server端，其核心代码如下：

```
//定义bossGroup和workerGroup
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                public void initChannel(SocketChannel ch) throws Exception {
                    ChannelPipeline p = ch.pipeline();
                    p.addLast(
                            // 添加encoder和decoder
                            new ObjectEncoder(),
                            new ObjectDecoder(ClassResolvers.cacheDisabled(null)),
                            new PojoServerHandler());
                }
             });

            // 绑定端口，并准备接受连接
            b.bind(PORT).sync().channel().closeFuture().sync();
```

同样的，对于client端，我们其核心代码如下：

```
EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioSocketChannel.class)
             .handler(new ChannelInitializer<SocketChannel>() {
                @Override
                public void initChannel(SocketChannel ch) throws Exception {
                    ChannelPipeline p = ch.pipeline();
                    p.addLast(
                            // 添加encoder和decoder
                            new ObjectEncoder(),
                            new ObjectDecoder(ClassResolvers.cacheDisabled(null)),
                            new PojoClientHandler());
                }
             });

            // 建立连接
            b.connect(HOST, PORT).sync().channel().closeFuture().sync();
```

可以看到上面的逻辑就是将ObjectEncoder和ObjectDecoder添加到ChannelPipeline中即可。

最后，就可以在客户端和浏览器端通过调用：

```
ctx.write("加油！");
```

直接写入字符串对象了。

# 总结

有了ObjectEncoder和ObjectDecoder，我们就可以不用受限于ByteBuf了，程序的灵活程度得到了大幅提升。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)





