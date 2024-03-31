---
slug: /jvm-jmap-jhat
---

# 3. JDK14性能管理工具:jmap和jhat使用介绍

# 简介

我们在写代码的过程中，经常会遇到内存泄露的问题，比如某个集合中的对象没有被回收，或者内存出现不明原因的增长。这些都是需要我们来定位的问题，我们可以使用jmap和jhat来对java程序中的内存对象进行分析。

jmap(Java Memory Map)是JDK自带的工具，用来将某个java程序的内存中的信息打印或者输出到文件中，然后通过jhat（Java Heap Analysis Tool）工具对输出的文件进行分析，从而找到可能出现的问题。

接下来进入我们的jmap和jhat之旅吧。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# jmap

~~~java
    jmap -clstats <pid>
        to connect to running process and print class loader statistics
    jmap -finalizerinfo <pid>
        to connect to running process and print information on objects awaiting finalization
    jmap -histo[:[<histo-options>]] <pid>
        to connect to running process and print histogram of java object heap
    jmap -dump:<dump-options> <pid>
        to connect to running process and dump java heap
~~~

jmap有下面四个可用选项：

## clstats

clstats的全称叫做class loader statistics，用输出类加载有关的统计信息。

举一个例子：

~~~java
jmap -clstats 8820
~~~

输出结果如下：

![](https://img-blog.csdnimg.cn/20200511145420670.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_20,color_8F8F8F,t_70)

* Index - class的编号
* Super - 父类的编号
* InstBytes - 每个instance的bytes大小
* KlassBytes - 该class的bytes大小
* annotations - 注解大小
* CpAll - 每个class中constants, tags, cache, 和 operands的大小
* MethodCount - class中方法的个数
* Bytecodes - byte codes的大小
* MethodAll - method, CONSTMETHOD, stack map, 和 method data的大小
* ROAll - 可以放到read-only memory中的class元数据的大小
* RWAll - 可以放到read/write memory中的class元数据大小
* Total - ROAll + RWAll
* ClassName - class name

## finalizerinfo

finalizerinfo列出准备finalization的对象。

~~~java
jmap -finalizerinfo 8820
~~~

如果没有对象等待被finalization，则会输出：

~~~java
No instances waiting for finalization found
~~~

## histo

histo用来输出java heap对象的直方图。可以加一个live选项，用来输出live的对象。

~~~java
jmap -histo:live 8820
~~~

输出结果：

![](https://img-blog.csdnimg.cn/20200511150933393.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_20,color_8F8F8F,t_70)

num是对象的编号，instances是对象的个数，bytes是对象的大小，class name是对象的class名字。

## dump

最后要讲一下dump，dump用于dump整个java heap，dump可以接三个参数：

* live - dump live对象
* format=b  - 以hprof的二进制模式dump
* file=filename - dump对象到文件中

~~~java
jmap -dump:live,file=dump.log 8820
~~~

这里dump.log文件是非常大的，用肉眼也很难分析，下面我们介绍一下jhat（Java Heap Analysis Tool）命令来对dump出来的对象进行分析。

# jhat

注意，jhat从JDK9的时候已经删除了（JEP 241: Remove the jhat Tool）。现在Oracle官方推荐的分析工具是Eclipse Memory Analyzer Tool (MAT) 和 VisualVM。 这两款工具后面有时间再详细讲解。 

今天先使用JDK8中的jhat来分析一下上面dump出来的文件。

先看下jhat的命令格式：

~~~java
Usage:  jhat [-stack <bool>] [-refs <bool>] [-port <port>] [-baseline <file>] [-debug <int>] [-version] [-h|-help] <file>

	-J<flag>          Pass <flag> directly to the runtime system. For
			  example, -J-mx512m to use a maximum heap size of 512MB
	-stack false:     Turn off tracking object allocation call stack.
	-refs false:      Turn off tracking of references to objects
	-port <port>:     Set the port for the HTTP server.  Defaults to 7000
	-exclude <file>:  Specify a file that lists data members that should
			  be excluded from the reachableFrom query.
	-baseline <file>: Specify a baseline object dump.  Objects in
			  both heap dumps with the same ID and same class will
			  be marked as not being "new".
	-debug <int>:     Set debug level.
			    0:  No debug output
			    1:  Debug hprof file parsing
			    2:  Debug hprof file parsing, no server
~~~

因为这个命令已经被废弃了，这里就不过多讲解它的参数，总体来说jhap会解析dump出来的文件，并在本地启动一个web服务器，我们可以通过web页面来查看dump出来的数据。默认情况下web服务器的端口是7000。

~~~java
jhat dump.log
Reading from dump.log...
Dump file created Mon May 11 21:13:43 CST 2020
Snapshot read, resolving...
Resolving 197989 objects...
Chasing references, expect 39 dots.......................................
Eliminating duplicate references.......................................
Snapshot resolved.
~~~

打开localhost:7000,我们可以看到首页展示的是各个包中的类的实例和地址信息：

![](https://img-blog.csdnimg.cn/20200511152448640.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_20,color_8F8F8F,t_70)

点击首页的类的链接，可以跳转到类的具体信息页面：

![](https://img-blog.csdnimg.cn/20200511152652492.png)

类的信息页面包含很多信息，包括父类，类加载器，签名，安全域，子类，实例，引用等详细信息。

对我们分析内存泄露和内存异常等情况非常有用。

# 总结

本文介绍了jmap和jhat的使用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
