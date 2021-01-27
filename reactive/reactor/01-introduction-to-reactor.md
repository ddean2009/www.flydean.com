响应式编程简介之:Reactor

# 简介

Reactor是reactivex家族的一个非常重要的成员，Reactor是第四代的reactive library，它是基于Reactive Streams标准基础上开发的，主要用来构建JVM环境下的非阻塞应用程序。

今天给大家介绍一下Reactor。

# Reactor简介

Reactor是基于JVM的非阻塞API，他直接跟JDK8中的API相结合，比如：CompletableFuture，Stream和Duration等。

它提供了两个非常有用的异步序列API：Flux和Mono，并且实现了Reactive Streams的标准。

并且还可以和reactor-netty相结合，作为一些异步框架的底层服务，比如我们非常熟悉的Spring MVC 5中引入的WebFlux。

我们知道WebFlux的底层使用的是reactor-netty，而reactor-netty又引用了Reactor。所以，如果你在POM中引入了webFlux依赖：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
~~~

那么项目将会自动引入Reactor。

如果你用的不是Spring webflux，没关系，你可以直接添加下面的依赖来使用Reactor：

~~~xml
<dependency>
    <groupId>io.projectreactor</groupId>
    <artifactId>reactor-core</artifactId>
</dependency>
~~~

# reactive programming的发展史

最最开始的时候微软为.NET平台创建了Reactive Extensions (Rx) library。接着RxJava实现了JVM平台的Reactive。

然后Reactive Streams标准出现了，它定义了Java平台必须满足的的一些规范。并且已经集成到JDK9中的java.util.concurrent类中。

在Flow中定义了实现Reactive Streams的四个非常重要的组件，分别是Publisher，Subscriber，Subscription和Processor。

# Iterable-Iterator 和Publisher-Subscriber的区别

一般来说reactive在面向对象的编程语言中是以观察者模式的扩展来使用的。

我们来具体看一下这个观察者模式的实现，以Publisher和Subscriber为例：

~~~java
   public static interface Publisher<T> {
        public void subscribe(Subscriber<? super T> subscriber);
    }
~~~

~~~java
    public static interface Subscriber<T> {

        public void onSubscribe(Subscription subscription);

        public void onNext(T item);

        public void onError(Throwable throwable);

        public void onComplete();
    }
~~~

上面定义了两个接口，Publisher和Subscriber，Publisher的作用就是subscribe到subscriber。

而subscriber定义了4个on方法，用来触发特定的事件。

那么Publisher中的subscribe是怎么触发Subscriber的onSubscribe事件呢？

很简单，我们看一个具体的实现：

~~~java
    public void subscribe(Flow.Subscriber<? super T> subscriber) {
        Subscription sub;
        if (throwable != null) {
            assert iterable == null : "non-null iterable: " + iterable;
            sub = new Subscription(subscriber, null, throwable);
        } else {
            assert throwable == null : "non-null exception: " + throwable;
            sub = new Subscription(subscriber, iterable.iterator(), null);
        }
        subscriber.onSubscribe(sub);

        if (throwable != null) {
            sub.pullScheduler.runOrSchedule();
        }
    }
~~~

上面的例子是PullPublisher的subscribe实现。我们可以看到，在这个subscribe中触发了subscriber.onSubscribe方法。而这就是观察者模式的秘密。

或者说，当Publisher调用subscribe的时候，是主动push subscriber的onSubscribe方法。

熟悉Iterable-Iterator模式的朋友应该都知道，Iterator模式，其实是一个主动的pull模式，因为需要不断的去调用next()方法。所以它的控制权是在调用方。

# 为什么要使用异步reactive

在现代应用程序中，随着用户量的增多，程序员需要考虑怎么才能提升系统的处理能力。

传统的block IO的方式，因为需要占用大量的资源，所以是不适合这样的场景的。我们需要的是NO-block IO。

JDK中提供了两种异步编程的模型：

第一种是Callbacks，异步方法可以通过传入一个Callback参数的形式来在Callback中执行异步任务。比较典型的像是java Swing中的EventListener。

第二中就是使用Future了。我们使用Callable来提交一个任务，然后通过Future来拿到它的运行结果。

这两种异步编程会有什么问题呢？

callback的问题就在于回调地狱。熟悉JS的朋友应该很理解这个回调地狱的概念。

简单点讲，回调地狱就是在callback中又使用了callback，从而造成了这种callback的层级调用关系。

而Future主要是对一个异步执行的结果进行获取，它的 get()实际上是一个block操作。并且不支持异常处理，也不支持延迟计算。

当有多个Future的组合应该怎么处理呢？JDK8 实际上引入了一个CompletableFuture类，这个类是Future也是一个CompletionStage，CompletableFuture支持then的级联操作。不过CompletableFuture提供的方法不是那么的丰富，可能满足不了我的需求。

于是我们的Reactor来了。

# Flux

Reactor提供了两个非常有用的操作，他们是 Flux 和 Mono。 其中Flux 代表的是 0 to N 个响应式序列，而Mono代表的是0或者1个响应式序列。

我们看一个Flux是怎么transfer items的：

![](https://img-blog.csdnimg.cn/20200902222919571.png)

先看下Flux的定义：

~~~java
public abstract class Flux<T> implements Publisher<T> 
~~~

可以看到Flux其实就是一个Publisher，用来产生异步序列。

Flux提供了非常多的有用的方法，来处理这些序列，并且提供了completion和error的信号通知。

相应的会去调用Subscriber的onNext, onComplete, 和 onError 方法。

# Mono

我们看下Mono是怎么transfer items的：

![](https://img-blog.csdnimg.cn/20200903102242943.png)

看下Mono的定义：

~~~java
public abstract class Mono<T> implements Publisher<T> 
~~~

Mono和Flux一样，也是一个Publisher，用来产生异步序列。

Mono因为只有0或者1个序列，所以只会触发Subscriber的onComplete和onError方法，没有onNext。

另一方面，Mono其实可以看做Flux的子集，只包含Flux的部分功能。

Mono和Flux是可以互相转换的，比如Mono#concatWith(Publisher)返回一个Flux，而 Mono#then(Mono)返回一个Mono.

# Flux和Mono的基本操作

我们看下Flux创建的例子：

~~~java
Flux<String> seq1 = Flux.just("foo", "bar", "foobar");
List<String> iterable = Arrays.asList("foo", "bar", "foobar");
Flux<String> seq2 = Flux.fromIterable(iterable);
Flux<Integer> numbersFromFiveToSeven = Flux.range(5, 3);
~~~

可以看到Flux提供了很多种创建的方式，我们可以自由选择。

再看看Flux的subscribe方法：

~~~java
Disposable subscribe(); 

Disposable subscribe(Consumer<? super T> consumer); 

Disposable subscribe(Consumer<? super T> consumer,
          Consumer<? super Throwable> errorConsumer); 

Disposable subscribe(Consumer<? super T> consumer,
          Consumer<? super Throwable> errorConsumer,
          Runnable completeConsumer); 

Disposable subscribe(Consumer<? super T> consumer,
          Consumer<? super Throwable> errorConsumer,
          Runnable completeConsumer,
          Consumer<? super Subscription> subscriptionConsumer);
~~~

subscribe可以一个参数都没有，也可以多达4个参数。

看下没有参数的情况:

~~~java
Flux<Integer> numbersFromFiveToSeven = Flux.range(5, 3);

numbersFromFiveToSeven.subscribe();
~~~

> 注意，没有参数并不表示Flux的对象不被消费，只是不可见而已。

看下带参数的情况：consumer用来处理on each事件，errorConsumer用来处理on error事件，completeConsumer用来处理on complete事件，subscriptionConsumer用来处理on subscribe事件。

前面的3个参数很好理解，我们来举个例子：

~~~java
Flux<Integer> ints3 = Flux.range(1, 4);
        ints3.subscribe(System.out::println,
                error -> System.err.println("Error " + error),
                () -> System.out.println("Done"),
                sub -> sub.request(2));
~~~

我们构建了从1到4的四个整数的Flux，on each就是打印出来，如果中间有错误的话，就输出Error，全部完成就输出Done。

那么最后一个subscriptionConsumer是做什么用的呢？

subscriptionConsumer accept的是一个Subscription对象，我们看下Subscription的定义：

~~~java
public interface Subscription {

    public void request(long n);
    public void cancel();
}
~~~

Subscription 定义了两个方法，用来做初始化用的，我们可以调用request(n)来决定这次subscribe获取元素的最大数目。

比如上面我们的例子中，虽然构建了4个整数，但是最终输出的只有2个。

上面所有的subscribe方法，都会返回一个Disposable对象，我们可以通过Disposable对象的dispose()方法，来取消这个subscribe。

Disposable只定义了两个方法：

~~~java
public interface Disposable {

	void dispose();

	default boolean isDisposed() {
		return false;
	}
~~~

dispose的原理是向Flux 或者 Mono发出一个停止产生新对象的信号，但是并不能保证对象产生马上停止。

有了Disposable，当然要介绍它的工具类Disposables。

Disposables.swap() 可以创建一个Disposable，用来替换或者取消一个现有的Disposable。

Disposables.composite(…​)可以将多个Disposable合并起来，在后面统一做处理。

# 总结

本文介绍了Reactor的基本原理和两非常重要的组件Flux和Mono，下一篇文章我们会继续介绍Reactor core的一些更加高级的用法。敬请期待。

本文的例子[learn-reactive](https://github.com/ddean2009/learn-reactive/tree/master/reactorIntroduction)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！

































