JDK14性能管理工具:Jconsole详解

# 简介

我们在开发java项目的时候，或多或少都会去用到Java的性能管理工具。有时候是为了提升应用程序的性能，有时候是为了查找java应用程序的bug。

性能监控和调试工具在英文中叫做profile tool，提起这种工具大家可能会想到一些非常出名的jprofile等收费工具，其实JDK也自带了一些性能调试工具，比如JMC和Jconsole。

JMC现在已经和JDK的版本独立出来了，详情请参考我之前的文章：[JDK 14的新特性:JFR,JMC和JFR事件流](http://www.flydean.com/jdk14-jfr-jmc-event-stream/),今天我们将会重点讲解Jconsole的使用。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# JConsole

JConsole是JDK自带的管理工具，在JAVA_HOME/bin下面，直接命令JConsole即可开启JConsole。

![](https://img-blog.csdnimg.cn/2020050819524561.png)

JConsole有两种连接方式，一种是连接本地的进程，一种是连接远程的程序。

本地连接是不需要密码的，直接选择相应的JVM程序即可。本地连接有一个前提，就是JConsole的用户一定要和java程序的用户是相同的，否则无法操作JVM。

远程连接是通过JMX协议进行的，JMX的全称是Java Management Extention，现在大家做web可能对这个协议不太清楚，如果是做客户端程序，接触的应该会多一些。简单点讲，JMX是用来做远程管理的。程序把要管理的Bean暴露出去，然后通过JMX协议连接进行操作。

好了，我们连上一个自己写的程序试一下。

## 概览

JConsole分为六大部分，概览，内存，线程，类，VM和MBean。

先看一下概览：

![](https://img-blog.csdnimg.cn/20200508205333161.png)

概览展示了堆内存使用量，线程，类和CPU占用率这四大内容。

## 内存

我们这个程序是使用JDK14来启动的，我们看下它的内存情况：


![](https://img-blog.csdnimg.cn/20200508211324725.png)

从上图中，我们可以看到使用JConsole可以监控堆内存，非堆内存的一些情况，更进一步，还可以监控内存池中的一些项目的使用情况。

G1垃圾回收器中的Eden，Old和Survivor space大家应该都很熟悉了。

Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。垃圾回收的时候，会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

就这样不断的扫描，最后经过多次扫描发现任然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

在JDK8之前，类定义、字节码和常量等很少会变更的信息是放在持久代Perm Gen中的。不过在JDK8之后，Perm Gen已经被取消了，现在叫做Metaspace。Metaspace并不在java虚拟机中，它使用的是本地内存。Metaspace可以通过-XX:MaxMetaspaceSize来控制。

Code Cache是JVM用来存储native code的，因为是用Heap的形式来存储的，所以叫Code Heap。Code Heap被分为三个部分，Non-method，Profiled和Non-profiled。

Non-method部分包含的是非方法的code，比如说编译器缓冲区和字节码解释器。这些代码是永久保存在代码缓存区中的。代码堆的大小是固定的。Non-method使用-XX:NonMethodCodeHeapSize来控制。

Profiled部分表示存的是生命周期比较短的稍微优化的profiled methods。Profiled使用–XX:ProfiledCodeHeapSize来控制。

Non-profiled存放的是优化过的，non-profiled方法，并且他们的生命周期会比较长。Non-profiled用-XX:NonProfiledCodeHeapSize来控制。

最后还有一个Compressed Class Space，它是和-XX:+UseCompressedOops，-XX:+UseCompressedClassesPointers有关的。实际上是一个指针的压缩，可以使用32bits来表示之前64bits的指针。

## 线程

![](https://img-blog.csdnimg.cn/20200508214653773.png)

线程列出了程序目前正在运行的线程，如果点击具体的线程信息还可以看到线程中的堆栈跟踪和线程状态统计，非常有用。

## 类

类很简单，显示了加载的类的个数。

![](https://img-blog.csdnimg.cn/20200508214856914.png)

## VM信息

![](https://img-blog.csdnimg.cn/20200508214954341.png)

VM信息展示了虚拟机相关的一些参数。

## MBean

最后，MBean暴露了JVM中的一些Bean，我们可以查看这些bean的信息或者调用Bean中的方法。

![](https://img-blog.csdnimg.cn/20200508215203298.png)

以我们之前讲过的JFR为例，我们可以调用JFR的startRecording，stopRecording等方法。

# 总结

JConsole是一个比较简单但是也很实用的profile工具，希望大家能够在编写代码之余，多多考虑代码的性能和效率。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
