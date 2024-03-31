---
slug: /JDK9-GC-cheatsheet
---

# 一张PDF了解JDK9 GC调优秘籍-附PDF下载

# 简介

今天我们讲讲JDK9中的JVM GC调优参数，JDK9中JVM的参数总共有2142个，其中正式的参数有659个。好像比JDK8中的参数要少一点。

为了方便大家的参考，特意将JDK9中的GC参数总结成了一张PDF，这个PDF比之前总结的JDK8的PDF在排版，颜色和内容准确性上面又有了非常大的提升，欢迎大家下载。

# Oracle中的文档

今天这篇文章的内容都是从Oracle JDK9的官方文档中提炼出来的。对于里面的内容的真实性，我不能保证是100%正确的。

有人要问了，官网文档也会有错误？

这个问题要从两个方面说起，第一方面，任何人都会犯错误，虽然官网文档经过了编辑，校验核对然后才发布，但是总会有一些遗漏的地方。

第二，Oracle的文档是有专门的写文档的部门来专门编写的，写文档就是他们的工作，所以，这些文档并不是开发JDK的开发人员编写的，而是和开发JDK不相关的文档编写员编写的。

至于文档写完之后有没有JDK开发人员过目，大家可以自行脑补......

> 所以古人说得好，尽信书不如无书。

# JDK9中JVM参数的变化

一代新人换旧人，长江后浪推前浪。由来只有新人笑 有谁听到旧人哭。

JDK9出现了，那么JDK8中的一些参数自然需要退伍了。

我们回想一下JDK9中有些什么变化呢？我总结一下有三个。

1. 最大的变化就是引入了JPMS(Java Platform Module System)也就是Project Jigsaw。
   
   模块化的本质就是将一个大型的项目拆分成为一个一个的模块，每个模块都是独立的单元，并且不同的模块之间可以互相引用和调用。
   
   在module中会有元数据来描述该模块的信息和该模块与其他模块之间的关系。这些模块组合起来，构成了最后的运行程序。

2. 然后就是引入的Xlog日志服务，通过Xlog日志服务我们可以监控JVM中的事件，比如：GC,class loading,JPMS,heap,thread等等。

3. 最后就是将String中的底层存储从char数组换成了byte数组。

这三个变化中和JVM最相关的就是第二个Xlog日志服务。

## 废弃的JVM选项

`-Xusealtsigs / -XX:+UseAltSigs`

这两个选项在JDK9中被废弃了，如果你不知道也没关系，因为这两个选项是在Oracle Solaris中专有的。现在用Solaris服务器的人应该比较少了.....


## 不推荐(Deprecated)的JVM选项

下面这些选项是JVM已经不再推荐使用了，如果你使用的话也没问题，但是会有报警。

Deprecated表示这些选项会在未来被删除，我们应该尽量避免使用这些选项。

选项有很多，我们挑一些比较常见和重要的来给大家讲解一下。

`-d32 / -d64 `

为什么这两个参数会被不推荐呢？因为现在的服务器性能已经非常非常的好了。

如果你的JDK是64位的，那么默认就启用了-server和-d64模式，32位的JDK现在应该很少见到了。

> Oracle官方文档说只有Java HotSpot Server VM才有64位的模式。不知道是真是假，因为其他的VM我也没有用过，没有发言权。

`-Xloggc:garbage-collection.log`

因为JDK9中引入Xlog框架，所以之前的日志输出的参数都被替换成了新的Xlog格式：

比如上面的命令被替换成为  `-Xlog:gc:garbage-collection.log`

所以那些以Print开头的GC日志输出参数都是不推荐的。我们需要使用Xlog来替代。

同样的以Trace开头的运行时日志输出参数也是不推荐的，也可以使用Xlog来替代。

`-XX:+UseConcMarkSweepGC / -XX:CMS*`

CMS在JDK9中是不被推荐的，所以CMS开头的参数都不要用了。

`-XX:+UseParNewGC`

因为ParNewGC是和CMS一起使用的，所以CMS不推荐之后，ParNewGC也是不推荐使用的。

`-XX:MaxPermSize=size / -XX:PermSize=size`

JDK8中，Prem区已经被移到了Metaspace，所以上面的参数可以被下面的替代：

`-XX:MaxMetaspaceSize=size / -XX:MetaspaceSize=size`

## 被删除的JVM参数

`-Xincgc`

增量GC在JDK9中被删除了。

`-Xmaxjitcodesize=size` JIT中最大的code cache大小被替换成 `-XX:ReservedCodeCacheSize`。

还有其他的一些CMS的参数。

# JDK9的新特性Application Class Data Sharing

AppCDS的全称是Application Class-Data Sharing。主要是用来在不同的JVM中共享Class-Data信息，从而提升应用程序的启动速度。

通常来说，如果要执行class字节码，JVM需要执行下面的一些步骤：给定一个类的名字，JVM需要从磁盘上面找到这个文件，加载，并验证字节码，最后将它加载进来。

如果JVM启动的时候需要加载成百上千个class，那么需要的就不是一个小数目了。

对于打包好的jar包来说，只要jar的内容不变，那么jar包中的类的数据始终是相同的。JVM在启动时候每次都会运行相同的加载步骤。

AppCDS的作用就是将这些能够共享的数据归类成一个存储文件，在不同的JVM中共享。

下面是AppCDS的大概工作流程：

1. 选择要归档的class，并创建一个class的列表，用在归档中。（ -XX:DumpLoadedClassList）

2. 创建归档文件（-Xshare:dump和-XX:SharedArchiveFile）

3. 使用归档文件（-Xshare:on 和 -XX:SharedArchiveFile）

相应的VM参数如下：

![](https://img-blog.csdnimg.cn/20200623211247590.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

# JDK9的新特性Xlog

在java程序中，我们通过日志来定位和发现项目中可能出现的问题。在现代java项目中，我们使用log4j或者slf4j，Logback等日志记录框架来处理日志问题。

JVM是java程序运行的基础，JVM中各种事件比如：GC,class loading,JPMS,heap,thread等等其实都可以有日志来记录。通过这些日志，我们可以监控JVM中的事件，并可以依次来对java应用程序进行调优。

在JDK9中引入的Xlog日志服务就是为这个目的而创建的。

通过xlog，JDK将JVM中的各种事件统一起来，以统一的形式对外输出。通过tag参数来区分子系统，通过log level来区分事件的紧急性，通过logging output来配置输出的地址。

在JDK9之后，之前的Print*参数都被Xlog所代替了。

我们看下常用的Xlog和GC日志参数：

![](https://img-blog.csdnimg.cn/20200623211704311.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

# JDK9中的G1参数

作为JDK9中的默认垃圾回收器G1，对G1的调优是必不可少的。下面是G1的参数：

![](https://img-blog.csdnimg.cn/20200623211932693.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

# JDK9中的通用VM参数

下面是通用的VM参数：

![](https://img-blog.csdnimg.cn/20200623212028662.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

# JDK9中的通用GC参数

下面是JDK9中的通用GC参数：

![](https://img-blog.csdnimg.cn/20200623212122210.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

# JDK9中的内存调整参数

下面是JDK9中的内存调整参数：

![](https://img-blog.csdnimg.cn/20200623212227955.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

# 总结

千言万语不如一张PDF。我把JDK9的GC参数总结成了一张PDF，下面是PDF的下载链接。

[JDK9GC-cheatsheet.pdf](https://github.com/ddean2009/www.flydean.com/blob/master/cheatSheet/JDK9GC-cheatsheet.pdf)

欢迎大家下载。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！













