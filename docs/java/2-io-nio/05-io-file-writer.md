---
slug: /io-file-writer
---

# 5. 小师妹学JavaIO之:文件写入那些事

## 简介

小师妹又对F师兄提了一大堆奇奇怪怪的需求，要格式化输出，要特定的编码输出，要自己定位输出，什么？还要阅后即焚？大家看F师兄怎么一一接招吧。

## 字符输出和字节输出

小师妹：F师兄，上次你的IO讲到了一半，文件读取是基本上讲完了，但是文件的写入还没有讲，什么时候给小师妹我再科普科普？

小师妹：F师兄，你知道我这个人一直以来都是勤奋好学的典范，是老师们眼中的好学生,同学们心中的好榜样,父母身边乖巧的好孩子。在我永攀科学高峰的时候，居然发现还有一半的知识没有获取，真是让我扼腕叹息，F师兄，快快把知识传给我吧。

小师妹你的请求，师兄我自当尽力办到，但是我怎么记得上次讲IO文件读取已经过了好几天了，怎么今天你才来找我。

小师妹红着脸：F师兄，这不是使用的时候遇到了点问题，才想找你把知识再复习一遍。

那先把输出类的结构再过一遍：

![](https://img-blog.csdnimg.cn/20200514141454739.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

![](https://img-blog.csdnimg.cn/20200514141925893.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上面就是输出的两大系统了：Writer和OutputStream。

Writer主要针对于字符，而Stream主要针对Bytes。

Writer中最最常用的就是FileWriter和BufferedWriter,我们看下一个最基本写入的例子：

~~~java
public void useBufferedWriter() throws IOException {
        String content = "www.flydean.com";
        File file = new File("src/main/resources/www.flydean.com");

        FileWriter fw = new FileWriter(file);
        try(BufferedWriter bw = new BufferedWriter(fw)){
            bw.write(content);
        }
    }
~~~

BufferedWriter是对FileWriter的封装，它提供了一定的buffer机制，可以提高写入的效率。

其实BufferedWriter提供了三种写入的方式：

~~~java
public void write(int c)
public void write(char cbuf[], int off, int len)
public void write(String s, int off, int len)
~~~

第一个方法传入一个int，第二个方法传入字符数组和开始读取的位置和长度，第三个方法传入字符串和开始读取的位置和长度。是不是很简单，完全可以理解？

小师妹：不对呀，F师兄，后面两个方法的参数，不管是char和String都是字符我可以理解，第一个方法传入int是什么鬼？

小师妹，之前跟你讲的道理是不是都忘记的差不多了，int的底层存储是bytes,char和String的底层存储也是bytes，我们把int和char做个强制转换就行了。我们看下是怎么转换的：

~~~java
public void write(int c) throws IOException {
        synchronized (lock) {
            ensureOpen();
            if (nextChar >= nChars)
                flushBuffer();
            cb[nextChar++] = (char) c;
        }
    }
~~~

还记得int需要占用多少个字节吗？4个，char需要占用2个字节。这样强制从int转换到char会有精度丢失的问题，只会保留低位的2个字节的数据，高位的两个字节的数据会被丢弃，这个需要在使用中注意。

看完Writer，我们再来看看Stream：

~~~java
public void useFileOutputStream() throws IOException {
        String str = "www.flydean.com";
        try(FileOutputStream outputStream = new FileOutputStream("src/main/resources/www.flydean.com");
            BufferedOutputStream bufferedOutputStream= new BufferedOutputStream(outputStream)){
            byte[] strToBytes = str.getBytes();
            bufferedOutputStream.write(strToBytes);
        }
    }
~~~

跟Writer一样，BufferedOutputStream也是对FileOutputStream的封装，我们看下BufferedOutputStream中提供的write方法：

~~~java
public synchronized void write(int b)
public synchronized void write(byte b[], int off, int len)
~~~

比较一下和Writer的区别，BufferedOutputStream的方法是synchronized的，并且BufferedOutputStream是直接对byte进行操作的。

第一个write方法传入int参数也是需要进行截取的，不过这次是从int转换成byte。

## 格式化输出

小师妹：F师兄，我们经常用的System.out.println可以直接向标准输出中输出格式化过后的字符串，文件的写入是不是也有类似的功能呢？

肯定有，PrintWriter就是做格式化输出用的：

~~~java
public void usePrintWriter() throws IOException {
        FileWriter fileWriter = new FileWriter("src/main/resources/www.flydean.com");
        try(PrintWriter printWriter = new PrintWriter(fileWriter)){
            printWriter.print("www.flydean.com");
            printWriter.printf("程序那些事 %s ", "非常棒");
        }
    }
~~~

## 输出其他对象 

小师妹：F师兄，我们看到可以输出String，char还有Byte，那可不可以输出Integer,Long等基础类型呢？

可以的，使用DataOutputStream就可以做到：

~~~java
public void useDataOutPutStream()
            throws IOException {
        String value = "www.flydean.com";
        try(FileOutputStream fos = new FileOutputStream("src/main/resources/www.flydean.com")){
            DataOutputStream outStream = new DataOutputStream(new BufferedOutputStream(fos));
            outStream.writeUTF(value);
        }
    }
~~~

DataOutputStream提供了writeLong,writeDouble,writeFloat等等方法，还可以writeUTF！

## 在特定的位置写入

小师妹：F师兄，有时候我们不需要每次都从头开始写入到文件，能不能自定义在什么位置写入呢？

使用RandomAccessFile就可以了：

~~~java
public void useRandomAccess() throws IOException {
        try(RandomAccessFile writer = new RandomAccessFile("src/main/resources/www.flydean.com", "rw")){
            writer.seek(100);
            writer.writeInt(50);
        }
    }
~~~

RandomAccessFile可以通过seek来定位，然后通过write方法从指定的位置写入。

## 给文件加锁

小师妹：F师兄，最后还有一个问题，怎么保证我在进行文件写的时候别人不会覆盖我写的内容，不会产生冲突呢？

FileChannel可以调用tryLock方法来获得一个FileLock锁，通过这个锁，我们可以控制文件的访问。

~~~java
public void useFileLock()
            throws IOException {
        try(RandomAccessFile stream = new RandomAccessFile("src/main/resources/www.flydean.com", "rw");
        FileChannel channel = stream.getChannel()){
            FileLock lock = null;
            try {
                lock = channel.tryLock();
            } catch (final OverlappingFileLockException e) {
                stream.close();
                channel.close();
            }
            stream.writeChars("www.flydean.com");
            lock.release();
        }
    }
~~~

## 总结

今天给小师妹将了好多种文件的写的方法，够她学习一阵子了。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！








