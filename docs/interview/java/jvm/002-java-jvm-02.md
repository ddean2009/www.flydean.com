# JVM面试问题(二)

## 响应时间

单次GC的暂停时间是一个统计平均值，因为单次GC的时间其实是不可控的，但是取了平均值，GC就可以动态去调整heap的大小，或者其他的一些GC参数，从而保证每次GC的时间不会超过这个平均值。

我们可以通过设置：-XX:MaxGCPauseMillis=<nnn> 来控制这个值。

不管怎么设置这个参数，总体需要被GC的对象肯定是固定的，如果单次GC暂停时间比较短，可能会需要减少heap size的大小，那么回收的对象也比较少。这样就会导致GC的频率增加。从而导致GC的总时间增加，影响程序的Throughput。

## 吞吐率

吞吐率指在一定时间内，应用程序执行业务逻辑的时间占总时间的比例。

我们可以通过设置：-XX:GCTimeRatio=nnn 来控制。

如果没有达到throughput的目标，那么GC可能会去增加heap size，从而减少GC的执行频率。但是这样会增加单次的Maximum Pause-Time。

如果throughput和maximum pause-time的参数同时都设置的话，JVM会去尝试去动态减少heap size的大小，直到其中的一个目标不能满足为止。

相对而言，**G1更加偏重于响应时间，而ZGC更加偏重于吞吐率**。

一些垃圾回收策略和算法可能会追求更高的吞吐量，即更高的业务逻辑执行效率，但在追求吞吐量的同时可能会导致较长的垃圾回收暂停时间。另一方面，一些策略可能注重更低的垃圾回收暂停时间，以提高系统的响应性，但可能会降低业务逻辑的执行效率。

## JVM调优参数

### 通用参数

-XX:-UseBiasedLocking 禁用偏向锁

-XX:-UseCompressedOops 停止对象指针压缩

-XX:ObjectAlignmentInBytes=alignment java对象对齐字节大小

-Xbatch 禁用JVM的后台编译功能

-Xcomp 强制JIT编译

-Xint  强制使用解释模式，不使用JIT

-XX:+UseLargePages 开启largepage

> 虚拟地址空间和物理地址的映射是通过一个叫做映射存储表的地方来工作的。这个地方一般被叫做页表(page table)，页表是存储在物理内存中的。
>
> CPU读取物理内存速度肯定会慢于读取寄存器的速度。于是又引入了TLB的概念。
>
> Translation-Lookaside缓冲区（TLB）是一个页面转换缓存，其中保存了最近使用的虚拟到物理地址转换。
>
> TLB容量是有限的。如果发生TLB miss则需要CPU去访问内存中的页表，从而造成性能损耗。
>
> 通过调大内存分页大小，单个TLB条目存储更大的内存范围。这将减少对TLB的压力，并且对内存密集型应用程序可能具有更好的性能。

-Xnoclassgc 禁用classes的GC

-XX:+UseStringDeduplication 开启字符串去重   G1垃圾回收器中的

### 线程

-XX:+UseTLAB 开启TLAB。（Thread-Local Allocation Buffer）是Java虚拟机（JVM）中的一个优化技术，主要用于提高对象分配的效率。

### 内存大小调整

-Xmnsize  young gen的初始化和最大值

-XX:NewSize   young gen的初始化大小

-XX:MaxNewSize young gen的最大值

-Xmssize heap的初始值

-Xmxsize heap的最大值

-XX:MaxMetaspaceSize=size 元数据区域的最大大小

XX:MaxDirectMemorySize=size 设置NIO的最大direct-buffer size

-XX:NewRatio=ratio young和old区域的大小比例

-XX:SurvivorRatio=ratio eden和survivor大小的比

-XX:CompressedClassSpaceSize=1g compressed class space大小

-XX:InitialCodeCacheSize=256m codeCache的初始化大小

### 并发控制

-XX:+AlwaysTenure 将young space中的survivor对象直接提升到old space

-XX:+NeverTenure 除非survivor space不能容纳该对

### JIT调优

-XX:+SegmentedCodeCache code cache分区

-XX:-TieredCompilation 取消分层编译

-XX:+DoEscapeAnalysis 开启逃逸分析

-XX:+Inline 开启inline方法

### 打印GC信息

**简单信息**: -verbose:gc, -XX:+PrintGC

**打印详细的**GC**信息** -XX:+PrintGCDetails, +XX:+PrintGCTimeStamps

-XX:+PrintHeapAtGC， 打印堆信息

-XX:+TraceClassLoading  看到class加载的过程和具体的class信息

-XX:+DisableExplicitGC禁止在运行期显式地调用System.gc()

-XX:-HeapDumpOnOutOfMemoryError 默认关闭，建议开启，在java.lang.OutOfMemoryError 异常出现时，输出一个dump.core文件，记录当时的堆内存快照。

## 栈大小设置

-Xss：如-Xss128k

# JVM基础

## GC种类

* 基于分代技术的：

* Serial （Serial Old）

* CMS -- JDK9被废弃
  ParallelGC —JDK8默认   （ParNew，Parallel Scavenge，Parallel Old）
  G1 ---JDK9默认

* 不基于分代技术的：
  ZGC,loom

* 用java编写的graalVM

* Parallel scavenge和Parallel有什么区别呢

* ### Parallel Scavenge收集器

    1. **主要关注点**：这是一个主要关注吞吐量的垃圾收集器。
    2. **工作区域**：它主要用于新生代的垃圾回收。
    3. **算法**：使用复制算法，这是一种适用于新生代的高效垃圾回收算法。
    4. 特点
        - 自适应调节策略（Ergonomics）：Parallel Scavenge收集器能够根据系统的当前运行情况调整Java堆大小和其他GC相关参数，以达到最佳的吞吐量性能。
        - 吞吐量优先：适用于在后台运行的应用程序，这些应用程序不太关心停顿时间，更关心在单位时间内完成的工作量。

  ### Parallel Old收集器

    1. **主要关注点**：这是一个针对老年代的垃圾收集器，也是关注吞吐量的。
    2. **工作区域**：主要针对老年代。
    3. **算法**：使用标记-压缩算法，这是适用于老年代的一种有效的垃圾回收算法。
    4. 特点
        - 与Parallel Scavenge收集器配合：在JVM中，Parallel Old通常与Parallel Scavenge收集器一起使用，二者共同提供一个完整的针对新生代和老年代的高吞吐量GC解决方案。
        - 适用于多核环境：Parallel Old收集器在多核环境中表现良好，能够并行地处理老年代中的垃圾收集任务。

  ### 综合比较

    - **适用区域**：Parallel Scavenge用于新生代，而Parallel Old用于老年代。
    - **关注点**：两者都关注于提高吞吐量，但Parallel Scavenge还特别提供自适应调节策略。
    - **使用场景**：它们通常一起使用，形成一个完整的、针对整个Java堆的高吞吐量垃圾收集策略。

  在选择垃圾收集器时，需要根据应用程序的特定需求和运行环境来决定。如果吞吐量是主要关注点，并且应用运行在多核处理器上，那么Parallel Scavenge和Parallel Old的组合是一个不错的选择。

1. 如果你的应用程序内存本来就很小，那么使用serial collector ： -XX:+UseSerialGC.
2. 如果你的程序运行在单核的CPU上，并且也没有程序暂停时间的限制，那么还是使用serial collector ： -XX:+UseSerialGC.
3. 如果对峰值期的性能要求比较高，但是对程序暂停时间没多大的要求，那么可以使用 parallel collector： -XX:+UseParallelGC。
4. 如果更加关注响应时间，并且GC的对程序的暂停时间必须要小，那么可以使用-XX:+UseG1GC。
5. 如果响应时间非常重要，并且你在使用大容量的heap空间，那么可以考虑使用ZGC： -XX:UseZGC。

## G1收集器

Garbage first 垃圾收集器是目前垃圾收集器理论发展的最前沿成果，相比与CMS 收集器，G1 收集器两个最突出的改进是：

1. 基于**标记-整理算法**，不产生内存碎片。

2. 可以非常精确控制停顿时间，在不牺牲吞吐量前提下，实现低停顿垃圾回收。

G1 收集器避免全区域垃圾收集，它把堆内存划分为大小固定的几个独立区域，并且跟踪这些区域的垃圾收集进度，同时在后台维护一个优先级列表，每次根据所允许的收集时间，优先回收垃圾最多的区域。**区域划分**和**优先级区域回收机制**，确保G1 收集器可以在**有限时间获得最高的垃圾收集效率**。

### **初始标记-->并发标记---->最终标记---->筛选回收**

​      **G1只有并发标记阶段能做到用户线程和回收线程并发执行！！！！**

## CMS

Concurrent mark sweep(CMS)收集器是一种年老代垃圾收集器，其最主要目标是获取**最短垃圾回收停顿时间**，和其他年老代使用标记-整理算法不同，它使用多线程的**标记-清除算法**。

最短的垃圾收集停顿时间可以为交互比较高的程序提高用户体验。

CMS 工作机制相比其他的垃圾收集器来说更复杂，整个过程分为以下4 个阶段：

1. **初始标记**

   只是标记一下GC Roots 能直接关联的对象，速度很快，仍然需要暂停所有的工作线程。

2. **并发标记**

   进行GC Roots 跟踪的过程，和用户线程一起工作，不需要暂停工作线程。

3. **重新标记**

   为了修正在并发标记期间，因用户程序继续运行而导致标记产生变动的那一部分对象的标记记录，仍然需要暂停所有的工作线程。

4. **并发清除**

   清除GC Roots 不可达对象，和用户线程一起工作，不需要暂停工作线程。由于耗时最长的并发标记和并发清除过程中，垃圾收集线程可以和用户现在一起并发工作，所以总体上来看CMS 收集器的内存回收和用户线程是一起并发地执行。



## G1和CMS收集器的区别

CMS的缺点是对CPU的要求比较高。

G1的缺点是将内存化成了多块，所以对内存段的大小有很大的要求。

CMS是清除，所以会有很多的内存碎片。

G1是整理，所以碎片空间较小。

G1和CMS都是**响应优先**，他们的目的都是尽量控制 stop the world 的时间。

G1和CMS的Full GC都是单线程 mark sweep compact算法，直到JDK10才优化成并行的。

## G1和ZGC的区别

G1（Garbage-First）收集器和ZGC（Z Garbage Collector）都是Java虚拟机（JVM）中的高级垃圾收集器，它们各自有着不同的设计目标和特性。下面是G1和ZGC之间的主要区别：

### G1收集器

1. **目标**：G1收集器的目标是提供一个平衡吞吐量和延迟的垃圾收集器，适用于中等到较大的堆（数GB）。
2. **算法**：G1是一种基于区域的垃圾收集器，使用了一种混合的收集算法，结合了**标记-清理和复制**算法。
3. 特点
    - **可预测的停顿时间**：G1收集器允许用户指定期望的停顿时间目标，并尽可能在这个范围内保持垃圾收集的停顿时间。
    - **增量收集**：G1可以逐渐清理堆内存，而不是一次性清理全部，这有助于控制单次垃圾收集的停顿时间。
    - **适用于较大堆**：G1特别适用于具有较大堆内存的应用程序，可以有效管理数GB至数十GB的堆内存。

### ZGC收集器

1. **目标**：ZGC的主要目标是在极大的堆（数TB）上提供极低的停顿时间。
2. **算法**：ZGC是一种基于区域的垃圾收集器，使用了**标记-重定位（移动**）算法，几乎所有工作都是并发进行的。
3. 特点
    - **极低的停顿时间**：ZGC设计目标是将停顿时间控制在几毫秒内，即使是在处理数TB级别的堆内存时也是如此。
    - **并发处理**：大部分垃圾收集工作是并发进行的，意味着垃圾回收过程中应用程序仍然可以继续运行。
    - **可伸缩性**：ZGC能够高效地处理从几百MB到数TB的堆内存。

### 主要区别

- **停顿时间**：ZGC专注于实现极低的停顿时间，而G1平衡了吞吐量和停顿时间。
- **堆大小**：ZGC适用于极大的堆内存（数TB级别），而G1更适合中等到较大的堆内存。
- **算法和工作方式**：G1是增量收集，而ZGC几乎所有工作都是并发进行的。

选择哪种垃圾收集器取决于具体的应用场景，包括可接受的停顿时间、堆的大小以及系统的其他性能要求。对于需要处理大量数据且对延迟非常敏感的应用程序，ZGC可能是更好的选择。而对于需要平衡吞吐量和停顿时间的应用，G1可能更加适合。

## ZGC

ZGC（Z Garbage Collector）是Java虚拟机（JVM）中的一种垃圾收集器，自JDK 11开始作为实验性特性引入，并在后续版本中得到了改进和优化。ZGC的主要目标是为大型堆（heap）提供低延迟的垃圾回收，同时保持高吞吐量。它特别适合需要管理大量内存且对延迟敏感的应用程序，比如云应用、微服务、大数据处理应用等。

### 主要特性

1. **低延迟**：ZGC的设计目标是将停顿时间控制在几毫秒以内，即使是在处理数TB级别的堆内存时也是如此。
2. **可伸缩性**：ZGC能够高效地处理从几百MB到数TB的堆内存。
3. **并发处理**：大部分垃圾收集工作是并发进行的，意味着垃圾回收过程中应用程序仍然可以继续运行。
4. **无锁数据结构**：ZGC使用无锁的数据结构来避免收集过程中的线程阻塞，从而提高性能。
5. **压缩堆**：ZGC支持堆压缩，有助于减少内存碎片，提高内存使用效率。

### 工作原理

ZGC是一种基于区域的垃圾收集器，它将堆内存划分为多个小的区域（region）。ZGC的垃圾收集过程主要分为几个阶段：

1. **并发标记**：ZGC会在应用线程运行的同时标记出可达的对象。
2. **并发预处理**：处理一些为即将到来的重定位做准备的工作。
3. **停顿重定位**：这是ZGC中唯一需要停止应用线程的阶段。在这个阶段，ZGC会更新指向被移动对象的引用。这个阶段的停顿时间非常短。
4. **并发重定位**：在应用继续运行的同时移动对象，以减少内存碎片。

### 使用和配置

要启用ZGC，可以在启动JVM时加上 `-XX:+UseZGC` 选项。此外，还可以通过其他JVM参数来调整ZGC的行为，例如设置堆的大小、设置停顿时间的目标等。

### 适用场景

ZGC适用于需要管理大量内存且对响应时间有严格要求的应用。但是，对于内存使用量较小或者吞吐量是主要关注点的应用程序，其他垃圾收集器（如G1、Parallel GC）可能是更好的选择。

ZGC的引入和发展，显示了Java平台在提升性能和降低延迟方面的持续进步，特别是在服务大型、高负载应用时。随着更多的实际应用和性能优化，ZGC可能会成为未来Java应用的首选垃圾收集器之一。

## 分代技术

Young Gen被划分为1个Eden Space和2个Suvivor Space。当对象刚刚被创建的时候，是放在Eden space。

当Eden space满的时候，就会触发minor GC。会扫描Eden Space和一个Suvivor Space。如果在垃圾回收的时候发现Eden Space中的对象仍然有效，则会将其复制到另外一个Suvivor Space。

就这样不断的扫描，最后经过多次扫描发现仍然有效的对象会被放入Old Gen表示其生命周期比较长，可以减少垃圾回收时间。

## 回收机制

分代复制垃圾回收，标记垃圾回收，增量垃圾回收

Mark-sweep, concurrent mark-sweep, mark-copy, mark-sweep-compact，分代回收？

## 什么是分布式垃圾回收（DGC）？它是如何工作的？

DGC 叫做分布式垃圾回收。RMI 使用 DGC 来做自动垃圾回收。因为 RMI 包含了跨虚拟机的远程对象的引用，垃圾回收是很困难的。DGC 使用**引用计数算法**来给远程对象提供自动内存管理。

## 串行（serial）收集器和吞吐量（throughput）收集器的区别是什么？

吞吐量收集器使用并行版本的新生代垃圾收集器，它用于中等规模和大规模数据的应用程序。 而串行收集器对大多数的小应用（在现代处理器上需要大概 100M 左右的内存）就足够了。

## 判断对象是否存活

1. 引用计数器，缺陷：无法解决循环引用的问题

2. 可达性算法（引用链法）：从GC Roots对象开始向下搜索。java中的GC Roots对象：**1.虚拟机栈中引用的对象，2.方法区静态属性引用的对象，3.方法区常量引用的对象，4.本地方法JNI引用的对象**

   如果对象在可达性分析中没有GC Roots的引用链，那么会进行**一次标记和筛选**，筛选的条件是是否有必要执行finalize()方法。如果对象定义了finalize()方法，那么对象将会放到一个叫做F-Queue的队列中，由专门的一个低优先级的线程去执行。并且不会保证一定执行完毕。如果finalize()执行缓慢或者发送死锁，会导F-Queue一直等待。

   执行完毕之后，GC会对F-Queue中的对象进行**二次标记**，这是对象被移除F-Queue集合，等待被回收。

## 运行时数据区域

运行时数据区域又可以分为5个部分：

1. **Method Area**

> 注意在JDK8之前，HotSpot JVM中对方法区的实现叫做持久代Perm Gen。不过在JDK8之后，Perm Gen已经被取消了，现在叫做Metaspace。Metaspace并不在java虚拟机中，它使用的是本地内存。Metaspace可以通过-XX:MaxMetaspaceSize来控制。

主要是存储类信息，**常量池（static常量和static变量）**，编译后的代码（字节码）等数据

2. **Heap Area**

Heap Area主要存储类对象和数组。垃圾回收器（GC）主要就是用来回收Heap Area中的对象的。

3. **Stack Area**

因为是栈的结构，所以这个区域总是LIFO(Last in first out)。我们考虑一个方法的执行，当方法执行的时候，就会在Stack Area中创建一个block，这个block中持有对本地对象和其他对象的引用。一旦方法执行完毕，则这个block就会出栈，供其他方法访问。

是描述java 方法执行的内存模型，每个方法在执行的同时都会创建一个栈帧（Stack Frame）用于**存储局部变量表、操作数栈、动态链接、方法出口**等信息

4. **PC Registers**

PC Registers主要用来对程序的执行状态进行跟踪，比如保存当前的执行地址，和下一步的地址等。

5. **Native Methods**

最后一个就是本地方法区了，因为JVM的底层很多都是由C/C++来实现的，这些方法的实现就构成了本地方法区。

其他：**NIO Direct Buffer, Compressed Class space, Code cache**

## 常量池

1. **类文件常量池（Class Constant Pool）**：

    - 这个常量池存在于每个Class文件中，也被称为静态常量池。
    - 它包括了各种字面量和符号引用，如类和接口名、字段名和其他类名等。
    - 类文件常量池是在编译时创建并随着Class文件一起存储的。

2. **运行时常量池（Runtime Constant Pool）**：1.6 方法区，1.7堆，**1.8元空间**

    - 当类和接口被加载到JVM后，类文件常量池中的内容会被存放到运行时常量池中。

    - 运行时常量池是每个类和接口的运行时表示的一部分，它包含了许多类级别的数据，包括方法和字段的引用。

    - 与类文件常量池相比，运行时常量池具有动态性，可以在运行时添加新的常量。

    - 运行时常量池中有两种类型，分别是symbolic references**符号引用**和static constants**静态常量**。

      什么是静态常量，什么是符号引用呢？ 我们举个直观的例子。

      ```
      String site="www.flydean.com"
      ```

      上面的字符串"www.flydean.com"可以看做是一个静态常量，因为它是不会变化的，是什么样的就展示什么样的。

      而上面的字符串的名字“site”就是符号引用，需要在运行期间进行解析，为什么呢？

      因为site的值是可以变化的，我们不能在第一时间确定其真正的值，需要在动态运行中进行解析。

3. **字符串常量池（String Constant Pool）**：

    - 字符串常量池用于存储字符串字面量和引用。
    - 在JDK 1.7之后，字符串常量池被移到了Java堆中。
    - 当创建字符串时，JVM会首先检查字符串常量池中是否已存在相同内容的字符串。如果存在，则返回该字符串的引用；如果不存在，则在常量池中创建一个新的字符串对象。

4. **基本类型常量池（Primitive Types Constant Pool）**：

    - 用于缓存基本类型的包装类对象，如`Integer`、`Byte`、`Character`等。
    - 这些包装类在某个范围内的值被预先缓存，例如`Integer`缓存了从-128到127之间的值。

## 符号引用

符号引用与虚拟机实现的布局无关，引用的目标并不一定要已经加载到内存中。各种虚拟机实现的内存布局可以各不相同，但是它们能接受的符号引用必须是一致的，因为符号引用的字面量形式明确定义在Java 虚拟机规范的Class 文件格式中。

符号引用就是class 文件中的：

1. CONSTANT_Class_info

2. CONSTANT_Field_info

3. CONSTANT_Method_info

等类型的常量。

## 直接引用

直接引用可以是指向目标的指针，相对偏移量或是一个能间接定位到目标的句柄。如果有了直接引用，那引用的目标必定已经在内存中存在。

## cacheLine

CPU的处理速度是有限的，为了提升CPU的处理速度，现代CPU都有一个叫做CPU缓存的东西。

而这个CPU缓存又可以分为L1缓存，L2缓存甚至L3缓存。

其中L1缓存是每个CPU核单独享有的。在L1缓存中，又有一个叫做Cache line的东西。为了提升处理速度，CPU每次处理都是读取一个Cache line大小的数据。

## false-sharing

在多线程的环境中，thread1对a进行累加，而thread2对b进行累加。会发生什么情况呢？

1. 第一步，新创建出来的对象被存储到CPU1和CPU2的缓存cache line中。
2. thread1使用CPU1对对象中的a进行累计。
3. 根据CPU缓存之间的同步协议MESI（这个协议比较复杂，这里就先不展开讲解），因为CPU1对缓存中的cache line进行了修改，所以CPU2中的这个cache line的副本对象将会被标记为I（Invalid）无效状态。
4. thread2使用CPU2对对象中的b进行累加，这个时候因为CPU2中的cache line已经被标记为无效了，所以必须重新从主内存中同步数据。

## 使用JOL来分析java对象空间占用情况

可以分析class，也可以分析对象

## 对象结构

java对象的结构可以分为普通java对象和数组对象两种：

<img src="https://img-blog.csdnimg.cn/20200618135903311.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70" style="zoom:33%;" />

数组对象在对象头中多了一个4字节的长度字段。

大家看到最后的字节是padding填充字节，为什么要填充呢？

因为JVM是以8字节为单位进行操作的，如果不是8字节的整数倍，则需要补全。

## 对象头

<img src="https://img-blog.csdnimg.cn/20200618121615778.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70" style="zoom:33%;" />

javaObject对象的对象头大小根据你使用的是32位还是64位的虚拟机的不同，稍有变化。这里我们使用的是64位的虚拟机为例。

Object的对象头，分为两部分，第一部分是Mark Word，用来存储对象的运行时数据比如：hashcode，GC分代年龄，锁状态，持有锁信息，偏向锁的thread ID等等。

在64位的虚拟机中，Mark Word是64bits，如果是在32位的虚拟机中Mark Word是32bits。

第二部分就是Klass Word，Klass Word是一个类型指针，指向class的元数据，JVM通过Klass Word来判断该对象是哪个class的实例。

如果没有开启COOPs就是128bits，如果开启了COOPs，那么Klass Word的大小就从64bits降到了32bits。

数组的对象头是16字节，比普通对象的对象头多出了4个字节。这4个字节就是数组的长度。

## 类加载器

类加载系统分为三个阶段，分别是加载，链接和初始化。

java中有个专门的ClassLoader来负责这个事情。

在JDK9之前，系统默认有三个类加载器，分别是：Bootstrap ClassLoader，Extension ClassLoader，System ClassLoader
在JDK9之后，因为引入了JPMS模块的概念，所以类加载器变得不一样了，在JDK9之后还是有三个内置的类加载器，分别是BootClassLoader，PlatformClassLoader和AppClassLoader

双亲委派模型机制：当类收到了类加载请求，不会自己先去加载这个类，而是将其委派给父类，由父类去加载，如果父类不能加载，则反馈给子类，由子类完成类的加载。

## 如何自定义类加载器

如果想要编写自己的类加载器，只需要两步：

- 继承ClassLoader类
- 覆盖findClass(String className)方法

**ClassLoader**超类的`loadClass`方法用于将类的加载操作委托给其父类加载器去进行，只有当该类尚未加载并且父类加载器也无法加载该类时，才调用findClass方法。

如果要打破双亲委派机制，需要重写loadClass方法。

## 类加载过程

java中类加载过程可以分为7个过程：

1.加载

2.链接分为三小步

2.1.验证：文件格式验证，元数据验证，字节码验证，符号引用验证

2.2.准备：类的静态变量分配内存并初始化为默认值，内存在方法区分配。

2.3.解析：符号引用到直接引用的转换

3.初始化：执行类中定义的java代码

4.使用

5.卸载

## class加载的原理

首先JVM将class文件使用类加载器加载到内存中。

隐式加载：使用new方式创建对象时会隐式调用类加载器。

显示加载：调用class.forName()来加载

java是动态加载的，不会一次性将所有的类都加载

## 双亲委派模型

其工作原理的是，如果一个类加载器收到了类加载请求，它并不会自己先去加载，而是把这个请求委托给父类的加载器去执行，如果父类加载器还存在其父类加载器，则进一步向上委托，依次递归，请求最终将到达顶层的启动类加载器，如果父类加载器可以完成类加载任务，就**成功返回**，倘若父类加载器无法完成此加载任务，**子加载器才会尝试自己去加载**，这就是双亲委派模式

采用双亲委派模式的是好处是Java类随着它的类加载器一起具备了一种**带有优先级的层次关系**，通过这种层级关可以**避免类的重复加载**，当父亲已经加载了该类时，就没有必要子ClassLoader再加载一次。

其次是考虑到安全因素，java核心api中定义类型不会被随意替换，假设通过网络传递一个名为java.lang.Integer的类，通过双亲委托模式传递到启动类加载器，而启动类加载器在核心Java API发现这个名字的类，发现该类已被加载，并不会重新加载网络传递的过来的java.lang.Integer，而直接返回已加载过的Integer.class，这样便可以**防止核心API库被随意篡改**。

## JDBC为例谈双亲委派模型的破坏

不破坏的情况：

核心就是这句Class.forName()触发了mysql驱动的加载，我们看下mysql对Driver接口的实现：

```java
public class Driver extends NonRegisteringDriver implements java.sql.Driver {
    public Driver() throws SQLException {
    }

    static {
        try {
            DriverManager.registerDriver(new Driver());
        } catch (SQLException var1) {
            throw new RuntimeException("Can't register driver!");
        }
    }
}
```

可以看到，Class.forName()其实触发了静态代码块，然后向DriverManager中注册了一个mysql的Driver实现。
这个时候，我们通过DriverManager去获取connection的时候只要遍历当前所有Driver实现，然后选择一个建立连接就可以了。

破坏的情况：

在JDBC4.0以后，开始支持使用spi的方式来注册这个Driver，具体做法就是在mysql的jar包中的META-INF/services/java.sql.Driver 文件中指明当前使用的Driver是哪个

可以看到这里直接获取连接，省去了上面的Class.forName()注册过程。
现在，我们分析下看使用了这种spi服务的模式原本的过程是怎样的:

- 第一，从META-INF/services/java.sql.Driver文件中获取具体的实现类名“com.mysql.jdbc.Driver”
- 第二，加载这个类，这里肯定只能用class.forName("com.mysql.jdbc.Driver")来加载

好了，问题来了，Class.forName()加载用的是调用者的Classloader，这个调用者DriverManager是在rt.jar中的，ClassLoader是启动类加载器，而com.mysql.jdbc.Driver肯定不在<JAVA_HOME>/lib下，所以肯定是无法加载mysql中的这个类的。这就是双亲委派模型的局限性了，**父级加载器无法加载子级类加载器路径中的类。**

这个mysql的drvier只有应用类加载器能加载，那么我们只要在启动类加载器中有方法获取应用程序类加载器，然后通过它去加载就可以了。这就是所谓的线程上下文加载器。

## 压缩对象指针技术

对象指针用来指向一个对象，表示对该对象的引用。通常来说在64位机子上面，一个指针占用64位，也就是8个字节。而在32位机子上面，一个指针占用32位，也就是4个字节。

实时上，在应用程序中，这种对象的指针是非常非常多的，从而导致如果同样一个程序，在32位机子上面运行和在64位机子上面运行占用的内存是完全不同的。64位机子内存使用可能是32位机子的1.5倍。

而压缩对象指针，就是指把64位的指针压缩到32位。

怎么压缩呢？64位机子的对象地址仍然是64位的。压缩过的32位存的只是相对于heap base address的位移。

我们使用64位的heap base地址+ 32位的地址位移量，就得到了实际的64位heap地址。

对象指针压缩在Java SE 6u23 默认开启。在此之前，可以使用-XX:+UseCompressedOops来开启。

## Dirty cards

我们知道，GC的扫描是从一些根对象开始的，这些Root对象包括：正在执行的方法中的本地对象和输入参数。活动的线程，加载类中的static字段和JNI引用。

而这些根对象，一般都是存储在old space中的。

通常来说old space的空间都会比较大。每次要要找到Eden和suvivor Space中哪些对象不再被引用，需要扫描整个old space肯定是不可取的。
Dirty cards说起来很简单，就是每当有程序对引用进行修改的时候，我们都会在一个Dirty cards的空间记录一下被修改的memory page。

这样在minor GC的时候，当引用的对象被修改了之后，我们会同步修改对应的Dirty cards。这样每次扫描old space的时候，只需要选择那些标记为Dirty cards的对象就可以了，避免了全局扫描。

## TLAB

在Eden空间分配对象的，为了提升分配的效率，使用了TLAB的计算。
TLAB的全称是Thread-Local Allocation Buffers。Thread-Local大家都知道吧，就是线程的本地变量。而TLAB则是线程的本地分配空间。

## PLAB

在对象从Eden空间提升到Suvivor Space和old Space的时候可以使用PLAB：
PLAB（ promotion local allocation buffer）。每一个线程在survival space和old space中都一个PLAB。在提升的时候，可以避免多线程的竞争，从而提升效率。
我们可以使用-XX:+AlwaysTenure 将对象直接从Eden space提升到old space。

## 栈上分配

逃逸分析的结果就是JVM会在栈上分配对象，从而提升效率。
如果一个对象的分配是在方法内部，并且没有多线程访问的情况下，那么这个对象其实可以看做是一个本地对象，这样的对象不管创建在哪里都只对本线程中的本方法可见，因此可以直接分配在栈空间中。

## old space直接分配

如果你分配对象大小超过了Eden space的大小，是不是就只有old space可以分配对象。
我们可以通过设置-XX:PretenureSizeThreshold=n 来指定对象的大小，如果对象大小大于n，那么就直接在old space分配。

> 注意，如果这个对象的大小比TLPB要小，那么会首先在TLPB中分配。所以使用的时候要注意限制TLPB的大小。

## JIT和分层编译

因为javac的编译只能做少量的优化，其实大量的动态优化是在JIT中做的。C2相对于C1，其优化的程度更深，更加激进。

JITWatch是一个大神做的JIT日志的可视化分析工具。

大概来说分层编译可以分为三层：

1. 第一层就是禁用C1和C2编译器，这个时候没有JIT进行。
2. 第二层就是只开启C1编译器，因为C1编译器只会进行一些简单的JIT优化，所以这个可以应对常规情况。
3. 第三层就是同时开启C1和C2编译器。

## 循环展开和粗化锁

循环展开就是对循环进行优化，减少循环次数。
粗化锁是指锁的锁定范围变宽

## Intrinsic Methods

内置方法就是编译器内置的方法实现,java.lang.Math中大部分的方法都是intrinsic的方法。

在Hotspot VM中其实有3中编译器。
第一种就是javac将java源代码编译成为字节码。

在这一层，只有一些math方法和bootstrapping的MethodHandle是在这一层实现的。

第二种就是在JIT的Client Compiler (C1)。

第三种就是在JIT的Server Compiler (C2)。

## 偏向锁，轻量级锁和重量级锁

在Java HotSpot VM中，每个对象前面都有一个class指针和一个Mark Word。 Mark Word存储了哈希值以及分代年龄和标记位等，通过这些值的变化，JVM可以实现对java对象的不同程度的锁定。

在64位的虚拟机中，Mark Word是64bits，如果是在32位的虚拟机中Mark Word是32bits。

第二部分就是Klass Word，Klass Word是一个类型指针，指向class的元数据，JVM通过Klass Word来判断该对象是哪个class的实例。

偏向锁下次进入的时候不需要执行CAS命令，只做线程ID的比较即可。

轻量级锁进入和退出同步块都需要执行CAS命令，但是轻量级锁不会阻塞，它使用的是自旋命令来获取锁。

重量级锁不使用自旋，但是会阻塞线程。

## safe Point

为了实现STW的功能，JVM需要提供一个机制，让所有的线程可以在某一个时刻同时停下来。这个停下来的时刻就叫做safepoints。

> 注意，这些停下来的线程不包括运行native code的线程。因为这些线程是不属于JVM管理的。

java程序里面有很多很多的java线程，每个java线程又有自己的stack，并且共享了heap。这些线程一直运行呀运行，不断对stack和heap进行操作。

这个时候如果JVM需要对stack和heap做一些操作该怎么办呢？

比如JVM要进行GC操作，或者要做heap dump等等，这时候如果线程都在对stack或者heap进行修改，那么将不是一个稳定的状态。GC直接在这种情况下操作stack或者heap，会导致线程的异常。

怎么处理呢？

这个时候safepoint就出场了。

safepoint就是一个安全点，所有的线程执行到安全点的时候就会去检查是否需要执行safepoint操作，如果需要执行，那么所有的线程都将会等待，直到所有的线程进入safepoint。

然后JVM执行相应的操作之后，所有的线程再恢复执行。

safepoint一般出现的位置：

1. 循环的末尾 (防止大循环的时候一直不进入safepoint，而其他线程在等待它进入safepoint)
2. 方法返回前
3. 调用方法的call之后
4. 抛出异常的位置

## stack frame

JVM中的stack area是由一个个的Frame组成的。

Frame主要用来**存储数据和部分结果，以及执行动态链接，方法的返回值和调度异常**。

每次调用方法时都会创建一个新Frame。当Frame的方法调用完成时，无论该方法是正常结束还是异常结束（它引发未捕获的异常），这个frame都会被销毁。
在线程的执行过程中，任何一个时刻都只有一个frame处于活动状态。这个frame被称为current frame，它的方法被称为current 方法，定义当前方法的类是当前类。

## virtual call

在父子类的情况下，如果同一方法在父类和子类有两个不同的实现，那么在调用的时候，根据传入的参数不同，会去调用不同的方法实现。

VMT(Virtual Method Table)，这个VMT存储的是该class对象中所有的Virtual Method。
然后class的实例对象保存着一个VMT的指针，执行VMT。
程序运行的时候首先加载实例对象，然后通过实例对象找到VMT，通过VMT再找到对应的方法地址。
Virtual Call意思是调用方法的时候需要依赖不同的实例对象。而classic call就是直接指向方法的地址，而不需要通过VMT表的转换。

所以classic call通常会比Virtual Call要快。

在java中除了static, private和构造函数之外，其他的默认都是Virtual Call。

## java内存模型(JMM)和happens-before

**JMM就是JVM中必须遵守的一组最小保证，它规定了对于变量的写入操作在什么时候对其他线程是可见的**。

为了保证java内存模型中的操作顺序，**JMM为程序中的所有操作定义了一个顺序关系**，这个顺序叫做**Happens-Before**。要想保证操作B看到操作A的结果，不管A和B是在同一线程还是不同线程，那么A和B必须满足Happens-Before的关系。如果两个操作不满足happens-before的关系，那么JVM可以对他们任意重排序。

1. 程序顺序规则： 如果在程序中操作A在操作B之前，那么在同一个线程中操作A将会在操作B之前执行。

> 注意，这里的操作A在操作B之前执行是指在单线程环境中，虽然虚拟机会对相应的指令进行重排序，但是最终的执行结果跟按照代码顺序执行是一样的。虚拟机只会对不存在依赖的代码进行重排序。

2. 监视器锁规则： 监视器上的解锁操作必须在同一个监视器上面的加锁操作之前执行。

> 锁我们大家都很清楚了，这里的顺序必须指的是同一个锁，如果是在不同的锁上面，那么其执行顺序也不能得到保证。

3. volatile变量规则： 对volatile变量的写入操作必须在对该变量的读操作之前执行。

> 原子变量和volatile变量在读写操作上面有着相同的语义。

4. 线程启动规则： 线程上对Thread.start的操作必须要在该线程中执行任何操作之前执行。

5. 线程结束规则： 线程中的任何操作都必须在其他线程检测到该线程结束之前执行。

6. 中断规则： 当一个线程再另一个线程上调用interrupt时，必须在被中断线程检测到interrupt调用之前执行。

7. 终结器规则： 对象的构造函数必须在启动该对象的终结器之前执行完毕。

8. 传递性： 如果操作A在操作B之前执行，并且操作B在操作C之前执行，那么操作A必须在操作C之前执行。

JVM在类被加载之后和被线程使用之前，会进行静态初始化，而在这个初始化阶段将会获得一个锁，从而保证在静态初始化阶段内存写入操作将对所有的线程可见。

构造函数中含有final域的对象初始化，对于正确构造的对象，初始化对象保证了所有的线程都能够正确的看到由构造函数为对象给各个final域设置的正确值，包括final域可以到达的任何变量（比如final数组中的元素，final的hashMap等）。
上面的例子中，我们定义了一个final对象，并且在构造函数中初始化了这个对象。那么这个final对象是将不会跟构造函数之后的其他操作重排序。

## Java反射机制(创建Class对象的三种方式）

JAVA反射机制是在运行状态中，对于任意一个类。都能都知道这个类的所有属性和方法，对于任意一个对象，都能够调用它的任意一个方法和属性；这种动态获取的信息以及动态调用对象的方法的功能称之为java语言的反射机制；

反射的机制，无非就是先加载对应字节码中的类，然后，根据加载类的信息，一点点的去解剖其中的内容。

```
方式一：(对象.getClass())，获取person类中的字节码文件
Person p1 = new Person("小明" ,20,'男' );
Class class1 = p1.getClass();
```

```java
方式二：(类.class:需要输入一个明确的类，任意一个类型都有一个静态的class属性)
 Class class3 = Person.class;
```

```
Class.forName("cn.itcast.Person")
```

## Class.forName和ClassLoader的区别？

a).Class.forName除了将类的.class文件加载到jvm中之外，还会对类进行解释，执行**类中的static块**。

b).而classloader只干一件事情，就是将.class文件加载到jvm中，不会执行static中的内容，只有在newInstance才会去执行static块。

c).Class.forName(name,initialize,loader)带参数也可控制**是否加载static块**。并且只有调用了newInstance()方法采用调用构造函数，创建类的对象。



# 异常检测

## 死锁检测

control+break 或者kill -QUIT pid命令来dump出heap信息

使用命令 jstack -l 1346 查看线程栈信息，锁问题

## 使用JFR分析性能问题

还好JVM引入了JFR，可以通过JFR来监控和分析JVM的各种事件。通过这些事件的分析，我们可以找出潜在的问题。

jdk.ThreadStart，jdk.ThreadEnd，jdk.ThreadSleep，jdk.ThreadPark。

可以使用JMC（JDK Mission Control），那么可以很直观的查看JFR的各种事件。

## 内存泄露

两种情况：

1. 长生命周期对象引用了短生命周期对象

2. 对象被存储到HashSet中后，对象的hash值被修改了，导致无法从当前hashSet中删除该对象，导致内存泄露。

使用JFR来监听JVM的事件：关注OldObjectSample事件，就是对生命周期比较长的对象进行取样，我们可以通过研究这些对象，来检查潜在的内存泄露。



jmap -dump:live,format=b,file=/xx/xxx/xxx.hprof <pid>

- 查看gc回收统计情况：jstat -gc pid 1000(每隔ms数) 5(输出次数)
- 查看内存使用情况：jmap -heap pid
- 查看内存中对象数据：jmap -histo:live <pid> | more

## OOM的种类

java.lang.OutOfMemoryError: Java heap space

java.lang.OutOfMemoryError: GC Overhead limit exceeded 如果一个java程序98%的时间都在做GC操作，但是只恢复了2%的heap空间，并且持续5次。那么java.lang.OutOfMemoryError将会被抛出。

java.lang.OutOfMemoryError: Requested array size exceeds VM limit 这个错误的意思是，要分配的array比heap size大。

java.lang.OutOfMemoryError: Metaspace

java.lang.OutOfMemoryError: request size bytes for reason. Out of swap space?当本地堆分配失败并且本地堆即将耗尽的时候就会报这个异常。

java.lang.OutOfMemoryError: Compressed class space

OutOfMemoryError: reason stack_trace_with_native_method这个错误表示本地方法遇到分配失败。遇到这种问题可能需要操作系统的本地调试工具来解决。

