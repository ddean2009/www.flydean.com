---
slug: /47-netty-Thread-local-object-pool
---

# 71. netty系列之:可能有人听过ThreadLocal,但一定没人听过ThreadLocal对象池



# 简介

JDK中的Thread大家肯定用过，只要是用过异步编程的同学肯定都熟悉。为了保存Thread中特有的变量，JDK引入了ThreadLocal类来专门对Thread的本地变量进行管理。

# ThreadLocal

很多新人可能不明白ThreadLocal到底是什么，它和Thread到底有什么关系。

其实很简单，ThreadLocal本质上是一个key，它的value就是Thread中一个map中存储的值。

每个Thread中都有一个Map, 这个Map的类型是ThreadLocal.ThreadLocalMap。我们先不具体讨论这个ThreadLocalMap到底是怎么实现的。现在就简单将其看做是一个map即可。

接下来，我们看下一个ThreadLocal的工作流程。

首先来看一下ThreadLocal的使用例子：

```
   public class ThreadId {
       // 一个线程ID的自增器
       private static final AtomicInteger nextId = new AtomicInteger(0);
  
       // 为每个Thread分配一个线程
       private static final ThreadLocal<Integer> threadId =
           new ThreadLocal<Integer>() {
               @Override protected Integer initialValue() {
                   return nextId.getAndIncrement();
           }
       };
  
       // 返回当前线程的ID
       public static int get() {
           return threadId.get();
       }
   }
```

上面的类是做什么用的呢？

当你在不同的线程环境中调用ThreadId的get方法时候，会返回不同的int值。所以可以看做是ThreadId为每个线程生成了一个线程ID。

我们来看下它是怎么工作的。

首先我们调用了ThreadLocal<Integer>的get方法。ThreadLocal中的get方法定义如下：

```
    public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T)e.value;
                return result;
            }
        }
        return setInitialValue();
    }
```

get方法中，我们第一步获取当前的线程Thread，然后getMap返回当前Thread中的ThreadLocalMap对象。

如果Map不为空，则取出以当前ThreadLocal为key对应的值。

如果Map为空，则调用初始化方法：

```
    private T setInitialValue() {
        T value = initialValue();
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
        return value;
    }
```

初始化方法首先判断当前Thread中的ThreadLocalMap是否为空，如果不为空则设置初始化的值。

如果为空则创建新的Map:

```
    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
```

大家可以看到整个ThreadLocalMap中的Key就是ThreadLocal本身，而Value就是ThreadLocal中定义的泛型的值。

现在我们来总结一下ThreadLocal到底是做什么的。

每个Thread中都有一个ThreadLocal.ThreadLocalMap的Map对象，我们希望向这个Map中存放一些特定的值，通过一个特定的对象来访问到存放在Thread中的这个值，这样的对象就是ThreadLocal。

通过ThreadLocal的get方法，就可以返回绑定到不同Thread对象中的值。

# ThreadLocalMap

上面我们简单的将ThreadLocalMap看做是一个map。事实上ThreadLocalMap是一个对象，它里面存放的每个值都是一个Entry.

这个Entry不同于Map中的Entry，它是一个static的内部类：

```
        static class Entry extends WeakReference<ThreadLocal<?>> {
            /** The value associated with this ThreadLocal. */
            Object value;

            Entry(ThreadLocal<?> k, Object v) {
                super(k);
                value = v;
            }
        }
```

注意，这里的Entry继承自WeakReference，表示这个Entry的key是弱引用对象，如果key没有强引用的情况下，会在gc中被回收。从而保证了Map中数据的有效性。

ThreadLocalMap中的值都存放在Entry数组中：

```
private Entry[] table;
```

我们看一下怎么从ThreadLocalMap中get一个值的：

```
        private Entry getEntry(ThreadLocal<?> key) {
            int i = key.threadLocalHashCode & (table.length - 1);
            Entry e = table[i];
            if (e != null && e.get() == key)
                return e;
            else
                return getEntryAfterMiss(key, i, e);
        }
```

key.threadLocalHashCode 可以简单的看做是ThreadLocal代表的key的值。

而 key.threadLocalHashCode & (table.length - 1) 则使用来计算当前key在table中的index。

这里使用的是位运算，用来提升计算速度。实际上这个计算等同于：

```
key.threadLocalHashCode % table.length
```

是一个取模运算。

如果按照取模运算的index去查找，找到就直接返回。

如果没找到则会遍历调用nextIndex方法，修改index的值，只到查找完毕为止：

```
        private Entry getEntryAfterMiss(ThreadLocal<?> key, int i, Entry e) {
            Entry[] tab = table;
            int len = tab.length;

            while (e != null) {
                ThreadLocal<?> k = e.get();
                if (k == key)
                    return e;
                if (k == null)
                    expungeStaleEntry(i);
                else
                    i = nextIndex(i, len);
                e = tab[i];
            }
            return null;
        }
```

# Recycler

ThreadLocal本质上是将ThreadLocal这个对象和不同的Thread进行绑定，通过ThreadLocal的get方法可以获得存储在不同Thread中的值。

归根结底，ThreadLocal和Thread是一对多的关系。因为ThreadLocal在ThreadLocalMap中是弱引用，所以当ThreadLocal被置为空之后，对应的ThreadLocalMap中的对象会在下一个垃圾回收过程中被回收,从而为Thread中的ThreadLocalMap节省一个空间。

那么当我们的Thread是一个长时间运行的Thread的时候，如果在这个Thread中分配了很多生命周期很短的对象，那么会生成很多待回收的垃圾对象，给垃圾回收器造成压力。

为了解决这个问题，netty为我们提供了Recycler类，用来回收这些短生命周期的对象。接下来，我们来探究一下Recycler到底是怎么工作的。

在这之前，我们先看下怎么使用Recycler。

```
public class MyObject {

  private static final Recycler<MyObject> RECYCLER = new Recycler<MyObject>() {
    protected MyObject newObject(Recycler.Handle<MyObject> handle) {
      return new MyObject(handle);
    }
  }

  public static MyObject newInstance(int a, String b) {
    MyObject obj = RECYCLER.get();
    obj.myFieldA = a;
    obj.myFieldB = b;
    return obj;
  }
    
  private final Recycler.Handle<MyObject> handle;
  private int myFieldA;
  private String myFieldB;

  private MyObject(Handle<MyObject> handle) {
    this.handle = handle;
  }
  
  public boolean recycle() {
    myFieldA = 0;
    myFieldB = null;
    return handle.recycle(this);
  }
}

MyObject obj = MyObject.newInstance(42, "foo");
...
obj.recycle();

```

本质上，Recycler就像是一个工厂类，通过它的get方法来生成对应的类对象。当这个对象需要被回收的时候，调用Recycler.Handle中的recycle方法，即可将对象回收。

先看一下生成对象的get方法：

```
    public final T get() {
        if (maxCapacityPerThread == 0) {
            return newObject((Handle<T>) NOOP_HANDLE);
        }
        Stack<T> stack = threadLocal.get();
        DefaultHandle<T> handle = stack.pop();
        if (handle == null) {
            handle = stack.newHandle();
            handle.value = newObject(handle);
        }
        return (T) handle.value;
    }
```

上面代码的含义就是，先判断是否超过了单个线程允许的最大容量，如果是，则返回一个新的对象，绑定一个空的handler，表示这个新创建的对象是不可以被回收的。

如果不是，则从threadLocal中拿到当前线程绑定的Stack。然后从Stack中取出最上面的元素，如果Stack中没有对象，则创建新的对象，并绑定handle。

最后返回handle绑定的对象。

再看一下handle的回收对象方法recycle:

```
        public void recycle(Object object) {
            if (object != value) {
                throw new IllegalArgumentException("object does not belong to handle");
            }

            Stack<?> stack = this.stack;
            if (lastRecycledId != recycleId || stack == null) {
                throw new IllegalStateException("recycled already");
            }

            stack.push(this);
        }
```

上面的代码先去判断和handle绑定的对象是不是要回收的对象。只有相等的时候才进行回收。

而回收的本质就是将对象push到stack中，供后续get的时候取出使用。

所以，Recycler能够节约垃圾回收对象个数的原因是，它会将不再使用的对象存储到Stack中，并在下次get的时候返回，重复使用。这也就是我们在回收需要重置对象属性的原因：

```
  public boolean recycle() {
    myFieldA = 0;
    myFieldB = null;
    return handle.recycle(this);
  }
```

# 总结

如果你在一个线程中会有多个同类型的短生命周期对象，那么不妨试试Recycle吧。









