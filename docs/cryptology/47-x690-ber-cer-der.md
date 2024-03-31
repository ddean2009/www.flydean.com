---
slug: /x690-ber-cer-der
---

# 49. 密码学系列之:X.690和对应的BER CER DER编码



# 简介

之前我们讲到了优秀的数据描述语言ASN.1,很多协议标准都是使用ASN.1来进行描述的。对于ASN.1来说，只定义了数据的描述是不够的，它还规定了消息是如何被编码的，从而可以在不同的机器中进行通讯。

ASN.1支持一系列的编码规则，比如BER，DER,CER等。而X.690就是一个ITU-T的标准,它里面包含了一些对ASN.1进行编码的规则。

有人要问了，那么什么是ITU-T呢？

ITU-T的全称是International Telecommunication Union Telecommunication Standardization Sector,也就是国际电联电信标准化部门，主要用来协调电信和信息通信技术标准。

X.690主要包含了Basic Encoding Rules (BER),Canonical Encoding Rules (CER)和Distinguished Encoding Rules (DER)这三种编码规则。

接下来，我们来看下这些编码规则的实现细节。

# BER编码

BER的全称是Basic Encoding Rules,它是最早的编码规则，使用Tag-Length-Value(TLV)的格式对所有信息进行编码。

在BER中，每个数据元素都被编码为类型标识符、长度描述、实际数据元素，以及可选的内容结束标记，如下所示：

类型标识符|长度|实际数据|内容结束标记
---|---|---|---|---
Type|Length|Value|只用在不确定长度的情况

所有的编码都是以字节为单位的。

## 类型标识符

ASN.1的类型有下面几种，下表列出了ASN.1中类型和对应的十进制的关系：

type名称|基础类型还是组合类型|Number(十进制)
---|---|---
End-of-Content (EOC)|基础类型|0
BOOLEAN|基础类型|1
INTEGER|基础类型|2
BIT STRING|两者皆可|3
OCTET STRING|两者皆可|4
NULL|基础类型|5
OBJECT IDENTIFIER|基础类型|6
Object Descriptor|两者皆可|7
EXTERNAL|组合类型|8
REAL (float)|基础类型|9
ENUMERATED|基础类型|10
EMBEDDED PDV|组合类型|11
UTF8String|两者皆可|12
RELATIVE-OID|基础类型|13
TIME|基础类型|14
Reserved||15
SEQUENCE and SEQUENCE OF|组合类型|16
SET and SET OF|组合类型|17
NumericString|两者皆可|18
PrintableString|两者皆可|19
T61String|两者皆可|20
VideotexString|两者皆可|21
IA5String|两者皆可|22
UTCTime|两者皆可|23
GeneralizedTime|两者皆可|24
GraphicString|两者皆可|25
VisibleString|两者皆可|26
GeneralString|两者皆可|27
UniversalString|两者皆可|28
CHARACTER STRING|组合类型|29
BMPString|组合类型|30
DATE|基础类型|31
TIME-OF-DAY|基础类型|32
DATE-TIME|基础类型|33
DURATION|基础类型|34
OID-IRI|基础类型|35
RELATIVE-OID-IRI|基础类型|36

以上就是ASN.1中的类型和对应的值。接下来我们看下这些类型是怎么进行编码的。

ASN.1都是以字节为单位的，一个字节是8bits，其中7-8bits表示的是Tag class。2个bits可以表示4种class，如下：

class|value|描述
--|--|--
Universal|0|ASN.1的native类型
Application|1|该类型仅对一种特定应用程序有效
Context-specific|2|这种类型依赖于context
Private|3|

6bit表示的是这个类型是简单类型还是组合类型，简单类型用0，组合类型用1。

还剩下5个bits，可以表示32个不同的值，但是对于ASN.1来说，它的类型是超出32范围的，所以这5个bits只用来表示0-30的值的范围。如下所示：

![](https://img-blog.csdnimg.cn/a2a838e754f14cc5ad60598ac0048ba3.png)

如果想要表示超出30范围的值，那么可以使用两个byte，如下：

![](https://img-blog.csdnimg.cn/67f5fb05e69e44bda62831549d5d7258.png)

前面一个byte的1-5bits全部用1表示，后面一个byte的第8bit用1表示，剩下的7个bits用来表示真实的值。

## 长度

type编码之后就是length编码，length编码有两种格式，一种是确定长度的length，一种是不确定长度的length。

如果数据的长度是可预见的，那么我们就可以使用确定长度的编码形式，如果长度是不确定的，那么就可以使用不确定长度的编码形式。

我们看下不同类型的长度编码形式：

![](https://img-blog.csdnimg.cn/8ed5e689209f48a899ed82c9c87200ec.png)

首先，如果是确定长度，并且长度比较短的情况下，那么在8bit位设置为0,剩下的7个bits可以表示0-127范围的长度情况。

如果长度超过了127，那么可以在8bit设置为1，并且剩下的7个bits表示的是后面存储长度的byte个数,byte个数的范围是(1-126)。

如果是非固定长度，那么在8bit位设置为1,剩下的7bits设置为0。

所有bits都设置为1的是保留值。

在非固定长度的情况下，如果内容结束之后，需要额外附加一个byte表示的End-of-Contents，用来表示非固定长度编码已经结束了。

## 内容

Contents是跟在长度后面的byte字段，Contents的长度可以为0，表示没有Contents内容。

总体来看BER编码，通过类型+长度+具体的内容字段来组成的。

# CER编码和DER编码

CER的全称是Canonical Encoding Rules, DER的全称是Distinguished Encoding Rules,这两个编码都是从BER衍生过来的,他们都是BER的变体。

为什么会有这两个变体呢？首先考虑一下BER的定义，BER是Basic Encoding Rules,它是一个非常基础的编码规则，在很多情况下并没有提供具体的编码实现规则，所以需要具体的实现者自行对基础协议进行扩展。

那么对应的，如果一个实现者声明自己是支持BER编码协议的，那么就意味着这个实现者需要支持所有BER可能的变体编码规则。

BER为我们提供了一个基础标准，它的可扩展性很强，虽然我们在架构或者系统应用中经常提到可扩展性，但是在某些情况下，可变性和可扩展性并不是我们所希望的。比如在密码学中，我们希望编码规则的是固定的。这样的情况就需要用到CER和DER编码。

CER和DER编码都是BER的扩展，他们和BER相比，只规定了一种具体的编码规则，所以他们的确定性更强。

CER和DER相比，CER使用的是不确定长度的格式，而DER使用的是确定长度的格式。这就是说DER中始终包含了前导的长度信息，而CER则是是用一个字节的内容结束符来表示编码的结束。

另外，在DER中，Bit string, octet string 和受限的字符串必须使用基础类型,不能使用组合类型。

DER被广泛使用在数字证书中，比如X.509。

# 总结

以上就是X.690和对应的BER CER DER编码详解，看完本篇文章，你又多会了一门语言，oh yeah！














