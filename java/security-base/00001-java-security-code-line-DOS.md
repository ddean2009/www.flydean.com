java安全编码指南之:拒绝Denial of Service

# 简介

DOS不是那个windows的前身，而是Denial of Service，有做过系统安全方面的小伙伴可能对这个再熟悉不过了，简单点讲，DOS就是服务型响应不过来，从而拒绝了正常的服务请求。

今天本文不是要讲怎么发起一个DOS攻击，而是讲一下怎么在java的代码层面尽量减少DOS的可能性。

# 为什么会有DOS

为什么会有DOS呢？排除恶意攻击的情况下，DOS的原因就是资源的使用不当。一般意义上我们所说的资源有CPU周期，内存，磁盘空间，和文件描述符等。

如果这些资源受到了恶意使用，那么很有可能会影响正常的系统服务响应，从而产生DOS。

怎么在编码层面上，解决DOS问题呢？

# 不合理的资源使用

如果系统有不合理的资源使用的话，就会造成资源紧缺，从而会产生问题。我们这里举一些不合理使用资源的例子。

## 请求用于矢量图的SVG文件和字体文件

SVG (全称是 Scalable Vector Graphics) 是一个跟分辨率无关的图形格式。因为SVG是基于XML的，并且保存着大量的复杂路径信息，所以它的体积一般比较大。我们在使用的时候要考虑。

同时如果使用大量的字体文件也会加重系统的资源负担。

## 字符串或二进制表示的图片转换

图片是一个文件，文件就可以使用二进制来表示，同样的如果我们把二进制进行base64编码就得到了图片的字符串表示。

如果使用过webpack进行前端项目构建的同学应该知道，对于项目中的小图像，一般是将其编码成为字符串直接嵌套在html中的。但是对于大图片，还是保存的原来的格式。

如果我们在后台对字符串或者二进制表示的图片进行转换的时候，可能会需要几倍于原image大小的内存。

看一个imageToBase64的例子：

~~~java

   public String imageToBase64() {
        File f = new File("/tmp/abc.jpg");
        try {
            BufferedImage bi = ImageIO.read(f);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(bi, "jpg", baos);
            byte[] bytes = baos.toByteArray();

            return encoder.encodeBuffer(bytes).trim();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
~~~

## zip炸弹

为了提升数据传输的效率，很多时候我们都会使用压缩算法，比如在HTTP中。但是一个压缩过的很小的zip文件，解压之后可能会变得非常非常大。

这里给大家介绍一个非常有名的zip炸弹。

42.zip 是很有名的zip炸弹。它的大小只有42KB，但是解压之后居然有4.5PB之多。

怎么做的呢？

一个zip文件中又包含了16个zip文件，每一个zip文件又包含了16个zip文件，这样循环5次，产生了16的5次方个文件，每个文件的大小是4.3GB，最后导致你的硬盘爆炸了。

感兴趣的朋友可以从http://www.unforgettable.dk/42.zip 下载，自己尝试一下。

怎么避免zip炸弹呢？

第一种做法在解压过程中检测解压过后的文件大小，如果超出一定的限制就结束解压。

另一种做法，就是判断压缩文件中是否还有压缩文件，尽量减少这种压缩套压缩的做法。

## billion laughs attack

billion laughs attack是解析XML文件产生的DOS攻击。

先上代码：

~~~xml
<?xml version="1.0"?>
<!DOCTYPE lolz [
 <!ENTITY lol "lol">
 <!ELEMENT lolz (#PCDATA)>
 <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
 <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
 <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
 <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
 <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
 <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
 <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
 <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
 <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<lolz>&lol9;</lolz>
~~~

上面的代码定义了10个entities，每个entity又包含了10个前面定义的entity，从而实现了指数级的字符串增长。最后生成了包含10亿个字符串的xml文件。

一般情况下，我们会将xml放在内存中保存，这么多的字符串最后会耗尽我们的内存，最终导致DOS。

我们可以通过设置 XMLConstants.FEATURE_SECURE_PROCESSING  来防止这种攻击。

## hashMap中插入太多相同hashcode的元素

我们知道java中hashMap是用分离链表来处理hash冲突的，如果插入了太多相同hashcode的元素，就会导致这个hashcode对应的链表变得很长，从而查询效率降低，影响程序性能。

## 正则表达式悲观回溯

什么是悲观回溯呢？

我们举个例子，假如大家对正则表达式已经很熟悉了。

假如我们使用/^(x*)y$/ 来和字符串xxxxxxy来进行匹配。

匹配之后第一个分组（也就是括号里面的匹配值）是xxxxxx。

如果我们把正则表达式改写为 /^(x*)xy$/ 再来和字符串xxxxxxy来进行匹配。 匹配的结果就是xxxxx。

这个过程是怎么样的呢？

首先(x*)会尽可能的匹配更多的x，知道遇到字符y。 这时候(x*)已经匹配了6个x。

接着正则表达式继续执行(x*)之后的xy，发现不能匹配，这时候(x*)需要从已经匹配的6个x中，吐出一个x，然后重新执行正则表达式中的xy，发现能够匹配，正则表达式结束。

这个过程就是一个回溯的过程。

如果正则表达式写的不好，那么就有可能会出现悲观回溯。

还是上面的例子，但是这次我们用/^(x*)y$/ 来和字符串xxxxxx来进行匹配。

按照上面的流程，我们知道正则表达式需要进行6次回溯，最后匹配失败。

考虑一些极端的情况，可能会导致回溯一个非常大的次数，从而导致CPU占用率飙升。

## 序列化和序列化

我们将java对象存进文件或者进行网络传输的时候，都需要使用到序列化和反序列化。

如果我们在对一个java对象进行反序列化的时候，很可能就会加载恶意代码。

因此我们需要在反序列化的时候进行住够的安全控制。

## 大量的输出日志

通常我们为了调试程序或者寻找问题都会输出大量的日志，如果日志文件太大会影响到磁盘空间的使用。

同时，日志写入操作也会对同一个硬盘上的其他写入操作产生影响。所以日志输出要抓住重点。

## 无限循环

在使用循环的时候一定要注意，不要产生无限循环的情况。

## 使用第三方jar包

现代的java程序都会使用第三方jar包，但是第三方jar包的安全性还是需要我们注意的。如果某些第三方jar包中包含有恶意代码，那么会对我们的系统造成非常严重的影响。

## Xpath攻击

XPath 解析器是用来解析XML结构的工具，但是在使用XPath 解析器的时候，我们需要注意防止注入攻击。

举个例子：

~~~xml
<users>
     <user>
         <name>张三</name>
         <username>zhangsan</username>
         <password>123</password>
     </user>
     <user>
         <name>李四</name>
         <username>lisi</username>
         <password>456</password>
     </user>
~~~

如果使用xpath，我们需要这样来验证一个用户是否存在：

~~~xml
//users/user[username/text()='lisi'and password/text()='456']
~~~

如果用户传入username = 'lisi' 和 password = '456', 那么可以匹配成功，证明用户存在。

但是如果用户输入类似 ' or 1=1 or ''='  的值，我们看下xpath的解析结果：

~~~xml
//users/user[username/text()=''or 1=1 or ''='' and password/text()='' or 1=1 or ''='']
~~~

结果产生和SQL注入一样的结果。

## 释放所有资源

通常来说，我们在进行文件操作，锁获取操作的的时候会申请相应的资源，在使用完这些资源过后，千万要记得释放他们。

在JDK7 之后，引入了try with表达式，我们可以将要释放的资源放入try语句内，在程序执行完毕，资源会自动释放。

举个例子：

~~~java
public R readFileBuffered(
            InputStreamHandler handler
        ) throws IOException {
            try (final InputStream in = Files.newInputStream(path)) {
                handler.handle(new BufferedInputStream(in));
            }
        }
~~~

上面的InputStream会自动释放。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)








