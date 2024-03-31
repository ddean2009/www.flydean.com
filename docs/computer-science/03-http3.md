---
slug: /03-http3
---

# 3. 是的你没看错,HTTP3来了

[toc]

# 简介

很多小伙伴可能还沉浸在HTTP1.1的世界无法自拔，但是时代的洪流已经带领我们来到了HTTP3的世界了。是的，你在桥上看风景，而桥边的房子上有人正在看你。

为了不被时代所抛弃，今天给大家讲解一下HTTP3的新特性。

# HTTP成长介绍

HTTP的全名叫做超文本传输​​协议，是万维网所基于的应用层传输协议。最初的版本是HTTP 0.9，是在80年的后期产生的，后面在1996年升级到了1.0.

但是HTTP1.0满足不了日益增长的物质文化需求和对美好世界的向往。所以在1997年出现了HTTP1.1，随后到2014年，HTTP1.1都一直都在更新。

然后到了2015年，为了适应快速发送的web应用和现代浏览器的需求，在Google的SPDY项目基础上发展出了新的HTTP2协议。

又过了4年，在2019年，Google又开发出了一个新的协议标准QUIC协议，它就是HTTP3的基石，其目的是为了提高用户与网站和API交互的速度和安全性。 

# 不同HTTP协议解决的问题

不同HTTP协议解决的问题也是不同的，HTTP1.1有什么问题呢？

1. 因为HTTP1.1一个连接中数据是顺序传输的，所以会有Head-of-line Blocking的问题，如果前面是一个大的数据包，则会导致后续数据包的阻塞。

2. HTTP1.1无法对请求头和cookie进行压缩，所以传输效率会比较低。

3. 为了保证缓冲区不会溢出，HTTP1.1有一个TCP慢启动的功能，作为拥塞控制措施，协议反复探测网络以计算可用容量，但是这样就会导致多次数据的传输，从而导致消息的延时。

对于HTTP2来说，它使用二进制进行消息传输，并且将消息拆分成一个个的stream，在stream中又包含了多个frame，允许资源通过多路复用使用同一个连接发送，解决了行头阻塞的问题，并且还支持数据包的优先级和服务器推送。

但是HTTP2的服务器推送会导致应用程序变得复杂，TCP级别的头阻塞的问题在数据包丢失并且必须重新以正确的顺序重新发送时，仍然可能发生。 

要注意，HTTP/2是HTTP/1.1的扩展，而不是它的替代品。 应用程序语义保持不变，具有相同的HTTP方法、状态代码、URI和标头字段。 所以HTTP/2可以被用在任何使用HTTP/1.1的地方。

HTTP/2在客户端和服务器之间使用单个TCP连接，该连接在交互期间保持打开状态。 

虽然HTTP/2支持并发，但是过多的并发会导致HTTP/2服务器接收到大批量的请求，从而导致请求超时。

# HTTP3和QUIC

HTTP/3的目标是通过解决HTTP/2的传输相关问题，在所有形式的设备上提供快速、可靠和安全的Web连接。为此，它使用了一种不同的传输层网络协议，称为QUIC，该协议最初由Google开发的。

> 感慨一下，虽然最近中国在系统的应用方面有了一定的进步，但是看看这些底层的协议，还都是外国人搞出来的。

HTTP/2和HTTP/3的根本区别在于，HTTP/2底层使用的是TCP协议，而HTTP/3使用的是QUIC，而QUIC的底层使用的是UDP协议。

我们看一下HTTP/2和HTTP/3的协议栈对比：

![](https://img-blog.csdnimg.cn/aaf161ba321b4dafb173ec42b3765d8f.png)

TCP协议主要保证服务的可靠性和有序交付，但是TCP需要同握手来建立连接，这样做是为了确保客户端和服务器都存在并且他们愿意并且能够交换数据。但是，它也需要一个完整的网络往返才能完成，然后才能在连接上完成任何其他操作。 如果客户端和服务器端相距比较远，那么就需要花费较多的时间来进行连接。

我们知道UDP是无连接的，所以它要比TCP简单很多。它不需要TCP这种建立多次连接的步骤，只需要发送数据包出去就够了。

所以使用QUIC的优点就在于减少了系统的延时，适用于可以容忍一些数据丢包的情况，比如在线游戏、广告竞价、在线视频、实时流等地方。

另外因为UDP支持广播，所以HTTP3还适用于广播应用中，如精确时间协议和路由信息协议等。

另外HTTP3还可以用在物联网、大数据和VR等方面。

既然HTTP3使用的是QUIC协议，那么QUIC到底是什么呢？

通常来说QUIC是一种通用传输协议，与TCP非常相似。为什么要打造一套新的协议呢？这是因为现有的TCP协议扩展起来非常困难，因为已经有太多太多的设备使用了各种不同的TCP协议的版本，如果想直接在现有的TCP协议上进行扩展非常困难，因为需要给这么多台设备进行升级几乎是不可能完成的任务。

所以QUIC在选择在UDP协议之上进行构建。QUIC使用UDP，主要是因为希望能让HTTP/3更容易部署，因为它已经被互联网上的所有设备所知并已实现. 

QUIC实际上就是在UDP基础上重写了TCP的功能，但是又比TCP更加智能，更高效的实现了TCP的核心功能。

接下来我们看下QUIC具体有哪些特征。

## TLS1.3

TLS主要用来保证客户端和服务器端在数据传输过程的数据安全性，可以对明文数据进行加密传输。TLS1.3是TLS协议的最新版本，在旧的版本如TLS1.2中，客户端和服务器端的握手至少需要两次网络往返，但是在TLS1.3中，将其减少到只有一次往返。

虽然在HTTP/2中是支持无加密传输模式，但是默认情况下所有的现代浏览器都不支持这种模式，所以HTTP/2必须配合HTTPS一起使用。长远看来HTTPS肯定是未来的趋势，所以在QUIC中，直接就使用了TLS 1.3协议。QUIC本身就封装了TLS1.3。

这样做的好处就是QUIC没办法运行明文，所以更加的安全。并且QUIC内置了加密协议，将传输和加密握手合二为一，节省了往返。

因为QUIC是全程加密的，所以对于某些ISP和中间网络来说，无法再对网络数据进行分析和统计，所以可能会限制它的使用。并且因为QUIC是单独对每个数据包进行加密的，在高并发的情况下，可能会造成性能问题。

## 解决HoL阻塞

传统的HTTP1.1和HTTP2底层协议是TCP，虽然HTTP2在应用层可以将不同文件的数据拆分成一个个的stream放在同一个连接中进行传输。但是对于TCP本身来说，它并不知道这些stream属于不同的文件，它会将其当成同一个文件。所以如果发送数据丢包的情况，TCP会重新发送所有的文件包。从而导致HOL阻塞的问题。

而QUIC更加细粒度一点，它可以在每个流的基础上执行丢包检测和恢复逻辑。从而只会重发失败的流，而不是整个文件。

## 连接的迁移

在TCP中，如果我想要建立客户端和服务器端的连接，需要知道这4个元素：客户端IP地址 + 客户端端口 + 服务器IP地址 + 服务器端口。

如果这4个元素中有一个发送了变化，则需要重新建立TCP连接。并且需要根据应用程序级协议，重新启动进程中的操作。

比如你正在下载一个大的文件，但是网络地址突然发生了变化，则可能需要重新请求该文件。

为了解决这个问题，QUIC引入了一个名为连接标识符(CID)的概念 。 每个连接都在上述4个元素中额外分配一个编号，用于标记客户端和服务器端的唯一连接。

因为这个CID是由QUIC定义的，所以不会随着网络迁移的变化而变化。从而不需要新的握手，这种情况被称为连接迁移 。

# 总结

好了，今天的HTTP/3和QUIC就介绍到这里，虽然我们没有涉及到底层的更多细节，但是相信大家应该都听得明白了，再总结一下，QUIC实际上行就是在UDP协议之上，再造了一个更加高级有效的TCP协议。
















