---
slug: /45-netty-ByteBuf-ByteBuffer
---

# 69. netty系列之:不用怀疑,netty中的ByteBuf就是比JAVA中的好用



# 简介

netty作为一个优秀的的NIO框架，被广泛应用于各种服务器和框架中。同样是NIO，netty所依赖的JDK在1.4版本中早就提供nio的包，既然JDK已经有了nio的包，为什么netty还要再写一个呢？

不是因为JDK不优秀，而是因为netty的要求有点高。

# ByteBuf和ByteBuffer的可扩展性

在讲解netty中的ByteBuf如何优秀之前，我们先来看一下netty中的ByteBuf和jdk中的ByteBuffer有什么关系。

事实上，没啥关系，只是名字长的有点像而已。

jdk中的ByteBuffer，全称是java.nio.ByteBuffer,属于JAVA nio包中的一个基础类。它的定义如下：

```
public abstract class ByteBuffer
    extends Buffer
    implements Comparable<ByteBuffer>
```

而netty中的ByteBuf，全称是io.netty.buffer,属于netty nio包中的一个基础类。它的定义如下：

```
public abstract class ByteBuf 
implements ReferenceCounted, Comparable<ByteBuf>
```

两者的定义都很类似，两者都是抽象类，都需要具体的类来实现他们。

但是，当你尝试去创建一个类来继承JDK的ByteBuffer，则会发现继承不了，为什么命名一个abstract的类会继承不了呢？

仔细研究会发现，在ByteBuffer中，定义了下面两个没有显示标记其作用域访问的方法：

```
    abstract byte _get(int i);                          // package-private
    abstract void _put(int i, byte b);                  // package-private
```

根据JDK的定义，没有显示标记作用域的方法，默认其访问访问是package，当这两个方法又都是abstract的，所以只有同一个package的类才能继承JDK的ByteBuffer。

当然，JDK本身有5个ByteBuffer的实现，他们分别是DirectByteBuffer,DirectByteBufferR,HeapByteBuffer,HeapByteBufferR和MappedByteBuffer。

但是JDK限制了用户自定义类对ByteBuffer的扩展。虽然这样可以保证ByteBuffer类在使用上的安全性，但是同时也现在了用户需求的多样性。

既然JDK的ByteBuffer不能扩展，那么很自然的netty中的ByteBuf跟它就没有任何关系了。

netty中的ByteBuff是参考了JDK的ByteBuffer，并且做了很多有意义的提升，让ByteBuff更加好用。

和JDK的ByteBuffer相比，netty中的ByteBuf并没有扩展的限制，你可以自由的对其进行扩展和修改。

# 不同的使用方法

JDK中的ByteBuffer和netty中的ByteBuff都提供了对各种类型数据的读写功能。

但是相对于netty中的ByteBuff, JDK中的ByteBuffer使用其来比较复杂，因为它定义了4个值来描述ByteBuffer中的数据和使用情况，这四个值分别是：mark,position,limit和capacity。

* capacity是它包含的元素数。 capacity永远不会为负且永远不会改变。
* limit是不应读取或写入的第一个元素的索引。 limit永远不会为负，也永远不会大于其容量。
* position是要读取或写入的下一个元素的索引。 position永远不会为负，也永远不会大于其限制。
* mark是调用 reset 方法时其位置将重置到的索引。 mark并不一定有值，但当它有值的时候，它永远不会是负的，也永远不会大于position。 

上面4个值的关系是：

```
0 <= mark <= position <= limit <= capacity
```

然后JDK还提供了3个处理上面4个标记的方法：

* clear : 将 limit设置为capacity，并将position设置为0,表示可以写入。
* flip :  将 limit设置为当前位置，并将position设置为0.表示可以读取。
* rewind : limit不变，将position设置为0,表示重新读取。

是不是头很大？

太多的变量，太多的方法，虽然现在你可能记得，但是过一段时间就会忘记到底该怎么正确使用JDK的ByteBuffer了。

和JDK不同的是，netty中的ByteBuff,只有两个index，分别是readerIndex 和 writerIndex 。

除了index之外，ByteBuff还提供了更加丰富的读写API，方便我们使用。

# 性能上的不同

对于JDK的java.nio.ByteBuffer来说，当我们为其分配空间的时候，buffer中会被使用0来填充。虽然这些0可能会马上被真正有意义的值来进行替换。但是不可否认，填充的过程消耗了CPU和内存。

另外JDK的java.nio.ByteBuffer是依赖于垃圾回收器来进行回收的，但是我们之前讲过了，ByteBuffer有两种内型，一种是HeapBuffer，这种类型是由JVM进行管理的，用垃圾回收器来进行回收是没有问题的。

但是问题在于还有一类ByteBuffer是DirectByteBuffer，这种Buffer是直接分配在外部内存上的，并不是由JVM来进行管理.通常来说DirectBuffer可能会存在较长的时间，如果短时间分配大量的短生命周期的DirectBuffer,会导致这些Buffer来不及回收，从而导致OutOfMemoryError.

另外使用API来回收DirectBuffer的速度也不是那么快。

相对而言，netty中的ByteBuf使用的是自己管理的引用计数。当ByteBuf的引用计数归零的时候，底层的内存空间就会被释放，或者返回到内存池中。

我们看一下netty中direct ByteBuff的使用：

```
ByteBufAllocator alloc = PooledByteBufAllocator.DEFAULT;
ByteBuf buf = alloc.directBuffer(1024);
...
buf.release(); // 回收directBuffer
```

当然，netty这种自己管理引用计数也有一些缺点，可能会在pooled buffer被垃圾回收之后，pool中的buffer才返回，从而导致内存泄露。

还好，netty提供了4种检测引用计数内存泄露的方法，分别是：

* DISABLED---禁用泄露检测
* SIMPLE --默认的检测方式，占用1% 的buff。
* ADVANCED - 也是1%的buff进行检测，不过这个选项会展示更多的泄露信息。
* PARANOID - 检测所有的buff。

具体的检测选项如下：

```
java -Dio.netty.leakDetection.level=advanced ...
```

# 总结

以上就是netty中优秀的ByteBuff和JDK中的对比。还不赶紧用起来。










