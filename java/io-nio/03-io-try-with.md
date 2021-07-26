小师妹学JavaIO之:try with和它的底层原理

# 简介

小师妹是个java初学者，最近正在学习使用java IO，作为大师兄的我自然要给她最给力的支持了。一起来看看她都遇到了什么问题和问题是怎么被解决的吧。

# IO关闭的问题

这一天，小师妹一脸郁闷的问我：F师兄，我学Java IO也有好多天了，最近写了一个例子，读取一个文件没有问题，但是读取很多个文件就会告诉我：”Can't open so many files“，能帮我看看是什么问题吗？

> 更多内容请访问[www.flydean.com](www.flydean.com)

小师妹的要求当然不能拒绝，我立马响应：可能打开文件太多了吧，教你两个命令，查看最大文件打开限制。

一个命令是 ulimit -a 

![](https://img-blog.csdnimg.cn/20200514112743237.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

第二个命令是

~~~java
ulimit -n
256
~~~

看起来是你的最大文件限制太小了，只有256个，调大一点就可以了。

小师妹却说：不对呀F师兄，我读文件都是一个一个读的，没有同时开这么多文件哟。

好吧，看下你写的代码吧：

~~~java
BufferedReader bufferedReader = null;
        try {
            String line;
            bufferedReader = new BufferedReader(new FileReader("trywith/src/main/resources/www.flydean.com"));
            while ((line = bufferedReader.readLine()) != null) {
                log.info(line);
            }
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        }
~~~

看完代码，问题找到了，小师妹，你的IO没有关闭，应该在使用之后，在finally里面把你的reader关闭。

下面这段代码就行了：

~~~java
BufferedReader bufferedReader = null;
        try {
            String line;
            bufferedReader = new BufferedReader(new FileReader("trywith/src/main/resources/www.flydean.com"));
            while ((line = bufferedReader.readLine()) != null) {
                log.info(line);
            }
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } finally {
            try {
                if (bufferedReader != null){
                 bufferedReader.close();
                }
            } catch (IOException ex) {
                log.error(ex.getMessage(), ex);
            }
        }
~~~

小师妹道了一声谢，默默的去改代码了。

# 使用try with resource

过了半个小时 ，小师妹又来找我了，F师兄，现在每段代码都要手动添加finally，实在是太麻烦了，很多时候我又怕忘记关闭IO了，导致程序出现无法预料的异常。你也知道我这人从来就怕麻烦，有没有什么简单的办法，可以解决这个问题呢？

那么小师妹你用的JDK版本是多少？

小师妹不好意思的说：虽然最新的JDK已经到14了，我还是用的JDK8.

JDK8就够了，其实从JDK7开始，Java引入了try with resource的新功能，你把使用过后要关闭的resource放到try里面，JVM会帮你自动close的，是不是很方便，来看下面这段代码：

~~~java
try (BufferedReader br = new BufferedReader(new FileReader("trywith/src/main/resources/www.flydean.com")))
        {
            String sCurrentLine;
            while ((sCurrentLine = br.readLine()) != null)
            {
                log.info(sCurrentLine);
            }
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        }
~~~

# try with resource的原理

太棒了，小师妹非常开心，然后又开始问我了：F师兄，什么是resource呀？为什么放到try里面就可以不用自己close了？

resource就是资源，可以打开个关闭，我们可以把实现了java.lang.AutoCloseable接口的类都叫做resource。

先看下AutoCloseable的定义：

~~~java
public interface AutoCloseable {
        void close() throws Exception;
}
~~~

AutoCloseable定义了一个close()方法，当我们在try with resource中打开了AutoCloseable的资源，那么当try block执行结束的时候，JVM会自动调用这个close（）方法来关闭资源。

我们看下上面的BufferedReader中close方法是怎么实现的：

~~~java
public void close() throws IOException {
    synchronized (lock) {
        if (in == null)
            return;
        in.close();
        in = null;
        cb = null;
    }
}
~~~

# 自定义resource

小师妹恍然大悟：F师兄，那么我们是不是可以实现AutoCloseable来创建自己的resource呢？

当然可以了，我们举个例子，比如给你解答完这个问题，我就要去吃饭了，我们定义这样一个resource类：

~~~java
public class CustResource implements AutoCloseable {

    public void helpSister(){
        log.info("帮助小师妹解决问题！");
    }

    @Override
    public void close() throws Exception {
        log.info("解决完问题，赶紧去吃饭！");
    }

    public static void main(String[] args) throws Exception {
       try( CustResource custResource= new CustResource()){
           custResource.helpSister();
       }
    }
}
~~~

运行输出结果：

~~~java
[main] INFO com.flydean.CustResource - 帮助小师妹解决问题！
[main] INFO com.flydean.CustResource - 解决完问题，赶紧去吃饭！
~~~

# 总结

最后，小师妹的问题解决了，我也可以按时吃饭了。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！







