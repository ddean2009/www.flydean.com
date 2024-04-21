---
slug: /14-0-2-netty-codec-msg-to-bytebuf
---

# 25. netty系列之:netty中的核心MessageToByte编码器



# 简介

之前的文章中，我们讲解了netty中从一个message转换成为另外一个message的框架叫做MessageToMessage编码器。但是message to message只考虑了channel中消息在处理过程中的转换，但是我们知道channel中最终传输的数据一定是ByteBuf，所以我们还需要一个message和ByteBuf相互转换的框架，这个框架就叫做MessageToByte。

注意，这里的byte指的是ByteBuf而不是byte这个字节类型。

# MessageToByte框架简介

为了方便扩展和用户的自定义，netty封装了一套MessageToByte框架，这个框架中有三个核心的类，分别是MessageToByteEncoder,ByteToMessageDecoder和ByteToMessageCodec。

我们分别看一下这三个核心类的定义：

```
public abstract class MessageToByteEncoder<I> extends ChannelOutboundHandlerAdapter
```

```
public abstract class ByteToMessageDecoder extends ChannelInboundHandlerAdapter 
```

```
public abstract class ByteToMessageCodec<I> extends ChannelDuplexHandler 
```

这三个类分别继承自ChannelOutboundHandlerAdapter，ChannelInboundHandlerAdapter和ChannelDuplexHandler，分别表示的是向channel中写消息，从channel中读消息和一个向channel中读写消息的双向操作。

这三个类都是抽象类，接下来我们会详细分析这三个类的具体实现逻辑。

# MessageToByteEncoder

先来看encoder，如果你对比MessageToByteEncoder和MessageToMessageEncoder的源码实现，可以发现他们有诸多相似之处。

首先在MessageToByteEncoder中定义了一个用作消息类型匹配的TypeParameterMatcher。

这个matcher用来匹配收到的消息类型，如果类型匹配则进行消息的转换操作，否则直接将消息写入channel中。

和MessageToMessageEncoder不同的是，MessageToByteEncoder多了一个preferDirect字段，这个字段表示消息转换成为ByteBuf的时候是使用diret Buf还是heap Buf。

这个字段的使用情况如下：

```
    protected ByteBuf allocateBuffer(ChannelHandlerContext ctx, @SuppressWarnings("unused") I msg,
                               boolean preferDirect) throws Exception {
        if (preferDirect) {
            return ctx.alloc().ioBuffer();
        } else {
            return ctx.alloc().heapBuffer();
        }
    }
```

最后来看一下它的核心方法write:

```
    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
        ByteBuf buf = null;
        try {
            if (acceptOutboundMessage(msg)) {
                @SuppressWarnings("unchecked")
                I cast = (I) msg;
                buf = allocateBuffer(ctx, cast, preferDirect);
                try {
                    encode(ctx, cast, buf);
                } finally {
                    ReferenceCountUtil.release(cast);
                }

                if (buf.isReadable()) {
                    ctx.write(buf, promise);
                } else {
                    buf.release();
                    ctx.write(Unpooled.EMPTY_BUFFER, promise);
                }
                buf = null;
            } else {
                ctx.write(msg, promise);
            }
        } catch (EncoderException e) {
            throw e;
        } catch (Throwable e) {
            throw new EncoderException(e);
        } finally {
            if (buf != null) {
                buf.release();
            }
        }
    }
```

上面我们已经提到了，write方法首先通过matcher来判断是否是要接受的消息类型，如果是的话就调用encode方法，将消息对象转换成为ByteBuf，如果不是，则直接将消息写入channel中。

和MessageToMessageEncoder不同的是，encode方法需要传入一个ByteBuf对象，而不是CodecOutputList。

MessageToByteEncoder有一个需要实现的抽象方法encode如下，

```
    protected abstract void encode(ChannelHandlerContext ctx, I msg, ByteBuf out) throws Exception;
```

# ByteToMessageDecoder

ByteToMessageDecoder用来将channel中的ByteBuf消息转换成为特定的消息类型，其中Decoder中最重要的方法就是好channelRead方法,如下所示：

```
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if (msg instanceof ByteBuf) {
            CodecOutputList out = CodecOutputList.newInstance();
            try {
                first = cumulation == null;
                cumulation = cumulator.cumulate(ctx.alloc(),
                        first ? Unpooled.EMPTY_BUFFER : cumulation, (ByteBuf) msg);
                callDecode(ctx, cumulation, out);
            } catch (DecoderException e) {
                throw e;
            } catch (Exception e) {
                throw new DecoderException(e);
            } finally {
                try {
                    if (cumulation != null && !cumulation.isReadable()) {
                        numReads = 0;
                        cumulation.release();
                        cumulation = null;
                    } else if (++numReads >= discardAfterReads) {
                        numReads = 0;
                        discardSomeReadBytes();
                    }

                    int size = out.size();
                    firedChannelRead |= out.insertSinceRecycled();
                    fireChannelRead(ctx, out, size);
                } finally {
                    out.recycle();
                }
            }
        } else {
            ctx.fireChannelRead(msg);
        }
    }
```

channelRead接收要进行消息读取的Object对象，因为这里只接受ByteBuf消息，所以在方法内部调用了`msg instanceof ByteBuf` 来判断消息的类型，如果不是ByteBuf类型的消息则不进行消息的转换。

输出的对象是CodecOutputList，在将ByteBuf转换成为CodecOutputList之后，调用fireChannelRead方法将out对象传递下去。

这里的关键就是如何将接收到的ByteBuf转换成为CodecOutputList。

转换的方法叫做callDecode，它接收一个叫做cumulation的参数，在上面的方法中，我们还看到一个和cumulation非常类似的名称叫做cumulator。那么他们两个有什么区别呢？

在ByteToMessageDecoder中cumulation是一个ByteBuf对象，而Cumulator是一个接口，这个接口定义了一个cumulate方法：

```
    public interface Cumulator {
        ByteBuf cumulate(ByteBufAllocator alloc, ByteBuf cumulation, ByteBuf in);
    }
```

Cumulator用来将传入的ByteBuf合并成为一个新的ByteBuf。

ByteToMessageDecoder中定义了两种Cumulator，分别是MERGE_CUMULATOR和COMPOSITE_CUMULATOR。

MERGE_CUMULATOR是将传入的ByteBuf通过memory copy的方式拷贝到目标ByteBuf cumulation中。

而COMPOSITE_CUMULATOR则是将ByteBuf添加到一个 CompositeByteBuf 的结构中，并不做memory copy，因为目标的结构比较复杂，所以速度会比直接进行memory copy要慢。

用户要扩展的方法就是decode方法，用来将一个ByteBuf转换成为其他对象：

```
    protected abstract void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception;
```

# ByteToMessageCodec

最后要介绍的类是ByteToMessageCodec，ByteToMessageCodec表示的是message和ByteBuf之间的互相转换，它里面的encoder和decoder分别就是上面讲到的MessageToByteEncoder和ByteToMessageDecoder。

用户可以继承ByteToMessageCodec来同时实现encode和decode的功能，所以需要实现encode和decode这两个方法：

```
    protected abstract void encode(ChannelHandlerContext ctx, I msg, ByteBuf out) throws Exception;

    protected abstract void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception;
```

ByteToMessageCodec的本质就是封装了MessageToByteEncoder和ByteToMessageDecoder，然后实现了编码和解码的功能。

# 总结

如果想实现ByteBuf和用户自定义消息的直接转换，那么选择netty提供的上面三个编码器是一个很好的选择。
















