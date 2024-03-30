---
slug: /JDK10-var-anonymous-class
---

# 9. JDK10的新特性:var和匿名类

# 简介

匿名类相信大家都用过了，学过JDK8中的lambda表达式之后，可以发现有些匿名类是可以用lambda表达式来替代的，能够被替代的类叫做funcational interface。

具体的有关lambda表达式和匿名类的介绍，大家可以查阅我之前写的文章。这里就不多讲了。

本文主要介绍var和匿名类之间的一些平时没有注意到的问题。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# 匿名类中自定义变量

我们看一个经常使用的Runnable匿名类：

~~~java
Runnable runnable = new Runnable() {
String className=Thread.currentThread().getName();
@Override
public void run() {
    log.info("inside runnable");
    }
};
~~~

和平常使用的Runable不一样的是，我们为匿名类添加了一个变量叫做className。

因为Runnable接口并没有定义如何去访问这个新创建的className字段，所以使用runnable.className是会编译错误的。

但是如果我们将Runnable替换成为var：

~~~java
var runnable = new Runnable() {
            String className=Thread.currentThread().getName();
            @Override
            public void run() {
                log.info("inside runnable");
            }
        };
        log.info(runnable.className);
~~~

可以看到神奇的事情发生了，var变量可以访问到className。

# lambda表达式中的匿名类

我们经常在Stream的遍历和处理中使用lambda表达式，但是可能很少有人在lambda表达式中使用匿名类。

没关系，下面我们再举个例子：

~~~java
List<Object> objects=Stream.of(1,2,3,4).map(i-> new Object(){
            int count=i;
        }).filter(o -> o.count >0)
                .collect(Collectors.toList());
       log.info("{}",objects);
~~~

上面的例子中，我们创建了一个stream，在map的过程中返回了新创建的匿名Object，在匿名Object内部我们定义了一个叫做count的变量。

注意在接下来的filter中，我们实际上是可以直接使用map中创建的Object，并且可以直接访问其新定义的count变量。

# 总结

本文讲解了var变量中一些不为人知的小技巧，同时介绍了在lambda表达式中的匿名类的使用，希望大家能够喜欢。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/
ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)
