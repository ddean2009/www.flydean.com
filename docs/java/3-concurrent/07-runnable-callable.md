---
slug: /runnable-callable
---

# 7. java中Runnable和Callable的区别

在java的多线程开发中Runnable一直以来都是多线程的核心，而Callable是java1.5添加进来的一个增强版本。

本文我们会详细探讨Runnable和Callable的区别。

## 运行机制

首先看下Runnable和Callable的接口定义：

~~~java
@FunctionalInterface
public interface Runnable {
    /**
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see     java.lang.Thread#run()
     */
    public abstract void run();
}
~~~

~~~java
@FunctionalInterface
public interface Callable<V> {
    /**
     * Computes a result, or throws an exception if unable to do so.
     *
     * @return computed result
     * @throws Exception if unable to compute a result
     */
    V call() throws Exception;
}
~~~

Runnable需要实现run（）方法，Callable需要实现call（）方法。

我们都知道要自定义一个Thread有两种方法，一是继承Thread，而是实现Runnable接口，这是因为Thread本身就是一个Runnable的实现：

~~~java
class Thread implements Runnable {
    /* Make sure registerNatives is the first thing <clinit> does. */
    private static native void registerNatives();
    static {
        registerNatives();
    }
    ...
~~~

所以Runnable可以通过Runnable和之前我们介绍的ExecutorService 来执行，而Callable则只能通过ExecutorService 来执行。

## 返回值的不同

根据上面两个接口的定义，Runnable是不返还值的，而Callable可以返回值。

如果我们都通过ExecutorService来提交，看看有什么不同：

* 使用runnable
~~~java
    public void executeTask() {
        ExecutorService executorService = Executors.newSingleThreadExecutor();
        Future future = executorService.submit(()->log.info("in runnable!!!!"));
        executorService.shutdown();
    }
~~~

* 使用callable
~~~java
    public void executeTask() {
        ExecutorService executorService = Executors.newSingleThreadExecutor();
        Future future = executorService.submit(()->{
            log.info("in callable!!!!");
            return "callable";
        });
        executorService.shutdown();
    }
~~~

虽然我们都返回了Future，但是runnable的情况下Future将不包含任何值。

## Exception处理

Runnable的run（）方法定义没有抛出任何异常，所以任何的Checked Exception都需要在run（）实现方法中自行处理。

Callable的Call（）方法抛出了throws Exception，所以可以在call（）方法的外部，捕捉到Checked Exception。我们看下Callable中异常的处理。

~~~java
 public void executeTaskWithException(){
        ExecutorService executorService = Executors.newSingleThreadExecutor();
        Future future = executorService.submit(()->{
            log.info("in callable!!!!");
            throw new CustomerException("a customer Exception");
        });
        try {
            Object object= future.get();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
            e.getCause();
        }
        executorService.shutdown();
    }
~~~

上面的例子中，我们在Callable中抛出了一个自定义的CustomerException。 

这个异常会被包含在返回的Future中。当我们调用future.get()方法时，就会抛出ExecutionException，通过e.getCause()，就可以获取到包含在里面的具体异常信息。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/runnable-callable](https://github.com/ddean2009/learn-java-concurrency/tree/master/runnable-callable)

更多教程请参考 [flydean的博客](www.flydean.com)


