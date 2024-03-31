---
slug: /25-redis-protocol
---

# 25. 网络协议之:redis protocol详解



# 简介

redis是一个非常优秀的软件，它可以用作内存数据库或者缓存。因为他的优秀性能，redis被应用在很多场合中。

redis是一个客户端和服务器端的模式，客户端和服务器端是通过TCP协议进行连接的，客户端将请求数据发送到服务器端，服务器端将请求返回给客户端。这样一个请求流程就完成了。

当然在最开始的时候，因为用的人很少，系统还不够稳定，通过TCP协议传输的数据不规范的。但是当用的人越来越多，尤其是希望开发适用于不同语言和平台的redis客户端的时候，就要考虑到兼容性的问题了。

这时候客户端和服务器端就需要一个统一的交互协议，对于redis来说这个通用的交互协议就叫做Redis serialization protocol(RESP)。

RESP是在Redis 1.2版本中引入的，并在Redis 2.0中成为了与 Redis 服务器通信的标准方式。

这就是说，从Redis 2.0之后，就可以基于redis protocol协议开发出自己的redis客户端了。

# redis的高级用法

一般来说，redis的客户端和服务器端组成的是一个请求-响应的模式，也就是说客户端向服务器端发送请求，然后得到服务器端的响应结果。

请求和响应是redis中最简单的用法。熟悉redis的朋友可能会想到了两个redis的高级用法，这两个用法并不是传统意义上的请求-响应模式。

到底是哪两种用法呢?

第一种就是redis支持pipline，也就是管道操作，管道的好处就是redis客户端可以一次性向服务器端发送多条命令，然后等待服务器端的返回。

第二种redis还支持Pub/Sub，也就是广播模型，在这一种情况下，就不是请求和响应的模式了，在Pub/Sub下，切换成了服务器端推送的模式。

## Redis中的pipline

为什么要用pipline呢？

因为redis是一个典型的请求响应模式，我们来举个常见的incr命令的例子：

Client: INCR X
Server: 1
Client: INCR X
Server: 2
Client: INCR X
Server: 3
Client: INCR X
Server: 4

事实上客户端只想得到最终的结果，但是每次客户端都需要等待服务器端返回结果之后，才能发送下一次的命令。这样就会导致一个叫做RTT(Round Trip Time)的时间浪费。

虽然每次RTT的时间不长，但是累计起来也是一个非常客观的数字。

那么可不可以将所有的客户端命令放在一起发送给服务器呢? 这个优化就叫做Pipeline。

piepline的意思就是客户端可以在没有收到服务器端返回的时候继续向服务器端发送命令。

上面的命令可以用pipline进行如下改写：

```
(printf "INCR X\r\nINCR X\r\nINCR X\r\nINCR X\r\n"; sleep 1) | nc localhost 6379
:1
:2
:3
:4
```

因为redis服务器支持TCP协议进行连接，所以我们可以直接用nc连到redis服务器中执行命令。

在使用pipline的时候有一点要注意，因为redis服务器会将请求的结果缓存在服务器端，等到pipline中的所有命令都执行完毕之后再统一返回，所以如果服务器端返回的数据比较多的情况下，需要考虑内存占用的问题。

那么pipline仅仅是为了减少RTT吗？

熟悉操作系统的朋友可能有听说过用户空间和操作系统空间的概念，从用户输入读取数据然后再写入到系统空间中，这里涉及到了一个用户空间的切换，在IO操作中，这种空间切换或者拷贝是比较耗时的，如果频繁的进行请求和响应，就会造成这种频繁的空间切换，从而降低了系统的效率。

使用pipline可以一次性发送多条指令，从而有效避免空间的切换行为。

## Redis中的Pub/Sub

和Pub/Sub相关的命令是SUBSCRIBE, UNSUBSCRIBE 和 PUBLISH。

为什么要用Pub/Sub呢？其主要的目的就是解耦，在Pub/Sub中消息发送方不需要知道具体的接收方的地址，同样的对于消息接收方来说，也不需要知道具体的消息发送方的地址。他们只需要知道关联的主题即可。

subscribe和publish的命令比较简单，我们举一个例子，首先是客户端subscribe topic：

```
redis-cli -h 127.0.0.1
127.0.0.1:6379> subscribe topic
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "topic"
3) (integer) 1
```

然后在另外一个终端，调用publish命令：

```
redis-cli -h 127.0.0.1
127.0.0.1:6379> publish topic "what is your name?"
(integer) 1
```

可以看到客户端会收到下面的消息：

```
1) "message"
2) "topic"
3) "what is your name?"
```

# RESP protocol

RESP协议有5种类型，分别是imple Strings, Errors, Integers, Bulk Strings 和 Arrays。

不同的类型以消息中的第一个byte进行区分，如下所示：

类型|第一个byte
-|-
Simple Strings|+
Errors|-
Integers|:
Bulk Strings|$
Arrays|*

protocol中不同的部分以 "\r\n" (CRLF)来进行区别。

## Simple Strings

Simple Strings的意思是简单的字符串。

通常用在服务器端的返回中，这种消息的格式就是"+"加上文本消息，最后以"\r\n"结尾。

比如服务器端返回OK,那么对应的消息就是：

```
"+OK\r\n"
```

上面的消息是一个非二进制安全的消息，如果想要发送二进制安全的消息，则可以使用Bulk Strings。

什么是非二进制安全的消息呢？对于Simple Strings来说，因为消息是以"\r\n"结尾，所以消息中间不能包含"\r\n"这两个特殊字符，否则就会产生错误的含义。

## Bulk Strings 

Bulk Strings是二进制安全的。这是因为Bulk Strings包含了一个字符长度字段，因为是根据长度来判断字符长度的，所以并不存在根据字符中某个特定字符来判断是否字符结束的缺点。

具体而言Bulk Strings的结构是"$"+字符串长度+"\r\n"+字符串+"\r\n"。

以OK为例，如果以Bulk Strings来表示，则如下所示:

```
"$2\r\nok\r\n"
```

Bulk Strings还可以包含空字符串：

```
"$0\r\n\r\n"
```

当然还可以表示不存在的Null值：

```
"$-1\r\n"
```

## RESP Integers 

这是redis中的整数表示，具体的格式是":"+整数+"\r\n"。

比如18这个整数就可以用下面的格式来表示：

```
":18\r\n"
```

## RESP Arrays

redis的多个命令可以以array来表示，服务器端返回的多个值也可以用arrays来表示。

RESP Arrays的格式是"*"+数组中的元素个数+其他类似的数据。

所以RESP Arrays是一个复合结构的数据。比如一个数组中包含了两个Bulk Strings:"redis","server"则可以用下面的格式来表示：

```
"*2\r\n$5\r\nredis\r\n$6\r\nserver\r\n"
```

RESP Arrays中的原始不仅可以使用不同类型，还能包含RESP Arrays，也就是array的嵌套：

```
"*3\r\n$5\r\nredis\r\n$6\r\nserver\r\n*1\r\n$4\r\ngood\r\n"
```

为了方便观察，我们将上面的消息格式一下：

```
"*3\r\n
$5\r\nredis\r\n
$6\r\nserver\r\n
*1\r\n
$4\r\ngood\r\n"
```

上面的消息是一个包含三个元素的数组，前面两个元素是Bulk Strings，最后一个是包含一个元素的数组。

## RESP Errors

最后，RESP还可以表示错误消息。RESP Errors的消息格式是"-"+字符串，如下所示：

```
"-Err something wrong\r\n"
```

一般情况下，"-"后面的第一个单词表示的是错误类型，但是这只是一个约定俗成的规定，并不是RESP协议中的强制要求。

另外，经过对比，大家可能会发现RESP Errors和Simple Strings是消息格式是差不多的。

这种对不同消息类型的处理是在客户端进行区分的。

# Inline commands

如果完全按RESP协议的要求，当我们连接到服务器端的时候需要包含RESP中定义消息的所有格式，但是这些消息中包含了额外的消息类型和回车换行符，所以直接使用协议来执行的话会比较困惑。

于是redis还提供一些内联的命令，也就是协议命令的精简版本，这个精简版本去除了消息类型和回车换行符。

我们以"get world"这个命令为例。来看下不同方式的连接情况。

首先是使用redis-cli进行连接：

```
redis-cli -h 127.0.0.1
127.0.0.1:6379> get world
"hello"
```

因为redis-cli是redis的客户端，所以可以直接使用inline command来执行命令。

如果使用telnet,我们也可以使用同样的命令来获得结果：

```
telnet 127.0.0.1 6379
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
get world
$5
hello
```

可以看到返回的结果是"$5\r\nhello\r\n"。

如果要使用协议消息来请求redis服务器应该怎么做呢？

我们要请求的命令是"get world",将其转换成为RESP的消息则是：

```
"*2\r\n$3\r\nget\r\n$5\r\nworld\r\n"
```

我们尝试一下将上述命令使用nc传递到redis server上：

```
(printf "*2\r\n$3\r\nget\r\n$5\r\nworld\r\n"; sleep 1) |  nc localhost 6379
-ERR Protocol error: expected '$', got ' '
```

很遗憾我们得到了ERR，那么是不是不能直接使用RESP消息格式进行传输呢？当然不是，上面的问题在于`$`符号是一个特殊字符，我们需要转义一下：

```
(printf "*2\r\n\$3\r\nget\r\n\$5\r\nworld\r\n"; sleep 1) |  nc localhost 6379
$5
hello
```

可以看到输出的结果和直接使用redis-cli一致。

# 总结

以上就是RESP协议的基本内容和手动使用的例子，有了RESP，我们就可以根据协议中定义的格式来创建redis客户端。

可能大家又会问了，为什么只是redis客户端呢？有了协议是不是redis服务器端也可以创建呢？答案当然是肯定的，只需要按照协议进行消息传输即可。主要的问题在于redis服务器端的实现比较复杂，不是那么容易实现的。































