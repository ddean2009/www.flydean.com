---
slug: /concurrent-CompletableFuture
---

# 22. java中CompletableFuture的使用

之前的文章中，我们讲解了Future， 本文我们将会继续讲解java 8中引入的CompletableFuture的用法。

CompletableFuture首先是一个Future，它拥有Future所有的功能，包括获取异步执行结果，取消正在执行的任务等。

除此之外，CompletableFuture还是一个CompletionStage。 

我们看下CompletableFuture的定义：

~~~java
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> 
~~~

什么是CompletionStage呢？

在异步程序中，如果将每次的异步执行都看成是一个stage的话，我们通常很难控制异步程序的执行顺序，在javascript中，我们需要在回调中执行回调。这就会形成传说中的回调地狱。

好在在ES6中引入了promise的概念，可以将回调中的回调转写为链式调用，从而大大的提升了程序的可读性和可写性。

同样的在java中，我们使用CompletionStage来实现异步调用的链式操作。

CompletionStage定义了一系列的then*** 操作来实现这一功能。

## CompletableFuture作为Future使用

调用CompletableFuture.complete方法可以立马返回结果，我们看下怎么使用这个方法来构建一个基本的Future：

~~~java
    public Future<String> calculateAsync() throws InterruptedException {
        CompletableFuture<String> completableFuture
                = new CompletableFuture<>();

        Executors.newCachedThreadPool().submit(() -> {
            Thread.sleep(500);
            completableFuture.complete("Hello");
            return null;
        });

        return completableFuture;
    }
~~~

上面我们通过调动ExecutorService来提交一个任务从而得到一个Future。如果你知道执行的结果，那么可以使用CompletableFuture的completedFuture方法来直接返回一个Future。

~~~java
    public Future<String> useCompletableFuture(){
        Future<String> completableFuture =
                CompletableFuture.completedFuture("Hello");
        return completableFuture;
    }
~~~

CompletableFuture还提供了一个cancel方法来立马取消任务的执行：

~~~java
    public Future<String> calculateAsyncWithCancellation() throws InterruptedException {
    CompletableFuture<String> completableFuture = new CompletableFuture<>();

    Executors.newCachedThreadPool().submit(() -> {
        Thread.sleep(500);
        completableFuture.cancel(false);
        return null;
    });
    return completableFuture;
    }
~~~

如果这个时候调用Future的get方法，将会报CancellationException异常。

~~~java
Future<String> future = calculateAsyncWithCancellation();
future.get(); // CancellationException
~~~

## 异步执行code

CompletableFuture提供了runAsync和supplyAsync的方法，可以以异步的方式执行代码。

我们看一个runAsync的基本应用，接收一个Runnable参数：

~~~java
    public  void runAsync(){
        CompletableFuture<Void> runAsync= CompletableFuture.runAsync(()->{
            log.info("runAsync");
        });
    }
~~~

而supplyAsync接受一个Supplier：

~~~java
    public void supplyAsync(){
        CompletableFuture<String> supplyAsync=CompletableFuture.supplyAsync(()->{
            return "supplyAsync";
        });
    }
~~~

他们两个的区别是一个没有返回值，一个有返回值。

## 组合Futures

上面讲到CompletableFuture的一个重大作用就是将回调改为链式调用，从而将Futures组合起来。

而链式调用的返回值还是CompletableFuture，我们看一个thenCompose的例子：

~~~java
CompletableFuture<String> completableFuture 
  = CompletableFuture.supplyAsync(() -> "Hello")
    .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + " World"));
~~~

thenCompose将前一个Future的返回结果作为后一个操作的输入。

如果我们想合并两个CompletableFuture的结果，则可以使用thenCombine：

~~~java
    public void thenCombine(){
        CompletableFuture<String> completableFuture
                = CompletableFuture.supplyAsync(() -> "Hello")
                .thenCombine(CompletableFuture.supplyAsync(
                        () -> " World"), (s1, s2) -> s1 + s2));
    }
~~~

如果你不想返回结果，则可以使用thenAcceptBoth：

~~~java
    public void thenAcceptBoth(){
        CompletableFuture<Void> future = CompletableFuture.supplyAsync(() -> "Hello")
                .thenAcceptBoth(CompletableFuture.supplyAsync(() -> " World"),
                        (s1, s2) -> System.out.println(s1 + s2));
    }
~~~

## thenApply() 和 thenCompose()的区别

thenApply()和thenCompose()两个方法都可以将CompletableFuture连接起来，但是两个有点不一样。

thenApply()接收的是前一个调用返回的结果，然后对该结果进行处理。

thenCompose()接收的是前一个调用的stage，返回flat之后的的CompletableFuture。

简单点比较，两者就像是map和flatMap的区别。

## 并行执行任务

当我们需要并行执行任务时，通常我们需要等待所有的任务都执行完毕再去处理其他的任务，那么我们可以用到CompletableFuture.allOf方法：

~~~java
    public void allOf(){
        CompletableFuture<String> future1
                = CompletableFuture.supplyAsync(() -> "Hello");
        CompletableFuture<String> future2
                = CompletableFuture.supplyAsync(() -> "Beautiful");
        CompletableFuture<String> future3
                = CompletableFuture.supplyAsync(() -> "World");

        CompletableFuture<Void> combinedFuture
                = CompletableFuture.allOf(future1, future2, future3);
    }
~~~

allOf只保证task全都执行，而并没有返回值，如果希望带有返回值，我们可以使用join：

~~~java
    public void join(){
        CompletableFuture<String> future1
                = CompletableFuture.supplyAsync(() -> "Hello");
        CompletableFuture<String> future2
                = CompletableFuture.supplyAsync(() -> "Beautiful");
        CompletableFuture<String> future3
                = CompletableFuture.supplyAsync(() -> "World");

        String combined = Stream.of(future1, future2, future3)
                .map(CompletableFuture::join)
                .collect(Collectors.joining(" "));
    }
~~~

上面的程序将会返回：“Hello Beautiful World”。

## 异常处理

如果在链式调用的时候抛出异常，则可以在最后使用handle来接收：

~~~java
    public void handleError(){
        String name = null;

        CompletableFuture<String> completableFuture
                =  CompletableFuture.supplyAsync(() -> {
            if (name == null) {
                throw new RuntimeException("Computation error!");
            }
            return "Hello, " + name;
        }).handle((s, t) -> s != null ? s : "Hello, Stranger!");
    }
~~~

这和Promise中的catch方法使用类似。


















