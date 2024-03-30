---
slug: /concurrent-Phaser
---

# 33. java多线程之Phaser

前面的文章中我们讲到了CyclicBarrier、CountDownLatch的使用，这里再回顾一下CountDownLatch主要用在一个线程等待多个线程执行完毕的情况，而CyclicBarrier用在多个线程互相等待执行完毕的情况。

Phaser是java 7 引入的新的并发API。他引入了新的Phaser的概念，我们可以将其看成一个一个的阶段，每个阶段都有需要执行的线程任务，任务执行完毕就进入下一个阶段。所以Phaser特别适合使用在重复执行或者重用的情况。

## 基本使用

在CyclicBarrier、CountDownLatch中，我们使用计数器来控制程序的顺序执行，同样的在Phaser中也是通过计数器来控制。在Phaser中计数器叫做parties， 我们可以通过Phaser的构造函数或者register()方法来注册。

通过调用register()方法，我们可以动态的控制phaser的个数。如果我们需要取消注册，则可以调用arriveAndDeregister()方法。

我们看下arrive：

~~~java
    public int arrive() {
        return doArrive(ONE_ARRIVAL);
    }
~~~

Phaser中arrive实际上调用了doArrive方法，doArrive接收一个adjust参数，ONE_ARRIVAL表示arrive，ONE_DEREGISTER表示arriveAndDeregister。

Phaser中的arrive()、arriveAndDeregister()方法，这两个方法不会阻塞，但是会返回相应的phase数字，当此phase中最后一个party也arrive以后，phase数字将会增加，即phase进入下一个周期，同时触发（onAdvance）那些阻塞在上一phase的线程。这一点类似于CyclicBarrier的barrier到达机制；更灵活的是，我们可以通过重写onAdvance方法来实现更多的触发行为。

下面看一个基本的使用：

~~~java
    void runTasks(List<Runnable> tasks) {
        final Phaser phaser = new Phaser(1); // "1" to register self
        // create and start threads
        for (final Runnable task : tasks) {
            phaser.register();
            new Thread() {
                public void run() {
                    phaser.arriveAndAwaitAdvance(); // await all creation
                    task.run();
                }
            }.start();
        }

        // allow threads to start and deregister self
        phaser.arriveAndDeregister();
    }
~~~

上面的例子中，我们在执行每个Runnable之前调用register（）来注册， 然后调用arriveAndAwaitAdvance()来等待这一个Phaser周期结束。最后我们调用 phaser.arriveAndDeregister();来取消注册主线程。

下面来详细的分析一下运行步骤：

1. final Phaser phaser = new Phaser(1);

这一步我们初始化了一个Phaser，并且指定其现在party的个数为1。

2. phaser.register();

这一步注册Runnable task到phaser，同时将party+1。

3. phaser.arriveAndAwaitAdvance(）

这一步将会等待直到所有的party都arrive。这里只会将步骤2中注册的party标记为arrive，而步骤1中初始化的party一直都没有被arrive。

4. phaser.arriveAndDeregister();

在主线程中，arrive了步骤1中的party，并且将party的个数减一。

5. 步骤3中的phaser.arriveAndAwaitAdvance(）将会继续执行，因为最后一个phaser在步骤4中arrive了。



## 多个Phaser周期

Phaser的值是从0到Integer.MAX_VALUE，每个周期过后该值就会加一，如果到达Integer.MAX_VALUE则会继续从0开始。

如果我们执行多个Phaser周期，则可以重写onAdvance方法：

~~~java
    protected boolean onAdvance(int phase, int registeredParties) {
        return registeredParties == 0;
    }
~~~

onAdvance将会在最后一个arrive（）调用的时候被调用，如果这个时候registeredParties为0的话，该Phaser将会调用isTerminated方法结束该Phaser。

如果要实现多周期的情况，我们可以重写这个方法：

~~~java
protected boolean onAdvance(int phase, int registeredParties) {
                return phase >= iterations || registeredParties == 0;
            }
~~~

上面的例子中，如果phase次数超过了指定的iterations次数则就会自动终止。

我们看下实际的例子：

~~~java
   void startTasks(List<Runnable> tasks, final int iterations) {
        final Phaser phaser = new Phaser() {
            protected boolean onAdvance(int phase, int registeredParties) {
                return phase >= iterations || registeredParties == 0;
            }
        };
        phaser.register();
        for (final Runnable task : tasks) {
            phaser.register();
            new Thread() {
                public void run() {
                    do {
                        task.run();
                        phaser.arriveAndAwaitAdvance();
                    } while (!phaser.isTerminated());
                }
            }.start();
        }
        phaser.arriveAndDeregister(); // deregister self, don't wait
    }
~~~

上面的例子将会执行iterations次。






