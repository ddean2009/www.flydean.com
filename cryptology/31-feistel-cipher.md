密码学系列之:feistel cipher

# 简介

feistel cipher也叫做Luby–Rackoff分组密码，是用来构建分组加密算法的对称结构。它是由德籍密码学家Horst Feistel在IBM工作的时候发明的。feistel cipher也被称为Feistel网络。

很多分组加密算法都是在feistel cipher的基础上发展起来的，比如非常有名的DES算法。

在feistel cipher中，加密和解密的操作非常相似，通常需要进行多轮加密和解密操作。

# Feistel网络的原理

Feistel网络中会用到一个round function也叫做轮函数，这个函数接收两个输入参数，分别是分组数据（原始数据的一半）和子key，然后生成和分组数据同样长度的数据。

然后使用上一轮生成的数据和原始数据的另一半进行XOR异或操作，作为下一轮轮函数的输入。

就这样一轮一轮进行下去最后生成加密过后的数据。

解密的流程和加密的流程是类似的，只不过把加密的操作反过来。

Feistel网络的轮数可以任意增加。不论多少轮都可以正常解密。

解密与轮函数f无关，轮函数f也不需要有逆函数。轮函数可以设计得足够复制。

加密和解密可以使用完全相同的结构来实现。从上面我们讲到的可以看到，加密和解密其实是没有什么区别的。

# Feistel网络的例子

我们用一个图的方式来介绍一下Feistel的工作流程：

![](https://img-blog.csdnimg.cn/20201117172719193.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上图中F表示的就是round function也就是轮函数。

K<sub>0</sub>,K<sub>1</sub>,K<sub>2</sub>...,K<sub>n</sub>表示的是子key，分别作为各轮的输入。

原始数据被分成了左右两边相等的部分，(L<sub>0</sub>,R<sub>0</sub>)

每一轮都会进行下面的操作：

* L<sub>i+1</sub> = R<sub>i</sub>
  
* R<sub>i+1</sub> = L<sub>i</sub> XOR F(R<sub>i</sub>,K<sub>i</sub>)

最后的加密出的结果就是(R<sub>i+1</sub>,L<sub>i+1</sub>)

解密的过程是加密过程的逆序，每一轮解密都会进行下面的操作：

* R<sub>i</sub> = L<sub>i+1</sub>
  
* L<sub>i</sub> = R<sub>i+1</sub> XOR F(L<sub>i+1</sub>,K<sub>i</sub>)

最终得到我们的原始数据(R<sub>0</sub>,L<sub>0</sub>)

# Feistel网络的理论研究

Michael Luby 和 Charles Rackoff 证明了如果轮函数是使用K<sub>i</sub>为种子的密码安全的伪随机函数，那么经过三轮操作之后，生成的分组密码就已经是伪随机排列了。经过四轮操作可以生成“强”伪随机排列。

什么是伪随机数呢？

考虑一下如果在计算机中生成随机数，因为计算机中的数据是由0和1组成的，所有的数据都是确定的，要么是0要么是1，所以计算机程序并不能生成真正的随机数。

如果要让计算机来生成随机数，通常的做法就是将输入通过一定的算法函数进行计算，从而得到处理过后的数字。

如果这个算法函数是确定的，也就是说同样的输入可以得到同样的输出，那么这个数就不是随机产生的，这个数就被称为伪随机数。

伪随机数是用确定性的算法计算出来自[0,1]均匀分布的随机数序列。并不真正的随机，但具有类似于随机数的统计特征，如均匀性、独立性等。

因为Luby和Rackoff的研究非常重要，所以Feistel密码也称为Luby–Rackoff密码。

# Feistel网络的拓展

除了我们之前介绍过的DES之外，很多算法都用到了Feistel网络结构，比如Blowfish，Twofish等等。

因为Feistel网络的对称性质和简单的操作，使得通过硬件的方式来实现Feistel网络变得非常简单，所以Feistel网络的应用非常的广泛。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！






