---
slug: /16-netty-buildin-codec-common
---

# 37. netty系列之:最基本的内置编码解码器



# 简介

netty之所以强大，是因为它内置了很多非常有用的编码解码器，通过使用这些编码解码器可以很方便的搭建出非常强大的应用程序，今天给大家讲讲netty中最基本的内置编码解码器。

# netty中的内置编码器

在对netty的包进行引入的时候，我们可以看到netty有很多以netty-codec开头的artifactId，统计一下，有这么多个：

```
netty-codec
netty-codec-http
netty-codec-http2
netty-codec-memcache
netty-codec-redis
netty-codec-socks
netty-codec-stomp
netty-codec-mqtt
netty-codec-haproxy
netty-codec-dns
```

总共10个codec包，其中netty-codec是最基础的一个，其他的9个是对不同的协议包进行的扩展和适配，可以看到netty支持常用的和流行的协议格式，非常的强大。因为codec的内容非常多，要讲解他们也不是很容易，本文将会以netty-codec做一个例子，讲解其中最基本的也是最通用的编码解码器。

# 使用codec要注意的问题

虽然netty提供了很方便的codec编码解码器，但是正如我们在前一篇文章中提到的，有些codec是需要和Frame detection一起配合使用的，先使用Frame detection将ByteBuf拆分成一个个代表真实数据的ByteBuf，再交由netty内置的codec或者自定义的codec进行处理，这样才能起到应有的效果。

# netty内置的基本codec

netty中基本的codec有base64、bytes、compression、json、marshalling、protobuf、serialization、string和xml这几种。

下面将会一一进行讲解。

## base64

这个codec是负责ByteBuf和base64过后的ByteBuf之间的转换。虽然都是从ByteBuf到ByteBuf，但是其中的内容发生了变化。

有两个关键的类，分别是Base64Encoder和Base64Decoder。因为Base64Decoder是一个MessageToMessageDecoder，所以需要使用一个DelimiterBasedFrameDecoder提前进行处理，常用的例子如下：

```
   ChannelPipeline pipeline = ...;
  
   // Decoders
   pipeline.addLast("frameDecoder", new DelimiterBasedFrameDecoder(80, Delimiters.nulDelimiter()));
   pipeline.addLast("base64Decoder", new Base64Decoder());
  
   // Encoder
   pipeline.addLast("base64Encoder", new Base64Encoder());
```

## bytes

bytes是将bytes数组和ByteBuf之间进行转换，同样的在decode之前，也需要使用FrameDecoder，通常的使用方式如下：

```
   ChannelPipeline pipeline = ...;
  
   // Decoders
   pipeline.addLast("frameDecoder",
                    new LengthFieldBasedFrameDecoder(1048576, 0, 4, 0, 4));
   pipeline.addLast("bytesDecoder",
                    new ByteArrayDecoder());
  
   // Encoder
   pipeline.addLast("frameEncoder", new LengthFieldPrepender(4));
   pipeline.addLast("bytesEncoder", new ByteArrayEncoder());
   
```

## compression

compression这个包的内容就比较丰富了，主要是对数据的压缩和解压缩服务。其支持的算法如下：

```
brotli
Bzip2
FastLZ
JdkZlib
Lz4
Lzf
Snappy
Zlib
Zstandard
```
compression对于大数据量的传输特别有帮助，通过压缩可以节省传输的数据量，从而提高传输速度。

但是压缩是使用特定的算法来计算的，所以它是一个高CPU的操作，我们在使用的时候需要兼顾网络速度和CPU性能，并从中得到平衡。


## json

json这个包里面只有一个JsonObjectDecoder类，主要负责将Byte流的JSON对象或者数组转换成JSON对象和数组。

JsonObjectDecoder直接就是一个ByteToMessageDecoder的子类，所以它不需要FrameDecoder，它是根据括号的匹配来判断Byte数组的起始位置，从而区分哪些Byte数据是属于同一个Json对象或者数组。

我们如果希望使用JSON来传输数据的话，这个类就非常有用了。

## marshalling

Marshalling的全称叫做JBoss Marshalling，它是JBoss出品的一个对象序列化的方式，但是JBoss Marshalling的最新API还是在2011-04-27，已经有10年没更新了，是不是已经被废弃了？

所以这里我们不详细介绍这个序列化的内容，感兴趣的小伙伴可以自行探索。

## protobuf

protobuf大家应该都很熟悉了，它是google出品的一种信息交换格式，可以将其看做是一种序列化的方式。它是语言中立、平台中立、可扩展的结构化数据序列化机制，和XML类似，但是比XML更小、更快、更简单。

netty对protobuf的支持在于可以将protobuf中的message和MessageLite对象跟ByteBuf进行转换。

protobuf的两个编码器也是message到message直接的转换，所以也需要使用frame detection。当然你也可以使用其他的frame detection比如LengthFieldPrepender和LengthFieldBasedFrameDecoder如下所示：

```
   ChannelPipeline pipeline = ...;
  
   // Decoders
   pipeline.addLast("frameDecoder",
                    new LengthFieldBasedFrameDecoder(1048576, 0, 4, 0, 4));
   pipeline.addLast("protobufDecoder",
                    new ProtobufDecoder(MyMessage.getDefaultInstance()));
  
   // Encoder
   pipeline.addLast("frameEncoder", new LengthFieldPrepender(4));
   pipeline.addLast("protobufEncoder", new ProtobufEncoder());
```
其中LengthFieldPrepender会自动给字段前面加上一个长度字段：

```
之前：
   +----------------+
   | "HELLO, WORLD" |
   +----------------+

之后：
   +--------+----------------+
   + 0x000C | "HELLO, WORLD" |
   +--------+----------------+
```

当然netty为protobuf准备了两个专门的frame detection，他们是ProtobufVarint32FrameDecoder和ProtobufVarint32LengthFieldPrepender。在讲解这两个类之前，我们需要了解一下protobuf中的Base 128 Varints。

什么叫Varints呢？就是序列化整数的时候，占用的空间大小是不一样的，小的整数占用的空间小，大的整数占用的空间大，这样不用固定一个具体的长度，可以减少数据的长度，但是会带来解析的复杂度。

那么怎么知道这个数据到底需要几个byte呢？在protobuf中，每个byte的最高位是一个判断位，如果这个位被置位1，则表示后面一个byte和该byte是一起的，表示同一个数，如果这个位被置位0，则表示后面一个byte和该byte没有关系，数据到这个byte就结束了。

举个例子，一个byte是8位，如果表示的是整数1，那么可以用下面的byte来表示：

```
0000 0001
```

如果一个byte装不下的整数，那么就需要使用多个byte来进行连接操作，比如下面的数据表示的是300：

```
1010 1100 0000 0010
```

为什么是300呢？首先看第一个byte，它的首位是1，表示后面还有一个byte。再看第二个byte，它的首位是0，表示到此就结束了。我们把判断位去掉，变成下面的数字：

```
010 1100 000 0010
```
这时候还不能计算数据的值，因为在protobuf中，byte的位数是反过来的，所以我们需要把上面的两个byte交换一下位置：


```
000 0010 010 1100 
```

也就是：

```
10 010 1100 
```

=256 + 32 + 8 + 4 = 300

在protobuf中一般使用Varint作为字段的长度位，所以netty提供了ProtobufVarint32LengthFieldPrepender和ProtobufVarint32FrameDecoder对ByteBuf进行转换。

比如为ByteBuf添加varint的length：
```
   BEFORE ENCODE (300 bytes)       AFTER ENCODE (302 bytes)
   +---------------+               +--------+---------------+
   | Protobuf Data |-------------->| Length | Protobuf Data |
   |  (300 bytes)  |               | 0xAC02 |  (300 bytes)  |
   +---------------+               +--------+---------------+
```

解码的时候删除varint的length字段：

```
   BEFORE DECODE (302 bytes)       AFTER DECODE (300 bytes)
   +--------+---------------+      +---------------+
   | Length | Protobuf Data |----->| Protobuf Data |
   | 0xAC02 |  (300 bytes)  |      |  (300 bytes)  |
   +--------+---------------+      +---------------+
```

## serialization

序列化就是把对象转换成二进制数据，事实上所有的codec都可以成为序列化。他们提供了对象和byte之间的转换方法。

netty也提供了两个对象的转换方法：ObjectDecoder和ObjectEncoder。

要注意的是，这两个对象和JDK自带的ObjectInputStream和ObjectOutputStream，是不兼容的，如果要兼容，可以使用CompactObjectInputStream、CompactObjectOutputStream和CompatibleObjectEncoder。

## string

String是我们最常使用到的对象，netty为string提供了StringDecoder和StringEncoder。

同样的，在使用这两个类之前，需要将消息进行转换，通常使用的是 LineBasedFrameDecoder按行进行转换：

```
   ChannelPipeline pipeline = ...;
  
   // Decoders
   pipeline.addLast("frameDecoder", new LineBasedFrameDecoder(80));
   pipeline.addLast("stringDecoder", new StringDecoder(CharsetUtil.UTF_8));
  
   // Encoder
   pipeline.addLast("stringEncoder", new StringEncoder(CharsetUtil.UTF_8));
```

## xml

xml也是一个非常常用的格式，但是它的体积会比较大，现在应该用的比较少了。netty提供了一个XmlFrameDecoder来进行解析。

因为xml有自己的开始和结束符，所以不需要再做frame detection，直接转换即可，如：

```
   +-----+-----+-----------+
   | <an | Xml | Element/> |
   +-----+-----+-----------+
转换成：
   +-----------------+
   | <anXmlElement/> |
   +-----------------+
```

```
   +-----+-----+-----------+-----+----------------------------------+
   | <an | Xml | Element/> | <ro | ot><child>content</child></root> |
   +-----+-----+-----------+-----+----------------------------------+
   转换成：
   +-----------------+-------------------------------------+
   | <anXmlElement/> | <root><child>content</child></root> |
   +-----------------+-------------------------------------+
```

都是可以的。

# 总结

netty提供了很多优秀的codec来适配各种应用协议，大家可以多用用，找找不同协议的不同之处。



