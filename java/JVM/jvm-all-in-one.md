小师妹学JVM系列

[toc]

JVM也叫Java Virtual Machine，它是java程序运行的基础，负责将java bytecode转换成为适合在各个不同操作系统中运行的机器代码并运行。今天我们和小师妹一起走进java的核心JVM，领略java在设计上的哲学。

小师妹何许人也？姓名不详，但是勤奋爱学，潜力无限，一起来看看吧。

# 第一章 JVM的架构和执行过程

## JVM是一种标准

小师妹:F师兄,经常听到有人说hotspot VM,这个跟JVM是什么关系？

其实吧，JVM只是一种标准，就像是一种协议，只要是实现和满足这种协议的都可以称为JVM。当然，java现在是Oracle公司的，所以这些所谓的JVM标准也是由Oracle来颁布的，如果你去查看Oracle的文档，就会发现有一个专门的Java SE Specifications栏目，这个栏目中列出了JVM的实现标准，最新的标准就是The Java Virtual Machine Specification, Java SE 14 Edition。

> 更多内容请访问[www.flydean.com](www.flydean.com)

既然JVM是一个标准，就可能有很多种实现。各大公司在满足JVM标准的基础上，开发了很多个不同的版本。

下面是我在维基百科中截取到的目前各个JVM的比较：

![](https://img-blog.csdnimg.cn/20200524203518218.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

小师妹：F师兄，大家齐心协力做一个JVM不是更好吗？为什么分来分去的，还要重复造轮子？

有听过Oracle和Google之间的API十年诉讼案吗？API都不能顺便用，更何况是JVM。各大厂商为了各自的利益，最终搞出了这么多个JVM的版本。

在这些JVM中，最常用的就是HotSpot JVM了，毕竟它是Oracle的亲儿子，或者可以说HotSpot JVM就是JVM的标准。

接下来就是Eclipse OpenJ9,这个是由IBM主导的JVM，一般只能跟IBM的产品一起使用的，因为有许可证限制。

## java程序的执行顺序

为了说明JVM的作用，我们先来回顾一下java程序的执行顺序。

![](https://img-blog.csdnimg.cn/20200524212920415.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

1. 编写java代码文件比如Example.java
2. 使用java编译器javac将源文件编译成为Example.class文件
3. JVM加载生成的字节码文件，将其转换成为机器可以识别的native machine code执行

## JVM的架构

小师妹：F师兄，Java语言那么多特性，最后都要在JVM中运行，JVM的架构是不是特别复杂？好怕我听不懂。

其实吧，JVM可以分为三大部分，五大空间和三大引擎，要讲起来也不是特别复杂，先看下面的总体的JVM架构图。

![](https://img-blog.csdnimg.cn/20200524221637660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从上面的图中，我们可以看到JVM中有三大部分，分别是类加载系统，运行时数据区域和Execution Engine。

### 类加载系统

类加载系统分为三个阶段，分别是加载，链接和初始化。

加载大家都很清楚了，java中有个专门的ClassLoader来负责这个事情。除了加载Class之外，ClassLoader还可以用来加载resources。

在JDK9之前，系统默认有三个类加载器，分别是：

1. Bootstrap ClassLoader

这个类加载器主要是加载 /jre/lib下面的rt.jar，并且这个类加载器是用C/C++来编写的，并且它是后面Extension ClassLoader的父ClassLoader。
这个类应该在java代码中找不到的（correct me if I am wrong!）。

2. Extension ClassLoader

这个类加载器主要加载JDK的扩展类 /jre/lib/ext，它的实现类是 sun.misc.Launcher$ExtClassLoader ：

~~~java
static class ExtClassLoader extends URLClassLoader {
        private static volatile Launcher.ExtClassLoader instance;

        public static Launcher.ExtClassLoader getExtClassLoader() throws IOException {
            if (instance == null) {
                Class var0 = Launcher.ExtClassLoader.class;
                synchronized(Launcher.ExtClassLoader.class) {
                    if (instance == null) {
                        instance = createExtClassLoader();
                    }
                }
            }

            return instance;
        }
~~~

我们看下它的实现，实际上它创建了一个单例模式，使用的是双重检查加锁，小师妹可以考虑一下怎么使用延迟初始化占位类的方式来重新这个类。

3. System ClassLoader

这个加载器是加载定义在ClassLoader中的类。它的实现类是sun.misc.Launcher$AppClassLoader，这个类的实现很长，这里就不完整列出来了：

~~~java
static class AppClassLoader extends URLClassLoader 
~~~

在JDK9之后，因为引入了JPMS模块的概念，所以类加载器变得不一样了，在JDK9之后还是有三个内置的类加载器，分别是BootClassLoader，PlatformClassLoader和AppClassLoader：

~~~java
    private static class BootClassLoader extends BuiltinClassLoader {
        BootClassLoader(URLClassPath bcp) {
            super(null, null, bcp);
        }

        @Override
        protected Class<?> loadClassOrNull(String cn, boolean resolve) {
            return JLA.findBootstrapClassOrNull(this, cn);
        }
    };
~~~

~~~java
private static class PlatformClassLoader extends BuiltinClassLoader 
~~~

~~~java
private static class AppClassLoader extends BuiltinClassLoader
~~~

Linking阶段主要做了三件事情：

1. Verification - 主要验证字节码文件的结构的正确性，如果不正确则会报LinkageError。
2. Preparation - 负责创建static fields，并且初始化他们的值。
3. Resolution - 把类型的常量池中引用的类，接口，字段和方法替换为直接引用的过程。

Initialization阶段主要是调用class的父类和自身的初始化方法，来设置变量的初始值。

### 运行时数据区域

类加载好了，也初始化了，接下来就可以准备运行了。

运行的时候要为数据分配运行空间，这就是运行时数据区域的作用。

运行时数据区域又可以分为5个部分：

1. Method Area

方法区是非Heap的内存空间，主要用来存放class结构，static fields, method, method’s data 和 static fields等。方法区是在JVM启动的时候创建的，并且在所有的线程中共享。

> Run-Time Constant Pool运行时常量池是放在方法区中的，他是class文件中constant_pool的运行时表现。

> 注意在JDK8之前，HotSpot JVM中对方法区的实现叫做持久代Perm Gen。不过在JDK8之后，Perm Gen已经被取消了，现在叫做Metaspace。Metaspace并不在java虚拟机中，它使用的是本地内存。Metaspace可以通过-XX:MaxMetaspaceSize来控制。

2. Heap Area

Heap Area主要存储类对象和数组。垃圾回收器（GC）主要就是用来回收Heap Area中的对象的。

3. Stack Area

因为是栈的结构，所以这个区域总是LIFO(Last in first out)。我们考虑一个方法的执行，当方法执行的时候，就会在Stack Area中创建一个block，这个block中持有对本地对象和其他对象的引用。一旦方法执行完毕，则这个block就会出栈，供其他方法访问。

4. PC Registers

PC Registers主要用来对程序的执行状态进行跟踪，比如保存当前的执行地址，和下一步的地址等。

5. Native Methods

最后一个就是本地方法区了，因为JVM的底层很多都是由C/C++来实现的，这些方法的实现就构成了本地方法区。

### 执行引擎

执行引擎主要负责将java的字节码翻译成机器码然后执行。

先看一个java字节码的内在结构,大家可以随便找一个编译好的类，使用javap来进行解析：

~~~java
javap -v BufferUsage
~~~

![](https://img-blog.csdnimg.cn/20200525093536806.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里不过多介绍输出结果的含义，我们会在后面的文章中进行详解。

这我们可以看到方法中都有一个Code片段，这些Code被称为OpCode，是JVM可以理解的操作命令。

执行引擎中里面又有三个部分：

1. Interpreter 

翻译器用来读取上面介绍的OpCode，并将其翻译成为机器语言。因为翻译器需要一个命令一个命令的翻译字节码，所以速度会比较慢。这就是很久很久以前Java被诟病的地方。

2. JIT (Just-In-Time) compiler 

为了解决Interpreter翻译慢的问题，JDK引入了JIT，对于那些经常使用的代码，JIT会将这些字节码翻译成为机器代码，并直接复用这些机器代码，从而提高了执行效率。

3. Garbage Collector 

GC用来回收Heap Area，他是一个Daemon thread。

## 总结

本文介绍了JVM的总体架构信息。各个部分的细节信息会在后面的系列文章中陆续讲解。欢迎大家关注小师妹系列。

# 第二章 终于我用JOL打破了你对java对象的所有想象

## 简介

使用面向对象的编程语言的好处就是，虽然没有女朋友，但是仍然可以new对象出来。Java是面向对象的编程语言，我们天天都在使用java来new对象，但估计很少有人知道new出来的对象到底长的什么样子，是美是丑到底符不符合我们的要去？

对于普通的java程序员来说，可能从来没有考虑过java中对象的问题，不懂这些也可以写好代码。

但是对于一个有钻研精神的极客来说，肯定会想多一些，再多一些，java中的对象到底是什么样的。

今天，小F给大家介绍一款工具JOL，可以满足大家对java对象的所有想象。

> 更多内容请访问[www.flydean.com](www.flydean.com)

## JOL简介

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

## 使用JOL分析VM信息

首先我们看下怎么使用JOL来分析JVM的信息，代码非常非常简单：

~~~java
log.info("{}", VM.current().details());
~~~

输出结果：

~~~java
## Running 64-bit HotSpot VM.
## Using compressed oop with 3-bit shift.
## Using compressed klass with 3-bit shift.
## WARNING | Compressed references base/shifts are guessed by the experiment!
## WARNING | Therefore, computed addresses are just guesses, and ARE NOT RELIABLE.
## WARNING | Make sure to attach Serviceability Agent to get the reliable addresses.
## Objects are 8 bytes aligned.
## Field sizes by type: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]
## Array element sizes: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]
~~~

上面的输出中，我们可以看到：Objects are 8 bytes aligned，这意味着所有的对象分配的字节都是8的整数倍。

## 使用JOL分析String

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

## 使用JOL分析数组

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

## 使用JOL分析自动装箱

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

## 使用JOL分析引用关系

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

## 总结

使用JOL可以分析java类和对象，这个对于我们对JVM和java源代码的理解和实现都是非常有帮助的。

# 第三章 java的字节码byte code简介

## 简介

Byte Code也叫做字节码，是连接java源代码和JVM的桥梁，源代码编译成为字节码，而字节码又被加载进JVM中运行。字节码怎么生成，怎么查看字节码，隐藏在Byte Code背后的秘密是什么呢？快跟小师妹一起来看看吧。

## Byte Code的作用

小师妹：F师兄，为什么Java需要字节码呢？直接编译成为机器码不是更快吗？

小师妹，Java的设计初衷是一次编写，到处运行。为了兼容各个平台的运行环境，java特别为各种平台设计了JVM。

我们可以把JVM看做是一种抽象，对外提供了统一的接口。这样我们只需要编写符合JVM规范的代码，即可在JVM中运行。

回想下之前我们提到过的java的执行过程：

![](https://img-blog.csdnimg.cn/20200524212920415.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

1. 编写java代码文件比如Example.java
2. 使用java编译器javac将源文件编译成为Example.class文件
3. JVM加载生成的字节码文件，将其转换成为机器可以识别的native machine code执行

小师妹：F师兄，我有一个大胆的想法，JVM的作用是将字节码解释或者编译成为机器码。然后在相应的运行环境中执行。那么有没有可能，不需要JVM，不需要机器码，而是直接在对应的平台上执行字节码呢？

爱因斯坦说过没有想像力的灵魂，就像没有望远镜的天文台。小师妹你这个想法很好，这种实现有个专业的说法叫做：Java processor。

Java processor就是用硬件来实现的JVM。因此字节码可以直接在Java processor中运行。

其中比较出名的是Jazelle DBX，这是一个主要支持J2ME环境的硬件架构。为了提升java在手机端的执行速度。

但是这样做其实也是有缺点的，后面我们会讲到，java字节码中的指令非常非常多。所以如果用硬件来实现的话，就会非常非常复杂。

一般来说Java processor不会实现全部的字节码中的功能，只会提供部分的实现。

## 查看Byte Code字节码

小师妹：F师兄，那使用javac编译过后的class文件跟字节码有什么关系呢？

class文件中大部分都是byte code，其他的部分是一些meta data元数据信息。这些组合在一起就是class文件了。

小师妹：F师兄，你说class文件是byte code，为什么我在IDE中打开的时候，直接显示的是反编译出来的源文件呢？

小师妹，这是IDE的一个便利功能。因为大多数情况下，没有人想去看class文件的Byte code的，大家都是想去看看这个class文件的源文件是什么样的。

我们举个最简单的例子：

![](https://img-blog.csdnimg.cn/2020053021330297.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这个类中，我们定义了一个很简单的testByteCode方法，里面定义了两个变量，然后返回他们两个的和。

现在有两种方法来查看这个类的Byte Code：

第一种方法是用javap命令：

~~~java
javap -c ByteCodeUsage.class
~~~

![](https://img-blog.csdnimg.cn/20200530213721962.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

生成的结果如上所示。

第二种方法就是在IDEA中，选中class文件，然后在view中选中show Bytecode：

![](https://img-blog.csdnimg.cn/20200530214606575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们看下输出结果：

![](https://img-blog.csdnimg.cn/20200530215213620.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

两个的结果在显示上面可能有细微的差异，但是并不影响我们后面对其的解析。

## java Byte Code是怎么工作的

小师妹：F师兄，能讲解一下这些byte code到底是怎么工作的吗？

首先我们要介绍一下JVM的实现是基于栈的结构的。为什么要基于栈的结构呢？那是因为栈是最适合用来实现function互相调用的。

我们再回顾一下上面的testByteCode的字节码。里面有很多iconst，istore的东西，这些东西被称作Opcode，也就是一些基于栈的操作指令。

上面讲了java bytecode的操作指令其实有很多个。下面我们列出这些指令的部分介绍：

![](https://img-blog.csdnimg.cn/20200530223345376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

实在是太多了，这里就不把所有的列出来了。

我们看到的指令名字其实是一个助记词，真实的Opcode是一个占用两个字节的数字。

下面我们来详细解释一下testByteCode方法：

~~~java
public int testByteCode();
    Code:
       0: iconst_1
       1: istore_1
       2: iconst_2
       3: istore_2
       4: iload_1
       5: iload_2
       6: iadd
       7: ireturn
~~~

第一步，iconst_1将int 1加载到stack中。

第二步，istore_1将入栈的int 1出栈，并存储到变量1中。

第三步，iconst_2将int 2入栈。

第四步，istore_2将入栈的int 2出栈，并存储到变量2中。

第五步，iload_1将变量1中的值入栈。

第六步，iload_2将变量2中的值入栈。

第七步，iadd将栈中的两个变量出栈，并相加。然后将结果入栈。

第八步，ireturn将栈中的结果出栈。

这几步实际上完美的还原了我们在testByteCode方法中定义的功能。

当然我们只介绍了最贱的byte code命令，通过这些简单的命令可以组合成为更加复杂的java命令。

## 总结

本文介绍了java byte code的作用和具体的指令，并分析了一个简单的例子来做说明。希望大家能够掌握。

# 第四章 Dirty cards和PLAB

## 简介 

分代垃圾回收器在进行minor GC的时候会发生什么操作呢？有没有什么提高效率的手段呢？今天我们和小师妹一起来了解一下垃圾回收中的Dirty cards和PLAB

## 分代收集器中的空间划分

小师妹：F师兄，能再讲讲分代垃圾收集器中的空间划分吗？

分代垃圾回收器中的Eden，Old和Survivor space几个大家应该都很熟悉的分代技术。

Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。

当Eden space满的时候，就会触发minor GC。会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

就这样不断的扫描，最后经过多次扫描发现仍然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

![](https://img-blog.csdnimg.cn/20200525214231730.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## Write barrier和Dirty cards

小师妹：F师兄，minor GC的时候，要将对象从Eden复制到Suvivor Space，从Suvivor Space中复制到Old space。GC是怎么知道哪些对象是要被回收，哪些是不用被回收的呢？

小师妹，GC这里用到了一项叫做Dirty cards的技术。

一般来说，新的对象是分配在Eden空间的。但是也有些对象是直接分配在Old space。

我们知道，GC的扫描是从一些根对象开始的，这些Root对象包括：正在执行的方法中的本地对象和输入参数。活动的线程，加载类中的static字段和JNI引用。

而这些根对象，一般都是存储在old space中的。

通常来说old space的空间都会比较大。每次要要找到Eden和suvivor Space中哪些对象不再被引用，需要扫描整个old space肯定是不可取的。

所以JVM在这里引入了Write barrier的技术。HotSpot中有两种Write barrier，一种就是今天我们要讲的Dirty cards,另外一种就是snapshot-at-the-beginning (SATB)。 SATB通常用在G1垃圾回收器中，这里我们先不做深入的讨论。

![](https://img-blog.csdnimg.cn/20200607152228268.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们看下上图中的Dirty cards的使用。 

Dirty cards说起来很简单，就是每当有程序对引用进行修改的时候，我们都会在一个Dirty cards的空间记录一下被修改的memory page。

这样在minor GC的时候，当引用的对象被修改了之后，我们会同步修改对应的Dirty cards。这样每次扫描old space的时候，只需要选择那些标记为Dirty cards的对象就可以了，避免了全局扫描。

## PLAB

小师妹，F师兄，你讲的好像很有道理的样子，上次你讲到我们在Eden空间分配对象的，为了提升分配的效率，使用了TLAB的计算。那么在对象从Eden空间提升到Suvivor Space和old Space的时候有没有同样的技术呢？

当然有的，这个技术就叫做PLAB（ promotion local allocation buffer）。每一个线程在survival space和old space中都一个PLAB。在提升的时候，可以避免多线程的竞争，从而提升效率。

我们可以使用-XX:+AlwaysTenure 将对象直接从Eden space提升到old space。

我们可以使用-XX:+PrintOldPLAB来输出OldPLAB的信息。

## old space分配对象

小师妹：F师兄，刚刚你讲到新分配的对象可以直接在Old space，一般什么对象可以这样分配呢？

这个很好理解，如果你分配对象大小超过了Eden space的大小，是不是就只有old space可以分配对象了？

小师妹：对的，但是一般来说也不会使用这么大的对象吧。

对的，我们可以通过设置-XX:PretenureSizeThreshold=n 来指定对象的大小，如果对象大小大于n，那么就直接在old space分配。

> 注意，如果这个对象的大小比TLPB要小，那么会首先在TLPB中分配。所以使用的时候要注意限制TLPB的大小。

## 总结

GC的运行是一个比较复杂的过程，大家可以细细体会。本文如果有什么谬误之处，欢迎微信我指正。谢谢大家。

# 第五章 JVM中栈的frames详解

## 简介

我们知道JVM运行时数据区域专门有一个叫做Stack Area的区域，专门用来负责线程的执行调用。那么JVM中的栈到底是怎么工作的呢？快来一起看看吧。

## JVM中的栈

小师妹:F师兄，JVM为每个线程的运行都分配了一个栈，这个栈到底是怎么工作的呢？

小师妹，我们先看下JVM的整体运行架构图：

![](https://img-blog.csdnimg.cn/20200524221637660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们可以看到运行时数据区域分为5大部分。

堆区是存储共享对象的地方，而栈区是存储线程私有对象的地方。

因为是栈的结构，所以这个区域总是LIFO(Last in first out)。我们考虑一个方法的执行，当方法执行的时候，就会在Stack Area中创建一个block，这个block中持有对本地对象和其他对象的引用。一旦方法执行完毕，则这个block就会出栈，供其他方法访问。

## Frame

JVM中的stack area是由一个个的Frame组成的。

Frame主要用来存储数据和部分结果，以及执行动态链接，方法的返回值和调度异常。

每次调用方法时都会创建一个新Frame。当Frame的方法调用完成时，无论该方法是正常结束还是异常结束（它引发未捕获的异常），这个frame都会被销毁。

Frame是从JVM中的stack area中分配的。

每个frame都由三部分组成，分别是自己的local variables数组，自己的operand stack，以及对当前方法的run-time constant pool的引用。 

在线程的执行过程中，任何一个时刻都只有一个frame处于活动状态。这个frame被称为current frame，它的方法被称为current 方法，定义当前方法的类是当前类。

如果frame中的方法调用另一个方法或该frame的方法结束，那么这个frame将不再是current frame。

每次调用新的方法，都会创建一个新的frame，并将控制权转移到调用新的方法生成的框架。

在方法返回时，当前frame将其方法调用的结果（如果有的话）传回上一个frame，并结束当前frame。

> 请注意，由线程创建的frame只能有该线程访问，并且不能被任何其他线程引用。

![](https://img-blog.csdnimg.cn/20200613234100780.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## Local Variables本地变量

每个frame都包含一个称为其本地局部变量的变量数组。frame的局部变量数组的长度是在编译的时候确定的。

单个局部变量可以保存以下类型的值：boolean, byte, char, short, int, float, reference, 或者 returnAddress。

如果对于long或double类型的值需要使用一对局部变量来存储。

局部变量因为存储在数组中，所以直接通过数字的索引来定位和访问。

> 注意，这个数组的索引值是从0开始，到数组长度-1结束。

单个局部变量直接通过索引来访问就够了，那么对于占用两个连续局部变量的long或者double类型来说，怎么访问呢？

比如说一个long类型占用数组中的n和n+1两个变量，那么我们可以通过索引n值来访问这个long类型，而不是通过n+1来访问。

> 注意，在JVM中，并不一定要求这个n是偶数。

那么这些局部变量有什么用呢？

Java虚拟机使用局部变量在方法调用时传递参数。

我们知道在java中有两种方法，一种是类方法，一种是实例方法。

在类方法调用中，所有参数都从局部变量0开始在连续的局部变量中传递。

在实例方法调用中，局部变量0始终指向的是该实例对象，也就是this。也就是说真实的参数是从局部变量1开始存储的。

## Operand Stacks

在每个frame内部，又包含了一个LIFO的栈，这个栈叫做Operand Stack。 

刚开始创建的时候，这个Operand Stack是空的。然后JVM将local variables中的常量或者值加载到Operand Stack中去。

然后Java虚拟机指令从操作数堆栈中获取操作数，对其进行操作，然后将结果压回操作数堆栈。

比如说，现在的Operand Stack中已经有两个值，1和2。

这个时候JVM要执行一个iadd指令，将1和2相加。那么就会先将stack中的1和2两个数取出，相加后，将结果3再压入stack。

最终stack中保存的是iadd的结果3。

> 注意，在Local Variables本地变量中我们提到，如果是long或者double类型的话，需要两个本地变量来存储。而在Operand Stack中，一个值可以表示任何Java虚拟机类型的值。也就是说long和double在Operand Stack中，使用一个值就可以表示了。

Operand Stack中的任何操作都必须要确保其类型匹配。像之前提到的iadd指令是对两个int进行相加，如果这个时候你的Operand Stacks中存储的是long值，那么iadd指令是会失败的。

在任何时间点，操作数堆栈都具有关联的深度，其中long或double类型的值对该深度贡献两个单位，而任何其他类型的值则贡献一个单位深度。

## Dynamic Linking动态链接

什么是动态链接呢？

我们知道在class文件中除了包含类的版本、字段、方法、接口
等描述信息外，还有一项信息就是常量池(constant pool table)，用于存放编译器生成的各种字面量(Literal)和符号引用(Symbolic References)。

所谓字面量就是常说的常量，可以有三种方式，分别是：文本字符串，八种基本类型和final类型的常量。

而符号引用是指用符号来描述所引用的目标。

符号引用和直接引用有什么区别呢？ 我们举个例子。

比如我们定义了String name="jack", 其中jack是一个字面量，会在字符串常量池（String Pool）中保存一份。

如果我们存储的时候，存的是name，那么这个就是符号引用。

如果我们存储的是jack在字符串常量池中地址，那么这个就是直接引用。

从上面的介绍我们可以知道，为了实现最终的程序正常运行，所有的符号引用都需要转换成为直接引用才能正常执行。

而这个转换的过程，就叫做动态链接。

动态链接将这些符号方法引用转换为具体的方法引用，根据需要加载类以解析尚未定义的符号，并将变量访问转换为与这些变量的运行时位置关联的存储结构中的适当偏移量。

## 方法执行完毕

方法执行完毕有两种形式，一种是正常执行完毕，一种是执行过程中抛出了异常。

正常执行完毕的方法可以值返回给调用方。

这种情况下frame的作用就是恢复调用程序的状态，包括其局部变量和操作数堆栈，并适当增加调用程序的程序计数器以跳过方法调用指令。

如果方法中抛出了异常，那么该方法将不会有值返回给调用方。


# 第六章 如果你想写自己的Benchmark框架

## 简介

使用过JMH的同学一定会惊叹它的神奇。JMH作为一个优秀的Benchmark框架带给了我们无数的欢乐。作为一个有极客精神的程序员，那么有没有想过去自己实现一个Benchmark框架呢？

在实现Benchmark框架的时候有需要注意些什么问题呢？快来一起看看吧。

## 八条军规

这里叫军规实际上不合适，只是借用一下军规的来彰显一下气势！大家不要太介意。

### 第一条军规

工欲善其事，必先利其器。想写好一个JMH当然需要深入了解JVM的运行原理，包括JIT，C1，C2编译器和他们的分层编译原理，JIT运行时的编译优化，包括Loop unrolling, Inlining, Dead Code Elimination,
Escape analysis, Intrinsics, Branch prediction等等。

当然，最好是参考一下大牛们写过的JMH框架，找点灵感。

最后大家要了解，Benchmark框架不是万能的。它只是在特定的环境中JVM的表现。

因为在Benchmark中我们肯定是要做循环的，一般来说就是某某方法运行多少次，这种比较简单的循环。实际上，JVM运行的代码是非常复杂的。Benchmark远远不能代表JVM的全部。

但是，见微知著，使用Benchmark还是可以一窥JVM的秘密的。

### 第二条军规

在JMH中，我们一般需要设置warmup和measurement的次数：

~~~java
@Warmup(iterations = 10, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
~~~

这是为什么呢？我们知道JIT中的代码是动态编译成为机器码的，并且是需要一定的时间的。

只有JIT检测到你这是热点代码，才会对其进行优化。

我们检测代码的性能，一般是指代码在稳定运行的环境中的情形。而不是指第一次或者前几次运行的时候，因为这个时候，这些代码可能并没有被编译成机器码。这样的出来的结果往往是和实际不相符的。

### 第三条军规

在编写Benchmark的同时，一定要开启JVM的日志。例如： -XX:+PrintCompilation, -verbose:gc等。

为什么呢？

大家想想benchmark是做什么的呢？就是统计时间的。

我们希望在运行benchmark的时候，JVM不要做任何不属于运行代码的任何事情，否则就可能会影响到benchmark的准确性。

所以开启JVM的日志就是为了做校验。不要在做benchmark的时候有其他操作。

### 第四条军规

注意JIT的分层编译。

因为Client VM和Server VM的出现，所以在JIT中出现了两种不同的编译器，C1 for Client VM， C2 for Server VM。

因为javac的编译只能做少量的优化，其实大量的动态优化是在JIT中做的。C2相对于C1，其优化的程度更深，更加激进。

为了更好的提升编译效率，JVM在JDK7中引入了分层编译Tiered compilation的概念。

对于JIT本身来说，动态编译是需要占用用户内存空间的，有可能会造成较高的延迟。

对于Server服务器来说，因为代码要服务很多个client，所以磨刀不误砍柴工，短暂的延迟带来永久的收益，听起来是可以接受的。

Server端的JIT编译也不是立马进行的，它可能需要收集到足够多的信息之后，才进行编译。

而对于Client来说，延迟带来的性能影响就需要进行考虑了。和Server相比，它只进行了简单的机器码的编译。

为了满足不同层次的编译需求，于是引入了分层编译的概念。

大概来说分层编译可以分为三层：

1. 第一层就是禁用C1和C2编译器，这个时候没有JIT进行。
2. 第二层就是只开启C1编译器，因为C1编译器只会进行一些简单的JIT优化，所以这个可以应对常规情况。
3. 第三层就是同时开启C1和C2编译器。

在JDK7中，你可以使用下面的命令来开启分层编译：

~~~java
-XX:+TieredCompilation
~~~

而在JDK8之后，恭喜你，分层编译已经是默认的选项了，不用再手动开启。

Client编译和Server编译，甚至是OSR都是不同的。大家在写Benchmark的时候一定要注意。

### 第五条军规

注意初始化对性能的影响。

如果需要加载类，一定要在warmup的阶段进行加载，除非你是想去测试加载的时间。否则会对测试结果有影响。

同时也不要计算第一次print的时间，因为print也会加载和初始化一些类。

### 第六条军规

要注意反优化和重编译的影响。

JIT在下面的几个特殊的情况下，需要对代码进行返优化：

有些特殊的情况下面，确实是需要进行反优化的。

下面是比较常见的情况：

1. 需要调试的情况

如果代码正在进行单个步骤的调试，那么之前被编译成为机器码的代码需要反优化回来，从而能够调试。

2. 代码废弃的情况

当一个被编译过的方法，因为种种原因不可用了，这个时候就需要将其反优化。

3. 优化之前编译的代码

有可能出现之前优化过的代码可能不够完美，需要重新优化的情况，这种情况下同样也需要进行反优化。

重编译是指JIT可能会重新优化代码，导致重新编译。

所以这条规则要求我们warmup的时间要尽可能的长。以便让JIT充分优化。

### 第七条军规

在使用benchMark得出结论之前，一定要去认真的理解JVM的底层代码（Assembly code），找到其现象的本质。

千万不要冲动的下结论。最好是使用可视化的工具来分析。比如说jitwatch。

### 最后一条军规

在测试的时候一定要避免其他程序的影响 。

比如说两次测试，第一次测试是单机运行，第二次测试是在有其他服务正在运行的情况下进行的。

很显然这两次的结果是不能做比较的。我们需要多运行，剔除噪音结果。

## 总结

掌握上面几条规则，相信大家也能够写出属于自己的Benchmarks。

# 第七章 java class文件的密码本

## 简介

一切的一切都是从javac开始的。从那一刻开始，java文件就从我们肉眼可分辨的文本文件，变成了冷冰冰的二进制文件。

变成了二进制文件是不是意味着我们无法再深入的去了解java class文件了呢？答案是否定的。

机器可以读，人为什么不能读？只要我们掌握java class文件的密码表，我们可以把二进制转成十六进制，将十六进制和我们的密码表进行对比，就可以轻松的解密了。

下面，让我们开始这个激动人心的过程吧。

## 一个简单的class

为了深入理解java class的含义，我们首先需要定义一个class类：

~~~java
public class JavaClassUsage {

    private int age=18;

    public void inc(int number){
        this.age=this.age+ number;
    }
}
~~~

很简单的类，我想不会有比它更简单的类了。

在上面的类中，我们定义了一个age字段和一个inc的方法。

接下来我们使用javac来进行编译。

IDEA有没有？直接打开编译后的class文件，你会看到什么？

没错，是反编译过来的java代码。但是这次我们需要深入了解的是class文件，于是我们可以选择 view->Show Bytecode：

![](https://img-blog.csdnimg.cn/20200615232536371.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

当然，还是少不了最质朴的javap命令：

~~~java
 javap -verbose JavaClassUsage
~~~

对比会发现，其实javap展示的更清晰一些，我们暂时选用javap的结果。

编译的class文件有点长，我一度有点不想都列出来，但是又一想只有对才能讲述得更清楚，还是贴在下面：

~~~java
public class com.flydean.JavaClassUsage
  minor version: 0
  major version: 58
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #2.#3          // java/lang/Object."<init>":()V
   #2 = Class              #4             // java/lang/Object
   #3 = NameAndType        #5:#6          // "<init>":()V
   #4 = Utf8               java/lang/Object
   #5 = Utf8               <init>
   #6 = Utf8               ()V
   #7 = Fieldref           #8.#9          // com/flydean/JavaClassUsage.age:I
   #8 = Class              #10            // com/flydean/JavaClassUsage
   #9 = NameAndType        #11:#12        // age:I
  #10 = Utf8               com/flydean/JavaClassUsage
  #11 = Utf8               age
  #12 = Utf8               I
  #13 = Utf8               Code
  #14 = Utf8               LineNumberTable
  #15 = Utf8               LocalVariableTable
  #16 = Utf8               this
  #17 = Utf8               Lcom/flydean/JavaClassUsage;
  #18 = Utf8               inc
  #19 = Utf8               (I)V
  #20 = Utf8               number
  #21 = Utf8               SourceFile
  #22 = Utf8               JavaClassUsage.java
{
  public com.flydean.JavaClassUsage();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=2, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: aload_0
         5: bipush        18
         7: putfield      #7                  // Field age:I
        10: return
      LineNumberTable:
        line 7: 0
        line 9: 4
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      11     0  this   Lcom/flydean/JavaClassUsage;

  public void inc(int);
    descriptor: (I)V
    flags: ACC_PUBLIC
    Code:
      stack=3, locals=2, args_size=2
         0: aload_0
         1: aload_0
         2: getfield      #7                  // Field age:I
         5: iload_1
         6: iadd
         7: putfield      #7                  // Field age:I
        10: return
      LineNumberTable:
        line 12: 0
        line 13: 10
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      11     0  this   Lcom/flydean/JavaClassUsage;
            0      11     1 number   I
}
SourceFile: "JavaClassUsage.java"
~~~

## ClassFile的二进制文件

慢着，上面javap的结果好像并不是二进制文件！

对的，javap是对二进制文件进行了解析，方便程序员阅读。如果你真的想直面最最底层的机器代码，就直接用支持16进制的文本编译器把编译好的class文件打开吧。

你准备好了吗？

来吧，展示吧！

![](https://img-blog.csdnimg.cn/2020061608593763.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图左边是16进制的class文件代码，右边是对16进制文件的适当解析。大家可以隐约的看到一点点熟悉的内容。

是的，没错，你会读机器语言了！

## class文件的密码本

如果你要了解class文件的结构，你需要这个密码本。

如果你想解析class文件，你需要这个密码本。

学好这个密码本，走遍天下都......没啥用！

下面就是密码本，也就是classFile的结构。

~~~java
ClassFile {
    u4             magic;
    u2             minor_version;
    u2             major_version;
    u2             constant_pool_count;
    cp_info        constant_pool[constant_pool_count-1];
    u2             access_flags;
    u2             this_class;
    u2             super_class;
    u2             interfaces_count;
    u2             interfaces[interfaces_count];
    u2             fields_count;
    field_info     fields[fields_count];
    u2             methods_count;
    method_info    methods[methods_count];
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
~~~

其中u2，u4表示的是无符号的两个字节，无符号的4个字节。

java class文件就是按照上面的格式排列下来的，按照这个格式，我们可以自己实现一个反编译器（大家有兴趣的话，可以自行研究）。

我们对比着上面的二进制文件一个一个的来理解。

### magic

首先，class文件的前4个字节叫做magic word。

看一下十六进制的第一行的前4个字节：

~~~java
CA FE BA BE 00 00 00 3A 00 17 0A 00 02 00 03 07 
~~~

0xCAFEBABE就是magic word。所有的java class文件都是以这4个字节开头的。

来一杯咖啡吧，baby！

多么有诗意的画面。

### version

这两个version要连着讲，一个是主版本号，一个是次版本号。

~~~java
00 00 00 3A
~~~

![](https://img-blog.csdnimg.cn/20200615235345167.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

对比一下上面的表格，我们的主版本号是3A=58，也就是我们使用的是JDK14版本。

### 常量池 

接下来是常量池。

首先是两个字节的constant_pool_count。对比一下，constant_pool_count的值是：

~~~java
00 17
~~~

换算成十进制就是23。也就是说常量池的大小是23-1=22。

> 这里有两点要注意，第一点，常量池数组的index是从1开始到constant_pool_count-1结束。
> 
> 第二点，常量池数组的第0位是作为一个保留位，表示“不引用任何常量池项目”，为某些特殊的情况下使用。

接下来是不定长度的cp_info：constant_pool[constant_pool_count-1]常量池数组。

常量池数组中存了些什么东西呢？

字符串常量，类和接口名字，字段名，和其他一些在class中引用的常量。

具体的constant_pool中存储的常量类型有下面几种：

![](https://img-blog.csdnimg.cn/20200616085115439.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

每个常量都是以一个tag开头的。用来告诉JVM，这个到底是一个什么常量。

好了，我们对比着来看一下。在constant_pool_count之后，我们再取一部分16进制数据：

![](https://img-blog.csdnimg.cn/20200616090131493.png)

上面我们讲到了17是常量池的个数，接下来就是常量数组。

~~~java
0A 00 02 00 03
~~~

首先第一个字节是常量的tag， 0A=10，对比一下上面的表格，10表示的是CONSTANT_Methodref方法引用。

CONSTANT_Methodref又是一个结构体，我们再看一下方法引用的定义：

~~~java
CONSTANT_Methodref_info {
    u1 tag;
    u2 class_index;
    u2 name_and_type_index;
}
~~~

从上面的定义我们可以看出，CONSTANT_Methodref是由三部分组成的，第一部分是一个字节的tag，也就是上面的0A。

第二部分是2个字节的class_index，表示的是类在常量池中的index。

第三部分是2个字节的name_and_type_index，表示的是方法的名字和类型在常量池中的index。

先看class_index，0002=2。

常量池的第一个元素我们已经找到了就是CONSTANT_Methodref，第二个元素就是跟在CONSTANT_Methodref后面的部分，我们看下是什么：

~~~java
07 00 04
~~~

一样的解析步骤，07=7，查表，表示的是CONSTANT_Class。

我们再看下CONSTANT_Class的定义：

~~~java
CONSTANT_Class_info {
    u1 tag;
    u2 name_index;
}
~~~

可以看到CONSTANT_Class占用3个字节，第一个字节是tag，后面两个字节是name在常量池中的索引。

00 04 = 4， 表示name在常量池中的索引是4。

然后我们就这样一路找下去，就得到了所有常量池中常量的信息。

这样找起来，眼睛都花了，有没有什么简单的办法呢？

当然有，就是上面的javap -version， 我们再回顾一下输出结果中的常量池部分：

~~~java
Constant pool:
   #1 = Methodref          #2.#3          // java/lang/Object."<init>":()V
   #2 = Class              #4             // java/lang/Object
   #3 = NameAndType        #5:#6          // "<init>":()V
   #4 = Utf8               java/lang/Object
   #5 = Utf8               <init>
   #6 = Utf8               ()V
   #7 = Fieldref           #8.#9          // com/flydean/JavaClassUsage.age:I
   #8 = Class              #10            // com/flydean/JavaClassUsage
   #9 = NameAndType        #11:#12        // age:I
  #10 = Utf8               com/flydean/JavaClassUsage
  #11 = Utf8               age
  #12 = Utf8               I
  #13 = Utf8               Code
  #14 = Utf8               LineNumberTable
  #15 = Utf8               LocalVariableTable
  #16 = Utf8               this
  #17 = Utf8               Lcom/flydean/JavaClassUsage;
  #18 = Utf8               inc
  #19 = Utf8               (I)V
  #20 = Utf8               number
  #21 = Utf8               SourceFile
  #22 = Utf8               JavaClassUsage.java
~~~

以第一行为例，直接告诉你常量池中第一个index的类型是Methodref，它的classref是index=2，它的NameAndType是index=3。

并且直接在后面展示出了具体的值。

### 描述符

且慢，在常量池中我好像看到了一些不一样的东西，这些I，L是什么东西？

这些叫做字段描述符：

![](https://img-blog.csdnimg.cn/20200616092347300.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图是他们的各项含义。除了8大基础类型，还有2个引用类型，分别是对象的实例，和数组。

### access_flags

常量池后面就是access_flags：访问描述符，表示的是这个class或者接口的访问权限。

先上密码表：

![](https://img-blog.csdnimg.cn/20200616092924600.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

再找一下我们16进制的access_flag:

![](https://img-blog.csdnimg.cn/2020061609304082.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

没错，就是00 21。 参照上面的表格，好像没有21，但是别怕：

21是ACC_PUBLIC和ACC_SUPER的并集。表示它有两个access权限。

### this_class和super_class

接下来是this class和super class的名字，他们都是对常量池的引用。

~~~java
00 08 00 02
~~~

this class的常量池index=8， super class的常量池index=2。

看一下2和8都代表什么：

~~~java
   #2 = Class              #4             // java/lang/Object
   #8 = Class              #10            // com/flydean/JavaClassUsage
~~~

没错，JavaClassUsage的父类是Object。

> 大家知道为什么java只能单继承了吗？因为class文件里面只有一个u2的位置，放不下了！

### interfaces_count和interfaces[]

接下来就是接口的数目和接口的具体信息数组了。

~~~java
00 00
~~~

我们没有实现任何接口，所以interfaces_count=0，这时候也就没有interfaces[]了。

### fields_count和fields[]

然后是字段数目和字段具体的数组信息。

这里的字段包括类变量和实例变量。

每个字段信息也是一个结构体：

~~~java
field_info {
    u2             access_flags;
    u2             name_index;
    u2             descriptor_index;
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
~~~

字段的access_flag跟class的有点不一样：

![](https://img-blog.csdnimg.cn/20200616121749390.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里我们就不具体对比解释了，感兴趣的小伙伴可以自行体验。

## methods_count和methods[]

接下来是方法信息。

method结构体：

~~~java
method_info {
    u2             access_flags;
    u2             name_index;
    u2             descriptor_index;
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
~~~

method访问权限标记：

![](https://img-blog.csdnimg.cn/20200616122004356.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## attributes_count和attributes[]

attributes被用在ClassFile, field_info, method_info和Code_attribute这些结构体中。

先看下attributes结构体的定义：

~~~java
attribute_info {
    u2 attribute_name_index;
    u4 attribute_length;
    u1 info[attribute_length];
}
~~~

都有哪些attributes, 这些attributes都用在什么地方呢？

![](https://img-blog.csdnimg.cn/20200616123053552.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

其中有六个属性对于Java虚拟机正确解释类文件至关重要，他们是：
ConstantValue，Code，StackMapTable，BootstrapMethods，NestHost和NestMembers。

九个属性对于Java虚拟机正确解释类文件不是至关重要的，但是对于通过Java SE Platform的类库正确解释类文件是至关重要的，他们是：

Exceptions，InnerClasses，EnclosingMethod，Synthetic，Signature，SourceFile，LineNumberTable，LocalVariableTable，LocalVariableTypeTable。

其他13个属性，不是那么重要，但是包含有关类文件的元数据。



## 总结

最后留给大家一个问题，java class中常量池的大小constant_pool_count是2个字节，两个字节可以表示2的16次方个常量。很明显已经够大了。

但是，万一我们写了超过2个字节大小的常量怎么办？欢迎大家留言给我讨论。

# 第八章 String,数组和集合类的内存占用大小

## 简介

之前的文章中，我们使用JOL工具简单的分析过String,数组和集合类的内存占用情况，这里再做一次更详细的分析和介绍，希望大家后面再遇到OOM问题的时候不再抱头痛哭，而是可以有章可循，开始吧。

## 数组

先看下JOL的代码和输出：

~~~java
//byte array
log.info("{}",ClassLayout.parseInstance("www.flydean.com".getBytes()).toPrintable());
~~~

输出结果：

~~~java
INFO com.flydean.CollectionSize - [B object internals:
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

> 注意，本文的结论都在64位的JVM中运行得出了，并且开启了COOPs压缩对象指针技术。

可以看到数组对象的对象头大小是16字节，再加上数组里面的内容长度是15字节，再加上1位补全。最后得到的大小是32字节。

同样的，我们计算存有100个对象的数组，可以得到下面的结论：

![](https://img-blog.csdnimg.cn/20200618160037868.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

> 注意最后面的Object数组，如果数组中存储的不是基础类型，那么实际上存储的是执行该对象的指针，该指针大小是4个字节。

## String

String是一个非常特殊的对象，它的底层是以byte数组存储的。

> 注意，在JDK9之前，String的底层存储结构是char[],一个char需要占用两个字节的存储单位。
> 
> 因为大部分的String都是以Latin-1字符编码来表示的，只需要一个字节存储就够了，两个字节完全是浪费。
> 
> 于是在JDK9之后，字符串的底层存储变成了byte[]。

同样的我们还是用JOL来分析：

~~~java
//String
log.info("{}",ClassLayout.parseInstance("www.flydean.com").toPrintable());
~~~

输出结果：

~~~java
INFO com.flydean.CollectionSize - java.lang.String object internals:
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

可以看到String中的对象头是12字节，然后加上4字节的指针指向一个byte数组。再加上hash，coder，和hasIsZero属性，最后的大小是24字节。

我这里使用的是JDK14的String版本，不同的版本可能有所不同。

当然这只是这个String对象的大小，不包含底层数组的大小。

![](https://img-blog.csdnimg.cn/20200618161614743.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们来计算一下String对象的真实大小：

String对象的大小+byte数组的大小=24+32=56字节。

## ArrayList

我们构建一个非常简单的ArrayList：

~~~java
//Array List
log.info("{}",ClassLayout.parseInstance(new ArrayList()).toPrintable());
~~~

输出结果：

~~~java
INFO com.flydean.CollectionSize - java.util.ArrayList object internals:
 OFFSET  SIZE                 TYPE DESCRIPTION                               VALUE
      0     4                      (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4                      (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4                      (object header)                           87 81 05 00 (10000111 10000001 00000101 00000000) (360839)
     12     4                  int AbstractList.modCount                     0
     16     4                  int ArrayList.size                            0
     20     4   java.lang.Object[] ArrayList.elementData                     []
Instance size: 24 bytes
Space losses: 0 bytes internal + 0 bytes external = 0 bytes total
~~~

画个图来直观的表示：

![](https://img-blog.csdnimg.cn/20200618164434365.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里modCount和size的初始值都是0。

## HashMap

因为文章篇幅的限制，这里就不把代码列出来了，我只贴个图上来：

![](https://img-blog.csdnimg.cn/20200618164939825.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## HashSet

![](https://img-blog.csdnimg.cn/20200618165613655.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## LinkedList

![](https://img-blog.csdnimg.cn/20200618165903442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## treeMap

来个比较复杂的TreeMap：

![](https://img-blog.csdnimg.cn/20200618170359983.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## 总结

本文用图形的形式形象的展示了集合对象，数组和String在内存中的使用情况。

后面的几个集合我就没有一一计算，有兴趣的朋友可以在下方回复你计算的结果哟。

# 第九章 Contend注解和false-sharing

## 简介

现代CPU为了提升性能都会有自己的缓存结构，而多核CPU为了同时正常工作，引入了MESI，作为CPU缓存之间同步的协议。MESI虽然很好，但是不当的时候用也可能导致性能的退化。

到底怎么回事呢？一起来看看吧。

## false-sharing的由来

为了提升处理速度，CPU引入了缓存的概念，我们先看一张CPU缓存的示意图：

![](https://img-blog.csdnimg.cn/20200619150442477.png)

CPU缓存是位于CPU与内存之间的临时数据交换器，它的容量比内存小的多但是交换速度却比内存要快得多。

CPU的读实际上就是层层缓存的查找过程，如果所有的缓存都没有找到的情况下，就是主内存中读取。

为了简化和提升缓存和内存的处理效率，缓存的处理是以Cache Line（缓存行）为单位的。

一次读取一个Cache Line的大小到缓存。

> 在mac系统中，你可以使用sysctl machdep.cpu.cache.linesize来查看cache line的大小。
> 在linux系统中，使用getconf LEVEL1_DCACHE_LINESIZE来获取cache line的大小。

本机中cache line的大小是64字节。

考虑下面一个对象：

~~~java
public class CacheLine {
    public  long a;
    public  long b;
}
~~~

很简单的对象，通过之前的文章我们可以指定，这个CacheLine对象的大小应该是12字节的对象头+8字节的long+8字节的long+4字节的补全，总共应该是32字节。

因为32字节< 64字节，所以一个cache line就可以将其包括。

现在问题来了，如果是在多线程的环境中，thread1对a进行累加，而thread2对b进行累加。会发生什么情况呢？

1. 第一步，新创建出来的对象被存储到CPU1和CPU2的缓存cache line中。
2. thread1使用CPU1对对象中的a进行累计。
3. 根据CPU缓存之间的同步协议MESI（这个协议比较复杂，这里就先不展开讲解），因为CPU1对缓存中的cache line进行了修改，所以CPU2中的这个cache line的副本对象将会被标记为I（Invalid）无效状态。
4. thread2使用CPU2对对象中的b进行累加，这个时候因为CPU2中的cache line已经被标记为无效了，所以必须重新从主内存中同步数据。

大家注意，耗时点就在第4步。 虽然a和b是两个不同的long，但是因为他们被包含在同一个cache line中，最终导致了虽然两个线程没有共享同一个数值对象，但是还是发送了锁的关联情况。

### 怎么解决？

那怎么解决这个问题呢？

在JDK7之前，我们需要使用一些空的字段来手动补全。

~~~java
public class CacheLine { 
     public  long actualValue; 
     public  long p0, p1, p2, p3, p4, p5, p6, p7; 
     }
~~~

像上面那样，我们手动填充一些空白的long字段，从而让真正的actualValue可以独占一个cache line，就没有这些问题了。

但是在JDK8之后，java文件的编译期会将无用的变量自动忽略掉，那么上面的方法就无效了。

还好，JDK8中引入了sun.misc.Contended注解，使用这个注解会自动帮我们补全字段。

## 使用JOL分析

接下来，我们使用JOL工具来分析一下Contended注解的对象和不带Contended注解的对象有什么区别。

~~~java
@Test
public void useJol() {
        log.info("{}", ClassLayout.parseClass(CacheLine.class).toPrintable());
        log.info("{}", ClassLayout.parseInstance(new CacheLine()).toPrintable());
        log.info("{}", ClassLayout.parseClass(CacheLinePadded.class).toPrintable());
        log.info("{}", ClassLayout.parseInstance(new CacheLinePadded()).toPrintable());
    }
~~~


> 注意，在使用JOL分析Contended注解的对象时候，需要加上 -XX:-RestrictContended参数。
> 
> 同时可以设置-XX:ContendedPaddingWidth 来控制padding的大小。

~~~java
INFO com.flydean.CacheLineJOL - com.flydean.CacheLine object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           d0 29 17 00 (11010000 00101001 00010111 00000000) (1518032)
     12     4        (alignment/padding gap)                  
     16     8   long CacheLine.valueA                          0
     24     8   long CacheLine.valueB                          0
Instance size: 32 bytes
Space losses: 4 bytes internal + 0 bytes external = 4 bytes total
~~~

~~~java
INFO com.flydean.CacheLineJOL - com.flydean.CacheLinePadded object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           d2 5d 17 00 (11010010 01011101 00010111 00000000) (1531346)
     12     4        (alignment/padding gap)                  
     16     8   long CacheLinePadded.b                         0
     24   128        (alignment/padding gap)                  
    152     8   long CacheLinePadded.a                         0
Instance size: 160 bytes
Space losses: 132 bytes internal + 0 bytes external = 132 bytes total
~~~

我们看到使用了Contended的对象大小是160字节。直接填充了128字节。

## Contended在JDK9中的问题

sun.misc.Contended是在JDK8中引入的，为了解决填充问题。

但是大家注意，Contended注解是在包sun.misc，这意味着一般来说是不建议我们直接使用的。

虽然不建议大家使用，但是还是可以用的。

但如果你使用的是JDK9-JDK14,你会发现sun.misc.Contended没有了！

因为JDK9引入了JPMS（Java Platform Module System），它的结构跟JDK8已经完全不一样了。

经过我的研究发现，sun.misc.Contended, sun.misc.Unsafe，sun.misc.Cleaner这样的类都被移到了jdk.internal.**中，并且是默认不对外使用的。

那么有人要问了，我们换个引用的包名是不是就行了？

~~~java
import jdk.internal.vm.annotation.Contended；
~~~

抱歉还是不行。

~~~java
error: package jdk.internal.vm.annotation is not visible
  @jdk.internal.vm.annotation.Contended
                  ^
  (package jdk.internal.vm.annotation is declared in module
    java.base, which does not export it to the unnamed module)
~~~

好，我们找到问题所在了，因为我们的代码并没有定义module，所以是一个默认的“unnamed” module,我们需要把java.base中的jdk.internal.vm.annotation使unnamed module可见。

要实现这个目标，我们可以在javac中添加下面的flag：

~~~java
--add-exports java.base/jdk.internal.vm.annotation=ALL-UNNAMED
~~~

好了，现在我们可以正常通过编译了。

## padded和unpadded性能对比

上面我们看到padded对象大小是160字节，而unpadded对象的大小是32字节。

对象大了，运行的速度会不慢呢？ 

实践出真知，我们使用JMH工具在多线程环境中来对其进行测试：

~~~java
@State(Scope.Benchmark)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Fork(value = 1, jvmArgsPrepend = "-XX:-RestrictContended")
@Warmup(iterations = 10)
@Measurement(iterations = 25)
@Threads(2)
public class CacheLineBenchMark {

    private CacheLine cacheLine= new CacheLine();
    private CacheLinePadded cacheLinePadded = new CacheLinePadded();

    @Group("unpadded")
    @GroupThreads(1)
    @Benchmark
    public long updateUnpaddedA() {
        return cacheLine.a++;
    }

    @Group("unpadded")
    @GroupThreads(1)
    @Benchmark
    public long updateUnpaddedB() {
        return cacheLine.b++;
    }

    @Group("padded")
    @GroupThreads(1)
    @Benchmark
    public long updatePaddedA() {
        return cacheLinePadded.a++;
    }

    @Group("padded")
    @GroupThreads(1)
    @Benchmark
    public long updatePaddedB() {
        return cacheLinePadded.b++;
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(CacheLineBenchMark.class.getSimpleName())
                .build();
        new Runner(opt).run();
    }
}
~~~

上面的JMH代码中，我们使用两个线程分别对A和B进行累计操作，看下最后的运行结果：

![](https://img-blog.csdnimg.cn/20200619143042756.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从结果看来虽然padded生成的对象比较大，但是因为A和B在不同的cache line中，所以不会出现不同的线程去主内存取数据的情况，因此要执行的比较快。

## Contended在JDK中的使用

其实Contended注解在JDK源码中也有使用，不算广泛，但是都很重要。

比如在Thread中的使用：

![](https://img-blog.csdnimg.cn/20200619105903165.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

比如在ConcurrentHashMap中的使用：

![](https://img-blog.csdnimg.cn/20200619105915447.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

其他使用的地方：Exchanger,ForkJoinPool,Striped64。

感兴趣的朋友可以仔细研究一下。

## 总结

Contented从最开始的sun.misc到现在的jdk.internal.vm.annotation，都是JDK内部使用的class，不建议大家在应用程序中使用。

这就意味着我们之前使用的方式是不正规的，虽然能够达到效果，但是不是官方推荐的。那么我们还有没有什么正规的办法来解决false-sharing的问题呢？

有知道的小伙伴欢迎留言给我讨论！

# 第十章 对象的锁状态和同步

## 简介

锁和同步是java多线程编程中非常常见的使用场景。为了锁定多线程共享的对象，Java需要提供一定的机制来实现共享对象的锁定，从而保证一次只有一个线程能够作用于共享对象。当第二个线程进入同一个区域的时候，必须等待第一个线程解锁该对象。

JVM是怎么做到的呢？为了实现这个功能，java对象又需要具备什么样的结构呢？快来一起看看吧。

## java对象头

Java的锁状态其实可以分为三种，分别是偏向锁，轻量级锁和重量级锁。

在Java HotSpot VM中，每个对象前面都有一个class指针和一个Mark Word。 Mark Word存储了哈希值以及分代年龄和标记位等，通过这些值的变化，JVM可以实现对java对象的不同程度的锁定。

还记得我们之前分享java对象的那张图吗？

![](https://img-blog.csdnimg.cn/20200618121615778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

javaObject对象的对象头大小根据你使用的是32位还是64位的虚拟机的不同，稍有变化。这里我们使用的是64位的虚拟机为例。

Object的对象头，分为两部分，第一部分是Mark Word，用来存储对象的运行时数据比如：hashcode，GC分代年龄，锁状态，持有锁信息，偏向锁的thread ID等等。

在64位的虚拟机中，Mark Word是64bits，如果是在32位的虚拟机中Mark Word是32bits。

第二部分就是Klass Word，Klass Word是一个类型指针，指向class的元数据，JVM通过Klass Word来判断该对象是哪个class的实例。

我们可以看到对象头中的Mark Word根据状态的不同，存储的是不同的内容。

其中锁标记的值分别是：无锁=001，偏向锁=101，轻量级锁=000，重量级锁=010。

## java中锁状态的变化

为什么java中的锁有三种状态呢？其本质原因是为了提升锁的效率，因为不同情况下，锁的力度是不一样的。

通过设置不同的锁的状态，从而可以不同的情况用不同的处理方式。

下图是java中的锁状态的变化图：

![](https://img-blog.csdnimg.cn/20200619212424286.png)

上面的图基本上列出了java中锁状态的整个生命周期。接下来我们一个一个的讲解。

## 偏向锁biased locking

一般来说，一个对象被一个线程获得锁之后，很少发生线程切换的情况。也就是说大部分情况下，一个对象只是被一个对象锁定的。

那么这个时候我们可以通过设置Mark word的一定结构，减少使用CAS来更新对象头的频率。

为了实现这样的目标，我们看下偏向锁的Mark word的结构：

![](https://img-blog.csdnimg.cn/20200619215207151.png)

当偏向线程第一次进入同步块的时候，会去判断偏向锁的状态和thread ID，如果偏向锁状态是1，并且thread ID是空的话，将会使用CAS命令来更新对象的Mark word。

设置是否偏向锁=1，锁标记=01,线程ID设置为当前锁定该对象的线程。

下一次该对象进入同步块的时候，会先去判断锁定的线程ID和当前线程ID是否相等，如果相等的话则不需要执行CAS命令，直接进入同步块。

如果这个时候有第二个线程想访问该对象的同步块，因为当前对象头的thread ID是第一个线程的ID，跟第二个线程的ID不同。

如果这个时候线程1的同步块已经执行完毕，那么需要解除偏向锁的锁定。

解除锁定很简单，就是将线程ID设置为空，并且将偏向锁的标志位设为0，

如果这个时候线程1的同步块还在执行，那么需要将偏向锁升级为轻量级锁。

## 轻量级锁thin lock

先看下轻量级锁的结构：

![](https://img-blog.csdnimg.cn/20200619221814770.png)

可以看到Mark word中存放的是栈中锁记录的指针和锁的标记=00。

如果对象现在处于未加锁状态，当一个线程尝试进入同步块的时候，会将把对象头和当前对象的指针拷贝一份，放在线程的栈中一个叫做lock record的地方。

然后JVM通过CAS操作，将对象头中的指针指向刚刚拷贝的lock record。如果成功，则该线程拥有该对象的锁。

实际上Lock Record和Mark word形成了一个互相指向对方的情况。

下次这个线程再次进入同步块的时候，同样执行CAS，比较Mark word中的指针是否和当前thread的lock record地址一致，如果一致表明是同一个线程，可以继续持有该锁。

如果这个时候有第二个线程，也想进入该对象的同步块，也会执行CAS操作，很明显会失败，因为对象头中的指针和lock record的地址不一样。

这个时候第二个线程就会自旋等待。

那么第一个线程什么时候会释放锁呢？

轻量级锁在线程退出同步块的时候，同样需要执行CAS命令，将锁标记从00替换成01，也就是无锁状态。


## 重量级锁

如果第二个线程自旋时间太久，就会将锁标记替换成10（重量级锁），并且设置重量级锁的指针，指向第二个线程，然后进入阻塞状态。

当第一个线程退出同步块的时候，执行CAS命令就会出错，这时候第一个线程就知道锁已经膨胀成为重量级锁了。

第一个线程就会释放锁，并且唤醒等待的第二个线程。

第二个线程被唤醒之后，重新争夺锁。

我们看下重量级锁的结构：

![](https://img-blog.csdnimg.cn/20200619224613221.png)

## 三种锁状态的不同

偏向锁，轻量级锁和重量级锁到底有什么不同了？

这里总结一下，偏向锁下次进入的时候不需要执行CAS命令，只做线程ID的比较即可。

轻量级锁进入和退出同步块都需要执行CAS命令，但是轻量级锁不会阻塞，它使用的是自旋命令来获取锁。

重量级锁不使用自旋，但是会阻塞线程。

好了，小伙伴们对于锁的状态变化有什么疑问吗？欢迎留言。

# 第十一章 String.intern和stringTable

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

# 第十二章 String.intern的性能

## 简介

String对象有个特殊的StringTable字符串常量池，为了减少Heap中生成的字符串的数量，推荐尽量直接使用String Table中的字符串常量池中的元素。

那么String.intern的性能怎么样呢？我们一起来看一下。

## String.intern和G1字符串去重的区别

之前我们提到了，String.intern方法会返回字符串常量池中的字符串对象的引用。

而G1垃圾回收器的字符串去重的功能其实和String.intern有点不一样，G1是让两个字符串的底层指向同一个byte[]数组。

有图为证：

![](https://img-blog.csdnimg.cn/20200621153827463.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图中的String1和String2指向的是同一个byte[]数组。

## String.intern的性能

我们看下intern方法的定义：

~~~java
public native String intern();
~~~

大家可以看到这是一个native的方法。native底层肯定是C++实现的。

那么是不是native方法一定会比java方法快呢？

其实native方法有这样几个耗时点：

1. native方法需要调用JDK-JVM接口，实际上是会浪费时间的。
2. 性能会受到native方法中HashTable实现方法的制约，如果在高并发的情况下，native的HashTable的实现可能成为性能的制约因素。

## 举个例子

还是用JMH工具来进行性能分析，我们使用String.intern，HashMap，和ConcurrentHashMap来对比分析，分别调用1次，100次，10000次和1000000。

代码如下：

~~~java
@State(Scope.Benchmark)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Fork(value = 1, jvmArgsPrepend = "-XX:+PrintStringTableStatistics")
@Warmup(iterations = 5)
@Measurement(iterations = 5)
public class StringInternBenchMark {

    @Param({"1", "100", "10000", "1000000"})
    private int size;

    private StringInterner str;
    private ConcurrentHashMapInterner chm;
    private HashMapInterner hm;

    @Setup
    public void setup() {
        str = new StringInterner();
        chm = new ConcurrentHashMapInterner();
        hm = new HashMapInterner();
    }

    public static class StringInterner {
        public String intern(String s) {
            return s.intern();
        }
    }

    @Benchmark
    public void useIntern(Blackhole bh) {
        for (int c = 0; c < size; c++) {
            bh.consume(str.intern("doit" + c));
        }
    }

    public static class ConcurrentHashMapInterner {
        private final Map<String, String> map;

        public ConcurrentHashMapInterner() {
            map = new ConcurrentHashMap<>();
        }

        public String intern(String s) {
            String exist = map.putIfAbsent(s, s);
            return (exist == null) ? s : exist;
        }
    }

    @Benchmark
    public void useCurrentHashMap(Blackhole bh) {
        for (int c = 0; c < size; c++) {
            bh.consume(chm.intern("doit" + c));
        }
    }

    public static class HashMapInterner {
        private final Map<String, String> map;

        public HashMapInterner() {
            map = new HashMap<>();
        }

        public String intern(String s) {
            String exist = map.putIfAbsent(s, s);
            return (exist == null) ? s : exist;
        }
    }

    @Benchmark
    public void useHashMap(Blackhole bh) {
        for (int c = 0; c < size; c++) {
            bh.consume(hm.intern("doit" + c));
        }
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(StringInternBenchMark.class.getSimpleName())
                .build();
        new Runner(opt).run();
    }
}
~~~

输出结果：

~~~java
Benchmark                                 (size)  Mode  Cnt          Score          Error  Units
StringInternBenchMark.useCurrentHashMap        1  avgt    5         34.259 ±        7.191  ns/op
StringInternBenchMark.useCurrentHashMap      100  avgt    5       3623.834 ±      499.806  ns/op
StringInternBenchMark.useCurrentHashMap    10000  avgt    5     421010.654 ±    53760.218  ns/op
StringInternBenchMark.useCurrentHashMap  1000000  avgt    5   88403817.753 ± 12719402.380  ns/op
StringInternBenchMark.useHashMap               1  avgt    5         36.927 ±        6.751  ns/op
StringInternBenchMark.useHashMap             100  avgt    5       3329.498 ±      595.923  ns/op
StringInternBenchMark.useHashMap           10000  avgt    5     417959.200 ±    62853.828  ns/op
StringInternBenchMark.useHashMap         1000000  avgt    5   79347127.709 ±  9378196.176  ns/op
StringInternBenchMark.useIntern                1  avgt    5        161.598 ±        9.128  ns/op
StringInternBenchMark.useIntern              100  avgt    5      17211.037 ±      188.929  ns/op
StringInternBenchMark.useIntern            10000  avgt    5    1934203.794 ±   272954.183  ns/op
StringInternBenchMark.useIntern          1000000  avgt    5  418729928.200 ± 86876278.365  ns/op
~~~

从结果我们可以看到，intern要比其他的两个要慢。

所以native方法不一定快。intern的用处不是在于速度，而是在于节约Heap中的内存使用。

# 第十三章 本地变量的生命周期

## 简介

java方法中定义的变量，它的生命周期是什么样的呢？是不是一定要等到方法结束，这个创建的对象才会被回收呢？

带着这个问题我们来看一下今天的这篇文章。

## 本地变量的生命周期

在类中，变量类型有类变量，成员变量和本地变量。

本地变量指的是定义在方法中的变量，如果我们在方法中定义了一个变量，那么这个变量的生命周期是怎么样的呢？

举个例子：

~~~java
public void test(){
    Object object = new Object();
    doSomeThingElse(){
        ...
    }
}
~~~

在上面的test方法中，定义了一个object本地变量，然后又执行了一个方法。

因为在java中，我们无法直接控制对象的生命周期，对象的回收是由垃圾回收器自动进行的。

通常来说这个object对象会维持到整个test执行结束才会被回收。

现在我们考虑一个特殊的情况，如果doSomeThingElse这个方法是一个while循环，并且永远不会结束，那么这个创建出来的object对象会不会被回收呢？还是一直都存在内存中？

先说我们的结论，JVM非常智能，可以检测出来这种情况，将object对象进行回收。

## 举例说明

为了能够更好的说明问题，我们自定义一个Test对象，并在其创建和被回收之前打印相应的信息。

~~~java
    public static class Test {
       public Test() {
           System.out.println("创建对象 " + this);
       }

       public void test() {
           System.out.println("测试对象 " + this);
       }

       @Override
       protected void finalize() throws Throwable {
           System.out.println("回收对象 " + this);
       }
    }

~~~

然后做两个测试，第一个测试没有无限循环，第二个测试保持无限循环，循环通过一个volatile变量flag来控制：

~~~java
public static void main(String[] args) throws InterruptedException {
        System.out.println("开始测试1");
        resetFlag();
        flag = true;
        testLocalVariable();

        System.out.println("等待Test1结束");
        Thread.sleep(10000);

        System.out.println("开始测试2");
        flag = true;
        testLocalVariable();
    }
~~~

看一下testLocalVariable方法的定义：

~~~java
    public static void testLocalVariable() {
        Test test1 = new Test();
        Test test2 = new Test();
        while (flag) {
            // 啥都不做
        }
        test1.test();
    }
~~~

然后我们再启动一个线程做定时的GC。好了一切就绪，我们运行吧：

~~~java
开始测试1
创建对象 com.flydean.LocalVariableReachability$Test@119d7047
创建对象 com.flydean.LocalVariableReachability$Test@776ec8df
回收对象 com.flydean.LocalVariableReachability$Test@776ec8df
测试对象 com.flydean.LocalVariableReachability$Test@119d7047
等待Test1结束
回收对象 com.flydean.LocalVariableReachability$Test@119d7047

开始测试2
创建对象 com.flydean.LocalVariableReachability$Test@4eec7777
创建对象 com.flydean.LocalVariableReachability$Test@3b07d329
回收对象 com.flydean.LocalVariableReachability$Test@3b07d329
~~~

先看测试1的结果，我们可以看到第二个对象在调用test1.test()之前就被回收了。

再看测试2的结果，我们可以看到第二个对象同样被回收了。

结果说明了JVM是足够智能的，可以自行优化本地变量的生命周期。

## 优化的原因

我们考虑一下，JVM是在什么阶段对本地变量的生命周期进行优化的呢？

很明显，这个优化不是在编译期间进行的，而是在运行期中进行的优化。

我们使用-XX:+PrintAssembly分析一下汇编代码：

![](https://img-blog.csdnimg.cn/2020062509493794.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

首先说明，本人的汇编语言还是很多年前学过的，如果解释起来有错误的地方，请多多指正。

先说两个概念rbx和r10都是64位CPU的寄存器，r10d是r10的低32位。

先看红框1， 红框1表示rbx中保存的是我们定义的LocalVariableReachability类中的一个Test对象。

再看红框2，红框2表示r10现在保存的是LocalVariableReachability这个类实例。

红框3表示的是进入while循环的时候，ImutableOopMap中存储的对象，大家可以看到里面只有r10和rbx，也就是说只有类实例和其中的一个Test实例。

红框4是什么呢？红框4表示的是一个safe point，也就是垃圾回收的时候的安全点。在这个安全点上如果有不再被使用的对象就会被回收。

因为ImutableOopMap中只存有两个对象，那么剩下的一个Test实例就会被回收。

## 总结

本文介绍了本地变量的生命周期，并在汇编语言的角度对其进行了解释，如有错误欢迎指正。

# 第十四章 HotSpot VM中的Intrinsic methods

## 简介

内置方法是什么呢？它和inline method有什么关系呢？内置方法是怎么实现的呢？所有的问题都可以在本文找到答案。

## 什么是Intrinsic Methods

什么是内置方法呢？

维基百科给出的定义是这样的：

在计算机软件中，按照编译器理论，固有方法（或内置方法）是可在给定编程语言中使用的方法，该编程语言的实现由编译器专门处理。通常，它可以将自动生成的指令序列替换为原始方法调用，类似于内联方法。与内联方法不同，编译器对内置方法有深入的了解，因此可以针对给定情况更好地集成和优化它。

实现内置方法的编译器通常仅在程序请求优化时才启用它们，否则会退回到语言运行时环境提供的默认实现。

所以总结一下，内置方法就是编译器内置的方法实现。

## 内置方法的特点

内置方法有什么特点呢？我们在这里总结一下。

### 多样性
   
因为内置方法是在编译器内部实现的，所以不同的虚拟机，其内置方法是不一样的。

我们不能直接说哪个方法是内置方法，因为不同的JVM是不同的。

### 兼容性

内置方法是在需要的时候才会使用的，如果在不需要的时候则会回退到普通的方法实现，也就是java代码的实现。

所以在java源代码级别来看，内置方法和非内置方法是一样的。他们的区别在于JVM的实现。

### java语义的扩展

有些方法用普通的java代码是无法实现的。比如sun.misc.Unsafe.compareAndSwapInt()。 

我们只能使用JNI或者内置方法来对其实现。所以内置方法可以实现对java语义的扩展。

一般来说，JDK和核心库中，能使用内置方法优化都已经优化了。所以我们在平时的代码调用中，一定要尽可能的使用JDK的公共API和核心库，这样才能充分利用内置方法的特性，从而提升程序效率。

## Hotspot VM中的内置方法

那么对于Hotspot VM来说，内置的方法有哪些呢？

Hotspot VM中所有的内置方法都在src/share/vm/classfile/vmSymbols.hpp类中：

![](https://img-blog.csdnimg.cn/20200625173025105.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图我只截取了部分标记为intrinsic方法的类的说明。

可以看到java.lang.Math中大部分的方法都是intrinsic的方法。

怎么查看我们代码中调用的方法是不是intrinsic方法呢？

很简单，在java命令之前加上这些参数即可：

~~~java
 -XX:+UnlockDiagnosticVMOptions  -XX:+PrintCompilation -XX:+PrintInlining
~~~

举个最常用的查看java版本的例子：

~~~java
java  -XX:+UnlockDiagnosticVMOptions  -XX:+PrintCompilation -XX:+PrintInlining  version
~~~

看下输出结果：

![](https://img-blog.csdnimg.cn/20200625173513830.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从结果可以很清楚的看到，java.lang.System.arraycopy方法是内置方法。

另外我们可以通过更加底层的汇编语言来查看，再添加

~~~
-XX:+PrintAssembly
~~~

我们看下输出结果：

![](https://img-blog.csdnimg.cn/2020062517531637.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

invokestatic意味着该方法就是intrinsified方法。

## intrinsic方法和内联方法

内联方法就是把调用方函数代码"复制"到调用方函数中，减少因函数调用开销的技术。

intrinsic方法大部分都是内联方法。

## intrinsic方法的实现

前面我们提到了内置方法是在编译器实现的。

在Hotspot VM中其实有3中编译器。

第一种就是javac将java源代码编译成为字节码。

在这一层，只有一些math方法和bootstrapping的MethodHandle是在这一层实现的。

第二种就是在JIT的Client Compiler (C1)。 

第三种就是在JIT的Server Compiler (C2)。

举一个例子，我们看一下java.lang.System.currentTimeMillis()方法：

~~~java
@HotSpotIntrinsicCandidate
    public static native long currentTimeMillis();
~~~

JDK源码使用了HotSpotIntrinsicCandidate注解。这个注解只是表示该方法可能会被用于Intrinsic，而并不意味着一定使用Intrinsic。

这个方法在Interpreter级别是没有intrinsified。因为这是一个native方法，所以会通过JNI调用底层的C++实现。

而在C1和C2级别，会使用intrinsified, 直接调用os::javaTimeMillis()。

好处就是减少了JNI的使用，提升效率。

好了问题来了，我们可以自己实现intrinsified方法吗？

答案是可以，不过需要修改底层的JVM实现。

这里有两个具体的例子，感兴趣的大家可以自行研究。

C1级别修改（First cut: C1 Class.isInstance intrinsic）：

~~~java
https://gist.github.com/rednaxelafx/2830194
~~~

C2级别修改（Example (XS) of adding an intrinsic method to HotSpot C2. Patch against HS20-b12）：

~~~java
https://gist.github.com/rednaxelafx/1986224
~~~

## Graal

因为Hotspot VM是用C++编写的，如果要添加Intrinsic方法，对于那些不熟悉C++的朋友来说就太难了。

没关系，Oracle开发了一个项目叫做Graal。 Graal是一个用java编写的新款JIT编译器。

Graal是基于Java的JIT编译器，是JDK 9中引入的实验性Ahead-of-Time（AOT）编译器的基础。

开启Graal的参数：

~~~java
-XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler
~~~

通过Graal，我们可以用java来实现Intrinsic方法，想想就让人兴奋。

## 总结

Intrinsic方法是一个非常有用的特性，希望大家能够喜欢。

# 第十五章 通过一个例子分析JIT的汇编代码

## 简介

我们知道JIT会在JVM运行过程中，对热点代码进行优化，传说自然是传说，今天我们通过一个简单的例子来具体分析一下JIT到底是怎么进行优化的。

## 一个简单的例子 

说干就干，我们先准备一个非常简单的例子：

~~~java
public class AddTest {
    static int a = 1;
    static int b = 2;
    static int c = 3;

    public static void main(String[] args) {
        for (int i = 0; i < 100000; i++) {
            add();
        }
    }

    private static void add() {
        a = b + 1;
        b = c + 2;
        c = a + 3;
    }
}
~~~

这个例子中我们定义了三个类变量，然后通过一个add方法对其中的变量进行累加。

然后在main方法中对add方法调用10000次。调用这么多次，主要是为了保证add成为热点代码，从而使用JIT进行编译。

## 使用jitWatch进行分析

之前提到了JIT分析的神器jitWatch，今天我们来使用jitWatch来分析上面的代码。

从jitWatch的github中下载源码，运行mvn exec:java即可开启jitWatch之旅。

打开sandbox,选择我们编写的类文件。点击运行即可。

有不熟悉jitWatch的朋友可以参考我之前写的文章：

[JIT的Profile神器JITWatch](http://www.flydean.com/jvm-jit-jitwatch/)

然后我们到了下面熟悉的界面：

![](https://img-blog.csdnimg.cn/20200626093933588.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

界面分为三部分，左边是源代码，中间是字节码，最右边是JIT编译的汇编代码。

## 分析字节码

我们分析下add方法生成的字节码：

~~~java
 0: getstatic       #13  // Field b:I
 3: iconst_1        
 4: iadd            
 5: putstatic       #17  // Field a:I
 8: getstatic       #20  // Field c:I
11: iconst_2        
12: iadd            
13: putstatic       #13  // Field b:I
16: getstatic       #17  // Field a:I
19: iconst_3        
20: iadd            
21: putstatic       #20  // Field c:I
24: return          
~~~

我们可以看到字节码和java源代码是一一对应的。

比如add方法的第一行：

~~~java
a = b + 1;
~~~

相应的字节码是这样的：

~~~java
 0: getstatic       #13  // Field b:I
 3: iconst_1        
 4: iadd            
 5: putstatic       #17  // Field a:I
~~~

首先通过getstatic拿到字段b的值。然后调用iconst_1，将1加载。接着调用iadd把1和b相加。最后将生成的值使用putstatic赋值给a。

字节码和源代码一一对应，完全没有问题。

## 分析汇编代码

那么JIT生成的汇编代码是不是也和java代码一致呢？我们再来看一下生成的汇编代码。

![](https://img-blog.csdnimg.cn/202006261003442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从图片我们可以看出，生成的汇编代码可以分为方法初始化，代码逻辑区，多线程同步，地址和cache line对齐，异常处理，返优化等几个部分。

这里我们主要关注一下代码逻辑区：

![](https://img-blog.csdnimg.cn/20200626102546144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从图上我做的标记可以看出，汇编中执行的逻辑是
b=c+2, a =b+1和c=b+4。

不光执行顺序发送了变化（重排序），执行逻辑也进行了优化。

大家可能注意到汇编语言中有这样几个不太明白的代码：

~~~java
0x78(%r10)
0x74(%r10)
0x70(%r10)
~~~

通过第二行的注解，我们知道r10存储的是AddTest这个对象，而0x70，0x74和0x78是AddTest中的偏移量，用来定位类变量a,b,c。

## 总结

从上面的例子可以知道，JIT会对代码进行优化，所以最好的办法是不要自己在java代码中做一些你认为是优化的优化，因为这样可能让JIT在优化的时候变得困惑。从而限制了代码优化的力度。

最后，JIT是一个非常强大的工具。希望大家能够喜欢。

# 第十六章 类的加载链接和初始化

## 简介

有了java class文件之后，为了让class文件转换成为JVM可以真正运行的结构，需要经历加载，链接和初始化的过程。

这三个过程是怎么工作的呢？在本文中你将会找到答案。

## 加载

JVM可以分为三大部分，五大空间和三大引擎，要讲起来也不是特别复杂，先看下面的总体的JVM架构图。

![](https://img-blog.csdnimg.cn/20200524221637660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从上面的图中，我们可以看到JVM中有三大部分，分别是类加载系统，运行时数据区域和Execution Engine。

加载就是根据特定名称查找类或者接口的二进制表示，并根据此二进制表示来创建类和接口的过程。

### 运行时常量池

我们知道JVM中有一个方法区的区域，在JDK8中，方法区的实现叫做元空间。这个元空间是存放在本地内存中的。

方法区中存放着每个class对应的运行时常量池。

当类或者接口创建的时候，就会通过class文件中定义的常量池来构建运行时常量池。

运行时常量池中有两种类型，分别是symbolic references符号引用和static constants静态常量。

其中静态常量不需要后续解析，而符号引用需要进一步进行解析处理。

静态常量分为两个部分：String常量和数字常量。

String常量是对String对象的引用，是从class中的CONSTANT_String_info结构体构建的。

数字常量是从class文件中的CONSTANT_Integer_info, CONSTANT_Float_info, CONSTANT_Long_info和 CONSTANT_Double_info 构建的。

符号引用也是从class中的constant_pool中构建的。

对class和interface的符号引用来自于CONSTANT_Class_info。

对class和interface中字段的引用来自于CONSTANT_Fieldref_info。

class中方法的引用来自于CONSTANT_Methodref_info。

interface中方法的引用来自于CONSTANT_InterfaceMethodref_info。

对方法句柄的引用来自于CONSTANT_MethodHandle_info。

对方法类型的引用来自于CONSTANT_MethodType_info。

对动态计算常量的符号引用来自于CONSTANT_MethodType_info。

对动态计算的call site的引用来自于CONSTANT_InvokeDynamic_info。

### 类加载器

类是怎么创建的呢？类的创建可以是由其他类调用该类的初始化方法来创建，也可以通过反射来创建。

类其实又可以分为两种，一种是数组类，一种是非数组类。

对于非数组类，因为他们有相应的二进制表示，所以是通过类加载器加载二进制表示来创建的。

而对于数组类，因为他们没有外部的二进制表示，所以数组类是由java虚拟机创建的。

java虚拟机中的类加载器又有两种，一种是虚拟机提供的引导类加载器，一种是用户自定义的类加载器。

如果是用户自定的类加载器，那么应该是ClassLoader的一个实现。用户自定义类加载器主要是为了扩展java虚拟机的功能，以支持动态加载并创建类。

## 链接

链接是为了让类或者接口可以被java虚拟机执行，而将类或者接口并入虚拟机运行时状态的过程。

链接具体的工作包括验证和准备类或者接口。而解析这个类或者接口中的符号引用是链接过程中的可选部分。

如果java虚拟机选择在用到类或者接口中的符号引用时才去解析他们，这叫做延迟解析。

如果java虚拟机在验证类的时候就解析符号引用，这就叫做预先解析。

### 验证

验证主要是为了保证类和接口的二进制表示的结构正确性。

如果类或者接口的二进制表示不满足相应的约束，则会抛出VerifyError异常。

### 准备

准备主要是创建类或者接口的静态字段，并使用默认值来初始化这些字段。

### 解析

解析是指根据运行时常量池中的符号引用来动态决定其具体值的过程。

在执行java虚拟机指令：

anewarray,checkcat, getfield, getstatic, instanceof, invokedynamic, invokeinterface, invokespecial, invokestatic, invokevirtual, ldc, ldc_w, multianewarray, new , putfield和putstatic这些指令的时候，都会去将符号引用指向运行时常量池，从而需要对符号引用进行解析。

解析可以分为类和接口的解析，字段解析，普通方法的解析，接口方法解析，方法类型和方法句柄解析，调用点限定符解析这几种。

## 初始化

类或者接口的初始化是指执行类或者接口的初始化方法&lt;clinit>。

只有下面的几种情况，类或者接口才会被初始化：

1. 执行需要引用类或者接口的java虚拟机指令（new,getstatic, putstatic, invokestatic）的时候。
2. 初次调用java.lang.invoke.Methodhandle实例的时候。
3. 调用类库中的某些反射方法的时候。
4. 对类的某个子类进行初始化的时候。
5. 被选定为java虚拟机启动时候的初始类的时候。

## 总结

class文件经过加载，链接和初始化之后，就可以提供给JVM在运行时使用了。

# 第十七章 逃逸分析和TLAB

## 简介

逃逸分析我们在JDK14中JVM的性能优化一文中已经讲过了，逃逸分析的结果就是JVM会在栈上分配对象，从而提升效率。如果我们在多线程的环境中，如何提升内存的分配效率呢？快来跟小师妹一起学习TLAB技术吧。

## 逃逸分析和栈上分配

小师妹：F师兄，从前大家都说对象是在堆中分配的，然后我就信了。上次你居然说可以在栈上分配对象，这个实在是颠覆了我一贯的认知啊。

柏拉图说过：思想永远是宇宙的统治者。只要思想不滑坡，办法总比困难多。别人告诉你的都是一些最基本，最最通用的情况。而师兄我告诉你的则是在优化中的特列情况。

小师妹：F师兄，看起来JVM在提升运行速度方面真的做了不少优化呀。

是呀，Java从最开始被诟病速度慢，到现在执行速度直追C语言。这些运行时优化是必不可少的。还记得我们之前讲的逃逸分析是怎么回事吗？

小师妹：F师兄，这个我知道，如果一个对象的分配是在方法内部，并且没有多线程访问的情况下，那么这个对象其实可以看做是一个本地对象，这样的对象不管创建在哪里都只对本线程中的本方法可见，因此可以直接分配在栈空间中。

对的，栈上分配的对象因为不用考虑同步，所以执行速度肯定会更加快速，这也是为什么JVM会引入栈上分配的原因。

再举一个形象直观的例子。工厂要组装一辆汽车，在buildCar的过程中，需要先创建一个Car对象，然后给它按上轮子。

~~~java
  public static void main(String[] args) {
    buildCar();
  }
  public static void buildCar() {
    Wheel whell = new Wheel(); //分配轮子
    Car car = new Car(); //分配车子
    car.setWheel(whell);
  }
}

class Wheel {}

class Car {
  private Wheel whell;
  public void setWheel(Wheel whell) {
    this.whell = whell;
  }
}
~~~

考虑一下上面的情况，如果假设该车间是一个机器人组装一台车，那么上面方法中创建的Car和Wheel对象，其实只会被这一个机器人访问，其他的机器人根本就不会用到这个车的对象。那么这个对象本质上是对其他机器人隐形的。所以我们可以不在公共空间分配这个对象，而是在私人的栈空间中分配。

逃逸分析还有一个作用就是lock coarsening。同样的，单线程环境中，锁也是不需要的，也可以优化掉。

## TLAB简介

小师妹：F师兄，我觉得逃逸分析很好呀，栈上分配也不错。既然有这么厉害的两项技术了，为什么还要用到TLAB呢？

首先这是两个不同的概念，TLAB的全称是Thread-Local Allocation Buffers。Thread-Local大家都知道吧，就是线程的本地变量。而TLAB则是线程的本地分配空间。

逃逸分析和栈上分配只是争对于单线程环境来说的，如果在多线程环境中，不可避免的会有多个线程同时在堆空间中分配对象的情况。

这种情况下如何处理才能提升性能呢？

小师妹：哇，多个线程竞争共享资源，这不是一个典型的锁和同步的问题吗？

锁和同步是为了保证整个资源一次只能被一个线程访问，我们现在的情况是要在资源中为线程划分一定的区域。这种操作并不需要完全的同步，因为heap空间够大，我们可以在这个空间中划分出一块一块的小区域，为每个线程都分一块。这样不就解决了同步的问题了吗？这也可以称作空间换时间。

## TLAB详解

小师妹，还记得heap分代技术中的一个中心两个基本点吗？哦，1个Eden Space和2个Suvivor Space吗？

![](https://img-blog.csdnimg.cn/20200602060126712.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。垃圾回收的时候，会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

就这样不断的扫描，最后经过多次扫描发现任然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

因为TLAB关注的是新分配的对象，所以TLAB是被分配在Eden区间的，从图上可以看到TLAB是一个一个的连续空间。

然后将这些连续的空间分配个各个线程使用。

因为每一个线程都有自己的独立空间，所以这里不涉及到同步的概念。默认情况下TLAB是开启的，你可以通过：

~~~java
-XX:-UseTLAB
~~~

来关闭它。

### 设置TLAB空间的大小

小师妹，F师兄，这个TLAB的大小是系统默认的吗？我们可以手动控制它的大小吗？

要解决这个问题，我们还得去看JVM的C++实现，也就是threadLocalAllocBuffer.cpp：

![](https://img-blog.csdnimg.cn/20200602060906545.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上面的代码可以看到，如果设置了TLAB（默认是0），那么TLAB的大小是定义的TLABSize除以HeapWordSize和max_size()中最小的那个。

> HeapWordSize是heap中一个字的大小，我猜它=8。别问我为什么，其实我也是猜的，有人知道答案的话可以留言告诉我。

TLAB的大小可以通过：

~~~java
-XX:TLABSize
~~~

来设置。

如果没有设置TLAB，那么TLAB的大小就是分配线程的平均值。

TLAB的最小值可以通过：

~~~java
-XX:MinTLABSize
~~~

来设置。

默认情况下：

~~~java
-XX:ResizeTLAB
~~~

resize开关是默认开启的，那么JVM可以对TLAB空间大小进行调整。

### TLAB中大对象的分配

小师妹：F师兄，我想到了一个问题，既然TLAB是有大小的，如果一个线程中定义了一个非常大的对象，TLAB放不下了，该怎么办呢？

好问题，这种情况下又有两种可能性，我们假设现在的TLAB的大小是100K：

第一种可能性：

目前TLAB被使用了20K，还剩80K的大小，这时候我们创建了一个90K大小的对象，现在90K大小的对象放不进去TLAB，这时候需要直接在heap空间去分配这个对象，这种操作实际上是一种退化操作，官方叫做 slow allocation。

第二中个可能性：

目前TLAB被使用了90K，还剩10K大小，这时候我们创建了一个15K大小的对象。

这个时候就要考虑一下是否仍然进行slow allocation操作。

因为TLAB差不多已经用完了，为了保证后面new出来的对象仍然可以有一个TLAB可用，这时候JVM可以尝试将现在的TLAB Retire掉，然后分配一个新的TLAB空间，把15K的对象放进去。

JVM有个开关，叫做：

~~~java
-XX:TLABWasteTargetPercent=N
~~~

这个开关的默认值是1。表示如果新分配的对象大小如果超出了设置的这个百分百，那么就会执行slow allocation。否则就会分配一个新的TLAB空间。

同时JVM还定义了一个开关：

~~~java
-XX:TLABWasteIncrement=N
~~~

为了防止过多的slow allocation，JVM定义了这个开关（默认值是4），比如说第一次slow allocation的极限值是1%，那么下一次slow allocation的极限值就是%1+4%=5%。

### TLAB空间中的浪费

小师妹：F师兄，如果新分配的TLAB空间，那么老的TLAB中没有使用的空间该怎么办呢？

这个叫做TLAB Waste。因为不会再在老的TLAB空间中分配对象了，所以剩余的空间就浪费了。


## 总结

本文介绍了逃逸分析和TLAB的使用。希望大家能够喜欢。

# 第十八章 JIT中的Virtual Call

## 简介

什么是Virtual Call？Virtual Call在java中的实现是怎么样的？Virtual Call在JIT中有没有优化？

所有的答案看完这篇文章就明白了。

## Virtual Call和它的本质

有用过PrintAssembly的朋友，可能会在反编译的汇编代码中发现有些方法调用的说明是invokevirtual，实际上这个invokevirtual就是Virtual Call。

Virtual Call是什么呢？

面向对象的编程语言基本上都支持方法的重写，我们考虑下面的情况：

~~~java
 private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
    private static class CustObj2 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj2 is very good!");
            }
        }
    }
~~~

我们定义了两个类，CustObj是父类CustObj2是子类。然后我们通一个方法来调用他们：

~~~java
public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }
~~~

因为doWithVMethod的参数类型是CustObj，但是我们同样也可以传一个CustObj2对象给doWithVMethod。

怎么传递这个参数是在运行时决定的，我们很难在编译的时候判断到底该如何执行。

那么JVM会怎么处理这个问题呢？

答案就是引入VMT(Virtual Method Table)，这个VMT存储的是该class对象中所有的Virtual Method。

然后class的实例对象保存着一个VMT的指针，执行VMT。

![](https://img-blog.csdnimg.cn/20200630084945828.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

程序运行的时候首先加载实例对象，然后通过实例对象找到VMT，通过VMT再找到对应的方法地址。

### Virtual Call和classic call

Virtual Call意思是调用方法的时候需要依赖不同的实例对象。而classic call就是直接指向方法的地址，而不需要通过VMT表的转换。

所以classic call通常会比Virtual Call要快。

那么在java中是什么情况呢？

在java中除了static, private和构造函数之外，其他的默认都是Virtual Call。

## Virtual Call优化单实现方法的例子

有些朋友可能会有疑问了，java中其他方法默认都是Virtual Call，那么如果只有一个方法的实现，性能不会受影响吗？

不用怕，JIT足够智能，可以检测到这种情况，在这种情况下JIT会对Virtual Call进行优化。

接下来，我们使用JIT Watcher来进行Assembly代码的分析。

要运行的代码如下：

~~~java
public class TestVirtualCall {

    public static void main(String[] args) throws InterruptedException {
        CustObj obj = new CustObj();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(obj);
        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }

    private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
}
~~~

上面的例子中我们只定义了一个类的方法实现。

![](https://img-blog.csdnimg.cn/2020063009022458.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

在JIT Watcher的配置中，我们禁用inline,以免inline的结果对我们的分析进行干扰。

> 如果你不想使用JIT Watcher,那么可以在运行是添加参数-XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -XX:-Inline， 这里使用JIT Watcher是为了方便分析。

好了运行代码：

运行完毕，界面直接定位到我们的JIT编译代码的部分，如下图所示：

![](https://img-blog.csdnimg.cn/20200630090523130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

obj.methodCall相对应的byteCode中，大家可以看到第二行就是invokevirtual，和它对应的汇编代码我也在最右边标明了。

大家可以看到在invokevirtual methodCall的最下面，已经写明了optimized virtual_call,表示这个方法已经被JIT优化过了。

接下来，我们开启inline选项，再运行一次：

![](https://img-blog.csdnimg.cn/20200630091406865.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

大家可以看到methodCall中的System.currentTimeMillis已经被内联到methodCall中了。

因为内联只会发生在classic calls中，所以也侧面说明了methodCall方法已经被优化了。

## Virtual Call优化多实现方法的例子

上面我们讲了一个方法的实现，现在我们测试一下两个方法的实现：

~~~java
public class TestVirtualCall2 {

    public static void main(String[] args) throws InterruptedException {
        CustObj obj = new CustObj();
        CustObj2 obj2 = new CustObj2();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(obj);
            doWithVMethod(obj2);

        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }

    private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
    private static class CustObj2 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj2 is very good!");
            }
        }
    }
}
~~~

上面的例子中我们定义了两个类CustObj和CustObj2。 

再次运行看下结果，同样的，我们还是禁用inline。

![](https://img-blog.csdnimg.cn/20200630091910897.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

大家可以看到结果中，首先对两个对象做了cmp，然后出现了两个优化过的virtual call。

这里比较的作用就是找到两个实例对象中的方法地址，从而进行优化。

那么问题来了，两个对象可以优化，三个对象，四个对象呢？

我们选择三个对象来进行分析：

~~~java
public class TestVirtualCall4 {

    public static void main(String[] args) throws InterruptedException {
        CustObj obj = new CustObj();
        CustObj2 obj2 = new CustObj2();
        CustObj3 obj3 = new CustObj3();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(obj);
            doWithVMethod(obj2);
            doWithVMethod(obj3);

        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }

    private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
    private static class CustObj2 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj2 is very good!");
            }
        }
    }
    private static class CustObj3 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj3 is very good!");
            }
        }
    }
}
~~~

运行代码，结果如下：

![](https://img-blog.csdnimg.cn/20200630092508545.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

很遗憾，代码并没有进行优化。

> 具体未进行优化的原因我也不清楚，猜想可能跟code cache的大小有关？ 有知道的朋友可以告诉我。

## 总结

本文介绍了Virtual Call和它在java代码中的使用，并在汇编语言的角度对其进行了一定程度的分析，有不对的地方还请大家不吝指教！

# 第十九章 JIT中的Virtual Call接口

## 简介

上一篇文章我们讲解了Virtual Call的定义并举例分析了Virtual Call在父类和子类中的优化。

JIT对类可以进行优化，那么对于interface可不可以做同样的优化么？

一起来看看吧。

## 最常用的接口List

List应该是大家最最常用的接口了，我想这个大家应该不会反驳。

~~~java
public interface List<E> extends Collection<E> {
~~~

今天我们就拿List来做例子，体验一下JIT优化接口的奥秘。

还是上代码，要分析的代码如下：

~~~java
public class TestVirtualListCall {

    public static void main(String[] args) throws InterruptedException {
        List<String> list=new ArrayList<>();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(list);
        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(List<String> list)
    {
        list.add("www.flydean.com");
    }
}
~~~

> 如果在命令行运行，大家记得在运行时添加参数-XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -XX:-Inline

直接看JIT Watcher的结果：

![](https://img-blog.csdnimg.cn/20200630104308633.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们可以看到JIT中先对ArrayList的实现类做了一个比较。

然后调用的是invokeinterface，但是其本质还是invokevirtual,并且我们可以看到这个调用是被优化过了：optimized virtual call。

## 多个List的调用

同样的，我们可以测试一下多个list子类的情况下怎么调用：

~~~java
public class TestVirtualListCall2 {

    public static void main(String[] args) throws InterruptedException {
        List<String>[] lists=new List[]{new ArrayList<>(),new LinkedList<>()};
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(lists[i%2]);
        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(List<String> list)
    {
        list.add("www.flydean.com");
    }
}
~~~

同样，使用JIT Watcher来运行：

![](https://img-blog.csdnimg.cn/20200630104909436.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们可以看到JIT做了两次对象类型的比较，然后对两个invokeinterface都做了优化。

结果和我们的父类子类结果是一样的。

## 不一样的List调用

上面我们在做多个list调用的时候，是轮循着来调用的，如果我们先调用ArrayList的方法，再调用LinkedList的方法，会有什么不同呢？

一起来看看。

~~~java
public class TestVirtualListCall3 {

    public static void main(String[] args) throws InterruptedException {
        List<String> list1 = new ArrayList<>();
        List<String> list2 = new LinkedList<>();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(list1);
        }
        Thread.sleep(1000);
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(list2);
        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(List<String> list)
    {
        list.add("www.flydean.com");
    }
}
~~~

上面我们先循环ArrayList，然后再循环LinkedList。

看下结果有什么不同：

![](https://img-blog.csdnimg.cn/20200630111901141.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

可以看到，JIT先比较了ArrayList,然后只做了一次方法的优化。

也就是说LinkedList的调用是没有进行代码优化的。

上面的结果是在C2编译器下，也就是level4的编译水平下解析的。

我们看下如果在C1编译器下，也就是Level3编译水平下有什么不同。

![](https://img-blog.csdnimg.cn/20200630112131810.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

可以看到C1编译下，所有的invokeinterface都没有进行编译优化，只有在C2编译下，才会进行优化。

> 不同的JVM版本可能优化方式不一样。大家可以自行实验。

## 总结

本文用实例展示了Virtual Call在interface上面的优化使用。

感兴趣的朋友，可以一起讨论。

# 第二十章 运行时常量池

## 简介

JVM在运行的时候会对class文件进行加载，链接和初始化的过程。class文件中定义的常量池在JVM加载之后会发生什么神奇的变化呢？快来看一看吧。

## class文件中的常量池

之前我们在讲class文件的结构时，提到了每个class文件都有一个常量池，常量池中存了些什么东西呢？

字符串常量，类和接口名字，字段名，和其他一些在class中引用的常量。

## 运行时常量池

但是只有class文件中的常量池肯定是不够的，因为我们需要在JVM中运行起来。

这时候就需要一个运行时常量池，为JVM的运行服务。

运行时常量池和class文件的常量池是一一对应的，它就是class文件的常量池来构建的。

运行时常量池中有两种类型，分别是symbolic references符号引用和static constants静态常量。

其中静态常量不需要后续解析，而符号引用需要进一步进行解析处理。

什么是静态常量，什么是符号引用呢？ 我们举个直观的例子。

~~~java
String site="www.flydean.com"
~~~

上面的字符串"www.flydean.com"可以看做是一个静态常量，因为它是不会变化的，是什么样的就展示什么样的。

而上面的字符串的名字“site”就是符号引用，需要在运行期间进行解析，为什么呢？

因为site的值是可以变化的，我们不能在第一时间确定其真正的值，需要在动态运行中进行解析。

### 静态常量详解

运行时常量池中的静态常量是从class文件中的constant_pool构建的。可以分为两部分：String常量和数字常量。

#### String常量

String常量是对String对象的引用，是从class中的CONSTANT_String_info结构体构建的：

~~~java
CONSTANT_String_info {
    u1 tag;
    u2 string_index;
}
~~~

tag就是结构体的标记，string_index是string在class常量池的index。

string_index对应的class常量池的内容是一个CONSTANT_Utf8_info结构体。

~~~java
CONSTANT_Utf8_info {
    u1 tag;
    u2 length;
    u1 bytes[length];
}
~~~

CONSTANT_Utf8_info是啥呢？它就是要创建的String对象的变种UTF-8编码。

我们知道unicode的范围是从0x0000 至 0x10FFFF。

变种UTF-8就是将unicode进行编码的方式。那是怎么编码呢？

![](https://img-blog.csdnimg.cn/20200616183643720.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从上图可以看到，不同的unicode范围使用的是不同的编码方式。

> 注意，如果一个字符占用多个字节，那么在class文件中使用的是 big-endian 大端优先的排列方式。

> 如果字符范围在FFFF之后，那么使用的是2个3字节的格式的组合。

讲完class文件中CONSTANT_String_info的结构之后，我们再来看看从CONSTANT_String_info创建运行时String常量的规则：

1. 规则一：如果String.intern之前被调用过，并且返回的结果和CONSTANT_String_info中保存的编码是一致的话，表示他们指向的是同一个String的实例。

2. 规则二：如果不同的话，那么会创建一个新的String实例，并将运行时String常量指向该String的实例。最后会在这个String实例上调用String的intern方法。调用intern方法主要是将这个String实例加入字符串常量池。

#### 数字常量

数字常量是从class文件中的CONSTANT_Integer_info, CONSTANT_Float_info, CONSTANT_Long_info和 CONSTANT_Double_info 构建的。

### 符号引用详解

符号引用也是从class中的constant_pool中构建的。

对class和interface的符号引用来自于CONSTANT_Class_info。

对class和interface中字段的引用来自于CONSTANT_Fieldref_info。

class中方法的引用来自于CONSTANT_Methodref_info。

interface中方法的引用来自于CONSTANT_InterfaceMethodref_info。

对方法句柄的引用来自于CONSTANT_MethodHandle_info。

对方法类型的引用来自于CONSTANT_MethodType_info。

对动态计算常量的符号引用来自于CONSTANT_MethodType_info。

对动态计算的call site的引用来自于CONSTANT_InvokeDynamic_info。

## String Pool字符串常量池

我们在讲到运行时常量池的时候，有提到String常量是对String对象的引用。那么这些创建的String对象是放在什么地方呢？

没错，就是String Pool字符串常量池。

这个String Pool在每个JVM中都只会维护一份。是所有的类共享的。

String Pool是在1.6之前是存放在方法区的。在1.8之后被放到了java heap中。

> 注意，String Pool中存放的是字符串的实例，也就是用双引号引起来的字符串。

那么问题来了？

~~~java
String name = new String("www.flydean.com"）;
~~~

到底创建了多少个对象呢？

## 总结

class文件中常量池保存的是字符串常量，类和接口名字，字段名，和其他一些在class中引用的常量。每个class都有一份。

运行时常量池保存的是从class文件常量池构建的静态常量引用和符号引用。每个class都有一份。

字符串常量池保存的是“字符”的实例，供运行时常量池引用。

运行时常量池是和class或者interface一一对应的，那么如果一个class生成了两个实例对象，这两个实例对象是共享一个运行时常量池还是分别生成两个不同的常量池呢？欢迎小伙伴们留言讨论。

# 第二十一章 JDK14中JVM的性能优化

## 简介

上一篇文章我们讲到了JVM为了提升解释的性能，引入了JIT编译器，今天我们再来从整体的角度，带小师妹看看JDK14中的JVM有哪些优化的方面，并且能够从中间得到那些启发。

## String压缩

小师妹:F师兄，上次你给我讲的JIT真的是受益匪浅，原来JVM中还有这么多不为人知的小故事。不知道除了JIT之外，JVM还有没有其他的性能提升的姿势呢？

姿势当然有很多种，先讲一下之前提到过的，在JDK9中引入的字符串压缩。

在JDK9之前，String的底层存储结构是char[],一个char需要占用两个字节的存储单位。

因为大部分的String都是以Latin-1字符编码来表示的，只需要一个字节存储就够了，两个字节完全是浪费。

于是在JDK9之后，字符串的底层存储变成了byte[]。

目前String支持两种编码格式LATIN1和UTF16。

LATIN1需要用一个字节来存储。而UTF16需要使用2个字节或者4个字节来存储。

在JDK9中，字符串压缩是默认开启的。你可以使用

~~~java
 -XX:-CompactStrings
~~~

来控制它。

## 分层编译（Tiered Compilation）

为了提升JIT的编译效率，并且满足不同层次的编译需求，引入了分层编译的概念。

大概来说分层编译可以分为三层：

1. 第一层就是禁用C1和C2编译器，这个时候没有JIT进行。
2. 第二层就是只开启C1编译器，因为C1编译器只会进行一些简单的JIT优化，所以这个可以应对常规情况。
3. 第三层就是同时开启C1和C2编译器。

在JDK7中，你可以使用下面的命令来开启分层编译：

~~~java
-XX:+TieredCompilation
~~~

而在JDK8之后，恭喜你，分层编译已经是默认的选项了，不用再手动开启。

## Code Cache分层

Code Cache就是用来存储编译过的机器码的内存空间。也就说JIT编译产生的机器码，都是存放在Code Cache中的。

Code Cache是以单个heap形式组织起来的连续的内存空间。

如果只是用一个code heap，或多或少的就会引起性能问题。为了提升code cache的利用效率，JVM引入了Code Cache分层技术。

分层技术是什么意思呢？

就是把不同类型的机器码分门别类的放好，优点嘛就是方便JVM扫描查找，减少了缓存的碎片，从而提升了效率。

下面是Code Cache的三种分层：

![](https://img-blog.csdnimg.cn/20200528225431671.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## 新的JIT编译器Graal

之前的文章我们介绍JIT编译器，讲的是JIT编译器是用C/C++来编写的。

而新版的Graal JIT编译器则是用java来编写的。对的，你没看错，使用java编写的JIT编译器。

有没有一种鸡生蛋，蛋生鸡的感觉？不过，这都不重要，重要的是Graal真的可以提升JIT的编译性能。

Graal是和JDK一起发行的，作为一个内部的模块：jdk.internal.vm.compiler。

Graal和JVM是通过JVMCI（JVM Compiler Interface）来进行通信的。其中JVMCI也是一个内部的模块：jdk.internal.vm.ci。

> 注意，Graal只在Linux-64版的JVM中支持，你需要使用 -XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler 来开启Graal特性。

## 前置编译

我们知道在JIT中，通常为了找到热点代码，JVM是需要等待代码执行一定的时间之后，才开始进行本地代码的编译。这样做的缺点就是需要比较长的时间。

同样的，如果是重复的代码，没有被编译成为机器码，那么对性能就会有影响。

而AOT（Ahead-of-time）就厉害了，看名字就知道是提前编译的意思，根本就不需要等待，而是在JVM启动之前就开始编译了。

AOT提供了一个java tool，名字叫做jaotc。显示jaotc的命令格式：

~~~java
jaotc <options> <list of classes or jar files>
jaotc <options> <--module name>
~~~

比如，我们可以这样提前编译AOT库，以供在后面的JVM中使用：

~~~java
jaotc --output libHelloWorld.so HelloWorld.class
jaotc --output libjava.base.so --module java.base
~~~

上面代码提前编译了HelloWorld和它的依赖module java.base。

然后我们可以在启动HelloWorld的时候，指定对应的lib：

~~~java
java -XX:AOTLibrary=./libHelloWorld.so,./libjava.base.so HelloWorld
~~~

这样在JVM启动的时候，就回去找相应的AOTLibrary。

> 注意，AOT是一个 Linux-x64上面的体验功能。

## 压缩对象指针

对象指针用来指向一个对象，表示对该对象的引用。通常来说在64位机子上面，一个指针占用64位，也就是8个字节。而在32位机子上面，一个指针占用32位，也就是4个字节。

实时上，在应用程序中，这种对象的指针是非常非常多的，从而导致如果同样一个程序，在32位机子上面运行和在64位机子上面运行占用的内存是完全不同的。64位机子内存使用可能是32位机子的1.5倍。

而压缩对象指针，就是指把64位的指针压缩到32位。

怎么压缩呢？64位机子的对象地址仍然是64位的。压缩过的32位存的只是相对于heap base address的位移。

我们使用64位的heap base地址+ 32位的地址位移量，就得到了实际的64位heap地址。

对象指针压缩在Java SE 6u23 默认开启。在此之前，可以使用-XX:+UseCompressedOops来开启。

## Zero-Based 压缩指针

刚刚讲到了压缩过的32位地址是基于64位的heap base地址的。而在Zero-Based 压缩指针中，64位的heap base地址是重新分配的虚拟地址0。这样就可以不用存储64位的heap base地址了。

## Escape analysis逃逸分析

最后，要讲的是逃逸分析。什么叫逃逸分析呢？简单点讲就是分析这个线程中的对象，有没有可能会被其他对象或者线程所访问，如果有的话，那么这个对象应该在Heap中分配，这样才能让对其他的对象可见。

如果没有其他的对象访问，那么完全可以在stack中分配这个对象，栈上分配肯定比堆上分配要快，因为不用考虑同步的问题。

我们举个例子：

~~~java
  public static void main(String[] args) {
    example();
  }
  public static void example() {
    Foo foo = new Foo(); //alloc
    Bar bar = new Bar(); //alloc
    bar.setFoo(foo);
  }
}

class Foo {}

class Bar {
  private Foo foo;
  public void setFoo(Foo foo) {
    this.foo = foo;
  }
}
~~~

上面的例子中，setFoo引用了foo对象，如果bar对象是在heap中分配的话，那么引用的foo对象就逃逸了，也需要被分配在heap空间中。

但是因为bar和foo对象都只是在example方法中调用的，所以，JVM可以分析出来没有其他的对象需要引用他们，那么直接在example的方法栈中分配这两个对象即可。

逃逸分析还有一个作用就是lock coarsening。

为了在多线程环境中保证资源的有序访问，JVM引入了锁的概念，虽然锁可以保证多线程的有序执行，但是如果实在单线程环境中呢？是不是还需要一直使用锁呢？

比如下面的例子：

~~~java
public String getNames() {
     Vector<String> v = new Vector<>();
     v.add("Me");
     v.add("You");
     v.add("Her");
     return v.toString();
}
~~~

Vector是一个同步对象，如果是在单线程环境中，这个同步锁是没有意义的，因此在JDK6之后，锁只在被需要的时候才会使用。

这样就能提升程序的执行效率。

# 第二十二章 从汇编角度分析Volatile

## 简介

Volatile关键字对熟悉java多线程的朋友来说，应该很熟悉了。Volatile是JMM(Java Memory Model)的一个非常重要的关键词。通过是用Volatile可以实现禁止重排序和变量值线程之间可见两个主要特性。

今天我们从汇编的角度来分析一下Volatile关键字到底是怎么工作的。

## 重排序

这个世界上有两种重排序的方式。

第一种，是在编译器级别的，你写一个java源代码，经过javac编译之后，生成的字节码顺序可能跟源代码的顺序不一致。

第二种，是硬件或者CPU级别的重排序，为了充分利用多核CPU的性能，或者CPU自身的处理架构（比如cache line），可能会对代码进行重排序。比如同时加载两个非互相依赖的字段进行处理，从而提升处理速度。

我们举个例子：

~~~java
public class TestVolatile {

    private static int int1;
    private static int int2;
    private static int int3;
    private static int int4;
    private static int int5;

    public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 10000; i++)
        {
            increase(i);
        }
        Thread.sleep(1000);
    }

    private static void increase(int i){
        int1= i+1;
        int2= i+2;
        int3= i+3;
        int4= i+4;
        int5= i+5;
    }
}
~~~

上面例子中，我们定义了5个int字段，然后在循环中对这些字段进行累加。

先看下javac编译出来的字节码的顺序：

![](https://img-blog.csdnimg.cn/20200630142134260.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们可以看到在设置值的过程中是和java源代码的顺序是一致的，是按照int1,int2,int3,int4,int5的顺序一个一个设置的。

然后我们看一下生成的汇编语言代码：

> 在运行是添加参数-XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -XX:-Inline，或者直接使用JIT Watcher。

![](https://img-blog.csdnimg.cn/20200630142202510.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从生成的代码中，我们可以看到putstatic是按照int1,int5,int4,int3,int2的顺序进行的，也就是说进行了重排序。

如果我们将int2设置成为Volatile，看看结果如何？

> 前方高能预警，请小伙伴们做好准备

![](https://img-blog.csdnimg.cn/20200630145044404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们先看putstatic的顺序，从注释里面，我们只发现了putstatic int2, int3和int5。

且慢！我们不是需要设置int1,int2,int3,int4,int5 5个值吗？这里怎么只有3个。

> 要是没有能独立思考和独立决定的有创造个人，社会的向上发展就不可想像 - 爱因斯坦

这里是反编译的时候注释写错了！ 

让我们来仔细分析一下汇编代码。

第一个红框，不用懂汇编语言的朋友应该也可以看懂，就是分别给r11d,r8d,r9d,ecx和esi这5个寄存器分别加1，2，3，4，5。

这也分别对应了我们在increase方法中要做的事情。

有了这些寄存器的值，我们再继续往下看，从而可以知道，第二个红框实际上表示的就是putstatic int1,而最后一个红框，表示的就是putstatic int4。

所以，大家一定要学会自己分析代码。

5个putstatic都在，同时因为使用了volatile关键字，所以int2作为一个分界点，不会被重排序。所以int1一定在int2之前，而int3,4,5一定在int2之后。

上图的结果是在JIT Watcher中的C2编译器的结果，如果我们切换到C1编译器：

![](https://img-blog.csdnimg.cn/20200630151458134.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这次结果没错，5个int都在，同时我们看到这5个int居然没有重排序。

这也说明了不同的编译器可能对重排序的理解程度是不一样的。

## 写的内存屏障

再来分析一下上面的putstatic int2:

~~~java
lock addl $0x0,-0x40(%rsp)  ;*putstatic int2 {reexecute=0 rethrow=0 return_oop=0}
~~~

这里使用了 lock addl指令，给rsp加了0。 rsp是SP (Stack Pointer) register，也就是栈指针寄存器。

给rsp加0，是不是很奇怪？

加0，虽然没有改变rsp的值，但是因为前面加了lock，所以这个指令会被解析为内存屏障。

这个内存屏障保证了两个事情，第一，不会重排序。第二，所有的变量值都会回写到主内存中，从而在这个指令之后，变量值对其他线程可见。

当然，因为使用lock，可能对性能会有影响。

## 非lock和LazySet

上面我们提到了volatile会导致生成lock指令。

但有时候，我们只是想阻止重排序，对于变量的可见性并没有那么严格的要求。

这个时候，我们就可以使用Atomic类中的LazySet：

~~~java
public class TestVolatile2 {

    private static int int1;
    private static AtomicInteger int2=new AtomicInteger(0);
    private static int int3;
    private static int int4;
    private static int int5;

    public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 10000; i++)
        {
            increase(i);
        }
        Thread.sleep(1000);
    }

    private static void increase(int i){
        int1= i+1;
        int2.lazySet(i+2);
        int3= i+3;
        int4= i+4;
        int5= i+5;
    }
}
~~~

![](https://img-blog.csdnimg.cn/2020063015351643.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从结果可以看到，int2没有重排序，也没有添加lock。s

> 注意，上面的最后一个红框表示的是putstatic int4。

## 读的性能

最后，我们看下使用volatile关键字对读的性能影响：

~~~java
public class TestVolatile3 {

    private static volatile int int1=10;
    public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 10000; i++)
        {
            readInt(i);
        }
        Thread.sleep(1000);
    }

    private static void readInt(int i){
        if(int1 < 5){
            System.out.println(i);
        }
    }
}
~~~

上面的例子中，我们对int1读取10000次。看下编译结果：

![](https://img-blog.csdnimg.cn/20200630153958829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从结果可以看出，getstatic int1和不使用volatile关键字，生成的代码是一样的。

所以volatile对读的性能不会产生影响。

## 总结

本文从汇编语言的角度再次深入探讨了volatile关键字和JMM模型的影响，希望大家能够喜欢。


# 第二十三章 从汇编角度分析NullCheck

## 简介

之前我们在讲Virtual call的时候有提到，virtual call方法会根据传递的参数实例的不同而进行优化，从而优化成为classic call,从而提升执行效率。

今天我们考虑一下，在virtual call中执行nullcheck的时候，如果已经知道传递的参数是非空的。JIT会对代码进行优化吗？

一起来看看吧。

## 一个普通的virtual call

我们来分析一下在方法中调用list.add方法的例子：

~~~java
public class TestNull {

    public static void main(String[] args) throws InterruptedException {
        List<String> list= new ArrayList();
	    list.add("www.flydean.com");
        for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
        Thread.sleep(1000);
    }
    private static void testMethod(List<String> list)
    {
        list.get(0);
    }
}
~~~

代码很简单，我们在循环中调用testMethod方法，而这个方法里面又调用了list.get(0)方法，来获取list的第一个参数。

单纯的看testMethod，这个方法是有可能抛出NullPointerException的，但是从整体运行的角度来看，因为我们的list是有值的， 所以不会抛出异常。

使用JIT Watcher看看运行结果：

![](https://img-blog.csdnimg.cn/20200701195852757.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

先看第二个和第三个红框，我们可以看到代码先做了参数类型的比较，然后对testMethod进行了优化，这里还可以看到get方法是内联到testMethod中的。

代码优化的部分我们找到了，那么异常处理呢？如果list为空，应该怎么处理异常呢？

第一个红框，大家可以看到是一个隐式的异常处理，它重定向到1152b4f01这个地址。

第四个红框就是这地址，表示的是异常处理的代码。

## 普通方法中的null check

我们在上面的普通方法里面加上一个null check：

~~~java
public class TestNull1 {

    public static void main(String[] args) throws InterruptedException {
        List<String> list= new ArrayList();
        list.add("www.flydean.com");
        for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
        Thread.sleep(1000);
    }

    private static void testMethod(List<String> list)
    {
        if(list !=null ){
            list.get(0);
        }
    }
}
~~~

上面我们添加了一个list ！=null的判断。

运行看下结果：

![](https://img-blog.csdnimg.cn/2020070120075074.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

相比较而言，我们可以看到，代码其实没有太多的变化，说明JIT在代码优化的过程中，将null check优化掉了。

那么null check到底在什么地方呢？ 看我标红的第二个框，这里是之前的异常处理区域，我们可以看到里面有一个ifnull，表明这里做了null check。

## 反优化的例子

上面的两个例子，我们可以看出在virtual method中，JIT对null check进行了优化。接下来我们再看一个例子，在这个例子中，我们显示的传递一个null给testMethod，然后再次循环testMethod，如下所示。

~~~java
for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
        Thread.sleep(1000);
        testMethod(null);
for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
~~~

我们看下JIT的结果：

![](https://img-blog.csdnimg.cn/20200701203135529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

看下结果有什么不同呢？

第一，ifnull现在是显示调用的，并不包含在隐式异常中。
第二，隐式异常也不见了，因为使用显示的ifnull。

## 总结

JIT会根据不同的情况，对代码进行不同程度的优化，希望大家能够喜欢。

# 第二十四章 GC的垃圾回收算法

## 简介

JVM的重要性不言而喻了，如果把java的应用程序比作一辆跑车，那么JVM就是这辆车的发动机，没有它，java程序就成了空中楼阁，无根浮萍。而在JVM中有一块内存区域叫做运行时数据区域，存储了运行时所需要的所有对象，而Heap Area则是其中最大的一块。

内存毕竟不是无限的，所以就需要一种机制来将不再使用的对象进行回收，这种机制就是今天我们要讲的GC。

## 对象的生命周期

小师妹:F师兄，你相信这个世界有轮回吗？

师兄我是一个坚定的无神论者，活在当下就好了，何必操心后面的轮回呢？

小师妹:F师兄，这个你就不懂了，意识是组成脑的原子群的一种组合模式，我们大脑的物质基础和一块石头没有什么不同。当我们掌握大脑的组合方式，然后重构，我们的意识就重现了，这就是轮回。这可是量子理论中提到的观念哦。

哇，小师妹什么时候这么厉害了，都开始探讨这么高深的话题了。F师兄我实在是跟不上节奏啊。

小师妹，F师兄，我是怕你尴尬，想引出java对象的生命周期这个话题嘛。

量子理论我不熟，java对象我还没怕过谁。

对象的生命周期其实很简单：创建，使用中，最后被销毁。

1. 创建对象

举个最简单的创建对象的例子：

~~~java
Object obj = new Object();
~~~

对象创建的时候，将会为该对象分配特定的空间。

2. 使用对象

对象创建之后，就可以被其他的对象使用，如果其他的对象有使用该对象，那么我们成为该对象被引用了。

3. 对象销毁

当一个对象没有被其他对象引用的时候，我们就称为该对象可以被回收了。在Java中，对象的回收是由GC来负责的。

## 垃圾回收算法

小师妹：F师兄，我觉得垃圾回收好像挺简单的，我们为每个对象维持一个指针计数器，每引用一次就加一，这样不就可以实现垃圾回收器了吗？

底层原理是这么一个道理，但是JVM需要一种更加高效的算法来保证垃圾回收的效率，同时也不会影响正在运行的程序。

接下来我们将会介绍一下，在JVM中比较常用几个垃圾回收算法：

### Mark and sweep

 Mark and sweep是最最简单的垃圾回收算法，简单点讲，它可以分为两个步骤：

 1. 标记live对象

标记live对象听起来很简单，就是扫描堆中的对象，看这些对象是否被引入。

但是这里有一个问题，如果是两个对象互相引用的时候，而这两个对象实际上并没有被外部的对象所引用，那么这两个对象其实是应该被回收的。所以我们还需要解决一个关键性的问题：从哪里开始扫描的问题。

JVM定义了一些Root对象，从这些对象开始，找出他们引用的对象，组成一个对象图。所有在这个图里面的对象都是有效的对象，反之不在对象图中的对象就应该被回收。有效的对象将会被Mark为alive。

这些Root对象包括：正在执行的方法中的本地对象和输入参数。活动的线程，加载类中的static字段和JNI引用。

> 注意，这种遍历其实是有个缺点的，因为为了找到对象图中哪些对象是live的，必须暂停整个应用程序，让对象变成静止状态，这样才能构建有效的对象图。后面我们会介绍更加有效的垃圾回收算法。

2. 删除对象

扫描对象之后，我们就可以将未标记的对象删除了。

删除有三种方式，第一种方式是正常删除。但是正常删除会导致内存碎片的产生。所以第二种方式就是删除之后进行压缩，以减少内存碎片。还有一种方式叫做删除拷贝，也就是说将alive的对象拷贝到新的内存区域，这样同样可以解决内存碎片的问题。

### Concurrent mark sweep (CMS) 

在讲CMS之前，我们先讲一下垃圾回收器中的Eden，Old和Survivor space几个大家应该都很熟悉的分代技术。

Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。垃圾回收的时候，会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

就这样不断的扫描，最后经过多次扫描发现任然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

![](https://img-blog.csdnimg.cn/20200525214231730.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

> 之后要讲的几个垃圾回收器，除了ZGC，其他都使用的是分代的技术。

好了，现在继续讲CMS，CMS是mark and swap的升级版本，它使用多个线程来对heap区域进行扫描，从而提升效率。

CMS在Young Generation中使用的是mark-copy，而在Old Generation主要使用的是mark-sweep。

使用CMS的命令很简单：

~~~java
-XX:+UseConcMarkSweepGC
~~~

![](https://img-blog.csdnimg.cn/20200525221146596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上面是列出的一些CMS的调优参数。

### Serial garbage collection

Serial garbage collection使用单一的线程来进行垃圾回收操作，其好处就是不需要和其他的线程进行交互。如果你是单核的CPU，那么最好就是选择Serial garbage collection，因为你不能充分利用多核的好处。同样的它也常常用在比较小型的项目中。

Serial garbage collection在Young Generation中使用的是mark-copy，而在Old Generation主要使用的是 mark-sweep-compact。

下面是开启命令：

~~~java
-XX:+UseSerialGC
~~~

### Parallel garbage collection

和serial GC类似，它在Young Generation中使用的是mark-copy，而在Old Generation主要使用的是 mark-sweep-compact。不同的是它是并行的。

可以通过下面的命令来指定并发的线程：

~~~java
-XX:ParallelGCThreads=N
~~~

如果你是多核处理器，那么Parallel GC可能是你的选择。

> Parallel GC是JDK8中的默认GC。而在JDK9之后， G1是默认的GC。

使用下面的命令来开启Parallel GC：

~~~java
-XX:+UseParallelGC
~~~

### G1 garbage collection

为什么叫G1呢，G1=Garbage First，它是为替换CMS而生的，最早出现在java7中。

G1将heap区域划分成为多个更小的区域，每个小区域都被标记成为young generation 或者old generation。从而运行GC在更小的范围里运行，而不是影响整个heap区域。

可以使用下面的命令来开启：

~~~java
-XX:+UseG1GC 
~~~

###  Z Garbage Collection

ZGC是一个可扩展的，低延迟的GC。ZGC是并发的，而且不需要停止正在运行的线程。

使用下面的命令来开启：

~~~java
 -XX:+UseZGC 
~~~

ZGC是在JDK11中被引入的。

## 怎么选择

小师妹：F师兄，你讲了这么多个GC，到底我该用哪个呢？

高射炮不能用来打蚊子，所以选择合适的GC才是最终要的。这里F师兄给你几个建议：

1. 如果你的应用程序内存本来就很小，那么使用serial collector ： -XX:+UseSerialGC.

2. 如果你的程序运行在单核的CPU上，并且也没有程序暂停时间的限制，那么还是使用serial collector ： -XX:+UseSerialGC.

3. 如果对峰值期的性能要求比较高，但是对程序暂停时间没多大的要求，那么可以使用 parallel collector： -XX:+UseParallelGC。

4. 如果更加关注响应时间，并且GC的对程序的暂停时间必须要小，那么可以使用-XX:+UseG1GC。

5. 如果响应时间非常重要，并且你在使用大容量的heap空间，那么可以考虑使用ZGC： -XX:UseZGC。

## 总结

本文介绍了几种GC的算法，大家可以根据需要选用。

# 第二十五章 JVM中的Safepoints

## 简介

java程序员都听说过GC，大家也都知道GC的目的是扫描堆空间，然后将那些标记为删除的对象从堆空间释放，以提升可用的堆空间。今天我们会来探讨一下隐藏在GC背后的一个小秘密Safepoints。


## GC的垃圾回收器

小师妹：F师兄，GC的垃圾回收器的种类为什么会有这么多呀？使用起来不是很麻烦。并且我听说CMS在JDK9zhong已经被废弃了。

小师妹，这么多垃圾回收器实际是在JVM的发展过程中建立起来的，在之前的文章中，我们讲到了目前的GC回收器有这样几种。

1. 基于分代技术的回收器

Concurrent mark sweep (CMS) ，CMS是mark and swap的升级版本，它使用多个线程来对heap区域进行扫描，从而提升效率。

> 由于CMS的参数复杂性和性能问题，CMS已经在JDK9中被废弃了。

Serial garbage collection，使用单一的线程来进行垃圾回收操作，其好处就是不需要和其他的线程进行交互。如果你是单核的CPU，那么最好就是选择Serial garbage collection，因为你不能充分利用多核的好处。同样的它也常常用在比较小型的项目中。

Parallel garbage collection，如果你是多核处理器，那么Parallel GC可能是你的选择。

> Parallel GC是JDK8中的默认GC。而在JDK9之后， G1是默认的GC。

G1 garbage collection,G1=Garbage First，它是为替换CMS而生的，最早出现在java7中。

G1将heap区域划分成为多个更小的区域，每个小区域都被标记成为young generation 或者old generation。从而运行GC在更小的范围里运行，而不是影响整个heap区域。

2. 非基于分代技术的回收器

Z Garbage Collection，ZGC是一个可扩展的，低延迟的GC。ZGC是并发的，而且不需要停止正在运行的线程。

> ZGC是在JDK11中引入的。

当然还有正在研发中的其他GC。

## 分代回收器中的问题

小师妹：F师兄，分代回收器不好吗？为什么还有新的ZGC等基于非分代技术的回收器？

分代垃圾回收器中有一个非常常见的现象就是"Stop The World"。什么是Stop the world呢？

就是说在GC的时候，为了进行垃圾回收，需要所有的线程都要暂停执行。所有的线程都暂停执行。 

当然G1虽然是基于分代技术，但是G1实际上是不会"Stop The World"的。

JVM定义了一些Root对象，从这些对象开始，找出他们引用的对象，组成一个对象图。所有在这个图里面的对象都是有效的对象，反之不在对象图中的对象就应该被回收。有效的对象将会被Mark为alive。

这些Root对象包括：正在执行的方法中的本地对象和输入参数。活动的线程，加载类中的static字段和JNI引用。

## safepoints

为了实现STW的功能，JVM需要提供一个机制，让所有的线程可以在某一个时刻同时停下来。这个停下来的时刻就叫做safepoints。

> 注意，这些停下来的线程不包括运行native code的线程。因为这些线程是不属于JVM管理的。

JVM中的代码执行其实有两种方式，一种是JIT编译成为机器码，一种是解释执行。

在JIT中，直接将检查代码编译进入了机器码中。通过设置相应的标记位，从而在线程运行的过程中执行暂停的指令。

还是举一个上篇文章中我们提到的JMH的例子：

~~~java
@Benchmark
    public void test1() {
        int length = array.length;
        for (int i = 0; i < length; i=i+1)
            array[i] ++;
    }
~~~

我们看一下它的assembly code：

![](https://img-blog.csdnimg.cn/20200703202258733.png)

可以看到其中有个test的指令，这个test指令就是生成的safe points。

通过设置标志位，就可以在线程运行时执行暂停操作。

如果是解释执行的话，JVM保存了两个字节码的调度table，当需要safepoint的时候，JVM就进行table的切换，从而开启safepoint。

## safepoint一般用在什么地方

一般情况下，GC，JIT的反代码优化，刷新code cache,类重定义 ,偏向锁撤销和其他的一些debug操作。

我们可以通过使用-XX:+PrintGCApplicationStoppedTime来print safepints的暂停时间。

-XX:+PrintSafepointStatistics –XX:PrintSafepointStatisticsCount=1这两个参数可以强制JVM打印safepoint的一些统计信息。

## 总结

Safepoint是垃圾回收中一个非常重要的概念，希望大家能够有所了解。

# 第二十六章 再谈java中的safepoint

## safepoint是什么

java程序里面有很多很多的java线程，每个java线程又有自己的stack，并且共享了heap。这些线程一直运行呀运行，不断对stack和heap进行操作。

这个时候如果JVM需要对stack和heap做一些操作该怎么办呢？

比如JVM要进行GC操作，或者要做heap dump等等，这时候如果线程都在对stack或者heap进行修改，那么将不是一个稳定的状态。GC直接在这种情况下操作stack或者heap，会导致线程的异常。

怎么处理呢？

这个时候safepoint就出场了。

safepoint就是一个安全点，所有的线程执行到安全点的时候就会去检查是否需要执行safepoint操作，如果需要执行，那么所有的线程都将会等待，直到所有的线程进入safepoint。

然后JVM执行相应的操作之后，所有的线程再恢复执行。

## safepoint的例子

我们举个例子，一般safepoint比如容易出现在循环遍历的情况，还是使用我们之前做null测试用的例子：

~~~java
public class TestNull {

    public static void main(String[] args) throws InterruptedException {
        List<String> list= new ArrayList();
	list.add("www.flydean.com");
        for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
        Thread.sleep(1000);
    }

    private static void testMethod(List<String> list)
    {
        list.get(0);
    }
}
~~~

运行结果如下：

![](https://img-blog.csdnimg.cn/20200703225806755.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

标红的就是传说中的safepoint。

## 线程什么时候会进入safepoint

那么线程什么时候会进入safepoint呢？

一般来说，如果线程在竞争锁被阻塞，IO被阻塞，或者在等待获得监视器锁状态时，线程就处于safepoint状态。

如果线程再执行JNI代码的哪一个时刻，java线程也处于safepoint状态。因为java线程在执行本地代码之前，需要保存堆栈的状态，让后再移交给native方法。

如果java的字节码正在执行，那么我们不能判断该线程是不是在safepint上。

## safepoint是怎么工作的

如果你使用的是hotspot JVM，那么这个safepoint是一个全局的safepoint，也就是说执行Safepoint需要暂停所有的线程。

如果你使用的是Zing，那么可以在线程级别使用safepoint。

我们可以看到生成的汇编语言中safepoint其实是一个test命令。

test指向的是一个特殊的内存页面地址，当JVM需要所有的线程都执行到safepint的时候，就会对该页面做一个标记。从而通知所有的线程。

我们再用一张图来详细说明：

![](https://img-blog.csdnimg.cn/20200703233056728.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

thread1在收到设置safepoint之前是一直执行的，在收到信号之后还会执行一段时间，然后到达Safepint暂停执行。

thread2先执行了一段时间，然后因为CPU被抢夺，空闲了一段时间，在这段时间里面，thread2收到了设置safepoint的信号，然后thread2获得执行权力，接着继续执行，最后到达safepoint。

thread3是一个native方法，将会一直执行，知道safepoint结束。

thread4也是一个native方法，它和thread3的区别就在于，thread4在safepoint开始和结束之间结束了，需要将控制器转交给普通的java线程，因为这个时候JVM在执行Safepoint的操作，所以任然需要暂停执行。

在HotSpot VM中，你可以在汇编语言中看到safepoint的两种形式：'{poll}' 或者 '{poll return}' 。

## 总结

本文详细的讲解了JVM中Safepoint的作用，希望大家能够喜欢。

# 第二十七章 用control+break解决线程死锁问题

## 简介

如果我们在程序中遇到线程死锁的时候，该怎么去解决呢？

本文将会从一个实际的例子出发，一步一步的揭开java问题解决的面纱。

## 死锁的代码

写过java多线程程序的人应该都知道，多线程中一个很重要的事情就是状态的同步，但是在状态同步的过程中，一不小心就有可能会导致死锁的问题。

一个最简单的死锁情况就是thread1占有资源1，然后又要去获取资源2. 而thread2占有资源2，又要去获取资源1的情况。

举个具体的例子：

~~~java
public class TestDeadLock {
    public static Object lock1= new Object();
    public static Object lock2= new Object();
    public static void main(String[] args) {
        Runnable runnable1= ()-> {
            System.out.println("in lock1");
            synchronized(lock1){
                System.out.println("Lock1 lock obj1");
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized(lock2){
                    System.out.println("Lock1 lock obj2");
                }
            }
        };

        Runnable runnable2= ()-> {
            System.out.println("in lock2");
            synchronized(lock2){
                System.out.println("Lock2 lock obj2");
                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized(lock1){
                    System.out.println("Lock2 lock obj1");
                }
            }
        };

        Thread a = new Thread(runnable1);
        Thread b = new Thread(runnable2);
        a.start();
        b.start();
    }
}
~~~

我们运行上面的代码：

~~~java
in lock1
Lock1 lock obj1
in lock2
Lock2 lock obj2
~~~

发送了锁循环等待的情况，程序执行不下去了，发送了死锁。

## control+break命令

在代码很简单的情况下，我们很容易就能分析出来死锁的原因，但是如果是在一个非常庞大的线上项目的时候，分析代码就没有那么容易了。

怎么做呢？

今天教给大家一个方法，使用control+break命令。

control+break在linux表示的是Control+backslash，而在Windows下面就是Control+Break按钮。

当然，还有一个更加通用的就是使用：

kill -QUIT pid命令。

我们用jps命令获取到执行java程序的进程id，然后执行kill -QUIT命令。

执行完毕，我们会发现运行的java进程会输出一些额外的日志，这些额外的日志就是我们找出死锁的关键因素。

注意，这个kill命令并不会终止程序的运行。

输出的内容比较多，我们一部分一部分的讲解。

### Full thread dump

日志的第一部分就是Full thread dump，包含了JVM中的所有线程的状态信息。

我们看一下我们代码中的两个关键线程信息：

~~~java
"Thread-0" #13 prio=5 os_prio=31 cpu=4.86ms elapsed=230.16s tid=0x00007fc926061800 nid=0x6403 waiting for monitor entry  [0x0000700008d6a000]
   java.lang.Thread.State: BLOCKED (on object monitor)
	at com.flydean.TestDeadLock.lambda$main$0(TestDeadLock.java:21)
	- waiting to lock <0x0000000787e868f0> (a java.lang.Object)
	- locked <0x0000000787e868e0> (a java.lang.Object)
	at com.flydean.TestDeadLock$$Lambda$14/0x0000000800b69840.run(Unknown Source)
	at java.lang.Thread.run(java.base@14.0.1/Thread.java:832)

"Thread-1" #14 prio=5 os_prio=31 cpu=4.32ms elapsed=230.16s tid=0x00007fc924869800 nid=0x6603 waiting for monitor entry  [0x0000700008e6d000]
   java.lang.Thread.State: BLOCKED (on object monitor)
	at com.flydean.TestDeadLock.lambda$main$1(TestDeadLock.java:36)
	- waiting to lock <0x0000000787e868e0> (a java.lang.Object)
	- locked <0x0000000787e868f0> (a java.lang.Object)
	at com.flydean.TestDeadLock$$Lambda$15/0x0000000800b69c40.run(Unknown Source)
	at java.lang.Thread.run(java.base@14.0.1/Thread.java:832)
~~~

上面的输出列出了线程名字，线程的优先级，cpu时间，是否是daemon线程，线程ID，线程状态等有用的信息。

看到上面的输出，我们看到两个线程都是处于BLOCKED状态，都在等待object monitor。

还记得线程的几个状态吗？ 我们再来复习一下。


![](https://img-blog.csdnimg.cn/20200704111005149.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

### 死锁检测

接下来的部分就是我们最关心的死锁检测了。

~~~java
Found one Java-level deadlock:
=============================
"Thread-0":
  waiting to lock monitor 0x00007fc926807e00 (object 0x0000000787e868f0, a java.lang.Object),
  which is held by "Thread-1"

"Thread-1":
  waiting to lock monitor 0x00007fc926807f00 (object 0x0000000787e868e0, a java.lang.Object),
  which is held by "Thread-0"

Java stack information for the threads listed above:
===================================================
"Thread-0":
	at com.flydean.TestDeadLock.lambda$main$0(TestDeadLock.java:21)
	- waiting to lock <0x0000000787e868f0> (a java.lang.Object)
	- locked <0x0000000787e868e0> (a java.lang.Object)
	at com.flydean.TestDeadLock$$Lambda$14/0x0000000800b69840.run(Unknown Source)
	at java.lang.Thread.run(java.base@14.0.1/Thread.java:832)
"Thread-1":
	at com.flydean.TestDeadLock.lambda$main$1(TestDeadLock.java:36)
	- waiting to lock <0x0000000787e868e0> (a java.lang.Object)
	- locked <0x0000000787e868f0> (a java.lang.Object)
	at com.flydean.TestDeadLock$$Lambda$15/0x0000000800b69c40.run(Unknown Source)
	at java.lang.Thread.run(java.base@14.0.1/Thread.java:832)

Found 1 deadlock.

~~~

上面的日志我们可以很明显的看出来，两个线程分别获得了对方需要的锁，所以导致了死锁。

同时还详细的列出了thread stack的信息，供我们分析。

> 如果我们添加了参数-XX:+PrintConcurrentLocks，还会输出各个线程的获得的concurrent lock信息。

### Heap信息

最后一部分是Heap的统计信息：

~~~java
Heap
 garbage-first heap   total 133120K, used 3888K [0x0000000780000000, 0x0000000800000000)
  region size 1024K, 4 young (4096K), 0 survivors (0K)
 Metaspace       used 1122K, capacity 4569K, committed 4864K, reserved 1056768K
  class space    used 108K, capacity 412K, committed 512K, reserved 1048576K
~~~

> 如果我们添加了-XX:+PrintClassHistogram命令，还可以额外的输出class直方图统计信息。

## 总结

上面就是使用Control+Break命令来分析java死锁问题的具体例子，希望大家能够喜欢。

# 第二十八章 使用JFR解决内存泄露

## 简介

虽然java有自动化的GC，但是还会有内存泄露的情况。当然java中的内存泄露跟C++中的泄露不同。

在C++中所有被分配的内存对象都需要要程序员手动释放。但是在java中并不需要这个过程，一切都是由GC来自动完成的。那么是不是java中就没有内存泄露了呢？

要回答这个问题我们首先需要界定一下什么是内存泄露。如果说有时候我们不再使用的对象却不能被GC释放的话，那么就可以说发生了内存泄露。

内存泄露的主要原因就是java中的对象生命周期有长有短。如果长生命周期的对象引用了短生命周期的对象，就有可能造成事实上的内存泄露。

## 一个内存泄露的例子

我们举一个内存泄露的例子，先定义一个大对象：

~~~java
public class KeyObject {
    List<String> list = new ArrayList<>(200);
}
~~~

然后使用它：

~~~java
public class TestMemoryLeak {

    public static HashSet<Object> hashSet= new HashSet();

    public static void main(String[] args) throws InterruptedException {
        boolean flag= true;
        while(flag){
            KeyObject keyObject= new KeyObject();
            hashSet.add(keyObject);
            keyObject=null;
            Thread.sleep(1);
        }
        System.out.println(hashSet.remove(new KeyObject()));
    }
}
~~~

在这个例子中，我们将new出来的KeyObject对象放进HashSet中。
然后将keyObject置为空。

但是因为类变量hashSet还保留着对keyObject的引用，所以keyObject对象并不会被回收。

> 注意，最后一行我们加了一个hashSet.remove的代码，来使用类变量hashSet。
> 为什么要这样做呢？这样做是为了防止JIT对代码进行优化，从而影响我们对内存泄露的分析。

## 使用JFR和JMC来分析内存泄露

Flight Recorder(JFR)主要用来记录JVM的事件，我们可以从这些事件中分析出内存泄露。

可以通过下面的指令来开启JFR：

~~~java
java -XX:StartFlightRecording
~~~

当然我们也可以使用java神器jcmd来开启JFR：

~~~java
jcmd pid JFR.dump filename=recording.jfr path-to-gc-roots=true
~~~

这里我们使用JMC来图形化分析一下上面的例子。

![](https://img-blog.csdnimg.cn/20200704192328179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

开启JMC，找到我们的测试程序，打开飞行记录器。

![](https://img-blog.csdnimg.cn/20200704192538997.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

可以看到我们的对象在飞行记录器期间分配了4MB的内存，然后看到整体的内存使用量是稳步上升的。

> 我们什么时候知道会有内存泄露呢？最简单的肯定就是OutOfMemoryErrors，但是有些很隐蔽的内存泄露会导致内存使用缓步上涨，这时候就需要我们进行细致的分析。

通过分析，我们看到内存使用在稳步上涨，这其实是很可疑的。

接下来我们通过JVM的OldObjectSample事件来分析一下。

## OldObjectSample

OldObjectSample就是对生命周期比较长的对象进行取样，我们可以通过研究这些对象，来检查潜在的内存泄露。

![](https://img-blog.csdnimg.cn/20200704203127379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里我们关注一下事件浏览器中的Old Object Sample事件，我们可以在左下方看到事件的详情。

或者你可以使用jfr命令直接将感兴趣的事件解析输出：

~~~java
jfr print --events OldObjectSample flight_recording_1401comflydeanTestMemoryLeak89268.jfr   > /tmp/jfrevent.log
~~~

我们看一个具体的输出Sample：

~~~java
jdk.OldObjectSample {
  startTime = 19:53:25.607
  allocationTime = 19:50:51.924
  objectAge = 2 m 34 s
  lastKnownHeapUsage = 3.5 MB
  object =  [
    java.lang.Object[200]
  ]
  arrayElements = 200
  root = N/A
  eventThread = "main" (javaThreadId = 1)
  stackTrace = [
    java.util.ArrayList.<init>(int) line: 156
    com.flydean.KeyObject.<init>() line: 11
    com.flydean.TestMemoryLeak.main(String[]) line: 17
  ]
}
~~~

lastKnownHeapUsage是heap的使用大小，从日志中我们可以看到这个值是一直在增加的。

allocationTime表示的是这个对象分配的时间。

startTime表示的是这个对象被dump的时间。

object表示的是分配的对象。

stackTrace表示的是这个对象被分配的stack信息。

> 注意，如果需要展示stackTrace信息，需要开启-XX:StartFlightRecording:settings=profile选项。

从上面的日志我们可以分析得出，main方法中的第17行，也就是 KeyObject keyObject= new KeyObject(); 在不断的创建新的对象。

从而我们可以进行更深层次的分析，最终找到内存泄露的原因。

## 总结

本文通过JFR和JMC的使用，介绍了如何分析内存泄露。希望大家能够喜欢。

# 第二十九章 分析OutOfMemoryError异常

## 简介

java.lang.OutOfMemoryError应该java应用程序中非常常见的一个的错误了。

那么OutOfMemoryError产生的原因是什么呢？我们怎么去查找相应的错误呢？一起来看看吧。

## OutOfMemoryError

先看一下OutOfMemoryError的定义，OutOfMemoryError继承自
VirtualMachineError，它是Error的一种，表示的是应用程序无法处理的异常，一般情况下会导致虚拟机退出。

~~~java
public class OutOfMemoryError extends VirtualMachineError {
    @java.io.Serial
    private static final long serialVersionUID = 8228564086184010517L;

    /**
     * Constructs an {@code OutOfMemoryError} with no detail message.
     */
    public OutOfMemoryError() {
        super();
    }

    /**
     * Constructs an {@code OutOfMemoryError} with the specified
     * detail message.
     *
     * @param   s   the detail message.
     */
    public OutOfMemoryError(String s) {
        super(s);
    }
}
~~~

一般情形下，如果heap没有更多的空间来分配对象，就会抛出OutOfMemoryError。

还有一种情况是没有足够的native memory来加载java class。

在极少数情况下，如果花费大量时间进行垃圾回收并且只释放了很少的内存，也有可能引发java.lang.OutOfMemoryError。

如果发生OutOfMemoryError，同时会输出相应的stack trace信息。

下面我们分析一下各个不同的OutOfMemoryError。

## java.lang.OutOfMemoryError: Java heap space

Java heap space表示的是新对象不能在java heap中分配。

如果遇到这种问题，第一个要想到的解决方法就是去看配置的heap大小是不是太小了。

当然，如果是一个一直都在运行的程序，突然间发生这种问题就要警惕了。因为有可能会存在潜在的内存泄露。需要进一步分析。

还有一种情况，如果java对象实现了finalize方法，那么该对象在垃圾回收的时候并不会立刻被回收。而是放到一个finalization队列中。

这个队列会由终结器守护线程来执行。如果终结器守护线程的执行速度比对象放入终结器队列中的速度要慢的话，就会导致java对象不能被及时回收。

如果应用程序创建了高优先级的线程，那么高优先级的线程将有可能会导致对象被放入finalization队列的速度比终结器守护线程的处理速度慢。

## java.lang.OutOfMemoryError: GC Overhead limit exceeded

GC overhead limit exceeded表示的是GC一直都在运行，从而导致java程序本身执行非常慢。

如果一个java程序98%的时间都在做GC操作，但是只恢复了2%的heap空间，并且持续5次。那么java.lang.OutOfMemoryError将会被抛出。

可以使用下面的参数来关闭这个功能。

~~~java
-XX:-UseGCOverheadLimit
~~~

## java.lang.OutOfMemoryError: Requested array size exceeds VM limit

这个错误的意思是，要分配的array比heap size大。

比如说设置的最大heap大小是256M，但是分配了一个300M的数组，就会出现这个问题。

## java.lang.OutOfMemoryError: Metaspace

从JDK8之后，Metaspace已经移到了java的本地内存空间中。如果Metaspace超出了限制的大小，那么java.lang.OutOfMemoryError也会抛出。

Metaspace的空间大小可以通过MaxMetaSpaceSize来设置。

## java.lang.OutOfMemoryError: request size bytes for reason. Out of swap space?

当本地堆分配失败并且本地堆即将耗尽的时候就会报这个异常。

## java.lang.OutOfMemoryError: Compressed class space

在64位的平台，对象指针可以用32位表示（对象指针压缩）。

对象指针压缩可以通过：

~~~java
UseCompressedClassPointers
~~~

来启用，默认这个参数是开启的。

我们可以使用CompressedClassSpaceSize来设置指针压缩空间的大小。

> 注意，只有klass元信息是存放在CompressedClassSpaceSize设置的空间中的，而其他的元信息都是存放在Metaspace中的。

## OutOfMemoryError: reason stack_trace_with_native_method

这个错误表示本地方法遇到分配失败。

遇到这种问题可能需要操作系统的本地调试工具来解决。

## 总结

本文介绍了OutOfMemoryError的不同种类，希望大家能够有所收获。

# 第三十章 使用JFR分析性能问题

## 简介

java程序的性能问题分析是一个很困难的问题。尤其是对于一个非常复杂的程序来说，分析起来更是头疼。

还好JVM引入了JFR，可以通过JFR来监控和分析JVM的各种事件。通过这些事件的分析，我们可以找出潜在的问题。

今天我们就来介绍一下对java性能分析比较重要的一些JFR事件。

## GC性能事件

一般来说，GC会对java程序的性能操作产生比较重要的影响。我们可以使用jfr监控jdk.GCPhasePause事件。 

下面是一个jdk.GCPhasePause的例子：

~~~java
jfr print --events jdk.GCPhasePause flight_recording_1401comflydeanTestMemoryLeak89268.jfr
~~~

输出结果：

~~~java
jdk.GCPhasePause {
  startTime = 19:51:49.798
  duration = 41.1 ms
  gcId = 2
  name = "GC Pause"
}
~~~

通过GCPhasePause事件，我们可以统计总的GC pause时间和平均每一次GC pause的时间。

一般来说GC是在后台执行的，所以GC本身的执行时间我们并不需要关注，因为这并不会影响到程序的性能。我们需要关注的是应用程序因为GC暂停的时间。

考虑下面两种情况，第一种单独的GC导致GC pause时间过长。第二种是总的GC pause时间过长。

如果是第一种情况，那么可能需要考虑换一个GC类型，因为不同的GC类型在pause时间和吞吐量的平衡直接会有不同的处理。同时我们需要减少finalizers的使用。

如果是第二种情况，我们可以从下面几个方面来解决。

* 增加heap空间大小。heap空间越大，GC的间隔时间就越长。总的GC pause时间就会越短。

* 尽量减少tmp对象的分配。我们知道为了提升多线程的性能，JVM会使用TLAB技术。一般来说小对象会分配在TLAB中，但如果是大对象，则会直接分配在heap空间中。但是大部分对象都是在TLAB中分配的。所以我们可以同时关注TLAB和TLAB之外的两个事件：jdk.ObjectAllocationInNewTLAB和dk.ObjectAllocationOutsideTLAB。

* 减少分配频率。我们可以通过jdk.ThreadAllocationStatistics来分析。

## 同步性能

在多线程环境中，因为多线程会竞争共享资源，所以对资源的同步，或者锁的使用都会影响程序的性能。

我们可以监控jdk.JavaMonitorWait事件。

~~~java
jfr print --events jdk.JavaMonitorWait flight_recording_1401comflydeanTestMemoryLeak89268.jfr
~~~

我们看一个结果：

~~~java
jdk.JavaMonitorWait {
  startTime = 19:51:25.395
  duration = 2 m 0 s
  monitorClass = java.util.TaskQueue (classLoader = bootstrap)
  notifier = N/A
  timeout = 2 m 0 s
  timedOut = true
  address = 0x7FFBB7007F08
  eventThread = "JFR Recording Scheduler" (javaThreadId = 17)
  stackTrace = [
    java.lang.Object.wait(long)
    java.util.TimerThread.mainLoop() line: 553
    java.util.TimerThread.run() line: 506
  ]
}
~~~

通过分析JavaMonitorWait事件，我们可以找到竞争最激烈的锁，从而进行更深层次的分析。

## IO性能

如果应用程序有很多IO操作，那么IO操作也是会影响性能的关键一环。

我们可以监控两种IO类型：socket IO和File IO。

相对应的事件有：dk.SocketWrite，jdk.SocketRead，jdk.FileWrite，jdk.FileRead。

## 代码执行的性能

代码是通过CPU来运行的，如果CPU使用过高，也可能会影响到程序的性能。

我们可以通过监听jdk.CPULoad事件来对CPULoad进行分析。

~~~java
jfr print --events jdk.CPULoad flight_recording_1401comflydeanTestMemoryLeak89268.jfr
~~~

看下运行结果：

~~~java
jdk.CPULoad {
  startTime = 19:53:25.519
  jvmUser = 0.63%
  jvmSystem = 0.37%
  machineTotal = 20.54%
}
~~~

如果jvm使用的cpu比较少，但是整个machine的CPU使用率比较高，这说明了有其他的程序在占用CPU。

如果JVM自己的CPU使用就很高的话，那么就需要找到这个占用CPU的线程进行进一步分析。

## 其他有用的event

除了上面提到的event之外，还有一些其他有用的我们可以关注的event。

比如线程相关的：jdk.ThreadStart，jdk.ThreadEnd，jdk.ThreadSleep，jdk.ThreadPark。

如果你使用JMC，那么可以很直观的查看JFR的各种事件。

![](https://img-blog.csdnimg.cn/202007052319349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

所以推荐大家使用JMC。

# 第三十一章  GC调优到底是什么

## 简介

我们经常会听到甚至需要自己动手去做GC调优。那么GC调优的目的到底是什么呢？让程序跑得更快？让GC消耗更少的资源？还是让程序更加稳定？

带着这些疑问来读一下这篇文章，将会的到一个系统的甚至是不一样的结果。

## 那些GC的默认值

其实GC或者说JVM的参数非常非常的多，有控制内存使用的：

![](https://img-blog.csdnimg.cn/20200706092911625.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

有控制JIT的：

![](https://img-blog.csdnimg.cn/20200706092938357.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

有控制分代比例的,也有控制GC并发的：

![](https://img-blog.csdnimg.cn/20200706093012995.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

当然，大部分的参数其实并不需要我们自行去调整，JVM会很好的动态帮我们设置这些变量的值。

如果我们不去设置这些值，那么对GC性能比较有影响的参数和他们的默认值有哪些呢？

### GC的选择

我们知道JVM中的GC有很多种，不同的GC选择对java程序的性能影响还是比较大的。

在JDK9之后，G1已经是默认的垃圾回收器了。

![](https://img-blog.csdnimg.cn/2020070609331112.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

我们看一下G1的调优参数。

G1是基于分代技术的，其实JVM还在开发一些不再基于分代技术的GC算法，比如ZGC，我们可以根据需要来选择适合我们的GC算法。

### GC的最大线程个数

GC是由专门的GC线程来执行的，并不是说GC线程越多越好，这个默认线程的最大值是由heap size和可用的CPU资源动态决定的。

当然你可以使用下面两个选项来修改GC的线程：

~~~java
 -XX:ParallelGCThreads=threads 设置STW的垃圾收集线程数

 -XX:ConcGCThreads = n 设置并行标记线程的数量
~~~

一般情况下ConcGCThreads可以设置为ParallelGCThreads的1/4。

### 初始化heap size

默认情况下加初始化的heap size是物理内存的1/64。 

你可以使用

~~~java
 -XX:InitialHeapSize=size
~~~

来重新设置。

### 最大的heap size

默认情况下最大的heap size是物理内存的1/4。

你可以使用：

~~~java
 -XX:MaxHeapSize
~~~

来重新设置。

### 分层编译技术

默认情况下分层编译技术是开启的。你可以使用：

~~~java
 -XX:-TieredCompilation
~~~

来关闭分层编译。如果启用了分层编译，那么可能需要关注JIT中的C1和C2编译器带来的影响。

## 我们到底要什么

> 鱼，我所欲也，熊掌亦我所欲也；二者不可得兼，舍鱼而取熊掌者也。--孟子

java程序在运行过程中，会发生很多次GC，那么我们其实是有两种统计口径：

1. 平均每次GC执行导致程序暂停的时间（Maximum Pause-Time Goal）。
2. 总的花费在GC上的时间和应用执行时间的比例（Throughput Goal）。

### 最大暂停时间

单次GC的暂停时间是一个统计平均值，因为单次GC的时间其实是不可控的，但是取了平均值，GC就可以动态去调整heap的大小，或者其他的一些GC参数，从而保证每次GC的时间不会超过这个平均值。

我们可以通过设置：

~~~java
-XX:MaxGCPauseMillis=<nnn>
~~~

来控制这个值。

不管怎么设置这个参数，总体需要被GC的对象肯定是固定的，如果单次GC暂停时间比较短，可能会需要减少heap size的大小，那么回收的对象也比较少。这样就会导致GC的频率增加。从而导致GC的总时间增加，影响程序的Throughput。

### 吞吐率

吞吐率是由花费在GC上的时间和应用程序上的时间比率来决定的。

我们可以通过设置：

~~~java
-XX:GCTimeRatio=nnn
~~~

来控制。

如果没有达到throughput的目标，那么GC可能会去增加heap size，从而减少GC的执行频率。但是这样会增加单次的Maximum Pause-Time。

如果throughput和maximum pause-time的参数同时都设置的话，JVM会去尝试去动态减少heap size的大小，直到其中的一个目标不能满足为止。

相对而言，G1更加偏重于最大暂停时间，而ZGC更加偏重于吞吐率。

# 第三十二章 详解java object对象在heap中的结构

## 简介

在之前的文章中，我们介绍了使用JOL这一神器来解析java类或者java实例在内存中占用的空间地址。

今天，我们会更进一步，剖析一下在之前文章中没有讲解到的更深层次的细节。一起来看看吧。

## 对象和其隐藏的秘密

java.lang.Object大家应该都很熟悉了，Object是java中一切对象的鼻祖。

接下来我们来对这个java对象的鼻祖进行一个详细的解剖分析，从而理解JVM的深层次的秘密。

工具当然是使用JOL：

~~~java
@Slf4j
public class JolUsage {

    @Test
    public void useJol(){
        log.info("{}", VM.current().details());
        log.info("{}", ClassLayout.parseClass(Object.class).toPrintable());
        log.info("{}", ClassLayout.parseInstance(new Object()).toPrintable());
    }
}
~~~

代码很简单，我们打印JVM的信息，Object class和一个新的Object实例的信息。

看下输出：

~~~java
[main] INFO com.flydean.JolUsage - ## Running 64-bit HotSpot VM.
## Using compressed oop with 3-bit shift.
## Using compressed klass with 3-bit shift.
## WARNING | Compressed references base/shifts are guessed by the experiment!
## WARNING | Therefore, computed addresses are just guesses, and ARE NOT RELIABLE.
## WARNING | Make sure to attach Serviceability Agent to get the reliable addresses.
## Objects are 8 bytes aligned.
## Field sizes by type: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]
## Array element sizes: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]

10:27:32.311 [main] INFO com.flydean.JolUsage - java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0    12        (object header)                           N/A
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total

10:27:32.312 [main] INFO com.flydean.JolUsage - java.lang.Object object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0     4        (object header)                           05 00 00 00 (00000101 00000000 00000000 00000000) (5)
      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
      8     4        (object header)                           86 06 00 00 (10000110 00000110 00000000 00000000) (1670)
     12     4        (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
~~~

从上面的结果我们知道，在64位的JVM中，一个Object实例是占用16个字节。 

因为Object对象中并没有其他对象的引用，所以我们看到Object对象只有一个12字节的对象头。剩下的4个字节是填充位。

## Object对象头

那么这12字节的对象头是做什么用的呢？

如果想要深入了解这12字节的对象头，当然是要去研读一下JVM的源码：src/share/vm/oops/markOop.hpp。

有兴趣的小伙伴可以去看看。如果没有兴趣，没关系，这里给大家一个张总结的图：

![](https://img-blog.csdnimg.cn/20200618121615778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

javaObject对象的对象头大小根据你使用的是32位还是64位的虚拟机的不同，稍有变化。这里我们使用的是64位的虚拟机为例。

Object的对象头，分为两部分，第一部分是Mark Word，用来存储对象的运行时数据比如：hashcode，GC分代年龄，锁状态，持有锁信息，偏向锁的thread ID等等。

在64位的虚拟机中，Mark Word是64bits，如果是在32位的虚拟机中Mark Word是32bits。

第二部分就是Klass Word，Klass Word是一个类型指针，指向class的元数据，JVM通过Klass Word来判断该对象是哪个class的实例。

且慢！

有的小伙伴可能发现了问题，之前我们用JOL解析Object对象的时候，Object head大小是12字节，也就是96bits，这里怎么写的是12bytes？

![](https://img-blog.csdnimg.cn/20200618122419596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

没错，如果没有开启COOPs就是128bits，如果开启了COOPs，那么Klass Word的大小就从64bits降到了32bits。

还记得我们之前讲的COOPs吗？

COOPs就是压缩对象指针技术。

对象指针用来指向一个对象，表示对该对象的引用。通常来说在64位机子上面，一个指针占用64位，也就是8个字节。而在32位机子上面，一个指针占用32位，也就是4个字节。

实时上，在应用程序中，这种对象的指针是非常非常多的，从而导致如果同样一个程序，在32位机子上面运行和在64位机子上面运行占用的内存是完全不同的。64位机子内存使用可能是32位机子的1.5倍。

而压缩对象指针，就是指把64位的指针压缩到32位。

怎么压缩呢？64位机子的对象地址仍然是64位的。压缩过的32位存的只是相对于heap base address的位移。

我们使用64位的heap base地址+ 32位的地址位移量，就得到了实际的64位heap地址。

对象指针压缩在Java SE 6u23 默认开启。在此之前，可以使用-XX:+UseCompressedOops来开启。

## 数组对象头

java中有一个非常特别的对象叫做数组，数组的对象头和Object有什么区别吗？

我们用JOL再看一次：

~~~java
log.info("{}",ClassLayout.parseClass(byte[].class).toPrintable());

log.info("{}",ClassLayout.parseInstance("www.flydean.com".getBytes()).toPrintable());
~~~

上面的例子中我们分别解析了byte数组的class和byte数组的实例：

~~~java
10:27:32.396 [main] INFO com.flydean.JolUsage - [B object internals:
 OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
      0    16        (object header)                           N/A
     16     0   byte [B.<elements>                             N/A
Instance size: 16 bytes
Space losses: 0 bytes internal + 0 bytes external = 0 bytes total

10:27:32.404 [main] INFO com.flydean.JolUsage - [B object internals:
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

看到区别了吗？我们发现数组的对象头是16字节，比普通对象的对象头多出了4个字节。这4个字节就是数组的长度。

## 整个对象的结构

好了，写到这里我们来总结一下，java对象的结构可以分为普通java对象和数组对象两种：

![](https://img-blog.csdnimg.cn/20200618135903311.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

数组对象在对象头中多了一个4字节的长度字段。

大家看到最后的字节是padding填充字节，为什么要填充呢？

因为JVM是以8字节为单位进行对其的，如果不是8字节的整数倍，则需要补全。

# 第三十三章 深入理解JIT和编译优化-你看不懂系列

## 简介

小师妹已经学完JVM的简单部分了，接下来要进入的是JVM中比较晦涩难懂的概念，这些概念是那么的枯燥乏味，甚至还有点惹人讨厌，但是要想深入理解JVM，这些概念是必须的，我将会尽量尝试用简单的例子来解释它们，但一定会有人看不懂，没关系，这个系列本不是给所有人看的。

## JIT编译器

小师妹:F师兄，我的基础已经打牢了吗？可以进入这么复杂的内容环节了吗？

小师妹不试试怎么知道不行呢？了解点深入内容可以帮助你更好的理解之前的知识。现在我们开始吧。

上次我们在讲java程序的处理流程的时候，还记得那通用的几步吧。

小师妹：当然记得了，编写源代码，javac编译成字节码，加载到JVM中执行。

![](https://img-blog.csdnimg.cn/20200524212920415.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

对，其实在JVM的执行引擎中，有三个部分：解释器，JIT编译器和垃圾回收器。

![](https://img-blog.csdnimg.cn/20200524221637660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

解释器会将前面编译生成的字节码翻译成机器语言，因为每次都要翻译，相当于比直接编译成机器码要多了一步，所以java执行起来会比较慢。

为了解决这个问题，JVM引入了JIT(Just-in-Time)编译器，将热点代码编译成为机器码。

## Tiered Compilation分层编译

小师妹你知道吗？在JDK8之前，HotSpot VM又分为三种。分别是 client VM, server VM, 和 minimal VM，分别用在客户端，服务器，和嵌入式系统。

但是随着硬件技术的发展，这些硬件上面的限制都不是什么大事了。所以从JDK8之后，已经不再区分这些VM了，现在统一使用VM的实现来替代他们。

小师妹，你觉得Client VM和Server VM的本质区别在哪一部分呢？

小师妹，编译成字节码应该都是使用javac，都是同样的命令，字节码上面肯定是一样的。难点是在执行引擎上面的不同？

说的对，因为Client VM和Server VM的出现，所以在JIT中出现了两种不同的编译器，C1 for Client VM， C2 for Server VM。

因为javac的编译只能做少量的优化，其实大量的动态优化是在JIT中做的。C2相对于C1，其优化的程度更深，更加激进。

为了更好的提升编译效率，JVM在JDK7中引入了分层编译Tiered compilation的概念。

对于JIT本身来说，动态编译是需要占用用户内存空间的，有可能会造成较高的延迟。

对于Server服务器来说，因为代码要服务很多个client，所以磨刀不误砍柴工，短暂的延迟带来永久的收益，听起来是可以接受的。

Server端的JIT编译也不是立马进行的，它可能需要收集到足够多的信息之后，才进行编译。

而对于Client来说，延迟带来的性能影响就需要进行考虑了。和Server相比，它只进行了简单的机器码的编译。

为了满足不同层次的编译需求，于是引入了分层编译的概念。

大概来说分层编译可以分为三层：

1. 第一层就是禁用C1和C2编译器，这个时候没有JIT进行。
2. 第二层就是只开启C1编译器，因为C1编译器只会进行一些简单的JIT优化，所以这个可以应对常规情况。
3. 第三层就是同时开启C1和C2编译器。

在JDK7中，你可以使用下面的命令来开启分层编译：

~~~java
-XX:+TieredCompilation
~~~

而在JDK8之后，恭喜你，分层编译已经是默认的选项了，不用再手动开启。

## OSR（On-Stack Replacement）

小师妹：F师兄，你刚刚讲到Server的JIT不是立马就进行编译的，它会等待一定的时间来搜集所需的信息，那么代码不是要从字节码转换成机器码？

对的，这个过程就叫做OSR（On-Stack Replacement）。为什么叫OSR呢？我们知道JVM的底层实现是一个栈的虚拟机，所以这个替换实际上是一系列的Stack操作。

![](https://img-blog.csdnimg.cn/20200528094011924.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图所示，m1方法从最初的解释frame变成了后面的compiled frame。

## Deoptimization

这个世界是平衡的，有阴就有阳，有优化就有反优化。

小师妹：F师兄，为什么优化了之后还要反优化呢？这样对性能不是下降了吗？

通常来说是这样的，但是有些特殊的情况下面，确实是需要进行反优化的。

下面是比较常见的情况：

1. 需要调试的情况

如果代码正在进行单个步骤的调试，那么之前被编译成为机器码的代码需要反优化回来，从而能够调试。

2. 代码废弃的情况

当一个被编译过的方法，因为种种原因不可用了，这个时候就需要将其反优化。

3. 优化之前编译的代码

有可能出现之前优化过的代码可能不够完美，需要重新优化的情况，这种情况下同样也需要进行反优化。

## 常见的编译优化举例

除了JIT编译成机器码之外，JIT还有一下常见的代码优化方式，我们来一一介绍。

### Inlining内联

举个例子：

~~~java
int a = 1;
int b = 2;
int result = add(a, b);
...
public int add(int x, int y) { return x + y; }
int result = a + b; //内联替换
~~~

上面的add方法可以简单的被替换成为内联表达式。

### Branch Prediction分支预测

通常来说对于条件分支，因为需要有一个if的判断条件，JVM需要在执行完毕判断条件，得到返回结果之后，才能够继续准备后面的执行代码，如果有了分支预测，那么JVM可以提前准备相应的执行代码，如果分支检查成功就直接执行，省去了代码准备的步骤。

比如下面的代码：

~~~java
// make an array of random doubles 0..1
double[] bigArray = makeBigArray();
for (int i = 0; i < bigArray.length; i++)
{
 double cur = bigArray[i];
 if (cur > 0.5) { doThis();} else { doThat();}
}
~~~

### Loop unswitching

如果我们在循环语句里面添加了if语句，为了提升并发的执行效率，可以将if语句从循环中提取出来：

~~~java
  int i, w, x[1000], y[1000];
  for (i = 0; i < 1000; i++) {
    x[i] += y[i];
    if (w)
      y[i] = 0;
  }
~~~

可以改为下面的方式：

~~~java
  int i, w, x[1000], y[1000];
  if (w) {
    for (i = 0; i < 1000; i++) {
      x[i] += y[i];
      y[i] = 0;
    }
  } else {
    for (i = 0; i < 1000; i++) {
      x[i] += y[i];
    }
  }
~~~

### Loop unrolling展开

在循环语句中，因为要不断的进行跳转，所以限制了执行的速度，我们可以对循环语句中的逻辑进行适当的展开：

~~~java
 int x;
 for (x = 0; x < 100; x++)
 {
     delete(x);
 }
~~~

转变为：

~~~java
 int x; 
 for (x = 0; x < 100; x += 5 )
 {
     delete(x);
     delete(x + 1);
     delete(x + 2);
     delete(x + 3);
     delete(x + 4);
 }
~~~

虽然循环体变长了，但是跳转次数变少了，其实是可以提升执行速度的。

### Escape analysis逃逸分析

什么叫逃逸分析呢？简单点讲就是分析这个线程中的对象，有没有可能会被其他对象或者线程所访问，如果有的话，那么这个对象应该在Heap中分配，这样才能让对其他的对象可见。

如果没有其他的对象访问，那么完全可以在stack中分配这个对象，栈上分配肯定比堆上分配要快，因为不用考虑同步的问题。

我们举个例子：

~~~java
  public static void main(String[] args) {
    example();
  }
  public static void example() {
    Foo foo = new Foo(); //alloc
    Bar bar = new Bar(); //alloc
    bar.setFoo(foo);
  }
}

class Foo {}

class Bar {
  private Foo foo;
  public void setFoo(Foo foo) {
    this.foo = foo;
  }
}
~~~

上面的例子中，setFoo引用了foo对象，如果bar对象是在heap中分配的话，那么引用的foo对象就逃逸了，也需要被分配在heap空间中。

但是因为bar和foo对象都只是在example方法中调用的，所以，JVM可以分析出来没有其他的对象需要引用他们，那么直接在example的方法栈中分配这两个对象即可。

逃逸分析还有一个作用就是lock coarsening。

为了在多线程环境中保证资源的有序访问，JVM引入了锁的概念，虽然锁可以保证多线程的有序执行，但是如果实在单线程环境中呢？是不是还需要一直使用锁呢？

比如下面的例子：

~~~java
public String getNames() {
     Vector<String> v = new Vector<>();
     v.add("Me");
     v.add("You");
     v.add("Her");
     return v.toString();
}
~~~

Vector是一个同步对象，如果是在单线程环境中，这个同步锁是没有意义的，因此在JDK6之后，锁只在被需要的时候才会使用。

这样就能提升程序的执行效率。

## 总结

本文介绍了JIT的原理和一些基本的优化方式。后面我们会继续探索JIT和JVM的秘密，敬请期待。

# 第三十四章 JIT中的LogCompilation

## 简介

我们知道在JVM中为了加快编译速度，引入了JIT即时编译的功能。那么JIT什么时候开始编译的，又是怎么编译的，作为一个高傲的程序员，有没有办法去探究JIT编译的秘密呢？答案是有的，今天和小师妹一起带大家来看一看这个编译背后的秘密。

## LogCompilation简介

小师妹：F师兄，JIT这么神器，但是好像就是一个黑盒子，有没有办法可以探寻到其内部的本质呢？

追求真理和探索精神是我们作为程序员的最大优点，想想如果没有玻尔关于原子结构的新理论，怎么会有原子体系的突破，如果没有海森堡的矩阵力学，怎么会有量子力学的建立？

JIT的编译日志输出很简单，使用 -XX:+LogCompilation就够了。

如果要把日志重定向到一个日志文件中，则可以使用-XX:LogFile= 。 

但是要开启这些分析的功能，又需要使用-XX:+UnlockDiagnosticVMOptions。 所以总结一下，我们需要这样使用：

~~~java
-XX:+UnlockDiagnosticVMOptions -XX:+LogCompilation -XX:LogFile=www.flydean.com.log
~~~

## LogCompilation的使用

根据上面的介绍，我们现场来生成一个JIT的编译日志，为了体现出专业性，这里我们需要使用到JMH来做性能测试。

JMH的全称是Java Microbenchmark Harness，是一个open JDK中用来做性能测试的套件。该套件已经被包含在了JDK 12中。

如果你使用的不是JDK 12，那么需要添加如下依赖：

~~~xml
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-core</artifactId>
    <version>1.19</version>
</dependency>
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-generator-annprocess</artifactId>
    <version>1.19</version>
</dependency>
~~~

更多详情可以参考我之前写的： 在java中使用JMH（Java Microbenchmark Harness）做性能测试一文。

之前有的朋友说，代码也用图片，看起来好看，从本文之后，我们会尽量把代码也转成图片来展示：

![](https://img-blog.csdnimg.cn/20200529101342389.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

看完我的JMH的介绍，上面的例子应该很清楚了，主要就是做一个累加操作，然后warmup 5轮，测试5轮。

在@Fork注解里面，我们可以配置jvm的参数，为什么我注释掉了呢？因为我发现在jvmArgsPrepend中的-XX:LogFile是不生效的。

没办法，我只好在运行配置中添加：

![](https://img-blog.csdnimg.cn/20200529101742580.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

运行之后，你就可以得到输出的编译日志文件。

## 解析LogCompilation文件

小师妹：F师兄，我看了一下生成的文件好复杂啊，用肉眼能看得明白吗？

别怕，只是内容的多一点，如果我们细细再细细的分析一下，你会发现其实它真的非常非常......复杂!

其实写点简单的小白文不好吗？为什么要来分析这么复杂，又没人看，看了也没人懂的JVM底层.....

大概，这就是专业吧！

LogCompilation文件其实是xml格式的，我们现在来大概分析一下，它的结构，让大家下次看到这个文件也能够大概了解它的重点。

![](https://img-blog.csdnimg.cn/20200529222302406.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

首先最基本的信息就是JVM的信息，包括JVM的版本，JVM运行的参数，还有一些properties属性。

我们收集到的日志其实是分两类的，第一类是应用程序本身的的编译日志，第二类就是编译线程自己内部产生的日志。

第二类的日志会以hs_c*.log的格式存储，然后在JVM退出的时候，再将这些文件跟最终的日志输出文件合并，生成一个整体的日志文件。

比如下面的两个就是编译线程内部的日志：

~~~java
<thread_logfile thread='22275' filename='/var/folders/n5/217y_bgn49z18zvjch907xb00000gp/T//hs_c22275_pid83940.log'/>
<thread_logfile thread='41731' filename='/var/folders/n5/217y_bgn49z18zvjch907xb00000gp/T//hs_c41731_pid83940.log'/>
~~~

上面列出了编译线程的id=22275，如果我们顺着22275找下去，则可以找到具体编译线程的日志：

~~~java
<compilation_log thread='22275'>
...
</compilation_log>
~~~

上面由compilation_log围起来的部分就是编译日志了。

接下来的部分表示，编译线程开始执行了，其中stamp表示的是启动时间，下图列出了一个完整的编译线程的日志：

![](https://img-blog.csdnimg.cn/20200529224327438.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

~~~java
<start_compile_thread name='C2 CompilerThread0' thread='22275' process='83940' stamp='0.058'/>
~~~

接下来描述的是要编译的方法信息：

~~~java
<task compile_id='10' method='java.lang.Object &lt;init&gt; ()V' bytes='1' count='1409' iicount='1409' stamp='0.153'>
~~~

上面列出了要编译的方法名，compile_id表示的是系统内部分配的编译id，bytes是方法中的字节数，count表示的是该方法的调用次数，注意，这里的次数并不是方法的真实调用次数，只能做一个估计。

iicount是解释器被调用的次数。

task执行了，自然就会执行完成，执行完成的内容是以task_done标签来表示的：

~~~java
<task_done success='1' nmsize='120' count='1468' stamp='0.155'/>
~~~

其中success表示是否成功执行，nmsize表示编译器编译出来的指令大小，以byte为单位。如果有内联的话，还有个inlined_bytes属性，表示inlined的字节个数。

~~~java
<type id='1025' name='void'/>
~~~

type表示的是方法的返回类型。

~~~java
<klass id='1030' name='java.lang.Object' flags='1'/>
~~~

klass表示的是实例和数组类型。

~~~java
<method id='1148' holder='1030' name='&lt;init&gt;' return='1025' flags='1' bytes='1' compile_id='1' compiler='c1' level='3' iicount='1419'/>
~~~

method表示执行的方法，holder是前面的klass的id，表示的是定义该方法的实例或者数组对象。method有名字，有
return，return对应的是上面的type。

flags表示的是方法的访问权限。

接下来是parse，是分析阶段的日志：

~~~java
<parse method='1148' uses='1419.000000' stamp='0.153'>
~~~

上面有parse的方法id。uses是使用次数。

~~~java
<bc code='177' bci='0'/>
~~~

bc是byte Count的缩写，code是byte的个数，bci是byte code的索引。

~~~java
<dependency type='no_finalizable_subclasses' ctxk='1030'/>
~~~

dependency分析的是类的依赖关系，type表示的是什么类型的依赖，ctkx是依赖的context class。

我们注意有的parse中，可能会有uncommon_trap：

~~~java
<uncommon_trap bci='10' reason='unstable_if' action='reinterpret' debug_id='0' comment='taken never'/>
~~~

怎么理解uncommon_trap呢？字面上意思就是捕获非常用的代码，就是说在解析代码的过程中发现发现这些代码是uncommon的，然后解析产生一个uncommon_trap，不再继续进行了。

它里面有两个比较重要的字段，reason表示的是被标记为uncommon_trap的原因。action表示的出发uncommon_trap的事件。

有些地方还会有call：

~~~java
<call method='1150' count='5154' prof_factor='1.000000' inline='1'/>
~~~

call的意思是，在该代码中将会调用其他的方法。count是执行次数。

## 总结

复杂的编译日志终于讲完了，可能讲的并不是很全，还有一些其他情况这里并没有列出来，后面如果遇到了，我再添加进去。

# 第三十五章 JIT中的PrintCompilation

## 简介

上篇文章我们讲到了JIT中的LogCompilation，将编译的日志都收集起来，存到日志文件里面，并且详细的解释了LogCompilation日志文件中的内容定义。今天我们再和小师妹一起学习LogCompilation的姊妹篇PrintCompilation，看看都有什么妙用吧。

## PrintCompilation

小师妹：F师兄，上次你给讲的LogCompilation实在是太复杂了，生成的日志文件又多，完全看不了，我其实只是想知道有哪些方法被编译成了机器码，有没有什么更加简单的办法呢？

> 真理的大海，让未发现的一切事物躺卧在我的眼前，任我去探寻- 牛顿（英国）

当然有的，那就给你介绍一下LogCompilation的妹妹PrintCompilation，为什么是妹妹呢？因为PrintCompilation输出的日志要比LogCompilation少太多了。

老规矩，上上我们的JMH运行代码，文章中使用的代码链接都会在文末注明，这里使用图片的原因只是为了方便读者阅读代码：

![](https://img-blog.csdnimg.cn/20200530152758239.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里和上次的LogCompilation不同的是，我们使用：-XX:+PrintCompilation参数。

其实我们还可以添加更多的参数，例如：

~~~java
-Xbatch -XX:-TieredCompilation -XX:+PrintCompilation
~~~

先讲一下-Xbatch。 

一般来说JIT编译器使用的是和主线程完全不同的新的线程。这样做的好处就是JIT可以和主线程并行执行，编译器的运行基本上不会影响到主线程的的运行。

但是有阴就有阳，有利就有弊。多线程在提高的处理速度的同时，带给我们的就是输出日志的混乱。因为是并行执行的，我们主线程的日志中，穿插了JIT编译器的线程日志。

如果使用-Xbatch就可以强迫JIT编译器使用主线程。这样我们的输出日志就是井然有序的。真棒。

再讲一下TieredCompilation。

为了更好的提升编译效率，JVM在JDK7中引入了分层编译Tiered compilation的概念。

大概来说分层编译可以分为三层：

第一层就是禁用C1和C2编译器，这个时候没有JIT进行。
第二层就是只开启C1编译器，因为C1编译器只会进行一些简单的JIT优化，所以这个可以应对常规情况。
第三层就是同时开启C1和C2编译器。

在JDK8中，分层编译是默认开启的。因为不同的编译级别处理编译的时间是不一样的，后面层级的编译器启动的要比前面层级的编译器要慢，但是优化的程度更高。

这样我们其实会产生很多中间的优化代码，这里我们只是想分析最终的优化代码，所以我们需要停止分层编译的功能。

最后是今天的主角：PrintCompilation。 

PrintCompilation将会输出被编译方法的统计信息，因此使用PrintCompilation可以很方法的看出哪些是热点代码。热点代码也就意味着存在着被优化的可能性。

## 分析PrintCompilation的结果

小师妹：F师兄，我照着你的例子运行了一下，结果果然清爽了很多。可是我还是看不懂。

没有一个人能全面把握真理。小师妹，我们始终在未知的路上前行。不懂就问，不会就学。

我们再截个图看一下生成的日志吧。

![](https://img-blog.csdnimg.cn/20200530155321272.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

![](https://img-blog.csdnimg.cn/20200530155410945.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

因为日志太长了，为了节约大家的流量，我只截取了开头的部分和结尾的部分。

大家可以看到开头部分基本上都是java自带的类的优化。只有最后才是我们自己写的类。

第一列是方法开始编译的时间。

第二列是简单的index。

第三列是一系列的flag的组合，有下面几个flag：

~~~java
b    Blocking compiler (always set for client)
*    Generating a native wrapper
%    On stack replacement (where the compiled code is running)
!    Method has exception handlers
s    Method declared as synchronized
n    Method declared as native
made non entrant    compilation was wrong/incomplete, no future callers will use this version
made zombie         code is not in use and ready for GC
~~~

如果我们没有关闭分层编译的话，在方法名前面还会有数字，表示是使用的那个编译器。

![](https://img-blog.csdnimg.cn/20200530162454453.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

分层编译详细的来说可以分为5个级别。

0表示是使用解释器，不使用JIT编译。
1，2，3是使用C1编译器（client）。
4是使用C2编译器（server）。

现在让我们来看一下最后一列。

最后一列包含了方法名和方法的长度。注意这里的长度指的是字节码的长度。

如果字节码被编译成为机器码，长度会增加很多倍。

## 总结

本文介绍了JIT中PrintCompilation的使用，并再次复习了JIT中的分层编译架构。希望大家能够喜欢。


# 第三十六章 JIT中的PrintAssembly

## 简介

想不想了解JVM最最底层的运行机制？想不想从本质上理解java代码的执行过程？想不想对你的代码进行进一步的优化和性能提升？

如果你的回答是yes。那么这篇文章非常适合你，因为本文将会站在离机器码最近的地方来观看JVM的运行原理：Assembly。

## 使用PrintAssembly

小师妹：F师兄，上次你给我介绍了java中的字节码，还有JIT中的LogCompilation和PrintCompilation的用法。虽然都非常有用，但是能不能更进一步，让我能以机器的眼光来看待JVM的执行？

小师妹，如果要探究JVM的运行本质，那就应该是机器码了。难道你要去读懂机器码？虽然我不是机器码的专家，但我猜那应该是个非常复杂的过程。

小师妹：F师兄，当然不是机器码，有没有比机器码更高级一点点的，我记得上大学的时候学过汇编语言，好像就是离机器码最近的语言了，JVM有没有相应的汇编语言呢？

必须有的，我们可以使用-XX:+PrintAssembly来将assembly打印出来。

但是打印assembly是有条件的，它就像一个高傲的姑娘，不是你想追求就能追求得上的。

我们使用下面的命令来查看系统对PrintAssembly的支持程度：

~~~java
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -version

Java HotSpot(TM) 64-Bit Server VM warning: PrintAssembly is enabled; turning on DebugNonSafepoints to gain additional output
Could not load hsdis-amd64.dylib; library not loadable; PrintAssembly is disabled
java version "1.8.0_171"
Java(TM) SE Runtime Environment (build 1.8.0_171-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.171-b11, mixed mode)
~~~

根据大家的运行环境的不同，得到的结果可能也是不同的，我是mac的系统，从上面的结果可以看到，在我的JDK8的环境中，显示缺少hsdis-amd64.dylib，所以PrintAssembly其实是禁用的。

小师妹：F师兄，那现在咋办呀？没有hsdis-amd64.dylib就用不了PrintAssembly了。

巴甫洛夫说过：问号是开启任何一门科学的钥匙。没有问题我们就创造问题，没有困难我们就制造困难，没有hsdis-amd64.dylib当然是安装咯。

具体怎么安装，大家自行探索吧，网上有很多安装的教程，这里就不一一介绍了。

这里想讨论一个很奇怪的事情，虽然在JDK8环境中，我们不能使用PrintAssembly，因为没有hsdis-amd64.dylib。但是当我切到最新的JDK14环境中，一切都很美好，PrintAssembly可以正常运行了。

如果我们在JDK14中同样运行上面的命令，我们会得到下面的结果：

![](https://img-blog.csdnimg.cn/20200530193157627.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

说明在JDK14中是不用安装hsdis-amd64.dylib就可以使用啦。

> 注意，上面的说法并没有验证过，如果我说错了，请指正。

## 输出过滤

默认情况下，PrintAssembly输出的是所有的信息，但是JDK内部的代码我们不可能进行修改，一般来说并不关心他们的assembly输出，如果要指定我们自己编写的方法，可以使用CompileCommand：

~~~java
CompileCommand=print,*MyClass.myMethod prints assembly for just one method
CompileCommand=option,*MyClass.myMethod,PrintOptoAssembly (debug build only) produces the old print command output
CompileCommand=option,*MyClass.myMethod,PrintNMethods produces method dumps
~~~

例如：

~~~java
-XX:CompileCommand=print,com.flydean.PrintAssemblyUsage::testPrintAssembly
~~~

这样我们可以得到，只属于testPrintAssembly方法的输出：

![](https://img-blog.csdnimg.cn/20200530194133803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)


## 总结

本文讲解了怎么使用PrintAssembly来输出JVM的汇编日志。我们会在后面继续讲解这些Assembly code到底有什么用。

# 第三十七章 JIT中的PrintAssembly续集

## 简介

上篇文章和小师妹一起介绍了PrintAssembly和PrintAssembly在命令行的使用，今天本文将会更进一步讲解如何在JDK8和JDK14中分别使用PrintAssembly，并在实际的例子中对其进行进一步的深入理解。

## JDK8和JDK14中的PrintAssembly

小师妹：F师兄，上次你介绍的PrintAssembly的自测命令，怎么在JDK14中不好用呢？

~~~java
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -version
~~~

有什么不好用的，命令不是正常打出来了吗？

小师妹：F师兄，你看下我运行的结果，机器码下面展示的怎么是448b 5608这样的数字呀，不应该是assembly language吗？

![](https://img-blog.csdnimg.cn/20200530194133803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

嗯...小师妹的话让我陷入了深深的思考，究竟是什么导致了这样的反常的结果呢？是道德的沦丧还是人性的扭曲？

于是我翻遍了baidu，哦，不对是google，还是没有找到结果。

难点是JDK14有bug？还是JDK14已经使用了另外的Assembly的实现？

有问题就解决问题，我们先从JDK8开始，来探索一下最原始的PrintAssembly的使用。

## JDK8中使用Assembly

在JDK8中如果我们运行Assembly的测试命令，可以得到下面的结果：

~~~java
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -version

Java HotSpot(TM) 64-Bit Server VM warning: PrintAssembly is enabled; turning on DebugNonSafepoints to gain additional output
Could not load hsdis-amd64.dylib; library not loadable; PrintAssembly is disabled
java version "1.8.0_171"
Java(TM) SE Runtime Environment (build 1.8.0_171-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.171-b11, mixed mode)
~~~

这个故事告诉我们，虽然PrintAssembly开关打开了，但是系统不支持，缺少了hsdis-amd64.dylib文件。

这个hsdis是一个反汇编的工具，我们需要hsdis的支持才能在JDK8中使用Assembly。

我是mac系统，下面是在mac系统怎么安装hsdis：

~~~java
hg clone http://hg.openjdk.java.net/jdk8u/jdk8u

cd jdk8u/hotspot/src/share/tools/hsdis/

wget http://ftp.heanet.ie/mirrors/ftp.gnu.org/gnu/binutils/binutils-2.30.tar.gz

tar -xzf binutils-2.30.tar.gz

make BINUTILS=binutils-2.30 ARCH=amd64

#java8
sudo cp build/macosx-amd64/hsdis-amd64.dylib /Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/jre/lib/server/

#java9 onwards
sudo cp build/macosx-amd64/hsdis-amd64.dylib /Library/Java/JavaVirtualMachines/jdk-9.0.4.jdk/Contents/Home/lib/server/
~~~

如果你是linux或者windows系统，请自行探索hsdis的安装方法。

按照步骤先把java8的hsdis-amd64.dylib安装好。

然后再次运行测试命令：

![](https://img-blog.csdnimg.cn/20200602225754419.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

完美，汇编语言出现了。

## JDK14中的Assembly

然后我想到，如果把这个dylib文件拷贝到JDK14相应的目录下面，运行一次会怎么样呢？

> 大家注意，JDK9之后，使用了模块化，所以之前的目录结构发生了比较大的变化，大家参考上面我列出的地址。

再次运行测试代码：

![](https://img-blog.csdnimg.cn/20200602230145355.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

大家看到，Assembly又出现了，真的是让我热内盈亏。

其实最开始的时候，我发现JDK14中Assembly没能正常显示的时候，我也有想过拷贝一个hsdis-amd64.dylib过来试试，但是一看还需要下载JDK的代码，重新编译，就打起了退堂鼓。

吃一堑，长一智，下次遇到问题千万不能走捷径。抄近路害死人呀！

## 在JMH中使用Assembly

Assembly主要是为了进行代码调优或者理解JVM的运行原理来使用的。

这里我们举一个在JMH中使用Assembly的例子：

~~~java
@Warmup(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(value = 1,
        jvmArgsPrepend = {
        "-XX:+UnlockDiagnosticVMOptions",
                "-XX:CompileCommand=print,com.flydean.PrintAssemblyUsage::testPrintAssembly"
}
)
@State(Scope.Benchmark)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
public class PrintAssemblyUsage {

    int x;
    @Benchmark
    @CompilerControl(CompilerControl.Mode.DONT_INLINE)
    public void testPrintAssembly() {
        for (int c = 0; c < 1000; c++) {
            synchronized (this) {
                x += 0xFF;
            }
        }
    }
    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(PrintAssemblyUsage.class.getSimpleName())
                .build();

        new Runner(opt).run();
    }
}
~~~

上面的例子中，我们使用了-XX:CompileCommand指定要打印的方法，而不是输出所有的Assembly，方便我们查看和分析结果。

## 总结

本文介绍了JDK8和JDK14中，怎么开启PrintAssembly。并举了一个在JMH中使用的例子。

那么有人会问了，在JMH中使用Assembly到底有什么意义呢？别急，我们在后面深入JVM的本质中，马上就要讲到，敬请期待。

# 第三十八章 深入理解编译优化之循环展开和粗化锁

## 简介

之前在讲JIT的时候，有提到在编译过程中的两种优化循环展开和粗化锁，今天我们和小师妹一起从Assembly的角度来验证一下这两种编译优化方法，快来看看吧。

## 循环展开和粗化锁

小师妹:F师兄，上次你讲到在JIT编译的过程中会进行一些编译上面的优化，其中就有循环展开和粗化锁。我对这两种优化方式很感兴趣，能不能展开讲解一下呢？

当然可以，我们先来回顾一下什么是循环展开。

循环展开就是说，像下面的循环遍历的例子：

~~~java
for (int i = 0; i < 1000; i++) {
                x += 0x51;
        }
~~~

因为每次循环都需要做跳转操作，所以为了提升效率，上面的代码其实可以被优化为下面的：

~~~java
for (int i = 0; i < 250; i++) {
                x += 0x144; //0x51 * 4
        }
~~~

注意上面我们使用的是16进制数字，至于为什么要使用16进制呢？这是为了方便我们在后面的assembly代码中快速找到他们。

好了，我们再在 x += 0x51 的外面加一层synchronized锁，看一下synchronized锁会不会随着loop unrolling展开的同时被粗化。

~~~java
for (int i = 0; i < 1000; i++) {
            synchronized (this) {
                x += 0x51;
            }
 }
~~~

万事具备，只欠我们的运行代码了，这里我们还是使用JMH来执行。

相关代码如下：

~~~java
@Warmup(iterations = 10, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(value = 1,
        jvmArgsPrepend = {
        "-XX:-UseBiasedLocking",
                "-XX:CompileCommand=print,com.flydean.LockOptimization::test"
}
        )
@State(Scope.Benchmark)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
public class LockOptimization {

    int x;
    @Benchmark
    @CompilerControl(CompilerControl.Mode.DONT_INLINE)
    public void test() {
        for (int i = 0; i < 1000; i++) {
            synchronized (this) {
                x += 0x51;
            }
        }
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(LockOptimization.class.getSimpleName())
                .build();
        new Runner(opt).run();
    }
}
~~~

上面的代码中，我们取消了偏向锁的使用：-XX:-UseBiasedLocking。为啥要取消这个选项呢？因为如果在偏向锁的情况下，如果线程获得锁之后，在之后的执行过程中，如果没有其他的线程访问该锁，那么持有偏向锁的线程则不需要触发同步。

为了更好的理解synchronized的流程，这里我们将偏向锁禁用。

其他的都是我们之前讲过的JMH的常规操作。

接下来就是见证奇迹的时刻了。

## 分析Assembly日志

我们运行上面的程序，将会得到一系列的输出。因为本文并不是讲解Assembly语言的，所以本文只是大概的理解一下Assembly的使用，并不会详细的进行Assembly语言的介绍，如果有想深入了解Assembly的朋友，可以在文后留言。

分析Assembly的输出结果，我们可以看到结果分为C1-compiled nmethod和C2-compiled nmethod两部分。

先看C1-compiled nmethod：

![](https://img-blog.csdnimg.cn/20200603231112541.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

第一行是monitorenter,表示进入锁的范围，后面还跟着对于的代码行数。

最后一行是monitorexit,表示退出锁的范围。

中间有个add $0x51,%eax操作，对于着我们的代码中的add操作。

可以看到C1—compiled nmethod中是没有进行Loop unrolling的。

我们再看看C2-compiled nmethod:

![](https://img-blog.csdnimg.cn/20200603231506361.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

和C1很类似，不同的是add的值变成了0x144,说明进行了Loop unrolling，同时对应的锁范围也跟着进行了扩展。

最后看下运行结果：

~~~java

Benchmark              Mode  Cnt     Score     Error  Units
LockOptimization.test  avgt    5  5601.819 ± 620.017  ns/op
~~~

得分还不错。

## 禁止Loop unrolling

接下来我们看下如果将Loop unrolling禁掉，会得到什么样的结果。

要禁止Loop unrolling，只需要设置-XX:LoopUnrollLimit=1即可。

我们再运行一下上面的程序:

![](https://img-blog.csdnimg.cn/20200603231931684.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

可以看到C2-compiled nmethod中的数字变成了原本的0x51，说明并没有进行Loop unrolling。

再看看运行结果：

~~~java
Benchmark              Mode  Cnt      Score      Error  Units
LockOptimization.test  avgt    5  20846.709 ± 3292.522  ns/op
~~~

可以看到运行时间基本是优化过后的4倍左右。说明Loop unrolling还是非常有用的。

## 总结

本文介绍了循环展开和粗化锁的实际例子，希望大家能够喜欢。

# 第三十九章 JIT的Profile神器JITWatch

## 简介

老是使用命令行工具在现代化社会好像已经跟不上节奏了，尤其是在做JIT分析时，使用LogCompilation输出的日志实在是太大了，让人望而生畏。有没有什么更加简便的方法来分析JIT日志呢？快来和小师妹一起来学习JITWatch吧。

## 什么是JIT

小师妹，F师兄，JIT就是Just In Time compilers。能不能再总结一下JIT到底是做什么的呢？

当然没问题，JIT主要有两个作用，第一个作用大家应该已经知道了，就是在运行时将byte code编译成为机器码，提高程序的执行速度。

第二个作用就是在运行时对代码进行优化，同样的也对性能进行提升。

JIT中有两种编译器，C1代表的是Client Compiler,C2代表的是Server Compiler。

其中C1只是简单的编译，而C2在收集到更多信息之后，会进行更加深入的编译和优化。

常见的优化手段有：Loop unrolling, Inlining, Dead Code Elimination,Escape analysis, Intrinsics, Branch prediction等。

JDK8中会默认启动分层编译。你也可以使用-XX:+TieredCompilation来手动启动它。

## JITWatch简介

小师妹：F师兄，上次你讲的LogCompilation和PrintCompilation输出结果还是太复杂了，尤其是LogCompilation，输出的结果有十几M，分析起来好难。有没有更简单一点的办法，让我的工作效率加倍呢？

这个必须有，有需求就有市场，有需求就有大神出场。今天给你介绍一个工具叫做JITWatch。

JITWatch是一个大神做的JIT日志的可视化分析工具。在使用它之前你可能觉得它有点强大，在使用后你就会觉得它真的是强大。

## 运行JITWatch

小师妹：F师兄，这么强大的工具，快快介绍我使用吧。

完全没有问题，不过JITWatch没有现成的打包好的可执行文件。没错，你需要到github上面下载源码。

下载完毕，可以执行：

~~~java
mvn clean compile test exec:java
~~~

就可以开启JITWatch之旅了。

## JITWatch详解

小师妹：F师兄，这么好用的工具为什么不打个包出来让大家直接用呢？还要下载源码这么麻烦。

其实吧，JITWatch为了大家方便使用，自带一个Sandbox功能，提供了一些可以直接在JITWatch中运行的代码，同时JITWatch可以实现源码的实时比对功能。所以需要大家下载源码。

闲话休提，我们开启JITWatch之旅吧。

![](https://img-blog.csdnimg.cn/20200604072217290.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

入眼就是如此朴实无华的界面，让人感觉总有点...重剑无锋,大巧不工。高手做的UI就是这么的完美。

接下来我们需要运行一个程序，来实时感受一下JITWatch的魅力。

看到左边最上角的sandbox了吗？点开它可以看到下面的sandbox页面：

![](https://img-blog.csdnimg.cn/20200604072716899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这一个页面会选择一个sadbox中的例子展示给你，大家注意下面的输出框的说明，它会显示你的Disassembler是否可用。如果想要安装disassembler，请参照我之前的文章。

如果你对这个例子不满意，或者你想使用自己的代码，那也完全没有问题。点击config。

![](https://img-blog.csdnimg.cn/20200604091339399.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里你可以配置源代码的路径，可以选择VM的语言，还有各种VM的选项，下面的选项相信我在之前的文章中都已经介绍过了吧。

如果还有不懂的小伙伴，微信我，私聊我，1对1现场教学。

万事俱备，只欠东风，开始吧，我可是要成为Java王的男人！

![](https://img-blog.csdnimg.cn/20200604094305403.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

然后我们就进入了TirView界面，这里我们可看到主界面分成了三部分，源代码，ByteCode和Assembly。

小师妹：真是热泪盈眶啊，终于不需要自己去添加那些XX参数了。面向界面编程，真好。

上面还有几个按钮，这里简单介绍一下他们的功能，具体的界面这里就不截图了，因为实在是太多了....

Chain会展示调用链。

Journal就是之前使用LogCompilation产生的xml日志。

LNT,全称是line number table。---目前我还不知道这个是做什么用的，有知道的朋友，请给我留言。

然后就是Inlined into功能了，这个功能要详细讲一下，因为会影响到程序的执行效率。

还记得之前举的inline的例子吗？

~~~java
int a = 1;
int b = 2;
int result = add(a, b);
...
public int add(int x, int y) { return x + y; }
int result = a + b; //内联替换
~~~

上面的add方法可以简单的被替换成为内联表达式。

![](https://img-blog.csdnimg.cn/20200604100002110.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

JITWatch可以显示方法是否被inlined，并且显示出inlined的原因。

点击BCI可以显示关联的inlined的代码。大家自行体会。

现在再让我们回到可爱又有风格的主页面：

![](https://img-blog.csdnimg.cn/20200604100901519.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

左边是源代码，包含了JDK自己的代码，如果你想详细的分析JDK自己代码的优化，那么这是一个非常好的工具。

右边显示的是被JIT编译的类和方法，并且展示了编译级别和编译的时间。

右上角又有一排按钮，Config是用来配置运行的代码。

TimeLine是以图形的形式展示JIT编译的时间轴。

Histo是直方图展示的一些编译信息。

TopList里面是编译中产生的一些对象的或者数据的排序。

Cache是free code cache空间。

NMethod是native方法。

Threads是JIT编译的线程。

TriView就是我们最开始展示的面板。

最后我们重点讲一下Suggestion:

![](https://img-blog.csdnimg.cn/20200604102143956.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Suggestion是对代码的一些优化建议。

从上图我们可以看到在调用String的hashMap方法时候无法inlined,因为被调用的方法太大了，超出了最大inlining size。

## 总结

所以，我们通过JITWatch可以学到什么呢？最最重要的是我们可以通过JITWatch来分析JIT的运行原理和本质。然后inlined的方法不要太大了，否则影响执行效率。

# 第四十章 cache line对代码性能的影响

## 简介

读万卷书不如行万里路，讲了这么多assembly和JVM的原理与优化，今天我们来点不一样的实战。探索一下怎么使用assembly来理解我们之前不能理解的问题。

## 一个奇怪的现象

小师妹:F师兄，之前你讲了那么多JVM中JIT在编译中的性能优化，讲真的，在工作中我们真的需要知道这些东西吗？知道这些东西对我们的工作有什么好处吗？

um...这个问题问得好，知道了JIT的编译原理和优化方向，我们的确可以在写代码的时候稍微注意一下，写出性能更加优秀的代码，但是这只是微观上了。

如果将代码上升到企业级应用，一个硬件的提升，一个缓存的加入或者一种架构的改变都可能比小小的代码优化要有用得多。

就像是，如果我们的项目遇到了性能问题，我们第一反应是去找架构上面有没有什么缺陷，有没有什么优化点，很少或者说基本上不会去深入到代码层面，看你的这个代码到底有没有可优化空间。

第一，只要代码的业务逻辑不差，运行起来速度也不会太慢。

第二，代码的优化带来的收益实在太小了，而工作量又非常庞大。

所以说，对于这种类似于鸡肋的优化，真的有必要存在吗？

其实这和我学习物理化学数学知识是一样的，你学了那么多知识，其实在日常生活中真的用不到。但是为什么要学习呢？

我觉得有两个原因，第一是让你对这个世界有更加本质的认识，知道这个世界是怎么运行的。第二是锻炼自己的思维习惯，学会解决问题的方法。

就像算法，现在写个程序真的需要用到算法吗？不见得，但是算法真的很重要，因为它可以影响你的思维习惯。

所以，了解JVM的原理，甚至是Assembly的使用，并不是要你用他们来让你的代码优化的如何好，而是让你知道，哦，原来代码是这样工作的。在未来的某一个，或许我就可能用到。

好了，言归正传。今天给小师妹介绍一个很奇怪的例子：

~~~java
private static int[] array = new int[64 * 1024 * 1024];

    @Benchmark
    public void test1() {
        int length = array.length;
        for (int i = 0; i < length; i=i+1)
            array[i] ++;
    }
    @Benchmark
    public void test2() {
        int length = array.length;
        for (int i = 0; i < length; i=i+2)
            array[i] ++;
    }
~~~

小师妹，上面的例子，你觉得哪一个运行的更快呢？

小师妹：当然是第二个啦，第二个每次加2，遍历的次数更少，肯定执行得更快。

好，我们先持保留意见。

第二个例子，上面我们是分别+1和+2，如果后面再继续+3，+4，一直加到128，你觉得运行时间是怎么样的呢？

小师妹：肯定是线性减少的。

好，两个问题问完了，接下来让我们来揭晓答案吧。

## 两个问题的答案

我们再次使用JMH来测试我们的代码。代码很长，这里就不列出来了，有兴趣的朋友可以到本文下面的代码链接下载运行代码。

我们直接上运行结果：

~~~java
Benchmark               Mode  Cnt   Score   Error  Units
CachelineUsage.test1    avgt    5  27.499 ± 4.538  ms/op
CachelineUsage.test2    avgt    5  31.062 ± 1.697  ms/op
CachelineUsage.test3    avgt    5  27.187 ± 1.530  ms/op
CachelineUsage.test4    avgt    5  25.719 ± 1.051  ms/op
CachelineUsage.test8    avgt    5  25.945 ± 1.053  ms/op
CachelineUsage.test16   avgt    5  28.804 ± 0.772  ms/op
CachelineUsage.test32   avgt    5  21.191 ± 6.582  ms/op
CachelineUsage.test64   avgt    5  13.554 ± 1.981  ms/op
CachelineUsage.test128  avgt    5   7.813 ± 0.302  ms/op
~~~

好吧，不够直观，我们用一个图表来表示：

![](https://img-blog.csdnimg.cn/20200606134113204.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从图表可以看出，步长在1到16之间的时候，执行速度都还相对比较平稳，在25左右，然后就随着步长的增长而下降。

### CPU cache line

那么我们先回答第二个问题的答案，执行时间是先平稳再下降的。

为什么会在16步长之内很平稳呢？

CPU的处理速度是有限的，为了提升CPU的处理速度，现代CPU都有一个叫做CPU缓存的东西。

而这个CPU缓存又可以分为L1缓存，L2缓存甚至L3缓存。

其中L1缓存是每个CPU核单独享有的。在L1缓存中，又有一个叫做Cache line的东西。为了提升处理速度，CPU每次处理都是读取一个Cache line大小的数据。

怎么查看这个Cache line的大小呢？

在mac上，我们可以执行：sysctl machdep.cpu 

![](https://img-blog.csdnimg.cn/20200606144713268.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从图中我们可以得到，机子的CPU cache line是64byte，而cpu的一级缓存大小是256byte。

好了，现在回到为什么1-16步长执行速度差不多的问题。

我们知道一个int占用4bytes，那么16个int刚好占用64bytes。所以我们可以粗略的任务，1-16步长，每次CPU取出来的数据是一样的，都是一个cache line。所以，他们的执行速度其实是差不多的。

### inc 和 add

小师妹：F师兄，上面的解释虽然有点完美了，但是好像还有一个漏洞。既然1-16使用的是同一个cache line，那么他们的执行时间，应该是逐步下降才对，为什么2比1执行时间还要长呢？

这真的是一个好问题，光看代码和cache line好像都解释不了，那么我们就从Assembly的角度再来看看。

还是使用JMH，打开PrintAssembly选项，我们看看输出结果。

先看下test1方法的输出：

![](https://img-blog.csdnimg.cn/20200606152632182.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

再看下test2方法的输出：

![](https://img-blog.csdnimg.cn/2020060615294026.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

两个有什么区别呢？

基本上的结构都是一样的，只不过test1使用的是inc，而test2方法使用的add。

本人对汇编语言不太熟，不过我猜两者执行时间的差异在于inc和add的差异，add可能会执行慢一点，因为它多了一个额外的参数。

## 总结

Assembly虽然没太大用处，但是在解释某些神秘现象的时候，还是挺好用的。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！

