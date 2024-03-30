---
slug: /java-8-infinite-stream
---

# 12. java 8中构建无限的stream

# 简介

在java中，我们可以将特定的集合转换成为stream，那么在有些情况下，比如测试环境中，我们需要构造一定数量元素的stream，需要怎么处理呢？

这里我们可以构建一个无限的stream，然后调用limit方法来限定返回的数目。

# 基本使用

先看一个使用Stream.iterate来创建无限Stream的例子：

~~~java
    @Test
    public void infiniteStream(){
        Stream<Integer> infiniteStream = Stream.iterate(0, i -> i + 1);
        List<Integer> collect = infiniteStream
                .limit(10)
                .collect(Collectors.toList());
        log.info("{}",collect);
    }
~~~

上面的例子中，我们通过调用Stream.iterate方法，创建了一个0，1，2，3，4....的无限stream。

然后调用limit(10)来获取其中的前10个。最后调用collect方法将其转换成为一个集合。

看下输出结果：

~~~java
INFO com.flydean.InfiniteStreamUsage - [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
~~~

# 自定义类型

如果我们想输出自定义类型的集合，该怎么处理呢？

首先，我们定义一个自定义类型：

~~~java
@Data
@AllArgsConstructor
public class IntegerWrapper {
    private Integer integer;
}
~~~

然后利用Stream.generate的生成器来创建这个自定义类型：

~~~java
    public static IntegerWrapper generateCustType(){
        return new IntegerWrapper(new Random().nextInt(100));
    }

    @Test
    public void infiniteCustType(){
        Supplier<IntegerWrapper> randomCustTypeSupplier = InfiniteStreamUsage::generateCustType;
        Stream<IntegerWrapper> infiniteStreamOfCustType = Stream.generate(randomCustTypeSupplier);

        List<IntegerWrapper> collect = infiniteStreamOfCustType
                .skip(10)
                .limit(10)
                .collect(Collectors.toList());
        log.info("{}",collect);
    }
~~~

看下输出结果：

~~~java
INFO com.flydean.InfiniteStreamUsage - [IntegerWrapper(integer=46), IntegerWrapper(integer=42), IntegerWrapper(integer=67), IntegerWrapper(integer=11), IntegerWrapper(integer=14), IntegerWrapper(integer=80), IntegerWrapper(integer=15), IntegerWrapper(integer=19), IntegerWrapper(integer=72), IntegerWrapper(integer=41)]
~~~

# 总结

本文介绍了两个生成无限stream的例子。本文的代码[learn-java-streams](https://github.com/ddean2009/learn-java-streams)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)
