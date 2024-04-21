---
slug: /14-6-netty-codec-string
---

# 32. netty系列之:netty中常用的字符串编码解码器



# 简介

字符串是我们程序中最常用到的消息格式，也是最简单的消息格式，但是正因为字符串string太过简单，不能附加更多的信息，所以在netty中选择的是使用byteBuf作为最底层的消息传递载体。

虽然底层使用的ByteBuf，但是对于程序员来说，还是希望能够使用这种最简单的字符串格式，那么有什么简单的方法吗?

# netty中的字符串编码解码器 

为了解决在netty的channel中传递字符串的问题，netty提供了针对于字符串的编码和解码器,分别是StringEncoder和StringDecoder。

我们来看下他们是怎么在程序中使用的,首先是将StringDecoder和StringEncoder加入channelPipeline中:

```
   ChannelPipeline pipeline = ...;
  
   // Decoders
   pipeline.addLast("frameDecoder", new LineBasedFrameDecoder(80));
   pipeline.addLast("stringDecoder", new StringDecoder(CharsetUtil.UTF_8));
  
   // Encoder
   pipeline.addLast("stringEncoder", new StringEncoder(CharsetUtil.UTF_8));
```

注意，这里我们在使用StringDecoder之前还调用了LineBasedFrameDecoder，先把数据按行进行分割，然后再进行字符串的读取。

那么有人要问了，decoder加入了LineBasedFrameDecoder预处理，为什么写入的时候没有添加行的分割符呢？

事实上这里有两种处理方式，第一种就是在向channel中写入字符串的时候，手动加上行分隔符，如下所示：

```
   void channelRead(ChannelHandlerContext ctx, String msg) {
       ch.write("Did you say '" + msg + "'?\n");
   }
```

如果不想每次都在msg后面加上换行符，那么可以将StringEncoder替换成为LineEncoder，上面的pipeline就变成下面这样：

```
   ChannelPipeline pipeline = ...;
  
   // Decoders
   pipeline.addLast("frameDecoder", new LineBasedFrameDecoder(80));
   pipeline.addLast("stringDecoder", new StringDecoder(CharsetUtil.UTF_8));
  
   // Encoder
   pipeline.addLast("lineEncoder", new LineEncoder(LineSeparator.UNIX, CharsetUtil.UTF_8));
```

这样，我们在handler中就不需要手动添加换行符了，如下所示：

```
   void channelRead(ChannelHandlerContext ctx, String msg) {
       ch.write("Did you say '" + msg + "'?");
   }
```

# 不同平台的换行符

在unix和windows平台传递过文本文件的朋友可能会遇到一个问题，就是windows创建的文本文件，如果在unix下面打开的话，会发现每行后面多出了一个特殊字符，这是因为unix和windows平台定义的换行符是不同的。

在unix平台通常使用"\n"来换行，而在windows平台则使用""\r\n"来换行。

java程序因为是跨平台的，写出的程序可能运行在unix平台，也可能运行在windows平台，所以我们需要有一个办法来获取平台的换行符，netty提供了一个LineSeparator的类来完成这个工作。

LineSeparator中有三个换行符的定义，分别是：

```
   public static final LineSeparator DEFAULT = new LineSeparator(StringUtil.NEWLINE);

    public static final LineSeparator UNIX = new LineSeparator("\n");

    public static final LineSeparator WINDOWS = new LineSeparator("\r\n");
```

UNIX和WINDOWS很好理解，他们就是我们刚刚讲到的不同的平台。

那么什么是DEFAULT呢？DEFAULT中传入的NEWLINE，实际上是从系统属性中获取到的，如果没有获取到，则使用默认的"\n"。

```
public static final String NEWLINE = SystemPropertyUtil.get("line.separator", "\n");
```

# 字符串编码的实现

上面我们讲到了和字符串编码解码相关的类分别是StringEncoder，LineEncoder和StringDecoder,我们来详细看下这三个类的实现。

首先是StringEncoder，StringEncoder继承了MessageToMessageEncoder:

```
public class StringEncoder extends MessageToMessageEncoder<CharSequence> 
```

泛型中的CharSequence表示StringEncoder要encode的对象是CharSequence，也就是字符序列。

虽然大家常用String这个类，但是不一定大家都知道String其实是CharSequence的子类，所以StringEncoder也可以编码字符串。

StringEncoder的编码逻辑很简单，将传入的字符串msg转换成为CharBuffer，然后调用ByteBufUtil的encodeString方法就可以转换成为ByteBuf，并加入out中去：

```
    protected void encode(ChannelHandlerContext ctx, CharSequence msg, List<Object> out) throws Exception {
        if (msg.length() == 0) {
            return;
        }
        out.add(ByteBufUtil.encodeString(ctx.alloc(), CharBuffer.wrap(msg), charset));
    }
```

LineEncoder和StringEncoder很类似，它也是继承自MessageToMessageEncoder：

```
public class LineEncoder extends MessageToMessageEncoder<CharSequence> 
```

不同之处在于encoder方法：

```
    protected void encode(ChannelHandlerContext ctx, CharSequence msg, List<Object> out) throws Exception {
        ByteBuf buffer = ByteBufUtil.encodeString(ctx.alloc(), CharBuffer.wrap(msg), charset, lineSeparator.length);
        buffer.writeBytes(lineSeparator);
        out.add(buffer);
    }
```

ByteBufUtil的encodeString多了一个lineSeparator.length参数，用来预留lineSeparator的位置，然后在返回的ByteBuf后面加上lineSeparator作为最终的输出。

StringDecoder是和StringEncoder相反的过程：

```
public class StringDecoder extends MessageToMessageDecoder<ByteBuf> 
```

这里的ByteBuf表示的是要解码的对象是ByteBuf,我们看下他的解码方法：

```
    protected void decode(ChannelHandlerContext ctx, ByteBuf msg, List<Object> out) throws Exception {
        out.add(msg.toString(charset));
    }
```

直接调用msg.toString方法即可将ByteBuf转换成为字符串。

# 总结

以上就是netty中对字符串的编码解码器，通过使用这几个编码解码器可以大大简化我们的工作。







