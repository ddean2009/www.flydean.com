---
slug: /concurrent-kill-thread
---

# 11. 怎么在java中关闭一个thread

我们经常需要在java中用到thread，我们知道thread有一个start()方法可以开启一个线程。那么怎么关闭这个线程呢？

有人会说可以用Thread.stop（）方法。但是这个方法已经被废弃了。

根据Oracle的官方文档，Thread.stop是不安全的。因为调用stop方法的时候，将会释放它获取的所有监视器锁（通过传递ThreadDeath异常实现）。如果有资源被该监视器锁所保护的话，就可能会出现数据不一致的异常。并且这种异常很难被发现。 所以现在已经不推荐是用Thread.stop方法了。 

那我们还有两种方式来关闭一个Thread。

1. Flag变量

如果我们有一个无法自动停止的Thread，我们可以创建一个条件变量，通过不断判断该变量的值，来决定是否结束该线程的运行。

~~~java
public class KillThread implements Runnable {
    private Thread worker;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private int interval;

    public KillThread(int sleepInterval) {
        interval = sleepInterval;
    }

    public void start() {
        worker = new Thread(this);
        worker.start();
    }

    public void stop() {
        running.set(false);
    }

    public void run() {
        running.set(true);
        while (running.get()) {
            try {
                Thread.sleep(interval);
            } catch (InterruptedException e){
                Thread.currentThread().interrupt();
                log.info("Thread was interrupted, Failed to complete operation");
            }
            // do something here
        }
        log.info("finished");
    }

    public static void main(String[] args) {
        KillThread killThread= new KillThread(1000);
        killThread.start();
        killThread.stop();
    }


}
~~~

上面的例子中，我们通过定义一个AtomicBoolean 的原子变量来存储Flag标志。

我们将会在后面的文章中详细的讲解原子变量。

2. 调用interrupt()方法

通过调用interrupt()方法，将会中断正在等待的线程，并抛出InterruptedException异常。

根据Oracle的说明，如果你想自己处理这个异常的话，需要reasserts出去，注意，这里是reasserts而不是rethrows，因为有些情况下，无法rethrow这个异常，我们需要这样做：

~~~java
 Thread.currentThread().interrupt();
~~~

这将会reasserts InterruptedException异常。

看下我们第二种方法怎么调用：

~~~java
public class KillThread implements Runnable {
    private Thread worker;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private int interval;

    public KillThread(int sleepInterval) {
        interval = sleepInterval;
    }

    public void start() {
        worker = new Thread(this);
        worker.start();
    }

    public void interrupt() {
        running.set(false);
        worker.interrupt();
    }

    public void stop() {
        running.set(false);
    }

    public void run() {
        running.set(true);
        while (running.get()) {
            try {
                Thread.sleep(interval);
            } catch (InterruptedException e){
                Thread.currentThread().interrupt();
                log.info("Thread was interrupted, Failed to complete operation");
            }
            // do something here
        }
        log.info("finished");
    }

    public static void main(String[] args) {
        KillThread killThread= new KillThread(1000);
        killThread.start();
        killThread.interrupt();
    }
}
~~~

上面的例子中，当线程在Sleep中时，调用了interrupt方法，sleep会退出，并且抛出InterruptedException异常。

本文的例子请参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/kill-thread](https://github.com/ddean2009/learn-java-concurrency/tree/master/kill-thread)

更多教程请参考 [flydean的博客](http://www.flydean.com)
