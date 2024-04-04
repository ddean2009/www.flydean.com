---
slug: /io-nio-MappedByteBuffer
---

# 12. 小师妹学JavaIO之:MappedByteBuffer多大的文件我都装得下

## 简介

大大大，我要大！小师妹要读取的文件越来越大，该怎么帮帮她，让程序在性能和速度上面得到平衡呢？快来跟F师兄一起看看吧。

## 虚拟地址空间

小师妹：F师兄，你有没有发现，最近硬盘的价格真的是好便宜好便宜，1T的硬盘大概要500块，平均1M五毛钱。现在下个电影都1G起步，这是不是意味着我们买入了大数据时代？

没错，小师妹，硬件技术的进步也带来了软件技术的进步，两者相辅相成，缺一不可。

小师妹：F师兄，如果要是去读取G级的文件，有没有什么快捷简单的方法？

还记得上次我们讲的虚拟地址空间吗？

再把上次讲的图搬过来：

![](https://img-blog.csdnimg.cn/20200513225239404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

通常来说我们的应用程序调用系统的接口从磁盘空间获取Buffer数据，我们把自己的应用程序称之为用户空间，把系统的底层称之为系统空间。

传统的IO操作，是操作系统讲磁盘中的文件读入到系统空间里面，然后再拷贝到用户空间中，供用户使用。

这中间多了一个Buffer拷贝的过程，如果这个量够大的话，其实还是挺浪费时间的。

于是有人在想了，拷贝太麻烦太耗时了，我们单独划出一块内存区域，让系统空间和用户空间同时映射到同一块地址不就省略了拷贝的步骤吗？

这个被划出来的单独的内存区域叫做虚拟地址空间，而不同空间到虚拟地址的映射就叫做Buffer Map。 Java中是有一个专门的MappedByteBuffer来代表这种操作。

小师妹：F师兄，那这个虚拟地址空间和内存有什么区别呢？有了内存还要啥虚拟地址空间？

虚拟地址空间有两个好处。

第一个好处就是虚拟地址空间对于应用程序本身而言是独立的，从而保证了程序的互相隔离和程序中地址的确定性。比如说一个程序如果运行在虚拟地址空间中，那么它的空间地址是固定的，不管他运行多少次。如果直接使用内存地址，那么可能这次运行的时候内存地址可用，下次运行的时候内存地址不可用，就会导致潜在的程序出错。

第二个好处就是虚拟空间地址可以比真实的内存地址大，这个大其实是对内存的使用做了优化，比如说会把很少使用的内存写如磁盘，从而释放出更多的内存来做更有意义的事情，而之前存储到磁盘的数据，当真正需要的时候，再从磁盘中加载到内存中。

这样物理内存实际上可以看做虚拟空间地址的缓存。

## 详解MappedByteBuffer

小师妹：MappedByteBuffer听起来好神奇，怎么使用它呢？

我们先来看看MappedByteBuffer的定义：

~~~java
public abstract class MappedByteBuffer
    extends ByteBuffer
~~~

它实际上是一个抽象类，具体的实现有两个：

~~~java
class DirectByteBuffer extends MappedByteBuffer implements DirectBuffer
~~~

~~~java
class DirectByteBufferR extends DirectByteBuffer
implements DirectBuffer
~~~

分别是DirectByteBuffer和DirectByteBufferR。

小师妹：F师兄，这两个ByteBuffer有什么区别呢？这个R是什么意思？

R代表的是ReadOnly的意思，可能是因为本身是个类的名字就够长了，所以搞了个缩写。但是也不写个注解，让人看起来十分费解....

我们可以从RandomAccessFile的FilChannel中调用map方法获得它的实例。

我们看下map方法的定义：

~~~java
 public abstract MappedByteBuffer map(MapMode mode, long position, long size)
        throws IOException;
~~~

MapMode代表的是映射的模式，position表示是map开始的地址，size表示是ByteBuffer的大小。

### MapMode

小师妹：F师兄，文件有只读，读写两种模式，是不是MapMode也包含这两类？

对的，其实NIO中的MapMode除了这两个之外，还有一些其他很有趣的用法。

* FileChannel.MapMode.READ_ONLY  表示只读模式
* FileChannel.MapMode.READ_WRITE 表示读写模式
* FileChannel.MapMode.PRIVATE 表示copy-on-write模式，这个模式和READ_ONLY有点相似，它的操作是先对原数据进行拷贝，然后可以在拷贝之后的Buffer中进行读写。但是这个写入并不会影响原数据。可以看做是数据的本地拷贝，所以叫做Private。

基本的MapMode就这三种了，其实除了基础的MapMode，还有两种扩展的MapMode：

* ExtendedMapMode.READ_ONLY_SYNC 同步的读
* ExtendedMapMode.READ_WRITE_SYNC 同步的读写

## MappedByteBuffer的最大值

小师妹：F师兄，既然可以映射到虚拟内存空间，那么这个MappedByteBuffer是不是可以无限大？

当然不是了，首先虚拟地址空间的大小是有限制的，如果是32位的CPU，那么一个指针占用的地址就是4个字节，那么能够表示的最大值是0xFFFFFFFF，也就是4G。

另外我们看下map方法中size的类型是long，在java中long能够表示的最大值是0x7fffffff，也就是2147483647字节，换算一下大概是2G。也就是说MappedByteBuffer的最大值是2G，一次最多只能map 2G的数据。

## MappedByteBuffer的使用

小师妹，F师兄我们来举两个使用MappedByteBuffer读写的例子吧。

善！

先看一下怎么使用MappedByteBuffer来读数据：

~~~java
public void readWithMap() throws IOException {
        try (RandomAccessFile file = new RandomAccessFile(new File("src/main/resources/big.www.flydean.com"), "r"))
        {
            //get Channel
            FileChannel fileChannel = file.getChannel();
            //get mappedByteBuffer from fileChannel
            MappedByteBuffer buffer = fileChannel.map(FileChannel.MapMode.READ_ONLY, 0, fileChannel.size());
            // check buffer
            log.info("is Loaded in physical memory: {}",buffer.isLoaded());  //只是一个提醒而不是guarantee
            log.info("capacity {}",buffer.capacity());
            //read the buffer
            for (int i = 0; i < buffer.limit(); i++)
            {
                log.info("get {}", buffer.get());
            }
        }
    }
~~~

然后再看一个使用MappedByteBuffer来写数据的例子：

~~~java
public void writeWithMap() throws IOException {
        try (RandomAccessFile file = new RandomAccessFile(new File("src/main/resources/big.www.flydean.com"), "rw"))
        {
            //get Channel
            FileChannel fileChannel = file.getChannel();
            //get mappedByteBuffer from fileChannel
            MappedByteBuffer buffer = fileChannel.map(FileChannel.MapMode.READ_WRITE, 0, 4096 * 8 );
            // check buffer
            log.info("is Loaded in physical memory: {}",buffer.isLoaded());  //只是一个提醒而不是guarantee
            log.info("capacity {}",buffer.capacity());
            //write the content
            buffer.put("www.flydean.com".getBytes());
        }
    }
~~~

## MappedByteBuffer要注意的事项

小师妹：F师兄，MappedByteBuffer因为使用了内存映射，所以读写的速度都会有所提升。那么我们在使用中应该注意哪些问题呢？

MappedByteBuffer是没有close方法的，即使它的FileChannel被close了，MappedByteBuffer仍然处于打开状态，只有JVM进行垃圾回收的时候才会被关闭。而这个时间是不确定的。

## 总结

本文再次介绍了虚拟地址空间和MappedByteBuffer的使用。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！

