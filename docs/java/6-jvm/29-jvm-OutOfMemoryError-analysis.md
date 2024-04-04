---
slug: /jvm-OutOfMemoryError-analysis
---

# 29. troubleshoot之:分析OutOfMemoryError异常

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

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！








