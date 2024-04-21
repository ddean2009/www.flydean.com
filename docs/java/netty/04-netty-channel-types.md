---
slug: /04-5-netty-channel-types
---

# 7. netty系列之:netty中各不同种类的channel详解



# 简介

channel是连接客户端和服务器端的桥梁，在netty中我们最常用的就是NIO，一般和NioEventLoopGroup配套使用的就是NioServerSocketChannel和NioSocketChannel，如果是UDP协议，那么配套使用的就是NioDatagramChannel，如果是别的协议还有其他不同的Channel类型。

这些不同channel类型有什么区别呢？一个直观的感觉就是不同的channel和channel连接使用的协议有关系，不同的channel可能适配了不同的连接协议。

事实到底是不是如此呢？在netty的内部实现中到底有多少种channel呢？今天一起来探讨一下。

# ServerChannel和它的类型

虽然ServerChannel继承自Channel，但是ServerChannel本身并没有添加任何新的方法：

```
public interface ServerChannel extends Channel {

}
```

所以对ServerChannel和Channel来说都可以看做是Channel，他们只是语义上有区别。

但是因为ServerChannel继承自Channel，所以相对的ServerChannel的分类和实现要比Channel要少。所以我们先以ServerChannel为例进行讲解。

ServerChannel的实现也有很多，我们以Abstract*开头的实现为例，下面是他们的继承关系：

<img src="https://img-blog.csdnimg.cn/9613bc4cb9314dc2903a938f80340b47.png" style="zoom:67%;" />

从上图我们可以看出，ServerChannel有六个抽象类实现，分别是AbstractEpollServerChannel,AbstractKQueueServerChannel,AbstractServerChannel,ServerSocketChannel,SctpServerChannel和ServerDomainSocketChannel。

其中前面三个抽象类同时继承自AbstractChannel。

## Epoll和Kqueue

Epoll和Kqueue是两个独特的依赖于特定平台的NIO协议，其中epoll只在linux平台才支持,而kQueue则在FreeBSD、NetBSD、OpenBSD、macOS 等操作系统支持。

我们来看下AbstractEpollServerChannel的构造函数：

```
    protected AbstractEpollServerChannel(int fd) {
        this(new LinuxSocket(fd), false);
    }

    AbstractEpollServerChannel(LinuxSocket fd) {
        this(fd, isSoErrorZero(fd));
    }

    AbstractEpollServerChannel(LinuxSocket fd, boolean active) {
        super(null, fd, active);
    }
```

所有的构造函数都需要一个LinuxSocket的参数，LinuxSocket是一个socket用来提供对于linux native方法的访问支持。

同样的，我们再看一下AbstractKQueueServerChannel的构造函数：

```
    AbstractKQueueServerChannel(BsdSocket fd) {
        this(fd, isSoErrorZero(fd));
    }

    AbstractKQueueServerChannel(BsdSocket fd, boolean active) {
        super(null, fd, active);
    }
```

AbstractKQueueServerChannel的构造函数需要传入一个BsdSocket参数，BsdSocket是一个类用来提供对BSD系统的本地方法的访问。

## AbstractServerChannel

AbstractServerChannel我们在之前的channel一章中已经讲过了，它的唯一实现就是LocalServerChannel，用于本地的transport。

## ServerSocketChannel

ServerSocketChannel是一个以Socket连接为基础的ServerChannel，既然是Socket连接，那么ServerSocketChannel中提供了一个InetSocketAddress类型的localAddress和一个remoteAddress, 另外还有一个ServerSocketChannelConfig属性，用来存储ServerSocketChannel相关的配置信息：

```
public interface ServerSocketChannel extends ServerChannel {
    @Override
    ServerSocketChannelConfig config();
    @Override
    InetSocketAddress localAddress();
    @Override
    InetSocketAddress remoteAddress();
}
```

## ServerDomainSocketChannel

ServerDomainSocketChannel是使用DomainSocket来进行通讯的ServerChannel。什么是DomainSocket呢？

DomainSocket的全称是unix domain socket，它又可以叫做IPC socket,也就是inter-process communication socket，是在unix平台上的同一服务器上的进程通信方式。

我们知道，协议是比较复杂的，对于传统的socket通讯来说,需要定制特定的协议，然后进行封包和解包等操作，但是使用DomainSocket，可以直接将进程的数据直接拷贝，从而节约了时间，并提高了程序的效率。

DomainSocket的地址是一个文件的路径，实际上是下面的一个结构体：

```
struct sockaddr_un {
    sa_family_t     sun_family;     /* AF_UNIX ，2字节*/
    char    sun_path[UNIX_PATH_MAX];        /* 路径名 */
};
```

在ServerDomainSocketChannel中的remoteAddress和localAddress的类型都是DomainSocketAddress,DomainSocketAddress有一个socketPath属性，用来存储DomainSocket文件的路径。

## SctpServerChannel

最后一个要讲解的ServerChannel是SctpServerChannel，Sctp的全称是Stream Control Transmission Protocol，他是一种类似于TCP/IP的协议。和SocketServerChannel一样，SctpServerChannel中也有一个config叫做SctpServerChannelConfig，还提供了多个bindAddress方法用来绑定InetAddress.

有关Sctp协议的具体内容，本章不深入讨论，感兴趣的朋友可以关注后续的章节。

# Channel和它的类型

Channel作为ServerChannel的父类，又有哪些实现呢？

先来看下常用channel的实现类：

<img src="https://img-blog.csdnimg.cn/69d7d0d53df847e2b5eb7791da956ef1.png" style="zoom:67%;" />

看起来channel的实现类非常多，基本上都是按照channel中使用传输协议的类型来的。

我们具体来看一下相应的实现类。

## UnixChannel

UnixChannel表示的unix平台上的操作，它有一个fd方法，返回一个FileDescriptor:

```
FileDescriptor fd();
```

这也是unix和windows平台的区别之一，unix平台所有的一切都可以用文件来表示。

## SctpChannel

在上面我讲SctpServerChannel的时候我们提过了，Sctp是一个类似于tcp/ip的协议，SctpChannel中定义了协议中需要使用到的localAddress和remoteAddress:

```
InetSocketAddress localAddress();

InetSocketAddress remoteAddress();
```

同时还定义了一些绑定方法：

```
    ChannelFuture bindAddress(InetAddress var1);

    ChannelFuture bindAddress(InetAddress var1, ChannelPromise var2);

    ChannelFuture unbindAddress(InetAddress var1);

    ChannelFuture unbindAddress(InetAddress var1, ChannelPromise var2);

```

## DatagramChannel

DatagramChannel用来处理UDP协议的连接，因为UDP有广播的功能，所以DatagramChannel中提供了joinGroup的方法，来join一个multicast group:

```
ChannelFuture joinGroup(InetAddress multicastAddress);
```

当然，可以join就可以leave，还有一些leaveGroup的方法：

```
ChannelFuture leaveGroup(InetAddress multicastAddress);
```

还可以block某些地址在给定的networkInterface上的广播：

```
ChannelFuture block(
            InetAddress multicastAddress, NetworkInterface networkInterface,
            InetAddress sourceToBlock);
```

这些方法都和UDP的特性是息息相关的。

## DomainDatagramChannel

DomainDatagramChannel和之前提到的ServerDomainSocketChannel一样，都是使用的IPC内部进程通讯技术，直接进行进程的拷贝，免去了协议解析等步骤，提升了处理速度。

## DuplexChannel

DuplexChannel从名字看就是一个双向的channel，duplex Channel有一个特点，就是channel的两边可以独立的关闭，所以有下面的方法：

```
boolean isInputShutdown();

ChannelFuture shutdownInput();

boolean isOutputShutdown();

ChannelFuture shutdownOutput();
```

DuplexChannel的是实现有很多种，比如常见的NIOSocketChannel，KQueueSocketChannel,EpollSocketChannel等。

## AbstractChannel

另外一个channel的非常重要的子类就是AbstractChannel，AbstractChannel有三个非常重要的实现，分别是AbstractNioChannel,AbstractKQueueChannel和AbstractEpollChannel。

这三个类使用的都是NIO技术，不同的是第一个使用的是select，后面两个使用的是平台独有的KQueue和Epoll技术。

其中NIO又可以分为NioByteChannel和NioMessageChannel,KQueue和Epoll又可以分为StreamChannel和DatagramChannel。

# 总结

以上就是channel在netty中的基本实现和分类。后面我们会详解讲解具体的channel到底是如何实现的。








