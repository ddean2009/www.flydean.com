java高级用法之:JNA中的Memory和Pointer

[toc]

# 简介

我们知道在native的代码中有很多指针，这些指针在JNA中被映射成为Pointer。除了Pointer之外，JNA还提供了更加强大的Memory类，本文将会一起探讨JNA中的Pointer和Memory的使用。

# Pointer

Pointer是JNA中引入的类，用来表示native方法中的指针。大家回想一下native方法中的指针到底是什么呢？

native方法中的指针实际上就是一个地址，这个地址就是真正对象的内存地址。所以在Pointer中定义了一个peer属性，用来存储真正对象的内存地址：

```
protected long peer;
```

实时上，Pointer的构造函数就需要传入这个peer参数：

```
public Pointer(long peer) {
        this.peer = peer;
    }
```

接下来我们看一下如何从Pointer中取出一个真正的对象，这里以byte数组为例：

```
    public void read(long offset, byte[] buf, int index, int length) {
        Native.read(this, this.peer, offset, buf, index, length);
    }
```

实际上这个方法调用了Native.read方法，我们继续看一下这个read方法：

```
static native void read(Pointer pointer, long baseaddr, long offset, byte[] buf, int index, int length);
```

可以看到它是一个真正的native方法，用来读取一个指针对象。

除了Byte数组之外，Pointer还提供了很多其他类型的读取方法。

又读取就有写入，我们再看下Pointer是怎么写入数据的：

```
    public void write(long offset, byte[] buf, int index, int length) {
        Native.write(this, this.peer, offset, buf, index, length);
    }
```

同样的，还是调用 Native.write方法来写入数据。

这里Native.write方法也是一个native方法：

```
static native void write(Pointer pointer, long baseaddr, long offset, byte[] buf, int index, int length);
```

Pointer还提供了很多其他类型数据的写入方法。

当然还有更加直接的get*方法：

```
public byte getByte(long offset) {
        return Native.getByte(this, this.peer, offset);
    }
```

## 特殊的Pointer:Opaque

在Pointer中，还有两个createConstant方法，用来创建不可读也不可写的Pointer：

```
    public static final Pointer createConstant(long peer) {
        return new Opaque(peer);
    }

    public static final Pointer createConstant(int peer) {
        return new Opaque((long)peer & 0xFFFFFFFF);
    }
```

实际上返回的而是Opaque类，这个类继承自Pointer，但是它里面的所有read或者write方法，都会抛出UnsupportedOperationException：

```
    private static class Opaque extends Pointer {
        private Opaque(long peer) { super(peer); }
        @Override
        public Pointer share(long offset, long size) {
            throw new UnsupportedOperationException(MSG);
        }
```

# Memory

Pointer是基本的指针映射，如果对于通过使用native的malloc方法分配的内存空间而言，除了Pointer指针的开始位置之外，我们还需要知道分配的空间大小。所以一个简单的Pointer是不够用了。

这种情况下，我们就需要使用Memory。

Memory是一种特殊的Pointer, 它保存了分配出来的空间大小。我们来看一下Memory的定义和它里面包含的属性：

```
public class Memory extends Pointer {
...
    private static ReferenceQueue<Memory> QUEUE = new ReferenceQueue<Memory>();
    private static LinkedReference HEAD; // the head of the doubly linked list used for instance tracking
    private static final WeakMemoryHolder buffers = new WeakMemoryHolder();
    private final LinkedReference reference; // used to track the instance
    protected long size; // Size of the malloc'ed space
...
}
```

Memory里面定义了5个数据，我们接下来一一进行介绍。

首先是最为重要的size，size表示的是Memory中内存空间的大小，我们来看下Memory的构造函数：

```
    public Memory(long size) {
        this.size = size;
        if (size <= 0) {
            throw new IllegalArgumentException("Allocation size must be greater than zero");
        }
        peer = malloc(size);
        if (peer == 0)
            throw new OutOfMemoryError("Cannot allocate " + size + " bytes");

        reference = LinkedReference.track(this);
    }
```

可以看到Memory类型的数据需要传入一个size参数，表示Memory占用的空间大小。当然，这个size必须要大于0.

然后调用native方法的malloc方法来分配一个内存空间，返回的peer保存的是内存空间的开始地址。如果peer==0，表示分配失败。

如果分配成功，则将当前Memory保存到LinkedReference中，用来跟踪当前的位置。

我们可以看到Memory中有两个LinkedReference，一个是HEAD，一个是reference。

LinkedReference本身是一个WeakReference，weekReference引用的对象只要垃圾回收执行，就会被回收，而不管是否内存不足。

```
private static class LinkedReference extends WeakReference<Memory>
```

我们看一下LinkedReference的构造函数：

```
private LinkedReference(Memory referent) {
            super(referent, QUEUE);
        }
```

这个QUEUE是ReferenceQueue，表示的是GC待回收的对象列表。

我们看到Memory的构造函数除了设置size之外，还调用了：

```
reference = LinkedReference.track(this);
```

仔细看LinkedReference.track方法：

```
   static LinkedReference track(Memory instance) {
            // use a different lock here to allow the finialzier to unlink elements too
            synchronized (QUEUE) {
                LinkedReference stale;

                // handle stale references here to avoid GC overheating when memory is limited
                while ((stale = (LinkedReference) QUEUE.poll()) != null) {
                    stale.unlink();
                }
            }

            // keep object allocation outside the syncronized block
            LinkedReference entry = new LinkedReference(instance);

            synchronized (LinkedReference.class) {
                if (HEAD != null) {
                    entry.next = HEAD;
                    HEAD = HEAD.prev = entry;
                } else {
                    HEAD = entry;
                }
            }

            return entry;
        }
```

这个方法的意思是首先从QUEUE中拿出那些准备被垃圾回收的Memory对象，然后将其从LinkedReference中unlink。 最后将新创建的对象加入到LinkedReference中。

因为Memory中的QUEUE和HEAD都是类变量，所以这个LinkedReference保存的是JVM中所有的Memory对象。

最后Memory中也提供了对应的read和write方法，但是Memory中的方法和Pointer不同，Memory中的方法多了一个boundsCheck,如下所示：

```
    public void read(long bOff, byte[] buf, int index, int length) {
        boundsCheck(bOff, length * 1L);
        super.read(bOff, buf, index, length);
    }

    public void write(long bOff, byte[] buf, int index, int length) {
        boundsCheck(bOff, length * 1L);
        super.write(bOff, buf, index, length);
    }
```

为什么会有boundsCheck呢？这是因为Memory和Pointer不同，Memory中有一个size的属性，用来存储分配的内存大小。使用boundsCheck就是来判断访问的地址是否出界，用来保证程序的安全。

# 总结

Pointer和Memory算是JNA中的高级功能，大家如果想要和native的alloc方法进行映射的话，就要考虑使用了。












