小师妹学JVM之:GC的垃圾回收算法

## 简介

JVM的重要性不言而喻了，如果把java的应用程序比作一辆跑车，那么JVM就是这辆车的发动机，没有它，java程序就成了空中楼阁，无根浮萍。而在JVM中有一块内存区域叫做运行时数据区域，存储了运行时所需要的所有对象，而Heap Area则是其中最大的一块。

内存毕竟不是无限的，所以就需要一种机制来将不再使用的对象进行回收，这种机制就是今天我们要讲的GC。

## 对象的生命周期

小师妹:F师兄，你相信这个世界有轮回吗？

师兄我是一个坚定的无神论者，活在当下就好了，何必操心后面的轮回呢？

小师妹:F师兄，这个你就不懂了，意识是组成脑的原子群的一种组合模式，我们大脑的物质基础和一块石头没有什么不同。当我们掌握大脑的组合方式，然后重构，我们的意识就重现了，这就是轮回。这可是量子理论中提到的观念哦。

哇，小师妹什么时候这么厉害了，都开始探讨这么高深的话题了。F师兄我实在是跟不上节奏啊。

小师妹，F师兄，我是怕你尴尬，想引出java对象的生命周期这个话题嘛。

量子理论我不熟，java对象我还没怕过谁。

对象的生命周期其实很简单：创建，使用中，最后被销毁。

1. 创建对象

举个最简单的创建对象的例子：

~~~java
Object obj = new Object();
~~~

对象创建的时候，将会为该对象分配特定的空间。

2. 使用对象

对象创建之后，就可以被其他的对象使用，如果其他的对象有使用该对象，那么我们成为该对象被引用了。

3. 对象销毁

当一个对象没有被其他对象引用的时候，我们就称为该对象可以被回收了。在Java中，对象的回收是由GC来负责的。

## 垃圾回收算法

小师妹：F师兄，我觉得垃圾回收好像挺简单的，我们为每个对象维持一个指针计数器，每引用一次就加一，这样不就可以实现垃圾回收器了吗？

底层原理是这么一个道理，但是JVM需要一种更加高效的算法来保证垃圾回收的效率，同时也不会影响正在运行的程序。

接下来我们将会介绍一下，在JVM中比较常用几个垃圾回收算法：

### Mark and sweep

 Mark and sweep是最最简单的垃圾回收算法，简单点讲，它可以分为两个步骤：

 1. 标记live对象

标记live对象听起来很简单，就是扫描堆中的对象，看这些对象是否被引入。

但是这里有一个问题，如果是两个对象互相引用的时候，而这两个对象实际上并没有被外部的对象所引用，那么这两个对象其实是应该被回收的。所以我们还需要解决一个关键性的问题：从哪里开始扫描的问题。

JVM定义了一些Root对象，从这些对象开始，找出他们引用的对象，组成一个对象图。所有在这个图里面的对象都是有效的对象，反之不在对象图中的对象就应该被回收。有效的对象将会被Mark为alive。

这些Root对象包括：正在执行的方法中的本地对象和输入参数。活动的线程，加载类中的static字段和JNI引用。

> 注意，这种遍历其实是有个缺点的，因为为了找到对象图中哪些对象是live的，必须暂停整个应用程序，让对象变成静止状态，这样才能构建有效的对象图。后面我们会介绍更加有效的垃圾回收算法。

2. 删除对象

扫描对象之后，我们就可以将未标记的对象删除了。

删除有三种方式，第一种方式是正常删除。但是正常删除会导致内存碎片的产生。所以第二种方式就是删除之后进行压缩，以减少内存碎片。还有一种方式叫做删除拷贝，也就是说将alive的对象拷贝到新的内存区域，这样同样可以解决内存碎片的问题。

### Concurrent mark sweep (CMS) 

在讲CMS之前，我们先讲一下垃圾回收器中的Eden，Old和Survivor space几个大家应该都很熟悉的分代技术。

Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。垃圾回收的时候，会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

就这样不断的扫描，最后经过多次扫描发现任然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

![](https://img-blog.csdnimg.cn/20200525214231730.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

> 之后要讲的几个垃圾回收器，除了ZGC，其他都使用的是分代的技术。

好了，现在继续讲CMS，CMS是mark and swap的升级版本，它使用多个线程来对heap区域进行扫描，从而提升效率。

CMS在Young Generation中使用的是mark-copy，而在Old Generation主要使用的是mark-sweep。

使用CMS的命令很简单：

~~~java
-XX:+UseConcMarkSweepGC
~~~

![](https://img-blog.csdnimg.cn/20200525221146596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上面是列出的一些CMS的调优参数。

### Serial garbage collection

Serial garbage collection使用单一的线程来进行垃圾回收操作，其好处就是不需要和其他的线程进行交互。如果你是单核的CPU，那么最好就是选择Serial garbage collection，因为你不能充分利用多核的好处。同样的它也常常用在比较小型的项目中。

Serial garbage collection在Young Generation中使用的是mark-copy，而在Old Generation主要使用的是 mark-sweep-compact。

下面是开启命令：

~~~java
-XX:+UseSerialGC
~~~

### Parallel garbage collection

和serial GC类似，它在Young Generation中使用的是mark-copy，而在Old Generation主要使用的是 mark-sweep-compact。不同的是它是并行的。

可以通过下面的命令来指定并发的线程：

~~~java
-XX:ParallelGCThreads=N
~~~

如果你是多核处理器，那么Parallel GC可能是你的选择。

> Parallel GC是JDK8中的默认GC。而在JDK9之后， G1是默认的GC。

使用下面的命令来开启Parallel GC：

~~~java
-XX:+UseParallelGC
~~~

### G1 garbage collection

为什么叫G1呢，G1=Garbage First，它是为替换CMS而生的，最早出现在java7中。

G1将heap区域划分成为多个更小的区域，每个小区域都被标记成为young generation 或者old generation。从而运行GC在更小的范围里运行，而不是影响整个heap区域。

可以使用下面的命令来开启：

~~~java
-XX:+UseG1GC 
~~~

###  Z Garbage Collection

ZGC是一个可扩展的，低延迟的GC。ZGC是并发的，而且不需要停止正在运行的线程。

使用下面的命令来开启：

~~~java
 -XX:+UseZGC 
~~~

ZGC是在JDK11中被引入的。

## 怎么选择

小师妹：F师兄，你讲了这么多个GC，到底我该用哪个呢？

高射炮不能用来打蚊子，所以选择合适的GC才是最终要的。这里F师兄给你几个建议：

1. 如果你的应用程序内存本来就很小，那么使用serial collector ： -XX:+UseSerialGC.

2. 如果你的程序运行在单核的CPU上，并且也没有程序暂停时间的限制，那么还是使用serial collector ： -XX:+UseSerialGC.

3. 如果对峰值期的性能要求比较高，但是对程序暂停时间没多大的要求，那么可以使用 parallel collector： -XX:+UseParallelGC。

4. 如果更加关注响应时间，并且GC的对程序的暂停时间必须要小，那么可以使用-XX:+UseG1GC。

5. 如果响应时间非常重要，并且你在使用大容量的heap空间，那么可以考虑使用ZGC： -XX:UseZGC。

## 总结

本文介绍了几种GC的算法，大家可以根据需要选用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
















