---
slug: /JDK9-String-Compact
---

# 5. JDK9的新特性:String压缩和字符编码

# 简介

String的底层存储是什么？相信大部分人都会说是数组。如果要是再问一句，那么是以什么数组来存储呢？相信不同的人有不同的答案。

在JDK9之前，String的底层存储结构是char[],一个char需要占用两个字节的存储单位。

据说是JDK的开发人员经过调研了成千上万的应用程序的heap dump信息，然后得出了一个结论：大部分的String都是以Latin-1字符编码来表示的，只需要一个字节存储就够了，两个字节完全是浪费。

据说他们用了大数据+人工智能，得出的结论由不得我们不信。

于是在JDK9之后，字符串的底层存储变成了byte[]。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)


# 底层实现

先看下java9之前的String是怎么实现的：

~~~java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
 
    //The value is used for character storage.
    private final char value[];
}
~~~

再看下java9中String的实现和一些关键的变量：

~~~java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {
 
    /** The value is used for character storage. */
    @Stable
    private final byte[] value;

    private final byte coder;

    @Native static final byte LATIN1 = 0;
    @Native static final byte UTF16  = 1;

    static final boolean COMPACT_STRINGS;

    static {
        COMPACT_STRINGS = true;
    }
~~~

从代码我们可以看到底层的存储已经变成了byte[]。

再看一下coder变量，coder代表编码的格式，目前String支持两种编码格式LATIN1和UTF16。

LATIN1需要用一个字节来存储。而UTF16需要使用2个字节或者4个字节来存储。

而COMPACT_STRINGS则是用来控制是否开启String的compact功能。默认情况下COMPACT_STRINGS功能是开启的。

如果我们想关闭COMPACT_STRINGS功能则可以使用-XX:-CompactStrings参数。

# 总结

本文讲解了新的String实现和COMPACT_STRINGS模式的关闭方法。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)

