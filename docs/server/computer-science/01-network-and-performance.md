---
slug: /network-and-performance
---

# 1. 计算机揭秘之:网络分类和性能分析

# 简介

程序员天天都在写代码，关注的都是更高层次的封装，今天我们换个思路，来看一看隐藏在表象之下的网络和他们的性能分析。

本文主要涉及6个模块，分别是网络七层协议，延迟与带宽，IP，TCP，UDP和SSL/TLS。

# OSI网络七层协议

在讲网络之前，一定要提到OSI网络七层协议。

OSI是Open System Interconnect的缩写，意为开放式系统互联。

![](https://img-blog.csdnimg.cn/20200617103233957.png)

上图是大家非常非常熟悉的OSI七层网络模型，和对应的TCP/IP模型。

应用层的功能是文件传输，电子邮件和文件服务等。使用的协议主要是HTTP，SMTP和FTP。

表示层的功能是数据格式化，代码转换和数据加密。

会话层的功能是解除或者建立与其他节点的联系。

传输层的功能是提供端对端的接口，使用的协议主要是TCP和UDP。

网络层的功能是为数据包选择路由，使用的协议是IP。

数据链路层的功能是传输有地址的帧，和检查数据错误。

物理层的功能是以二进制数据在物理媒介上传输数据。

# 延迟与带宽

最近电信业务员老是给我打电话，说是要把家里的电信宽带从100M升级到500M，每天只需要一块钱。一块钱虽然少，但也是血汗钱。那么办还是不办呢？升级到500M对性能和延时提升有多大帮助呢？

2020年可以称为中国5G的元年。先不管华为，中信在5G基站和协议制定方面的能力。直观的感觉5G手机开始多了，手机营业厅也在卖力的让你升级到5G套餐，那么办还是不办？

在回答这两个问题之前，我们学习两个名词：

延迟: 分组从信息源发送到目的地所需的时间。

带宽: 逻辑或物理通信路径最大的吞吐量。

![](https://img-blog.csdnimg.cn/20200617111917272.png)

如果你访问一个网站，比如www.flydean.com，我们看一下数据是怎么从服务器到达你的电脑的。

首先数据从服务器通过以太网（以太网是一种计算机局域网技术）传输到ISP。

ISP是啥呢？ISP就是互联网服务提供商（Internet Service Provider），通过ISP你才能够把服务器接入互联网。

互联网就是通过主干网的互联网服务提供商（ISP）之间的相互连接构成的。

所以ISP就是一个......大代理。

好了，数据传到为我家提供服务的ISP了，然后通过光纤或者电缆线传到了我家的WiFi，然后通过WiFi的无线信号，被我的电脑接收。

## 延时的构成

讨论分析了数据的传输线路，接下来我们看一下，延时会跟哪些原因有关呢？

首先肯定是信号传输的距离，距离越长，传输速率越慢，需要的时间就越长。

接下来就是消息的长度，我们把消息中的所有比特转移到链路中需要时间，消息长度越长，需要的时间越多。

数据上了链路之后，处理分组首部、检查位错误及确定分组目标也需要时间。

最后，我们对于分组数据进行排队处理也需要时间。

现在主网络的传输介质基本上都是光纤了，光在光纤中传播，并不是直线进行的，并且也有折射率的影响，所以速度比光在真空中传播要慢一点。

比如说信号围绕赤道转一圈，只需要大概200ms。已经很快了。

200ms确实很快了，但是对于某些实时性要求特别高的应用场景，我们可以使用CDN技术（Content Delivery Network，内容分发网络），把内容部署在全球网络中，然后从最近的地方去取数据。从而大大减少传输延时。

200ms够快了，但是为什么我们仍然会感觉到网速慢呢？

大家都听过木桶原理吧，木桶能够装的水，决定于最短的那块木板。同样的对于网络延时来说，提升速度不在于你在主干网上采用了多么先进的技术，因为提升的再多或者再差也是毫米级的。

真正决定网速的在于最后一公里，也就是你电缆线的传输速率，你的wifi的传输速率，还有你电脑的处理速率等。

 能接入更高带宽固然好，特别是传输大块数据时更是如此，比如在线听音乐、看视频，或者下载大文件。可是，日常上网浏览需要的是从数十台主机获取较小的资源，这时候往返时间就成了瓶颈。

# IP协议

IP，即 Internet Protocol（因特网协议），负责联网主机之间的路由选择和寻址。

各种物理网络在链路层所传输的基本单元为帧（MAC帧），其帧格式随物理网络而异，各物理网络的物理地址（MAC地址）也随物理网络而异。Ip协议的作用就是向传输层（TCP层）提供统一的IP包，即将各种不同类型的MAC帧转换为统一的IP包，并将MAC帧的物理地址变换为全网统一的逻辑地址（IP地址）。

## IP数据包

数据包(data packet)是什么？

数据包也是分组交换的一种形式，就是把所传送的数据分段打成包，再传送出去.

每个数据包都有报头和报文这两个部分，报头中有目的地址等必要内容，使每个数据包不经过同样的路径都能准确地到达目的地。在目的地重新组合还原成原来发送的数据.

![](https://img-blog.csdnimg.cn/20200617122002325.png)

我们看下IP数据包的构成。

注意上面的Total Length部分占用了2个字节，所以IP数据包的最大长度就是2^16-1=65535字节。

## 分片和重组

链路层具有最大传输单元MTU这个特性，它限制了数据帧的最大长度，不同的网络类型都有一个上限值.如果IP层有数据包要传，而且数据包的长度超过了MTU，那么IP层就要对数据包进行分片操作，使每一片的长度都小于或等于MTU。

分片后的IP数据包，只有到达目的地才能重新组装。重新组装由目的地的IP层来完成，其目的是使分片和重新组装过程对传输层（TCP和UDP）是透明的。

## MSS与MTU

MSS最大传输大小的缩写，是TCP协议里面的一个概念。

MSS就是TCP数据包每次能够传输的最大数据分段。为了达到最佳的传输效能TCP协议在建立连接的时候通常要协商双方的MSS值，这个值TCP协议在实现的时候往往用MTU值代替（需要减去IP数据包包头的大小20Bytes和TCP数据段的包头20Bytes）, 通讯双方会根据双方提供的MSS值得最小值确定为这次连接的最大MSS值。

而一般以太网MTU都为1500, 所以在以太网中, 往往TCP MSS为1460。

# TCP

 TCP，即 Transmission Control Protocol（传输控制协议），负责在不可靠的传输信道之上提供可靠的抽象层,  向应用层隐藏了大多数网络通信的复杂细节，比如丢包重发、按序发送、拥塞控制及避免、数据完整，等等。

## TCP三次握手

![](https://img-blog.csdnimg.cn/20200617123103697.png)

一般来说，使用TCP协议，如果client和server要达成一致建立连接的话，需要三次交互。

* SYN
客户端选择一个随机序列号x，并发送一个SYN 分组，其中可能还包括其他TCP标志和选项。

* SYN ACK
服务器给x 加1，并选择自己的一个随机序列号y，追加自己的标志和选项，然后返回响应。

* ACK
客户端给x 和y 加1 并发送握手期间的最后一个ACK 分组。

## 拥塞崩溃

如果几个IP分组同时到达路由器，并期望经同一个输出端口转发.

显然，不是所有分组可以同时接受处理，必须有一个服务顺序，中间节点上的缓存为等候服务的分组提供一定保护。

然而，如果此状况具有一定的持续性，当缓存空间被耗尽时，路由器只有丢弃分组。

在这种持续过载的状态下，网络性能会急剧下降.

## 流量控制

流量控制是一种预防发送端过多向接收端发送数据的机制。否则，接收端可能因为忙碌、负载重或缓冲区既定而无法处理。

为实现流量控制，TCP连接的每一方都要通告自己的接收窗口receive window（rwnd），其中包含能够保存数据的缓冲区空间大小信息。

![](https://img-blog.csdnimg.cn/20200617122608296.png)

最初的TCP规范分配给通告窗口大小的字段是16位的，这相当于设定了发送端和接收端窗口的最大值（65535字节）。结果，在这个限制内经常无法获得最优性能。

为解决这个问题，RFC1323提供了TCP窗口缩放（TCP Window Scaling）选项，可以把接收窗口大小由65535字节提高到1G字节。

那么现在问题来了，rwnd只是一个接收端的初始窗口大小，如果有多个sender都在向receiver发送数据包的话，怎么才能保证receiver端的接收性能呢？

为了解决这个问题，TCP引入了慢启动的概念。

当sender和receiver已经建立好了TCP三次握手之后。就可以开始发送数据包了。

这里引入了一个拥堵窗口Congestion window（cwnd）的概念。

cwnd是server端目前可以接受的最大的窗口大小。

建立连接之后第一次发送的cwnd是一个初始值，这个初始值最开始是1个network segment，在1999年 RFC 2581将其更新为4个network segments。在2013年， RFC 6928 将这个值扩大到了10个network segments。

我们以10个network segments为例，看下cwnd的膨胀过程：

![](https://img-blog.csdnimg.cn/20200617144008858.png)

一般来说cwnd是倍数增加的，收到ack之后，cwnd会从10，20，40这样往上增加。一直到server端拒绝ack为止。

那么回到我们之前讲到的一个结论，带宽其实不是那么重要。

为什么呢？考虑在HTTP1.1中，client需要等待server的返回才能够进行下一次请求。如果你的请求的文件比较小，那么cwnd还没有涨到足够大的时候，请求就已经结束了。这个时候最主要的时间花费是请求的来回时间，而不在于带宽大小。

当然，如果在HTTP2中，因为建立的是长连接，慢启动可能就不存在了（不确定，大家有不同的意见可以提出）。

# UDP

UDP（ User Datagram Protocol )，也叫用户数据报协议。

UDP 的主要功能和亮点并不在于它引入了什么特性，而在于它忽略的那些特性：不保证消息交付，不保证交付顺序，不跟踪连接状态，不需要拥塞控制。

我们先来看一下UDP的数据包：

![](https://img-blog.csdnimg.cn/20200617170251803.png)

# NAT

大家都知道IPV4地址是有限的，很快IPV4地址就快用完了，那怎么解决这个问题呢？

当然，一个永久解决的办法是IPV6，不过IPV6推出这么多年了，好像还没有真正的普及。

不使用IPV6的话还有什么解决办法呢？

这个办法就是NAT（Network Address Translators）。

![](https://img-blog.csdnimg.cn/20200617171736331.png)

NAT的原理是将局域网的IP和端口和NAT设备的IP和端口做个映射。

NAT内部维护着一张转换表。这样就可以通过一个NAT的IP地址和不同的端口来连接众多的局域网服务器。

那么NAT有什么问题呢？

NAT的问题在于，内部客户端不知道自己外网IP地址，只知道内网IP地址。

如果是在UDP协议中，因为UDP是无状态的，所以需要NAT来重写每个UDP分组中的源端口、地址，以及IP分组中的源IP地址。

如果客户端是在应用程序内部将自己的IP地址告诉服务器，并想跟服务器建立连接，那么肯定是建立不了的。因为找不到客户端的公网IP。

即使找到了公网IP，任何到达NAT设备外网IP的分组还必须有一个目标端口，而且NAT转换表中也要有一个条目可以将其转换为内部主机的IP地址和端口号。否则就可能出现下图的连接失败的问题。

![](https://img-blog.csdnimg.cn/2020061717421463.png)

怎么解决呢？

第一种方式是使用STUN服务器。

![](https://img-blog.csdnimg.cn/20200617175249237.png)

STUN服务器是IP地址已知的服务器，客户端要通信之前，先去STUN服务器上面查询一下自己的外网IP和端口，然后再使用这个外网IP和端口进行通信。

但有时UDP包会被防火墙或者其他的应用程序所阻挡。这个时候就可以使用中继器技术Traversal Using Relays around NAT (TURN) 。

![](https://img-blog.csdnimg.cn/20200617175739225.png)

双方都将数据发送到中继器server，由中继器server来负责转发数据。注意，这里已经不是P2P了。

最后，我们有一个集大成者的协议叫做ICE（Interactive Connectivity Establishment ）：

![](https://img-blog.csdnimg.cn/20200617180143971.png)

它实际上就是直连，STUN和TURN的综合体，能直连的时候就直连，不能直连就用STUN，不能用STUN就用TURN。

# 总结

本文介绍了IP，TCP和UDP等协议和需要注意的一些事项，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
























