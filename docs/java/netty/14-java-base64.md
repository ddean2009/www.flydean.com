---
slug: /14-1-1-java-base64
---

# 26. netty系列之:java中的base64编码器



# 简介

什么是Base64编码呢？在回答这个问题之前，我们需要了解一下计算机中文件的分类，对于计算机来说文件可以分为两类，一类是文本文件，一类是二进制文件。

对于二进制文件来说，其内容是用二进制来表示的，对于人类是不可立马理解的。如果你尝试用文本编辑器打开二进制文件，可能会看到乱码。这是因为二进制文件的编码方式和文本文件的编码方式是不一样的，所以当文本编辑器尝试将二进制文件翻译成为文本内容的时候，就会出现乱码。

对于文本文件来说，也有很多种编码方式，比如最早的ASCII编码和目前常用的UTF-8和UTF-16等编码方式。即使是文本文件，如果你使用不同的编码方式打开，也可能会看到乱码。

所以不管是文本文件还是二进制文件也好，都需要进行编码格式的统一。也就是说写入的编码是什么样子的，那么数据读取的编码也应该和其匹配。

Base64编码实际上就是将二进制数据编码成为可视化ASCII字符的一种编码方式。

为什么会有这样的要求呢？

我们知道计算机世界的发展不是一蹴而就的，它是一个慢慢成长的过程，对于字符编码来说，最早只支持ASCII编码，后面才扩展到Unicode等。所以对于很多应用来说除了ASCII编码之外的其他编码格式是不支持的，那么如何在这些系统中展示非ASCII code呢？

解决的方式就是进行编码映射，将非ASCII的字符映射成为ASCII的字符。而base64就是这样的一种编码方式。

常见的使用Base64的地方就是在web网页中，有时候我们需要在网页中展示图片，那么可以将图片进行base64编码，然后填充到html中。

还有一种应用就是将文件进行base64编码，然后作为邮件的附件进行发送。

# JAVA对base64的支持

既然base64编码这么好用，接下来我们来看一下JAVA中的base64实现。

java中有一个对应的base64实现，叫做java.util.Base64。这个类是Base64的工具类，是JDK在1.8版本引入的。

Base64中提供了三个getEncoder和getDecoder方法，通过获取对应的Encoder和Decoder，然后就可以调用Encoder的encode和decode方法对数据进行编码和解码，非常的方便。

我们先来看一下Base64的基本使用例子：

```
 // 使用encoder进行编码
 String encodedString = Base64.getEncoder().encodeToString("what is your name baby?".getBytes("utf-8"));
 System.out.println("Base64编码过后的字符串 :" + encodedString);

 // 使用encoder进行解码
 byte[] decodedBytes = Base64.getDecoder().decode(encodedString);

 System.out.println("解码过后的字符串: " + new String(decodedBytes, "utf-8"));
```

作为一个工具类，JDK中提供的Base64工具类还是很好用的。

这里就不详细讲解它的使用，本篇文章主要分析JDK中Base64是怎么实现的。

# JDK中Base64的分类和实现

JDK中Base64类有提供了三个encoder方法，分别是getEncoder,getUrlEncoder和getMimeEncoder:

```
    public static Encoder getEncoder() {
         return Encoder.RFC4648;
    }

    public static Encoder getUrlEncoder() {
         return Encoder.RFC4648_URLSAFE;
    }

    public static Encoder getMimeEncoder() {
        return Encoder.RFC2045;
    }
```

同样的，它也提供了三个对应的decoder，分别是getDecoder，getUrlDecoder，getMimeDecoder：

```
    public static Decoder getDecoder() {
         return Decoder.RFC4648;
    }

    public static Decoder getUrlDecoder() {
         return Decoder.RFC4648_URLSAFE;
    }

    public static Decoder getMimeDecoder() {
         return Decoder.RFC2045;
    }
```

从代码中可以看出，这三种编码分别对应的是RFC4648，RFC4648_URLSAFE和RFC2045。

这三种都属于base64编码的变体，我们看下他们有什么区别：

| 编码名称                                                | 编码字符 | 编码字符 |   编码字符    |
| :------------------------------------------------------ | :------: | :------: | :-----------: |
|                                                         |  第62位  |  第63位  |    补全符     |
| RFC 2045: Base64 transfer encoding for MIME             |   `+`    |   `/`    | `=` mandatory |
| RFC 4648: base64 (standard)                             |   `+`    |   `/`    | `=` optional  |
| RFC 4648: base64url (URL- and filename-safe standard)   |   `-`    |   `_`    | `=` optional  |

可以看到base64和Base64url的区别是第62位和第63位的编码字符不一样，而base64 for MIME跟base64的区别是补全符是否是强制的。

另外，对于Basic和base64url来说，不会添加line separator字符，而base64 for MIME在一行超出76字符之后，会添加'\r' 和 '\n'作为line separator。

最后，如果在解码的过程中，发现有不存于Base64映射表中的字符的处理方式也不一样，base64和Base64url会直接拒绝，而base64 for MIME则会忽略。

base64和Base64url的区别可以通过下面两个方法来看出：

```
        private static final char[] toBase64 = {
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '/'
        };
```

```
        private static final char[] toBase64URL = {
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '_'
        };
```

而对MIME来说，定义了一个一行的最大字符个数,和换行符：

```
        private static final int MIMELINEMAX = 76;
        private static final byte[] CRLF = new byte[] {'\r', '\n'};
```

# Base64的高级用法

一般情况下我们用Base64进行编码的对象长度是固定的，我们只需要将输入对象转换成为byte数组即可调用encode或者decode的方法。

但是在某些情况下我们需要对流数据进行转换，这时候就可以用到Base64中提供的两个对Stream进行wrap的方法：

```
        public OutputStream wrap(OutputStream os) {
            Objects.requireNonNull(os);
            return new EncOutputStream(os, isURL ? toBase64URL : toBase64,
                                       newline, linemax, doPadding);
        }
```

```
        public InputStream wrap(InputStream is) {
            Objects.requireNonNull(is);
            return new DecInputStream(is, isURL ? fromBase64URL : fromBase64, isMIME);
        }
```

这两个方法分别对应于encoder和decoder。

# 总结

以上就是JDK中对Base64的实现和使用，虽然base64的变种有很多种，但是JDK中的Base64只实现了其中用处最为广泛的3种。大家在使用的时候一定要区分具体是那种Base64的实现方式，以免出现问题。




