---
slug: /jvm-byte-code
---

# 3. 小师妹学JVM之:java的字节码byte code简介

## 简介

Byte Code也叫做字节码，是连接java源代码和JVM的桥梁，源代码编译成为字节码，而字节码又被加载进JVM中运行。字节码怎么生成，怎么查看字节码，隐藏在Byte Code背后的秘密是什么呢？快跟小师妹一起来看看吧。

## Byte Code的作用

小师妹：F师兄，为什么Java需要字节码呢？直接编译成为机器码不是更快吗？

小师妹，Java的设计初衷是一次编写，到处运行。为了兼容各个平台的运行环境，java特别为各种平台设计了JVM。

我们可以把JVM看做是一种抽象，对外提供了统一的接口。这样我们只需要编写符合JVM规范的代码，即可在JVM中运行。

回想下之前我们提到过的java的执行过程：

![](https://img-blog.csdnimg.cn/20200524212920415.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

1. 编写java代码文件比如Example.java
2. 使用java编译器javac将源文件编译成为Example.class文件
3. JVM加载生成的字节码文件，将其转换成为机器可以识别的native machine code执行

小师妹：F师兄，我有一个大胆的想法，JVM的作用是将字节码解释或者编译成为机器码。然后在相应的运行环境中执行。那么有没有可能，不需要JVM，不需要机器码，而是直接在对应的平台上执行字节码呢？

爱因斯坦说过没有想像力的灵魂，就像没有望远镜的天文台。小师妹你这个想法很好，这种实现有个专业的说法叫做：Java processor。

Java processor就是用硬件来实现的JVM。因此字节码可以直接在Java processor中运行。

其中比较出名的是Jazelle DBX，这是一个主要支持J2ME环境的硬件架构。为了提升java在手机端的执行速度。

但是这样做其实也是有缺点的，后面我们会讲到，java字节码中的指令非常非常多。所以如果用硬件来实现的话，就会非常非常复杂。

一般来说Java processor不会实现全部的字节码中的功能，只会提供部分的实现。

## 查看Byte Code字节码

小师妹：F师兄，那使用javac编译过后的class文件跟字节码有什么关系呢？

class文件中大部分都是byte code，其他的部分是一些meta data元数据信息。这些组合在一起就是class文件了。

小师妹：F师兄，你说class文件是byte code，为什么我在IDE中打开的时候，直接显示的是反编译出来的源文件呢？

小师妹，这是IDE的一个便利功能。因为大多数情况下，没有人想去看class文件的Byte code的，大家都是想去看看这个class文件的源文件是什么样的。

我们举个最简单的例子：

![](https://img-blog.csdnimg.cn/2020053021330297.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这个类中，我们定义了一个很简单的testByteCode方法，里面定义了两个变量，然后返回他们两个的和。

现在有两种方法来查看这个类的Byte Code：

第一种方法是用javap命令：

~~~java
javap -c ByteCodeUsage.class
~~~

![](https://img-blog.csdnimg.cn/20200530213721962.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

生成的结果如上所示。

第二种方法就是在IDEA中，选中class文件，然后在view中选中show Bytecode：

![](https://img-blog.csdnimg.cn/20200530214606575.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们看下输出结果：

![](https://img-blog.csdnimg.cn/20200530215213620.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

两个的结果在显示上面可能有细微的差异，但是并不影响我们后面对其的解析。

## java Byte Code是怎么工作的

小师妹：F师兄，能讲解一下这些byte code到底是怎么工作的吗？

首先我们要介绍一下JVM的实现是基于栈的结构的。为什么要基于栈的结构呢？那是因为栈是最适合用来实现function互相调用的。

我们再回顾一下上面的testByteCode的字节码。里面有很多iconst，istore的东西，这些东西被称作Opcode，也就是一些基于栈的操作指令。

上面讲了java bytecode的操作指令其实有很多个。下面我们列出这些指令的部分介绍：

![](https://img-blog.csdnimg.cn/20200530223345376.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

实在是太多了，这里就不把所有的列出来了。

我们看到的指令名字其实是一个助记词，真实的Opcode是一个占用两个字节的数字。

下面我们来详细解释一下testByteCode方法：

~~~java
public int testByteCode();
    Code:
       0: iconst_1
       1: istore_1
       2: iconst_2
       3: istore_2
       4: iload_1
       5: iload_2
       6: iadd
       7: ireturn
~~~

第一步，iconst_1将int 1加载到stack中。

第二步，istore_1将入栈的int 1出栈，并存储到变量1中。

第三步，iconst_2将int 2入栈。

第四步，istore_2将入栈的int 2出栈，并存储到变量2中。

第五步，iload_1将变量1中的值入栈。

第六步，iload_2将变量2中的值入栈。

第七步，iadd将栈中的两个变量出栈，并相加。然后将结果入栈。

第八步，ireturn将栈中的结果出栈。

这几步实际上完美的还原了我们在testByteCode方法中定义的功能。

当然我们只介绍了最贱的byte code命令，通过这些简单的命令可以组合成为更加复杂的java命令。

## 总结

本文介绍了java byte code的作用和具体的指令，并分析了一个简单的例子来做说明。希望大家能够掌握。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
