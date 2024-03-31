---
slug: /collision-attack
---

# 30. 密码学系列之:碰撞抵御和碰撞攻击collision attack

# 简介

hash是密码学和平时的程序中经常会用到的一个功能，如果hash算法设计的不好，会产生hash碰撞，甚至产生碰撞攻击。

今天和大家详细探讨一下碰撞攻击。

# 什么是碰撞攻击

所谓碰撞攻击指的是对于同一个hash函数来说，两个不同的input通过hash计算得到了同样的hash值。用公式来说就是：

~~~java
hash(m1) = hash(m2)
~~~

这个攻击有什么作用呢？

举个例子，通常我们通过网络下载应用程序或者软件，除了下载链接之外，还会提供一个MD5的校验码。这个校验码就是用来校验下载的软件是不是官方提供的软件。

MD5算法也是一种hash算法，如果恶意用户可以构造一个和原始软件一样MD5的软件的话，就很可能实施碰撞攻击。

还有一种情况用在数字签名中。在数字签名中，因为效率的原因，如果文章特别大的情况下，通常会先取文章的hash值，然后对这个hash进行签名。

所以这里面有两个可以被攻击的地方，一个就是hash碰撞，一个就是签名算法。

举个例子，比如说师妃暄给徐子陵写了一封信A，说是凌晨的时候在竹林有事情相告，但是没有直接交给徐子陵而是给了他的好兄弟寇仲，寇仲考虑到夜晚太危险了，不想让他的好兄弟冒险，于是伪造了这封信A，构造了和原来的信A同样hash值的信B，并附带了师妃暄的签名。

徐子陵收到了信B和签名，经过验证发现确实是师妃暄写的，于是就没有去赴约。

碰撞攻击取决于hash算法的强度，像是MD5和SHA-1这些hash算法已经被证明是不安全的，可以在很快的时间内被攻破。

# 选择前缀冲突攻击

除了前面传统的碰撞攻击之外，还有一种叫做Chosen-prefix collision attack选择前缀冲突攻击。

攻击者可以选择两个不同的前缀p1和p2,然后附在不同的字符串m1,m2前面，那么有：

~~~java
 hash(p1 ∥ m1) = hash(p2 ∥ m2)    其中 ∥ 表示连接符
~~~

我们看一个在SHA-1中由盖坦.勒伦（Gatan Leurent）和托马.佩林（Thomas Peyrin）发现的一个攻击的例子，这是两个分别带有前缀99040d047fe81780012000和99030d047fe81780011800的例子。

两个消息内容可以从下面下载：

messageA: sha-mbles.github.io/messageA

messageB:sha-mbles.github.io/messageB

我们可以看下消息的截图：

![](https://img-blog.csdnimg.cn/20201119001018618.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这两个消息经过sha1sum运算，可以得到相同的hash值。

sha1sum messageA ： 8ac60ba76f1999a1ab70223f225aefdc78d4ddc0

sha1sum messageB： 8ac60ba76f1999a1ab70223f225aefdc78d4ddc0

# java中的hash攻击

java中有一个经常会用到的类叫做hashMap，在JDK7之前，HashMap在存储数据的时候如果遇到了hash冲突，则会将数据以链表的形式插入到这个hash节点的最后。

![](https://images2017.cnblogs.com/blog/926638/201708/926638-20170809132741792-1171090777.png)

这样会有什么缺点呢？

那么就是如果有恶意攻击者，一直向hashMap中插入同样hash值的key对象，那么hashMap实际上就会退化成为一个链表。

这样会大大影响hashMap的查询效率。如果数据特别大的话，可能就会导致DDOS攻击。

这个问题的根本原因就是java中hashMap中的hash计算太过简单，很容易就能够找到相同hash值的key。

实际上在2011年tomcat还发布了一个关于这个问题的漏洞解决方案。

虽然这是java的问题，但是最后的锅还是由tomcat来背。tomcat的做法就是限制maxPostSize，从最大的20M改成了10K，这样可以有效的减少请求中的item大小。

当然，在JDK8中，原来的链表结构已经被改成了红黑树结构，相信也是为了避免这种DDOS hash攻击的方案。

# 原像攻击Preimage attack

和碰撞攻击类似的还有一个攻击叫做原像攻击。

原像攻击的抵御需要满足两个条件，第一个条件是给定一个hash值y，很难找到一个x，使得hash（x）=y。

第二个条件就是给定一个x，很难找到一个y，使得hash(x) = hash(y)。

很明显，碰撞攻击的抵御一定满足第二个条件，但是不一定满足第一个条件。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！










