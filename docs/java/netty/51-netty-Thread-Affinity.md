---
slug: /51-netty-Thread-Affinity
---

# 75. netty系列之:在netty中实现线程和CPU绑定



# 简介

之前我们介绍了一个非常优秀的细粒度控制JAVA线程的库：java thread affinity。使用这个库你可以将线程绑定到特定的CPU或者CPU核上，通过减少线程在CPU之间的切换，从而提升线程执行的效率。

虽然netty已经够优秀了，但是谁不想更加优秀一点呢？于是一个想法产生了，那就是能不能把affinity库用在netty中呢？

答案是肯定的，一起来看看吧。

# 引入affinity

affinity是以jar包的形式提供出去的，目前最新的正式版本是3.20.0，所以我们需要这样引入：

```
<!-- https://mvnrepository.com/artifact/net.openhft/affinity -->
<dependency>
    <groupId>net.openhft</groupId>
    <artifactId>affinity</artifactId>
    <version>3.20.0</version>
</dependency>

```

引入affinity之后，会在项目的依赖库中添加一个affinity的lib包，这样我们就可以在netty中愉快的使用affinity了。

# AffinityThreadFactory

有了affinity，怎么把affinity引入到netty中呢?

我们知道affinity是用来控制线程的，也就是说affinity是跟线程有关的。而netty中跟线程有关的就是EventLoopGroup,先看一下netty中EventLoopGroup的基本用法，这里以NioEventLoopGroup为例,NioEventLoopGroup有很多构造函数的参数，其中一种是传入一个ThreadFactory：

```
    public NioEventLoopGroup(ThreadFactory threadFactory) {
        this(0, threadFactory, SelectorProvider.provider());
    }
```

这个构造函数表示NioEventLoopGroup中使用的线程都是由threadFactory创建而来的。这样以来我们就找到了netty和affinity的对应关系。只需要构造affinity的ThreadFactory即可。

刚好affinity中有一个AffinityThreadFactory类，专门用来创建affinity对应的线程。

接下来我们来详细了解一下AffinityThreadFactory。

AffinityThreadFactory可以根据提供的不同AffinityStrategy来创建对应的线程。

AffinityStrategy表示的是线程之间的关系。在affinity中，有5种线程关系，分别是：

```
    SAME_CORE - 线程会运行在同一个CPU core中。
    SAME_SOCKET - 线程会运行在同一个CPU socket中，但是不在同一个core上。
    DIFFERENT_SOCKET - 线程会运行在不同的socket中。
    DIFFERENT_CORE - 线程会运行在不同的core上。
    ANY - 只要是可用的CPU资源都可以。
```

这些关系是通过AffinityStrategy中的matches方法来实现的：

```
boolean matches(int cpuId, int cpuId2);
```

matches传入两个参数，分别是传入的两个cpuId。我们以SAME_CORE为例来看看这个mathes方法到底是怎么工作的：

```
    SAME_CORE {
        @Override
        public boolean matches(int cpuId, int cpuId2) {
            CpuLayout cpuLayout = AffinityLock.cpuLayout();
            return cpuLayout.socketId(cpuId) == cpuLayout.socketId(cpuId2) &&
                    cpuLayout.coreId(cpuId) == cpuLayout.coreId(cpuId2);
        }
    }
```

可以看到它的逻辑是先获取当前CPU的layout，CpuLayout中包含了cpu个数，sockets个数，每个sockets的cpu核数等基本信息。并且提供了三个方法根据给定的cpuId返回对应的socket、core和thread信息：

```
    int socketId(int cpuId);

    int coreId(int cpuId);

    int threadId(int cpuId);
```

matches方法就是根据传入的cpuId找到对应的socket,core信息进行比较，从而生成了5中不同的策略。

先看一下AffinityThreadFactory的构造函数：

```
    public AffinityThreadFactory(String name, boolean daemon, @NotNull AffinityStrategy... strategies) {
        this.name = name;
        this.daemon = daemon;
        this.strategies = strategies.length == 0 ? new AffinityStrategy[]{AffinityStrategies.ANY} : strategies;
    }
```

可以传入thread的name前缀，和是否是守护线程，最后如果strategies不传的话，默认使用的是AffinityStrategies.ANY策略，也就是说为线程分配任何可以绑定的CPU。

接下来看下这个ThreadFactory是怎么创建新线程的：

```
public synchronized Thread newThread(@NotNull final Runnable r) {
        String name2 = id <= 1 ? name : (name + '-' + id);
        id++;
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                try (AffinityLock ignored = acquireLockBasedOnLast()) {
                    r.run();
                }
            }
        }, name2);
        t.setDaemon(daemon);
        return t;
    }

    private synchronized AffinityLock acquireLockBasedOnLast() {
        AffinityLock al = lastAffinityLock == null ? AffinityLock.acquireLock() : lastAffinityLock.acquireLock(strategies);
        if (al.cpuId() >= 0)
            lastAffinityLock = al;
        return al;
    }
```

从上面的代码可以看出，创建的新线程会以传入的name为前缀，后面添加1，2，3，4这种后缀。并且根据传入的是否是守护线程的标记，将调用对应线程的setDaemon方法。

重点是Thread内部运行的Runnable内容，在run方法内部，首先调用acquireLockBasedOnLast方法获取lock，在获得lock的前提下运行对应的线程方法，这样就会将当前运行的Thread和CPU进行绑定。

从acquireLockBasedOnLast方法中，我们可以看出AffinityLock实际上是一个链式结构，每次请求的时候都调用的是lastAffinityLock的acquireLock方法，如果获取到lock，则将lastAffinityLock进行替换，用来进行下一个lock的获取。

有了AffinityThreadFactory，我们只需要在netty的使用中传入AffinityThreadFactory即可。

# 在netty中使用AffinityThreadFactory

上面讲到了要在netty中使用affinity，可以将AffinityThreadFactory传入EventLoopGroup中。对于netty server来说可以有两个EventLoopGroup，分别是acceptorGroup和workerGroup，在下面的例子中我们将AffinityThreadFactory传入workerGroup，这样后续work中分配的线程都会遵循AffinityThreadFactory中配置的AffinityStrategies策略，来获得对应的CPU：

```
//建立两个EventloopGroup用来处理连接和消息
        EventLoopGroup acceptorGroup = new NioEventLoopGroup(acceptorThreads);
        //创建AffinityThreadFactory
        ThreadFactory threadFactory = new AffinityThreadFactory("affinityWorker", AffinityStrategies.DIFFERENT_CORE,AffinityStrategies.DIFFERENT_SOCKET,AffinityStrategies.ANY);
        //将AffinityThreadFactory加入workerGroup
        EventLoopGroup workerGroup = new NioEventLoopGroup(workerThreads,threadFactory);
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(acceptorGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new AffinityServerHandler());
                        }
                    })
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // 绑定端口并开始接收连接
            ChannelFuture f = b.bind(port).sync();

            // 等待server socket关闭
            f.channel().closeFuture().sync();
        } finally {
            //关闭group
            workerGroup.shutdownGracefully();
            acceptorGroup.shutdownGracefully();
        }
```

为了获取更好的性能，Affinity还可以对CPU进行隔离，被隔离的CPU只允许执行本应用的线程，从而获得更好的性能。

要使用这个特性需要用到linux的isolcpus。这个功能主要是将一个或多个CPU独立出来，用来执行特定的Affinity任务。

isolcpus命令后面可以接CPU的ID,或者可以修改/boot/grub/grub.conf文件，添加要隔离的CPU信息如下：

```
isolcpus=3，4，5
```

# 总结

affinity可以对线程进行极致管控，对性能要求严格的朋友可以试试，但是在使用过程中需要选择合适的AffinityStrategies，否则可能会得不到想要的结果。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)













