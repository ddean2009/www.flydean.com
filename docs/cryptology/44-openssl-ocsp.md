密码学系列之:使用openssl检测网站是否支持ocsp

[toc]

# 简介

OCSP在线证书状态协议是为了替换CRL而提出来的。对于现代web服务器来说一般都是支持OCSP的，OCSP也是现代web服务器的标配。

但是OCSP stapling却不是所有的web服务器都支持。但是现实工作中我们可能需要知道具体某个网站对OCSP的支持程度。

# 支持OCSP stapling的网站

怎么判断一个web站点是否支持OCSP stapling呢？

最简单的方法就是去第三方网站查看网站的证书信息。比如我们之前提到过的entrust.ssllabs.com，通过输入对应的网站信息，在
Protocol Details一节中，可以找到网站是否支持OCSP stapling的具体信息，如下所示：

![](https://img-blog.csdnimg.cn/dd1db9a21f3845178d17bcb55bfc70de.png)

可以看到这个网站是开启了OCSP stapling的。但是事实上这个世界上的绝大部分网站是没有开启OCSP stapling的。

那么除了在第三方网站上查看OCSP stapling之外，还有没有其他办法呢？

事实上我们可以使用openssl神器轻松的做到这一点。当然前提是这个网站支持https。

接下来我们会详细讲解从获取服务器的证书到验证服务器是否支持OCSP stapling的一整套流程。

本文要验证的网站是微软的官网www.squarespace.com,这是一个支持OCSP stapling的网站。

# 获取服务器的证书

要校验服务器是否支持OSCP,我们首先需要获取到这个服务器的证书，可以用openssl提供的 openssl s_client -connect来完成这个工作。

```
 openssl s_client -connect www.squarespace.com:443
```

这个命令会输出建立连接的所有内容，其中包含了要访问网站的证书信息。

因为我们只需要网站的证书，所以需要把`-----BEGIN CERTIFICATE-----`和`-----END CERTIFICATE-----`之间的内容保存即可。

那么最终的命令如下：

```
  openssl s_client -connect www.squarespace.com:443 | sed -n '/-----BEGIN/,/-----END/p' > ca.pem
```

这里我们使用一个sed -n命令从输出中截取以`-----BEGIN`开头和以`-----END`结尾的数据。

最终我们得到了网站的证书。

除了网站本身的证书之外，网站的证书本身是由其他的证书来签发的,这些证书叫做intermediate certificate，我们需要获取到整个证书链。

同样使用openssl的`openssl s_client -showcerts`命令可以获取所有的证书链：

```
openssl s_client -showcerts  -connect www.squarespace.com:443 | sed -n '/-----BEGIN/,/-----END/p' > chain.pem
```

如果你打开chain.pem文件可以发现，文件里面有两个证书，最上面的一个就是服务器本身的证书，而第二个就是用于签名服务器证书的intermediate certificate。

# 获取OCSP responder地址

如果证书中包含有OCSP responder的地址，那么可以用下面的命令来获取：

```
openssl x509 -noout -ocsp_uri -in ca.pem 
```

我们可以得到网站的ocsp responder地址是：`http://ocsp.digicert.com`。

还有一种方法可以获得ocsp responder的地址：

```
openssl x509 -text -noout -in ca.pem
```

这个命令会输出证书的所有信息，我们可以看到下面的内容：

```
 Authority Information Access:
                OCSP - URI:http://ocsp.digicert.com
                CA Issuers - URI:http://cacerts.digicert.com/DigiCertTLSRSASHA2562020CA1-1.crt
```

其中OCSP - URI就是OCSP responder的地址。

# 发送OCSP请求

有了OCSP responder的地址，我们就可以进行OCSP验证，在这个命令中我们需要用到服务器的证书和intermediate证书。

具体的请求命令如下：

```
openssl ocsp -issuer chain.pem -cert ca.pem -text -url http://ocsp.digicert.com
```

从输出中我们可以得到两部分，第一部分是OCSP Request Data,也就是OCSP请求数据：

```
OCSP Request Data:
    Version: 1 (0x0)
    Requestor List:
        Certificate ID:
          Hash Algorithm: sha1
          Issuer Name Hash: 521EE36C478119A9CB03FAB74E57E1197AF1818B
          Issuer Key Hash: 09262CA9DCFF639140E75867E2083F74F6EAF165
          Serial Number: 120014F1EC2395D56FDCC4DCB700000014F1EC
    Request Extensions:
        OCSP Nonce:
            04102873CFC7831AB971F3FDFBFCF3953EC5
```

从请求数据中，我们可以看到详细的OCSP请求数据结构，包括issuer的内容和OCSP nonce。

第二部分是响应数据，很遗憾我们得到了下面的请求错误响应数据：

```
OCSP Response Data:
    OCSP Response Status: successful (0x0)
    Response Type: Basic OCSP Response
    Version: 1 (0x0)
    Responder Id: B76BA2EAA8AA848C79EAB4DA0F98B2C59576B9F4
    Produced At: Apr 30 04:36:26 2022 GMT
    Responses:
    Certificate ID:
      Hash Algorithm: sha1
      Issuer Name Hash: E4E395A229D3D4C1C31FF0980C0B4EC0098AABD8
      Issuer Key Hash: B76BA2EAA8AA848C79EAB4DA0F98B2C59576B9F4
      Serial Number: 0F21C13200AE502D52BBE8DFEAB0F807
    Cert Status: good
    This Update: Apr 30 04:21:01 2022 GMT
    Next Update: May  7 03:36:01 2022 GMT
```

上面返回结果中，Cert Status: good表示的是OCSP请求成功了，这个网站是一个支持OCSP协议的网站。

后面的两行是OCSP上次更新的时间和下次更新的时间:

```
    This Update: Apr 30 04:21:01 2022 GMT
    Next Update: May  7 03:36:01 2022 GMT
```

说明这个网站还支持OCSP stapling。

另外，请求某些网站的OCSP url的时候可能会得到下面的异常：

```
Error querying OCSP responder
4346349100:error:27FFF072:OCSP routines:CRYPTO_internal:server response error:/AppleInternal/Library/BuildRoots/66382bca-8bca-11ec-aade-6613bcf0e2ee/Library/Caches/com.apple.xbs/Sources/libressl/libressl-2.8/crypto/ocsp/ocsp_ht.c:251:Code=400,Reason=Bad Request
```

为什么会这样呢？

这是因为ocsp.msocsp.com这个网站不支持OCSP默认的HTTP 1.0请求，在HTTP 1.0请求中默认是没有Host这个请求头的。所以我们需要添加上Host请求头，然后再执行一次即可。

# 一个更加简单的方法

以上我们实际上是将请求拆开来一步步执行的。我们还可以使用openssl一步执行任务如下：

```
openssl s_client -tlsextdebug -status -connect www.squarespace.com:443
```

从输出中，我们可以看到下面的数据：

```
OCSP response:
======================================
OCSP Response Data:
    OCSP Response Status: successful (0x0)
    Response Type: Basic OCSP Response
    Version: 1 (0x0)
    Responder Id: B76BA2EAA8AA848C79EAB4DA0F98B2C59576B9F4
    Produced At: Apr 27 04:36:26 2022 GMT
    Responses:
    Certificate ID:
      Hash Algorithm: sha1
      Issuer Name Hash: E4E395A229D3D4C1C31FF0980C0B4EC0098AABD8
      Issuer Key Hash: B76BA2EAA8AA848C79EAB4DA0F98B2C59576B9F4
      Serial Number: 0F21C13200AE502D52BBE8DFEAB0F807
    Cert Status: good
    This Update: Apr 27 04:21:02 2022 GMT
    Next Update: May  4 03:36:02 2022 GMT
```

上面的命令直接输出了OCSP response结果，从结果中我们很清楚的看到该网站是否支持OCSP和OCSP stapling。

# 总结

虽然大多数网站都不支持OCSP stapling，但是我们可以通过使用上面的命令来有效的进行判断。




