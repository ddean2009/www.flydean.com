---
slug: /JDK14-java-tools
---

# 20. JDK14中的java tools简介

# 故事发生了

在还没有IDE的时代，高手们还是通过记事本来编程。那时候能够写程序的都是牛人。能把程序写得好的更是牛人中的牛人。

秃头大叔的程序员形象就是在那个时候建立起来的。

还记得十几年前的那一个春天，微风不动，太阳都羞红了脸。因为那时候的我还在一个javac，一个java的编译，运行着java程序。

虽然效率低下，但是看着我跑起来的一个又一个hello world，心里充满了欢喜。

惊喜过后便是失落，java实在太难用了太复杂了，我还是回去写C语言吧。

直到有一天，有人向我推荐了eclipse，它就像是一道闪电照亮了我前进的方向。从此什么javac，java都见鬼去吧，我只要eclipse。

很多年之后，我从eclipse转向了IDEA，开发工具越来越趁手，然后我已经差不多快忘记了java原来还提供了一系列的java tools供我们使用。

都说要勿忘初心，于是借着JDK14的发布，我又一次回顾了java tools提供的工具，居然有了惊喜的发现。

# java tools简介

JDK14中提供了多达31中工具，惭愧的是，第一次看到它们我只认识其中的部分。士知耻而后勇，于是我奋发图强，终于在今天将它们全都认识了。

31一个工具，这里我先简单介绍一下，后续再针对复杂的，特别有用的工具做一个专门的说明。

> 以下排名仅按字母顺序，不代表任何个人观点

## jaotc

一个java的静态编译器，为编译好的java方法生成native代码。

## jar 

jar包大家都很熟悉了，使用jar命令可以用来打包和解压jar文件。

## jarsigner 

jar包打完了，使用jarsigner来对jar包做签名和认证。

## java 

使用java可以运行java程序。

## javac 

javac用来编译java文件，将文本文件编译成二进制的class文件。

## javadoc 

javadoc可以将代码中写的注释文档生成HTML页面供大家参考。如果你有看过JDK的源代码的话，可以看到源代码里面写了很多注释。大家可以学习一下。因为注释很重要。

## javap

java自带的反编译工具，可以将二进制的class文件反编译成为人类可读的代码。

这个反编译工具可能不够IDE自带的反编译工具强大。

## jcmd

这里的d代表的是diagnostic，通过这个命令可以对正在运行的JVM进行调试。

这是一个非常有用的调试工具，我们在后面的文章中会详细讲解。

## jconsole 

jconsole是一个GUI客户端，可以对现有的java程序进行管理。

他们的连接协议是JMX。不知道为什么国内的公司好像很少用到JMX。um...这个问题等我有时间了研究一下。

## jdb

Java Debugger (JDB)是一个命令行的debug工具，提供了一系列的debug程序的功能。

## jdeprscan 

jdeprscan是一个分析工具，用来扫描jar或者class文件中的deprecated API。

## jdeps

jdeps是一个java class依赖的分析工具。

## jfr 

jfr是Java Flight Recorder的缩写，jfr是java应用程序的分析工具。它可以收集JVM在运行期间所产生的一系列事件，并生成文件和分析。

后面我们会用一篇文章详细讲解JFR。

## jhsdb

jhsdb是一个分析工具，可以分析正在运行的java程序中，也可以分析coredump。

## jinfo 

jinfo为特定的java进程生成运行时的java配置信息。

## jjs

jjs用来运行Nashorn engine。

## jlink

从JDK9之后，java已经模块化了。jlink可以将模块和他们的依赖组织起来，生成一个自定义的运行时环境。

## jmap

jmap可以打印出某个java进程的堆信息。我们会在后面的文章中详细讲解。

## jmod

jmod用来创建和解析JMOD文件。

## jpackage

jpackage可以用来打包自运行的java程序。

## jps

列出机子上面的java进程。

## jrunscript

启动一个命令行shell，这个shell支持交互和批处理模式。

## jshell

一个可互动的java shell环境。

## jstack

打印java stack信息，主要用在debug中。后面我们会详细讲解。

## jstat

用于监控JVM的统计信息。

## jstatd

jstatd是一个RMI服务程序，用来远程监控JVM。

## keytool 

生成和管理密钥，证书的工具。

## rmic

用来生成远程方法调用的stub和skeleton类。

## rmid

启动一个守护进程，允许在JVM中注册和实例化对象。

## rmiregistry

创建一个RMI对象的注册器。

## serialver

为一个或多个class生成serialVersionUID。 

# 总结

以上的31个工具就是JDK14提供的。后面我们会挑其中几个对我们的程序调试和定位问题非常有用的几个工具来讲解。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)


