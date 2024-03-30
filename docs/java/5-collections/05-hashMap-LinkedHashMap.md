---
slug: /hashMap-LinkedHashMap
---

# 5. 深入理解HashMap和LinkedHashMap的区别

# 简介

我们知道HashMap的变量顺序是不可预测的，这意味着便利的输出顺序并不一定和HashMap的插入顺序是一致的。这个特性通常会对我们的工作造成一定的困扰。为了实现这个功能，我们可以使用LinkedHashMap。

# LinkedHashMap详解

先看下LinkedHashMap的定义：

~~~java
public class LinkedHashMap<K,V>
    extends HashMap<K,V>
    implements Map<K,V>
~~~

LinkedHashMap继承自HashMap，所以HashMap的所有功能在LinkedHashMap都可以用。

LinkedHashMap和HashMap的区别就是新创建了一个Entry:

~~~java

    static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
~~~

这个Entry继承自HashMap.Node，多了一个before，after来实现Node之间的连接。

通过这个新创建的Entry，就可以保证遍历的顺序和插入的顺序一致。

# 插入

下面看一个LinkedHashMap插入的例子：

~~~java
    @Test
    public void insertOrder(){
        LinkedHashMap<String, String> map = new LinkedHashMap<>();
        map.put("ddd","desk");
        map.put("aaa","ask");
        map.put("ccc","check");
        map.keySet().forEach(System.out::println);
    }
~~~

输出结果：

~~~java
ddd
aaa
ccc
~~~

可以看到输出结果和插入结果是一致的。

# 访问

除了遍历的顺序，LinkedHashMap还有一个非常有特色的访问顺序。

我们再看一个LinkedHashMap的构造函数：

~~~java
    public LinkedHashMap(int initialCapacity,
                         float loadFactor,
                         boolean accessOrder) {
        super(initialCapacity, loadFactor);
        this.accessOrder = accessOrder;
    }
~~~

前面的两个参数initialCapacity，loadFactor我们之前已经讲过了，现在看最后一个参数accessOrder。

当accessOrder设置成为true的时候，就开启了 access-order。

access order的意思是，将对象按照最老访问到最新访问的顺序排序。我们看个例子：

~~~java
    @Test
    public void accessOrder(){
        LinkedHashMap<String, String> map = new LinkedHashMap<>(16, .75f, true);
        map.put("ddd","desk");
        map.put("aaa","ask");
        map.put("ccc","check");
        map.keySet().forEach(System.out::println);
        map.get("aaa");
        map.keySet().forEach(System.out::println);
    }
~~~

输出结果：

~~~java
ddd
aaa
ccc
ddd
ccc
aaa
~~~

我们看到，因为访问了一次“aaa“，从而导致遍历的时候排到了最后。

# removeEldestEntry

最后我们看一下LinkedHashMap的一个特别的功能removeEldestEntry。这个方法是干什么的呢？

通过重新removeEldestEntry方法，可以让LinkedHashMap保存特定数目的Entry,通常用在LinkedHashMap用作缓存的情况。

removeEldestEntry将会删除最老的Entry，保留最新的。

~~~java
ublic class CustLinkedHashMap<K, V> extends LinkedHashMap<K, V> {

    private static final int MAX_ENTRIES = 10;

    public CustLinkedHashMap(
            int initialCapacity, float loadFactor, boolean accessOrder) {
        super(initialCapacity, loadFactor, accessOrder);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry eldest) {
        return size() > MAX_ENTRIES;
    }
}
~~~

看上面的一个自定义的例子，上面的例子我们创建了一个保留10个Entry节点的LinkedHashMap。

# 总结

LinkedHashMap继承自HashMap，同时提供了两个非常有用的功能。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)



