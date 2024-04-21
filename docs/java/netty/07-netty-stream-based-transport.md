---
slug: /07-netty-stream-based-transport
---

# 17. netty系列之:基于流的数据传输



# 简介

我们知道由两种数据的传输方式，分别是字符流和字节流，字符流的意思是传输的对象就是字符串，格式已经被设置好了，发送方和接收方按照特定的格式去读取就行了，而字节流是指将数据作为最原始的二进制字节来进行传输。

今天给大家介绍一下在netty中的基于流的数据传输。

# package和byte

熟悉TCP/IP协议的同学应该知道，在TCP/IP中，因为底层协议有支持的数据包的最大值，所以对于大数据传输来说，需要对数据进行拆分和封包处理，并将这些拆分组装过的包进行发送，最后在接收方对这些包进行组合。在各个包中有固定的结构，所以接收方可以很清楚的知道到底应该组合多少个包作为最终的结果。

那么对于netty来说，channel中传输的是ByteBuf，实际上最最最底层的就是byte数组。对于这种byte数组来说，接收方并不知道到底应该组合多少个byte来合成原来的消息，所以需要在接收端对收到的byte进行组合，从而生成最终的数据。

那么对于netty中的byte数据流应该怎么组合呢？我们接下来看两种组合方法。

# 手动组合

这种组合的方式的基本思路是构造一个目标大小的ByteBuf，然后将接收到的byte通过调用ByteBuf的writeBytes方法写入到ByteBuf中。最后从ByteBuf中读取对应的数据。

比如我们想从服务端发送一个int数字给客户端，一般来说int是32bits,然后一个byte是8bits，那么一个int就需要4个bytes组成。

在server端，可以建立一个byte的数组，数组中包含4个元素。将4个元素的byte发送给客户端，那么客户端该如何处理呢？

首先我们需要建立一个clientHander，这个handler应该继承ChannelInboundHandlerAdapter，并且在其handler被添加到ChannelPipeline的时候初始化一个包含4个byte的byteBuf。

handler被添加的时候会触发一个handlerAdded事件，所以我们可以这样写：

```
    private ByteBuf buf;
    
    @Override
    public void handlerAdded(ChannelHandlerContext ctx) {
        //创建一个4个byte的缓冲器
        buf = ctx.alloc().buffer(4); 
    }
```

上例中，我们从ctx分配了一个4个字节的缓冲器，并将其赋值给handler中的私有变量buf。

当handler执行完毕，从ChannelPipeline中删除的时候，会触发handlerRemoved事件，在这个事件中，我们可以对分配的Bytebuf进行清理，通常来说，可以调用其release方法，如下所示：

```
    public void handlerRemoved(ChannelHandlerContext ctx) {
        buf.release(); // 释放buf
        buf = null;
    }
```
然后最关键的一步就是从channel中读取byte并将其放到4个字节的byteBuf中。在之前的文章中我们提到了，可以在channelRead方法中，处理消息读取的逻辑。

```
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        ByteBuf m = (ByteBuf) msg;
        buf.writeBytes(m); // 写入一个byte
        m.release();
        
        if (buf.readableBytes() >= 4) { // 已经凑够4个byte，将4个byte组合称为一个int
            long result = buf.readUnsignedInt();
            ctx.close();
        }
    }
```

每次触发channelRead方法，都会将读取到的一个字节的byte通过调用writeBytes方法写入buf中。当buf的可读byte大于等于4个的时候就说明4个字节已经读满了，可以对其进行操作了。

这里我们将4个字节组合成一个unsignedInt，并使用readUnsignedInt方法从buf中读取出来组合称为一个int数字。

上面的例子虽然可以解决4个字节的byte问题，但是如果数据结构再负责一点，上面的方式就会力不从心，需要考虑太多的数据组合问题。接下来我们看另外一种方式。

# Byte的转换类

netty提供了一个ByteToMessageDecoder的转换类，可以方便的对Byte转换为其他的类型。

我们只需要重新其中的decode方法，就可以实现对ByteBuf的转换：

```
       public class SquareDecoder extends ByteToMessageDecoder {
            @Override
           public void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out)
                   throws Exception {
               out.add(in.readBytes(in.readableBytes()));
           }
       }
```

上面的例子将byte从input转换到output中，当然，你还可以在上面的方法中进行格式转换，如下所示：

```
public class TimeDecoder extends ByteToMessageDecoder { 
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) { 
        if (in.readableBytes() < 4) {
            return; 
        }
        
        out.add(in.readBytes(4)); 
    }
}
```

上面的例子会先判断in中是否有4个byte，如果有就将其读出来放到out中去。那么有同学会问了，输入不是一个byte一个byte来的吗？为什么这里可以一次读取到4个byte？这是因为ByteToMessageDecoder内置了一个缓存装置，所以这里的in实际上是一个缓存集合。

# ReplayingDecoder

netty还提供了一个更简单的转换ReplayingDecoder，如果使用ReplayingDecoder重新上面的逻辑就是这样的：

```
public class TimeDecoder extends ReplayingDecoder<Void> {
    @Override
    protected void decode(
            ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
        out.add(in.readBytes(4));
    }
}
```

只需要一行代码即可。

事实上ReplayingDecoder 是ByteToMessageDecoder 的子类，是在ByteToMessageDecoder上丰富了一些功能的结果。

他们两的区别在于ByteToMessageDecoder 还需要通过调用readableBytes来判断是否有足够的可以读byte，而使用ReplayingDecoder直接读取即可，它假设的是所有的bytes都已经接受成功了。

比如下面使用ByteToMessageDecoder的代码：

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

上例假设在byte的头部是一个int大小的数组，代表着byte数组的长度，需要先读取int值，然后再根据int值来读取对应的byte数据。

和下面的代码是等价的：

```
   public class IntegerHeaderFrameDecoder
        extends ReplayingDecoder<Void> {
  
     protected void decode(ChannelHandlerContext ctx,
                             ByteBuf buf, List<Object> out) throws Exception {
  
       out.add(buf.readBytes(buf.readInt()));
     }
   }
   
```

上面代码少了判断的步骤。

那么这是怎么实现的呢？

事实上ReplayingDecoder 会传递一个会抛出 Error的  ByteBuf ， 当 ByteBuf 读取的byte个数不满足要求的时候，会抛出异常，当ReplayingDecoder 捕获到这个异常之后，会重置buffer的readerIndex到最初的状态，然后等待后续的数据进来，然后再次调用decode方法。

所以，ReplayingDecoder的效率会比较低，为了解决这个问题，netty提供了checkpoint() 方法。这是一个保存点，当报错的时候，可以不会退到最初的状态，而是回退到checkpoint() 调用时候保存的状态，从而可以减少不必要的浪费。

# 总结

本文介绍了在netty中进行stream操作和变换的几种方式，希望大家能够喜欢。





















