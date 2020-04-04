java中使用Semaphore构建阻塞对象池 

Semaphore是java 5中引入的概念，叫做计数信号量。主要用来控制同时访问某个特定资源的访问数量或者执行某个操作的数量。

Semaphore中定义了一组虚拟的permits，通过获取和释放这些permits，Semaphore可以控制资源的个数。

Semaphore的这个特性可以用来构造资源池，比如数据库连接池等。

Semaphore有两个构造函数：

~~~java
    public Semaphore(int permits) {
        sync = new NonfairSync(permits);
    }
~~~

~~~java
    public Semaphore(int permits, boolean fair) {
        sync = fair ? new FairSync(permits) : new NonfairSync(permits);
    }

~~~

permits定义了许可资源的个数，而fair则表示是否支持FIFO的顺序。

两个比较常用的方法就是acquire和release了。

~~~java
    public void acquire() throws InterruptedException {
        sync.acquireSharedInterruptibly(1);
    }
~~~

~~~java
    public void release() {
        sync.releaseShared(1);
    }
~~~

其中acquire用来获取资源，release用来释放资源。

有了这两个特性， 我们看一下怎么使用Semaphore来定义一个一个有界容器。

我们可以将Semaphore初始化为容器池大小，并且在容器池获取资源时调用acquire，将资源返回给容器池之后再调用release。

我们看下面的一个实现：

~~~java
public class SemaphoreUsage<T> {

    private final Set<T> set;
    private final Semaphore sem;

    public SemaphoreUsage(int bound){
        this.set = Collections.synchronizedSet(new HashSet<T>());
        sem= new Semaphore(bound);
    }

    public boolean add (T o) throws InterruptedException{
        sem.acquire();
        boolean wasAdded = false;
        try{
            wasAdded=set.add(o);
            return wasAdded;
        }finally {
            if(!wasAdded){
                sem.release();
            }
        }
    }

    public boolean remove(Object o){
        boolean wasRemoved = set.remove(o);
        if(wasRemoved){
            sem.release();
        }
        return wasRemoved;
    }

}

~~~

上面的例子我们定义了一个有界的synchronizedSet。 要注意一点是在add方法中，只有add成功之后才会调用release方法。




