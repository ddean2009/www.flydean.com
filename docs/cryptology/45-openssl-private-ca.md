密码学系列之:使用openssl创建私有CA

[toc]

# 简介

一般情况下我们使用的证书都是由第三方权威机构来颁发的，如果我们有一个新的https网站，我们需要申请一个世界范围内都获得认可的证书，这样我们的网站才能被无障碍的访问。

如果在某些情况下，我们的网站或者系统并不是公开的，但是也需要使用tls协议的话，那么就需要自己搭建一个CA服务器。这样的CA服务器就叫做private CA。

熟悉证书的朋友可能会说了，为什么不使用自签名证书呢?也可以达到安全通信的目的。

这是因为自签名证书的作用比较有限，它没有CRL和OCSP的能力，并且使用起来也不是很方便。所以我们需要一整套有效的CA签发体系，这也是我们需要搭建private CA的目的。

# 搭建root CA

在搭建root CA之前我们需要创建几个合适的目录来保存CA的相关信息，比如我们需要一个保存证书的目录certs，一个保存密钥的地方keys，一个CA数据库db。

其中db需要一个index文件,serial文件和crlnumber文件。

我们用下面的命令创建对应的文件和目录：

```
mkdir certs db keys
touch db/index
openssl rand -hex 16  > db/serial
echo 1001 > db/crlnumber
```

目录建好之后，我们还需要一个非常重要的root ca配置文件。后续可以根据这个配置文件来创建CA相关的信息。

一般情况下CA配置文件是不需要的，只有我们需要创建比较复杂CA的情况下才需要使用ca配置文件。

下面是一个CA配置文件的例子：

```
[default]
name                    = root-ca
domain_suffix           = flydean.com
default_ca              = ca_config
name_opt                = utf8,esc_ctrl,multiline,lname,align

[ca_config]
database                = db/index
serial                  = db/serial
crlnumber               = db/crlnumber
certificate             = root-ca.crt
private_key             = keys/root-ca.key
RANDFILE                = keys/random
new_certs_dir           = certs
unique_subject          = no
copy_extensions         = none
default_days            = 365
default_crl_days        = 100
default_md              = sha256
policy                  = ca_policy

[ca_policy]
countryName             = match
stateOrProvinceName     = optional
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[req]
default_bits            = 4096
encrypt_key             = yes
default_md              = sha256
utf8                    = yes
string_mask             = utf8only
prompt                  = no
distinguished_name      = ca_dist
req_extensions          = ca_req_ext

[ca_dist]
countryName             = "CN"
organizationName        = "flydean"
commonName              = "Root CA"

[ca_req_ext]
basicConstraints        = critical,CA:true
keyUsage                = critical,keyCertSign,cRLSign
subjectKeyIdentifier    = hash

[sub_ca_ext]
authorityInfoAccess     = @issuer_info
authorityKeyIdentifier  = keyid:always
basicConstraints        = critical,CA:true,pathlen:0
crlDistributionPoints   = @crl_info
extendedKeyUsage        = clientAuth,serverAuth
keyUsage                = critical,keyCertSign,cRLSign
subjectKeyIdentifier    = hash

[crl_info]
URI.0                   = http://crl3.digicert.com/DigiCertTLSRSASHA2562020CA1-4.crl

[issuer_info]
caIssuers;URI.0         = http://cacerts.digicert.com/DigiCertTLSRSASHA2562020CA1-1.crt
OCSP;URI.0              = http://ocsp.digicert.com

[ocsp_ext]
authorityKeyIdentifier  = keyid:always
basicConstraints        = critical,CA:false
extendedKeyUsage        = OCSPSigning
noCheck                 = yes
keyUsage                = critical,digitalSignature
subjectKeyIdentifier    = hash
```

# 生成root CA

有了上面的配置文件和目录信息，就可以生成root CA了。

首先我们需要创建私钥和root ca的csr文件如下：

```
openssl req -new -config root-ca.conf  -out root-ca.csr  -keyout keys/root-ca.key
```

接下来我们创建一个自签名的证书，这里我们需要用到配置文件中的ca_req_ext部分：

```
 openssl ca -selfsign  -config root-ca.conf  -in root-ca.csr   -out root-ca.crt -extensions ca_req_ext
```

运行该命令之后，我们会在certs文件夹中创建一个自签名证书文件。

除此之外，还向db中的index文件中写入了下面的内容：

```
V	230501041451Z		4445DE5C0285EAEF2E58757D5CB1E949	unknown	/C=CN/O=flydean/CN=Root CA
```

这是一个文本文件，里面保存的是生成的证书索引,证书中的字段是通过tab来进行分割的。

第一个字段V表示valid也就是有效的意思，这个字段还可以有其他几个值，比如R表示revoked,E表示expired。

第二个字段是过期时间，格式是YYMMDDHHMMSSZ。

第三个字段是Revocation日期，如果空表示没有revoked。

第四个字段是序列号，也就是生成的CA名字。

第五个字段是文件的位置，unknown表示未知。

最后一个字段是这个证书的名字,用于和其他的证书做区分。

# 使用CRL

有了root-ca.conf之后，我们可以使用它来创建CRL：

```
openssl ca -gencrl  -config root-ca.conf  -out root-ca.crl
```

现在生成的root-ca.crl文件还没有任何证书信息。

如果我们想要撤销某个颁发的CA，可以使用下面的命令：

```
openssl ca  -config root-ca.conf  -revoke certs/torevoke.pem -crl_reason unspecified
```

在revoke中指定要revoke的证书即可。

这里要注意的是我们需要指定crl_reason，crl_reason可以是下面几个值：

```
unspecified
keyCompromise
CACompromise
affiliationChanged
superseded
cessationOfOperation
certificateHold
removeFromCRL
```

# 使用OSCP

对于OSCP来说，需要一个OCSP responder来响应OCSP的请求。这个OCSP responder和CA本身并不是同一个，需要单独创建。

首先，我们创建OCSP responder的key和证书请求CSR：

```
openssl req -new  -newkey rsa:2048  -keyout keys/root-ocsp.key -out root-ocsp.csr
```

当然输入必须的参数之后，key和CSR就可以生成了。

接下来我可以使用root CA和root-ocsp.csr颁发OCSP证书，这里我们需要用到配置文件中的ocsp_ext部分。

```
openssl ca  -config root-ca.conf  -in root-ocsp.csr  -out root-ocsp.crt -extensions ocsp_ext  -days 10
```

上面的命令为OCSP responder生成了一个有效期为10天的证书。

有了证书，我们可以方便的搭建一个本地的OCSP responder如下所示：

```
openssl ocsp  -port 9000 -index db/index  -rsigner root-ocsp.crt -rkey keys/root-ocsp.key  -CA root-ca.crt  -text
Enter pass phrase for keys/root-ocsp.key:
Waiting for OCSP client connections...
```

这样我们就启动了一个OCSP服务器端。

另开一个窗口，执行下面的命令来请求OCSP：

```
 openssl ocsp -issuer root-ca.crt  -CAfile root-ca.crt  -cert root-ocsp.crt   -url http://127.0.0.1:9000
```

可以得到下面的结果：

```
Response verify OK
root-ocsp.crt: good
	This Update: May  1 08:09:31 2022 GMT
```

这就说明OCSP responder搭建成功了。

这里启动的是一个本地服务，在正式环境中可以考虑将其迁移到单独的服务器中。

# 总结

使用上面的命令，我们搭建了一个私有的CA服务，和对应的OCSP，openssl非常强大，基本上你可以用他来做任何事情。







