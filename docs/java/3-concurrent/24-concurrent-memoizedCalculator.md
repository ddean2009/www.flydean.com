---
slug: /concurrent-memoizedCalculator
---

# 24. 在java中构建高效的结果缓存

缓存是现代应用服务器中非常常用的组件。除了第三方缓存以外，我们通常也需要在java中构建内部使用的缓存。那么怎么才能构建一个高效的缓存呢？ 本文将会一步步的进行揭秘。

## 使用HashMap

缓存通常的用法就是构建一个内存中使用的Map，在做一个长时间的操作比如计算之前，先在Map中查询一下计算的结果是否存在，如果不存在的话再执行计算操作。

我们定义了一个代表计算的接口：

~~~java
public interface Calculator<A, V> {

    V calculate(A arg) throws InterruptedException;
}
~~~

该接口定义了一个calculate方法，接收一个参数，并且返回计算的结果。

我们要定义的缓存就是这个Calculator具体实现的一个封装。

我们看下用HashMap怎么实现：

~~~java
public class MemoizedCalculator1<A, V> implements Calculator<A, V> {

    private final Map<A, V> cache= new HashMap<A, V>();
    private final Calculator<A, V> calculator;

    public MemoizedCalculator1(Calculator<A, V> calculator){
        this.calculator=calculator;
    }
    @Override
    public synchronized V calculate(A arg) throws InterruptedException {
        V result= cache.get(arg);
        if( result ==null ){
            result= calculator.calculate(arg);
            cache.put(arg, result);
        }
        return result;
    }
}
~~~

MemoizedCalculator1封装了Calculator，在调用calculate方法中，实际上调用了封装的Calculator的calculate方法。

因为HashMap不是线程安全的，所以这里我们使用了synchronized关键字，从而保证一次只有一个线程能够访问calculate方法。

虽然这样的设计能够保证程序的正确执行，但是每次只允许一个线程执行calculate操作，其他调用calculate方法的线程将会被阻塞，在多线程的执行环境中这会严重影响速度。从而导致使用缓存可能比不使用缓存需要的时间更长。

## 使用ConcurrentHashMap

因为HashMap不是线程安全的，那么我们可以尝试使用线程安全的ConcurrentHashMap来替代HashMap。如下所示：

~~~java
public class MemoizedCalculator2<A, V> implements Calculator<A, V> {

    private final Map<A, V> cache= new ConcurrentHashMap<>();
    private final Calculator<A, V> calculator;

    public MemoizedCalculator2(Calculator<A, V> calculator){
        this.calculator=calculator;
    }
    @Override
    public V calculate(A arg) throws InterruptedException {
        V result= cache.get(arg);
        if( result ==null ){
            result= calculator.calculate(arg);
            cache.put(arg, result);
        }
        return result;
    }
}
~~~

上面的例子中虽然解决了之前的线程等待的问题，但是当有两个线程同时在进行同一个计算的时候，仍然不能保证缓存重用，这时候两个线程都会分别调用计算方法，从而导致重复计算。

我们希望的是如果一个线程正在做计算，其他的线程只需要等待这个线程的执行结果即可。很自然的，我们想到了之前讲到的FutureTask。FutureTask表示一个计算过程，我们可以通过调用FutureTask的get方法来获取执行的结果，如果该执行正在进行中，则会等待。

下面我们使用FutureTask来进行改写。

## FutureTask

~~~java
@Slf4j
public class MemoizedCalculator3<A, V> implements Calculator<A, V> {

    private final Map<A, Future<V>> cache= new ConcurrentHashMap<>();
    private final Calculator<A, V> calculator;

    public MemoizedCalculator3(Calculator<A, V> calculator){
        this.calculator=calculator;
    }
    @Override
    public V calculate(A arg) throws InterruptedException {
        Future<V> future= cache.get(arg);
        V result=null;
        if( future ==null ){
            Callable<V> callable= new Callable<V>() {
                @Override
                public V call() throws Exception {
                    return calculator.calculate(arg);
                }
            };
            FutureTask<V> futureTask= new FutureTask<>(callable);
            future= futureTask;
            cache.put(arg, futureTask);
            futureTask.run();
        }
        try {
            result= future.get();
        } catch (ExecutionException e) {
           log.error(e.getMessage(),e);
        }
        return result;
    }
}
~~~

上面的例子，我们用FutureTask来封装计算，并且将FutureTask作为Map的value。

上面的例子已经体现了很好的并发性能。但是因为if语句是非原子性的，所以对这一种先检查后执行的操作，仍然可能存在同一时间调用的情况。

这个时候，我们可以借助于ConcurrentHashMap的原子性操作putIfAbsent来重写上面的类：

~~~java
@Slf4j
public class MemoizedCalculator4<A, V> implements Calculator<A, V> {

    private final Map<A, Future<V>> cache= new ConcurrentHashMap<>();
    private final Calculator<A, V> calculator;

    public MemoizedCalculator4(Calculator<A, V> calculator){
        this.calculator=calculator;
    }
    @Override
    public V calculate(A arg) throws InterruptedException {
        while (true) {
            Future<V> future = cache.get(arg);
            V result = null;
            if (future == null) {
                Callable<V> callable = new Callable<V>() {
                    @Override
                    public V call() throws Exception {
                        return calculator.calculate(arg);
                    }
                };
                FutureTask<V> futureTask = new FutureTask<>(callable);
                future = cache.putIfAbsent(arg, futureTask);
                if (future == null) {
                    future = futureTask;
                    futureTask.run();
                }

                try {
                    result = future.get();
                } catch (CancellationException e) {
                    log.error(e.getMessage(), e);
                    cache.remove(arg, future);
                } catch (ExecutionException e) {
                    log.error(e.getMessage(), e);
                }
                return result;
            }
        }
    }
}
~~~

上面使用了一个while循环，来判断从cache中获取的值是否存在，如果不存在则调用计算方法。

上面我们还要考虑一个缓存污染的问题，因为我们修改了缓存的结果，如果在计算的时候，计算被取消或者失败，我们需要从缓存中将FutureTask移除。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/MemoizedCalculate](https://github.com/ddean2009/learn-java-concurrency/tree/master/MemoizedCalculate)

更多内容请访问 [flydean的博客](http://www.flydean.com)

