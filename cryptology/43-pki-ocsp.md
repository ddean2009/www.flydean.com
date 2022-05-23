密码学系列之:在线证书状态协议OCSP详解

[toc]

# 简介

我们在进行网页访问的时候会跟各种各样的证书打交道，比如在访问https网页的时候，需要检测https网站的证书有效性。

OCSP就是一种校验协议，用于获取X.509数字证书的撤销状态。它是为了替换CRL而出现的。

本文将会详细介绍OCSP的实现和优点。

# PKI中的CRL

我们知道在PKI架构中，CA证书是非常重要的组件，客户端通过CA证书来验证服务的可靠性。对于CA证书本身来说在创建的时候是可以指定过期时间的。这样证书在过期之后就不可以使用，需要申请新的证书。

但是只给证书指定过期时间是不够的，比如我们因为业务的需求，需要撤销证书怎么办呢？

PKI中提供了一个叫做CRL(certificate revocation list)的机制，用来维持被废除的证书列表。

这个CRL是由CA来颁发的，一般是在证书过期之前生成的。因为如果证书已经过期了，那么这个CRL是无意义的。

对于CRL本身来说，它是一个证书列表，里面证书的格式通常也使用的是X.509。

CRL一般是由发布证书的CA来维护和发布的，发布CRL的组件叫做CRL issuer，通常来说CRL issuer和CA是同一个服务，但是你也可以根据需要将CRL issuer和CA进行拆分。

CRL是由CA定时来发布的，当然你也可以按照需要在需要撤销某个CA证书的时候重新发布CRL。所有的CRL都有过期时间，在这个过期时间之内，客户端可以根据CRL中的签名，去CA验证CRL的有效性，从而防止CRL的伪造。

# CRL的缺点

那么CRL有什么缺点呢？

首先CRL维持的是一个撤销的证书列表，为了保证系统的有效性，客户端在每次校验CA证书有效性的时候，都需要从CA服务器中获取这个CRL。然后通过CRL来校验对应的CA证书状态。

如果每次都去拿这个CRL，就有可能会有下面几个问题。

第一个问题是，如果CRL不可用，那么客户端就拿不到这个CRL，也就无法校验CA证书的状态，从而造成服务不可用。

另外一个问题是，如果要撤销的证书比较多的话，这个CRL可能会比较大，从而造成网络资源的浪费。

最后一个问题是PKI证书体系本身的目的是建立一个可以自我校验的，不依赖于在线服务的安全体系，如果每次都要在线获取CRL的话，就是去了PKI的这一优势。

# CRL的状态

虽然CRL维持的是一个撤销证书列表，但是这个列表中证书的状态还是有所不同的。

CRL中证书的状态有两种，第一种就是证书已经被撤销了，比如证书的颁发机构CA发现之前的颁布的证书是错误的，或者因为其他的原因如私钥泄露导致原来的证书不够安全，需要将证书撤回。或者证书机构因为未遵守某些策略导致证书被吊销等，都需要将之前的证书设置为撤销状态。

还有一种状态是一个临时撤销的状态，这里叫做Hold状态，它表示证书暂时是无效的，比如在用户没有确定私钥是否丢失的情况下。当用户最终找回了私钥，则这个证书还是可以被恢复的。

# OCSP的工作流程

既然CRL有这么多缺点，所以一个用来替代CRL的OCSP协议出现了。

我们先来看一下OCSP的工作流程。

假如A和B要进行使用PKI进行通讯。为了保证通讯的安全性，A将自己的公钥发给B，并告诉B，这是我的公钥，你可以用这个公钥来校验我发送给你的消息。

B在收到A的公钥之后，并不能确定A的公钥就是正确的，没有被篡改的。于是从A的公钥中提取出serial number,并将其封装到一个'OCSP request'中发给CA服务器。

CA服务器中的OCSP responder读取到了'OCSP request'请求，并从中提取出A的公钥的serial number。OCSP responder从CA服务器的数据库中查询这个serial number是否在这个数据库被撤销的列表中。

如果发现不在，那么意味着A的公钥仍然是有效的，OCSP responder将会发送一个签名后的OCSP response给B。

B通过使用CA服务器的公钥验证OCSP response的有效性，从而确认A的公钥仍然有效 。

最后B使用A的公钥和A进行通讯。

# OCSP的优点

从上面的OCSP的工作流程我们可以大概总结出下面几个OCSP相对于CRL的优点。

首先OCSP响应的数据量要比CRL要小，所以对网络的要求和压力更少。

另外因为OCSP响应要解析的数据更少，所以OCSP客户端的实现要比CRL更加简单。

虽然因为CRL的各种缺点，在web环境中已经不再被使用，而是被更加高效的OCSP替换，但是CRL仍然被运行在CA的其他环境中。

# OCSP协议的细节

OCSP协议是在RFC 6960中定义的。

OCSP协议可以分为请求协议和响应协议两部分，接下来分别来进行介绍。

## OCSP请求

一个OCSP请求需要包含协议版本号，请求服务,要校验的证书identifier和可选的扩展部分。

OCSP responder在接收到OCSP的请求之后，会去校验OCSP消息的有效性，如果消息有问题则会返回异常,否则的话会根据请求的服务进行处理。

OCSP请求如果用ASN.1(Abstract Syntax Notation One)抽象语法标记这可以如下表示：

```
   OCSPRequest     ::=     SEQUENCE {
       tbsRequest                  TBSRequest,
       optionalSignature   [0]     EXPLICIT Signature OPTIONAL }

   TBSRequest      ::=     SEQUENCE {
       version             [0]     EXPLICIT Version DEFAULT v1,
       requestorName       [1]     EXPLICIT GeneralName OPTIONAL,
       requestList                 SEQUENCE OF Request,
       requestExtensions   [2]     EXPLICIT Extensions OPTIONAL }
          Signature       ::=     SEQUENCE {
            signatureAlgorithm      AlgorithmIdentifier,
            signature               BIT STRING,
            certs               [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL}

   Version         ::=             INTEGER  {  v1(0) }

   Request         ::=     SEQUENCE {
       reqCert                     CertID,
       singleRequestExtensions     [0] EXPLICIT Extensions OPTIONAL }

   CertID          ::=     SEQUENCE {
       hashAlgorithm       AlgorithmIdentifier,
       issuerNameHash      OCTET STRING, -- Hash of issuer's DN
       issuerKeyHash       OCTET STRING, -- Hash of issuer's public key
       serialNumber        CertificateSerialNumber }
```

ASN.1是一个接口描述语言，通过ASN.1，我们可以很清晰的描述数据的格式信息。

一个OCSPRequest是由可选择签名的OCSP请求tbsRequest和对应的签名optionalSignature组成的。

其中TBSRequest中包含了版本号，OCSP requestor的名字，证书的状态列表requestList，可选的扩展数据这几项组成的。

## OCSP响应

对于OCSP的响应来说，根据传输协议的不同它的结构也是不同的。但是所有的响应都应该包含responseStatus字段表示请求的处理状态。

OCSP响应用ASN.1格式来表示如下所示：

```
   OCSPResponse ::= SEQUENCE {
      responseStatus         OCSPResponseStatus,
      responseBytes          [0] EXPLICIT ResponseBytes OPTIONAL }

   OCSPResponseStatus ::= ENUMERATED {
       successful            (0),  -- Response has valid confirmations
       malformedRequest      (1),  -- Illegal confirmation request
       internalError         (2),  -- Internal error in issuer
       tryLater              (3),  -- Try again later
                                   -- (4) is not used
       sigRequired           (5),  -- Must sign the request
       unauthorized          (6)   -- Request unauthorized
   }

      ResponseBytes ::=       SEQUENCE {
       responseType   OBJECT IDENTIFIER,
       response       OCTET STRING }
```

responseStatus是响应的状态，responseBytes是可选的响应结果。

这里的response是一个BasicOCSPResponse对象的DER编码：

```
   BasicOCSPResponse       ::= SEQUENCE {
      tbsResponseData      ResponseData,
      signatureAlgorithm   AlgorithmIdentifier,
      signature            BIT STRING,
      certs            [0] EXPLICIT SEQUENCE OF Certificate OPTIONAL }
```

# OCSP stapling

可以看到OCSP需要客户在需要查看证书是否被吊销的时候，需要向OCSP responser请求，以确认证书的有效性。

但是这种方式实际上泄露了用户的隐私信息，因为OCSP responser知道了客户端需要校验的证书，就知道客户端正在访问的网站。

于是引入了OCSP stapling来解决这个问题。

那么什么是OCSP stapling呢?

OCSP stapling是直接将OCSP证书放到客户端要访问的web服务器上，因为OCSP证书是添加了时间戳和数字签名的，所以可以保证其正确性。

这些OCSP证书会在客户端和web端建立SSL 握手的时候就包含在OCSP响应中。

这样客户端不需要单独和CA建立额外的连接，从而提高了性能。

OCSP stapling需要在服务器端主动开启。

如果你用的是apache服务器，首先需要版本大于2.3.3。

然后需要在.conf文件中的`<VirtualHost></VirtualHost>` block外部添加：

```
SSLStaplingCahe shmcb: /tmp/stapling_cache(128000)
```

然后在`<VirtualHost></VirtualHost>` block的内部添加：

```
SSLUseStapling On
```

如果你用的是nginx，首先需要版本大于1.3.7。

然后在nginx的配置文件`server {}` block中添加：

```
ssl_stapling on;
ssl_stapling_verify on;
```

如果你想验证一个网站是否开启了OCSP stapling，可以到https://entrust.ssllabs.com/网站中进行查询：

在这个网站中，你可以输入任何要查询的网站地址，然后可以得到下面的信息：

![](https://img-blog.csdnimg.cn/dd1db9a21f3845178d17bcb55bfc70de.png)

可以看到这个网站是开启了OCSP stapling的。

# 总结

OCSP和OCSP stapling是非常有用的证书撤销校验协议，已经被广泛的使用。大家可以检查一下自己的网站有没有用到哦。



















