JDK13的新特性:AppCDS详解

# 简介

AppCDS的全称是Application Class-Data Sharing。主要是用来在不同的JVM中共享Class-Data信息，从而提升应用程序的启动速度。

通常来说，如果要执行class字节码，JVM需要执行下面的一些步骤：给定一个类的名字，JVM需要从磁盘上面找到这个文件，加载，并验证字节码，最后将它加载进来。

如果JVM启动的时候需要加载成百上千个class，那么需要的就不是一个小数目了。

对于打包好的jar包来说，只要jar的内容不变，那么jar包中的类的数据始终是相同的。JVM在启动时候每次都会运行相同的加载步骤。

AppCDS的作用就是将这些能够共享的数据归类成一个存储文件，在不同的JVM中共享。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# 基本步骤

对AppCDS有了基本的了解之后，我们讲一下AppCDS的大概工作流程：

1. 选择要归档的class，并创建一个class的列表，用在归档中。（ -XX:DumpLoadedClassList）

2. 创建归档文件（-Xshare:dump和-XX:SharedArchiveFile）

3. 使用归档文件（-Xshare:on 和 -XX:SharedArchiveFile）

新的JVM可以使用归档文件来启动，从而减少了class加载的步骤。同时加载到内存中的区域甚至可以在其他的JVM实例中共享。从而极大的提高了JVM的启动速度。

下面我们从JDK class文件归档和应用程序class文件归档两个方面来讲解AppCDS的具体使用。

# JDK class文件归档

最简单的AppCDS的例子就是归档JDK的class文件。JDK12，JDK13默认情况下已经开启了AppCDS的支持。如果需要停用，我们可以添加 -Xshare:off。

下面的例子专门用于JDK10和JDK11。

## 创建JDK class-data archive

我们可以使用-Xshare:dump来创建JVM启动时候默认加载的Class-Data:

~~~java
java -Xshare:dump -XX:SharedArchiveFile=/tmp/sharedarchive.jsa
~~~

上面我们添加了参数-XX:SharedArchiveFile，因为默认情况下java shared archive file文件会创建在JAVA_HOME/lib/server/下面，这个是需要root权限才能写入的。为了方便起见，我们手动指定了一个有读写权限的目录。

生成的文件大概有12M，接下来我们就可以使用这个JSA文件来启动java程序了。

## 使用JDK class-data archive启动应用程序

我们先写一个可以运行的CDS hello world：

~~~java
public class CDSHelloWorld {
    public static void main(String[] args) {
        System.out.println("CDS Hello World");
    }
}
~~~

编译之后，我们运行下面的命令来使用上面创建的jsa文件：

~~~java
java -Xlog:class+load:file=/tmp/sharedarchive.log  -XX:SharedArchiveFile=/tmp/sharedarchive.jsa --enable-preview CDSHelloWorld 
~~~

上面的命令添加了两个运行时参数：

-XX:SharedArchiveFile表示使用哪个具体的jsa文件来运行java程序。

-Xlog:class+load:file主要是做调试用的，将会把JVM的class load信息输出到指定的文件中，方便我们查看。这个unified logging特性是在JDK9中添加的，后面我们也会详细介绍。

简单查看一下生产的log文件：

~~~java
[0.010s][info][class,load] opened: /Library/Java/JavaVirtualMachines/jdk-14.0.1.jdk/Contents/Home/lib/modules
[0.017s][info][class,load] java.lang.Object source: shared objects file
[0.017s][info][class,load] java.io.Serializable source: shared objects file
[0.017s][info][class,load] java.lang.Comparable source: shared objects file
...
[0.056s][info][class,load] CDSHelloWorld source: file:/Users/learn-java-base-9-to-14/java-13/target/classes/
~~~

从生成的日志文件我们可以看到，除了自己写的java文件，其他的java class都是从shared objects file中加载的。

## 运行时间对比

我们可以简单的使用time命令来对两种情况进行一下对比，看具体的运行时间差别：

~~~java
 time  java -Xlog:class+load:file=/tmp/sharedarchive.log  -XX:SharedArchiveFile=/tmp/sharedarchive.jsa --enable-preview CDSHelloWorld 
CDS Hello World
java -Xlog:class+load:file=/tmp/sharedarchive.log  --enable-preview   

0.06s user 
0.06s system 
77% cpu 
0.164 total
~~~

~~~java
time java  --enable-preview CDSHelloWorld 
CDS Hello World
java --enable-preview CDSHelloWorld  

0.09s user 
0.06s system 
66% cpu 
0.222 total
~~~

HelloWorld只是一个简单的例子，可能两者的区别还不是特别明显。

如果是大型的项目，处理JDK自带的class之外，我们还可以将项目中共享的模块做成jsa文件，从而提升启动速度。

# 应用程序class文件归档

应用程序class文件归档和上面讲的JDK class文件归档很类似。基本步骤就是：1.列出运行应用程序时需要加载的class文件。2.将这class文件归档。

在JDK13之前，我们需要两步才能生成jsa文件。在JDK13之后，只需要一个命令就行了。

## 生成应用程序加载class的列表

我们可以使用XX:DumpLoadedClassList来生成应用程序加载class的列表：

~~~java
java -XX:DumpLoadedClassList=/tmp/classes.lst --enable-preview CDSHelloWorld 
~~~

我们可以得到类似下面的class文件列表：

~~~java
java/lang/Object
java/io/Serializable
java/lang/Comparable
java/lang/CharSequence
java/lang/constant/Constable
java/lang/constant/ConstantDesc
~~~

## 使用class文件列表生成jsa文件

有了class文件列表，我们就可以生成jsa文件了：

~~~java
java -Xshare:dump -XX:SharedArchiveFile=/tmp/sharedarchive.jsa -XX:SharedClassListFile=/tmp/classes.lst  --enable-preview CDSHelloWorld 
~~~

跟之前的例子一样，只不过多了一个-XX:SharedClassListFile参数。

## JDK13的新用法

在JDK13，一切都变得简单了，只需要一个-XX:ArchiveClassesAtExit就好：

~~~java
java -XX:ArchiveClassesAtExit=/tmp/sharedarchive.jsa  --enable-preview CDSHelloWorld 
~~~

JVM将会在退出时生成jsa文件。

# 总结

AppCDS是一个新特性，在特别关注java启动时间的情况下可以考虑使用。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)

