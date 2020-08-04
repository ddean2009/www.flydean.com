一文弄懂EnumMap和EnumSet

# 简介

一般来说我们会选择使用HashMap来存储key-value格式的数据，考虑这样的特殊情况，一个HashMap的key都来自于一个Enum类，这样的情况则可以考虑使用本文要讲的EnumMap。

# EnumMap

先看一下EnumMap的定义和HashMap定义的比较：

~~~java
public class EnumMap<K extends Enum<K>, V> extends AbstractMap<K, V>
    implements java.io.Serializable, Cloneable
~~~

~~~java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable 
~~~

我们可以看到EnumMap几乎和HashMap是一样的，区别在于EnumMap的key是一个Enum。

下面看一个简单的使用的例子：

先定义一个Enum：

~~~java
public enum Types {
    RED, GREEN, BLACK, YELLO
}
~~~

再看下怎么使用EnumMap：

~~~java
    @Test
    public void useEnumMap(){
        EnumMap<Types, String> activityMap = new EnumMap<>(Types.class);
        activityMap.put(Types.BLACK,"black");
        activityMap.put(Types.GREEN,"green");
        activityMap.put(Types.RED,"red");
    }
~~~

其他的操作其实和hashMap是类似的，我们这里就不多讲了。

# 什么时候使用EnumMap

因为在EnumMap中，所有的key的可能值在创建的时候已经知道了，所以使用EnumMap和hashMap相比，可以提升效率。

同时，因为key比较简单，所以EnumMap在实现中，也不需要像HashMap那样考虑一些复杂的情况。

# EnumSet

跟EnumMap很类似，EnumSet是一个set，然后set中的元素都是某个Enum类型。

EnumSet是一个抽象类，要创建EnumSet类可以使用EnumSet提供的两个静态方法，noneOf和allOf。

先看一个noneOf：

~~~java
    public static <E extends Enum<E>> EnumSet<E> noneOf(Class<E> elementType) {
        Enum<?>[] universe = getUniverse(elementType);
        if (universe == null)
            throw new ClassCastException(elementType + " not an enum");

        if (universe.length <= 64)
            return new RegularEnumSet<>(elementType, universe);
        else
            return new JumboEnumSet<>(elementType, universe);
    }
~~~

noneOf传入一个Enum类，返回一个空的Enum类型的EnumSet。

从上面的代码我们可以看到EnumSet有两个实现，长度大于64的时候使用JumboEnumSet，小有64的时候使用RegularEnumSet。

注意，JumboEnumSet和RegularEnumSet不建议直接使用，他是内部使用的类。

再看一下allOf：

~~~java
public static <E extends Enum<E>> EnumSet<E> allOf(Class<E> elementType) {
        EnumSet<E> result = noneOf(elementType);
        result.addAll();
        return result;
    }
~~~

allOf很简单，先调用noneOf创建空的set，然后调用addAll方法将所有的元素添加进去。

# 总结

EnumMap和EnumSet对特定的Enum对象做了优化，可以在合适的情况下使用。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)




