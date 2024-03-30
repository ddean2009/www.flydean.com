---
slug: /Comparable-Comparator
---

# 2. java中Comparable和Comparator的区别

# 简介

java.lang.Comparable和java.util.Comparator是两个容易混淆的接口,两者都带有比较的意思，那么两个接口到底有什么区别，分别在什么情况下使用呢？

# Comparable

Comparable是java.lang包下面的接口，lang包下面可以看做是java的基础语言接口。

实际上Comparable接口只定义了一个方法：

~~~java
 public int compareTo(T o);
~~~

实现这个接口的类都需要实现compareTo方法，表示两个类之间的比较。

这个比较排序之后的order，按照java的说法叫做natural ordering。这个order用在一些可排序的集合比如：SortedSet，SortedMap等等。

当使用这些可排序的集合添加相应的对象时，就会调用compareTo方法来进行natural ordering的排序。

几乎所有的数字类型对象：Integer, Long，Double等都实现了这个Comparable接口。

# Comparator

Comparator是一个FunctionalInterface，需要实现compare方法：

~~~java
int compare(T o1, T o2);
~~~

Comparator在java.util包中，代表其是一个工具类，用来辅助排序的。

在讲Comparable的时候，我们提到Comparable指定了对象的natural ordering，如果我们在添加到可排序集合类的时候想按照我们自定义的方式进行排序，这个时候就需要使用到Comparator了。

Collections.sort(List,Comparator),Arrays.sort(Object[],Comparator) 等这些辅助的方法类都可以通过传入一个Comparator来自定义排序规则。

在排序过程中，首先会去检查Comparator是否存在，如果不存在则会使用默认的natural ordering。

还有一个区别就是Comparator允许对null参数的比较，而Comparable是不允许的，否则会爬出NullPointerException。


# 举个例子

最后，我们举一个natural ordering和Comparator的例子：

~~~java
    @Test
    public void useCompare(){
        List<Integer> list1 = Arrays.asList(5, 3, 2, 4, 1);
        Collections.sort(list1);
        log.info("{}",list1);

        List<Integer> list2 = Arrays.asList(5, 3, 2, 4, 1);
        Collections.sort(list2, (a, b) -> b - a);
        log.info("{}",list2);
    }
~~~

输出结果：

~~~java
[main] INFO com.flydean.CompareUsage - [1, 2, 3, 4, 5]
[main] INFO com.flydean.CompareUsage - [5, 4, 3, 2, 1]
~~~

默认情况下Integer是按照升序来排的，但是我们可以通过传入一个Comparator来改变这个过程。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)
