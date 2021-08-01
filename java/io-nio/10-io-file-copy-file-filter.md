小师妹学JavaIO之:File copy和File filter

## 简介

一个linux命令的事情，小师妹非要让我教她怎么用java来实现，哎，摊上个这么杠精的小师妹，我也是深感无力，做一个师兄真的好难。

## 使用java拷贝文件

今天小师妹找到我了：F师兄，能告诉怎么拷贝文件吗？

拷贝文件？不是很简单的事情吗？如果你有了文件的读权限，只需要这样就可以了。

~~~java
cp www.flydean.com www.flydean.com.back
~~~

当然，如果是目录的话还可以加两个参数遍历和强制拷贝：

~~~java
cp -rf srcDir distDir
~~~

这么简单的linux命令，不要告诉我你不会。

小师妹笑了：F师兄，我不要用linux命令，我就想用java来实现，我不正在学java吗？学一门当然要找准机会来练习啦，快快教教我吧。

既然这样，那我就开讲了。java中文件的拷贝其实也有三种方法，可以使用传统的文件读写的方法，也可以使用最新的NIO中提供的拷贝方法。

使用传统方法当然没有NIO快，也没有NIO简洁，我们先来看看怎么使用传统的文件读写的方法来拷贝文件：

~~~java
    public  void copyWithFileStreams() throws IOException
    {
        File fileToCopy = new File("src/main/resources/www.flydean.com");
        File newFile = new File("src/main/resources/www.flydean.com.back");
        newFile.createNewFile();
        try(FileOutputStream output = new FileOutputStream(newFile);FileInputStream input = new FileInputStream(fileToCopy)){
            byte[] buf = new byte[1024];
            int bytesRead;
            while ((bytesRead = input.read(buf)) > 0)
            {
                output.write(buf, 0, bytesRead);
            }
        }
    }
~~~

上面的例子中，我们首先定义了两个文件，然后从两个文件中生成了OutputStream和InputStream，最后以字节流的形式从input中读出数据到outputStream中，最终完成了文件的拷贝。

传统的File IO拷贝比较繁琐，速度也比较慢。我们接下来看看怎么使用NIO来完成这个过程：

~~~java
public  void copyWithNIOChannel() throws IOException
    {
        File fileToCopy = new File("src/main/resources/www.flydean.com");
        File newFile = new File("src/main/resources/www.flydean.com.back");

        try(FileInputStream inputStream = new FileInputStream(fileToCopy);FileOutputStream outputStream = new FileOutputStream(newFile)){
            FileChannel inChannel = inputStream.getChannel();
            FileChannel outChannel = outputStream.getChannel();
            inChannel.transferTo(0, fileToCopy.length(), outChannel);
        }
    }
~~~

之前我们讲到NIO中一个非常重要的概念就是channel,通过构建源文件和目标文件的channel通道，可以直接在channel层面进行拷贝，如上面的例子所示，我们调用了inChannel.transferTo完成了拷贝。

最后，还有一个更简单的NIO文件拷贝的方法：

~~~java
public  void copyWithNIOFiles() throws IOException
    {
        Path source = Paths.get("src/main/resources/www.flydean.com");
        Path destination = Paths.get("src/main/resources/www.flydean.com.back");
        Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
    }
~~~

直接使用工具类Files提供的copy方法即可。

## 使用File filter

太棒了，小师妹一脸崇拜：F师兄，我还有一个需求，就是想删除某个目录里面的以.log结尾的日志文件，这个需求是不是很常见？F师兄一般是怎么操作的？

一般这种操作我都是一个linux命令就搞定了，如果搞不定那就用两个：

~~~java
rm -rf *.log
~~~

当然，如果需要，我们也是可以用java来实现的。

java中提供了两个Filter都可以用来实现这个功能。

这两个Filter是java.io.FilenameFilter和java.io.FileFilter:

~~~java
@FunctionalInterface
public interface FilenameFilter {
    boolean accept(File dir, String name);
}
~~~

~~~java
@FunctionalInterface
public interface FileFilter {
    boolean accept(File pathname);
}
~~~

这两个接口都是函数式接口，所以他们的实现可以直接用lambda表达式来代替。

两者的区别在于，FilenameFilter进行过滤的是文件名和文件所在的目录。而FileFilter进行过滤的直接就是目标文件。

在java中是没有目录的概念的，一个目录也是用File的表示的。

上面的两个使用起来非常类似，我们就以FilenameFilter为例，看下怎么删除.log文件：

~~~java
public void useFileNameFilter()
    {
        String targetDirectory = "src/main/resources/";
        File directory = new File(targetDirectory);

        //Filter out all log files
        String[] logFiles = directory.list( (dir, fileName)-> fileName.endsWith(".log"));

        //If no log file found; no need to go further
        if (logFiles.length == 0)
            return;

        //This code will delete all log files one by one
        for (String logfile : logFiles)
        {
            String tempLogFile = targetDirectory + File.separator + logfile;
            File fileDelete = new File(tempLogFile);
            boolean isdeleted = fileDelete.delete();
            log.info("file : {} is deleted : {} ", tempLogFile , isdeleted);
        }
    }
~~~

上面的例子中，我们通过directory.list方法，传入lambda表达式创建的Filter，实现了过滤的效果。

最后，我们将过滤之后的文件删除。实现了目标。

## 总结

小师妹的两个问题解决了，希望今天可以不要再见到她。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！


