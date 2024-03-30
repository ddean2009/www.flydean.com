---
slug: /JDK12-collectors-teeing
---

# 12. JDK12的新特性:teeing collectors

# 简介

JDK12为java.util.stream.Collectors添加了一个新的teeing方法，怎么翻译呢？看到很多人都把它翻译成“发球台”，我不禁潸然泪下，哪里有那么复杂，tee就是T。它的作用就像是一个T型，数据从两头进入，然后从一头流出。teeing的作用也就在此。

# talk is cheap, show me the code

我最喜欢的就是一言不合上代码，文字的描述总是让人有点摸不着头脑，程序员还是要用程序说话。有了程序就有了逻辑，有了逻辑一切都有了。

> 更多内容请访问[www.flydean.com](www.flydean.com)

各大网站上的例子都喜欢举maxBy和minBy的例子，我这里偏不，下面举一个统计学生平均分数和总分数的例子，希望大家能够喜欢：

~~~java
    @Test
    public void useTeeing(){
        List<Student> studentList= Arrays.asList(
                new Student("alice", 90),
                new Student("boy", 20),
                new Student("bruce", 40),
                new Student("batman", 100)
        );
        String teeingResult=studentList.stream().collect(
                Collectors.teeing(
                        Collectors.averagingInt(Student::getScore),
                        Collectors.summingInt(Student::getScore),
                        (s1,s2)-> s1+ ":"+ s2
                )
        );
        log.info(teeingResult);
    }
~~~

好了，代码来了，上面我构建了一个Student的List。然后通过Collectors.teeing操作，传入了averagingInt和summingInt，最后通过一个merge表达式生成了最后的字符串。

我们看下输出结果：

~~~java
[main] INFO com.flydean.TeeingCollector - 62.5:250
~~~

# Teeing方法深度剖析

作为一个有追求的程序员，不深入了解下T的本质，肯定是睡不着的。我们看下T的定义：

~~~java
public static <T, R1, R2, R>
    Collector<T, ?, R> teeing(Collector<? super T, ?, R1> downstream1,
    Collector<? super T, ?, R2> downstream2,
    BiFunction<? super R1, ? super R2, R> merger)
~~~

首先分析一下T方法的返回值，T返回一个Collector。Collector是一个Reduction operations。它将输入的元素经过累计之后转换成为一个结果集合。

我们再看一下Collector接口的定义：

~~~java
public interface Collector<T, A, R> 
~~~

Collector定义了三个参数类型，T是输入元素的类型，A是reduction operation的累加类型也就是Supplier的初始类型，R是最终的返回类型。 我们画个图来看一下这些类型之间的转换关系：

![](https://img-blog.csdnimg.cn/20200430173026607.png)

Stream中的A和Supplier中的A经过accumulator和combiner，最终在finisher中转换成R。

T方法需要传入两个downstream，这两个downstream是两个Collector，可以看到两者的返回类型是可以不同的。

最后一个merger将R1和R2两种类型转换成了最终的返回类型R。

# Characteristics

最后讲一下Characteristics，Characteristics是指Collector的特征。

Characteristics是为了更好的执行collector的reduce操作。

比如，如果Characteristics是UNORDERED，则表示Collector在处理过程中并不保存元素的顺序，是没有顺序的。

如果Characteristics是CONCURRENT，则表示Collector会处理多线程的问题，而不需要Stream API来考虑。

因为T方法的前面两个参数是Collector，并且最后也返回一个Collector。

那么如果downstream1和downstream2都是UNORDERED，T最后返回的Collector也是UNORDERED的。

如果downstream1和downstream2都是CONCURRENT，T最后返回的Collector也是CONCURRENT的。

# 总结

上面就是T的所有介绍了。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)








