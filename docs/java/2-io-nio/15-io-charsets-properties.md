---
slug: /io-charsets-properties
---

# 15. 小师妹学JavaIO之:文件编码和字符集Unicode

## 简介

小师妹一时兴起，使用了一项从来都没用过的新技能，没想却出现了一个无法解决的问题。把大象装进冰箱到底有几步？乱码的问题又是怎么解决的？快来跟F师兄一起看看吧。

## 使用Properties读取文件

这天，小师妹心情很愉悦，吹着口哨唱着歌，标准的45度俯视让人好不自在。

小师妹呀，什么事情这么高兴，说出来让师兄也沾点喜庆？

小师妹：F师兄，最新我发现了一种新型的读取文件的方法，很好用的，就跟map一样：

~~~java
public void usePropertiesFile() throws IOException {
        Properties configProp = new Properties();
        InputStream in = this.getClass().getClassLoader().getResourceAsStream("www.flydean.com.properties");
        configProp.load(in);
        log.info(configProp.getProperty("name"));
        configProp.setProperty("name", "www.flydean.com");
        log.info(configProp.getProperty("name"));
    }
~~~

F师兄你看，我使用了Properties来读取文件，文件里面的内容是key=value形式的，在做配置文件使用的时候非常恰当。我是从Spring项目中的properties配置文件中得到的灵感，才发现原来java还有一个专门读取属性文件的类Properties。

小师妹现在都会抢答了，果然青出于蓝。

## 乱码初现

小师妹你做得非常好，就这样触类旁通，很快java就要尽归你手了，后面的什么scala，go，JS等估计也统统不在话下。再过几年你就可以升任架构师，公司技术在你的带领之下一定会蒸蒸日上。

做为师兄，最大的责任就是给小师妹以鼓励和信心，给她描绘美好的未来，什么出任CEO，赢取高富帅等全都不在话下。听说有个专业的词汇来描述这个过程叫做：画饼。

小师妹有点心虚：可是F师兄，我还有点小小的问题没有解决，有点中文的小小乱码....

我深有体会的点点头：马赛克是阻碍人类进步的绊脚石...哦，不是马赛克，是文件乱码，要想弄清楚这个问题，还要从那个字符集和文件编码讲起。

## 字符集和文件编码

在很久很久以前，师兄我都还没有出生的时候，西方世界出现了一种叫做计算机的高科技产品。

初代计算机只能做些简单的算数运算，还要使用人工打孔的程序才能运行，不过随着时间的推移，计算机的体积越来越小，计算能力越来越强，打孔已经不存在了，变成了人工编写的计算机语言。

一切都在变化，唯有一件事情没有变化。这件事件就是计算机和编程语言只流传在西方。而西方日常交流使用26个字母加有限的标点符号就够了。

最初的计算机存储可以是非常昂贵的，我们用一个字节也就是8bit来存储所有能够用到的字符，除了最开始的1bit不用以外，总共有128中选择，装26个小写+26个大写字母和其他的一些标点符号之类的完全够用了。

这就是最初的ASCII编码，也叫做美国信息交换标准代码（American Standard Code for Information Interchange）。

后面计算机传到了全球，人们才发现好像之前的ASCII编码不够用了，比如中文中常用的汉字就有4千多个，怎么办呢?

没关系，将ASCII编码本地化，叫做ANSI编码。1个字节不够用就用2个字节嘛，路是人走出来的，编码也是为人来服务的。于是产生了各种如GB2312, BIG5, JIS等各自的编码标准。这些编码虽然与ASCII编码兼容，但是相互之间却并不兼容。

这严重的影响了国际化的进程，这样还怎么去实现同一个地球，同一片家园的梦想？

于是国际组织出手了，制定了UNICODE字符集，为所有语言的所有字符都定义了一个唯一的编码，unicode的字符集是从U+0000到U+10FFFF这么多个编码。

小师妹：F师兄，那么unicode和我平时听说的UTF-8，UTF-16，UTF-32有什么关系呢？

我笑着问小师妹：小师妹，把大象装进冰箱有几步？

小师妹：F师兄，脑筋急转弯的故事，已经不适合我了，大象装进冰箱有三步，第一打开冰箱，第二把大象装进去，第三关上冰箱，完事了。

小师妹呀，作为一个有文化的中国人，要真正的承担起民族复兴，科技进步的大任，你的想法是很错误的，不能光想口号，要有实际的可操作性的方案才行，要不然我们什么时候才能够打造秦芯，唐芯和明芯呢？

师兄说的对，可是这跟unicode有什么关系呢？

unicode字符集最后是要存储到文件或者内存里面的，那怎么存呢？使用固定的1个字节，2个字节还是用变长的字节呢？根据编码方式的不同，可以分为UTF-8，UTF-16，UTF-32等多种编码方式。

其中UTF-8是一种变长的编码方案，它使用1-4个字节来存储。UTF-16使用2个或者4个字节来存储，JDK9之后的String的底层编码方式变成了两种：LATIN1和UTF16。

而UTF-32是使用4个字节来存储。这三种编码方式中，只有UTF-8是兼容ASCII的，这也是为什么国际上UTF-8编码方式比较通用的原因（毕竟计算机技术都是西方人搞出来的）。

## 解决Properties中的乱码

小师妹，要解决你Properties中的乱码问题很简单，Reader基本上都有一个Charsets的参数，通过这个参数可以传入要读取的编码方式，我们把UTF-8传进去就行了：

~~~java
public void usePropertiesWithUTF8() throws IOException{
        Properties configProp = new Properties();
        InputStream in = this.getClass().getClassLoader().getResourceAsStream("www.flydean.com.properties");
        InputStreamReader inputStreamReader= new InputStreamReader(in, StandardCharsets.UTF_8);
        configProp.load(inputStreamReader);
        log.info(configProp.getProperty("name"));
        configProp.setProperty("name", "www.flydean.com");
        log.info(configProp.getProperty("name"));
    }
~~~

上面的代码中，我们使用InputStreamReader封装了InputStream，最终解决了中文乱码的问题。

## 真.终极解决办法

小师妹又有问题了：F师兄，这样做是因为我们知道文件的编码方式是UTF-8，如果不知道该怎么办呢？是选UTF-8，UTF-16还是UTF-32呢？

小师妹问的问题越来越刁钻了，还好这个问题我也有准备。

接下来介绍我们的终极解决办法，我们将各种编码的字符最后都转换成unicode字符集存到properties文件中，再读取的时候是不是就没有编码的问题了？

转换需要用到JDK自带的工具：

~~~java
 native2ascii -encoding utf-8 file/src/main/resources/www.flydean.com.properties.utf8 file/src/main/resources/www.flydean.com.properties.cn
~~~

上面的命令将utf-8的编码转成了unicode。

转换前：

~~~java
site=www.flydean.com
name=程序那些事
~~~

转换后：

~~~java
site=www.flydean.com
name=\u7a0b\u5e8f\u90a3\u4e9b\u4e8b
~~~

再运行下测试代码：

~~~java
public void usePropertiesFileWithTransfer() throws IOException {
        Properties configProp = new Properties();
        InputStream in = this.getClass().getClassLoader().getResourceAsStream("www.flydean.com.properties.cn");
        configProp.load(in);
        log.info(configProp.getProperty("name"));
        configProp.setProperty("name", "www.flydean.com");
        log.info(configProp.getProperty("name"));
    }
~~~

输出正确的结果。

如果要做国际化支持，也是这样做的。

## 总结

千辛万苦终于解决了小师妹的问题，F师兄要休息一下。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！













