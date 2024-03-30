---
slug: /asList-arraylist
---

# 1. asList和ArrayList不得不说的故事

# 简介

提到集合类，ArrayList应该是用到的非常多的类了。这里的ArrayList是java.util.ArrayList，通常我们怎么创建ArrayList呢？

# 创建ArrayList

看下下面的例子：

~~~java
List<String> names = new ArrayList<>();
~~~

上面的方法创建了一个ArrayList，如果我们需要向其中添加元素的话，需要再调用add方法。

通常我们会使用一种更加简洁的办法来创建List：

~~~java
    @Test
    public void testAsList(){
        List<String> names = Arrays.asList("alice", "bob", "jack");
        names.add("mark");

    }
~~~

看下asList方法的定义：

~~~java
    public static <T> List<T> asList(T... a) {
        return new ArrayList<>(a);
    }
~~~

很好，使用Arrays.asList，我们可以方便的创建ArrayList。

运行下上面的例子，奇怪的事情发生了，上面的例子居然抛出了UnsupportedOperationException异常。

~~~java
java.lang.UnsupportedOperationException
	at java.util.AbstractList.add(AbstractList.java:148)
	at java.util.AbstractList.add(AbstractList.java:108)
	at com.flydean.AsListUsage.testAsList(AsListUsage.java:18)
~~~

# UnsupportedOperationException

先讲一下这个异常，UnsupportedOperationException是一个运行时异常，通常用在某些类中并没有实现接口的某些方法。

为什么上面的ArrayList调用add方法会抛异常呢？

# asList

我们再来详细的看一下Arrays.asList方法中返回的ArrayList：

~~~java
private static class ArrayList<E> extends AbstractList<E>
        implements RandomAccess, java.io.Serializable
~~~

可以看到，Arrays.asList返回的ArrayList是Arrays类中的一个内部类，并不是java.util.ArrayList。

这个类继承自AbstractList，在AbstractList中add方法是这样定义的：

~~~java
    public void add(int index, E element) {
        throw new UnsupportedOperationException();
    }
~~~

好了，我们的问题得到了解决。

# 转换

我们使用Arrays.asList得到ArrayList之后，能不能将其转换成为java.util.ArrayList呢？答案是肯定的。

我们看下下面的例子：

~~~java
    @Test
    public void testList(){
        List<String> names = new ArrayList<>(Arrays.asList("alice", "bob", "jack"));
        names.add("mark");
    }
~~~

上面的例子可以正常执行。



# 总结

在java中有很多同样名字的类，我们需要弄清楚他们到底是什么，不要混淆了。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)






