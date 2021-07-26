小师妹学JVM之:Dirty cards和PLAB

## 简介 

分代垃圾回收器在进行minor GC的时候会发生什么操作呢？有没有什么提高效率的手段呢？今天我们和小师妹一起来了解一下垃圾回收中的Dirty cards和PLAB

## 分代收集器中的空间划分

小师妹：F师兄，能再讲讲分代垃圾收集器中的空间划分吗？

分代垃圾回收器中的Eden，Old和Survivor space几个大家应该都很熟悉的分代技术。

Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。

当Eden space满的时候，就会触发minor GC。会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

就这样不断的扫描，最后经过多次扫描发现仍然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

![](https://img-blog.csdnimg.cn/20200525214231730.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## Write barrier和Dirty cards

小师妹：F师兄，minor GC的时候，要将对象从Eden复制到Suvivor Space，从Suvivor Space中复制到Old space。GC是怎么知道哪些对象是要被回收，哪些是不用被回收的呢？

小师妹，GC这里用到了一项叫做Dirty cards的技术。

一般来说，新的对象是分配在Eden空间的。但是也有些对象是直接分配在Old space。

我们知道，GC的扫描是从一些根对象开始的，这些Root对象包括：正在执行的方法中的本地对象和输入参数。活动的线程，加载类中的static字段和JNI引用。

而这些根对象，一般都是存储在old space中的。

通常来说old space的空间都会比较大。每次要要找到Eden和suvivor Space中哪些对象不再被引用，需要扫描整个old space肯定是不可取的。

所以JVM在这里引入了Write barrier的技术。HotSpot中有两种Write barrier，一种就是今天我们要讲的Dirty cards,另外一种就是snapshot-at-the-beginning (SATB)。 SATB通常用在G1垃圾回收器中，这里我们先不做深入的讨论。

![](https://img-blog.csdnimg.cn/20200607152228268.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们看下上图中的Dirty cards的使用。 

Dirty cards说起来很简单，就是每当有程序对引用进行修改的时候，我们都会在一个Dirty cards的空间记录一下被修改的memory page。

这样在minor GC的时候，当引用的对象被修改了之后，我们会同步修改对应的Dirty cards。这样每次扫描old space的时候，只需要选择那些标记为Dirty cards的对象就可以了，避免了全局扫描。

## PLAB

小师妹，F师兄，你讲的好像很有道理的样子，上次你讲到我们在Eden空间分配对象的，为了提升分配的效率，使用了TLAB的计算。那么在对象从Eden空间提升到Suvivor Space和old Space的时候有没有同样的技术呢？

当然有的，这个技术就叫做PLAB（ promotion local allocation buffer）。每一个线程在survival space和old space中都一个PLAB。在提升的时候，可以避免多线程的竞争，从而提升效率。

我们可以使用-XX:+AlwaysTenure 将对象直接从Eden space提升到old space。

我们可以使用-XX:+PrintOldPLAB来输出OldPLAB的信息。

## old space分配对象

小师妹：F师兄，刚刚你讲到新分配的对象可以直接在Old space，一般什么对象可以这样分配呢？

这个很好理解，如果你分配对象大小超过了Eden space的大小，是不是就只有old space可以分配对象了？

小师妹：对的，但是一般来说也不会使用这么大的对象吧。

对的，我们可以通过设置-XX:PretenureSizeThreshold=n 来指定对象的大小，如果对象大小大于n，那么就直接在old space分配。

> 注意，如果这个对象的大小比TLPB要小，那么会首先在TLPB中分配。所以使用的时候要注意限制TLPB的大小。

## 总结

GC的运行是一个比较复杂的过程，大家可以细细体会。本文如果有什么谬误之处，欢迎微信我指正。谢谢大家。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！




