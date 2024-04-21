---
slug: /17-1-netty-protobuf-UDP
---

# 39. netty系列之:protobuf在UDP协议中的使用



# 简介

netty中提供的protobuf编码解码器可以让我们直接在netty中传递protobuf对象。同时netty也提供了支持UDP协议的channel叫做NioDatagramChannel。如果直接使用NioDatagramChannel，那么我们可以直接从channel中读写UDP对象：DatagramPacket。

但是DatagramPacket中封装的是ByteBuf对象，如果我们想要向UDP channel中写入对象，那么需要一个将对象转换成为ByteBuf的方法，很明显netty提供的protobuf编码解码器就是一个这样的方法。

那么可不可以将NioDatagramChannel和ProtobufDecoder,ProtobufEncoder相结合呢？

NioDatagramChannel中channel读写的对象都是DatagramPacket。而ProtobufDecoder与ProtobufEncoder是将protoBuf对象MessageLiteOrBuilder跟ByteBuf进行转换，所以两者是不能直接结合使用的。

怎么才能在UDP中使用protobuf呢？今天要向大家介绍netty专门为UDP创建的编码解码器DatagramPacketEncoder和DatagramPacketDecoder。

# UDP在netty中的表示

UDP的数据包在netty中是怎么表示呢？

netty提供了一个类DatagramPacket来表示UDP的数据包。netty中的UDP channel就是使用DatagramPacket来进行数据的传递。先看下DatagramPacket的定义：

```
public class DatagramPacket
        extends DefaultAddressedEnvelope<ByteBuf, InetSocketAddress> implements ByteBufHolder
```

DatagramPacket继承自DefaultAddressedEnvelope，并且实现了ByteBufHolder接口。

其中的ByteBuf是数据包中需要传输的数据，InetSocketAddress是数据包需要发送到的地址。

而这个DefaultAddressedEnvelope又是继承自AddressedEnvelope:

```
public class DefaultAddressedEnvelope<M, A extends SocketAddress> implements AddressedEnvelope<M, A>
```

DefaultAddressedEnvelopee中有三个属性，分别是message,sender和recipient：

```
    private final M message;
    private final A sender;
    private final A recipient;
```

这三个属性分别代表了要发送的消息，发送方的地址和接收方的地址。

# DatagramPacketEncoder

DatagramPacketEncoder是一个DatagramPacket的编码器，所以要编码的对象就是DatagramPacket。上一节我们也提到了DatagramPacket实际上继承自AddressedEnvelope。所有的DatagramPacket都是一个AddressedEnvelope对象，所以为了通用起见，DatagramPacketEncoder接受的要编码的对象是AddressedEnvelope。

我们先来看下DatagramPacketEncoder的定义：

```
public class DatagramPacketEncoder<M> extends MessageToMessageEncoder<AddressedEnvelope<M, InetSocketAddress>> {
```

DatagramPacketEncoder是一个MessageToMessageEncoder，它接受一个AddressedEnvelope的泛型，也就是我们要encoder的对象类型。

那么DatagramPacketEncoder会将AddressedEnvelope编码成什么呢？

DatagramPacketEncoder中定义了一个encoder,这个encoder可以在DatagramPacketEncoder初始化的时候传入：

```
private final MessageToMessageEncoder<? super M> encoder;

    public DatagramPacketEncoder(MessageToMessageEncoder<? super M> encoder) {
        this.encoder = checkNotNull(encoder, "encoder");
    }

```

实际上DatagramPacketEncoder中实现的encode方法，底层就是调用encoder的encode方法，我们来看下他的实现：

```
    protected void encode(
            ChannelHandlerContext ctx, AddressedEnvelope<M, InetSocketAddress> msg, List<Object> out) throws Exception {
        assert out.isEmpty();

        encoder.encode(ctx, msg.content(), out);
        if (out.size() != 1) {
            throw new EncoderException(
                    StringUtil.simpleClassName(encoder) + " must produce only one message.");
        }
        Object content = out.get(0);
        if (content instanceof ByteBuf) {
            // Replace the ByteBuf with a DatagramPacket.
            out.set(0, new DatagramPacket((ByteBuf) content, msg.recipient(), msg.sender()));
        } else {
            throw new EncoderException(
                    StringUtil.simpleClassName(encoder) + " must produce only ByteBuf.");
        }
    }
```

上面的逻辑就是从AddressedEnvelope中调用`msg.content()`方法拿到AddressedEnvelope中的内容，然后调用encoder的encode方法将其编码并写入到out中。

最后调用out的get方法拿出编码之后的内容，再封装到DatagramPacket中去。

所以不管encoder最后返回的是什么对象，最后都会被封装到DatagramPacket中，并返回。

总结一下，DatagramPacketEncoder传入一个AddressedEnvelope对象，调用encoder将AddressedEnvelope的内容进行编码，最后封装成为一个DatagramPacket并返回。

鉴于protoBuf的优异对象序列化能力，我们可以将ProtobufEncoder传入到DatagramPacketEncoder中，做为真实的encoder：

```
 ChannelPipeline pipeline = ...;
pipeline.addLast("udpEncoder", new DatagramPacketEncoder(new ProtobufEncoder(...));
```

这样就把ProtobufEncoder和DatagramPacketEncoder结合起来了。

# DatagramPacketDecoder

DatagramPacketDecoder是和DatagramPacketEncoder相反的操作,它是将接受到的DatagramPacket对象进行解码，至于解码成为什么对象，也是由传入其中的decoder属性来决定的：

```
public class DatagramPacketDecoder extends MessageToMessageDecoder<DatagramPacket> {

    private final MessageToMessageDecoder<ByteBuf> decoder;

    public DatagramPacketDecoder(MessageToMessageDecoder<ByteBuf> decoder) {
        this.decoder = checkNotNull(decoder, "decoder");
    }
```

DatagramPacketDecoder要解码的对象是DatagramPacket，而传入的decoder要解码的对象是ByteBuf。

所以我们需要一个能够解码ByteBuf的decoder实现，而和protoBuf对应的就是ProtobufDecoder。

先来看下DatagramPacketDecoder的decoder方法是怎么实现的：

```
    protected void decode(ChannelHandlerContext ctx, DatagramPacket msg, List<Object> out) throws Exception {
        decoder.decode(ctx, msg.content(), out);
    }
```

可以看到DatagramPacketDecoder的decoder方法很简单，就是从DatagramPacket中拿到content内容，然后交由decoder去decode。

如果使用ProtobufDecoder作为内置的decoder,则可以将ByteBuf对象decode成为ProtoBuf对象，刚好和之前讲过的encode相呼应。

将ProtobufDecoder传入DatagramPacketDecoder也非常简单，我们可以这样做：

```
 ChannelPipeline pipeline = ...;
   pipeline.addLast("udpDecoder", new DatagramPacketDecoder(new ProtobufDecoder(...));
```

这样一个DatagramPacketDecoder就完成了。

# 总结

可以看到，如果直接使用DatagramPacketEncoder和DatagramPacketDecoder加上ProtoBufEncoder和ProtoBufDecoder，那么实现的是DatagramPacket和ByteBuf直接的互相转换。

当然这里的ProtoBufEncoder和ProtoBufDecoder可以按照用户的需要被替换成为不同的编码解码器。

可以自由组合编码解码方式，就是netty编码器的最大魅力。









