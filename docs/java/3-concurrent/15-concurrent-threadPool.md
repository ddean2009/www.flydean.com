---
slug: /concurrent-threadPool
---

# 15. java中ThreadPool的介绍和使用

## Thread Pool简介

在Java中，threads是和系统的threads相对应的，用来处理一系列的系统资源。不管在windows和linux下面，能开启的线程个数都是有限的，如果你在java程序中无限制的创建thread，那么将会遇到无线程可创建的情况。

CPU的核数是有限的，如果同时有多个线程正在运行中，那么CPU将会根据线程的优先级进行轮循，给每个线程分配特定的CPU时间。所以线程也不是越多越好。

在java中，代表管理ThreadPool的接口有两个：ExecutorService和Executor。 

我们运行线程的步骤一般是这样的：1. 创建一个ExecutorService。 2.将任务提交给ExecutorService。3.ExecutorService调度线程来运行任务。

画个图来表示：

![threadPool.png](https://img-blog.csdnimg.cn/20200306090243651.png)

下面我讲一下，怎么在java中使用ThreadPool。

## Executors, Executor 和 ExecutorService

Executors 提供了一系列简便的方法，来帮助我们创建ThreadPool。

Executor接口定义了一个方法：

~~~java
public interface Executor {

    /**
     * Executes the given command at some time in the future.  The command
     * may execute in a new thread, in a pooled thread, or in the calling
     * thread, at the discretion of the {@code Executor} implementation.
     *
     * @param command the runnable task
     * @throws RejectedExecutionException if this task cannot be
     * accepted for execution
     * @throws NullPointerException if command is null
     */
    void execute(Runnable command);
}
~~~

ExecutorService继承了Executor，提供了更多的线程池的操作。是对Executor的补充。

根据接口实现分离的原则，我们通常在java代码中使用ExecutorService或者Executor，而不是具体的实现类。

我们看下怎么通过Executors来创建一个Executor和ExecutorService：

~~~java
        Executor executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> log.info("in Executor"));


        ExecutorService executorService= Executors.newCachedThreadPool();
        executorService.submit(()->log.info("in ExecutorService"));
        executorService.shutdown();
~~~

关于ExecutorService的细节，我们这里就多讲了，感兴趣的朋友可以参考之前我写的ExecutorService的详细文章。

## ThreadPoolExecutor

ThreadPoolExecutor是ExecutorService接口的一个实现，它可以为线程池添加更加精细的配置，具体而言它可以控制这三个参数：corePoolSize, maximumPoolSize, 和 keepAliveTime。

PoolSize就是线程池里面的线程个数，corePoolSize表示的是线程池里面初始化和保持的最小的线程个数。

如果当前等待线程太多，可以设置maximumPoolSize来提供最大的线程池个数，从而线程池会创建更多的线程以供任务执行。

keepAliveTime是多余的线程未分配任务将会等待的时间。超出该时间，线程将会被线程池回收。

我们看下怎么创建一个ThreadPoolExecutor：

~~~java
        ThreadPoolExecutor threadPoolExecutor =
                new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS,
                        new LinkedBlockingQueue<Runnable>());
        threadPoolExecutor.submit(()->log.info("submit through threadPoolExecutor"));
        threadPoolExecutor.shutdown();
~~~

上面的例子中我们通过ThreadPoolExecutor的构造函数来创建ThreadPoolExecutor。

通常来说Executors已经内置了ThreadPoolExecutor的很多实现，我们来看下面的例子：

~~~java
ThreadPoolExecutor executor1 =
                (ThreadPoolExecutor) Executors.newFixedThreadPool(2);
        executor1.submit(() -> {
            Thread.sleep(1000);
            return null;
        });
        executor1.submit(() -> {
            Thread.sleep(1000);
            return null;
        });
        executor1.submit(() -> {
            Thread.sleep(1000);
            return null;
        });
        log.info("executor1 poolsize {}",executor1.getPoolSize());
        log.info("executor1 queuesize {}", executor1.getQueue().size());
        executor1.shutdown();
~~~

上的例子中我们Executors.newFixedThreadPool(2)来创建一个ThreadPoolExecutor。

上面的例子中我们提交了3个task。但是我们pool size只有2。所以还有一个1个不能立刻被执行，需要在queue中等待。

我们再看一个例子：

~~~java
ThreadPoolExecutor executor2 =
                (ThreadPoolExecutor) Executors.newCachedThreadPool();
        executor2.submit(() -> {
            Thread.sleep(1000);
            return null;
        });
        executor2.submit(() -> {
            Thread.sleep(1000);
            return null;
        });
        executor2.submit(() -> {
            Thread.sleep(1000);
            return null;
        });

        log.info("executor2 poolsize {}", executor2.getPoolSize());
        log.info("executor2 queue size {}", executor2.getQueue().size());
        executor2.shutdown();
~~~

上面的例子中我们使用Executors.newCachedThreadPool()来创建一个ThreadPoolExecutor。 运行之后我们可以看到poolsize是3，而queue size是0。这表明newCachedThreadPool会自动增加pool size。

如果thread在60秒钟之类没有被激活，则会被收回。

这里的Queue是一个SynchronousQueue，因为插入和取出基本上是同时进行的，所以这里的queue size基本都是0.

## ScheduledThreadPoolExecutor

还有个很常用的ScheduledThreadPoolExecutor，它继承自ThreadPoolExecutor, 并且实现了ScheduledExecutorService接口。

~~~java
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
~~~

我们看下怎么使用：

~~~java
ScheduledExecutorService executor = Executors.newScheduledThreadPool(5);
        executor.schedule(() -> {
            log.info("Hello World");
        }, 500, TimeUnit.MILLISECONDS);
~~~

上面的例子中，我们定义了一个定时任务将会在500毫秒之后执行。

之前我们也讲到了ScheduledExecutorService还有两个非常常用的方法：

* scheduleAtFixedRate -  以开始时间为间隔。
* scheduleWithFixedDelay - 以结束时间为间隔。

~~~java

CountDownLatch lock = new CountDownLatch(3);

        ScheduledExecutorService executor2 = Executors.newScheduledThreadPool(5);
        ScheduledFuture<?> future = executor2.scheduleAtFixedRate(() -> {
            log.info("in ScheduledFuture");
            lock.countDown();
        }, 500, 100, TimeUnit.MILLISECONDS);

        lock.await(1000, TimeUnit.MILLISECONDS);
        future.cancel(true);
~~~


## ForkJoinPool

ForkJoinPool是在java 7 中引入的新框架，我们将会在后面的文章中详细讲解。 这里做个简单的介绍。

ForkJoinPool主要用来生成大量的任务来做算法运算。如果用线程来做的话，会消耗大量的线程。但是在fork/join框架中就不会出现这个问题。

在fork/join中，任何task都可以生成大量的子task，然后通过使用join（）等待子task结束。

这里我们举一个例子：

~~~java
static class TreeNode {
 
    int value;
 
    Set<TreeNode> children;
 
    TreeNode(int value, TreeNode... children) {
        this.value = value;
        this.children = Sets.newHashSet(children);
    }
}
~~~

定义一个TreeNode，然后遍历所有的value，将其加起来：

~~~java
public  class CountingTask extends RecursiveTask<Integer> {

    private final TreeNode node;

    public CountingTask(TreeNode node) {
        this.node = node;
    }

    @Override
    protected Integer compute() {
        return node.value + node.children.stream()
                .map(childNode -> new CountingTask(childNode).fork()).mapToInt(ForkJoinTask::join).sum();
    }
}
~~~

下面是调用的代码：

~~~java
    public static void main(String[] args) {
        TreeNode tree = new TreeNode(5,
                new TreeNode(3), new TreeNode(2,
                new TreeNode(2), new TreeNode(8)));

        ForkJoinPool forkJoinPool = ForkJoinPool.commonPool();
        int sum = forkJoinPool.invoke(new CountingTask(tree));
    }
~~~

本文的例子请参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/threadPool](https://github.com/ddean2009/learn-java-concurrency/tree/master/threadPool)

更多教程请参考 [flydean的博客](www.flydean.com)








