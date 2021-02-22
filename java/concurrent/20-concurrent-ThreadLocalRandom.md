java中ThreadLocalRandom的使用

在java中我们通常会需要使用到java.util.Random来便利的生产随机数。但是Random是线程安全的，如果要在线程环境中的话就有可能产生性能瓶颈。 

我们以Random中常用的nextInt方法为例来具体看一下：

~~~java
    public int nextInt() {
        return next(32);
    }
~~~

nextInt方法实际上调用了下面的方法：

~~~java
    protected int next(int bits) {
        long oldseed, nextseed;
        AtomicLong seed = this.seed;
        do {
            oldseed = seed.get();
            nextseed = (oldseed * multiplier + addend) & mask;
        } while (!seed.compareAndSet(oldseed, nextseed));
        return (int)(nextseed >>> (48 - bits));
    }
~~~

从代码中我们可以看到，方法内部使用了AtomicLong，并调用了它的compareAndSet方法来保证线程安全性。所以这个是一个线程安全的方法。

其实在多个线程环境中，Random根本就需要共享实例，那么该怎么处理呢？ 

在JDK 7 中引入了一个ThreadLocalRandom的类。ThreadLocal大家都知道就是线程的本地变量，而ThreadLocalRandom就是线程本地的Random。

我们看下怎么调用：

~~~java
ThreadLocalRandom.current().nextInt();
~~~

我们来为这两个类分别写一个benchMark测试：

~~~java
public class RandomUsage {

    public void testRandom() throws InterruptedException {
        ExecutorService executorService=Executors.newFixedThreadPool(2);
        Random random = new Random();
        List<Callable<Integer>> callables = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            callables.add(() -> {
                return random.nextInt();
            });
            }
        executorService.invokeAll(callables);
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(RandomUsage.class.getSimpleName())
                // 预热5轮
                .warmupIterations(5)
                // 度量10轮
                .measurementIterations(10)
                .forks(1)
                .build();

        new Runner(opt).run();
    }
}
~~~

~~~java
public class ThreadLocalRandomUsage {

    @Benchmark
    @BenchmarkMode(Mode.AverageTime)
    @OutputTimeUnit(TimeUnit.MICROSECONDS)
    public void testThreadLocalRandom() throws InterruptedException {
        ExecutorService executorService=Executors.newFixedThreadPool(2);
        List<Callable<Integer>> callables = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            callables.add(() -> {
                return ThreadLocalRandom.current().nextInt();
            });
            }
        executorService.invokeAll(callables);
    }

    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(ThreadLocalRandomUsage.class.getSimpleName())
                // 预热5轮
                .warmupIterations(5)
                // 度量10轮
                .measurementIterations(10)
                .forks(1)
                .build();

        new Runner(opt).run();
    }
}
~~~

分析运行结果，我们可以看出ThreadLocalRandom在多线程环境中会比Random要快。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/ThreadLocalRandom](https://github.com/ddean2009/learn-java-concurrency/tree/master/ThreadLocalRandom)