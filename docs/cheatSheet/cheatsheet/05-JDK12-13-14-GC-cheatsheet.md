---
slug: /JDK12-13-14-GC-cheatsheet
---

# 一文了解JDK12 13 14 GC调优秘籍-附PDF下载

# 简介

想了解JDK12，13，14中的GC调优秘籍吗？想知道这三个版本中JVM有什么新的变化吗？

一起来看看这期的GC调优秘籍，因为JDK12，13，14中的GC变化不太大，所以这里一起做个总结，文末附有相应的PDF下载，希望大家能够喜欢。

# 那些好用的VM参数

我们再讲几个之前的版本中没有讲过的比较好用的VM参数。

~~~java
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=path
~~~

我们写java程序的，经常会碰到程序报java.lang.OutOfMemoryError异常，这时候优秀的我们是怎么解决的呢？

高级程序员一看到这个错误，就知道heap空间不够用了，加大heap空间吧。

但是聪明的程序员可能就会问了，为什么会出现这个OutOfMemoryError异常呢？是不是我们程序里面有没有问题呢？

带着这个疑问，聪明的程序员可能会使用jmap命令将heap dump出来，甚至有些程序员可以熟练的使用jcmd pid GC.heap_info命令来查看heap info了。

这些都很好，但是如果使用上面两个JVM选项，程序只要出现OutOfMemoryError，就会自动将heap dump出来，默认的文件名是java_pid.hprof ，你也可以自己指定文件路径。

~~~java
-XX:+PrintClassHistogram
~~~

有时候，我们需要统计class的信息，那么可以使用这个选项。

在windows环境中收到Control+C，或者在linux环境中收到Control+Break信号的时候就会触发相应的统计事件。

> 这个参数和 jmap -histo command 或者 jcmd pid GC.class_histogram效果是一样的。

有小伙伴要问了，Control+C和Control+Break信号是什么鬼？怎么将信号传递给java程序呢？

这里给大家扩展讲一下，发送信号可以用kill命令。

kill其实有两种用法。

第一种 kill pid，kill后面直接跟一个pid。

第二中 kill -TERM pid， TERM就是我们要向kill传递的信号。

其实kill pid 就是 kill -15 pid的简写。

我们是用kill -l来看一下kill支持的信号类型：

~~~java
kill -l 
 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM
16) SIGSTKFLT   17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP
21) SIGTTIN     22) SIGTTOU     23) SIGURG      24) SIGXCPU     25) SIGXFSZ
26) SIGVTALRM   27) SIGPROF     28) SIGWINCH    29) SIGIO       30) SIGPWR
31) SIGSYS      34) SIGRTMIN    35) SIGRTMIN+1  36) SIGRTMIN+2  37) SIGRTMIN+3
38) SIGRTMIN+4  39) SIGRTMIN+5  40) SIGRTMIN+6  41) SIGRTMIN+7  42) SIGRTMIN+8
43) SIGRTMIN+9  44) SIGRTMIN+10 45) SIGRTMIN+11 46) SIGRTMIN+12 47) SIGRTMIN+13
48) SIGRTMIN+14 49) SIGRTMIN+15 50) SIGRTMAX-14 51) SIGRTMAX-13 52) SIGRTMAX-12
53) SIGRTMAX-11 54) SIGRTMAX-10 55) SIGRTMAX-9  56) SIGRTMAX-8  57) SIGRTMAX-7
58) SIGRTMAX-6  59) SIGRTMAX-5  60) SIGRTMAX-4  61) SIGRTMAX-3  62) SIGRTMAX-2
63) SIGRTMAX-1  64) SIGRTMAX
~~~

我们常用的9=SIGKILL，也就是向JVM传递一个强制kill的信号。

> 注意，这些信号中，除了9这个信号可以无条件终止进程，其他的信号进程都有权利忽略。
> 所以有时候我们使用kill pid命令去终止进程，但是进程没反应。不是因为进程坏了，而是因为进程忽略掉了你发出的信号。

~~~java
-XX:+PrintConcurrentLocks
~~~

同样的，PrintConcurrentLocks也是收到Control+Break或者Control+C信号时，输出java.util.concurrent的lock信息。

> 这个参数和jstack -l 或者jcmd pid Thread.print -l效果是一样的。

~~~java
-XX:+PrintFlagsRanges
~~~

再来看一个比较有用的参数PrintFlagsRanges。有时候我们想使用某些VM的参数，但是不知道这些参数的取值范围，那么可以使用PrintFlagsRanges。我们试一下：

![](https://img-blog.csdnimg.cn/20200702103959395.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

是不是非常有用？

# G1的变化

JVM在发展，G1的参数也在发展，这几个版本中有几个G1的参数名发生了变化：

-XX:DefaultMaxNewGenPercent 替换成为-XX:G1MaxNewSizePercent=percent

-XX:G1OldCSetRegionLiveThresholdPercent 替换成为-XX:G1MixedGCLiveThresholdPercent=percent

-XX:DefaultMinNewGenPercent替换成为-XX:G1NewSizePercent=percent

# 配置FlightRecorder

Java Flight Recorder（JFR）是JVM的诊断和性能分析工具。它可以收集有关JVM以及在其上运行的Java应用程序的数据。JFR是集成到JVM中的，所以JFR对JVM的性能影响非常小，我们可以放心的使用它。

一般来说，在使用默认配置的时候，性能影响要小于1%。

JFR是一个基于事件的低开销的分析引擎，具有高性能的后端，可以以二进制格式编写事件。

JFR是JVM的调优工具，通过不停的收集JVM和java应用程序中的各种事件，从而为后续的JMC分析提供数据。

Event是由三部分组成的：时间戳，事件名和数据。同时JFR也会处理三种类型的Event：持续一段时间的Event，立刻触发的Event和抽样的Event。

为了保证性能的最新影响，在使用JFR的时候，请选择你需要的事件类型。

JFR从JVM中搜集到Event之后，会将其写入一个小的thread-local缓存中，然后刷新到一个全局的内存缓存中，最后将缓存中的数据写到磁盘中去。

或者你可以配置JFR不写到磁盘中去，但是这样缓存中只会保存部分events的信息。

FlightRecorder有两部分的配置，第一部分是配置FlightRecorder本身的大小，存储等信息。第二部分是FlightRecorder的开启选项。

我们看下FlightRecorder相关的配置参数：

~~~java
-XX:FlightRecorderOptions:parameter=value
~~~

![](https://img-blog.csdnimg.cn/20200702225053990.png)

下面是StartFlightRecording的配置：
~~~java
-XX:StartFlightRecording=parameter=value
~~~

![](https://img-blog.csdnimg.cn/20200702225125229.png)

# RAM参数

默认情况下，JVM的MaxHeapSize是根据RAM的大小来自动配置的，比如说，我有一个8G内存的机子,执行下面的命令：

~~~java
java -XX:+PrintFlagsFinal -version | grep -Ei "maxheapsize|maxram"
~~~

![](https://img-blog.csdnimg.cn/20200702151505518.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

可以看到MaxHeapSize= MaxRAM / MaxRAMPercentage。

VM也提供了下面几个用来设置RAM相关的参数：

~~~java
-XX:MaxRAM=size
-XX:InitialRAMPercentage
-XX:MaxRAMPercentage
-XX:MinRAMPercentage
~~~

主要就是设置最大的RAM值和Heap占RAM的比例。

RAM参数主要是为了java在容器中运行配置的。

# JDK13中的ZGC

在JDK13中，我们可以开启ZGC的体验了。ZGC是一个可扩展的，低延迟的GC。ZGC是并发的，而且不需要停止正在运行的线程。

ZGC是在JDK11中被引入的。

我们通过下面的方式来开启ZGC：

~~~java
-XX:+UnlockExperimentalVMOptions -XX:+UseZGC
~~~

# RTM支持

Restricted Transactional Memory（RTM）是受限的事务性存储器，是Intel在x86微架构中所引入的指令集系统，它属于TSX（Transactional Synchronization Extensions，事务性同步扩展）指令集扩展。

RTM主要用来在多线程环境中提升执行效率。

RTM引入了XBEGIN, XABORT, XEND和XTEST。通过将指令包含在XBEGIN和XEND之间，可以达到transaction的效果。

可以将RTM看做是一个粗粒度的锁，XBEGIN和XEND之间包含的代码就是要执行的程序。RTM可以由硬件自动检测操作中的数据冲突，保证事务性操作的正确性，从而发掘操作间的并行性。

同时RTM还可以减少CPU cache line的false-sharing。

RTM支持主要有4个参数：

~~~java
-XX:+UseRTMLocking

-XX:+UseRTMDeopt

-XX:RTMAbortRatio=abort_ratio

-XX:RTMRetryCount=count
~~~

其中UseRTMDeopt和RTMAbortRatio是联合起来用的。

之前我们讲到RTM会对粗粒度的锁进行优化，但如果真的是多线程并发执行访问同样资源的时候，这个优化实际上是不成功的，会被abort，然后回退到正常的锁状态。

如果abort超出了一定的比例，则会将RTM代码反优化。

# 总结

好了，就总结这么多。下面是JDK12，13，14的GC调优秘籍，欢迎下载。

* [JDK12GC-cheatsheet.pdf](https://github.com/ddean2009/www.flydean.com/blob/master/cheatSheet/JDK12GC-cheatsheet.pdf)
* [JDK13GC-cheatsheet.pdf](https://github.com/ddean2009/www.flydean.com/blob/master/cheatSheet/JDK13GC-cheatsheet.pdf)
* [JDK14GC-cheatsheet.pdf](https://github.com/ddean2009/www.flydean.com/blob/master/cheatSheet/JDK14GC-cheatsheet.pdf)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！





