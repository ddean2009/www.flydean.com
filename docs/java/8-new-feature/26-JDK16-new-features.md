---
slug: /JDK16-new-features
---

# 26. JDK16的新特性



# 简介

在2021年3月16日，JDK的迎来了它的一个新版本JDK16，虽然JDK16不是LTS版本，但是作为下一个LTS版本JDK17的先行版本，JDK16为我们带来了17个方面的提升,包括了新的语言特性、新的工具、内存管理的提升等方面。

所以一起来看看，JDK16到底为我们提供了些什么新的特性。

# JDK16的新特性

总的来说，JDK16有下面的一些新特性：

* 一些在JDK14中引入的新特性，最终在JDK16中确定了。
* 内存管理的提升
* 新的打包工具
* UNIX-Domain Socket channels
* Value-based Classes的警告
* Encapsulating JDK Internals by default
* 提供了 C++ 14语言特性
* 其他的一些预览版本的新特性


下面图是JDK从8开始到16的新特性个数：

![](https://img-blog.csdnimg.cn/45ef8a99f7f54cb3815e8df0eb9c264d.png)

可以看到JDK8和JDK9是最多的，后面基本上变动比较少。

JDK8引入了stream，lambda，泛型等一系列非常有用的特性。而JDK9则引入了新的JPMS模块化系统，所以变动比较多。

相对而言，JDK10之后变动基本上比较小，也有可能跟固定6个月发一次版本有关系。毕竟时间比较短，所以版本的变动也比较小。

> 注意，JDK16并不是一个LTS版本，在9月发布的JDK17才是！,大家可以关注我的后续关于JDK17新特性的文章。到现在为止，JAVA的LTS版本就有JDK8，JDK11和JDK17了。你现在用的是哪个呢？

# 语言方面的提升

JDK16在语言上的提升主要有两个：Pattern matching和records。这两个新特性都是在JDK14中作为预览版本引入了，最终到JDK16变成了final版本。

先来看一下Pattern matching, Pattern matching主要说的就是instanceof关键词，我们知道在JAVA中判断一个对象是不是某个类的实例，则可以使用instanceof，如果是该类的实例或者子类，则返回true，否则返回false。

但是在判断完之后，要想使用对应的对象，还需要显示的进行类型转换如下所示：

```
//传统写法
        if(site instanceof String){
            String stringSite = (String)site;
            System.out.println(stringSite.length());
        }
```

在JDK16中的Pattern matching中，可以这样写：

```
 //JDK16写法
        if(site instanceof String stringSite){
            System.out.println(stringSite.length());
        }
```

另外一个final版本的就是在JDK14和15中引入的Records,Records是一个特殊的java类，主要用来表示不可变对象的结构体。

来看一个Records的定义：

```
public record Address(
        String addressName,
        String city
) {
}
```

上面我们定义了一个Address对象，它有两个属性，分别是addressName和city，如果反编译上面代码的编译结果，可以得到：

```
public record Address(String addressName, String city) {
    public Address(String addressName, String city) {
        this.addressName = addressName;
        this.city = city;
    }

    public String addressName() {
        return this.addressName;
    }

    public String city() {
        return this.city;
    }
}

```

实际上就等于传统的：

```
public class AddressOld {
    
    private final String addressName;
    private final String city;

    public AddressOld(String addressName, String city) {
        this.addressName = addressName;
        this.city = city;
    }

    public String getAddressName() {
        return addressName;
    }

    public String getCity() {
        return city;
    }
}

```

但是在编写上要方便和简单很多。


# 内存管理方面的提升

在看看内存管理方面的提升，主要有两方面：Elastic Metaspace和ZGC的并发线程堆栈处理。

Metaspace 的主要功能是管理类的元数据的内存。 引入 Elastic Metaspace 是为了改进 HotSpot JVM 中元空间内存的分配和释放。 可以更快地将不需要的内存返回给操作系统，从而减少开销和内存碎片。

Elastic Metaspace使用较小的块分配内存，并通过将未使用的元空间内存返回给操作系统来提高弹性。 它可以提高性能并降低维护成本。

那么什么是ZGC的并发线程堆栈处理呢？

我们知道ZGC是HotSpot JVM中一种低延时的垃圾回收算法。但是在线程的堆栈处理过程中，总有一个制约因素就是safepoints。在safepoints这个点，java的线程是要暂停执行的，从而限制了GC的效率。

而ZGC的并发线程堆栈处理可以保证java线程可以在GC safepoints的同时可以并发执行。

# Unix-Domain Socket Channel

一般来说Socket通信是基于TCP/IP的，但是熟悉unix的朋友应该知道，在unix中一切都是以文件形式存在的，即便是在内部进程的通讯也是如此。

如果是同一个host上的进程进行通讯，使用unix本身的inter-process communication (IPC)无疑是最快的方式,并且更加安全。

所以在JDK16中增加了对Unix-Domain Socket Channel的支持。

# Warning For Value-based Classes

这个是什么意思呢？ 我们知道java中对应的primary类型都有一个Object类型，比如int对应的是Integer。

如果是用Integer的构造函数，则我们可以这样构造：

```
 Integer integer= new Integer(100);
```

但是在JDK16中，这种构造函数已经被废弃了：

```
    @Deprecated(since="9", forRemoval = true)
    public Integer(int value) {
        this.value = value;
    }
```

我们可以直接这样写：

```
Integer integer2= 100;
```

# 封装内部的JDK包

一般来说，我们用的包都是JDK公开的API，但是有时候还是会用到一些JDK内部使用的类，这种类是不建议直接在外部使用的，JDK16对大部分的这种类做了封装，后面大家直接在标准JDK中查找使用即可。

# C++ 14语言特性

这个是值JDK底层的C++ 源代码使用C++ 14语言特性，一般的JDK使用者是无法直接感受的。


# 预览语言新特性

在JDK16中还加入了几个预览的语言新特性.这里主要讲一下Vector API和Sealed Classes.


Vector API的想法是提供一种向量计算方法，最终能够比传统的标量计算方法（在支持 CPU 架构上）执行得更好。什么叫做向量计算呢？熟悉pandas的朋友可能知道，在pandas可以方便的对矩阵进行计算，如果用java实现则需要计算矩阵中的每个元素，非常麻烦，这也是python的pandas库能够流行的原因。

现在JDK16也可以做到了，我们一起来看看,先是传统写法：

```
//传统写法
        int[] x = {1, 2, 3, 4};
        int[] y = {4, 3, 2, 1};

        int[] c = new int[x.length];

        for (int i = 0; i < x.length; i++) {
            c[i] =x[i] * y[i];
        }
```

如果我们希望两个数组的数字相乘，则只能进行每个元素的遍历。现在的写法：

```
        var vectorA = IntVector.fromArray(IntVector.SPECIES_128, x, 0);
        var vectorB = IntVector.fromArray(IntVector.SPECIES_128, y, 0);
        var vectorC = vectorA.mul(vectorB);
        vectorC.intoArray(c, 0);
```

我们构建两个Vector变量，直接调用Vector类的mul方法即可。

fromArray中有三个参数，第一个是向量的长度，第二是原数组，第三个是偏移量。因为一个int有4个字节，所以这里我们使用SPECIES_128。

Sealed Classes是在JDK15中引入的概念，它表示某个类允许哪些类来继承它：

```
public sealed class SealExample permits Seal1, Seal2{
}

public non-sealed class Seal1 extends SealExample {
}

public final class Seal2 extends SealExample {
}
```

final表示Seal2不能再被继承了。non-sealed 表示可以允许任何类继承。

# 总结

以上就是JDK16给我们带来的新特性，总体而言是很有用的，大家觉得呢？

本文例子[learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)






