---
slug: /12-MIME
---

# 12. 网络标准之:永远是1.0版本的MIME



# 简介

无规矩不成方圆，无标准不成网络通信。正是在各种网络协议和标准的基础之上，才构建了我们现在流行的互联网。今天给大家介绍的就是一个网络标准格式，叫做MIME，它的全称是Multipurpose Internet Mail Extensions,翻译过来就是多用途Internet邮件扩展。

那么有小伙伴开始疑惑了，原来是一个邮件的扩展协议，那么它跟我们使用的Internet网络有什么关系呢？

不急，我们慢慢道来。

# MIME详解

在很久很久以前，计算机的一种流行的应用就是发邮件，最开始的时候，计算机世界的编码方式就只有ASCII一种，但是随着时间的推移和各种应用需求的激增，ASCII格式已经不能满足我们的需求了，格式多类型的同时也照成了互相通信之间的困难，于是一个统一的消息格式标准产生了，这个就是MIME。

MIME可以让邮件不仅支持ASCII，还可以支持其他的编码方式。同时支持图片、音频、视频和应用程序等多种附件。

消息体还可以支持多个part的集合，当这样的消息邮件使用MIME格式编码之后，就可以通过标准的邮件协议，比如SMTP、POP、IMAP等进行发送了。

因为MIME是一个标准，所以只要符合这种标准的邮件都能够被解析成功。

很快，MIME就在邮件世界被广泛应用，但是互联网已经发展到使用流行的HTTP协议来访问万维网的时候了，MIME中定义的各种content types很自然的也成了其他协议中使用的content标准。

这种content types是在MIME头中定义的，应用程序接收到content type之后，会根据类型中指定的消息类型，来采用对应的应用程序对消息内容进行解析。

# MIME头

MIME头很重要，是应用程序用来判断消息格式的首要依据。MIME头可以包含下面的字段。

## MIME-Version

如果存在这个消息头，说明这个消息是遵循的是MIME格式。它的值通常是1.0。

```
MIME-Version: 1.0
```

有细心的小伙伴可以能要问了，既然有1.0，那么有没有1.1或者2.0呢？

很抱歉，答案是没有。因为根据MIME 共同创建者 Nathaniel Borenstein 的说法，虽然引入MIME版本号是为了在后续中对MIME进行修改和升级。但是因为MIME规范并没有为未来MIME版本的升级进行良好的设计，所以不同的人可能对MIME版本升级后的处理方式都是不一样的。从而导致在MIME广泛应用的今天，很难对MIME规范进行升级。

所以，就使用1.0吧。

## Content-Type

如果属性HTTP协议的同学，对这个头应该很熟悉了吧，这个头表示的是消息体的类型，包含了类型和子类型，比如：

```
Content-Type: text/plain
```

我们常说的MIME type就是指这个标签。

下面是常用的MIME type：

说明|后缀|类型
---|---|---
超文本标记语言文本| .html| text/html
xml文档| .xml |text/xml
XHTML文档 |.xhtml |application/xhtml+xml
普通文本| .txt |text/plain
RTF文本 |.rtf |application/rtf
PDF文档 |.pdf| application/pdf
Microsoft Word文件 |.word| application/msword
PNG图像 |.png| image/png
GIF图形 |.gif |image/gif
JPEG图形 |.jpeg,.jpg |image/jpeg
au声音文件 |.au| audio/basic
MIDI音乐文件| mid,.midi| audio/midi,audio/x-midi
RealAudio音乐文件| .ra, .ram| audio/x-pn-realaudio
MPEG文件| .mpg,.mpeg| video/mpeg
AVI文件| .avi| video/x-msvideo
GZIP文件 |.gz| application/x-gzip
TAR文件| .tar |application/x-tar
任意的二进制数据| | application/octet-stream

## Content-Disposition

Content-Disposition是在RFC 2183中添加的一个字段，表示的是消息的展示样式。因为之前的消息只是定义了它的消息格式，并没有考虑消息是如何展示的问题，尤其是对于邮件来说。

比如邮件中插入了一个图片，那么这个图片是在我们读消息的时候内联展示呢？还是以附件的形式，必须要用户下载才能看到呢？

如果是在HTTP中，响应头字段Content-Disposition:attachment 通常用作提示客户端将响应正文呈现为可下载文件。通常，当收到这样的响应时，Web浏览器会提示用户将其内容保存为文件，而不是将其显示为浏览器窗口中的页面。

## Content-Transfer-Encoding

这个字段是做什么用的呢？

我们知道，随着数据格式越来越多，传统的ASCII已经不能支持庞大的内容表示形式，所以出现了超出ASCII范围的内容表示形式如Unicode。

但是对于SMTP服务器来说，能够传输或者认识的编码是有限的，如果要传输二进制内容，则需要使用一定的transfer encodings方式对二进制内容进行转换。这就是Content-Transfer-Encoding的意义。

根据RFC和IANA的定义，有下面几个transfer encodings方式：

Name |      Reference
----|-----
7bit |            [RFC2045]
8bit  |           [RFC2045]
binary |          [RFC2045]
quoted-printable| [RFC2045]
base64      |     [RFC2045]

具体transfer encodings的含义，可以参考我后续的文章，这里只做简单的介绍。

对于普通的SMTP服务器来说，可以支持7bit、quoted-printable和base64这三种编码方式。

对于8BITMIME SMTP extension的SMTP服务器来说，还支持8bit这种编码方式。

对于支持BINARYMIME SMTP extension的SMTP服务器来说，还支持binary这种编码方式。

## Encoded-Word

根据RFC 2822，确认消息头中的字段名和值必须使用ASCII字符。如果消息中包含非ASCII字符，则需要进行编码。这个编码就是encoded-word 。

编码的格式如下：

```
"=?charset?encoding?encoded text?=".
```

charset表示的是原消息的编码，encoding表示的是使用的编码方式，encoded text是编码后的消息。

# Multipart messages

最后，介绍一下Multipart messages，我们知道一个消息是有对应的消息类型：Content-Type的。

如果是复杂的消息，那么它里面的消息类型可能不止一种。所以这时候就需要用到Multipart messages，也就是将消息分为多个部分，每个部分都有一个Content-Type。

这种类型在邮件中比较常见。下面是一个Multipart messages的例子，在Content-Type中指定了一个消息的分割标记boundary。

```
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary=frontier

This is a message with multiple parts in MIME format.
--frontier
Content-Type: text/plain

This is the body of the message.
--frontier
Content-Type: application/octet-stream
Content-Transfer-Encoding: base64

PGh0bWw+CiAgPGhlYWQ+CiAgPC9oZWFkPgogIDxib2R5PgogICAgPHA+VGhpcyBpcyB0aGUg
Ym9keSBvZiB0aGUgbWVzc2FnZS48L3A+CiAgPC9ib2R5Pgo8L2h0bWw+Cg==
--frontier--
```

# 总结

以上就是MIME的基本介绍，在其中，我们提到了几种transfer encodings方法，敬请期待后续文章。









