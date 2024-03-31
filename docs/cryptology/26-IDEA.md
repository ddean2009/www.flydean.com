---
slug: /IDEA
---

# 26. 密码学系列之:IDEA



# 简介

IDEA的全称是International Data Encryption Algorithm，也叫做国际加密算法，注意，这里不是我们常用的那个开发工具IDEA。

今天给大家详细介绍一下IDEA。

# IDEA简介

IDEA中文叫做国际加密算法，最开始也被叫做Improved Proposed Encryption Standard (IPES)。它是一种对称密钥加密算法，最初是由James Massey 和 Xuejia Lai 在1991年提出的。

其目标是替代DES算法。IDEA是对早期的 PES 的一次修订。IDEA是OpenPGP标准的可选算法。

IDEA的专利在2012年已经过期了，现在是可以免费使用的。

# IDEA原理

IDEA加密块长度是64bits，密钥长度是128bits，是由八轮变换和半轮输出转换组合而成的。加密和解密的过程是类似的。我们看下IDEA的基本流程图：

![](https://img-blog.csdnimg.cn/20201219191449861.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上面图中， 蓝色圆圈是XOR异或操作，绿色框是加法模数216。红色的点是乘模216 + 1，如果输入都是0（0x0000）那么将会被转换为216，如果输入是216，那么会被转换为0（0x0000）。

八轮操作之后，就是下面的半轮输出转换了，输出转换如下所示（中间两个值的交换抵消了最后一轮结束时的交换，因此没有净交换）：

![](https://img-blog.csdnimg.cn/2020121919233867.png)

# IDEA子密钥的生成

IDEA使用的是 Lai–Massey结构。 每轮使用6个16位子密钥，最后的半轮使用4个子密钥，共8.5回合52个子密钥。

前面8个子密钥直接从密钥中提取，因为密钥的长度是128bits，刚好可以分成8个16bits的自密钥。其中第一轮的K1为密钥的16位。

通过在每8组之间将主密钥向左移动25位，从而创建更多的8组子密钥。


> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！




