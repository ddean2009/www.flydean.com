---
slug: /java-jar-in-detail
---

# 13. 一文读懂jar包的小秘密

# 简介

java程序员每天不是在创建jar包就是在创建jar包的路上，并且各种依赖引用都是以jar包的形式展示的。但是随着现代IDE的出现，我想很多程序员已经基本上很少直接和jar包打交道了。

换句话说，他们已经不认识jar包了。

那么jar包到底是什么呢？它有哪些小秘密呢？一起来看一下吧。

# jar包到底是什么

jar包其实是一种zip格式的文件，所以说你实际上是可以使用zip相关的命令来对jar包进行创建或者解压缩操作。

不同的是jar包中多了一个META-INF文件夹。通过这个文件夹，jar包可以执行更多的操作。

JDK也自带了一个jar命令，通过jar命令我们可以实现创建，更新jar包的操作，下图是JDK8中jar命令的说明：

![](https://img-blog.csdnimg.cn/20200710121750187.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

因为JDK9之后引入了模块化的概念，所以JDK9之后jar命令有了比较大的变化：

我们看一下JDK14中的jar命令的用法：

![](https://img-blog.csdnimg.cn/2020071012195917.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

这里主要不是讲jar命令，所以我们不具体展开。

# META-INF目录

jar包和zip包最大的区别就在于jar包中包含了META-INF目录（不是必须的），我们看一个比较常用的lombok.jar包的结构是怎么样的：

![](https://img-blog.csdnimg.cn/20200710122447696.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

这个版本比较新，所以它使用的是最新的JPMS的写法，大家可以看到在jar包的根目录下面有一个module-info.class文件，表示这个jar包使用的是模块化。

然后再看一下META-INF目录，里面有一个MANIFEST.MF文件：

~~~java
Manifest-Version: 1.0
Ant-Version: Apache Ant 1.7.1
Created-By: 14.3-b01-101 (Apple Inc.)
Premain-Class: lombok.launch.Agent
Agent-Class: lombok.launch.Agent
Can-Redefine-Classes: true
Main-Class: lombok.launch.Main
Lombok-Version: 1.18.10
~~~

MANIFEST.MF主要用来定义package相关的数据，这里我们可以看到lombok的MANIFEST.MF文件定义了manifest的版本号，创建时间，版本号和几个类型的class。

services文件夹里面存放的可以对外提供的服务。

这里列出的文件并不全，实际上还有下面几种文件：

* INDEX.LIST

可以使用 -i在生成jar包的时候自动创建，是class的index文件，主要用来加速class加载。

* x.SF

JAR包的签名文件。

* x.DSA

与具有相同基本文件名的签名文件关联的签名块文件。 该文件存储相应签名文件的数字签名。

* versions/

主要为使用多版本的特性准备的，里面存储的是不同版本的class和资源。

比如下面命令创建了多个版本发行的jar包，并且将一些文件放在 META-INF/versions/9 目录中。

~~~java
 jar --create --file mr.jar -C foo classes --release 9 -C foo9 classes
~~~

# module-info.class

假如我们使用的是JDK9之后的JPMS模块化，那么就会生成这么一个module-info.class。这个文件主要是描述模块和外部模块直接的关系。

看一下lombok的例子：

~~~java
module lombok {
    requires java.compiler;
    requires java.instrument;
    requires jdk.unsupported;
    requires static org.mapstruct.processor;

    exports lombok;
    exports lombok.experimental;
    exports lombok.extern.apachecommons;
    exports lombok.extern.java;
    exports lombok.extern.jbosslog;
    exports lombok.extern.log4j;
    exports lombok.extern.slf4j;
    exports lombok.extern.flogger;

    provides javax.annotation.processing.Processor with lombok.launch.AnnotationProcessorHider$AnnotationProcessor;
    provides org.mapstruct.ap.spi.AstModifyingAnnotationProcessor with lombok.launch.AnnotationProcessorHider$AstModificationNotifier;
}
~~~

这里面我们定义了依赖的类和service providers，同时也定义了对外提供的类。

在JDK9之后，存在两种path，一种是之前的class path，一种是module path。当 modular JAR被部署在module path中的时候，它就是一个modular JAR。当他被部署在class path中的时候，就是一个non-modular JAR。

同样的，如果是一个non-modular JAR被定义在module path中，那么这个non-modular JAR就自动被转换成了一个automatic module。

如果jar包在MANIFEST.MF中定义了Automatic-Module-Name，那么module名字就是这个值，否则会从JAR的名字来定义这个module。

automatic module主要是为了向下兼容而产生的。

关于JPMS的更多信息可以参考我之前写的文章：[JDK9的新特性:JPMS模块化](http://www.flydean.com/jdk9-java-module-jpms/).

# versions

versions主要和 multi-release JAR一起使用的：

~~~java
Multi-Release: true
~~~

所谓multi-release JAR就是说一个jar包可以支持不同版本的JDK。我们可以根据需要指定不同版本的JDK所依赖的class文件或者属性文件。这个特性在我们进行JDK升级的时候还是很有帮助的。

一般来说，目录结构是这样的：META-INF/versions/N

其中N表示的是JDK的主要发行版本，比如9，10，11等。

类加载器会先去META-INF/versions/N目录中加载所需要的class，然后会去其他的低版本的META-INF/versions/N目录中加载所需要的class，最后才会在META-INF/的根目录加载其他的class文件。

# MANIFEST.MF详解

MANIFEST.MF中存放的是key：value格式的配置信息，这些配置信息又可以分成两部分，第一部分是main-section信息，第二部分是individual-section。

我们举个简单的例子：

~~~java
Manifest-Version: 1.0
Created-By: 1.8 (Oracle Inc.)
Sealed: true
Name: foo/bar/
Sealed: false
~~~

其中

~~~java
Manifest-Version: 1.0
Created-By: 1.8 (Oracle Inc.)
Sealed: true
~~~

就是main-section信息，我们用一张图来看一下main-section的信息有哪些：

![](https://img-blog.csdnimg.cn/20200710202729293.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

在main-section信息下发可以接一个Name: Value，表示开启独立的针对于具体entry的属性（Per-Entry Attributes）配置：

~~~java
Name: foo/bar/
Sealed: false
~~~

比如上面的属性是专门针对于包foo/bar/的，并且设置其Sealed属性为false。

Per-Entry Attributes除了 package versioning 和 sealing信息外，还可以定义Content-Type，Java-Bean，x-Digest-y和Magic属性。

# JAR包签名

JAR包可以通过使用jarsigner来对其进行签名。和签名相关的文件是：

* META-INF/MANIFEST.MF
* META-INF/*.SF
* META-INF/*.DSA
* META-INF/*.RSA
* META-INF/SIG-*

签名过后的jar跟原来的jar其实并没有什么不同，只不过在META-INF/文件夹中多出了两个文件，一个是签名文件，一个是签名block文件。

## 签名文件

签名文件是以.SF结尾的，这个文件和MANIFEST.MF很类似，可以指定Signature-Version和Created-By。

除此之外，还可以指定和安全相关的属性：

* x-Digest-Manifest-Main-Attributes： 其中x是java.security.MessageDigest中指定的算法，表示的主要属性的摘要。
* x-Digest-Manifest： 表示的是整个manifest的摘要。

这两个属性主要用来做验证签名用的。

举个例子：

如果我们的manifest是下面这样的：

~~~java
    Manifest-Version: 1.0
    Created-By: 1.8.0 (Oracle Inc.)

    Name: common/class1.class
    SHA-256-Digest: (base64 representation of SHA-256 digest)

    Name: common/class2.class
    SHA1-Digest: (base64 representation of SHA1 digest)
    SHA-256-Digest: (base64 representation of SHA-256 digest)
~~~

那么相应的签名文件应该是这样的：

~~~java
    Signature-Version: 1.0
    SHA-256-Digest-Manifest: (base64 representation of SHA-256 digest)
    SHA-256-Digest-Manifest-Main-Attributes: (base64 representation of SHA-256 digest)

    Name: common/class1.class
    SHA-256-Digest: (base64 representation of SHA-256 digest)

    Name: common/class2.class
    SHA-256-Digest: (base64 representation of SHA-256 digest)
~~~

## 签名文件的摘要

如果再对.SF文件进行摘要，那么就会得到签名文件的摘要文件：

* .RSA (PKCS7 signature, SHA-256 + RSA)
* .DSA (PKCS7 signature, DSA)

# Sealed

上面我们讲到了一个Sealed属性：

~~~java
Name: javax/servlet/internal/
Sealed: true
~~~

这个属性的意思是，javax/servlet/internal/包中的所有类必须从这个jar包中加载。

这个属性主要是从jar包的安全性来考虑的。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)













