终于我用JOL打破了你对java对象的所有想象

# 简介

使用面向对象的编程语言的好处就是，虽然没有女朋友，但是仍然可以new对象出来。Java是面向对象的编程语言，我们天天都在使用java来new对象，但估计很少有人知道new出来的对象到底长的什么样子，是美是丑到底符不符合我们的要去？

对于普通的java程序员来说，可能从来没有考虑过java中对象的问题，不懂这些也可以写好代码。

但是对于一个有钻研精神的极客来说，肯定会想多一些，再多一些，java中的对象到底是什么样的。

今天，小F给大家介绍一款工具JOL，可以满足大家对java对象的所有想象。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# JOL简介

JOL的全称是Java Object Layout。是一个用来分析JVM中Object布局的小工具。包括Object在内存中的占用情况，实例对象的引用情况等等。

JOL可以在代码中使用，也可以独立的以命令行中运行。命令行的我这里就不具体介绍了，今天主要讲解怎么在代码中使用JOL。

使用JOL需要添加maven依赖：

~~~xml
<dependency>
            <groupId>org.openjdk.jol</groupId>
            <artifactId>jol-core</artifactId>
            <version>0.10</version>
</dependency>
~~~

添加完依赖，我们就可以使用了。

# 使用JOL分析VM信息

首先我们看下怎么使用JOL来分析JVM的信息，代码非常非常简单：

~~~java
log.info("{}", VM.current().details());
~~~

输出结果：

~~~java
# Running 64-bit HotSpot VM.
# Using compressed oop with 3-bit shift.
# Using compressed klass with 3-bit shift.
# WARNING | Compressed references base/shifts are guessed by the experiment!
# WARNING | Therefore, computed addresses are just guesses, and ARE NOT RELIABLE.
# WARNING | Make sure to attach Serviceability Agent to get the reliable addresses.
# Objects are 8 bytes aligned.
# Field sizes by type: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]
# Array element sizes: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]
~~~

上面的输出中，我们可以看到：Objects are 8 bytes aligned，这意味着所有的对象分配的字节都是8的整数倍。

# 使用JOL分析String

上面的都不是重点，重点是怎么使用JOL来分成class和Instance信息。

其实java中的对象，除了数组，其他对象的大小应该都是固定的。我们先举一个最最常用的字符串来看一下：

~~~java
log.info("{}",ClassLayout.parseClass(String.class).toPrintable());
~~~

上面的例子中，我们使用ClassLayout来解析一个String类，先看下输出：

~~~java
[main] INFO com.flydean.JolUsage - java.lang.String object internals:
 OFFSET  SIZE      TYPE DESCRIPTION                               VALUE
      0    12           (object header)                           N/A
     12     4    byte[] String.value                              N/A
     16     4       int String.hash                               N/A
     20     1      byte String.coder                              N/A
     21     1   boolean String.hashIsZero                         N/A
     22     2           (loss due to the next object alignment)
Instance size: 24 bytes
Space losses: 0 bytes internal + 2 bytes external = 2 bytes total
~~~

先解释下各个字段的含义，OFFSET是偏移量，也就是到这个字段位置所占用的byte数，SIZE是后面类型的大小，TYPE是Class中定义的类型，DESCRIPTION是类型的描述，VALUE是TYPE在内存中的值。

分析下上面的输出，我们可以得出，String类中占用空间的有5部分，第一部分是对象头，占12个字节，第二部分是byte数组，占用4个字节，第三部分是int表示的hash值，占4个字节，第四部分是byte表示的coder，占1个字节，最后一个是boolean表示的hashIsZero，占1个字节，总共22个字节。但是JVM中对象内存的分配必须是8字节的整数倍，所以要补全2字节，最后String类的总大小是24字节。

有人可能要问小F了，如果字符串里面存了很多很多数据，那么对象的大小还是24字节吗？

这个问题问得非常有水平，下面我们就来看看怎么使用JOL来解析String对象的信息：

~~~java
log.info("{}",ClassLayout.parseInstance("www.flydean.com").toPrintable());
~~~

上面的例子，我们使用了parseInstance而不是parseClass来解析String实例的信息。

输出结果：

~~~java
[main] INFO com.flydean.JolUsage - java.lang.String object internals:
 OFFSET  SIZE      TYPE DESCRIPTION                               VALUE
      0     4           (object header)                           01 c2 63 a2 (00000001 11000010 01100011 10100010) (-1570520575)
      4     4           (object header)                           0c 00 00 00 (00001100 00000000 00000000 00000000) (12)
      8     4           (object header)                           77 1a 06 00 (01110111 00011010 00000110 00000000) (399991)
     12     4    byte[] String.value                              [119, 119, 119, 46, 102, 108, 121, 100, 101, 97, 110, 46, 99, 111, 109]
     16     4       int String.hash                               0
     20     1      byte String.coder                              0
     21     1   boolean String.hashIsZero                         false
     22     2           (loss due to the next object alignment)
Instance size: 24 bytes
Space losses: 0 bytes internal + 2 bytes external = 2 bytes total
~~~

先看结论，和String Class一样，这个String对象确实只占24字节。

实例的解析和Class解析的结果差不多，因为是实例对象，所以多了VALUE的值。

我们知道在JDK9之后，String的底层存储从Char[] 变成了Byte[]用于节约String的存储空间。上面的输出中，我们可以看到String.value值确实很长，但是保存在String中的只是Byte数组的引用地址，所以4字节就够了。

# 使用JOL分析数组

虽然String的大小是不变的，但是其底层数组的大小是可变的。我们再举个例子：

~~~java
log.info("{}",ClassLayout.parseClass(byte[].class).toPrintable());
~~~

输出结果：

~~~java
[main] INFO com.flydean.JolUsage - [B object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0    16        (object header)                           N/A
     16     0   byte [B.<elements>                             N/A
Instance size: 16 bytes
Space losses: 0 bytes internal + 0 bytes external = 0 bytes total
~~~

类的解析结果，可以看到Byte数组占16个字节。

再看实例的情况：

~~~java
log.info("{}",ClassLayout.parseInstance("www.flydean.com".getBytes()).toPrintable());
~~~

输出结果：

~~~java
[main] INFO com.flydean.JolUsage - [B object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           22 13 07 00 (00100010 00010011 00000111 00000000) (463650)
     12     4        (object header)                           0f 00 00 00 (00001111 00000000 00000000 00000000) (15)
     16    15   byte [B.<elements>                             N/A
     31     1        (loss due to the next object alignment)
Instance size: 32 bytes
Space losses: 0 bytes internal + 1 bytes external = 1 bytes total
~~~

可以看到数组的大小真的变化了，这次变成了32字节。

# 使用JOL分析自动装箱

我们知道，java中的基本类型都有一个和它对于的Object类型，比如long和Long，下面我们来分析下他们两个在JVM中的内存区别：

~~~java
log.info("{}",ClassLayout.parseClass(Long.class).toPrintable());
~~~

输出结果：

~~~java
[main] INFO com.flydean.JolUsage - java.lang.Long object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0    12        (object header)                           N/A
     12     4        (alignment/padding gap)                  
     16     8   long Long.value                                N/A
Instance size: 24 bytes
Space losses: 4 bytes internal + 0 bytes external = 4 bytes total
~~~

可以看到1个Long对象是占24个字节的，但是其中真正存储long的value只占8个字节。

看一个实例：

~~~java
log.info("{}",ClassLayout.parseInstance(1234567890111112L).toPrintable());
~~~

输出结果：

~~~java
[main] INFO com.flydean.JolUsage - java.lang.Long object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           9a 15 00 00 (10011010 00010101 00000000 00000000) (5530)
     12     4        (alignment/padding gap)                  
     16     8   long Long.value                                1234567890111112
Instance size: 24 bytes
Space losses: 4 bytes internal + 0 bytes external = 4 bytes total
~~~

# 使用JOL分析引用关系

上面我们使用JOL分析的是class内部的空间使用情况，那么如果有外部引用可不可以分析呢？

~~~java
HashMap hashMap= new HashMap();
hashMap.put("flydean","www.flydean.com");
log.info("{}", GraphLayout.parseInstance(hashMap).toPrintable());
~~~

上面我们使用一个不同的layout:GraphLayout,它可以用来分析外部引用情况。

输出结果：

~~~java
[main] INFO com.flydean.JolUsage - java.util.HashMap@57d5872cd object externals:
          ADDRESS       SIZE TYPE                      PATH                           VALUE
        7875f9028         48 java.util.HashMap                                        (object)
        7875f9058         24 java.lang.String          .table[14].key                 (object)
        7875f9070         24 [B                        .table[14].key.value           [102, 108, 121, 100, 101, 97, 110]
        7875f9088         24 java.lang.String          .table[14].value               (object)
        7875f90a0         32 [B                        .table[14].value.value         [119, 119, 119, 46, 102, 108, 121, 100, 101, 97, 110, 46, 99, 111, 109]
        7875f90c0         80 [Ljava.util.HashMap$Node; .table                         [null, null, null, null, null, null, null, null, null, null, null, null, null, null, (object), null]
        7875f9110         32 java.util.HashMap$Node    .table[14]                     (object)
~~~

从结果我们可以看到HashMap本身是占用48字节的，它里面又引用了占用24字节的key和value。

# 总结

使用JOL可以分析java类和对象，这个对于我们对JVM和java源代码的理解和实现都是非常有帮助的。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！