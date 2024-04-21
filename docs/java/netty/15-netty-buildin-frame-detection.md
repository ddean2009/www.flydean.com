---
slug: /15-netty-buildin-frame-detection
---

# 36. netty系列之:内置的Frame detection



# 简介

上篇文章我们讲到了netty中怎么自定义编码和解码器，但是自定义实现起来还是挺复杂的，一般没有特殊必要的情况下，大家都希望越简单越好，其难点就是找到ByteBuf中的分割点，将ByteBuf分割成为一个个的可以处理的单元。今天本文讲讲netty中自带的分割处理机制。


# Frame detection

在上一章，我们提到了需要有一种手段来区分ByteBuf中不同的数据，也就是说找到ByteBuf中不同数据的分割点。如果首先将ByteBuf分割成一个个的独立的ByteBuf，再对独立的ByteBuf进行处理就会简单很多。

netty中提供了4个分割点的编码器，我们可以称之为Frame detection，他们分别是DelimiterBasedFrameDecoder, FixedLengthFrameDecoder, LengthFieldBasedFrameDecoder, 和 LineBasedFrameDecoder。

这几个类都是ByteToMessageDecoder的子类，接下来我们一一进行介绍。

## DelimiterBasedFrameDecoder

首先是DelimiterBasedFrameDecoder，看名字就知道这个是根据delimiter对bytebuf进行分割的解码器。什么是delimiter呢？

netty中有一个Delimiters类，专门定义分割的字符，主要有两个delimiter,分别是nulDelimiter和lineDelimiter：

```
public static ByteBuf[] nulDelimiter() {
        return new ByteBuf[] {
                Unpooled.wrappedBuffer(new byte[] { 0 }) };
    }

    public static ByteBuf[] lineDelimiter() {
        return new ByteBuf[] {
                Unpooled.wrappedBuffer(new byte[] { '\r', '\n' }),
                Unpooled.wrappedBuffer(new byte[] { '\n' }),
        };
    }
```

nullDelimiter用来处理0x00，主要用来处理Flash XML socket或者其他的类似的协议。

lineDelimiter用来处理回车和换行符，主要用来文本文件的处理中。

对于DelimiterBasedFrameDecoder来说，如果有多个delimiter的话，会选择将ByteBuf分割最短的那个，举个例子，如果我们使用DelimiterBasedFrameDecoder(Delimiters.lineDelimiter()) ，因为lineDelimiter中实际上有两个分割方式，回车+换行或者换行，如果遇到下面的情况：

```
   +--------------+
   | ABC\nDEF\r\n |
   +--------------+
```

DelimiterBasedFrameDecoder会选择最短的分割结果，也就说将上面的内容分割成为：

```
   +-----+-----+
   | ABC | DEF |
   +-----+-----+
```

而不是

```
   +----------+
   | ABC\nDEF |
   +----------+
```

## FixedLengthFrameDecoder

这个类会将ByteBuf分成固定的长度，比如收到了下面的4块byte信息：

```
   +---+----+------+----+
   | A | BC | DEFG | HI |
   +---+----+------+----+
```

如果使用一个FixedLengthFrameDecoder(3) ，则会将上面的ByteBuf分成下面的几个部分：

```
   +-----+-----+-----+
   | ABC | DEF | GHI |
   +-----+-----+-----+
```

## LengthFieldBasedFrameDecoder

这个类就更加灵活一点，可以根据数据中的length字段取出后续的byte数组。LengthFieldBasedFrameDecoder非常灵活，它有4个属性来控制他们分别是lengthFieldOffset、lengthFieldLength、lengthAdjustment和initialBytesToStrip。

lengthFieldOffset是长度字段的起始位置，lengthFieldLength是长度字段本身的长度，lengthAdjustment是对目标数据长度进行调整，initialBytesToStrip是解密过程中需要删除的byte数目。理解不了？没关系，我们来举几个例子。

首先看一个最简单的：

```
   lengthFieldOffset   = 0
   lengthFieldLength   = 2
   lengthAdjustment    = 0
   initialBytesToStrip = 0 

   BEFORE DECODE (14 bytes)         AFTER DECODE (14 bytes)
   +--------+----------------+      +--------+----------------+
   | Length | Actual Content |----->| Length | Actual Content |
   | 0x000C | "HELLO, WORLD" |      | 0x000C | "HELLO, WORLD" |
   +--------+----------------+      +--------+----------------+
```

上面的设置表示，length是从第0位开始的，长度是2个字节。其中Ox00C=12, 这也是“HELLO, WORLD” 的长度。

如果不想要Length字段，可以通过设置initialBytesToStrip把length删除：

```
   lengthFieldOffset   = 0
   lengthFieldLength   = 2
   lengthAdjustment    = 0
   initialBytesToStrip = 2 (= length 字段的长度)
  
   BEFORE DECODE (14 bytes)         AFTER DECODE (12 bytes)
   +--------+----------------+      +----------------+
   | Length | Actual Content |----->| Actual Content |
   | 0x000C | "HELLO, WORLD" |      | "HELLO, WORLD" |
   +--------+----------------+      +----------------+
```

lengthAdjustment是对Length字段的值进行调整，因为在有些情况下Length字段可能包含了整条数据的长度，也就是Length+内容，所以需要在解析的时候进行调整，比如下面的例子，真实长度其实是0x0C,但是传入的却是0x0E,所以需要减去Length字段的长度2，也就是将lengthAdjustment设置为-2。

```
   lengthFieldOffset   =  0
   lengthFieldLength   =  2
   lengthAdjustment    = -2 (= Length字段的长度)
   initialBytesToStrip =  0

   BEFORE DECODE (14 bytes)         AFTER DECODE (14 bytes)
   +--------+----------------+      +--------+----------------+
   | Length | Actual Content |----->| Length | Actual Content |
   | 0x000E | "HELLO, WORLD" |      | 0x000E | "HELLO, WORLD" |
   +--------+----------------+      +--------+----------------+
```

## LineBasedFrameDecoder

LineBasedFrameDecoder专门处理文本文件中的一行结束。也就是 "\n" 和 "\r\n"，他和DelimiterBasedFrameDecoder很类似，但是DelimiterBasedFrameDecoder更加通用。

# 总结

有了上面4个Frame detection装置之后，就可以在pipline中首先添加这些Frame detection，然后再添加自定义的handler，这样在自定义的handler中就不用考虑读取ByteBuf的长度问题了。

比如在StringDecoder中，如果已经使用了 LineBasedFrameDecoder ， 那么在decode方法中可以假设传入的ByteBuf就是一行字符串，那么可以直接这样使用：

```
    protected void decode(ChannelHandlerContext ctx, ByteBuf msg, List<Object> out) throws Exception {
        out.add(msg.toString(charset));
    }
```

是不是很简单？





