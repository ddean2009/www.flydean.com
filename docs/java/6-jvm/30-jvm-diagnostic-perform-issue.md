---
slug: /jvm-diagnostic-perform-issue
---

# 30. troubleshoot之:使用JFR分析性能问题

## 简介

java程序的性能问题分析是一个很困难的问题。尤其是对于一个非常复杂的程序来说，分析起来更是头疼。

还好JVM引入了JFR，可以通过JFR来监控和分析JVM的各种事件。通过这些事件的分析，我们可以找出潜在的问题。

今天我们就来介绍一下对java性能分析比较重要的一些JFR事件。

## GC性能事件

一般来说，GC会对java程序的性能操作产生比较重要的影响。我们可以使用jfr监控jdk.GCPhasePause事件。 

下面是一个jdk.GCPhasePause的例子：

~~~java
jfr print --events jdk.GCPhasePause flight_recording_1401comflydeanTestMemoryLeak89268.jfr
~~~

输出结果：

~~~java
jdk.GCPhasePause {
  startTime = 19:51:49.798
  duration = 41.1 ms
  gcId = 2
  name = "GC Pause"
}
~~~

通过GCPhasePause事件，我们可以统计总的GC pause时间和平均每一次GC pause的时间。

一般来说GC是在后台执行的，所以GC本身的执行时间我们并不需要关注，因为这并不会影响到程序的性能。我们需要关注的是应用程序因为GC暂停的时间。

考虑下面两种情况，第一种单独的GC导致GC pause时间过长。第二种是总的GC pause时间过长。

如果是第一种情况，那么可能需要考虑换一个GC类型，因为不同的GC类型在pause时间和吞吐量的平衡直接会有不同的处理。同时我们需要减少finalizers的使用。

如果是第二种情况，我们可以从下面几个方面来解决。

* 增加heap空间大小。heap空间越大，GC的间隔时间就越长。总的GC pause时间就会越短。

* 尽量减少tmp对象的分配。我们知道为了提升多线程的性能，JVM会使用TLAB技术。一般来说小对象会分配在TLAB中，但如果是大对象，则会直接分配在heap空间中。但是大部分对象都是在TLAB中分配的。所以我们可以同时关注TLAB和TLAB之外的两个事件：jdk.ObjectAllocationInNewTLAB和dk.ObjectAllocationOutsideTLAB。

* 减少分配频率。我们可以通过jdk.ThreadAllocationStatistics来分析。

## 同步性能

在多线程环境中，因为多线程会竞争共享资源，所以对资源的同步，或者锁的使用都会影响程序的性能。

我们可以监控jdk.JavaMonitorWait事件。

~~~java
jfr print --events jdk.JavaMonitorWait flight_recording_1401comflydeanTestMemoryLeak89268.jfr
~~~

我们看一个结果：

~~~java
jdk.JavaMonitorWait {
  startTime = 19:51:25.395
  duration = 2 m 0 s
  monitorClass = java.util.TaskQueue (classLoader = bootstrap)
  notifier = N/A
  timeout = 2 m 0 s
  timedOut = true
  address = 0x7FFBB7007F08
  eventThread = "JFR Recording Scheduler" (javaThreadId = 17)
  stackTrace = [
    java.lang.Object.wait(long)
    java.util.TimerThread.mainLoop() line: 553
    java.util.TimerThread.run() line: 506
  ]
}
~~~

通过分析JavaMonitorWait事件，我们可以找到竞争最激烈的锁，从而进行更深层次的分析。

## IO性能

如果应用程序有很多IO操作，那么IO操作也是会影响性能的关键一环。

我们可以监控两种IO类型：socket IO和File IO。

相对应的事件有：dk.SocketWrite，jdk.SocketRead，jdk.FileWrite，jdk.FileRead。

## 代码执行的性能

代码是通过CPU来运行的，如果CPU使用过高，也可能会影响到程序的性能。

我们可以通过监听jdk.CPULoad事件来对CPULoad进行分析。

~~~java
jfr print --events jdk.CPULoad flight_recording_1401comflydeanTestMemoryLeak89268.jfr
~~~

看下运行结果：

~~~java
jdk.CPULoad {
  startTime = 19:53:25.519
  jvmUser = 0.63%
  jvmSystem = 0.37%
  machineTotal = 20.54%
}
~~~

如果jvm使用的cpu比较少，但是整个machine的CPU使用率比较高，这说明了有其他的程序在占用CPU。

如果JVM自己的CPU使用就很高的话，那么就需要找到这个占用CPU的线程进行进一步分析。

## 其他有用的event

除了上面提到的event之外，还有一些其他有用的我们可以关注的event。

比如线程相关的：jdk.ThreadStart，jdk.ThreadEnd，jdk.ThreadSleep，jdk.ThreadPark。

如果你使用JMC，那么可以很直观的查看JFR的各种事件。

![](https://img-blog.csdnimg.cn/202007052319349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

所以推荐大家使用JMC。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！











