小师妹学JavaIO之:文件系统和WatchService

# 简介

小师妹这次遇到了监控文件变化的问题，F师兄给小师妹介绍了JDK7 nio中引入的WatchService，没想到又顺道普及了一下文件系统的概念，万万没想到。

# 监控的痛点

小师妹：F师兄最近你有没有感觉到呼吸有点困难，后领有点凉飕飕的，说话有点不顺畅的那种？

没有啊小师妹，你是不是秋衣穿反了？

小师妹：不是的F师兄，我讲的是心里的感觉，那种莫须有的压力，还有一丝悸动缠绕在心。

别绕弯子了小师妹，是不是又遇到问题了。

> 更多内容请访问[www.flydean.com](www.flydean.com)

小师妹：还是F师兄懂我，这不上次的Properties文件用得非常上手，每次修改Properties文件都要重启java应用程序，真的是很痛苦。有没有什么其他的办法呢？

办法当然有，最基础的办法就是开一个线程定时去监控属性文件的最后修改时间，如果修改了就重新加载，这样不就行了。

小师妹：写线程啊，这么麻烦，有没有什么更简单的办法呢？

就知道你要这样问，还好我准备的比较充分，今天给你介绍一个JDK7在nio中引入的类WatchService。

# WatchService和文件系统

WatchService是JDK7在nio中引入的接口：

![](https://img-blog.csdnimg.cn/20200518144135360.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

监控的服务叫做WatchService，被监控的对象叫做Watchable：

~~~java
WatchKey register(WatchService watcher,
                      WatchEvent.Kind<?>[] events,
                      WatchEvent.Modifier... modifiers)
        throws IOException;
WatchKey register(WatchService watcher, WatchEvent.Kind<?>... events)
        throws IOException;
~~~

Watchable通过register将该对象的WatchEvent注册到WatchService上。从此只要有WatchEvent发生在Watchable对象上，就会通知WatchService。

WatchEvent有四种类型：

1. ENTRY_CREATE  目标被创建
2. ENTRY_DELETE 目标被删除
3. ENTRY_MODIFY 目标被修改
4. OVERFLOW 一个特殊的Event，表示Event被放弃或者丢失

register返回的WatchKey就是监听到的WatchEvent的集合。

现在来看WatchService的4个方法：

1. close  关闭watchService
2. poll  获取下一个watchKey，如果没有则返回null
3. 带时间参数的poll  在等待的一定时间内获取下一个watchKey
4. take 获取下一个watchKey，如果没有则一直等待

小师妹：F师兄，那怎么才能构建一个WatchService呢？

上次文章中说的文件系统，小师妹还记得吧，FileSystem中就有一个获取WatchService的方法：

~~~java
public abstract WatchService newWatchService() throws IOException;
~~~

我们看下FileSystem的结构图：

![](https://img-blog.csdnimg.cn/20200518143230776.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

在我的mac系统上，FileSystem可以分为三大类，UnixFileSystem，JrtFileSystem和ZipFileSystem。我猜在windows上面应该还有对应的windows相关的文件系统。小师妹你要是有兴趣可以去看一下。

小师妹：UnixFileSystem用来处理Unix下面的文件，ZipFileSystem用来处理zip文件。那JrtFileSystem是用来做什么的？

哎呀，这就又要扯远了，为什么每次问问题都要扯到天边....

从前当JDK还是9的时候，做了一个非常大的改动叫做模块化JPMS（Java Platform Module System），这个Jrt就是为了给模块化系统用的，我们来举个例子：

~~~java
public void useJRTFileSystem(){
        String resource = "java/lang/Object.class";
        URL url = ClassLoader.getSystemResource(resource);
        log.info("{}",url);
    }
~~~

上面一段代码我们获取到了Object这个class的url，我们看下如果是在JDK8中，输出是什么：

~~~java
jar:file:/Library/Java/JavaVirtualMachines/jdk1.8.0_171.jdk/Contents/Home/jre/lib/rt.jar!/java/lang/Object.class
~~~

输出结果是jar:file表示这个Object class是放在jar文件中的，后面是jar文件的路径。

如果是在JDK9之后：

~~~java
jrt:/java.base/java/lang/Object.class
~~~

结果是jrt开头的，java.base是模块的名字，后面是Object的路径。看起来是不是比传统的jar路径更加简洁明了。

有了文件系统，我们就可以在获取系统默认的文件系统的同时，获取到相应的WatchService：

~~~java
WatchService watchService = FileSystems.getDefault().newWatchService();
~~~

# WatchSerice的使用和实现本质

小师妹：F师兄，WatchSerice是咋实现的呀？这么神奇，为我们省了这么多工作。

其实JDK提供了这么多类的目的就是为了不让我们重复造轮子，之前跟你讲监控文件的最简单办法就是开一个独立的线程来监控文件变化吗？其实.....WatchService就是这样做的！

~~~java
PollingWatchService() {
        // TBD: Make the number of threads configurable
        scheduledExecutor = Executors
            .newSingleThreadScheduledExecutor(new ThreadFactory() {
                 @Override
                 public Thread newThread(Runnable r) {
                     Thread t = new Thread(null, r, "FileSystemWatcher", 0, false);
                     t.setDaemon(true);
                     return t;
                 }});
    }
~~~

上面的方法就是生成WatchService的方法，小师妹看到没有，它的本质就是开启了一个daemon的线程，用来接收监控任务。

下面看下怎么把一个文件注册到WatchService上面：

~~~java
private void startWatcher(String dirPath, String file) throws IOException {
        WatchService watchService = FileSystems.getDefault().newWatchService();
        Path path = Paths.get(dirPath);
        path.register(watchService, ENTRY_MODIFY);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                watchService.close();
            } catch (IOException e) {
                log.error(e.getMessage());
            }
        }));

        WatchKey key = null;
        while (true) {
            try {
                key = watchService.take();
                for (WatchEvent<?> event : key.pollEvents()) {
                    if (event.context().toString().equals(fileName)) {
                        loadConfig(dirPath + file);
                    }
                }
                boolean reset = key.reset();
                if (!reset) {
                    log.info("该文件无法重置");
                    break;
                }
            } catch (Exception e) {
                log.error(e.getMessage());
            }
        }
    }
~~~

上面的关键方法就是path.register，其中Path是一个Watchable对象。

然后使用watchService.take来获取生成的WatchEvent，最后根据WatchEvent来处理文件。

# 总结

道生一，一生二，二生三，三生万物。一个简简单单的功能其实背后隐藏着...道德经，哦，不对，背后隐藏着道的哲学。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！

