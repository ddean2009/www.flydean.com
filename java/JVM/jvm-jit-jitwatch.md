小师妹学JVM之:JIT的Profile神器JITWatch

# 简介

老是使用命令行工具在现代化社会好像已经跟不上节奏了，尤其是在做JIT分析时，使用LogCompilation输出的日志实在是太大了，让人望而生畏。有没有什么更加简便的方法来分析JIT日志呢？快来和小师妹一起来学习JITWatch吧。

# 什么是JIT

小师妹，F师兄，JIT就是Just In Time compilers。能不能再总结一下JIT到底是做什么的呢？

当然没问题，JIT主要有两个作用，第一个作用大家应该已经知道了，就是在运行时将byte code编译成为机器码，提高程序的执行速度。

第二个作用就是在运行时对代码进行优化，同样的也对性能进行提升。

JIT中有两种编译器，C1代表的是Client Compiler,C2代表的是Server Compiler。

其中C1只是简单的编译，而C2在收集到更多信息之后，会进行更加深入的编译和优化。

常见的优化手段有：Loop unrolling, Inlining, Dead Code Elimination,Escape analysis, Intrinsics, Branch prediction等。

JDK8中会默认启动分层编译。你也可以使用-XX:+TieredCompilation来手动启动它。

# JITWatch简介

小师妹：F师兄，上次你讲的LogCompilation和PrintCompilation输出结果还是太复杂了，尤其是LogCompilation，输出的结果有十几M，分析起来好难。有没有更简单一点的办法，让我的工作效率加倍呢？

这个必须有，有需求就有市场，有需求就有大神出场。今天给你介绍一个工具叫做JITWatch。

JITWatch是一个大神做的JIT日志的可视化分析工具。在使用它之前你可能觉得它有点强大，在使用后你就会觉得它真的是强大。

# 运行JITWatch

小师妹：F师兄，这么强大的工具，快快介绍我使用吧。

完全没有问题，不过JITWatch没有现成的打包好的可执行文件。没错，你需要到github上面下载源码。

下载完毕，可以执行：

~~~java
mvn clean compile test exec:java
~~~

就可以开启JITWatch之旅了。

# JITWatch详解

小师妹：F师兄，这么好用的工具为什么不打个包出来让大家直接用呢？还要下载源码这么麻烦。

其实吧，JITWatch为了大家方便使用，自带一个Sandbox功能，提供了一些可以直接在JITWatch中运行的代码，同时JITWatch可以实现源码的实时比对功能。所以需要大家下载源码。

闲话休提，我们开启JITWatch之旅吧。

![](https://img-blog.csdnimg.cn/20200604072217290.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

入眼就是如此朴实无华的界面，让人感觉总有点...重剑无锋,大巧不工。高手做的UI就是这么的完美。

接下来我们需要运行一个程序，来实时感受一下JITWatch的魅力。

看到左边最上角的sandbox了吗？点开它可以看到下面的sandbox页面：

![](https://img-blog.csdnimg.cn/20200604072716899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这一个页面会选择一个sadbox中的例子展示给你，大家注意下面的输出框的说明，它会显示你的Disassembler是否可用。如果想要安装disassembler，请参照我之前的文章。

如果你对这个例子不满意，或者你想使用自己的代码，那也完全没有问题。点击config。

![](https://img-blog.csdnimg.cn/20200604091339399.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里你可以配置源代码的路径，可以选择VM的语言，还有各种VM的选项，下面的选项相信我在之前的文章中都已经介绍过了吧。

如果还有不懂的小伙伴，微信我，私聊我，1对1现场教学。

万事俱备，只欠东风，开始吧，我可是要成为Java王的男人！

![](https://img-blog.csdnimg.cn/20200604094305403.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

然后我们就进入了TirView界面，这里我们可看到主界面分成了三部分，源代码，ByteCode和Assembly。

小师妹：真是热泪盈眶啊，终于不需要自己去添加那些XX参数了。面向界面编程，真好。

上面还有几个按钮，这里简单介绍一下他们的功能，具体的界面这里就不截图了，因为实在是太多了....

Chain会展示调用链。

Journal就是之前使用LogCompilation产生的xml日志。

LNT,全称是line number table。---目前我还不知道这个是做什么用的，有知道的朋友，请给我留言。

然后就是Inlined into功能了，这个功能要详细讲一下，因为会影响到程序的执行效率。

还记得之前举的inline的例子吗？

~~~java
int a = 1;
int b = 2;
int result = add(a, b);
...
public int add(int x, int y) { return x + y; }
int result = a + b; //内联替换
~~~

上面的add方法可以简单的被替换成为内联表达式。

![](https://img-blog.csdnimg.cn/20200604100002110.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

JITWatch可以显示方法是否被inlined，并且显示出inlined的原因。

点击BCI可以显示关联的inlined的代码。大家自行体会。

现在再让我们回到可爱又有风格的主页面：

![](https://img-blog.csdnimg.cn/20200604100901519.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

左边是源代码，包含了JDK自己的代码，如果你想详细的分析JDK自己代码的优化，那么这是一个非常好的工具。

右边显示的是被JIT编译的类和方法，并且展示了编译级别和编译的时间。

右上角又有一排按钮，Config是用来配置运行的代码。

TimeLine是以图形的形式展示JIT编译的时间轴。

Histo是直方图展示的一些编译信息。

TopList里面是编译中产生的一些对象的或者数据的排序。

Cache是free code cache空间。

NMethod是native方法。

Threads是JIT编译的线程。

TriView就是我们最开始展示的面板。

最后我们重点讲一下Suggestion:

![](https://img-blog.csdnimg.cn/20200604102143956.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Suggestion是对代码的一些优化建议。

从上图我们可以看到在调用String的hashMap方法时候无法inlined,因为被调用的方法太大了，超出了最大inlining size。

# 总结

所以，我们通过JITWatch可以学到什么呢？最最重要的是我们可以通过JITWatch来分析JIT的运行原理和本质。然后inlined的方法不要太大了，否则影响执行效率。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！















