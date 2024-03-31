---
slug: /20-haproxy-protocol
---

# 20. 网络协议之:haproxy的Proxy Protocol代理协议

[toc]

# 简介

代理大家应该都很熟悉了，比较出名的像是nginx,apache HTTPD，stunnel等。

我们知道代理就是代替客户端向服务器端进行消息请求，并且希望在代理的过程中保留初始的TCP连接信息，例如源和目标IP和端口等，以提供一些个性化的操作。

一般情况下，为了实现这个目标，有一些现成的解决办法，比如在HTTP协议中，可以使用“X-Forwarded-For”标头，来包含有关原始源地址，还有"X-Original-To"用来携带目的地址的信息。

又比如在SMTP协议中，可以特别使用XCLIENT协议来进行邮件交换。

或者可以通过编译内核，把你的代理作为你服务器的默认网关。

这些方式虽然可用，但是或多或少有一些限制，要么与协议相关，要么修改修改系统架构，从而可扩展性不强。

尤其是在多个代理服务器链式调用的情况下，上述方法几乎是不可能完成的。

这就需要一个统一的代理协议，通过所有的节点都兼容这个代理协议就可以无缝实现代理的链式调用。这个代理协议就是haproxy在2010年提出的proxy Protocol。

这个代理协议的优点是：

* 它与协议无关（可以与任何7层协议一起使用，即使在加密的情况也可用）
* 它不需要任何基础架构更改
* 可以穿透NAT防火墙
* 它是可扩展的

而haproxy本身就是一个非常优秀的开源负载均衡和代理软件，提供了高负载能力和优秀的性能，所以在很多公司得以广泛的使用，比如：GoDaddy, GitHub, Bitbucket,Stack Overflow,Reddit, Slack,Speedtest.net, Tumblr, Twitter等。

今天要介绍的就是haproxy的Proxy Protocol代理协议的底层细节。

# Proxy Protocol的实现细节

上面我们提到了Proxy Protocol的目的就是可以携带一些可以标记初始的TCP连接信息的字段，比如IP地址和端口等。

如果是客户端和服务器端直连，那么服务器端可以通过getsockname和getpeername获得如下的信息：

* address family: AF_INET for IPv4, AF_INET6 for IPv6, AF_UNIX
* socket protocol: SOCK_STREAM for TCP, SOCK_DGRAM for UDP
* 网络层的源和目标地址
* 传输层的源和目标的端口号

所以Proxy Protocol的目的就是封装上面的这些信息，然后将上述信息放到请求头中去，这样服务器端就可以正确读取客户端的信息。

在Proxy Protocol中，定义了两个版本。

在版本1中，头文件信息是文本形式的，也就是人类可读的，采用这种方式，主要是为了在协议应用的早期保证更好的可调试性，从而快速景修正。

在版本2中，提供了对头文件的二进制编码功能，在版本1的功能已经基本完善的前提下，提供二进制编码，可以有效的提高应用的传输和处理性能。

因为有两个版本，所以在服务器的接收端也需要实现对相应版本的支持。

为了更好的应用Proxy Protocol，Proxy Protocol实际只定义了一个header信息，这个请求头会在连接发起者发起连接的时候放在每个连接的开头。并且该协议是无状态的，因为它不期望发送者在发送标头之前等待接收者，也不期望接收者发送回任何内容。

接下来，我们具体观察一下两个版本协议的实现。

## 版本1

在版本1中，proxy header是由一串US-ASCII编码的字符串组成的。这个proxy header将会在客户端和服务器端建立连接，并且发送任何真实数据之前发送。

先来看一个使用了proxy header的http请求的例子：

```
    PROXY TCP4 192.168.0.1 192.168.0.102 12345 443\r\n
    GET / HTTP/1.1\r\n
    Host: 192.168.0.102\r\n
    \r\n
```

上面的例子中，\r\n表示的是回车换行，也就是行结束的标记。该代码向host:192.168.0.102发送了一个HTTP请求，第一行的内容就是使用的proxy header。

具体什么含义呢？

首先是字符串"PROXY",表示这是一个proxy protocol的header,并且是v1版本的。

接着是一个空格分隔符。

然后是proxy使用的INET protocol 和 family。对于v1版本来说，支持"TCP4"和"TCP6"这两种方式。上面的例子中，我们使用的是TCP4.

如果要使用其他的协议，那么可以设置为"UNKNOWN"。如果设置为"UNKNOWN"，那么后面到CRLF之前的数据将会被忽略。

接着是一个空格分隔符。

然后是网络层源的IP地址，根据选的是TCP4还是TCP6，对应的源IP地址也有不同的表示形式。

接着是一个空格分隔符。

然后是网络层目标地址的IP地址，根据选的是TCP4还是TCP6，对应的源IP地址也有不同的表示形式。

接着是一个空格分隔符。

然后是TCP源的端口号，取值范围是0-65535。

接着是一个空格分隔符。

然后是TCP目标地址的端口号，取值范围是0-65535。

接着是CRLF结束符。

这样一个v1版本的proxy protocol就定义完了，是不是很简单。

根据这样的定义，我们很好来计算整个proxy protocol的最大长度，对于TC4来说，最大的长度表示为：

```
  - TCP/IPv4 :
      "PROXY TCP4 255.255.255.255 255.255.255.255 65535 65535\r\n"
    => 5 + 1 + 4 + 1 + 15 + 1 + 15 + 1 + 5 + 1 + 5 + 2 = 56 chars
```

对于TCP6来说，最大的长度表示为：

```
  - TCP/IPv6 :
      "PROXY TCP6 ffff:f...f:ffff ffff:f...f:ffff 65535 65535\r\n"
    => 5 + 1 + 4 + 1 + 39 + 1 + 39 + 1 + 5 + 1 + 5 + 2 = 104 chars
```

对于UNKNOWN来说，可能有下面的最小长度和最大长度表示为：

```
  - unknown connection (short form) :
      "PROXY UNKNOWN\r\n"
    => 5 + 1 + 7 + 2 = 15 chars

  - worst case (optional fields set to 0xff) :
      "PROXY UNKNOWN ffff:f...f:ffff ffff:f...f:ffff 65535 65535\r\n"
    => 5 + 1 + 7 + 1 + 39 + 1 + 39 + 1 + 5 + 1 + 5 + 2 = 107 chars
```

所以，总体来说108个字符已经足够v1版本使用了。

## 版本2

版本2主要是实现的二进制编码，虽然对人类可读不友好，但是可以提高传输和解析效率。

版本2的header是以下面12 bytes开头的block：

```
\x0D \x0A \x0D \x0A \x00 \x0D \x0A \x51 \x55 \x49 \x54 \x0A
```

接下来的一个byte(13 bytes)是protocol version 和 command。因为一个byte是8个bits，使用一个byte来保存有点太奢侈了。所以将其拆分成两部分。

高位的4个bits保存的是版本，这里版本号必须是"\x2"。

低位的4个bits保存的是command，有下面几个值：

* LOCAL(\x0): 表示连接是由代理自己发起的，一般用在代理向服务器发送健康检查时。

* PROXY(\x1): 代表连接是由另外一个节点发起的，这是一个proxy代理请求。 然后接收者必须使用协议块中提供的信息来获取原始地址。

* 其他：其他command都需要被丢弃，因为不可识别。

接下来的一个byte(14 bytes)保存的是transport protocol 和 address family。

其中高4位保存的是address family,低4位保存的是transport protocol。

address family可能有下面的值：

* AF_UNSPEC(0x0): 表示的是不支持的，或者未定义的protocol。当sender发送LOCAL command或者处理为止protocol families的时候就可以使用这个值。
* AF_INET(0x1):表示的是IPv4地址,占用4bytes。
* AF_INET6(0x2):表示的是IPv6地址，占用16bytes。
* AF_UNIX(0x3):表示的是unix address地址，占用108 bytes。

transport protocol可能有下面的值：

* UNSPEC(0x0): 未知协议类型。
* STREAM(0x1):使用的是SOCK_STREAM protocol，比如TCP 或者UNIX_STREAM。
* DGRAM(0x2):使用的是SOCK_DGRAM protocol，比如UDP 或者UNIX_DGRAM。

低4位和高4位进行组合，可以得到下面几种值：

* UNSPEC(\x00)
* TCP over IPv4(\x11)
* UDP over IPv4(\x12)
* TCP over IPv6(\x21)
* UDP over IPv6(\x22)
* UNIX stream(\x31)
* UNIX datagram(\x32)

第15和16 bytes表示的剩下的字段的长度，综上，16-byte的v2可以用下面的结构体表示：

```
    struct proxy_hdr_v2 {
        uint8_t sig[12];  /* hex 0D 0A 0D 0A 00 0D 0A 51 55 49 54 0A */
        uint8_t ver_cmd;  /* protocol version and command */
        uint8_t fam;      /* protocol family and address */
        uint16_t len;     /* number of following bytes part of the header */
    };
```

从第17个byte开始，就是地址的长度和端口号信息，可以用下面的结构体表示：

```
    union proxy_addr {
        struct {        /* for TCP/UDP over IPv4, len = 12 */
            uint32_t src_addr;
            uint32_t dst_addr;
            uint16_t src_port;
            uint16_t dst_port;
        } ipv4_addr;
        struct {        /* for TCP/UDP over IPv6, len = 36 */
             uint8_t  src_addr[16];
             uint8_t  dst_addr[16];
             uint16_t src_port;
             uint16_t dst_port;
        } ipv6_addr;
        struct {        /* for AF_UNIX sockets, len = 216 */
             uint8_t src_addr[108];
             uint8_t dst_addr[108];
        } unix_addr;
    };
```

在V2版本中，除了address信息之外，header中还可以包含一些额外的扩展信息，这些信息被称为Type-Length-Value (TLV vectors),格式如下：

```
        struct pp2_tlv {
            uint8_t type;
            uint8_t length_hi;
            uint8_t length_lo;
            uint8_t value[0];
        };
```

字段的含义分别是类型，长度和值。

下面是目前支持的类型：

```
        #define PP2_TYPE_ALPN           0x01
        #define PP2_TYPE_AUTHORITY      0x02
        #define PP2_TYPE_CRC32C         0x03
        #define PP2_TYPE_NOOP           0x04
        #define PP2_TYPE_UNIQUE_ID      0x05
        #define PP2_TYPE_SSL            0x20
        #define PP2_SUBTYPE_SSL_VERSION 0x21
        #define PP2_SUBTYPE_SSL_CN      0x22
        #define PP2_SUBTYPE_SSL_CIPHER  0x23
        #define PP2_SUBTYPE_SSL_SIG_ALG 0x24
        #define PP2_SUBTYPE_SSL_KEY_ALG 0x25
        #define PP2_TYPE_NETNS          0x30
```

# Proxy Protocol的使用情况

上面也提到了，一个协议的好坏不仅仅在与这个协议定义的好不好，也在于使用这个协议的软件多不多。

如果主流的代理软件都没有使用你这个代理协议，那么协议定义的再好也没有用。相反，如果大家都在使用你这个协议，协议定义的再差也是主流协议。

好在Proxy Protocol已经在代理服务器界被广泛的使用了。

具体使用该协议的软件如下：

* Elastic Load Balancing，AWS的负载均衡器，从2013年7月起兼容
* Dovecot，一个POP/IMAP邮件服务器从2.2.19版本开始兼容
* exaproxy，一个正向和反向代理服务器，从1.0.0版本开始兼容
* gunicorn ，python HTTP 服务器，从0.15.0开始兼容
* haproxy，反向代理负载均衡器，从1.5-dev3开始兼容
* nginx，正方向代理服务器，http服务器，从1.5.12开始兼容
* Percona DB，数据库服务器，从5.6.25-73.0开始兼容
* stud，SSL offloader,从第一个版本开始兼容
* stunnel，SSL offloader，从4.45开始兼容
* apache HTTPD，web 服务器，在扩展模块myfixip中使用
* varnish，HTTP 反向代理缓存，从4.1版开始兼容

基本上所有的主流服务器都兼容Proxy Protocol，所以我们可以把Proxy Protocol当做是事实上的标准。

# 总结

在本文中，我们介绍了Proxy Protocol的底层定义，那么Proxy Protocol具体怎么使用，能不能实现自己的Proxy Protocol服务器呢？敬请期待。