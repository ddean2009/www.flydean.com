在java中使用JMH（Java Microbenchmark Harness）做性能测试

JMH的全称是Java Microbenchmark Harness，是一个open JDK中用来做性能测试的套件。该套件已经被包含在了JDK 12中。

本文将会讲解如何使用JMH来在java中做性能测试。

如果你使用的不是JDK 12，那么需要添加如下依赖：

~~~xml
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-core</artifactId>
    <version>1.19</version>
</dependency>
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-generator-annprocess</artifactId>
    <version>1.19</version>
</dependency>
~~~

## 使用JMH做性能测试

如果我们想测试某个方法的性能，一般来说就是重复执行某个方法n次，求出总的执行时间，然后求平均值。

但是这样通常会有一些问题，比如程序的头几次执行通常会比较慢，因为JVM会对多次执行的代码进行优化。另外得出的统计结果也不够直观，需要我们自行解析。

如果使用JMH可以轻松解决这些问题。

在JMH中，将要测试的方法添加@Benchmark注解即可：

~~~java
    @Benchmark
    public void measureThroughput() throws InterruptedException {
        TimeUnit.MILLISECONDS.sleep(100);
    }
~~~

看下怎么调用：

~~~java
    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(BenchMarkUsage.class.getSimpleName())
//                .include(BenchMarkUsage.class.getSimpleName()+".*measureThroughput*")
                // 预热3轮
                .warmupIterations(3)
                // 度量5轮
                .measurementIterations(5)
                .forks(1)
                .build();

        new Runner(opt).run();
    }
~~~

上面的例子，我们通过OptionsBuilder的include方法添加了需要进行测试的类。

默认情况下，该类的所有@Benchmark方法都将会被测试，如果我们只想测试其中的某个方法，我们可以在类后面加上方法的名字：

~~~java
.include(BenchMarkUsage.class.getSimpleName()+".*measureAll*")
~~~

上面的代码支持通配符。

warmupIterations(3)意思是在真正的执行前，先热身三次。

measurementIterations(5)表示我们将方法运行5次来测试性能。

forks(1)表示启动一个进程来执行这个任务。

上面是最基本的运行，我们看下运行结果：

~~~txt
# JMH version: 1.19
# VM version: JDK 1.8.0_171, VM 25.171-b11
# VM invoker: /Library/Java/JavaVirtualMachines/jdk1.8.0_171.jdk/Contents/Home/jre/bin/java
# VM options: -javaagent:/Applications/IntelliJ IDEA 2.app/Contents/lib/idea_rt.jar=55941:/Applications/IntelliJ IDEA 2.app/Contents/bin -Dfile.encoding=UTF-8
# Warmup: 3 iterations, 1 s each
# Measurement: 5 iterations, 1 s each
# Timeout: 10 min per iteration
# Threads: 1 thread, will synchronize iterations
# Benchmark mode: Throughput, ops/time
# Benchmark: com.flydean.BenchMarkUsage.measureThroughput

# Run progress: 26.66% complete, ETA 00:01:42
# Fork: 1 of 1
# Warmup Iteration   1: 9.727 ops/s
# Warmup Iteration   2: 9.684 ops/s
# Warmup Iteration   3: 9.678 ops/s
Iteration   1: 9.652 ops/s
Iteration   2: 9.678 ops/s
Iteration   3: 9.733 ops/s
Iteration   4: 9.651 ops/s
Iteration   5: 9.678 ops/s


Result "com.flydean.BenchMarkUsage.measureThroughput":
  9.678 ±(99.9%) 0.129 ops/s [Average]
  (min, avg, max) = (9.651, 9.678, 9.733), stdev = 0.034
  CI (99.9%): [9.549, 9.808] (assumes normal distribution)
~~~

ops/s 是每秒的OPS次数。程序会给出运行的最小值，平均值和最大值。同时给出标准差stdev和置信区间CI。

## BenchmarkMode

上面的例子中， 我们只用了最简单的@Benchmark。如果想实现更加复杂和自定义的BenchMark，我们可以使用@BenchmarkMode。

先举个例子：

~~~java
    @Benchmark
    @BenchmarkMode(Mode.Throughput)
    @OutputTimeUnit(TimeUnit.SECONDS)
    public void measureThroughput() throws InterruptedException {
        TimeUnit.MILLISECONDS.sleep(100);
    }
~~~

上面的例子中，我们指定了@BenchmarkMode(Mode.Throughput)，Throughput的意思是整体吞吐量，表示给定的时间内执行的次数。

这里我们通过 @OutputTimeUnit(TimeUnit.SECONDS)来指定时间单位。

Mode除了Throughput还有如下几种模式：

* AverageTime - 调用的平均时间
* SampleTime - 随机取样，最后输出取样结果的分布
* SingleShotTime - 只会执行一次，通常用来测试冷启动时候的性能。
* All - 所有的benchmark modes。

## Fork和Warmup

上面的例子中我们通过代码来显式的制定Fork和Warmup，我们也可以使用注解来实现：

~~~java
    @Fork(value = 1, warmups = 2)
    @Warmup(iterations = 5)
~~~

上面的例子中value表示该benchMark执行多少次，warmups表示fork多少个进程来执行。iterations表示warmup的iterations个数。

如果你同时在代码中和注解中都配置了相关的信息，那么注解将会覆盖掉代码中的显示配置。

## State和Scope

如果我们在多线程环境中使用beachMark,那么多线程中用到的类变量是共享还是每个线程一个呢？ 

这个时候我们就要用到@State注解。

~~~java
@State(Scope.Benchmark)
public class StateUsage {
}
~~~

Scope有三种：

* Scope.Thread：默认的State，每个测试线程分配一个实例；
* Scope.Benchmark：所有测试线程共享一个实例，用于测试有状态实例在多线程共享下的性能；
* Scope.Group：每个线程组共享一个实例；

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/benchmark](https://github.com/ddean2009/learn-java-concurrency/tree/master/benchmark)











