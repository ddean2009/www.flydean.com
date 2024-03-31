---
slug: /48-netty-fastThreadLocal
---

# 72. netty系列之:给ThreadLocal插上梦想的翅膀,详解FastThreadLocal



# 简介

JDK中的ThreadLocal可以通过get方法来获得跟当前线程绑定的值。而这些值是存储在ThreadLocal.ThreadLocalMap中的。而在ThreadLocalMap中底层的数据存储是一个Entry数组中的。

那么从ThreadLocalMap中获取数据的速度如何呢？速度有没有可以优化的空间呢？

一起来看看。

# 从ThreadLocalMap中获取数据

ThreadLocalMap作为一个Map，它的底层数据存储是一个Entry类型的数组：

```
private Entry[] table;
```

我们再来回顾一下ThreadLocal是怎么获取数据的：

```
        private Entry getEntry(ThreadLocal<?> key) {
            int i = key.threadLocalHashCode & (table.length - 1);
            Entry e = table[i];
            if (e != null && e.get() == key)
                return e;
            else
                return getEntryAfterMiss(key, i, e);
        }
```

首先根据ThreadLocal对象中的threadLocalHashCode跟table的长度进行取模运算，得到要获取的Entry在table中的位置，然后判断位置Entry的key是否和要获取的ThreadLocal对象一致。

如果一致，说明获取到了ThreadLocal绑定的对象，直接返回即可。

如果不一致，则需要再次进行查找。

我们看下再次查找的逻辑：

```
        private Entry getEntryAfterMiss(ThreadLocal<?> key, int i, Entry e) {
            Entry[] tab = table;
            int len = tab.length;

            while (e != null) {
                ThreadLocal<?> k = e.get();
                if (k == key)
                    return e;
                if (k == null)
                    expungeStaleEntry(i);
                else
                    i = nextIndex(i, len);
                e = tab[i];
            }
            return null;
        }
```

getEntryAfterMiss的逻辑是，先判断Entry中的对象是否要获取的对象，如果是则直接返回。

如果Entry中的对象为空，则触发清除过期Entry的方法。否则的话计算出下一个要判断的地址，再次进行判断，直到最终找到要找到的对象为止。

可以看到，如果第一次没有找到要找到的对象的话，后面则可能会遍历多次，从而造成执行效率变低。

那么有没有可以提升这个寻找速度的方法呢？答案是肯定的。

# FastThreadLocal

之前我们提到了，Netty中的本地对象池技术，netty为其创建了一个专门的类叫做Recycler。虽然Recycler中也使用到了ThreadLocal，但是Recycler使用的threadLocal并不是JDK自带的ThreadLocal，而是FastThreadLocal。和它关联的ThreadLocalMap叫做InternalThreadLocalMap,和它关联的Thread叫做FastThreadLocalThread。netty中的类和JDK中的类的对应关系如下：

netty中的对象 | JDK中的对象 
---------|----------
 FastThreadLocalThread | Thread
 InternalThreadLocalMap | ThreadLocal.ThreadLocalMap
 FastThreadLocal | ThreadLocal 

我们先来看FastThreadLocalThread。不管它到底快不快，既然是Thread，那么自然就要继承自JDK的Thread：

```
public class FastThreadLocalThread extends Thread
```

和Thread一样，FastThreadLocalThread中也有一个ThreadLocalMap，叫做InternalThreadLocalMap，它是FastThreadLocalThread的private属性：

```
private InternalThreadLocalMap threadLocalMap;
```

InternalThreadLocalMap中也有一个ThreadLocal对象，叫做slowThreadLocalMap,是在fastThreadLocalMap不生效的时候使用的。

接下来我们来看下这个ThreadLocalMap为什么快：

```
    public static InternalThreadLocalMap get() {
        Thread thread = Thread.currentThread();
        if (thread instanceof FastThreadLocalThread) {
            return fastGet((FastThreadLocalThread) thread);
        } else {
            return slowGet();
        }
    }
```

从get方法可以看到，如果当前thread是FastThreadLocalThread的话，则会去调用fastGet方法，否则调用slowGet方法。

slowGet方法就是使用传统的ThreadLocal来get：

```
    private static InternalThreadLocalMap slowGet() {
        InternalThreadLocalMap ret = slowThreadLocalMap.get();
        if (ret == null) {
            ret = new InternalThreadLocalMap();
            slowThreadLocalMap.set(ret);
        }
        return ret;
    }
```

我们重点关注下fastGet方法：

```
    private static InternalThreadLocalMap fastGet(FastThreadLocalThread thread) {
        InternalThreadLocalMap threadLocalMap = thread.threadLocalMap();
        if (threadLocalMap == null) {
            thread.setThreadLocalMap(threadLocalMap = new InternalThreadLocalMap());
        }
        return threadLocalMap;
    }
```

这里fast的效果就出现了，fastGet直接返回了thread中的InternalThreadLocalMap对象，不需要进行任何查找的过程。

再看下FastThreadLocal如何使用get方法来获取具体的值：

```
    public final V get() {
        InternalThreadLocalMap threadLocalMap = InternalThreadLocalMap.get();
        Object v = threadLocalMap.indexedVariable(index);
        if (v != InternalThreadLocalMap.UNSET) {
            return (V) v;
        }

        return initialize(threadLocalMap);
    }
```

可以看到FastThreadLocal中的get首先调用了InternalThreadLocalMap的get方法，直接返回了FastThreadLocalThread中的InternalThreadLocalMap对象，这个速度是非常快的。

然后直接使用FastThreadLocal中的index，来获取threadLocalMap中具体存储数据的数组中的元素：

```
    public Object indexedVariable(int index) {
        Object[] lookup = indexedVariables;
        return index < lookup.length? lookup[index] : UNSET;
    }
```

因为是直接index访问的，所以也非常快。这就是fast的由来。

那么有同学会问题了，FastThreadLocal中的index是怎么来的呢？

```
    private final int index;

    public FastThreadLocal() {
        index = InternalThreadLocalMap.nextVariableIndex();
    }
```

而InternalThreadLocalMap中的nextVariableIndex方法是一个静态方法：

```
    public static int nextVariableIndex() {
        int index = nextIndex.getAndIncrement();
        if (index < 0) {
            nextIndex.decrementAndGet();
            throw new IllegalStateException("too many thread-local indexed variables");
        }
        return index;
    }
```

也就是说，只要new一个FastThreadLocal，该对象中，就会生成一个唯一的index。然后FastThreadLocal使用该index去InternalThreadLocalMap中存取对象。这样就不存在ThreadLocal那种需要多次遍历查找的情况。

# 总结

FastThreadLocal是和FastThreadLocalThread配套使用才会真正的fast，否则的话就会fallback到ThreadLocal去执行，大家一定要注意这一点。
