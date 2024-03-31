---
slug: /31-netty-framecodec-http2
---

# 55. netty系列之:在http2中使用framecodec



# 简介

netty为我们提供了很多http2的封装，让我们可以轻松的搭建出一个支持http2的服务器。其中唯一需要我们自定义的就是http2 handler。

在之前的文章中，我们介绍了自定义http2handler继承自Http2ConnectionHandler并且实现Http2FrameListener。这种实现方式是netty目前比较推荐的实现方式，今天给大家介绍的一种实现方式是netty中准备替换继承Http2ConnectionHandler的实现方式，但是这种实现方式并不成熟，还在不断的完善中。

今天给大家介绍一下这种实现方式。

# Http2FrameCodec

这种实现方式的核心类是Http2FrameCodec。事实上Http2FrameCodec也是继承自Http2ConnectionHandler。

它的主要作用是将HTTP/2中的frames和Http2Frame对象进行映射。Http2Frame是netty中对应所有http2 frame的封装，这样就可以在后续的handler中专注于处理Http2Frame对象即可，从而摆脱了http2协议的各种细节，可以减少使用者的工作量。

对于每个进入的HTTP/2 frame，Http2FrameCodec都会创建一个Http2Frame对象，并且将其传递给channelRead方法，用于对该对象进行处理。

通过调用write方法，可以对outbound的 Http2Frame 转换成为http2 frame的格式。

## Http2Frame、Http2FrameStream和Http2StreamFrame

netty中有三个非常类似的类，他们是Http2Frame、Http2FrameStream和Http2StreamFrame。

我们知道netty中一个tcp连接可以建立多个stream,Http2FrameStream就是和stream对应的类，这个类中包含了stream的id和stream当前的状态。

一个stream中又包含了多个消息，每个消息都是由多个frame组成的，所以Http2Frame是和这些frame对应的netty类。

Http2StreamFrame本身也是一个frame，事实上它继承自Http2Frame。

为什么会有这个类呢？因为对应frame本身来说，一般情况下它是和一个特定的stream相关联的，Http2StreamFrame表示这种关联关系，可以通过它的set stream方法来指定其关联的stream。如果想要该frame应用到整个连接而不是特定的某个stream，如果是关联到整个连接，那么stream()方法的返回就是null。

## Http2FrameCodec的构造

虽然Http2FrameCodec有构造函数，但是netty推荐使用Http2FrameCodecBuilder来构造它：

```
Http2FrameCodecBuilder.forServer().build()；
```

可以看到Http2FrameCodecBuilder有一个forServer还有一个forClient方法。他们一个是使用在服务器端，一个是使用在客户端。

主要是通过里面的server属性来进行区分。

## Stream的生命周期

frame codec将会向有效的stream发送和写入frames。之前讲过了 Http2StreamFrame 是和一个Http2FrameStream对象相关联的。

对于一个有效的stream来说，如果任意一方发送一个RST_STREAM frame，那么该stream就会被关闭。

或者发送方或者接收方任意一方发送的frame中带有END_STREAM标记，该stream也会被关闭。

## 流控制

Http2FrameCodec提供了对流的自动控制，但是我们仍然需要做一些操作，来对window进行更新。

具体而言，当我们在接收到Http2DataFrame消息的时候，对消息进行处理之后，需要增大window的大小，表示该data已经被处理了，可以有更多的空间去容纳新的数据。

也就是说需要向ctx中写入一个Http2WindowUpdateFrame，在这个Http2WindowUpdateFrame中需要传入处理的data的大小和对应stream的id，下面是一个处理data frame的例子：

```
    /**
     * 处理data frame消息
     */
    private static void onDataRead(ChannelHandlerContext ctx, Http2DataFrame data){
        Http2FrameStream stream = data.stream();
        if (data.isEndStream()) {
            sendResponse(ctx, stream, data.content());
        } else {
            // 不是end stream不发送，但是需要释放引用
            data.release();
        }
        // 处理完data，需要更新window frame，增加处理过的Data大小
        ctx.write(new DefaultHttp2WindowUpdateFrame(data.initialFlowControlledBytes()).stream(stream));
    }
```

上的例子中，我们向DefaultHttp2WindowUpdateFrame传入了对应的stream id，如果stream id为0，则表示处理的是整个connection，而不是单独的某个stream。

除了window update frame之外，对于某个特定stream的初始window还可以发送一个 Http2SettingsFrame，通过设置Http2Settings.initialWindowSize() 达到初始化的目的。

## 接收消息

对于每个HTTP/2 stream来说，其中包含的frame可以分为 Http2HeadersFrame和Http2DataFrame，而Http2HeadersFrame必定是第一个接收到的frame,并且这个headerFrame还关联了对应的stream对象：Http2FrameStream。

所以我们在处理的时候可以针对这两种不同的frame分别进行处理：

```
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        if (msg instanceof Http2HeadersFrame) {
            onHeadersRead(ctx, (Http2HeadersFrame) msg);
        } else if (msg instanceof Http2DataFrame) {
            onDataRead(ctx, (Http2DataFrame) msg);
        } else {
            super.channelRead(ctx, msg);
        }
    }
```

# 自定义handler

如果使用Http2FrameCodec，我们只需要在pipline中添加Http2FrameCodec之后，再添加自定义的handler即可：

```
ctx.pipeline().addLast(Http2FrameCodecBuilder.forServer().build(), new CustHttp2Handler());
```

因为Http2FrameCodec已经对http2中的frame进行了转换，所以我们在CustHttp2Handler中只需要处理自定义逻辑即可。

netty推荐自定义的handler继承自Http2ChannelDuplexHandler，因为它比普通的ChannelDuplexHandler多了一个创建newStream()和遍历所有有效stream的 forEachActiveStream(Http2FrameStreamVisitor)方法。

# 总结

本文讲解了Http2FrameCodec的原理，和与其搭配的handler实现中要注意的事项。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)




