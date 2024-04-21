---
slug: /05-1-netty-eventloop-eventloopgroup
---

# 13. netty系列之:EventLoop,EventLoopGroup和netty的默认实现



# 简介

在netty中不管是服务器端的ServerBootstrap还是客户端的Bootstrap，在创建的时候都需要在group方法中传入一个EventLoopGroup参数，用来处理所有的ServerChannel和Channel中所有的IO操作和event。

可能有的小伙伴还稍微看了一下netty的源码，可能会发现还有一个和EventLoopGroup非常类似的类叫做EventLoop。那么EventLoopGroup和EventLoop有什么关系呢？他们的底层和channel的交互关系是怎么样的呢？一起来看看吧。

# EventLoopGroup和EventLoop

EventLoopGroup继承自EventExecutorGroup:

```
public interface EventLoopGroup extends EventExecutorGroup 
```

在前面的文章中我们讲过，EventExecutorGroup中有一个next方法可以返回对应的EventExecutor，这个方法在EventLoopGroup中进行了重写：

```
    EventLoop next();
```

next方法返回的不再是一个EventExecutor，而是一个EventLoop。

事实上，EventLoop和EventLoopGroup的关系与EventExecutor和EventExecutorGroup的关系有些类似，EventLoop也是继承自EventLoopGroup，EventLoopGroup是EventLoop的集合。

```
public interface EventLoop extends OrderedEventExecutor, EventLoopGroup 
```

在EventLoopGroup中，除了重写的next方法之外，还添加了channel的注册方法register,用于将channel和注册到EventLoop中，从而实现channel和EventLoop的绑定。

```
ChannelFuture register(Channel channel);
```

在EventLoop中，自多添加了一个parent方法，用来表示EventLoop和EventLoopGroup的关联关系：

```
EventLoopGroup parent();
```

# EventLoopGroup在netty中的默认实现

EventLoopGroup在netty中的默认实现叫做DefaultEventLoopGroup，先来看一下它的继承关系：

<img src="https://img-blog.csdnimg.cn/119283e9b8d04854940abc0fc159c604.png" style="zoom:67%;" />

如果看了之前我讲解的关于EventExecutorGroup的朋友可以看出来，DefaultEventLoopGroup和DefaultEventExecutorGroup的继承关系是很类似的，DefaultEventLoopGroup继承自MultithreadEventLoopGroup,而MultithreadEventLoopGroup又继承自MultithreadEventExecutorGroup并且实现了EventLoopGroup接口：

```
public abstract class MultithreadEventLoopGroup extends MultithreadEventExecutorGroup implements EventLoopGroup 
```

MultithreadEventLoopGroup是用多线程来处理Event Loop。

在MultithreadEventLoopGroup中定义了一个DEFAULT_EVENT_LOOP_THREADS来存储默认的处理Event Loop线程的个数：

```
DEFAULT_EVENT_LOOP_THREADS = Math.max(1, SystemPropertyUtil.getInt(
                "io.netty.eventLoopThreads", NettyRuntime.availableProcessors() * 2));
```

对于EventLoopGroup中新加的几个register方法，MultithreadEventLoopGroup都是调用对应的next方法来实现的：

```
public ChannelFuture register(Channel channel) {
        return next().register(channel);
    }
```

这里的next()方法的实现实际上调用的是父类的next方法，也就是MultithreadEventExecutorGroup中的next方法，来选择Group管理的一个EventLoop:

```
public EventLoop next() {
        return (EventLoop) super.next();
    }
```

对于DefaultEventLoopGroup来说，它继承自MultithreadEventLoopGroup，实现了一个newChild方法，用来将传入的executor封装成为EventLoop:

```
    protected EventLoop newChild(Executor executor, Object... args) throws Exception {
        return new DefaultEventLoop(this, executor);
    }
```

# EventLoop在netty中的默认实现

EventLoop在netty中的默认实现叫做DefaultEventLoop，先来看下它的继承关系：

<img src="https://img-blog.csdnimg.cn/9c642b58f6c248f9bddfbb71799549f9.png" style="zoom:67%;" />

DefaultEventLoop继承自SingleThreadEventLoop,而SingleThreadEventLoop又继承自SingleThreadEventExecutor并且实现了EventLoop接口。

先来看下SingleThreadEventLoop的实现：

```
public abstract class SingleThreadEventLoop extends SingleThreadEventExecutor implements EventLoop 
```

SingleThreadEventLoop使用单一线程来执行提交的任务。它和SingleThreadEventExecutor相比有什么变化呢？

首先 提供了一个tailTasks用来存储pending的tasks：

```
private final Queue<Runnable> tailTasks;
```

这个tailTasks会被用在任务个数的判断和操作上：

```
    final boolean removeAfterEventLoopIterationTask(Runnable task) {
        return tailTasks.remove(ObjectUtil.checkNotNull(task, "task"));
    }

    protected boolean hasTasks() {
        return super.hasTasks() || !tailTasks.isEmpty();
    }

    public int pendingTasks() {
        return super.pendingTasks() + tailTasks.size();
    }
```

SingleThreadEventLoop中对register方法的实现最终调用的是注册的channel中unsafe的register方法：

```
channel.unsafe().register(this, promise);
```

再来看一下DefaultEventLoop，DefaultEventLoop继承自SingleThreadEventLoop:

```
public class DefaultEventLoop extends SingleThreadEventLoop 
```

除了构造函数之外，DefaultEventLoop实现了一个run方法,用来具体任务的执行逻辑：

```
    protected void run() {
        for (;;) {
            Runnable task = takeTask();
            if (task != null) {
                task.run();
                updateLastExecutionTime();
            }

            if (confirmShutdown()) {
                break;
            }
        }
    }
```

如果对比可以发现，DefaultEventLoop和DefaultEventExecutor中run方法的实现是一样的。

# 总结

本文介绍了netty中EventLoop和EventLoopGroup的默认实现：DefaultEventLoop和DefaultEventLoopGroup，但是不知道小伙伴们有没有发现，即使在最简单的netty应用中也很少看到这两个默认的EventLoop。最常用的反而是NioEventLoopGroup和NioEventLoop，这是因为DefaultEventLoop和DefaultEventLoopGroup只是使用了多线程技术，一个线程代表一个EventLoop，在EventLoop过多的情况下可能会造成线程和性能的浪费，所以在NioEventLoopGroup和NioEventLoop使用了NIO技术，通过使用channel、selector等NIO技术提升了EventLoop的效率。关于NioEventLoopGroup和NioEventLoop的详细介绍，我们会在后一章中详细讲解，敬请期待。



















