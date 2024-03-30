---
slug: /DelayQueue
---

# 16. java中DelayQueue的使用

# 简介

今天给大家介绍一下DelayQueue,DelayQueue是BlockingQueue的一种，所以它是线程安全的，DelayQueue的特点就是插入Queue中的数据可以按照自定义的delay时间进行排序。只有delay时间小于0的元素才能够被取出。

# DelayQueue

先看一下DelayQueue的定义：

~~~java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E>
    implements BlockingQueue<E>
~~~

从定义可以看到，DelayQueue中存入的对象都必须是Delayed的子类。

Delayed继承自Comparable，并且需要实现一个getDelay的方法。

为什么这样设计呢？

因为DelayQueue的底层存储是一个PriorityQueue，在之前的文章中我们讲过了，PriorityQueue是一个可排序的Queue，其中的元素必须实现Comparable方法。而getDelay方法则用来判断排序后的元素是否可以从Queue中取出。

# DelayQueue的应用

DelayQueue一般用于生产者消费者模式，我们下面举一个具体的例子。

首先要使用DelayQueue，必须自定义一个Delayed对象：

~~~java
@Data
public class DelayedUser implements Delayed {
    private String name;
    private long avaibleTime;

    public DelayedUser(String name, long delayTime){
        this.name=name;
        //avaibleTime = 当前时间+ delayTime
        this.avaibleTime=delayTime + System.currentTimeMillis();

    }

    @Override
    public long getDelay(TimeUnit unit) {
        //判断avaibleTime是否大于当前系统时间，并将结果转换成MILLISECONDS
        long diffTime= avaibleTime- System.currentTimeMillis();
        return unit.convert(diffTime,TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed o) {
        //compareTo用在DelayedUser的排序
        return (int)(this.avaibleTime - ((DelayedUser) o).getAvaibleTime());
    }
}
~~~

上面的对象中，我们需要实现getDelay和compareTo方法。

接下来我们创建一个生产者：

~~~java
@Slf4j
@Data
@AllArgsConstructor
class DelayedQueueProducer implements Runnable {
    private DelayQueue<DelayedUser> delayQueue;

    private Integer messageCount;

    private long delayedTime;

    @Override
    public void run() {
        for (int i = 0; i < messageCount; i++) {
            try {
                DelayedUser delayedUser = new DelayedUser(
                        new Random().nextInt(1000)+"", delayedTime);
                log.info("put delayedUser {}",delayedUser);
                delayQueue.put(delayedUser);
                Thread.sleep(500);
            } catch (InterruptedException e) {
                log.error(e.getMessage(),e);
            }
        }
    }
}
~~~

在生产者中，我们每隔0.5秒创建一个新的DelayedUser对象，并入Queue。

再创建一个消费者：

~~~java
@Slf4j
@Data
@AllArgsConstructor
public class DelayedQueueConsumer implements Runnable {

    private DelayQueue<DelayedUser> delayQueue;

    private int messageCount;

    @Override
    public void run() {
        for (int i = 0; i < messageCount; i++) {
            try {
                DelayedUser element = delayQueue.take();
                log.info("take {}",element );
            } catch (InterruptedException e) {
                log.error(e.getMessage(),e);
            }
        }
    }
}
~~~

在消费者中，我们循环从queue中获取对象。

最后看一个调用的例子：

~~~java
    @Test
    public void useDelayedQueue() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        DelayQueue<DelayedUser> queue = new DelayQueue<>();
        int messageCount = 2;
        long delayTime = 500;
        DelayedQueueConsumer consumer = new DelayedQueueConsumer(
                queue, messageCount);
        DelayedQueueProducer producer = new DelayedQueueProducer(
                queue, messageCount, delayTime);

        // when
        executor.submit(producer);
        executor.submit(consumer);

        // then
        executor.awaitTermination(5, TimeUnit.SECONDS);
        executor.shutdown();

    }
~~~

上面的测试例子中，我们定义了两个线程的线程池，生产者产生两条消息，delayTime设置为0.5秒，也就是说0.5秒之后，插入的对象能够被获取到。

线程池在5秒之后会被关闭。

运行看下结果：

~~~java
[pool-1-thread-1] INFO com.flydean.DelayedQueueProducer - put delayedUser DelayedUser(name=917, avaibleTime=1587623188389)
[pool-1-thread-2] INFO com.flydean.DelayedQueueConsumer - take DelayedUser(name=917, avaibleTime=1587623188389)
[pool-1-thread-1] INFO com.flydean.DelayedQueueProducer - put delayedUser DelayedUser(name=487, avaibleTime=1587623188899)
[pool-1-thread-2] INFO com.flydean.DelayedQueueConsumer - take DelayedUser(name=487, avaibleTime=1587623188899)
~~~

我们看到消息的put和take是交替进行的，符合我们的预期。

如果我们做下修改，将delayTime修改为50000，那么在线程池关闭之前插入的元素是不会过期的，也就是说消费者是无法获取到结果的。

# 总结

DelayQueue是一种有奇怪特性的BlockingQueue，可以在需要的时候使用。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)




