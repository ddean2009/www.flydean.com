---
slug: /java-custom-collector
---

# 15. 怎么在java中创建一个自定义的collector

# 简介

在之前的java collectors文章里面，我们讲到了stream的collect方法可以调用Collectors里面的toList()或者toMap()方法，将结果转换为特定的集合类。

今天我们介绍一下怎么自定义一个Collector。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

# Collector介绍

我们先看一下Collector的定义：

![](https://img-blog.csdnimg.cn/20200414193724654.png)

Collector接口需要实现supplier(),accumulator(),combiner(),finisher(),characteristics()这5个接口。

同时Collector也提供了两个静态of方法来方便我们创建一个Collector实例。

我们可以看到两个方法的参数跟Collector接口需要实现的接口是一一对应的。

下面分别解释一下这几个参数：

* supplier

Supplier是一个函数，用来创建一个新的可变的集合。换句话说Supplier用来创建一个初始的集合。

* accumulator

accumulator定义了累加器，用来将原始元素添加到集合中。

* combiner

combiner用来将两个集合合并成一个。

* finisher

finisher将集合转换为最终的集合类型。

* characteristics

characteristics表示该集合的特征。这个不是必须的参数。

Collector定义了三个参数类型，T是输入元素的类型，A是reduction operation的累加类型也就是Supplier的初始类型，R是最终的返回类型。 我们画个图来看一下这些类型之间的转换关系：

![](https://img-blog.csdnimg.cn/20200430173026607.png)

有了这几个参数，我们接下来看看怎么使用这些参数来构造一个自定义Collector。

# 自定义Collector

我们利用Collector的of方法来创建一个不变的Set：

~~~java
    public static <T> Collector<T, Set<T>, Set<T>> toImmutableSet() {
        return Collector.of(HashSet::new, Set::add,
                (left, right) -> {
                    left.addAll(right);
                    return left;
                }, Collections::unmodifiableSet);
    }
~~~

上面的例子中，我们HashSet::new作为supplier，Set::add作为accumulator，自定义了一个方法作为combiner，最后使用Collections::unmodifiableSet将集合转换成不可变集合。

上面我们固定使用HashSet::new作为初始集合的生成方法，实际上，上面的方法可以更加通用：

~~~java
    public static <T, A extends Set<T>> Collector<T, A, Set<T>> toImmutableSet(
            Supplier<A> supplier) {

        return Collector.of(
                supplier,
                Set::add, (left, right) -> {
                    left.addAll(right);
                    return left;
                }, Collections::unmodifiableSet);
    }
~~~

上面的方法，我们将supplier提出来作为一个参数，由外部来定义。

看下上面两个方法的测试：

~~~java
    @Test
    public void toImmutableSetUsage(){
        Set<String> stringSet1=Stream.of("a","b","c","d")
                .collect(ImmutableSetCollector.toImmutableSet());
        log.info("{}",stringSet1);

        Set<String> stringSet2=Stream.of("a","b","c","d")
                .collect(ImmutableSetCollector.toImmutableSet(LinkedHashSet::new));
        log.info("{}",stringSet2);
    }
~~~

输出：
~~~java
INFO com.flydean.ImmutableSetCollector - [a, b, c, d]
INFO com.flydean.ImmutableSetCollector - [a, b, c, d]
~~~

# 总结

本文介绍了Collector和自定义Collector的实例，希望能对大家有所帮助。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/customCollector](https://github.com/ddean2009/learn-java-streams/tree/master/customCollector)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)

