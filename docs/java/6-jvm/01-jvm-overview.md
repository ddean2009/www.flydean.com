---
slug: /jvm-overview
---

# 1. 小师妹学JVM之:JVM的架构和执行过程

## 简介

JVM也叫Java Virtual Machine，它是java程序运行的基础，负责将java bytecode转换成为适合在各个不同操作系统中运行的机器代码并运行。今天我们和小师妹一起走进java的核心JVM，领略java在设计上的哲学。

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


> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！

