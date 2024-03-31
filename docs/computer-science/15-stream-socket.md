---
slug: /15-stream-socket
---

# 15. 网络协议之:socket协议详解之Socket和Stream Socket

[toc]

# 简介

不管是在普通的网络编程中还是在netty中，都经常会提到一个词叫做socket，好像socket是一个神奇的东西，使用socket我们可以建立客户端到服务器端的连接，并且和进行客户端和服务器端的通讯，那么socket到底是什么呢？它有哪些分类呢？一起来看看吧。

# Socket是什么

socket的中文翻译是套接字，个人觉的这个翻译真的是太差劲了，套接字听起来毫无意义，所以很多人在第一次听到socket这个词的时候肯定很迷茫。

那么什么是socket呢？socket是一种不同程序间进行进程通讯的方法，这些程序可以在同一个服务器上也可以在不同的服务器上。

socket建立连接的基础是IP协议，IP协议被用来进行数据的封装和分组，然后才能够在网络上进行传输。这种依赖于IP协议的socket，又叫做network socket。

通过network socket可以建立客户端和服务器端的连接，客户端和服务器端是通过socket address来发现对方的。

以java为例，我们来看下SocketAddress的定义：

```
public abstract class SocketAddress implements java.io.Serializable {

    static final long serialVersionUID = 5215720748342549866L;

}
```

可以看到SocketAddress只是一个笼统的定义，它可以有多种实现，它具体的实现中包含了传输协议，比如说是TCP，还是UDP，另外还需要包含一个IP地址和一个连接的端口。

其中IP地址和端口定义了连接的对象，协议定义的是连接方式。

基于不同的协议，可以衍生出不同的类型的sockets。比如依赖于TCP协议的叫做Stream sockets,依赖于UDP协议的叫做Datagram sockets,依赖于local files来进行数据传输的叫做Unix Domain Sockets.

接下来我们会在一个unix系统中详细讲解这几种协议的使用。

在讲解详细的例子之前，我们需要使用到关于网络的命令，他们是ss，nc和socat。

在本文中，我使用的是centOS系统，所以你可以使用下面的命令进行安装：

```
yum install iproute2 netcat-openbsd socat
```

# Stream Socket

什么是Stream Socket呢？从字面上可以看出，这个Socket连接是用来进行流传输的，如果要进行流的传输，那么首先就需要建立一个稳定的网络连接，在稳定的连接方面，毫无疑问TCP(Transmission Control Protocol)是最常用也是极其高效的一种协议。

对于Stream Socket来说，它是有向性的，数据package需要从一个地址通过网络传递到另外一个地址，同时还需要接受到对方的处理返回结果，在这个过程中通常使用的就是TCP协议。

TCP协议能够保证数据的稳定性和有序性，TCP的数据包可以保证发送到物理网络接口的数据包顺序。 如果网络接口接收到的数据包是无序的，那么网络适配器和操作系统将确保它们以正确的顺序重新组合以供应用程序使用。

常见的基于TCP的Stream Socket就是我们常常访问的http和https服务了，处理http和https服务的服务器一般是nginx或者apache,那么通常会有下面的Stream Socket地址：

```
124.225.141.53:80
124.225.141.53:443
```

上面我用的是网易的ip地址，其中80表示的是http，443表示的是https。

## 使用socat创建一个TCP服务器

常用的TCP服务器可以选择apache或者nginx，这里为了简单起见，我们选择使用socat来创建一个TCP服务器。

socat是什么呢？它是SOcket CAT的简称，可以用来模拟一个TCP的服务器。

socat的命令很复杂，这里我们只是简单介绍一下它的应用：

```
socat -h
socat by Gerhard Rieger and contributors - see www.dest-unreach.org
Usage:
socat [options] <bi-address> <bi-address>
```

从上面的结果我们可以看出，socat可以接受一些地址，然后可以添加一些选项。

这里我们使用socat来创建两个连接，分别是TCP6和TCP4,socat有两个选项可以做这项工作：

```
      tcp-connect:<host>:<port> groups=FD,SOCKET,CHILD,RETRY,IP4,IP6,TCP
      tcp-listen:<port> groups=FD,SOCKET,LISTEN,CHILD,RETRY,RANGE,IP4,IP6,TCP
      tcp4-connect:<host>:<port>        groups=FD,SOCKET,CHILD,RETRY,IP4,TCP
      tcp4-listen:<port>        groups=FD,SOCKET,LISTEN,CHILD,RETRY,RANGE,IP4,TCP
      tcp6-connect:<host>:<port>        groups=FD,SOCKET,CHILD,RETRY,IP6,TCP
      tcp6-listen:<port>        groups=FD,SOCKET,LISTEN,CHILD,RETRY,RANGE,IP6,TCP
```

这里我们只需要建立两个监听TCP的服务，所以我们使用下面的命令：

```
socat TCP4-LISTEN:8888,fork /dev/null&
socat TCP6-LISTEN:8888,ipv6only=1,fork /dev/null&
```

上面的命令，我们在8888端口上监听TCP4和TCP6的连接信息，其中fork参数表示程序在接收到程序包之后继续运行，如果不用fork，那么程序会自动退出。

socat后面本来要接一个bi-address，这里我们使用/dev/null，表示丢弃掉所有的income信息。

TCP6-LISTEN有个特殊的参数叫做ipv6only，表示收到的数据包不要发送到IPv4-mapped IPv6 addresses。

什么是IPv4-mapped IPv6 addresses？ 简单点说就是将IPv4映射到了IPv6的地址中。

执行上述命令，我们会得到下面的输出：

```
[1] 30877
[2] 30885
```

因为是后台执行，所以我们返回了进程的ID。

## 使用ss检查TCP连接

ss是一个非常强大的命令，我们可以通过使用ss来监测TCP sockets的信息，它的使用情况如下：

```
ss -h
Usage: ss [ OPTIONS ]
       ss [ OPTIONS ] [ FILTER ]
```

我们主要看下面几个将要用到的参数：

```
   -4, --ipv4          display only IP version 4 sockets
   -6, --ipv6          display only IP version 6 sockets
   -t, --tcp           display only TCP sockets
   -l, --listening     display listening sockets
  -n, --numeric       don't resolve service names
```

因为我们只监听ipv4和ipv6的数据，所以这里我们用-4和-6这两个参数。

另外因为只需要监听tcp sockets，所以需要使用-t参数。

因为是监听，所以使用-l参数，最后我们希望看到具体的数字，而不是被解析成了服务名，所以这里使用-n参数。

我们使用下面的命令看看结果：

```
ss -4 -tln
```

结果如下：

```
State       Recv-Q Send-Q                      Local Address:Port                                     Peer Address:Port              

LISTEN      0      5                                       *:8888                                                *:*  
```

表示监听到了端口8888， 当然如果你的服务器上有其他的进程，那么可能不止这一条数据。

上面的命令只监听了Ipv4，我们再看看Ipv6：

```
ss -6 -tln
```

可能得到下面的输出：

```
ss -6 -tln
State       Recv-Q Send-Q                      Local Address:Port                                     Peer Address:Port              

LISTEN      0      5                                      :::8888                                               :::* 
```

和Ipv4的很类似，表示我们在Ipv6上监听到了端口8888。

## 使用nc连接socket

我们已经建立好了了监听TCP连接的服务器，接下来我们尝试使用nc命令来进行连接。

nc是Ncat的简称，它是一个非常有用的网络工具，可以做很多事情。我们来看下本例子中会用到的参数：

```
  -4                         Use IPv4 only
  -6                         Use IPv6 only
  -v, --verbose              Set verbosity level (can be used several times)
  -z                         Zero-I/O mode, report connection status only
```

因为需要连接到Ipv4和Ipv6，所以需要-4和-6参数。

另外我们需要输出详细的信息，所以需要-v参数，最后我们直接建立连接，并不发送任何数据，所以这里使用-z参数，我们执行一下来看看效果：

```
nc -4 -vz 127.0.0.1 8888
```

看看下面的输出结果：

```
nc -4 -vz 127.0.0.1 8888
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to 127.0.0.1:8888.
Ncat: 0 bytes sent, 0 bytes received in 0.01 seconds.
```

可以看到nc已经成功建立了连接，并且发送了0 bytes的内容。

同样的，我们建立到Ipv6的连接：

```
nc -6 -vz ::1 8888
```

这里的 ::1表示的是Ipv6的本地地址。输出结果如下：

```
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to ::1:8888.
Ncat: 0 bytes sent, 0 bytes received in 0.01 seconds.
```

# 总结

到此，我们介绍了Socket的基本分类Stream Socket的含义，并且使用unix中的工具搭建了socket服务器和客户端，当然这只是最简单的说明描述,大家用来体会Stream Socket的流程即可。





























