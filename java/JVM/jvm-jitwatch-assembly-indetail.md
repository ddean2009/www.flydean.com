JVM系列之:通过一个例子分析JIT的汇编代码

# 简介

我们知道JIT会在JVM运行过程中，对热点代码进行优化，传说自然是传说，今天我们通过一个简单的例子来具体分析一下JIT到底是怎么进行优化的。

# 一个简单的例子 

说干就干，我们先准备一个非常简单的例子：

~~~java
public class AddTest {
    static int a = 1;
    static int b = 2;
    static int c = 3;

    public static void main(String[] args) {
        for (int i = 0; i < 100000; i++) {
            add();
        }
    }

    private static void add() {
        a = b + 1;
        b = c + 2;
        c = a + 3;
    }
}
~~~

这个例子中我们定义了三个类变量，然后通过一个add方法对其中的变量进行累加。

然后在main方法中对add方法调用10000次。调用这么多次，主要是为了保证add成为热点代码，从而使用JIT进行编译。

# 使用jitWatch进行分析

之前提到了JIT分析的神器jitWatch，今天我们来使用jitWatch来分析上面的代码。

从jitWatch的github中下载源码，运行mvn exec:java即可开启jitWatch之旅。

打开sandbox,选择我们编写的类文件。点击运行即可。

有不熟悉jitWatch的朋友可以参考我之前写的文章：

[JIT的Profile神器JITWatch](http://www.flydean.com/jvm-jit-jitwatch/)

然后我们到了下面熟悉的界面：

![](https://img-blog.csdnimg.cn/20200626093933588.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

界面分为三部分，左边是源代码，中间是字节码，最右边是JIT编译的汇编代码。

# 分析字节码

我们分析下add方法生成的字节码：

~~~java
 0: getstatic       #13  // Field b:I
 3: iconst_1        
 4: iadd            
 5: putstatic       #17  // Field a:I
 8: getstatic       #20  // Field c:I
11: iconst_2        
12: iadd            
13: putstatic       #13  // Field b:I
16: getstatic       #17  // Field a:I
19: iconst_3        
20: iadd            
21: putstatic       #20  // Field c:I
24: return          
~~~

我们可以看到字节码和java源代码是一一对应的。

比如add方法的第一行：

~~~java
a = b + 1;
~~~

相应的字节码是这样的：

~~~java
 0: getstatic       #13  // Field b:I
 3: iconst_1        
 4: iadd            
 5: putstatic       #17  // Field a:I
~~~

首先通过getstatic拿到字段b的值。然后调用iconst_1，将1加载。接着调用iadd把1和b相加。最后将生成的值使用putstatic赋值给a。

字节码和源代码一一对应，完全没有问题。

# 分析汇编代码

那么JIT生成的汇编代码是不是也和java代码一致呢？我们再来看一下生成的汇编代码。

![](https://img-blog.csdnimg.cn/202006261003442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从图片我们可以看出，生成的汇编代码可以分为方法初始化，代码逻辑区，多线程同步，地址和cache line对齐，异常处理，返优化等几个部分。

这里我们主要关注一下代码逻辑区：

![](https://img-blog.csdnimg.cn/20200626102546144.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从图上我做的标记可以看出，汇编中执行的逻辑是
b=c+2, a =b+1和c=b+4。

不光执行顺序发送了变化（重排序），执行逻辑也进行了优化。

大家可能注意到汇编语言中有这样几个不太明白的代码：

~~~java
0x78(%r10)
0x74(%r10)
0x70(%r10)
~~~

通过第二行的注解，我们知道r10存储的是AddTest这个对象，而0x70，0x74和0x78是AddTest中的偏移量，用来定位类变量a,b,c。

# 总结

从上面的例子可以知道，JIT会对代码进行优化，所以最好的办法是不要自己在java代码中做一些你认为是优化的优化，因为这样可能让JIT在优化的时候变得困惑。从而限制了代码优化的力度。

最后，JIT是一个非常强大的工具。希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



