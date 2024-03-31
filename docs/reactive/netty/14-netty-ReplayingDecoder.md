---
slug: /14-4-netty-ReplayingDecoder
---

# 30. netty系列之:netty中的自动解码器ReplayingDecoder



# 简介

netty提供了一个从ByteBuf到用户自定义的message的解码器叫做ByteToMessageDecoder,要使用这个decoder，我们需要继承这个decoder，并实现decode方法，从而在这个方法中实现ByteBuf中的内容到用户自定义message对象的转换。

那么在使用ByteToMessageDecoder的过程中会遇到什么问题呢？为什么又会有一个ReplayingDecoder呢？带着这个问题我们一起来看看吧。

# ByteToMessageDecoder可能遇到的问题

要想实现自己的解码器将ByteBuf转换成为自己的消息对象，可以继承ByteToMessageDecoder，然后实现其中的decode方法即可，先来看下decode方法的定义：

```
     protected void decode(ChannelHandlerContext ctx,
                             ByteBuf buf, List<Object> out) throws Exception 
```

输入的参数中buf是要解码的ByteBuf，out是解码过后的对象列表，我们需要把ByteBuf中的数据转换成为我们自己的对象加入out的list中。

那么这里可能会遇到一个问题，因为我们在调用decode方法的时候buf中的数据可能还没有准备好，比如我们需要一个Integer，但是buf中的数据不够一个整数，那么就需要一些buf中数据逻辑的判断,我们以一个带有消息长度的Buf对象来描述一下这个过程。

所谓带有消息长度的Buf对象，就是说Buf消息中的前4位，构成了一个整数，这个整数表示的是buf中后续消息的长度。

所以我们读取消息进行转换的流程是，先读取前面4个字节，得到消息的长度，然后再读取该长度的字节，这就是我们真正要获取的消息内容。

来看一下如果是继承自ByteToMessageDecoder应该怎么实现这个逻辑呢？

```
   public class IntegerHeaderFrameDecoder extends ByteToMessageDecoder {
  
      @Override
     protected void decode(ChannelHandlerContext ctx,
                             ByteBuf buf, List<Object> out) throws Exception {
  
       if (buf.readableBytes() < 4) {
          return;
       }
  
       buf.markReaderIndex();
       int length = buf.readInt();
  
       if (buf.readableBytes() < length) {
          buf.resetReaderIndex();
          return;
       }
  
       out.add(buf.readBytes(length));
     }
   }
```

在decode中，我们首先需要判断buf中可读的字节有没有4个，没有的话直接返回。如果有，则先读取这4个字节的长度，然后再判断buf中的可读字节是否小于应该读取的长度，如果小于，则说明数据还没有准备好，需要调用resetReaderIndex进行重置。

最后，如果所有的条件都满足，才真正进行读取工作。

有没有一个办法可以不提前进行判断，可以直接按照自己想要的内容来读取buf的方式呢？答案就是ReplayingDecoder。

我们先来看一下上面的例子用ReplayingDecoder重写是什么情况：

```
   public class IntegerHeaderFrameDecoder
        extends ReplayingDecoder<Void> {
  
     protected void decode(ChannelHandlerContext ctx,
                             ByteBuf buf, List<Object> out) throws Exception {
  
       out.add(buf.readBytes(buf.readInt()));
     }
   }
```

使用ReplayingDecoder，我们可以忽略buf是否已经接收到了足够的可读数据，直接读取即可。

相比之下ReplayingDecoder非常的简单。接下来，我们来探究一下ReplayingDecoder的实现原理。

# ReplayingDecoder的实现原理

ReplayingDecoder实际上是ByteToMessageDecoder的一个子类，它的定义如下：

```
public abstract class ReplayingDecoder<S> extends ByteToMessageDecoder 
```
在ByteToMessageDecoder中，最重要的方法是channelRead,在这个方法中实际调用了`callDecode(ctx, cumulation, out);`来实现cumulation到out的解码过程。

ReplayingDecoder的秘密就在于对这个方法的重写，我们来看下这个方法的具体实现：

```
   protected void callDecode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
        replayable.setCumulation(in);
        try {
            while (in.isReadable()) {
                int oldReaderIndex = checkpoint = in.readerIndex();
                int outSize = out.size();
                if (outSize > 0) {
                    fireChannelRead(ctx, out, outSize);
                    out.clear();
                    if (ctx.isRemoved()) {
                        break;
                    }
                    outSize = 0;
                }
                S oldState = state;
                int oldInputLength = in.readableBytes();
                try {
                    decodeRemovalReentryProtection(ctx, replayable, out);
                    if (ctx.isRemoved()) {
                        break;
                    }
                    if (outSize == out.size()) {
                        if (oldInputLength == in.readableBytes() && oldState == state) {
                            throw new DecoderException(
                                    StringUtil.simpleClassName(getClass()) + ".decode() must consume the inbound " +
                                    "data or change its state if it did not decode anything.");
                        } else {
                            continue;
                        }
                    }
                } catch (Signal replay) {
                    replay.expect(REPLAY);
                    if (ctx.isRemoved()) {
                        break;
                    }

                    // Return to the checkpoint (or oldPosition) and retry.
                    int checkpoint = this.checkpoint;
                    if (checkpoint >= 0) {
                        in.readerIndex(checkpoint);
                    } else {
                    }
                    break;
                }
                if (oldReaderIndex == in.readerIndex() && oldState == state) {
                    throw new DecoderException(
                           StringUtil.simpleClassName(getClass()) + ".decode() method must consume the inbound data " +
                           "or change its state if it decoded something.");
                }
                if (isSingleDecode()) {
                    break;
                }
            }
        } catch (DecoderException e) {
            throw e;
        } catch (Exception cause) {
            throw new DecoderException(cause);
        }
    }
```

这里的实现和ByteToMessageDecoder不同的是ReplayingDecoder中定义了一个checkpoint,这个checkpint是在尝试进行数据解码之初设置的：

```
int oldReaderIndex = checkpoint = in.readerIndex();
```

如果是在解码的过程中出现了异常，则使用checkpoint重置index：

```
    int checkpoint = this.checkpoint;
         if (checkpoint >= 0) {
            in.readerIndex(checkpoint);
        } else {
    }
```

这里捕获的异常是Signal，Signal是什么呢？

Signal是一个Error对象：

```
public final class Signal extends Error implements Constant<Signal> 
```

这个异常是从replayable中抛出来的。

replayable是一个特有的ByteBuf对象，叫做ReplayingDecoderByteBuf:

```
final class ReplayingDecoderByteBuf extends ByteBuf
```

在ReplayingDecoderByteBuf中定义了Signal属性：

```
    private static final Signal REPLAY = ReplayingDecoder.REPLAY;
```

这个Signal异常是从ReplayingDecoderByteBuf中的get方法中抛出的，这里以getInt为例,看一下异常是如何抛出的：

```
    public int getInt(int index) {
        checkIndex(index, 4);
        return buffer.getInt(index);
    }

```

getInt方法首先会去调用checkIndex方法进行buff中的长度检测，如果小于要读取的长度，则会抛出异常REPLAY：

```
    private void checkIndex(int index, int length) {
        if (index + length > buffer.writerIndex()) {
            throw REPLAY;
        }
    }
```

这就是Signal异常的由来。

# 总结

以上就是对ReplayingDecoder的介绍，虽然ReplayingDecoder好用，但是从它的实现可以看出，ReplayingDecoder是通过抛出异常来不断的重试，所以在某些特殊的情况下会造成性能的下降。

也就是说在减少我们代码量的同时，降低了程序的执行效率。看来要想马儿跑又想马儿不吃草，这样的好事是不可能的了。



















