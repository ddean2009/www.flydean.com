---
slug: /JDK15-release-new-features
---

# 25. JDK15真的来了，一起来看看它的新特性

# 简介

一年两次的JDK最新版本JDK15在2020年9月15日正式发布了，这次的JDK15给我们带了隐藏类，EdDSA，模式匹配，Records，封闭类和Text Block等诸多新特性。

一起来看看吧。

# JDK15的新特性

## JEP 385 Deprecate RMI Activation for Removal

RMI Activation被标记为Deprecate,将会在未来的版本中删除。

RMI大家应该都清楚，RMI就是Remote Method Invocation,翻译成中文就是远程方法调用，是在JDK1.2中引入的。

RMI为java提供了开发分布式系统的强大能力。而J2EE的规范EJB就是使用RMI来实现的bean的远程调用的。

在RMI系统中，远程系统中存在很多分布式对象，如果这些分布式对象一直处于活动状态的话，将会占用很多宝贵的系统资源。

于是RMI引入了一种lazy Activation的方式，这种方式就叫做延迟激活。

这里有两个概念，活动对象和被动对象。

活动对象是在某些系统上的JVM中实例化并对外暴露的远程对象。被动对象是尚未在JVM中实例化（或暴露）但可以进入主动状态的对象。

将被动对象转换为主动对象的过程称为激活。激活要求对象与JVM关联，这可能会将该对象的类加载到JVM中，并且将该对象恢复为之前的状态。

在RMI系统中，我们使用延迟激活。延迟激活将激活对象推迟到客户第一次使用（即第一次方法调用）之前。

既然RMI Activation这么好用，为什么要废弃呢？

因为对于现代应用程序来说，分布式系统大部分都是基于Web的，web服务器已经解决了穿越防火墙，过滤请求，身份验证和安全性的问题，并且也提供了很多延迟加载的技术。

所以在现代应用程序中，RMI Activation已经很少被使用到了。并且在各种开源的代码库中，也基本上找不到RMI Activation的使用代码了。

为了减少RMI Activation的维护成本，在JDK8中，RMI Activation被置为可选的。现在在JDK15中，终于可以废弃了。

## JEP 371 Hidden Classes

Hidden Classes是什么呢？

Hidden Classes就是不能直接被其他class的二净值代码使用的class。Hidden Classes主要被一些框架用来生成运行时类，但是这些类不是被用来直接使用的，而是通过反射机制来调用。

通常来说基于JVM的很多语言都有动态生成类的机制，这样可以提高语言的灵活性和效率。

比如在JDK8中引入的lambda表达式，JVM并不会在编译的时候将lambda表达式转换成为专门的类，而是在运行时将相应的字节码动态生成相应的类对象。

另外使用动态代理也可以为某些类生成新的动态类。

那么我们希望这些动态生成的类需要具有什么特性呢？

1. 不可发现性。因为我们是为某些静态的类动态生成的动态类，所以我们希望把这个动态生成的类看做是静态类的一部分。所以我们不希望除了该静态类之外的其他机制发现。

2. 访问控制。我们希望在访问控制静态类的同时，也能控制到动态生成的类。

3. 生命周期。动态生成类的生命周期一般都比较短，我们并不需要将其保存和静态类的生命周期一致。

但是现有的类的定义API ClassLoader::defineClass和Lookup::defineClass是不管类的字节码是如何生成的，他们都是平等对待。

所以我们需要一些API来定义无法发现的且具有有限生命周期的隐藏类。这将提高所有基于JVM的语言实现的效率。

比如： 

java.lang.reflect.Proxy可以定义隐藏类作为实现代理接口的代理类。

java.lang.invoke.StringConcatFactory可以生成隐藏类来保存常量连接方法；

java.lang.invoke.LambdaMetaFactory可以生成隐藏的nestmate类，以容纳访问封闭变量的lambda主体；

JavaScript引擎可以为从JavaScript程序转换的字节码生成隐藏的类，因为当引擎不再使用它们时，这些类将被卸载。

普通类是通过调用ClassLoader::defineClass创建的，而隐藏类是通过调用Lookup::defineHiddenClass创建的。

这使JVM从提供的字节中派生一个隐藏类，链接该隐藏类，并返回提供对隐藏类的反射访问的查找对象。

调用程序可以通过返回的查找对象来获取隐藏类的Class对象。

## JEP 339 Edwards-Curve Digital Signature Algorithm (EdDSA)

实现了EdDSA椭圆曲线签名算法。

这里就不多讲椭圆曲线签名算法了，如果又想了解的朋友可以给我留言。

## JEP 375 Pattern Matching for instanceof (Second Preview)

Pattern Matching 就是说可以在做pattern mathching的时候，直接对该对象进行类型的转换。

现在这个特性还是预览版本的。

我们看一下具体的例子：

~~~java
if (obj instanceof String) {
    String s = (String) obj;
    // use s
}
~~~

在Pattern Matching之前，我们使用instanceof之后，还需要对该对象进行强制类型转换才能使用。

但是在Pattern Matching之后，我们可以这样用：

~~~java
if (obj instanceof String s) {
    // can use s here
} else {
    // can't use s here
}
~~~

是不是很方便。

## JEP 384 Records (Second Preview)

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

## JEP 360 Sealed Classes (Preview)

在Java中，类层次结构通过继承实现代码的重用，父类的方法可以被许多子类继承。

但是，类层次结构的目的并不总是重用代码。有时，其目的是对域中存在的各种可能性进行建模，例如图形库支持的形状类型或金融应用程序支持的贷款类型。

当以这种方式使用类层次结构时，我们可能需要限制子类集从而来简化建模。

因为我们引入了sealed class或interfaces，这些class或者interfaces只允许被指定的类或者interface进行扩展和实现。

举个例子：

~~~java
package com.example.geometry;

public abstract sealed class Shape
    permits Circle, Rectangle, Square {...}
~~~

上面的例子中，我们指定了Shape只允许被Circle, Rectangle, Square来继承。

上面的例子中并没有指定类的包名，我们可以这样写：

~~~java
package com.example.geometry;

public abstract sealed class Shape 
    permits com.example.polar.Circle,
            com.example.quad.Rectangle,
            com.example.quad.simple.Square {...}
~~~

## JEP 378 Text Blocks

Text Blocks是为了解决在java中输入多行数据的问题。

比如：

~~~java
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
~~~

可以写成：

~~~java

String html = """
              <html>
                  <body>
                      <p>Hello, world</p>
                  </body>
              </html>
              """;
~~~

~~~java
String query = "SELECT \"EMP_ID\", \"LAST_NAME\" FROM \"EMPLOYEE_TB\"\n" +
               "WHERE \"CITY\" = 'INDIANAPOLIS'\n" +
               "ORDER BY \"EMP_ID\", \"LAST_NAME\";\n";
~~~

可以写成：

~~~java

String query = """
               SELECT "EMP_ID", "LAST_NAME" FROM "EMPLOYEE_TB"
               WHERE "CITY" = 'INDIANAPOLIS'
               ORDER BY "EMP_ID", "LAST_NAME";
~~~

非常的方便。

# 总结

好了，JDK15的新特性全都介绍完了。希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！








