---
slug: /java-8-stream-reduce
---

# 8. java 8 stream reduce详解和误区

# 简介

Stream API提供了一些预定义的reduce操作，比如count(), max(), min(), sum()等。如果我们需要自己写reduce的逻辑，则可以使用reduce方法。

本文将会详细分析一下reduce方法的使用，并给出具体的例子。

# reduce详解

Stream类中有三种reduce，分别接受1个参数，2个参数，和3个参数，首先来看一个参数的情况：

~~~java
Optional<T> reduce(BinaryOperator<T> accumulator);
~~~

该方法接受一个BinaryOperator参数，BinaryOperator是一个@FunctionalInterface,需要实现方法：

~~~java
R apply(T t, U u);
~~~

accumulator告诉reduce方法怎么去累计stream中的数据。

举个例子：

~~~java
List<Integer> intList = Arrays.asList(1,2,3);
        Optional<Integer> result1=intList.stream().reduce(Integer::sum);
        log.info("{}",result1);
~~~

上面的例子输出结果：

~~~txt
com.flydean.ReduceUsage - Optional[6]
~~~

一个参数的例子很简单。这里不再多说。

接下来我们再看一下两个参数的例子：

~~~java
T reduce(T identity, BinaryOperator<T> accumulator);
~~~

这个方法接收两个参数：identity和accumulator。多出了一个参数identity。

也许在有些文章里面有人告诉你identity是reduce的初始化值，可以随便指定，如下所示：

~~~java
Integer result2=intList.stream().reduce(100, Integer::sum);
        log.info("{}",result2);
~~~

上面的例子，我们计算的值是106。

如果我们将stream改成parallelStream：

~~~java
Integer result3=intList.parallelStream().reduce(100, Integer::sum);
        log.info("{}",result3);
~~~

得出的结果就是306。

为什么是306呢？因为在并行计算的时候，每个线程的初始累加值都是100，最后3个线程加出来的结果就是306。

并行计算和非并行计算的结果居然不一样，这肯定不是JDK的问题，我们再看一下JDK中对identity的说明：

> identity必须是accumulator函数的一个identity，也就是说必须满足：对于所有的t,都必须满足 accumulator.apply(identity, t) == t 

所以这里我们传入100是不对的，因为sum（100+1）！= 1。

这里sum方法的identity只能是0。

如果我们用0作为identity,则stream和parallelStream计算出的结果是一样的。这就是identity的真正意图。

下面再看一下三个参数的方法：

~~~java
<U> U reduce(U identity,
                 BiFunction<U, ? super T, U> accumulator,
                 BinaryOperator<U> combiner);
~~~

和前面的方法不同的是，多了一个combiner，这个combiner用来合并多线程计算的结果。

> 同样的，identity需要满足combiner.apply(u, accumulator.apply(identity, t)) == accumulator.apply(u, t)

大家可能注意到了为什么accumulator的类型是BiFunction而combiner的类型是BinaryOperator？

~~~java
public interface BinaryOperator<T> extends BiFunction<T,T,T>
~~~

BinaryOperator是BiFunction的子接口。BiFunction中定义了要实现的apply方法。

其实reduce底层方法的实现只用到了apply方法，并没有用到接口中其他的方法，所以我猜测这里的不同只是为了简单的区分。

# 总结

虽然reduce是一个很常用的方法，但是大家一定要遵循identity的规范，并不是所有的identity都是合适的。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/stream-reduce](https://github.com/ddean2009/learn-java-streams/tree/master/stream-reduce)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)





