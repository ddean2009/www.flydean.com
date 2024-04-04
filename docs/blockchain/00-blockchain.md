---
slug: /blockchain
---

# 区块链简介

![](https://img-blog.csdnimg.cn/20200520234134930.jpeg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

区块链是一种防篡改的共享数字分布式账本，可记录公共或私有对等网络中的交易。分布式账本分布到网络中的所有成员节点，以加密散列链接的块的顺序链，永久记录网络中对等点之间发生的资产交换的历史记录。

区块链的广为人知是从比特币开始的，但是区块链不是比特币，区块链只是比特币底层的技术基础。比特币可以看做是区块链的副产品。

本文不介绍炒币，币圈有风险，炒币需谨慎。

我觉得做技术的还是要静下心来，专心的搞搞技术，闲看庭前花开花落,漫随天外云卷云舒！

> 更多内容请访问[www.flydean.com](http://www.flydean.com)

如果你非要问我对币圈的看法，个人觉得当你看完我的所有文章之后，就会发现其实虚拟货币就是那么回事，它只是一堆数字，你认为它有价值它就有价值，你觉得它没用它就是一堆空气而已。

其实区块链的底层技术并不复杂，也不是什么新的技术，但是当这么多技术汇集在一起，就产生了强大的催化效应，于是区块链诞生了。

区块链中最重要的技术组成部分就是密码学和分布式系统，通过在分布式系统使用共识机制和智能合约，最后产生了强大的区块链系统。

> 总结：区块链的本质就是记账！

# 什么是区块链

有同学会问了，讲了这么多还是不明白什么是区块链呀，接下来我们用一个例子来生动形象的说明，本例子纯属虚构，如有雷同实属巧合：

话说一年一度的华山论剑又要到了，东邪，西毒，南帝，北丐，中神通外加新晋新秀郭小侠六个人又准备在华山山顶大块肉，大口酒的潇洒走一回了。

那么问题来了，吃肉喝酒是要经费的，六人商议决定每人交500文钱作为这次活动的经费。为了方便管理经费的使用情况，他们选择了憨厚老实的郭小侠作为本次活动的记账人，由郭小侠全权负责维护账本的记录情况。

这就是现在的集中式账本系统，一切郭小侠一个人说了算，虽然郭小侠老实可靠，但总好像缺了点什么。

又到了月度回顾的时间了，郭小侠把这个月的消费记录列了出来，发给大家。西毒看了账单有异议了，因为账单记录了西毒出入易翠阁一次花费20文。西毒说他没有去过，但是账单如此，还是从他的账户中扣除了20文。

西毒觉得肯定是郭小侠想害他，故意弄错了账本记录，但是他又没有证据，只好求救于郭小侠的老婆黄小蓉。

黄小蓉想了想，找到了一个解决办法，那这样吧，六个人每个人保留一个账本，只要有人消费了，都要通知其他的人，大家一起记账，这样就不存在一个人记账中可能出现的篡改记录的问题了。这就叫做分布式账本，因为账本是一块记录接着一块记录，按照时间来排序的，因此也称为区块链。

过了一段时间，问题又出现了，因为大家都觉得会有人来记账，然后大家都没有记账，导致有些记录丢失了。黄小蓉又想出来一个办法，首先记账的人可以得到1文钱的奖励，通过这样的奖励机制，来鼓励大家记账，这个机制就叫做挖矿。

为了保证账本中记的账目都是真真的切切实实的这六大高手的花费，黄小蓉给他们分别分配了一个暗号，通过这个暗号就可以验证消费是不是出自他们之手。这就叫做区块链中的密码学。

然而，问题还没完，如果有多个人同时记账，而记得账目又不同，就导致了分布式账本中数据不一致的问题，而解决这个问题的方法就叫做共识机制。共识机制有很多种，比如谁记得又快又多就用谁的，这种共识机制叫做POW。又比如按谁剩余的钱最多，就选谁来记账，这叫做POS。

六人觉得，如果记账记到第一百笔的时候，需要庆祝一下，去买个烤羊排啥的。大家把这个逻辑也写在账本中，这叫做智能合约。

西毒有一天想把自己的账本历史记录修改一下，但是其他的五个人不同意，这就叫做防篡改机制。

如果把这个链的记账权限扩展到整个武林，谁都可以来参与记账，这叫做公链。

如果只能这六个人记账，就叫做私链。

郭小侠的师傅江南七侠听闻也建了一个链，想跟五绝的链打通，这就叫做跨链操作。

西毒昭告天下说，他要邀请天下好友建一个公链，说这个链有多么多么有前途，这叫做背书。

西毒说，在这个公链上挖矿，所得的奖励是一片树叶（附带我的亲笔签名），这些树叶非常有价值，并且上限1000枚，挖完就没有了。这就叫做发币。

但是西毒的链还没有正式建好，就开始预售树叶了，这叫做ICO。

看到大佬都在发币，裘千尺也发币了，西毒大佬看不起裘千尺，把他的币叫做山寨币。

于是大家都开始卖树叶...没人做实事了，最后ICO拿到了真金白银跑路了。

例子就讲这么多，如果还有人不明白区块链到底是啥，请关注我，私信我！我手把手教你，不教到会誓不罢休。

# 区块链不是什么

大家记住我的话，区块链的本质只是一个分布式账本，用来存储数据用的，如果讲得更高级一点，可能里面还包含有智能合约，就是在某个条件下会触发某些记录的更改操作。

它跟数据库没有什么本质的区别，记账记账记账才是区块链的真正作用。

区块链不是银弹，它只是一个记账的手段。所以后面你看到那些山寨币把自己的项目夸上天的那种，就要考虑考虑风险了。

什么纳米币，太空币等等，你换一种方式记账就能改造纳米技术，让卫星上天了？

更有甚者，觉得用了区块链就改变了社会秩序和规则？什么鬼？

# 区块链的基础:密码学

密码学是区块链的基础中的基础，没有密码学就没有区块链。

密码学是区块链世界中的安全保证。如何防范密钥丢失，如何保证交易的安全，如何验证交易的正确性等等都是密码学要做的事情。

下面是我总结的关于密码学的文章：

* [一致性hash算法](http://www.flydean.com/consistency-hash/)
* [女巫攻击及其防范](http://www.flydean.com/sybil-attack/)
* [HMAC算法及其应用](http://www.flydean.com/hmac/)
* [MAC攻击及缺陷](http://www.flydean.com/mac-attack/)
* [一次性密码本-绝对不会被破译的密码](http://www.flydean.com/one-time-password/)
* [DES算法](http://www.flydean.com/des/)
* [AES算法](http://www.flydean.com/aes/)
* [分组密码与模式](http://www.flydean.com/block-cipher-mode/)
* [公钥私钥](http://www.flydean.com/private-public-key/)
* [RSA算法详解](http://www.flydean.com/rsa/)
* [中间人攻击](http://www.flydean.com/man-in-the-middle-attack/)
* [混合密码系统](http://www.flydean.com/hybrid-cryptosystem/)
* [单向散列函数](http://www.flydean.com/one-way-hash-function/)
* [数字签名](http://www.flydean.com/digital-signature/)
* [一文读懂密码学中的证书](http://www.flydean.com/certificate/)
* [密钥详解](http://www.flydean.com/key/)
* [更加安全的密钥生成方法Diffie-Hellman](http://www.flydean.com/diffie-hellman/)
* [基于口令的密码（PBE）](http://www.flydean.com/pbe/)
* [一篇文章让你彻底弄懂SSL/TLS协议](http://www.flydean.com/ssl-tls-all-in-one/)

# 区块链的基础:分布式系统和共识机制

如果说密码学是区块链的钥匙的话，那么分布式系统就是区块链的基石，而共识机制就是保证区块链基石稳定性的混凝土。

下面是有关分布式系统和共识机制的文章：

* [理解分布式一致性:Raft协议](http://www.flydean.com/understand-raft-protocol/)
* [理解分布式一致性:Paxos协议之Basic Paxos](http://www.flydean.com/understand-paxos-basic-paxos/)
* [理解分布式一致性:Paxos协议之Multi-Paxos](http://www.flydean.com/understant-paxos-multi-paxos/)
* [理解分布式一致性:Paxos协议之Cheap Paxos & Fast Paxos](http://www.flydean.com/understand-paxos-cheap-paxos-fast-paxos/)
* [理解分布式一致性:Paxos协议之Generalized Paxos & Byzantine Paxos](http://www.flydean.com/understand-paxos-generalized-paxos-byzantine-paxos/)
* [理解分布式一致性:拜占庭容错与PBFT](http://www.flydean.com/understand-pbft/)


# 超级账本Hyperledger

![](https://img-blog.csdnimg.cn/20200520233033972.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Hyperledger是一项开源工作，旨在推动跨行业的区块链技术供企业使用。这是由LinuxFoundation®主持的全球合作，其中包括金融，银行，物联网，供应链，制造和技术领域的领导者。这183个不同的成员和9个正在进行的项目（包括Hyperledger Fabric）协同工作，以创建一个开放的，标准化的企业级分布式分布式账本框架和代码库。

Hyperledger其实是由很多各项目构成的，他们

Hyperledger Fabric框架在许可的网络上支持分布式分布式账本解决方案，成员之间彼此了解，适用于广泛的行业。它的模块化架构最大程度地提高了区块链解决方案的机密性，弹性和灵活性。

下面是有关超级账本的文章：

* [分布式账本简介](http://www.flydean.com/introduction-to-distributed-ledgers/)
* [Hyperledger Fabric基础知识](http://www.flydean.com/hyperledger-fabric-basics/)
* [Fabric的6大特性](http://www.flydean.com/6-technical-advantages-of-fabric/)
* [使用IBM Blockchain Platform extension开发你的第一个fabric智能合约](http://www.flydean.com/blockchain-vscode-extension/)
* [在IBM Cloud中运行Fabric](http://www.flydean.com/run-fabric-on-ibm-cloud/)
* [使用VSCode连接到IBM Cloud区块链网络](http://www.flydean.com/use-vs-connect-ibc/)


# 以太坊

![](https://img-blog.csdnimg.cn/20200520233956666.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

以太坊是由程序员Vitalik Buterin在比特币的基础上开发出来的一套公链平台。它被称为第二代加密货币与去中心化应用平台。

以太坊创造性的提出了智能合约的概念，扩充和丰富了人们的想象。

有了智能合约，以太坊也就插上了腾飞的翅膀，各种Dapp应运而生，而以太坊最最有名的就是做ICO发代币了。

为什么会有这么多人在以太坊上发代币呢？因为在以太坊上发代币实在是太简单了。

有多简单呢？如果说不会写程序的人都能发代币好像还不能够，不足以体现以太坊发代币的简单之处。那么这样说吧：大妈都会发代币你就懂了。

自己定义一个代币的总个数，比如1000000000000亿个。小手鼠标一点就创建好了。

接下来的套路就是建官网，建论坛，拉人气，找人背书，吹一下这个项目如何如何厉害，如何如何有前景。接着就可以ICO了。

我还记得曾经看过的一个项目，具体名字不记得了，好像是叫做太空币，那搞得一个高大上，貌似有了这个币，就可以进行太空旅行，遨游太空的感觉。

不知道为什么还有那么多人相信！

吐槽了半天，这里想说的是以太坊真的是继比特币之后对于区块链的又一大力作，尤其是其中的智能合约的概念更是应用广泛。

下面是我写的关于以太坊的文章，目前数目还不多，后续我会补充：

* [ERC20 Short Address Attack](http://www.flydean.com/erc20-short-address-attack/)

* [Solidity的Bytecode和Opcode简介](http://www.flydean.com/solidity-bytecode-and-opcode/)


# Libra

![](https://img-blog.csdnimg.cn/20200520233458184.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Libra是facebook发起的一个区块链项目，其使命是建立一套简单的、无国界的货币和为数十亿人服务的金融基础设施。

facebook认为传统的金融服务离穷人太远，并且被收取各种不菲且难以预测的费用。全球仍有17亿成年人从来没有接触过金融系统，虽然他们中的10亿人拥有手机，其中的5亿人可以上网。

facebook希望借助与区块链的独特的金融特性来实现普惠金融的目标。

facebook希望借此创建一个开放、即时和低成本的全球性货币和金融基础设施。两者结合起来实现”货币互联网“。

其实Libra的具体实现离区块链的去中心化，匿名性和开放性还是有一定的距离的，所以Libra不能称作为一个纯粹的区块链。

下面是我整理的关于Libra的文章：

* [Libra白皮书解读](http://www.flydean.com/libra-white-paper-interpretation/)
* [Libra教程之:Libra协议的关键概念](http://www.flydean.com/libra-protocol-key-concepts/)
* [Libra教程之:Transaction的生命周期](http://www.flydean.com/libra-transaction-life/)
* [Libra教程之:Libra testnet使用指南](http://www.flydean.com/libra-testnet-trial/)
* [Libra教程之:来了,你最爱的Move语言](http://www.flydean.com/libra-your-favorite-move-language/)
* [Libra教程之:运行自定义move modules](http://www.flydean.com/libra-run-custom-move-modules/)
* [Libra教程之:Libra protocol的逻辑数据模型](http://www.flydean.com/libra-protocol-logical-data-model/)
* [Libra教程之:执行Transactions](http://www.flydean.com/libra-execution-transactions/)
* [Libra教程之:数据结构和存储](http://www.flydean.com/libra-data-structures-and-storage/)
* [Libra教程之:move语言的特点和例子](http://www.flydean.com/libra-move-overview/)

# 比特币

比特币是区块链的第一个应用，也是最成功的一个应用，通过比特币我们才开始了解区块链。

这一块的内容等我后续补充。

# 总结

本文是区块链的集合文章，会持续进行更新，希望大家能够喜欢。有需要的同学可以关注并留言，我会尽量回复，谢谢！
