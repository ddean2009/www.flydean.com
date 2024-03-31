---
slug: /22-sctp-package-in-detail
---

# 22. 网络协议之:sctp流控制传输协议的协议消息包详解

[toc]

# 简介

之前我们讲到了SCTP流控制传输协议位于七层网络协议的传输层，和TCP、UDP同级。SCTP是以消息为导向的，所有的SCTP消息包都是为这个目标服务的。

具体而言，每个SCTP packet都有一个12bytes的package头和接下来的N个data chunks，如下所示：

![](https://img-blog.csdnimg.cn/192ac8b9bc5d4a2c99283b1a2d8d5de6.png)

本文将会深入带领大家了解SCTP packet中各个部分的含义和分类。

# packet头

所有的SCTP packet都需要这个packet头。所以这个packet头也叫做Common header。

从上面的图中可以看到，common header有4个部分组成，分别是源端口号，目标端口号，验证tag，和校验位Checksum。

源和目标的端口号都很好理解了。

这里的验证tag其实一个唯一标记，它是一个32bits的随机值，通常在建立连接的时候创建，用来区分之前的packet。

checksum是一个校验位，SCTP中最开始使用的算法是Adler-32，但是在RFC 3309中，这个算法被修改为CRC32c。

# Chunks

packet后面跟着就是Chunks，一个chunk表示一个数据块，每个chunk都有共同的结构，分别是Chunk type,Chunk flags,Chunk length和Chunk data组成。

其中Chunk type是由IETF定义的8 bits的值。Chunk flags也是8 bits，它的值是和chunk type相关联的。

Chunk length是一个16bits的无符号整数，表示整个chunk的长度信息。

Chunk data是真实的chunk数据，它跟Chunk type也是相关联的。

另外，Chunk length一定是4 bytes的倍数，如果不足的话，chunk需要用0补齐。

Chunk Data虽然从名字上看是data，但是根据chunk type的不同，chunk data里面还可以包含参数信息，这里的参数有两种类型，分别是固定参数和可选参数。

参数的结构如下所示：

![](https://img-blog.csdnimg.cn/557a1dc1250c46c79b23c7680148ce5d.png)

SCTP中chunk的类型是由RFC 2960定义的。 因为Chunk type占8个bits，可以表示0-255总共256个值。下面是RFC 2960中的定义：

   ID值   | Chunk类型
   -----      |----------
   0          | Payload Data (DATA)
   1          | Initiation (INIT)
   2          | Initiation Acknowledgement (INIT ACK)
   3          | Selective Acknowledgement (SACK)
   4          | Heartbeat Request (HEARTBEAT)
   5          | Heartbeat Acknowledgement (HEARTBEAT ACK)
   6          | Abort (ABORT)
   7          | Shutdown (SHUTDOWN)
   8          | Shutdown Acknowledgement (SHUTDOWN ACK)
   9          | Operation Error (ERROR)
   10         | State Cookie (COOKIE ECHO)
   11         | Cookie Acknowledgement (COOKIE ACK)
   12         | Reserved for Explicit Congestion Notification Echo (ECNE)
   13         | Reserved for Congestion Window Reduced (CWR)
   14         | Shutdown Complete (SHUTDOWN COMPLETE)
   15 to 62   | available
   63         | reserved for IETF-defined Chunk Extensions
   64 to 126  | available
   127        | reserved for IETF-defined Chunk Extensions
   128 to 190 | available
   191        | reserved for IETF-defined Chunk Extensions
   192 to 254 | available
   255        | reserved for IETF-defined Chunk Extensions

因为数据类型比较多，接下来我们挑选一些比较有代表性的chunk类型进行讲解。

## DATA chunk

DATA chunk应该是最为常用的chunk类型，它表示的是payload数据。

先来看下DATA chunk的数据结构：

![](https://img-blog.csdnimg.cn/eeec40e735d24279bf345a5d9b6261e5.png)

对于DATA chunk来说，它的chunk type=0。

它的chunk flags有下面4个值：

I — 表示应该立刻返回SACK chunk。
U - 如果设置，表示这个数据是无序的，那么后面的流序列号是无效的。
B - 如果设置，表示的是beginning fragment。
E - 如果设置，表示的是end fragment。

TSN的全称是Transmission sequence number，是一个序列编号。当一个data数据特别大的时候，会将一个data拆分成为多个fragment,这些fragment是有一定顺序的，接收数据方可以按照sequence number将数据再进行组装起来。

Stream identifier表示的是这个DATA chunk所属的stream ID。 

Stream sequence number表示的是这个消息在Stream中的sequence number。如果一个消息是被拆分成了多个fragment,那么这些fragment中的Stream sequence number是一样的。

Payload protocol identifier是特定于应用程序的协议标识符。这个标识符对于SCTP并没有用。 但是，使用协议的节点或者设备有可能会使用它。0表示未指定有效的协议标识。

最后就是真正的数据了。

当chunk flags设置为I的时候，表示是需要立即返回SACK chunk。那么什么是SACK chunk呢？

## SACK chunk

SACK的全称是selective acknowledgment,也就是选择性确认消息。

先看下SACK chunk数据包的定义：

![](https://img-blog.csdnimg.cn/e2237a274f844119958b870ed78c884e.png)

对于SACK来说,chunk type的值=3, 这个类型并没有Chunk flags,所以是空的。

Cumulative TSN ACK: 这个标记是和DATA chunk中的TSN相对应的。表示的是目前为止ack过的sequence numbers。如果DATA chunk中的sequence number大于这个值，则表示这个DATA chunk还没有被ack过。

为什么叫做Cumulative呢？这是因为SACK可以ack多个DATA chunk。

因为SACK可以ack多个TSN,不同的TSN可能ack了不同的位置，所以对于每个ack的TSN来说，都有一个Ack的start block和end block，也就是上面的Gap ACK block #N start和Gap ACK block #N end。

最后，SACK可能接收多个TSN,所以这里有个重复TSN的概念，这里叫做Duplicate TSN #X。

上面讲了DATA chunk和与他相对应的SACK chunk。

接下来我们讲一下初始化的INIT chunk和与他对应的INIT ACK chunk。

## INIT chunk

INIT chunk是初始化请求的chunk,它的chunk type=1，我来看下他的具体格式定义：

![](https://img-blog.csdnimg.cn/fab5681ae60f4767933a3760afa8d4c2.png)

这里我们主要看下INIT中的参数类型，以下是INIT chunk中的参数类型：

Parameter type = 5: 发送端所有的IPv4地址。

Parameter type = 6: 发送端所有的IPv6地址。

Parameter type = 9: 这是一个生命周期增量，接收者需要将它添加到默认cookie的生命周期中（以毫秒为单位）。

Parameter type = 11: 这个参数是在RFC 1123中定义的主机名。这个主机名并不是在SCTP中进行解析的。

Parameter type = 12: 这个参数列出了发送端支持的地址类型，比如(IPv4 = 5, IPv6 = 6, hostname = 11)

Parameter type = 32768: 这是一个保留的参数，后续使用。

## INIT ACK chunk

INIT ACK chunk是对INIT ACK的回复，INIT ACK chunk比较简单，它的chunk type=2，并且只包含一个必须的参数:

Parameter type = 7 : 它的值是一个cookie,里面包含了重新创建传输控制块的最少信息，并使用发送者的私钥进行签名。

## ERROR chunk

ERROR chunk非常重要，它表示的是请求异常信息。先来看下ERROR chunk的定义：

![](https://img-blog.csdnimg.cn/759e4e76df7a4b30b8cfeca056e4b83e.png)

ERROR chunk支持很多个参数类型，不同的参数类型代表不同的错误。我们看下都有那些错误类型：

Parameter type = 1: 这参数表示发送者收到了不合法的stream-identifier。

Parameter type = 2: 这个参数表示发送者收到了一个缺失必要参数的INIT或者 INIT ACK。

Parameter type = 3: 表示收到一个有效的cookie，但是这个cookie已经过期了。

Parameter type = 4: 表示发送者的资源不足，通常和ABORT chunk一起使用。

Parameter type = 5: 表示发送者不能解析地址信息，通常是因为收到了不支持的address type, 一般和ABORT chunk一起使用。

Parameter type = 6: 表示收到了一个未知的chunk。

Parameter type = 7: 表示一个INIT 或者 INIT ACK中的必须参数中收到了非法值。

Parameter type = 8: 表示收到非法参数。

Parameter type = 9: 表示DATA chunk中不包含任何用户数据，通常和ABORT chunk一起使用。

Parameter type = 10: 表示发送者收到了COOKIE ECHO。

# 总结

以上我们只是介绍了SCTP中常用的packet的格式，当然SCTP中packet的格式远不止这些，如果大家在实际使用中用到了，可以查阅具体的资料。

