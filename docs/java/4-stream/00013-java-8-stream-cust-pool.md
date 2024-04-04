---
slug: /java-8-stream-cust-pool
---

# 13. 自定义parallelStream的thread pool

# 简介

之前我们讲到parallelStream的底层使用到了ForkJoinPool来提交任务的，默认情况下ForkJoinPool为每一个处理器创建一个线程，parallelStream如果没有特别指明的情况下，都会使用这个共享线程池来提交任务。

那么在特定的情况下，我们想使用自定义的ForkJoinPool该怎么处理呢？

# 通常操作

假如我们想做一个从1到1000的加法，我们可以用并行stream这样做：

~~~java
List<Integer> integerList= IntStream.range(1,1000).boxed().collect(Collectors.toList());
        ForkJoinPool customThreadPool = new ForkJoinPool(4);

        Integer total= integerList.parallelStream().reduce(0, Integer::sum);
        log.info("{}",total);
~~~

输出结果：

~~~java

INFO com.flydean.CustThreadPool - 499500
~~~

# 使用自定义ForkJoinPool

上面的例子使用的共享的thread pool。 我们看下怎么使用自定义的thread pool来提交并行stream：

~~~java
List<Integer> integerList= IntStream.range(1,1000).boxed().collect(Collectors.toList());

ForkJoinPool customThreadPool = new ForkJoinPool(4);
        Integer actualTotal = customThreadPool.submit(
                () -> integerList.parallelStream().reduce(0, Integer::sum)).get();
        log.info("{}",actualTotal);
~~~

上面的例子中，我们定义了一个4个线程的ForkJoinPool，并使用它来提交了这个parallelStream。

输出结果：

~~~Java
INFO com.flydean.CustThreadPool - 499500
~~~

# 总结

如果不想使用公共的线程池，则可以使用自定义的ForkJoinPool来提交。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/stream-cust-threadpool](https://github.com/ddean2009/learn-java-streams/tree/master/stream-cust-threadpool)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)

