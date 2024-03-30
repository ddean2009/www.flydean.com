---
slug: /concurrent-completionService
---

# 25. java中CompletionService的使用

之前的文章中我们讲到了ExecutorService，通过ExecutorService我们可以提交一个个的task，并且返回Future，然后通过调用Future.get方法来返回任务的执行结果。

这种方式虽然有效，但是需要保存每个返回的Future值，还是比较麻烦的，幸好ExecutorService提供了一个invokeAll的方法，来保存所有的Future值，我们看一个具体的实现：

~~~java
   public void useExecutorService() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(10);

        Callable<String> callableTask = () -> {
            TimeUnit.MILLISECONDS.sleep(300);
            return "Task's execution";
        };

        List<Callable<String>> callableTasks = new ArrayList<>();
        callableTasks.add(callableTask);
        callableTasks.add(callableTask);
        callableTasks.add(callableTask);

        List<Future<String>> futures = executor.invokeAll(callableTasks);

        executor.shutdown();

    }
~~~

上面的例子中，我们定义了3个task，通过调用`executor.invokeAll(callableTasks)`返回了一个 `List<Future<String>>`，这样我们就可以得到所有的返回值了。 

除了上面的invokeAll方法外，我们今天要介绍一个CompletionService接口。

CompletionService实际上是ExecutorService和BlockingQueue的结合体，ExecutorService用来提交任务，而BlockingQueue用来保存封装成Future的执行结果。通过调用take和poll的方法来获取到Future值。

CompletionService是一个接口，我们看下它的一个具体实现ExecutorCompletionService：

~~~java
    public ExecutorCompletionService(Executor executor) {
        if (executor == null)
            throw new NullPointerException();
        this.executor = executor;
        this.aes = (executor instanceof AbstractExecutorService) ?
            (AbstractExecutorService) executor : null;
        this.completionQueue = new LinkedBlockingQueue<Future<V>>();
    }
~~~

ExecutorCompletionService接收一个Executor作为参数。

我们看下上面的例子如果用ExecutorCompletionService重写是怎么样的：

~~~java
   public void useCompletionService() throws InterruptedException, ExecutionException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CompletionService<String> completionService=new ExecutorCompletionService<String>(executor);
        Callable<String> callableTask = () -> {
            TimeUnit.MILLISECONDS.sleep(300);
            return "Task's execution";
        };
        for(int i=0; i< 5; i ++){
            completionService.submit(callableTask);
        }

        for(int i=0; i<5; i++){
            Future<String> result=completionService.take();
            System.out.println(result.get());
        }
    }
~~~

上面的例子通过completionService.submit来提交任务，通过completionService.take()来获取结果值。

其实CompletionService还有一个poll的方法，poll和take的区别在于：take如果获取不到值则会等待，而poll则会返回null。

本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/CompletionService](https://github.com/ddean2009/learn-java-concurrency/tree/master/CompletionService)





