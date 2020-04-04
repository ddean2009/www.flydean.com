java中wait和sleep的区别

在本篇文章中，我们将会讨论一下java中wait()和sleep()方法的区别。并讨论一下怎么使用这两个方法。

## Wait和sleep的区别

wait() 是Object中定义的native方法：

~~~java
public final native void wait(long timeout) throws InterruptedException;
~~~

所以每一个类的实例都可以调用这个方法。wait()只能在synchronized block中调用。它会释放synchronized时加在object上的锁。

sleep()是定义Thread中的native静态类方法：

~~~java
public static native void sleep(long millis) throws InterruptedException;
~~~

所以Thread.sleep()可以在任何情况下调用。Thread.sleep()将会暂停当前线程，并且不会释放任何锁资源。

我们先看一下一个简单的wait使用：

~~~java
@Slf4j
public class WaitUsage {

    private static Object LOCK = new Object();

    public static void WaitExample() throws InterruptedException {
        synchronized (LOCK) {
            LOCK.wait(1000);
            log.info("Object '" + LOCK + "' is woken after" +
                    " waiting for 1 second");
        }
    }
}
~~~

再看一下sleep的使用：

~~~java
@Slf4j
public class SleepUsage {

    public static void sleepExample() throws InterruptedException {
        Thread.sleep(1000);
        log.info(
                "Thread '" + Thread.currentThread().getName() +
                        "' is woken after sleeping for 1 second");
    }
}
~~~

## 唤醒wait和sleep

sleep()方法自带sleep时间，时间过后，Thread会自动被唤醒。
或者可以通过调用interrupt()方法来中断。

相比而言wait的唤醒会比较复杂，我们需要调用notify() 和 notifyAll()方法来唤醒等待在特定wait object上的线程。

notify()会根据线程调度的机制选择一个线程来唤醒，而notifyAll()会唤醒所有等待的线程，由这些线程重新争夺资源锁。

wait,notity通常用在生产者和消费者情形，我们看下怎么使用：

~~~java
@Slf4j
public class WaitNotifyUsage {

    private int count =0;

    public void produceMessage() throws InterruptedException {

        while(true) {
            synchronized (this) {
                while (count == 5) {
                    log.info("count == 5 , wait ....");
                    wait();
                }
                count++;
                log.info("produce count {}", count);
                notify();
            }
        }
    }

    public void consumeMessage() throws InterruptedException {

        while (true) {
            synchronized (this) {
                while (count == 0) {
                    log.info("count == 0, wait ...");
                    wait();
                }
                log.info("consume count {}", count);
                count--;
                notify();
            }
        }
    }
}
~~~

看下怎么调用：

~~~java
   @Test
    public void testWaitNotifyUsage() throws InterruptedException{
        WaitNotifyUsage waitNotifyUsage=new WaitNotifyUsage();

        ExecutorService executorService=Executors.newFixedThreadPool(4);
        executorService.submit(()-> {
            try {
                waitNotifyUsage.produceMessage();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        executorService.submit(()-> {
            try {
                waitNotifyUsage.consumeMessage();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        Thread.sleep(50000);
    }
~~~











