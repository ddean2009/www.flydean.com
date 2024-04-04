---
slug: /iterator-to-list
---

# 8. Iterator to list的三种方法

# 简介

集合的变量少不了使用Iterator，从集合Iterator非常简单，直接调用Iterator方法就可以了。

那么如何从Iterator反过来生成List呢？今天教大家三个方法。

# 使用while

最简单最基本的逻辑就是使用while来遍历这个Iterator，在遍历的过程中将Iterator中的元素添加到新建的List中去。

如下面的代码所示：

~~~java
    @Test
    public void useWhile(){
        List<String> stringList= new ArrayList<>();
        Iterator<String> stringIterator= Arrays.asList("a","b","c").iterator();
        while(stringIterator.hasNext()){
            stringList.add(stringIterator.next());
        }
        log.info("{}",stringList);
    }
~~~

# 使用ForEachRemaining

Iterator接口有个default方法：

~~~java
    default void forEachRemaining(Consumer<? super E> action) {
        Objects.requireNonNull(action);
        while (hasNext())
            action.accept(next());
    }
~~~

实际上这方法的底层就是封装了while循环，那么我们可以直接使用这个ForEachRemaining的方法：

~~~java
    @Test
    public void useForEachRemaining(){
        List<String> stringList= new ArrayList<>();
        Iterator<String> stringIterator= Arrays.asList("a","b","c").iterator();
        stringIterator.forEachRemaining(stringList::add);
        log.info("{}",stringList);
    }
~~~

# 使用stream

我们知道构建Stream的时候，可以调用StreamSupport的stream方法：

~~~java
public static <T> Stream<T> stream(Spliterator<T> spliterator, boolean parallel) 
~~~

该方法传入一个spliterator参数。而Iterable接口正好有一个spliterator()的方法：

~~~java
    default Spliterator<T> spliterator() {
        return Spliterators.spliteratorUnknownSize(iterator(), 0);
    }
~~~

那么我们可以将Iterator转换为Iterable，然后传入stream。

仔细研究Iterable接口可以发现，Iterable是一个FunctionalInterface，只需要实现下面的接口就行了：

~~~java
Iterator<T> iterator();
~~~

利用lambda表达式，我们可以方便的将Iterator转换为Iterable：

~~~java
Iterator<String> stringIterator= Arrays.asList("a","b","c").iterator();
        Iterable<String> stringIterable = () -> stringIterator;
~~~

最后将其换行成为List：

~~~java
List<String> stringList= StreamSupport.stream(stringIterable.spliterator(),false).collect(Collectors.toList());
        log.info("{}",stringList);
~~~

# 总结

三个例子讲完了。大家可以参考代码[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)


