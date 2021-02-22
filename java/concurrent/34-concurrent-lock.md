java中Locks的使用

之前文章中我们讲到，java中实现同步的方式是使用synchronized block。在java 5中，Locks被引入了，来提供更加灵活的同步控制。

本文将会深入的讲解Lock的使用。

## Lock和Synchronized Block的区别

我们在之前的Synchronized Block的文章中讲到了使用Synchronized来实现java的同步。既然Synchronized Block那么好用，为什么会引入新的Lock呢？

主要有下面几点区别：

1. synchronized block只能写在一个方法里面，而Lock的lock()和unlock()可以分别在不同的方法里面。
2. synchronized block 不支持公平锁，一旦锁被释放，任何线程都有机会获取被释放的锁。而使用 Lock APIs则可以支持公平锁。从而让等待时间最长的线程有限执行。
3. 使用synchronized block，如果线程拿不到锁，将会被Blocked。 Lock API 提供了一个tryLock() 的方法，可以判断是否可以获得lock，这样可以减少线程被阻塞的时间。
4. 当线程在等待synchronized block锁的时候，是不能被中断的。如果使用Lock API，则可以使用 lockInterruptibly()来中断线程。

## Lock interface

我们来看下Lock interface的定义, Lock interface定义了下面几个主要使用的方法：

* void lock() - 尝试获取锁，如果获取不到锁，则会进入阻塞状态。
* void lockInterruptibly() - 和lock（）很类似，但是它可以将正在阻塞的线程中断，并抛出java.lang.InterruptedException。
* boolean tryLock() – 这是lock()的非阻塞版本，它回尝试获取锁，并立刻返回是否获取成功。
* boolean tryLock(long timeout, TimeUnit timeUnit) – 和tryLock()很像，只是多了一个尝试获取锁的时间。
* void unlock() – unlock实例。
* Condition newCondition() - 生成一个和当前Lock实例绑定的Condition。

在使用Lock的时候，一定要unlocked，以避免死锁。所以，通常我们我们要在try catch中使用：

~~~java
Lock lock = ...; 
lock.lock();
try {
    // access to the shared resource
} finally {
    lock.unlock();
}
~~~

除了Lock接口，还有一个ReadWriteLock接口，在其中定义了两个方法，实现了读锁和写锁分离：

* Lock readLock() – 返回读锁
* Lock writeLock() – 返回写锁

其中读锁可以同时被很多线程获得，只要不进行写操作。写锁同时只能被一个线程获取。

接下来，我们几个Lock的常用是实现类。

## ReentrantLock

ReentrantLock是Lock的一个实现，什么是ReentrantLock（可重入锁）呢？ 

简单点说可重入锁就是当前线程已经获得了该锁，如果该线程的其他方法在调用的时候也需要获取该锁，那么该锁的lock数量+1，并且允许进入该方法。

> 不可重入锁：只判断这个锁有没有被锁上，只要被锁上申请锁的线程都会被要求等待。实现简单

> 可重入锁：不仅判断锁有没有被锁上，还会判断锁是谁锁上的，当就是自己锁上的时候，那么他依旧可以再次访问临界资源，并把加锁次数加一。

我们看下怎么使用ReentrantLock：

~~~java
    public void perform() {

        lock.lock();
        try {
            counter++;
        } finally {
            lock.unlock();
        }
    }
~~~

下面是使用tryLock（）的例子：

~~~java
    public void performTryLock() throws InterruptedException {
        boolean isLockAcquired = lock.tryLock(1, TimeUnit.SECONDS);

        if(isLockAcquired) {
            try {
                counter++;
            } finally {
                lock.unlock();
            }
        }
    }
~~~

## ReentrantReadWriteLock

ReentrantReadWriteLock是ReadWriteLock的一个实现。上面也讲到了ReadWriteLock主要有两个方法：

* Read Lock - 如果没有线程获得写锁，那么可以多个线程获得读锁。
* Write Lock - 如果没有其他的线程获得读锁和写锁，那么只有一个线程能够获得写锁。

我们看下怎么使用writeLock：

~~~java
    Map<String,String> syncHashMap = new HashMap<>();
    ReadWriteLock lock = new ReentrantReadWriteLock();

    Lock writeLock = lock.writeLock();

    public void put(String key, String value) {
        try {
            writeLock.lock();
            syncHashMap.put(key, value);
        } finally {
            writeLock.unlock();
        }
    }

    public String remove(String key){
        try {
            writeLock.lock();
            return syncHashMap.remove(key);
        } finally {
            writeLock.unlock();
        }
    }
~~~

再看下怎么使用readLock：

~~~java
    Lock readLock = lock.readLock();
    public String get(String key){
        try {
            readLock.lock();
            return syncHashMap.get(key);
        } finally {
            readLock.unlock();
        }
    }

    public boolean containsKey(String key) {
        try {
            readLock.lock();
            return syncHashMap.containsKey(key);
        } finally {
            readLock.unlock();
        }
    }
~~~

## StampedLock

StampedLock也支持读写锁，获取锁的是会返回一个stamp，通过该stamp来进行释放锁操作。

上我们讲到了如果写锁存在的话，读锁是无法被获取的。但有时候我们读操作并不想进行加锁操作，这个时候我们就需要使用乐观读锁。

StampedLock中的stamped类似乐观锁中的版本的概念，当我们在
StampedLock中调用lock方法的时候，就会返回一个stamp，代表锁当时的状态，在乐观读锁的使用过程中，在读取数据之后，我们回去判断该stamp状态是否变化，如果变化了就说明该stamp被另外的write线程修改了，这说明我们之前的读是无效的，这个时候我们就需要将乐观读锁升级为读锁，来重新获取数据。

我们举个例子，先看下write排它锁的情况：

~~~java
    private double x, y;
    private final StampedLock sl = new StampedLock();

    void move(double deltaX, double deltaY) { // an exclusively locked method
        long stamp = sl.writeLock();
        try {
            x += deltaX;
            y += deltaY;
        } finally {
            sl.unlockWrite(stamp);
        }
    }
~~~

再看下乐观读锁的情况：

~~~java
    double distanceFromOrigin() { // A read-only method
        long stamp = sl.tryOptimisticRead();
        double currentX = x, currentY = y;
        if (!sl.validate(stamp)) {
            stamp = sl.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                sl.unlockRead(stamp);
            }
        }
        return Math.sqrt(currentX * currentX + currentY * currentY);
    }
~~~

上面使用tryOptimisticRead（）来尝试获取乐观读锁，然后通过sl.validate(stamp)来判断该stamp是否被改变，如果改变了，说明之前的read是无效的，那么需要重新来读取。

最后，StampedLock还提供了一个将read锁和乐观读锁升级为write锁的功能：

~~~java
   void moveIfAtOrigin(double newX, double newY) { // upgrade
        // Could instead start with optimistic, not read mode
        long stamp = sl.readLock();
        try {
            while (x == 0.0 && y == 0.0) {
                long ws = sl.tryConvertToWriteLock(stamp);
                if (ws != 0L) {
                    stamp = ws;
                    x = newX;
                    y = newY;
                    break;
                }
                else {
                    sl.unlockRead(stamp);
                    stamp = sl.writeLock();
                }
            }
        } finally {
            sl.unlock(stamp);
        }
    }
~~~

上面的例子是通过使用tryConvertToWriteLock(stamp)来实现升级的。

## Conditions

上面讲Lock接口的时候有提到其中的一个方法：

~~~java
Condition newCondition();
~~~

Condition提供了await和signal方法，类似于Object中的wait和notify。

不同的是Condition提供了更加细粒度的等待集划分。我们举个例子：

~~~java
public class ConditionUsage {
    final Lock lock = new ReentrantLock();
    final Condition notFull  = lock.newCondition();
    final Condition notEmpty = lock.newCondition();

    final Object[] items = new Object[100];
    int putptr, takeptr, count;

    public void put(Object x) throws InterruptedException {
        lock.lock();
        try {
            while (count == items.length)
                notFull.await();
            items[putptr] = x;
            if (++putptr == items.length) putptr = 0;
            ++count;
            notEmpty.signal();
        } finally {
            lock.unlock();
        }
    }

    public Object take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0)
                notEmpty.await();
            Object x = items[takeptr];
            if (++takeptr == items.length) takeptr = 0;
            --count;
            notFull.signal();
            return x;
        } finally {
            lock.unlock();
        }
    }
}
~~~

上面的例子实现了一个ArrayBlockingQueue，我们可以看到在同一个Lock实例中，创建了两个Condition，分别代表队列未满，队列未空。通过这种细粒度的划分，我们可以更好的控制业务逻辑。

本文的例子可以参考[]()

















