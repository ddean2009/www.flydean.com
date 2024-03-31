---
slug: /57-netty-dns-tcpserver
---

# 82. netty系列之:来,手把手教你使用netty搭建一个DNS tcp服务器



# 简介

在前面的文章中，我们提到了使用netty构建tcp和udp的客户端向已经公布的DNS服务器进行域名请求服务。基本的流程是借助于netty本身的NIO通道，将要查询的信息封装成为DNSMessage,通过netty搭建的channel发送到服务器端，然后从服务器端接受返回数据，将其编码为DNSResponse，进行消息的处理。

那么DNS Server是否可以用netty实现呢？

答案当然是肯定的，但是之前也讲过了DNS中有很多DnsRecordType，所以如果想实现全部的支持类型可能并现实，这里我们就以最简单和最常用的A类型为例，用netty来实现一下DNS的TCP服务器。

# 搭建netty服务器

因为是TCP请求，所以这里使用基于NIO的netty server服务，也就是NioEventLoopGroup和NioServerSocketChannel,netty服务器的代码如下：

```
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        ServerBootstrap bootstrap = new ServerBootstrap().group(bossGroup,
                        workerGroup)
                .channel(NioServerSocketChannel.class)
                .handler(new LoggingHandler(LogLevel.INFO))
                .childHandler(new Do53ServerChannelInitializer());
        final Channel channel = bootstrap.bind(dnsServerPort).channel();
        channel.closeFuture().sync();
```

因为是服务器，所以我们需要两个EventLoopGroup，一个是bossGroup，一个是workerGroup。

将这两个group传递给ServerBootstrap，并指定channel是NioServerSocketChannel，然后添加自定义的Do53ServerChannelInitializer即可。

Do53ServerChannelInitializer中包含了netty自带的tcp编码解码器和自定义的服务器端消息处理方式。

这里dnsServerPort=53，也是默认的DNS服务器的端口值。

# DNS服务器的消息处理

Do53ServerChannelInitializer是我们自定义的initializer,里面为pipline添加了消息的处理handler：

```
class Do53ServerChannelInitializer extends ChannelInitializer<Channel> {
    @Override
    protected void initChannel(Channel ch) throws Exception {
        ch.pipeline().addLast(
                new TcpDnsQueryDecoder(),
                new TcpDnsResponseEncoder(),
                new Do53ServerInboundHandler());
    }
}
```

这里我们添加了两个netty自带的编码解码器，分别是TcpDnsQueryDecoder和TcpDnsResponseEncoder。

对于netty服务器来说，接收到的是ByteBuf消息，为了方便服务器端的消息读取，需要将ByteBuf解码为DnsQuery,这也就是TcpDnsQueryDecoder在做的事情。

```
public final class TcpDnsQueryDecoder extends LengthFieldBasedFrameDecoder 
```

TcpDnsQueryDecoder继承自LengthFieldBasedFrameDecoder，也就是以字段长度来区分对象的起始位置。这和TCP查询传过来的数据结构是一致的。

下面是它的decode方法：

```
    protected Object decode(ChannelHandlerContext ctx, ByteBuf in) throws Exception {
        ByteBuf frame = (ByteBuf)super.decode(ctx, in);
        return frame == null ? null : DnsMessageUtil.decodeDnsQuery(this.decoder, frame.slice(), new DnsQueryFactory() {
            public DnsQuery newQuery(int id, DnsOpCode dnsOpCode) {
                return new DefaultDnsQuery(id, dnsOpCode);
            }
        });
    }
```

decode接受一个ByteBuf对象，首先调用LengthFieldBasedFrameDecoder的decode方法，将真正需要解析的内容解析出来，然后再调用DnsMessageUtil的decodeDnsQuery方法将真正的ByteBuf内容解码成为DnsQuery返回。

这样就可以在自定义的handler中处理DnsQuery消息了。

上面代码中，自定义的handler叫做Do53ServerInboundHandler：

```
class Do53ServerInboundHandler extends SimpleChannelInboundHandler<DnsQuery> 
```

从定义看，Do53ServerInboundHandler要处理的消息就是DnsQuery。

看一下它的channelRead0方法：

```
    protected void channelRead0(ChannelHandlerContext ctx,
                                DnsQuery msg) throws Exception {
        DnsQuestion question = msg.recordAt(DnsSection.QUESTION);
        log.info("Query is: {}", question);
        ctx.writeAndFlush(newResponse(msg, question, 1000, QUERY_RESULT));
    }
```

我们从DnsQuery的QUESTION section中拿到DnsQuestion，然后解析DnsQuestion的内容，根据DnsQuestion的内容返回一个response给客户端。

这里的respone是我们自定义的：

```
    private DefaultDnsResponse newResponse(DnsQuery query,
                                           DnsQuestion question,
                                           long ttl, byte[]... addresses) {
        DefaultDnsResponse response = new DefaultDnsResponse(query.id());
        response.addRecord(DnsSection.QUESTION, question);

        for (byte[] address : addresses) {
            DefaultDnsRawRecord queryAnswer = new DefaultDnsRawRecord(
                    question.name(),
                    DnsRecordType.A, ttl, Unpooled.wrappedBuffer(address));
            response.addRecord(DnsSection.ANSWER, queryAnswer);
        }
        return response;
    }
```

上面的代码封装了一个新的DefaultDnsResponse对象，并使用query的id作为DefaultDnsResponse的id。并将question作为response的QUESEION section。

除了QUESTION section,response中还需要ANSWER section,这个ANSWER section需要填充一个DnsRecord。

这里构造了一个DefaultDnsRawRecord,传入了record的name，type，ttl和具体内容。

最后将构建好的DefaultDnsResponse返回。

因为客户端查询的是A address，按道理我们需要通过QUESTION中传入的domain名字，然后根据DNS服务器中存储的记录进行查找，最终返回对应域名的IP地址。

但是因为我们只是模拟的DNS服务器，所以并没有真实的域名IP记录，所以这里我们伪造了一个ip地址：

```
    private static final byte[] QUERY_RESULT = new byte[]{46, 53, 107, 110};
```

然后调用Unpooled的wrappedBuffer方法，将byte数组转换成为ByteBuf,传入DefaultDnsRawRecord的构造函数中。

这样我们的DNS服务器就搭建好了。

# DNS客户端消息请求

上面我们搭建好了DNS服务器，接下来就可以使用DNS客户端来请求DNS服务器了。

这里我们使用之前创建好的netty DNS客户端，只不过进行少许改动，将DNS服务器的域名和IP地址替换成下面的值：

```
        Do53TcpClient client = new Do53TcpClient();
        final String dnsServer = "127.0.0.1";
        final int dnsPort = 53;
        final String queryDomain ="www.flydean.com";
        client.startDnsClient(dnsServer,dnsPort,queryDomain);
```

dnsServer就填本机的IP地址，dnsPort就是我们刚刚创建的默认端口53。

首先运行DNS服务器：

```
INFO  i.n.handler.logging.LoggingHandler - [id: 0x021762f2] REGISTERED
INFO  i.n.handler.logging.LoggingHandler - [id: 0x021762f2] BIND: 0.0.0.0/0.0.0.0:53
INFO  i.n.handler.logging.LoggingHandler - [id: 0x021762f2, L:/0:0:0:0:0:0:0:0:53] ACTIVE
```

可以看到DNS服务器已经准备好了，绑定的端口是53。

然后运行上面的客户端，在客户端可以得到下面的结果：

```
INFO  c.f.d.Do53TcpChannelInboundHandler - question is :DefaultDnsQuestion(www.flydean.com. IN A)
INFO  c.f.d.Do53TcpChannelInboundHandler - ip address is: 46.53.107.110
```

可以看到DNS查询成功，并且返回了我们在服务器中预设的值。

然后再看一下服务器端的输出：

```
INFO  i.n.handler.logging.LoggingHandler - [id: 0x021762f2, L:/0:0:0:0:0:0:0:0:53] READ: [id: 0x44d4c761, L:/127.0.0.1:53 - R:/127.0.0.1:65471]
INFO  i.n.handler.logging.LoggingHandler - [id: 0x021762f2, L:/0:0:0:0:0:0:0:0:53] READ COMPLETE
INFO  c.f.d.Do53ServerInboundHandler - Query is: DefaultDnsQuestion(www.flydean.com. IN A)
```

可以看到服务器端成功和客户端建立了连接，并成功接收到了客户端的查询请求。

# 总结

以上就是使用netty默认DNS服务器端的实现原理和例子。因为篇幅有限，这里只是默认了type为A address的情况，对其他type感兴趣的朋友可以自行探索。

本文的代码，大家可以参考：

[learn-netty4](https://github.com/ddean2009/learn-netty4)








