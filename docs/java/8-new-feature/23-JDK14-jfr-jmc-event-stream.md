---
slug: /JDK14-jfr-jmc-event-stream
---

# 23. JDK 14的新特性:JFR,JMC和JFR事件流

# 简介

Java Flight Recorder（JFR）是JVM的诊断和性能分析工具。它可以收集有关JVM以及在其上运行的Java应用程序的数据。JFR是集成到JVM中的，所以JFR对JVM的性能影响非常小，我们可以放心的使用它。

一般来说，在使用默认配置的时候，性能影响要小于1%。

JFR的历史很久远了。早在Oracle2008年收购BEA的时候就有了。JFR一般和JMC（Java Mission Control）协同工作。

JFR是一个基于事件的低开销的分析引擎，具有高性能的后端，可以以二进制格式编写事件，而JMC是一个GUI工具，用于检查JFR创建的数据文件。

这些工具最早是在BEA的JRockit JVM中出现的，最后被移植到了Oracle JDK。最开始JFR是商用版本，但是在JDK11的时候，JFR和JMC完全开源了，这意味着我们在非商用的情况下也可以使用了。

而在今天的JDK 14中，引入了一个新的JFR特性叫做JFR Event Streaming，我们将在本文中详细讲解。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

先介绍一下JFR和JMC。

# JFR 

上面我们简单的介绍了一下JFR。JFR是JVM的调优工具，通过不停的收集JVM和java应用程序中的各种事件，从而为后续的JMC分析提供数据。

Event是由三部分组成的：时间戳，事件名和数据。同时JFR也会处理三种类型的Event：持续一段时间的Event，立刻触发的Event和抽样的Event。

为了保证性能的最新影响，在使用JFR的时候，请选择你需要的事件类型。

JFR从JVM中搜集到Event之后，会将其写入一个小的thread-local缓存中，然后刷新到一个全局的内存缓存中，最后将缓存中的数据写到磁盘中去。

或者你可以配置JFR不写到磁盘中去，但是这样缓存中只会保存部分events的信息。这也是为什么会有JDK14 JEP 349的原因。

开启JFR有很多种方式，这里我们关注下面两种：

1. 添加命令行参数

~~~java
-XX:StartFlightRecording:<options>
~~~

启动命令行参数的格式如上所述。

JFR可以获取超过一百种不同类型的元数据。如果要我们一个个来指定这些元数据，将会是一个非常大的功能。所以JDK已经为我们提供了两个默认的profile：default.jfc and profile.jfc。

其中 default.jfc 是默认的记录等级，对JVM性能影响不大，适合普通的，大部分应用程序。而profile.jfc包含了更多的细节，对性能影响会更多一些。

如果你不想使用默认的两个jfc文件，也可以按照你自己的需要来创建。

下面看一个更加完整的命令行参数：

~~~java
-XX:StartFlightRecording:disk=true,filename=/tmp/customer.jfr,maxage=5h,settings=profile
~~~

上面的命令会创建一个最大age是5h的profile信息文件。

2. 使用jcmd

命令行添加参数还是太麻烦了，如果我们想动态添加JFR，则可以使用jcmd命令。

~~~java
jcmd <pid> JFR.start name=custProfile settings=default
jcmd <pid> JFR.dump filename=custProfile.jfr
jcmd <pid> JFR.stop
~~~

上面的命令在一个运行中的JVM中启动了JFR，并将统计结果dump到了文件中。

上面的custProfile.jfr是一个二进制文件，为了对其进行分析，我们需要和JFR配套的工具JMC。

# JMC

JDK Mission Control 是一个用于对 Java 应用程序进行管理、监视、概要分析和故障排除的工具套件。

在JDK14中，JMC是独立于JDK单独发行的。我们可以下载之后进行安装。

我们先启动一个程序，用于做JFR的测试。

~~~java
@Slf4j
public class ThreadTest {

    public static void main(String[] args) {
        ExecutorService executorService= Executors.newFixedThreadPool(10);
        Runnable runnable= ()->{
            while(true){
                log.info(Thread.currentThread().getName());
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    log.error(e.getMessage(),e);
                }
            }
        };

        for(int i=0; i<10; i++){
            executorService.submit(runnable);
        }
    }
}
~~~

很简单的一个程序，启动了10个线程，我们启动这个程序。

然后再去看看JMC的界面：

![](https://img-blog.csdnimg.cn/20200429100759853.png)

我们可以看到在界面的左边已经可以看到运行在本机的ThreadTest程序了。

点击MBean服务器，可以看到该java程序的面板信息，里面包含CPU，堆栈信息。

在下面有7个tab分别是概览，MBean浏览器，触发器，系统，内存，线程，和诊断命令。

通过下面的tab我们可以获得更加详细的java程序的信息，并且通过触发器和诊断命令，我们还可以对目标java程序的JVM发送命令。

JMC非常强大，也有很多功能，具体的细节大家可以自己运行去体会。

因为本文主要是将JFR，下面我们将讲解如何在JMC中创建JFR和分析JFR。

## 创建JFR

上面右侧的MBean服务器下就是飞行记录器了，也就是我们的目标。

点击飞行记录器：

![](https://img-blog.csdnimg.cn/20200429101507345.png)

我们就可以开始创建一个JFR了。

目标文件就是JFR的生成地址，名称可以自己随便起一个，记录时间表示需要记录多长时间范围之内的JFR。

点下一步：

![](https://img-blog.csdnimg.cn/20200429101522308.png)

这一步可以选择更加详细的JVM参数。

点下一步：

![](https://img-blog.csdnimg.cn/20200429101546799.png)

这里，我们可以选择需要监控的Profile事件选项。可以按照你的需要进行选择。

最后点完成创建JFR。

## 分析JFR

上面我们的JFR记录了1分钟的Profile，在1分钟之后，我们可以看到目标JFR文件生成了。

![](https://img-blog.csdnimg.cn/20200429102632883.png)

生成完JFR之后，JMC会自动打开生成的JFR文件，我们得到一个大纲视图。

里面包含java应用程序，JVM内部，环境和事件浏览器。

事件浏览器中列出了我们在1分钟之内监控的事件。

![](https://img-blog.csdnimg.cn/20200429112015945.png)

> JMC浏览器不仅可以监控本机的应用程序，也可以监控远程的应用程序。由于JMC的连接是通过JMX协议，所以远程java程序需要开启JMX协议的支持。

# JFR事件

JMC好用是好用，但是要一个一个的去监听JFR文件会很繁琐。接下来我们来介绍一下怎么采用写代码的方式来监听JFR事件。

还是上面的图，如果我们想通过程序来获取“Class Loading Statistics"的信息，可以这样做。

上图的右侧是具体的信息，我们可以看到主要包含三个字段：开始时间，Loaded Class Count和 Unloaded Class Count。

我们的思路就是使用jdk.jfr.consumer.RecordingFile去读取生成的JFR文件，然后对文件中的数据进行解析。

相应代码如下：

~~~java
@Slf4j
public class JFREvent {

    private static Predicate<RecordedEvent> testMaker(String s) {
        return e -> e.getEventType().getName().startsWith(s);
    }

    private static final Map<Predicate<RecordedEvent>,
            Function<RecordedEvent, Map<String, String>>> mappers =
            Map.of(testMaker("jdk.ClassLoadingStatistics"),
                    ev -> Map.of("start", ""+ ev.getStartTime(),
                            "Loaded Class Count",""+ ev.getLong("loadedClassCount"),
                            "Unloaded Class Count", ""+ ev.getLong("unloadedClassCount")
                    ));

    @Test
    public void readJFRFile() throws IOException {
        RecordingFile recordingFile = new RecordingFile(Paths.get("/Users/flydean/flight_recording_1401comflydeaneventstreamThreadTest21710.jfr"));
        while (recordingFile.hasMoreEvents()) {
            var event = recordingFile.readEvent();
            if (event != null) {
                var details = convertEvent(event);
                if (details == null) {
                    // details为空
                } else {
                    // 打印目标
                    log.info("{}",details);
                }
            }
        }
    }

    public Map<String, String> convertEvent(final RecordedEvent e) {
        for (var ent : mappers.entrySet()) {
            if (ent.getKey().test(e)) {
                return ent.getValue().apply(e);
            }
        }
        return null;
    }
}
~~~

注意，在convertEvent方法中，我们将从文件中读取的Event转换成了map对象。

在构建map时，我们先判断Event的名字是不是我们所需要的jdk.ClassLoadingStatistics，然后将Event中其他的字段进行转换。最后输出。

运行结果：

~~~java
{start=2020-04-29T02:18:41.770618136Z, Loaded Class Count=2861, Unloaded Class Count=0}
...
~~~

可以看到输出结果和界面上面是一样的。


# JFR事件流

讲了这么多，终于到我们今天要讲的内容了：JFR事件流。

上面的JFR事件中，我们需要去读取JFR文件，进行分析。但是文件是死的，人是活的，每次分析都需要先生成JFR文件简直是太复杂了。是个程序员都不能容忍。

在JFR事件流中，我们可以监听Event的变化，从而在程序中进行相应的处理。这样不需要生成JFR文件也可以监听事件变化。

~~~java
    public static void main(String[] args) throws IOException, ParseException {
        //default or profile 两个默认的profiling configuration files
        Configuration config = Configuration.getConfiguration("default");
        try (var es = new RecordingStream(config)) {
            es.onEvent("jdk.GarbageCollection", System.out::println);
            es.onEvent("jdk.CPULoad", System.out::println);
            es.onEvent("jdk.JVMInformation", System.out::println);
            es.setMaxAge(Duration.ofSeconds(10));
            es.start();
        }
    }
~~~

看看上面的例子。我们通过Configuration.getConfiguration("default")获取到了默认的default配置。

然后通过构建了default的RecordingStream。通过onEvent
方法，我们对相应的Event进行处理。

# 总结

本文讲解了JFR，JMC和JDK14的最新特性JFR event stream。希望能够对大家在工作中有所帮助。

本文的例子[https://github.com/ddean2009/learn-java-base-9-to-20
](https://github.com/ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](http://www.flydean.com)











