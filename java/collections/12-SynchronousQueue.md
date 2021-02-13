SynchronousQueue详解

# 简介

SynchronousQueue是BlockingQueue的一种，所以SynchronousQueue是线程安全的。SynchronousQueue和其他的BlockingQueue不同的是SynchronousQueue的capacity是0。即SynchronousQueue不存储任何元素。

也就是说SynchronousQueue的每一次insert操作，必须等待其他线性的remove操作。而每一个remove操作也必须等待其他线程的insert操作。

这种特性可以让我们想起了Exchanger。和Exchanger不同的是，使用SynchronousQueue可以在两个线程中传递同一个对象。一个线程放对象，另外一个线程取对象。

# 举例说明

我们举一个多线程中传递对象的例子。还是举生产者消费者的例子，在生产者中我们创建一个对象，在消费者中我们取出这个对象。先看一下用CountDownLatch该怎么做：

~~~java
    @Test
    public void useCountdownLatch() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        AtomicReference<Object> atomicReference= new AtomicReference<>();
        CountDownLatch countDownLatch = new CountDownLatch(1);

        Runnable producer = () -> {
            Object object=new Object();
            atomicReference.set(object);
            log.info("produced {}",object);
            countDownLatch.countDown();
        };

        Runnable consumer = () -> {
            try {
                countDownLatch.await();
                Object object = atomicReference.get();
                log.info("consumed {}",object);
            } catch (InterruptedException ex) {
                log.error(ex.getMessage(),ex);
            }
        };

        executor.submit(producer);
        executor.submit(consumer);

        executor.awaitTermination(50000, TimeUnit.MILLISECONDS);
        executor.shutdown();
    }
~~~

上例中，我们使用AtomicReference来存储要传递的对象，并且定义了一个型号量为1的CountDownLatch。 

在producer中，我们存储对象，并且countDown。

在consumer中，我们await,然后取出对象。

输出结果：

~~~java
[pool-1-thread-1] INFO com.flydean.SynchronousQueueUsage - produced java.lang.Object@683d1b4b
[pool-1-thread-2] INFO com.flydean.SynchronousQueueUsage - consumed java.lang.Object@683d1b4b
~~~

可以看到传入和输出了同一个对象。

上面的例子我们也可以用SynchronousQueue来改写：

~~~java
    @Test
    public void useSynchronousQueue() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        SynchronousQueue<Object> synchronousQueue=new SynchronousQueue<>();

        Runnable producer = () -> {
            Object object=new Object();
            try {
                synchronousQueue.put(object);
            } catch (InterruptedException ex) {
                log.error(ex.getMessage(),ex);
            }
            log.info("produced {}",object);
        };

        Runnable consumer = () -> {
            try {
                Object object = synchronousQueue.take();
                log.info("consumed {}",object);
            } catch (InterruptedException ex) {
                log.error(ex.getMessage(),ex);
            }
        };

        executor.submit(producer);
        executor.submit(consumer);

        executor.awaitTermination(50000, TimeUnit.MILLISECONDS);
        executor.shutdown();
    }
~~~

上面的例子中，如果我们使用synchronousQueue，则可以不用手动同步，也不需要额外的存储。

# 总结

如果我们需要在代码中用到这种线程中传递对象的情况，那么使用synchronousQueue吧。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)
