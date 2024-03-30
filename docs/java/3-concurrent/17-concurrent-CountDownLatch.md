---
slug: /concurrent-CountDownLatch
---

# 17. java并发中CountDownLatch的使用

在java并发中，控制共享变量的访问非常重要，有时候我们也想控制并发线程的执行顺序，比如：等待所有线程都执行完毕之后再执行另外的线程，或者等所有线程都准备好了才开始所有线程的执行等。

这个时候我们就可以使用到CountDownLatch。

简单点讲，CountDownLatch存有一个放在QueuedSynchronizer中的计数器。当调用countdown() 方法时，该计数器将会减一。然后再调用await()来等待计数器归零。

~~~java

private static final class Sync extends AbstractQueuedSynchronizer {
    ...
}

private final Sync sync;

    public void countDown() {
        sync.releaseShared(1);
    }
~~~

~~~java
    public void await() throws InterruptedException {
        sync.acquireSharedInterruptibly(1);
    }

    public boolean await(long timeout, TimeUnit unit)
        throws InterruptedException {
        return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
    }

~~~

下面我们举两个使用的例子:

## 主线程等待子线程全都结束之后再开始运行

这里我们定义子线程类，在子线程类里面，我们传入一个CountDownLatch用来计数，然后在子线程结束之前，调用该CountDownLatch的countDown方法。最后在主线程中调用await（）方法来等待子线程结束执行。

~~~java
@Slf4j
public class MainThreadWaitUsage implements Runnable {

    private List<String> outputScraper;
    private CountDownLatch countDownLatch;

    public MainThreadWaitUsage(List<String> outputScraper, CountDownLatch countDownLatch) {
        this.outputScraper = outputScraper;
        this.countDownLatch = countDownLatch;
    }

    @Override
    public void run() {
        outputScraper.add("Counted down");
        countDownLatch.countDown();
    }
}
~~~

看下怎么调用：

~~~java
    @Test
    public void testCountDownLatch()
            throws InterruptedException {

        List<String> outputScraper = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch countDownLatch = new CountDownLatch(5);
        List<Thread> workers = Stream
                .generate(() -> new Thread(new MainThreadWaitUsage(outputScraper, countDownLatch)))
                .limit(5)
                .collect(toList());

        workers.forEach(Thread::start);
        countDownLatch.await();
        outputScraper.add("Latch released");
        log.info(outputScraper.toString());

    }
~~~

执行结果如下：

~~~txt
07:37:27.388 [main] INFO MainThreadWaitUsageTest - [Counted down, Counted down, Counted down, Counted down, Counted down, Latch released]
~~~

## 等待所有线程都准备好再一起执行

上面的例子中，我们是主线程等待子线程，那么在这个例子中，我们将会看看怎么子线程一起等待到准备好的状态，再一起执行。

思路也很简单，在子线程开始之后，将等待的子线程计数器减一，在主线程中await该计数器，等计数器归零之后，主线程再通知子线程运行。

~~~java
public class ThreadWaitThreadUsage implements Runnable {

    private List<String> outputScraper;
    private CountDownLatch readyThreadCounter;
    private CountDownLatch callingThreadBlocker;
    private CountDownLatch completedThreadCounter;

    public ThreadWaitThreadUsage(
            List<String> outputScraper,
            CountDownLatch readyThreadCounter,
            CountDownLatch callingThreadBlocker,
            CountDownLatch completedThreadCounter) {

        this.outputScraper = outputScraper;
        this.readyThreadCounter = readyThreadCounter;
        this.callingThreadBlocker = callingThreadBlocker;
        this.completedThreadCounter = completedThreadCounter;
    }

    @Override
    public void run() {
        readyThreadCounter.countDown();
        try {
            callingThreadBlocker.await();
            outputScraper.add("Counted down");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            completedThreadCounter.countDown();
        }
    }
}
~~~

看下怎么调用：

~~~java
    @Test
    public void testCountDownLatch()
            throws InterruptedException {

        List<String> outputScraper = Collections.synchronizedList(new ArrayList<>());
        CountDownLatch readyThreadCounter = new CountDownLatch(5);
        CountDownLatch callingThreadBlocker = new CountDownLatch(1);
        CountDownLatch completedThreadCounter = new CountDownLatch(5);
        List<Thread> workers = Stream
                .generate(() -> new Thread(new ThreadWaitThreadUsage(
                        outputScraper, readyThreadCounter, callingThreadBlocker, completedThreadCounter)))
                .limit(5)
                .collect(toList());

        workers.forEach(Thread::start);
        readyThreadCounter.await();
        outputScraper.add("Workers ready");
        callingThreadBlocker.countDown();
        completedThreadCounter.await();
        outputScraper.add("Workers complete");

        log.info(outputScraper.toString());

    }
~~~

输出结果如下：

~~~txt
07:41:47.861 [main] INFO ThreadWaitThreadUsageTest - [Workers ready, Counted down, Counted down, Counted down, Counted down, Counted down, Workers complete]
~~~

## 停止CountdownLatch的await

如果我们调用await（）方法，该方法将会等待一直到count=0才结束。但是如果在线程执行过程中出现了异常，可能导致countdown方法执行不了。那么await（）方法可能会出现无限等待的情况。

这个时候我们可以使用：

~~~java
    public boolean await(long timeout, TimeUnit unit)
        throws InterruptedException {
        return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));
    }
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/CountDownLatch](https://github.com/ddean2009/learn-java-concurrency/tree/master/CountDownLatch)


