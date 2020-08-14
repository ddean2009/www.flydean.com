小师妹学JVM之:JIT中的PrintAssembly

# 简介

想不想了解JVM最最底层的运行机制？想不想从本质上理解java代码的执行过程？想不想对你的代码进行进一步的优化和性能提升？

如果你的回答是yes。那么这篇文章非常适合你，因为本文将会站在离机器码最近的地方来观看JVM的运行原理：Assembly。

# 使用PrintAssembly

小师妹：F师兄，上次你给我介绍了java中的字节码，还有JIT中的LogCompilation和PrintCompilation的用法。虽然都非常有用，但是能不能更进一步，让我能以机器的眼光来看待JVM的执行？

小师妹，如果要探究JVM的运行本质，那就应该是机器码了。难道你要去读懂机器码？虽然我不是机器码的专家，但我猜那应该是个非常复杂的过程。

小师妹：F师兄，当然不是机器码，有没有比机器码更高级一点点的，我记得上大学的时候学过汇编语言，好像就是离机器码最近的语言了，JVM有没有相应的汇编语言呢？

必须有的，我们可以使用-XX:+PrintAssembly来将assembly打印出来。

但是打印assembly是有条件的，它就像一个高傲的姑娘，不是你想追求就能追求得上的。

我们使用下面的命令来查看系统对PrintAssembly的支持程度：

~~~java
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -version

Java HotSpot(TM) 64-Bit Server VM warning: PrintAssembly is enabled; turning on DebugNonSafepoints to gain additional output
Could not load hsdis-amd64.dylib; library not loadable; PrintAssembly is disabled
java version "1.8.0_171"
Java(TM) SE Runtime Environment (build 1.8.0_171-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.171-b11, mixed mode)
~~~

根据大家的运行环境的不同，得到的结果可能也是不同的，我是mac的系统，从上面的结果可以看到，在我的JDK8的环境中，显示缺少hsdis-amd64.dylib，所以PrintAssembly其实是禁用的。

小师妹：F师兄，那现在咋办呀？没有hsdis-amd64.dylib就用不了PrintAssembly了。

巴甫洛夫说过：问号是开启任何一门科学的钥匙。没有问题我们就创造问题，没有困难我们就制造困难，没有hsdis-amd64.dylib当然是安装咯。

具体怎么安装，大家自行探索吧，网上有很多安装的教程，这里就不一一介绍了。

这里想讨论一个很奇怪的事情，虽然在JDK8环境中，我们不能使用PrintAssembly，因为没有hsdis-amd64.dylib。但是当我切到最新的JDK14环境中，一切都很美好，PrintAssembly可以正常运行了。

如果我们在JDK14中同样运行上面的命令，我们会得到下面的结果：

![](https://img-blog.csdnimg.cn/20200530193157627.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

说明在JDK14中是不用安装hsdis-amd64.dylib就可以使用啦。

> 注意，上面的说法并没有验证过，如果我说错了，请指正。

# 输出过滤

默认情况下，PrintAssembly输出的是所有的信息，但是JDK内部的代码我们不可能进行修改，一般来说并不关心他们的assembly输出，如果要指定我们自己编写的方法，可以使用CompileCommand：

~~~java
CompileCommand=print,*MyClass.myMethod prints assembly for just one method
CompileCommand=option,*MyClass.myMethod,PrintOptoAssembly (debug build only) produces the old print command output
CompileCommand=option,*MyClass.myMethod,PrintNMethods produces method dumps
~~~

例如：

~~~java
-XX:CompileCommand=print,com.flydean.PrintAssemblyUsage::testPrintAssembly
~~~

这样我们可以得到，只属于testPrintAssembly方法的输出：

![](https://img-blog.csdnimg.cn/20200530194133803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)


# 总结

本文讲解了怎么使用PrintAssembly来输出JVM的汇编日志。我们会在后面继续讲解这些Assembly code到底有什么用。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！





