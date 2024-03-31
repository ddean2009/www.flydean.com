---
slug: /Pbkdf2
---

# 41. 密码学系列之:1Password的加密基础PBKDF2



# 简介

1password是一个非常优秀的密码管理软件，有了它你可以轻松对你的密码进行管理，从而不用再考虑密码泄露的问题，据1password官方介绍，它的底层使用的是PBKDF2算法对密码进行加密。

那么PBKDF2是何方神圣呢？它有什么优点可以让1password得以青睐呢？一起来看看吧。

# PBKDF2和PBKDF1

PBKDF的全称是Password-Based Key Derivation Function，简单的说，PBKDF就是一个密码衍生的工具。既然有PBKDF2那么就肯定有PBKDF1，那么他们两个的区别是什么呢？

PBKDF2是PKCS系列的标准之一，具体来说他是PKCS#5的2.0版本，同样被作为RFC 2898发布。它是PBKDF1的替代品，为什么会替代PBKDF1呢？那是因为PBKDF1只能生成160bits长度的key，在计算机性能快速发展的今天，已经不能够满足我们的加密需要了。所以被PBKDF2替换了。

在2017年发布的RFC 8018（PKCS #5 v2.1）中，是建议是用PBKDF2作为密码hashing的标准。

PBKDF2和PBKDF1主要是用来防止密码暴力破解的，所以在设计中加入了对算力的自动调整，从而抵御暴力破解的可能性。

# PBKDF2的工作流程

PBKDF2实际上就是将伪散列函数PRF（pseudorandom function）应用到输入的密码、salt中，生成一个散列值，然后将这个散列值作为一个加密key，应用到后续的加密过程中，以此类推，将这个过程重复很多次，从而增加了密码破解的难度，这个过程也被称为是密码加强。

我们看一个标准的PBKDF2工作的流程图：

![](https://img-blog.csdnimg.cn/88e5f33cb69041ca92d8c50416e1aa91.png)

从图中可以看到，初始的密码跟salt经过PRF的操作生成了一个key，然后这个key作为下一次加密的输入和密码再次经过PRF操作，生成了后续的key，这样重复很多次，生成的key再做异或操作，生成了最终的T，然后把这些最终生成的T合并，生成最终的密码。

根据2000年的建议，一般来说这个遍历次数要达到1000次以上，才算是安全的。当然这个次数也会随着CPU计算能力的加强发生变化。这个次数可以根据安全性的要求自行调整。

有了遍历之后，为什么还需要加上salt呢？加上salt是为了防止对密码进行彩虹表攻击。也就是说攻击者不能预选计算好特定密码的hash值，因为不能提前预测，所以安全性得以提高。标准salt的长度推荐是64bits，美国国家标准与技术研究所推荐的salt长度是128 bits。 

# 详解PBKDF2的key生成流程

上面一小节，我们以一种通俗易懂的方式告诉大家，PBKDF2到底是怎么工作的。一般来说，了解到这一层也就够了，但是如果你想更加深入，了解PBKDF2的key生成的底层原理，那么还请关注这一小节。

我们上面介绍了PBKDF2是一个生成衍生key的函数，作为一个函数，那么就有输入和输出，我们先看下PBKDF2的定义：

```
DK = PBKDF2(PRF, Password, Salt, c, dkLen)

```

PBKDF2有5个函数，我们看下各个参数代表什么意思：

* PRF 是一个伪随机散列函数，我们可以根据需要对其进行替换，比如替换成为HMAC函数。
* Password 是主密码用来生成衍生key。
* Salt是一个bits序列，用来对密码加盐。
* c 是循环的次数。
* dkLen 是生成的key要求的bits长度。
* DK是最后生成的衍生key。

在上一节中，我们可以看到其实最后的衍生key是由好几部分组成的，上图中的每一个T都代表着衍生key的一部分，最后将这些T合并起来就得到了最终的衍生key，其公式如下：

```
DK = T1 + T2 + ⋯ + Tdklen/hlen
Ti = F(Password, Salt, c, i)
```

上面的F是c次遍历的异或链。其公式如下：

```
F(Password, Salt, c, i) = U1 ^ U2 ^ ⋯ ^ Uc
```

其中：

```
U1 = PRF(Password, Salt + INT_32_BE(i))
U2 = PRF(Password, U1)
⋮
Uc = PRF(Password, Uc−1)
```

# HMAC密码碰撞

如果PBKDF2的PRF使用的是HMAC的话，那么将会发送一些很有意思的问题。对于HMAC来说，如果密码的长度大于HMAC可以接受的范围，那么该密码会首先被做一次hash运算，然后hash过后的字符串会被作为HMAC的输入。

我们举个例子，如果用户输入的密码是：

```
    Password: plnlrtfpijpuhqylxbgqiiyipieyxvfsavzgxbbcfusqkozwpngsyejqlmjsytrmd
```

经过一次HMAC-SHA1运算之后，得到：

```
    SHA1 (hex): 65426b585154667542717027635463617226672a
```

将其转换成为字符串得到：

```
    SHA1 (ASCII): eBkXQTfuBqp'cTcar&g*
```

所以说，如果使用PBKDF2-HMAC-SHA1的加密方式的话，下面两个密码生成衍生key是一样的。

```
    "plnlrtfpijpuhqylxbgqiiyipieyxvfsavzgxbbcfusqkozwpngsyejqlmjsytrmd"
    "eBkXQTfuBqp'cTcar&g*"
```

# PBKDF2的缺点

虽然PBKDF2可以通过调节循环遍历的次数来提高密码破解的难度。但是可以为其研制特殊的处理器，只需要很少的RAM就可以对其进行破解。为此bcrypt 和 scrypt 等依赖于大量RAM的加密算法，这样就导致那些廉价的ASIC处理器无用武之地。

# 总结

以上就是PBKDF2的简单介绍，想要详细了解更多的朋友，可以参考我的其他关于密码学的文章。





