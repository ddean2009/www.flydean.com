---
slug: /java-8-stream-foreach-break
---

# 10. 怎么break java8 stream的foreach

# 简介

我们通常需要在java stream中遍历处理里面的数据，其中foreach是最最常用的方法。

但是有时候我们并不想处理完所有的数据，或者有时候Stream可能非常的长，或者根本就是无限的。

一种方法是先filter出我们需要处理的数据，然后再foreach遍历。

那么我们如何直接break这个stream呢？今天本文重点讲解一下这个问题。

# 使用Spliterator

上篇文章我们在讲Spliterator的时候提到了，在tryAdvance方法中，如果返回false，则Spliterator将会停止处理后续的元素。

通过这个思路，我们可以创建自定义Spliterator。

假如我们有这样一个stream：

~~~java
Stream<Integer> ints = Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
~~~

我们想定义一个操作，当x > 5的时候就停止。

我们定义一个通用的Spliterator：

~~~java
public class CustomSpliterator<T> extends Spliterators.AbstractSpliterator<T>  {

    private Spliterator<T> splitr;
    private Predicate<T> predicate;
    private volatile boolean isMatched = true;

    public CustomSpliterator(Spliterator<T> splitr, Predicate<T> predicate) {
        super(splitr.estimateSize(), 0);
        this.splitr = splitr;
        this.predicate = predicate;
    }

    @Override
    public synchronized boolean tryAdvance(Consumer<? super T> consumer) {
        boolean hadNext = splitr.tryAdvance(elem -> {
            if (predicate.test(elem) && isMatched) {
                consumer.accept(elem);
            } else {
                isMatched = false;
            }
        });
        return hadNext && isMatched;
    }
}
~~~

在上面的类中，predicate是我们将要传入的判断条件，我们重写了tryAdvance，通过将predicate.test(elem)加入判断条件，从而当条件不满足的时候返回false.

看下怎么使用：

~~~java
@Slf4j
public class CustomSpliteratorUsage {

    public static <T> Stream<T> takeWhile(Stream<T> stream, Predicate<T> predicate) {
        CustomSpliterator<T> customSpliterator = new CustomSpliterator<>(stream.spliterator(), predicate);
        return StreamSupport.stream(customSpliterator, false);
    }

    public static void main(String[] args) {
        Stream<Integer> ints = Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        List<Integer> result =
          takeWhile(ints, x -> x < 5 )
                        .collect(Collectors.toList());
        log.info(result.toString());
    }
}
~~~

我们定义了一个takeWhile方法，接收Stream和predicate条件。

只有当predicate条件满足的时候才会继续，我们看下输出的结果：

~~~java
[main] INFO com.flydean.CustomSpliteratorUsage - [1, 2, 3, 4]
~~~

# 自定义forEach方法

除了使用Spliterator，我们还可以自定义forEach方法来使用自己的遍历逻辑：

~~~java
public class CustomForEach {

    public static class Breaker {
        private volatile boolean shouldBreak = false;

        public void stop() {
            shouldBreak = true;
        }

        boolean get() {
            return shouldBreak;
        }
    }

    public static <T> void forEach(Stream<T> stream, BiConsumer<T, Breaker> consumer) {
        Spliterator<T> spliterator = stream.spliterator();
        boolean hadNext = true;
        Breaker breaker = new Breaker();

        while (hadNext && !breaker.get()) {
            hadNext = spliterator.tryAdvance(elem -> {
                consumer.accept(elem, breaker);
            });
        }
    }
}
~~~

上面的例子中，我们在forEach中引入了一个外部变量，通过判断这个外部变量来决定是否进入spliterator.tryAdvance方法。

看下怎么使用：

~~~java
@Slf4j
public class CustomForEachUsage {

    public static void main(String[] args) {
        Stream<Integer> ints = Stream.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        List<Integer> result = new ArrayList<>();
        CustomForEach.forEach(ints, (elem, breaker) -> {
            if (elem >= 5 ) {
                breaker.stop();
            } else {
                result.add(elem);
            }
        });
        log.info(result.toString());
    }
}
~~~

上面我们用新的forEach方法，并通过判断条件来重置判断flag，从而达到break stream的目的。

# 总结

本文通过两个具体的例子讲解了如何break一个stream，希望大家能够喜欢。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/break-stream-foreach](https://github.com/ddean2009/learn-java-streams/tree/master/break-stream-foreach)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)

