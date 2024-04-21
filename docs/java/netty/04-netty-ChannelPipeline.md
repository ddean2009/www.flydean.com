---
slug: /04-3-netty-ChannelPipeline
---

# 10. netty系列之:channelPipeline



# 简介

我们在介绍channel的时候提到过，几乎channel中所有的实现都是通过channelPipeline进行的，作为一个pipline，它到底是如何工作的呢？

一起来看看吧。

# ChannelPipeline

ChannelPipeline是一个interface，它继承了三个接口，分别是ChannelInboundInvoker,ChannelOutboundInvoker和Iterable:

```
public interface ChannelPipeline
        extends ChannelInboundInvoker, ChannelOutboundInvoker, Iterable<Entry<String, ChannelHandler>> 
```

继承自ChannelInboundInvoker，表示ChannelPipeline可以触发channel inboud的一些事件，比如：

```
ChannelInboundInvoker fireChannelRegistered();
ChannelInboundInvoker fireChannelUnregistered();
ChannelInboundInvoker fireChannelActive();
ChannelInboundInvoker fireChannelInactive();
ChannelInboundInvoker fireExceptionCaught(Throwable cause);
ChannelInboundInvoker fireUserEventTriggered(Object event);
ChannelInboundInvoker fireChannelRead(Object msg);
ChannelInboundInvoker fireChannelReadComplete();
ChannelInboundInvoker fireChannelWritabilityChanged();
```

继承自ChannelOutboundInvoker，表示ChannelPipeline可以进行一些channel的主动操作，如：bind,connect,disconnect,close,deregister,read,write,flush等操作。

继承自Iterable，表示ChannelPipeline是可遍历的，为什么ChannelPipeline是可遍历的呢？

因为ChannelPipeline中可以添加一个或者多个ChannelHandler,ChannelPipeline可以看做是一个ChannelHandler的集合。

比如ChannelPipeline提供了一系列的添加ChannelHandler的方法:

```
ChannelPipeline addFirst(String name, ChannelHandler handler);
ChannelPipeline addFirst(EventExecutorGroup group, String name, ChannelHandler handler);
ChannelPipeline addFirst(EventExecutorGroup group, ChannelHandler... handlers);
ChannelPipeline addFirst(ChannelHandler... handlers);

ChannelPipeline addLast(String name, ChannelHandler handler);
ChannelPipeline addLast(EventExecutorGroup group, String name, ChannelHandler handler);
ChannelPipeline addLast(ChannelHandler... handlers);
ChannelPipeline addLast(EventExecutorGroup group, ChannelHandler... handlers);

ChannelPipeline addBefore(String baseName, String name, ChannelHandler handler);
ChannelPipeline addBefore(EventExecutorGroup group, String baseName, String name, ChannelHandler handler);
ChannelPipeline addAfter(String baseName, String name, ChannelHandler handler);
ChannelPipeline addAfter(EventExecutorGroup group, String baseName, String name, ChannelHandler handler);

```

可以从前面添加，也可以从后面添加，或者从特定的位置添加handler。

另外还可以从pipeline中删除特定的channelHandler，或者移出和替换特定位置的handler：

```
ChannelPipeline remove(ChannelHandler handler);
ChannelHandler remove(String name);
ChannelHandler removeFirst();
ChannelHandler removeLast();
ChannelPipeline replace(ChannelHandler oldHandler, String newName, ChannelHandler newHandler);
ChannelHandler replace(String oldName, String newName, ChannelHandler newHandler);
```

当然，更少不了对应的查询操作：

```
ChannelHandler first();
ChannelHandler last();
ChannelHandler get(String name);
List<String> names();
```

还可以根据传入的ChannelHandler获得handler对应的ChannelHandlerContext。

```
ChannelHandlerContext context(ChannelHandler handler);
```

ChannelPipeline中还有一些触发channel相关的事件，如：

```
    ChannelPipeline fireChannelRegistered();
    ChannelPipeline fireChannelUnregistered();
    ChannelPipeline fireChannelActive();
    ChannelPipeline fireChannelInactive();
    ChannelPipeline fireExceptionCaught(Throwable cause);
    ChannelPipeline fireUserEventTriggered(Object event);
    ChannelPipeline fireChannelRead(Object msg);
    ChannelPipeline fireChannelReadComplete();
    ChannelPipeline fireChannelWritabilityChanged();
```
## 事件传递

那么有些朋友可能会问了，既然ChannelPipeline中包含了很多个handler，那么handler中的事件是怎么传递的呢？

其实这些事件是通过调用ChannelHandlerContext中的相应方法来触发的。

对于Inbound事件来说，可以调用下面的方法，进行事件的传递：

```
ChannelHandlerContext.fireChannelRegistered()
ChannelHandlerContext.fireChannelActive()
ChannelHandlerContext.fireChannelRead(Object)
ChannelHandlerContext.fireChannelReadComplete()
ChannelHandlerContext.fireExceptionCaught(Throwable)
ChannelHandlerContext.fireUserEventTriggered(Object)
ChannelHandlerContext.fireChannelWritabilityChanged()
ChannelHandlerContext.fireChannelInactive()
ChannelHandlerContext.fireChannelUnregistered()
```

对于Outbound事件来说，可以调用下面的方法，进行事件的传递：

```
ChannelHandlerContext.bind(SocketAddress, ChannelPromise)
ChannelHandlerContext.connect(SocketAddress, SocketAddress, ChannelPromise)
ChannelHandlerContext.write(Object, ChannelPromise)
ChannelHandlerContext.flush()
ChannelHandlerContext.read()
ChannelHandlerContext.disconnect(ChannelPromise)
ChannelHandlerContext.close(ChannelPromise)
ChannelHandlerContext.deregister(ChannelPromise)
```

具体而言，就是在handler中调用ChannelHandlerContext中对应的方法：

```
   public class MyInboundHandler extends ChannelInboundHandlerAdapter {
        @Override
       public void channelActive(ChannelHandlerContext ctx) {
           System.out.println("Connected!");
           ctx.fireChannelActive();
       }
   }
  
   public class MyOutboundHandler extends ChannelOutboundHandlerAdapter {
        @Override
       public void close(ChannelHandlerContext ctx, ChannelPromise promise) {
           System.out.println("Closing ..");
           ctx.close(promise);
       }
   }
   
```

# DefaultChannelPipeline

ChannelPipeline有一个官方的实现叫做DefaultChannelPipeline，因为对于pipeline来说，主要的功能就是进行handler的管理和事件传递，相对于而言功能比较简单，但是他也有一些特别的实现地方,比如它有两个AbstractChannelHandlerContext类型的head和tail。

我们知道ChannelPipeline实际上是很多handler的集合，那么这些集合是怎么进行存储的呢？这种存储的数据结构就是AbstractChannelHandlerContext。每个AbstractChannelHandlerContext中都有一个next节点和一个prev节点，用来组成一个双向链表。

同样的在DefaultChannelPipeline中使用head和tail来将封装好的handler存储起来。

注意，这里的head和tail虽然都是AbstractChannelHandlerContext，但是两者有稍许不同。先看下head和tail的定义:

```
    protected DefaultChannelPipeline(Channel channel) {
        this.channel = ObjectUtil.checkNotNull(channel, "channel");
        succeededFuture = new SucceededChannelFuture(channel, null);
        voidPromise =  new VoidChannelPromise(channel, true);

        tail = new TailContext(this);
        head = new HeadContext(this);

        head.next = tail;
        tail.prev = head;
    }
```

在DefaultChannelPipeline的构造函数中，对tail和head进行初始化，其中tail是TailContext，而head是HeadContext。

其中TailContext实现了ChannelInboundHandler接口：

```
final class TailContext extends AbstractChannelHandlerContext implements ChannelInboundHandler
```

而HeadContext实现了ChannelOutboundHandler和ChannelInboundHandler接口：

```
final class HeadContext extends AbstractChannelHandlerContext
            implements ChannelOutboundHandler, ChannelInboundHandler 
```

下面我们以addFirst方法为例，来看一下handler是怎么被加入pipline的：

```
    public final ChannelPipeline addFirst(EventExecutorGroup group, String name, ChannelHandler handler) {
        final AbstractChannelHandlerContext newCtx;
        synchronized (this) {
            checkMultiplicity(handler);
            name = filterName(name, handler);

            newCtx = newContext(group, name, handler);

            addFirst0(newCtx);

            // If the registered is false it means that the channel was not registered on an eventLoop yet.
            // In this case we add the context to the pipeline and add a task that will call
            // ChannelHandler.handlerAdded(...) once the channel is registered.
            if (!registered) {
                newCtx.setAddPending();
                callHandlerCallbackLater(newCtx, true);
                return this;
            }

            EventExecutor executor = newCtx.executor();
            if (!executor.inEventLoop()) {
                callHandlerAddedInEventLoop(newCtx, executor);
                return this;
            }
        }
        callHandlerAdded0(newCtx);
        return this;
    }
```

它的工作逻辑是首先根据传入的handler构建一个新的context，然后调用addFirst0方法，将context加入AbstractChannelHandlerContext组成的双向链表中：

```
    private void addFirst0(AbstractChannelHandlerContext newCtx) {
        AbstractChannelHandlerContext nextCtx = head.next;
        newCtx.prev = head;
        newCtx.next = nextCtx;
        head.next = newCtx;
        nextCtx.prev = newCtx;
    }
```

然后调用callHandlerAdded0方法来触发context的handlerAdded方法。

# 总结

channelPipeline负责管理channel的各种handler，在DefaultChannelPipeline中使用了AbstractChannelHandlerContext的head和tail来对多个handler进行存储，同时借用这个链式结构对handler进行各种管理，非常方便。













