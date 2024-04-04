---
slug: /java-security-code-line-threadpool
---

# 24. java安全编码指南之:ThreadPool的使用

# 简介

在java中，除了单个使用Thread之外，我们还会使用到ThreadPool来构建线程池，那么在使用线程池的过程中需要注意哪些事情呢？

一起来看看吧。

# java自带的线程池

java提供了一个非常好用的工具类**Executors**，通过Executors我们可以非常方便的创建出一系列的线程池：

Executors.newCachedThreadPool,根据需要可以创建新线程的线程池。线程池中曾经创建的线程，在完成某个任务后也许会被用来完成另外一项任务。

Executors.newFixedThreadPool(int nThreads) ,创建一个可重用固定线程数的线程池。这个线程池里最多包含nThread个线程。

Executors.newSingleThreadExecutor() ,创建一个使用单个 worker 线程的 Executor。即使任务再多，也只用1个线程完成任务。

Executors.newSingleThreadScheduledExecutor() ,创建一个单线程执行程序，它可安排在给定延迟后运行命令或者定期执行。

# 提交给线程池的线程要是可以被中断的

ExecutorService线程池提供了两个很方便的停止线程池中线程的方法，他们是shutdown和shutdownNow。

shutdown不会接受新的任务，但是会等待现有任务执行完毕。而shutdownNow会尝试立马终止现有运行的线程。

那么它是怎么实现的呢？我们看一个ThreadPoolExecutor中的一个实现：

~~~java
    public List<Runnable> shutdownNow() {
        List<Runnable> tasks;
        final ReentrantLock mainLock = this.mainLock;
        mainLock.lock();
        try {
            checkShutdownAccess();
            advanceRunState(STOP);
            interruptWorkers();
            tasks = drainQueue();
        } finally {
            mainLock.unlock();
        }
        tryTerminate();
        return tasks;
    }
~~~

里面有一个interruptWorkers()方法的调用，实际上就是去中断当前运行的线程。

所以我们可以得到一个结论，提交到ExecutorService中的任务一定要是可以被中断的，否则shutdownNow方法将会失效。

先看一个错误的使用例子：

~~~java
    public void wrongSubmit(){
        Runnable runnable= ()->{
            try(SocketChannel  sc = SocketChannel.open(new InetSocketAddress("127.0.0.1", 8080))) {
            ByteBuffer buf = ByteBuffer.allocate(1024);
            while(true){
                sc.read(buf);
            }
            } catch (IOException e) {
                e.printStackTrace();
            }
        };
        ExecutorService pool =  Executors.newFixedThreadPool(10);
        pool.submit(runnable);
        pool.shutdownNow();
    }
~~~

在这个例子中，运行的代码无法处理中断，所以将会一直运行。

下面看下正确的写法：

~~~java
    public void correctSubmit(){
        Runnable runnable= ()->{
            try(SocketChannel  sc = SocketChannel.open(new InetSocketAddress("127.0.0.1", 8080))) {
                ByteBuffer buf = ByteBuffer.allocate(1024);
                while(!Thread.interrupted()){
                    sc.read(buf);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        };
        ExecutorService pool =  Executors.newFixedThreadPool(10);
        pool.submit(runnable);
        pool.shutdownNow();
    }
~~~

我们需要在while循环中加上中断的判断，从而控制程序的执行。

# 正确处理线程池中线程的异常

如果在线程池中的线程发生了异常，比如RuntimeException，我们怎么才能够捕捉到呢？ 如果不能够对异常进行合理的处理，那么将会产生不可预料的问题。

看下面的例子：

~~~java
    public void wrongSubmit() throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(10);
        Runnable runnable= ()->{
            throw new NullPointerException();
        };
        pool.execute(runnable);
        Thread.sleep(5000);
        System.out.println("finished!");
    }
~~~

上面的例子中，我们submit了一个任务，在任务中会抛出一个NullPointerException，因为是非checked异常，所以不需要显式捕获，在任务运行完毕之后，我们基本上是不能够得知任务是否运行成功了。

那么，怎么才能够捕获这样的线程池异常呢？这里介绍大家几个方法。

第一种方法就是继承ThreadPoolExecutor，重写

~~~java
 protected void afterExecute(Runnable r, Throwable t) { }
~~~

和

~~~java
protected void terminated() { }
~~~

这两个方法。

其中afterExecute会在任务执行完毕之后被调用，Throwable t中保存的是可能出现的运行时异常和Error。我们可以根据需要进行处理。

而terminated是在线程池中所有的任务都被调用完毕之后才被调用的。我们可以在其中做一些资源的清理工作。

第二种方法就是使用UncaughtExceptionHandler。

Thread类中提供了一个setUncaughtExceptionHandler方法，用来处理捕获的异常，我们可以在创建Thread的时候，为其添加一个UncaughtExceptionHandler就可以了。

但是ExecutorService执行的是一个个的Runnable，怎么使用ExecutorService来提交Thread呢？

别怕， Executors在构建线程池的时候，还可以让我们传入ThreadFactory，从而构建自定义的Thread。

~~~java
    public void useExceptionHandler() throws InterruptedException {
        ThreadFactory factory =
                new ExceptionThreadFactory(new MyExceptionHandler());
        ExecutorService pool =
                Executors.newFixedThreadPool(10, factory);
        Runnable runnable= ()->{
            throw new NullPointerException();
        };
        pool.execute(runnable);
        Thread.sleep(5000);
        System.out.println("finished!");
    }

    public static class ExceptionThreadFactory implements ThreadFactory {
        private static final ThreadFactory defaultFactory =
                Executors.defaultThreadFactory();
        private final Thread.UncaughtExceptionHandler handler;

        public ExceptionThreadFactory(
                Thread.UncaughtExceptionHandler handler)
        {
            this.handler = handler;
        }

        @Override
        public Thread newThread(Runnable run) {
            Thread thread = defaultFactory.newThread(run);
            thread.setUncaughtExceptionHandler(handler);
            return thread;
        }
    }

    public static class MyExceptionHandler implements Thread.UncaughtExceptionHandler {
        @Override
        public void uncaughtException(Thread t, Throwable e) {

        }
    }
~~~

上面的例子有点复杂了， 有没有更简单点的做法呢？

有的。ExecutorService除了execute来提交任务之外，还可以使用submit来提交任务。不同之处是submit会返回一个Future来保存执行的结果。

~~~java
    public void useFuture() throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(10);
        Runnable runnable= ()->{
            throw new NullPointerException();
        };
        Future future = pool.submit(runnable);
        try {
            future.get();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        Thread.sleep(5000);
        System.out.println("finished!");
    }
~~~

当我们在调用future.get()来获取结果的时候，异常也会被封装到ExecutionException，我们可以直接获取到。

# 线程池中使用ThreadLocal一定要注意清理

我们知道ThreadLocal是Thread中的本地变量，如果我们在线程的运行过程中用到了ThreadLocal，那么当线程被回收之后再次执行其他的任务的时候就会读取到之前被设置的变量，从而产生未知的问题。

正确的使用方法就是在线程每次执行完任务之后，都去调用一下ThreadLocal的remove操作。

或者在自定义ThreadPoolExecutor中，重写beforeExecute(Thread t, Runnable r)方法，在其中加入ThreadLocal的remove操作。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！




