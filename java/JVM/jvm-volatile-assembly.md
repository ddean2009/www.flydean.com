JVM系列之:从汇编角度分析Volatile

# 简介

Volatile关键字对熟悉java多线程的朋友来说，应该很熟悉了。Volatile是JMM(Java Memory Model)的一个非常重要的关键词。通过是用Volatile可以实现禁止重排序和变量值线程之间可见两个主要特性。

今天我们从汇编的角度来分析一下Volatile关键字到底是怎么工作的。

# 重排序

这个世界上有两种重排序的方式。

第一种，是在编译器级别的，你写一个java源代码，经过javac编译之后，生成的字节码顺序可能跟源代码的顺序不一致。

第二种，是硬件或者CPU级别的重排序，为了充分利用多核CPU的性能，或者CPU自身的处理架构（比如cache line），可能会对代码进行重排序。比如同时加载两个非互相依赖的字段进行处理，从而提升处理速度。

我们举个例子：

~~~java
public class TestVolatile {

    private static int int1;
    private static int int2;
    private static int int3;
    private static int int4;
    private static int int5;

    public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 10000; i++)
        {
            increase(i);
        }
        Thread.sleep(1000);
    }

    private static void increase(int i){
        int1= i+1;
        int2= i+2;
        int3= i+3;
        int4= i+4;
        int5= i+5;
    }
}
~~~

上面例子中，我们定义了5个int字段，然后在循环中对这些字段进行累加。

先看下javac编译出来的字节码的顺序：

![](https://img-blog.csdnimg.cn/20200630142134260.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们可以看到在设置值的过程中是和java源代码的顺序是一致的，是按照int1,int2,int3,int4,int5的顺序一个一个设置的。

然后我们看一下生成的汇编语言代码：

> 在运行是添加参数-XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -XX:-Inline，或者直接使用JIT Watcher。

![](https://img-blog.csdnimg.cn/20200630142202510.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从生成的代码中，我们可以看到putstatic是按照int1,int5,int4,int3,int2的顺序进行的，也就是说进行了重排序。

如果我们将int2设置成为Volatile，看看结果如何？

> 前方高能预警，请小伙伴们做好准备

![](https://img-blog.csdnimg.cn/20200630145044404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们先看putstatic的顺序，从注释里面，我们只发现了putstatic int2, int3和int5。

且慢！我们不是需要设置int1,int2,int3,int4,int5 5个值吗？这里怎么只有3个。

> 要是没有能独立思考和独立决定的有创造个人，社会的向上发展就不可想像 - 爱因斯坦

这里是反编译的时候注释写错了！ 

让我们来仔细分析一下汇编代码。

第一个红框，不用懂汇编语言的朋友应该也可以看懂，就是分别给r11d,r8d,r9d,ecx和esi这5个寄存器分别加1，2，3，4，5。

这也分别对应了我们在increase方法中要做的事情。

有了这些寄存器的值，我们再继续往下看，从而可以知道，第二个红框实际上表示的就是putstatic int1,而最后一个红框，表示的就是putstatic int4。

所以，大家一定要学会自己分析代码。

5个putstatic都在，同时因为使用了volatile关键字，所以int2作为一个分界点，不会被重排序。所以int1一定在int2之前，而int3,4,5一定在int2之后。

上图的结果是在JIT Watcher中的C2编译器的结果，如果我们切换到C1编译器：

![](https://img-blog.csdnimg.cn/20200630151458134.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这次结果没错，5个int都在，同时我们看到这5个int居然没有重排序。

这也说明了不同的编译器可能对重排序的理解程度是不一样的。

# 写的内存屏障

再来分析一下上面的putstatic int2:

~~~java
lock addl $0x0,-0x40(%rsp)  ;*putstatic int2 {reexecute=0 rethrow=0 return_oop=0}
~~~

这里使用了 lock addl指令，给rsp加了0。 rsp是SP (Stack Pointer) register，也就是栈指针寄存器。

给rsp加0，是不是很奇怪？

加0，虽然没有改变rsp的值，但是因为前面加了lock，所以这个指令会被解析为内存屏障。

这个内存屏障保证了两个事情，第一，不会重排序。第二，所有的变量值都会回写到主内存中，从而在这个指令之后，变量值对其他线程可见。

当然，因为使用lock，可能对性能会有影响。

# 非lock和LazySet

上面我们提到了volatile会导致生成lock指令。

但有时候，我们只是想阻止重排序，对于变量的可见性并没有那么严格的要求。

这个时候，我们就可以使用Atomic类中的LazySet：

~~~java
public class TestVolatile2 {

    private static int int1;
    private static AtomicInteger int2=new AtomicInteger(0);
    private static int int3;
    private static int int4;
    private static int int5;

    public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 10000; i++)
        {
            increase(i);
        }
        Thread.sleep(1000);
    }

    private static void increase(int i){
        int1= i+1;
        int2.lazySet(i+2);
        int3= i+3;
        int4= i+4;
        int5= i+5;
    }
}
~~~

![](https://img-blog.csdnimg.cn/2020063015351643.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从结果可以看到，int2没有重排序，也没有添加lock。s

> 注意，上面的最后一个红框表示的是putstatic int4。

# 读的性能

最后，我们看下使用volatile关键字对读的性能影响：

~~~java
public class TestVolatile3 {

    private static volatile int int1=10;
    public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 10000; i++)
        {
            readInt(i);
        }
        Thread.sleep(1000);
    }

    private static void readInt(int i){
        if(int1 < 5){
            System.out.println(i);
        }
    }
}
~~~

上面的例子中，我们对int1读取10000次。看下编译结果：

![](https://img-blog.csdnimg.cn/20200630153958829.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从结果可以看出，getstatic int1和不使用volatile关键字，生成的代码是一样的。

所以volatile对读的性能不会产生影响。

# 总结

本文从汇编语言的角度再次深入探讨了volatile关键字和JMM模型的影响，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！