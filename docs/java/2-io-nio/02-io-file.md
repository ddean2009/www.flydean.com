---
slug: /io-file
---

# 2. 小师妹学JavaIO之:File文件系统

# 简介

小师妹又遇到难题了，这次的问题是有关文件的创建，文件权限和文件系统相关的问题，还好这些问题的答案都在我的脑子里面，一起来看看吧。

# 文件权限和文件系统

早上刚到公司，小师妹就凑过来神神秘秘的问我：F师兄，我在服务器上面放了一些重要的文件，是非常非常重要的那种，有没有什么办法给它加个保护，还兼顾一点隐私？

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

什么文件这么重要呀？不会是你的照片吧，放心没人会感兴趣的。

小师妹说：当然不是，我要把我的学习心得放上去，但是F师兄你知道的，我刚刚开始学习，很多想法都不太成熟，想先保个密，后面再公开。

看到小师妹这么有上进心，我老泪纵横，心里很是安慰。那就开始吧。

你知道，这个世界上操作系统分为两类，windows和linux（unix）系统。两个系统是有很大区别的，但两个系统都有一个文件的概念，当然linux中文件的范围更加广泛，几乎所有的资源都可以看做是文件。

有文件就有对应的文件系统，这些文件系统是由系统内核支持的，并不需要我们在java程序中重复造轮子，直接调用系统的内核接口就可以了。

小师妹：F师兄，这个我懂，我们不重复造轮子，我们只是轮子的搬运工。那么java是怎么调用系统内核来创建文件的呢？

创建文件最常用的方法就是调用File类中的createNewFile方法，我们看下这个方法的实现：

~~~java
public boolean createNewFile() throws IOException {
        SecurityManager security = System.getSecurityManager();
        if (security != null) security.checkWrite(path);
        if (isInvalid()) {
            throw new IOException("Invalid file path");
        }
        return fs.createFileExclusively(path);
    }
~~~

方法内部先进行了安全性检测，如果通过了安全性检测就会调用FileSystem的createFileExclusively方法来创建文件。

在我的mac环境中，FileSystem的实现类是UnixFileSystem：

~~~java
public native boolean createFileExclusively(String path)
        throws IOException;
~~~

看到了吗？UnixFileSystem中的createFileExclusively是一个native方法，它会去调用底层的系统接口。

小师妹：哇，文件创建好了，我们就可以给文件赋权限了，但是windows和linux的权限是一样的吗？

这个问题问得好，java代码是跨平台的，我们的代码需要同时在windows和linux上的JVM执行，所以必须找到他们权限的共同点。

我们先看一下windows文件的权限：

![](https://img-blog.csdnimg.cn/20200514165046280.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

可以看到一个windows文件的权限可以有修改，读取和执行三种，特殊权限我们先不用考虑，因为我们需要找到windows和linux的共同点。

再看下linux文件的权限：

~~~java
 ls -al www.flydean.com 
-rw-r--r--  1 flydean  staff  15 May 14 15:43 www.flydean.com
~~~

上面我使用了一个ll命令列出了www.flydean.com这个文件的详细信息。 其中第一列就是文件的权限了。

linux的基本文件权限可以分为三部分，分别是owner，group，others，每部分和windows一样都有读，写和执行的权限，分别用rwx来表示。

三部分的权限连起来就成了rwxrwxrwx，对比上面我们的输出结果，我们可以看到www.flydean.com这个文件对owner自己是可读写的，对Group用户是只读的，对other用户也是只读的。

你要想把文件只对自己可读，那么可以执行下面的命令：

~~~java
chmod 600 www.flydean.com
~~~

小师妹立马激动起来：F师兄，这个我懂，6用二进制表示就是110，600用二进制表示就是110000000，刚刚好对应rw-------。

对于小师妹的领悟能力，我感到非常满意。

# 文件的创建

虽然我们已经不是孔乙己时代了，不需要知道茴字的四种写法，但是多一条知识多一条路，做些充足的准备还是非常有必要的。

小师妹，那你知道在java中有哪几种文件的创建方法呢？

小师妹小声道：F师兄，我只知道一种new File的方法。

我满意的抚摸着我的胡子，显示一下自己高人的气场。

之前我们讲过了，IO有三大类，一种是Reader/Writer，一种是InputStream/OutputStream,最后一种是ObjectReader/ObjectWriter。

除了使用第一种new File之外，我们还可以使用OutputStream来实现，当然我们还要用到之前讲到try with resource特性，让代码更加简洁。

先看第一种方式：

~~~java
public void createFileWithFile() throws IOException {
        File file = new File("file/src/main/resources/www.flydean.com");
        //Create the file
        if (file.createNewFile()){
            log.info("恭喜，文件创建成功");
        }else{
            log.info("不好意思，文件创建失败");
        }
        //Write Content
        try(FileWriter writer = new FileWriter(file)){
            writer.write("www.flydean.com");
        }
    }
~~~

再看第二种方式：

~~~java
public  void createFileWithStream() throws IOException
    {
        String data = "www.flydean.com";
        try(FileOutputStream out = new FileOutputStream("file/src/main/resources/www.flydean.com")){
            out.write(data.getBytes());
        }
    }
~~~

第二种方式看起来比第一种方式更加简介。

小师妹：慢着，F师兄，JDK7中NIO就已经出现了，能不能使用NIO来创建文件呢？

这个问题当然难不到我：

~~~java
public void createFileWithNIO()  throws IOException
    {
        String data = "www.flydean.com";
        Files.write(Paths.get("file/src/main/resources/www.flydean.com"), data.getBytes());

        List<String> lines = Arrays.asList("程序那些事", "www.flydean.com");
        Files.write(Paths.get("file/src/main/resources/www.flydean.com"),
                lines,
                StandardCharsets.UTF_8,
                StandardOpenOption.CREATE,
                StandardOpenOption.APPEND);
    }
~~~

NIO中提供了Files工具类来实现对文件的写操作，写的时候我们还可以带点参数，比如字符编码，是替换文件还是在append到文件后面等等。

# 代码中文件的权限

小师妹又有问题了：F师兄，讲了半天，还没有给我讲权限的事情啦。

别急，现在就讲权限：

~~~java
public void fileWithPromission() throws IOException {
        File file = File.createTempFile("file/src/main/resources/www.flydean.com","");
        log.info("{}",file.exists());

        file.setExecutable(true);
        file.setReadable(true,true);
        file.setWritable(true);
        log.info("{}",file.canExecute());
        log.info("{}",file.canRead());
        log.info("{}",file.canWrite());

        Path path = Files.createTempFile("file/src/main/resources/www.flydean.com", "");
        log.info("{}",Files.exists(path));
        log.info("{}",Files.isReadable(path));
        log.info("{}",Files.isWritable(path));
        log.info("{}",Files.isExecutable(path));
    }
~~~

上面我们讲过了，JVM为了通用，只能取windows和linux都有的功能，那就是说权限只有读写和执行权限，因为windows里面也可以区分本用户或者其他用户，所以是否是本用户的权限也保留了。

上面的例子我们使用了传统的File和NIO中的Files来更新文件的权限。

# 总结

好了，文件的权限就先讲到这里了。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！


