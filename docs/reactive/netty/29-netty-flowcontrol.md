---
slug: /29-netty-flowcontrol
---

# 53. netty系列之:netty实现http2中的流控制



# 简介

HTTP2相对于http1.1来说一个重要的提升就是流控制flowcontrol。为什么会有流控制呢？这是因为不管是哪种协议，客户端和服务器端在接收数据的时候都有一个缓冲区来临时存储暂时处理不了的数据，但是缓冲区的大小是有限制的，所以有可能会出现缓冲区溢出的情况，比如客户端向服务器端上传一个大的图片，就有可能导致服务器端的缓冲区溢出，从而导致一些额外的数据包丢失。

为了避免缓冲区溢出，各个HTTP协议都提供了一定的解决办法。

在HTTP1.1中，流量的控制依赖的是底层TCP协议，在客户端和服务器端建立连接的时候，会使用系统默认的设置来建立缓冲区。在数据进行通信的时候，会告诉对方它的接收窗口的大小，这个接收窗口就是缓冲区中剩余的可用空间。如果接收窗口大小为零，则说明接收方缓冲区已满，则发送方将不再发送数据，直到客户端清除其内部缓冲区，然后请求恢复数据传输。

HTTP2通过客户端和服务器端的应用中进行缓冲区大小消息的传输，通过在应用层层面控制数据流，所以各个应用端可以自行控制流量的大小，从而实现更高的连接效率。 

本文将会介绍netty对http2流控制的支持。

# http2中的流控制

在简介中我们也提到了，传统的HTTP1.1使用的是系统底层的流量控制机制，具体来说就是TCP的流控制。但是TCP的流控制在HTTP2中就不够用了。因为HTTP2使用的是多路复用的机制，一个TCP连接可以有多个http2连接。所以对http2来说TCP本身的流控制机制太粗糙了，不够精细。

所以在HTTP2中，实现了更加精细的流控制机制，它允许客户端和服务器实现其自己的数据流和连接级流控制。

具体的流程是这样的，当客户端和服务器端建立连接之后，会发送Http2SettingsFrame，这个settings frame中包含了SETTINGS_INITIAL_WINDOW_SIZE，这个是发送端的窗口大小，用于 Stream 级别流控。流控制窗口的默认值设为65,535字节，但是接收方可以对其进行修改，最大值为2^31-1 字节。

建立好初始windows size之后，对于接收方来说，每次发送方发送data frame就会减少window的的大小，而接收方每次发送WINDOW_UPDATE frame时候就会增加window的大小，从达到动态控制的目的。

# netty对http2流控制的封装

## Http2FlowController

从上面的介绍我们知道，http2对流控制是通过两个方面来实施的，第一个方面就是初始化的Http2SettingsFrame，通过设置SETTINGS_INITIAL_WINDOW_SIZE来控制初始window的大小。第二个方面就是在后续的WINDOW_UPDATE frame中对window的大小进行动态增减。

对于netty来说，这一切都是封装在Http2FlowController类中的。Http2FlowController是一个抽象类，它有两个实现，分别是Http2LocalFlowController和Http2RemoteFlowController。他们分别表示对inbound flow of DATA 和 outbound flow of DATA的处理。

Http2FlowController中主要有5个方法，分别是：

  * set channelHandlerContext：绑定flowcontrol到ChannelHandlerContext上。
  * set initialWindowSize：初始化window size，等同于设置SETTINGS_INITIAL_WINDOW_SIZE。
  * get initialWindowSize: 返回初始化window size。
  * windowSize： 获取当前的windowSize。
  * incrementWindowSize： 增加flow control window的大小。


接下来我们看下他的两个实现类，有什么不一样的地方。

## Http2LocalFlowController

LocalFlowController用来对远程节点发过来的DATA frames做flow control。它有5个主要的方法。

* set frameWriter： 用来设置发送WINDOW_UPDATE frames的frame writer。
* receiveFlowControlledFrame： 接收inbound DATA frame，并且对其进行flow control。
* consumeBytes： 表示应用已经消费了一定数目的bytes，可以接受更多从远程节点发过来的数据。flow control可以发送 WINDOW_UPDATE frame来重置window大小。
* unconsumedBytes： 接收到，但是未消费的bytes。
* initialWindowSize： 给定stream的初始window大小。

## Http2RemoteFlowController

remoteFlowController用来处理发送给远程节点的outbound DATA frames。它提供了8个方法：

* get channelHandlerContext： 获取当前flow control的context.
* addFlowControlled: 将flow control payload添加到发送到远程节点的queue中。
* hasFlowControlled: 判断当前stream是否有 FlowControlled frames在queue中。
* writePendingBytes: 将流量控制器中的所有待处理数据写入流量控制限制。
* listener: 给 flow-controller添加listener。
* isWritable: 确定流是否有剩余字节可用于流控制窗口。
* channelWritabilityChanged: context的writable状态是否变化。
* updateDependencyTree: 更新stream之间的依赖关系，因为stream是可以有父子结构的。

# 流控制的使用

flowControl相关的类主要被用在Http2Connection，Http2ConnectionDecoder，Http2ConnectionEncoder中，在建立http2连接的时候起到相应的作用。

# 总结

flowControl是http2中的一个比较底层的概念，大家在深入了解netty的http2实现中应该会遇到。





