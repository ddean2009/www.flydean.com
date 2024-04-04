---
slug: /concurrent-rejectPolicy
---

# 28. java中有界队列的饱和策略(reject policy)

我们在使用ExecutorService的时候知道，在ExecutorService中有个一个Queue来保存提交的任务，通过不同的构造函数，我们可以创建无界的队列（ExecutorService.newCachedThreadPool）和有界的队列(ExecutorService newFixedThreadPool(int nThreads))。

无界队列很好理解，我们可以无限制的向ExecutorService提交任务。那么对于有界队列来说，如果队列满了该怎么处理呢？ 

今天我们要介绍一下java中ExecutorService的饱和策略(reject policy)。

以ExecutorService的具体实现ThreadPoolExecutor来说，它定义了4种饱和策略。分别是AbortPolicy，DiscardPolicy，DiscardOldestPolicy和CallerRunsPolicy。

如果要在ThreadPoolExecutor中设定饱和策略可以调用setRejectedExecutionHandler方法，如下所示：

~~~java
        ThreadPoolExecutor threadPoolExecutor= new ThreadPoolExecutor(5, 10, 10, TimeUnit.SECONDS, new LinkedBlockingDeque<Runnable>(20));
        threadPoolExecutor.setRejectedExecutionHandler(
                new ThreadPoolExecutor.AbortPolicy()
        );
~~~

上面的例子中我们定义了一个初始5个，最大10个工作线程的Thread Pool，并且定义其中的Queue的容量是20。如果提交的任务超出了容量，则会使用AbortPolicy策略。



## AbortPolicy

AbortPolicy意思是如果队列满了，最新的提交任务将会被拒绝，并抛出RejectedExecutionException异常：

~~~java
   public static class AbortPolicy implements RejectedExecutionHandler {
        /**
         * Creates an {@code AbortPolicy}.
         */
        public AbortPolicy() { }

        /**
         * Always throws RejectedExecutionException.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         * @throws RejectedExecutionException always
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            throw new RejectedExecutionException("Task " + r.toString() +
                                                 " rejected from " +
                                                 e.toString());
        }
    }
~~~

上面的代码中，rejectedExecution方法中我们直接抛出了RejectedExecutionException异常。

## DiscardPolicy

DiscardPolicy将会悄悄的丢弃提交的任务，而不报任何异常。

~~~java
public static class DiscardPolicy implements RejectedExecutionHandler {
        /**
         * Creates a {@code DiscardPolicy}.
         */
        public DiscardPolicy() { }

        /**
         * Does nothing, which has the effect of discarding task r.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        }
    }
~~~

## DiscardOldestPolicy

DiscardOldestPolicy将会丢弃最老的任务，保存最新插入的任务。

~~~java
   public static class DiscardOldestPolicy implements RejectedExecutionHandler {
        /**
         * Creates a {@code DiscardOldestPolicy} for the given executor.
         */
        public DiscardOldestPolicy() { }

        /**
         * Obtains and ignores the next task that the executor
         * would otherwise execute, if one is immediately available,
         * and then retries execution of task r, unless the executor
         * is shut down, in which case task r is instead discarded.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                e.getQueue().poll();
                e.execute(r);
            }
        }
    }
~~~

我们看到在rejectedExecution方法中，poll了最老的一个任务，然后使用ThreadPoolExecutor提交了一个最新的任务。

## CallerRunsPolicy

CallerRunsPolicy和其他的几个策略不同，它既不会抛弃任务，也不会抛出异常，而是将任务回退给调用者，使用调用者的线程来执行任务，从而降低调用者的调用速度。我们看下是怎么实现的：

~~~java
public static class CallerRunsPolicy implements RejectedExecutionHandler {
        /**
         * Creates a {@code CallerRunsPolicy}.
         */
        public CallerRunsPolicy() { }

        /**
         * Executes task r in the caller's thread, unless the executor
         * has been shut down, in which case the task is discarded.
         *
         * @param r the runnable task requested to be executed
         * @param e the executor attempting to execute this task
         */
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                r.run();
            }
        }
    }
~~~

在rejectedExecution方法中，直接调用了 r.run()方法，这会导致该方法直接在调用者的主线程中执行，而不是在线程池中执行。从而导致主线程在该任务执行结束之前不能提交任何任务。从而有效的阻止了任务的提交。

## 使用Semaphore

如果我们并没有定义饱和策略，那么有没有什么方法来控制任务的提交速度呢？考虑下之前我们讲到的Semaphore，我们可以指定一定的资源信号量来控制任务的提交，如下所示：

~~~java
public class SemaphoreUsage {

    private final Executor executor;
    private final Semaphore semaphore;

    public SemaphoreUsage(Executor executor, int count) {
        this.executor = executor;
        this.semaphore = new Semaphore(count);
    }

    public void submitTask(final Runnable command) throws InterruptedException {
        semaphore.acquire();
        try {
            executor.execute(() -> {
                        try {
                            command.run();
                        } finally {
                            semaphore.release();
                        }
                    }
            );
        } catch (RejectedExecutionException e) {
            semaphore.release();
        }
    }

}
~~~

本文的例子可参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/rejectPolicy](https://github.com/ddean2009/learn-java-concurrency/tree/master/rejectPolicy)

更多内容请访问 [flydean的博客](http://www.flydean.com)

