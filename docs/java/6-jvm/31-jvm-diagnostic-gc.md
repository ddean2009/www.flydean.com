---
slug: /jvm-diagnostic-gc
---

# 31. troubleshoot之:GC调优到底是什么

## 简介

我们经常会听到甚至需要自己动手去做GC调优。那么GC调优的目的到底是什么呢？让程序跑得更快？让GC消耗更少的资源？还是让程序更加稳定？

带着这些疑问来读一下这篇文章，将会的到一个系统的甚至是不一样的结果。

## 那些GC的默认值

其实GC或者说JVM的参数非常非常的多，有控制内存使用的：

![](https://img-blog.csdnimg.cn/20200706092911625.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

有控制JIT的：

![](https://img-blog.csdnimg.cn/20200706092938357.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

有控制分代比例的,也有控制GC并发的：

![](https://img-blog.csdnimg.cn/20200706093012995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

当然，大部分的参数其实并不需要我们自行去调整，JVM会很好的动态帮我们设置这些变量的值。

如果我们不去设置这些值，那么对GC性能比较有影响的参数和他们的默认值有哪些呢？

### GC的选择

我们知道JVM中的GC有很多种，不同的GC选择对java程序的性能影响还是比较大的。

在JDK9之后，G1已经是默认的垃圾回收器了。

![](https://img-blog.csdnimg.cn/2020070609331112.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

我们看一下G1的调优参数。

G1是基于分代技术的，其实JVM还在开发一些不再基于分代技术的GC算法，比如ZGC，我们可以根据需要来选择适合我们的GC算法。

### GC的最大线程个数

GC是由专门的GC线程来执行的，并不是说GC线程越多越好，这个默认线程的最大值是由heap size和可用的CPU资源动态决定的。

当然你可以使用下面两个选项来修改GC的线程：

~~~java
 -XX:ParallelGCThreads=threads 设置STW的垃圾收集线程数

 -XX:ConcGCThreads = n 设置并行标记线程的数量
~~~

一般情况下ConcGCThreads可以设置为ParallelGCThreads的1/4。

### 初始化heap size

默认情况下加初始化的heap size是物理内存的1/64。 

你可以使用

~~~java
 -XX:InitialHeapSize=size
~~~

来重新设置。

### 最大的heap size

默认情况下最大的heap size是物理内存的1/4。

你可以使用：

~~~java
 -XX:MaxHeapSize
~~~

来重新设置。

### 分层编译技术

默认情况下分层编译技术是开启的。你可以使用：

~~~java
 -XX:-TieredCompilation
~~~

来关闭分层编译。如果启用了分层编译，那么可能需要关注JIT中的C1和C2编译器带来的影响。

## 我们到底要什么

> 鱼，我所欲也，熊掌亦我所欲也；二者不可得兼，舍鱼而取熊掌者也。--孟子

java程序在运行过程中，会发生很多次GC，那么我们其实是有两种统计口径：

1. 平均每次GC执行导致程序暂停的时间（Maximum Pause-Time Goal）。
2. 总的花费在GC上的时间和应用执行时间的比例（Throughput Goal）。

### 最大暂停时间

单次GC的暂停时间是一个统计平均值，因为单次GC的时间其实是不可控的，但是取了平均值，GC就可以动态去调整heap的大小，或者其他的一些GC参数，从而保证每次GC的时间不会超过这个平均值。

我们可以通过设置：

~~~java
-XX:MaxGCPauseMillis=<nnn>
~~~

来控制这个值。

不管怎么设置这个参数，总体需要被GC的对象肯定是固定的，如果单次GC暂停时间比较短，可能会需要减少heap size的大小，那么回收的对象也比较少。这样就会导致GC的频率增加。从而导致GC的总时间增加，影响程序的Throughput。

### 吞吐率

吞吐率是由花费在GC上的时间和应用程序上的时间比率来决定的。

我们可以通过设置：

~~~java
-XX:GCTimeRatio=nnn
~~~

来控制。

如果没有达到throughput的目标，那么GC可能会去增加heap size，从而减少GC的执行频率。但是这样会增加单次的Maximum Pause-Time。

如果throughput和maximum pause-time的参数同时都设置的话，JVM会去尝试去动态减少heap size的大小，直到其中的一个目标不能满足为止。

相对而言，G1更加偏重于最大暂停时间，而ZGC更加偏重于吞吐率。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！




