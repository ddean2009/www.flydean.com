---
slug: /jvm-performance-enhancements
---

# 21. 小师妹学JVM之:JDK14中JVM的性能优化

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

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
