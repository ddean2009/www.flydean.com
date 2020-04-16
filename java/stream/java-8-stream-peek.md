java 8 Stream中操作类型和peek的使用

# 简介

java 8 stream作为流式操作有两种操作类型，中间操作和终止操作。这两种有什么区别呢？ 

我们看一个peek的例子：

~~~java
Stream<String> stream = Stream.of("one", "two", "three","four");
        stream.peek(System.out::println);
~~~

上面的例子中，我们的本意是打印出Stream的值，但实际上没有任何输出。

为什么呢？ 

# 中间操作和终止操作

一个java 8的stream是由三部分组成的。数据源，零个或一个或多个中间操作，一个或零个终止操作。

中间操作是对数据的加工，注意，中间操作是lazy操作，并不会立马启动，需要等待终止操作才会执行。

终止操作是stream的启动操作，只有加上终止操作，stream才会真正的开始执行。

所以，问题解决了，peek是一个中间操作，所以上面的例子没有任何输出。

# peek

我们看下peek的文档说明：peek主要被用在debug用途。

我们看下debug用途的使用：

~~~java
Stream.of("one", "two", "three","four").filter(e -> e.length() > 3)
                .peek(e -> System.out.println("Filtered value: " + e))
                .map(String::toUpperCase)
                .peek(e -> System.out.println("Mapped value: " + e))
                .collect(Collectors.toList());
~~~

上面的例子输出：

~~~txt
Filtered value: three
Mapped value: THREE
Filtered value: four
Mapped value: FOUR
~~~

上面的例子我们输出了stream的中间值，方便我们的调试。

为什么只作为debug使用呢？我们再看一个例子：

~~~java
Stream.of("one", "two", "three","four").peek(u -> u.toUpperCase())
                .forEach(System.out::println);
~~~

上面的例子我们使用peek将element转换成为upper case。然后输出：

~~~txt
one
two
three
four
~~~

可以看到stream中的元素并没有被转换成大写格式，所以peek只作为debug使用。

再看一个map的对比：

~~~java
Stream.of("one", "two", "three","four").map(u -> u.toUpperCase())
                .forEach(System.out::println);
~~~

输出：

~~~txt
ONE
TWO
THREE
FOUR
~~~

可以看到map是真正的对元素进行了转换。

当然peek也有例外，假如我们Stream里面是一个对象会怎么样？

~~~java
    @Data
    @AllArgsConstructor
    static class User{
        private String name;
    }
~~~

~~~java
        List<User> userList=Stream.of(new User("a"),new User("b"),new User("c")).peek(u->u.setName("kkk")).collect(Collectors.toList());
        log.info("{}",userList);
~~~

输出结果：

~~~txt
10:25:59.784 [main] INFO com.flydean.PeekUsage - [PeekUsage.User(name=kkk), PeekUsage.User(name=kkk), PeekUsage.User(name=kkk)]
~~~

我们看到如果是对象的话，实际的结果会被改变。



# 结论

我们在本文中讲解了stream的两个操作类型，并总结了peek的使用。希望大家能够掌握。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/stream-peek](https://github.com/ddean2009/learn-java-streams/tree/master/stream-peek)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)






