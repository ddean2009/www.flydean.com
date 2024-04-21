---
slug: /56-netty-dns-over-tls
---

# 81. netty系列之:在netty中使用tls协议请求DNS服务器



# 简介

在前面的文章中我们讲过了如何在netty中构造客户端分别使用tcp和udp协议向DNS服务器请求消息。在请求的过程中并没有进行消息的加密，所以这种请求是不安全的。

那么有同学会问了，就是请求解析一个域名的IP地址而已，还需要安全通讯吗？ 

事实上，不加密的DNS查询消息是很危险的，如果你在访问一个重要的网站时候，DNS查询消息被监听或者篡改，有可能你收到的查询返回IP地址并不是真实的地址，而是被篡改之后的地址，从而打开了钓鱼网站或者其他恶意的网站，从而造成了不必要的损失。

所以DNS查询也是需要保证安全的。

幸运的是在DNS的传输协议中特意指定了一种加密的传输协议叫做DNS-over-TLS，简称("DoT")。

那么在netty中可以使用DoT来进行DNS服务查询吗？一起来看看吧。

# 支持DoT的DNS服务器

因为DNS中有很多传输协议规范，但并不是每个DNS服务器都支持所有的规范，所以我们在使用DoT之前需要找到一个能够支持DoT协议的DNS服务器。

这里我还是选择使用阿里DNS服务器：

```
223.5.5.5
```

之前使用TCP和UDP协议的时候查询的DNS端口是53，如果换成了DoT，那么端口就需要变成853。

# 搭建支持DoT的netty客户端

DoT的底层还是TCP协议，也就是说TLS over TCP，所以我们需要使用NioEventLoopGroup和NioSocketChannel来搭建netty客户端，如下所示：

```
EventLoopGroup group = new NioEventLoopGroup();
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .handler(new DotChannelInitializer(sslContext, dnsServer, dnsPort));
            final Channel ch = b.connect(dnsServer, dnsPort).sync().channel();
```

这里选择的是NioEventLoopGroup和NioSocketChannel。然后向Bootstrap中传入自定义的DotChannelInitializer即可。

DotChannelInitializer中包含了自定义的handler和netty自带的handler。

我们来看下DotChannelInitializer的定义和他的构造函数：

```
class DotChannelInitializer extends ChannelInitializer<SocketChannel> {

    public DotChannelInitializer(SslContext sslContext, String dnsServer, int dnsPort) {
        this.sslContext = sslContext;
        this.dnsServer = dnsServer;
        this.dnsPort = dnsPort;
    }
```

DotChannelInitializer需要三个参数分别是sslContext，dnsServer和dnsPort。

这三个参数都是在sslContext中使用的：

```
    protected void initChannel(SocketChannel ch) {
        ChannelPipeline p = ch.pipeline();
        p.addLast(sslContext.newHandler(ch.alloc(), dnsServer, dnsPort))
                .addLast(new TcpDnsQueryEncoder())
                .addLast(new TcpDnsResponseDecoder())
                .addLast(new DotChannelInboundHandler());
    }
```

SslContext主要用来进行TLS配置，下面是SslContext的定义：

```
SslProvider provider =
                    SslProvider.isAlpnSupported(SslProvider.OPENSSL)? SslProvider.OPENSSL : SslProvider.JDK;
            final SslContext sslContext = SslContextBuilder.forClient()
                    .sslProvider(provider)
                    .protocols("TLSv1.3", "TLSv1.2")
                    .build();
```

因为SslProvider有很多种，可以选择openssl，也可以选择JDK自带的。

这里我们使用的openssl,要想提供openssl的支持，我们还需要提供openssl的依赖包如下：

```
        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-tcnative</artifactId>
            <version>2.0.51.Final</version>
        </dependency>
        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-tcnative-boringssl-static</artifactId>
            <version>2.0.51.Final</version>
        </dependency>
```

有了provider之后，就可以调用SslContextBuilder.forClient方法来创建SslContext。

这里我们指定SSL的protocol是"TLSv1.3"和"TLSv1.2"。

然后再调用sslContext的newHandler方法就创建好了支持ssl的handler：

```
sslContext.newHandler(ch.alloc(), dnsServer, dnsPort)
```

newHandler还需要指定dnsServer和dnsPort信息。

处理完ssl，接下来就是对dns查询和响应的编码解码器，这里使用的是TcpDnsQueryEncoder和TcpDnsResponseDecoder。

TcpDnsQueryEncoder和TcpDnsResponseDecoder在之前介绍使用netty搭建tcp客户端的时候就已经详细解说过了，这里就不再进行讲解了。

编码解码之后，就是自定义的消息处理器DotChannelInboundHandler：

```
class DotChannelInboundHandler extends SimpleChannelInboundHandler<DefaultDnsResponse> 
```

DotChannelInboundHandler中定义了消息的具体处理方法：

```
    private static void readMsg(DefaultDnsResponse msg) {
        if (msg.count(DnsSection.QUESTION) > 0) {
            DnsQuestion question = msg.recordAt(DnsSection.QUESTION, 0);
            log.info("question is :{}", question);
        }
        int i = 0, count = msg.count(DnsSection.ANSWER);
        while (i < count) {
            DnsRecord record = msg.recordAt(DnsSection.ANSWER, i);
            if (record.type() == DnsRecordType.A) {
                //A记录用来指定主机名或者域名对应的IP地址
                DnsRawRecord raw = (DnsRawRecord) record;
                log.info("ip address is: {}",NetUtil.bytesToIpAddress(ByteBufUtil.getBytes(raw.content())));
            }
            i++;
        }
    }
```

读取的逻辑很简单，先从DefaultDnsResponse中读取QUESTION，打印出来，然后再读取它的ANSWER，因为这里是A address，所以调用NetUtil.bytesToIpAddress方法将ANSWER转换为ip地址打印出来。

最后我们可能得到这样的输出：

```
INFO  c.f.dnsdot.DotChannelInboundHandler - question is :DefaultDnsQuestion(www.flydean.com. IN A)
INFO  c.f.dnsdot.DotChannelInboundHandler - ip address is: 47.107.98.187

```

# TLS的客户端请求

我们创建好channel之后，就需要向DNS server端发送查询请求了。因为是DoT，那么和普通的TCP查询有什么区别呢？

答案是并没有什么区别，因为TLS的操作SslHandler我们已经在handler中添加了。所以这里的查询和普通查询没什么区别。

```
int randomID = (int) (System.currentTimeMillis() / 1000);
            DnsQuery query = new DefaultDnsQuery(randomID, DnsOpCode.QUERY)
                    .setRecord(DnsSection.QUESTION, new DefaultDnsQuestion(queryDomain, DnsRecordType.A));
            ch.writeAndFlush(query).sync();
            boolean result = ch.closeFuture().await(10, TimeUnit.SECONDS);
            if (!result) {
                log.error("DNS查询失败");
                ch.close().sync();
            }
```

同样我们需要构建一个DnsQuery，这里使用的是DefaultDnsQuery，通过传入一个randomID和opcode即可。

因为是查询，所以这里的opcode是DnsOpCode.QUERY。

然后需要向QUESTION section中添加一个DefaultDnsQuestion，用来查询具体的域名和类型。

这里的queryDomain是www.flydean.com,查询类型是A,表示的是对域名进行IP解析。

最后将得到的query，写入到channel中即可。

# 总结

这里我们使用netty构建了一个基于TLS的DNS查询客户端，除了添加TLS handler之外，其他操作和普通的TCP操作类似。但是要注意的是，要想客户端可以正常工作，我们需要请求支持DoT协议的DNS服务器才可以。

本文的代码，大家可以参考：

[learn-netty4](https://github.com/ddean2009/learn-netty4)








