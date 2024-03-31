网络协议之:WebSocket的消息格式

[toc]

# 简介

我们知道WebSocket是建立在TCP协议基础上的一种网络协议，用来进行客户端和服务器端的实时通信。非常的好用。最简单的使用WebSocket的办法就是直接使用浏览器的API和服务器端进行通信。

本文将会深入分析WebSocket的消息交互格式，让大家得以明白，websocket到底是怎么工作的。

# WebSocket的握手流程

我们知道WebSocket为了兼容HTTP协议，是在HTTP协议的基础之上进行升级得到的。在客户端和服务器端建立HTTP连接之后，客户端会向服务器端发送一个升级到webSocket的协议，如下所示：

```
GET /chat HTTP/1.1
Host: example.com:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

```

> 注意，这里的HTTP版本必须是1.1以上。HTTP的请求方法必须是GET

通过设置Upgrade和Connection这两个header，表示我们准备升级到webSocket了。

除了这里列的属性之外，其他的HTTP自带的header属性都是可以接受的。

这里还有两个比较特别的header，他们是Sec-WebSocket-Version和Sec-WebSocket-Key。

先看一下Sec-WebSocket-Version， 它表示的是客户端请求的WebSocket的版本号。如果服务器端并不明白客户端发送的请求，则会返回一个400 ("Bad Request")，在这个返回中，服务器端会返回失败的信息。

如果是不懂客户端发送的Sec-WebSocket-Version，服务器端同样会将Sec-WebSocket-Version返回，以告知客户端。

这里要特别关注的一个header字段就是Sec-WebSocket-Key。我们接下来看一下这个字段到底有什么用。

当服务器端收到客户端的请求之后，会返回给客户端一个响应，告诉客户端协议已经从HTTP升级到WebSocket了。

返回的响应可能是这样的：

```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

这里的Sec-WebSocket-Accept是根据客户端请求中的Sec-WebSocket-Key来生成的。具体而言是将客户端发送的Sec-WebSocket-Key 和 字符串"258EAFA5-E914-47DA-95CA-C5AB0DC85B11" 进行连接。然后使用SHA1算法求得其hash值。

最后将hash值进行base64编码即可。

当服务器端返回Sec-WebSocket-Accept之后，客户端可以对其进行校验，已完成整个握手过程。

# webSocket的消息格式

之所以要使用webSocket是因为client和server可以随时随地发送消息。这是websocket的神奇所在。那么发送的消息是什么格式的呢？我们来详细看一下。

client和server端进行沟通的消息是以一个个的frame的形式来传输的。frame的格式如下：

```

      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```

MASK表示的是消息是否是被编码过的，对于从client过来的消息来说，MASK必须是1。如果client发送给server端的消息，MASK不为1，则server需要断开和client的连接。但是server端发送给client端的消息，MASK字段就不需要设置了。

RSV1-3是扩展的字段，可以忽略。

opcode表示怎么去解释payload字段。payload就是实际要传递的消息。0x0表示继续，0x1表示文本，0x2表示二进制，其他的表示控制字段。

FIN表示是否是消息的最后一个frame。如果是0，表示该消息还有更多的frame。如果是1表示，该frame是消息的最后一部分了，可以对消息进行处理了。

为什么需要Payload len字段呢？因为我们需要知道什么时候停止接收消息。所以需要一个表示payload的字段来对消息进行具体的处理。

怎么解析Payload呢？这个就比较复杂。

1. 首先读取9-15 bits，将其解析为无符号整数。如果其小于125，那么这个就是payload的长度，结束。如果是126，那么就去到第二步。如果是127，那么就去到第三步。
2. 读取下一个16 bits，然后将其解析为无符号整数，结束。
3. 读取下一个64 bits。将其解析为符号整数。结束。

如果设置了Mask，那么读取下4个字节，也就是32bits。这个是masking key。当数据读取完毕之后，我们就获取到了编码过后的payload:ENCODED,和MASK key。要解码的话，其逻辑如下：

```
var DECODED = "";
for (var i = 0; i < ENCODED.length; i++) {
    DECODED[i] = ENCODED[i] ^ MASK[i % 4];

```

FIN可以和opcode一起配合使用，用来发送长消息。

FIN=1表示，是最后一个消息。 0x1表示是text消息，0x2是0，表示是二净值消息，0x0表示消息还没有结束，所以0x0通常和FIN=0 一起使用。

# Extensions和Subprotocols

在客户端和服务器端进行握手的过程中，在标准的websocket协议基础之上，客户端还可以发送Extensions或者Subprotocols。这两个有什么区别呢？

首先这两个都是通过HTTP头来设置的。但是两者还是有很大的不同。Extensions可以对WebSocket进行控制，并且修改payload，而subprotocols只是定义了payload的结构，并不会对其进行修改。

Extensions是可选的，而Subprotocols是必须的。

你可以将Extensions看做是数据压缩，它是在webSocket的基础之上，对数据进行压缩或者优化操作，可以让发送的消息更短。

而Subprotocols 表示的是消息的格式，比如使用soap或者wamp。

子协议是在WebSocket协议基础上发展出来的协议，主要用于具体的场景的处理，它是是在WebSocket协议之上，建立的更加严格的规范。

比如，客户端请求服务器时候，会将对应的协议放在Sec-WebSocket-Protocol头中：

```
GET /socket HTTP/1.1
...
Sec-WebSocket-Protocol: soap, wamp
```

服务器端会根据支持的类型，做对应的返回，如：

```
Sec-WebSocket-Protocol: soap
```

# 总结

本文讲解了webSocket消息交互的具体格式，可以看到很多强大功能的协议，都是由最最基本的结构组成的。



