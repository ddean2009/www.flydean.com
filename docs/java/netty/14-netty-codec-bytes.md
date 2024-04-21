---
slug: /14-2-netty-codec-bytes
---

# 28. netty系列之:netty中的核心编码器bytes数组



# 简介

我们知道netty中数据传输的核心是ByteBuf,ByteBuf提供了多种数据读写的方法，包括基本类型和byte数组的读写方法。如果要在netty中传输这些数据，那么需要构建ByteBuf，然后调用ByteBuf中对应的方法写入对应的数据，接着套用netty中标准的模板即可使用。

对于byte数组来说，如果每次都将其封装进ByteBuf中，再进行传输显得有些麻烦。于是netty提供了一个基于bytes的核心编码解码器。

# byte是什么

那么byte是什么呢? byte表示的是一个字节，也就是8bits。用二进制表示就是-128-127的范围。byte是JAVA中的基础类型。

同时它还有一个wrap类型叫做Byte。

先看下Byte的定义：

```
public final class Byte extends Number implements Comparable<Byte>
```

Byte中定义了byte的取值访问：

```
    public static final byte   MIN_VALUE = -128;

    public static final byte   MAX_VALUE = 127;
```

并且还提供了一些基本的工具方法。

因为byte表示的是一个8bits的二进制，如果不算位运算的话，byte基本上是JAVA中最小的数据存储单位了。所以JAVA中所有的对象都可以转换成为byte。

基础类型的转换这里就不多讲了。这里主要看一下字符串String和对象Object和byte数组之间的转换。

先来看下字符串String和byte数组之间的转换，也就是String和二进制之间的转换。

基本的转换思路就是将String中的字符进行编码，然后将编码过后的字符进行存储即可。

String类本身提供了一个getBytes方法，可以接受编码类型，以UTF-8来说，我们来看下转换方法的调用：

```
    public static byte[] stringToBytes(String str) throws UnsupportedEncodingException {
       return str.getBytes("utf-8");
    }

    public static String bytesToString(byte[] bs) throws UnsupportedEncodingException {
       return new String(bs, "utf-8");
    }
```

直接调用String中的方法即可。

如果是Object对象的话，因为Object本身并没有提供转换的方法，所以我们需要借助于ByteArrayOutputStream的toByteArray方法和ByteArrayInputStream的readObject方法来实现byte数组和Object之间的转换，如下所示：

```
    //对象转数组
    public byte[] toByteArray (Object obj) throws IOException {
        try(ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos)) {
            oos.writeObject(obj);
            oos.flush();
            return  bos.toByteArray();
        }
    }

    //数组转对象
    public Object toObject (byte[] bytes) throws IOException, ClassNotFoundException {
        try (
            ByteArrayInputStream bis = new ByteArrayInputStream (bytes);
            ObjectInputStream ois = new ObjectInputStream (bis)) {
            return ois.readObject();
        }
    }
```

# netty中的byte数组的工具类

netty中的核心是ByteBuf，ByteBuf提供了大部分基础数据类型的read和write方法。当然如果要读取对象，那么还是需要将对象转换成为byte然后再写入或者从ByteBuf中读出。

当然，netty中不需要这么复杂，netty提供了一个Unpooled的工具类用来方便的将byte数组和ByteBuf进行转换。

先看下Unpooled方法提供的ByteBuff构建方法：

```
   ByteBuf heapBuffer    = buffer(128);
   ByteBuf directBuffer  = directBuffer(256);
   ByteBuf wrappedBuffer = wrappedBuffer(new byte[128], new byte[256]);
   ByteBuf copiedBuffer  = copiedBuffer(ByteBuffer.allocate(128));
```

这是Unpooled提供的几种ByteBuf的构建方式，其中heapBuffer表示的是在用户空间构建的buff，directBuffer表示的是直接在系统空间构建的buff。wrappedBuffer是对现有的byte数组和ByteBuf之上构建的视图，而copiedBuffer是对byte数组,byteBuf和字符串的拷贝。

这里我们需要用到wrappedBuffer方法，将byte数组封装到ByteBuf中：

```
    public static ByteBuf wrappedBuffer(byte[] array) {
        if (array.length == 0) {
            return EMPTY_BUFFER;
        }
        return new UnpooledHeapByteBuf(ALLOC, array, array.length);
    }
```

wrappedBuffer返回了一个UnpooledHeapByteBuf对象，这个对象本身就是一个ByteBuf。这里将byte数组作为构造函数传入UnpooledHeapByteBuf中。

这里的array是UnpooledHeapByteBuf中的私有变量：

```
byte[] array;

```

除了构造函数，UnpooledHeapByteBuf还提供了一个setArray的方法用来设置byte数组：

```
    private void setArray(byte[] initialArray) {
        array = initialArray;
        tmpNioBuf = null;
    }
```

下面是如何从array中构建ByteBuf：

```
    public ByteBuf setBytes(int index, ByteBuffer src) {
        ensureAccessible();
        src.get(array, index, src.remaining());
        return this;
    }
```

从ByteBuf中读取byte数组,可以调用ByteBufUtil的getBytes方法：

```
    public static byte[] getBytes(ByteBuf buf) {
        return getBytes(buf,  buf.readerIndex(), buf.readableBytes());
    }
```

# netty中byte的编码器

万事俱备只欠东风，有了上面netty提供的工具类，我们就可以使用这些工具类构建基于byte的编码器了。

netty中基于byte的编码解码器分别叫做ByteArrayEncoder和ByteArrayDecoder。

先来看下这两个类是如何使用的,这里以一个典型的TCP/IP应用为例：

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

这里的LengthFieldBasedFrameDecoder和LengthFieldPrepender是以消息长度为分割标准的frame分割器。这里我们主要关注ChannelPipeline中添加的ByteArrayDecoder和ByteArrayEncoder。

添加了byte的编码和解码器之后，就可以直接在handler中直接使用byte数组，如下所示：

```
   void channelRead(ChannelHandlerContext ctx, byte[] bytes) {
       ...
   }
```

先来看下ByteArrayEncoder，这是一个编码器,它的实现很简单：

```
public class ByteArrayEncoder extends MessageToMessageEncoder<byte[]> {
    @Override
    protected void encode(ChannelHandlerContext ctx, byte[] msg, List<Object> out) throws Exception {
        out.add(Unpooled.wrappedBuffer(msg));
    }
}
```

具体就是使用Unpooled.wrappedBuffer方法byte数组封装成为ByteBuf，然后将其添加到out list中。

同样的，我们观察一下ByteArrayDecoder,这是一个解码器，实现也比较简单：

```
public class ByteArrayDecoder extends MessageToMessageDecoder<ByteBuf> {
    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf msg, List<Object> out) throws Exception {
         // copy the ByteBuf content to a byte array
        out.add(ByteBufUtil.getBytes(msg));
    }
}
```

具体的实现就是调用ByteBufUtil.getBytes方法，将ByteBuf转换成为byte数组，然后添加到list对象中。

# 总结

如果要在netty中传输二进制数据，netty提供的byte编码和解码器已经封装了繁琐的细节，大家可以放心使用。









