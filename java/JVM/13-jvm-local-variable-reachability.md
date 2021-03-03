JVM详解之:本地变量的生命周期

# 简介

java方法中定义的变量，它的生命周期是什么样的呢？是不是一定要等到方法结束，这个创建的对象才会被回收呢？

带着这个问题我们来看一下今天的这篇文章。

# 本地变量的生命周期

在类中，变量类型有类变量，成员变量和本地变量。

本地变量指的是定义在方法中的变量，如果我们在方法中定义了一个变量，那么这个变量的生命周期是怎么样的呢？

举个例子：

~~~java
public void test(){
    Object object = new Object();
    doSomeThingElse(){
        ...
    }
}
~~~

在上面的test方法中，定义了一个object本地变量，然后又执行了一个方法。

因为在java中，我们无法直接控制对象的生命周期，对象的回收是由垃圾回收器自动进行的。

通常来说这个object对象会维持到整个test执行结束才会被回收。

现在我们考虑一个特殊的情况，如果doSomeThingElse这个方法是一个while循环，并且永远不会结束，那么这个创建出来的object对象会不会被回收呢？还是一直都存在内存中？

先说我们的结论，JVM非常智能，可以检测出来这种情况，将object对象进行回收。

# 举例说明

为了能够更好的说明问题，我们自定义一个Test对象，并在其创建和被回收之前打印相应的信息。

~~~java
    public static class Test {
       public Test() {
           System.out.println("创建对象 " + this);
       }

       public void test() {
           System.out.println("测试对象 " + this);
       }

       @Override
       protected void finalize() throws Throwable {
           System.out.println("回收对象 " + this);
       }
    }

~~~

然后做两个测试，第一个测试没有无限循环，第二个测试保持无限循环，循环通过一个volatile变量flag来控制：

~~~java
public static void main(String[] args) throws InterruptedException {
        System.out.println("开始测试1");
        resetFlag();
        flag = true;
        testLocalVariable();

        System.out.println("等待Test1结束");
        Thread.sleep(10000);

        System.out.println("开始测试2");
        flag = true;
        testLocalVariable();
    }
~~~

看一下testLocalVariable方法的定义：

~~~java
    public static void testLocalVariable() {
        Test test1 = new Test();
        Test test2 = new Test();
        while (flag) {
            // 啥都不做
        }
        test1.test();
    }
~~~

然后我们再启动一个线程做定时的GC。好了一切就绪，我们运行吧：

~~~java
开始测试1
创建对象 com.flydean.LocalVariableReachability$Test@119d7047
创建对象 com.flydean.LocalVariableReachability$Test@776ec8df
回收对象 com.flydean.LocalVariableReachability$Test@776ec8df
测试对象 com.flydean.LocalVariableReachability$Test@119d7047
等待Test1结束
回收对象 com.flydean.LocalVariableReachability$Test@119d7047

开始测试2
创建对象 com.flydean.LocalVariableReachability$Test@4eec7777
创建对象 com.flydean.LocalVariableReachability$Test@3b07d329
回收对象 com.flydean.LocalVariableReachability$Test@3b07d329
~~~

先看测试1的结果，我们可以看到第二个对象在调用test1.test()之前就被回收了。

再看测试2的结果，我们可以看到第二个对象同样被回收了。

结果说明了JVM是足够智能的，可以自行优化本地变量的生命周期。

# 优化的原因

我们考虑一下，JVM是在什么阶段对本地变量的生命周期进行优化的呢？

很明显，这个优化不是在编译期间进行的，而是在运行期中进行的优化。

我们使用-XX:+PrintAssembly分析一下汇编代码：

![](https://img-blog.csdnimg.cn/2020062509493794.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

首先说明，本人的汇编语言还是很多年前学过的，如果解释起来有错误的地方，请多多指正。

先说两个概念rbx和r10都是64位CPU的寄存器，r10d是r10的低32位。

先看红框1， 红框1表示rbx中保存的是我们定义的LocalVariableReachability类中的一个Test对象。

再看红框2，红框2表示r10现在保存的是LocalVariableReachability这个类实例。

红框3表示的是进入while循环的时候，ImutableOopMap中存储的对象，大家可以看到里面只有r10和rbx，也就是说只有类实例和其中的一个Test实例。

红框4是什么呢？红框4表示的是一个safe point，也就是垃圾回收的时候的安全点。在这个安全点上如果有不再被使用的对象就会被回收。

因为ImutableOopMap中只存有两个对象，那么剩下的一个Test实例就会被回收。

# 总结

本文介绍了本地变量的生命周期，并在汇编语言的角度对其进行了解释，如有错误欢迎指正。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！













