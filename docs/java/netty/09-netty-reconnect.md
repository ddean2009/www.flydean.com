---
slug: /09-netty-reconnect
---

# 19. netty系列之:自动重连



# 简介

我们在使用客户端和服务器端连接的过程中，可能会因为各种问题导致客户端和服务器的连接发生中断，遇到这种情况，一般情况下我们需要使用监控程序去监听客户端和服务器端的连接，如果第一时间发现连接断开了，就需要手动去重连。比较麻烦，今天给大家介绍一种netty中自动重连的方式。

# 使用netty建立连接

要使用netty建立连接，首先需要启动服务器，通常来说服务器通过使用ServerBootstrap来启动服务器，如下所示：

```
// 绑定端口并启动
ChannelFuture f = b.bind(PORT).sync();
```

对于客户端来说，可以通过Bootstrap按如下的方式启动：

```
// 连接服务器
ChannelFuture f = b.connect(HOST, PORT).sync();
```

# 自动重连接的原理

那么当客户端和服务器端的连接断了之后，如何自动重连呢？

对于客户端来说，自动重连只需要再次调用Bootstrap的connect方法即可。现在的关键问题在于，如何找到重新调用connect的时机。

我们知道，不论server还是client，对于消息的处理都需要注册专门处理消息的handler。

对于读取消息来说，一般需要继承ChannelInboundHandlerAdapter，在这个handler中定义了很多和channel生命周期有关的方法，我们可以从这些生命周期的方法入手。

一般来说客户端和服务器连接的状态是这的：

CHANNEL REGISTERED--》CHANNEL ACTIVE --》 READ --》READ COMPLETE --》 CHANNEL INACTIVE --》 CHANNEL UNREGISTERED 

客户端和服务器端的连接如果关闭的话，则会触发CHANNEL INACTIVE 和 CHANNEL UNREGISTERED 两个事件，这样我们在客户端重写下面两个方法，在方法中加入重连的逻辑即可。

```
    @Override
    public void channelInactive(final ChannelHandlerContext ctx) {
        println("连接断开:" + ctx.channel().remoteAddress());
    }

    @Override
    public void channelUnregistered(final ChannelHandlerContext ctx) throws Exception {
        println("sleep:" + ReconnectClient.RECONNECT_DELAY + 's');

        ctx.channel().eventLoop().schedule(() -> {
            println("重连接: " + ReconnectClient.HOST + ':' + ReconnectClient.PORT);
            ReconnectClient.connect();
        }, ReconnectClient.RECONNECT_DELAY, TimeUnit.SECONDS);
    }
```
在channelInactive方法中，我们只是打印了一些日志。主要逻辑在channelUnregistered方法中，在这个方法中我们首先通过ctx获取到当前的channel，然后拿到channel中的eventLoop，然后调用它的schedule方法，在给定的时间后重新调用connect()方法。

connect()方法返回的是一个ChannelFuture，所以可以在ChannelFuture中添加一些listener用来监听connect的执行状态。

这里定义的connect方法如下：

```
    static void connect() {
        bs.connect().addListener(future -> {
            if (future.cause() != null) {
                handler.startTime = -1;
                handler.println("建立连接失败: " + future.cause());
            }
        });
    }
```

# 模拟自动重连

上一节我们已经知道怎么自动重连了，本小节将会对自动重连进行一个模拟。

这里要介绍一个类，叫做IdleStateHandler，从名字就可以看出来这个类是当 Channel 没有做任何read, write操作的时候，就会触发这个Idle的状态。

表示Idle状态的类叫做IdleStateEvent，Idle有6个状态，分别是FIRST_READER_IDLE_STATE_EVENT，READER_IDLE_STATE_EVENT，FIRST_WRITER_IDLE_STATE_EVENT，WRITER_IDLE_STATE_EVENT，FIRST_ALL_IDLE_STATE_EVENT和ALL_IDLE_STATE_EVENT。

分别表示读取状态的IDLE，写状态的IDLE和读写状态的IDLE。

这样我们在client启动的时候就可以加上IdleStateHandler，当client一段时间没有读取到server端发来的消息的时候，我们就调用ctx.close()将channel关闭，从而出发client端的重连操作。

```
        bs.group(group)
                .channel(NioSocketChannel.class)
                .remoteAddress(HOST, PORT)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) throws Exception {
                        ch.pipeline().addLast(new IdleStateHandler(READ_TIMEOUT, 0, 0), handler);
                    }
                });
```

IdleStateEvent是一个用户出发的event，要捕获到这个event，需要重写userEventTriggered：

```
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) {
        if (!(evt instanceof IdleStateEvent)) {
            return;
        }
        IdleStateEvent e = (IdleStateEvent) evt;
        if (e.state() == IdleState.READER_IDLE) {
            // 在Idle状态
            println("Idle状态，关闭连接");
            ctx.close();
        }
    }

```

上面的例子中，我们捕获了IdleStateEvent，并判断如果IdleState的状态是IdleState.READER_IDLE，那么就将channel关闭。

# 总结

本文我们介绍了重连的原理和用户触发的Event，希望大家能够喜欢。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)


