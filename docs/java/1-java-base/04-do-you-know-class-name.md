---
slug: /do-you-know-class-name
---

# 4. 你真的了解java class name吗？

在面向对象的世界，Class是java的基础。java.lang.Class实际上是继承自java.lang.Object。

class有一个方法叫做getName，该方法会返回(class, interface, array class, primitive type,或者 void)的Class名字。

如果你经常调试JVM的话，会看到下面这样奇怪的内容：

~~~java
jcmd 1234 GC.class_histogram
~~~

![](https://img-blog.csdnimg.cn/20200428202906645.png)

这些奇怪的内容都是class name，下面我们就来看看他们都表示什么含义。

class name其实分为三类。

# primitive类型或者void

如果类对象是primitive类型或者void，那么他们的class name就是相对应的关键词或者void。

~~~java
        //primary class
        log.info(int.class.getName());
        log.info(short.class.getName());
        log.info(float.class.getName());
        log.info(double.class.getName());
        log.info(long.class.getName());
        log.info(byte.class.getName());
        log.info(char.class.getName());
        log.info(boolean.class.getName());
        //void
        log.info(void.class.getName());
~~~

输出结果：

~~~java
[main] INFO com.flydean.classname.ClassNameUsage - int
[main] INFO com.flydean.classname.ClassNameUsage - short
[main] INFO com.flydean.classname.ClassNameUsage - float
[main] INFO com.flydean.classname.ClassNameUsage - double
[main] INFO com.flydean.classname.ClassNameUsage - long
[main] INFO com.flydean.classname.ClassNameUsage - byte
[main] INFO com.flydean.classname.ClassNameUsage - char
[main] INFO com.flydean.classname.ClassNameUsage - boolean
[main] INFO com.flydean.classname.ClassNameUsage - void
~~~

# 引用类型

如果是引用类型，则会返回该类的class名字：

~~~java
//object class
        log.info(Object.class.getName());
~~~

输出结果：

~~~java
[main] INFO com.flydean.classname.ClassNameUsage - java.lang.Object
~~~

# Array类型

Array类型就有点复杂，根据Array的层级关系，会在class name之前添加[,有多少级Array就添加多少个[。

同时相应的类型会转换为相应的编码：

元素类型|编码
-|-
boolean|Z
byte|B
char|C
class or interface|Lclassname;
double|D
float|F
int|I
long|J
short|S

我们举个例子：

~~~java
//Array
        log.info(int[].class.getName());
        log.info(short[].class.getName());
        log.info(float[].class.getName());
        log.info(double[].class.getName());
        log.info(long[].class.getName());
        log.info(byte[].class.getName());
        log.info(char[].class.getName());
        log.info(boolean[].class.getName());
        log.info(Object[].class.getName());

        //multiple arrays
        log.info(int[][][].class.getName());
~~~

输出结果：

~~~java
[main] INFO com.flydean.classname.ClassNameUsage - [I
[main] INFO com.flydean.classname.ClassNameUsage - [S
[main] INFO com.flydean.classname.ClassNameUsage - [F
[main] INFO com.flydean.classname.ClassNameUsage - [D
[main] INFO com.flydean.classname.ClassNameUsage - [J
[main] INFO com.flydean.classname.ClassNameUsage - [B
[main] INFO com.flydean.classname.ClassNameUsage - [C
[main] INFO com.flydean.classname.ClassNameUsage - [Z
[main] INFO com.flydean.classname.ClassNameUsage - [Ljava.lang.Object;
[main] INFO com.flydean.classname.ClassNameUsage - [[[I
~~~

# 总结

好了，上面的jcmd的输出结果是不是可以理解了？

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)







