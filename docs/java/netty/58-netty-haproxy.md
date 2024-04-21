---
slug: /58-netty-haproxy
---

# 83. netty系列之:在netty中使用proxy protocol



# 简介

我们知道proxy protocol是haproxy提出的一个代理协议，通过这个协议,所有实现这个协议的proxy或者LBS,都可以附带真实客户端的IP地址和端口号，这使得proxy protocol在实际应用中非常有用。

这么优秀的协议，没有理由netty不支持。本文将会谈一下netty中对proxy protoco代理协议的支持。

# netty对proxy protocol协议的支持

proxy protocol协议其实很简单，就是在请求前面带了proxy header信息。

在netty中这个header信息叫做HAProxyMessage：

```
public final class HAProxyMessage extends AbstractReferenceCounted {

```

HAProxyMessage是一个ReferenceCounted，这一点和ByteBuf很类似，说明HAProxyMessage保留着和ByteBuf很类似的特性。

根据proxy protocol协议，该协议可以分为两个版本，分别是v1和v2,其中v1版本是文本协议，而v2版本支持二进制的格式。

显然从代码编写和调试的角度来看v1更加友好，但是从程序的角度来看,v2可能性能更高。

HAProxyMessage中有个专门的HAProxyProtocolVersion类，来表示proxy protocol的版本信息：

```
public enum HAProxyProtocolVersion {

    V1(VERSION_ONE_BYTE),

    V2(VERSION_TWO_BYTE);

```

HAProxyProtocolVersion是一个枚举类，在它里面定义了和proxy协议相对应的两个版本号。

在版本号之后是command，在netty中用HAProxyCommand来表示：

```
public enum HAProxyCommand {

    LOCAL(HAProxyConstants.COMMAND_LOCAL_BYTE),

    PROXY(HAProxyConstants.COMMAND_PROXY_BYTE);
```

HAProxyCommand也是一个枚举类，里面定义了两个command的值，分别是local和proxy。

其中local表示该请求是代理服务器主动发起的，而不是客户端发起的，比如监控检测等请求。

proxy表示该请求是一个代理请求。

接下来是AddressFamily和TransportProtocol,这两个字段用同一个byte来表示，所以这两个类都是HAProxyProxiedProtocol的内部类。

先看下AddressFamily的定义：

```
    public enum AddressFamily {

        AF_UNSPEC(AF_UNSPEC_BYTE),

        AF_IPv4(AF_IPV4_BYTE),

        AF_IPv6(AF_IPV6_BYTE),

        AF_UNIX(AF_UNIX_BYTE);
```

AddressFamily中定义了4个address family类型，分别是unspec,ipv4,ipv6和unix。分别对应未知family,ipv4,ipv6和unix domain socket。

再看下TransportProtocol的定义：

```
    public enum TransportProtocol {

        UNSPEC(TRANSPORT_UNSPEC_BYTE),

        STREAM(TRANSPORT_STREAM_BYTE),

        DGRAM(TRANSPORT_DGRAM_BYTE);
```

TransportProtocol有3个值，分别是unspec,stream和dgram。分别对应未知协议，http/https协议，udp/tcp协议。

因为AddressFamily和TransportProtocol实际上是同一个byte，所以经过组合之后可以得到下面的几个枚举值：

```
    UNKNOWN(TPAF_UNKNOWN_BYTE, AddressFamily.AF_UNSPEC, TransportProtocol.UNSPEC),

    TCP4(TPAF_TCP4_BYTE, AddressFamily.AF_IPv4, TransportProtocol.STREAM),

    TCP6(TPAF_TCP6_BYTE, AddressFamily.AF_IPv6, TransportProtocol.STREAM),

    UDP4(TPAF_UDP4_BYTE, AddressFamily.AF_IPv4, TransportProtocol.DGRAM),

    UDP6(TPAF_UDP6_BYTE, AddressFamily.AF_IPv6, TransportProtocol.DGRAM),

    UNIX_STREAM(TPAF_UNIX_STREAM_BYTE, AddressFamily.AF_UNIX, TransportProtocol.STREAM),

    UNIX_DGRAM(TPAF_UNIX_DGRAM_BYTE, AddressFamily.AF_UNIX, TransportProtocol.DGRAM);
```

以上的枚举值也是HAProxyProxiedProtocol中定义的值。

接下就是源ip地址，目标地ip地址，源端口和目标端口这几个值，定义为属性表示如下：

```
    private final String sourceAddress;
    private final String destinationAddress;
    private final int sourcePort;
    private final int destinationPort;
```

最后，proxy protocol中还可以包含额外的字段tlv，tlv在netty中也是一种byteBuf，使用HAProxyTLV表示：

```
public class HAProxyTLV extends DefaultByteBufHolder 
```

因为tlv是key value结构，所以看下HAProxyTLV的构造函数：

```
    public HAProxyTLV(Type type, ByteBuf content) {
        this(type, Type.byteValueForType(type), content);
    }
```

HAProxyTLV接受一个type和byteBuf的value。

Type是一个枚举类，在netty中可以支持下面的值：

```
    public enum Type {
        PP2_TYPE_ALPN,
        PP2_TYPE_AUTHORITY,
        PP2_TYPE_SSL,
        PP2_TYPE_SSL_VERSION,
        PP2_TYPE_SSL_CN,
        PP2_TYPE_NETNS,
        OTHER;
```

在HAProxyMessage中，tlv是一个list来保存的：

```
private final List<HAProxyTLV> tlvs;
```

到此，所有HAProxyMessage所需要的参数都齐了，我们看下HAProxyMessage的构造函数：

```
    public HAProxyMessage(
            HAProxyProtocolVersion protocolVersion, HAProxyCommand command, HAProxyProxiedProtocol proxiedProtocol,
            String sourceAddress, String destinationAddress, int sourcePort, int destinationPort,
            List<? extends HAProxyTLV> tlvs)
```

HAProxyMessage会将所有的参数都存储到本地的变量中，供后续使用。

因为proxy protocol有两个版本，v1和v2，所以HAProxyMessage中提供了两个将header编码为AProxyMessage对象的方法，分别是：

```
static HAProxyMessage decodeHeader(ByteBuf header) 
```

和：

```
static HAProxyMessage decodeHeader(String header)
```

有了proxy protocol的java表示之后，我们再来看一下HAProxyMessage的编码解码器。

# HAProxyMessage的编码解码器

netty对HAProxyMessage对象的支持表现在两个地方，netty提供了两个类分别对HAProxyMessage进行编码和解码，这两个类是HAProxyMessageEncoder和HAProxyMessageDecoder。

先看一下HAProxyMessageEncoder:

```
public final class HAProxyMessageEncoder extends MessageToByteEncoder<HAProxyMessage> 
```

HAProxyMessageEncoder继承自MessageToByteEncoder，传入的泛型是HAProxyMessage，表示是将HAProxyMessage编码成为ByteBuf。

它的encode方法很简单，根据HAProxyMessage传入的message版本信息，分别进行编码：

```
    protected void encode(ChannelHandlerContext ctx, HAProxyMessage msg, ByteBuf out) throws Exception {
        switch (msg.protocolVersion()) {
            case V1:
                encodeV1(msg, out);
                break;
            case V2:
                encodeV2(msg, out);
                break;
            default:
                throw new HAProxyProtocolException("Unsupported version: " + msg.protocolVersion());
        }
    }
```

HAProxyMessageDecoder是跟HAProxyMessageEncoder相反的动作，是将接收到的ByteBuf解析成为HAProxyMessage：

```
public class HAProxyMessageDecoder extends ByteToMessageDecoder 
```

因为HAProxyMessage有两个版本，那么怎么判断接收到的ByeBuf是哪个版本呢？

其实很简单，因为v1版本和v2版本的开始字符是不一样的，v1版本的开头是一个text:"PROXY", v2版本的开头是一个固定的二进制串,如下所示：

```
    static final byte[] BINARY_PREFIX = {
            (byte) 0x0D,
            (byte) 0x0A,
            (byte) 0x0D,
            (byte) 0x0A,
            (byte) 0x00,
            (byte) 0x0D,
            (byte) 0x0A,
            (byte) 0x51,
            (byte) 0x55,
            (byte) 0x49,
            (byte) 0x54,
            (byte) 0x0A
    };

    static final byte[] TEXT_PREFIX = {
            (byte) 'P',
            (byte) 'R',
            (byte) 'O',
            (byte) 'X',
            (byte) 'Y',
    };
```

看下它的decode方法实现：

```
    protected final void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception {
        if (version == -1) {
            if ((version = findVersion(in)) == -1) {
                return;
            }
        }

        ByteBuf decoded;

        if (version == 1) {
            decoded = decodeLine(ctx, in);
        } else {
            decoded = decodeStruct(ctx, in);
        }

        if (decoded != null) {
            finished = true;
            try {
                if (version == 1) {
                    out.add(HAProxyMessage.decodeHeader(decoded.toString(CharsetUtil.US_ASCII)));
                } else {
                    out.add(HAProxyMessage.decodeHeader(decoded));
                }
            } catch (HAProxyProtocolException e) {
                fail(ctx, null, e);
            }
        }
    }
```

上面代码的逻辑是先从ByteBuf中根据版本号decode出header信息放到ByteBuf中。

然后再根据版本号的不同，分别调用HAProxyMessage的两个不同版本的decodeHeader方法进行解码。最终得到HAProxyMessage。

# netty中proxy protocol的代码示例

有了netty对proxy protocol的支持，那么在netty中搭建支持proxy protocol的服务器和客户端就很容易了。

先看一下如何搭建支持proxy protocol的服务器：

```
    private static void startServer(int port) throws InterruptedException {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new ServerInitializer());
            b.bind(port).sync().channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
```

代码和常规的netty server一样，这里使用了NioEventLoopGroup和NioServerSocketChannel,搭建了一个支持TCP协议的netty服务器。

ServerInitializer中包含了netty自带的HAProxy编码器和自定义的消息处理器：

```
class ServerInitializer extends ChannelInitializer<SocketChannel> {
    @Override
    public void initChannel(SocketChannel ch) throws Exception {
        ch.pipeline().addLast(
                new LoggingHandler(LogLevel.DEBUG),
                new HAProxyMessageDecoder(),
                new SimpleChannelInboundHandler() {
                    @Override
                    protected void channelRead0(ChannelHandlerContext ctx, Object msg) {
                        if (msg instanceof HAProxyMessage) {
                            log.info("proxy message is : {}", msg);
                        } else if (msg instanceof ByteBuf) {
                            log.info("bytebuf message is : {}", ByteBufUtil.prettyHexDump((ByteBuf) msg));
                        }
                    }
                });
    }
}
```

这里使用netty自带的HAProxyMessageDecoder，用来将ByteBuf消息解码为HAProxyMessage，然后在自定义的SimpleChannelInboundHandler中对HAProxyMessage进行处理。

这里的服务器可以处理两种消息，一种是HAProxyMessage，一种是原始的ByteBuf。处理的结果就是将消息打印出来。

然后看下客户端的定义：

```
EventLoopGroup group = new NioEventLoopGroup();
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .handler(new ClientHander());
            Channel ch = b.connect(host, port).sync().channel();
```

客户端使用的是EventLoopGroup和NioSocketChannel，是基于TCP协议的请求。

这里添加了自定义的handler：ClientHander,ClientHander继承自ChannelOutboundHandlerAdapter用来对client发出的消息进行处理。

这里看一下它的handlerAdded方法：

```
    public void handlerAdded(ChannelHandlerContext ctx) throws Exception {
        ctx.pipeline().addBefore(ctx.name(), null, HAProxyMessageEncoder.INSTANCE);
        super.handlerAdded(ctx);
    }
```

可以看到handlerAdded方法向channelPipeline中添加了HAProxyMessageEncoder，用于编码HAProxyMessage。

因为对于一个connection来说，HAProxyMessage只需要用到一次，后续的正常消息就不需要这个编码器了，所以我们需要在write方法中监听HAProxyMessage的状态，如果写入成功之后，就从pipeline中移出HAProxyMessageEncoder和ClientHander。

```
    public void write(final ChannelHandlerContext ctx, Object msg, ChannelPromise promise) throws Exception {
        ChannelFuture future1 = ctx.write(msg, promise);
        if (msg instanceof HAProxyMessage) {
            future1.addListener((ChannelFutureListener) future2 -> {
                if (future2.isSuccess()) {
                    ctx.pipeline().remove(HAProxyMessageEncoder.INSTANCE);
                    ctx.pipeline().remove(ClientHander.this);
                } else {
                    ctx.close();
                }
            });
        }
    }
```

最后我们构建了一个虚拟的HAProxyMessage，然后通过netty客户端进行发送：

```
HAProxyMessage message = new HAProxyMessage(
                    HAProxyProtocolVersion.V2, HAProxyCommand.PROXY, HAProxyProxiedProtocol.TCP4,
                    "127.0.0.1", "127.0.0.2", 8000, 9000);
            ch.writeAndFlush(message).sync();
            ch.writeAndFlush(Unpooled.copiedBuffer("this is a proxy protocol message!", CharsetUtil.UTF_8)).sync();
            ch.close().sync();
```

# 总结

上面的代码只是一个简单的模拟proxy protocol在netty中的使用情况，并不代表上面的代码就可以在实际的项目中应用了。如果你想使用的话，可以在下面的代码上面继续丰富和完善。

本文的代码，大家可以参考：

[learn-netty4](https://github.com/ddean2009/learn-netty4)

















