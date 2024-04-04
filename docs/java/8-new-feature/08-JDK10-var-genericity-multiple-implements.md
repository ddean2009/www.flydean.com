---
slug: /JDK10-var-genericity-multiple-implements
---

# 8. JDK10的新特性:var泛型和多个接口实现

# 简介

在[JDK10的新特性:本地变量类型var](http://www.flydean.com/jdk10-var-local-variable/)中我们讲到了为什么使用var和怎么使用var。

今天我们来深入的考虑一下var和泛型，多个接口实现的问题。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

# 实现多个接口

在JDK的实现和我们日常的工作中，很多时候都需要实现多个接口，我们举常用的两个例子ArrayList和CopyOnWriteArrayList。先看下他们的定义：

~~~java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
~~~

~~~java
public class CopyOnWriteArrayList<E>
    implements List<E>, RandomAccess, Cloneable, java.io.Serializable 
~~~

我们可以看到ArrayList和CopyOnWriteArrayList都实现了List，RandomAccess，Cloneable，Serializable这四个接口。

如果我们有一个ArrayList creater，可以创建ArrayList或者CopyOnWriteArrayList中的一个，那么代码应该怎么写呢？

~~~java
    public Object createList(boolean flag){
        if(flag){
            return new ArrayList<>();
        }else{
            return new CopyOnWriteArrayList<>();
        }
    }
~~~

因为返回的值可能是ArrayList也可能是CopyOnWriteArrayList，我们只能以Object来替代要返回的对象。

如果返回了Object就没有了泛型带来的优势，有没有什么方法让我们清楚的知道要返回的对象到底是什么类型的呢？

大家第一个想到的可能就是创建一个新的接口，继承List, RandomAccess, Cloneable, java.io.Serializable,然后createList返回该新创建的接口即可。

~~~java
public interface ListInterface<E> extends List<E>, RandomAccess, Cloneable, java.io.Serializable {
}
~~~

然后把createList方法改写：

~~~java
public <E> ListInterface<E> createListWithInterface(boolean flag){
        if(flag){
            return (ListInterface<E>) new ArrayList<E>();
        }else{
            return (ListInterface<E>) new CopyOnWriteArrayList<E>();
        }
    }
~~~

新的方法可以带泛型，并且明确的表明了要返回的是一个ListInterface。

新生成的ListInterface在你自己的代码中使用是没有问题的，考虑一下，如果你的代码被别人引用，或者作为一个公共库来被别人使用，第三方可能根本就不知道你的新创建的ListInterface到底是做什么的。

我们能不能使用一种更加直观的方法来创建List呢？答案当然是可以的，看下面的例子：

~~~java
public <T extends List<E> & RandomAccess &  Cloneable & java.io.Serializable, E> T createListWithInterfaceT(boolean flag){
        if(flag){
            return (T) new ArrayList<E>();
        }else{
            return (T) new CopyOnWriteArrayList<E>();
        }
    }
~~~

上面的例子中，我们使用了泛型T同时继承了4个接口。然后将创建的List转换成T返回。

这样我们即得到了ArrayList和CopyOnWriteArrayList的公共类型，也不需要创建新的接口。

# 使用多个接口

上面我们创建了一个实现多个接口的泛型T。那么如果要使用它该怎么做呢？

~~~java
public <T extends List<E> & RandomAccess &  Cloneable & java.io.Serializable, E> void useGenericityType(){
        VarGenericity varGenericity=new VarGenericity();
        T list=varGenericity.createListWithInterfaceT(true);
    }
~~~

为了在方法内部使用T，我们必须在方法定义上面再重新申明一次T的定义。

这么做虽然可以实现我们的功能，但是实在是太麻烦了。

# 使用var

这个时候就可以使用var变量来替代了，我们看下下面的例子：

~~~java
public void useVarInGenericityType(){
        VarGenericity varGenericity=new VarGenericity();
        var list=varGenericity.createListWithInterfaceT(true);
    }
~~~

是不是很简单，并且var list变量保留了四个接口的所有公共方法。

# 总结

本文介绍了泛型在多个接口实现中的具体例子，并使用var来精简代码。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/
ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)
