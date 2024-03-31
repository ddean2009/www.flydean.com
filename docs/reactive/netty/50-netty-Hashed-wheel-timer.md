---
slug: /50-netty-Hashed-wheel-timer
---

# 74. netty系列之:HashedWheelTimer一种定时器的高效实现



# 简介

定时器是一种在实际的应用中非常常见和有效的一种工具，其原理就是把要执行的任务按照执行时间的顺序进行排序，然后在特定的时间进行执行。JAVA提供了java.util.Timer和java.util.concurrent.ScheduledThreadPoolExecutor等多种Timer工具，但是这些工具在执行效率上面还是有些缺陷，于是netty提供了HashedWheelTimer,一个优化的Timer类。

一起来看看netty的Timer有何不同吧。

# java.util.Timer

Timer是JAVA在1.3中引入的。所有的任务都存储在它里面的TaskQueue中：

```
private final TaskQueue queue = new TaskQueue();
```

TaskQueue的底层是一个TimerTask的数组，用于存储要执行的任务。

```
private TimerTask[] queue = new TimerTask[128];
```

看起来TimerTask只是一个数组，但是Timer将这个queue做成了一个平衡二叉堆。

当添加一个TimerTask的时候，会插入到Queue的最后面，然后调用fixup方法进行再平衡：

```
    void add(TimerTask task) {
        // Grow backing store if necessary
        if (size + 1 == queue.length)
            queue = Arrays.copyOf(queue, 2*queue.length);

        queue[++size] = task;
        fixUp(size);
    }
```

当从heap中移出运行的任务时候，会调用fixDown方法进行再平衡：

```
    void removeMin() {
        queue[1] = queue[size];
        queue[size--] = null;  // Drop extra reference to prevent memory leak
        fixDown(1);
    }
```

fixup的原理就是将当前的节点和它的父节点进行比较，如果小于父节点就和父节点进行交互，然后遍历进行这个过程：

```
    private void fixUp(int k) {
        while (k > 1) {
            int j = k >> 1;
            if (queue[j].nextExecutionTime <= queue[k].nextExecutionTime)
                break;
            TimerTask tmp = queue[j];  queue[j] = queue[k]; queue[k] = tmp;
            k = j;
        }
    }
```

fixDown的原理是比较当前节点和它的子节点，如果当前节点大于子节点，则将其降级：

```
    private void fixDown(int k) {
        int j;
        while ((j = k << 1) <= size && j > 0) {
            if (j < size &&
                queue[j].nextExecutionTime > queue[j+1].nextExecutionTime)
                j++; // j indexes smallest kid
            if (queue[k].nextExecutionTime <= queue[j].nextExecutionTime)
                break;
            TimerTask tmp = queue[j];  queue[j] = queue[k]; queue[k] = tmp;
            k = j;
        }
    }
```

二叉平衡堆的算法这里不做详细的介绍。大家可以自行查找相关的文章。

# java.util.concurrent.ScheduledThreadPoolExecutor

虽然Timer已经很好用了，并且是线程安全的，但是对于Timer来说，想要提交任务的话需要创建一个TimerTask类，用来封装具体的任务，不是很通用。

所以JDK在5.0中引入了一个更加通用的ScheduledThreadPoolExecutor，这是一个线程池使用多线程来执行具体的任务。当线程池中的线程个数等于1的时候，ScheduledThreadPoolExecutor就等同于Timer。

ScheduledThreadPoolExecutor中进行任务保存的是一个DelayedWorkQueue。

DelayedWorkQueue和DelayQueue,PriorityQueue一样都是一个基于堆的数据结构。

因为堆需要不断的进行siftUp和siftDown再平衡操作，所以它的时间复杂度是O(log n)。

下面是DelayedWorkQueue的shiftUp和siftDown的实现代码：

```
       private void siftUp(int k, RunnableScheduledFuture<?> key) {
            while (k > 0) {
                int parent = (k - 1) >>> 1;
                RunnableScheduledFuture<?> e = queue[parent];
                if (key.compareTo(e) >= 0)
                    break;
                queue[k] = e;
                setIndex(e, k);
                k = parent;
            }
            queue[k] = key;
            setIndex(key, k);
        }

        private void siftDown(int k, RunnableScheduledFuture<?> key) {
            int half = size >>> 1;
            while (k < half) {
                int child = (k << 1) + 1;
                RunnableScheduledFuture<?> c = queue[child];
                int right = child + 1;
                if (right < size && c.compareTo(queue[right]) > 0)
                    c = queue[child = right];
                if (key.compareTo(c) <= 0)
                    break;
                queue[k] = c;
                setIndex(c, k);
                k = child;
            }
            queue[k] = key;
            setIndex(key, k);
        }
```

# HashedWheelTimer

因为Timer和ScheduledThreadPoolExecutor底层都是基于堆结构的。虽然ScheduledThreadPoolExecutor对Timer进行了改进，但是他们两个的效率是差不多的。

那么有没有更加高效的方法呢？比如O(1)是不是可以达到呢？

我们知道Hash可以实现高效的O(1)查找，想象一下假如我们有一个无限刻度的钟表，然后把要执行的任务按照间隔时间长短的顺序分配到这些刻度中，每当钟表移动一个刻度，即可以执行这个刻度中对应的任务，如下图所示：

![](https://img-blog.csdnimg.cn/412a02375baf4cea9cbaec5330442747.png)

这种算法叫做Simple Timing Wheel算法。

但是这种算法是理论上的算法，因为不可能为所有的间隔长度都分配对应的刻度。这样会耗费大量的无效内存空间。

所以我们可以做个折中方案，将间隔时间的长度先用hash进行处理。这样就可以缩短间隔时间的基数，如下图所示：

![](https://img-blog.csdnimg.cn/a844aefb374143e495729c44c9b252d4.png)

这个例子中，我们选择8作为基数，间隔时间除以8，余数作为hash的位置，商作为节点的值。

每次遍历轮询的时候，将节点的值减一。当节点的值为0的时候，就表示该节点可以取出执行了。

这种算法就叫做HashedWheelTimer。

netty提供了这种算法的实现：

```
public class HashedWheelTimer implements Timer 
```

HashedWheelTimer使用HashedWheelBucket数组来存储具体的TimerTask:

```
private final HashedWheelBucket[] wheel;
```

首先来看下创建wheel的方法：

```
    private static HashedWheelBucket[] createWheel(int ticksPerWheel) {
        //ticksPerWheel may not be greater than 2^30
        checkInRange(ticksPerWheel, 1, 1073741824, "ticksPerWheel");

        ticksPerWheel = normalizeTicksPerWheel(ticksPerWheel);
        HashedWheelBucket[] wheel = new HashedWheelBucket[ticksPerWheel];
        for (int i = 0; i < wheel.length; i ++) {
            wheel[i] = new HashedWheelBucket();
        }
        return wheel;
    }
```

我们可以自定义wheel中ticks的大小，但是ticksPerWheel不能超过2^30。

然后将ticksPerWheel的数值进行调整，到2的整数倍。

然后创建ticksPerWheel个元素的HashedWheelBucket数组。

这里要注意，虽然整体的wheel是一个hash结构，但是wheel中的每个元素，也就是HashedWheelBucket是一个链式结构。

HashedWheelBucket中的每个元素都是一个HashedWheelTimeout. HashedWheelTimeout中有一个remainingRounds属性用来记录这个Timeout元素还会在Bucket中保存多久。

```
long remainingRounds;
```

# 总结

netty中的HashedWheelTimer可以实现更高效的Timer功能，大家用起来吧。










