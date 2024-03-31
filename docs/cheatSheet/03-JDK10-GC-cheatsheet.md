# 一张PDF了解JDK10 GC调优秘籍-附PDF下载

# 简介

今天我们讲讲JDK10中的JVM GC调优参数，JDK10中JVM的参数总共有1957个，其中正式的参数有658个。

其实JDK10跟JDK9相比没有太大的变化，一个我们可以感受到的变化就是引入了本地变量var。

为了方便大家的参考，特意将JDK10中的GC参数总结成了一张PDF，这个PDF在之前的JDK9的基础上进行了增减和修正，欢迎大家下载。

# Java参数类型

其实Java参数类型可以分为三类。

第一类叫做标准的java参数。

这一类参数是被所有的JVM实现所支持的，是一些非常常用的JVM参数。

我们可以通过直接执行java命令来查看。

第二类叫做额外的java参数，这些参数是专门为Hotspot VM准备的，并不保证所有的JVM都实现了这些参数。并且这些参数随时有可能被修改。 额外的java参数是以 -X开头的。

我们可以通过java -X来查看。

第三类叫做高级参数。这些参数是开发者选项，主要作用就是JVM调优。这些参数和第二类参数一样，也是不保证被所有的JVM支持的，并且随时都可能变化。

第三类参数是以-XX开头的，我们可以通过java -XX:+PrintFlagsFinal来查看。

> 神奇的是，我们做JVM调优的参数往往就是这第三类参数，所以，下次如果再有面试官问你JVM调优，你可以直接怼回去：这些参数是不被官方推荐普通使用者使用的，并且随时都可能变化。没必要掌握！那么这个Offer肯定非你莫属。

# Large Pages

其实JDK10跟JDK9相比没啥大的变化，这里重点讲解一个特性叫做Large Pages。

Large pages其实不是JDK10的新特性了，它的历史已经很久了。

在讲large Pages之前，我们先讲一下内存分页。

CPU是通过寻址来访问内存空间的。一般来说CPU的寻址能力是有限的。而实际的物理内存地址会远大于CPU的寻址范围。

为了解决这个问题，现代CPU引入了MMU(Memory Management Unit 内存管理单元)和虚拟地址空间的概念。

虚拟地址空间也叫做（Virtual address space），为了不同程序的互相隔离和保证程序中地址的确定性，现代计算机系统引入了虚拟地址空间的概念。简单点讲可以看做是跟实际物理地址的映射，通过使用分段或者分页的技术，将实际的物理地址映射到虚拟地址空间。

同时为了解决虚拟空间比物理内存空间大的问题，现代计算机技术一般都是用了分页技术。

分页技术就是将虚拟空间分为很多个page，只有在需要用到的时候才为该page分配到物理内存的映射，这样物理内存实际上可以看做虚拟空间地址的缓存。

虚拟地址空间和物理地址的映射是通过一个叫做映射存储表的地方来工作的。这个地方一般被叫做页表(page table)，页表是存储在物理内存中的。

CPU读取物理内存速度肯定会慢于读取寄存器的速度。于是又引入了TLB的概念。

Translation-Lookaside缓冲区（TLB）是一个页面转换缓存，其中保存了最近使用的虚拟到物理地址转换。 

TLB容量是有限的。如果发生TLB miss则需要CPU去访问内存中的页表，从而造成性能损耗。

通过调大内存分页大小，单个TLB条目存储更大的内存范围。这将减少对TLB的压力，并且对内存密集型应用程序可能具有更好的性能。

但是，大页面也可能会对系统性能产生负面影响。例如，当应用程序使用大量大页面内存时，可能会导致常规内存不足，并导致其他应用程序中的过多分页，并使整个系统变慢。同样，长时间运行的系统可能会产生过多的碎片，这可能导致无法保留足够大的页面内存。发生这种情况时，OS或JVM都会恢复为使用常规页面。

> Oracle Solaris, Linux, and Windows Server 2003 都支持大页面。

具体各个系统的large page的配置，大家可以自行探索。

# JIT调优

JIT我在之前的文章中介绍过很多次了，为了提升java程序的执行效率，JVM会将部分热点代码，使用JIT编译成为机器码。

那么JIT的调试参数也是非常重要的。这里具体讲解一些比较常用JIT调试指令：

~~~java
-XX:+BackgroundCompilation
~~~

使用后台编译，也就是说编译线程和前台线程使用是不同的线程。一般来说如果我们需要调试JIT日志的话，需要关闭此选项。

~~~java
-XX:CICompilerCount=threads
~~~

设置编译线程的个数。

~~~java
-XX:CompileCommand=command,method[,option]
~~~

自定义具体方法的编译方式。

比如：

~~~java
-XX:CompileCommand=exclude,java/lang/String.indexOf
~~~

意思是把String的indexOf exclude from compiled。

这里的command有下面几种：

* break - 为编译设置断点
* compileonly - exclude所有的方法，除了指定的方法
* dontinline - 指定的方法不inline
* exclude - 编译的时候排除指定的方法
* inline - inline指定的方法
* log - exclude所有的方法日志，除了指定的方法
* option - 传递一个JIT编译的参数
* print - 输出生成的汇编代码
* quiet - 不打印编译命令

~~~java
-XX:CompileOnly=methods
~~~

指定编译某些命令。

~~~java
-XX:CompileThreshold=invocations
~~~

命令经过多少次解释执行，才会被编译。默认情况下在-server模式，这个值是10,000， 在-client模式，这个值是1,500。

如果分层编译开启之后，这个值会被忽略。

~~~java
-XX:+DoEscapeAnalysis
~~~

开启逃逸分析。

~~~java
-XX:+Inline
~~~

开启inline特性。

~~~java
-XX:+LogCompilation
~~~
输出编译日志。

~~~java
-XX:+PrintAssembly
~~~
输出汇编代码。

~~~java
-XX:-TieredCompilation
~~~
取消分层编译。

上图：

![](https://img-blog.csdnimg.cn/20200627180541817.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

# 总结

同样的，为JDK10特意准备了一个PDF，下载链接如下：

[JDK10GC-cheatsheet.pdf](https://github.com/ddean2009/www.flydean.com/blob/master/cheatSheet/JDK10GC-cheatsheet.pdf)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
