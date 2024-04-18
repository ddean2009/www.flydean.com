---
slug: /002-java-thread-concurrent
---

# java并发高级面试题(一)

提到多线程，当然要熟悉java提供的各种多线程相关的并发包了，而java.util.concurrent就是最最经常会使用到的，那么关于concurrent的面试题目有哪些呢？一起来看看吧。

### 问题1：什么是ConcurrentHashMap？它与HashMap的区别是什么？

**回答：** ConcurrentHashMap是java.util.concurrent包中的一个线程安全的哈希表实现。与普通的HashMap相比，ConcurrentHashMap在多线程环境下提供更好的性能和线程安全保障。

区别：

- ConcurrentHashMap支持并发读写操作，而HashMap在多线程环境下需要额外的同步措施。

- ConcurrentHashMap的put、remove等操作使用分段锁，只锁定部分数据，从而提高并发度。

- ConcurrentHashMap允许多个线程同时进行读操作，而HashMap在读写冲突时需要互斥。

**示例：**
```
import java.util.concurrent.ConcurrentHashMap;

public class ConcurrentHashMapExample {
    public static void main(String[] args) {
        ConcurrentHashMap<Integer, String> concurrentMap = new ConcurrentHashMap<>();
        
        concurrentMap.put(1, "One");
        concurrentMap.put(2, "Two");
        concurrentMap.put(3, "Three");
        
        String value = concurrentMap.get(2);
        System.out.println("Value at key 2: " + value);
    }
}
```

### 问题2：什么是CopyOnWriteArrayList？它适用于什么样的场景？

**回答：** CopyOnWriteArrayList是java.util.concurrent包中的一个线程安全的动态数组实现。它适用于读多写少的场景，即在读操作远远多于写操作的情况下，使用CopyOnWriteArrayList可以避免读写冲突。

CopyOnWriteArrayList在写操作时会创建一个新的数组，复制旧数组中的数据，并添加新的元素，然后将新数组替换旧数组。因此，写操作不会影响读操作，读操作也不会影响写操作。

**示例：**
```
import java.util.concurrent.CopyOnWriteArrayList;

public class CopyOnWriteArrayListExample {
    public static void main(String[] args) {
        CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
        
        list.add("One");
        list.add("Two");
        list.add("Three");
        
        for (String item : list) {
            System.out.println(item);
        }
    }
}
```

### 问题3：什么是BlockingQueue？它的作用是什么？举例说明一个使用场景。

**回答：** BlockingQueue是java.util.concurrent包中的一个接口，表示一个支持阻塞的队列。它的主要作用是实现线程间的数据传递和协作。

BlockingQueue可以用于解耦生产者和消费者，让生产者和消费者线程在不同的速度进行操作。当队列为空时，消费者线程会阻塞等待，直到队列中有数据；当队列满时，生产者线程会阻塞等待，直到队列有空间。

**示例：**
```
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class BlockingQueueExample {
    public static void main(String[] args) {
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);
        
        Thread producer = new Thread(() -> {
            try {
                queue.put("Item 1");
                queue.put("Item 2");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        Thread consumer = new Thread(() -> {
            try {
                String item1 = queue.take();
                String item2 = queue.take();
                System.out.println("Consumed: " + item1 + ", " + item2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        producer.start();
        consumer.start();
    }
}
```

### 问题4：什么是Semaphore？它如何控制并发访问？

**回答：** Semaphore是java.util.concurrent包中的一个计数信号量。它可以用来控制同时访问某个资源的线程数量，从而实现对并发访问的控制。

Semaphore通过调用acquire()来获取一个许可证，表示可以访问资源，通过调用release()来释放一个许可证，表示释放资源。Semaphore的内部计数器可以控制同时获取许可证的线程数量。

**示例：**
```
import java.util.concurrent.Semaphore;

public class SemaphoreExample {
    public static void main(String[] args) {
        Semaphore semaphore = new Semaphore(2); // 允许两个线程同时访问
        
        Thread thread1 = new Thread(() -> {
            try {
                semaphore.acquire();
                System.out.println("Thread 1 acquired a permit.");
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                semaphore.release();
                System.out.println("Thread 1 released a permit.");
            }
        });

        Thread thread2 = new Thread(() -> {
            try {
                semaphore.acquire();
                System.out.println("Thread 2 acquired a permit.");
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                semaphore.release();
                System.out.println("Thread 2 released a permit.");
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

### 问题5：什么是CountDownLatch？它适用于什么场景？

**回答：** CountDownLatch是java.util.concurrent包中的一个计数器，用于控制线程等待其他线程完成一组操作。它适用于一个线程需要等待其他多个线程完成某个任务后再继续执行的场景。

CountDownLatch的内部计数器可以初始化为一个正整数，每个线程完成一个操作后，调用countDown()方法来减少计数器的

值。当计数器减为0时，等待的线程将被释放。

**示例：**
```
import java.util.concurrent.CountDownLatch;

public class CountDownLatchExample {
    public static void main(String[] args) {
        CountDownLatch latch = new CountDownLatch(3); // 需要等待3个线程完成
        
        Thread worker1 = new Thread(() -> {
            System.out.println("Worker 1 is working...");
            latch.countDown();
        });

        Thread worker2 = new Thread(() -> {
            System.out.println("Worker 2 is working...");
            latch.countDown();
        });

        Thread worker3 = new Thread(() -> {
            System.out.println("Worker 3 is working...");
            latch.countDown();
        });

        worker1.start();
        worker2.start();
        worker3.start();

        try {
            latch.await(); // 等待所有工作线程完成
            System.out.println("All workers have completed.");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

### 问题6：什么是CyclicBarrier？它适用于什么场景？

**回答：** CyclicBarrier是java.util.concurrent包中的一个同步工具，用于等待一组线程都达到某个状态后再继续执行。它适用于需要多个线程协同工作的场景，比如将多个子任务的计算结果合并。

CyclicBarrier的内部计数器初始化为一个正整数，每个线程到达屏障时，调用await()方法来等待其他线程，当所有线程都到达时，屏障打开，所有线程继续执行。

**示例：**
```
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

public class CyclicBarrierExample {
    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(3); // 需要3个线程都到达屏障
        
        Thread thread1 = new Thread(() -> {
            System.out.println("Thread 1 is waiting at the barrier.");
            try {
                barrier.await();
                System.out.println("Thread 1 has passed the barrier.");
            } catch (InterruptedException | BrokenBarrierException e) {
                e.printStackTrace();
            }
        });

        Thread thread2 = new Thread(() -> {
            System.out.println("Thread 2 is waiting at the barrier.");
            try {
                barrier.await();
                System.out.println("Thread 2 has passed the barrier.");
            } catch (InterruptedException | BrokenBarrierException e) {
                e.printStackTrace();
            }
        });

        Thread thread3 = new Thread(() -> {
            System.out.println("Thread 3 is waiting at the barrier.");
            try {
                barrier.await();
                System.out.println("Thread 3 has passed the barrier.");
            } catch (InterruptedException | BrokenBarrierException e) {
                e.printStackTrace();
            }
        });

        thread1.start();
        thread2.start();
        thread3.start();
    }
}
```

### 问题7：什么是Semaphore？它的作用是什么？

**回答：** Semaphore是java.util.concurrent包中的一个计数信号量。它可以用来控制同时访问某个资源的线程数量，从而实现对并发访问的控制。

Semaphore通过调用acquire()来获取一个许可证，表示可以访问资源，通过调用release()来释放一个许可证，表示释放资源。Semaphore的内部计数器可以控制同时获取许可证的线程数量。

**示例：**
```
import java.util.concurrent.Semaphore;

public class SemaphoreExample {
    public static void main(String[] args) {
        Semaphore semaphore = new Semaphore(2); // 允许两个线程同时访问
        
        Thread thread1 = new Thread(() -> {
            try {
                semaphore.acquire();
                System.out.println("Thread 1 acquired a permit.");
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                semaphore.release();
                System.out.println("Thread 1 released a permit.");
            }
        });

        Thread thread2 = new Thread(() -> {
            try {
                semaphore.acquire();
                System.out.println("Thread 2 acquired a permit.");
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                semaphore.release();
                System.out.println("Thread 2 released a permit.");
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

### 问题8：什么是Future和FutureTask？它们有什么作用？

**回答：** Future是java.util.concurrent包中的一个接口，表示一个异步计算的结果。FutureTask是Future的一个实现类，用于将一个Callable任务包装为一个异步计算。

通过Future，可以提交一个任务给线程池或其他并发框架执行，并在未来的某个时刻获取任务的计算结果。

**示例：**
```
import java.util.concurrent.*;

public class FutureExample {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        
        Future<Integer> future = executor.submit(() -> {
            Thread.sleep(2000);
            return 42;
        });

        System.out.println("Waiting for the result...");
        try {
            Integer result = future.get();
            System.out.println("Result: " + result);
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        executor.shutdown();
    }
}
```

### 问题9：什么是Executor框架？如何使用它来管理线程池？

**回答：** Executor框架是java.util.concurrent包中的一个框架，用于简化线程的管理和使用。它提供了一组接口和类来创建、管理和控制线程池，以及执行异步任务。

可以通过Executors类提供的工厂方法来创建不同类型的线程池，如newFixedThreadPool()、newCachedThreadPool()和newScheduledThreadPool()等。

**示例：**
```
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ExecutorFrameworkExample {
    public static void main(String[] args) {
        ExecutorService executor = Executors.newFixedThreadPool(3); // 创建一个固定大小的线程池
        
        for (int i = 0; i < 10; i++) {
            final int taskNum = i;
            executor.execute(() -> {
                System.out.println("Executing task " + taskNum);
            });
        }
        
        executor.shutdown();
    }
}
```

### 问题10：什么是ScheduledExecutorService？它用于什么场景？

**回答：** ScheduledExecutorService是java.util.concurrent包中的一个接口，它扩展了ExecutorService接口，提供了一些用于调度定时任务的方法。它适用于需要在未来某个时间点执行任务，或以固定的时间间隔重复执行任务的场景。

通过ScheduledExecutorService，可以创建周期性任务，如定时任务、心跳任务等。

**示例：**
```
import java.util.concurrent.Executors;
import java.util.concurrent.Scheduled

ExecutorService;
import java.util.concurrent.TimeUnit;

public class ScheduledExecutorServiceExample {
    public static void main(String[] args) {
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1); // 创建一个定时任务的线程池
        
        Runnable task = () -> System.out.println("Scheduled task executed.");
        
        // 延迟1秒后执行任务
        executor.schedule(task, 1, TimeUnit.SECONDS);
        
        // 延迟2秒后，每隔3秒重复执行任务
        executor.scheduleAtFixedRate(task, 2, 3, TimeUnit.SECONDS);
        
        // executor.shutdown();
    }
}
```

### 问题11：什么是ThreadLocal？它的作用是什么？有何注意事项？

**回答：** ThreadLocal是java.lang包中的一个类，用于在每个线程中创建独立的变量副本。每个线程可以通过ThreadLocal获取自己独立的变量副本，从而避免了线程间的共享和竞争。

ThreadLocal的主要作用是在多线程环境下为每个线程提供独立的状态，常见的使用场景包括线程池中的线程、Web应用中的用户会话等。

**注意事项：** 

- ThreadLocal使用后要确保调用remove()方法来清除变量，以防止内存泄漏。

- 谨慎使用ThreadLocal，过多的使用可能会导致难以调试的问题。

**示例：**
```
public class ThreadLocalExample {
    private static ThreadLocal<Integer> threadLocal = ThreadLocal.withInitial(() -> 0);

    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            threadLocal.set(1);
            System.out.println("Thread 1: " + threadLocal.get());
        });

        Thread thread2 = new Thread(() -> {
            threadLocal.set(2);
            System.out.println("Thread 2: " + threadLocal.get());
        });

        thread1.start();
        thread2.start();
    }
}
```

### 问题12：什么是原子操作？Atomic类提供了哪些原子操作？

**回答：** 原子操作是不可被中断的操作，要么全部执行完成，要么完全不执行，不会存在部分执行的情况。java.util.concurrent.atomic包中提供了一系列Atomic类，用于执行原子操作，保证多线程环境下的线程安全性。

一些常见的Atomic类及其原子操作包括：

- AtomicInteger：整型原子操作，如addAndGet()、incrementAndGet()等。

- AtomicLong：长整型原子操作，类似于AtomicInteger。

- AtomicBoolean：布尔型原子操作，如compareAndSet()等。

- AtomicReference：引用类型原子操作，如compareAndSet()等。

**示例：**
```
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicIntegerExample {
    private static AtomicInteger counter = new AtomicInteger(0);

    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                counter.incrementAndGet();
            }
        });

        Thread thread2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                counter.incrementAndGet();
            }
        });

        thread1.start();
        thread2.start();

        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Counter value: " + counter.get());
    }
}
```

### 问题13：什么是Lock接口？它与synchronized关键字的区别是什么？

**回答：** Lock接口是java.util.concurrent.locks包中的一个接口，用于提供比synchronized更细粒度的锁机制。与synchronized相比，Lock接口提供了更多的功能，如可中断锁、可轮询锁、定时锁等。

区别：

- Lock接口可以显示地获取和释放锁，而synchronized是隐式的，由JVM自动管理。

- Lock接口提供了更多的灵活性和功能，如可重入锁、公平锁等。

**示例：**
```
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class LockExample {
    private static Lock lock = new ReentrantLock();

    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            lock.lock();
            try {
                System.out.println("Thread 1: Lock acquired.");
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                lock.unlock();
                System.out.println("Thread 1: Lock released.");
            }
        });

        Thread thread2 = new Thread(() -> {
            lock.lock();
            try {
                System.out.println("Thread 2: Lock acquired.");
            } finally {
                lock.unlock();
                System.out.println("Thread 2: Lock released.");
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

### 问题14：什么是ReadWriteLock？它如何在读写操作上提供更好的性能？

**回答：** ReadWriteLock是java.util.concurrent.locks包中的一个接口，它提供了一种读写分离的锁机制。与普通的锁不同，ReadWriteLock允许多个线程同时进行读操作，但只允许一个线程进行写操作。

在读多写少的场景下，使用ReadWriteLock可以提供更好的性能，因为多个线程可以同时读取数据，不需要互斥。只有在有写操作时，才需要互斥。

**示例：**
```
import java.util.concurrent.locks

.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadWriteLockExample {
    private static ReadWriteLock readWriteLock = new ReentrantReadWriteLock();
    private static int value = 0;

    public static void main(String[] args) {
        Thread reader1 = new Thread(() -> {
            readWriteLock.readLock().lock();
            try {
                System.out.println("Reader 1: Value is " + value);
            } finally {
                readWriteLock.readLock().unlock();
            }
        });

        Thread reader2 = new Thread(() -> {
            readWriteLock.readLock().lock();
            try {
                System.out.println("Reader 2: Value is " + value);
            } finally {
                readWriteLock.readLock().unlock();
            }
        });

        Thread writer = new Thread(() -> {
            readWriteLock.writeLock().lock();
            try {
                value = 42;
                System.out.println("Writer: Value set to " + value);
            } finally {
                readWriteLock.writeLock().unlock();
            }
        });

        reader1.start();
        reader2.start();
        writer.start();
    }
}
```

### 问题15：什么是Exchanger？它的作用是什么？

**回答：** Exchanger是java.util.concurrent包中的一个同步工具，用于两个线程之间交换数据。一个线程调用exchange()方法将数据传递给另一个线程，当两个线程都到达交换点时，数据交换完成。

Exchanger可以用于解决生产者-消费者问题，或者任何需要两个线程之间传递数据的场景。

**示例：**
```
import java.util.concurrent.Exchanger;

public class ExchangerExample {
    public static void main(String[] args) {
        Exchanger<String> exchanger = new Exchanger<>();
        
        Thread thread1 = new Thread(() -> {
            try {
                String data = "Hello from Thread 1";
                System.out.println("Thread 1 sending: " + data);
                String receivedData = exchanger.exchange(data);
                System.out.println("Thread 1 received: " + receivedData);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        Thread thread2 = new Thread(() -> {
            try {
                String data = "Hello from Thread 2";
                System.out.println("Thread 2 sending: " + data);
                String receivedData = exchanger.exchange(data);
                System.out.println("Thread 2 received: " + receivedData);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

### 问题16：什么是Semaphore？它的作用是什么？

**回答：** Semaphore是java.util.concurrent包中的一个计数信号量，用于控制同时访问某个资源的线程数量。它适用于限制同时访问某一资源的线程数量，从而避免过多的并发访问。

Semaphore通过调用acquire()来获取许可证，表示可以访问资源，通过调用release()来释放许可证，表示释放资源。Semaphore的内部计数器可以控制同时获取许可证的线程数量。

**示例：**
```
import java.util.concurrent.Semaphore;

public class SemaphoreExample {
    public static void main(String[] args) {
        Semaphore semaphore = new Semaphore(2); // 允许两个线程同时访问
        
        Thread thread1 = new Thread(() -> {
            try {
                semaphore.acquire();
                System.out.println("Thread 1 acquired a permit.");
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                semaphore.release();
                System.out.println("Thread 1 released a permit.");
            }
        });

        Thread thread2 = new Thread(() -> {
            try {
                semaphore.acquire();
                System.out.println("Thread 2 acquired a permit.");
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                semaphore.release();
                System.out.println("Thread 2 released a permit.");
            }
        });

        thread1.start();
        thread2.start();
    }
}
```

### 问题17：什么是BlockingQueue？它的作用是什么？举例说明一个使用场景。

**回答：** BlockingQueue是java.util.concurrent包中的一个接口，表示一个支持阻塞的队列。它的主要作用是实现线程间的数据传递和协作，特别适用于解决生产者-消费者问题。

BlockingQueue可以在队列为空时阻塞等待元素的到来，或在队列已满时阻塞等待队列有空间。它提供了一种简单的方式来实现多个线程之间的数据交换。

**示例：**
```
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class BlockingQueueExample {
    public static void main(String[] args) {
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);
        
        Thread producer = new Thread(() -> {
            try {
                queue.put("Item 1");
                queue.put("Item 2");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        Thread consumer = new Thread(() -> {
            try {
                String item1 = queue.take();
                String item2 = queue.take();
                System.out.println("Consumed: " + item1 + ", " + item2);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });

        producer.start();
        consumer.start();
    }
}
```

### 问题18：什么是CompletableFuture？它的作用是什么？举例说明一个使用场景。

**回答：** CompletableFuture是java.util.concurrent包中的一个类，用于支持异步编程和函数式编程风格。它可以用于串行和并行地执行异步任务，并在任务完成后执行一些操作。

CompletableFuture的作用包括：

- 异步执行任务，提高程序的响应性。

- 支持函数式编程风格，可以链式地定义一系列操作。

- 支持任务的组合、聚合等复杂操作。

**示例：**
```
import java.util.concurrent.CompletableFuture;

public class CompletableFutureExample {
    public static void main(String[] args) {
        CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
            System.out.println("Executing task asynchronously...");
            return 42;
        });

        future.thenAccept(result -> {
            System.out.println("Result: " + result);
        });

        // 等待任务完成
        future.join();
    }
}
```

