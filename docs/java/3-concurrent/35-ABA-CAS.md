---
slug: /ABA-CAS
---

# 35. ABA问题的本质及其解决办法

## 简介

CAS的全称是compare and swap，它是java同步类的基础，java.util.concurrent中的同步类基本上都是使用CAS来实现其原子性的。

CAS的原理其实很简单，为了保证在多线程环境下我们的更新是符合预期的，或者说一个线程在更新某个对象的时候，没有其他的线程对该对象进行修改。在线程更新某个对象（或值）之前，先保存更新前的值，然后在实际更新的时候传入之前保存的值，进行比较，如果一致的话就进行更新，否则失败。

注意，CAS在java中是用native方法来实现的，利用了系统本身提供的原子性操作。

那么CAS在使用中会有什么问题呢？一般来说CAS如果设计的不够完美的话，可能会产生ABA问题，而ABA问题又可以分为两类，我们先看来看一类问题。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

### 第一类问题

我们考虑下面一种ABA的情况：

1. 在多线程的环境中，线程a从共享的地址X中读取到了对象A。
2. 在线程a准备对地址X进行更新之前，线程b将地址X中的值修改为了B。
3. 接着线程b将地址X中的值又修改回了A。
4. 最新线程a对地址X执行CAS，发现X中存储的还是对象A，对象匹配，CAS成功。

上面的例子中CAS成功了，但是实际上这个CAS并不是原子操作，如果我们想要依赖CAS来实现原子操作的话可能就会出现隐藏的bug。

第一类问题的关键就在2和3两步。这两步我们可以看到线程b直接替换了内存地址X中的内容。

在拥有自动GC环境的编程语言，比如说java中，2，3的情况是不可能出现的，因为在java中，只要两个对象的地址一致，就表示这两个对象是相等的。

2，3两步可能出现的情况就在像C++这种，不存在自动GC环境的编程语言中。因为可以自己控制对象的生命周期，如果我们从一个list中删除掉了一个对象，然后又重新分配了一个对象，并将其add back到list中去，那么根据 MRU memory allocation算法，这个新的对象很有可能和之前删除对象的内存地址是一样的。这样就会导致ABA的问题。

### 第二类问题

如果我们在拥有自动GC的编程语言中，那么是否仍然存在CAS问题呢？

考虑下面的情况，有一个链表里面的数据是A->B->C,我们希望执行一个CAS操作，将A替换成D，生成链表D->B->C。考虑下面的步骤：

1. 线程a读取链表头部节点A。
2. 线程b将链表中的B节点删掉，链表变成了A->C
3. 线程a执行CAS操作，将A替换成D。

最后我们的到的链表是D->C，而不是D->B->C。

问题出在哪呢？CAS比较的节点A和最新的头部节点是不是同一个节点，它并没有关心节点A在步骤1和3之间是否内容发生变化。

我们举个例子：

~~~java
public void useABAReference(){
        CustUser a= new CustUser();
        CustUser b= new CustUser();
        CustUser c= new CustUser();
        AtomicReference<CustUser> atomicReference= new AtomicReference<>(a);
        log.info("{}",atomicReference.compareAndSet(a,b));
        log.info("{}",atomicReference.compareAndSet(b,a));
        a.setName("change for new name");
        log.info("{}",atomicReference.compareAndSet(a,c));
    }
~~~

上面的例子中，我们使用了AtomicReference的CAS方法来判断对象是否发生变化。在CAS b和a之后，我们将a的name进行了修改，我们看下最后的输出结果：

~~~java
[main] INFO com.flydean.aba.ABAUsage - true
[main] INFO com.flydean.aba.ABAUsage - true
[main] INFO com.flydean.aba.ABAUsage - true
~~~

三个CAS的结果都是true。说明CAS确实比较的两者是否为统一对象，对其中内容的变化并不关心。

第二类问题可能会导致某些集合类的操作并不是原子性的，因为你并不能保证在CAS的过程中，有没有其他的节点发送变化。

## 第一类问题的解决

第一类问题在存在自动GC的编程语言中是不存在的，我们主要看下怎么在C++之类的语言中解决这个问题。

根据官方的说法，第一类问题大概有四种解法：

1. 使用中间节点 - 使用一些不代表任何数据的中间节点来表示某些节点是标记被删除的。
2. 使用自动GC。
3. 使用hazard pointers - hazard pointers 保存了当前线程正在访问的节点的地址，在这些hazard pointers中的节点不能够被修改和删除。
4. 使用read-copy update (RCU) - 在每次更新的之前，都做一份拷贝，每次更新的是拷贝出来的新结构。

## 第二类问题的解决

第二类问题其实算是整体集合对象的CAS问题了。一个简单的解决办法就是每次做CAS更新的时候再添加一个版本号。如果版本号不是预期的版本，就说明有其他的线程更新了集合中的某些节点，这次CAS是失败的。

我们举个AtomicStampedReference的例子：

~~~java
public void useABAStampReference(){
        Object a= new Object();
        Object b= new Object();
        Object c= new Object();
        AtomicStampedReference<Object> atomicStampedReference= new AtomicStampedReference(a,0);
        log.info("{}",atomicStampedReference.compareAndSet(a,b,0,1));
        log.info("{}",atomicStampedReference.compareAndSet(b,a,1,2));
        log.info("{}",atomicStampedReference.compareAndSet(a,c,0,1));
    }
~~~

AtomicStampedReference的compareAndSet方法，多出了两个参数，分别是expectedStamp和newStamp，两个参数都是int型的，需要我们手动传入。

## 总结

ABA问题其实是由两类问题组成的，需要我们分开来对待和解决。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！





