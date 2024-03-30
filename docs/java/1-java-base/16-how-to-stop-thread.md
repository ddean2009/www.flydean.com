---
slug: /how-to-stop-thread
---

# 16. 还不知道如何在java中终止一个线程?快来,一文给你揭秘



# 简介

工作中我们经常会用到线程，一般情况下我们让线程执行就完事了，那么你们有没有想过如何去终止一个正在运行的线程呢？

今天带大家一起来看看。

# Thread.stop被禁用之谜

问道怎么终止一个线程，可能大多数人都知道可以调用Thread.stop方法。

但是这个方法从jdk1.2之后就不推荐使用了，为什么不推荐使用呢？

我们先来看下这个方法的定义：

```
  @Deprecated(since="1.2")
    public final void stop() {
        @SuppressWarnings("removal")
        SecurityManager security = System.getSecurityManager();
        if (security != null) {
            checkAccess();
            if (this != Thread.currentThread()) {
                security.checkPermission(SecurityConstants.STOP_THREAD_PERMISSION);
            }
        }
        // A zero status value corresponds to "NEW", it can't change to
        // not-NEW because we hold the lock.
        if (threadStatus != 0) {
            resume(); // Wake up thread if it was suspended; no-op otherwise
        }

        // The VM can handle all thread states
        stop0(new ThreadDeath());
    }
```

从代码我们可以看出，stop这个方法首先检测有没有线程访问的权限。如果有权限的话，来判断当前的线程是否是刚刚创建的线程，如果不是刚刚创建的，那么就调用resume方法来解除线程的暂停状态。

最后调用stop0方法来结束线程。

其中resume和stop0是两个native的方法，具体的实现这里就不讲了。

看起来stop方法很合理，没有什么问题。那么为什么说这个方法是不安全的呢？

接下来我们来看一个例子。

我们创建一个NumberCounter的类，这个类有一个increaseNumber的安全方法，用来对number加一：

```
public class NumberCounter {
    //要保存的数字
    private volatile int number=0;
    //数字计数器的逻辑是否完整
    private volatile boolean flag = false;

    public synchronized int increaseNumber() throws InterruptedException {
        if(flag){
            //逻辑不完整
            throw new RuntimeException("逻辑不完整，数字计数器未执行完毕");
        }
        //开始执行逻辑
        flag = true;
        //do something
        Thread.sleep(5000);
        number++;
        //执行完毕
        flag=false;
        return number;
    }
}
```

事实上，在实际工作中这样的方法可能需要执行比较久的时间，所以这里我们通过调用Thread.sleep来模拟这个耗时操作。

这里我们还有一个flag参数，来标志这个increaseNumber方法是否成功执行完毕。

好了，接下来我们在一个线程中调用这个类的方法，看看会发生什么：

```
    public static void main(String[] args) throws InterruptedException {
        NumberCounter numberCounter= new NumberCounter();
        Thread thread = new Thread(()->{
            while (true){
                try {
                    numberCounter.increaseNumber();
                } catch (InterruptedException e) {
                   e.printStackTrace();
                }
            }
        });
        thread.start();
        Thread.sleep(3000);
        thread.stop();
        numberCounter.increaseNumber();
    }
```

这里，我们创建了一个线程，等这个线程运行3秒钟之后，直接调用thread.stop方法，结果我们发现出现了下面的异常：

```
Exception in thread "main" java.lang.RuntimeException: 逻辑不完整，数字计数器未执行完毕
	at com.flydean.NumberCounter.increaseNumber(NumberCounter.java:12)
	at com.flydean.Main.main(Main.java:18)
```

这是因为thread.stop方法直接终止了线程的运行，导致mberCounter.increaseNumber未执行完毕。

但是这个未执行完毕的状态是隐藏的，如果使用thread.stop方法来终止线程，很有可能导致未知的结果。

所以，我们说thread.stop是不安全的。

# 怎么才能安全？

那么，如果不调用thread.stop方法，怎么才能安全的终止线程呢？

所谓安全，那就是需要让线程里面的逻辑执行完毕，而不是执行一半。

为了实现这个效果，Thread为我们提供了三个比较类似的方法，他们分别是interrupt、interrupted和isInterrupted。

interrupt是给线程设置中断标志；interrupted是检测中断并清除中断状态；isInterrupted只检测中断。还有重要的一点就是interrupted是类方法，作用于当前线程，interrupt和isInterrupted作用于此线程，即代码中调用此方法的实例所代表的线程。

interrupt就是中断的方法，它的工作流程如下：

1. 如果当前线程实例在调用Object类的wait（），wait（long）或wait（long，int）方法或join（），join（long），join（long，int）方法，或者在该实例中调用了Thread.sleep（long）或Thread.sleep（long，int）方法，并且正在阻塞状态中时，则其中断状态将被清除，并将收到InterruptedException。

2. 如果此线程在InterruptibleChannel上的I/O操作中处于被阻塞状态，则该channel将被关闭，该线程的中断状态将被设置为true，并且该线程将收到java.nio.channels.ClosedByInterruptException异常。

3. 如果此线程在java.nio.channels.Selector中处于被被阻塞状态，则将设置该线程的中断状态为true，并且它将立即从select操作中返回。

4. 如果上面的情况都不成立，则设置中断状态为true。

在上面的例子中，NumberCounter的increaseNumber方法中，我们调用了Thread.sleep方法，所以如果在这个时候，调用了thread的interrupt方法，线程就会抛出一个InterruptedException异常。

我们把上面调用的例子改成下面这样：

```
    public static void main(String[] args) throws InterruptedException {
        NumberCounter numberCounter = new NumberCounter();

        Thread thread = new Thread(() -> {
            while (true) {
                try {
                    numberCounter.increaseNumber();
                } catch (InterruptedException e) {
                    System.out.println("捕获InterruptedException");
                    throw new RuntimeException(e);
                }
            }
        });

        thread.start();
        Thread.sleep(500);
        thread.interrupt();
        numberCounter.increaseNumber();
    }
```

运行之后再试一次：

```
Exception in thread "main" Exception in thread "Thread-0" java.lang.RuntimeException: 逻辑不完整，数字计数器未执行完毕
	at com.flydean.NumberCounter.increaseNumber(NumberCounter.java:12)
	at com.flydean.Main2.main(Main2.java:21)
java.lang.RuntimeException: java.lang.thread.interrupt: sleep interrupted
	at com.flydean.Main2.lambda$main$0(Main2.java:13)
	at java.base/java.lang.Thread.run(Thread.java:833)
Caused by: java.lang.InterruptedException: sleep interrupted
	at java.base/java.lang.Thread.sleep(Native Method)
	at com.flydean.NumberCounter.increaseNumber(NumberCounter.java:17)
	at com.flydean.Main2.lambda$main$0(Main2.java:10)
	... 1 more
捕获InterruptedException
```

可以看到，我们捕获到了这个InterruptedException,并且得知具体的原因是sleep interrupted。

# 捕获异常之后的处理

从上面的分析可以得知，thread.stop跟thread.interrupt的表现机制是不一样的。thread.stop属于悄悄终止,我们程序不知道，所以会导致数据不一致，从而产生一些未知的异常。

而thread.interrupt会显示的抛出InterruptedException,当我们捕捉到这个异常的时候，我们就知道线程里面的逻辑在执行的过程中受到了外部作用的干扰，那么我们就可以执行一些数据恢复或者数据校验的动作。

在上面的代码中，我们是捕获到了这个异常，打印出异常日志，然后向上抛出一个RuntimeException。

正常情况下我们是需要在捕获异常之后，进行一些处理。

那么自己处理完这个异常之后，是不是就完美了呢？

答案是否定的。

因为如果我们自己处理了这个InterruptedException, 那么程序中其他部分如果有依赖这个InterruptedException的话，就可能会出现数据不一致的情况。

所以我们在自己处理完InterruptedException之后，还需要再次抛出这个异常。

怎么抛出InterruptedException异常呢？

有两种方式，第一种就是在调用Thread.interrupted()清除了中断标志之后立即抛出：

```
   if (Thread.interrupted())  // Clears interrupted status!
       throw new InterruptedException();
```

还有一种方式就是，在捕获异常之后，调用Thread.currentThread().interrupt()再次中断线程。

```
public void run () {
  try {
    while (true) {
      // do stuff
    }
  }catch (InterruptedException e) {
    LOGGER.log(Level.WARN, "Interrupted!", e);
    // Restore interrupted state...
    Thread.currentThread().interrupt();
  }
}
```

这两种方式都能达到预想的效果。

# 总结

线程不能调用stop来终止主要是因为不会抛出异常，从而导致一些安全和数据不一致的问题。所以，最好的方式就是调用interrupt方法来处理。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/how-to-stop-thread](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/how-to-stop-thread)





