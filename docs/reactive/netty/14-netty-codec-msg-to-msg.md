---
slug: /14-0-1-netty-codec-msg-to-msg
---

# 24. netty系列之:netty中的核心MessageToMessage编码器



# 简介

在netty中我们需要传递各种类型的消息，这些message可以是字符串，可以是数组，也可以是自定义的对象。不同的对象之间可能需要互相转换，这样就需要一个可以自由进行转换的转换器，为了统一编码规则和方便用户的扩展，netty提供了一套消息之间进行转换的框架。本文将会讲解这个框架的具体实现。

# 框架简介

netty为消息和消息之间的转换提供了三个类，这三个类都是抽象类，分别是MessageToMessageDecoder,MessageToMessageEncoder和MessageToMessageCodec。

先来看下他们的定义：

```
public abstract class MessageToMessageEncoder<I> extends ChannelOutboundHandlerAdapter
```

```
public abstract class MessageToMessageDecoder<I> extends ChannelInboundHandlerAdapter
```

```
public abstract class MessageToMessageCodec<INBOUND_IN, OUTBOUND_IN> extends ChannelDuplexHandler 
```

MessageToMessageEncoder继承自ChannelOutboundHandlerAdapter，负责向channel中写消息。

MessageToMessageDecoder继承自ChannelInboundHandlerAdapter，负责从channel中读取消息。

MessageToMessageCodec继承自ChannelDuplexHandler，它是一个双向的handler，可以从channel中读取消息，也可以向channel中写入消息。

有了这三个抽象类，我们再看下这三个类的具体实现。

# MessageToMessageEncoder

先看一下消息的编码器MessageToMessageEncoder，编码器中最重要的方法就是write,看下write的实现：

```
    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
        CodecOutputList out = null;
        try {
            if (acceptOutboundMessage(msg)) {
                out = CodecOutputList.newInstance();
                @SuppressWarnings("unchecked")
                I cast = (I) msg;
                try {
                    encode(ctx, cast, out);
                } finally {
                    ReferenceCountUtil.release(cast);
                }

                if (out.isEmpty()) {
                    throw new EncoderException(
                            StringUtil.simpleClassName(this) + " must produce at least one message.");
                }
            } else {
                ctx.write(msg, promise);
            }
        } catch (EncoderException e) {
            throw e;
        } catch (Throwable t) {
            throw new EncoderException(t);
        } finally {
            if (out != null) {
                try {
                    final int sizeMinusOne = out.size() - 1;
                    if (sizeMinusOne == 0) {
                        ctx.write(out.getUnsafe(0), promise);
                    } else if (sizeMinusOne > 0) {
                        if (promise == ctx.voidPromise()) {
                            writeVoidPromise(ctx, out);
                        } else {
                            writePromiseCombiner(ctx, out, promise);
                        }
                    }
                } finally {
                    out.recycle();
                }
            }
        }
    }
```

write方法接受一个需要转换的原始对象msg，和一个表示channel读写进度的ChannelPromise。

首先会对msg进行一个类型判断，这个判断方法是在acceptOutboundMessage中实现的。

```
    public boolean acceptOutboundMessage(Object msg) throws Exception {
        return matcher.match(msg);
    }
```

这里的matcher是一个TypeParameterMatcher对象，它是一个在MessageToMessageEncoder构造函数中初始化的属性：

```
    protected MessageToMessageEncoder() {
        matcher = TypeParameterMatcher.find(this, MessageToMessageEncoder.class, "I");
    }
```

这里的I就是要匹配的msg类型。

如果不匹配，则继续调用`ctx.write(msg, promise);` 将消息不做任何转换的写入到channel中，供下一个handler调用。

如果匹配成功，则会调用核心的encode方法:`encode(ctx, cast, out);` 

注意，encode方法在MessageToMessageEncoder中是一个抽象方法，需要用户在继承类中自行扩展。

encode方法实际上是将msg对象转换成为要转换的对象，然后添加到out中。这个out是一个list对象，具体而言是一个CodecOutputList对象，作为一个list，out是一个可以存储多个对象的列表。

那么out是什么时候写入到channel中去的呢？

别急，在write方法中最后有一个finally代码块，在这个代码块中，会将out写入到channel里面。

因为out是一个List，可能会出现out中的对象部分写成功的情况，所以这里需要特别处理。

首先判断out中是否只有一个对象，如果是一个对象，那么直接写到channel中即可。如果out中多于一个对象，那么又分成两种情况，第一种情况是传入的promise是一个voidPromise，那么调用writeVoidPromise方法。

什么是voidPromise呢?

我们知道Promise有多种状态，可以通过promise的状态变化了解到数据写入的情况。对于voidPromise来说，它只关心一种失败的状态，其他的状态都不关心。

如果用户关心promise的其他状态，则会调用writePromiseCombiner方法，将多个对象的状态合并为一个promise返回。

事实上，在writeVoidPromise和writePromiseCombiner中，out中的对象都是一个一个的取出来，写入到channel中的,所以才会生成多个promise和需要将promise进行合并的情况：

```
    private static void writeVoidPromise(ChannelHandlerContext ctx, CodecOutputList out) {
        final ChannelPromise voidPromise = ctx.voidPromise();
        for (int i = 0; i < out.size(); i++) {
            ctx.write(out.getUnsafe(i), voidPromise);
        }
    }

    private static void writePromiseCombiner(ChannelHandlerContext ctx, CodecOutputList out, ChannelPromise promise) {
        final PromiseCombiner combiner = new PromiseCombiner(ctx.executor());
        for (int i = 0; i < out.size(); i++) {
            combiner.add(ctx.write(out.getUnsafe(i)));
        }
        combiner.finish(promise);
    }
```

# MessageToMessageDecoder

和encoder对应的就是decoder了，MessageToMessageDecoder的逻辑和MessageToMessageEncoder差不多。

首先也是需要判断读取的消息类型，这里也定义了一个TypeParameterMatcher对象，用来检测传入的消息类型：

```
    protected MessageToMessageDecoder() {
        matcher = TypeParameterMatcher.find(this, MessageToMessageDecoder.class, "I");
    }
```

decoder中重要的方法是channelRead方法，我们看下它的实现：

```
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        CodecOutputList out = CodecOutputList.newInstance();
        try {
            if (acceptInboundMessage(msg)) {
                @SuppressWarnings("unchecked")
                I cast = (I) msg;
                try {
                    decode(ctx, cast, out);
                } finally {
                    ReferenceCountUtil.release(cast);
                }
            } else {
                out.add(msg);
            }
        } catch (DecoderException e) {
            throw e;
        } catch (Exception e) {
            throw new DecoderException(e);
        } finally {
            try {
                int size = out.size();
                for (int i = 0; i < size; i++) {
                    ctx.fireChannelRead(out.getUnsafe(i));
                }
            } finally {
                out.recycle();
            }
        }
    }
```

首先检测msg的类型，只有接受的类型才进行decode处理，否则将msg加入到CodecOutputList中。

最后在finally代码块中将out中的对象一个个取出来，调用ctx.fireChannelRead进行读取。

消息转换的关键方法是decode，这个方法也是一个抽象方法，需要在继承类中实现具体的功能。

# MessageToMessageCodec

前面讲解了一个编码器和一个解码器，他们都是单向的。最后要讲解的codec叫做MessageToMessageCodec，这个codec是一个双向的，即可以接收消息，也可以发送消息。

先看下它的定义：

```
public abstract class MessageToMessageCodec<INBOUND_IN, OUTBOUND_IN> extends ChannelDuplexHandler
```

MessageToMessageCodec继承自ChannelDuplexHandler，接收两个泛型参数分别是INBOUND_IN和OUTBOUND_IN。

它定义了两个TypeParameterMatcher，分别用来过滤inboundMsg和outboundMsg:

```
    protected MessageToMessageCodec() {
        inboundMsgMatcher = TypeParameterMatcher.find(this, MessageToMessageCodec.class, "INBOUND_IN");
        outboundMsgMatcher = TypeParameterMatcher.find(this, MessageToMessageCodec.class, "OUTBOUND_IN");
    }
```

分别实现了channelRead和write方法，用来读写消息：

```
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        decoder.channelRead(ctx, msg);
    }

    @Override
    public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
        encoder.write(ctx, msg, promise);
    }
```

这里的decoder和encoder实际上就是前面我们讲到的MessageToMessageDecoder和MessageToMessageEncoder:

```
    private final MessageToMessageEncoder<Object> encoder = new MessageToMessageEncoder<Object>() {

        @Override
        public boolean acceptOutboundMessage(Object msg) throws Exception {
            return MessageToMessageCodec.this.acceptOutboundMessage(msg);
        }

        @Override
        @SuppressWarnings("unchecked")
        protected void encode(ChannelHandlerContext ctx, Object msg, List<Object> out) throws Exception {
            MessageToMessageCodec.this.encode(ctx, (OUTBOUND_IN) msg, out);
        }
    };

    private final MessageToMessageDecoder<Object> decoder = new MessageToMessageDecoder<Object>() {

        @Override
        public boolean acceptInboundMessage(Object msg) throws Exception {
            return MessageToMessageCodec.this.acceptInboundMessage(msg);
        }

        @Override
        @SuppressWarnings("unchecked")
        protected void decode(ChannelHandlerContext ctx, Object msg, List<Object> out) throws Exception {
            MessageToMessageCodec.this.decode(ctx, (INBOUND_IN) msg, out);
        }
    };
```

可以看到MessageToMessageCodec实际上就是对MessageToMessageDecoder和MessageToMessageEncoder的封装，如果需要对MessageToMessageCodec进行扩展的话，需要实现下面两个方法：

```
    protected abstract void encode(ChannelHandlerContext ctx, OUTBOUND_IN msg, List<Object> out)
            throws Exception;

    protected abstract void decode(ChannelHandlerContext ctx, INBOUND_IN msg, List<Object> out)
            throws Exception;
```

# 总结

netty中提供的MessageToMessage的编码框架是后面对编码解码器进行扩展的基础。只有深入了解其中的原理，我们对于新的编码解码器运用起来才能得心应手。












