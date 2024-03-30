---
slug: /jvm-thread-stack-frames
---

# 5. 小师妹学JVM之:JVM中栈的frames详解

## 简介

我们知道JVM运行时数据区域专门有一个叫做Stack Area的区域，专门用来负责线程的执行调用。那么JVM中的栈到底是怎么工作的呢？快来一起看看吧。

## JVM中的栈

小师妹:F师兄，JVM为每个线程的运行都分配了一个栈，这个栈到底是怎么工作的呢？

小师妹，我们先看下JVM的整体运行架构图：

![](https://img-blog.csdnimg.cn/20200524221637660.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们可以看到运行时数据区域分为5大部分。

堆区是存储共享对象的地方，而栈区是存储线程私有对象的地方。

因为是栈的结构，所以这个区域总是LIFO(Last in first out)。我们考虑一个方法的执行，当方法执行的时候，就会在Stack Area中创建一个block，这个block中持有对本地对象和其他对象的引用。一旦方法执行完毕，则这个block就会出栈，供其他方法访问。

## Frame

JVM中的stack area是由一个个的Frame组成的。

Frame主要用来存储数据和部分结果，以及执行动态链接，方法的返回值和调度异常。

每次调用方法时都会创建一个新Frame。当Frame的方法调用完成时，无论该方法是正常结束还是异常结束（它引发未捕获的异常），这个frame都会被销毁。

Frame是从JVM中的stack area中分配的。

每个frame都由三部分组成，分别是自己的local variables数组，自己的operand stack，以及对当前方法的run-time constant pool的引用。 

在线程的执行过程中，任何一个时刻都只有一个frame处于活动状态。这个frame被称为current frame，它的方法被称为current 方法，定义当前方法的类是当前类。

如果frame中的方法调用另一个方法或该frame的方法结束，那么这个frame将不再是current frame。

每次调用新的方法，都会创建一个新的frame，并将控制权转移到调用新的方法生成的框架。

在方法返回时，当前frame将其方法调用的结果（如果有的话）传回上一个frame，并结束当前frame。

> 请注意，由线程创建的frame只能有该线程访问，并且不能被任何其他线程引用。

![](https://img-blog.csdnimg.cn/20200613234100780.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

## Local Variables本地变量

每个frame都包含一个称为其本地局部变量的变量数组。frame的局部变量数组的长度是在编译的时候确定的。

单个局部变量可以保存以下类型的值：boolean, byte, char, short, int, float, reference, 或者 returnAddress。

如果对于long或double类型的值需要使用一对局部变量来存储。

局部变量因为存储在数组中，所以直接通过数字的索引来定位和访问。

> 注意，这个数组的索引值是从0开始，到数组长度-1结束。

单个局部变量直接通过索引来访问就够了，那么对于占用两个连续局部变量的long或者double类型来说，怎么访问呢？

比如说一个long类型占用数组中的n和n+1两个变量，那么我们可以通过索引n值来访问这个long类型，而不是通过n+1来访问。

> 注意，在JVM中，并不一定要求这个n是偶数。

那么这些局部变量有什么用呢？

Java虚拟机使用局部变量在方法调用时传递参数。

我们知道在java中有两种方法，一种是类方法，一种是实例方法。

在类方法调用中，所有参数都从局部变量0开始在连续的局部变量中传递。

在实例方法调用中，局部变量0始终指向的是该实例对象，也就是this。也就是说真实的参数是从局部变量1开始存储的。

## Operand Stacks

在每个frame内部，又包含了一个LIFO的栈，这个栈叫做Operand Stack。 

刚开始创建的时候，这个Operand Stack是空的。然后JVM将local variables中的常量或者值加载到Operand Stack中去。

然后Java虚拟机指令从操作数堆栈中获取操作数，对其进行操作，然后将结果压回操作数堆栈。

比如说，现在的Operand Stack中已经有两个值，1和2。

这个时候JVM要执行一个iadd指令，将1和2相加。那么就会先将stack中的1和2两个数取出，相加后，将结果3再压入stack。

最终stack中保存的是iadd的结果3。

> 注意，在Local Variables本地变量中我们提到，如果是long或者double类型的话，需要两个本地变量来存储。而在Operand Stack中，一个值可以表示任何Java虚拟机类型的值。也就是说long和double在Operand Stack中，使用一个值就可以表示了。

Operand Stack中的任何操作都必须要确保其类型匹配。像之前提到的iadd指令是对两个int进行相加，如果这个时候你的Operand Stacks中存储的是long值，那么iadd指令是会失败的。

在任何时间点，操作数堆栈都具有关联的深度，其中long或double类型的值对该深度贡献两个单位，而任何其他类型的值则贡献一个单位深度。

## Dynamic Linking动态链接

什么是动态链接呢？

我们知道在class文件中除了包含类的版本、字段、方法、接口
等描述信息外，还有一项信息就是常量池(constant pool table)，用于存放编译器生成的各种字面量(Literal)和符号引用(Symbolic References)。

所谓字面量就是常说的常量，可以有三种方式，分别是：文本字符串，八种基本类型和final类型的常量。

而符号引用是指用符号来描述所引用的目标。

符号引用和直接引用有什么区别呢？ 我们举个例子。

比如我们定义了String name="jack", 其中jack是一个字面量，会在字符串常量池（String Pool）中保存一份。

如果我们存储的时候，存的是name，那么这个就是符号引用。

如果我们存储的是jack在字符串常量池中地址，那么这个就是直接引用。

从上面的介绍我们可以知道，为了实现最终的程序正常运行，所有的符号引用都需要转换成为直接引用才能正常执行。

而这个转换的过程，就叫做动态链接。

动态链接将这些符号方法引用转换为具体的方法引用，根据需要加载类以解析尚未定义的符号，并将变量访问转换为与这些变量的运行时位置关联的存储结构中的适当偏移量。

## 方法执行完毕

方法执行完毕有两种形式，一种是正常执行完毕，一种是执行过程中抛出了异常。

正常执行完毕的方法可以值返回给调用方。

这种情况下frame的作用就是恢复调用程序的状态，包括其局部变量和操作数堆栈，并适当增加调用程序的程序计数器以跳过方法调用指令。

如果方法中抛出了异常，那么该方法将不会有值返回给调用方。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！







