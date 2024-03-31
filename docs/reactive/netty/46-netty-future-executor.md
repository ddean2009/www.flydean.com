---
slug: /46-netty-future-executor
---

# 70. netty系列之:可以自动通知执行结果的Future,有见过吗？



# 简介

在我的心中，JDK有两个经典版本，第一个就是现在大部分公司都在使用的JDK8，这个版本引入了Stream、lambda表达式和泛型，让JAVA程序的编写变得更加流畅，减少了大量的冗余代码。

另外一个版本要早点，还是JAVA 1.X的时代，我们称之为JDK1.5，这个版本引入了java.util.concurrent并发包，从此在JAVA中可以愉快的使用异步编程。

虽然先JDK已经发展到了17版本，但是并发这一块的变动并不是很大。受限于JDK要保持稳定的需求，所以concurrent并发包提供的功能并不能完全满足某些业务场景。所以依赖于JDK的包自行研发了属于自己的并发包。

当然，netty也不例外，一起来看看netty并发包都有那些优势吧。

# JDK异步缘起

怎么在java中创建一个异步任务，或者开启一个异步的线程，每个人可能都有属于自己的回答。

大家第一时间可能想到的是创建一个实现Runnable接口的类，然后将其封装到Thread中运行，如下所示：

```
new Thread(new(RunnableTask())).start()
```

每次都需要new一个Thread是JDK大神们不可接受的，于是他们产生了一个将thread调用进行封装的想法，而这个封装类就叫做Executor.

Executor是一个interface，首先看一下这个interface的定义：

```
public interface Executor {

    void execute(Runnable command);
}
```

接口很简单，就是定义了一个execute方法来执行传入的Runnable命令。

于是我们可以这样来异步开启任务：

```
   Executor executor = anExecutor;
   executor.execute(new RunnableTask1());
   executor.execute(new RunnableTask2());
```

看到这里，聪明的小伙伴可能就要问了，好像不对呀，Executor自定义了execute接口，好像跟异步和多线程并没有太大的关系呀？

别急，因为Executor是一个接口，所以我们可以有很多实现。比如下面的直接执行Runnable,让Runnable在当前线程中执行：

```
 class DirectExecutor implements Executor {
   public void execute(Runnable r) {
     r.run();
   }
 }
```

又比如下面的在一个新的线程中执行Runnable:

```
 class ThreadPerTaskExecutor implements Executor {
   public void execute(Runnable r) {
     new Thread(r).start();
   }
 }
```

又比如下面的将多个任务存放在一个Queue中，执行完一个任务再执行下一个任务的序列执行：

```
 class SerialExecutor implements Executor {
   final Queue<Runnable> tasks = new ArrayDeque<Runnable>();
   final Executor executor;
   Runnable active;

   SerialExecutor(Executor executor) {
     this.executor = executor;
   }

   public synchronized void execute(final Runnable r) {
     tasks.offer(new Runnable() {
       public void run() {
         try {
           r.run();
         } finally {
           scheduleNext();
         }
       }
     });
     if (active == null) {
       scheduleNext();
     }
   }

   protected synchronized void scheduleNext() {
     if ((active = tasks.poll()) != null) {
       executor.execute(active);
     }
   }
 }
```

这些Executor都非常完美。但是他们都只能提交任务，提交任务之后就什么都不知道了。这对于好奇的宝宝们是不可忍受的，因为我们需要知道执行的结果，或者对执行任务进行管控。

于是就有了ExecutorService。ExecutorService也是一个接口，不过他提供了shutdown方法来停止接受新的任务，和isShutdown来判断关闭的状态。

除此之外，它还提供了单独调用任务的submit方法和批量调用任务的invokeAll和invokeAny方法。

既然有了execute方法，submit虽然和execute方法基本上执行了相同的操作，但是在方法参数和返回值上有稍许区别。

首先是返回值，submit返回的是Future，Future表示异步计算的结果。 它提供了检查计算是否完成、等待其完成以及检索计算结果的方法。 Future提供了get方法，用来获取计算结果。但是如果调用get方法的同时，计算结果并没有准备好，则会发生阻塞。

其次是submit的参数，一般来说只有Callable才会有返回值，所以我们常用的调用方式是这样的：

```
<T> Future<T> submit(Callable<T> task);
```

如果我们传入Runnable，那么虽然也返回一个Future，但是返回的值是null：

```
Future<?> submit(Runnable task);
```

如果我又想传入Runnable，又想Future有返回值怎么办呢？

古人告诉我们，鱼和熊掌不可兼得！但是现在是2021年了，有些事情是可以发生改变了：

```
<T> Future<T> submit(Runnable task, T result);
```

上面我们可以传入一个result，当Future中的任务执行完毕之后直接将result返回。

既然ExecutorService这么强大，如何创建ExecutorService呢？

最简单的办法就是用new去创建对应的实例。但是这样不够优雅，于是JDK提供了一个Executors工具类，他提供了多种创建不同ExecutorService的静态方法，非常好用。

# netty中的Executor

为了兼容JDK的并发框架，虽然netty中也有Executor，但是netty中的Executor都是从JDK的并发包中衍生出来的。

具体而言，netty中的Executor叫做EventExecutor,他继承自EventExecutorGroup：

```
public interface EventExecutor extends EventExecutorGroup 
```

而EventExecutorGroup又继承自JDK的ScheduledExecutorService:

```
public interface EventExecutorGroup extends ScheduledExecutorService, Iterable<EventExecutor>
```

为什么叫做Group呢？这个Group的意思是它里面包含了一个EventExecutor的集合。这些结合中的EventExecutor通过Iterable的next方法来进行遍历的。

这也就是为什么EventExecutorGroup同时继承了Iterable类。

然后netty中的其他具体Executor的实现再在EventExecutor的基础之上进行扩展。从而得到了netty自己的EventExecutor实现。

# Future的困境和netty的实现

那么JDK中的Future会有什么问题呢？前面我们也提到了JDK中的Future虽然保存了计算结果，但是我们要获取的时候还是需要通过调用get方法来获取。

但是如果当前计算结果还没出来的话，get方法会造成当前线程的阻塞。

别怕，这个问题在netty中被解决了。

先看下netty中Future的定义：

```
public interface Future<V> extends java.util.concurrent.Future<V> 
```

可以看到netty中的Future是继承自JDK的Future。同时添加了addListener和removeListener,以及sync和await方法。

先讲一下sync和await方法，两者都是等待Future执行结束。不同之处在于，如果在执行过程中,如果future失败了，则会抛出异常。而await方法不会。

那么如果不想同步调用Future的get方法来获得计算结果。则可以给Future添加listener。

这样当Future执行结束之后，会自动通知listener中的方法，从而实现异步通知的效果，其使用代码如下：

```
EventExecutorGroup group = new DefaultEventExecutorGroup(4); // 4 threads
Future<?> f = group.submit(new Runnable() { ... });
f.addListener(new FutureListener<?> {
  public void operationComplete(Future<?> f) {
    ..
  }
});
```

还有一个问题，每次我们提交任务的时候，都需要创建一个EventExecutorGroup，有没有不需要创建就可以提交任务的方法呢？

有的！

netty为那些没有时间创建新的EventExecutorGroup的同志们，特意创建一个全局的GlobalEventExecutor，这是可以直接使用的：

```
GlobalEventExecutor.INSTANCE.execute(new Runnable() { ... });
```

GlobalEventExecutor是一个单线程的任务执行器，每隔一秒钟回去检测有没有新的任务，有的话就提交到executor执行。

# 总结

netty为JDK的并发包提供了非常有用的扩展。大家可以直接使用。









