---
slug: /Diffie-Hellman-key-exchange
---

# 19. 更加安全的密钥生成方法Diffie-Hellman

之前我们谈到了密钥配送的问题，这个世界是如此的危险， 一不小心通信线路就会被监听，那么我们怎么在这种不安全的线路中传递密钥呢？

这里我们介绍一下Diffie-Hellman密钥交换算法。这个算法是由Whitfield Diffie和Martin Hellman在1976年共同发明的一种算法。

通过这个算法，双方只需要交换某些共同的信息就可以生成出共享的密钥。是不是很神奇？ 

我们看下具体的步骤：

![](https://img-blog.csdnimg.cn/20200331175232867.png)

上面的图就是Diffie-Hellman密钥交换算法，假如x要向y发送消息，如果采用上面的算法，那么需要如下几个步骤：

1. 生成两个共享的质数 G 和P，并将这两个数在x和y中共享。

P是一个非常大的质数，而G是P的生成元（生成元的乘方结果和1~P-1中的数字是一一对应的）。

这两个数G和P不需要保密。被窃取也没关系。

2. x生成一个随机数A，这个随机数只能x知道。A是一个1~P-2中的一个整数。
3. y生成一个随机数B，这个随机数只能y知道。B是一个1~P-2中的一个整数。
4. x将G<sup>A</sup> mod P的结果发给y，这个结果不用保密
5. y将G<sup>B</sup> mod P的结果发给x，这个结果不用保密
6. x使用步骤5的结果和随机数A计算最终的共享密钥(G<sup>B</sup> mod P)<sup>A</sup> mod P = G<sup>A*B</sup> mod P
7. y使用步骤4的结果和随机数B计算最终的共享密钥(G<sup>A</sup> mod P)<sup>B</sup> mod P = G<sup>A*B</sup> mod P

我们可以看到6和7算出来的最终的密钥是一样的。

接下来，我们探讨下Diffie-Hellman算法的安全性：

在该算法中，暴露在外部的变量是P，G，G<sup>A</sup> mod P和G<sup>B</sup> mod P 这4个变量。

根据这四个变量来生成最终的G<sup>A*B</sup> mod P是非常困难的。

这个问题涉及到了离散对数问题，要解决是非常困难的。所以，我们可以相信Diffie-Hellman算法是非常安全的。

更多内容请访问 [flydean的博客](http://www.flydean.com)
