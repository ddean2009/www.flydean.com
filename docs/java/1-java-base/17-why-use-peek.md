---
slug: /why-use-peek
---

# 17. 还在stream中使用peek?不要被这些陷阱绊住了



# 简介

自从JDK中引入了stream之后，仿佛一切都变得很简单，根据stream提供的各种方法，如map，peek，flatmap等等，让我们的编程变得更美好。

事实上，我也经常在项目中看到有些小伙伴会经常使用peek来进行一些业务逻辑处理。

那么既然JDK文档中说peek方法主要是在调试的情况下使用，那么peek一定存在着某些不为人知的缺点。一起来看看吧。

# peek的定义和基本使用

先来看看peek的定义：

```
    Stream<T> peek(Consumer<? super T> action);
```

peek方法接受一个Consumer参数，返回一个Stream结果。

而Consumer是一个FunctionalInterface，它需要实现的方法是下面这个：

```
    void accept(T t);
```

accept对传入的参数T进行处理，但是并不返回任何结果。

我们先来看下peek的基本使用：

```
    public static void peekOne(){
        Stream.of(1, 2, 3)
                .peek(e -> log.info(String.valueOf(e)))
                .toList();
    }
```

运行上面的代码，我们可以得到：

```
[main] INFO com.flydean.Main - 1
[main] INFO com.flydean.Main - 2
[main] INFO com.flydean.Main - 3
```

逻辑很简单，就是打印出Stream中的元素而已。

# peek的流式处理

peek作为stream的一个方法，当然是流式处理的。接下来我们用一个具体的例子来说明流式处理具体是如何操作的。

```
    public static void peekForEach(){
        Stream.of(1, 2, 3)
                .peek(e -> log.info(String.valueOf(e)))
                .forEach(e->log.info("forEach"+e));
    }
```

这一次我们把toList方法替换成了forEach，通过具体的打印日志来看看到底发生了什么。

```
[main] INFO com.flydean.Main - 1
[main] INFO com.flydean.Main - forEach1
[main] INFO com.flydean.Main - 2
[main] INFO com.flydean.Main - forEach2
[main] INFO com.flydean.Main - 3
[main] INFO com.flydean.Main - forEach3
```

通过日志，我们可以看出，流式处理的流程是对应流中的每一个元素，分别经历了peek和forEach操作。而不是先把所有的元素都peek过后再进行forEach。

# Stream的懒执行策略

之所有会有流式操作，就是因为可能要处理的数据比较多，无法一次性加载到内存中。

所以为了优化stream的链式调用的效率，stream提供了一个懒加载的策略。

什么是懒加载呢？

就是说stream的方法中，除了部分terminal operation之外，其他的都是intermediate operation.

比如count，toList这些就是terminal operation。当接受到这些方法的时候，整个stream链条就要执行了。

而peek和map这些操作就是intermediate operation。

intermediate operation的特点是立即返回，如果最后没有以terminal operation结束,intermediate operation实际上是不会执行的。

我们来看个具体的例子：

```
    public static void peekLazy(){
        Stream.of(1, 2, 3)
                .peek(e -> log.info(String.valueOf(e)));
    }
```

运行之后你会发现，什么输出都没有。

这表示peek中的逻辑并没有被调用，所以这种情况大家一定要注意。

# peek为什么只被推荐在debug中使用

如果你阅读过peek的文档，你可能会发现peek是只被推荐在debug中使用的，为什么呢？

JDK中的原话是这样说的：

```
In cases where the stream implementation is able to optimize away the production of some or all the elements (such as with short-circuiting operations like findFirst, or in the example described in count), the action will not be invoked for those elements.
```

翻译过来的意思就是，因为stream的不同实现对实现方式进行了优化，所以不能够保证peek中的逻辑一定会被调用。

我们再来举个例子：

```
    public static void peekNotExecute(){
        Stream.of(1, 2, 3)
                .peek(e -> log.info("peekNotExecute"+e))
                .count();
    }
```

这里的terminal operation是count，表示对stream中的元素进行统计。

因为peek方法中参数是一个Consumer，它不会对stream中元素的个数产生影响，所以最后的运行结果就是3。

peek中的日志输出并没有打印出来，表示peek没有被执行。

所以，我们在使用peek的时候，一定要注意peek方法是否会被优化。要不然就会成为一个隐藏很深的bug。

# peek和map的区别

好了，讲到这里，大家应该对peek有了一个全面的认识了。但是stream中还有一个和peek类似的方法叫做map。他们有什么区别呢？

前面我们讲到了peek方法需要的参数是Consumer，而map方法需要的参数是一个Function:

```
    <R> Stream<R> map(Function<? super T, ? extends R> mapper);
```

Function也是一个FunctionalInterface,这个接口需要实现下面的方法：

```
    R apply(T t);
```

可以看出apply方法实际上是有返回值的，这跟Consumer是不同的。所以一般来说map是用来修改stream中具体元素的。 而peek则没有这个功能。

peek方法接收一个Consumer的入参. 了解λ表达式的应该明白 Consumer的实现类应该只有一个方法，该方法返回类型为void. 它只是对Stream中的元素进行某些操作,但是操作之后的数据并不返回到Stream中,所以Stream中的元素还是原来的元素.

map方法接收一个Function作为入参. Function是有返回值的, 这就表示map对Stream中的元素的操作结果都会返回到Stream中去.

* 要注意的是，peek对一个对象进行操作的时候,虽然对象不变,但是可以改变对象里面的值。

大家可以运行下面的例子：

```
    public static void peekUnModified(){
        Stream.of(1, 2, 3)
                .peek(e -> e=e+1)
                .forEach(e->log.info("peek unModified"+e));
    }

    public static void mapModified(){
        Stream.of(1, 2, 3)
                .map(e -> e=e+1)
                .forEach(e->log.info("map modified"+e));
    }
```

# 总结

以上就是对peek的总结啦，大家在使用的时候一定要注意存在的诸多陷阱。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/peek-and-map/](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/peek-and-map/)

> 更多文章请看 [www.flydean.com](www.flydean.com)









