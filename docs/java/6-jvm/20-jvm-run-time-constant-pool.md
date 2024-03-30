---
slug: /jvm-run-time-constant-pool
---

# 20. JVM详解之:运行时常量池

## 简介

JVM在运行的时候会对class文件进行加载，链接和初始化的过程。class文件中定义的常量池在JVM加载之后会发生什么神奇的变化呢？快来看一看吧。

## class文件中的常量池

之前我们在讲class文件的结构时，提到了每个class文件都有一个常量池，常量池中存了些什么东西呢？

字符串常量，类和接口名字，字段名，和其他一些在class中引用的常量。

## 运行时常量池

但是只有class文件中的常量池肯定是不够的，因为我们需要在JVM中运行起来。

这时候就需要一个运行时常量池，为JVM的运行服务。

运行时常量池和class文件的常量池是一一对应的，它就是class文件的常量池来构建的。

运行时常量池中有两种类型，分别是symbolic references符号引用和static constants静态常量。

其中静态常量不需要后续解析，而符号引用需要进一步进行解析处理。

什么是静态常量，什么是符号引用呢？ 我们举个直观的例子。

~~~java
String site="www.flydean.com"
~~~

上面的字符串"www.flydean.com"可以看做是一个静态常量，因为它是不会变化的，是什么样的就展示什么样的。

而上面的字符串的名字“site”就是符号引用，需要在运行期间进行解析，为什么呢？

因为site的值是可以变化的，我们不能在第一时间确定其真正的值，需要在动态运行中进行解析。

### 静态常量详解

运行时常量池中的静态常量是从class文件中的constant_pool构建的。可以分为两部分：String常量和数字常量。

#### String常量

String常量是对String对象的引用，是从class中的CONSTANT_String_info结构体构建的：

~~~java
CONSTANT_String_info {
    u1 tag;
    u2 string_index;
}
~~~

tag就是结构体的标记，string_index是string在class常量池的index。

string_index对应的class常量池的内容是一个CONSTANT_Utf8_info结构体。

~~~java
CONSTANT_Utf8_info {
    u1 tag;
    u2 length;
    u1 bytes[length];
}
~~~

CONSTANT_Utf8_info是啥呢？它就是要创建的String对象的变种UTF-8编码。

我们知道unicode的范围是从0x0000 至 0x10FFFF。

变种UTF-8就是将unicode进行编码的方式。那是怎么编码呢？

![](https://img-blog.csdnimg.cn/20200616183643720.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从上图可以看到，不同的unicode范围使用的是不同的编码方式。

> 注意，如果一个字符占用多个字节，那么在class文件中使用的是 big-endian 大端优先的排列方式。

> 如果字符范围在FFFF之后，那么使用的是2个3字节的格式的组合。

讲完class文件中CONSTANT_String_info的结构之后，我们再来看看从CONSTANT_String_info创建运行时String常量的规则：

1. 规则一：如果String.intern之前被调用过，并且返回的结果和CONSTANT_String_info中保存的编码是一致的话，表示他们指向的是同一个String的实例。

2. 规则二：如果不同的话，那么会创建一个新的String实例，并将运行时String常量指向该String的实例。最后会在这个String实例上调用String的intern方法。调用intern方法主要是将这个String实例加入字符串常量池。

#### 数字常量

数字常量是从class文件中的CONSTANT_Integer_info, CONSTANT_Float_info, CONSTANT_Long_info和 CONSTANT_Double_info 构建的。

### 符号引用详解

符号引用也是从class中的constant_pool中构建的。

对class和interface的符号引用来自于CONSTANT_Class_info。

对class和interface中字段的引用来自于CONSTANT_Fieldref_info。

class中方法的引用来自于CONSTANT_Methodref_info。

interface中方法的引用来自于CONSTANT_InterfaceMethodref_info。

对方法句柄的引用来自于CONSTANT_MethodHandle_info。

对方法类型的引用来自于CONSTANT_MethodType_info。

对动态计算常量的符号引用来自于CONSTANT_MethodType_info。

对动态计算的call site的引用来自于CONSTANT_InvokeDynamic_info。

## String Pool字符串常量池

我们在讲到运行时常量池的时候，有提到String常量是对String对象的引用。那么这些创建的String对象是放在什么地方呢？

没错，就是String Pool字符串常量池。

这个String Pool在每个JVM中都只会维护一份。是所有的类共享的。

String Pool是在1.6之前是存放在方法区的。在1.8之后被放到了java heap中。

> 注意，String Pool中存放的是字符串的实例，也就是用双引号引起来的字符串。

那么问题来了？

~~~java
String name = new String("www.flydean.com"）;
~~~

到底创建了多少个对象呢？

## 总结

class文件中常量池保存的是字符串常量，类和接口名字，字段名，和其他一些在class中引用的常量。每个class都有一份。

运行时常量池保存的是从class文件常量池构建的静态常量引用和符号引用。每个class都有一份。

字符串常量池保存的是“字符”的实例，供运行时常量池引用。

运行时常量池是和class或者interface一一对应的，那么如果一个class生成了两个实例对象，这两个实例对象是共享一个运行时常量池还是分别生成两个不同的常量池呢？欢迎小伙伴们留言讨论。


