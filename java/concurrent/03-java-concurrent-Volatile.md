java中的Volatile关键字使用

在本文中，我们会介绍java中的一个关键字volatile。 volatile的中文意思是易挥发的，不稳定的。那么在java中使用是什么意思呢？ 

我们知道，在java中，每个线程都会有个自己的内存空间，我们称之为working memory。这个空间会缓存一些变量的信息，从而提升程序的性能。当执行完某个操作之后，thread会将更新后的变量更新到主缓存中，以供其他线程读写。

因为变量存在working memory和main memory两个地方，那么就有可能出现不一致的情况。 那么我们就可以使用Volatile关键字来强制将变量直接写到main memory，从而保证了不同线程读写到的是同一个变量。

## 什么时候使用volatile

那么我们什么时候使用volatile呢？当一个线程需要立刻读取到另外一个线程修改的变量值的时候，我们就可以使用volatile。我们来举个例子：

~~~java
public class VolatileWithoutUsage {
    private  int count = 0;

    public void incrementCount() {
        count++;
    }
    public int getCount() {
        return count;
    }
}
~~~

这个类定义了一个incrementCount()方法，会去更新count值，我们接下来在多线程环境中去测试这个方法：

~~~java
    @Test
    public void testWithoutVolatile() throws InterruptedException {
        ExecutorService service= Executors.newFixedThreadPool(3);
        VolatileWithoutUsage volatileWithoutUsage=new VolatileWithoutUsage();

        IntStream.range(0,1000).forEach(count ->service.submit(volatileWithoutUsage::incrementCount) );
        service.shutdown();
        service.awaitTermination(1000, TimeUnit.MILLISECONDS);
        assertEquals(1000,volatileWithoutUsage.getCount() );
    }
~~~

运行一下，我们会发现结果是不等于1000的。

~~~txt

java.lang.AssertionError: 
Expected :1000
Actual   :999
~~~

这是因为多线程去更新同一个变量，我们在上篇文章也提到了，这种情况可以通过加Synchronized关键字来解决。

那么是不是我们加上Volatile关键字后就可以解决这个问题了呢？

~~~java
public class VolatileFalseUsage {
    private volatile int count = 0;

    public void incrementCount() {
        count++;
    }
    public int getCount() {
        return count;
    }

}
~~~

上面的类中，我们加上了关键字Volatile，我们再测试一下：

~~~java
    @Test
    public void testWithVolatileFalseUsage() throws InterruptedException {
        ExecutorService service= Executors.newFixedThreadPool(3);
        VolatileFalseUsage volatileFalseUsage=new VolatileFalseUsage();

        IntStream.range(0,1000).forEach(count ->service.submit(volatileFalseUsage::incrementCount) );
        service.shutdown();
        service.awaitTermination(5000, TimeUnit.MILLISECONDS);
        assertEquals(1000,volatileFalseUsage.getCount() );
    }
~~~

运行一下，我们会发现结果还是错误的：

~~~txt
java.lang.AssertionError: 
Expected :1000
Actual   :992
~~

为什么呢？ 我们先来看下count++的操作，count++可以分解为三步操作，1. 读取count的值，2.给count加1， 3.将count写回内存。添加Volatile关键词只能够保证count的变化立马可见，而不能保证1，2，3这三个步骤的总体原子性。 要实现总体的原子性还是需要用到类似Synchronized的关键字。

下面看下正确的用法：

~~~java
public class VolatileTrueUsage {
    private volatile int count = 0;

    public void setCount(int number) {
        count=number;
    }
    public int getCount() {
        return count;
    }
}
~~~

~~~java
    @Test
    public void testWithVolatileTrueUsage() throws InterruptedException {
        VolatileTrueUsage volatileTrueUsage=new VolatileTrueUsage();
        Thread threadA = new Thread(()->volatileTrueUsage.setCount(10));
        threadA.start();
        Thread.sleep(100);

        Thread reader = new Thread(() -> {
            int valueReadByThread = volatileTrueUsage.getCount();
            assertEquals(10, valueReadByThread);
        });
        reader.start();
    }
~~~


## Happens-Before 

从java5之后，volatile提供了一个Happens-Before的功能。Happens-Before 是指当volatile进行写回主内存的操作时，会将之前的非volatile的操作一并写回主内存。

~~~java
public class VolatileHappenBeforeUsage {

    int a = 0;
    volatile boolean flag = false;

    public void writer() {
        a = 1;              // 1 线程A修改共享变量
        flag = true;        // 2 线程A写volatile变量
    }
}
~~~

上面的例子中，a是一个非volatile变量，flag是一个volatile变量，但是由于happens-before的特性，a 将会表现的和volatile一样。

本文的例子可以参考:[https://github.com/ddean2009/learn-java-concurrency/tree/master/volatile](https://github.com/ddean2009/learn-java-concurrency/tree/master/volatile)



