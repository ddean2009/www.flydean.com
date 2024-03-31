---
slug: /14-5-netty-frame-decoder
---

# 31. netty系列之:netty中的frame解码器



# 简介

netty中的数据是通过ByteBuf来进行传输的，一个ByteBuf中可能包含多个有意义的数据，这些数据可以被称作frame，也就是说一个ByteBuf中可以包含多个Frame。

对于消息的接收方来说，接收到了ByteBuf，还需要从ByteBuf中解析出有用而数据，那就需要将ByteBuf中的frame进行拆分和解析。

一般来说不同的frame之间会有有些特定的分隔符,我们可以通过这些分隔符来区分frame，从而实现对数据的解析。

netty为我们提供了一些合适的frame解码器，通过使用这些frame解码器可以有效的简化我们的工作。下图是netty中常见的几个frame解码器：

<img src="https://img-blog.csdnimg.cn/6f394018c43a40a6a53a5260fc577575.png" style="zoom:67%;" />

接下来我们来详细介绍一下上面几个frame解码器的使用。

# LineBasedFrameDecoder

LineBasedFrameDecoder从名字上看就是按行来进行frame的区分。根据操作系统的不同，换行可以有两种换行符，分别是 "\n" 和 "\r\n" 。

LineBasedFrameDecoder的基本原理就是从ByteBuf中读取对应的字符来和"\n" 跟 "\r\n"，可以了可以准确的进行字符的比较，这些frameDecoder对字符的编码也会有一定的要求，一般来说是需要UTF-8编码。因为在这样的编码中，"\n"和"\r"是以一个byte出现的，并且不会用在其他的组合编码中，所以用"\n"和"\r"来进行判断是非常安全的。

LineBasedFrameDecoder中有几个比较重要的属性，一个是maxLength的属性，用来检测接收到的消息长度，如果超出了长度限制，则会抛出TooLongFrameException异常。

还有一个stripDelimiter属性，用来判断是否需要将delimiter过滤掉。

还有一个是failFast,如果该值为true，那么不管frame是否读取完成，只要frame的长度超出了maxFrameLength，就会抛出TooLongFrameException。如果该值为false，那么TooLongFrameException会在整个frame完全读取之后再抛出。

LineBasedFrameDecoder的核心逻辑是先找到行的分隔符的位置，然后根据这个位置读取到对应的frame信息，这里来看一下找到行分隔符的findEndOfLine方法：

```
    private int findEndOfLine(final ByteBuf buffer) {
        int totalLength = buffer.readableBytes();
        int i = buffer.forEachByte(buffer.readerIndex() + offset, totalLength - offset, ByteProcessor.FIND_LF);
        if (i >= 0) {
            offset = 0;
            if (i > 0 && buffer.getByte(i - 1) == '\r') {
                i--;
            }
        } else {
            offset = totalLength;
        }
        return i;
    }
```

这里使用了一个ByteBuf的forEachByte对ByteBuf进行遍历。我们要找的字符是：ByteProcessor.FIND_LF。

最后LineBasedFrameDecoder解码之后的对象还是一个ByteBuf。

# DelimiterBasedFrameDecoder

上面讲的LineBasedFrameDecoder只对行分隔符有效，如果我们的frame是以其他的分隔符来分割的话LineBasedFrameDecoder就用不了了，所以netty提供了一个更加通用的DelimiterBasedFrameDecoder，这个frameDecoder可以自定义delimiter:

```
public class DelimiterBasedFrameDecoder extends ByteToMessageDecoder {

        public DelimiterBasedFrameDecoder(int maxFrameLength, ByteBuf delimiter) {
        this(maxFrameLength, true, delimiter);
    }

```

传入的delimiter是一个ByteBuf，所以delimiter可能不止一个字符。

为了解决这个问题在DelimiterBasedFrameDecoder中定义了一个ByteBuf的数组：

```
    private final ByteBuf[] delimiters;

    delimiters= delimiter.readableBytes();
```

这个delimiters是通过调用delimiter的readableBytes得到的。

DelimiterBasedFrameDecoder的逻辑和LineBasedFrameDecoder差不多，都是通过对比bufer中的字符来对bufer中的数据进行截取，但是DelimiterBasedFrameDecoder可以接受多个delimiters，所以它的用处会根据广泛。

# FixedLengthFrameDecoder

除了进行ByteBuf中字符比较来进行frame拆分之外，还有一些其他常见的frame拆分的方法，比如根据特定的长度来区分，netty提供了一种这样的decoder叫做FixedLengthFrameDecoder。

```
public class FixedLengthFrameDecoder extends ByteToMessageDecoder 
```

FixedLengthFrameDecoder也是继承自ByteToMessageDecoder，它的定义很简单，可以传入一个frame的长度：

```
    public FixedLengthFrameDecoder(int frameLength) {
        checkPositive(frameLength, "frameLength");
        this.frameLength = frameLength;
    }
```

然后调用ByteBuf的readRetainedSlice方法来读取固定长度的数据：

```
in.readRetainedSlice(frameLength)
```

最后将读取到的数据返回。

# LengthFieldBasedFrameDecoder

还有一些frame中包含了特定的长度字段，这个长度字段表示ByteBuf中有多少可读的数据，这样的frame叫做LengthFieldBasedFrame。

netty中也提供了一个对应的处理decoder：

```
public class LengthFieldBasedFrameDecoder extends ByteToMessageDecoder 
```

读取的逻辑很简单，首先读取长度，然后再根据长度再读取数据。为了实现这个逻辑，LengthFieldBasedFrameDecoder提供了4个字段，分别是 lengthFieldOffset,lengthFieldLength,lengthAdjustment和initialBytesToStrip。

lengthFieldOffset指定了长度字段的开始位置，lengthFieldLength定义的是长度字段的长度，lengthAdjustment是对lengthFieldLength进行调整，initialBytesToStrip表示是否需要去掉长度字段。

听起来好像不太好理解，我们举几个例子，首先是最简单的：

```
   BEFORE DECODE (14 bytes)         AFTER DECODE (14 bytes)
   +--------+----------------+      +--------+----------------+
   | Length | Actual Content |----->| Length | Actual Content |
   | 0x000C | "HELLO, WORLD" |      | 0x000C | "HELLO, WORLD" |
   +--------+----------------+      +--------+----------------+
```

要编码的消息有个长度字段，长度字段后面就是真实的数据，0x000C是一个十六进制，表示的数据是12，也就是"HELLO, WORLD" 中字符串的长度。

这里4个属性的值是：

```
   lengthFieldOffset   = 0
   lengthFieldLength   = 2
   lengthAdjustment    = 0
   initialBytesToStrip = 0 
```

表示的是长度字段从0开始，并且长度字段占有两个字节，长度不需要调整，也不需要对字段进行调整。

再来看一个比较复杂的例子，在这个例子中4个属性值如下：

```
   lengthFieldOffset   = 1  
   lengthFieldLength   = 2
   lengthAdjustment    = 1  
   initialBytesToStrip = 3  
```

对应的编码数据如下所示：

```
BEFORE DECODE (16 bytes)                       AFTER DECODE (13 bytes)
   +------+--------+------+----------------+      +------+----------------+
   | HDR1 | Length | HDR2 | Actual Content |----->| HDR2 | Actual Content |
   | 0xCA | 0x000C | 0xFE | "HELLO, WORLD" |      | 0xFE | "HELLO, WORLD" |
   +------+--------+------+----------------+      +------+----------------+
```

上面的例子中长度字段是从第1个字节开始的(第0个字节是HDR1)，长度字段占有2个字节，长度再调整一个字节，最终数据的开始位置就是1+2+1=4,然后再截取前3个字节的数据，得到了最后的结果。

# 总结

netty提供的这几个基于字符集的frame decoder基本上能够满足我们日常的工作需求了。当然，如果你传输的是一些更加复杂的对象，那么可以考虑自定义编码和解码器。自定义的逻辑步骤和上面我们讲解的保持一致就行了。






