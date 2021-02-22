java中interrupt，interrupted和isInterrupted的区别

前面的文章我们讲到了调用interrupt()来停止一个Thread，本文将会详细讲解java中三个非常相似的方法interrupt，interrupted和isInterrupted。

## isInterrupted

首先看下最简单的isInterrupted方法。isInterrupted是Thread类中的一个实例方法：

~~~java
    public boolean isInterrupted() {
        return isInterrupted(false);
    }
~~~

通过调用isInterrupted（）可以判断实例线程是否被中断。

它的内部调用了isInterrupted(false)方法：

~~~java
  /**
     * Tests if some Thread has been interrupted.  The interrupted state
     * is reset or not based on the value of ClearInterrupted that is
     * passed.
     */
    private native boolean isInterrupted(boolean ClearInterrupted);
~~~

这个方法是个native方法，接收一个是否清除Interrupted标志位的参数。

我们可以看到isInterrupted()传入的参数是false，这就表示isInterrupted()只会判断是否被中断，而不会清除中断状态。

## interrupted

interrupted是Thread中的一个类方法：

~~~java
 public static boolean interrupted() {
        return currentThread().isInterrupted(true);
    }
~~~

我们可以看到，interrupted（）也调用了isInterrupted(true)方法，不过它传递的参数是true，表示将会清除中断标志位。

> 注意，因为interrupted()是一个类方法，调用isInterrupted(true)判断的是当前线程是否被中断。注意这里currentThread（）的使用。

## interrupt

前面两个是判断是否中断的方法，而interrupt（）就是真正触发中断的方法。

我们先看下interrupt的定义：

~~~java
    public void interrupt() {
        if (this != Thread.currentThread())
            checkAccess();

        synchronized (blockerLock) {
            Interruptible b = blocker;
            if (b != null) {
                interrupt0();           // Just to set the interrupt flag
                b.interrupt(this);
                return;
            }
        }
        interrupt0();
    }
~~~

从定义我们可以看到interrupt（）是一个实例方法。

它的工作要点有下面4点：

1. 如果当前线程实例在调用Object类的wait（），wait（long）或wait（long，int）方法或join（），join（long），join（long，int）方法，或者在该实例中调用了Thread.sleep（long）或Thread.sleep（long，int）方法，并且正在阻塞状态中时，则其中断状态将被清除，并将收到InterruptedException。

2. 如果此线程在InterruptibleChannel上的I / O操作中处于被阻塞状态，则该channel将被关闭，该线程的中断状态将被设置为true，并且该线程将收到java.nio.channels.ClosedByInterruptException异常。

3. 如果此线程在java.nio.channels.Selector中处于被被阻塞状态，则将设置该线程的中断状态为true，并且它将立即从select操作中返回。

4. 如果上面的情况都不成立，则设置中断状态为true。

我们来举个例子：

~~~java
@Slf4j
public class InterruptThread extends Thread {
    @Override
    public  void run() {
        for (int i = 0; i < 1000; i++) {
            log.info("i= {}", (i+1));
            log.info("call inside thread.interrupted()： {}", Thread.interrupted());
        }
    }

    @Test
    public void testInterrupt(){
        InterruptThread thread=new InterruptThread();
        thread.start();
        thread.interrupt();
        //test isInterrupted
        log.info("first call isInterrupted(): {}", thread.isInterrupted());
        log.info("second call isInterrupted(): {}", thread.isInterrupted());

        //test interrupted（)
        log.info("first call outside thread.interrupted()： {}", Thread.interrupted());
        log.info("second call outside thread.interrupted() {}：", Thread.interrupted());
        log.info("thread is alive : {}",thread.isAlive() );
    }
}
~~~

输出结果如下：

~~~txt
13:07:17.804 [main] INFO com.flydean.InterruptThread - first call isInterrupted(): true
13:07:17.808 [main] INFO com.flydean.InterruptThread - second call isInterrupted(): true

13:07:17.808 [Thread-1] INFO com.flydean.InterruptThread - call inside thread.interrupted()： true
13:07:17.808 [Thread-1] INFO com.flydean.InterruptThread - call inside thread.interrupted()： false

13:07:17.808 [main] INFO com.flydean.InterruptThread - first call outside thread.interrupted()： false
13:07:17.809 [main] INFO com.flydean.InterruptThread - second call outside thread.interrupted() false
~~~

上面的例子中，两次调用thread.isInterrupted()的值都是true。

在线程内部调用Thread.interrupted()， 只有第一次返回的是ture，后面返回的都是false，这表明第一次被重置了。

在线程外部，因为并没有中断外部线程，所以返回的值一直都是false。

本文的例子参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/interrupt](https://github.com/ddean2009/learn-java-concurrency/tree/master/interrupt)

更多教程请参考 [flydean的博客](www.flydean.com)
