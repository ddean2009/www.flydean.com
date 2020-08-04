并发和Read-copy update(RCU)

# 简介

在上一篇文章中的并发和ABA问题的介绍中，我们提到了要解决ABA中的memory reclamation问题，有一个办法就是使用RCU。

详见[ABA问题的本质及其解决办法](http://www.flydean.com/aba-cas-stamp/),今天本文将会深入的探讨一下RCU是什么，RCU和COW(Copy-On-Write)之间的关系。

RCU(Read-copy update)是一种同步机制，并在2002年被加入了Linux内核中。它的优点就是可以在更新的过程中，运行多个reader进行读操作。

熟悉锁的朋友应该知道，对于排它锁，同一时间只允许一个操作进行，不管这个操作是读还是写。

对于读写锁，可以允许同时读，但是不能允许同时写，并且这个写锁是排他的，也就是说写的同时是不允许进行读操作的。

RCU可以支持一个写操作和多个读操作同时进行。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# Copy on Write和RCU

什么是Copy on Write? 它和read copy update有什么关系呢？

我们把Copy on Write简写为COW，COW是并发中经常会用到的一种算法，java里面就有java.util.concurrent.CopyOnWriteArrayList和java.util.concurrent.CopyOnWriteArraySet。

COW的本质就是，在并发的环境中，如果想要更新某个对象，首先将它拷贝一份，在这个拷贝的对象中进行修改，最后把指向原对象的指针指回更新好的对象。

CopyOnWriteArrayList和CopyOnWriteArraySet中的COW使用在遍历的时候。

我们知道使用Iterator来遍历集合的时候，是不允许在Iterator外部修改集合的数据的，只能在Iterator内部遍历的时候修改，否则会抛出ConcurrentModificationException。

而对于CopyOnWriteArrayList和CopyOnWriteArraySet来说，在创建Iterator的时候，就对原List进行了拷贝，Iterator的遍历是在拷贝过后的List中进行的，这时候如果其他的线程修改了原List对象，程序正常执行，不会抛出ConcurrentModificationException。

同时CopyOnWriteArrayList和CopyOnWriteArraySet中的Iterator是不支持remove，set，add方法的，因为这是拷贝过来的对象，在遍历过后是要被丢弃的。在它上面的修改是没有任何意义的。

在并发情况下，COW其实还有一个问题没有处理，那就是对于拷贝出来的对象什么时候回收的问题，是不是可以马上将对象回收？有没有其他的线程在访问这个对象？ 处理这个问题就需要用到对象生命周期的跟踪技术，也就是RCU中的RCU-sync。

所以RCU和COW的关系就是：RCU是由RCU-sync和COW两部分组成的。

因为java中有自动垃圾回收功能，我们并不需要考虑拷贝对象的生命周期问题，所以在java中我们一般只看到COW，看不到RCU。

# RCU的流程和API

我们将RCU和排它锁和读写锁进行比较。

对于排它锁来说，需要这两个API：

~~~java
lock()
unlock()
~~~

对于读写锁来说，需要这四个API：

~~~java
read_lock()
read_unlock()
write_lock()
write_unlock()
~~~

而RCU需要下面三个API：

~~~java
rcu_read_lock()
rcu_read_unlock()
synchronize_rcu()
~~~

rcu_read_lock和rcu_read_unlock必须是成对出现的，并且synchronize_rcu不能出现在rcu_read_lock和rcu_read_unlock之间。

虽然RCU并不提供任何排他锁，但是RCU必须要满足下面的两个条件：

1. 如果Thread1(T1)中synchronize_rcu方法在Thread2（T2)的rcu_read_lock方法之前返回，则happens before synchronize_rcu的操作一定在T2的rcu_read_lock方法之后可见。
2. 如果T2的rcu_read_lock方法调用在T1的synchronize_rcu方法调用之前，则happens after synchronize_rcu的操作一定在T2的rcu_read_unlock方法之前不可见。

听起来很拗口，没关系，我们画个图来理解一下：

![](https://img-blog.csdnimg.cn/20200512200058436.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_22,color_8F8F8F,t_70)

记住RCU比较的是synchronize_rcu和rcu_read_lock的顺序。

Thread2和Thread3中rcu_read_lock在synchronize_rcu之前执行，则b=2在T2，T3中一定不可见。

Thread4中rcu_read_lock虽然在synchronize_rcu启动之后才开始执行的，但是rcu_read_unlock是在synchronize_rcu返回之后才执行的，所以可以等同于看做Thread5的情况。

Thread5中，rcu_read_lock在synchronize_rcu返回之后才执行的，所以a=1一定可见。

# RCU要注意的事项

RCU虽然没有提供锁的机制，但允许同时多个线程进行读操作。注意，RCU同时只允许一个synchronize_rcu操作，所以需要我们自己来实现synchronize_rcu的排它锁操作。

所以对于RCU来说，它是一个写多个读的同步机制，而不是多个写多个读的同步机制。

# RCU的java实现

最后放上一段大神的RCU的java实现代码：

~~~java
public class RCU {
    final static long NOT_READING = Long.MAX_VALUE;
    final static int MAX_THREADS = 128;
    final AtomicLong reclaimerVersion = new AtomicLong(0);
    final AtomicLongArray readersVersion = new AtomicLongArray(MAX_THREADS);

    public RCU() {
        for (int i=0; i < MAX_THREADS; i++) readersVersion.set(i, NOT_READING);
    }

    public static int getTID() {
        return (int)(Thread.currentThread().getId() % MAX_THREADS);
    }

    public void read_lock(final int tid) {  // rcu_read_lock()
        final long rv = reclaimerVersion.get();
        readersVersion.set(tid, rv);
        final long nrv = reclaimerVersion.get();
        if (rv != nrv) readersVersion.lazySet(tid, nrv);
    }

    public void read_unlock(final int tid) { // rcu_read_unlock()
        readersVersion.set(tid, NOT_READING);
    }

    public void synchronize_rcu() {
        final long waitForVersion = reclaimerVersion.incrementAndGet();
        for (int i=0; i < MAX_THREADS; i++) {
            while (readersVersion.get(i) < waitForVersion) { } // spin
        }
    }
}
~~~

简单讲解一下这个RCU的实现：

readersVersion是一个长度为128的Long数组，里面存放着每个reader的读数。默认情况下reader存储的值是NOT_READING，表示未存储任何数据。

在RCU初始化的时候，将会初始化这些reader。

read_unlock方法会将reader的值重置为NOT_READING。

reclaimerVersion存储的是修改的数据，它的值将会在synchronize_rcu方法中进行更新。

同时synchronize_rcu将会遍历所有的reader，只有当所有的reader都读取完毕才继续执行。

最后，read_lock方法将会读取reclaimerVersion的值。这里会读取两次，如果两次的结果不同，则会调用readersVersion.lazySet方法，延迟设置reader的值。

为什么要读取两次呢？因为虽然reclaimerVersion和readersVersion都是原子性操作，但是在多线程环境中，并不能保证reclaimerVersion一定就在readersVersion之前执行，所以我们需要添加一个内存屏障：memory barrier来实现这个功能。

# 总结

本文介绍了RCU算法和应用。希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！












