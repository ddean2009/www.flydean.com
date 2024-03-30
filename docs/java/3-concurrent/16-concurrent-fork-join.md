---
slug: /concurrent-fork-join
---

# 16. java 中的fork join框架

fork join框架是java 7中引入框架，这个框架的引入主要是为了提升并行计算的能力。

fork join主要有两个步骤，第一就是fork，将一个大任务分成很多个小任务，第二就是join，将第一个任务的结果join起来，生成最后的结果。如果第一步中并没有任何返回值，join将会等到所有的小任务都结束。

还记得之前的文章我们讲到了thread pool的基本结构吗？ 

1. ExecutorService  - ForkJoinPool 用来调用任务执行。
2. workerThread - ForkJoinWorkerThread 工作线程，用来执行具体的任务。
3. task -  ForkJoinTask 用来定义要执行的任务。

下面我们从这三个方面来详细讲解fork join框架。

## ForkJoinPool

ForkJoinPool是一个ExecutorService的一个实现，它提供了对工作线程和线程池的一些便利管理方法。

~~~java
public class ForkJoinPool extends AbstractExecutorService 
~~~

一个work thread一次只能处理一个任务，但是ForkJoinPool并不会为每个任务都创建一个单独的线程，它会使用一个特殊的数据结构double-ended queue来存储任务。这样的结构可以方便的进行工作窃取（work-stealing）。

什么是work-stealing呢？

默认情况下，work thread从分配给自己的那个队列头中取出任务。如果这个队列是空的，那么这个work thread会从其他的任务队列尾部取出任务来执行，或者从全局队列中取出。这样的设计可以充分利用work thread的性能，提升并发能力。

下面看下怎么创建一个ForkJoinPool。

最常见的方法就是使用ForkJoinPool.commonPool()来创建，commonPool()为所有的ForkJoinTask提供了一个公共默认的线程池。

~~~java
ForkJoinPool forkJoinPool = ForkJoinPool.commonPool();
~~~

另外一种方式是使用构造函数：

~~~java
ForkJoinPool forkJoinPool = new ForkJoinPool(2);
~~~

这里的参数是并行级别，2指的是线程池将会使用2个处理器核心。

## ForkJoinWorkerThread

ForkJoinWorkerThread是使用在ForkJoinPool的工作线程。

~~~java
public class ForkJoinWorkerThread extends Thread
}
~~~

和一般的线程不一样的是它定义了两个变量：

~~~java
    final ForkJoinPool pool;                // the pool this thread works in
    final ForkJoinPool.WorkQueue workQueue; // work-stealing mechanics
~~~

一个是该worker thread所属的ForkJoinPool。 另外一个是支持 work-stealing机制的Queue。

再看一下它的run方法：

~~~java
   public void run() {
        if (workQueue.array == null) { // only run once
            Throwable exception = null;
            try {
                onStart();
                pool.runWorker(workQueue);
            } catch (Throwable ex) {
                exception = ex;
            } finally {
                try {
                    onTermination(exception);
                } catch (Throwable ex) {
                    if (exception == null)
                        exception = ex;
                } finally {
                    pool.deregisterWorker(this, exception);
                }
            }
        }
    }
~~~

简单点讲就是从Queue中取出任务执行。

## ForkJoinTask

ForkJoinTask是ForkJoinPool中运行的任务类型。通常我们会用到它的两个子类：`RecursiveAction`和`RecursiveTask<V>`。

他们都定义了一个需要实现的compute（）方法用来实现具体的业务逻辑。不同的是RecursiveAction只是用来执行任务，而`RecursiveTask<V>`可以有返回值。

既然两个类都带了Recursive，那么具体的实现逻辑也会跟递归有关，我们举个使用RecursiveAction来打印字符串的例子：

~~~java
public class CustomRecursiveAction extends RecursiveAction {

    private String workload = "";
    private static final int THRESHOLD = 4;

    private static Logger logger =
            Logger.getAnonymousLogger();

    public CustomRecursiveAction(String workload) {
        this.workload = workload;
    }

    @Override
    protected void compute() {
        if (workload.length() > THRESHOLD) {
            ForkJoinTask.invokeAll(createSubtasks());
        } else {
            processing(workload);
        }
    }

    private List<CustomRecursiveAction> createSubtasks() {
        List<CustomRecursiveAction> subtasks = new ArrayList<>();

        String partOne = workload.substring(0, workload.length() / 2);
        String partTwo = workload.substring(workload.length() / 2, workload.length());

        subtasks.add(new CustomRecursiveAction(partOne));
        subtasks.add(new CustomRecursiveAction(partTwo));

        return subtasks;
    }

    private void processing(String work) {
        String result = work.toUpperCase();
        logger.info("This result - (" + result + ") - was processed by "
                + Thread.currentThread().getName());
    }
}
~~~

上面的例子使用了二分法来打印字符串。

我们再看一个`RecursiveTask<V>`的例子：

~~~java
public class CustomRecursiveTask extends RecursiveTask<Integer> {
    private int[] arr;

    private static final int THRESHOLD = 20;

    public CustomRecursiveTask(int[] arr) {
        this.arr = arr;
    }

    @Override
    protected Integer compute() {
        if (arr.length > THRESHOLD) {
            return ForkJoinTask.invokeAll(createSubtasks())
                    .stream()
                    .mapToInt(ForkJoinTask::join)
                    .sum();
        } else {
            return processing(arr);
        }
    }

    private Collection<CustomRecursiveTask> createSubtasks() {
        List<CustomRecursiveTask> dividedTasks = new ArrayList<>();
        dividedTasks.add(new CustomRecursiveTask(
                Arrays.copyOfRange(arr, 0, arr.length / 2)));
        dividedTasks.add(new CustomRecursiveTask(
                Arrays.copyOfRange(arr, arr.length / 2, arr.length)));
        return dividedTasks;
    }

    private Integer processing(int[] arr) {
        return Arrays.stream(arr)
                .filter(a -> a > 10 && a < 27)
                .map(a -> a * 10)
                .sum();
    }
}
~~~

和上面的例子很像，不过这里我们需要有返回值。

## 在ForkJoinPool中提交Task

有了上面的两个任务，我们就可以在ForkJoinPool中提交了：

~~~java
int[] intArray= {12,12,13,14,15};
        CustomRecursiveTask customRecursiveTask= new CustomRecursiveTask(intArray);

        int result = forkJoinPool.invoke(customRecursiveTask);
        System.out.println(result);
~~~

上面的例子中，我们使用invoke来提交，invoke将会等待任务的执行结果。

如果不使用invoke，我们也可以将其替换成fork（）和join（）：

~~~java
customRecursiveTask.fork();
        int result2= customRecursiveTask.join();
        System.out.println(result2);
~~~

 fork() 是将任务提交给pool，但是并不触发执行，  join()将会真正的执行并且得到返回结果。

 本文的例子可以参考[https://github.com/ddean2009/learn-java-concurrency/tree/master/forkjoin](https://github.com/ddean2009/learn-java-concurrency/tree/master/forkjoin)






