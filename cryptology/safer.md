密码学系列之:SAFER

# 简介

分组密码是一个非常优秀的加密结构，很多常用加的加密算法使用的都是分组算法，比如DES。SAFER表示的也是一种分组密码算法。一起来看看吧。

# SAFER简介

SAFER的全称是Secure And Fast Encryption Routine，在密码学中，SAFER主要是由James Massey（IDEA的设计师之一）代表Cylink公司设计的一组分组密码。 

SAFER主要有四种类型分别是：SAFER K， SAFER SK ，SAFER+ 和SAFER++ 。

其中SAFER K 和 SAFER SK 是比较早期的设计，共享相同的加密函数，但是轮次和密钥调度是不一样的。

后面的SAFER+ 和SAFER++ 是作为AES算法的候选算法提交给NESSIE的。 SAFER系列中的所有算法都没有专利限制，可以免费使用。

# SAFER K 和 SAFER SK

第一个SAFER密码是由Massey在1993年发布的SAFER K-64，具有64位块大小。 “K-64”表示64位的密钥大小。

因为64位的块太小了，不适合加密大的数据，所以第二年，Massey发布了支持128位的变体，叫做：SAFER K-128。

但是，Lars Knudsen和Sean Murphy发现这个版本存在一些问题，于是将密钥调度按照Knudsen的建议从新设计。这些变种算法分别被命名为SAFER SK-64和SAFER SK-128。

其中 “SK”代表"Strengthened Key schedule"也就是强化过的时间调度。

除此之外，还有一种40位块大小的变种算法SAFER SK-40。

我们使用一个图来看下SAFER K算法的基本流程：

![](https://img-blog.csdnimg.cn/20201219165843111.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

从最上面开始，是明文的输入阶段，每个明文都被分成8块。

接着就是密钥混合阶段，在这个阶段，明文分别和子密钥进行加法模256或者XOR运算。

然后是替换阶段，将上一阶段生成的结果通过两个相反的S盒映射成为新的数据。

这两个S盒分别是由45<sup>x</sup>和log<sub>45</sub>这两个函数派生出来的。有想了解S盒的朋友可以参考 “密码学系列之:blowfish对称密钥分组算法” 一文。

然后是第二次的密钥混合阶段。

在第二次密钥混合阶段之后，会使用pseudo-Hadamard transform (PHT)来进行扩散。

这四个阶段组成了一轮加密。

# SAFER+ 和 SAFER++

SAFER+ 和 SAFER++ 是对原有的SAFER加密算法的改进。他们是由亚美尼亚密码学家Gurgen Khachatrian（亚美尼亚大学）和Melsik Kuregian与Massey共同设计的。

SAFER + 是在1998年提出的，但是是以AES的候选算法提交的，它的块大小是128位。蓝牙的密钥是基于SAFER +的自定义算法来实现的（称为E21和E22），

SAFER ++ 是在2000年通过两个版本提交给NESSIE项目的，一个版本是64位，另一个版本是128位。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！