---
slug: /java-8-stream-map
---

# 5. 怎么在java 8的map中使用stream

# 简介

Map是java中非常常用的一个集合类型，我们通常也需要去遍历Map去获取某些值，java 8引入了Stream的概念，那么我们怎么在Map中使用Stream呢？ 

# 基本概念

Map有key，value还有表示key，value整体的Entry。

创建一个Map：

~~~java
Map<String, String> someMap = new HashMap<>();
~~~

获取Map的entrySet：

~~~java
Set<Map.Entry<String, String>> entries = someMap.entrySet();
~~~

获取map的key：

~~~java
Set<String> keySet = someMap.keySet();
~~~

获取map的value：

~~~java
Collection<String> values = someMap.values();
~~~

上面我们可以看到有这样几个集合：Map，Set，Collection。

除了Map没有stream，其他两个都有stream方法：

~~~java
Stream<Map.Entry<String, String>> entriesStream = entries.stream();
        Stream<String> valuesStream = values.stream();
        Stream<String> keysStream = keySet.stream();
~~~

我们可以通过其他几个stream来遍历map。

# 使用Stream获取map的key

我们先给map添加几个值：

~~~java
someMap.put("jack","20");
someMap.put("bill","35");
~~~

上面我们添加了name和age字段。

如果我们想查找age=20的key，则可以这样做：

~~~java
Optional<String> optionalName = someMap.entrySet().stream()
                .filter(e -> "20".equals(e.getValue()))
                .map(Map.Entry::getKey)
                .findFirst();

        log.info(optionalName.get());
~~~

因为返回的是Optional,如果值不存在的情况下，我们也可以处理：

~~~java
optionalName = someMap.entrySet().stream()
                .filter(e -> "Non ages".equals(e.getValue()))
                .map(Map.Entry::getKey).findFirst();

        log.info("{}",optionalName.isPresent());
~~~

上面的例子我们通过调用isPresent来判断age是否存在。

如果有多个值，我们可以这样写：

~~~java
someMap.put("alice","20");
        List<String> listnames = someMap.entrySet().stream()
                .filter(e -> e.getValue().equals("20"))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        log.info("{}",listnames);
~~~

上面我们调用了collect(Collectors.toList())将值转成了List。

# 使用stream获取map的value

上面我们获取的map的key，同样的我们也可以获取map的value：

~~~java
List<String> listAges = someMap.entrySet().stream()
                .filter(e -> e.getKey().equals("alice"))
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());

        log.info("{}",listAges);
~~~

上面我们匹配了key值是alice的value。

# 总结

Stream是一个非常强大的功能，通过和map相结合，我们可以更加简单的操作map对象。

本文的例子[https://github.com/ddean2009/learn-java-streams/tree/master/stream-formap](https://github.com/ddean2009/learn-java-streams/tree/master/stream-formap)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)

