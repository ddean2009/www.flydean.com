---
slug: /04-reactor-thread-schedulers
---

# 4. Reactor中的Thread和Scheduler

# 简介

今天我们要介绍的是Reactor中的多线程模型和定时器模型,Reactor之前我们已经介绍过了，它实际上是观察者模式的延伸。

所以从本质上来说，Reactor是和多线程无关的。你可以把它用在多线程或者不用在多线程。

今天将会给大家介绍一下如何在Reactor中使用多线程和定时器模型。

# Thread多线程

先看一下之前举的Flux的创建的例子：

~~~java
        Flux<String> flux = Flux.generate(
                () -> 0,
                (state, sink) -> {
                    sink.next("3 x " + state + " = " + 3*state);
                    if (state == 10) sink.complete();
                    return state + 1;
                });

        flux.subscribe(System.out::println);
~~~

可以看到，不管是Flux generator还是subscriber，他们实际上都是运行在同一个线程中的。

如果我们想让subscribe发生在一个新的线程中，我们需要新启动一个线程，然后在线程内部进行subscribe操作。

~~~java
        Mono<String> mono = Mono.just("hello ");

        Thread t = new Thread(() -> mono
                .map(msg -> msg + "thread ")
                .subscribe(v ->
                        System.out.println(v + Thread.currentThread().getName())
                )
        );
        t.start();
        t.join();
~~~

上面的例子中，Mono在主线程中创建，而subscribe发生在新启动的Thread中。

# Schedule定时器

很多情况下，我们的publisher是需要定时去调用一些方法，来产生元素的。Reactor提供了一个新的Schedule类来负责定时任务的生成和管理。

Scheduler是一个接口：

~~~java
public interface Scheduler extends Disposable 
~~~

它定义了一些定时器中必须要实现的方法：

比如立即执行的：

~~~java
Disposable schedule(Runnable task);
~~~

延时执行的：

~~~java
default Disposable schedule(Runnable task, long delay, TimeUnit unit)
~~~

和定期执行的：

~~~java
default Disposable schedulePeriodically(Runnable task, long initialDelay, long period, TimeUnit unit)
~~~

Schedule有一个工具类叫做Schedules，它提供了多个创建Scheduler的方法，它的本质就是对ExecutorService和ScheduledExecutorService进行封装，将其做为Supplier来创建Schedule。

简单点看Schedule就是对ExecutorService的封装。

#  Schedulers工具类

Schedulers工具类提供了很多个有用的工具类，我们来详细介绍一下：

Schedulers.immediate()：

提交的Runnable将会立马在当前线程执行。

Schedulers.single()：

使用同一个线程来执行所有的任务。

Schedulers.boundedElastic()：

创建一个可重用的线程池，如果线程池中的线程在长时间内都没有被使用，那么将会被回收。boundedElastic会有一个最大的线程个数，一般来说是CPU cores x 10。 如果目前没有可用的worker线程，提交的任务将会被放入队列等待。

Schedulers.parallel()：

创建固定个数的工作线程，个数和CPU的核数相关。

Schedulers.fromExecutorService(ExecutorService)：

从一个现有的线程池创建Scheduler。

Schedulers.newXXX：

Schedulers提供了很多new开头的方法，来创建各种各样的Scheduler。

我们看一个Schedulers的具体应用，我们可以指定特定的Scheduler来产生元素：

~~~java
Flux.interval(Duration.ofMillis(300), Schedulers.newSingle("test"))
~~~

# publishOn 和 subscribeOn

publishOn和subscribeOn主要用来进行切换Scheduler的执行上下文。

先讲一个结论，就是在链式调用中，publishOn可以切换Scheduler，但是subscribeOn并不会起作用。

这是因为真正的publish-subscribe关系只有在subscriber开始subscribe的时候才建立。

下面我们来具体看一下这两个方法的使用情况：

## publishOn

publishOn可以在链式调用的过程中，进行publish的切换：

~~~java
    @Test
    public void usePublishOn() throws InterruptedException {
        Scheduler s = Schedulers.newParallel("parallel-scheduler", 4);
        final Flux<String> flux = Flux
                .range(1, 2)
                .map(i -> 10 + i + ":"+ Thread.currentThread())
                .publishOn(s)
                .map(i -> "value " + i+":"+ Thread.currentThread());

        new Thread(() -> flux.subscribe(System.out::println),"ThreadA").start();
        System.out.println(Thread.currentThread());
        Thread.sleep(5000);
    }
~~~

上面我们创建了一个名字为parallel-scheduler的scheduler。

然后创建了一个Flux，Flux先做了一个map操作，然后切换执行上下文到parallel-scheduler，最后右执行了一次map操作。

最后，我们采用一个新的线程来进行subscribe的输出。

先看下输出结果：

~~~java
Thread[main,5,main]
value 11:Thread[ThreadA,5,main]:Thread[parallel-scheduler-1,5,main]
value 12:Thread[ThreadA,5,main]:Thread[parallel-scheduler-1,5,main]
~~~

可以看到,主线程的名字是Thread。Subscriber线程的名字是ThreadA。

那么在publishOn之前，map使用的线程就是ThreadA。 而在publishOn之后，map使用的线程就切换到了parallel-scheduler线程池。

## subscribeOn

subscribeOn是用来切换Subscriber的执行上下文，不管subscribeOn出现在调用链的哪个部分，最终都会应用到整个调用链上。

我们看一个例子：

~~~java
    @Test
    public void useSubscribeOn() throws InterruptedException {
        Scheduler s = Schedulers.newParallel("parallel-scheduler", 4);
        final Flux<String> flux = Flux
                .range(1, 2)
                .map(i -> 10 + i + ":" + Thread.currentThread())
                .subscribeOn(s)
                .map(i -> "value " + i + ":"+ Thread.currentThread());

        new Thread(() -> flux.subscribe(System.out::println), "ThreadA").start();
        Thread.sleep(5000);
    }
~~~

同样的，上面的例子中，我们使用了两个map，然后在两个map中使用了一个subscribeOn用来切换subscribe执行上下文。

看下输出结果：

~~~java
value 11:Thread[parallel-scheduler-1,5,main]:Thread[parallel-scheduler-1,5,main]
value 12:Thread[parallel-scheduler-1,5,main]:Thread[parallel-scheduler-1,5,main]
~~~

可以看到，不管哪个map，都是用的是切换过的parallel-scheduler。

本文的例子[learn-reactive](https://github.com/ddean2009/learn-reactive/tree/master/reactorIntroduction)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





