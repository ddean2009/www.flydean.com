密码学系列之:加密货币中的scrypt算法

[toc]

# 简介

为了抵御密码破解，科学家们想出了很多种方法，比如对密码进行混淆加盐操作，对密码进行模式变换和组合。但是这些算法逐渐被一些特制的ASIC处理器打败，这些ASIC处理器不做别的，就是专门来破解你的密码或者进行hash运算。

最有名的当然是比特币了，它使用的是为人诟病的POW算法，谁的算力高，谁就可以挖矿，这样就导致了大量无意义的矿机的产生，这些矿机什么都不能干，就算是用来算hash值。结果浪费了大量的电力。

普通人更是别想加入这个只有巨头才能拥有的赛道，如果你想用一个普通的PC机来挖矿，那么我估计你挖到矿的几率可能跟被陨石砸中差不多。

为了抵御这种CPU为主的密码加密方式，科学家们发明了很多其他的算法，比如需要占用大量内存的算法，因为内存不像CPU可以疯狂提速，所以限制了很多暴力破解的场景，今天要将的scrypt算法就是其中一种，该算法被应用到很多新的加密货币挖矿体系中，用以表示他们挖矿程序的公平性。

# scrypt算法

scrypt是一种密码衍生算法，它是由Colin Percival创建的。使用scrypt算法来生成衍生key，需要用到大量的内存。scrypt算法在2016年作为RFC 7914标准发布。

密码衍生算法主要作用就是根据初始化的主密码来生成系列的衍生密码。这种算法主要是为了抵御暴力破解的攻击。通过增加密码生成的复杂度，同时也增加了暴力破解的难度。

但是和上面提到的原因一样，之前的password-based KDF，比如PBKDF2虽然提高了密码生成的遍历次数，但是它使用了很少的内存空间。所以很容易被简单的ASIC机器破解。scrypt算法就是为了解决这样的问题出现的。

# scrypt算法详解

scrypt算法会生成非常大的伪随机数序列，这个随机数序列会被用在后续的key生成过程中，所以一般来说需要一个RAM来进行存储。这就是scrypt算法需要大内存的原因。

接下我们详细分析一下scrypt算法，标准的Scrypt算法需要输入8个参数，如下所示：

* Passphrase: 要被hash的输入密码
* Salt: 对密码保护的盐，防止彩虹表攻击
* CostFactor (N): CPU/memory cost 参数，必须是2的指数(比如: 1024)
* BlockSizeFactor (r):  blocksize 参数
* ParallelizationFactor (p): 并行参数 
* DesiredKeyLen (dkLen): 输出的衍生的key的长度
* hLen:  hash函数的输出长度
* MFlen: Mix函数的输出长度

这个函数的输出就是DerivedKey。

首先我们需要生成一个expensiveSalt。首先得到blockSize：

```
blockSize = 128*BlockSizeFactor 
```

然后使用PBKDF2生成p个blockSize，将这p个block组合成一个数组：

```
[B0...Bp−1] = PBKDF2HMAC-SHA256(Passphrase, Salt, 1, blockSize*ParallelizationFactor)
```

使用ROMix对得到的block进行混合：

```
   for i ← 0 to p-1 do
      Bi ← ROMix(Bi, CostFactor)
```

将B组合成新的expensiveSalt：

```
expensiveSalt ← B0∥B1∥B2∥ ... ∥Bp-1
```

接下来使用PBKDF2和新的salt生成最终的衍生key：

```
return PBKDF2HMAC-SHA256(Passphrase, expensiveSalt, 1, DesiredKeyLen);
```

下面是ROMix函数的伪代码：

```
Function ROMix(Block, Iterations)

   Create Iterations copies of X
   X ← Block
   for i ← 0 to Iterations−1 do
      Vi ← X
      X ← BlockMix(X)

   for i ← 0 to Iterations−1 do
      j ← Integerify(X) mod Iterations 
      X ← BlockMix(X xor Vj)

   return X
```

其中BlockMix的伪代码如下：

```
Function BlockMix(B):

    The block B is r 128-byte chunks (which is equivalent of 2r 64-byte chunks)
    r ← Length(B) / 128;

    Treat B as an array of 2r 64-byte chunks
    [B0...B2r-1] ← B

    X ← B2r−1
    for i ← 0 to 2r−1 do
        X ← Salsa20/8(X xor Bi)  // Salsa20/8 hashes from 64-bytes to 64-bytes
        Yi ← X

    return ← Y0∥Y2∥...∥Y2r−2 ∥ Y1∥Y3∥...∥Y2r−1
```

# scrypt的使用

Scrypt被用在很多新的POW的虚拟货币中，比如Tenebrix、 Litecoin 和 Dogecoin。感兴趣的朋友可以关注一下。



