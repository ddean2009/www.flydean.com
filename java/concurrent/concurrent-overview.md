java.util.concurrent简介

java.util.concurrent包提供了很多有用的类，方便我们进行并发程序的开发。本文将会做一个总体的简单介绍。

## 主要的组件

java.util.concurrent包含了很多内容， 本文将会挑选其中常用的一些类来进行大概的说明：

* Executor
* ExecutorService
* ScheduledExecutorService
* Future
* CountDownLatch
* CyclicBarrier
* Semaphore
* ThreadFactory

## Executor

Executor是一个接口，它定义了一个execute方法，这个方法接收一个Runnable，并在其中调用Runnable的run方法。

我们看一个Executor的实现：

~~~java
public class Invoker implements Executor {
    @Override
    public void execute(Runnable r) {
        r.run();
    }
}
~~~

现在我们可以直接调用该类中的方法：

~~~java
    public void execute() {
        Executor executor = new Invoker();
        executor.execute( () -> {
            log.info("{}", Thread.currentThread().toString());
        });
    }
~~~

> 注意，Executor并不一定要求执行的任务是异步的。

## ExecutorService

如果我们真正的需要使用多线程的话，那么就需要用到ExecutorService了。 

ExecutorService管理了一个内存的队列，并定时提交可用的线程。

我们首先定义一个Runnable类：

~~~java
public class Task implements Runnable {
    @Override
    public void run() {
        // task details
    }
}
~~~

我们可以通过Executors来方便的创建ExecutorService：

~~~java
ExecutorService executor = Executors.newFixedThreadPool(10);
~~~

上面创建了一个ThreadPool， 我们也可以创建单线程的ExecutorService：

~~~java
ExecutorService executor =Executors.newSingleThreadExecutor();
~~~

我们这样提交task：

~~~java
public void execute() { 
    executor.submit(new Task()); 
}
~~~


因为ExecutorService维持了一个队列，所以它不会自动关闭， 我们需要调用executor.shutdown() 或者executor.shutdownNow()来关闭它。

如果想要判断ExecutorService中的线程在收到shutdown请求后是否全部执行完毕，可以调用如下的方法：

~~~java
try {
            executor.awaitTermination( 5l, TimeUnit.SECONDS );
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
~~~

## ScheduledExecutorService

ScheduledExecutorService和ExecutorService很类似，但是它可以周期性的执行任务。

我们这样创建ScheduledExecutorService：

~~~java
ScheduledExecutorService executorService
                = Executors.newSingleThreadScheduledExecutor();
~~~

executorService的schedule方法，可以传入Runnable也可以传入Callable：

~~~java
Future<String> future = executorService.schedule(() -> {
        // ...
        return "Hello world";
    }, 1, TimeUnit.SECONDS);
 
    ScheduledFuture<?> scheduledFuture = executorService.schedule(() -> {
        // ...
    }, 1, TimeUnit.SECONDS);
~~~

还有两个比较相近的方法：

~~~java
scheduleAtFixedRate( Runnable command, long initialDelay, long period, TimeUnit unit )

scheduleWithFixedDelay( Runnable command, long initialDelay, long delay, TimeUnit unit ) 
~~~

两者的区别是前者的period是以任务开始时间来计算的，后者是以任务结束时间来计算。

## Future

Future用来获取异步执行的结果。可以调用cancel(boolean mayInterruptIfRunning) 方法来取消线程的执行。

我们看下怎么得到一个Future对象：

~~~java
public void invoke() {
    ExecutorService executorService = Executors.newFixedThreadPool(10);
 
    Future<String> future = executorService.submit(() -> {
        // ...
        Thread.sleep(10000l);
        return "Hello world";
    });
}
~~~

我们看下怎么获取Future的结果：

~~~java
if (future.isDone() && !future.isCancelled()) {
    try {
        str = future.get();
    } catch (InterruptedException | ExecutionException e) {
        e.printStackTrace();
    }
}
~~~

future还可以接受一个时间参数，超过指定的时间，将会报TimeoutException。

~~~java
try {
    future.get(10, TimeUnit.SECONDS);
} catch (InterruptedException | ExecutionException | TimeoutException e) {
    e.printStackTrace();
}
~~~

## CountDownLatch

CountDownLatch是一个并发中很有用的类，CountDownLatch会初始化一个counter，通过这个counter变量，来控制资源的访问。我们会在后面的文章详细介绍。

## CyclicBarrier

CyclicBarrier和CountDownLatch很类似。CyclicBarrier主要用于多个线程互相等待的情况，可以通过调用await() 方法等待，知道达到要等的数量。

~~~java
public class Task implements Runnable {
 
    private CyclicBarrier barrier;
 
    public Task(CyclicBarrier barrier) {
        this.barrier = barrier;
    }
 
    @Override
    public void run() {
        try {
            LOG.info(Thread.currentThread().getName() + 
              " is waiting");
            barrier.await();
            LOG.info(Thread.currentThread().getName() + 
              " is released");
        } catch (InterruptedException | BrokenBarrierException e) {
            e.printStackTrace();
        }
    }
 
}
~~~

~~~java
public void start() {
 
    CyclicBarrier cyclicBarrier = new CyclicBarrier(3, () -> {
        // ...
        LOG.info("All previous tasks are completed");
    });
 
    Thread t1 = new Thread(new Task(cyclicBarrier), "T1"); 
    Thread t2 = new Thread(new Task(cyclicBarrier), "T2"); 
    Thread t3 = new Thread(new Task(cyclicBarrier), "T3"); 
 
    if (!cyclicBarrier.isBroken()) { 
        t1.start(); 
        t2.start(); 
        t3.start(); 
    }
}
~~~

## Semaphore

Semaphore包含了一定数量的许可证，通过获取许可证，从而获得对资源的访问权限。通过 tryAcquire()来获取许可，如果获取成功，许可证的数量将会减少。

一旦线程release()许可，许可的数量将会增加。

我们看下怎么使用：

~~~java
static Semaphore semaphore = new Semaphore(10);
 
public void execute() throws InterruptedException {
 
    LOG.info("Available permit : " + semaphore.availablePermits());
    LOG.info("Number of threads waiting to acquire: " + 
      semaphore.getQueueLength());
 
    if (semaphore.tryAcquire()) {
        try {
            // ...
        }
        finally {
            semaphore.release();
        }
    }
 
}
~~~

## ThreadFactory

ThreadFactory可以很方便的用来创建线程：

~~~java
public class ThreadFactoryUsage implements ThreadFactory {
    private int threadId;
    private String name;

    public ThreadFactoryUsage(String name) {
        threadId = 1;
        this.name = name;
    }

    @Override
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r, name + "-Thread_" + threadId);
        log.info("created new thread with id : " + threadId +
                " and name : " + t.getName());
        threadId++;
        return t;
    }
}
~~~













