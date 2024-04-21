---
slug: /54-netty-dns-over-tcp
---

# 79. netty系列之:在netty中使用TCP协议请求DNS服务器



# 简介

DNS的全称domain name system，既然是一个系统就有客户端和服务器之分。一般情况来说我们并不需要感知这个DNS客户端的存在，因为我们在浏览器访问某个域名的时候，浏览器作为客户端已经实现了这个工作。

但是有时候我们没有使用浏览器，比如在netty环境中，如何构建一个DNS请求呢？

# DNS传输协议简介

在RFC的规范中，DNS传输协议有很多种,如下所示：

* DNS-over-UDP/53简称"Do53",是使用UDP进行DNS查询传输的协议。
* DNS-over-TCP/53简称"Do53/TCP",是使用TCP进行DNS查询传输的协议。
* DNSCrypt,对DNS传输协议进行加密的方法。
* DNS-over-TLS简称"DoT",使用TLS进行DNS协议传输。
* DNS-over-HTTPS简称"DoH",使用HTTPS进行DNS协议传输。
* DNS-over-TOR,使用VPN或者tunnels连接DNS。

这些协议都有对应的实现方式，我们先来看下Do53/TCP，也就是使用TCP进行DNS协议传输。

# DNS的IP地址

先来考虑一下如何在netty中使用Do53/TCP协议，进行DNS查询。

因为DNS是客户端和服务器的模式，我们需要做的是构建一个DNS客户端，向已知的DNS服务器端进行查询。

已知的DNS服务器地址有哪些呢？

除了13个root DNS IP地址以外，还出现了很多免费的公共DNS服务器地址,比如我们常用的阿里DNS,同时提供了IPv4/IPv6 DNS和DoT/DoH服务。

```
IPv4: 
223.5.5.5

223.6.6.6

IPv6: 
2400:3200::1

2400:3200:baba::1

DoH 地址: 
https://dns.alidns.com/dns-query

DoT 地址: 
dns.alidns.com
```

再比如百度DNS，提供了一组IPv4和IPv6的地址：

```
IPv4: 
180.76.76.76

IPv6: 
2400:da00::6666
```

还有114DNS:

```
114.114.114.114
114.114.115.115
```

当然还有很多其他的公共免费DNS，这里我选择使用阿里的IPv4:223.5.5.5为例。

有了IP地址，我们还需要指定netty的连接端口号，这里默认的是53。

然后就是我们要查询的域名了，这里以www.flydean.com为例。

你也可以使用你系统中配置的DNS解析地址，以mac为例，可以通过nslookup进行查看本地的DNS地址：

```
nslookup  www.flydean.com
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
www.flydean.com	canonical name = flydean.com.
Name:	flydean.com
Address: 47.107.98.187
```

# Do53/TCP在netty中的使用

有了DNS Server的IP地址，接下来我们需要做的就是搭建netty client，然后向DNS server端发送DNS查询消息。

## 搭建DNS netty client

因为我们进行的是TCP连接，所以可以借助于netty中的NIO操作来实现，也就是说我们需要使用NioEventLoopGroup和NioSocketChannel来搭建netty客户端：

```
 final String dnsServer = "223.5.5.5";
        final int dnsPort = 53;

EventLoopGroup group = new NioEventLoopGroup();
            Bootstrap b = new Bootstrap();
            b.group(group)
                    .channel(NioSocketChannel.class)
                    .handler(new Do53ChannelInitializer());

            final Channel ch = b.connect(dnsServer, dnsPort).sync().channel();
```

netty中的NIO Socket底层使用的就是TCP协议，所以我们只需要像常用的netty客户端服务一样构建客户端即可。

然后调用Bootstrap的connect方法连接到DNS服务器，就建立好了channel连接。

这里我们在handler中传入了自定义的Do53ChannelInitializer，我们知道handler的作用是对消息进行编码、解码和对消息进行读取。因为目前我们并不知道客户端查询的消息格式，所以Do53ChannelInitializer的实现我们在后面再进行详细讲解。

## 发送DNS查询消息

netty提供了DNS消息的封装，所有的DNS消息，包括查询和响应都是DnsMessage的子类。

每个DnsMessage都有一个唯一标记的ID，还有代表这个message类型的DnsOpCode。

对于DNS来说，opCode有下面这几种：

```
    public static final DnsOpCode QUERY = new DnsOpCode(0, "QUERY");
    public static final DnsOpCode IQUERY = new DnsOpCode(1, "IQUERY");
    public static final DnsOpCode STATUS = new DnsOpCode(2, "STATUS");
    public static final DnsOpCode NOTIFY = new DnsOpCode(4, "NOTIFY");
    public static final DnsOpCode UPDATE = new DnsOpCode(5, "UPDATE");
```

因为每个DnsMessage都可能包含4个sections,每个section都以DnsSection来表示。因为有4个section，所以在DnsSection定义了4个section类型:

```
    QUESTION,
    ANSWER,
    AUTHORITY,
    ADDITIONAL;
```

每个section里面又包含了多个DnsRecord, DnsRecord代表的就是Resource record,简称为RR，RR中有一个CLASS字段，下面是DnsRecord中CLASS字段的定义：

```
    int CLASS_IN = 1;
    int CLASS_CSNET = 2;
    int CLASS_CHAOS = 3;
    int CLASS_HESIOD = 4;
    int CLASS_NONE = 254;
    int CLASS_ANY = 255;
```

DnsMessage是DNS消息的统一表示，对于查询来说，netty中提供了一个专门的查询类叫做DefaultDnsQuery。

先来看下DefaultDnsQuery的定义和构造函数：

```
public class DefaultDnsQuery extends AbstractDnsMessage implements DnsQuery {

        public DefaultDnsQuery(int id) {
        super(id);
    }

    public DefaultDnsQuery(int id, DnsOpCode opCode) {
        super(id, opCode);
    }
```

DefaultDnsQuery的构造函数需要传入id和opCode。

我们可以这样定义一个DNS查询：

```
int randomID = (int) (System.currentTimeMillis() / 1000);
            DnsQuery query = new DefaultDnsQuery(randomID, DnsOpCode.QUERY)
```

既然是QEURY,那么还需要设置4个sections中的查询section:

```
query.setRecord(DnsSection.QUESTION, new DefaultDnsQuestion(queryDomain, DnsRecordType.A));
```

这里调用的是setRecord方法向section中插入RR数据。

这里的RR数据使用的是DefaultDnsQuestion。DefaultDnsQuestion的构造函数有两个，一个是要查询的domain name，这里就是"www.flydean.com",另外一个参数是dns记录的类型。

dns记录的类型有很多种，在netty中有一个专门的类DnsRecordType表示,DnsRecordType中定义了很多个类型，如下所示：

```
public class DnsRecordType implements Comparable<DnsRecordType> {
    public static final DnsRecordType A = new DnsRecordType(1, "A");
    public static final DnsRecordType NS = new DnsRecordType(2, "NS");
    public static final DnsRecordType CNAME = new DnsRecordType(5, "CNAME");
    public static final DnsRecordType SOA = new DnsRecordType(6, "SOA");
    public static final DnsRecordType PTR = new DnsRecordType(12, "PTR");
    public static final DnsRecordType MX = new DnsRecordType(15, "MX");
    public static final DnsRecordType TXT = new DnsRecordType(16, "TXT");
    ...
```

因为类型比较多，我们挑选几个常用的进行讲解。

* A类型，是address的缩写，用来指定主机名或者域名对应的ip地址.
* NS类型，是name server的缩写，是域名服务器记录，用来指定域名由哪个DNS服务器来进行解析。
* MX类型,是mail exchanger的缩写，是一个邮件交换记录，用来根据邮箱的后缀来定位邮件服务器。
* CNAME类型，是canonical name的缩写，可以将多个名字映射到同一个主机.
* TXT类型，用来表示主机或者域名的说明信息。

以上几个是我们经常会用到的dns record类型。

这里我们选择使用A，用来查询域名对应的主机IP地址。

构建好query之后，我们就可以使用netty client发送query指令到dns服务器了，具体的代码如下：

```
            DnsQuery query = new DefaultDnsQuery(randomID, DnsOpCode.QUERY)
                    .setRecord(DnsSection.QUESTION, new DefaultDnsQuestion(queryDomain, DnsRecordType.A));
            ch.writeAndFlush(query).sync();
```

## DNS查询的消息处理

DNS的查询消息我们已经发送出去了，接下来就是对消息的处理和解析了。

还记得我们自定义的Do53ChannelInitializer吗？看一下它的实现：

```
class Do53ChannelInitializer extends ChannelInitializer<SocketChannel> {
    @Override
    protected void initChannel(SocketChannel ch) {
        ChannelPipeline p = ch.pipeline();
        p.addLast(new TcpDnsQueryEncoder())
                .addLast(new TcpDnsResponseDecoder())
                .addLast(new Do53ChannelInboundHandler());
    }
}
```

我们向pipline中添加了两个netty自带的编码解码器TcpDnsQueryEncoder和TcpDnsResponseDecoder，还有一个自定义用来做消息解析的Do53ChannelInboundHandler。

因为我们向channel中写入的是DnsQuery,所以需要一个encoder将DnsQuery编码为ByteBuf,这里使用的是netty提供的TcpDnsQueryEncoder：

```
public final class TcpDnsQueryEncoder extends MessageToByteEncoder<DnsQuery> 
```

TcpDnsQueryEncoder继承自MessageToByteEncoder，表示将DnsQuery编码为ByteBuf。

看下他的encode方法：

```
    protected void encode(ChannelHandlerContext ctx, DnsQuery msg, ByteBuf out) throws Exception {
        out.writerIndex(out.writerIndex() + 2);
        this.encoder.encode(msg, out);
        out.setShort(0, out.readableBytes() - 2);
    }
```

可以看到TcpDnsQueryEncoder在msg编码之前存储了msg的长度信息，所以是一个基于长度的对象编码器。

这里的encoder是一个DnsQueryEncoder对象。

看一下它的encoder方法：

```
    void encode(DnsQuery query, ByteBuf out) throws Exception {
        encodeHeader(query, out);
        this.encodeQuestions(query, out);
        this.encodeRecords(query, DnsSection.ADDITIONAL, out);
    }
```

DnsQueryEncoder会依次编码header、questions和records。

完成编码之后，我们还需要从DNS server的返回中decode出DnsResponse，这里使用的是netty自带的TcpDnsResponseDecoder:

```
public final class TcpDnsResponseDecoder extends LengthFieldBasedFrameDecoder
```

TcpDnsResponseDecoder继承自LengthFieldBasedFrameDecoder，表示数据是以字段长度来进行分割的，这和我们刚刚将的encoder的格式类似。

来看下他的decode方法：

```
    protected Object decode(ChannelHandlerContext ctx, ByteBuf in) throws Exception {
        ByteBuf frame = (ByteBuf)super.decode(ctx, in);
        if (frame == null) {
            return null;
        } else {
            DnsResponse var4;
            try {
                var4 = this.responseDecoder.decode(ctx.channel().remoteAddress(), ctx.channel().localAddress(), frame.slice());
            } finally {
                frame.release();
            }
            return var4;
        }
    }
```

decode方法先调用LengthFieldBasedFrameDecoder的decode方法将要解码的内容提取出来，然后调用responseDecoder的decode方法，最终返回DnsResponse。

这里的responseDecoder是一个DnsResponseDecoder。具体decoder的细节这里就不过多阐述了。感兴趣的同学可以自行查阅代码文档。

最后，我们得到了DnsResponse对象。

接下来就是自定义的InboundHandler对消息进行解析了：

```
class Do53ChannelInboundHandler extends SimpleChannelInboundHandler<DefaultDnsResponse> 
```

在它的channelRead0方法中，我们调用了readMsg方法对消息进行处理：

```
    private static void readMsg(DefaultDnsResponse msg) {
        if (msg.count(DnsSection.QUESTION) > 0) {
            DnsQuestion question = msg.recordAt(DnsSection.QUESTION, 0);
            log.info("question is :{}",question);
        }
        int i = 0, count = msg.count(DnsSection.ANSWER);
        while (i < count) {
            DnsRecord record = msg.recordAt(DnsSection.ANSWER, i);
            //A记录用来指定主机名或者域名对应的IP地址
            if (record.type() == DnsRecordType.A) {
                DnsRawRecord raw = (DnsRawRecord) record;
                log.info("ip address is: {}",NetUtil.bytesToIpAddress(ByteBufUtil.getBytes(raw.content())));
            }
            i++;
        }
    }
```

DefaultDnsResponse是DnsResponse的一个实现，首先判断msg中的QUESTION个数是否大于零。

如果大于零，则打印出question的信息。

然后再解析出msg中的ANSWER并打印出来。

最后，我们可能得到这样的输出：

```
INFO  c.f.dnstcp.Do53ChannelInboundHandler - question is :DefaultDnsQuestion(www.flydean.com. IN A)
INFO  c.f.dnstcp.Do53ChannelInboundHandler - ip address is: 47.107.98.187
```

# 总结

以上就是使用netty创建DNS client进行TCP查询的讲解。

本文的代码，大家可以参考：

[learn-netty4](https://github.com/ddean2009/learn-netty4)
















