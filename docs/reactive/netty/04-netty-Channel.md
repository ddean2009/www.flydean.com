---
slug: /04-netty-Channel
---

# 5. netty系列之:netty中的Channel详解



# 简介

Channel是连接ByteBuf和Event的桥梁，netty中的Channel提供了统一的API，通过这种统一的API，netty可以轻松的对接多种传输类型，如OIO，NIO等。今天本文将会介绍Channel的使用和Channel相关的一些概念。

# Channel详解

Channel是什么？ Channel是一个连接网络输入和IO处理的桥梁。你可以通过Channel来判断当前的状态，是open还是connected，还可以判断当前Channel支持的IO操作，还可以使用ChannelPipeline对Channel中的消息进行处理。

先看下Channel的定义：

```
public interface Channel extends AttributeMap, ChannelOutboundInvoker, Comparable<Channel> {
```

可以看到Channel是一个接口，它继承了AttributeMap, ChannelOutboundInvoker, Comparable三个类。Comparable表示这个类可以用来做比较。AttributeMap用来存储Channel的各种属性。ChannelOutboundInvoker主要负责Channel和外部 SocketAddress 进行连接和对写。

再看下channel中定义的方法：

![](https://img-blog.csdnimg.cn/c9b27ad3e0644fcc956f5d2cf904f223.png)

可以看出channel中定义的方法是多种多样的，这些方法都有些什么特点呢？接下来一一为您讲解。

## 异步IO和ChannelFuture

netty中所有的IO都是异步IO，也就是说所有的IO都是立即返回的，返回的时候，IO可能还没有结束，所以需要返回一个ChannelFuture，当IO有结果之后，会去通知ChannelFuture，这样就可以取出结果了。

ChannelFuture是java.util.concurrent.Future的子类，它除了可以拿到线程的执行结果之外，还对其进行了扩展，加入了当前任务状态判断、等待任务执行和添加listener的功能。

其他的功能都很好理解，它的突破在于可以对ChannelFuture添加listener，我们列出一个添加listener的方法：

```
Future<V> addListeners(GenericFutureListener<? extends Future<? super V>>... listeners);

```

添加的Listener会在future执行结束之后，被通知。不需要自己再去调用get等待future结束。这里实际上就是异步IO概念的实现，不需要主动去调用，当你完成之后来通知我就行。非常的美好！

ChannelFuture 有两个状态：uncompleted或者completed，分别代表任务的执行状态。

当一个IO刚开始的时候，返回一个ChannelFuture对象，这个对象的初始状态是uncompleted。注意，这个状态下的IO是还未开始工作的状态。当IO完成之后，不管是succeeded, failed 或者 cancelled状态，ChannelFuture的状态都会转换成为completed。

下图展示的是ChannelFuture状态和IO状态的对应图：

![](https://img-blog.csdnimg.cn/6d6cc43e5bf94c078d03f0011b897076.png)

如果要监控IO的状态，可以使用上面我们提到的 addListener 方法，为ChannelFuture添加一个ChannelFutureListener。

如果要等待IO执行完毕，还有一个await()方法，但是这个方法会去等待IO执行完毕，是一个同步的方法，所以并不推荐。

相比而言，addListener(GenericFutureListener)是一个非阻塞的异步方法，将会把一个ChannelFutureListener添加到ChannelFuture中，当IO结束之后会自动通知ChannelFutureListener，非常好用。

对于处理IO操作的ChannelHandler来说，为了避免IO的阻塞，一定不要在ChannelHandler的IO方法中调用await()，这样有可能会导致ChannelHandler因为IO阻塞导致性能下降。

下面举两个例子，一个是错误的操作，一个是正确的操作：

```
   // 错误操作
    @Override
   public void channelRead(ChannelHandlerContext ctx, Object msg) {
       ChannelFuture future = ctx.channel().close();
       future.awaitUninterruptibly();
       // 调用其他逻辑
   }
  
   // 正确操作
    @Override
   public void channelRead(ChannelHandlerContext ctx, Object msg) {
       ChannelFuture future = ctx.channel().close();
       future.addListener(new ChannelFutureListener() {
           public void operationComplete(ChannelFuture future) {
               // 调用其他逻辑
           }
       });
   }

```

大家可以对比下上面两种写法的区别。

另外要注意的是ChannelFuture中的这些await方法比如：await(long), await(long, TimeUnit), awaitUninterruptibly(long), 或者 awaitUninterruptibly(long, TimeUnit)可以带一个过期时间，大家要注意的是这个过期时间是等待IO执行的时间，并不是IO的timeout时间，也就是说当await超时之后，IO还有可能没有执行完成，这就导致了下面的代码有可能报错：

```
   Bootstrap b = ...;
   ChannelFuture f = b.connect(...);
   f.awaitUninterruptibly(10, TimeUnit.SECONDS);
   if (f.isCancelled()) {
       // 用户取消了Channel
   } else if (!f.isSuccess()) {
       // 这里可能会报异常，因为底层的IO可能还没有执行完成
       f.cause().printStackTrace();
   } else {
       // 成功建立连接
   }
  
```

上面的代码可以改成下面的例子：

```
  Bootstrap b = ...;
   // 配置连接timeout的时间
   b.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000);
   ChannelFuture f = b.connect(...);
   f.awaitUninterruptibly();
  
   // 等待直到底层IO执行完毕
   assert f.isDone();
  
   if (f.isCancelled()) {
       // 用户手动取消Channel
   } else if (!f.isSuccess()) {
       f.cause().printStackTrace();
   } else {
       // 成功建立连接
   }
   
```

## Channel的层级结构

netty中的Channel是有层级结构的，通过parent属性可获取这种层级结构。parent获取的对象和Channel的创建方式有关。比如如果是一个被ServerSocketChannel accepted的SocketChannel，那么它的parent就是ServerSocketChannel。

## 释放资源

和所有的IO一样，Channel在用完之后也需要被释放，需要调用close()或者close(ChannelPromise) 方法。

## 事件处理

channel负责建立连接，建立好的连接就可以用来处理事件ChannelEvent了，实际上ChannelEvent是由定义的一个个Channelhandler来处理的。而ChannelPipeline就是连接channel和channelhandler的桥梁。

我们将会下下一章详细讲解ChannelEvent、Channelhandler和ChannelPipeline的关联关系,敬请期待。

# 总结

Channel在netty中是做为一个关键的通道而存在的，后面的Event和Handler是以channel为基础运行的，所以说Channel就是netty的基础，好了，今天的介绍到这里就结束了，敬请期待后续的文章。




