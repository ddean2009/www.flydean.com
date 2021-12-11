dart系列之:在dart浏览器客户端使用WebSockets

[toc]

# 简介

web客户端和服务器端通信有两种方式，一种是使用HTTP请求，从服务器端请求数据。这种请求的缺点就是只能客户端拉取服务器端的数据，只能进行轮询。

另外一种方式是使用WebSocket，在客户端和服务器端之间建立通道，这样服务器就可以直接向客户端推送消息，避免了客户端频繁的拉取服务器端的数据，造成服务器端的压力。

dart:html包中就包含了WebSockets的相关操作，一起来看看吧。

# dart:html中的WebSockets

WebSocket使用的是ws和wss作为URI的标记符。其中ws表示的是websocket，而wss表示的是WebSocket Secure。

WebSocket可以分为客户端和服务器端两部分。dart:html中提供的WebSocket对象中包含的是客户端的逻辑。

我们先看下WebSocket类的定义：

```
@SupportedBrowser(SupportedBrowser.CHROME)
@SupportedBrowser(SupportedBrowser.FIREFOX)
@SupportedBrowser(SupportedBrowser.IE, '10')
@SupportedBrowser(SupportedBrowser.SAFARI)
@Unstable()
@Native("WebSocket")
class WebSocket extends EventTarget
```

可以看到它继承自EventTarget，并且支持chrome、firfox、IE10和Safari这几种浏览器。

# 创建一个WebSocket

WebSocket有两种创建方式，第一种是带protocal，一种是不带protocal:

```
  factory WebSocket(String url, [Object? protocols]) {
    if (protocols != null) {
      return WebSocket._create_1(url, protocols);
    }
    return WebSocket._create_2(url);
  }
```

这里的protocols指的是在webSocket协议框架之下的子协议，它表示的是消息的格式，比如使用soap或者wamp。

子协议是在WebSocket协议基础上发展出来的协议，主要用于具体的场景的处理，它是是在WebSocket协议之上，建立的更加严格的规范。

我们看一个最简单的创建WebSocket的代码：

```
 var webSocket = new WebSocket('ws://127.0.0.1:1337/ws');
```

以上如果服务器存在的话，就会成功建立一个WebSocket的连接。

# WebSocket的状态

WebSocket有四个状态，分别是closed, closing, connecting和open,都是以static来定义的，可以直接引用：


```
  static const int CLOSED = 3;

  static const int CLOSING = 2;

  static const int CONNECTING = 0;

  static const int OPEN = 1;
```

# 发送消息

dart中的WebSocket定义了5中发送消息的方法：

```
  void send(data) native;

  void sendBlob(Blob data) native;

  void sendByteBuffer(ByteBuffer data) native;

  void sendString(String data) native;

  void sendTypedData(TypedData data) native;
```

WebSocket支持发送[Blob], [ByteBuffer], [String] 或者 [TypedData] 这四种数据类型。

如果直接使用send(data)，则会根据data的具体类型选择不同的发送方法。

所以我们可以这样来发送数据：

```
 if (webSocket != null && webSocket.readyState == WebSocket.OPEN) {
        webSocket.send(data);
      } else {
        print('webSocket连接异常!');
      }
```

# 处理WebSocket事件

dart中的WebSocket客户端可以处理WebSocket中的各种事件，webSocket中定义了4种事件，如下所示：

```
  Stream<CloseEvent> get onClose => closeEvent.forTarget(this);

  Stream<Event> get onError => errorEvent.forTarget(this);

  Stream<MessageEvent> get onMessage => messageEvent.forTarget(this);

  Stream<Event> get onOpen => openEvent.forTarget(this);
```

onOpen处理的是建立连接事件，onClose处理的是关闭连接事件，onMessage处理的是接收消息事件，onError处理的是异常处理事件。

举个消息处理的例子：

```
 webSocket.onMessage.listen((MessageEvent e) {
        receivedData(e.data);
      });
 
```

# 总结

WebSocket是一种非常方便和实时的客户端和服务器端的通信方式，大家可以多尝试使用。




