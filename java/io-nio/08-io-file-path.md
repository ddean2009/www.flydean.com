小师妹学JavaIO之:文件File和路径Path

## 简介

文件和路径有什么关系？文件和路径又隐藏了什么秘密？在文件系统的管理下，创建路径的方式又有哪些？今天F师兄带小师妹再给大家来一场精彩的表演。

## 文件和路径

小师妹：F师兄我有一个问题，java中的文件File是一个类可以理解，因为文件里面包含了很多其他的信息，但是路径Path为什么也要单独一个类出来？只用一个String表示不是更简单？

> 更多内容请访问[www.flydean.com](www.flydean.com)

万物皆有因，没有无缘无故的爱，也没有无缘无故的恨。一切真的是妙不可言啊。

我们来看下File和path的定义：

~~~java
public class File
   implements Serializable, Comparable<File>
~~~

~~~java
public interface Path
    extends Comparable<Path>, Iterable<Path>, Watchable
~~~

首先，File是一个类，它表示的是所有的文件系统都拥有的属性和功能，不管你是windows还是linux，他们中的File对象都应该是一样的。

File中包含了Path，小师妹你且看，Path是一个interface,为什么是一个interface呢？因为Path根据不同的情况可以分为JrtPath，UnixPath和ZipPath。三个Path所对应的FileSystem我们在上一篇文章中已经讨论过了。所以Path的实现是不同的，但是包含Path的File是相同的。

小师妹：F师兄，这个怎么这么拗口，给我来一个直白通俗的解释吧。

既然这样，且听我解释：爱国版的，或许我们属于不同的民族，但是我们都是中国人。通俗版的，大家都是文化人儿，为啥就你这么拽。文化版的，同九年，汝何秀？

再看两者的实现接口，File实现了Serializable表示可以被序列化，实现了Comparable，表示可以被排序。

Path继承Comparable，表示可以被排序。继承Iterable表示可以被遍历，可以被遍历是因为Path可以表示目录。继承Watchable，表示可以被注册到WatchService中，进行监控。

## 文件中的不同路径

小师妹：F师兄，File中有好几个关于Path的get方法，能讲一下他们的不同之处吗？

直接上代码：

~~~java
public void getFilePath() throws IOException {
        File file= new File("../../www.flydean.com.txt");
        log.info("name is : {}",file.getName());

        log.info("path is : {}",file.getPath());
        log.info("absolutePath is : {}",file.getAbsolutePath());
        log.info("canonicalPath is : {}",file.getCanonicalPath());
    }
~~~

File中有三个跟Path有关的方法，分别是getPath，getAbsolutePath和getCanonicalPath。

getPath返回的结果就是new File的时候传入的路径，输入什么返回什么。

getAbsolutePath返回的是绝对路径，就是在getPath前面加上了当前的路径。

getCanonicalPath返回的是精简后的AbsolutePath，就是去掉了.或者..之类的指代符号。

看下输出结果：

~~~java
 INFO com.flydean.FilePathUsage - name is : www.flydean.com.txt
 INFO com.flydean.FilePathUsage - path is : ../../www.flydean.com.txt
 INFO com.flydean.FilePathUsage - absolutePath is : /Users/flydean/learn-java-io-nio/file-path/../../www.flydean.com.txt
 INFO com.flydean.FilePathUsage - canonicalPath is : /Users/flydean/www.flydean.com.txt
~~~

## 构建不同的Path

小师妹：F师兄，我记得路径有相对路径，绝对路径等，是不是也有相应的创建Path的方法呢？

当然有的，先看下绝对路径的创建：

~~~java
public void getAbsolutePath(){
        Path absolutePath = Paths.get("/data/flydean/learn-java-io-nio/file-path", "src/resource","www.flydean.com.txt");
        log.info("absolutePath {}",absolutePath );
    }
~~~

我们可以使用Paths.get方法传入绝对路径的地址来构建绝对路径。

同样使用Paths.get方法，传入非绝对路径可以构建相对路径。

~~~java
public void getRelativePath(){
        Path RelativePath = Paths.get("src", "resource","www.flydean.com.txt");
        log.info("absolutePath {}",RelativePath.toAbsolutePath() );
    }
~~~

我们还可以从URI中构建Path：

~~~java
public void getPathfromURI(){
        URI uri = URI.create("file:///data/flydean/learn-java-io-nio/file-path/src/resource/www.flydean.com.txt");
        log.info("schema {}",uri.getScheme());
        log.info("default provider absolutePath {}",FileSystems.getDefault().provider().getPath(uri).toAbsolutePath().toString());
    }
~~~

也可以从FileSystem构建Path：

~~~java
public void getPathWithFileSystem(){
            Path path1 = FileSystems.getDefault().getPath(System.getProperty("user.home"), "flydean", "flydean.txt");
           log.info(path1.toAbsolutePath().toString());

            Path path2 = FileSystems.getDefault().getPath("/Users", "flydean", "flydean.txt");
            log.info(path2.toAbsolutePath().toString());

        }
~~~

## 总结

好多好多Path的创建方法，总有一款适合你。快来挑选吧。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！








