---
slug: /26-mqtt-protocol
---

# 26. 网络协议之:IoT消息的标准MQTT协议详解



# 简介

IoT表示的是物联网，虽然现在硬件有了极速的发展，但是在发展之初物联网还有很多限制，比如可运行的代码容量比较小，带宽比较小等。

MQTT就是一种可以运行在这种硬件条件下的一种轻量级的发布-订阅网络协议。

MQTT的全称是MQ Telemetry Transport的缩写，它是基于TCP/IP的一种消息传输协议。

MQTT最通用的版本是v3.1.1,大部分的设备都支持这个版本。它的最新版本是MQTT v5，不过v5目前的使用范围还比较窄。这里我们以最常用的v3.1.1为例来进行详细的讲解。

# MQTT的架构

因为MQTT是一种消息收听和广播的模式，所以在一个典型的MQTT环境中，是由一个message broker和多个客户端组成的。

这里的message broker实际上是一个消息服务器，它负责接受客户端发送过来的消息，并将其广播到接收消息的其他客户端。

MQTT中，消息是以topic的层次结构来组成的。当发布者有新的数据项要分发时，它会向连接的代理发送带有数据的控制消息。然后，代理服务器将信息分发给已订阅该主题的其他客户端。

使用topic的好处是发布者不需要关注订阅者的任何信息，比如订阅者的数量或地址等信息，同样的，订阅者也不需要配置任何关于发布者的数据。从而实现了数据解耦。

在topic模式下，多个客户端可以订阅同一个topic，单个客户端也可以订阅多个topic，从而实现了一对多和多对一的消息传输模式。

并且消息的通信模式是双向的，也就是客户端即可以接收消息，也可以发送消息。

在MQTT的架构中，所有的消息都是和topic相关的，但是如果当前的topic并没有订阅者的话，在消息服务器收到发送到该topic的消息之后会将该消息丢弃。

如果消息的发布者想要保存这个消息的话，这可以将消息设置为保留消息。设置保留消息很简单，就是在普通的MQTT消息上将retained flag设置为true。

如果有保留消息，那么当客户端开始订阅相应的主题之后，就会立刻接收这个保留消息。

另外在消息代理服务器中，每个主题只会保存一条保留消息。

为了提高可靠性，消息代理服务器可以不止一个，多个消息代理服务器可以根据当前订阅者的主题交换数据。

不管是常用的MQTTv3还是MQTTv5，他们都是基于TCP 协议进行数据传输。然而MQTT还有一个衍生协议MQTT-SN可以用UDP或蓝牙协议进行传输。

MQTT的消息本身并不包含任何安全或身份验证措施。但是可以将其和TLS加密进行结合，默认情况下未加密MQTT端口为1883。加密端口为8883。

下图是MQTT的一个基本架构：

![](https://img-blog.csdnimg.cn/4d31f5b3f9014e278b27af6d5422ad4c.png)

# MQTT传输协议

MQTT是一个二进制的传输协议，它的交互方式是command和command acknowledgement的格式。

每一个command都有和其对应的command acknowledgement。

一个典型的MQTT消息格式是这样的：

![](https://img-blog.csdnimg.cn/d214f875f9d845c0a488402998336213.png)

它包含了一个byte的控制头，1到4 byte的长度信息，0-n byte的可变头长度，0-m byte的payload信息。

因为可变头长度和payload信息是不一定存在的。而长度信息是1-4 byte，所以MQTT消息的最短长度就是1+1 bytes也就是2bytes。

这个2bytes也叫做MQTT消息的Fixed Header。

对于长度字段来说，因为它是1-4 bytes，所以可以表示的整体长度范围是1-256MB。

如果长度小于127 bytes，那么只需要一个byte来表示长度即可。

如果长度大于127 bytes小于16383 bytes，那么需要使用两个bytes来表示，以此类推。

## control header

MQTT中的control header是由一个byte组成的。

一个byte是8bits，前面的4bits表示的是package type，后面的4bits表示的是control flags。

下面是control header的结构：

| 7-4 | 3| 2-1 | 0  |
| - | -| --- | ----- |
| Package Type | DUP flag | QoS level | RETAIN |

前面的4bits可以表示16个值，下面是所有的package type可能的值：

| 助记符   | 值   | 含义                       | 助记符      | 值   | 含义                    |
| -------- | ---- | -------------------------- | ----------- | ---- | ----------------------- |
| Reserved | 0    | 保留字段                   | SUBSCRIBE   | 8    | 客户端subscribe         |
| CONNECT  | 1    | 客户端请求到服务器端的连接 | SUBACK      | 9    | subscribe的ack          |
| CONNACK  | 2    | connect的ack               | UNSUBSCRIBE | 10   | 客户端Unsubscribe       |
| PUBLISH  | 3    | publish消息                | UNSUBACK    | 11   | Unsubscribe Ack         |
| PUBACK   | 4    | publish消息的ack           | PINGREQ     | 12   | PING Request            |
| PUBREC   | 5    | Publish Received           | PINGRESP    | 13   | PING Response           |
| PUBREL   | 6    | Publish Release            | DISCONNECT  | 14   | Client正在Disconnecting |
| PUBCOMP  | 7    | Publish Complete           | Reserved    | 15   | 保留字段                |

控制flags包含了Dup flag,QoS level和RETIN这几个字段。

他们分别表示Duplicate delivery,Quality of Service和RETAIN flag。

DUP: 当客户端或服务器尝试重新传递 PUBLISH、PUBREL、SUBSCRIBE 或 UNSUBSCRIBE 消息时，会设置此标志。 这适用于 QoS 值大于零并且需要确认的消息。

Qos: 表示的是PUBLISH 消息传递的保证级别。QoS可以有4个值，分别是0,1,2,3。

0表示最多一次，1表示至少一次，2表示等于一次，3是一个保留值。

RETAIN: 此标志仅用于 PUBLISH 消息。当客户端向服务器发送 PUBLISH 时，如果设置了 Retain 标志，则服务器应在消息传递给当前订阅者后保留该消息。

## packet长度

接下来就是packet长度，它表示的是当前消息中剩余的byte数，包括后的可变header和payload。

packet长度从1个byte到4个byte不等。

如果是1个byte，表示的长度范围是0-127，也就是128个值。

有细心的朋友会问了，1个byte不是8bits吗？按道理可以表示256个值才对，为什么这里只能表示128个值呢？

这是因为每个byte的最高位，表示长度字节是否还有后续的字节。所以少了一个bit，只能表示128个值。

下表是各个字节能够表示的长度范围：

字节个数|起始范围
-|-
1| 0 (0x00) - 127 (0x7F)
2| 128 (0x80, 0x01) - 16383 (0xFF, 0x7F)
3| 16384 (0x80, 0x80, 0x01) - 2097151 (0xFF, 0xFF, 0x7F)
4| 2097152 (0x80, 0x80, 0x80, 0x01) - 268435455 (0xFF, 0xFF, 0xFF, 0x7F)

## 可变header

在某些MQTT命令中,还可能包含可变header字段。

具体而言，可能会有下面一些数据：

* Protocol name

协议名字会出现在MQTT CONNECT消息的可变header中。

* Protocol version

Protocol的版本号也会出现在CONNECT消息中。Protocol version用8-bit来表示。

* Connect flags

Connect flags同样是在CONNECT消息中出现的。Connect flags也是8 bits数据，具体各个bit的含义如下：

bits|7|6|5|4-3|2|1|0
-|-|-|-|-|-|-|-
-|User Name Flag|Password Flag|Will Retain|Will QoS|Will Flag|Clean Session|Reserved

Clean Session表示服务器端是否需要清理存储的有关客户端的信息,如果它的值为0，则服务器必须在客户端断开连接后，仍然存储客户端的订阅信息，以便在客户端重新连接时可以重用这些信息。服务器还必须在连接丢失时维护正在传递的消息的状态，并保留此信息，直到客户端重新连接。

如果设置为1，则服务器必须丢弃任何先前维护的有关客户端的信息。

Will flag表示当服务器在与客户端通信期间遇到 I/O 错误或客户端未能在 Keep Alive时间内进行通信的时候，服务器代表客户端发布消息。

Will QoS表示的是Will消息的QoS级别。

Will Retain flag表示服务器是否需要retain will消息。

User name and password flags表示用户名和可选的密码包含在 CONNECT 消息的有效payload中。

* Keep Alive timer

Keep Alive timer是在MQTT CONNECT消息中出现的。

它定义了从客户端接收到的消息之间的最大时间间隔。服务器可以通过这个时间来检测客户端的网络是否断开，从而无序等待TCP/IP超时。

对于客户端来说，客户端有责任在每个 Keep Alive 时间段内发送消息。如果在该时间段内没有与数据相关的消息，则客户端发送 PINGREQ 消息，服务器使用 PINGRESP 消息确认该消息。

如果服务器在 Keep Alive 时间段的一倍半内没有收到来自客户端的消息，它会断开客户端的连接，就像客户端发送了一个 DISCONNECT 消息一样.此操作不会影响客户的任何订阅。

如果客户端在发送 PINGREQ 后的 Keep Alive 时间段内没有收到 PINGRESP 消息，它应该关闭 TCP/IP 连接。

* Connect return code

这个字段会被用在CONNACK消息中,用一个字节来表示。

具体含义如下：

值|HEX|含义
-|-|-
0|0x00|Connection Accepted
1|0x01|Connection Refused:不支持的协议版本号
2|0x02|Connection Refused:identifier rejected
3|0x03|Connection Refused:服务不可用
4|0x04|Connection Refused:用户名密码错误
5|0x05|Connection Refused:未授权
6-255||保留字段

* Topic name

这个字段用在MQTT PUBLISH消息中。

## payload

payload就是消息中的正文部分，在MQTT中只有三种消息有payload字段，分别是CONNECT,SUBSCRIBE,SUBACK。

# 总结

以上就是MQTT协议的作用和具体的消息类型。有了这个协议，我们就可以使用netty搭建MQTT客户端了。


























 





