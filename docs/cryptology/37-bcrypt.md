---
slug: /bcrypt
---

# 39. 密码学系列之:bcrypt加密算法详解



# 简介

今天要给大家介绍的一种加密算法叫做bcrypt, bcrypt是由Niels Provos和David Mazières设计的密码哈希函数，他是基于Blowfish密码而来的，并于1999年在USENIX上提出。

除了加盐来抵御rainbow table 攻击之外，bcrypt的一个非常重要的特征就是自适应性，可以保证加密的速度在一个特定的范围内，即使计算机的运算能力非常高，可以通过增加迭代次数的方式，使得加密速度变慢，从而可以抵御暴力搜索攻击。

bcrypt函数是OpenBSD和其他系统包括一些Linux发行版（如SUSE Linux）的默认密码哈希算法。

# bcrypt的工作原理

我们先回顾一下Blowfish的加密原理。 blowfish首先需要生成用于加密使用的K数组和S-box, blowfish在生成最终的K数组和S-box需要耗费一定的时间，每个新的密钥都需要进行大概4 KB文本的预处理，和其他分组密码算法相比，这个会很慢。但是一旦生成完毕，或者说密钥不变的情况下，blowfish还是很快速的一种分组加密方法。

那么慢有没有好处呢？

当然有，因为对于一个正常应用来说，是不会经常更换密钥的。所以预处理只会生成一次。在后面使用的时候就会很快了。

而对于恶意攻击者来说，每次尝试新的密钥都需要进行漫长的预处理，所以对攻击者来说要破解blowfish算法是非常不划算的。所以blowfish是可以抵御字典攻击的。

Provos和Mazières利用了这一点，并将其进一步发展。他们为Blowfish开发了一种新的密钥设置算法，将由此产生的密码称为 "Eksblowfish"（"expensive key schedule Blowfish"）。这是对Blowfish的改进算法，在bcrypt的初始密钥设置中，salt 和 password 都被用来设置子密钥。然后经过一轮轮的标准Blowfish算法，通过交替使用salt 和 password作为key，每一轮都依赖上一轮子密钥的状态。虽然从理论上来说，bcrypt算法的强度并不比blowfish更好，但是因为在bcrpyt中重置key的轮数是可以配置的，所以可以通过增加轮数来更好的抵御暴力攻击。

# bcrypt算法实现

简单点说bcrypt算法就是对字符串*OrpheanBeholderScryDoubt* 进行64次blowfish加密得到的结果。有朋友会问了，bcrypt不是用来对密码进行加密的吗？怎么加密的是一个字符串？

别急，bcrpyt是将密码作为对该字符串加密的因子，同样也得到了加密的效果。我们看下bcrypt的基本算法实现：

```
Function bcrypt
   Input:
      cost:     Number (4..31)                      log2(Iterations). e.g. 12 ==> 212 = 4,096 iterations
      salt:     array of Bytes (16 bytes)           random salt
      password: array of Bytes (1..72 bytes)        UTF-8 encoded password
   Output: 
      hash:     array of Bytes (24 bytes)

   //Initialize Blowfish state with expensive key setup algorithm
   //P: array of 18 subkeys (UInt32[18])
   //S: Four substitution boxes (S-boxes), S0...S3. Each S-box is 1,024 bytes (UInt32[256])
   P, S <- EksBlowfishSetup(cost, salt, password)   

   //Repeatedly encrypt the text "OrpheanBeholderScryDoubt" 64 times
   ctext <- "OrpheanBeholderScryDoubt"  //24 bytes ==> three 64-bit blocks
   repeat (64)
      ctext <-  EncryptECB(P, S, ctext) //encrypt using standard Blowfish in ECB mode

   //24-byte ctext is resulting password hash
   return Concatenate(cost, salt, ctext)
```

上述函数bcrypt 有3个输入和1个输出。

在输入部分，cost 表示的是轮循的次数，这个我们可以自己指定，轮循次数多加密就慢。

salt 是加密用盐，用来混淆密码使用。

password 就是我们要加密的密码了。

最后的输出是加密后的结果hash。

有了3个输入，我们会调用EksBlowfishSetup函数去初始化18个subkeys和4个1K大小的S-boxes，从而达到最终的P和S。

然后使用P和S对"OrpheanBeholderScryDoubt" 进行64次blowfish运算，最终得到结果。

接下来看下 EksBlowfishSetup方法的算法实现：

```
Function EksBlowfishSetup
   Input:
      password: array of Bytes (1..72 bytes)   UTF-8 encoded password
      salt:     array of Bytes (16 bytes)      random salt
      cost:     Number (4..31)                 log2(Iterations). e.g. 12 ==> 212 = 4,096 iterations
   Output: 
      P:        array of UInt32                array of 18 per-round subkeys
      S1..S4:   array of UInt32                array of four SBoxes; each SBox is 256 UInt32 (i.e. 1024 KB)

   //Initialize P (Subkeys), and S (Substitution boxes) with the hex digits of pi 
   P, S  <- InitialState() 
 
   //Permutate P and S based on the password and salt     
   P, S  <- ExpandKey(P, S, salt, password)

   //This is the "Expensive" part of the "Expensive Key Setup".
   //Otherwise the key setup is identical to Blowfish.
   repeat (2cost)
      P, S  <-  ExpandKey(P, S, 0, password)
      P, S  <- ExpandKey(P, S, 0, salt)

   return P, S
```

代码很简单，EksBlowfishSetup 接收上面我们的3个参数，返回最终的包含18个子key的P和4个1k大小的Sbox。

首先初始化，得到最初的P和S。

然后调用ExpandKey，传入salt和password，生成第一轮的P和S。

然后循环2的cost方次，轮流使用password和salt作为参数去生成P和S，最后返回。

最后看一下ExpandKey的实现：

```
Function ExpandKey
   Input:
      password: array of Bytes (1..72 bytes)  UTF-8 encoded password
      salt:     Byte[16]                      random salt
      P:        array of UInt32               Array of 18 subkeys
      S1..S4:   UInt32[1024]                  Four 1 KB SBoxes
   Output: 
      P:        array of UInt32               Array of 18 per-round subkeys
      S1..S4:   UInt32[1024]                  Four 1 KB SBoxes       
 
   //Mix password into the P subkeys array
   for n   <- 1 to 18 do
      Pn   <-  Pn xor password[32(n-1)..32n-1] //treat the password as cyclic
 
   //Treat the 128-bit salt as two 64-bit halves (the Blowfish block size).
   saltHalf[0]   <-  salt[0..63]  //Lower 64-bits of salt
   saltHalf[1]   <-  salt[64..127]  //Upper 64-bits of salt

   //Initialize an 8-byte (64-bit) buffer with all zeros.
   block   <-  0

   //Mix internal state into P-boxes   
   for n   <-  1 to 9 do
      //xor 64-bit block with a 64-bit salt half
      block   <-  block xor saltHalf[(n-1) mod 2] //each iteration alternating between saltHalf[0], and saltHalf[1]

      //encrypt block using current key schedule
      block   <-  Encrypt(P, S, block) 
      P2n   <-  block[0..31]      //lower 32-bits of block
      P2n+1   <- block[32..63]  //upper 32-bits block

   //Mix encrypted state into the internal S-boxes of state
   for i   <- 1 to 4 do
      for n   <- 0 to 127 do
         block   <- Encrypt(state, block xor salt[64(n-1)..64n-1]) //as above
         Si[2n]     <- block[0..31]  //lower 32-bits
         Si[2n+1]   <-  block[32..63]  //upper 32-bits
    return state
```

ExpandKey主要用来生成P和S，算法的生成比较复杂，大家感兴趣的可以详细研究一下。

# bcrypt hash的结构

我们可以使用bcrypt来加密密码，最终以bcrypt hash的形式保存到系统中，一个bcrypt hash的格式如下：

```
$2b$[cost]$[22 character salt][31 character hash]
```

比如：

```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
\__/\/ \____________________/\_____________________________/
 Alg Cost      Salt                        Hash
```

上面例子中，`$2a$` 表示的hash算法的唯一标志。这里表示的是bcrypt算法。

10 表示的是代价因子，这里是2的10次方，也就是1024轮。

N9qo8uLOickgx2ZMRZoMye 是16个字节（128bits）的salt经过base64编码得到的22长度的字符。

最后的IjZAgcfl7p92ldGxad68LJZdL17lhWy是24个字节（192bits）的hash，经过bash64的编码得到的31长度的字符。

## hash的历史

这种hash格式是遵循的是OpenBSD密码文件中存储密码时使用的Modular Crypt Format格式。最开始的时候格式定义是下面的：

- `$1$`: MD5-based crypt ('md5crypt')
- `$2$`: Blowfish-based crypt ('bcrypt')
- `$sha1$`: SHA-1-based crypt ('sha1crypt')
- `$5$`: SHA-256-based crypt ('sha256crypt')
- `$6$`: SHA-512-based crypt ('sha512crypt')

但是最初的规范没有定义如何处理非ASCII字符，也没有定义如何处理null终止符。修订后的规范规定，在hash字符串时：

* String 必须是UTF-8编码
* 必须包含null终止符

因为包含了这些改动，所以bcrypt的版本号被修改成了 `$2a$`。

但是在2011年6月，因为PHP对bcypt的实现 **crypt_blowfish** 中的一个bug，他们建议系统管理员更新他们现有的密码数据库，用`$2x$`代替`$2a$`，以表明这些哈希值是坏的（需要使用旧的算法）。他们还建议让crypt_blowfish对新算法生成的哈希值使用头`$2y$`。 当然这个改动只限于PHP的**crypt_blowfish**。

然后在2014年2月，在OpenBSD的bcrypt实现中也发现了一个bug，他们将字符串的长度存储在无符号char中（即8位Byte）。如果密码的长度超过255个字符，就会溢出来。

因为bcrypt是为OpenBSD创建的。所以当他们的库中出现了一个bug时, 他们决定将版本号升级到`$2b$`。

