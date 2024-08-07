---
slug: /09-SOCKS
---

# 9. 网络协议之:一定要大写的SOCKS



# 简介

很久很久以前，人们还穿的是草鞋，草鞋虽然穿着舒服，但是不够美观。然后人们就发现，用动物的皮也可以做成鞋，于是出现了皮鞋。但是皮鞋穿着磨脚，于是人们又发明了socks，套在脚上，代替脚跟鞋子接触，既提高了舒适感，也减少了磨损，简直是一举两得的事情，非常完美。

在网络世界，也存在这样的socks，为了和真实世界的socks进行区分，这里我们使用大写的SOCKS。

SOCKS就是我们今天要讲解的网络代理协议。

# SOCKS的故事

在讲解SOCKS之前，我们回顾一下OSI网络七层协议。

OSI是Open System Interconnect的缩写，意为开放式系统互联。

![](https://img-blog.csdnimg.cn/20200617103233957.png)

而SOCKS也是一种网络协议，它的作用和socks一样，用来代替客户端和服务器端进行连接，也就是代理协议。

SOCKS在OSI七层协议的第五层，也就是会话层中，它处于表现层和传输层的中间。从上图可以看到SOCKS的底层就是TCP和UDP协议。

作为一个代理协议，SOCKS可以提供基于TCP和UDP的代理，相较于HTTP的代理而言，SOCKS的代理更加底层，所以应用场景也会更多。

通常来说，SOCKS的标准端口是1080。

# SOCKS的历史

每个协议都有自己的发展史，SOCKS也不例外，如果要把所有协议的发展史以故事的形式讲述起来一定会很有意思，大家可以期待一下，说不定某天这样的文章就出现了。

代理是网络中的一项基本功能，SOCKS代理最先是由美国MIPS科技公司的David Koblas设计的。MIPS公司以开发MIPS架构和基于该架构的一系列 RISC CPU 芯片而闻名。不过后面被一系列的收购，最终MIPS 架构被放弃了，转而支持RISC-V架构。

MIPS在1992年被Silicon Graphics收购了，在那一年Koblas发表了关于SOCKS的论文，SOCKS一举成名。

SOCKS最广泛使用的协议版本是4和5。SOCKS4是NEC的Ying-Da Lee发明的。因为SOCKS 4中并没有关于安全方面的约定，但是对于现在的网络来说，安全越来越重要，所以出现了SOCKS5，SOCKS5协议最初是一种使防火墙和其他安全产品更易于管理的安全协议。

# SOCKS协议的具体内容

现在常用的SOCKS协议主要有SOCKS4、SOCKS4a和SOCKS5。本节将会详细讲诉他们的协议构成。

## SOCKS4

先看一下SOCKS4的请求数据package长得什么样子的：


 含义| VER | CMD | DSTPORT | DSTIP | ID
---------|------|----|----|-------|----
字节个数 | 1 | 1 | 2 | 4 | 可变

VER 占用1个字节，表示的是SOCKS协议的版本号，对于SOCKS4来说，这个值是0x04。

CMD 占用1个字节，表示的是要执行命令的代码，有两个选择，其中0x01 表示建立一个TCP/IP 流连接，0x02表示建立一个TCP/IP端口绑定。

DSTPORT 占用2个字节，表示目标端口号。

DESTIP 占用4个字节，表示的是IPv4地址。

ID 占用字节不定，表示的是用户ID。

对于请求数据，相应的返回数据如下：

 含义| VN | REP | DSTPORT | DSTIP 
---------|------|----|----|-------
字节个数 | 1 | 1 | 2 | 4 

VN占用1个字节，表示是返回的消息的版本。

REP占用1个字节，表示返回的code：

字节|含义
---|---
0x5A |	请求授权
0x5B |	请求拒绝或者请求失败
0x5C |	因为请求不包含客户端ID或者服务器端无法连接客户端而失败
0x5D |	因为客户端ID不匹配而失败

DSTPORT占用两个字节，表示目的地的端口，如果没有绑定的话，则为空。

DSTIP占用4个字节，表示客户端绑定的目的地的IP地址。

举个例子，如果客户端想使用SOCKS4从Fred连接到66.102.7.99:80，请求如下:

```
0x04 | 0x01 | 0x00 0x50 | 0x42 0x66 0x07 0x63 | 0x46 0x72 0x65 0x64 0x00
```

其中最后一个字段是Fred的ASCII编码。

如果服务器端返回OK，则对应的响应如下：

```
0x00 | 0x5A | 0xXX 0xXX | 0xXX 0xXX 0xXX 0xXX
```

其中0xXX可以是任意值。

当连接建立完毕之后，所有的SOCKS客户端到SOCKS服务器端的请求都会转发到66.102.7.99。

## SOCKS4a

因为SOCKS4只能指定目的服务器的IP地址，这对应服务器有多个IP的情况下会有很严重的限制。所以SOCK4a对SOCK4进行了扩展，可以支持目标服务器的域名。

SOCKS4a也是由SOCKS4的作者Ying-Da Lee,提出来的。我们看下SOCKS4a的请求格式：

 含义| VER | CMD | DSTPORT | DSTIP | ID | DOMAIN
---------|------|----|----|-------|----|-----
字节个数 | 1 | 1 | 2 | 4 | 可变|variable

SOCKS4a是在SOCKS4的最后加入了domain。

DOMAIN表示的是要连接到的目标服务器的域名。使用null (0x00)来结尾。对应的DSTIP的前三个字节设置为NULL，最后一个字节设置成一个非0的值。

服务端的响应和SOCKS4是一样的。

## SOCKS5

虽然SOCKS5是SOCKS的最新版本，但是SOCKS5和SOCKS4是不兼容的。SOCKS5支持认证，并且提供了对IPv6和UDP的支持。其中UDP可以用来进行DNS lookups。它的交互流程如下所示：

1. 客户端和服务器端进行连接，并发送一个greeting消息，同时包含了支持的认证方法列表。

2. 服务器端选择一个支持的认证方法，如果都不支持，则发送失败响应。

3. 根据选中的认证方法，客户端和服务器进行后续的认证交互，交互流程跟选中的认证方法相关。

4. 客户端以SOCKS4相似的方式发送连接请求。

5. 服务器端发送和SOCKS4相似的响应。

我们看下greeting消息的格式：

 含义| VER | NAUTH | AUTH 
---------|------|----|----
字节个数 | 1 | 1 | 可变字节

VER 占用1个字节表示SOCKS的版本号，这里是0x05。

NAUTH 占用1个字节，表示支持的认证方法的个数。

AUTH 是可变字节，表示的是支持的认证方法。一个字节表示一个方法，支持的方法如下：

```
    0x00: 没有认证
    0x01: GSSAPI 
    0x02: 用户名/密码 (RFC 1929)
    0x03–0x7F: methods assigned by IANA
        0x03: Challenge-Handshake Authentication Protocol
        0x04: 未分配
        0x05: Challenge-Response Authentication Method
        0x06: Secure Sockets Layer
        0x07: NDS Authentication
        0x08: Multi-Authentication Framework
        0x09: JSON Parameter Block
        0x0A–0x7F: 未分配
    0x80–0xFE: 内部使用的保留方法
```

对应的服务器端的响应如下：

 含义| VER | CAUTH 
---------|------|----
字节个数 | 1 | 1 

VER 占用1个字节，表示的是版本号。对于SOCKS5来说，它的值是0x05。

CAUTH 占用1个字节，表示选中的认证方法。如果没有被选中，则设置为0xFF。

选好认证方法之后，接下来就是客户端和服务器端的认证交互了，这里我们选择最基本的用户名和密码0x02认证为例。

客户端发送认证请求：

 含义| VER | IDLEN | ID | PWLEN |  PW
---------|------|----|-----|-----|-----
字节个数 | 1 | 1 | (1-255) | 1 | (1-255)

VER 占用1个字节表示当前用户名和密码认证的版本。

IDLEN 占用1个字节，表示用户名的长度。

ID 占用1到255个字节，表示用户名。

PWLEN 占用1个字节，表示密码的长度。

PW 就是密码。

对应的服务器端的响应如下：

 含义| VER | STATUS 
---------|------|----
字节个数 | 1 | 1 

VER 占用1个字节，表示版本号。

STATUS 占用1个字节，表示服务器的响应状态。

接下来，客户端就可以和服务器端发送建立连接消息了：

 含义| VER | CMD | RSV | DSTADDR |  DSTPORT
---------|------|----|-----|-----|-----
字节个数 | 1 | 1 | 1 | 可变字节 | 2

CMD 是连接可选的命令，0x01表示建立TCP/IP流连接，表示建立TCP/IP端口绑定，0x03表示连接一个UDP端口。

RSV 是保留字节，必须是0x00。

DSTADDR是SOCKS5的地址。地址的定义是这样的：

 含义| TYPE | ADDR 
---------|------|----
字节个数 | 1 | 可变字节

TYPE 表示地址的类型，0x01是IPv4地址，0x03是域名，0x04是IPv6地址。

ADDR 表示的是地址，如果是IPv4，则使用4个字节，如果是域名，则第一个字节表示长度，后面字节表示域名。如果是IPv6地址，则使用16个字节。

对应的服务器端的响应如下：

 含义| VER | STATUS | RSV | BNDADDR |  BNDPORT
---------|------|----|-----|-----|-----
字节个数 | 1 | 1 | 1 | 可变字节 | 2

# 总结 

以上就是SOCKS4和SOCKS5的详细协议内容。注意，SOCKS一定要大写！



















 

