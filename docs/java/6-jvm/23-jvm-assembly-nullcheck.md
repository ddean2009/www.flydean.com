---
slug: /jvm-assembly-nullcheck
---

# 23. JVM系列之:从汇编角度分析NullCheck

## 简介

之前我们在讲Virtual call的时候有提到，virtual call方法会根据传递的参数实例的不同而进行优化，从而优化成为classic call,从而提升执行效率。

今天我们考虑一下，在virtual call中执行nullcheck的时候，如果已经知道传递的参数是非空的。JIT会对代码进行优化吗？

一起来看看吧。

## 一个普通的virtual call

我们来分析一下在方法中调用list.add方法的例子：

~~~java
public class TestNull {

    public static void main(String[] args) throws InterruptedException {
        List<String> list= new ArrayList();
	    list.add("www.flydean.com");
        for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
        Thread.sleep(1000);
    }
    private static void testMethod(List<String> list)
    {
        list.get(0);
    }
}
~~~

代码很简单，我们在循环中调用testMethod方法，而这个方法里面又调用了list.get(0)方法，来获取list的第一个参数。

单纯的看testMethod，这个方法是有可能抛出NullPointerException的，但是从整体运行的角度来看，因为我们的list是有值的， 所以不会抛出异常。

使用JIT Watcher看看运行结果：

![](https://img-blog.csdnimg.cn/20200701195852757.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

先看第二个和第三个红框，我们可以看到代码先做了参数类型的比较，然后对testMethod进行了优化，这里还可以看到get方法是内联到testMethod中的。

代码优化的部分我们找到了，那么异常处理呢？如果list为空，应该怎么处理异常呢？

第一个红框，大家可以看到是一个隐式的异常处理，它重定向到1152b4f01这个地址。

第四个红框就是这地址，表示的是异常处理的代码。

## 普通方法中的null check

我们在上面的普通方法里面加上一个null check：

~~~java
public class TestNull1 {

    public static void main(String[] args) throws InterruptedException {
        List<String> list= new ArrayList();
        list.add("www.flydean.com");
        for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
        Thread.sleep(1000);
    }

    private static void testMethod(List<String> list)
    {
        if(list !=null ){
            list.get(0);
        }
    }
}
~~~

上面我们添加了一个list ！=null的判断。

运行看下结果：

![](https://img-blog.csdnimg.cn/2020070120075074.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

相比较而言，我们可以看到，代码其实没有太多的变化，说明JIT在代码优化的过程中，将null check优化掉了。

那么null check到底在什么地方呢？ 看我标红的第二个框，这里是之前的异常处理区域，我们可以看到里面有一个ifnull，表明这里做了null check。

## 反优化的例子

上面的两个例子，我们可以看出在virtual method中，JIT对null check进行了优化。接下来我们再看一个例子，在这个例子中，我们显示的传递一个null给testMethod，然后再次循环testMethod，如下所示。

~~~java
for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
        Thread.sleep(1000);
        testMethod(null);
for (int i = 0; i < 10000; i++)
        {
            testMethod(list);
        }
~~~

我们看下JIT的结果：

![](https://img-blog.csdnimg.cn/20200701203135529.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

看下结果有什么不同呢？

第一，ifnull现在是显示调用的，并不包含在隐式异常中。
第二，隐式异常也不见了，因为使用显示的ifnull。

## 总结

JIT会根据不同的情况，对代码进行不同程度的优化，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！

