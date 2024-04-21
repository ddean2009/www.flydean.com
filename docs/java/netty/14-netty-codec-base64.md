---
slug: /14-1-netty-codec-base64
---

# 27. netty系列之:netty中的核心编码器base64



# 简介

我们知道数据在netty中传输是以ByteBuf的形式进行的,可以说ByteBuf是netty的数据传输基础。但是对于现代的应用程序来说，通常我们需要用到其他的数据结构或者类型。

为了方便我们在程序中的编写，一种方式就是在将数据传入到netty中的时候由程序员自身将数据格式进行转换，然后再调用netty的系统方法。另外一种方式就是定义一些codec，由netty的内在编码机制将程序中用到的数据格式和ByteBuf进行自动转换。

很明显，使用codec的方式更加简捷，也更加符合程序的开发规则。

为了方便程序的开发，netty本身在内部定义了一些核心的codec插件，我们在需要的时候直接选用即可。

本文将会讲解netty内部实现codec的方式和一个最核心的编码器base64。

# netty codec的实现逻辑 

所有的netty codec的目的就是在数据传输过程中进行数据类型的转换，换句话说就是对数据进行处理。我们知道netty中有两个对数据进行handler的类，分别是ChannelInboundHandlerAdapter和ChannelOutboundHandlerAdapter，他们分别对应channel中的inbound消息和outbound消息进行处理。

所以很自然的，我们的codec逻辑只需要在这两个地方添加即可。

netty为我们提供了两个HandlerAdapter类的继承类，分别是MessageToMessageDecoder和MessageToMessageEncoder：

```
public abstract class MessageToMessageEncoder<I> extends ChannelOutboundHandlerAdapter 

public abstract class MessageToMessageDecoder<I> extends ChannelInboundHandlerAdapter
```

从名字就可以看出来这两个类分别使用来编码和解码用的，所以我们的codec只需要分别实现这两个类即可。

以下是一个StringToIntegerDecoder和IntegerToStringEncoder的例子：

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

最简单的实现就是分别重构这两个类的decode和encode方法。

# netty中Base64的实现

我们知道JDK中已经有了Base64实现的工具类叫做java.util.Base64。但是在netty中又使用了一个新的实现类同样叫做Base64，它的全称是io.netty.handler.codec.base64.Base64。

这个Base64类中用到了一个Base64Dialect类，也就是netty中Base64支持的Base64编码方式。Base64Dialect中提供了下面的几种类型：

```
STANDARD
URL_SAFE
ORDERED
```

其中STANDARD对应的是RFC3548也是JDK中的标准Base64,URL_SAFE对应的是RFC3548中的base64url版本，对应的JDK中的getUrlEncode。

最后一个是ORDERED，代表的是RFC1940,这个编码实现在JDK中是没有的。

为什么JDK中已经有了Base64的工具类，netty中还需要自己创建一个新的类呢？

我们可以考虑一下在netty中Base64用到的场景，通常来说我们是在handler中添加自定义编码，而这些handler主要是针对于数据流进行处理。

JDK中自带的Base64实现在定长的数据上使用还是没问题的，但是如果运用于数据流的处理话，效率就会比较低。所以Netty才需要为base64在流数据的情况下重新实现一个Base64类。

netty中的实现方式使用的是Robert Harder's Public Domain Base64 Encoder/Decoder。这里就不多讲这个算法的实现逻辑了。感兴趣的朋友可以自行探索。

Base64提供了将ByteBuf进行base64编码和解码的方法，我们选择参数最长的方法来观察，如下所示：

```
    public static ByteBuf encode(
            ByteBuf src, int off, int len, boolean breakLines, Base64Dialect dialect, ByteBufAllocator allocator)

    public static ByteBuf decode(
            ByteBuf src, int off, int len, Base64Dialect dialect, ByteBufAllocator allocator)
```

对于encode方法来说，需要下面几个参数：

1. ByteBuf类型的src，这是我们需要进行编码的源。
2. int类型的off和len，表示的是ByteBuf中要编码数据的位置。
3. boolean类型的breakLines,表示是否添加换行符。
4. Base64Dialect类型的dialect，表示选择的base64编码类型。
5. ByteBufAllocator的allocator，表示返回的ByteBuf的生成方式。

同样的Decode方法，需要下面的几个参数：

1. ByteBuf类型的src，这是我们需要进行解码的源。
2. int类型的off和len，表示的是ByteBuf中要解码数据的位置。
3. Base64Dialect类型的dialect，表示选择的base64编码类型。
4. ByteBufAllocator的allocator，表示返回的ByteBuf的生成方式。

# netty中的base64编码和解码器

刚刚我们介绍了netty中提供的新的Base64工具类，这个工具类提供了将ByteBuf中数据进行编码和解码的方法。接下来我们看一下netty是如何使用这个工具类实现netty中的base64编码和解码器。

netty中提供了对Base64的编码和解码器，分别是Base64Encoder和Base64Decoder, 先来看下Base64编码解码器的基本使用：

```
   ChannelPipeline pipeline = ...;
  
   // Decoders
   pipeline.addLast("frameDecoder", new DelimiterBasedFrameDecoder(80, Delimiters.nulDelimiter()));
   pipeline.addLast("base64Decoder", new Base64Decoder());
  
   // Encoder
   pipeline.addLast("base64Encoder", new Base64Encoder());
```

用起来很简单，只需要把Base64Decoder和Base64Encoder添加到pipeline中即可。

有时候Base64Decoder需要和DelimiterBasedFrameDecoder一起使用，尤其是在TCP/IP协议中，因为我们需要根据特定的Delimiters来判断ByteBuf应该被分割为几个frames。这样才能保证数据的有效性。

## Base64Encoder

首先来看base64的编码器，Base64Encoder的实现比较简单，首先来看下Base64Encoder的定义：

```
public class Base64Encoder extends MessageToMessageEncoder<ByteBuf> 
```

Base64Encoder继承自MessageToMessageEncoder，它传入的泛型ByteBuf，表示是将ByteBuf编码为ByteBuf，虽然外部的ByteBuf类型没有变化，但是ByteBuf中的数据已经被编码成为Base64了。

接下来是Base64Encoder的构造函数：

```
    public Base64Encoder(boolean breakLines, Base64Dialect dialect) {
        this.dialect = ObjectUtil.checkNotNull(dialect, "dialect");
        this.breakLines = breakLines;
    }
```

Base64Encoder可以接受两个参数，分别是是否有换行符的breakLines和base64编码方式的Base64Dialect。

它的encode方法也很简单：

```
    protected void encode(ChannelHandlerContext ctx, ByteBuf msg, List<Object> out) throws Exception {
        out.add(Base64.encode(msg, msg.readerIndex(), msg.readableBytes(), breakLines, dialect));
    }
```

直接使用的是我们上面讲到的Base64工具类的encode方法，然后把返回值添加到out对象中。

## Base64Decoder

Base64Decoder用来将ByteBuf中的base64编码的内容解码成为原始内容，先来看下Base64Decoder的定义：

```
public class Base64Decoder extends MessageToMessageDecoder<ByteBuf> 
```

Base64Decoder继承了MessageToMessageDecoder，传入的泛型是ByteBuf。

先看下Base64Decoder的构造函数：

```
public Base64Decoder(Base64Dialect dialect) {
        this.dialect = ObjectUtil.checkNotNull(dialect, "dialect");
    }
```

Base64Decoder的构造函数很简单，和Base64Encoder相比它只需要一个参数就是Base64Dialect类型的dialect，表示的是选择的base64解码的方式。

接下来就是它的解码方法：

```
    protected void decode(ChannelHandlerContext ctx, ByteBuf msg, List<Object> out) throws Exception {
        out.add(Base64.decode(msg, msg.readerIndex(), msg.readableBytes(), dialect));
    }
```

解码方法也是调用Base64工具类的decode方法，然后将其添加到返回的out list中去。

# 总结

本章介绍了netty中的核心编码器Base64,它负责将ByteBuf中的消息编码为base64格式，同时提供了对应的解码器，大家可以在需要的时候进行使用。
















