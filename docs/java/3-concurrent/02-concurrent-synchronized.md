---
slug: /concurrent-synchronized
---

# 2. java并发中的Synchronized关键词

如果在多线程的环境中，我们经常会遇到资源竞争的情况，比如多个线程要去同时修改同一个共享变量，这时候，就需要对资源的访问方法进行一定的处理，保证同一时间只有一个线程访问。

java提供了synchronized关键字，方便我们实现上述操作。

## 为什么要同步

我们举个例子，我们创建一个类，提供了一个setSum的方法：

~~~java

public class SynchronizedMethods {

    private int sum = 0;

    public void calculate() {
        setSum(getSum() + 1);
    }
}
~~~

如果我们在多线程的环境中调用这个calculate方法：

~~~java
    @Test
    public void givenMultiThread_whenNonSyncMethod() throws InterruptedException {
        ExecutorService service = Executors.newFixedThreadPool(3);
        SynchronizedMethods summation = new SynchronizedMethods();

        IntStream.range(0, 1000)
                .forEach(count -> service.submit(summation::calculate));
        service.shutdown();
        service.awaitTermination(1000, TimeUnit.MILLISECONDS);

        assertEquals(1000, summation.getSum());
    }
~~~

按照上面的方法，我们预计要返回1000， 但是实际上基本不可能得到1000这个值，因为在多线程环境中，对同一个资源进行同时操作带来的不利影响。

那我们怎么才能够建线程安全的环境呢？ 

## Synchronized关键词

java提供了多种线程安全的方法，本文主要讲解Synchronized关键词，Synchronized关键词可以有很多种形式：

* Instance methods
* Static methods
* Code blocks

当我们使用synchronized时，java会在相应的对象上加锁，从而在同一个对象等待锁的方法都必须顺序执行，从而保证了线程的安全。

### Synchronized Instance Methods

Synchronized关键词可以放在实例方法的前面：

~~~java
    public synchronized void synchronisedCalculate() {
        setSum(getSum() + 1);
    }
~~~

看下调用结果：

~~~java
@Test
public void givenMultiThread_whenMethodSync() {
    ExecutorService service = Executors.newFixedThreadPool(3);
    SynchronizedMethods method = new SynchronizedMethods();
 
    IntStream.range(0, 1000)
      .forEach(count -> service.submit(method::synchronisedCalculate));
    service.awaitTermination(1000, TimeUnit.MILLISECONDS);
 
    assertEquals(1000, method.getSum());
}
~~~

这里synchronized将会锁住该方法的实例对象，多个线程中只有获得该实例对象锁的线程才能够执行。

### Synchronized Static Methods

Synchronized关键词也可以用在static方法前面：

~~~java
    public static synchronized void syncStaticCalculate() {
        staticSum = staticSum + 1;
    }
~~~

Synchronized放在static方法前面和实例方法前面锁住的对象不同。放在static方法前面锁住的对象是这个Class本身，因为一个Class在JVM中只会存在一个，所以不管有多少该Class的实例，在同一时刻只会有一个线程可以执行该放方法。

~~~java
    @Test
    public void givenMultiThread_whenStaticSyncMethod() throws InterruptedException {
        ExecutorService service = Executors.newCachedThreadPool();

        IntStream.range(0, 1000)
                .forEach(count ->
                        service.submit(SynchronizedMethods::syncStaticCalculate));
        service.shutdown();
        service.awaitTermination(100, TimeUnit.MILLISECONDS);

        assertEquals(1000, SynchronizedMethods.staticSum);
    }
~~~

### Synchronized Blocks

有时候，我们可能不需要Synchronize整个方法，而是同步其中的一部分，这时候，我们可以使用Synchronized Blocks：

~~~java
    public void performSynchronizedTask() {
        synchronized (this) {
            setSum(getSum() + 1);
        }
    }
~~~

我们看下怎么测试：

~~~java
    @Test
    public void givenMultiThread_whenBlockSync() throws InterruptedException {
        ExecutorService service = Executors.newFixedThreadPool(3);
        SynchronizedMethods synchronizedBlocks = new SynchronizedMethods();

        IntStream.range(0, 1000)
                .forEach(count ->
                        service.submit(synchronizedBlocks::performSynchronizedTask));
        service.shutdown();
        service.awaitTermination(100, TimeUnit.MILLISECONDS);

        assertEquals(1000, synchronizedBlocks.getSum());
    }
~~~

上面我们同步的是实例，如果在静态方法中，我们也可以同步class：

~~~java
    public static void performStaticSyncTask(){
        synchronized (SynchronizedMethods.class) {
            staticSum = staticSum + 1;
        }
    }
~~~

我们看下怎么测试：

~~~java
    @Test
    public void givenMultiThread_whenStaticSyncBlock() throws InterruptedException {
        ExecutorService service = Executors.newCachedThreadPool();

        IntStream.range(0, 1000)
                .forEach(count ->
                        service.submit(SynchronizedMethods::performStaticSyncTask));
        service.shutdown();
        service.awaitTermination(100, TimeUnit.MILLISECONDS);

        assertEquals(1000, SynchronizedMethods.staticSum);
    }
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/Synchronized](https://github.com/ddean2009/learn-java-concurrency/tree/master/Synchronized)


