---
slug: /02-netty-bytebuf
---

# 2. netty系列之:netty中的ByteBuf详解



# 简介

netty中用于进行信息承载和交流的类叫做ByteBuf，从名字可以看出这是Byte的缓存区，那么ByteBuf都有哪些特性呢？一起来看看。

# ByteBuf详解

netty提供了一个io.netty.buffer的包，该包里面定义了各种类型的ByteBuf和其衍生的类型。

netty Buffer的基础是ByteBuf类，这是一个抽象类，其他的Buffer类基本上都是由该类衍生而得的，这个类也定义了netty整体Buffer的基调。

先来看下ByteBuf的定义：

```
public abstract class ByteBuf implements ReferenceCounted, Comparable<ByteBuf> {
```

ByteBuf实现了两个接口，分别是ReferenceCounted和Comparable。Comparable是JDK自带的接口，表示该类之间是可以进行比较的。而ReferenceCounted表示的是对象的引用统计。当一个ReferenceCounted被实例化之后，其引用count=1，每次调用retain() 方法，就会增加count，调用release() 方法又会减少count。当count减为0之后，对象将会被释放，如果试图访问被释放过后的对象，则会报访问异常。

如果一个对象实现了ReferenceCounted，并且这个对象里面包含的其他对象也实现了ReferenceCounted，那么当容器对象的count=0的时候，其内部的其他对象也会被调用release()方法进行释放。

综上，ByteBuf是一个可以比较的，可以计算引用次数的对象。他提供了序列或者随机的byte访问机制。

> 注意的是，虽然JDK中有自带的ByteBuffer类，但是netty中的 ByteBuf 算是对Byte Buffer的重新实现。他们没有关联关系。

## 创建一个Buff

ByteBuf是一个抽象类，并不能直接用来实例化，虽然可以使用ByteBuf的子类进行实例化操作，但是netty并不推荐。netty推荐使用io.netty.buffer.Unpooled来进行Buff的创建工作。Unpooled是一个工具类，可以为ByteBuf分配空间、拷贝或者封装操作。

下面是创建几个不同ByteBuf的例子：

```
   import static io.netty.buffer.Unpooled.*;
  
   ByteBuf heapBuffer    = buffer(128);
   ByteBuf directBuffer  = directBuffer(256);
   ByteBuf wrappedBuffer = wrappedBuffer(new byte[128], new byte[256]);
   ByteBuf copiedBuffer  = copiedBuffer(ByteBuffer.allocate(128));

```

上面我们看到了4种不同的buff构建方式，普通的buff、directBuffer、wrappedBuffer和copiedBuffer。

普通的buff是固定大小的堆buff，而directBuffer是固定大小的direct buff。direct buff使用的是堆外内存，省去了数据到内核的拷贝，因此效率比普通的buff要高。

wrappedBuffer是对现有的byte arrays或者byte buffers的封装，可以看做是一个视图，当底层的数据发生变化的时候，Wrapped buffer中的数据也会发生变化。

Copied buffer是对现有的byte arrays、byte buffers 或者 string的深拷贝，所以它和wrappedBuffer是不同的，Copied buffer和原数据之间并不共享数据。

## 随机访问Buff

熟悉集合的朋友应该都知道，要想随机访问某个集合，一定是通过index来访问的，ByteBuf也一样，可以通过capacity或得其容量，然后通过getByte方法随机访问其中的byte，如下所示：

```
        //随机访问
        ByteBuf buffer = heapBuffer;
        for (int i = 0; i < buffer.capacity(); i ++) {
            byte b = buffer.getByte(i);
            System.out.println((char) b);
        }

```

## 序列读写

读写要比访问复杂一点，ByteBuf 提供了两个index用来定位读和写的位置，分别是readerIndex 和 writerIndex ，两个index分别控制读和写的位置。

下图显示的一个buffer被分成了三部分，分别是可废弃的bytes、可读的bytes和可写的bytes。

        +-------------------+------------------+------------------+
        | discardable bytes |  readable bytes  |  writable bytes  |
        |                   |     (CONTENT)    |                  |
        +-------------------+------------------+------------------+
        |                   |                  |                  |
        0      <=      readerIndex   <=   writerIndex    <=    capacity

上图还表明了readerIndex、writerIndex和capacity的大小关系。

其中readable bytes是真正的内容，可以通过调用read* 或者skip* 的方法来进行访问或者跳过，调用这些方法的时候，readerIndex会同步增加，如果超出了readable bytes的范围，则会抛出IndexOutOfBoundsException。默认情况下readerIndex=0。 

下面是一个遍历readable bytes的例子：

```
        //遍历readable bytes
        while (directBuffer.isReadable()) {
            System.out.println(directBuffer.readByte());
        }
```

首先通过判断是否是readable来决定是否调用readByte方法。

Writable bytes是一个未确定的区域，等待被填充。可以通过调用write*方法对其操作，同时writerIndex 会同步更新，同样的，如果空间不够的话，也会抛出IndexOutOfBoundsException。默认情况下 新分配的writerIndex =0 ，而wrapped 或者copied buffer的writerIndex=buf的capacity。

下面是一个使用writable Byte的例子：

```
        //写入writable bytes
        while (wrappedBuffer.maxWritableBytes() >= 4) {
            wrappedBuffer.writeInt(new Random().nextInt());
        }

```

Discardable bytes是已经被读取过的bytes，初始情况下它的值=0，每当readerIndex右移的时候，Discardable bytes的空间就会增加。如果想要完全删除或重置Discardable bytes，则可以调用discardReadBytes()方法，该方法会将Discardable bytes空间删除，将多余的空间放到writable bytes中，如下所示：

调用 discardReadBytes() 之前：
  
        +-------------------+------------------+------------------+
        | discardable bytes |  readable bytes  |  writable bytes  |
        +-------------------+------------------+------------------+
        |                   |                  |                  |
        0      <=      readerIndex   <=   writerIndex    <=    capacity
  
  
调用 discardReadBytes()之后：
  
        +------------------+--------------------------------------+
        |  readable bytes  |    writable bytes (got more space)   |
        +------------------+--------------------------------------+
        |                  |                                      |
    readerIndex (0) <= writerIndex (decreased)        <=        capacity

> 注意，虽然writable bytes变多了，但是其内容是不可控的，并不能保证里面的内容是空的或者不变。

调用clear()方法会将readerIndex 和 writerIndex 清零，注意clear方法只会设置readerIndex 和 writerIndex 的值，并不会清空content，看下面的示意图：

调用 clear()之前：
  
        +-------------------+------------------+------------------+
        | discardable bytes |  readable bytes  |  writable bytes  |
        +-------------------+------------------+------------------+
        |                   |                  |                  |
        0      <=      readerIndex   <=   writerIndex    <=    capacity
  
  
调用 clear()之后：
  
        +---------------------------------------------------------+
        |             writable bytes (got more space)             |
        +---------------------------------------------------------+
        |                                                         |
        0 = readerIndex = writerIndex            <=            capacity
   
## 搜索

ByteBuf提供了单个byte的搜索功能，如 indexOf(int, int, byte) 和 bytesBefore(int, int, byte)两个方法。

如果是要对ByteBuf遍历进行搜索处理的话，可以使用 forEachByte(int, int, ByteProcessor)，这个方法接收一个ByteProcessor用于进行复杂的处理。

## 其他衍生buffer方法

ByteBuf还提供了很多方法用来创建衍生的buffer，如下所示：

```
duplicate()
slice()
slice(int, int)
readSlice(int)
retainedDuplicate()
retainedSlice()
retainedSlice(int, int)
readRetainedSlice(int)

```

要注意的是，这些buf是建立在现有buf基础上的衍生品，他们的底层内容是一样的，只有readerIndex, writerIndex 和做标记的index不一样。所以他们和原buf是有共享数据的。如果你希望的是新建一个全新的buffer，那么可以使用copy()方法或者前面提到的Unpooled.copiedBuffer。

在前面小节中，我们讲到ByteBuf是一个ReferenceCounted,这个特征在衍生buf中就用到了。我们知道调用retain() 方法的时候，引用count会增加，但是对于 duplicate(), slice(), slice(int, int) 和 readSlice(int) 这些方法来说，虽然他们也是引用，但是没有调用retain()方法，这样原始数据会在任意一个Buf调用release()方法之后被回收。

如果不想有上面的副作用，那么可以将方法替换成retainedDuplicate(), retainedSlice(), retainedSlice(int, int) 和 readRetainedSlice(int) ，这些方法会调用retain()方法以增加一个引用。

## 和现有JDK类型的转换

之前提到了ByteBuf 是对ByteBuffer的重写，他们是不同的实现。虽然这两个不同，但是不妨碍将ByteBuf转换ByteBuffer。

当然，最简单的转换是把ByteBuf转换成byte数组byte[]。要想转换成byte数组，可以先调用hasArray() 进行判断，然后再调用array()方法进行转换。

同样的ByteBuf还可以转换成为ByteBuffer ，可以先调用 nioBufferCount()判断能够转换成为 ByteBuffers的个数，再调用nioBuffer() 进行转换。

返回的ByteBuffer是对现有buf的共享或者复制，对返回之后buffer的position和limit修改不会影响到原buf。

最后，使用toString(Charset) 方法可以将ByteBuf转换成为String。

# 总结

ByteBuf是netty的底层基础，是传输数据的承载对象，深入理解ByteBuf就可以搞懂netty的设计思想，非常不错。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)
