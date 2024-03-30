---
slug: /JDK9-jvm-xlog
---

# 6. JDK9的新特性:JVM的xlog

# 简介

在java程序中，我们通过日志来定位和发现项目中可能出现的问题。在现代java项目中，我们使用log4j或者slf4j，Logback等日志记录框架来处理日志问题。

JVM是java程序运行的基础，JVM中各种事件比如：GC,class loading,JPMS,heap,thread等等其实都可以有日志来记录。通过这些日志，我们可以监控JVM中的事件，并可以依次来对java应用程序进行调优。

在JDK9中引入的Xlog日志服务就是为这个目的而创建的。

通过xlog，JDK将JVM中的各种事件统一起来，以统一的形式对外输出。通过tag参数来区分子系统，通过log level来区分事件的紧急性，通过logging output来配置输出的地址。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# xlog的使用

先看一个最简单的xlog的使用例子：

~~~java
java -Xlog -version
~~~

输出结果：

~~~java
[0.016s][info][os] Use of CLOCK_MONOTONIC is supported
[0.016s][info][os] Use of pthread_condattr_setclock is not supported
[0.016s][info][os] Relative timed-wait using pthread_cond_timedwait is associated with the default clock
[0.017s][info][os] SafePoint Polling address, bad (protected) page:0x0000000108901000, good (unprotected) page:0x0000000108902000
[0.022s][info][biasedlocking] Aligned thread 0x00007f983e008200 to 0x00007f983e008800
[0.023s][info][os,thread    ] Thread attached (tid: 10499, pthread id: 123145571979264).
~~~

日志非常非常长，这里就不全部列出来了。从输出的日志我们可以看到java -verson命令中JVM执行了诸多的操作。

我们可以看到日志中对每一个操作都列出了操作花费的时间，日志级别和操作所属的分类。

通过这些日志，我们对于JVM的运行可以有更加深入的理解。

使用java -Xlog:help命令我们看一下xlog的基本格式：

~~~java
-Xlog Usage: -Xlog[:[selections][:[output][:[decorators][:output-options]]]]
	 where 'selections' are combinations of tags and levels of the form tag1[+tag2...][*][=level][,...]
	 NOTE: Unless wildcard (*) is specified, only log messages tagged with exactly the tags specified will be matched.
~~~

# selections

selections表示的是到底需要输出哪些信息。是以tag=level来表示的。

tag表示的是JVM中的事件或者子系统：

~~~java
Available log tags:
 add, age, alloc, annotation, aot, arguments, attach, barrier, biasedlocking, blocks, bot, breakpoint, bytecode, cds, census, class, classhisto, cleanup, codecache, compaction, compilation, constantpool, constraints, container, coops, cpu, cset, data, datacreation, dcmd, decoder, defaultmethods, director, dump, dynamic, ergo, event, exceptions, exit, fingerprint, free, freelist, gc, handshake, hashtables, heap, humongous, ihop, iklass, init, inlining, install, interpreter, itables, jfr, jit, jni, jvmti, liveness, load, loader, logging, malloc, mark, marking, membername, memops, metadata, metaspace, methodcomparator, mirror, mmu, module, monitorinflation, monitormismatch, nestmates, nmethod, normalize, numa, objecttagging, obsolete, oldobject, oom, oopmap, oops, oopstorage, os, pagesize, parser, patch, path, perf, periodic, phases, plab, preorder, preview, promotion, protectiondomain, ptrqueue, purge, record, redefine, ref, refine, region, reloc, remset, resolve, safepoint, sampling, scavenge, setting, smr, stackmap, stacktrace, stackwalk, start, startuptime, state, stats, streaming, stringdedup, stringtable, subclass, survivor, sweep, symboltable, system, table, task, thread, time, timer, tlab, tracking, unload, unshareable, update, verification, verify, vmmutex, vmoperation, vmthread, vtables, vtablestubs, workgang
 Specifying 'all' instead of a tag combination matches all tag combinations
~~~

levels表示的是日志的级别：

~~~java
Available log levels:
 off, trace, debug, info, warning, error
~~~

下面举个例子：

~~~java
java -Xlog:os,class=info -version
~~~

输出结果：

~~~java
[0.002s][info][os] Use of CLOCK_MONOTONIC is supported
[0.002s][info][os] Use of pthread_condattr_setclock is not supported
[0.002s][info][os] Relative timed-wait using pthread_cond_timedwait is associated with the default clock
[0.003s][info][os] SafePoint Polling address, bad (protected) page:0x0000000109543000, good (unprotected) page:0x0000000109544000
[0.006s][info][os] attempting shared library load of /Library/Java/JavaVirtualMachines/jdk-14.0.1.jdk/Contents/Home/lib/libjava.dylib
[0.007s][info][os] shared library load of /Library/Java/JavaVirtualMachines/jdk-14.0.1.jdk/Contents/Home/lib/libjava.dylib was successful
[0.007s][info][os] attempting shared library load of /Library/Java/JavaVirtualMachines/jdk-14.0.1.jdk/Contents/Home/lib/libzip.dylib
[0.010s][info][os] shared library load of /Library/Java/JavaVirtualMachines/jdk-14.0.1.jdk/Contents/Home/lib/libzip.dylib was successful
~~~

# output

output表示将日志输出到什么地方。

output的可选项：

~~~java
 stdout/stderr
 file=<filename>
 ~~~

 stdout表示标准输出，stderr表示标准错误。file表示输出到文件里面。

 举个例子：

 ~~~java
 java -Xlog:all=debug:file=debug.log -version
~~~

# decorators

decorators表示输出哪些内容到日志中。

~~~java
time (t), utctime (utc), uptime (u), timemillis (tm), uptimemillis (um), timenanos (tn), uptimenanos (un), hostname (hn), pid (p), tid (ti), level (l), tags (tg)
 Decorators can also be specified as 'none' for no decoration
~~~

 看下这个例子：

~~~java
 java -Xlog:gc*=debug:stdout:time,uptimemillis,tid -version
~~~

 输出结果：

~~~java
 [2020-05-05T16:12:06.871-0800][32ms][9475] Heap region size: 1M
[2020-05-05T16:12:06.871-0800][32ms][9475] Minimum heap 8388608  Initial heap 134217728  Maximum heap 2147483648
[2020-05-05T16:12:06.872-0800][33ms][9475] Heap address: 0x0000000780000000, size: 2048 MB, Compressed Oops mode: Zero based, Oop shift amount: 3
[2020-05-05T16:12:06.872-0800][33ms][9475] ConcGCThreads: 1 offset 8
[2020-05-05T16:12:06.872-0800][33ms][9475] ParallelGCThreads: 4
~~~

# 总结

xlog是JDK9中提供的非常有用的一个功能。大家可以在日常的工作中使用。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)

