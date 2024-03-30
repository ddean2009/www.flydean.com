---
slug: /java-8-predicate-chain
---

# 11. java 8中 predicate chain的使用

# 简介

Predicate是一个FunctionalInterface，代表的方法需要输入一个参数，返回boolean类型。通常用在stream的filter中，表示是否满足过滤条件。

~~~java
    boolean test(T t);
~~~

# 基本使用

我们先看下在stream的filter中怎么使用Predicate：

~~~java
    @Test
    public void basicUsage(){
        List<String> stringList=Stream.of("a","b","c","d").filter(s -> s.startsWith("a")).collect(Collectors.toList());
        log.info("{}",stringList);
    }

~~~

上面的例子很基础了，这里就不多讲了。

# 使用多个Filter

如果我们有多个Predicate条件，则可以使用多个filter来进行过滤：

~~~java
    public void multipleFilters(){
        List<String> stringList=Stream.of("a","ab","aac","ad").filter(s -> s.startsWith("a"))
                .filter(s -> s.length()>1)
                .collect(Collectors.toList());
        log.info("{}",stringList);
    }
~~~

上面的例子中，我们又添加了一个filter，在filter又添加了一个Predicate。

# 使用复合Predicate

Predicate的定义是输入一个参数，返回boolean值，那么如果有多个测试条件，我们可以将其合并成一个test方法：

~~~java
    @Test
    public void complexPredicate(){
        List<String> stringList=Stream.of("a","ab","aac","ad")
                .filter(s -> s.startsWith("a") &&  s.length()>1)
                .collect(Collectors.toList());
        log.info("{}",stringList);
    }
~~~

上面的例子中，我们把s.startsWith("a") &&  s.length()>1 作为test的实现。

# 组合Predicate

Predicate虽然是一个interface，但是它有几个默认的方法可以用来实现Predicate之间的组合操作。

比如：Predicate.and(), Predicate.or(), 和 Predicate.negate()。

下面看下他们的例子：

~~~java
@Test
    public void combiningPredicate(){
        Predicate<String> predicate1 = s -> s.startsWith("a");
        Predicate<String> predicate2 =  s -> s.length() > 1;
        List<String> stringList1 = Stream.of("a","ab","aac","ad")
                .filter(predicate1.and(predicate2))
                .collect(Collectors.toList());
        log.info("{}",stringList1);

        List<String> stringList2 = Stream.of("a","ab","aac","ad")
                .filter(predicate1.or(predicate2))
                .collect(Collectors.toList());
        log.info("{}",stringList2);

        List<String> stringList3 = Stream.of("a","ab","aac","ad")
                .filter(predicate1.or(predicate2.negate()))
                .collect(Collectors.toList());
        log.info("{}",stringList3);

    }
~~~

实际上，我们并不需要显示的assign一个predicate，只要是满足
predicate接口的lambda表达式都可以看做是一个predicate。同样可以调用and，or和negate操作：

~~~java
List<String> stringList4 = Stream.of("a","ab","aac","ad")
                .filter(((Predicate<String>)a -> a.startsWith("a"))
                        .and(a -> a.length() > 1))
                .collect(Collectors.toList());
        log.info("{}",stringList4);
~~~

# Predicate的集合操作

如果我们有一个Predicate集合，我们可以使用reduce方法来对其进行合并运算：

~~~java
@Test
    public void combiningPredicateCollection(){
        List<Predicate<String>> allPredicates = new ArrayList<>();
        allPredicates.add(a -> a.startsWith("a"));
        allPredicates.add(a -> a.length() > 1);

        List<String> stringList = Stream.of("a","ab","aac","ad")
                .filter(allPredicates.stream().reduce(x->true, Predicate::and))
                .collect(Collectors.toList());
        log.info("{}",stringList);
    }
~~~

上面的例子中，我们调用reduce方法，对集合中的Predicate进行了and操作。

# 总结

本文介绍了多种Predicate的操作，希望大家在实际工作中灵活应用。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/predicate-chain](https://github.com/ddean2009/learn-java-streams/tree/master/predicate-chain)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)




