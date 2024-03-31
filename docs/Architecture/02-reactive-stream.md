架构之:reactive stream协议详解

# 背景

Stream大家应该都很熟悉了，java8中为所有的集合类都引入了Stream的概念。优雅的链式操作，流式处理逻辑，相信用过的人都会爱不释手。

每个数据流都有一个生产者一个消费者。生产者负责产生数据，而消费者负责消费数据。如果是同步系统，生产一个消费一个没什么问题。但是如果在异步系统中，就会产生问题。

因为生产者无法感知消费者的状态，不知道消费者到底是繁忙状态还是空闲状态，是否有能力去消费更多的数据。

一般来说数据队列的长度都是有限的，即使没有做限制，但是系统的内存也是有限的。当太多的数据没有被消费的话，会导致内存溢出或者数据得不到即使处理的问题。

这时候就需要back-pressure了。

如果消息接收方消息处理不过来，则可以通知消息发送方，告知其正在承受压力，需要降低负载。back-pressure是一种消息反馈机制，从而使系统得以优雅地响应负载， 而不是在负载下崩溃。

而reactive stream的目的就是用来管理异步服务的流数据交换，并能够让接收方自主决定接受数据的频率。back-pressure就是reactive stream中不可或缺的一部分。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# 什么是reactive stream

上面我们讲到了reactive stream的作用，大家应该对reactive stream有了一个基本的了解。这里我们再给reactive stream做一个定义：

reactive stream就是一个异步stream处理的标准，它的特点就是非阻塞的back pressure。

reactive stream只是一个标准，它定义了实现非阻塞的back pressure的最小区间的接口，方法和协议。

所以reactive stream其实有很多种实现的，不仅仅是java可以使用reactive stream，其他的编程语言也可以。

reactive stream只是定义了最基本的功能，各大实现在实现了基本功能的同时可以自由扩展。

目前reactive stream最新的java版本是1.0.3，是在2019年8月23发布的。它包含了java API，协议定义文件，测试工具集合和具体的实现例子。

# 深入了解java版本的reactive stream

在介绍java版本的reactive stream之前，我们先回顾一下reactive stream需要做哪些事情：

1. 能够处理无效数量的消息
2. 消息处理是有顺序的
3. 可以异步的在组件之间传递消息
4. 一定是非阻塞和backpressure的

为了实现这4个功能，reactive stream定义了4个接口，Publisher，Subscriber，Subscription，Processor。这四个接口实际上是一个观察者模式的实现。接下来我们详细来分析一下各个接口的作用和约定。

## Publisher

先看下Publisher的定义：

~~~java
public interface Publisher<T> {
    public void subscribe(Subscriber<? super T> s);
}
~~~

Publisher就是用来生成消息的。它定义了一个subscribe方法，传入一个Subscriber。这个方法用来将Publisher和Subscriber进行连接。

一个Publisher可以连接多个Subscriber。

每次调用subscribe建立连接，都会创建一个新的Subscription，Subscription和subscriber是一一对应的。

一个Subscriber只能够subscribe一次Publisher。

如果subscribe失败或者被拒绝，则会出发Subscriber.onError(Throwable)方法。

## Subscriber

先看下Subscriber的定义：

~~~java
public interface Subscriber<T> {
    public void onSubscribe(Subscription s);
    public void onNext(T t);
    public void onError(Throwable t);
    public void onComplete();
}
~~~

Subscriber就是消息的接收者。

在Publisher和Subscriber建立连接的时候会触发onSubscribe(Subscription s)方法。

当调用Subscription.request(long)方法时，onNext(T t)会被触发，根据request请求参数的大小，onNext会被触发一次或者多次。

在发生异常或者结束时会触发onError(Throwable t)或者onComplete()方法。

## Subscription

先看下Subscription的定义：

~~~java
public interface Subscription {
    public void request(long n);
    public void cancel();
}
~~~

Subscription代表着一对一的Subscriber和Publisher之间的Subscribe关系。

request(long n)意思是向publisher请求多少个events，这会触发Subscriber.onNext方法。

cancel()则是请求Publisher停止发送信息，并清除资源。

## Processor

先看下Processor的定义：

~~~java
public interface Processor<T, R> extends Subscriber<T>, Publisher<R> {
}
~~~

Processor即是Subscriber又是Publisher，它代表着一种处理状态。


# JDK中reactive stream的实现

在JDK中java.util.concurrent.Flow就是reactive stream语义的一种实现。

Flow从JDK9就开始有了。我们看下它的结构：

![](https://img-blog.csdnimg.cn/202005031457406.png)

从上图我们可以看到在JDK中Flow是一个final class,而Subscriber,Publisher,Subscription,Processor都是它的内部类。

我们会在后面的文章中继续讲解JDK中Flow的使用。敬请期待。

# 总结

reactive stream的出现有效的解决了异步系统中的背压问题。只不过reactive stream只是一个接口标准或者说是一种协议，具体的实现还需要自己去实现。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)



