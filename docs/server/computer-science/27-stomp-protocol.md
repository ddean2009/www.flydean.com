---
slug: /27-stomp-protocol
---

# 27. 网络协议之:STOMP简单面向文本消息协议详解



# 简介

STOMP是一种文本的消息传输协议，它主要是为消息中间件来设计的，STOMP的全称是Simple (Streaming) Text Oriented Message Protocol,只要消息中间件支持这种协议，那么客户端就可以使用这种协议跟服务器端进行通讯。

很多流行的消息中间件都支持STOMP协议，比如我们常用的Apache ActiveMQ,RabbitMQ等。

事实上一个协议是否成功，不是看这个协议是否够复杂，而是这个协议是否够简单。协议越简单越好实现，适用的范围就越广泛。受众面就越多。

虽然服务器端实现起来会比较复杂，但是客户端的实现就相对简单很多。如果没有STOMP的客户端，不要担心，自己写一个就行了。

# STOMP协议

到目前为止，STOMP协议共出过三个版本，分别是STOMP 1.0,STOMP 1.1和STOMP 1.2，其中STOMP 1.2是在2012年10月发布的。本文接下来的介绍都是以STOMP 1.2为基础的。

在STOMP协议中，消息是以frame的形式来进行传输的。STOMP的frame借鉴的是HTTP中消息包的概念。frame很简单，包含了commands,可选的headers和可选的body这三部分。

STOMP默认的编码方式是UTF-8，虽然STOMP是基于文本的，但是也可以使用STOMP来传输二进制消息。

## frame的结构

基于上我们讲到的frame的三个部分，frame通常具有下面的结构：

```
COMMAND
header1:value1
header2:value2

Body^@
```

COMMAND是frame中的命令，frame中的命令可以有下面几种：

```
CONNECT
SEND
SUBSCRIBE
UNSUBSCRIBE
BEGIN
COMMIT
ABORT
ACK
NACK
DISCONNECT
```

COMMAND以EOL结束，后面接的是header，他是一种key:value的格式。

每一个header的entry都是以EOL结束的。当所有的entry都结束之后，会接一个空白行，表示这个header结束了。

接下来是body部分，最后以一个空字符结尾，这里空字符用`^@`来表示。


## CONNECT和CONNECTED

当客户端和服务器端需要建立连接的时候会发送一个初始化命令CONNECT：

```
CONNECT
accept-version:1.2
host:stomp.flydean.com

^@
```

在connect命令中，我们额外提供了accept-version和host这两个header属性。

对于connect命令来说是没有Body的，所以直接以NULL结束即可。

如果服务器端接受了连接，那么将会返回CONNECTED：

```
CONNECTED
version:1.2

^@
```

CONNECTED会返回对应的版本号，然后结束。

## STOMP命令

STOMP是CONNECT命令的升级版本。客户端使用CONNECT命令连接到STOMP 1.0服务器中，然后使用STOMP连接到STOMP 1.1和STOMP 1.2服务器中。

使用STOMP命令的目的是为了和HTTP的连接命令进行区分。

和CONNECT不同的是STOMP命令会有额外的头信息。

STOMP 1.2 中，必须设置下面几个header属性：

* accept-version : 客户端支持的STOMP协议的版本。

* host : 客户端想要连接到的virtual host名字。

上面两个header是必须要设置的字段，还有下面几个字段是非必要的：

* login : 表示需要连接到一个安全的STOMP server。

* passcode : 登录到STOMP server需要用到的密码。

* heart-beat : 心跳相关的设置。

STOMP是客户端的连接请求，对应的服务器端的响应也叫做CONNECTED,如果是STOMP 1.2服务器，则必须设置：

* version: 服务器端将会使用的STOMP protocol版本号。

STOMP 1.2服务器端根据客户端的情况，还会返回下面一些头：

* heart-beat : 心跳相关的属性。

* session : session的唯一标记。

* server : STOMP服务器的信息。一般是服务器的名字后面接着版本号，如下所示：

```
server:Tomcat/3.8.9
```

## 版本协商

因为有不同的版本号，接下来我们来考虑一个客户端和服务器端进行版本协商的流程。

首先客户端发送它可以支持的版本给服务器端：

```
CONNECT
accept-version:1.0,1.1,1.2
host:stomp.flydean.com

^@
```

这里accept-version中包含了所有客户端支持的版本号，以都逗号分割。

服务器端在收到客户端的请求之后，会选择一个它支持的版本，返回给客户端：

```
CONNECTED
version:1.2

^@
```

如果服务器端没有肯定要支持的版本，那么会返回一个下面的异常：

```
ERROR
version:1.3,2.0
content-type:text/plain

Supported protocol versions are 1.3 2.0^@
```

## 客户端请求

客户端可以发送下面一些请求给服务器端:

* SEND

send是客户端发送消息给服务器端，它有一个必须的header叫做destination,下面是一个send的例子：

```
SEND
destination:/queue/student
content-type:text/plain

hello baby
^@
```

* SUBSCRIBE

SUBSCRIBE用来收听对应的topic，需要添加一个destination表示收听的目标，一个ack表示ack的模式（auto, client, 或者client-individual），一个id用来唯一标记这个subscription 如下所示：

```
SUBSCRIBE
id:1234567
destination:/queue/student
ack:client

^@
```

* UNSUBSCRIBE

UNSUBSCRIBE用来取消某个监听，它是和SUBSCRIBE相反的操作，只需要指定对应要取消的id即可：

```
UNSUBSCRIBE
id:1234567

^@
```

* BEGIN

BEGIN用来开启transaction，需要设置对应的transaction名称：

```
BEGIN
transaction:tx1

^@
```

* COMMIT

COMMIT也是跟transaction相关的，用来提交一个transaction。

```
COMMIT
transaction:tx1

^@
```

* ABORT

ABORT用来回退一个transaction：

```
ABORT
transaction:tx1

^@
```

* ACK

如果一个subscription使用的ack模式是client或者client-individual,那么所有客户端接受到的消息默认是没有ack的，需要客户端主动发送ACK消息给服务器端，以ack这个消息。

ACK消息需要包含id,另外ACK还支持transaction，表示该ack是对应transaction的一部分。

```
ACK
id:1234567
transaction:tx1

^@
```

* NACK

如果客户端没有ACK对应的消息，那么可以发送一个NACK给服务器端。

NACK和ACK的响应格式是一样的。
  
* DISCONNECT

DISCONNECT用来断开和server的连接，客户端首先发送一个DISCONNECT命令给服务器端：

```
DISCONNECT
receipt:54321
^@
```

服务器端在收到DISCONNECT之后，会发送RECEIPT给客户端：

```
RECEIPT
receipt-id:54321
^@
```

客户端在发送DISCONNECT命令之后，就不能继续发送任何frame了。

## 服务器端响应

服务器端可以发送三种命令。

* MESSAGE

MESSAGE包含的是要发送给订阅客户端的消息。

MESSAGE必须包含一个destination字段，表示消息要发送到的地址，还包含一个message-id，表示消息的唯一标记,包含一个subscription，用来标记订阅者。如下所示：

```
MESSAGE
subscription:1234567
message-id:10000
destination:/queue/student
content-type:text/plain

hello baby^@

```

* RECEIPT

RECEIPT用来响应客户端的receipt请求，它必须包含一个receipt-id：

```
RECEIPT
receipt-id:54321

^@
```

* ERROR

最后一个server端的命令是ERROR，表示异常信息。

ERROR中可以包含一个message头，里面是异常消息的简短描述。如果可以会在Body中包含更多的消息内容，如下所示：

```
ERROR
receipt-id:message-12345
content-type:text/plain
content-length:170
message:malformed frame received

^@
```

如果异常是针对特定receipt的，那么ERROR中还可以包含receipt-id。

# 总结

以上就是STOMP协议的详细描述，因为STOMP协议是基于TCP协议的，我们可以根据协议描述的具体内容，来实现自己的客户端。























