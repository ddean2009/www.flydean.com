---
slug: /Sponge-function
---

# 38. 密码学系列之:海绵函数sponge function



# 简介

海绵函数sponge function是密码学中使用的一种函数，它接收一定长度的输入，然后输出一定长度的输出，中间包含了有限个内部状态。

因为海绵函数的强大功能，所以可以用来建模和实现许多密码原语，包括密码散列，消息身份验证码，生成掩码，流密码，伪随机数生成器等。

本文将会讲解海绵函数的结构。

# 海绵函数的结构

我们先看一个海绵函数的结构图：

![](https://img-blog.csdnimg.cn/20210403151159502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这个函数被分成了两部分，左边部分叫做吸收部分，右边部分叫做输出部分，一吸一出，像是海绵一样，所以叫做海绵函数。

P表示的是输入的字符串，Z表示的时候输出字符串。

一个海绵函数由三部分组成，分别是state, 函数f和填充函数pad。

state就是上图的r+c部分，r被称为*Bitrate*， c被称为*Capacity*。

P被分成n份，每一份都会跟Bitrate进行异或操作，如果P的长度不是Bitrate的整数倍，那么需要使用Pad函数进行填充。

每一轮，Bitrate跟P进行异或操作的结果作为最新的Bitrate, 然后生成新的state，然后这个state又被f(state)来替换。

其中函数 f 是 从n个{0,1} 到n个{0,1}的映射。

就这样一轮一轮进行下去，直到所有的P都参与了运算。

输出部分是将最终生成的state进行f运算，每次运算都取Bitrate部分作为输出，从而得到最终的输出。

# 海绵函数的应用

因为海绵函数的优秀的特性，所以被用在很多方面。比如SHA-3的实现算法Keccak就是使用的海绵函数。

通过替换f和多轮置换，海绵函数可以生成非常安全的密码算法，所以得到了广泛的使用。



*>* *本文已收录于* *[*www.flydean.com*]**(*www.flydean.com*)*

*>* *最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！*

*>* *欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！*

