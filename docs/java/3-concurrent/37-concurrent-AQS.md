---
slug: /concurrent-AQS
---

# 37. 同步类的基础AbstractQueuedSynchronizer(AQS)

我们之前介绍了很多同步类，比如ReentrantLock,Semaphore, CountDownLatch, ReentrantReadWriteLock,FutureTask等。

AQS封装了实现同步器时设计的大量细节问题。他提供了FIFO的wait queues并且提供了一个int型的state表示当前的状态。

根据JDK的说明，并不推荐我们直接使用AQS，我们通常需要构建一个内部类来继承AQS并按照需要重写下面几个方法：

* tryAcquire
* tryRelease
* tryAcquireShared
* tryReleaseShared
* isHeldExclusively

在这些方法中，我们需要调用getState, setState 或者 compareAndSetState这三种方法来改变state值。

上面的方法提到了两种操作，独占操作（如：ReentrantLock）和共享操作(如：Semaphore,CountdownLatch)。

两种的区别在于同一时刻能否有多个线程同时获取到同步状态。

比如我们运行同时多个线程去读，但是同时只允许一个线程去写，那么这里的读锁就是共享操作，而写锁就是独占操作。

在基于QAS构建的同步类中，最基本的操作就是获取操作和释放操作。而这个state就表示的是这些获取和释放操作所依赖的值。

State是一个int值，你可以使用它来表示任何状态，比如ReentrantLock用它来表示所有者线程重复获取该锁的次数。Semaphore用它来表示剩余的许可量，而FutureTask用它来表示任务的状态（开始，运行，完成或者取消）。当然你还可以自定义额外的状态变量来表示其他的信息。

下的伪代码表示的是AQS中获取和释放操作的形式：

~~~java
   Acquire:
       while (!tryAcquire(arg)) {
          enqueue thread if it is not already queued;
          possibly block current thread;
       }
  
   Release:
       if (tryRelease(arg))
          unblock the first queued thread;
~~~

获取操作，首先判断当前状态是否允许获取操作，如果如果不允许，则将当前的线程入Queue，并且有可能阻塞当前线程。

释放操作，则先判断是否运行释放操作，如果允许，则解除queue中的thread，并运行。

我们看一个具体的实现：

~~~java
public class AQSUsage {

    private final Sync sync= new Sync();

    private class Sync extends AbstractQueuedSynchronizer{
        protected int tryAcquireShared(int ignored){
            return (getState() ==1 )? 1: -1;
        }
        protected boolean tryReleaseShared(int ignored){
            setState(1);
            return true;
        }
    }

    public void release() {
        sync.releaseShared(0);
    }
    public void acquire() throws InterruptedException {
        sync.acquireSharedInterruptibly(0);
    }
}
~~~

上面的例子中，我们定义了一个内部类Sync，在这个类中我们实现了tryAcquireShared和tryReleaseShared两个方法，在这两个方法中我们判断并设置了state的值。

sync.releaseShared和sync.acquireSharedInterruptibly会分别调用tryAcquireShared和tryReleaseShared方法。

前面我们也提到了很多同步类都是使用AQS来实现的，我们可以再看看其他标准同步类中tryAcquire的实现。

首先看下ReentrantLock:

~~~java
   final boolean tryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {
                if (compareAndSetState(0, acquires)) {
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            else if (current == getExclusiveOwnerThread()) {
                int nextc = c + acquires;
                if (nextc < 0) // overflow
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);
                return true;
            }
            return false;
        }
~~~

ReentrantLock只支持独占锁。所以它需要实现tryAcquire方法。除此之外它还维护了一个owner变量来保存当前所有者线程的标志符，从而来实现可重入锁。

我们再看下Semaphore和CountDownLatch的实现，因为他们是共享操作，所以需要实现tryAcqureShared方法：

~~~java
        final int tryAcquireShared(int acquires) {
            for (;;) {
                int available = getState();
                int remaining = available - acquires;
                if (remaining < 0 ||
                    compareAndSetState(available, remaining))
                    return remaining;
            }
        }
~~~

本文的例子请参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/AQS](https://github.com/ddean2009/learn-java-concurrency/tree/master/AQS)

更多内容请访问 [flydean的博客](www.flydean.com)





