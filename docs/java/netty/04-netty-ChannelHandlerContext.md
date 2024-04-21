---
slug: /04-4-netty-ChannelHandlerContext
---

# 9. netty系列之:channelHandlerContext详解



# 简介

我们知道ChannelHandler有两个非常重要的子接口，分别是ChannelOutboundHandler和ChannelInboundHandler,基本上这两个handler接口定义了所有channel inbound和outbound的处理逻辑。

不管是ChannelHandler还是ChannelOutboundHandler和ChannelInboundHandler，几乎他们中所有的方法都带有一个ChannelHandlerContext参数，那么这个ChannelHandlerContext到底是做什么用的呢？它和handler、channel有什么关系呢？

# ChannelHandlerContext和它的应用

熟悉netty的朋友应该都接触过ChannelHandlerContext，如果没有的话，这里有一个简单的handler的例子：

```
public class ChatServerHandler extends SimpleChannelInboundHandler<String> {

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        log.info("accepted channel: {}", ctx.channel());
        log.info("accepted channel parent: {}", ctx.channel().parent());
        // channel活跃
        ctx.write("Channel Active状态!\r\n");
        ctx.flush();
    }
}
```

这里的handler继承了SimpleChannelInboundHandler，只需要实现对应的方法即可。这里实现的是channelActive方法，在channelActive方法中，传入了一个ChannelHandlerContext参数，我们可以通过使用ChannelHandlerContext来调用它的一些方法。

先来看一下ChannelHandlerContext的定义：

```
public interface ChannelHandlerContext extends AttributeMap, ChannelInboundInvoker, ChannelOutboundInvoker {
```

首先ChannelHandlerContext是一个AttributeMap，可以用来存储多个数据。

然后ChannelHandlerContext继承了ChannelInboundInvoker和ChannelOutboundInvoker,可以触发inbound和outbound的一些方法。

除了继承来的一些方法之外，ChannelHandlerContext还可以作为channel，handler和pipline的沟通桥梁，因为可以从ChannelHandlerContext中获取到对应的channel，handler和pipline：

```
Channel channel();
ChannelHandler handler();
ChannelPipeline pipeline();
```

还要注意的是ChannelHandlerContext还返回一个EventExecutor，用来执行特定的任务：

```
EventExecutor executor();
```

接下来，我们具体看一下ChannelHandlerContext的实现。

# AbstractChannelHandlerContext

AbstractChannelHandlerContext是ChannelHandlerContext的一个非常重要的实现，虽然AbstractChannelHandlerContext是一个抽象类，但是它基本上实现了ChannelHandlerContext的所有功能。

首先看一下AbstractChannelHandlerContext的定义：

```
abstract class AbstractChannelHandlerContext implements ChannelHandlerContext, ResourceLeakHint
```

AbstractChannelHandlerContext是ChannelHandlerContext的一个具体实现。

通常来说一个handler对应一个ChannelHandlerContext，但是在一个程序中可能会有多于一个handler，那么如何在一个handler中获取其他的handler呢？

在AbstractChannelHandlerContext中有两个同样是AbstractChannelHandlerContext类型的next和prev,从而使得多个AbstractChannelHandlerContext可以构建一个双向链表。从而可以在一个ChannelHandlerContext中，获取其他的ChannelHandlerContext，从而获得handler处理链。

```
    volatile AbstractChannelHandlerContext next;
    volatile AbstractChannelHandlerContext prev;
```

AbstractChannelHandlerContext中的pipeline和executor都是通过构造函数传入的：

```
    AbstractChannelHandlerContext(DefaultChannelPipeline pipeline, EventExecutor executor,
                                  String name, Class<? extends ChannelHandler> handlerClass) {
        this.name = ObjectUtil.checkNotNull(name, "name");
        this.pipeline = pipeline;
        this.executor = executor;
        this.executionMask = mask(handlerClass);
        // Its ordered if its driven by the EventLoop or the given Executor is an instanceof OrderedEventExecutor.
        ordered = executor == null || executor instanceof OrderedEventExecutor;
    }
```

可能有朋友会有疑问了，ChannelHandlerContext中的channel和handler是如何得到的呢？

对于channel来说，是通过pipeline来获取的：

```
public Channel channel() {
        return pipeline.channel();
    }
```

对于handler来说，在AbstractChannelHandlerContext中并没有对其进行实现，需要在继承AbstractChannelHandlerContext的类中进行实现。

对于EventExecutor来说,可以通过构造函数向AbstractChannelHandlerContext传入一个新的EventExecutor，如果没有传入或者传入为空的话，则会使用channel中自带的EventLoop:

```
    public EventExecutor executor() {
        if (executor == null) {
            return channel().eventLoop();
        } else {
            return executor;
        }
    }
```

因为EventLoop继承自OrderedEventExecutor,所以它也是一个EventExecutor。

EventExecutor主要用来异步提交任务来执行,事实上ChannelHandlerContext中几乎所有来自于ChannelInboundInvoker和ChannelOutboundInvoker的方法都是通过EventExecutor来执行的。

对于ChannelInboundInvoker来说，我们以方法fireChannelRegistered为例：

```
    public ChannelHandlerContext fireChannelRegistered() {
        invokeChannelRegistered(findContextInbound(MASK_CHANNEL_REGISTERED));
        return this;
    }

    static void invokeChannelRegistered(final AbstractChannelHandlerContext next) {
        EventExecutor executor = next.executor();
        if (executor.inEventLoop()) {
            next.invokeChannelRegistered();
        } else {
            executor.execute(new Runnable() {
                @Override
                public void run() {
                    next.invokeChannelRegistered();
                }
            });
        }
    }
```

fireChannelRegistered调用了invokeChannelRegistered方法，invokeChannelRegistered则调用EventExecutor的execute方法，将真实的调用逻辑封装在一个runnable类中执行。

注意，在调用executor.execute方法之前有一个executor是否在eventLoop中的判断。如果executor已经在eventLoop中了，那么直接执行任务即可，不需要启用新的线程。

对于ChannelOutboundInvoker来说，我们以bind方法为例，看一下EventExecutor是怎么使用的：

```
    public ChannelFuture bind(final SocketAddress localAddress, final ChannelPromise promise) {
        ObjectUtil.checkNotNull(localAddress, "localAddress");
        if (isNotValidPromise(promise, false)) {
            // cancelled
            return promise;
        }

        final AbstractChannelHandlerContext next = findContextOutbound(MASK_BIND);
        EventExecutor executor = next.executor();
        if (executor.inEventLoop()) {
            next.invokeBind(localAddress, promise);
        } else {
            safeExecute(executor, new Runnable() {
                @Override
                public void run() {
                    next.invokeBind(localAddress, promise);
                }
            }, promise, null, false);
        }
        return promise;
    }
```

可以看到执行的逻辑和invokeChannelRegistered方法很类似，也是先判断executor在不在eventLoop中，如果在的话直接执行，如果不在则放在executor中执行。

上面的两个例子中都调用了next的相应方法，分别是next.invokeChannelRegistered和next.invokeBind。

我们知道ChannelHandlerContext只是一个封装，它本身并没有太多的业务逻辑，所以next调用的相应方法，实际上是Context中封装的ChannelInboundHandler和ChannelOutboundHandler中的业务逻辑，如下所示：

```
    private void invokeUserEventTriggered(Object event) {
        if (invokeHandler()) {
            try {
                ((ChannelInboundHandler) handler()).userEventTriggered(this, event);
            } catch (Throwable t) {
                invokeExceptionCaught(t);
            }
        } else {
            fireUserEventTriggered(event);
        }
    }
```

```
    private void invokeBind(SocketAddress localAddress, ChannelPromise promise) {
        if (invokeHandler()) {
            try {
                ((ChannelOutboundHandler) handler()).bind(this, localAddress, promise);
            } catch (Throwable t) {
                notifyOutboundHandlerException(t, promise);
            }
        } else {
            bind(localAddress, promise);
        }
    }
```

所以，从AbstractChannelHandlerContext可以得知，ChannelHandlerContext接口中定义的方法都是调用的handler中具体的实现，Context只是对handler的封装。

# DefaultChannelHandlerContext

DefaultChannelHandlerContext是AbstractChannelHandlerContext的一个具体实现。

我们在讲解AbstractChannelHandlerContext的时候提到过，AbstractChannelHandlerContext中并没有定义具体的handler的实现，而这个实现是在DefaultChannelHandlerContext中进行的。

DefaultChannelHandlerContext很简单，我们看一下它的具体实现：

```
final class DefaultChannelHandlerContext extends AbstractChannelHandlerContext {

    private final ChannelHandler handler;

    DefaultChannelHandlerContext(
            DefaultChannelPipeline pipeline, EventExecutor executor, String name, ChannelHandler handler) {
        super(pipeline, executor, name, handler.getClass());
        this.handler = handler;
    }

    @Override
    public ChannelHandler handler() {
        return handler;
    }
}
```

DefaultChannelHandlerContext中额外提供了一个ChannelHandler属性，用来存储传入的ChannelHandler。

到此DefaultChannelHandlerContext可以传入ChannelHandlerContext中一切必须的handler，channel，pipeline和EventExecutor。

# 总结

本节我们介绍了ChannelHandlerContext和它的几个基本实现，了解到了ChannelHandlerContext是对handler，channel和pipline的封装，ChannelHandlerContext中的业务逻辑，实际上是调用的是底层的handler的对应方法。这也是我们在自定义handler中需要实现的方法。       






