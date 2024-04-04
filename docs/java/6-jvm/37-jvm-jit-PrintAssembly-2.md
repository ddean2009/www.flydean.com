---
slug: /jvm-jit-PrintAssembly-2
---

# 37. 小师妹学JVM之:JIT中的PrintAssembly续集

## 简介

上篇文章和小师妹一起介绍了PrintAssembly和PrintAssembly在命令行的使用，今天本文将会更进一步讲解如何在JDK8和JDK14中分别使用PrintAssembly，并在实际的例子中对其进行进一步的深入理解。

## JDK8和JDK14中的PrintAssembly

小师妹：F师兄，上次你介绍的PrintAssembly的自测命令，怎么在JDK14中不好用呢？

~~~java
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -version
~~~

有什么不好用的，命令不是正常打出来了吗？

小师妹：F师兄，你看下我运行的结果，机器码下面展示的怎么是448b 5608这样的数字呀，不应该是assembly language吗？

![](https://img-blog.csdnimg.cn/20200530194133803.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

嗯...小师妹的话让我陷入了深深的思考，究竟是什么导致了这样的反常的结果呢？是道德的沦丧还是人性的扭曲？

于是我翻遍了baidu，哦，不对是google，还是没有找到结果。

难点是JDK14有bug？还是JDK14已经使用了另外的Assembly的实现？

有问题就解决问题，我们先从JDK8开始，来探索一下最原始的PrintAssembly的使用。

## JDK8中使用Assembly

在JDK8中如果我们运行Assembly的测试命令，可以得到下面的结果：

~~~java
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintAssembly -version

Java HotSpot(TM) 64-Bit Server VM warning: PrintAssembly is enabled; turning on DebugNonSafepoints to gain additional output
Could not load hsdis-amd64.dylib; library not loadable; PrintAssembly is disabled
java version "1.8.0_171"
Java(TM) SE Runtime Environment (build 1.8.0_171-b11)
Java HotSpot(TM) 64-Bit Server VM (build 25.171-b11, mixed mode)
~~~

这个故事告诉我们，虽然PrintAssembly开关打开了，但是系统不支持，缺少了hsdis-amd64.dylib文件。

这个hsdis是一个反汇编的工具，我们需要hsdis的支持才能在JDK8中使用Assembly。

我是mac系统，下面是在mac系统怎么安装hsdis：

~~~java
hg clone http://hg.openjdk.java.net/jdk8u/jdk8u

cd jdk8u/hotspot/src/share/tools/hsdis/

wget http://ftp.heanet.ie/mirrors/ftp.gnu.org/gnu/binutils/binutils-2.30.tar.gz

tar -xzf binutils-2.30.tar.gz

make BINUTILS=binutils-2.30 ARCH=amd64

#java8
sudo cp build/macosx-amd64/hsdis-amd64.dylib /Library/Java/JavaVirtualMachines/jdk1.8.0_181.jdk/Contents/Home/jre/lib/server/

#java9 onwards
sudo cp build/macosx-amd64/hsdis-amd64.dylib /Library/Java/JavaVirtualMachines/jdk-9.0.4.jdk/Contents/Home/lib/server/
~~~

如果你是linux或者windows系统，请自行探索hsdis的安装方法。

按照步骤先把java8的hsdis-amd64.dylib安装好。

然后再次运行测试命令：

![](https://img-blog.csdnimg.cn/20200602225754419.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

完美，汇编语言出现了。

## JDK14中的Assembly

然后我想到，如果把这个dylib文件拷贝到JDK14相应的目录下面，运行一次会怎么样呢？

> 大家注意，JDK9之后，使用了模块化，所以之前的目录结构发生了比较大的变化，大家参考上面我列出的地址。

再次运行测试代码：

![](https://img-blog.csdnimg.cn/20200602230145355.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

大家看到，Assembly又出现了，真的是让我热内盈亏。

其实最开始的时候，我发现JDK14中Assembly没能正常显示的时候，我也有想过拷贝一个hsdis-amd64.dylib过来试试，但是一看还需要下载JDK的代码，重新编译，就打起了退堂鼓。

吃一堑，长一智，下次遇到问题千万不能走捷径。抄近路害死人呀！

## 在JMH中使用Assembly

Assembly主要是为了进行代码调优或者理解JVM的运行原理来使用的。

这里我们举一个在JMH中使用Assembly的例子：

~~~java
@Warmup(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS)
@Measurement(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS)
@Fork(value = 1,
        jvmArgsPrepend = {
        "-XX:+UnlockDiagnosticVMOptions",
                "-XX:CompileCommand=print,com.flydean.PrintAssemblyUsage::testPrintAssembly"
}
)
@State(Scope.Benchmark)
@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
public class PrintAssemblyUsage {

    int x;
    @Benchmark
    @CompilerControl(CompilerControl.Mode.DONT_INLINE)
    public void testPrintAssembly() {
        for (int c = 0; c < 1000; c++) {
            synchronized (this) {
                x += 0xFF;
            }
        }
    }
    public static void main(String[] args) throws RunnerException {
        Options opt = new OptionsBuilder()
                .include(PrintAssemblyUsage.class.getSimpleName())
                .build();

        new Runner(opt).run();
    }
}
~~~

上面的例子中，我们使用了-XX:CompileCommand指定要打印的方法，而不是输出所有的Assembly，方便我们查看和分析结果。

## 总结

本文介绍了JDK8和JDK14中，怎么开启PrintAssembly。并举了一个在JMH中使用的例子。

那么有人会问了，在JMH中使用Assembly到底有什么意义呢？别急，我们在后面深入JVM的本质中，马上就要讲到，敬请期待。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



