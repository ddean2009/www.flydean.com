密码学系列之:PEM和PKCS7,PKCS8,PKCS12

[toc]

# 简介

PEM是一种常见的保存key或者证书的格式，PEM格式的文件一般来说后缀是以.pem结尾的。那么PEM到底是什么呢？它和常用的证书格式PKCS7和PKCS12有什么关系呢？一起来看看吧。

# PEM

PEM虽然使用来存储证书或者密钥的，但是PEM原本是和email相关联的，因为PEM的全称是Privacy-Enhanced Mail,最初是为邮件的隐私增强而创建的,是在1993年由IETF制定的标准。虽然最终的协议标准并没有被广泛采用，但是其中定义的文本编码却被广泛的使用，最终由IETF在RFC 7468中正式化。

之前我们介绍过一种协议描述语言ASN.1,ASN.1通常被用来定义协议中的数据结构，然后通过使用DER编码来对这些数据进行序列化，但是DER编码是二进制的格式，二进制文件在某些情况下不方便进行传输或者展示，不然说某些只支持ASCII编码的情况，所以需要一种可以讲DER格式转换成为文本格式的方式。

这种方式就叫做PEM。PEM使用的方法也很简单，就是对DER编码过后的二进制数据使用base64编码，将其转换成为文本文件。

在PEM中有固定的文件头和文件结尾符。文件头是以`-----BEGIN`+label+`-----`开始，文件结尾是以`-----END`+label+`-----`结束。

其中label表示的是编码的消息类型，通常可以取这些值：CERTIFICATE, CERTIFICATE REQUEST, PRIVATE KEY 和 X509 CRL。

下面是一个PEM的例子,表示其内容是一个证书：

```
-----BEGIN CERTIFICATE KEY-----

-----END CERTIFICATE KEY-----
```

虽然PEM格式的文件通常以.pem结束，但是也可以使用 ".cer" 或者 ".crt" 表示一个证书，使用".key"表示是一个密钥。

另外， 一个PEM文件中可以包含多个内容，比如对于证书来说，通常来说可能需要一些额外的信息比如证书链，这样一个证书链可以存储在一个PEM文件中。

# PKCS7

PKCS7是Public-Key Cryptography Standards系列的一员，主要用来存储签名或者加密后的数据,比如证书或者CRL。PKCS7可以用原始的DER格式进行存储，也可以使用PEM格式进行存储。

如果以PEM格式进行存储，那么文件的开头和结尾分别是：

```
‑‑‑‑‑BEGIN PKCS7‑‑‑‑‑

‑‑‑‑‑END PKCS7‑‑‑‑‑
```

在windows中PKCS7通常以.p7b结尾。

PKCS7的操作可以通过openssl命令来进行。

比如将一个PKCS7的文件从PEM格式转换成为DER格式：

```
 openssl pkcs7 -in file.pem -outform DER -out file.der
```

从一个文件中提取出所有的证书到另外一个文件：

```
 openssl pkcs7 -in file.pem -print_certs -out certs.pem
```

# PKCS8

PKCS8也是Public-Key Cryptography Standards系列的一员，它主要用来存储私钥。

私钥首先会使用PKCS #5的标准进行加密，然后将其进行base64编码，转换成为PEM格式进行存储。

所以说PKCS8的格式就是PEM，但是里面存储的内容是经过加密过后的私钥。

# PKCS12

PKCS12也是Public-Key Cryptography Standards系列的一员，PKCS12可以看做是PKCS7的扩展，在PKCS12中可以存储证书，私钥或者CRL。和PKCS7相比，PKCS12可以额外存储私钥。

PKCS12的文件是以.p12 或者 .pfx结尾的。在JDK9中，PKCS12是默认的密钥存储格式。

PKCS12的格式和PEM相比会复杂的多，在需要的时候，我们可以使用OPENSSL将PKCS12格式转换成为PEM格式：

```
openssl pkcs12 -nocerts -nodes -in cert.p12 -out private.pem
```

当然也可以从PEM到PKCS12：

```
openssl pkcs12 -export -in Cert.pem -out Cert.p12 -inkey key.pem
```

# 总结

以上就是PEM和PKCS系列中几个非常常用的编码格式。希望大家能够掌握和正确使用。














