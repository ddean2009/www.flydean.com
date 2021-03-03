java安全编码指南之:死锁dead lock

# 简介

java中为了保证共享数据的安全性，我们引入了锁的机制。有了锁就有可能产生死锁。

死锁的原因就是多个线程锁住了对方所需要的资源，然后现有的资源又没有释放，从而导致循环等待的情况。

通常来说如果不同的线程对加锁和释放锁的顺序不一致的话，就很有可能产生死锁。

# 不同的加锁顺序

我们来看一个不同加锁顺序的例子：

~~~java
public class DiffLockOrder {

    private int amount;

    public DiffLockOrder(int amount){
       this.amount=amount;
    }

    public void transfer(DiffLockOrder target,int transferAmount){
        synchronized (this){
            synchronized (target){
                if(amount< transferAmount){
                    System.out.println("余额不足！");
                }else{
                    amount=amount-transferAmount;
                    target.amount=target.amount+transferAmount;
                }
            }
        }
    }
}
~~~

上面的例子中，我们模拟一个转账的过程，amount用来表示用户余额。transfer用来将当前账号的一部分金额转移到目标对象中。

为了保证在transfer的过程中，两个账户不被别人修改，我们使用了两个synchronized关键字，分别把transfer对象和目标对象进行锁定。

看起来好像没问题，但是我们没有考虑在调用的过程中，transfer的顺序是可以发送变化的：

~~~java
        DiffLockOrder account1 = new DiffLockOrder(1000);
        DiffLockOrder account2 = new DiffLockOrder(500);

        Runnable target1= ()->account1.transfer(account2,200);
        Runnable target2= ()->account2.transfer(account1,100);
        new Thread(target1).start();
        new Thread(target2).start();
~~~

上面的例子中，我们定义了两个account，然后两个账户互相转账，最后很有可能导致互相锁定，最后产生死锁。

# 使用private类变量

使用两个sync会有顺序的问题，那么有没有办法只是用一个sync就可以在所有的实例中同步呢？

有的，我们可以使用private的类变量，因为类变量是在所有实例中共享的，这样一次sync就够了：

~~~java
public class LockWithPrivateStatic {

    private int amount;

    private static final Object lock = new Object();

    public LockWithPrivateStatic(int amount){
       this.amount=amount;
    }

    public void transfer(LockWithPrivateStatic target, int transferAmount){
        synchronized (lock) {
            if (amount < transferAmount) {
                System.out.println("余额不足！");
            } else {
                amount = amount - transferAmount;
                target.amount = target.amount + transferAmount;
            }
        }
    }
}
~~~

# 使用相同的Order

我们产生死锁的原因是无法控制上锁的顺序，如果我们能够控制上锁的顺序，是不是就不会产生死锁了呢？

带着这个思路，我们给对象再加上一个id字段：

~~~java
    private final long id; // 唯一ID，用来排序
    private static final AtomicLong nextID = new AtomicLong(0); // 用来生成ID

    public DiffLockWithOrder(int amount){
       this.amount=amount;
        this.id = nextID.getAndIncrement();
    }
~~~

在初始化对象的时候，我们使用static的AtomicLong类来为每个对象生成唯一的ID。

在做transfer的时候，我们先比较两个对象的ID大小，然后根据ID进行排序，最后安装顺序进行加锁。这样就能够保证顺序，从而避免死锁。

~~~java
    public void transfer(DiffLockWithOrder target, int transferAmount){
        DiffLockWithOrder fist, second;

        if (compareTo(target) < 0) {
            fist = this;
            second = target;
        } else {
            fist = target;
            second = this;
        }

        synchronized (fist){
            synchronized (second){
                if(amount< transferAmount){
                    System.out.println("余额不足！");
                }else{
                    amount=amount-transferAmount;
                    target.amount=target.amount+transferAmount;
                }
            }
        }
    }
~~~

# 释放掉已占有的锁

死锁是互相请求对方占用的锁，但是对方的锁一直没有释放，我们考虑一下，如果获取不到锁的时候，自动释放已占用的锁是不是也可以解决死锁的问题呢？

因为ReentrantLock有一个tryLock()方法，我们可以使用这个方法来判断是否能够获取到锁，获取不到就释放已占有的锁。

我们使用ReentrantLock来完成这个例子：

~~~java
public class DiffLockWithReentrantLock {

    private int amount;
    private final Lock lock = new ReentrantLock();

    public DiffLockWithReentrantLock(int amount){
        this.amount=amount;
    }

    private void transfer(DiffLockWithReentrantLock target, int transferAmount)
            throws InterruptedException {
        while (true) {
            if (this.lock.tryLock()) {
                try {
                    if (target.lock.tryLock()) {
                        try {
                            if(amount< transferAmount){
                                System.out.println("余额不足！");
                            }else{
                                amount=amount-transferAmount;
                                target.amount=target.amount+transferAmount;
                            }
                            break;
                        } finally {
                            target.lock.unlock();
                        }
                    }
                } finally {
                    this.lock.unlock();
                }
            }
            //随机sleep一定的时间，保证可以释放掉锁
            Thread.sleep(1000+new Random(1000L).nextInt(1000));
        }
    }

}
~~~

我们把两个tryLock方法在while循环中，如果不能获取到锁就循环遍历。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！




