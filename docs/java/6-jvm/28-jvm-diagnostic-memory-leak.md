---
slug: /jvm-diagnostic-memory-leak
---

# 28. troubleshoot之:使用JFR解决内存泄露

## 简介

虽然java有自动化的GC，但是还会有内存泄露的情况。当然java中的内存泄露跟C++中的泄露不同。

在C++中所有被分配的内存对象都需要要程序员手动释放。但是在java中并不需要这个过程，一切都是由GC来自动完成的。那么是不是java中就没有内存泄露了呢？

要回答这个问题我们首先需要界定一下什么是内存泄露。如果说有时候我们不再使用的对象却不能被GC释放的话，那么就可以说发生了内存泄露。

内存泄露的主要原因就是java中的对象生命周期有长有短。如果长生命周期的对象引用了短生命周期的对象，就有可能造成事实上的内存泄露。

## 一个内存泄露的例子

我们举一个内存泄露的例子，先定义一个大对象：

~~~java
public class KeyObject {
    List<String> list = new ArrayList<>(200);
}
~~~

然后使用它：

~~~java
public class TestMemoryLeak {

    public static HashSet<Object> hashSet= new HashSet();

    public static void main(String[] args) throws InterruptedException {
        boolean flag= true;
        while(flag){
            KeyObject keyObject= new KeyObject();
            hashSet.add(keyObject);
            keyObject=null;
            Thread.sleep(1);
        }
        System.out.println(hashSet.remove(new KeyObject()));
    }
}
~~~

在这个例子中，我们将new出来的KeyObject对象放进HashSet中。
然后将keyObject置为空。

但是因为类变量hashSet还保留着对keyObject的引用，所以keyObject对象并不会被回收。

> 注意，最后一行我们加了一个hashSet.remove的代码，来使用类变量hashSet。
> 为什么要这样做呢？这样做是为了防止JIT对代码进行优化，从而影响我们对内存泄露的分析。

## 使用JFR和JMC来分析内存泄露

Flight Recorder(JFR)主要用来记录JVM的事件，我们可以从这些事件中分析出内存泄露。

可以通过下面的指令来开启JFR：

~~~java
java -XX:StartFlightRecording
~~~

当然我们也可以使用java神器jcmd来开启JFR：

~~~java
jcmd pid JFR.dump filename=recording.jfr path-to-gc-roots=true
~~~

这里我们使用JMC来图形化分析一下上面的例子。

![](https://img-blog.csdnimg.cn/20200704192328179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

开启JMC，找到我们的测试程序，打开飞行记录器。

![](https://img-blog.csdnimg.cn/20200704192538997.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

可以看到我们的对象在飞行记录器期间分配了4MB的内存，然后看到整体的内存使用量是稳步上升的。

> 我们什么时候知道会有内存泄露呢？最简单的肯定就是OutOfMemoryErrors，但是有些很隐蔽的内存泄露会导致内存使用缓步上涨，这时候就需要我们进行细致的分析。

通过分析，我们看到内存使用在稳步上涨，这其实是很可疑的。

接下来我们通过JVM的OldObjectSample事件来分析一下。

## OldObjectSample

OldObjectSample就是对生命周期比较长的对象进行取样，我们可以通过研究这些对象，来检查潜在的内存泄露。

![](https://img-blog.csdnimg.cn/20200704203127379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里我们关注一下事件浏览器中的Old Object Sample事件，我们可以在左下方看到事件的详情。

或者你可以使用jfr命令直接将感兴趣的事件解析输出：

~~~java
jfr print --events OldObjectSample flight_recording_1401comflydeanTestMemoryLeak89268.jfr   > /tmp/jfrevent.log
~~~

我们看一个具体的输出Sample：

~~~java
jdk.OldObjectSample {
  startTime = 19:53:25.607
  allocationTime = 19:50:51.924
  objectAge = 2 m 34 s
  lastKnownHeapUsage = 3.5 MB
  object =  [
    java.lang.Object[200]
  ]
  arrayElements = 200
  root = N/A
  eventThread = "main" (javaThreadId = 1)
  stackTrace = [
    java.util.ArrayList.<init>(int) line: 156
    com.flydean.KeyObject.<init>() line: 11
    com.flydean.TestMemoryLeak.main(String[]) line: 17
  ]
}
~~~

lastKnownHeapUsage是heap的使用大小，从日志中我们可以看到这个值是一直在增加的。

allocationTime表示的是这个对象分配的时间。

startTime表示的是这个对象被dump的时间。

object表示的是分配的对象。

stackTrace表示的是这个对象被分配的stack信息。

> 注意，如果需要展示stackTrace信息，需要开启-XX:StartFlightRecording:settings=profile选项。

从上面的日志我们可以分析得出，main方法中的第17行，也就是 KeyObject keyObject= new KeyObject(); 在不断的创建新的对象。

从而我们可以进行更深层次的分析，最终找到内存泄露的原因。

## 总结

本文通过JFR和JMC的使用，介绍了如何分析内存泄露。希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！





