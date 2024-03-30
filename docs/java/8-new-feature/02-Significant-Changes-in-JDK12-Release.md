---
slug: /Significant-Changes-in-JDK12-Release
---

# 2. JDK12的五大重要新特性

## JDK12的五大重要新特性

Java12在March 19, 2019发布了。

在2017年发布Java 9之后，Java平台发布节奏已从每3年以上的主要版本转变为每6个月发布一次功能。现在，每年的3月和9月都会发布新的版本功能。 从而提供了更细化，更快和可管理的版本更新。

这是一个好消息，不好的就是大家会觉得JDK的版本更新太快了。

什么？JDK12已经出来了？

什么？9月份要出JDK13了？

什么？我还在用JDK8？

废话少说，我们来看下JDK12的五个比较重要的新特性：

1. 引入JVM常量API
2. 扩展了switch语句
3. 支持Unicode 11.0
4. 为日本Reiwa Era提供了方形字符支持
5. NumberFormat增加了对以紧凑格式格式化数字的支持

## 引入JVM常量API

每个Java类文件都有一个常量池，该池存储该类中字节码指令的操作。广义上讲，常量池中的条目要么描述运行时artifacts（例如类和方法），要么描述简单值（例如字符串和整数）。

所有这些条目都称为可加载常量，因为它们可以用作ldc指令的参数（“加载常量”）。它们也可能出现在invokedynamic指令的引导方法的静态参数列表中。执行ldc或invokedynamic指令会导致将可加载常量解析为标准Java类型（如Class，String或int）的“实时”值。

处理类文件的程序需要对字节码指令进行建模，然后对可加载常量进行建模。但是，使用标准Java类型对可加载常量进行建模是不够的。

描述一个字符串（一个CONSTANT_String_info条目）的可加载常量可能是可以接受的，因为生成一个“live” String对象是很简单的，但是对于描述一个类（一个CONSTANT_Class_info条目）的一个可加载常量来说，这是有问题的，因为生成一个“live”类对象依赖于类加载的正确性和一致性。

在实际应用中，类加载具有许多环境依赖性和失败的情况，例如：所需的类不存在或请求者可能无法访问；类加载的结果随上下文而变化；加载类具有副作用；有时根本不可能加载类。

因此，处理可加载常量的程序如果能够操纵类和方法，并且以纯名义上的符号形式操纵诸如方法句柄和动态计算的常量之类的artifacts，则它们将变得更加简单。

JDK12在新包java.lang.invoke.constant中定义了一系列基于值的符号引用（JVMS 5.1）类型，它们能够描述每种可加载常量。符号引用以纯字面的形式描述了可加载常量，与类加载或可访问性上下文分开。某些类可以充当自己的符号引用（例如String）；对于可链接常量，JDK12定义了一系列符号引用类型（ClassDesc，MethodTypeDesc，MethodHandleDesc和DynamicConstantDesc），来包含描述这些常量的信息。

## 扩展了switch语句

这是JEP 325提出的一个预览版本的预发特性。现在被JDK13的 JEP 354替代了。

简单点讲就是扩展了switch语法，可以用作语句或表达式。

老的写法：
~~~java
switch (day) {
    case MONDAY:
    case FRIDAY:
    case SUNDAY:
        System.out.println(6);
        break;
    case TUESDAY:
        System.out.println(7);
        break;
    case THURSDAY:
    case SATURDAY:
        System.out.println(8);
        break;
    case WEDNESDAY:
        System.out.println(9);
        break;
}
~~~

新的写法：
~~~java
switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> System.out.println(6);
    case TUESDAY                -> System.out.println(7);
    case THURSDAY, SATURDAY     -> System.out.println(8);
    case WEDNESDAY              -> System.out.println(9);
}
~~~

还可以有返回值：

~~~java
int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY                -> 7;
    case THURSDAY, SATURDAY     -> 8;
    case WEDNESDAY              -> 9;
};
~~~

## 支持Unicode 11.0

JDK 12版本包含对Unicode 11.0.0的支持。 在支持Unicode 10.0.0的JDK 11发行之后，Unicode 11.0.0引入了JDK 12现在包含的以下新功能：

* 684个新字符
* 11个新blocks
* 7个新脚本。

## 为日本Reiwa Era提供了方形字符支持

简单点说就是日本朝代更替，造了一个新字（Reiwa 令和）。所以需要Unicode的支持。 

Unicode联盟为这个字保留代码：U+32FF。

现在的日本朝代叫：（Heisei 平成）。 是指日本历史的一段时期，对应于明仁天皇从1989年1月8日至至2019年4月30日退位。

他的儿子Naruhito皇太子于5月1日成为新的天皇后，改朝代名为：Reiwa。

## NumberFormat增加了对以紧凑格式格式化数字的支持

NumberFormat增加了以紧凑格式格式化数字的支持。 紧凑的数字格式是指数字的简短形式或易于理解的形式。 例如，在en_US语言环境中，根据NumberFormat.Style指定的样式，可以将1000格式化为“ 1K”，将1000000格式化为“ 1M”。 紧凑数字格式由LDML的紧凑数字格式规范定义。 若要获取实例，请使用NumberFormat给出的工厂方法之一来进行紧凑数字格式化。 例如：

~~~java
NumberFormat fmt = NumberFormat.getCompactNumberInstance（Locale.US，NumberFormat.Style.SHORT）;
String result = fmt.format(1000);
~~~

上面的示例生成“ 1K”。





