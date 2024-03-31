---
slug: /12-netty-securechat
---

# 22. netty系列之:对聊天进行加密



# 简介

在之前的文章中，我们讲到了怎么使用netty建立聊天室，但是这样的简单的聊天室太容易被窃听了，如果想要在里面说点悄悄话是很不安全的，怎么办呢？学过密码学的朋友可能就想到了一个解决办法，聊天的时候对消息加密，处理的时候再对消息解密即可。

当然在netty中上述的工作都不需要我们手动来实现，netty已经提供了支持SSL的channel供我们选择，一起来看看吧。

# PKI标准

在讲netty的具体支持之前，我们需要先了解一下公钥和私钥的加密标准体系PKI。PKI的全称是Public Key Infrastructure，也就是公钥体系。用于规范公钥私募进行加密解密的规则，从而便于不同系统的对接。

事实上PKI标准已经有两代协议了。

第一代的PKI标准主要是由美国RSA公司的公钥加密标准PKCS，国际电信联盟的ITU-T X.509，IETF的X.509，WAP和WPKI等标准组成。但是因为第一代PKI标准是基于抽象语法符号ASN.1进行编码的，实现起来比较复杂和困难，所以产生了第二代PKI标准。

第二代PKI标准是由微软、VeriSign和webMethods三家公司在2001年发布的基于XML的密钥管理规范也叫做XKMS。

事实上现在CA中心使用的最普遍的规范还是X.509系列和PKCS系列。

X.509系列主要由X.209、X.500和X.509组成，其中X.509是由国际电信联盟（ITU-T）制定的数字证书标准。在X.500基础上进行了功能增强，
X.509是在1988年发布的。X.509证书由用户公共密钥和用户标识符组成。此外还包括版本号、证书序列号、CA标识符、签名算法标识、签发者名称、证书有效期等信息。

而PKCS是美国RSA公司的公钥加密标准，包括了证书申请、证书更新、证书作废表发布、扩展证书内容以及数字签名、数字信封的格式等方面的一系列相关协议。它定义了一系列从PKCS#1到PKCS#15的标准。

其中最常用的是PKCS#7、PKCS#12和PKCS#10。PKCS#7 是消息请求语法，常用于数字签名与加密，PKCS#12是个人消息交换与打包语法主要用来生成公钥和私钥。PKCS#10是证书请求语法。

# 各类证书的后缀和转换

操作过证书的朋友可能会对证书的后缀眼花缭乱，一般来说会有DER、CRT、CER、PEM这几种证书的后缀。

DER表示证书的内容是用二进制进行编码的。

PEM文件是一个文本文件，其内容是以“ - BEGIN -” 开头的，Base64编码的字符。

CRT和CER基本上是等价的，他们都是证书的扩展，也是文本文件，不同的是CRT通常用在liunx和unix系统中，而CER通常用在windows系统中。并且在windows系统中，CER文件会被MS cryptoAPI命令识别，可以直接显示导入和/或查看证书内容的对话框。

KEY文件，主要用来保存PKCS＃8标准的公钥和私钥。

下面的命令可以用来查看文本证书内容：

```
openssl x509 -in cert.pem -text -noout
openssl x509 -in cert.cer -text -noout
openssl x509 -in cert.crt -text -noout
```

下面的命令可以用来查看二进制证书内容：

```
openssl x509 -in cert.der -inform der -text -noout
```

下面是常见的PEM和DER相互转换：

```
PEM到DER

openssl x509 -in cert.crt -outform der-out cert.der

DER到PEM

openssl x509 -in cert.crt -inform der -outform pem -out cert.pem
```

# netty中启动SSL server

事实上这个标题是不对的，netty中启动的server还是原来那个server，只是对发送的消息进行了加密解密处理。也就是说添加了一个专门进行SSL操作的Handler。

netty中代表ssl处理器的类叫做SslHandler，它是SslContext工程类的一个内部类，所以我们只需要创建好SslContext即可通过调用newHandler方法来返回SslHandler。

让服务器端支持SSL的代码：

```
 ChannelPipeline p = channel.pipeline();
   SslContext sslCtx = SslContextBuilder.forServer(...).build();
   p.addLast("ssl", sslCtx.newHandler(channel.alloc()));
```

让客户端支持SSL的代码：

```
ChannelPipeline p = channel.pipeline();
   SslContext sslCtx = SslContextBuilder.forClient().build();
   p.addLast("ssl", sslCtx.newHandler(channel.alloc(), host, port));
```

netty中SSL的实现有两种方式，默认情况下使用的是OpenSSL，如果OpenSSL不可以，那么将会使用JDK的实现。

要创建SslContext,可以调用SslContextBuilder.forServer或者SslContextBuilder.forClient方法。

这里以server为例，看下创建流程。SslContextBuilder有多种forServer的方法，这里取最简单的一个进行分析：

```
    public static SslContextBuilder forServer(File keyCertChainFile, File keyFile) {
        return new SslContextBuilder(true).keyManager(keyCertChainFile, keyFile);
    }
```

该方法接收两个参数，keyCertChainFile是一个PEM格式的X.509证书文件，keyFile是一个PKCS#8的私钥文件。

熟悉OpenSSL的童鞋应该知道使用openssl命令可以生成私钥文件和对应的自签名证书文件。

具体openssl的操作可以查看我的其他文章，这里就不详细讲解了。

除了手动创建证书文件和私钥文件之外，如果是在开发环境中，大家可能希望有一个非常简单的方法来创建证书和私钥文件，netty为大家提供了SelfSignedCertificate类。

看这个类的名字就是知道它是一个自签名的证书类，并且会自动将证书文件和私钥文件生成在系统的temp文件夹中，所以这个类在生产环境中是不推荐使用的。默认情况下该类会使用OpenJDK's X.509来生成证书的私钥，如果不可以，则使用 Bouncy Castle作为替代。

# netty中启动SSL client

同样的在client中支持SSL也需要创建一个handler。客户端的SslContext创建代码如下：

```
// 配置 SSL.
        final SslContext sslCtx = SslContextBuilder.forClient()
                .trustManager(InsecureTrustManagerFactory.INSTANCE).build();
```

上面的代码我们使用了一个InsecureTrustManagerFactory.INSTANCE作为trustManager。什么是trustManager呢？

当客户端和服务器端进行SSL连接的时候，客户端需要验证服务器端发过来证书的正确性，通常情况下，这个验证是到CA服务器中进行验证的，不过这样需要一个真实的CA证书环境，所以在测试中，我们使用InsecureTrustManagerFactory，这个类会默认接受所有的证书，忽略所有的证书异常。

当然，CA服务器也不是必须的，客户端校验的目的是查看证书中的公钥和发送方的公钥是不是一致的，那么对于不能联网的环境，或者自签名的环境中，我们只需要在客户端校验证书中的指纹是否一致即可。

netty中提供了一个FingerprintTrustManagerFactory类，可以对证书中的指纹进行校验。

该类中有个fingerprints数组，用来存储安全的授权过的指纹信息。通过对比传入的证书和指纹，如果一致则校验通过。

使用openssl从证书中提取指纹的步骤如下：

```
openssl x509 -fingerprint -sha256 -in my_certificate.crt
```

# 总结

通过设置client和server端的SSL handler，就可以实现客户端和服务器端的加密消息传输。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)








