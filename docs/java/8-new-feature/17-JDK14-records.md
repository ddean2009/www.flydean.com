---
slug: /JDK14-records
---

# 17. JDK 14的新特性:Lombok的终结者record

# 简介

自从面向对象产生之后，程序界就开始了新的变化，先是C发展到了C++，后面java横空出世，大有一统江湖的趋势。

面向对象凭借其结构化的特点和在大型项目中的优势，一路蓬勃发展到今。面向对象不是不好，但是太繁琐。

比如我们要定义一个简单的存储数据的结构，比如说User。除了要定义其内部的具体字段以外，我们还要定义get set方法，定义构造函数，equals(), hashCode(), toString()等。

为了解决这个问题，也产生了很多解决方案，比如Lombok，可以通过注解就自动生成特定的存取方法和构造函数。但是Lombok生成的代码看不到，在代码调试方面有一定的劣势。

终于JDK 14为我们带来了record，虽然还是预览特性，但是今天我们一览为快。

# 新的Record类型

Record是一种轻量级的class，可以看做是数据结构体。和scala中的case有点相似。

举个自定义User的例子看一下Record是怎么用的：

~~~java
public record Address(
        String addressName,
        String city
) {
}
~~~

~~~java
public record CustUser(
        String firstName,
        String lastName,
        Address address,
        int age
) {}
~~~

上面我们定义了两个类，CustUser和Address。CustUser中引用了Address。

Record和普通的类的区别就在于Record多了一个括号括起来的定义的字段。

Record类默认是final的，里面的字段默认是private final的。

# 探讨Record的秘密

要想知道Record到底是怎么工作的，我们可以使用javap来对编译好的class文件反编译，运行javap CustUser，可以得到下面的结果：

~~~java
警告: 二进制文件CustUser包含com.flydean.records.CustUser
Compiled from "CustUser.java"
public final class com.flydean.records.CustUser extends java.lang.Record {
  public com.flydean.records.CustUser(java.lang.String, java.lang.String, com.flydean.records.Address, int);
  public java.lang.String toString();
  public final int hashCode();
  public final boolean equals(java.lang.Object);
  public java.lang.String firstName();
  public java.lang.String lastName();
  public com.flydean.records.Address address();
  public int age();
}

~~~

上面可以看到final class CustUser继承自java.lang.Record。

并且自动添加了默认带有所有字段的构造函数。各个自动的获取方法，并实现了toString，hashCode和equals方法。

天啦，太完美了，我们想要的它居然都有。

如果上面的javap还不是很清楚的话，大家可以借助IDE的反编译功能，打开CustUser.class文件看一看：

~~~java
public final class CustUser extends java.lang.Record {
    private final java.lang.String firstName;
    private final java.lang.String lastName;
    private final com.flydean.records.Address address;
    private final int age;

    public CustUser(java.lang.String firstName, java.lang.String lastName, com.flydean.records.Address address, int age) { /* compiled code */ }

    public java.lang.String toString() { /* compiled code */ }

    public final int hashCode() { /* compiled code */ }

    public final boolean equals(java.lang.Object o) { /* compiled code */ }

    public java.lang.String firstName() { /* compiled code */ }

    public java.lang.String lastName() { /* compiled code */ }

    public com.flydean.records.Address address() { /* compiled code */ }

    public int age() { /* compiled code */ }
}
~~~

> 注意，上面的反编译我们可以看到，record中的所有字段都是final的，只能在初始化的时候设置。并且方法里面也没有提供其他可以改变字段内容的方法。

所以我们得出了一个震世惊俗的结论：record是immutable的。

# record扩展

上面的例子中我们只使用了小括号里面的内容，大括号还是空的呀。可不可以像其他正常的类一样，添加点方法或者构造函数进去呢？

答案是肯定的。

先看一个整体的方案：

~~~java
public record CustUserWithBody(
        String firstName,
        String lastName,
        Address address,
        int age
) {
    public String fullName(){
        return firstName+ lastName;
    }

    public CustUserWithBody{
        if (age < 18) {
            throw new IllegalArgumentException( "男大当婚，女大当嫁，18岁未到，不许出嫁!");
        }
    }
}
~~~

我们在record的主题中，定义了一个方法和一个构造函数。

先看这个方法，在方法中我们可以访问到record中定义的变量，但是千万不要尝试去修改他们，因为他们是final的，你会得到一个变异错误。

再看这个构造函数，这个构造函数没有小括号，只有大括号，这种构造函数叫做Compact constructor。你无法在record中定义正常的构造函数，因为会得到一个编译错误。

在这个Compact constructor中，我们可以对定义的字段进行数据校验。如上所述。

# 总结

record是个好东西，希望能够出现在JDK的正式版本中。

最后，很多人可能有个疑问，JDK14声势这么浩大，怎么感觉大的颠覆性的更新也没有太多。

那么我以一个过来人的身份来回答一下这个问题：第一，JDK肯定要保持稳定，新特性都是次要的，稳定压倒一切。所以6个月说长不长说短不短的时间里面注定不会有大的更新。第二，欧美公司的通病，在欧美公司工作不要太潇洒，不但可以不打卡，在家上班，上班也是大大小小的会议开个不停，最后留下来写程序的时间自然不会很多。牛人大神有很多，浑水摸鱼的也不少。效率的话自然比不了国内的996+857了。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)


