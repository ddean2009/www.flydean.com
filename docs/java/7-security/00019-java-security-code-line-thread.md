---
slug: /java-security-code-line-thread
---

# 19. java安全编码指南之:Thread API调用规则

# 简介

java中多线程的开发中少不了使用Thread，我们在使用Thread中提供的API过程中，应该注意些什么规则呢？

一起来看一看吧。 

# start一个Thread

Thread中有两个方法，一个是start方法，一个是run方法，两个都可以调用，那么两个有什么区别呢？

先看一下start方法：

~~~java
public synchronized void start() {

        if (threadStatus != 0)
            throw new IllegalThreadStateException();
        group.add(this);
        boolean started = false;
        try {
            start0();
            started = true;
        } finally {
            try {
                if (!started) {
                    group.threadStartFailed(this);
                }
            } catch (Throwable ignore) {
            }
        }
    }

    private native void start0();
~~~

start()是一个synchronized的方法，通过它会去调用native的start0方法，而最终将会调用Thread的run()方法。

我们知道，创建一个Thread有两种方式，一种是传入一个Runnable，一个是继承Thread，并重写run()方法。

如果我们直接调用Thread的run()方法会发生什么事情呢？

先看一下run方法的定义：

~~~java
    public void run() {
        if (target != null) {
            target.run();
        }
    }
~~~

默认情况下， 这个target就是一个Runnable对象，如果Thread是通过Runnable来构建的话，调用Thread.run()会在当前线程中运行run方法中的内容。

如果Thread是以其形式构建，并且没有重新run()方法，那么直接调用Thread.run()将什么都不会做。

~~~java
    public void wrongStart(){
        Runnable runnable= ()-> System.out.println("in thread running!");
        Thread thread= new Thread(runnable);
        thread.run();
    }

    public void correctStart(){
        Runnable runnable= ()-> System.out.println("in thread running!");
        Thread thread= new Thread(runnable);
        thread.start();
    }
~~~

所以，上面两种调用方式，只有第二种是正确的。

# 不要使用ThreadGroup

Thread中有个字段类型是java.lang.ThreadGroup，这个主要是用来给Thread进行分组，我们看下Thread的这个构造函数：

~~~java
 public Thread(ThreadGroup group, Runnable target) {
        this(group, target, "Thread-" + nextThreadNum(), 0);
    }
~~~

上面的构造函数可以在传入runnable的同时传递一个ThreadGroup对Thread进行分组。

如果没有指定ThreadGroup，那么将会为其分配一个默认的default group。

ThreadGroup是做什么的呢？ThreadGroup是java 1.0引入的方法，主要是一次性的对一组thread进行操作。我们可以调用ThreadGroup.interrupt()来一次性的对整个Group的Thread进行interrupts操作。

虽然ThreadGroup提供了很多有用的方法，但是其中很多方法都被废弃了，比如：allowThreadSuspension(), resume(), stop(), 和 suspend()，并且ThreadGroup中还有很多方法是非线程安全的：

* ThreadGroup.activeCount()

这个方法主要是用来统计一个ThreadGroup中活动的线程个数，这个方法会统计还未启动的线程，同时也会受系统线程的影响，所以是不准确的。

* ThreadGroup.enumerate()

这个方法是将ThreadGroup和子group的线程拷贝到一个数组中，但是如果数组太小了，多余的线程是会被自动忽略的。

ThreadGroup本身有一个 stop() 方法用来停止所有的线程，但是stop是不安全的，已经被废弃了。

那么我们该怎么去安全的停止很多个线程呢？

使用executor.shutdown()就可以了。

# 不要使用stop()方法

刚刚讲了ThreadGroup中不要调用stop()方法，因为stop是不安全的。

调用stop方法会立马释放线程持有的所有的锁，并且会抛出ThreadDeath异常。

因为会释放所有的锁，所以可能会造成受这些锁保护的对象的状态发生不一致的情况。

替代的方法有两种，一种是使用volatile flag变量，来控制线程的循环执行：

~~~java
    private volatile boolean done = false;

    public void shutDown(){
        this.done= true;
    }

    public void stopWithFlag(){

        Runnable runnable= ()->{
            while(!done){
                System.out.println("in Runnable");
            }
        };

        Thread thread= new Thread(runnable);
        thread.start();
        shutDown();
    }
~~~

另外一种方法就是调用interrupt(), 这里我们要注意interrupt()的使用要点：

1. 如果当前线程实例在调用Object类的wait（），wait（long）或wait（long，int）方法或join（），join（long），join（long，int）方法，或者在该实例中调用了Thread.sleep（long）或Thread.sleep（long，int）方法，并且正在阻塞状态中时，则其中断状态将被清除，并将收到InterruptedException。

2. 如果此线程在InterruptibleChannel上的I/O操作中处于被阻塞状态，则该channel将被关闭，该线程的中断状态将被设置为true，并且该线程将收到java.nio.channels.ClosedByInterruptException异常。

3. 如果此线程在java.nio.channels.Selector中处于被被阻塞状态，则将设置该线程的中断状态为true，并且它将立即从select操作中返回。

4. 如果上面的情况都不成立，则设置中断状态为true。

先看下面的例子：

~~~java
    public static void main(String[] args)  {
        Runnable runnable= ()->{
            while (!Thread.interrupted()) {
             System.out.println("in thread");
            }
        };
        Thread thread= new Thread(runnable);
        thread.start();
        Thread.sleep(5000);
        thread.interrupt();
    }
~~~

我们在while循环中调用了Thread.interrupted()方法用来判断线程是否被设置了中断位，然后在main方法中调用了thread.interrupt()来设置中断，最终可以正确的停止Thread。

> 注意，这里运行的Thread并没有被阻塞，所以并不满足我们上面提到的第一个条件。

下面我们再看一个例子：

~~~java
    public static void main(String[] args)  {
        Runnable runnable= ()->{
            while (!Thread.interrupted()) {
             System.out.println("in thread");
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };

        Thread thread= new Thread(runnable);
        thread.start();
        thread.interrupt();
    }
~~~

这个例子和上面的例子不同之处就是在于，Thread中调用了sleep方法，导致Thread被阻塞了，最终满足了第一个条件，从而不会设置终端位，只会抛出InterruptedException，所以这个例子中线程是不会被停止的，大家一定要注意。

# wait 和 await 需要放在循环中调用

为什么要放在循环中呢？因为我们希望wait不是被错误的被唤醒，所以我们需要在wait被唤醒之后，重新检测一遍条件。

错误的调用是放在if语句中：

~~~java
synchronized (object) {
  if (<condition does not hold>) {
    object.wait();
  }
  // Proceed when condition holds
}
~~~

正确的方法是放在while循环中：

~~~java
synchronized (object) {
  while (<condition does not hold>) {
    object.wait();
  }
  // Proceed when condition holds
}
~~~

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！




