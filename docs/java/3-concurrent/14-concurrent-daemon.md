---
slug: /concurrent-daemon
---

# 14. java中的daemon thread

java中有两种类型的thread，user threads 和 daemon threads。

User threads是高优先级的thread，JVM将会等待所有的User Threads运行完毕之后才会结束运行。

daemon threads是低优先级的thread，它的作用是为User Thread提供服务。 因为daemon threads的低优先级，并且仅为user thread提供服务，所以当所有的user thread都结束之后，JVM会自动退出，不管是否还有daemon threads在运行中。

因为这个特性，所以我们通常在daemon threads中处理无限循环的操作，因为这样不会影响user threads的运行。

daemon threads并不推荐使用在I/O操作中。

但是有些不当的操作也可能导致daemon threads阻塞JVM关闭，比如在daemon thread中调用join（）方法。

我们看下怎么创建daemon thread：

~~~java
public class DaemonThread extends Thread{

    public void  run(){
        while(true){
            log.info("Thread A run");
            try {
                log.info("Thread A is daemon {}" ,Thread.currentThread().isDaemon());
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }


    public static void main(String[] args) throws InterruptedException {
        DaemonThread daemonThread = new DaemonThread();
        daemonThread.setDaemon(true);
        daemonThread.start();
    }
}
~~~

创建 daemon thread很简单，只需要在创建之后，设置其daemon属性为true即可。

> 注意setDaemon(true)必须在thread start（）之前执行，否则会抛出IllegalThreadStateException

上面的例子将会立刻退出。

如果我们将daemonThread.setDaemon(true);去掉，则因为user thread一直执行，JVM将会一直运行下去，不会退出。

这是在main中运行的情况，如果我们在一个@Test中运行，会发生什么现象呢？

~~~java
public class DaemonThread extends Thread{

    public void  run(){
        while(true){
            log.info("Thread A run");
            try {
                log.info("Thread A is daemon {}" ,Thread.currentThread().isDaemon());
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    @Test
    public void testDaemon() throws InterruptedException {
        DaemonThread daemonThread = new DaemonThread();
        daemonThread.start();
    }
}
~~~

我们将main方法改成了@Test执行。执行之后我们会发现，不管是不是daemon thread， Test都会立刻结束。

再看一个daemon线程中启动一个user thread的情况：

~~~java
public class DaemonBThread extends Thread{

    Thread worker = new Thread(()->{
        while(true){
            log.info("Thread B run");
            log.info("Thread B is daemon {}",Thread.currentThread().isDaemon());
        }
    });
    public void  run(){
            log.info("Thread A run");
            worker.start();
    }

    public static void main(String[] args) {
        DaemonBThread daemonThread = new DaemonBThread();
        daemonThread.setDaemon(true);
        daemonThread.start();
    }
}
~~~

这个例子中，daemonThread启动了一个user thread，运行之后我们会发现，即使有user thread正在运行，JVM也会立刻结束执行。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/DaemonThread](https://github.com/ddean2009/learn-java-concurrency/tree/master/DaemonThread)

更多教程请参考 [flydean的博客](http://www.flydean.com)
