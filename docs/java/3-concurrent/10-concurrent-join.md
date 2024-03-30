---
slug: /concurrent-join
---

# 10. java中join的使用

join()应该是我们在java中经常会用到的一个方法，它主要是将当前线程置为WAITTING状态，然后等待调用的线程执行完毕或被interrupted。

join()是Thread中定义的方法，我们看下他的定义：

~~~java
   /**
     * Waits for this thread to die.
     *
     * <p> An invocation of this method behaves in exactly the same
     * way as the invocation
     *
     * <blockquote>
     * {@linkplain #join(long) join}{@code (0)}
     * </blockquote>
     *
     * @throws  InterruptedException
     *          if any thread has interrupted the current thread. The
     *          <i>interrupted status</i> of the current thread is
     *          cleared when this exception is thrown.
     */
    public final void join() throws InterruptedException {
        join(0);
    }

~~~

我们看下join是怎么使用的，通常我们需要在线程A中调用线程B.join():

~~~java
public class JoinThread implements Runnable{
    public int processingCount = 0;

    JoinThread(int processingCount) {
        this.processingCount = processingCount;
        log.info("Thread Created");
    }

    @Override
    public void run() {
        log.info("Thread " + Thread.currentThread().getName() + " started");
        while (processingCount > 0) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                log.info("Thread " + Thread.currentThread().getName() + " interrupted");
            }
            processingCount--;
        }
        log.info("Thread " + Thread.currentThread().getName() + " exiting");
    }

    @Test
    public void joinTest()
            throws InterruptedException {
        Thread t2 = new Thread(new JoinThread(1));
        t2.start();
        log.info("Invoking join");
        t2.join();
        log.info("Returned from join");
        log.info("t2 status {}",t2.isAlive());
    }
}
~~~

我们在主线程中调用了t2.join(),则主线程将会等待t2执行完毕，我们看下输出结果：

~~~txt
06:17:14.775 [main] INFO com.flydean.JoinThread - Thread Created
06:17:14.779 [main] INFO com.flydean.JoinThread - Invoking join
06:17:14.779 [Thread-0] INFO com.flydean.JoinThread - Thread Thread-0 started
06:17:15.783 [Thread-0] INFO com.flydean.JoinThread - Thread Thread-0 exiting
06:17:15.783 [main] INFO com.flydean.JoinThread - Returned from join
06:17:15.783 [main] INFO com.flydean.JoinThread - t2 status false
~~~

当线程已经执行完毕或者还没开始执行的时候，join（）将会立即返回：

~~~java
Thread t1 = new SampleThread(0);
t1.join();  //returns immediately
~~~

join还有两个带时间参数的方法：

~~~java
public final void join(long millis) throws InterruptedException
~~~

~~~java
public final void join(long millis,int nanos) throws InterruptedException
~~~

如果在给定的时间内调用的线程没有返回，则主线程将会继续执行：

~~~java
    @Test
    public void testJoinTimeout()
            throws InterruptedException {
        Thread t3 =  new Thread(new JoinThread(10));
        t3.start();
        t3.join(1000);
        log.info("t3 status {}", t3.isAlive());
    }
~~~

上面的例子将会输出：

~~~txt
06:30:58.159 [main] INFO com.flydean.JoinThread - Thread Created
06:30:58.163 [Thread-0] INFO com.flydean.JoinThread - Thread Thread-0 started
06:30:59.172 [main] INFO com.flydean.JoinThread - t3 status true
~~~

Join()还有个happen-before的特性，这就是如果thread t1调用 t2.join(), 那么当t2返回时，所有t2的变动都会t1可见。

之前我们讲volatile关键词的时候也提到了这个happen-before规则。  我们看下例子：

~~~java
    @Test
    public void testHappenBefore() throws InterruptedException {
        JoinThread t4 =  new JoinThread(10);
        t4.start();
        // not guaranteed to stop even if t4 finishes.
        do {
            log.info("inside the loop");
            Thread.sleep(1000);
        } while ( t4.processingCount > 0);
    }
~~~

我们运行下，可以看到while循环一直在进行中，即使t4中的变量已经变成了0。

所以如果我们需要在这种情况下使用的话，我们需要用到join（），或者其他的同步机制。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/join](https://github.com/ddean2009/learn-java-concurrency/tree/master/join)

更多教程请参考 [flydean的博客](www.flydean.com)


