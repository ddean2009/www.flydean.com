---
slug: /concurrent-CAS
---

# 30. 非阻塞同步机制和CAS

我们知道在java 5之前同步是通过Synchronized关键字来实现的，在java 5之后，java.util.concurrent包里面添加了很多性能更加强大的同步类。这些强大的类中很多都实现了非阻塞的同步机制从而帮助其提升性能。

## 什么是非阻塞同步

非阻塞同步的意思是多个线程在竞争相同的数据时候不会发生阻塞，从而能够在更加细粒度的维度上进行协调，从而极大的减少线程调度的开销，从而提升效率。非阻塞算法不存在锁的机制也就不存在死锁的问题。

在基于锁的算法中，如果一个线程持有了锁，那么其他的线程将无法进行下去。使用锁虽然可以保证对资源的一致性访问，但是在挂起和恢复线程的执行过程中存在非常大的开销，如果锁上面存在着大量的竞争，那么有可能调度开销比实际工作开销还要高。

## 悲观锁和乐观锁

我们知道独占锁是一个悲观锁，悲观锁的意思就是假设最坏的情况，如果你不锁定该资源，那么就有其他的线程会修改该资源。悲观锁虽然可以保证任务的顺利执行，但是效率不高。

乐观锁就是假设其他的线程不会更改要处理的资源，但是我们在更新资源的时候需要判断该资源是否被别的线程所更改。如果被更改那么更新失败，我们可以重试，如果没有被更改，那么更新成功。

使用乐观锁的前提是假设大多数时间系统对资源的更新是不会产生冲突的。

乐观锁的原子性比较和更新操作，一般都是由底层的硬件支持的。

## CAS

大多数的处理器都实现了一个CAS指令（compare and swap）,通常来说一个CAS接收三个参数，数据的现值V，进行比较的值A，准备写入的值B。只有当V和A相等的时候，才会写入B。无论是否写入成功，都会返回V。翻译过来就是“我认为V现在的值是A，如果是那么将V的值更新为B，否则不修改V的值，并告诉我现在V的值是多少。”

这就是CAS的含义，JDK中的并发类是通过使用Unsafe类来使用CAS的，我们可以自己构建一个并发类，如下所示：

~~~java
public class CasCounter {

    private static final Unsafe unsafe = Unsafe.getUnsafe();
    private static final long valueOffset;
    private volatile int value;

    static {
        try {
            valueOffset = unsafe.objectFieldOffset
                    (CasCounter.class.getDeclaredField("value"));
        } catch (Exception ex) { throw new Error(ex); }
    }

    public CasCounter(int initialValue) {
        value = initialValue;
    }

    public CasCounter() {
    }

    public final int get() {
        return value;
    }

    public final void set(int newValue) {
        value = newValue;
    }

    public final boolean compareAndSet(int expect, int update) {
        return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
    }

}
~~~

上面的例子中，我们定义了一个原子操作compareAndSet， 它内部调用了unsafe的compareAndSwapInt方法。

看起来上面的CAS使用比直接使用锁复杂，但实际上在JVM中实现锁定时需要遍历JVM中一条非常复杂的代码路径，并可能导致操作系统级的锁定，线程挂机和上下文切换等操作。在最好的情况下，锁定需要执行一次CAS命令。

CAS的主要缺点就是需要调用者自己来处理竞争问题（重试，回退，放弃），而在锁中可以自动处理这些问题。

前面的文章我们也讲到了原子变量，原子变量的底层就是使用CAS。

本文的例子请参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/CAS](https://github.com/ddean2009/learn-java-concurrency/tree/master/CAS)

更多内容请访问 [flydean的博客](www.flydean.com)



