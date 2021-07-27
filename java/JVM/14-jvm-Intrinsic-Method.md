JVM详解之:HotSpot VM中的Intrinsic methods

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

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



















