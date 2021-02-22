
使用ExecutorService来停止线程服务

之前的文章中我们提到了ExecutorService可以使用shutdown和shutdownNow来关闭。 

这两种关闭的区别在于各自的安全性和响应性。shutdownNow强行关闭速度更快，但是风险也更大，因为任务可能正在执行的过程中被结束了。而shutdown正常关闭虽然速度比较慢，但是却更安全，因为它一直等到队列中的所有任务都执行完毕之后才关闭。

## 使用shutdown

我们先看一个使用shutdown的例子:

~~~java
    public void useShutdown() throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(10);

        Runnable runnableTask = () -> {
            try {
                TimeUnit.MILLISECONDS.sleep(300);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        executor.submit(runnableTask);
        executor.shutdown();
        executor.awaitTermination(800, TimeUnit.MILLISECONDS);
    }
~~~

awaitTermination将会阻塞直到所有正在执行的任务完成，或者达到指定的timeout时间。

## 使用shutdownNow

当通过shutdownNow来强行关闭ExecutorService是， 它会尝试取消正在执行的任务，并返回所有已经提交但是还没有开始的任务。从而可以将这些任务保存起来，以便以后进行处理。

但是这样我们只知道了还没有开始执行的任务，对于那些已经开始执行但是没有执行完毕却被取消的任务我们无法获取。

我们看下如何获得开始执行但是还没有执行完毕的任务：

~~~java
public class TrackingExecutor extends AbstractExecutorService {
    private final ExecutorService executorService;
    private final Set<Runnable> taskCancelledAtShutdown= Collections.synchronizedSet(new HashSet<Runnable>());

    public TrackingExecutor(ExecutorService executorService){
         this.executorService=executorService;
    }
    @Override
    public void shutdown() {
        executorService.shutdown();
    }

    @Override
    public List<Runnable> shutdownNow() {
        return executorService.shutdownNow();
    }

    @Override
    public boolean isShutdown() {
        return executorService.isShutdown();
    }

    @Override
    public boolean isTerminated() {
        return executorService.isTerminated();
    }

    @Override
    public boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException {
        return executorService.awaitTermination(timeout,unit);
    }

    @Override
    public void execute(Runnable command) {
        executorService.execute(() -> {
            try {
                command.run();
            }finally {
                if(isShutdown() && Thread.currentThread().isInterrupted()){
                    taskCancelledAtShutdown.add(command);
                }
            }
        });
    }

    public List<Runnable> getCancelledTask(){
        if(! executorService.isTerminated()){
            throw new IllegalStateException("executorService is not terminated");
        }
        return new ArrayList<>(taskCancelledAtShutdown);
    }
}
~~~

上面的例子中我们构建了一个新的ExecutorService，他传入一个ExecutorService，并对其进行封装。

我们重写了execute方法，在执行完毕判断该任务是否被中断，如果被中断则将其添加到CancelledTask列表中。

并提供一个getCancelledTask方法来返回未执行完毕的任务。

我们看下怎么使用：

~~~java
    public void useShutdownNow() throws InterruptedException {
        TrackingExecutor trackingExecutor=new TrackingExecutor(Executors.newCachedThreadPool());

        Runnable runnableTask = () -> {
            try {
                TimeUnit.MILLISECONDS.sleep(300);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        };

        trackingExecutor.submit(runnableTask);
        List<Runnable> notrunList=trackingExecutor.shutdownNow();
        if(trackingExecutor.awaitTermination(800, TimeUnit.SECONDS)){
            List<Runnable> runButCancelledList= trackingExecutor.getCancelledTask();
        }
    }
~~~

trackingExecutor.shutdownNow()返回的是未执行的任务。而trackingExecutor.getCancelledTask()返回的是被取消的任务。

上面的任务其实还有一个缺点，因为我们在存储被取消的任务列表的额时候taskCancelledAtShutdown.add(command)，因为之前的判断不是原子操作，则可能会产生误报。






