Reactor详解之:异常处理

# 简介

不管是在响应式编程还是普通的程序设计中，异常处理都是一个非常重要的方面。今天将会给大家介绍Reactor中异常的处理流程。

# Reactor的异常一般处理方法

先举一个例子，我们创建一个Flux，在这个Flux中，我们产生一个异常，看看是什么情况：

~~~java
Flux flux2= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i));
        flux2.subscribe(System.out::println);
~~~

我们会得到一个异常ErrorCallbackNotImplemented：

~~~java
100 / 1 = 100
100 / 2 = 50

reactor.core.Exceptions$ErrorCallbackNotImplemented: java.lang.ArithmeticException: / by zero
~~~

那怎么处理这个异常呢？

有两种方式，第一种方式就是我们之前文章讲过的，在subscribe的时候指定onError方法：

~~~java
Flux flux2= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i));

        flux2.subscribe(System.out::println,
                error -> System.err.println("Error: " + error));
~~~

还是刚才的代码，但是这次我们在subscribe的时候，添加了onError处理器，看下运行结果：

~~~java
Divided by zero :(
100 / 1 = 100
100 / 2 = 50
Error: java.lang.ArithmeticException: / by zero
~~~

可以看到异常已经被我们捕获了，并且进行了合适的处理。

除了在subscribe中进行处理，我们还可以在publish的时候，就指定异常的处理模式，这就是我们要介绍的第二种方法：

~~~java
        Flux flux= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i))
                .onErrorReturn("Divided by zero :(");
        flux.subscribe(System.out::println);
~~~

上面的例子中，在创建Flux的时候，手动指定了其onErrorReturn方法，我们看下输出结果：

~~~java
100 / 1 = 100
100 / 2 = 50
Divided by zero :(
~~~

> 注意，对于Flux或者Mono来说，所有的异常都是一个终止的操作，即使你使用了异常处理，原生成序列也不会继续。
> 
> 但是如果你对异常进行了处理，那么它会将oneError信号转换成为新的序列的开始，并将替换掉之前上游产生的序列。


# 各种异常处理方式详解

在一般的程序中，我们的异常应该怎么处理呢？大家很容易想到的是try catch。而Reactor中subscribe的onError方法，就是try catch的一个具体应用：

~~~java
Flux flux2= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i));

        flux2.subscribe(System.out::println,
                error -> System.err.println("Error: " + error));
~~~

还是上的例子，我们在onError方法中，对异常进行了处理。

如果转换成为常规代码，应该是下面的样子：

~~~java
    public void normalErrorHandle(){
        try{
            Arrays.asList(1,2,0).stream().map(i -> "100 / " + i + " = " + (100 / i)).forEach(System.out::println);
        }catch (Exception e){
            System.err.println("Error: " + e);
        }
    }
~~~

除了这种最基本的异常处理方法之外，Reactor还提供了很多种不同的异常处理方法，下面我们来一一介绍一下。

## Static Fallback Value

Static Fallback Value的意思是，在遇到异常的时候会fallback到一个静态的默认值。比如我们之前讲到的onErrorReturn。

~~~java
Flux flux= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i))
                .onErrorReturn("Divided by zero :(");
~~~

当然onErrorReturn还支持一个Predicate参数，用来判断要falback的异常是否满足条件。

~~~java
public final Flux<T> onErrorReturn(Predicate<? super Throwable> predicate, T fallbackValue) 
~~~


## Fallback Method

除了fallback Value之外，还支持Fallback Method。也就是说如果你想在捕获异常之后调用其他的方法，就可以使用Fallback Method。

这里Fallback Method是用onErrorResume来表示的。

~~~java
    public void useFallbackMethod(){
        Flux flux= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i))
                .onErrorResume(e -> System.out::println);
        flux.subscribe(System.out::println);
    }
~~~

## Dynamic Fallback Value

所谓的动态Fallback Value就是根据你抛出的异常进行判断，通过定位不同的Error从而fallback到不同的值：

~~~java
    public void useDynamicFallback(){
        Flux flux= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i))
                .onErrorResume(error -> Mono.just(
                        MyWrapper.fromError(error)));
    }

    public static class MyWrapper{
        public static String fromError(Throwable error){
            return "That is a new Error";
        }
    }
~~~

## Catch and Rethrow

同样的，我们可以在捕获异常之后进行rethrow:

~~~java
Flux flux= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i))
                .onErrorResume(error -> Flux.error(
                        new RuntimeException("oops, ArithmeticException!", error)));

        Flux flux2= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i))
                .onErrorMap(error -> new RuntimeException("oops, ArithmeticException!", error));
~~~

有两种方式，第一种就是在onErrorResume中使用Flux.error构建一个新的Flux，另外一种就是直接在onErrorMap中进行处理。

## Log or React on the Side

有时候你只是想记录一下异常信息，并不想破坏原来的React结构，那么可以试着使用doOnError。 

~~~java
    public void useDoOnError(){
        Flux flux= Flux.just(1, 2, 0)
                .map(i -> "100 / " + i + " = " + (100 / i))
                .doOnError(error -> System.out.println("we got the error: "+ error));
    }
~~~

## Finally Block

如果我们在代码中使用了某些资源，一般情况下我们需要在finally中对其进行关闭，或者使用JDK7中引入的 try-with-resource 。 

举个例子，下面的是使用finally的方式：

~~~java
Stats stats = new Stats();
stats.startTimer();
try {
  doSomethingDangerous();
}
finally {
  stats.stopTimerAndRecordTiming();
}
~~~

下面是使用try-with-resource的方式：

~~~java
try (SomeAutoCloseable disposableInstance = new SomeAutoCloseable()) {
  return disposableInstance.toString();
}
~~~

那么在Reactor中，我们也有两种方式和其对应。

第一种就是doFinally方法：

~~~java
Stats stats = new Stats();
LongAdder statsCancel = new LongAdder();

Flux<String> flux =
Flux.just("foo", "bar")
    .doOnSubscribe(s -> stats.startTimer())
    .doFinally(type -> { 
        stats.stopTimerAndRecordTiming();
        if (type == SignalType.CANCEL) 
          statsCancel.increment();
    })
    .take(1); 
~~~

上面的例子中，doFinally实际上做的就是finally block做的事情。

第二种是使用using，我们先看一个using的定义：

~~~java

	public static <T, D> Flux<T> using(Callable<? extends D> resourceSupplier, Function<? super D, ? extends
			Publisher<? extends T>> sourceSupplier, Consumer<? super D> resourceCleanup)
~~~

可以看到using支持三个参数，resourceSupplier是一个生成器，用来在subscribe的时候生成要发送的resource对象。

sourceSupplier是一个生成Publisher的工厂，接收resourceSupplier传过来的resource，然后生成Publisher对象。

resourceCleanup用来对resource进行收尾操作。

那么我们怎么用呢？

举个例子：

~~~java
    public void useUsing(){
        AtomicBoolean isDisposed = new AtomicBoolean();
        Disposable disposableInstance = new Disposable() {
            @Override
            public void dispose() {
                isDisposed.set(true);
            }

            @Override
            public String toString() {
                return "DISPOSABLE";
            }
        };

        Flux<String> flux =
                Flux.using(
                        () -> disposableInstance,
                        disposable -> Flux.just(disposable.toString()),
                        Disposable::dispose);
    }
~~~

上面的例子中，我们创建了一个Disposable对象，作为resource，然后对这个resource进行加工，返回一个Flux<String>对象，最后通过调用Disposable::dispose方法，对resource进行销毁。

## Retrying

有时候我们遇到了异常，可能需要重试几次，Reactor为我们提供了retry方法，先看一个例子：

~~~java
    public void testRetry(){
        Flux.interval(Duration.ofMillis(250))
                .map(input -> {
                    if (input < 3){
                       return "tick " + input;
                    } 
                    throw new RuntimeException("boom");
                })
                .retry(1)
                .elapsed()
                .subscribe(System.out::println, System.err::println);

        try {
            Thread.sleep(2100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
~~~

看下输出结果：

~~~java
[264,tick 0]
[255,tick 1]
[241,tick 2]
[506,tick 0]
[252,tick 1]
[253,tick 2]
java.lang.RuntimeException: boom
~~~

retry的作用就是当遇到异常的时候，重启一个新的序列。 

elapsed是用来展示产生的value时间之间的duration。

从结果我们可以看到，retry之前是不会产生异常信息的。


本文的例子[learn-reactive](https://github.com/ddean2009/learn-reactive/tree/master/reactorIntroduction)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！




















