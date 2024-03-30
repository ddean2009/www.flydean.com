---
slug: /java-security-code-line-DLC
---

# 4. java安全编码指南之:声明和初始化

# 简介

在java对象和字段的初始化过程中会遇到哪些安全性问题呢？一起来看看吧。

# 初始化顺序

根据JLS（Java Language Specification）中的定义，class在初始化过程中，需要同时初始化class中定义的静态初始化程序和在该类中声明的静态字段（类变量）的初始化程序。

而对于static变量来说，如果static变量被定义为final并且它值是编译时常量值，那么该static变量将会被优先初始化。

那么使用了final static变量，是不是就没有初始化问题了呢？

我们来看下面一个例子：

~~~java
public class StaticFiledOrder {
    private final int result;
    private static final StaticFiledOrder instance = new StaticFiledOrder();
    private static final int intValue=100;
    public StaticFiledOrder(){
        result= intValue - 10;
    }

    public static void main(String[] args) {
        System.out.println(instance.result);
    }
}
~~~

输出结果是什么呢？

答案是90。 根据我们提到的规则，intValue是final并且被编译时常量赋值，所以是最先被初始化的，instance调用了StaticFiledOrder类的构造函数，最终导致result的值是90。

接下来，我们换个写法，将intValue改为随机变量：

~~~java
public class StaticFiledOrder {
    private final int result;
    private static final StaticFiledOrder instance = new StaticFiledOrder();
    private static final int intValue=(int)Math.random()* 1000;
    public StaticFiledOrder(){
        result= intValue - 10;
    }

    public static void main(String[] args) {
        System.out.println(instance.result);
    }
}
~~~

运行结果是什么呢？ 

答案是-10。为什么呢？

因为instance在调用StaticFiledOrder构造函数进行初始化的过程中，intValue还没有被初始化，所以它有一个默认的值0，从而导致result的最终值是-10。

怎么修改呢？

将顺序调换一下就行了：

~~~java
public class StaticFiledOrder {
    private final int result;
    private static final int intValue=(int)Math.random()* 1000;
    private static final StaticFiledOrder instance = new StaticFiledOrder();
    public StaticFiledOrder(){
        result= intValue - 10;
    }

    public static void main(String[] args) {
        System.out.println(instance.result);
    }
}
~~~

# 循环初始化

既然static变量可以调用构造函数，那么可不可以调用其他类的方法呢？

看下这个例子：

~~~java
public class CycleClassA {
    public static final int a = CycleClassB.b+1;
}
public class CycleClassB {
    public static final int b = CycleClassA.a+1;
}
~~~

上面就是一个循环初始化的例子，上面的例子中CycleClassA中的a引用了CycleClassB的b，而同样的CycleClassB中的b引用了CycleClassA的a。

这样循环引用虽然不会报错，但是根据class的初始化顺序不同，会导致a和b生成两种不同的结果。

所以在我们编写代码的过程中，一定要避免这种循环初始化的情况。

# 不要使用java标准库中的类名作为自己的类名

java标准库中为我们定义了很多非常优秀的类，我们在搭建自己的java程序时候可以很方便的使用。

但是我们在写自定义类的情况下，一定要注意避免使用和java标准库中一样的名字。

这个应该很好理解，就是为了避免混淆。以免造成不必要的意外。

这个很简单，就不举例子了。

# 不要在增强的for语句中修改变量值

我们在遍历集合和数组的过程中，除了最原始的for语句之外，java还为我们提供了下面的增强的for循环：

~~~java
for (I #i = Expression.iterator(); #i.hasNext(); ) {
    {VariableModifier} TargetType Identifier =
        (TargetType) #i.next();
    Statement
}
~~~

在遍历的过程中，#i其实相当于一个本地变量，对这个本地变量的修改是不会影响到集合本身的。

我们看一个例子：

~~~java
    public void noncompliantUsage(){
        int[] intArray = new int[]{1,2,3,4,5,6};
        for(int i: intArray){
            i=0;
        }
        for(int i: intArray){
            System.out.println(i);
        }
    }
~~~

我们在遍历过程中，尝试将i都设置为0，但是最后输出intArray的结果，发现没有任何变化。

所以，一般来说我们需要在增强的for语句中，将#i设置成为final，从而消除这种不必要的逻辑误会。

~~~java
    public void compliantUsage(){
        int[] intArray = new int[]{1,2,3,4,5,6};
        for(final int i: intArray){
        }
        for(int i: intArray){
            System.out.println(i);
        }
    }
~~~

本文的例子：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)









