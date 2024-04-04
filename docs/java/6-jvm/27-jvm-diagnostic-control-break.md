---
slug: /jvm-diagnostic-control-break
---

# 27. troubleshoot之:用control+break解决线程死锁问题

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

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



