---
slug: /io-file-reader
---

# 4. 小师妹学JavaIO之:文件读取那些事

## 简介

小师妹最新对java IO中的reader和stream产生了一点点困惑，不知道到底该用哪一个才对，怎么读取文件才是正确的姿势呢？今天F师兄现场为她解答。

## 字符和字节

小师妹最近很迷糊：F师兄，上次你讲到IO的读取分为两大类，分别是Reader，InputStream，这两大类有什么区别吗？为什么我看到有些类即是Reader又是Stream？比如：InputStreamReader?

小师妹，你知道哲学家的终极三问吗？你是谁？从哪里来？到哪里去？

F师兄，你是不是迷糊了，我在问你java，你扯什么哲学。

小师妹，其实吧，哲学是一切学问的基础，你知道科学原理的英文怎么翻译吗？the philosophy of science，科学的原理就是哲学。

你看计算机中代码的本质是什么？代码的本质就是0和1组成的一串长长的二进制数，这么多二进制数组合起来就成了计算机中的代码，也就是JVM可以识别可以运行的二进制代码。

> 更多内容请访问[www.flydean.com](www.flydean.com)

小师妹一脸崇拜：F师兄说的好像很有道理，但是这和Reader，InputStream有什么关系呢？

别急，冥冥中自有定数，先问你一个问题，java中存储的最小单位是什么？

小师妹：容我想想，java中最小的应该是boolean，true和false正好和二进制1，0对应。

对了一半，虽然boolean也是java中存储的最小单位，但是它需要占用一个字节Byte的空间。java中最小的存储单位其实是字节Byte。不信的话可以用之前我介绍的JOL工具来验证一下：

~~~java
[main] INFO com.flydean.JolUsage - java.lang.Boolean object internals:
 OFFSET  SIZE      TYPE DESCRIPTION                               VALUE
      0    12           (object header)                           N/A
     12     1   boolean Boolean.value                             N/A
     13     3           (loss due to the next object alignment)
Instance size: 16 bytes
Space losses: 0 bytes internal + 3 bytes external = 3 bytes total
~~~

上面是装箱过后的Boolean，可以看到虽然Boolean最后占用16bytes，但是里面的boolean只有1byte。

byte翻译成中文就是字节，字节是java中存储的基本单位。

有了字节，我们就可以解释字符了，字符就是由字节组成的，根据编码方式的不同，字符可以有1个，2个或者多个字节组成。我们人类可以肉眼识别的汉字呀，英文什么的都可以看做是字符。

而Reader就是按照一定编码格式读取的字符，而InputStream就是直接读取的更加底层的字节。

小师妹：我懂了，如果是文本文件我们就可以用Reader，非文本文件我们就可以用InputStream。

孺子可教，小师妹进步的很快。

## 按字符读取的方式

小师妹，接下来F师兄给你讲下按字符读取文件的几种方式，第一种就是使用FileReader来读取File，但是FileReader本身并没有提供任何读取数据的方法，想要真正的读取数据，我们还是要用到BufferedReader来连接FileReader，BufferedReader提供了读取的缓存，可以一次读取一行：

~~~java
public void withFileReader() throws IOException {
        File file = new File("src/main/resources/www.flydean.com");

        try (FileReader fr = new FileReader(file); BufferedReader br = new BufferedReader(fr)) {
            String line;
            while ((line = br.readLine()) != null) {
                if (line.contains("www.flydean.com")) {
                    log.info(line);
                }
            }
        }
    }
~~~

每次读取一行，可以把这些行连起来就组成了stream，通过Files.lines，我们获取到了一个stream，在stream中我们就可以使用lambda表达式来读取文件了，这是谓第二种方式：

~~~java
public void withStream() throws IOException {
        Path filePath = Paths.get("src/main/resources", "www.flydean.com");
        try (Stream<String> lines = Files.lines(filePath))
        {
            List<String> filteredLines = lines.filter(s -> s.contains("www.flydean.com"))
                    .collect(Collectors.toList());
            filteredLines.forEach(log::info);
        }
    }
~~~

第三种其实并不常用，但是师兄也想教给你。这一种方式就是用工具类中的Scanner。通过Scanner可以通过换行符来分割文件，用起来也不错：

~~~java
public void withScanner() throws FileNotFoundException {
        FileInputStream fin = new FileInputStream(new File("src/main/resources/www.flydean.com"));
        Scanner scanner = new Scanner(fin,"UTF-8").useDelimiter("\n");
        String theString = scanner.hasNext() ? scanner.next() : "";
        log.info(theString);
        scanner.close();
    }
~~~

## 按字节读取的方式

小师妹听得很满足，连忙催促我：F师兄，字符读取方式我都懂了，快将字节读取吧。

我点了点头，小师妹，哲学的本质还记得吗？字节就是java存储的本质。掌握到本质才能勘破一切虚伪。

还记得之前讲过的Files工具类吗？这个工具类提供了很多文件操作相关的方法，其中就有读取所有bytes的方法，小师妹要注意了，这里是一次性读取所有的字节！一定要慎用，只可用于文件较少的场景，切记切记。

~~~java
public void readBytes() throws IOException {
        Path path = Paths.get("src/main/resources/www.flydean.com");
        byte[] data = Files.readAllBytes(path);
        log.info("{}",data);
    }
~~~

如果是比较大的文件，那么可以使用FileInputStream来一次读取一定数量的bytes：

~~~java
public void readWithStream() throws IOException {
        File file = new File("src/main/resources/www.flydean.com");
        byte[] bFile = new byte[(int) file.length()];
        try(FileInputStream fileInputStream  = new FileInputStream(file))
        {
            fileInputStream.read(bFile);
            for (int i = 0; i < bFile.length; i++) {
                log.info("{}",bFile[i]);
            }
        }
    }
~~~

Stream读取都是一个字节一个字节来读的，这样做会比较慢，我们使用NIO中的FileChannel和ByteBuffer来加快一些读取速度：

~~~java
public void readWithBlock() throws IOException {
        try (RandomAccessFile aFile = new RandomAccessFile("src/main/resources/www.flydean.com", "r");
             FileChannel inChannel = aFile.getChannel();) {
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            while (inChannel.read(buffer) > 0) {
                buffer.flip();
                for (int i = 0; i < buffer.limit(); i++) {
                    log.info("{}", buffer.get());
                }
                buffer.clear();
            }
        }
    }
~~~

小师妹：如果是非常非常大的文件的读取，有没有更快的方法呢？

当然有，记得上次我们讲过的虚拟地址空间的映射吧：

![](https://img-blog.csdnimg.cn/20200513225239404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

我们可以直接将用户的地址空间和系统的地址空间同时map到同一个虚拟地址内存中，这样就免除了拷贝带来的性能开销：

~~~java
public void copyWithMap() throws IOException{
        try (RandomAccessFile aFile = new RandomAccessFile("src/main/resources/www.flydean.com", "r");
             FileChannel inChannel = aFile.getChannel()) {
             MappedByteBuffer buffer = inChannel.map(FileChannel.MapMode.READ_ONLY, 0, inChannel.size());
             buffer.load();
            for (int i = 0; i < buffer.limit(); i++)
            {
                log.info("{}", buffer.get());
            }
            buffer.clear();
        }
    }
~~~

## 寻找出错的行数

小师妹：好赞！F师兄你讲得真好，小师妹我还有一个问题：最近在做文件解析，有些文件格式不规范，解析到一半就解析失败了，但是也没有个错误提示到底错在哪一行，很难定位问题呀，有没有什么好的解决办法？

看看天色已经不早了，师兄就再教你一个方法，java中有一个类叫做LineNumberReader，使用它来读取文件可以打印出行号，是不是就满足了你的需求：

~~~java
public void useLineNumberReader() throws IOException {
        try(LineNumberReader lineNumberReader = new LineNumberReader(new FileReader("src/main/resources/www.flydean.com")))
        {
            //输出初始行数
            log.info("Line {}" , lineNumberReader.getLineNumber());
            //重置行数
            lineNumberReader.setLineNumber(2);
            //获取现有行数
            log.info("Line {} ", lineNumberReader.getLineNumber());
            //读取所有文件内容
            String line = null;
            while ((line = lineNumberReader.readLine()) != null)
            {
                log.info("Line {} is : {}" , lineNumberReader.getLineNumber() , line);
            }
        }
    }
~~~

## 总结

今天给小师妹讲解了字符流和字节流，还讲解了文件读取的基本方法，不虚此行。


本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！








