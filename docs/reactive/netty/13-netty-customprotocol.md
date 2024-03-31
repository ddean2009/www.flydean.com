---
slug: /13-netty-customprotocol
---

# 23. netty系列之:自定义编码解码器



# 简介

在之前的netty系列文章中，我们讲到了如何将对象或者String转换成为ByteBuf，通过使用netty自带的encoder和decoder可以实现非常方便的对象和ByteBuf之间的转换，然后就可以向channel中随意写入对象和字符串了。

使用netty自带的编码器当然很好，但是如果你有些特殊的需求，比如希望在编码的过程中对数据进行变换，或者对对象的字段进行选择，那么可能就需要自定义编码解码器了。

# 自定义编码器

自定义编码器需要继承`MessageToByteEncoder<I>` 类，并实现encode方法，在该方法中写入具体的编码逻辑。

本例我们希望计算2的N次方，据说将一张纸折叠100次可以达到地球到月亮的高度，这么大的数据普通的number肯定是装不下的，我们将会使用BigInteger来对这个巨大的数字进行保存。

那么对于被编码器来说，则需要将这个BigInteger转换成为byte数组。同时在byte数组读取的过程中，我们需要界定到底哪些byte数据是属于同一个BigInteger的，这就需要对写入的数据格式做一个约定。

这里我们使用三部分的数据结构来表示一个BigInteger。第一部分是一个magic word也就是魔法词，这里我们使用魔法词“N”，当读取到这个魔法词就表示接下来的数字是BigInteger。第二部分是表示bigInteger数字的byte数组的长度，获取到这个长度值，就可以读取到所有的byte数组值，最后将其转换成为BigInteger。

因为BigInteger是Number的子类，为了更加泛化编码器，我们使用Number作为MessageToByteEncoder的泛型，核心编码代码如下：

```
 protected void encode(ChannelHandlerContext ctx, Number msg, ByteBuf out) {
        // 将number编码成为ByteBuf
        BigInteger v;
        if (msg instanceof BigInteger) {
            v = (BigInteger) msg;
        } else {
            v = new BigInteger(String.valueOf(msg));
        }

        // 将BigInteger转换成为byte[]数组
        byte[] data = v.toByteArray();
        int dataLength = data.length;

        // 将Number进行编码
        out.writeByte((byte) 'N'); // 魔法词
        out.writeInt(dataLength);  // 数组长度
        out.writeBytes(data);      // 最终的数据
    }
```

# 自定义解码器

有了编码之后的byte数组，就可以在解码器中对其解码了。

上一节介绍了，编码过后的数据格式是魔法词N+数组长度+真正的数据。

其中魔法词长度是一个字节，数组长度是四个字节，前面部分总共是5个字节。所以在解码的时候，首先判断ByteBuf中可读字节的长度是否小于5，如果小于5说明数据是无效的，可以直接return。

如果可读字节的长度大于5，则表示数据是有效的，可以进行数据的解码了。

解码过程中需要注意的是，并不是所有的数据都是我们所希望的格式，如果在读取的过程中读到了我们不认识的格式，那么说明这个数据并不是我们想要的，则可以交由其他的handler进行处理。

但是对于ByteBuf来说，一旦调用read方法，就会导致reader index移动位置，所以在真正的读取数据之前需要调用ByteBuf的markReaderIndex方法，对readerIndex进行记录。然后分别读取魔法词、数组长度和剩余的数据，最后将数据转换成为BigInteger，如下所示：

```
 protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
        // 保证魔法词和数组长度有效
        if (in.readableBytes() < 5) {
            return;
        }
        in.markReaderIndex();
        // 检查魔法词
        int magicNumber = in.readUnsignedByte();
        if (magicNumber != 'N') {
            in.resetReaderIndex();
            throw new CorruptedFrameException("无效的魔法词: " + magicNumber);
        }
        // 读取所有的数据
        int dataLength = in.readInt();
        if (in.readableBytes() < dataLength) {
            in.resetReaderIndex();
            return;
        }
        // 将剩下的数据转换成为BigInteger
        byte[] decoded = new byte[dataLength];
        in.readBytes(decoded);
        out.add(new BigInteger(decoded));
    }
```

# 添加编码解码器到pipeline

有了两个编码解码器，还需要将其添加到pipeline中进行调用。

在实现ChannelInitializer中的initChannel中，可以对ChannelPipeline进行初始化，本例中的初始化代码如下：

```
// 对流进行压缩
        pipeline.addLast(ZlibCodecFactory.newZlibEncoder(ZlibWrapper.GZIP));
        pipeline.addLast(ZlibCodecFactory.newZlibDecoder(ZlibWrapper.GZIP));

        // 添加number编码解码器
        pipeline.addLast(new NumberDecoder());
        pipeline.addLast(new NumberEncoder());

        // 添加业务处理逻辑
        pipeline.addLast(new CustomProtocolServerHandler());
```

其中最后一行是真正的业务处理逻辑，NumberDecoder和NumberEncoder是编码和解码器。这里我们还使用了一个ZlibEncoder用于对流数据进行压缩，这里使用的压缩方式是GZIP。

压缩的好处就是可以减少数据传输的数量，提升传输效率。其本质也是一个编码解码器。

# 计算2的N次方

计算2的N次方的逻辑是这样的，首先客户端发送2给服务器端，服务器端接收到该消息和结果1相乘，并将结果写回给客户端，客户端收到消息之后再发送2给服务器端，服务器端将上次的计算结果乘以2，再发送给客户端，以此类推直到执行N次。

首先看下客户端的发送逻辑：

```
// 最大计算2的1000次方
        ChannelFuture future = null;
        for (int i = 0; i < 1000 && next <= CustomProtocolClient.COUNT; i++) {
            future = ctx.write(2);
            next++;
        }
```

当next小于等于要计算的COUNT时，就将2写入到channel中。

对于服务器来说，在channelRead0方法中，读取消息，并将其和结果相乘，再把结果写回给客户端。

```
    public void channelRead0(ChannelHandlerContext ctx, BigInteger msg) throws Exception {
        // 将接收到的msg乘以2，然后返回给客户端
        count++;
        result = result.multiply(msg);
        ctx.writeAndFlush(result);
    }
```

客户端统计读取到的消息个数，如果消息个数=COUNT，说明计算完毕，就可以将结果保存起来供后续使用，其核心代码如下：

```
    public void channelRead0(ChannelHandlerContext ctx, final BigInteger msg) {
        receivedMessages ++;
        if (receivedMessages == CustomProtocolClient.COUNT) {
            // 计算完毕，将结果放入answer中
            ctx.channel().close().addListener(future -> {
                boolean offered = answer.offer(msg);
                assert offered;
            });
        }
    }
```

# 总结

本文实现了一个Number的编码解码器，事实上你可以自定义实现任何对象的编码解码器。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)
