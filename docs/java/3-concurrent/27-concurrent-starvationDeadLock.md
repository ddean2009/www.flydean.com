---
slug: /concurrent-starvationDeadLock
---

# 27. 我们的线程被饿死了

我们在构建线程池的时候可以构建单个线程的线程池和多个线程的线程池。

那么线程池使用不当可不可能产生死锁呢？我们知道死锁是循环争夺资源而产生的。线程池中的线程也是资源的一种，那么如果对线程池中的线程进行争夺的话也是可能产生死锁的。

在单个线程的线程池中，如果一个正在执行的线程中，使用该线程池再去提交第二个任务，因为线程池中的线程只有一个，那么第二个任务将会等待第一个任务的执行完成来释放线程，而第一个任务又在等待第二任务的执行来完成任务。从而产生了线程饥饿死锁（Thread Starvation Deadlock）.

线程饥饿死锁并不一定在单个线程的线程池中产生，只要有这种循环使用线程池的情况都可能产生这种问题。

我们看下例子：

~~~java
public class ThreadPoolDeadlock {

    ExecutorService executorService= Executors.newSingleThreadExecutor();

    public class RenderPageTask implements Callable<String> {
        public String call() throws Exception{
            Future<String> header, footer;
            header= executorService.submit(()->{
                return "header";
            });
            footer= executorService.submit(()->{
                return "footer";
            });
            return header.get()+ footer.get();
        }
    }

    public void submitTask(){
        executorService.submit(new RenderPageTask());
    }
}
~~~

我们在executorService中提交了一个RenderPageTask，而RenderPageTask又提交了两个task。因为ExecutorService线程池只有一个线程，则会产生死锁。

我们的线程被饿死了！

本文的例子请参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/ThreadPoolDeadlock](https://github.com/ddean2009/learn-java-concurrency/tree/master/ThreadPoolDeadlock)

更多内容请访问 [flydean的博客](http://www.flydean.com)

