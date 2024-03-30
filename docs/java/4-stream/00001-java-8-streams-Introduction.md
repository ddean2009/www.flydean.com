---
slug: /java-8-streams-Introduction
---

# 1. java 8 Streams简介

今天要讲的Stream指的是java.util.stream包中的诸多类。Stream可以方便的将之前的结合类以转换为Stream并以流式方式进行处理，大大的简化了我们的编程，Stream包中，最核心的就是interface Stream&lt;T> 

![](https://img-blog.csdnimg.cn/20200409222144859.png)

从上面的图中我们可以看到Stream继承自BaseStream。Stream中定义了很多非常实用的方法，比如filter，map，flatmap,forEach,reduce,collect等等。接下来我们将会逐一讲解。

# 创建Stream

Stream的创建有很多方式，java引入Stream之后所有的集合类都添加了一个stream()方法，通过这个方法可以直接得到其对应的Stream。也可以通过Stream.of方法来创建：

~~~java
//Stream Creation
        String[] arr = new String[]{"a", "b", "c"};
        Stream<String> stream = Arrays.stream(arr);
        stream = Stream.of("a", "b", "c");
~~~

# Streams多线程

如果我们想使用多线程来处理集合类的数据，Stream提供了非常方便的多线程方法parallelStream()：

~~~java
//Multi-threading
        List<String> list =new ArrayList();
        list.add("aaa");
        list.add("bbb");
        list.add("abc");
        list.add("ccc");
        list.add("ddd");
        list.parallelStream().forEach(element -> doPrint(element));
~~~

# Stream的基本操作

Stream的操作可以分为两类，一类是中间操作，中间操作返回Stream&lt;T>，因此可以级联调用。 另一类是终止操作，这类操作会返回Stream定义的类型。

~~~java
//Operations
        long count = list.stream().distinct().count();
~~~

上面的例子中，distinct()返回一个Stream，所以可以级联操作，最后的count()是一个终止操作，返回最后的值。

## Matching

Stream提供了anyMatch(), allMatch(), noneMatch()这三种match方式，我们看下怎么使用：

~~~java
//Matching
        boolean isValid = list.stream().anyMatch(element -> element.contains("h"));
        boolean isValidOne = list.stream().allMatch(element -> element.contains("h"));
        boolean isValidTwo = list.stream().noneMatch(element -> element.contains("h"));  
~~~

## Filtering

filter() 方法允许我们对Stream中的数据进行过滤，从而得到我们需要的：

~~~java
Stream<String> filterStream = list.stream().filter(element -> element.contains("d"));
~~~

上面的例子中我们从list中选出了包含“d”字母的String。

## Mapping

map就是对Stream中的值进行再加工，然后将加工过后的值作为新的Stream返回。

~~~java
//Mapping
        Stream<String> mappingStream = list.stream().map(element -> convertElement(element));

    private static String convertElement(String element) {
        return "element"+"abc";
    }
~~~

上的例子中我们把list中的每个值都加上了“abc”然后返回一个新的Stream。

## FlatMap

flatMap和Map很类似，但是他们两个又有不同，看名字我们可以看到flatMap意思是打平之后再做Map。

怎么理解呢？

假如我们有一个CustBook类：

~~~java
@Data
public class CustBook {

    List<String> bookName;
}
~~~

CustBook定义了一个bookName字段。

先看一下Map返回的结果：

~~~java
List<CustBook> users = new ArrayList<>();
        users.add(new CustBook());
Stream<Stream<String>> userStreamMap
                = users.stream().map(user -> user.getBookName().stream());
~~~

在上面的代码中，map将每一个user都转换成了stream，所以最后的结果是返回Stream的Stream。

如果我们只想返回String，则可以使用FlatMap：

~~~java
List<CustBook> users = new ArrayList<>();
        users.add(new CustBook());
        Stream<String> userStream
                = users.stream().map(user -> user.getBookName().stream());
~~~

简单点讲FlatMap就是将层级关系铺平重来。

## Reduction

使用reduce() 方法可以方便的对集合的数据进行运算，reduce()接收两个参数，第一个是开始值，后面是一个函数表示累计。

~~~java
//Reduction
        List<Integer> integers = Arrays.asList(1, 1, 1);
        Integer reduced = integers.stream().reduce(100, (a, b) -> a + b);
~~~

上面的例子我们定义了3个1的list，然后调用reduce(100, (a, b) -> a + b)方法，最后的结果是103.

## Collecting

collect()方法可以方便的将Stream再次转换为集合类，方便处理和展示：

~~~java
List<String> resultList
                = list.stream().map(element -> element.toUpperCase()).collect(Collectors.toList());
~~~

# 总结

Stream是java 8中的非常强大和实用的功能，大家一定要熟练掌握。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/java-8-streams-Introduction](https://github.com/ddean2009/learn-java-streams/tree/master/java-8-streams-Introduction)

更多内容请访问 [www.flydean.com](www.flydean.com)






