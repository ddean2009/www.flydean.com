---
slug: /36-netty-socks-support
---

# 60. netty系列之:netty对SOCKS协议的支持



# 简介

SOCKS是一个优秀的网络协议，主要被用来做代理，它的两个主要版本是SOCKS4和SOCKS5，其中SOCKS5提供了对认证的支持。通常来说我们使用SSH工具可以构建简单的SOCKS协议通道，那么对于netty来说，是怎么提供对SOCKS的支持呢？一起来看看吧。

# SocksMessage

首先是代表SOCKS消息对象的SocksMessage。SocksMessage是一个接口，它里面只有一个返回SocksVersion的version方法。

SocksVersion表示的是Socks的版本号。在netty中，支持三个版本，分别是：

```
    SOCKS4a((byte) 0x04),

    SOCKS5((byte) 0x05),

    UNKNOWN((byte) 0xff);
```

其对应的数值是SOCKS协议中的VER字段，我们以SOCKS4协议为例，再复习一下SOCKS的协议结构：

 含义| VER | CMD | DSTPORT | DSTIP | ID
---------|------|----|----|-------|----
字节个数 | 1 | 1 | 2 | 4 | 可变

既然netty中SOCKS有两个版本，相对于的SocksMessage接口就有两个实现，分别是Socks4Message和Socks5Message。

## Socks4Message

Socks4Messag继承自SocksMessage，表示的是SOCKS4的消息。

事实上，Socks4Messag是一个tag interface，它里面什么内容都没有。

```
public interface Socks4Message extends SocksMessage {
    // Tag interface
}
```

对于SOCKS4来说，有两种数据请求类型，分别是CONNECT和BIND，这两种请求类型被定义在Socks4CommandType中：

```
    public static final Socks4CommandType CONNECT = new Socks4CommandType(0x01, "CONNECT");
    public static final Socks4CommandType BIND = new Socks4CommandType(0x02, "BIND");

```

有请求就有响应，对应的有两个类，分别是Socks4CommandRequest和Socks4CommandResponse。

对于Request来说，我们需要请求类型，USERID，DSTIP和DSTPORT这几个数据：

```
    Socks4CommandType type();

    String userId();

    String dstAddr();

    int dstPort();
```

对于响应来说，有四个不同的状态，分别是SUCCESS、REJECTED_OR_FAILED、IDENTD_UNREACHABLE、IDENTD_AUTH_FAILURE。

```
    public static final Socks4CommandStatus SUCCESS = new Socks4CommandStatus(0x5a, "SUCCESS");
    public static final Socks4CommandStatus REJECTED_OR_FAILED = new Socks4CommandStatus(0x5b, "REJECTED_OR_FAILED");
    public static final Socks4CommandStatus IDENTD_UNREACHABLE = new Socks4CommandStatus(0x5c, "IDENTD_UNREACHABLE");
    public static final Socks4CommandStatus IDENTD_AUTH_FAILURE = new Socks4CommandStatus(0x5d, "IDENTD_AUTH_FAILURE");

```

除了Socks4CommandStatus之外，响应请求还有DSTIP和DSTPORT两个属性。

```
    Socks4CommandStatus status();

    String dstAddr();

    int dstPort();
```

## Socks5Message

同样的，对于SOCKS5来说，也有一个对应的接口Socks5Message，这个接口也是一个Tag interface，它里面什么都没有：

```
public interface Socks5Message extends SocksMessage {
    // Tag interface
}
```

对于SOCKS5来说，它的请求要比SOKCS4要复杂，首先的请求是一个初始化请求Socks5InitialRequest，该请求包含了可以接受的认证列表。

这个列表用Socks5AuthMethod来表示，它包含4个方法：

```
    public static final Socks5AuthMethod NO_AUTH = new Socks5AuthMethod(0x00, "NO_AUTH");
    public static final Socks5AuthMethod GSSAPI = new Socks5AuthMethod(0x01, "GSSAPI");
    public static final Socks5AuthMethod PASSWORD = new Socks5AuthMethod(0x02, "PASSWORD");
    public static final Socks5AuthMethod UNACCEPTED = new Socks5AuthMethod(0xff, "UNACCEPTED");
```

对于Socks5InitialRequest来说，它包含了一个authMethods的列表：

```
public interface Socks5InitialRequest extends Socks5Message {
    List<Socks5AuthMethod> authMethods();
}
```

对于InitialRequest来说，对应的也有Socks5InitialResponse，它包含了服务端选择的Socks5AuthMethod，所以对Socks5InitialResponse来说，它里面只包含了一个Socks5AuthMethod：

```
public interface Socks5InitialResponse extends Socks5Message {

    Socks5AuthMethod authMethod();
}
```

客户端和服务器端协商好选择的认证协议之后，接下来就是认证的过程，如果使用的是用户名密码的模式，则对应的是Socks5PasswordAuthRequest：

```
public interface Socks5PasswordAuthRequest extends Socks5Message {

    String username();

    String password();
}
```

password认证的结果只有两种结果，分别是SUCCESS和FAILURE：

```
    public static final Socks5PasswordAuthStatus SUCCESS = new Socks5PasswordAuthStatus(0x00, "SUCCESS");
    public static final Socks5PasswordAuthStatus FAILURE = new Socks5PasswordAuthStatus(0xFF, "FAILURE");

```

对于Socks5PasswordAuthResponse来说，它包含了一个认证的status：Socks5PasswordAuthStatus。

认证完毕之后，接下来就可以发送CommandRequest了。对应的Socks5CommandRequest包含下面几个属性：

```
    Socks5CommandType type();

    Socks5AddressType dstAddrType();

    String dstAddr();

    int dstPort();
```

对应的Socks5CommandResponse包含下面的属性：

```
    Socks5CommandStatus status();
    Socks5AddressType bndAddrType();
    String bndAddr();
    int bndPort();
```

# 总结

以上就是netty对SOCKS4和SOCKS5协议的消息封装。基本上netty中的对象是和SOCKS协议一致的。

