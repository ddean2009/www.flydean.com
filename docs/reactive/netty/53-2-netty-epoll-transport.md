---
slug: /53-2-netty-epoll-transport
---

# 78. netty系列之:epoll传输协议详解



# 简介

在前面的章节中，我们讲解了kqueue的使用和原理，接下来我们再看一下epoll的使用。两者都是更加高级的IO方式，都需要借助native的方法实现，不同的是Kqueue用在mac系统中，而epoll用在liunx系统中。

# epoll的详细使用

epoll的使用也很简单，我们还是以常用的聊天室为例来讲解epoll的使用。

对于server端来说需要创建bossGroup和workerGroup,在NIO中这两个group是NIOEventLoopGroup,在epoll中则需要使用EpollEventLoopGroup:

```
        EventLoopGroup bossGroup = new EpollEventLoopGroup(1);
        EventLoopGroup workerGroup = new EpollEventLoopGroup();
```

接着需要将bossGroup和workerGroup传入到ServerBootstrap中：

```
ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(EpollServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new NativeChatServerInitializer());
```

注意，这里传入的channel是EpollServerSocketChannel，专门用来处理epoll的请求。其他的部分和普通的NIO服务是一样的。

接下来看下epoll的客户端，对于客户端来说需要创建一个EventLoopGroup,这里使用的是EpollEventLoopGroup:

```
EventLoopGroup group = new EpollEventLoopGroup();
```

然后将这个group传入Bootstrap中去:

```
Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(EpollSocketChannel.class)
             .handler(new NativeChatClientInitializer());
```

这里使用的channel是EpollSocketChannel，是和EpollServerSocketChannel对应的客户端的channel。

# EpollEventLoopGroup

先看下EpollEventLoopGroup的定义：

```
public final class EpollEventLoopGroup extends MultithreadEventLoopGroup 
```

和KqueueEventLoopGroup一样，EpollEventLoopGroup也是继承自MultithreadEventLoopGroup，表示它可以开启多个线程。

在使用EpollEventLoopGroup之前，需要确保epoll相关的JNI接口都已经准备完毕：

```
Epoll.ensureAvailability();
```

newChild方法用来生成EpollEventLoopGroup的子EventLoop:

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
        return new EpollEventLoop(this, executor, maxEvents,
                selectStrategyFactory.newSelectStrategy(),
                rejectedExecutionHandler, taskQueueFactory, tailTaskQueueFactory);
    }
```

从方法中可以看到，newChild接受一个executor和多个额外的参数，这些参数分别是SelectStrategyFactory，RejectedExecutionHandler，taskQueueFactory和tailTaskQueueFactory，最终将这些参数传入EpollEventLoop中，返回一个新的EpollEventLoop对象。

# EpollEventLoop

EpollEventLoop是由EpollEventLoopGroup通过使用new child方法来创建的。

对于EpollEventLoop本身来说，是一个SingleThreadEventLoop:

```
class EpollEventLoop extends SingleThreadEventLoop 
```

借助于native epoll IO的强大功能，EpollEventLoop可以在单线程的情况下快速进行业务处理，十分优秀。

和EpollEventLoopGroup一样，EpollEventLoop在初始化的时候需要检测系统是否支持epoll:

```
    static {
        Epoll.ensureAvailability();
    }
```

在EpollEventLoopGroup调用的EpollEventLoop的构造函数中，初始化了三个FileDescriptor,分别是epollFd,eventFd和timerFd,这三个FileDescriptor都是调用Native方法创建的：

```
this.epollFd = epollFd = Native.newEpollCreate();
this.eventFd = eventFd = Native.newEventFd();
this.timerFd = timerFd = Native.newTimerFd();
```

然后调用Native.epollCtlAdd建立FileDescriptor之间的关联关系：

```
Native.epollCtlAdd(epollFd.intValue(), eventFd.intValue(), Native.EPOLLIN | Native.EPOLLET);
Native.epollCtlAdd(epollFd.intValue(), timerFd.intValue(), Native.EPOLLIN | Native.EPOLLET);
```

在EpollEventLoop的run方法中，首先会调用`selectStrategy.calculateStrategy`方法，拿到当前的select状态，默认情况下有三个状态，分别是：

```
    int SELECT = -1;

    int CONTINUE = -2;

    int BUSY_WAIT = -3;
```

这三个状态我们在kqueue中已经介绍过了，不同的是epoll支持BUSY_WAIT状态，在BUSY_WAIT状态下，会去调用`Native.epollBusyWait(epollFd, events)`方法返回busy wait的event个数。

如果是在select状态下，则会去调用`Native.epollWait(epollFd, events, 1000)`方法返回wait状态下的event个数。

接下来会分别调用`processReady(events, strategy)`和`runAllTasks`方法，进行event的ready状态回调处理和最终的任务执行。

# EpollServerSocketChannel

先看下EpollServerSocketChannel的定义：

```
public final class EpollServerSocketChannel extends AbstractEpollServerChannel implements ServerSocketChannel
```

EpollServerSocketChannel继承自AbstractEpollServerChannel并且实现了ServerSocketChannel接口。

EpollServerSocketChannel的构造函数需要传入一个LinuxSocket：

```
    EpollServerSocketChannel(LinuxSocket fd) {
        super(fd);
        config = new EpollServerSocketChannelConfig(this);
    }
```

LinuxSocket是一个特殊的socket,用来处理和linux的native socket连接。

EpollServerSocketChannelConfig是构建EpollServerSocketChannel的配置，这里用到了4个配置选项，分别是SO_REUSEPORT,IP_FREEBIND,IP_TRANSPARENT,TCP_DEFER_ACCEPT和TCP_MD5SIG。每个配置项都对应着网络协议的特定含义。


我们再看一下EpollServerSocketChannel的newChildChannel方法：

```
    protected Channel newChildChannel(int fd, byte[] address, int offset, int len) throws Exception {
        return new EpollSocketChannel(this, new LinuxSocket(fd), address(address, offset, len));
    }
```

newChildChannel和KqueueServerSocketChannel方法一样，也是返回一个EpollSocketChannel，并且将传入的fd构造成为LinuxSocket。

# EpollSocketChannel

EpollSocketChannel是由EpollServerSocketChannel创建返回的，先来看下EpollSocketChannel的定义：

```
public final class EpollSocketChannel extends AbstractEpollStreamChannel implements SocketChannel {
```

可以看到EpollSocketChannel继承自AbstractEpollStreamChannel，并且实现了SocketChannel接口。

回到之前EpollServerSocketChannel创建EpollSocketChannel时调用的newChildChannel方法，这个方法会调用EpollSocketChannel的构造函数如下所示：

```
    EpollSocketChannel(Channel parent, LinuxSocket fd, InetSocketAddress remoteAddress) {
        super(parent, fd, remoteAddress);
        config = new EpollSocketChannelConfig(this);

        if (parent instanceof EpollServerSocketChannel) {
            tcpMd5SigAddresses = ((EpollServerSocketChannel) parent).tcpMd5SigAddresses();
        }
    }
```

从代码的逻辑可以看到，如果EpollSocketChannel是从EpollServerSocketChannel创建出来的话，那么默认会开启tcpMd5Sig的特性。

什么是tcpMd5Sig呢？

简单点说，tcpMd5Sig就是在TCP的数据报文中添加了MD5 sig,用来进行数据的校验，从而提示数据传输的安全性。

TCP MD5是在RFC 2385中提出的，并且只在linux内核中才能开启，也就是说如果你想使用tcpMd5Sig，那么必须使用EpollServerSocketChannel和EpollSocketChannel。

所以如果是追求性能或者特殊使用场景的朋友，需要接触这种native transport的时候还是很多的,可以仔细研究其中的配置选项。

再看一下EpollSocketChannel中非常重要的doConnect0方法：

```
    boolean doConnect0(SocketAddress remote) throws Exception {
        if (IS_SUPPORTING_TCP_FASTOPEN_CLIENT && config.isTcpFastOpenConnect()) {
            ChannelOutboundBuffer outbound = unsafe().outboundBuffer();
            outbound.addFlush();
            Object curr;
            if ((curr = outbound.current()) instanceof ByteBuf) {
                ByteBuf initialData = (ByteBuf) curr;
                long localFlushedAmount = doWriteOrSendBytes(
                        initialData, (InetSocketAddress) remote, true);
                if (localFlushedAmount > 0) {
                    outbound.removeBytes(localFlushedAmount);
                    return true;
                }
            }
        }
        return super.doConnect0(remote);
    }
```

在这个方法中会首先判断是否开启了TcpFastOpen选项，如果开启了该选项，那么最终会调用LinuxSocket的write或者sendTo方法，这些方法可以添加初始数据，可以在建立连接的同时传递数据，从而达到Tcp fast open的效果。

如果不是tcp fast open,那么需要调用Socket的connect方法去建立传统的连接。

# 总结

epoll在netty中的实现和kqueue很类似，他们的不同在于运行的平台和具体的功能参数，如果追求高性能的朋友可以深入研究。

本文的代码，大家可以参考：

[learn-netty4](https://github.com/ddean2009/learn-netty4)













