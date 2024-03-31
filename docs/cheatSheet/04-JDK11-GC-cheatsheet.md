一张PDF了解JDK11 GC调优秘籍-附PDF下载

# 简介

JDK11相比JDK10，添加了一个新的Source-File Mode，可以直接通过java来运行单个java源文件，而不需要进行编译。同时还提供了新的HTTP API，支持响应性stream。

当然上面的都不是重点，重点的是JDK11是一个LTS版本，是继JDK8之后的又一个LTS版本，也可能是大家日后使用的最多的一个版本。

所以JDK11的JVM参数吸收了JDK9，JDK10的新特性和改动，并在他们的基础上进行了微调。

同样在文章最后，我也将JDK11的GC调优秘籍做成了一张PDF，欢迎大家下载。

# 废弃的VM选项

JDK11和JDK9，JDK10相比，废弃的选项都差不多。这里重点讲下面几个：

~~~java
-XX:+AggressiveOpts
~~~

aggressive的中文意思是激进的，有进取心的意思。这个参数的意思是启用激进的优化选项，默认情况下是禁止的，并且是作为一个体验选项提供的。

因为这个选项可能在后面的版本中作为默认选项，所以在JDK11中是废弃的。

~~~java
-XX:+UseAppCDS
~~~

AppCDS是在JDK9 JPMS中引入的新特性，可以提升java程序的启动速度。

AppCDS默认情况下是开启的所以这里也废弃掉了。

> 注意，JVM中的参数如果是被废弃掉了，并不一定说这个选项的特性JVM已经不支持了，也有可能是JVM默认是开启了这个选项。

# Source-File Mode

什么是Source-File Mode呢？

Source-File Mode就是指可以直接使用java命令来运行java源代码，而不用使用javac进行编译。

当然这个只对单文件的源代码有效。

有两种方式使用Source-File Mode，一种是源文件后面带.java后缀，如：

~~~java
java HelloWorld.java
~~~

一种是添加参数--source version选项：

~~~java
java -source 11 HelloWorld
~~~

> 这里的version指的是JDK版本号，可以取值6，7，8，9，10，11。

如果没有使用.java，则必须使用-source。

Source-File Mode的原理是将源代码编译到内存中，然后执行源代码中的第一个class。

# Code Heap状态分析

我们知道JVM中的JIT编译器会将一些热点的java代码编译成机器码，而这些机器码会存储在一个叫做code cache的地方。

CodeHeap就是用来生成和管理这些机器码的类。每次存储请求都会分配一定大小的空间，这个值是由CodeCacheSegmentSize来定义的。

当然，为了提升效率，你可以将CodeCacheSegmentSize的大小设置为和cache line大小一致。不过这不是必须的。

Code Heap状态分析就是分析code cache的状态。

CodeHeap状态分析分为两个部分。 第一部分检查整个CodeHeap并汇总所有认为有用/重要的信息。 第二部分可以根据需要选的特定的命令来输出自己需要的那部分。 

我们举几个例子：

实时分析：

~~~java
jcmd <pid> Compiler.CodeHeap_Analytics [<function>] [<granularity>]
~~~

其中function可以有下面的几个选项：

* all - 列出所有的信息
* aggregate - 检查CodeHeap，并记住本地结构中的数据。
* UsedSpace - 输出已使用的空间
* FreeSpace - 输出空闲的空间
* MethodCount - 输出method count信息
* MethodSpace - 输出method space信息
* MethodAge - 输出method age信息
* MethodNames - 输出name信息
* discard - 释放该方法的所有资源

granularity是和aggregate配合使用的，代表一个aggregate代表的存储空间大小。

# AppCDS

JDK11在AppCDS上面有所提升，可以支持从module path导出 archiving classes：

~~~java
$ java -Xshare:dump -XX:SharedClassListFile=class_list_file \
    -XX:SharedArchiveFile=shared_archive_file \
    --module-path=path_to_modular_jar -m module_name
~~~

使用：

~~~java
$ java -XX:SharedArchiveFile=shared_archive_file \
    --module-path=path_to_modular_jar -m module_name
~~~

# 总结

同样的，为JDK11特意准备了一个PDF，下载链接如下：

[JDK11GC-cheatsheet.pdf](https://github.com/ddean2009/www.flydean.com/blob/master/cheatSheet/JDK11GC-cheatsheet.pdf)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！