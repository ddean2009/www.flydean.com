密码学系列之:twofish对称密钥分组算法

# 简介

之前的文章我们讲到blowfish算法因为每次加密的块比较小只有64bits，所以不建议使用blowfish加密超过4G的文件。同时因为加密块小还会导致生日攻击等。所以才有了blowfish的继承者twofish。

今天我们一起来揭秘一下twofish这个加密算法。

# twofish的起源

twofish和blowfish一样，也是一种对称加密算法。不同的是twofish的块大小是128bits，而它的密钥长度是256bits。

AES相信大家都很熟悉了，AES的全称是The Advanced Encryption Standard，它是由美国国家标准技术研究院（NIST）批准的标准的对称分组密码技术。

AES是从1997年到2000年公开选拔出来的。主要是为了替换DES而创建的。因为DES只有56位密钥，容易受到暴力攻击。

NIST在1997年1月2日宣布，他们希望选择DES的继任者，即AES。 与DES一样，它也应是“一种能够在二十世纪之前很好地保护政府敏感信息的，未公开的，公开的加密算法。” 但是，NIST并没有简单地发布一个继任者，而是进行公开的选拔，候选者需要提供相关的资料，证明其比DES优秀。 这种开放式征集立即引起了人们的浓厚兴趣。

在随后的几个月里面，NIST收到了来自多个国家的15个提案。他们是CAST-256，CRYPTON，DEAL，DFC，E2，FROG，HPC，LOKI97，MAGENTA，MARS，RC6，Rijndael，SAFER +，Serpent和Twofish。

在随后的评估中，密码学家对这些候选的算法进行了包括安全性，性能和有限环境运行等因素进行了评估，最终在1999年8月宣布了5个最终入围的算法：MARS ，RC6，Rijndael，Serpent和Twofish。

最终在2000年10月2日,NIST宣布选中Rijndael作为最终的AES算法。并于2001年11月26日作为正式的AES标准。

twofish虽然没有作为最后的AES标准，但是能够跻身5强，也是很厉害了。

# twofish的性能

在2000年的时候，对于大多数平台来说，twofish在128-bit keys的表现要比Rijndael 要慢，这也是为什么Rijndael会当选为AES标准的原因。但是在256-bit keys的表现要好于Rijndael 。

但是随着Rijndael 作为AES的标准，越来越多的硬件都基于AES做了优化，最后导致twofish和Rijndael 的差距越来越大。

> twofish和Blowfish一样也是免费的。

# twofish的原理

twofish是由blowfish演化来的。我们先看下twofish的工作图：

![](https://img-blog.csdnimg.cn/20201219153037716.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)    

twofish和DES一样，也是使用的Feistel structure。 

首先将128bits的明文分成4部分，然后分别和K<sub>0</sub>,K<sub>1</sub>,K<sub>2</sub>,K<sub>3</sub>进行异或操作，生成4个结果，我们称他们为A1，A2，A3，A4。

虚线括起来的部分是F函数。

A1，A2作为F的输入生成的结果和A3进行异或操作，然后右移一位，和A4左移一位的结果进行异或操作，然后交换左右部分的位置。

最后一轮的输出不进行交换直接与四个扩展密钥字进行异或而得到密文C。

我们再来看看F函数。

F是64位数据上与密钥相关的置换函数，它有三个参数，R1，R2两个输入，还有一个r表示的子项的轮数。

R1和R2先通过S-box的变换，然后乘以MDS矩阵，然后再进行PHT变换，最后和子密钥进行异或操作。









