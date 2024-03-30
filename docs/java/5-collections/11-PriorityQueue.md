---
slug: /PriorityQueue
---

# 11. PriorityQueue和PriorityBlockingQueue

# 简介

Queue一般来说都是FIFO的，当然之前我们也介绍过Deque可以做为栈来使用。今天我们介绍一种PriorityQueue，可以按照对象的自然顺序或者自定义顺序在Queue中进行排序。

# PriorityQueue

先看PriorityQueue，这个Queue继承自AbstractQueue，是非线程安全的。

PriorityQueue的容量是unbounded的，也就是说它没有容量大小的限制，所以你可以无限添加元素，如果添加的太多，最后会报OutOfMemoryError异常。

这里教大家一个识别的技能，只要集合类中带有CAPACITY的，其底层实现大部分都是数组，因为只有数组才有capacity，当然也有例外，比如LinkedBlockingDeque。

只要集合类中带有comparator的，那么这个集合一定是个有序集合。

我们看下PriorityQueue：

~~~java
private static final int DEFAULT_INITIAL_CAPACITY = 11;
 private final Comparator<? super E> comparator;

~~~

定义了初始Capacity和comparator，那么PriorityQueue的底层实现就是Array，并且它是一个有序集合。

有序集合默认情况下是按照natural ordering来排序的，如果你传入了 Comparator,则会按照你指定的方式进行排序，我们看两个排序的例子：

~~~java
@Slf4j
public class PriorityQueueUsage {

    @Test
    public void usePriorityQueue(){
        PriorityQueue<Integer> integerQueue = new PriorityQueue<>();

        integerQueue.add(1);
        integerQueue.add(3);
        integerQueue.add(2);

        int first = integerQueue.poll();
        int second = integerQueue.poll();
        int third = integerQueue.poll();

        log.info("{},{},{}",first,second,third);
    }

    @Test
    public void usePriorityQueueWithComparator(){
        PriorityQueue<Integer> integerQueue = new PriorityQueue<>((a,b)-> b-a);
        integerQueue.add(1);
        integerQueue.add(3);
        integerQueue.add(2);

        int first = integerQueue.poll();
        int second = integerQueue.poll();
        int third = integerQueue.poll();

        log.info("{},{},{}",first,second,third);
    }
}
~~~

默认情况下会按照升序排列，第二个例子中我们传入了一个逆序的Comparator，则会按照逆序排列。

# PriorityBlockingQueue

PriorityBlockingQueue是一个BlockingQueue，所以它是线程安全的。

我们考虑这样一个问题，如果两个对象的natural ordering或者Comparator的顺序是一样的话，两个对象的顺序还是固定的吗？

出现这种情况，默认顺序是不能确定的，但是我们可以这样封装对象，让对象可以在排序顺序一致的情况下，再按照创建顺序先进先出FIFO的二次排序：

~~~java
public class FIFOEntry<E extends Comparable<? super E>>
        implements Comparable<FIFOEntry<E>> {
    static final AtomicLong seq = new AtomicLong(0);
    final long seqNum;
    final E entry;
    public FIFOEntry(E entry) {
        seqNum = seq.getAndIncrement();
        this.entry = entry;
    }
    public E getEntry() { return entry; }
    public int compareTo(FIFOEntry<E> other) {
        int res = entry.compareTo(other.entry);
        if (res == 0 && other.entry != this.entry)
            res = (seqNum < other.seqNum ? -1 : 1);
        return res;
    }
}
~~~

上面的例子中，先比较两个Entry的natural ordering，如果一致的话，再按照seqNum进行排序。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)
