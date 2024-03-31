网络协议之:socket协议详解之Datagram Socket

[toc]

# 简介

上一篇文章我们讲解了Socket的分类和最常用到的Stream Socket，Stream Socket一般是基于TCP协议的，所以我们经常在web服务中能够看到他们的身影。当然TCP协议有个孪生兄弟叫做UDP，那么基于UDP来做传输协议的socket协议就叫做Datagram Socket，今天我们一起来详细了解一下Datagram Socket。

# 什么是Datagram Socket

和有连接的Stream Socket不同，Datagram Socket是无连接的。有连接的Stream Socket表明这个socket是稳定可靠的，所以我们可以在Stream socket中进行稳定的数据传输，当然这个稳定是说数据包不会丢失，但是并不一定能够确保数据包不被篡改。

Datagram Socket这种无连接的通常被用在容许数据部分丢失的场景，比如语音、视频等等，无连接的好处就是不需要TCP那样复杂的建立连接的步骤，所以相对而言更加简单。

Datagram Socket通常使用的就是UDP协议作为底层的数据传输协议。

对于UDP来说，因为UDP协议本身并不会保证数据的顺序和数据异常的处理，这些都需要在应用程序中自己实现。

常见的UDP应用有DNS(Domain Name System)服务，NTP(Network Time Protocol)服务等等。

在JDK的java.net包中提供了对Datagram Socket的封装,在其中定义了三个连接的状态：

```
class DatagramSocket implements java.io.Closeable {
    ...
    static final int ST_NOT_CONNECTED = 0;
    static final int ST_CONNECTED = 1;
    static final int ST_CONNECTED_NO_IMPL = 2;
    ...
}

```

分别表示没有建立连接，建立了连接和建立了连接，但是还没有到实现的level。

另外，在DatagramSocket中还包含了一个连接的地址和端口：

```
InetAddress connectedAddress = null;
int connectedPort = -1;
```

# 使用socat来创建UDP服务

> 注意，在使用后续的命令之前，需要在unix环境中执行安装命令：yum install iproute2 netcat-openbsd socat

和之前的Stream Socket一样，我们也可以使用socat命令，来建立一个UDP服务器，我们需要用到socat的下面几个参数：

```
      udp4-listen:<port>        groups=FD,SOCKET,LISTEN,CHILD,RANGE,IP4,UDP
      udp6-listen:<port>        groups=FD,SOCKET,LISTEN,CHILD,RANGE,IP6,UDP
```

我们需要监听udp4和udp6的数据，所以这里使用 udp4-listen和udp6-listen两个参数。

后面的端口号可以自定义，这里我们还是使用同样的8888端口，对应的命令如下：

```
socat UDP4-LISTEN:8888,fork /dev/null&
socat UDP6-LISTEN:8888,ipv6only=1,fork /dev/null&
```

上面的命令，我们在8888端口上监听UDP4和UDP6的连接信息，其中fork参数表示程序在接收到程序包之后继续运行，如果不用fork，那么程序会自动退出。

socat后面本来要接一个bi-address，这里我们使用/dev/null，表示丢弃掉所有的income信息。

UDP6-LISTEN有个特殊的参数叫做ipv6only，表示收到的数据包不要发送到IPv4-mapped IPv6 addresses。

什么是IPv4-mapped IPv6 addresses？ 简单点说就是将IPv4映射到了IPv6的地址中。

执行上述命令，我们会得到下面的输出：

```
[1] 16174
[2] 16184
```

因为是后台执行，所以我们返回了进程的ID。

# 使用ss命令来监控Datagram Sockets

ss命令可以用来检查socket的状态，这里我们需要用到ss的这样几个参数：

```
   -4, --ipv4          display only IP version 4 sockets
   -6, --ipv6          display only IP version 6 sockets
   -u, --udp           display only UDP sockets
   -l, --listening     display listening sockets
   -n, --numeric       don't resolve service names
```

因为我们只监听ipv4和ipv6的数据，所以这里我们用-4和-6这两个参数。

另外因为只需要监听udp sockets，所以需要使用-u参数。

因为是监听，所以使用-l参数，最后我们希望看到具体的数字，而不是被解析成了服务名，所以这里使用-n参数。

我们使用下面的命令看看结果：

```
ss -4 -uln
```

可以得到下面的结果：

```
State       Recv-Q Send-Q                      Local Address:Port                                     Peer Address:Port              
UNCONN      0      0                                       *:8888                                                *:*  
```

上面的命令只监听了Ipv4，我们再看看Ipv6：

```
ss -6 -uln
```

可以得到下面的结果：

```
State       Recv-Q Send-Q                      Local Address:Port                                     Peer Address:Port              
UNCONN      0      0                                      :::8888                                               :::*  
```

和Ipv4的很类似，表示我们在Ipv6上监听到了端口8888。

# 使用nc建立和UDP Socket的连接

我们已经建立好了了监听UDP连接的服务器，接下来我们尝试使用nc命令来进行连接。

nc是Ncat的简称，是一个非常小并且高效的网络工具。我们来看下本例子中会用到的参数：

```
  -4                         Use IPv4 only
  -6                         Use IPv6 only
  -u, --udp                  Use UDP instead of default TCP
  -v, --verbose              Set verbosity level (can be used several times)
  -z                         Zero-I/O mode, report connection status only
```

因为需要连接到Ipv4和Ipv6，所以需要-4和-6参数。

默认情况下nc使用的是TCP协议，如果要使用udp则需要使用-u这个参数。

另外我们需要输出详细的信息，所以需要-v参数，最后我们直接建立连接，并不发送任何数据，所以这里使用-z参数，我们执行一下来看看效果：

```
nc -4 -u -vz 127.0.0.1 8888
```

看看下面的输出结果：

```
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to 127.0.0.1:8888.
Ncat: UDP packet sent successfully
Ncat: 1 bytes sent, 0 bytes received in 2.02 seconds.
```

表示UDP连接成功。

同样的，我们可以使用下面的命令来连接到UDP socket：

```
nc -6 -u -vz ::1 8888
```

其中::1表示的是本机的ipv6地址.

可以得到下面的结果：

```
Ncat: Version 7.50 ( https://nmap.org/ncat )
Ncat: Connected to ::1:8888.
Ncat: UDP packet sent successfully
Ncat: 1 bytes sent, 0 bytes received in 2.02 seconds.
```

表示UDP连接成功。

# 总结

本文讲解了datagram socket的基本概念，并且使用一些unix的基本命令来构建了udp服务器和客户端，方便大家理解。















