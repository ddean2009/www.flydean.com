---
slug: /17-unix-domain-socket
---

# 17. 网络协议之:socket协议详解之Unix domain Socket



# 简介

之前的文章我们讲到了Socket中的Stream Socket和Datagram Socket，这两种Socket通常分别是基于tcp和udp协议来进行数据的传输。这两种Socket都有一个共同的特点，那就是需要一个IP地址和端口来建立客户端和服务器端的连接。

那么今天我们会来讲解一个特殊的socket，这个socket不需要使用传统的IP地址和端口，而是使用文件系统来进行程序之间的数据交互，并且这样的socket只能使用在unix系统上。这样的socket就是今天我们要讲解的Unix domain Socket。

# 什么是Unix domain Socket

什么是Unix domain Socket呢？ 我们从名字就可以看出来，这个Socket是和unix domain有关系的，也就是说这个socket需要用到unix下面的一些特殊功能。

我们考虑下常用的windows系统和unix系统，他们最大的区别在哪里呢？

其实最大的区别就是unix操作系统中一切都可以看做是文件，包括程序运行的一些信息。

那么我们是不是可以直接借助于这些程序运行时产生的文件来进行不同程序之间数据的交互呢？答案是肯定的。这就是我们今天要讨论的Unix domain Socket。

Unix domain Socket可以简称为UDS，不同程序间的数据可以在操作系统层，借助于文件系统来进行数据交换。

对于程序本身来说，只需要读取和写入共享的socket文件即可，也就是说不同的程序之间通过socket文件来进行数据交互。

和基于IP和端口的Socket一样，Unix domain Socket也可以分为Stream Socket和Datagram Socket。

我们最多看到Unix domain socket的地方可能就是docker了，作为一种容器技术，docker需要和实体机进行快速的数据传输和信息交换，一般情况下UDS的文件是以.socket结尾的，我们可以在/var/run目录下面使用下面的命令来查找：

```
find . -name "*.sock"
```

如果你有docker在运行的话，可以得到下面的结果：

```
./docker.sock
./docker/libnetwork/6d66a24bfbbfa231a668da4f1ed543844a0514e4db3a1f7d8001a04a817b91fb.sock
./docker/libcontainerd/docker-containerd.sock
```

可以看到docker是通过上面的3个sock文件来进行通讯的。

# 使用socat来创建Unix Domain Sockets

之前提到了socat这个万能的工具，不仅可以创建tcp的监听服务器，还能创建udp的监听服务器，当然对于UDS来说也不在话下。我们来看下使用socat来创建UDS服务器所需要用到的参数：

```
      unix-listen:<filename>    groups=FD,SOCKET,NAMED,LISTEN,CHILD,RETRY,UNIX
      unix-recvfrom:<filename>  groups=FD,SOCKET,NAMED,CHILD,RETRY,UNIX
```

这里我们要使用到unix-listen和unix-recvfrom这两个参数，unix-listen表示的是创建stream-based UDS服务，而unix-recvfrom表示的是创建datagram-based UDS。

可以看到两个参数后面都需要传入一个文件名，表示UDS socket的地址。

我们可以这样使用：

```
socat unix-listen:/tmp/stream.sock,fork /dev/null&
socat unix-recvfrom:/tmp/datagram.sock,fork /dev/null&
```

这里我们使用/tmp/datagram.sock来表示这个socket信息。

其中fork参数表示程序在接收到程序包之后继续运行，如果不用fork，那么程序会自动退出。

socat后面本来要接一个bi-address，这里我们使用/dev/null，表示丢弃掉所有的income信息。

运行后我们可能得到下面的结果：

```
[1] 27442
[2] 27450
```

表示程序已经成功执行了，返回的是程序的pid。

# 使用ss命令来查看Unix domain Socket

在使用ss命令之前，我们先来看下使用socat生成的两个文件：

```
srwxrwxr-x   1 flydean flydean    0 Mar  2 21:58 stream.sock
srwxrwxr-x   1 flydean flydean    0 Mar  2 21:59 datagram.sock
```

可以看到这两个文件的权限，rwx大家都懂，分别是read，write和执行权限。那么最前面的s是什么呢？

最前面的一位表示的是文件类型，s表示的就是socket文件。

扩展一下，这个位置还可以有其他几种选项：p、d、l、s、c、b和-:

其中p表示命名管道文件，d表示目录文件，l表示符号连接文件，-表示普通文件，s表示socket文件，c表示字符设备文件，b表示块设备文件。

接下来我们使用ss命令来查看一下之前建立的UDS服务。

这里需要使用到下面几个参数：

```
   -n, --numeric       don't resolve service names
   -l, --listening     display listening sockets
   -x, --unix          display only Unix domain sockets
```

这里我们需要使用到上面3个选项，x表示的是显示UDS，因为是监听，所以使用-l参数，最后我们希望看到具体的数字，而不是被解析成了服务名，所以这里使用-n参数。

我们可以尝试执行一下下面的命令：

```
ss -xln
```

输出会很多，我们可以grep我们需要的socket如下所示：

```
ss -xln | grep tmp
u_str  LISTEN     0      5      /tmp/stream.sock 11881005              * 0                  
u_dgr  UNCONN     0      0      /tmp/datagram.sock 11882190              * 0  
```

u_str表示的是UDS stream socket，而u_dg表示的是UDS datagram socket。

我们可以使用stat命令来查看socket文件的具体信息：

```
stat /tmp/stream.sock /tmp/datagram.sock
  File: ‘/tmp/stream.sock’
  Size: 0               Blocks: 0          IO Block: 4096   socket
Device: fd02h/64770d    Inode: 134386049   Links: 1
Access: (0775/srwxrwxr-x)  Uid: ( 1002/    flydean)   Gid: ( 1002/    flydean)
Access: 2022-03-01 22:33:21.533000000 +0800
Modify: 2022-03-01 22:33:21.533000000 +0800
Change: 2022-03-01 22:33:21.533000000 +0800
 Birth: -
  File: ‘/tmp/datagram.sock’
  Size: 0               Blocks: 0          IO Block: 4096   socket
Device: fd02h/64770d    Inode: 134386050   Links: 1
Access: (0775/srwxrwxr-x)  Uid: ( 1002/    flydean)   Gid: ( 1002/    flydean)
Access: 2022-03-01 22:33:22.306000000 +0800
Modify: 2022-03-01 22:33:22.306000000 +0800
Change: 2022-03-01 22:33:22.306000000 +0800
 Birth: -
```

# 使用nc连接到Unix domain Socket服务

nc是一个非常强大的工具，除了可以进行TCP，UDP连接之外，还可以进行UDS的连接，我们需要使用到下面的参数：

```
  -U, --unixsock             Use Unix domain sockets only
  -u, --udp                  Use UDP instead of default TCP
  -z                         Zero-I/O mode, report connection status only
```

-U表示连接的是一个unixsocket。-u表示是一个UDP连接。

默认情况下nc使用的是TCP连接，所以不需要额外的参数。

另外我们直接建立连接，并不发送任何数据，所以这里使用-z参数。

先连接Stream UDS看看：

```
nc -U -z /tmp/stream.sock
```

如果没有输出任何异常数据，说明连接成功了。

然后再连接Datagram UDS看看：

```
nc -uU -z /tmp/datagram.sock
```

同样的，如果没有任何异常数据，说明Socket连接成功了。

# 总结

在本章我们详细介绍了Unix Domain Socket的含义，并且使用了unix中的一些工具实现了UDS的建立，检测和连接。基本上描述了UDS的使用情况。










