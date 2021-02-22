java中CyclicBarrier的使用

CyclicBarrier是java 5中引入的线程安全的组件。它有一个barrier的概念，主要用来等待所有的线程都执行完毕，然后再去执行特定的操作。

假如我们有很多个线程，每个线程都计算出了一些数据，然后我们需要等待所有的线程都执行完毕，再把各个线程计算出来的数据加起来，的到最终的结果，那么我们就可以使用CyclicBarrier。

## CyclicBarrier的方法

我们先看下CyclicBarrier的构造函数：

~~~java
    public CyclicBarrier(int parties, Runnable barrierAction) {
        if (parties <= 0) throw new IllegalArgumentException();
        this.parties = parties;
        this.count = parties;
        this.barrierCommand = barrierAction;
    }

        public CyclicBarrier(int parties) {
        this(parties, null);
    }
~~~

CyclicBarrier有两个构造函数，第一个只接受一个参数，表示需要统一行动的线程个数。第二个参数叫做barrierAction，表示出发barrier是需要执行的方法。

其中barrierAction是一个Runnable，我们可以在其中定义最后需要执行的工作。

再看下重要await方法：

~~~java
    public int await() throws InterruptedException, BrokenBarrierException {
        try {
            return dowait(false, 0L);
        } catch (TimeoutException toe) {
            throw new Error(toe); // cannot happen
        }
    }

        public int await(long timeout, TimeUnit unit)
        throws InterruptedException,
               BrokenBarrierException,
               TimeoutException {
        return dowait(true, unit.toNanos(timeout));
    }
~~~

await也有两个方法，一个是带时间参数的，一个是不带时间参数的。

await本质上调用了lock.newCondition().await()方法。

因为有多个parties，下面我们考虑两种情况。

1. 该线程不是最后一个调用await的线程

在这种情况下，该线程将会进入等待状态，直到下面的情况发送：

* 最后一个线程调用await（）
* 其他线程中断了当前线程
* 其他线程中断了其他正在等待的线程
* 其他线程在等待barrier的时候超时
* 其他线程在该barrier上调用的reset（）方法
  
如果该线程在调用await（）的时候已经设置了interrupted的状态，或者在等待的时候被interrupted，那么将会抛出InterruptedException异常，并清除中断状态。（这里和Thread的interrupt()方法保持一致）

如果任何线程正在等待状态中，这时候barrier被重置。或者在线程调用await方法或者正在等待中，barrier被broken，那么将会抛出BrokenBarrierException。

如果任何线程在等待的时候被中断，那么所有其他等待的线程将会抛出BrokenBarrierException，barrier将会被置为broken状态。

2. 如果该线程是最后一个调用await方法的

在这种情况，如果barrierAction不为空，那么该线程将会在其他线程继续执行前调用这个barrierAction。

如果该操作抛出异常，那么barrier的状态将会被置为broken状态。

再看看这个reset() 方法：

~~~java
    public void reset() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            breakBarrier();   // break the current generation
            nextGeneration(); // start a new generation
        } finally {
            lock.unlock();
        }
    }
~~~

该方法将会将barrier置为broken状态，并且开启一个新的generation，来进行下一轮的操作。


## CyclicBarrier的使用

我们在子线程中生成一个随机的整数队列，当所有的线程都生成完毕之后，我们再将生成的整数全都加起来。看下怎么实现。

定义生成整数队列的子线程：

~~~java
public class CyclicBarrierUsage implements Runnable {

    private CyclicBarrier cyclicBarrier;
    private List<List<Integer>> partialResults;
    private Random random = new Random();

    public CyclicBarrierUsage(CyclicBarrier cyclicBarrier,List<List<Integer>> partialResults){
        this.cyclicBarrier=cyclicBarrier;
        this.partialResults=partialResults;
    }

    @Override
    public void run() {
        String thisThreadName = Thread.currentThread().getName();
        List<Integer> partialResult = new ArrayList<>();

        // Crunch some numbers and store the partial result
        for (int i = 0; i < 10; i++) {
            Integer num = random.nextInt(10);
            System.out.println(thisThreadName
                    + ": Crunching some numbers! Final result - " + num);
            partialResult.add(num);
        }

        partialResults.add(partialResult);
        try {
            System.out.println(thisThreadName
                    + " waiting for others to reach barrier.");
            cyclicBarrier.await();
        } catch (InterruptedException e) {
            // ...
        } catch (BrokenBarrierException e) {
            // ...
        }
    }

}
~~~

上面的子线程接收外部传入的cyclicBarrier和保存数据的partialResults，并在运行完毕调用cyclicBarrier.await()来等待其他线程执行完毕。

看下CyclicBarrier的构建：

~~~java
CyclicBarrier cyclicBarrier=new CyclicBarrier(5,()->{
            String thisThreadName = Thread.currentThread().getName();

            System.out.println(
                    thisThreadName + ": Computing sum of 5 workers, having 10 results each.");
            int sum = 0;

            for (List<Integer> threadResult : partialResults) {
                System.out.print("Adding ");
                for (Integer partialResult : threadResult) {
                    System.out.print(partialResult+" ");
                    sum += partialResult;
                }
                System.out.println();
            }
            System.out.println(thisThreadName + ": Final result = " + sum);
        });
~~~

在CyclicBarrier中，我们定义了一个BarrierAction来做最后数据的汇总处理。

运行：

~~~java
        for (int i = 0; i < 5; i++) {
            Thread worker = new Thread(new CyclicBarrierUsage(cyclicBarrier,partialResults));
            worker.setName("Thread " + i);
            worker.start();
        }
~~~

输出结果如下：

~~~txt
Spawning 5 worker threads to compute 10 partial results each
Thread 0: Crunching some numbers! Final result - 5
Thread 0: Crunching some numbers! Final result - 3
Thread 1: Crunching some numbers! Final result - 1
Thread 0: Crunching some numbers! Final result - 7
Thread 1: Crunching some numbers! Final result - 8
Thread 0: Crunching some numbers! Final result - 4
Thread 0: Crunching some numbers! Final result - 6
Thread 0: Crunching some numbers! Final result - 9
Thread 1: Crunching some numbers! Final result - 3
Thread 2: Crunching some numbers! Final result - 1
Thread 0: Crunching some numbers! Final result - 0
Thread 2: Crunching some numbers! Final result - 9
Thread 1: Crunching some numbers! Final result - 3
Thread 2: Crunching some numbers! Final result - 7
Thread 0: Crunching some numbers! Final result - 2
Thread 2: Crunching some numbers! Final result - 6
Thread 1: Crunching some numbers! Final result - 6
Thread 2: Crunching some numbers! Final result - 5
Thread 0: Crunching some numbers! Final result - 0
Thread 2: Crunching some numbers! Final result - 1
Thread 1: Crunching some numbers! Final result - 5
Thread 2: Crunching some numbers! Final result - 1
Thread 0: Crunching some numbers! Final result - 7
Thread 2: Crunching some numbers! Final result - 8
Thread 1: Crunching some numbers! Final result - 2
Thread 2: Crunching some numbers! Final result - 4
Thread 0 waiting for others to reach barrier.
Thread 2: Crunching some numbers! Final result - 0
Thread 2 waiting for others to reach barrier.
Thread 1: Crunching some numbers! Final result - 7
Thread 1: Crunching some numbers! Final result - 6
Thread 1: Crunching some numbers! Final result - 9
Thread 1 waiting for others to reach barrier.
Thread 3: Crunching some numbers! Final result - 9
Thread 3: Crunching some numbers! Final result - 3
Thread 3: Crunching some numbers! Final result - 8
Thread 3: Crunching some numbers! Final result - 8
Thread 3: Crunching some numbers! Final result - 1
Thread 3: Crunching some numbers! Final result - 8
Thread 3: Crunching some numbers! Final result - 0
Thread 3: Crunching some numbers! Final result - 5
Thread 3: Crunching some numbers! Final result - 9
Thread 3: Crunching some numbers! Final result - 1
Thread 3 waiting for others to reach barrier.
Thread 4: Crunching some numbers! Final result - 2
Thread 4: Crunching some numbers! Final result - 2
Thread 4: Crunching some numbers! Final result - 5
Thread 4: Crunching some numbers! Final result - 5
Thread 4: Crunching some numbers! Final result - 3
Thread 4: Crunching some numbers! Final result - 7
Thread 4: Crunching some numbers! Final result - 4
Thread 4: Crunching some numbers! Final result - 8
Thread 4: Crunching some numbers! Final result - 4
Thread 4: Crunching some numbers! Final result - 3
Thread 4 waiting for others to reach barrier.
Thread 4: Computing sum of 5 workers, having 10 results each.
Adding 5 3 7 4 6 9 0 2 0 7 
Adding 1 9 7 6 5 1 1 8 4 0 
Adding 1 8 3 3 6 5 2 7 6 9 
Adding 9 3 8 8 1 8 0 5 9 1 
Adding 2 2 5 5 3 7 4 8 4 3 
Thread 4: Final result = 230

Process finished with exit code 0
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/CyclicBarrier](https://github.com/ddean2009/learn-java-concurrency/tree/master/CyclicBarrier)

