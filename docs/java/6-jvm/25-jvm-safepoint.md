---
slug: /jvm-safepoint
---

# 25. 小师妹学JVM之:JVM中的Safepoints

## 简介

java程序员都听说过GC，大家也都知道GC的目的是扫描堆空间，然后将那些标记为删除的对象从堆空间释放，以提升可用的堆空间。今天我们会来探讨一下隐藏在GC背后的一个小秘密Safepoints。


## GC的垃圾回收器

小师妹：F师兄，GC的垃圾回收器的种类为什么会有这么多呀？使用起来不是很麻烦。并且我听说CMS在JDK9zhong已经被废弃了。

小师妹，这么多垃圾回收器实际是在JVM的发展过程中建立起来的，在之前的文章中，我们讲到了目前的GC回收器有这样几种。

1. 基于分代技术的回收器

Concurrent mark sweep (CMS) ，CMS是mark and swap的升级版本，它使用多个线程来对heap区域进行扫描，从而提升效率。

> 由于CMS的参数复杂性和性能问题，CMS已经在JDK9中被废弃了。

Serial garbage collection，使用单一的线程来进行垃圾回收操作，其好处就是不需要和其他的线程进行交互。如果你是单核的CPU，那么最好就是选择Serial garbage collection，因为你不能充分利用多核的好处。同样的它也常常用在比较小型的项目中。

Parallel garbage collection，如果你是多核处理器，那么Parallel GC可能是你的选择。

> Parallel GC是JDK8中的默认GC。而在JDK9之后， G1是默认的GC。

G1 garbage collection,G1=Garbage First，它是为替换CMS而生的，最早出现在java7中。

G1将heap区域划分成为多个更小的区域，每个小区域都被标记成为young generation 或者old generation。从而运行GC在更小的范围里运行，而不是影响整个heap区域。

2. 非基于分代技术的回收器

Z Garbage Collection，ZGC是一个可扩展的，低延迟的GC。ZGC是并发的，而且不需要停止正在运行的线程。

> ZGC是在JDK11中引入的。

当然还有正在研发中的其他GC。

## 分代回收器中的问题

小师妹：F师兄，分代回收器不好吗？为什么还有新的ZGC等基于非分代技术的回收器？

分代垃圾回收器中有一个非常常见的现象就是"Stop The World"。什么是Stop the world呢？

就是说在GC的时候，为了进行垃圾回收，需要所有的线程都要暂停执行。所有的线程都暂停执行。 

当然G1虽然是基于分代技术，但是G1实际上是不会"Stop The World"的。

JVM定义了一些Root对象，从这些对象开始，找出他们引用的对象，组成一个对象图。所有在这个图里面的对象都是有效的对象，反之不在对象图中的对象就应该被回收。有效的对象将会被Mark为alive。

这些Root对象包括：正在执行的方法中的本地对象和输入参数。活动的线程，加载类中的static字段和JNI引用。

## safepoints

为了实现STW的功能，JVM需要提供一个机制，让所有的线程可以在某一个时刻同时停下来。这个停下来的时刻就叫做safepoints。

> 注意，这些停下来的线程不包括运行native code的线程。因为这些线程是不属于JVM管理的。

JVM中的代码执行其实有两种方式，一种是JIT编译成为机器码，一种是解释执行。

在JIT中，直接将检查代码编译进入了机器码中。通过设置相应的标记位，从而在线程运行的过程中执行暂停的指令。

还是举一个上篇文章中我们提到的JMH的例子：

~~~java
@Benchmark
    public void test1() {
        int length = array.length;
        for (int i = 0; i < length; i=i+1)
            array[i] ++;
    }
~~~

我们看一下它的assembly code：

![](https://img-blog.csdnimg.cn/20200703202258733.png)

可以看到其中有个test的指令，这个test指令就是生成的safe points。

通过设置标志位，就可以在线程运行时执行暂停操作。

如果是解释执行的话，JVM保存了两个字节码的调度table，当需要safepoint的时候，JVM就进行table的切换，从而开启safepoint。

## safepoint一般用在什么地方

一般情况下，GC，JIT的反代码优化，刷新code cache,类重定义 ,偏向锁撤销和其他的一些debug操作。

我们可以通过使用-XX:+PrintGCApplicationStoppedTime来print safepints的暂停时间。

-XX:+PrintSafepointStatistics –XX:PrintSafepointStatisticsCount=1这两个参数可以强制JVM打印safepoint的一些统计信息。

## 总结

Safepoint是垃圾回收中一个非常重要的概念，希望大家能够有所了解。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！




