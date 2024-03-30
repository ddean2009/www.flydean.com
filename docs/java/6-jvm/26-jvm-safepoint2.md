---
slug: /jvm-safepoint2
---

# 26. JVM系列之:再谈java中的safepoint

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

在HotSpot VM中，你可以在汇编语言中看到safepoint的两种形式：`'{poll}'` 或者 `'{poll return}'` 。

## 总结

本文详细的讲解了JVM中Safepoint的作用，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



