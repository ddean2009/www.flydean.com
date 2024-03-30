---
slug: /JDK17-new-features
---

# 27. JDK的第三个LTS版本JDK17来了



# 简介

2021年9月JDK17发布了，JDK17是最新的一个LTS版本。所谓LTS版本就是可以得到至少八年产品支持的版本。从2014年的JDK8，到2018年的JDK11，再到2021年的JDK17。

同时Oracle也调整了LTS版本的发布年限，从之前的三年调整到现在的二年，也就是说下一个LTS版本将会是JDK21，哇喔！

那么如果不是LTS版本呢? 非LTS版本只会得到六个月的产品支持。所以大家还是使用LTS版本吧。

好了，让我们一起来看看JDK17中都有那些新特性吧。

# JDK17中的新特性

总中的来说，JDK17提供了14个优化点或者是变动点。我们会一一进行讲解。

## 语言上的新特性

JDK17在语言上的新特性只有一个 JEP 409: Sealed Classes。

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

## 核心库的优化

JDK17对JAVA核心库的优化有4个。

* 第一个是：JEP 306: Restore Always-Strict Floating-Point Semantics

这个是什么呢？简单点说，就是之前的硬件架构，在严格进行浮点语义进行计算的时候，会消耗大量资源。这在很久以前硬件水平都不高的时候，是难以容忍的。

所以在JDK1.2之后，对浮点语义进行了微调,对默认的严格浮点语义进行了修改。

但是现在已经是2021年了，硬件水平得到了飞速的发展，所以之前引入的修改已经是不必要了，在JDK17中被废弃了。

* 第二个是：JEP 356: Enhanced Pseudo-Random Number Generator
  
JDK中有一个专门生成随机数的类java.util.Random，但是这个类生成的都是伪随机数。

JDK17对这个类进行了加强，提供了一个RandomGenerator接口，为所有的伪随机数提供统一的API。

RandomGenerators 提供了ints、longs、doubles、nextBoolean、nextInt、nextLong、nextDouble 和 nextFloat等方法，来生成对应的随机数。

RandomGenerator接口又包括4个子接口，分别是：

SplittableRandomGenerator:提供了 split 和 splits 的方法，允许用户从现有的 RandomGenerator 生成一个新的 RandomGenerator.

JumpableRandomGenerator:扩展了RandomGenerator的jump 和 jumps 的方法,允许用户跳过一定数目的随机数。

 LeapableRandomGenerator :扩展了RandomGenerator的leap 和leaps 的方法,允许用户跳过大量数目的随机数。

ArbitrouslyJumpableRandomGenerator:扩展了LeapableRandomGenerator,允许用户指定跳过的随机数。

同时还对Random、ThreadLocalRandom 和 SplittableRandom等类进行了重构。

* 第三个是JEP 382: New macOS Rendering Pipeline

这个是专门为Mac做的优化，使用了最新的Apple Metal API 来实现JAVA的2D渲染。

* 第四个是JEP 415: Context-Specific Deserialization Filters

JDK中一个很危险的用法就是反序列化，因为你不知道反序列化的对象到底是不是一个危险的对象，为了解决这个问题，在Java 9 中引入了反序列化过滤器，从而在反序列化之前对数据流进行验证。

但是这种基于流的过滤器有几个限制，这种方法不能扩展，并且很难在代码发布后更新过滤器。它也不能对应用程序中第三方库执行的反序列化操作进行过滤。

为了解决这些问题，JEP 290 还引入了一个 JVM 范围的反序列化过滤器，可以通过 API、系统属性或安全属性进行设置。但是这种静态的过滤器，在具有多个执行上下文的复杂应用程序中,往往会不太适用，因为不同的上下文可能需要不同的过滤条件。

JDK17对JDK9的过滤方法进行了改进，可以在JVM范围配置特定于上下文的反序列化过滤器。


## 支持新的平台

* JEP 391: macOS AArch 64 Port

Mac的M1芯片都发布好久了，没有理由JDK不支持，这个JEP就是让JDK17支持原生的Apple的新Arm 64架构。

## 预览特性

* JEP 406: Pattern Matching for switch (Preview)

这个新特性允许在switch中使用模式匹配。

我们知道，在之前的预览功能中，已经有模式匹配了，不过模式匹配是用在instance of语句中，如下所示：

```
// Old code
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// New code
if (o instanceof String s) {
    ... use s ...
}
```

但是如果instanceof太多的话，也会造成困扰：

```
static String formatter(Object o) {
    String formatted = "unknown";
    if (o instanceof Integer i) {
        formatted = String.format("int %d", i);
    } else if (o instanceof Long l) {
        formatted = String.format("long %d", l);
    } else if (o instanceof Double d) {
        formatted = String.format("double %f", d);
    } else if (o instanceof String s) {
        formatted = String.format("String %s", s);
    }
    return formatted;
}
```

最好的办法是将上面的代码转换成为switch：

```
static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> o.toString();
    };
}
```
这就是switch中的模式匹配。

* JEP 412: Foreign Function and Memory API (Incubator)

在JDK14和15中，JDK已经可以调用不属于JVM内部的代码和访问不归JVM管辖的内存空间。这个新特性在JDK17中得到了增强。

想象一下，以后JDK可以原生支持调用非java语言的API，是不是很厉害？

* JEP 414: Vector API (Second Incubator)

Vector是在JDK16中引入的。可以让向量计算更加快速。 循环遍历的计算，可以用Vector来进行简化。

# 其他改动

其他的一些改动比如封装JDK内部使用的API ,废弃了Security Manager,Applet API和RMI等等，这里就不一一介绍了。

# 总结

JDK17是一个LTS版本，也提供了很多优秀的新特性，还不赶紧用起来！










