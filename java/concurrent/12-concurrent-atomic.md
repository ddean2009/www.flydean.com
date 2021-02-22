java中的Atomic类

## 问题背景

在多线程环境中，我们最常遇到的问题就是变量的值进行同步。因为变量需要在多线程中进行共享，所以我们必须需要采用一定的同步机制来进行控制。

通过之前的文章，我们知道可以采用Lock的机制，当然也包括今天我们讲的Atomic类。 

下面我们从两种方式来分别介绍。

## Lock

在之前的文章中，我们也讲了同步的问题，我们再回顾一下。 如果定义了一个计数器如下：

~~~java
public class Counter {

    int counter;

    public void increment() {
        counter++;
    }

}
~~~

如果是在单线程环境中，上面的代码没有任何问题。但是如果在多线程环境中，counter++将会得到不同的结果。

因为虽然counter++看起来是一个原子操作，但是它实际上包含了三个操作：读数据，加一，写回数据。

我们之前的文章也讲了，如何解决这个问题：

~~~java
public class LockCounter {

    private volatile int counter;

    public synchronized void increment() {
        counter++;
    }
}
~~~

通过加synchronized，保证同一时间只会有一个线程去读写counter变量。

通过volatile，保证所有的数据直接操作的主缓存，而不使用线程缓存。

这样虽然解决了问题，但是性能可能会受影响，因为synchronized会锁住整个LockCounter实例。

## 使用Atomic

通过引入低级别的原子化语义命令（比如compare-and-swap (CAS)），从而能在保证效率的同时保证原子性。

一个标准的CAS包含三个操作：

1. 将要操作的内存地址M。
2. 现有的变量A。
3. 新的需要存储的变量B。

CAS将会先比较A和M中存储的值是否一致，一致则表示其他线程未对该变量进行修改，则将其替换为B。 否则不做任何操作。

使用CAS可以不用阻塞其他的线程，但是我们需要自己处理好当更新失败的情况下的业务逻辑处理情况。

Java提供了很多Atomic类，最常用的包括AtomicInteger, AtomicLong, AtomicBoolean, 和 AtomicReference.

其中的主要方法：

1. get() – 直接中主内存中读取变量的值，类似于volatile变量。
2. set() – 将变量写回主内存。类似于volatile变量。
3. lazySet() – 延迟写回主内存。一种常用的情景是将引用重置为null的情况。
4. compareAndSet() – 执行CAS操作，成功返回true，失败返回false。
5. weakCompareAndSet() – 比较弱的CAS操作，不同的是它不执行happens-before操作，从而不保证能够读取到其他变量最新的值。

我们看下怎么用：

~~~java
public class AtomicCounter {

    private final AtomicInteger counter = new AtomicInteger(0);

    public int getValue() {
        return counter.get();
    }
    public void increment() {
        while(true) {
            int existingValue = getValue();
            int newValue = existingValue + 1;
            if(counter.compareAndSet(existingValue, newValue)) {
                return;
            }
        }
    }
}
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/atomic](https://github.com/ddean2009/learn-java-concurrency/tree/master/atomic)

更多教程请参考 [flydean的博客](www.flydean.com)
