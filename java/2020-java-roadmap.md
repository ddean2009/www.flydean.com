java程序员从小工到专家成神之路（2020版）

java作为第一大编程语言，可谓源远流长，一代又一代的java程序员前仆后继走在java学习的路上。java程序员的学习之路在2020年又有什么变化呢？本文详细附上了每一个部分所需知识的教程链接地址，并会持续更新，希望能够和大家一起进步！

先上图：

![](https://img-blog.csdnimg.cn/20200408145430519.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上面的RoadMap图中列出了作为一个java程序员需要掌握的技术路线，所有技术都懂那当然非常好，如果还没掌握也没关系，just keep learning!

## 必须掌握的基础知识

作为程序员当然是有门槛的，这个门槛就是所需要掌握的基础知识，写好了程序不仅要知其然，更要知其所以然。这样才能在写程序的过程中，透过现象看到本质，从本质上提升写代码的功力。

### 1. Git & Github

Github作为全球最大的同性交友平台，是个程序员都应该知道。作为开源风潮的托管平台，GitHub上面有大量的优秀开源项目，如果有需可以从GitHub上面借用各种项目，没有需要也可以去读读上面的代码，提升下写作水平。

Git作为优秀的版本管理工具，相信绝大多数公司都在使用，那么掌握Git的命令和使用就是非常重要了。更为重要的是，Git通过git flow带给我们了代码管理的新思路。

![](https://img-blog.csdnimg.cn/20200408112529372.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

### 2. Linux

很多程序员用惯了windows可能对Linux并不熟悉，但是大家要知道绝大多数的服务器都是部署在Linux上面的，不懂Linux就说自己懂编程，岂不是很搞笑？连自己写出来的代码运行的平台都不了解,怎么可以。即使不是运维专员，自己部署程序也要会的，部署中需要注意的问题肯定要关注，至于Linux的基本命令那更是要100%掌握。

### 3. 数据结构和算法

如果只是使用java中的库，那么至少array, linked list, hash table, binary tree, queue, stack, graph这些基本的数据结构是需要掌握的。

如果你想更深入一些Trie, B-Tree, AVL tree等等可以了解一下。

### 4. HTTP / HTTPS

现在是Web的天下了，搞懂HTTP,HTTPS走遍天下都不怕。

可以参考之前我的文章：

[一篇文章让你彻底弄懂SSL/TLS协议](http://www.flydean.com/ssl-tls-all-in-one/)

### 5. 设计模式

![](https://img-blog.csdnimg.cn/20200404104728815.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

设计模式可以说是大神和小工的分界线，各种设计模式信手拈来才能成为设计专家。

当然这里不是要你死记硬背，关键是合理应用。

### 6. 计算机原理

知道计算机是怎么工作的很重要，你的代码，程序怎么转换成计算机可以懂的语言，CPU的调度原理，内存工作原理等等。

## java学习之路

有了上面的基础，终于我们可以开始讲java的学习之路了。

### 1. 工具

#### 1.1 开发工具
  
工欲善其事，必先利其器。有了好的工具可以有效的提升开发效率。Eclipse和IDEA当然是IDE的首选。

[2020年,5个你不能不知道的java IDE神器](https://blog.csdn.net/superfjj/article/details/105357839)

#### 1.2 构建工具

maven和Gradle是java构建工具的不三之选，这两个优选一个。ANT是之前的构建工具，不需要详细掌握，了解即可。

#### 1.3 虚拟化工具

Docker的横空出世，打造了一个新的虚拟化时代，凭借其优异的性能和资源占用率，Docker赢得了很多企业的喜爱，Docker一定要学。有了docker接下来使用Kubernetes(K8S)来做管理则是水到渠成。

#### 1.4 CI工具

Jenkins是CI的很好的工具。

### 2. JDK 

JDK的熟练程度直接关系到能不能写出好的代码，接下来我们详细来看。

#### 2.1 Java Collections

集合类是在任何程序中都要使用到的类型，这几个是你必须要熟悉的 ArrayList, HashMap, HashSet, LinkedHashSet, TreeSet。熟悉使用熟悉其实现原理。下面是我整理和写过的关于Java集合的相关文章：

* [fail-safe fail-fast知多少](https://blog.csdn.net/superfjj/article/details/105853180)
* [Iterator to list的三种方法](https://blog.csdn.net/superfjj/article/details/105853198)
* [asList和ArrayList不得不说的故事](https://blog.csdn.net/superfjj/article/details/105873920)
* [Copy ArrayList的四种方式](https://blog.csdn.net/superfjj/article/details/105873946)
* [深入理解HashMap和TreeMap的区别](https://blog.csdn.net/superfjj/article/details/105886065)
* [深入理解HashMap和LinkedHashMap的区别](https://blog.csdn.net/superfjj/article/details/105886076)
* [一文弄懂EnumMap和EnumSet](https://blog.csdn.net/superfjj/article/details/105898895)
* [java中Comparable和Comparator的区别](https://blog.csdn.net/superfjj/article/details/105898913)
* [SkipList和java中ConcurrentSkipListMap的实现](https://blog.csdn.net/superfjj/article/details/105912308)
* [一文弄懂java中的Queue家族](https://blog.csdn.net/superfjj/article/details/105927079)
* [PriorityQueue和PriorityBlockingQueue](https://blog.csdn.net/superfjj/article/details/105927086)
* [SynchronousQueue详解](https://blog.csdn.net/superfjj/article/details/105942907)
* [java中DelayQueue的使用](https://blog.csdn.net/superfjj/article/details/105942915)
* [JDK12的新特性:teeing collectors](https://blog.csdn.net/superfjj/article/details/106089561)



#### 2.2 Java并发和多线程

java中多线程和并发是一个非常重要的话题，concurrency包里面提供了诸多非常有用的同步类：CyclicBarrier，CountDownLatch，Semaphore等等。

concurrency包下面的Locks和Atomic提供了一些新的锁的实现。深入了解这些内容可以更好的理解多线程环境中资源的使用。

Thread和Thread Pool是多线程的基础，需要深入理解和应用。

Java并发和多线程的文章如下：

* [java.util.concurrent简介](https://blog.csdn.net/superfjj/article/details/104667750)
* [java并发中的Synchronized关键词](https://blog.csdn.net/superfjj/article/details/104689014)
* [java中的Volatile关键字使用](https://blog.csdn.net/superfjj/article/details/104709152)
* [java中wait和sleep的区别](https://blog.csdn.net/superfjj/article/details/104727406)
* [java中Future的使用](https://blog.csdn.net/superfjj/article/details/104745793)
* [java并发中ExecutorService的使用](https://blog.csdn.net/superfjj/article/details/104769704)
* [java中Runnable和Callable的区别](https://blog.csdn.net/superfjj/article/details/104789468)
* [java中ThreadLocal的使用](https://blog.csdn.net/superfjj/article/details/104812417)
* [java中线程的生命周期](https://blog.csdn.net/superfjj/article/details/104834966)
* [java中join的使用](https://blog.csdn.net/superfjj/article/details/104854553)
* [怎么在java中关闭一个thread](https://blog.csdn.net/superfjj/article/details/104873694)
* [java中的Atomic类](https://blog.csdn.net/superfjj/article/details/104891778)
* [java中interrupt,interrupted和isInterrupted的区别](https://blog.csdn.net/superfjj/article/details/104914446)
* [java中的daemon thread](https://blog.csdn.net/superfjj/article/details/104937080)
* [java中ThreadPool的介绍和使用](https://blog.csdn.net/superfjj/article/details/104960118)
* [java 中的fork join框架](https://blog.csdn.net/superfjj/article/details/104983512)
* [java中Locks的使用](https://blog.csdn.net/superfjj/article/details/105042006)
* [java并发中CountDownLatch的使用](https://blog.csdn.net/superfjj/article/details/105065193)
* [java中CyclicBarrier的使用](https://blog.csdn.net/superfjj/article/details/105087460)
* [在java中使用JMH（Java Microbenchmark Harness）做性能测试](https://blog.csdn.net/superfjj/article/details/105110660)
* [java中ThreadLocalRandom的使用](https://blog.csdn.net/superfjj/article/details/105134000)
* [java中FutureTask的使用](https://blog.csdn.net/superfjj/article/details/105163033)
* [关于CompletableFuture的一切，看这篇文章就够了](https://blog.csdn.net/superfjj/article/details/105191889)
* [Phaser都不懂，还学什么多线程](https://blog.csdn.net/superfjj/article/details/105214720)
* [java中使用Semaphore构建阻塞对象池](https://blog.csdn.net/superfjj/article/details/105238485)
* [在java中构建高效的结果缓存](https://blog.csdn.net/superfjj/article/details/105262027)
* [java中CompletionService的使用](https://blog.csdn.net/superfjj/article/details/105285348)
* [使用ExecutorService来停止线程服务](https://blog.csdn.net/superfjj/article/details/105380106)
* [万万没想到,线程居然被饿死了！](https://blog.csdn.net/superfjj/article/details/105404188)
* [java中有界队列的饱和策略(reject policy)](https://blog.csdn.net/superfjj/article/details/105427454)
* [由于不当的执行顺序导致的死锁](https://blog.csdn.net/superfjj/article/details/105446788)
* [同步类的基础AbstractQueuedSynchronizer(AQS)](https://blog.csdn.net/superfjj/article/details/105509140)
* [非阻塞同步机制和CAS](https://blog.csdn.net/superfjj/article/details/105529002)
* [非阻塞算法（Lock-Free）的实现](https://blog.csdn.net/superfjj/article/details/105529186)
* [java内存模型(JMM)和happens-before](https://blog.csdn.net/superfjj/article/details/105549370)
* [java并发Exchanger的使用](https://blog.csdn.net/superfjj/article/details/105649637)

#### 2.3 Java 8-15的新特性

Java 8引入了太多太多新的有用的东西，像Lambda,Stream API, Date Time API等待。Java 8引入的函数式编程直接改变了以往的编程习惯。

***JDK8***

* [Java函数式编程和Lambda表达式](http://www.flydean.com/java-function-program-lambda/)
* [java 8 Streams简介](https://blog.csdn.net/superfjj/article/details/105630213)
* [java stream中Collectors的用法](https://blog.csdn.net/superfjj/article/details/105722611)
* [在java 8 stream表达式中实现if/else逻辑](https://blog.csdn.net/superfjj/article/details/105673096)
* [怎么在java 8的map中使用stream](https://blog.csdn.net/superfjj/article/details/105673111)
* [java 8 Stream中操作类型和peek的使用](https://blog.csdn.net/superfjj/article/details/105698527)
* [java 8 stream reduce详解和误区](https://blog.csdn.net/superfjj/article/details/105744124)
* [java 8 stream中的Spliterator简介](https://blog.csdn.net/superfjj/article/details/105761148)
* [怎么break java8 stream的foreach](https://blog.csdn.net/superfjj/article/details/105761161)
* [java 8 lambda表达式中的异常处理](https://blog.csdn.net/superfjj/article/details/105698541)
* [java 8中 predicate chain的使用](https://blog.csdn.net/superfjj/article/details/105804892)
* [java 8中构建无限的stream](https://blog.csdn.net/superfjj/article/details/105830994)
* [自定义parallelStream的thread pool](https://blog.csdn.net/superfjj/article/details/105831009)
* [asList和ArrayList不得不说的故事](https://blog.csdn.net/superfjj/article/details/105873920)
* [java中functional interface的分类和使用](https://blog.csdn.net/superfjj/article/details/105630402)
* [java关于throw Exception的一个小秘密](https://blog.csdn.net/superfjj/article/details/105722604)
* [java 8 stream中的Spliterator简介](https://blog.csdn.net/superfjj/article/details/105761148)
* [怎么break java8 stream的foreach](https://blog.csdn.net/superfjj/article/details/105761161)


当然java 8只是最低的要求，java已经出到了13了，如果有能力的话可以学习Java 9 到 Java 13的新特性: Modules, var for local variables, static factory methods for collections等等。

***JDK9***

待续...

***JDK10***

* [JDK10的新特性:var和匿名类](https://blog.csdn.net/superfjj/article/details/106205992)
* [JDK10的新特性:var泛型和多个接口实现](https://blog.csdn.net/superfjj/article/details/106185160)
* [JDK10的新特性:本地变量类型var](https://blog.csdn.net/superfjj/article/details/106169187)

***JDK11***

* [JDK11的新特性:新的HTTP API](https://blog.csdn.net/superfjj/article/details/106111439)

* [JDK11的新特性:HTTP API和reactive streams](https://blog.csdn.net/superfjj/article/details/106169178)

***JDK12***

* [JDK12的新特性:CompactNumberFormat](https://blog.csdn.net/superfjj/article/details/106089577)
* [JDK12的新特性:teeing collectors](https://blog.csdn.net/superfjj/article/details/106089561)

***JDK13***

***JDK14***

* [JDK14的新特性:JFR,JMC和JFR事件流](https://blog.csdn.net/superfjj/article/details/106067769)
* [jcmd:JDK14中的调试神器](https://blog.csdn.net/superfjj/article/details/106046174)
* [JDK14中的java tools简介](https://blog.csdn.net/superfjj/article/details/106031271)
* [JDK 14的新特性:switch表达式](https://blog.csdn.net/superfjj/article/details/106010894)
* [JDK 14的新特性:文本块Text Blocks](https://blog.csdn.net/superfjj/article/details/106010887)
* [JDK14的新特性:Lombok的终结者record](https://blog.csdn.net/superfjj/article/details/105853175)
* [JDK 14的新特性:更加好用的NullPointerExceptions](https://blog.csdn.net/superfjj/article/details/105804867)
* [JDK 14的新特性:instanceof模式匹配](https://blog.csdn.net/superfjj/article/details/105781962)

***JDK15***

* [JDK 15 JAVA 15的新特性展望](https://blog.csdn.net/superfjj/article/details/105781930)

#### 2.4 Java IO

java.io和java.nio是Java中处理IO的两个包，IO是非常重要的，处理文件读写，包括网络数据流的读写都需要使用到IO。

我们需要掌握java.io包中的File, InputStream, OutputStream, Reader, Writer。

还需要掌握java.nio包中的ByteBuffer, FileChannel, Selector等。

#### 2.5 深入理解JVM
待续...

### 3. 框架

如果想做大型java项目，框架是少不了的，使用框架可以节省开发时间，提升开发效率。

#### 3.1 Spring

java框架最最最流行的就是Spring了。可以说Spring统治了java的大部分江山。说起来Spring还是以EJB的替代品出现的，它摆脱了EJB的复杂性，通过使用AOP和IOC，提供了轻便的可配置的容器，赢得了大片市场。最新的Spring版本是5.*。

除了Spring Core，Spring MVC目前的市场份额也越来越大。做好web开发Spring MVC也是必不可少的。

[Spring 5教程](http://www.flydean.com/category/spring/)

#### 3.2 Spring Boot

虽然Spring简化了EJB，但是还是需要诸多的配置文件，而Spring Boot的出现大大的减少了配置文件的编写。

要问什么框架开发最快最靠谱，Spring Boot肯定要占一席之地。

[Spring Boot教程](http://www.flydean.com/category/spring-boot/)

#### 3.3 Netty & Mina

Netty & Mina是两个NIO框架，其最本质的就是异步的IO，和普通IO最大的区别就是提升效率节约时间。

Spring 5最新引入的Spring Web Reactive就是基于Netty实现的。

待续...

#### 3.4 ORM

ORM框架的使用方便我们对数据库的操作，Hibernate和Mybatis是两个ORM框架的优秀选手。但是据我了解好像国内使用Mybatis的偏多，国外更倾向使用Hibernate。

为什么呢？我的理解Hibernate是JPA的一种实现，更加的标准。

#### 3.5 微服务

这年头如果你不提微服务好像就低人一等。不用怕，Spring特意为我们准备了微服务全家桶Spring Cloud。

并不是所有的服务都需要微服务，微服务也不是越多越好，看项目，看情况，看心情！

待续...

### 4. 测试框架

很多朋友可能喜欢写代码，不喜欢写测试。也有的朋友觉得测试是测试人员做的，跟开发人员没关系。

但是测试真的非常重要，从单元测试到end to end测试到集成测试，我们一直都在路上。

单元测试的几个框架Junit,Mockito,PowerMock都是非常优秀的框架，值得每个java程序员掌握。

其他的可以学习一下Selenium和Cucumber，作为end to end测试，Selenium配合headless chrome，真的不要太爽。

### 5. 实用库

很多时候JDK并没有提供太多的实用库，这时候我们需要借助于第三方的力量。

有很多第三方库都非常优秀，比如google的Guava,Apache的commons包，处理JSON的Jackson JSON，处理日志的Log4J,Slf4j等，都是我们日常所常用的。

## Keep learning

最后，想告诉大家的是要Keep learning，技术革新变化非常快，只有一直学习，才能不掉队不落后，学到老，活到老。希望各个朋友都能一步一个脚印的找到自己的路。毕竟知识没有捷径可走。

大家有感兴趣的技术路线可以回复本文留言给我，我会尽量丰富这个技术路线图，谢谢大家！ 

**最后，感兴趣的朋友可以我点个关注！**

The END！

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！


