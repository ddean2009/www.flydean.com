---
slug: /queue-overview
---

# 10. java中Queue家族简介

# 简介

java中Collection集合有三大家族List，Set和Queue。当然Map也算是一种集合类，但Map并不继承Collection接口。

List，Set在我们的工作中会经常使用，通常用来存储结果数据，而Queue由于它的特殊性，通常用在生产者消费者模式中。

现在很火的消息中间件比如：Rabbit MQ等都是Queue这种数据结构的展开。

今天这篇文章将带大家进入Queue家族。

# Queue接口

先看下Queue的继承关系和其中定义的方法：

![](https://img-blog.csdnimg.cn/20200422113331309.jpg)

Queue继承自Collection，Collection继承自Iterable。

Queue有三类主要的方法，我们用个表格来看一下他们的区别：

方法类型|方法名称|方法名称|区别
-|-|-|-
Insert|add|offer|两个方法都表示向Queue中添加某个元素，不同之处在于添加失败的情况，add只会返回true，如果添加失败，会抛出异常。offer在添加失败的时候会返回false。所以对那些有固定长度的Queue，优先使用offer方法。
Remove|remove|poll|如果Queue是空的情况下，remove会抛出异常，而poll会返回null。
Examine|element|peek|获取Queue头部的元素，但不从Queue中删除。两者的区别还是在于Queue为空的情况下，element会抛出异常，而peek返回null。

> 注意，因为对poll和peek来说null是有特殊含义的，所以一般来说Queue中禁止插入null，但是在实现中还是有一些类允许插入null比如LinkedList。

> 尽管如此，我们在使用中还是要避免插入null元素。

# Queue的分类

一般来说Queue可以分为BlockingQueue，Deque和TransferQueue三种。

## BlockingQueue

BlockingQueue是Queue的一种实现，它提供了两种额外的功能：

1. 当当前Queue是空的时候，从BlockingQueue中获取元素的操作会被阻塞。
2. 当当前Queue达到最大容量的时候，插入BlockingQueue的操作会被阻塞。

BlockingQueue的操作可以分为下面四类：

操作类型|Throws exception|Special value|Blocks|Times out
-|-|-|-|-
Insert|add(e)|offer(e)|put(e)|offer(e, time, unit)
Remove|remove()|poll()|take()|poll(time, unit)
Examine|element()|peek()|not applicable|not applicable

第一类是会抛出异常的操作，当遇到插入失败，队列为空的时候抛出异常。

第二类是不会抛出异常的操作。

第三类是会Block的操作。当Queue为空或者达到最大容量的时候。

第四类是time out的操作，在给定的时间里会Block，超时会直接返回。

BlockingQueue是线程安全的Queue,可以在生产者消费者模式的多线程中使用，如下所示：

~~~java
 class Producer implements Runnable {
   private final BlockingQueue queue;
   Producer(BlockingQueue q) { queue = q; }
   public void run() {
     try {
       while (true) { queue.put(produce()); }
     } catch (InterruptedException ex) { ... handle ...}
   }
   Object produce() { ... }
 }

 class Consumer implements Runnable {
   private final BlockingQueue queue;
   Consumer(BlockingQueue q) { queue = q; }
   public void run() {
     try {
       while (true) { consume(queue.take()); }
     } catch (InterruptedException ex) { ... handle ...}
   }
   void consume(Object x) { ... }
 }

 class Setup {
   void main() {
     BlockingQueue q = new SomeQueueImplementation();
     Producer p = new Producer(q);
     Consumer c1 = new Consumer(q);
     Consumer c2 = new Consumer(q);
     new Thread(p).start();
     new Thread(c1).start();
     new Thread(c2).start();
   }
 }
~~~

最后，在一个线程中向BlockQueue中插入元素之前的操作happens-before另外一个线程中从BlockQueue中删除或者获取的操作。

## Deque

Deque是Queue的子类，它代表double ended queue，也就是说可以从Queue的头部或者尾部插入和删除元素。

同样的，我们也可以将Deque的方法用下面的表格来表示，Deque的方法可以分为对头部的操作和对尾部的操作：

方法类型|Throws exception|Special value|Throws exception|Special value
-|-|-|-|-|
Insert|addFirst(e)|offerFirst(e)|addLast(e)|offerLast(e)
Remove|removeFirst()|pollFirst()|removeLast()|pollLast()
Examine|getFirst()|peekFirst()|getLast()|peekLast()

和Queue的方法描述基本一致，这里就不多讲了。

当Deque以 FIFO (First-In-First-Out)的方法处理元素的时候，Deque就相当于一个Queue。

当Deque以LIFO (Last-In-First-Out)的方式处理元素的时候，Deque就相当于一个Stack。

## TransferQueue

TransferQueue继承自BlockingQueue，为什么叫Transfer呢？因为TransferQueue提供了一个transfer的方法，生产者可以调用这个transfer方法，从而等待消费者调用take或者poll方法从Queue中拿取数据。

还提供了非阻塞和timeout版本的tryTransfer方法以供使用。

我们举个TransferQueue实现的生产者消费者的问题。

先定义一个生产者：

~~~java
@Slf4j
@Data
@AllArgsConstructor
class Producer implements Runnable {
    private TransferQueue<String> transferQueue;

    private String name;

    private Integer messageCount;

    public static final AtomicInteger messageProduced = new AtomicInteger();

    @Override
    public void run() {
        for (int i = 0; i < messageCount; i++) {
            try {
                boolean added = transferQueue.tryTransfer( "第"+i+"个", 2000, TimeUnit.MILLISECONDS);
                log.info("transfered {} 是否成功: {}","第"+i+"个",added);
                if(added){
                    messageProduced.incrementAndGet();
                }
            } catch (InterruptedException e) {
                log.error(e.getMessage(),e);
            }
        }
        log.info("total transfered {}",messageProduced.get());
    }
}
~~~

在生产者的run方法中，我们调用了tryTransfer方法，等待2秒钟，如果没成功则直接返回。

再定义一个消费者：

~~~java
@Slf4j
@Data
@AllArgsConstructor
public class Consumer implements Runnable {

    private TransferQueue<String> transferQueue;

    private String name;

    private int messageCount;

    public static final AtomicInteger messageConsumed = new AtomicInteger();

    @Override
    public void run() {
        for (int i = 0; i < messageCount; i++) {
            try {
                String element = transferQueue.take();
                log.info("take {}",element );
                messageConsumed.incrementAndGet();
                Thread.sleep(500);
            } catch (InterruptedException e) {
                log.error(e.getMessage(),e);
            }
        }
        log.info("total consumed {}",messageConsumed.get());
    }

}
~~~

在run方法中，调用了transferQueue.take方法来取消息。

下面先看一下一个生产者，零个消费者的情况：

~~~java
    @Test
    public void testOneProduceZeroConsumer() throws InterruptedException {

        TransferQueue<String> transferQueue = new LinkedTransferQueue<>();
        ExecutorService exService = Executors.newFixedThreadPool(10);
        Producer producer = new Producer(transferQueue, "ProducerOne", 5);

        exService.execute(producer);

        exService.awaitTermination(50000, TimeUnit.MILLISECONDS);
        exService.shutdown();
    }
~~~

输出结果：

~~~java
[pool-1-thread-1] INFO com.flydean.Producer - transfered 第0个 是否成功: false
[pool-1-thread-1] INFO com.flydean.Producer - transfered 第1个 是否成功: false
[pool-1-thread-1] INFO com.flydean.Producer - transfered 第2个 是否成功: false
[pool-1-thread-1] INFO com.flydean.Producer - transfered 第3个 是否成功: false
[pool-1-thread-1] INFO com.flydean.Producer - transfered 第4个 是否成功: false
[pool-1-thread-1] INFO com.flydean.Producer - total transfered 0
~~~

可以看到，因为没有消费者，所以消息并没有发送成功。

再看下一个有消费者的情况：

~~~java
    @Test
    public void testOneProduceOneConsumer() throws InterruptedException {

        TransferQueue<String> transferQueue = new LinkedTransferQueue<>();
        ExecutorService exService = Executors.newFixedThreadPool(10);
        Producer producer = new Producer(transferQueue, "ProducerOne", 2);
        Consumer consumer = new Consumer(transferQueue, "ConsumerOne", 2);

        exService.execute(producer);
        exService.execute(consumer);

        exService.awaitTermination(50000, TimeUnit.MILLISECONDS);
        exService.shutdown();
    }
~~~

输出结果：

~~~java
[pool-1-thread-2] INFO com.flydean.Consumer - take 第0个
[pool-1-thread-1] INFO com.flydean.Producer - transfered 第0个 是否成功: true
[pool-1-thread-2] INFO com.flydean.Consumer - take 第1个
[pool-1-thread-1] INFO com.flydean.Producer - transfered 第1个 是否成功: true
[pool-1-thread-1] INFO com.flydean.Producer - total transfered 2
[pool-1-thread-2] INFO com.flydean.Consumer - total consumed 2
~~~

可以看到Producer和Consumer是一个一个来生产和消费的。


# 总结

本文介绍了Queue接口和它的三大分类，这三大分类又有非常多的实现类，我们将会在后面的文章中再详细介绍。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)



