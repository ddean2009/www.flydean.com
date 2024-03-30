---
slug: /jvm-string-intern
---

# 11. JVM系列之:String.intern和stringTable

## 简介

StringTable是什么？它和String.intern有什么关系呢？在字符串对象的创建过程中，StringTable有起到了什么作用呢？

一切的答案都在本文中，快来看看吧。

## intern简介

intern是String类中的一个native方法，所以它底层是用c++来实现的。感兴趣的同学可以去查看下JVM的源码了解更多的内容。

这里我们主要谈一下intern的作用。

intern返回的是这个String所代表的对象，怎么理解呢？

String class维护了一个私有的String pool, 这个String pool也叫StringTable,中文名字叫做字符串常量池。

当我们调用intern方法的时候，如果这个StringTable中已经包含了一个相同的String对象（根据equals（Object）方法来判断两个String对象是否相等），那么将会直接返回保存在这个StringTable中的String。

如果StringTable中没有相同的对象，那么这个String对象将会被加入StringTable，并返回这个String对象的引用。

所以，当且仅当 s.equals(t) 的时候s.intern() == t.intern()。 

## intern和字符串字面量常量

我们知道在类文件被编译成class文件时，每个class文件都有一个常量池，常量池中存了些什么东西呢？

字符串常量，类和接口名字，字段名，和其他一些在class中引用的常量。

看一个非常简单的java类：

~~~java
public class SimpleString {
    public String site="www.flydean.com";
}
~~~

然后看一下编译出来的class文件中的Constant Pool：

~~~java
Constant pool:
   #1 = Methodref          #2.#3          // java/lang/Object."<init>":()V
   #2 = Class              #4             // java/lang/Object
   #3 = NameAndType        #5:#6          // "<init>":()V
   #4 = Utf8               java/lang/Object
   #5 = Utf8               <init>
   #6 = Utf8               ()V
   #7 = String             #8             // www.flydean.com
   #8 = Utf8               www.flydean.com
   #9 = Fieldref           #10.#11        // com/flydean/SimpleString.site:Ljava/lang/String;
  #10 = Class              #12            // com/flydean/SimpleString
  #11 = NameAndType        #13:#14        // site:Ljava/lang/String;
  #12 = Utf8               com/flydean/SimpleString
  #13 = Utf8               site
  #14 = Utf8               Ljava/lang/String;
  #15 = Utf8               Code
  #16 = Utf8               LineNumberTable
  #17 = Utf8               LocalVariableTable
  #18 = Utf8               this
  #19 = Utf8               Lcom/flydean/SimpleString;
  #20 = Utf8               SourceFile
  #21 = Utf8               SimpleString.java
~~~

上面的结果，我们可以看到class常量池中的index 7存放了一个字符串，这个字符串的实际内容存放在index 8中，是一个变种的Utf8的编码。

~~~java
   #7 = String             #8             // www.flydean.com
   #8 = Utf8               www.flydean.com
~~~

好了，现在问题来了，class文件中的常量池在运行时需要转换成为JVM能够识别的运行时常量池，这个运行时的常量池和StringTable和intern有什么关系呢？

![](https://img-blog.csdnimg.cn/202006211039235.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

在java对象的实例化过程中，所有的字符串字面量都会在实例化的时候自动调用intern方法。

如果是第一次调用，则会创建新的String对象，存放在String Table中，并返回该String对象的引用。

## 分析intern返回的String对象

从上面的图中，我们也可以出来String Table中存储的是一个String对象，它和普通的String对象没有什么区别，也分为对象头，底层的byte数组引用，int hash值等。

如果你不相信，可以使用JOL来进行分析：

~~~java
log.info("{}", ClassLayout.parseInstance("www.flydean.com".intern()).toPrintable());
~~~

看下输出结果：

~~~java
INFO com.flydean.StringInternJOL - java.lang.String object internals:
 OFFSET  SIZE      TYPE DESCRIPTION                               VALUE
      0     4           (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4           (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4           (object header)                           77 1a 06 00 (01110111 00011010 00000110 00000000) (399991)
     12     4    byte[] String.value                              [119, 119, 119, 46, 102, 108, 121, 100, 101, 97, 110, 46, 99, 111, 109]
     16     4       int String.hash                               0
     20     1      byte String.coder                              0
     21     1   boolean String.hashIsZero                         false
     22     2           (loss due to the next object alignment)
Instance size: 24 bytes
Space losses: 0 bytes internal + 2 bytes external = 2 bytes total

~~~

## 分析实际的问题

有了上面的知识，让我们分析一下下面的实际问题吧：

~~~java
        String a =new String(new char[]{'a','b','c'});
        String b = a.intern();
        System.out.println(a == b);

        String x =new String("def");
        String y = x.intern();
        System.out.println(x == y);
~~~

两个很简单的例子，答案是什么呢？ 答案是true和false。

第一个例子按照上面的原理很好理解，在构建String a的时候，String table中并没有”abc“这个字符串实例。所以intern方法会将该对象添加到String table中，并返回该对象的引用。

所以a和b其实是一个对象，返回true。

那么第二个例子呢？初始化String的时候，不是也没有”def“这个字符串吗？为什么回返回false呢？

还记得我们上面一个小节分析的吗？所有的字符串字面量在初始化的时候会默认调用intern方法。

也就是说”def“在初始化的时候，已经调用了一次intern了，这个时候String table中已经有”def“这个String了。

所以x和y是两个不同的对象，返回的是false。

> 注意，上面的例子是在JDK7+之后运行的，如果你是在JDK6中运行，那么得到的结果都是false。

JDK6和JDK7有什么不同呢？

在JDK6中，StringTable是存放在方法区中的，而方法区是放在永久代中的。每次调用intern方法，如果String Table中不存在该String对象，则会将该String对象进行一次拷贝，并返回拷贝后String对象的引用。

因为做了一次拷贝，所以引用的不是同一个对象了。结果为false。

在JDK7之后，StringTable已经被转移到了java Heap中了，调用intern方法的时候，StringTable可以直接将该String对象加入StringTable，从而指向的是同一个对象。

## G1中的去重功能

如果频繁的进行String的复制，实际上是非常消耗内存空间的。所以在G1垃圾回收器中，可以使用下面的：

~~~java
-XX:+UseStringDeduplication
~~~

来开启String的去重功能。

我们还记得String对象的底层结构吧，就是一个byte[]数组，String去重的原理就是让多个字符串对象底层的byte数组指向同一个地方。从而节省内存。

我们可以通过使用：

~~~java
-XX:+PrintStringTableStatistics
~~~

参数来查看StringTable的大小。并通过：

~~~java
-XX:StringTableSizen=n
~~~

来指定StringTable的大小。

## 总结

本文讲了String.intern和String table的关系，如果有什么错误或者遗漏的地方，欢迎大家留言给我！

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
