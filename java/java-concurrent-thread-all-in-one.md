在现代计算机中，为了提升执行效率，引入了多线程的概念，多线程是怎么工作的？在多线程中的编程中需要注意哪些点？

如何在多线程中处理并发的问题？如何写出一个计划中中的多线程程序？本文将会带给大家不一样的感受。

这里是我总结的之前写过的关于java多线程和并发的文章，希望能给大家一些启发。

* [java.util.concurrent简介](http://www.flydean.com/java-util-concurrent-overview/)
* [java并发中的Synchronized关键词](http://www.flydean.com/java-concurrent-synchronized/)
* [java中的Volatile关键字使用](http://www.flydean.com/java-concurrent-volatile/)
* [java中wait和sleep的区别](http://www.flydean.com/java-wait-sleep/)
* [java中Future的使用](http://www.flydean.com/java-future/)
* [java并发中ExecutorService的使用](http://www.flydean.com/java-executorservice/)
* [java中Runnable和Callable的区别](http://www.flydean.com/java-runnable-callable/)
* [java中ThreadLocal的使用](http://www.flydean.com/java-threadlocal/)
* [java中线程的生命周期](http://www.flydean.com/java-thread-lifecycle/)
* [java中join的使用](http://www.flydean.com/java-join/)
* [怎么在java中关闭一个thread](http://www.flydean.com/java-kill-thread/)
* [java中的Atomic类](http://www.flydean.com/java-atomic/)
* [java中interrupt,interrupted和isInterrupted的区别](http://www.flydean.com/java-interrupt/)
* [java中的daemon thread](http://www.flydean.com/java-daemon-thread/)
* [java中ThreadPool的介绍和使用](http://www.flydean.com/java-threadpool/)
* [java中的fork join框架](http://www.flydean.com/java-fork-join/)
* [java中Locks的使用](http://www.flydean.com/java-locks/)
* [java并发中CountDownLatch的使用](http://www.flydean.com/java-countdownlatch/)
* [java中CyclicBarrier的使用](http://www.flydean.com/java-cyclicbarrier/)
* [在java中使用JMH（Java Microbenchmark Harness）做性能测试](http://www.flydean.com/java-jmh/)
* [java中ThreadLocalRandom的使用](http://www.flydean.com/java-threadlocalrandom/)
* [java中FutureTask的使用](http://www.flydean.com/java-futuretask/)
* [关于CompletableFuture的一切，看这篇文章就够了](http://www.flydean.com/java-completablefuture/)
* [java多线程之Phaser](http://www.flydean.com/java-phaser/)
* [java中使用Semaphore构建阻塞对象池](http://www.flydean.com/java-semaphore/)
* [在java中构建高效的结果缓存](http://www.flydean.com/java-memoizedcalculator/)
* [java中CompletionService的使用](http://www.flydean.com/java-completionservice/)
* [使用ExecutorService来停止线程服务](http://www.flydean.com/java-shutdown-executorservice/)
* [我们的线程被饿死了](http://www.flydean.com/java-starvationdeadlock/)
* [java中有界队列的饱和策略(reject policy)](http://www.flydean.com/java-reject-policy/)
* [由于不当的执行顺序导致的死锁](http://www.flydean.com/java-lock-ordering-deadlock/)
* [同步类的基础AbstractQueuedSynchronizer(AQS)](http://www.flydean.com/java-aqs/)
* [非阻塞同步机制和CAS](http://www.flydean.com/java-cas/)
* [非阻塞算法（Lock-Free）的实现](http://www.flydean.com/java-lock-free/)
* [java内存模型(JMM)和happens-before](http://www.flydean.com/java-jmm-happens-before/)

本系列将会持续更新，敬请期待！