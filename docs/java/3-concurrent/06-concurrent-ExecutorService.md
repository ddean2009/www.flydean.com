---
slug: /concurrent-ExecutorService
---

# 6. java并发中ExecutorService的使用

ExecutorService是java中的一个异步执行的框架，通过使用ExecutorService可以方便的创建多线程执行环境。

本文将会详细的讲解ExecutorService的具体使用。

## 创建ExecutorService

通常来说有两种方法来创建ExecutorService。

第一种方式是使用Executors中的工厂类方法，例如：

~~~java
ExecutorService executor = Executors.newFixedThreadPool(10);
~~~

除了newFixedThreadPool方法之外，Executors还包含了很多创建ExecutorService的方法。

第二种方法是直接创建一个ExecutorService， 因为ExecutorService是一个interface，我们需要实例化ExecutorService的一个实现。

这里我们使用ThreadPoolExecutor来举例：

~~~java
ExecutorService executorService =
            new ThreadPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS,
                    new LinkedBlockingQueue<Runnable>());
~~~

## 为ExecutorService分配Tasks

ExecutorService可以执行Runnable和Callable的task。其中Runnable是没有返回值的，而Callable是有返回值的。我们分别看一下两种情况的使用：

~~~java
Runnable runnableTask = () -> {
    try {
        TimeUnit.MILLISECONDS.sleep(300);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
};
 
Callable<String> callableTask = () -> {
    TimeUnit.MILLISECONDS.sleep(300);
    return "Task's execution";
};
~~~

将task分配给ExecutorService，可以通过调用xecute(), submit(), invokeAny(), invokeAll()这几个方法来实现。

execute() 返回值是void，他用来提交一个Runnable task。

~~~java
executorService.execute(runnableTask);
~~~

submit() 返回值是Future，它可以提交Runnable task, 也可以提交Callable task。 提交Runnable的有两个方法：

~~~java
<T> Future<T> submit(Runnable task, T result);

Future<?> submit(Runnable task);
~~~

第一个方法在返回传入的result。第二个方法返回null。

再看一下callable的使用：

~~~java
Future<String> future = 
  executorService.submit(callableTask);
~~~

invokeAny() 将一个task列表传递给executorService，并返回其中的一个成功返回的结果。

~~~java
String result = executorService.invokeAny(callableTasks);
~~~

invokeAll() 将一个task列表传递给executorService，并返回所有成功执行的结果：

~~~java
List<Future<String>> futures = executorService.invokeAll(callableTasks);
~~~

## 关闭ExecutorService

如果ExecutorService中的任务运行完毕之后，ExecutorService不会自动关闭。它会等待接收新的任务。如果需要关闭ExecutorService， 我们需要调用shutdown() 或者 shutdownNow() 方法。

 shutdown() 会立即销毁ExecutorService，它会让ExecutorServic停止接收新的任务，并等待现有任务全部执行完毕再销毁。

 ~~~java
executorService.shutdown();
 ~~~

 shutdownNow()并不保证所有的任务都被执行完毕，它会返回一个未执行任务的列表：

 ~~~java
List<Runnable> notExecutedTasks = executorService.shutdownNow();
 ~~~

 oracle推荐的最佳关闭方法是和awaitTermination一起使用：

 ~~~java
 executorService.shutdown();
        try {
            if (!executorService.awaitTermination(800, TimeUnit.MILLISECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
        }
 ~~~

 先停止接收任务，然后再等待一定的时间让所有的任务都执行完毕，如果超过了给定的时间，则立刻结束任务。

 ## Future

 submit() 和 invokeAll() 都会返回Future对象。之前的文章我们已经详细讲过了Future。 这里就只列举一下怎么使用：

 ~~~java
 Future<String> future = executorService.submit(callableTask);
String result = null;
try {
    result = future.get();
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
}
 ~~~

 ## ScheduledExecutorService

 ScheduledExecutorService为我们提供了定时执行任务的机制。

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

## ExecutorService和 Fork/Join

java 7 引入了Fork/Join框架。 那么两者的区别是什么呢？

ExecutorService可以由用户来自己控制生成的线程，提供了对线程更加细粒度的控制。而Fork/Join则是为了让任务更加快速的执行完毕。

本文的代码请参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/ExecutorService](https://github.com/ddean2009/learn-java-concurrency/tree/master/ExecutorService)


