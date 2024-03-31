---
slug: /43-netty-reference-cound
---

# 67. netty系列之:JVM中的Reference count原来netty中也有



# 简介

为什么世界上有这么多JAVA的程序员呢？其中一个很重要的原因就是JAVA相对于C++而言，不需要考虑对象的释放，一切都是由垃圾回收器来完成的。在崇尚简单的现代编程世界中，会C++的高手越来越少，会JAVA的程序员越来越多。

JVM的垃圾回收器中一个很重要的概念就是Reference count，也就是对象的引用计数，用来控制对象是否还被引用，是否可以被垃圾回收。

netty也是运行在JVM中的，所以JVM中的对象引用计数也适用于netty中的对象。这里我们说的对象引用指的是netty中特定的某些对象，通过对象的引用计数来判断这些对象是否还被使用，如果不再被使用的话就可以把它们（或它们的共享资源）返回到对象池（或对象分配器）。

这就叫做netty的对象引用计数技术，其中一个最关键的对象就是ByteBuf。

# ByteBuf和ReferenceCounted

netty中的对象引用计数是从4.X版本开始的，ByteBuf是其中最终要的一个应用,它利用引用计数来提高分配和释放性能.

先来看一下ByteBuf的定义：

```
public abstract class ByteBuf implements ReferenceCounted, Comparable<ByteBuf>
```

可以看到ByteBuf是一个抽象类，它实现了ReferenceCounted的接口。

ReferenceCounted就是netty中对象引用的基础，它定义了下面几个非常重要的方法，如下所示：

```
int refCnt();

ReferenceCounted retain();

ReferenceCounted retain(int increment);

boolean release();

boolean release(int decrement);

```

其中refCnt返回的是当前引用个数，retain用来增加引用，而release用来释放引用。

# ByteBuf的基本使用

刚分配情况下ByteBuf的引用个数是1：

```
ByteBuf buf = ctx.alloc().directBuffer();
assert buf.refCnt() == 1;
```

当调用他的release方法之后，refCnt就变成了0：

```
boolean destroyed = buf.release();
assert destroyed;
assert buf.refCnt() == 0;
```

当调用它的retain方法，refCnt就会加一：

```
ByteBuf buf = ctx.alloc().directBuffer();
assert buf.refCnt() == 1;
buf.retain();
assert buf.refCnt() == 2;
```

> 要注意的是，如果ByteBuf的refCnt已经是0了，就表示这个ByteBuf准备被回收了，如果再调用其retain方法，则会抛出IllegalReferenceCountException:refCnt: 0, increment: 1

所以我们必须在ByteBuf还未被回收之前调用retain方法。

既然refCnt=0的情况下，不能调用retain()方法，那么其他的方法能够调用吗？

我们来尝试调用一下writeByte方法：

```
        try {
            buf.writeByte(10);
        } catch (IllegalReferenceCountException e) {
            log.error(e.getMessage(),e);
        }
```

可以看到，如果refCnt=0的时候，调用它的writeByte方法会抛出IllegalReferenceCountException异常。

这样看来，只要refCnt=0，说明这个对象已经被回收了，不能够再使用了。

# ByteBuf的回收

既然ByteBuf中保存的有refCnt，那么谁来负责ByteBuf的回收呢？

netty的原则是谁消费ByteBuf，谁就负责ByteBuf的回收工作。

在实际的工作中，ByteBuf会在channel中进行传输，根据谁消费谁负责销毁的原则，接收ByteBuf的一方，如果消费了ByteBuf，则需要将其回收。

> 这里的回收指的是调用ByteBuf的release()方法。

# ByteBuf的衍生方法

ByteBuf可以从一个parent buff中衍生出很多子buff。这些子buff并没有自己的reference count,它们的引用计数是和parent buff共享的，这些提供衍生buff的方法有：ByteBuf.duplicate(), ByteBuf.slice() 和 ByteBuf.order(ByteOrder)。

```
buf = directBuffer();
        ByteBuf derived = buf.duplicate();
        assert buf.refCnt() == 1;
        assert derived.refCnt() == 1;
```

因为衍生的byteBuf和parent buff共享引用计数，所以如果要将衍生的byteBuf传给其他的流程进行处理的话，需要调用retain()方法：

```
ByteBuf parent = ctx.alloc().directBuffer(512);
parent.writeBytes(...);

try {
    while (parent.isReadable(16)) {
        ByteBuf derived = parent.readSlice(16);
        derived.retain();
        process(derived);
    }
} finally {
    parent.release();
}
...

public void process(ByteBuf buf) {
    ...
    buf.release();
}

```

# ChannelHandler中的引用计数

netty根据是读消息还是写消息，可以分为InboundChannelHandler和OutboundChannelHandler,分别用来读消息和写消息。

根据谁消费，谁释放的原则，对Inbound消息来说，读取完毕之后，需要调用ByteBuf的release方法：

```
public void channelRead(ChannelHandlerContext ctx, Object msg) {
    ByteBuf buf = (ByteBuf) msg;
    try {
        ...
    } finally {
        buf.release();
    }
}
```

但是如果你只是将byteBuf重发到channel中供其他的步骤进行处理，则不需要release：

```
public void channelRead(ChannelHandlerContext ctx, Object msg) {
    ByteBuf buf = (ByteBuf) msg;
    ...
    ctx.fireChannelRead(buf);
}
```

同样的在Outbound中，如果只是简单的重发，则不需要release：

```
public void write(ChannelHandlerContext ctx, Object message, ChannelPromise promise) {
    System.err.println("Writing: " + message);
    ctx.write(message, promise);
}
```

如果是处理了消息，则需要release：

```
public void write(ChannelHandlerContext ctx, Object message, ChannelPromise promise) {
    if (message instanceof HttpContent) {
        // Transform HttpContent to ByteBuf.
        HttpContent content = (HttpContent) message;
        try {
            ByteBuf transformed = ctx.alloc().buffer();
            ....
            ctx.write(transformed, promise);
        } finally {
            content.release();
        }
    } else {
        // Pass non-HttpContent through.
        ctx.write(message, promise);
    }
}

```

# 内存泄露

因为reference count是netty自身来进行维护的，需要在程序中手动进行release,这样会带来一个问题就是内存泄露。因为所有的reference都是由程序自己来控制的，而不是由JVM来控制，所以可能因为程序员个人的原因导致某些对象reference count无法清零。

为了解决这个问题，默认情况下，netty会选择1%的buffer allocations样本来检测他们是否存在内存泄露的情况.

如果发生泄露，则会得到下面的日志：

```
LEAK: ByteBuf.release() was not called before it's garbage-collected. Enable advanced leak reporting to find out where the leak occurred. To enable advanced leak reporting, specify the JVM option '-Dio.netty.leakDetectionLevel=advanced' or call ResourceLeakDetector.setLevel()
```

上面提到了一个检测内存泄露的level，netty提供了4种level，分别是：

* DISABLED---禁用泄露检测
* SIMPLE --默认的检测方式，占用1% 的buff。
* ADVANCED - 也是1%的buff进行检测，不过这个选项会展示更多的泄露信息。
* PARANOID - 检测所有的buff。

具体的检测选项如下：

```
java -Dio.netty.leakDetection.level=advanced ...
```

# 总结

掌握了netty中的引用计数，就掌握了netty的财富密码！

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)




