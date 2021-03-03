JVM系列之:JIT中的Virtual Call

# 简介

什么是Virtual Call？Virtual Call在java中的实现是怎么样的？Virtual Call在JIT中有没有优化？

所有的答案看完这篇文章就明白了。

# Virtual Call和它的本质

有用过PrintAssembly的朋友，可能会在反编译的汇编代码中发现有些方法调用的说明是invokevirtual，实际上这个invokevirtual就是Virtual Call。

Virtual Call是什么呢？

面向对象的编程语言基本上都支持方法的重写，我们考虑下面的情况：

~~~java
 private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
    private static class CustObj2 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj2 is very good!");
            }
        }
    }
~~~

我们定义了两个类，CustObj是父类CustObj2是子类。然后我们通一个方法来调用他们：

~~~java
public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }
~~~

因为doWithVMethod的参数类型是CustObj，但是我们同样也可以传一个CustObj2对象给doWithVMethod。

怎么传递这个参数是在运行时决定的，我们很难在编译的时候判断到底该如何执行。

那么JVM会怎么处理这个问题呢？

答案就是引入VMT(Virtual Method Table)，这个VMT存储的是该class对象中所有的Virtual Method。

然后class的实例对象保存着一个VMT的指针，执行VMT。

![](https://img-blog.csdnimg.cn/20200630084945828.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

程序运行的时候首先加载实例对象，然后通过实例对象找到VMT，通过VMT再找到对应的方法地址。

## Virtual Call和classic call

Virtual Call意思是调用方法的时候需要依赖不同的实例对象。而classic call就是直接指向方法的地址，而不需要通过VMT表的转换。

所以classic call通常会比Virtual Call要快。

那么在java中是什么情况呢？

在java中除了static, private和构造函数之外，其他的默认都是Virtual Call。

# Virtual Call优化单实现方法的例子

有些朋友可能会有疑问了，java中其他方法默认都是Virtual Call，那么如果只有一个方法的实现，性能不会受影响吗？

不用怕，JIT足够智能，可以检测到这种情况，在这种情况下JIT会对Virtual Call进行优化。

接下来，我们使用JIT Watcher来进行Assembly代码的分析。

要运行的代码如下：

~~~java
public class TestVirtualCall {

    public static void main(String[] args) throws InterruptedException {
        CustObj obj = new CustObj();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(obj);
        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }

    private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
}
~~~

上面的例子中我们只定义了一个类的方法实现。

![](https://img-blog.csdnimg.cn/2020063009022458.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

在JIT Watcher的配置中，我们禁用inline,以免inline的结果对我们的分析进行干扰。

> 如果你不想使用JIT Watcher,那么可以在运行是添加参数-XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -XX:-Inline， 这里使用JIT Watcher是为了方便分析。

好了运行代码：

运行完毕，界面直接定位到我们的JIT编译代码的部分，如下图所示：

![](https://img-blog.csdnimg.cn/20200630090523130.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

obj.methodCall相对应的byteCode中，大家可以看到第二行就是invokevirtual，和它对应的汇编代码我也在最右边标明了。

大家可以看到在invokevirtual methodCall的最下面，已经写明了optimized virtual_call,表示这个方法已经被JIT优化过了。

接下来，我们开启inline选项，再运行一次：

![](https://img-blog.csdnimg.cn/20200630091406865.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

大家可以看到methodCall中的System.currentTimeMillis已经被内联到methodCall中了。

因为内联只会发生在classic calls中，所以也侧面说明了methodCall方法已经被优化了。

# Virtual Call优化多实现方法的例子

上面我们讲了一个方法的实现，现在我们测试一下两个方法的实现：

~~~java
public class TestVirtualCall2 {

    public static void main(String[] args) throws InterruptedException {
        CustObj obj = new CustObj();
        CustObj2 obj2 = new CustObj2();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(obj);
            doWithVMethod(obj2);

        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }

    private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
    private static class CustObj2 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj2 is very good!");
            }
        }
    }
}
~~~

上面的例子中我们定义了两个类CustObj和CustObj2。 

再次运行看下结果，同样的，我们还是禁用inline。

![](https://img-blog.csdnimg.cn/20200630091910897.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

大家可以看到结果中，首先对两个对象做了cmp，然后出现了两个优化过的virtual call。

这里比较的作用就是找到两个实例对象中的方法地址，从而进行优化。

那么问题来了，两个对象可以优化，三个对象，四个对象呢？

我们选择三个对象来进行分析：

~~~java
public class TestVirtualCall4 {

    public static void main(String[] args) throws InterruptedException {
        CustObj obj = new CustObj();
        CustObj2 obj2 = new CustObj2();
        CustObj3 obj3 = new CustObj3();
        for (int i = 0; i < 10000; i++)
        {
            doWithVMethod(obj);
            doWithVMethod(obj2);
            doWithVMethod(obj3);

        }
        Thread.sleep(1000);
    }

    public static void doWithVMethod(CustObj obj)
    {
        obj.methodCall();
    }

    private static class CustObj
    {
        public void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj is very good!");
            }
        }
    }
    private static class CustObj2 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj2 is very good!");
            }
        }
    }
    private static class CustObj3 extends  CustObj
    {
        public final void methodCall()
        {
            if(System.currentTimeMillis()== 0){
                System.out.println("CustObj3 is very good!");
            }
        }
    }
}
~~~

运行代码，结果如下：

![](https://img-blog.csdnimg.cn/20200630092508545.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

很遗憾，代码并没有进行优化。

> 具体未进行优化的原因我也不清楚，猜想可能跟code cache的大小有关？ 有知道的朋友可以告诉我。

# 总结

本文介绍了Virtual Call和它在java代码中的使用，并在汇编语言的角度对其进行了一定程度的分析，有不对的地方还请大家不吝指教！

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！






