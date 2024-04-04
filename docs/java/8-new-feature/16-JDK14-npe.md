---
slug: /JDK14-npe
---

# 16. JDK 14的新特性:更加好用的NullPointerExceptions

让99%的java程序员都头痛的异常就是NullPointerExceptions了。NullPointerExceptions简称NPE，它是运行时异常的一种，也是java程序中最最容易出现的异常。

出现了NullPointerExceptions之后我们怎么处理呢？

一般情况下就是看日志，看一下到底哪一行出错了。如果这一行只有简单的代码，那么很容易就找到问题所在。

要命的是如果这一行很复杂，那么找出问题就不是那么容易了。很有可能我们需要向前debug100行，向后debug50行才能解决。

最大的问题就是如果这个异常出现在线上环境，debug是不可能debug了。这时候就要靠你的肉眼，你对程序的敏感程度再加上你的专业素养，才能从万花丛中找出那个问题。

举个例子，我们定义一个CustUser和Address：

~~~java
@Data
public class CustUser {
    private String userName;
    private Address address;
}
~~~

~~~java
@Data
public class Address {
    private String addressName;
}
~~~

再来产生一个NPE：

~~~java
@Slf4j
public class NPEUsage {

    public static void main(String[] args) {
        Address address=new Address();
        CustUser custUser=new CustUser();
        custUser.setAddress(address);
        log.info(custUser.getAddress().getAddressName().toLowerCase());
    }
}
~~~

上面代码中的最后一行，因为addressName是空的，所以在调用toLowerCase的时候会抛出NPE。运行结果如下：

~~~java
Exception in thread "main" java.lang.NullPointerException
	at com.flydean.nullpointerexceptions.NPEUsage.main(NPEUsage.java:16)
~~~

上述异常只告诉我们有一个NPE在第16行。但是16行有一长串代码，到底是哪里报了这个异常呢？

简单代码，比如上面我们提的例子，简单分析一下就知道问题所在了。但是对于那么犹如蛛网一样的复杂的项目，找起来就很难了。

别害怕，JEP 358: Helpful NullPointerExceptions就是用来解决这个问题。

还是上面的例子，还是上面的配方和味道，我们只需要在运行时加上下面的参数：

~~~java
-XX:+ShowCodeDetailsInExceptionMessages
~~~

![](https://img-blog.csdnimg.cn/20200427101823465.png)

运行一下：

~~~java
Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.toLowerCase()" because the return value of "com.flydean.nullpointerexceptions.Address.getAddressName()" is null
	at com.flydean.nullpointerexceptions.NPEUsage.main(NPEUsage.java:16)
~~~

看到不同之处了吗？完整的出错信息被打印出来了。你苦思冥想的问题解决了。

这个特性好是好，但是默认情况下是被关闭的。

有利就有弊，我们看下这个参数有什么影响：

1. 性能影响：因为要存储额外的信息，对 stack trace会有性能上面的压力。
   
2. 安全影响：从上面的例子我们可以看到异常信息中包含了非常充分的代码信息内容。如果对一些机密应用，完全可以通过异常信息来推断代码逻辑。从而对安全性造成影响。

3. 兼容性：最后是兼容性，之前的JVM可没有存储这些额外的NPE信息，所以可能会有兼容性的问题。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)



