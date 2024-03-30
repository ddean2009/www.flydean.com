---
slug: /concurrent-FutureTask
---

# 21. java中FutureTask的使用

## FutureTask简介

FutureTask是java 5引入的一个类，从名字可以看出来FutureTask既是一个Future，又是一个Task。

我们看下FutureTask的定义：

~~~java
public class FutureTask<V> implements RunnableFuture<V> {
    ...
}
~~~

~~~java
public interface RunnableFuture<V> extends Runnable, Future<V> {
    /**
     * Sets this Future to the result of its computation
     * unless it has been cancelled.
     */
    void run();
}
~~~

FutureTask实现了RunnableFuture接口，RunnableFuture接口是Runnable和Future的综合体。

作为一个Future，FutureTask可以执行异步计算，可以查看异步程序是否执行完毕，并且可以开始和取消程序，并取得程序最终的执行结果。

除此之外，FutureTask还提供了一个runAndReset()的方法， 该方法可以运行task并且重置Future的状态。

## Callable和Runnable的转换

我们知道Callable是有返回值的，而Runnable是没有返回值的。
Executors提供了很多有用的方法，将Runnable转换为Callable：

~~~java
    public static <T> Callable<T> callable(Runnable task, T result) {
        if (task == null)
            throw new NullPointerException();
        return new RunnableAdapter<T>(task, result);
    }
~~~

FutureTask内部包含一个Callable，并且可以接受Callable和Runnable作为构造函数：

~~~java
    public FutureTask(Callable<V> callable) {
        if (callable == null)
            throw new NullPointerException();
        this.callable = callable;
        this.state = NEW;       // ensure visibility of callable
    }
~~~

~~~java
    public FutureTask(Runnable runnable, V result) {
        this.callable = Executors.callable(runnable, result);
        this.state = NEW;       // ensure visibility of callable
    }
~~~

它的内部就是调用了Executors.callable(runnable, result);方法进行转换的。

## 以Runnable运行

既然是一个Runnable，那么FutureTask就可以以线程的方式执行，我们来看一个例子：


~~~java
@Test
    public void convertRunnableToCallable() throws ExecutionException, InterruptedException {
        FutureTask<Integer> futureTask = new FutureTask<>(new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {
               log.info("inside callable future task ...");
                return 0;
            }
        });

        Thread thread= new Thread(futureTask);
        thread.start();
        log.info(futureTask.get().toString());
    }
~~~

上面例子是以单个线程来执行的，同样我们也可以将FutureTask提交给线程池来执行：

~~~java
    @Test
    public void workWithExecutorService() throws ExecutionException, InterruptedException {
        FutureTask<Integer> futureTask = new FutureTask<>(new Callable<Integer>() {
            @Override
            public Integer call() throws Exception {
                log.info("inside futureTask");
                return 1;
            }
        });
        ExecutorService executor = Executors.newCachedThreadPool();
        executor.submit(futureTask);
        executor.shutdown();
        log.info(futureTask.get().toString());
    }
~~~

本文的例子可参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/futureTask](https://github.com/ddean2009/learn-java-concurrency/tree/master/futureTask)

