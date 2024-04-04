---
slug: /io-nio-overview
---

# 1. Java中IO和NIO的本质和区别

# 简介

终于要写到java中最最让人激动的部分了IO和NIO。IO的全称是input output，是java程序跟外部世界交流的桥梁，IO指的是java.io包中的所有类，他们是从java1.0开始就存在的。NIO叫做new IO，是在java1.4中引入的新一代IO。

IO的本质是什么呢？它和NIO有什么区别呢？我们该怎么学习IO和NIO呢？

别急，看完这篇文章一切都有答案。

# IO的本质

IO的作用就是从外部系统读取数据到java程序中，或者把java程序中输出的数据写回到外部系统。这里的外部系统可能是磁盘，网络流等等。

因为对所有的外部数据的处理都是由操作系统内核来实现的，对于java应用程序来说，只是调用操作系统中相应的接口方法，从而和外部数据进行交互。

所有IO的本质就是对Buffer的处理，我们把数据放入Buffer供系统写入外部数据，或者从系统Buffer中读取从外部系统中读取的数据。如下图所示：

![](https://img-blog.csdnimg.cn/20200513172435931.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

用户空间也就是我们自己的java程序有一个Buffer，系统空间也有一个buffer。所以会出现系统空间缓存数据的情况，这种情况下系统空间将会直接返回Buffer中的数据，提升读取速度。

# DMA和虚拟地址空间

在继续讲解之前，我们先讲解两个操作系统中的基本概念，方便后面我们对IO的理解。

现代操作系统都有一个叫做DMA（Direct memory access）的组件。这个组件是做什么的呢？

一般来说对内存的读写都是要交给CPU来完成的，在没有DMA的情况下，如果程序进行IO操作，那么所有的CPU时间都会被占用，CPU没法去响应其他的任务，只能等待IO执行完成。这在现代应用程序中是无法想象的。

如果使用DMA，则CPU可以把IO操作转交给其他的操作系统组件，比如数据管理器来操作，只有当数据管理器操作完毕之后，才会通知CPU该IO操作完成。现代操作系统基本上都实现了DMA。

虚拟地址空间也叫做（Virtual address space），为了不同程序的互相隔离和保证程序中地址的确定性，现代计算机系统引入了虚拟地址空间的概念。简单点讲可以看做是跟实际物理地址的映射，通过使用分段或者分页的技术，将实际的物理地址映射到虚拟地址空间。

![](https://img-blog.csdnimg.cn/20200513225239404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

对于上面的IO的基本流程图中，我们可以将系统空间的buffer和用户空间的buffer同时映射到虚拟地址空间的同一个地方。这样就省略了从系统空间拷贝到用户空间的步骤。速度会更快。

同时为了解决虚拟空间比物理内存空间大的问题，现代计算机技术一般都是用了分页技术。

分页技术就是将虚拟空间分为很多个page，只有在需要用到的时候才为该page分配到物理内存的映射，这样物理内存实际上可以看做虚拟空间地址的缓存。

虚拟空间地址分页对IO的影响就在于，IO的操作也是基于page来的。

比较常用的page大小有：1,024, 2,048, 和 4,096 bytes。

# IO的分类

IO可以分为File/Block IO和Stream I/O两类。

对于File/Block IO来说，数据是存储在disk中，而disk是由filesystem来进行管理的。我们可以通过filesystem来定义file的名字，路径，文件属性等内容。

filesystem通过把数据划分成为一个个的data blocks来进行管理。有些blocks存储着文件的元数据，有些block存储着真正的数据。

最后filesystem在处理数据的过程中，也进行了分页。filesystem的分页大小可以跟内存分页的大小一致，或者是它的倍数，比如 2,048 或者 8,192 bytes等。

并不是所有的数据都是以block的形式存在的，我们还有一类IO叫做stream IO。

stream IO就像是管道流，里面的数据是序列被消费的。

# IO和NIO的区别

java1.0中的IO是流式IO，它只能一个字节一个字节的处理数据，所以IO也叫做Stream IO。

而NIO是为了提升IO的效率而生的，它是以Block的方式来读取数据的。

Stream IO中，input输入一个字节，output就输出一个字节，因为是Stream，所以可以加上过滤器或者过滤器链，可以想想一下web框架中的filter chain。在Stream IO中，数据只能处理一次，你不能在Stream中回退数据。

在Block IO中，数据是以block的形式来被处理的，因此其处理速度要比Stream IO快，同时可以回退处理数据。但是你需要自己处理buffer，所以复杂程度要比Stream IO高。

一般来说Stream IO是阻塞型IO，当线程进行读或者写操作的时候，线程会被阻塞。

而NIO一般来说是非阻塞的，也就是说在进行读或者写的过程中可以去做其他的操作，而读或者写操作执行完毕之后会通知NIO操作的完成。

在IO中，主要分为DataOutPut和DataInput，分别对应IO的out和in。

DataOutPut有三大类，分别是Writer，OutputStream和ObjectOutput。

看下他们中的继承关系：

![](https://img-blog.csdnimg.cn/20200514141454739.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

![](https://img-blog.csdnimg.cn/20200514141925893.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

DataInput也有三大类，分别是ObjectInput，InputStream和Reader。

看看他们的继承关系：

![](https://img-blog.csdnimg.cn/20200514141704341.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

![](https://img-blog.csdnimg.cn/20200514142032985.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

ObjectOutput和ObjectInput类比较少，这里就不列出来了。

统计一下大概20个类左右，搞清楚这20个类的用处，恭喜你java IO你就懂了！

对于NIO来说比较复杂一点，首先，为了处理block的信息，需要将数据读取到buffer中，所以在NIO中Buffer是一个非常中要的概念，我们看下NIO中的Buffer：

![](https://img-blog.csdnimg.cn/20200514142719108.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从上图我们可以看到NIO中为我们准备了各种各样的buffer类型使用。

另外一个非常重要的概念是channel，channel是NIO获取数据的通道：

![](https://img-blog.csdnimg.cn/20200514143225602.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

NIO需要掌握的类的个数比IO要稍稍多一点，毕竟NIO要复杂一点。

就这么几十个类，我们就掌握了IO和NIO，想想都觉得兴奋。

# 总结

后面的文章中，我们会介绍小师妹给你们认识，刚好她也在学java IO，后面的学习就跟她一起进行吧，敬请期待。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！








