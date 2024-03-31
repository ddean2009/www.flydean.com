---
slug: /17-1-netty-marshalling
---

# 38. netty系列之:netty对marshalling的支持



# 简介

在之前的文章中我们讲过了，jboss marshalling是一种非常优秀的java对象序列化的方式，它可以兼容JDK自带的序列化，同时也提供了性能和使用上的优化。

那么这么优秀的序列化工具可不可以用在netty中作为消息传递的方式呢？

答案当然是肯定的，在netty中一切皆有可能。

# netty中的marshalling provider

回顾一下jboss marshalling的常用用法，我们需要从MarshallerFactory中创建出Marshaller，因为mashaller有不同的实现，所以需要指定具体的实现来创建MarshallerFactory,如下所示：

```
MarshallerFactory marshallerFactory = Marshalling.getProvidedMarshallerFactory("river");
```

这个MarshallerFactory实际上就是一个MarshallerProvider。

netty中定义了这样的一个接口：

```
public interface MarshallerProvider {

    Marshaller getMarshaller(ChannelHandlerContext ctx) throws Exception;
}
```

MarshallerProvider实际上就做了和MarshallerFactory等同的工作。

既然MarshallerProvider是一个接口，那么它有哪些实现呢？

在netty中它有两个实现类，分别是DefaultMarshallerProvider和ThreadLocalMarshallerProvider。

两者有什么区别呢？

先来看一下DefaultMarshallerProvider：

```
public class DefaultMarshallerProvider implements MarshallerProvider {

    private final MarshallerFactory factory;
    private final MarshallingConfiguration config;

    public DefaultMarshallerProvider(MarshallerFactory factory, MarshallingConfiguration config) {
        this.factory = factory;
        this.config = config;
    }

    public Marshaller getMarshaller(ChannelHandlerContext ctx) throws Exception {
        return factory.createMarshaller(config);
    }

}
```

顾名思义，DefaultMarshallerProvider就是marshallerProvider的默认实现，从具体的实现代码中，我们可以看出，DefaultMarshallerProvider实际上需要传入MarshallerFactory和MarshallingConfiguration作为参数，然后使用传入的MarshallerFactory来创建具体的marshaller Provider，和我们手动创建marshaller的方式是一致的。

但是上面的实现中每次getMarshaller都需要重新从factory中创建一个新的，性能上可能会有问题。所以netty又实现了一个新的ThreadLocalMarshallerProvider:

```
public class ThreadLocalMarshallerProvider implements MarshallerProvider {
    private final FastThreadLocal<Marshaller> marshallers = new FastThreadLocal<Marshaller>();

    private final MarshallerFactory factory;
    private final MarshallingConfiguration config;

    public ThreadLocalMarshallerProvider(MarshallerFactory factory, MarshallingConfiguration config) {
        this.factory = factory;
        this.config = config;
    }

    @Override
    public Marshaller getMarshaller(ChannelHandlerContext ctx) throws Exception {
        Marshaller marshaller = marshallers.get();
        if (marshaller == null) {
            marshaller = factory.createMarshaller(config);
            marshallers.set(marshaller);
        }
        return marshaller;
    }
}
```

ThreadLocalMarshallerProvider和DefaultMarshallerProvider的不同之处在于，ThreadLocalMarshallerProvider中保存了一个FastThreadLocal的对象，FastThreadLocal是JDK中ThreadLocal的优化版本，比ThreadLocal更快。

在getMarshaller方法中，先从FastThreadLocal中get出Marshaller对象，如果Marshaller对象不存在，才从factory中创建出一个Marshaller对象，最后将Marshaller对象放到ThreadLocal中。

有MarshallerProvider就有和他对应的UnMarshallerProvider：

```
public interface UnmarshallerProvider {

    Unmarshaller getUnmarshaller(ChannelHandlerContext ctx) throws Exception;
}
```

netty中的UnmarshallerProvider有三个实现类，分别是DefaultUnmarshallerProvider,ThreadLocalUnmarshallerProvider和ContextBoundUnmarshallerProvider.

前面的两个DefaultUnmarshallerProvider,ThreadLocalUnmarshallerProvider跟marshaller的是实现是一样的，这里就不重复讲解了。

我们主要来看一下ContextBoundUnmarshallerProvider的实现。

从名字上我们可以看出，这个unmarshaller是和ChannelHandlerContext相关的。

ChannelHandlerContext表示的是channel的上下文环境，它里面有一个方法叫做attr，可以保存和channel相关的属性：

```
    <T> Attribute<T> attr(AttributeKey<T> key);
```

ContextBoundUnmarshallerProvider的做法就是将Unmarshaller存放到context中，每次使用的时候先从context中获取，如果没有取到再从factroy中获取。

我们来看下ContextBoundUnmarshallerProvider的实现：

```
public class ContextBoundUnmarshallerProvider extends DefaultUnmarshallerProvider {

    private static final AttributeKey<Unmarshaller> UNMARSHALLER = AttributeKey.valueOf(
            ContextBoundUnmarshallerProvider.class, "UNMARSHALLER");

    public ContextBoundUnmarshallerProvider(MarshallerFactory factory, MarshallingConfiguration config) {
        super(factory, config);
    }

    @Override
    public Unmarshaller getUnmarshaller(ChannelHandlerContext ctx) throws Exception {
        Attribute<Unmarshaller> attr = ctx.channel().attr(UNMARSHALLER);
        Unmarshaller unmarshaller = attr.get();
        if (unmarshaller == null) {
            unmarshaller = super.getUnmarshaller(ctx);
            attr.set(unmarshaller);
        }
        return unmarshaller;
    }
}
```

ContextBoundUnmarshallerProvider继承自DefaultUnmarshallerProvider，在getUnmarshaller方法首先从ctx取出unmarshaller,如果没有的话，则调用DefaultUnmarshallerProvider中的getUnmarshaller方法取出unmarshaller。

# Marshalling编码器

上面的章节中我们获取到了marshaller,接下来看一下如何使用marshaller来进行编码和解码操作。

首先来看一下编码器MarshallingEncoder，MarshallingEncoder继承自MessageToByteEncoder,接收的泛型是Object:

```
public class MarshallingEncoder extends MessageToByteEncoder<Object>
```

是将Object对象编码成为ByteBuf。回顾一下之前我们讲到的通常对象的编码都需要用到一个对象长度的字段，用来分割对象的数据，同样的MarshallingEncoder也提供了一个4个字节的LENGTH_PLACEHOLDER，用来存储对象的长度。

具体的看一下它的encode方法：

```
    protected void encode(ChannelHandlerContext ctx, Object msg, ByteBuf out) throws Exception {
        Marshaller marshaller = provider.getMarshaller(ctx);
        int lengthPos = out.writerIndex();
        out.writeBytes(LENGTH_PLACEHOLDER);
        ChannelBufferByteOutput output = new ChannelBufferByteOutput(out);
        marshaller.start(output);
        marshaller.writeObject(msg);
        marshaller.finish();
        marshaller.close();

        out.setInt(lengthPos, out.writerIndex() - lengthPos - 4);
    }
```

encode的逻辑很简单，首先从provider中拿到marshaller对象，然后先向out中写入4个字节的LENGTH_PLACEHOLDER，接着使用marshaller向
out中写入编码的对象，最后根据写入对象长度填充out，得到最后的输出。

因为encode的数据保存的有长度数据，所以decode的时候就需要用到一个frame decoder叫做LengthFieldBasedFrameDecoder。

通常有两种方式来使用LengthFieldBasedFrameDecoder，一种是将LengthFieldBasedFrameDecoder加入到pipline handler中，decoder只需要处理经过frame decoder处理过后的对象即可。

还有一种方法就是这个decoder本身就是一个LengthFieldBasedFrameDecoder。 

这里netty选择的是第二种方法，我们看下MarshallingDecoder的定义：

```
public class MarshallingDecoder extends LengthFieldBasedFrameDecoder
```

首先需要在构造函数中指定LengthFieldBasedFrameDecoder的字段长度，这里调用了super方法来实现：

```
    public MarshallingDecoder(UnmarshallerProvider provider, int maxObjectSize) {
        super(maxObjectSize, 0, 4, 0, 4);
        this.provider = provider;
    }
```

并且重写了extractFrame方法：

```
    protected ByteBuf extractFrame(ChannelHandlerContext ctx, ByteBuf buffer, int index, int length) {
        return buffer.slice(index, length);
    }
```

最后再看下decode方法：

```
    protected Object decode(ChannelHandlerContext ctx, ByteBuf in) throws Exception {
        ByteBuf frame = (ByteBuf) super.decode(ctx, in);
        if (frame == null) {
            return null;
        }
        Unmarshaller unmarshaller = provider.getUnmarshaller(ctx);
        ByteInput input = new ChannelBufferByteInput(frame);
        try {
            unmarshaller.start(input);
            Object obj = unmarshaller.readObject();
            unmarshaller.finish();
            return obj;
        } finally {
            unmarshaller.close();
        }
    }
```

decode的逻辑也很简单，首先调用super方法decode出frame ByteBuf。然后再调用unmarshaller实现对象的读取，最后将改对象返回。

# Marshalling编码的另外一种实现

上面我们讲到对对象的编码使用的是LengthFieldBasedFrameDecoder,根据对象实际数据之前的一个length字段来确定字段的长度，从而读取真实的数据。

那么可不可以不指定对象长度也能够准确的读取对象呢？

其实也是可以的，我们可以不断的尝试读取数据，直到找到合适的对象数据为止。

看过我之前文章的朋友可能就想到了，ReplayingDecoder不就是做这个事情的吗？在ReplayingDecoder中会不断的重试，直到找到符合条件的消息为止。

于是netty基于ReplayingDecoder也有一个marshalling编码解码的实现，叫做CompatibleMarshallingEncoder和CompatibleMarshallingDecoder。

CompatibleMarshallingEncoder很简单，因为不需要对象的实际长度，所以直接使用marshalling编码即可。

```
public class CompatibleMarshallingEncoder extends MessageToByteEncoder<Object> {

    private final MarshallerProvider provider;

    public CompatibleMarshallingEncoder(MarshallerProvider provider) {
        this.provider = provider;
    }

    @Override
    protected void encode(ChannelHandlerContext ctx, Object msg, ByteBuf out) throws Exception {
        Marshaller marshaller = provider.getMarshaller(ctx);
        marshaller.start(new ChannelBufferByteOutput(out));
        marshaller.writeObject(msg);
        marshaller.finish();
        marshaller.close();
    }
}
```

CompatibleMarshallingDecoder继承了ReplayingDecoder:

```
public class CompatibleMarshallingDecoder extends ReplayingDecoder<Void> 
```

它的decode方法的核心就是调用unmarshaller的方法：

```
Unmarshaller unmarshaller = provider.getUnmarshaller(ctx);
        ByteInput input = new ChannelBufferByteInput(buffer);
        if (maxObjectSize != Integer.MAX_VALUE) {
            input = new LimitingByteInput(input, maxObjectSize);
        }
        try {
            unmarshaller.start(input);
            Object obj = unmarshaller.readObject();
            unmarshaller.finish();
            out.add(obj);
        } catch (LimitingByteInput.TooBigObjectException ignored) {
            discardingTooLongFrame = true;
            throw new TooLongFrameException();
        } finally {
            unmarshaller.close();
        }
```

注意，这里解码的时候会有两种异常，第一种异常就是unmarshaller.readObject时候的异常，这种异常会被ReplayingDecoder捕获从而重试。

还有一种就是字段太长的异常，这种异常无法处理只能放弃：

```
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        if (cause instanceof TooLongFrameException) {
            ctx.close();
        } else {
            super.exceptionCaught(ctx, cause);
        }
    }
```

# 总结

以上就是在netty中使用marshalling进行编码解码的实现。原理和对象编码解码是很类似的，大家可以对比分析一下。












