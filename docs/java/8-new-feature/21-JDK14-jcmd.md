---
slug: /JDK14-jcmd
---

# 21. jcmd-JDK14中的调试神器

# 简介

jcmd是JDK自带的调试工具，具有非常强大的功能。jcmd是JDK7中正式引入的，有了jcmd，完全可以替换很多常用的其他工具，比如jstak和jmap。

jcmd可以将具体的诊断命令发送给JVM。为了安全起见，使用jcmd的用户必须跟运行的java程序具有同样的用户和用户组。

jcmd的调试命令有很多种，每一种调试命令又有自己的参数。

本文将会结合具体的例子详细讲解jcmd的使用。

# jcmd的语法

jcmd的语法比较简单：

~~~java
jcmd [pid | main-class] command... | PerfCounter.print | -f filename

jcmd [-l]

jcmd -h
~~~

pid和main-class是二选一：

其中pid表示要发送诊断命令的java进程id。

也可以指定main-class，表示要发送诊断命令给运行该main-class的java进程。

command表示可以在jcmd中运行的命令，我们看下jcmd支持哪些命令：

~~~java
./jcmd 93989 help
93989:
The following commands are available:
Compiler.CodeHeap_Analytics
Compiler.codecache
Compiler.codelist
Compiler.directives_add
Compiler.directives_clear
Compiler.directives_print
Compiler.directives_remove
Compiler.queue
GC.class_histogram
GC.class_stats
GC.finalizer_info
GC.heap_dump
GC.heap_info
GC.run
GC.run_finalization
JFR.check
JFR.configure
JFR.dump
JFR.start
JFR.stop
JVMTI.agent_load
JVMTI.data_dump
ManagementAgent.start
ManagementAgent.start_local
ManagementAgent.status
ManagementAgent.stop
Thread.print
VM.class_hierarchy
VM.classloader_stats
VM.classloaders
VM.command_line
VM.dynlibs
VM.events
VM.flags
VM.info
VM.log
VM.metaspace
VM.native_memory
VM.print_touched_methods
VM.set_flag
VM.stringtable
VM.symboltable
VM.system_properties
VM.systemdictionary
VM.uptime
VM.version
help
~~~

Perfcounter.print表示要打印java进程暴露的performance counters。

-f filename表示从文本文件中读取要运行的命令。

-l 列出不是运行在docker中JVM。

-h 表示帮助。

下面我们举几个常用的例子

# 列出运行的JVM 

~~~java
./jcmd -l
98109 jdk.jcmd/sun.tools.jcmd.JCmd -l
~~~

通过使用jcmd -l可以列出所有正在运行的JVM进程。跟jps是一样的。

# 打印stack信息

使用jcmd pid Thread.print -l可以打印出java程序的stack信息。其中-l表示输出java.util.concurrent的lock信息。

下面看个简单的例子：

~~~java

./jcmd 93989 Thread.print -l

Full thread dump Java HotSpot(TM) 64-Bit Server VM (14.0.1+7 mixed mode, sharing):

Threads class SMR info:
_java_thread_list=0x00007fbeb1c4cb10, length=12, elements={
0x00007fbeb282a800, 0x00007fbeb282d800, 0x00007fbeb282e800, 0x00007fbeb2830800,
0x00007fbeb2831800, 0x00007fbeb2832000, 0x00007fbeb2833000, 0x00007fbeb3831000,
0x00007fbeb3822000, 0x00007fbeb3174000, 0x00007fbeb3815000, 0x00007fbeb226f800
}

"Reference Handler" #2 daemon prio=10 os_prio=31 cpu=0.64ms elapsed=8996.59s tid=0x00007fbeb282a800 nid=0x4703 waiting on condition  [0x000070000440d000]
   java.lang.Thread.State: RUNNABLE
	at java.lang.ref.Reference.waitForReferencePendingList(java.base@14.0.1/Native Method)
	at java.lang.ref.Reference.processPendingReferences(java.base@14.0.1/Reference.java:241)
	at java.lang.ref.Reference$ReferenceHandler.run(java.base@14.0.1/Reference.java:213)

   Locked ownable synchronizers:
	- None
~~~

# 打印heap info

使用jcmd pid GC.heap_info可以获得heap info。

~~~java
./jcmd 93989 GC.heap_info
93989:
 garbage-first heap   total 71680K, used 34410K [0x00000007d4400000, 0x0000000800000000)
  region size 1024K, 20 young (20480K), 4 survivors (4096K)
 Metaspace       used 23810K, capacity 24246K, committed 24752K, reserved 1071104K
  class space    used 2850K, capacity 3015K, committed 3072K, reserved 1048576K

~~~

# 打印heap dump

如果想知道heap里面到底有什么，则可以通过下面的命令将heap dump出来：

~~~java
./jcmd 93989 GC.heap_dump heap_dump.out
93989:
Dumping heap to heap_dump.out ...
Heap dump file created [27727979 bytes in 0.643 secs]
~~~

heap dump需要传入一个文件名，存放dump出来的信息。

# 统计heap使用情况

有时候我们需要统计一下heap中各个对象的使用情况，则可以下面方法：

~~~java
./jcmd 93989 GC.class_histogram

93989:
 num     #instances         #bytes  class name (module)
-------------------------------------------------------
   1:         25826       11748304  [B (java.base@14.0.1)
   2:          2233        1971800  [I (java.base@14.0.1)
   3:          5154         614928  java.lang.Class (java.base@14.0.1)
   4:         24757         594168  java.lang.String (java.base@14.0.1)
   5:          4491         439432  [Ljava.lang.Object; (java.base@14.0.1)
   6:         13177         421664  java.util.concurrent.ConcurrentHashMap$Node (java.base@14.0.1)
   7:          5025         160800  java.util.HashMap$Node (java.base@14.0.1)
   8:          8793         140688  java.lang.Object (java.base@14.0.1)
   9:           212         103584  [Ljava.util.concurrent.ConcurrentHashMap$Node; (java.base@14.0.1)
~~~

上面的结果非常有用，在一些性能调试方法可以起到意想不到的作用。

# JFR功能

jcmd还支持jfr功能。JFR的全称叫做Java Flight Recorder。你可以将其看做是JVM中一些事件的记录器。

有关JFR的更多内容，将会在我的下一篇文章中详细讲解。

# 总结

jcmd还有很多其他的功能，大家可以多用多探索。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)


