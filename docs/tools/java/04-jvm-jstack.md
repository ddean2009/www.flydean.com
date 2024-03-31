---
slug: /jvm-jstack
---

# 4. JDK14性能管理工具:jstack使用介绍

# 简介

在之前的文章中，我们介绍了JDK14中jstat工具的使用，本文我们再深入探讨一下jstack工具的使用。

jstack工具主要用来打印java堆栈信息，主要是java的class名字，方法名，字节码索引，行数等信息。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# jstack的命令格式

~~~java
Usage:
    jstack [-l][-e] <pid>
        (to connect to running process)

Options:
    -l  long listing. Prints additional information about locks
    -e  extended listing. Prints additional information about threads
    -? -h --help -help to print this help message
~~~

jstack的参数比较简单，l可以包含锁的信息，e包含了额外的信息。

# jstack的使用

我们举个例子：

~~~java
jstack -l -e 53528
~~~

输出结果如下：

~~~java
2020-05-09 21:46:51
Full thread dump Java HotSpot(TM) 64-Bit Server VM (14.0.1+7 mixed mode, sharing):

Threads class SMR info:
_java_thread_list=0x00007fda0660eb00, length=14, elements={
0x00007fda04811000, 0x00007fda05845800, 0x00007fda05012000, 0x00007fda05847800,
0x00007fda05843800, 0x00007fda05854800, 0x00007fda0481f000, 0x00007fda0481f800,
0x00007fda04018800, 0x00007fda041ff800, 0x00007fda05a28800, 0x00007fda05b1a800,
0x00007fda05b1d800, 0x00007fda042be000
}

"Reference Handler" #2 daemon prio=10 os_prio=31 cpu=0.67ms elapsed=66335.21s allocated=0B defined_classes=0 tid=0x00007fda04811000 nid=0x4603 waiting on condition  [0x000070000afe1000]
   java.lang.Thread.State: RUNNABLE
	at java.lang.ref.Reference.waitForReferencePendingList(java.base@14.0.1/Native Method)
	at java.lang.ref.Reference.processPendingReferences(java.base@14.0.1/Reference.java:241)
	at java.lang.ref.Reference$ReferenceHandler.run(java.base@14.0.1/Reference.java:213)

   Locked ownable synchronizers:
	- None
  
...

"VM Thread" os_prio=31 cpu=1433.78ms elapsed=66335.22s tid=0x00007fda0506b000 nid=0x4803 runnable

"GC Thread#0" os_prio=31 cpu=18.63ms elapsed=66335.23s tid=0x00007fda0502a800 nid=0x3203 runnable

"GC Thread#1" os_prio=31 cpu=19.64ms elapsed=66334.06s tid=0x00007fda050e5800 nid=0x9d03 runnable

"GC Thread#2" os_prio=31 cpu=17.72ms elapsed=66334.06s tid=0x00007fda05015000 nid=0x6203 runnable

"GC Thread#3" os_prio=31 cpu=14.57ms elapsed=66332.78s tid=0x00007fda05138800 nid=0x6503 runnable

"G1 Main Marker" os_prio=31 cpu=0.25ms elapsed=66335.23s tid=0x00007fda05031000 nid=0x3303 runnable

"G1 Conc#0" os_prio=31 cpu=14.85ms elapsed=66335.23s tid=0x00007fda05031800 nid=0x4b03 runnable

"G1 Refine#0" os_prio=31 cpu=3.25ms elapsed=66335.23s tid=0x00007fda0583a800 nid=0x4a03 runnable

"G1 Young RemSet Sampling" os_prio=31 cpu=5929.79ms elapsed=66335.23s tid=0x00007fda0505a800 nid=0x3503 runnable
"VM Periodic Task Thread" os_prio=31 cpu=21862.12ms elapsed=66335.13s tid=0x00007fda0505b000 nid=0xa103 waiting on condition

JNI global refs: 43, weak refs: 45

~~~

输出的结果我们可以分为下面几个部分：

**JVM虚拟机信息**

第一部分是JVM虚拟机的信息

~~~java
2020-05-09 21:46:51
Full thread dump Java HotSpot(TM) 64-Bit Server VM (14.0.1+7 mixed mode, sharing):
~~~

上面显示了虚拟机的thread dump时间和虚拟机的版本等信息。

**Threads class SMR info**

第二部分是JVM中非JVM（非VM和非GC的线程）的内部线程信息。

~~~java
Threads class SMR info:
_java_thread_list=0x00007fda0660eb00, length=14, elements={
0x00007fda04811000, 0x00007fda05845800, 0x00007fda05012000, 0x00007fda05847800,
0x00007fda05843800, 0x00007fda05854800, 0x00007fda0481f000, 0x00007fda0481f800,
0x00007fda04018800, 0x00007fda041ff800, 0x00007fda05a28800, 0x00007fda05b1a800,
0x00007fda05b1d800, 0x00007fda042be000
}
~~~

这些elements是和后面线程的tid相匹配的。表示的是本地线程对象的地址，注意这些不是线程的ID。

大家可能注意到了里面写的是SMR， SMR全称是Safe Memory Reclamation。

什么是SMR呢？简单点讲就是安全的内存分配，一般这个问题会出现在非自动GC的编程语言中如C++。在这些语言中，需要自己来为对象分配内存和销毁对象，这样就可能导致在多线程的环境中，一个地址可能被分配给了多个对象，从而出现了内存分配的不安全。

**线程信息**

第三部分就是线程的具体信息了：

~~~java
"Reference Handler" #2 daemon prio=10 os_prio=31 cpu=0.67ms elapsed=66335.21s allocated=0B defined_classes=0 tid=0x00007fda04811000 nid=0x4603 waiting on condition  [0x000070000afe1000]
   java.lang.Thread.State: RUNNABLE
	at java.lang.ref.Reference.waitForReferencePendingList(java.base@14.0.1/Native Method)
	at java.lang.ref.Reference.processPendingReferences(java.base@14.0.1/Reference.java:241)
	at java.lang.ref.Reference$ReferenceHandler.run(java.base@14.0.1/Reference.java:213)

   Locked ownable synchronizers:
	- None
~~~

按照字段的顺序，我们可以把线程信息分为下面几个部分：

* 线程名字:例如Reference Handler
* 线程的ID:例如#2
* 是否守护线程:例如daemon，daemon threads是低优先级的thread，它的作用是为User Thread提供服务。 因为daemon threads的低优先级，并且仅为user thread提供服务，所以当所有的user thread都结束之后，JVM会自动退出，不管是否还有daemon threads在运行中。
* 优先级:例如prio=10
* OS线程的优先级:例如os_prio=31
* cpu时间:线程获得CPU的时间,例如cpu=0.67ms
* elapsed:线程启动后经过的wall clock time
* allocated:本线程分配的分配的bytes数
* defined_classes:本线程定义的class个数
  
> 注意'allocated=' 和 'defined_classes=' 必须要开启 -XX:+PrintExtendedThreadInfo才会输出数据。

* Address:java线程的地址，例如:tid=0x00007fda04811000 
* OS线程ID:例如nid=0x4603
* 线程状态:例如waiting on condition
* 最新的Java堆栈指针:最新的java堆栈指针SP，例如:[0x000070000afe1000]

**Thread Stack Trace**

接下来就是线程的堆栈信息：

~~~java
java.lang.Thread.State: RUNNABLE
	at java.lang.ref.Reference.waitForReferencePendingList(java.base@14.0.1/Native Method)
	at java.lang.ref.Reference.processPendingReferences(java.base@14.0.1/Reference.java:241)
	at java.lang.ref.Reference$ReferenceHandler.run(java.base@14.0.1/Reference.java:213)
~~~

上面的例子是线程的堆栈信息，并且列出来了线程的状态。

**Locked Ownable Synchronizer**

接下来的部分是该线程拥有的，可用的用于同步的排它锁对象。

Ownable Synchronizer是一个同步器，这个同步器的同步属性是通过使用AbstractOwnableSynchronizer或者它的子类来实现的。

例如ReentrantLock和ReentrantReadWriteLock中的write-lock（注意不是read-lock，因为需要排它性）就是两个例子。

**JVM Threads**

接下来是JVM的线程信息，因为这个线程是JVM内部的，所以没有线程ID：

~~~java
"VM Thread" os_prio=31 cpu=1433.78ms elapsed=66335.22s tid=0x00007fda0506b000 nid=0x4803 runnable

"GC Thread#0" os_prio=31 cpu=18.63ms elapsed=66335.23s tid=0x00007fda0502a800 nid=0x3203 runnable

"GC Thread#1" os_prio=31 cpu=19.64ms elapsed=66334.06s tid=0x00007fda050e5800 nid=0x9d03 runnable

"GC Thread#2" os_prio=31 cpu=17.72ms elapsed=66334.06s tid=0x00007fda05015000 nid=0x6203 runnable

"GC Thread#3" os_prio=31 cpu=14.57ms elapsed=66332.78s tid=0x00007fda05138800 nid=0x6503 runnable

"G1 Main Marker" os_prio=31 cpu=0.25ms elapsed=66335.23s tid=0x00007fda05031000 nid=0x3303 runnable

"G1 Conc#0" os_prio=31 cpu=14.85ms elapsed=66335.23s tid=0x00007fda05031800 nid=0x4b03 runnable

"G1 Refine#0" os_prio=31 cpu=3.25ms elapsed=66335.23s tid=0x00007fda0583a800 nid=0x4a03 runnable

"G1 Young RemSet Sampling" os_prio=31 cpu=5929.79ms elapsed=66335.23s tid=0x00007fda0505a800 nid=0x3503 runnable
"VM Periodic Task Thread" os_prio=31 cpu=21862.12ms elapsed=66335.13s tid=0x00007fda0505b000 nid=0xa103 waiting on condition
~~~

**JNI References**

最后一部分是JNI（Java Native Interface）引用的信息，注意这些引用可能会导致内存泄露，因为这些native的引用并不会被自动垃圾回收。

~~~java
JNI global refs: 43, weak refs: 45
~~~

# 总结

jstack是分析线程的非常强大的工具，希望大家能够使用起来。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！




  








