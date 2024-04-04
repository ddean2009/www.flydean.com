---
slug: /02-reactor-core-in-depth
---

# 2. Reactor:深入理解reactor core

# 简介

上篇文章我们简单的介绍了Reactor的发展史和基本的Flux和Mono的使用，本文将会进一步挖掘Reactor的高级用法，一起来看看吧。

# 自定义Subscriber

之前的文章我们提到了4个Flux的subscribe的方法：

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

这四个方法，需要我们使用lambda表达式来自定义consumer，errorConsumer,completeSonsumer和subscriptionConsumer这四个Consumer。

写起来比较复杂，看起来也不太方便，我们考虑一下，这四个Consumer是不是和Subscriber接口中定义的4个方法是一一对应的呢？

~~~java
    public static interface Subscriber<T> {

        public void onSubscribe(Subscription subscription);

        public void onNext(T item);

        public void onError(Throwable throwable);

        public void onComplete();
    }
~~~

对的，所以我们有一个更加简单点的subscribe方法：

~~~java
public final void subscribe(Subscriber<? super T> actual) 
~~~

这个subscribe方法直接接收一个Subscriber类。从而实现了所有的功能。

自己写Subscriber太麻烦了，Reactor为我们提供了一个BaseSubscriber的类，它实现了Subscriber中的所有功能，还附带了一些其他的方法。 

我们看下BaseSubscriber的定义：

~~~java
public abstract class BaseSubscriber<T> implements CoreSubscriber<T>, Subscription,
                                                   Disposable
~~~

> 注意，BaseSubscriber是单次使用的，这就意味着，如果它首先subscription到Publisher1，然后subscription到Publisher2，那么将会取消对第一个Publisher的订阅。

因为BaseSubscriber是一个抽象类，所以我们需要继承它，并且重写我们需要自己实现的方法。

下面看一个自定义的Subscriber：

~~~java
public class CustSubscriber<T> extends BaseSubscriber<T> {

    public void hookOnSubscribe(Subscription subscription) {
        System.out.println("Subscribed");
        request(1);
    }

    public void hookOnNext(T value) {
        System.out.println(value);
        request(1);
    }
}
~~~

BaseSubscriber中有很多以hook开头的方法，这些方法都是我们可以重写的，而Subscriber原生定义的on开头的方法，在BaseSubscriber中都是final的，都是不能重写的。

我们看一个定义：

~~~java
	@Override
	public final void onSubscribe(Subscription s) {
		if (Operators.setOnce(S, this, s)) {
			try {
				hookOnSubscribe(s);
			}
			catch (Throwable throwable) {
				onError(Operators.onOperatorError(s, throwable, currentContext()));
			}
		}
	}
~~~

可以看到，它内部实际上调用了hook的方法。

上面的CustSubscriber中，我们重写了两个方法，一个是hookOnSubscribe，在建立订阅的时候调用，一个是hookOnNext，在收到onNext信号的时候调用。

在这些方法中，给了我们足够的自定义空间，上面的例子中我们调用了request(1)，表示再请求一个元素。

其他的hook方法还有： hookOnComplete, hookOnError, hookOnCancel 和 hookFinally。

# Backpressure处理

我们之前讲过了，reactive stream的最大特征就是可以处理Backpressure。

什么是Backpressure呢？就是当consumer处理过不来的时候，可以通知producer来减少生产速度。

我们看下BaseSubscriber中默认的hookOnSubscribe实现：

~~~java
	protected void hookOnSubscribe(Subscription subscription){
		subscription.request(Long.MAX_VALUE);
	}
~~~

可以看到默认是request无限数目的值。 也就是说默认情况下没有Backpressure。

通过重写hookOnSubscribe方法，我们可以自定义处理速度。

除了request之外，我们还可以在publisher中限制subscriber的速度。

~~~java
	public final Flux<T> limitRate(int prefetchRate) {
		return onAssembly(this.publishOn(Schedulers.immediate(), prefetchRate));
	}
~~~

在Flux中，我们有一个limitRate方法，可以设定publisher的速度。

比如subscriber request(100),然后我们设置limitRate(10),那么最多producer一次只会产生10个元素。

# 创建Flux

接下来，我们要讲解一下怎么创建Flux，通常来讲有4种方法来创建Flux。

## 使用generate

第一种方法就是最简单的同步创建的generate.

先看一个例子：

~~~java
    public void useGenerate(){
        Flux<String> flux = Flux.generate(
                () -> 0,
                (state, sink) -> {
                    sink.next("3 x " + state + " = " + 3*state);
                    if (state == 10) sink.complete();
                    return state + 1;
                });

        flux.subscribe(System.out::println);
    }
~~~

输出结果：

~~~java
3 x 0 = 0
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
3 x 4 = 12
3 x 5 = 15
3 x 6 = 18
3 x 7 = 21
3 x 8 = 24
3 x 9 = 27
3 x 10 = 30
~~~

上面的例子中，我们使用generate方法来同步的生成元素。

generate接收两个参数：

~~~java
	public static <T, S> Flux<T> generate(Callable<S> stateSupplier, BiFunction<S, SynchronousSink<T>, S> generator) 
~~~

第一个参数是stateSupplier，用来指定初始化的状态。

第二个参数是一个generator，用来消费SynchronousSink，并生成新的状态。

上面的例子中，我们每次将state+1，一直加到10。

然后使用subscribe来将所有的生成元素输出。

## 使用create

Flux也提供了一个create方法来创建Flux，create可以是同步也可以是异步的，并且支持多线程操作。

因为create没有初始的state状态，所以可以用在多线程中。

create的一个非常有用的地方就是可以将第三方的异步API和Flux关联起来，举个例子，我们有一个自定义的EventProcessor，当处理相应的事件的时候，会去调用注册到Processor中的listener的一些方法。

~~~java
    interface MyEventListener<T> {
        void onDataChunk(List<T> chunk);
        void processComplete();
    }
~~~

我们怎么把这个Listener的响应行为和Flux关联起来呢？

~~~java
   public void useCreate(){
        EventProcessor myEventProcessor = new EventProcessor();
        Flux<String> bridge = Flux.create(sink -> {
            myEventProcessor.register(
                    new MyEventListener<String>() {
                        public void onDataChunk(List<String> chunk) {
                            for(String s : chunk) {
                                sink.next(s);
                            }
                        }
                        public void processComplete() {
                            sink.complete();
                        }
                    });
        });
    }
~~~

使用create就够了，create接收一个consumer参数：

~~~java
    public static <T> Flux<T> create(Consumer<? super FluxSink<T>> emitter)
~~~

这个consumer的本质是去消费FluxSink对象。

上面的例子在MyEventListener的事件中对FluxSink对象进行消费。

## 使用push

push和create一样，也支持异步操作，但是同时只能有一个线程来调用next, complete 或者 error方法，所以它是单线程的。

## 使用Handle

Handle和上面的三个方法不同，它是一个实例方法。

它和generate很类似，也是消费SynchronousSink对象。

~~~java
Flux<R> handle(BiConsumer<T, SynchronousSink<R>>);
~~~

不同的是它的参数是一个BiConsumer，是没有返回值的。

看一个使用的例子：

~~~java
    public void useHandle(){
        Flux<String> alphabet = Flux.just(-1, 30, 13, 9, 20)
                .handle((i, sink) -> {
                    String letter = alphabet(i);
                    if (letter != null)
                        sink.next(letter);
                });

        alphabet.subscribe(System.out::println);
    }

    public String alphabet(int letterNumber) {
        if (letterNumber < 1 || letterNumber > 26) {
            return null;
        }
        int letterIndexAscii = 'A' + letterNumber - 1;
        return "" + (char) letterIndexAscii;
    }
~~~

本文的例子[learn-reactive](https://github.com/ddean2009/learn-reactive/tree/master/reactorIntroduction)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！




















