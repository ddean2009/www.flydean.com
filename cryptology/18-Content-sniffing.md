密码学系列之:内容嗅探

[toc]

# 简介

内容嗅探，也被称为媒体类型嗅探或MIME嗅探，是检查一个字节流的内容，试图推断其中数据的文件格式的做法。内容嗅探通常用在媒体类型没有被准确指定的情况，用于补偿元数据信息。

本文将会讲解内容嗅探的常用场景和可能出现的问题。

# MIME types

MIME的全称是**Multipurpose Internet Mail Extensions**，多用途互联网邮件扩展。它是一种标准，它表明了文档、文件或各种字节的性质和格式。它是在IETF的RFC 6838中定义的。互联网编号分配机构(IANA)负责定义所有官方的MIME类型。

MIME的结构包含两部分，分别是type和subtype,他们以 / 来进行分割：

```
type/subtype
```

类型代表数据类型所属的一般类别，如视频或文本。子类型确定MIME类型所代表的指定类型的确切数据种类。例如，对于 MIME 类型的文本，子类型可能是 plain（纯文本）、html（HTML 源代码）或日历（对于 iCalendar/.ics）文件。

每种类型都有它自己的一套可能的子类型, 一个MIME类型必须包含一个类型和一个子类型。

还可以在后面加上额外的参数：

```
type/subtype;parameter=value
```

例如，对于主类型是text的任何MIME类型，可选的charset参数可以用来指定数据中字符的字符集。如果没有指定字符集，默认为ASCII (US-ASCII)，除非被用户代理的设置覆盖。要指定UTF-8文本文件，则使用MIME类型text/plain;charset=UTF-8。

MIME类型不区分大小写，但传统上用小写，但参数值除外，因为参数值的大小写可能有或没有特定的意义。

MIME有两中类型，分别是**discrete** 和**multipart**。

离散类型是代表单一文件或媒介的类型，如单一文本或音乐文件，或单一视频。

多部分类型是指由多个组件组成的文件，每个组件都有自己独立的MIME类型；或者，指封装在一个事务中一起发送的多个文件。例如，电子邮件中多个附件就是一种多部分MIME类型。

我们看下常见的**discrete**类型：

1. application， 比如：`application/octet-stream`，`application/pdf`，`application/pkcs8`和`application/zip`等。
2. audioList， 比如：`audio/mpeg`，`audio/vorbis`。
3. font， 比如：`font/woff`，`font/ttf`和`font/otf`。
4. image，比如：`image/jpeg`，`image/png`和`image/svg+xml`。
5. model， 比如：`model/3mf` 和`model/vml`。
6. text，比如：`text/plain`, `text/csv` 和 `text/html`.
7. video，比如：`video/mp4`。

常见的**Multipart**类型如下：

1. message，比如：`message/rfc822`和`message/partial`。
2. multipartList， 比如：multipart/form-data 和 `multipart/byteranges`。



# 浏览器嗅探

因为浏览器使用MIME类型，而不是文件扩展名来决定如何处理一个URL，所以Web服务器在响应的Content-Type头中发送正确的MIME类型非常重要。如果没有正确配置，浏览器很可能会误解文件的内容，网站将无法正常运行，下载的文件也可能会被错误处理。

为了解决这个问题，或者说是更好的用户体验，很多浏览器会进行MIME内容嗅探，也就是通过解析文件的内容，来猜测MIME类型的格式。

不同的浏览器处理MIME嗅探的方式是不一样的。但是他们都可能会产生严重的安全漏洞，因为有些MIME类型是可执行类型的，恶意攻击者可以通过混淆MIME嗅探算法，从而使攻击者可以进行网站运营者或用户都没有预料到的操作，如跨站脚本攻击。

如果不想浏览器端进行嗅探，可以在服务端的响应中设置 `X-Content-Type-Options` 头，比如：

```
X-Content-Type-Options: nosniff
```

这个头最早是在IE 8中支持的，不过现在所有的浏览器基本都支持这个head类型了。

# 客户端嗅探

我们通常需要在JS中判断浏览器是否是IE浏览器，然后做响应的处理：

```
var isIEBrowser = false;
if (window.ActiveXObject) {
    isIEBrowser = true;
}

// Or, shorter:
var isIE = (window.ActiveXObject !== undefined);
```

上面的例子就是非常简单的客户端嗅探，通过判断window是否有ActiveXObject 这个属性来确定这个浏览器是否是IE浏览器。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！