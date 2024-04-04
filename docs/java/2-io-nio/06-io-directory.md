---
slug: /io-directory
---

# 6. 小师妹学JavaIO之:目录还是文件

## 简介

目录和文件傻傻分不清楚，目录和文件的本质到底是什么？在java中怎么操纵目录，怎么遍历目录。本文F师兄会为大家一一讲述。

## linux中的文件和目录

小师妹：F师兄，我最近有一个疑惑，java代码中好像只有文件没有目录呀，是不是当初发明java的大神，一步小心走了神？

F师兄:小师妹真勇气可嘉呀，敢于质疑权威是从小工到专家的最重要的一步。想想F师兄我，从小没人提点，老师讲什么我就信什么，专家说什么我就听什么:股市必上一万点，房子是给人住的不是给人炒的,原油宝当然是小白理财必备产品....然后，就没有然后了。

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

虽然java中没有目录的概念只有File文件，而File其实是可以表示目录的：

~~~java
public boolean isDirectory()
~~~

File中有个isDirectory方法，可以判断该File是否是目录。

File和目录傻傻分不清楚，小师妹，有没有联想到点什么？

小师妹：F师兄，我记得你上次讲到Linux下面所有的资源都可以看做是文件，在linux下面文件和目录的本质是不是一样的？

对的，在linux下面文件是一等公民，所有的资源都是以文件的形式来区分的。

什么扇区，逻辑块，页之类的底层结构我们就不讲了。我们先考虑一下一个文件到底应该包含哪些内容。除了文件本身的数据之外，还有很多元数据的东西，比如文件权限，所有者，group，创建时间等信息。

在linux系统中，这两个部分是分开存储的。存放数据本身的叫做block，存放元数据的叫做inode。

inode中存储了block的地址，可以通过inode找到文件实际数据存储的block地址，从而进行文件访问。考虑一下大文件可能占用很多个block，所以一个inode中可以存储多个block的地址，而一个文件通常来说使用一个inode就够了。

![](https://img-blog.csdnimg.cn/20200517214103157.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

为了显示层级关系和方便文件的管理，目录的数据文件中存放的是该目录下的文件和文件的inode地址，从而形成了一种一环套一环，圆环套圆环的链式关系。

![](https://img-blog.csdnimg.cn/20200517215635842.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图列出了一个通过目录查找其下文件的环中环布局。

我想java中目录没有单独列出来一个类的原因可能是参考了linux底层的文件布局吧。

## 目录的基本操作

因为在java中目录和文件是公用File这个类的，所以File的基本操作目录它全都会。

基本上，目录和文件相比要多注意下面三类方法：

~~~java
public boolean isDirectory()
public File[] listFiles() 
public boolean mkdir() 
~~~

为什么说是三类呢？因为还有几个和他们比较接近的方法，这里就不一一列举了。

isDirectory判断该文件是不是目录。listFiles列出该目录下面的所有文件。mkdir创建一个文件目录。

小师妹:F师兄，之前我们还以目录的遍历要耗费比较长的时间，经过你一讲解目录的数据结构，感觉listFiles并不是一个耗时操作呀，所有的数据都已经准备好了，直接读取出来就行。

对，看问题不要看表面，要看到隐藏在表面的本质内涵。你看师兄我平时不显山露水，其实是真正的中流砥柱，堪称公司优秀员工模范。

小师妹:F师兄，那平时也没看上头表彰你啥的？哦，我懂了，一定是老板怕表彰了你引起别人的嫉妒，会让你的好好大师兄的形象崩塌吧，看来老板真的懂你呀。

## 目录的进阶操作

好了小师妹，你懂了就行，下面F师兄给你讲一下目录的进阶操作，比如我们怎么拷贝一个目录呀？

小师妹，拷贝目录简单的F师兄，上次你就教我了：

~~~java
cp -rf
~~~

一个命令的事情不就解决了吗？难道里面还隐藏了点秘密？ 

咳咳咳，秘密倒是没有，小师妹，我记得你上次说要对java从一而终的，今天师兄给你介绍一个在java中拷贝文件目录的方法。

其实Files工具类里已经为我们提供了一个拷贝文件的优秀方法：

~~~java
public static Path copy(Path source, Path target, CopyOption... options)
~~~

使用这个方法，我们就可以进行文件的拷贝了。

如果想要拷贝目录，就遍历目录中的文件，循环调用这个copy方法就够了。

小师妹：且慢，F师兄，如果目录下面还有目录的，目录下还套目录的情况该怎么处理？

这就是圈套呀，看我用个递归的方法解决它：

~~~java
public void useCopyFolder() throws IOException {
        File sourceFolder = new File("src/main/resources/flydean-source");
        File destinationFolder = new File("src/main/resources/flydean-dest");
        copyFolder(sourceFolder, destinationFolder);
    }

    private static void copyFolder(File sourceFolder, File destinationFolder) throws IOException
    {
        //如果是dir则递归遍历创建dir，如果是文件则直接拷贝
        if (sourceFolder.isDirectory())
        {
            //查看目标dir是否存在
            if (!destinationFolder.exists())
            {
                destinationFolder.mkdir();
                log.info("目标dir已经创建: {}",destinationFolder);
            }
            for (String file : sourceFolder.list())
            {
                File srcFile = new File(sourceFolder, file);
                File destFile = new File(destinationFolder, file);
                copyFolder(srcFile, destFile);
            }
        }
        else
        {
            //使用Files.copy来拷贝具体的文件
            Files.copy(sourceFolder.toPath(), destinationFolder.toPath(), StandardCopyOption.REPLACE_EXISTING);
            log.info("拷贝目标文件: {}",destinationFolder);
        }
    }
~~~

基本思想就是遇到目录我就遍历，遇到文件我就拷贝。

## 目录的腰疼操作

小师妹：F师兄，假如我想删除一个目录中的文件，或者我们想统计一下这个目录下面到底有多少个文件该怎么做呢？

虽然这些操作有点腰疼，还是可以解决的，Files工具类中有个方法叫做walk，返回一个Stream对象，我们可以使用Stream的API来对文件进行处理。

删除文件：

~~~java
public void useFileWalkToDelete() throws IOException {
        Path dir = Paths.get("src/main/resources/flydean");
        Files.walk(dir)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
    }
~~~

统计文件：

~~~java
 public void useFileWalkToSumSize() throws IOException {

        Path folder = Paths.get("src/test/resources");
        long size = Files.walk(folder)
                .filter(p -> p.toFile().isFile())
                .mapToLong(p -> p.toFile().length())
                .sum();
        log.info("dir size is: {}",size);
    }
~~~

## 总结

本文介绍了目录的一些非常常见和有用的操作。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！









