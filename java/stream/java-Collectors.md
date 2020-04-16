java stream中Collectors的用法

# 简介

在java stream中，我们通常需要将处理后的stream转换成集合类，这个时候就需要用到stream.collect方法。collect方法需要传入一个Collector类型，要实现Collector还是很麻烦的，需要实现好几个接口。

于是java提供了更简单的Collectors工具类来方便我们构建Collector。

下面我们将会具体讲解Collectors的用法。

假如我们有这样两个list：

~~~java
List<String> list = Arrays.asList("jack", "bob", "alice", "mark");
List<String> duplicateList = Arrays.asList("jack", "jack", "alice", "mark");
~~~

上面一个是无重复的list，一个是带重复数据的list。接下来的例子我们会用上面的两个list来讲解Collectors的用法。

# Collectors.toList()

~~~java
List<String> listResult = list.stream().collect(Collectors.toList());
        log.info("{}",listResult);
~~~

将stream转换为list。这里转换的list是ArrayList，如果想要转换成特定的list，需要使用toCollection方法。

# Collectors.toSet()

~~~java
Set<String> setResult = list.stream().collect(Collectors.toSet());
        log.info("{}",setResult);
~~~

toSet将Stream转换成为set。这里转换的是HashSet。如果需要特别指定set，那么需要使用toCollection方法。

因为set中是没有重复的元素，如果我们使用duplicateList来转换的话，会发现最终结果中只有一个jack。

~~~java
Set<String> duplicateSetResult = duplicateList.stream().collect(Collectors.toSet());
        log.info("{}",duplicateSetResult);
~~~

# Collectors.toCollection()

上面的toMap,toSet转换出来的都是特定的类型，如果我们需要自定义，则可以使用toCollection()

~~~java
List<String> custListResult = list.stream().collect(Collectors.toCollection(LinkedList::new));
        log.info("{}",custListResult);
~~~

上面的例子，我们转换成了LinkedList。

# Collectors.toMap()

toMap接收两个参数，第一个参数是keyMapper，第二个参数是valueMapper:

~~~java
Map<String, Integer> mapResult = list.stream()
                .collect(Collectors.toMap(Function.identity(), String::length));
        log.info("{}",mapResult);
~~~

如果stream中有重复的值，则转换会报IllegalStateException异常：

~~~java
Map<String, Integer> duplicateMapResult = duplicateList.stream()
                .collect(Collectors.toMap(Function.identity(), String::length));
~~~

怎么解决这个问题呢？我们可以这样：

~~~java
Map<String, Integer> duplicateMapResult2 = duplicateList.stream()
                .collect(Collectors.toMap(Function.identity(), String::length, (item, identicalItem) -> item));
        log.info("{}",duplicateMapResult2);
~~~

在toMap中添加第三个参数mergeFunction，来解决冲突的问题。

# Collectors.collectingAndThen()

collectingAndThen允许我们对生成的集合再做一次操作。

~~~java
List<String> collectAndThenResult = list.stream()
                .collect(Collectors.collectingAndThen(Collectors.toList(), l -> {return new ArrayList<>(l);}));
        log.info("{}",collectAndThenResult);
~~~

# Collectors.joining()

Joining用来连接stream中的元素：

~~~java
String joinResult = list.stream().collect(Collectors.joining());
        log.info("{}",joinResult);
        String joinResult1 = list.stream().collect(Collectors.joining(" "));
        log.info("{}",joinResult1);
        String joinResult2 = list.stream().collect(Collectors.joining(" ", "prefix","suffix"));
        log.info("{}",joinResult2);
~~~

可以不带参数，也可以带一个参数，也可以带三个参数，根据我们的需要进行选择。

# Collectors.counting()

counting主要用来统计stream中元素的个数：

~~~java
Long countResult = list.stream().collect(Collectors.counting());
        log.info("{}",countResult);
~~~

# Collectors.summarizingDouble/Long/Int()

SummarizingDouble/Long/Int为stream中的元素生成了统计信息，返回的结果是一个统计类：

~~~java
IntSummaryStatistics intResult = list.stream()
                .collect(Collectors.summarizingInt(String::length));
        log.info("{}",intResult);
~~~

输出结果：

~~~txt
22:22:35.238 [main] INFO com.flydean.CollectorUsage - IntSummaryStatistics{count=4, sum=16, min=3, average=4.000000, max=5}
~~~

# Collectors.averagingDouble/Long/Int()

averagingDouble/Long/Int()对stream中的元素做平均：

~~~java
Double averageResult = list.stream().collect(Collectors.averagingInt(String::length));
        log.info("{}",averageResult);
~~~

# Collectors.summingDouble/Long/Int()

summingDouble/Long/Int()对stream中的元素做sum操作：

~~~java
Double summingResult = list.stream().collect(Collectors.summingDouble(String::length));
        log.info("{}",summingResult);
~~~

# Collectors.maxBy()/minBy()

maxBy()/minBy()根据提供的Comparator，返回stream中的最大或者最小值：

~~~java
Optional<String> maxByResult = list.stream().collect(Collectors.maxBy(Comparator.naturalOrder()));
        log.info("{}",maxByResult);
~~~

# Collectors.groupingBy()

GroupingBy根据某些属性进行分组，并返回一个Map：

~~~java
Map<Integer, Set<String>> groupByResult = list.stream()
                .collect(Collectors.groupingBy(String::length, Collectors.toSet()));
        log.info("{}",groupByResult);
~~~

# Collectors.partitioningBy()

PartitioningBy是一个特别的groupingBy，PartitioningBy返回一个Map，这个Map是以boolean值为key，从而将stream分成两部分，一部分是匹配PartitioningBy条件的，一部分是不满足条件的：

~~~java
 Map<Boolean, List<String>> partitionResult = list.stream()
                .collect(Collectors.partitioningBy(s -> s.length() > 3));
        log.info("{}",partitionResult);
~~~

看下运行结果：

~~~txt
22:39:37.082 [main] INFO com.flydean.CollectorUsage - {false=[bob], true=[jack, alice, mark]}
~~~

结果被分成了两部分。

# 总结

Collectors是一个非常强大的工具类，希望大家能够灵活使用。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/Collectors](https://github.com/ddean2009/learn-java-streams/tree/master/Collectors)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)



