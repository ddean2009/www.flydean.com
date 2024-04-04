---
slug: /jvm-jstat
---

# 5. JDK14性能管理工具:jstat使用介绍

# 简介

作为一个程序员，经常会为如何定位java程序的问题或者去调优JVM性能而苦恼不已。也许你听过一些java的profile的强力工具，比如jprofile。但是这些工具大部分都是要收费的，对于我们个人程序员来说十分不友好。

其实JDK已经自带了很多优秀的性能调优工具，你可以在JAVA_HOME/bin中找到他们。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

今天我们的系列文章要介绍的是这四个工具：

1. Jstat(sun.tools.jstat) 它的全称是Java Virtual Machine Statistics Monitoring Tool，是用来监控JVM状态的工具。

2. jstack(sun.tools.jstack) 它的全称是Java Stack Trace，是用来做java栈的跟踪工具。

3. jmap(sun.tools.jmap) 它的全称是Java Memory Map，是java的内存管理工具。

4. jhat (com.sun.tools.hat.Main) 它的全称是Java Heap Analyse Tool，是java的堆分析工具。

有了这四个工具，基本上JVM运行期间的方方面面都可以被覆盖到了。下面我们将具体对每一个工具进行详细讲解。本文将会首先讲解Jstat的具体使用。

# JStat命令

jstat主要对JVM运行期间的各种参数进行收集，包括查看类的加载情况，jc中新生代老年代元数据空间的使用情况等。

先看下Jstat的命令：

~~~java
jstat outputOptions [-t] [-h lines] vmid [interval [count]]
~~~

* outputOptions - 选择需要输出哪些内容
* t - 在第一列输出timestamp,是从目标JVM启动时候开始算起
* h - 选择每隔n行输出列的名字，默认是0，表示只在第一行输出列的名字
* vmid - JVM的pid，可以使用jps来查看
* interval - jstat输出的时间间隔默认单位是毫秒
* count - 表示需要展示多少取样数据，默认是无限制的，表示会一直取样输出，直到JVM停止

# JStat Output Options

上面我们讲了JStat命令的基本格式，在本节我们会详细讲解JStat的输出选项。

使用jstat -options可以看到jstat支持的几个options选项：

~~~java
jstat -options
-class
-compiler
-gc
-gccapacity
-gccause
-gcmetacapacity
-gcnew
-gcnewcapacity
-gcold
-gcoldcapacity
-gcutil
-printcompilation
~~~


## class

输出class loader的统计信息，我们举个例子：

~~~java
jstat -class -t 53528 100 5
Timestamp       Loaded  Bytes  Unloaded  Bytes     Time
        19822.8   5214 10752.5        0     0.0       2.91
        19823.0   5214 10752.5        0     0.0       2.91
        19823.0   5214 10752.5        0     0.0       2.91
        19823.2   5214 10752.5        0     0.0       2.91
        19823.2   5214 10752.5        0     0.0       2.91
~~~

上面的例子中53528是目标JVM的pid，100表示取样的间隔时间是100ms，5表示最后只展示5条数据。

上面的Timestamp表示的JVM的启动的时间。

* Loaded - 有多少个class被加载
* Bytes - 被加载的class大小
* Unloaded - 多少class被反加载
* Bytes - 反加载的class大小
* Time - 加载和反加载class花费的时间

## compiler

compiler统计的是Java HotSpot VM Just-in-Time JIT即时编译器的信息。

JIT即时编译器是为了提升代码的执行速度而产生的。JVM对于一些热点代码，比如多次循环和经常使用的方法。对于这些热点代码，JIT会将其编译成机器代码，从而提升执行速度。

还是举刚刚的JVM的例子：

~~~java
jstat -compiler 53528 100 5
Compiled Failed Invalid   Time   FailedType FailedMethod
    2675      0       0     5.35          0
    2675      0       0     5.35          0
    2675      0       0     5.35          0
    2675      0       0     5.35          0
    2675      0       0     5.35          0
~~~

* Compiled - 执行的编译任务的次数
* Failed - 编译任务失败次数
* Invalid - 置位无效的编译任务次数
* Time - 执行编译任务花费的时间
* FailedType - 上一次失败编译的编译类型
* FailedMethod - 上一次编译失败的方法名

## gc

gc统计的是gc heap信息

~~~java
jstat -gc 53528 100 5
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU    CCSC   CCSU   YGC     YGCT    FGC    FGCT    CGC    CGCT     GCT
 0.0   4096.0  0.0   3978.2 56320.0  33792.0   15360.0    15215.0   21552.0 20680.9 2688.0 2468.0      4    0.025   0      0.000   2      0.003    0.028
 0.0   4096.0  0.0   3978.2 56320.0  33792.0   15360.0    15215.0   21552.0 20680.9 2688.0 2468.0      4    0.025   0      0.000   2      0.003    0.028
 0.0   4096.0  0.0   3978.2 56320.0  33792.0   15360.0    15215.0   21552.0 20680.9 2688.0 2468.0      4    0.025   0      0.000   2      0.003    0.028
 0.0   4096.0  0.0   3978.2 56320.0  33792.0   15360.0    15215.0   21552.0 20680.9 2688.0 2468.0      4    0.025   0      0.000   2      0.003    0.028
 0.0   4096.0  0.0   3978.2 56320.0  33792.0   15360.0    15215.0   21552.0 20680.9 2688.0 2468.0      4    0.025   0      0.000   2      0.003    0.028
~~~

gc的输出参数比较多，我们一一进行解释，这样大家对于gc的运行内核会有更多的理解：

* S0C - survivor 0区域的容量，以KB为单位
* S1C - survivor 1区域的容量，以KB为单位

> Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。垃圾回收的时候，会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

> 就这样不断的扫描，最后经过多次扫描发现任然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

* S0U - survivor 0区域的使用大小，以KB为单位
* S1U - survivor 1区域的使用大小，以KB为单位
* EC - Eden区域的容量，以KB为单位
* EU - Eden区域的使用，以KB为单位
* OC - old区域的容量，以KB为单位
* OU - old区域的使用，以KB为单位
* MC - Metaspace元数据区的 Committed Size，以KB为单位
* MU - Metaspace元数据区的使用大小，以KB为单位

> 在JDK8之前，类定义、字节码和常量等很少会变更的信息是放在持久代Perm Gen中的。不过在JDK8之后，Perm Gen已经被取消了，现在叫做Metaspace。Metaspace并不在java虚拟机中，它使用的是本地内存。Metaspace可以通过-XX:MaxMetaspaceSize来控制。

* CCSC - Compressed class的Committed Size，以KB为单位
* CCSU - Compressed class的使用大小，以KB为单位

> Compressed Class Space，它是和-XX:+UseCompressedOops，-XX:+UseCompressedClassesPointers有关的。实际上是一个指针的压缩，可以使用32bits来表示之前64bits的指针。

* YGC - young generation的GC次数
* YGCT - young generation的GC时间
* FGC - full GC的次数
* FGCT - full GC的时间
* GCT - 总的GC时间

## gccapacity

gccapacity统计的是内存池的创建和大小等统计信息

~~~java
jstat -gccapacity 53528 100 5
 NGCMN    NGCMX     NGC     S0C   S1C       EC      OGCMN      OGCMX       OGC         OC       MCMN     MCMX      MC     CCSMN    CCSMX     CCSC    YGC    FGC   CGC
     0.0 716800.0  60416.0    0.0 4096.0  56320.0        0.0   716800.0    15360.0    15360.0      0.0 1069056.0  21552.0      0.0 1048576.0   2688.0      4     0     2
     0.0 716800.0  60416.0    0.0 4096.0  56320.0        0.0   716800.0    15360.0    15360.0      0.0 1069056.0  21552.0      0.0 1048576.0   2688.0      4     0     2
     0.0 716800.0  60416.0    0.0 4096.0  56320.0        0.0   716800.0    15360.0    15360.0      0.0 1069056.0  21552.0      0.0 1048576.0   2688.0      4     0     2
     0.0 716800.0  60416.0    0.0 4096.0  56320.0        0.0   716800.0    15360.0    15360.0      0.0 1069056.0  21552.0      0.0 1048576.0   2688.0      4     0     2
     0.0 716800.0  60416.0    0.0 4096.0  56320.0        0.0   716800.0    15360.0    15360.0      0.0 1069056.0  21552.0      0.0 1048576.0   2688.0      4     0     2
~~~

* NGCMN - 最小的新生代的大小
* NGCMX - 最大的新生代大小
* NGC - 目前新生代的大小
* S0C - survivor 0区域的容量
* S1C - survivor 1区域的容量
* EC - Eden区域的容量
* OGCMN - 最小old代大小
* OGCMX - 最大old代大小
* OGC - 目前old代大小
* OC - 目前old space大小
* MCMN - 最小metaspace大小
* MCMX - 最大metaspace大小
* MC - Metaspace元数据区的 Committed Size
* CCSMN - Compressed class空间的最小容量
* CCSMX - Compressed class空间的最大容量
* CCSC - Compressed class的Committed Size
* YGC - young generation的GC次数
* FGC - full GC的次数
  
## gcnew

gcnew表示新生代的统计信息

~~~java
jstat -gcnew 53528 100 5
 S0C    S1C    S0U    S1U   TT MTT  DSS      EC       EU     YGC     YGCT
   0.0 4096.0    0.0 3978.2 15  15 5120.0  56320.0  33792.0      4    0.025
   0.0 4096.0    0.0 3978.2 15  15 5120.0  56320.0  33792.0      4    0.025
   0.0 4096.0    0.0 3978.2 15  15 5120.0  56320.0  33792.0      4    0.025
   0.0 4096.0    0.0 3978.2 15  15 5120.0  56320.0  33792.0      4    0.025
   0.0 4096.0    0.0 3978.2 15  15 5120.0  56320.0  33792.0      4    0.025
~~~

* S0C - survivor 0区域的容量
* S1C - survivor 1区域的容量
* S0U - survivor 0区域的使用大小，以KB为单位
* S1U - survivor 1区域的使用大小，以KB为单位
* TT - Tenuring threshold（进入老年代的阈值？）
* MTT - 最大的Tenuring threshold
* DSS - 所需的survivor size
* EC - Eden区域的容量
* EU - Eden区域的使用，以KB为单位
* YGC - 新生代GC次数
* YGCT - 新生代GC所需的时间

## gcnewcapacity

gcnewcapacity统计的是新生代的指标，和gccapacity的结果是很类似的：

~~~java
jstat -gcnewcapacity 53528 100 5
  NGCMN      NGCMX       NGC      S0CMX     S0C     S1CMX     S1C       ECMX        EC      YGC   FGC   CGC
       0.0   716800.0    60416.0      0.0      0.0 716800.0   4096.0   716800.0    56320.0     4     0     2
       0.0   716800.0    60416.0      0.0      0.0 716800.0   4096.0   716800.0    56320.0     4     0     2
       0.0   716800.0    60416.0      0.0      0.0 716800.0   4096.0   716800.0    56320.0     4     0     2
       0.0   716800.0    60416.0      0.0      0.0 716800.0   4096.0   716800.0    56320.0     4     0     2
       0.0   716800.0    60416.0      0.0      0.0 716800.0   4096.0   716800.0    56320.0     4     0     2
~~~

* NGCMN - 最小的新生代的大小
* NGCMX - 最大的新生代大小
* NGC - 目前新生代的大小
* S0CMX - survivor 0区域容量的最大值
* S0C - survivor 0区域的容量
* S1CMX - survivor 1区域容量的最大值
* S1C - survivor 1区域的容量
* EC - Eden区域的容量
* ECMX - Eden区域容量的最大值
* YGC - young generation的GC次数
* FGC - full GC的次数

## gcold

gcold统计old代的信息

~~~java
jstat -gcold 53528 100 5
   MC       MU      CCSC     CCSU       OC          OU       YGC    FGC    FGCT    CGC    CGCT     GCT
 21552.0  20680.9   2688.0   2468.0     15360.0     15215.0      4     0    0.000     2    0.003    0.028
 21552.0  20680.9   2688.0   2468.0     15360.0     15215.0      4     0    0.000     2    0.003    0.028
 21552.0  20680.9   2688.0   2468.0     15360.0     15215.0      4     0    0.000     2    0.003    0.028
 21552.0  20680.9   2688.0   2468.0     15360.0     15215.0      4     0    0.000     2    0.003    0.028
 21552.0  20680.9   2688.0   2468.0     15360.0     15215.0      4     0    0.000     2    0.003    0.028
~~~

结果的几项指标前面已经介绍过了，这里就不再重复了

## gcoldcapacity

gcoldcapacity表示old代的容量信息

~~~java
jstat -gcoldcapacity 53528 100 5
   OGCMN       OGCMX        OGC         OC       YGC   FGC    FGCT    CGC    CGCT     GCT
        0.0    716800.0     15360.0     15360.0     4     0    0.000     2    0.003    0.028
        0.0    716800.0     15360.0     15360.0     4     0    0.000     2    0.003    0.028
        0.0    716800.0     15360.0     15360.0     4     0    0.000     2    0.003    0.028
        0.0    716800.0     15360.0     15360.0     4     0    0.000     2    0.003    0.028
        0.0    716800.0     15360.0     15360.0     4     0    0.000     2    0.003    0.028
~~~

## gcmetacapacity

gcmetacapacity统计的是元数据区域的容量信息

~~~java
jstat -gcmetacapacity 53528 100 5
   MCMN       MCMX        MC       CCSMN      CCSMX       CCSC     YGC   FGC    FGCT    CGC    CGCT     GCT
       0.0  1069056.0    21552.0        0.0  1048576.0     2688.0     4     0    0.000     2    0.003    0.028
       0.0  1069056.0    21552.0        0.0  1048576.0     2688.0     4     0    0.000     2    0.003    0.028
       0.0  1069056.0    21552.0        0.0  1048576.0     2688.0     4     0    0.000     2    0.003    0.028
       0.0  1069056.0    21552.0        0.0  1048576.0     2688.0     4     0    0.000     2    0.003    0.028
       0.0  1069056.0    21552.0        0.0  1048576.0     2688.0     4     0    0.000     2    0.003    0.028
~~~

## gcutil

gcutil统计的是GC总体的情况

~~~java
jstat -gcutil 53528 100 5
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT    CGC    CGCT     GCT
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028
~~~

* S0 - S0区域的使用比例
* S1 - S1区域的使用比例
* E - Eden区域的使用比例
* O - Old区域的使用比例
* M - 元数据区域的使用比例
* CCS - Compressed class空间的使用比例

## gccause 

gccause和gcutil非常相识，只不过多了下面两列：

* LGCC - 上次GC的原因
* GCC - 当前GC的原因

~~~java
jstat -gccause 53528 100 5
  S0     S1     E      O      M     CCS    YGC     YGCT    FGC    FGCT    CGC    CGCT     GCT    LGCC                 GCC
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028 Metadata GC Threshold No GC
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028 Metadata GC Threshold No GC
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028 Metadata GC Threshold No GC
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028 Metadata GC Threshold No GC
  0.00  97.12  60.00  99.06  95.96  91.82      4    0.025     0    0.000     2    0.003    0.028 Metadata GC Threshold No GC
~~~

## printcompilation

printcompilation是JVM编译器的方法统计

~~~java
jstat -printcompilation 53528 100 5
Compiled  Size  Type Method
    2675     23    1 jdk/internal/misc/InnocuousThread eraseThreadLocals
    2675     23    1 jdk/internal/misc/InnocuousThread eraseThreadLocals
    2675     23    1 jdk/internal/misc/InnocuousThread eraseThreadLocals
    2675     23    1 jdk/internal/misc/InnocuousThread eraseThreadLocals
    2675     23    1 jdk/internal/misc/InnocuousThread eraseThreadLocals
~~~

* Compiled - 最近执行的编译任务次数
* Size - 最近编译方法的大小
* Type - 最新编译方法的类型
* Method - 最新编译方法的名字

# 总结

本文介绍了JDK14中自带的jstat JVM分析工具，希望大家能够在实际的工作中用到。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！






