---
slug: /14-netty-cust-codec
---

# 35. netty系列之:自定义编码和解码器要注意的问题



# 简介

在之前的系列文章中，我们提到了netty中的channel只接受ByteBuf类型的对象，如果不是ByteBuf对象的话，需要用编码和解码器对其进行转换，今天来聊一下netty自定义的编码和解码器实现中需要注意的问题。

# 自定义编码器和解码器的实现

在介绍netty自带的编码器和解码器之前，告诉大家怎么实现自定义的编码器和解码器。

netty中所有的编码器和解码器都是从ChannelInboundHandlerAdapter和ChannelOutboundHandlerAdapter衍生而来的。

对于ChannelOutboundHandlerAdapter来说，最重要的两个类是`MessageToByteEncoder<I>` 和 `MessageToMessageEncoder<I> `。

MessageToByteEncoder是将消息编码成为ByteBuf，这个类也是我们自定义编码最常用的类，直接继承这个类并实现encode方法即可。注意到这个类有一个泛型，这个泛型指定的就是消息的对象类型。

例如我们想将Integer转换成为ByteBuf，可以这样写：

```
       public class IntegerEncoder extends MessageToByteEncoder<Integer> {
            @Override
           public void encode(ChannelHandlerContext ctx, Integer msg, ByteBuf out)
                   throws Exception {
               out.writeInt(msg);
           }
       }
```

MessageToMessageEncoder是在消息和消息之间进行转换，因为消息并不能直接写入到channel中，所以需要和MessageToByteEncoder配合使用。

下面是一个Integer到String的例子：

```
       public class IntegerToStringEncoder extends
               MessageToMessageEncoder<Integer> {
  
            @Override
           public void encode(ChannelHandlerContext ctx, Integer message, List<Object> out)
                   throws Exception {
               out.add(message.toString());
           }
       }
```

对于ChannelInboundHandlerAdapter来说，最重要的两个类是ByteToMessageDecoder和`MessageToMessageDecoder<I> `。

ByteToMessageDecoder是将ByteBuf转换成对应的消息类型，我们需要继承这个类，并实现decode方法，下面是一个从ByteBuf中读取所有可读的字节，并将结果放到一个新的ByteBuf中，

```
       public class SquareDecoder extends ByteToMessageDecoder {
            @Override
           public void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out)
                   throws Exception {
               out.add(in.readBytes(in.readableBytes()));
           }
       }
   
```

MessageToMessageDecoder是消息和消息之间的转换，同样的只需要实现decode方法即可，如下从String转换到Integer：

```
       public class StringToIntegerDecoder extends
               MessageToMessageDecoder<String> {
  
            @Override
           public void decode(ChannelHandlerContext ctx, String message,
                              List<Object> out) throws Exception {
               out.add(message.length());
           }
       }
```

# ReplayingDecoder

上面的代码看起来很简单，但是在实现的过程中还有一些问题要注意。

对于Decoder来说，我们从ByteBuf中读取数据，然后进行转换。但是在读取的过程中，并不知道ByteBuf中数据的变动情况，有可能在读取的过程中ByteBuf还没有准备好，那么就需要在读取的时候对ByteBuf中可读字节的大小进行判断。

比如我们需要解析一个数据结构，这个数据结构的前4个字节是一个int，表示后面byte数组的长度，我们需要先判断ByteBuf中是否有4个字节，然后读取这4个字节作为Byte数组的长度，然后再读取这个长度的Byte数组，最终得到要读取的结果，如果其中的某一步出现问题，或者说可读的字节长度不够，那么就需要直接返回，等待下一次的读取。如下所示：

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

这种判断是比较复杂同时也是可能出错的，为了解决这个问题，netty提供了 ReplayingDecoder用来简化上面的操作，在ReplayingDecoder中，假设所有的ByteBuf已经处于准备好的状态，直接从中间读取即可。

上面的例子用ReplayingDecoder重写如下：

```
   public class IntegerHeaderFrameDecoder
        extends ReplayingDecoder<Void> {
  
     protected void decode(ChannelHandlerContext ctx,
                             ByteBuf buf, List<Object> out) throws Exception {
  
       out.add(buf.readBytes(buf.readInt()));
     }
   }
```

它的实现原理是去尝试读取对应的字节信息，如果没有读到，则抛出异常，ReplayingDecoder接收到异常之后，会重新调用decode方法。

虽然ReplayingDecoder使用起来非常简单，但是它有两个问题。

第一个问题是性能问题，因为会去重复调用decode方法，如果ByteBuf本身并没有变化，就会导致重复decode同一个ByteBuf，照成性能的浪费。解决这个问题就是在在decode的过程中分阶段进行，比如上面的例子中，我们需要先读取Byte数组的长度，然后再读取真正的byte数组。所以在读完byte数组长度之和，可以调用checkpoint()方法做一个保存点，下次再执行decode方法的时候就可以跳过这个保存点，继续后续的执行过程，如下所示：

```
   public enum MyDecoderState {
     READ_LENGTH,
     READ_CONTENT;
   }
  
   public class IntegerHeaderFrameDecoder
        extends ReplayingDecoder<MyDecoderState> {
  
     private int length;
  
     public IntegerHeaderFrameDecoder() {
       // Set the initial state.
       super(MyDecoderState.READ_LENGTH);
     }
  
      @Override
     protected void decode(ChannelHandlerContext ctx,
                             ByteBuf buf, List<Object> out) throws Exception {
       switch (state()) {
       case READ_LENGTH:
         length = buf.readInt();
         checkpoint(MyDecoderState.READ_CONTENT);
       case READ_CONTENT:
         ByteBuf frame = buf.readBytes(length);
         checkpoint(MyDecoderState.READ_LENGTH);
         out.add(frame);
         break;
       default:
         throw new Error("Shouldn't reach here.");
       }
     }
   }
```

第二个问题是同一个实例的decode方法可能会被调用多次，如果我们在ReplayingDecoder中有私有变量的话，则需要考虑对这个私有变量的清洗工作，避免多次调用造成的数据污染。

# 总结

通过继承上面的几个类，我们就可以自己实现编码和解码的逻辑了。但是好像还有点问题，自定义编码和解码器是不是太复杂了？还需要判断要读取的byte数组的大小。有没有更加简单的方法呢？

有的，敬请期待netty系列的下一篇文章:netty自带的编码器和解码器.

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)

