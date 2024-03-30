---
slug: /concurrent-future
---

# 5. java中Future的使用

Future是java 1.5引入的一个interface，可以方便的用于异步结果的获取。 本文将会通过具体的例子讲解如何使用Future。

## 创建Future

正如上面所说，Future代表的是异步执行的结果，意思是当异步执行结束之后，返回的结果将会保存在Future中。

那么我们什么时候会用到Future呢？ 一般来说，当我们执行一个长时间运行的任务时，使用Future就可以让我们暂时去处理其他的任务，等长任务执行完毕再返回其结果。

经常会使用到Future的场景有：1. 计算密集场景。2. 处理大数据量。3. 远程方法调用等。

接下来我们将会使用ExecutorService来创建一个Future。

~~~java
    <T> Future<T> submit(Callable<T> task);
~~~

上面是ExecutorService中定义的一个submit方法，它接收一个Callable参数，并返回一个Future。

我们用一个线程来计算一个平方运算：

~~~java
    private ExecutorService executor
            = Executors.newSingleThreadExecutor();

    public Future<Integer> calculate(Integer input) {
        return executor.submit(() -> {
            System.out.println("Calculating..."+ input);
            Thread.sleep(1000);
            return input * input;
        });
    }
~~~

submit需要接受一个Callable参数，Callable需要实现一个call方法，并返回结果。这里我们使用lamaba表达式来简化这一个流程。

## 从Future获取结果

上面我们创建好了Future，接下来我们看一下怎么获取到Future的值。

~~~java
       FutureUsage futureUsage=new FutureUsage();
        Future<Integer> futureOne = futureUsage.calculate(20);
        while(!futureOne.isDone()) {
            System.out.println("Calculating...");
            Thread.sleep(300);
        }
        Integer result = futureOne.get();
~~~

首先我们通过Future.isDone() 来判断这个异步操作是否执行完毕，如果完毕我们就可以直接调用futureOne.get()来获得Futre的结果。

这里futureOne.get()是一个阻塞操作，会一直等待异步执行完毕才返回结果。

如果我们不想等待，future提供了一个带时间的方法：

~~~java
Integer result = futureOne.get(500, TimeUnit.MILLISECONDS);
~~~

如果在等待时间结束的时候，Future还有返回，则会抛出一个TimeoutException。 

## 取消Future

如果我们提交了一个异步程序，但是想取消它， 则可以这样：

~~~java
uture<Integer> futureTwo = futureUsage.calculate(4);

        boolean canceled = futureTwo.cancel(true);
~~~

Future.cancel(boolean) 传入一个boolean参数，来选择是否中断正在运行的task。

如果我们cancel之后，再次调用get()方法，则会抛出CancellationException。

## 多线程环境中运行

如果有两个计算任务，先看下在单线程下运行的结果。

~~~java
        Future<Integer> future1 = futureUsage.calculate(10);
        Future<Integer> future2 = futureUsage.calculate(100);

        while (!(future1.isDone() && future2.isDone())) {
            System.out.println(
                    String.format(
                            "future1 is %s and future2 is %s",
                            future1.isDone() ? "done" : "not done",
                            future2.isDone() ? "done" : "not done"
                    )
            );
            Thread.sleep(300);
        }

        Integer result1 = future1.get();
        Integer result2 = future2.get();

        System.out.println(result1 + " and " + result2);
~~~

因为我们通过Executors.newSingleThreadExecutor（）来创建的单线程池。所以运行结果如下：

~~~txt
Calculating...10
future1 is not done and future2 is not done
future1 is not done and future2 is not done
future1 is not done and future2 is not done
future1 is not done and future2 is not done
Calculating...100
future1 is done and future2 is not done
future1 is done and future2 is not done
future1 is done and future2 is not done
100 and 10000
~~~

如果我们使用Executors.newFixedThreadPool(2)来创建一个多线程池，则可以得到如下的结果：

~~~txt
calculating...10
calculating...100
future1 is not done and future2 is not done
future1 is not done and future2 is not done
future1 is not done and future2 is not done
future1 is not done and future2 is not done
100 and 10000
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/future](https://github.com/ddean2009/learn-java-concurrency/tree/master/future)




