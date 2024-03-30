---
slug: /reference-referenceType
---

# 14. 一文读懂java中的Reference和引用类型

# 简介

java中有值类型也有引用类型，引用类型一般是针对于java中对象来说的，今天介绍一下java中的引用类型。java为引用类型专门定义了一个类叫做Reference。Reference是跟java垃圾回收机制息息相关的类，通过探讨Reference的实现可以更加深入的理解java的垃圾回收是怎么工作的。

本文先从java中的四种引用类型开始，一步一步揭开Reference的面纱。

java中的四种引用类型分别是：强引用，软引用，弱引用和虚引用。

# 强引用Strong Reference

java中的引用默认就是强引用，任何一个对象的赋值操作就产生了对这个对象的强引用。

我们看一个例子：

~~~java
public class StrongReferenceUsage {

    @Test
    public void stringReference(){
        Object obj = new Object();
    }
}
~~~

上面我们new了一个Object对象，并将其赋值给obj，这个obj就是new Object()的强引用。

强引用的特性是只要有强引用存在，被引用的对象就不会被垃圾回收。

# 软引用Soft Reference

软引用在java中有个专门的SoftReference类型，软引用的意思是只有在内存不足的情况下，被引用的对象才会被回收。

先看下SoftReference的定义：

~~~java
public class SoftReference<T> extends Reference<T>
~~~

SoftReference继承自Reference。它有两种构造函数：

~~~java
    public SoftReference(T referent) 
~~~

和：

~~~java
    public SoftReference(T referent, ReferenceQueue<? super T> q) 
~~~

第一个参数很好理解，就是软引用的对象，第二个参数叫做ReferenceQueue，是用来存储封装的待回收Reference对象的，ReferenceQueue中的对象是由Reference类中的ReferenceHandler内部类进行处理的。

我们举个SoftReference的例子：

~~~java
    @Test
    public void softReference(){
        Object obj = new Object();
        SoftReference<Object> soft = new SoftReference<>(obj);
        obj = null;
        log.info("{}",soft.get());
        System.gc();
        log.info("{}",soft.get());
    }
~~~

输出结果：

~~~java
22:50:43.733 [main] INFO com.flydean.SoftReferenceUsage - java.lang.Object@71bc1ae4
22:50:43.749 [main] INFO com.flydean.SoftReferenceUsage - java.lang.Object@71bc1ae4
~~~

可以看到在内存充足的情况下，SoftReference引用的对象是不会被回收的。

# 弱引用weak Reference

weakReference和softReference很类似，不同的是weekReference引用的对象只要垃圾回收执行，就会被回收，而不管是否内存不足。

同样的WeakReference也有两个构造函数：

~~~java
public WeakReference(T referent)；

 public WeakReference(T referent, ReferenceQueue<? super T> q)；
~~~

含义和SoftReference一致，这里就不再重复表述了。

我们看下弱引用的例子：

~~~java
    @Test
    public void weakReference() throws InterruptedException {
        Object obj = new Object();
        WeakReference<Object> weak = new WeakReference<>(obj);
        obj = null;
        log.info("{}",weak.get());
        System.gc();
        log.info("{}",weak.get());
    }
~~~

输出结果：

~~~java
22:58:02.019 [main] INFO com.flydean.WeakReferenceUsage - java.lang.Object@71bc1ae4
22:58:02.047 [main] INFO com.flydean.WeakReferenceUsage - null
~~~

我们看到gc过后，弱引用的对象被回收掉了。

# 虚引用PhantomReference

PhantomReference的作用是跟踪垃圾回收器收集对象的活动，在GC的过程中，如果发现有PhantomReference，GC则会将引用放到ReferenceQueue中，由程序员自己处理，当程序员调用ReferenceQueue.pull()方法，将引用出ReferenceQueue移除之后，Reference对象会变成Inactive状态，意味着被引用的对象可以被回收了。

和SoftReference和WeakReference不同的是，PhantomReference只有一个构造函数，必须传入ReferenceQueue：

~~~java
public PhantomReference(T referent, ReferenceQueue<? super T> q)
~~~

看一个PhantomReference的例子：

~~~java
@Slf4j
public class PhantomReferenceUsage {

    @Test
    public void usePhantomReference(){
        ReferenceQueue<Object> rq = new ReferenceQueue<>();
        Object obj = new Object();
        PhantomReference<Object> phantomReference = new PhantomReference<>(obj,rq);
        obj = null;
        log.info("{}",phantomReference.get());
        System.gc();
        Reference<Object> r = (Reference<Object>)rq.poll();
        log.info("{}",r);
    }
}
~~~

运行结果：

~~~java
07:06:46.336 [main] INFO com.flydean.PhantomReferenceUsage - null
07:06:46.353 [main] INFO com.flydean.PhantomReferenceUsage - java.lang.ref.PhantomReference@136432db
~~~

我们看到get的值是null，而GC过后，poll是有值的。

因为PhantomReference引用的是需要被垃圾回收的对象，所以在类的定义中，get一直都是返回null：

~~~java
    public T get() {
        return null;
    }
~~~

# Reference和ReferenceQueue

讲完上面的四种引用,接下来我们谈一下他们的父类Reference和ReferenceQueue的作用。

Reference是一个抽象类，每个Reference都有一个指向的对象，在Reference中有5个非常重要的属性：referent，next，discovered，pending，queue。 

~~~java
private T referent;         /* Treated specially by GC */
volatile ReferenceQueue<? super T> queue;
Reference next;
transient private Reference<T> discovered;  /* used by VM */
private static Reference<Object> pending = null;
~~~

每个Reference都可以看成是一个节点，多个Reference通过next，discovered和pending这三个属性进行关联。

先用一张图来对Reference有个整体的概念：

![](https://img-blog.csdnimg.cn/20200421095511914.png)

referent就是Reference实际引用的对象。

通过next属性，可以构建ReferenceQueue。

通过discovered属性，可以构建Discovered List。

通过pending属性，可以构建Pending List。

## 四大状态

在讲这三个Queue/List之前，我们先讲一下Reference的四个状态：

![](https://img-blog.csdnimg.cn/20200421111551910.png)

从上面的图中，我们可以看到一个Reference可以有四个状态。

因为Reference有两个构造函数，一个带ReferenceQueue,一个不带。

~~~java

    Reference(T referent) {
        this(referent, null);
    }

    Reference(T referent, ReferenceQueue<? super T> queue) {
        this.referent = referent;
        this.queue = (queue == null) ? ReferenceQueue.NULL : queue;
    }
~~~

对于带ReferenceQueue的Reference，GC会把要回收对象的Reference放到ReferenceQueue中，后续该Reference需要程序员自己处理（调用poll方法）。

不带ReferenceQueue的Reference，由GC自己处理，待回收的对象其Reference状态会变成Inactive。

创建好了Reference，就进入active状态。

active状态下，如果引用对象的可到达状态发送变化就会转变成Inactive或Pending状态。

Inactive状态很好理解，到达Inactive状态的Reference状态不能被改变，会等待GC回收。

Pending状态代表等待入Queue，Reference内部有个ReferenceHandler，会调用enqueue方法，将Pending对象入到Queue中。

入Queue的对象，其状态就变成了Enqueued。

Enqueued状态的对象，如果调用poll方法从ReferenceQueue拿出，则该Reference的状态就变成了Inactive，等待GC的回收。

这就是Reference的一个完整的生命周期。


## 三个Queue/List

有了上面四个状态的概念，我们接下来讲三个Queue/List：ReferenceQueue，discovered List和pending List。

ReferenceQueue在讲状态的时候已经讲过了，它本质是由Reference中的next连接而成的。用来存储GC待回收的对象。

pending List就是待入ReferenceQueue的list。

discovered List这个有点特别，在Pending状态时候，discovered List就等于pending List。

在Active状态的时候，discovered List实际上维持的是一个引用链。通过这个引用链，我们可以获得引用的链式结构，当某个Reference状态不再是Active状态时，需要将这个Reference从discovered List中删除。

# WeakHashMap

最后讲一下WeakHashMap，WeakHashMap跟WeakReference有点类似，在WeakHashMap如果key不再被使用，被赋值为null的时候，该key对应的Entry会自动从WeakHashMap中删除。

我们举个例子：

~~~java
    @Test
    public void useWeakHashMap(){
        WeakHashMap<Object, Object> map = new WeakHashMap<>();
        Object key1= new Object();
        Object value1= new Object();
        Object key2= new Object();
        Object value2= new Object();

        map.put(key1, value1);
        map.put(key2, value2);
        log.info("{}",map);

        key1 = null;
        System.gc();
        log.info("{}",map);

    }
~~~

输出结果：

~~~java
[main] INFO com.flydean.WeakHashMapUsage - {java.lang.Object@14899482=java.lang.Object@2437c6dc, java.lang.Object@11028347=java.lang.Object@1f89ab83}
[main] INFO com.flydean.WeakHashMapUsage - {java.lang.Object@14899482=java.lang.Object@2437c6dc}
~~~

可以看到gc过后，WeakHashMap只有一个Entry了。

# 总结

本文讲解了4个java中的引用类型，并深入探讨了Reference的内部机制，感兴趣的小伙伴可以留言一起讨论。

本文的例子[https://github.com/ddean2009/learn-java-collections](https://github.com/ddean2009/learn-java-collections)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)




















