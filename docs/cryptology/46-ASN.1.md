---
slug: /ASN.1
---

# 48. 密码学系列之:ASN.1接口描述语言详解



# 简介

ASN.1是一种跨平台的数据序列化的接口描述语言。可能很多人没有听说过ASN.1, 但是相信有过跨平台编程经验的同学可能都听过protocol buffers和Apache Thrift,虽然ASN.1和上面两个语言相比不是那么出名，但是ASN.1的出现要比他们早的多,早在1984年ASN.1就出现了。

和他们相比ASN.1并没有提供单一的开源实现，而是作为一种规范来供第三方供应商实现的。ASN.1主要用在定义各种基础协议中，比如常用的LDAP,PKCS,GSM,X.500等。

ASN.1是一种和平台、语言无关的描述语言，可以使用很多ASN.1的翻译工具，将ASN.1翻译成为C, C++, Java等代码。

# ASN.1的例子

既然ASN.1是一个描述语言，那么我们先来看一个直观的例子。ASN.1的基础是module, 我们看一下ASN.1中module的例子：

```
StudentCards DEFINITIONS AUTOMATIC TAGS ::= BEGIN

StudentCard ::= SEQUENCE {
dateOfBirthday DATE,
student    StudentInfo
}

StudentInfo ::= SEQUENCE {
studentName    VisibleString (SIZE (3..50)),
homeAddress Address,
contactPhone   NumericString (SIZE (7..12))
}

Address::= SEQUENCE {
street  VisibleString (SIZE (5 .. 50)) OPTIONAL,
city    VisibleString (SIZE (2..30)),
state   VisibleString (SIZE(2) ^ FROM ("A".."Z")),
zipCode NumericString (SIZE(5 | 9))
}

END
```

上面的例子中，我们使用ASN.1定义了一个StudentCard，最外层的以BEGIN和END包围的就是module。StudentCards是module的名字，首字母必须大写。

其中`::= `是一个赋值符号。

module中可以有多个type, type的名字也必须首字母大写，例如上面的StudentCard，StudentInfo等等。

每个type中定义了它的组成组件，组件的名字首字母必须小写，这些组件的名字又叫做identifiers。

上面的dateOfBirthday后面接的DATE是ASN.1中内置的类型。而student后面的StudentInfo是一个自定义类型，并且同样包含在module中。

StudentInfo中的studentName是一个VisibleString，这个String的限制是size在3到50之间。

上面我们定义module的时候在module后面加上了`AUTOMATIC TAGS`，这是什么意思呢？

在ASN.1中，tags是ASN.1消息中每个组件的内部标识符，以Address为例，我们希望给Address中的每个属性都指定一个内部的标识符，如下所示：

```
Address::= SEQUENCE {
street  [0] VisibleString (SIZE (5 .. 50)) OPTIONAL,
city    [1] VisibleString (SIZE (2..30)),
state   [2] VisibleString (SIZE(2) ^ FROM ("A".."Z")),
zipCode [3] NumericString (SIZE(5 | 9))
}
```

这里面的`[0] [1]` 就是标识符，当然，我们可以在定义module的时候手动指定这些tags，但是如果我们使用`AUTOMATIC TAGS`，这些标识符会自动创建,从而避免了手动创建标识符可能带来的问题。

# ASN.1中的内置类型

通过上面的讲解，我们对ASN.1有了一个基本的概念。如果想要对ASN.1进行更加深入的研究，那么我们首先要知道ASN.1中的内置类型。

一般来说ASN.1中有下面的数据类型：

* BOOLEAN

BOOLEAN和编程语言中的布尔值是一致的，它有两个可能得值：TRUE和FALSE。下面是具体而用法：

```
removed BOOLEAN ::= TRUE
```

* INTEGER

INTEGER表示的是一个整数，如下所示,表示的是一个年例范围是0到100，最终的取值是18：

```
age INTEGER (0..100) ::= 18
```

* BIT STRING

字节的位表示方法，可以给一个byte中的每一个bit进行设值：

```
Status ::= BIT STRING {
married(0),
handsome(1),
kind(2)
}
myStatus Status ::= {handsome, kind}
```

上面的例子中，我们设置了Status，并且使用Status赋值给了一个变量myStatus。

* OCTET STRING

8进制表示的字符串：

```
octetExample ::= OCTET STRING
```

* DATE

表示日期，格式是"YYYY-MM-DD"：

```
birthday DATE ::= "1990-11-18"
```

* TIME-OF-DAY

表示日期中的时间,格式是"HH:MM:SS"：

```
startTime TIME-OF-DAY ::= "09:30:00"
```

* DATE-TIME

时间加日期的格式，它的格式"YYYY-MM-DDTHH:MM:SS"，如下所示：

```
endTime DATE-TIME ::= "2022-01-10T18:30:23"
```

* REAL

REAL表示的是一个浮点数，可以如下表示：

```
Amount ::= REAL
```

* ENUMERATED

ENUMERATED表示的是一个枚举，可以如下表示：

```
Colors ::= ENUMERATED {black, red, white}
myColor Colors ::= white
```

* SEQUENCE

SEQUENCE表示的是项目的序列合集,如下所示：

```
StudentInfo ::= SEQUENCE {
name VisibleString,
phone NumericString
}
max StudentInfo ::= {name "J.Max", phone "18888888888"}
```

* SEQUENCE OF

SEQUENCE OF表示的是一个list:

```
breakTimes SEQUENCE OF TIME-OF-DAY ::= {"10:00:00", "12:00:00", "14:45:00"}
```

* CHOICE

CHOICE表示从众多的item中选择一个：

```
Identity ::= CHOICE {
name VisibleString,
phone VisibleString,
idCard VisibleString
}
jack Identity ::= name: "jack"
```

* IA5String

IA5String表示的是ASCII字符，并且包含有控制字符。

```
SampleString ::= IA5String
```

* VisibleString

VisibleString表示的是ASCII字符，其中不包含有控制字符。

```
SampleString ::= VisibleString
```

* NumericString

NumericString表示的是数字和空格。

```
SomeNumber ::= NumericString
```

* UTF8String

UTF8String表示的是Unicode字符

```	
UnicodeString ::= UTF8String
```

* NULL

是一个空值，用来占位。

# ASN.1中的限制语法 

ASN.1中可以定义很多个字段，有些字段可能会有一些限制，比如手机号只能用数字，名字有长度限制等。

这些限制在ASN.1中叫做Constraints,一般来说有下面的一些限制：

* FROM

FROM提供了一个数据值的读取范围，如下：

```
PermittedChars ::= IA5String (FROM("ABCDEFG1244"))
```

PermittedChars只允许从"ABCDEFG1244"选择。

* PATTERN

PATTERN表示的是正则表达式，如下所示：

```
phoneNumber ::= IA5String (PATTERN "1[0-9]#10")
```

上面列出的是一个简单的手机号码的正则表达式。

* SIZE

SIZE可以表示字符串的长度或者数组的长度：

```
       Name ::= IA5String (SIZE (4..7))
       NameList ::= SEQUENCE SIZE (1..25) OF Name
```

* RANGE

使用`..`可以表示一个范围：

```
Age ::= INTEGER (0..100)
```

* 单一值 

从提供的值列表中挑选一个：

```
Colors ::= UTF8String ("Blue" | "White")
```

# 总结

以上就是ASN.1数据结构描述语言的基本介绍了，有了这些基础，我们就可以很容易读懂使用ASN.1来描写的数据结构了。

















