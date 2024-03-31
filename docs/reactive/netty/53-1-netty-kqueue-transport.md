---
slug: /53-1-netty-kqueue-transport
---

# 77. netty系列之:kequeue传输协议详解



# 简介

在前面的章节中，我们介绍了在netty中可以使用kequeue或者epoll来实现更为高效的native传输方式。那么kequeue和epoll和NIO传输协议有什么不同呢？

本章将会以kequeue为例进行深入探讨。

在上面我们介绍的native的例子中，关于kqueue的类有这样几个，分别是KQueueEventLoopGroup,KQueueServerSocketChannel和KQueueSocketChannel,通过简单的替换和添加对应的依赖包，我们可以轻松的将普通的NIO netty服务替换成为native的Kqueue服务。

是时候揭开Kqueue的秘密了。

# KQueueEventLoopGroup

eventLoop和eventLoopGroup是用来接受event和事件处理的。先来看下KQueueEventLoopGroup的定义：

```
public final class KQueueEventLoopGroup extends MultithreadEventLoopGroup
```

作为一个MultithreadEventLoopGroup，必须实现一个newChild方法，用来创建child EventLoop。在KQueueEventLoopGroup中，除了构造函数之外，额外需要实现的方法就是newChild：

```
    protected EventLoop newChild(Executor executor, Object... args) throws Exception {
        Integer maxEvents = (Integer) args[0];
        SelectStrategyFactory selectStrategyFactory = (SelectStrategyFactory) args[1];
        RejectedExecutionHandler rejectedExecutionHandler = (RejectedExecutionHandler) args[2];
        EventLoopTaskQueueFactory taskQueueFactory = null;
        EventLoopTaskQueueFactory tailTaskQueueFactory = null;

        int argsLength = args.length;
        if (argsLength > 3) {
            taskQueueFactory = (EventLoopTaskQueueFactory) args[3];
        }
        if (argsLength > 4) {
            tailTaskQueueFactory = (EventLoopTaskQueueFactory) args[4];
        }
        return new KQueueEventLoop(this, executor, maxEvents,
                selectStrategyFactory.newSelectStrategy(),
                rejectedExecutionHandler, taskQueueFactory, tailTaskQueueFactory);
    }
```

newChild中的所有参数都是从KQueueEventLoopGroup的构造函数中传入的。除了maxEvents，selectStrategyFactory和rejectedExecutionHandler之外，还可以接收taskQueueFactory和tailTaskQueueFactory两个参数，最后把这些参数都传到KQueueEventLoop的构造函数中去，最终返回一个KQueueEventLoop对象。

另外在使用KQueueEventLoopGroup之前我们还需要确保Kqueue在系统中是可用的，这个判断是通过调用`KQueue.ensureAvailability();`来实现的。

KQueue.ensureAvailability首先判断是否定义了系统属性io.netty.transport.noNative，如果定了，说明native transport被禁用了，后续也就没有必要再进行判断了。

如果io.netty.transport.noNative没有被定义，那么会调用`Native.newKQueue()`来尝试从native中获取一个kqueue的FileDescriptor，如果上述的获取过程中没有任何异常，则说明kqueue在native方法中存在，我们可以继续使用了。

以下是判断kqueue是否可用的代码：

```
    static {
        Throwable cause = null;
        if (SystemPropertyUtil.getBoolean("io.netty.transport.noNative", false)) {
            cause = new UnsupportedOperationException(
                    "Native transport was explicit disabled with -Dio.netty.transport.noNative=true");
        } else {
            FileDescriptor kqueueFd = null;
            try {
                kqueueFd = Native.newKQueue();
            } catch (Throwable t) {
                cause = t;
            } finally {
                if (kqueueFd != null) {
                    try {
                        kqueueFd.close();
                    } catch (Exception ignore) {
                        // ignore
                    }
                }
            }
        }
        UNAVAILABILITY_CAUSE = cause;
    }
```


# KQueueEventLoop

KQueueEventLoop是从KQueueEventLoopGroup中创建出来的，用来执行具体的IO任务。

先来看一下KQueueEventLoop的定义：

```
final class KQueueEventLoop extends SingleThreadEventLoop 
```

不管是NIO还是KQueue或者是Epoll，因为使用了更加高级的IO技术，所以他们使用的EventLoop都是SingleThreadEventLoop,也就是说使用单线程就够了。

和KQueueEventLoopGroup一样，KQueueEventLoop也需要判断当前的系统环境是否支持kqueue:

```
    static {
        KQueue.ensureAvailability();
    }
```

上一节讲到了，KQueueEventLoopGroup会调用KQueueEventLoop的构造函数来返回一个eventLoop对象， 我们先来看下KQueueEventLoop的构造函数：

```
    KQueueEventLoop(EventLoopGroup parent, Executor executor, int maxEvents,
                    SelectStrategy strategy, RejectedExecutionHandler rejectedExecutionHandler,
                    EventLoopTaskQueueFactory taskQueueFactory, EventLoopTaskQueueFactory tailTaskQueueFactory) {
        super(parent, executor, false, newTaskQueue(taskQueueFactory), newTaskQueue(tailTaskQueueFactory),
                rejectedExecutionHandler);
        this.selectStrategy = ObjectUtil.checkNotNull(strategy, "strategy");
        this.kqueueFd = Native.newKQueue();
        if (maxEvents == 0) {
            allowGrowing = true;
            maxEvents = 4096;
        } else {
            allowGrowing = false;
        }
        this.changeList = new KQueueEventArray(maxEvents);
        this.eventList = new KQueueEventArray(maxEvents);
        int result = Native.keventAddUserEvent(kqueueFd.intValue(), KQUEUE_WAKE_UP_IDENT);
        if (result < 0) {
            cleanup();
            throw new IllegalStateException("kevent failed to add user event with errno: " + (-result));
        }
    }
```

传入的maxEvents表示的是这个KQueueEventLoop能够接受的最大的event个数。如果maxEvents=0,则表示KQueueEventLoop的event容量可以动态扩展，并且最大值是4096。否则的话，KQueueEventLoop的event容量不能扩展。

maxEvents是作为数组的大小用来构建changeList和eventList。

KQueueEventLoop中还定义了一个map叫做channels,用来保存注册的channels：

```
private final IntObjectMap<AbstractKQueueChannel> channels = new IntObjectHashMap<AbstractKQueueChannel>(4096);
```

来看一下channel的add和remote方法：

```
    void add(AbstractKQueueChannel ch) {
        assert inEventLoop();
        AbstractKQueueChannel old = channels.put(ch.fd().intValue(), ch);
        assert old == null || !old.isOpen();
    }

    void remove(AbstractKQueueChannel ch) throws Exception {
        assert inEventLoop();
        int fd = ch.fd().intValue();
        AbstractKQueueChannel old = channels.remove(fd);
        if (old != null && old != ch) {
            channels.put(fd, old);
            assert !ch.isOpen();
        } else if (ch.isOpen()) {
            ch.unregisterFilters();
        }
    }
```

可以看到添加和删除的都是AbstractKQueueChannel，后面的章节中我们会详细讲解KQueueChannel，这里我们只需要知道channel map中的key是kequeue中特有的FileDescriptor的int值。

再来看一下EventLoop中最重要的run方法：

```
   protected void run() {
        for (;;) {
            try {
                int strategy = selectStrategy.calculateStrategy(selectNowSupplier, hasTasks());
                switch (strategy) {
                    case SelectStrategy.CONTINUE:
                        continue;

                    case SelectStrategy.BUSY_WAIT:
          
                    case SelectStrategy.SELECT:
                        strategy = kqueueWait(WAKEN_UP_UPDATER.getAndSet(this, 0) == 1);
                        if (wakenUp == 1) {
                            wakeup();
                        }
                    default:
                }

                final int ioRatio = this.ioRatio;
                if (ioRatio == 100) {
                    try {
                        if (strategy > 0) {
                            processReady(strategy);
                        }
                    } finally {
                        runAllTasks();
                    }
                } else {
                    final long ioStartTime = System.nanoTime();

                    try {
                        if (strategy > 0) {
                            processReady(strategy);
                        }
                    } finally {
                        final long ioTime = System.nanoTime() - ioStartTime;
                        runAllTasks(ioTime * (100 - ioRatio) / ioRatio);
                    }
```

它的逻辑是先使用selectStrategy.calculateStrategy获取当前的select strategy,然后根据strategy的值来判断是否需要执行processReady方法，最后执行runAllTasks,从task queue中拿到要执行的任务去执行。

selectStrategy.calculateStrategy用来判断当前的select状态，默认情况下有三个状态，分别是：SELECT,CONTINUE,BUSY_WAIT。 这三个状态都是负数：

```
    int SELECT = -1;

    int CONTINUE = -2;

    int BUSY_WAIT = -3;
```

分别表示当前的IO在slect的block状态，或者跳过当前IO的状态，和正在IO loop pull的状态。BUSY_WAIT是一个非阻塞的IO PULL，kqueue并不支持，所以会fallback到SELECT。

除了这三个状态之外，calculateStrategy还会返回一个正值，表示当前要执行的任务的个数。

在run方法中，如果strategy的结果是SELECT，那么最终会调用Native.keventWait方法返回当前ready的events个数,并且将ready的event放到KQueueEventArray的eventList中去。

如果ready的event个数大于零，则会调用processReady方法对这些event进行状态回调处理。

怎么处理的呢？下面是处理的核心逻辑：

```
            AbstractKQueueChannel channel = channels.get(fd);

            AbstractKQueueUnsafe unsafe = (AbstractKQueueUnsafe) channel.unsafe();

            if (filter == Native.EVFILT_WRITE) {
                unsafe.writeReady();
            } else if (filter == Native.EVFILT_READ) {
                unsafe.readReady(eventList.data(i));
            } else if (filter == Native.EVFILT_SOCK && (eventList.fflags(i) & Native.NOTE_RDHUP) != 0) {
                unsafe.readEOF();
            }
```

这里的fd是从eventList中读取到的：

```
final int fd = eventList.fd(i);
```

根据eventList的fd，我们可以从channels中拿到对应的KQueueChannel,然后根据event的filter状态来决定KQueueChannel的具体操作，是writeReady，readReady或者readEOF。

最后就是执行runAllTasks方法了，runAllTasks的逻辑很简单，就是从taskQueue中读取任务然后执行。

# KQueueServerSocketChannel和KQueueSocketChannel

KQueueServerSocketChannel是用在server端的channel：

```
public final class KQueueServerSocketChannel extends AbstractKQueueServerChannel implements ServerSocketChannel {
```

KQueueServerSocketChannel继承自AbstractKQueueServerChannel,除了构造函数之外，最重要的一个方法就是newChildChannel：

```
    @Override
    protected Channel newChildChannel(int fd, byte[] address, int offset, int len) throws Exception {
        return new KQueueSocketChannel(this, new BsdSocket(fd), address(address, offset, len));
    }
```

这个方法用来创建一个新的child channel。从上面的代码中，我们可以看到生成的child channel是一个KQueueSocketChannel的实例。

它的构造函数接受三个参数，分别是parent channel，BsdSocket和InetSocketAddress。

```
    KQueueSocketChannel(Channel parent, BsdSocket fd, InetSocketAddress remoteAddress) {
        super(parent, fd, remoteAddress);
        config = new KQueueSocketChannelConfig(this);
    }
```

这里的fd是socket accept acceptedAddress的结果:

```
int acceptFd = socket.accept(acceptedAddress);
```

下面是KQueueSocketChannel的定义：

```
public final class KQueueSocketChannel extends AbstractKQueueStreamChannel implements SocketChannel {
```

KQueueSocketChannel和KQueueServerSocketChannel的关系是父子的关系，在KQueueSocketChannel中有一个parent方法，用来返回ServerSocketChannel对象,这也是前面提到的newChildChannel方法中传入KQueueSocketChannel构造函数中的serverChannel：

```
public ServerSocketChannel parent() {
        return (ServerSocketChannel) super.parent();
    }
```

KQueueSocketChannel还有一个特性就是支持tcp fastopen,它的本质是调用BsdSocket的connectx方法，在建立连接的同时传递数据：

```
int bytesSent = socket.connectx(
                                (InetSocketAddress) localAddress, (InetSocketAddress) remoteAddress, iov, true);
```

# 总结

以上就是KqueueEventLoop和KqueueSocketChannel的详细介绍，基本上和NIO没有太大的区别，只不过性能根据优秀。






















