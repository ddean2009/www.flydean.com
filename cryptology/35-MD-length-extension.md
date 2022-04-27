密码学系列之:Merkle–Damgård结构和长度延展攻击

# 简介

Merkle–Damgård结构简称为MD结构，主要用在hash算法中抵御碰撞攻击。这个结构是一些优秀的hash算法，比如MD5,SHA-1和SHA-2的基础。今天给大家讲解一下这个MD结构和对他进行的长度延展攻击。

# MD结构

MD结构是Ralph Merkle在1979年的博士论文中描述的。因为Ralph Merkle 和 Ivan Damgård 分别证明了这个结构的合理性，所以这个结构被称为Merkle–Damgård结构。

接下来，我们看下MD结构是怎么工作的。 

MD结构首先对输入消息进行填充，让消息变成固定长度的整数倍（比如512或者1024）。这是因为压缩算法是不能对任意长度的消息进行处理的，所以在处理之前必须进行填充。

通常来说，我们会使用恒定的数据，比如说0来填充整个消息块。

举个例子，假如我们的消息是“HashInput”，压缩块的大小是8字节（64位），那么我们的消息将会被分成两个块，后面一个块使用0来填充，将会得到：“HashInpu t0000000”。

但是这样做往往是不够的，因为通常对于压缩函数来说，会删除掉最后面的额外的0，所以导致填充和不填充最后计算出来的hash值是一样的。

为避免这种情况，必须更改填充常量数据的第一位。由于常量填充通常由零组成，因此第一个填充位将强制更改为“ 1”。

也就是“HashInpu t1000000”。

我们还可以对填充进行进一步的增强，比如使用一个额外的block来填充消息的长度。

但是额外的使用一个block往往有点浪费，一个更加节约空间的做法就是，如果填充到最后一个block的0中有住够的空间的话，那么可以消息的长度放在那里。

填充好block之后，接下来就可以对消息进行压缩了，我们看下一下MD的流程图：

![](https://img-blog.csdnimg.cn/20201121232825352.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

消息被分成了很多个block，最开始的初始化向量和第一个block进行f操作，得到了的结果再和第二个block进行操作，如此循环进行，最终得到了最后的结果。

# 长度延展攻击

在密码学中长度延展攻击就是指攻击者通过已知的hash(message1)和message1的长度，从而能够知道hash（message1‖message2）的值。其中‖ 表示的是连接符。并且攻击性并需要知道message1到底是什么。

上一节我们讲到的MD结构，是将消息分成一个一个的block，前一个block 运算出来的值会跟下一个block再次进行运算，这种结构可以很方便的进行长度延展攻击。前提是我们需要知道原消息的长度。

我们举个例子，假设我们有下面的请求：

~~~java
Original Data: count=10&lat=37.351&user_id=1&long=-119.827&waffle=eggo
Original Signature: 6d5f807e23db210bc254a28be2d6759a0f5f5d99
~~~

上面的例子是给编号为1的用户发送鸡蛋馅的华夫饼，并附带了消息签名，以保证消息的正确性。这里消息签名使用的MAC算法。

假如恶意攻击者想把waffle的值从eggo修改成为liege。

那么新的数据将会是这样的：

~~~java
count=10&lat=37.351&user_id=1&long=-119.827&waffle=eggo&waffle=liege
~~~

为了对该新消息进行签名，通常，攻击者需要知道该消息签名使用的密钥，并通过生成新的MAC来生成新的签名。但是，通过长度扩展攻击，可以将哈希（上面给出的签名）作为输入，并在原始请求已中断的地方继续进行hash输出，只要知道原始请求的长度即可。

如果考虑到padding（消息填充）的影响的话，我们还需要恢复原始消息的填充内容，然后在恢复过后的内容之后再添加我们的攻击代码：

~~~java
New Data: count=10&lat=37.351&user_id=1&long=-119.827&waffle=eggo\x80\x00\x00
          \x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00
          \x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00
          \x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00
          \x00\x00\x02\x28&waffle=liege
~~~

这样我们就可以得到新的MAC值：

~~~java
New Signature: 0e41270260895979317fff3898ab85668953aaa2
~~~

# Wide pipe

为了避免长度延展攻击，我们可以对MD结构进行一些变形。

先看一下Wide Pipe结构：

![](https://img-blog.csdnimg.cn/20201122000403446.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

wide pipe和MD的流程基本上是一致的，不同的是生成的中间临时的加密后的消息长度是最终生成消息长度的两倍。

这也就是为什么上图中会有两个初始向量IV1 和 IV2。假如最终的结果长度是n的话，那么在中间生成的结果的长度就是2n。我们需要在最后的final 这一步中，将2n长度的数据缩减为n长度的数据。

SHA-512/224 和 SHA-512/256 只是简单的丢弃掉一半数据。

# Fast wide pipe

还有一种比wide pipe更快的算法叫做fast wide pipe：

![](https://img-blog.csdnimg.cn/20201122001257797.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

和wide pipe不同的是，它的主要思想是将前一个链接值的一半转发给XOR，然后将其与压缩函数的输出进行XOR。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！


