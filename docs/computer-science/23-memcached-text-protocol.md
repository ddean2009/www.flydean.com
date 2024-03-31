---
slug: /23-memcached-text-protocol
---

# 23. 网络协议之:memcached text protocol详解

[toc]

# 简介

用过缓存系统的肯定都听过memcached的大名，memcached是一个非常优秀的分布式内存缓存系统，应用非常的广泛。Memcached不仅仅是Web缓存，它更是一个通用的数据缓存，基本上你可以将任何东西存入memcached中，它的分布式设计具有很好的可扩展性和灵活性。

Memcached是一个客户端-服务器端的架构模式。一般来说，在服务器上搭建好Memcached的服务器端，接下来就可以使用Memcached的客户端和服务器端进行交换了。

作为客户端和服务器端的模型，两者的通讯肯定是有特定的协议的，适用于memcached的协议就叫做memcached protocol。

memcached的协议有两种，分别是text协议和binary协议。本文将会详细讲解memcached text protocol的定义。

# memcached protocol介绍

memcached可以看做是一个简单的key-value的存储系统，客户端通过key来请求服务器端的数据，服务器端通过key的hash值来查找对应的数据，然后返回给客户端。

memcached中的key长度一般不能超过250个字符。key不能包含控制字符或空白字符。

为了保证客户端和服务器端的消息通讯顺畅，一般来说都会制定特殊的客户端和服务器端的通讯协议，这个协议就叫做protocol。

什么是protocol呢？protocol听起来很高深很神秘，但是实际上protocol就是约定好的双方交互的消息格式。

对于memcached来说，memcached同时支持UDP和TCP协议，并且提供了两种协议方式，分别是“文本协议”和“二进制协议”。

其中文本协议是在第一个版本就支持的协议，而二进制协议是在v1.4之后才支持的。

文本协议和二进制协议都支持同样的命令,两者的唯一区别就是二进制协议具有更低的性能延迟和更好的可扩展性，而文本协议的有点就是它的可调试性能更好。

memcached text协议包含两部分数据，文本行和非结构化数据。前者是来自客户端的命令或来自服务器的响应，后者代表客户端访问的数据。命令以\r\n结尾，数据可以用\r、\n或\r\n，表示数据部分的结束。

# memcached支持的命令

memcached支持三种命令，分别是存储命令,读取命令和其他命令。

## 存储命令

memcached中的存储命令总共有6个，分别是“set”、“add”、“replace”、“append”、"prepend" 和 "cas"。

首先，客户端发送如下所示的命令行：

```
command key [flags] [exptime] length [noreply]
```

另外cas命令的格式和其他几个不太一样：

```
cas key [flags] [exptime] length [casunique] [noreply]
```

上面的命令中，command代表的是命令的名字，也就是上面的“set”、“add”、“replace”、“append”和"prepend"。

set表示给key设置一个值。

Add表示如果key不存在的话，就添加。

replace用来替换已知key的value。

append表示将提供的值附加到现有key的value之后，是一个附加操作。

prepend将当前key对应的value添加到提供的值后面。

cas是一个原子操作，只有当casunique匹配的时候，才会设置对应的值。

flags是一个非常有趣的参数，这个参数对于memcached server来说是透明的，这个参数只是用来标记客户端命令的类型，并不会被服务器端识别。另外flags的长度在不同的memcached版本中也有所不同，在memcached 1.2.0或者根据低级的版本中，flags是一个16-bit的整数。在memcached 1.2.1或以上的版本，flags是一个32-bit的整数。

exptime是过期时间，0表示不会过期。

length是以byte表示的value的长度，这个值并不包含value中的结束符"\r\n"。

casunique是一个64-bit的现有entry的唯一值。

noreply告诉服务器端，这是个不需要reply的命令。

在发送完命令行之后，客户端还需要发送数据块：

```
<data block>\r\n
```

举个例子，我们想要将jack这个值设置到student这个key上，那么对应的命令应该如下所示：

```
set student 0 0 4\r\njack\r\n
```

对应的客户端收到的服务器端的返回可能有这些值：

- "STORED\r\n"，表示存储成功。

- "NOT_STORED\r\n" 表示数据因为某些错误未存储成功。这通常意味着不满足“add”或“replace”命令的条件。

- "EXISTS\r\n" 表示要设置的值在上次进行cas操作之后已经被修改了。

- "NOT_FOUND\r\n" 表示要设置的值用在cas。

## 读取命令

memcached的读取命令有4个，分别是“get”、“gets”、“gat”和“gats，这些命令的格式如下：

```
get <key>*\r\n
gets <key>*\r\n
gat <exptime> <key>*\r\n
gats <exptime> <key>*\r\n
```

memcached中的读取命令后面不需要跟额外的数据块。

服务器端会根据接收到的key进行查询，每个key返回一条数据，格式如下：

```
VALUE <key> <flags> <bytes> [<cas unique>]\r\n
<data block>\r\n
```

在所有的数据都传输完毕之后，服务器端会发送"END\r\n"表示传输完毕。

这里的key表示查询传入的key。

flags是存储命令传入的flags。

bytes是后面data block的长度。

cas unique是当前item的唯一标记,在gets或者gats命令中返回。

data block是当前item具体的返回值。

上面我们提到了4个读取的命令，那么他们有什么区别呢？

首先是get和gets的区别，get 用于获取key的value值，若key不存在，返回空。支持多个key。 gets 用于获取key的带有CAS令牌值的value值，若key不存在，返回空。支持多个key。 他们的区别在于gets会返回多一个cas unique值。

gat和get的区别是，gat是get+touch的命令综合体，除了返回当前值之外，还会更新key的过期时间。

## 常用的其他命令

除了存储和获取之外，还有一些常用的其他命令。为什么这些命令被叫做第三类命令呢？这是因为这些命令只需要一个命令行即可，并不需要向服务器端传入额外的数据块。

下面是删除命令的格式：

```
delete <key> [noreply]\r\n
```

key是要删除的对象。

noreply表示是否需要收到服务器的返回值。

对应的服务器端返回值可能有两个：

- "DELETED\r\n" 表示删除成功

- "NOT_FOUND\r\n" 表示要删除的对象并不存在。

下面是Increment/Decrement命令的格式：

```
incr <key> <value> [noreply]\r\n
decr <key> <value> [noreply]\r\n
```

key是要修改的对象。

value是要添加或者减少的值,它必须是一个64-bit无符号整数。

noreply表示是否需要收到服务器的返回值。

服务器端的返回可能有两个：

- "NOT_FOUND\r\n" 表示要修改的对象没有找到

- "value\r\n" 返回修改成功之后的值

还有一个常用的是修改key过期时间的touch命令：

```
touch <key> <exptime> [noreply]\r\n
```

key是要修改的对象。

exptime是过期时间。

noreply表示是否需要收到服务器的返回值。

服务器端的返回值有两种：

- "TOUCHED\r\n" 表示修改成功。

- "NOT_FOUND\r\n" 表示要修改的对象不存在。

当然memcached支持的命令远不止上面所讲的这些。我们只是从中挑选出了最常用的一些命令进行讲解。

# memcached服务器的返回值

上面在讲解具体的命令的时候有提到服务器的返回值，这里再总结一下，memcached服务器端的返回值有下面几种：


| 返回值                     | 说明                                                  |
| :------------------------- | :----------------------------------------------------------- |
| `STORED`                   | 值存储成功                          |
| `NOT_STORED`               | 值存储失败|
| `EXISTS`                   | cas中要存储的对象已存在|
| `NOT_FOUND`                | 要修改的对象不存在 |
| `ERROR`                    | 提交了未知的命令               |
| `CLIENT_ERROR errorstring` | 客户端输入有误，具体的错误信息存放在 `errorstring`中|
| `SERVER_ERROR errorstring` | 服务器端异常 |
| `VALUE keys flags length`  | 返回要查询的key对应的对象|
| `DELETED`                  | 对象已经被删除           |
| `STAT name value`          | 统计信息                              |
| `END`                      | 服务器端返回结束                            |

注意，上面所有的返回值都以"\r\n"结尾。

# 支持UDP协议

上面我们讲的都是TCP协议的报文格式。事实上memcached还支持UDP协议。

但是因为UDP不保证可靠性的特征，所以使用UDP的场合一般在做缓存的查询应用中，即使查询失败,也只是被看做是缓存没有被命中而已，并不会影响到数据的准确性。

事实上UDP的数据包和TCP的数据包格式基本一样，只不过多了一个简单的帧头。并且所有的请求都必须在单个UDP数据包中完成。

注意，这里只有请求才有这个要求，服务器端的返回并没有这个限制。

在UDP中帧头长8个字节，其中0-1个字节表示的是请求ID，请求ID是由客户端生成的一个单调递增的值。服务器端将会使用这个ID来标记是对哪个请求的响应。特别是在有服务器端有多个响应的情况下。

2-3个字节表示的是序列号，它的取值范围是0到n-1，其中n是消息中总的报文个数，也就是4-5个字节所表示的。

最后的6-7字节是保留字节，以备将来使用，现在设置为0。

# 总结

以上就是对memcached协议的介绍，通常来说我们使用memcached都是通过memcached客户端来进行的，如果有细心的朋友可能会发现，客户端使用的命令和协议中的命令差别不大，这是因为客户端就是对这些底层协议的封装，然后暴露给用户一个更加简单易操作的接口。

































