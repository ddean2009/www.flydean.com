---
slug: /28-netty-wrap-http2
---

# 52. netty系列之:netty对http2消息的封装



# 简介

无论是什么协议，如果要真正被使用的话，需要将该协议转换成为对应的语言才好真正的进行应用，本文将从http2消息的结构出发，探讨一下netty对http2消息的封装，带大家领略一下真正的框架应该做到什么程度。

# http2消息的结构

http2和http1.1不同的是它使用了新的二进制分帧，通过客户端和服务器端建立数据流steam来进行客户端和服务器端之间消息的交互。其中数据流是一个双向字节流，用来发送一条或者多条消息。

消息是客户端和服务端发送的一个逻辑上完整的数据。根据数据大小的不同，可以将消息划分为不同的帧Frame。也就是说message是由不同的frame组成的。

frame就是http2中进行通信的最小单位，根据上一节的介绍，我们知道frame有这样几种：

* DATA frame
* HEADERS frame
* PRIORITY frame
* RST_STREAM frame
* SETTINGS acknowledgment frame
* SETTINGS frame
* PING frame
* PING acknowledgment
* PUSH_PROMISE frame
* GO_AWAY frame
* WINDOW_UPDATE frame
* Unknown Frame

我们看一下http2中stream和frame的一个大体的结构：

![](https://img-blog.csdnimg.cn/1793009756544508a2582d689d1d065e.png)

在http2中，一个TCP连接，可以承载多个数据流stream，多个stream中的不同frame可以交错发送。

每个frame通过stream id来标记其所属的stream。

有了上面的http2的基本概念，我们接下来就看下netty对http2的封装了。

# netty对http2的封装

## Http2Stream

作为一个TCP连接下面的最大的单位stream，netty中提供了接口Http2Stream。注意，Http2Stream是一个接口，它有两个实现类，分别是DefaultStream和ConnectionStream。

Http2Stream中有两个非常重要的属性，分别是id和state。

id前面已经介绍了，是stream的唯一标记。这里要注意由客户端建立的 Stream ID 必须是奇数，而由服务端建立的 Stream ID 必须是偶数。另外Stream ID 为 0 的流有特殊的作用，它是CONNECTION_STREAM_ID，1 表示HTTP_UPGRADE_STREAM_ID。

state表示stream的状态，具体而言，stream有下面几个状态：

```
        IDLE(false, false),
        RESERVED_LOCAL(false, false),
        RESERVED_REMOTE(false, false),
        OPEN(true, true),
        HALF_CLOSED_LOCAL(false, true),
        HALF_CLOSED_REMOTE(true, false),
        CLOSED(false, false);
```

为什么状态需要区分local和remote呢？这是因为stream连接的两端，所以有两端的状态。

和stream状态相对应的就是http2的生命周期了。netty提供了Http2LifecycleManager来表示对http2生命周期的管理：

```
    void closeStreamLocal(Http2Stream stream, ChannelFuture future);
    void closeStreamRemote(Http2Stream stream, ChannelFuture future);
    void closeStream(Http2Stream stream, ChannelFuture future);
    ChannelFuture resetStream(ChannelHandlerContext ctx, int streamId, long errorCode,
            ChannelPromise promise);
    ChannelFuture goAway(ChannelHandlerContext ctx, int lastStreamId, long errorCode,
            ByteBuf debugData, ChannelPromise promise);
    void onError(ChannelHandlerContext ctx, boolean outbound, Throwable cause);
```

分别是关闭stream，重置stream，拒绝新建stream：goAway，和处理出错状态这几种。

## Http2Frame

stream之后，就是真实承载http2消息的Http2Frame了。在netty中，Http2Frame是一个接口，它有很多具体的实现。

Http2Frame的直接子类包括HTTP2GoAwayFrame、HTTPPingFrame、Http2SettingsFrame和HTTP2SettingsAckFrame。

其中goAway表示不接受新的stream，ping用来进行心跳检测。SETTINGS用来修改连接或者 Stream 流的配置。

netty中专门有一个Http2Settings类和其对应。

在这个类中定义了一些特别的setting名字：


SETTINGS 名字 | 含义
---------|----------
 SETTINGS_HEADER_TABLE_SIZE | 对端索引表的最大尺寸
 SETTINGS_ENABLE_PUSH | 是否启用服务器推送功能 
 SETTINGS_MAX_CONCURRENT_STREAMS | 接收端允许的最大并发 Stream 数量
 SETTINGS_INITIAL_WINDOW_SIZE | 发送端的窗口大小，用于 Stream 级别流控
 SETTINGS_MAX_FRAME_SIZE| 设置帧的最大大小
 SETTINGS_MAX_HEADER_LIST_SIZE| 对端头部索引表的最大尺寸

除了上面讲的4个frame之外，其他的frame实现都继承自Http2StreamFrame,具体而言有PriorityFrame,ResetFrame,HeadersFrame,DataFrame,WindowUpdateFrame,PushPromiseFrame和UnknownFrame。

各个frame分别代表了不同的功能。这里最重要的就是Http2HeadersFrame和Http2DataFrame。

Http2HeadersFrame主要是客户端发送给服务器端的http2请求。

具体而言除了标准的http1.1的header之外，http2还支持下面的header：

```
      METHOD(":method", true),

        SCHEME(":scheme", true),

        AUTHORITY(":authority", true),

        PATH(":path", true),

        STATUS(":status", false),

        PROTOCOL(":protocol", true);
```

对于Http2DataFrame来说，他本身是一个ByteBufHolder，用来传递具体的数据信息。data frame的Payload直接存储在ByteBuf中。

# 总结

以上就是netty对http2消息的封装了。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)

