Hyperledger Fabric基础知识

本文我们会介绍Hyperledger Fabric的基础知识，并了解如何充分利用这个多功能的区块链框架。

区块链技术为创新提供了丰富的机会。它提供了一种新的交易方式，从而可以从根本上改变业务的实现。

那么，在众多的区块链框架中，开发人员应该首先掌握哪个框架呢？IBM开发的Hyperledger Fabric肯定是最佳选择，尤其在今天这个公链应用不明朗的情况下，使用Fabric开发联盟链应该是最常见也最实用的框架了。

Hyperledger是一种开源协作成果，旨在促进跨行业的区块链技术供企业使用。该全球合作由The Linux Foundation主持。

Hyperledger孵化并支持一系列区块链业务技术，框架，库和应用程序。 Hyperledger项目托管了多个区块链框架，包括Hyperledger Fabric。本文概述了什么是Hyperledger Fabric，如何使用它来构建解决方案以及如何在Hyperledger Fabric中执行事务。

# 什么是Hyperledger Fabric？
Hyperledger Fabric是用于私有链和联盟链业务网络的开源框架实现，其中成员身份和角色对于其他成员是已知的。它是一种模块化的架构。它允许账本数据库，共识机制和成员资格服务等组件即插即用。它使用了容器技术，从而提供了企业级的网络安全性，可伸缩性和机密性。

Hyperledger Fabric网络具有以下组件：

* Assets。资产是任何有价值的东西。资产具有状态和所有权。资产在Hyperledger Fabric中表示为键值对的集合。
  
* Shared ledger。共享账本记录资产的状态和所有权。共享账本包括两个部分：

    * world state描述了给定时间点的共享账本状态。这是共享账本的数据库。
    * blockchain是记录所有交易的交易日志历史记录。
  
* Smart contract。 Hyperledger Fabric智能合约称为chaincode。 Chaincode是定义资产和相关交易的软件；换句话说，它包含系统的业务逻辑。当应用程序需要与共享账本交互时，将调用Chaincode。链码可以用Golang或Node.js编写。

* Peer nodes。Peer是网络的基本元素，因为它们托管共享账本和智能合约。Peer执行链码，访问共享账本数据，认可交易并与应用程序对接。Peer可以是endorsing peers，也可以是endorsers。每个链码都可以指定背书策略，该政策定义了有效交易背书的必要条件和充分条件。
  
* Channel。通道是由peers集合形成的逻辑结构。此功能允许一组peers创建单独的交易共享账本。
  
* Organizations。 Hyperledger Fabric网络是由网络中不同组织拥有和贡献的peers构建的。该网络之所以存在是因为组织将其个人资源贡献给了集体网络。peers具有成员资格服务提供商从其所属组织分配的身份（数字证书）。不同组织的Peers可以在同一channel上。

* Membership Services Provider (MSP)。 MSP是证书颁发机构，以管理用于认证成员身份和角色的证书。在Hyperledger Fabric网络中，所有的节点必须要有认证过的身份才能进行交易。MSP管理用户ID并验证网络上的所有参与者，从而使Hyperledger Fabric成为一个私有的和准入的网络。

* Ordering service。Ordering service将交易打包成块，以交付给通道上的peers。它保证了网络中的交易顺利执行。它与peers和endorsing peers进行通信。Ordering service目前只支持Solo和Kafka。

下图是Hyperledger Fabric的组件和构成：

![](https://img-blog.csdnimg.cn/20200103071557165.png)

# Hyperledger架构是怎么工作的？

在Hyperledger解决方案中，Hyperledger Fabric网络充当后端，而应用程序前端则与网络进行通信。 SDK可帮助你在前端和后端之间建立通信，例如Node.js SDK和Java SDK。 SDK提供了一种执行用户链码，在网络中执行事务，监视事件等的方法。

要编写区块链应用程序，你需要：

1. 用受支持的编程语言（例如Go）编写chaincode。
2. 在Hyperledger Fabric网络上部署链码。
3. 使用SDK开发客户端应用程序。


# Hyperledger交易如何执行

Hyperledger Fabric网络中事务的请求流如下所示：

1. 客户端使用Node.js或Java™SDK连接到Hyperledger Fabric网络。客户端使用SDK API，创建一个事务并将其发送给背书peer。
2. endorsing peer会验证客户的签名，模拟交易并发送背书签名。
3. 如果交易得到认可，则客户将交易提交给ordering service。否则，交易被取消。
4. ordering service将交易传递给peers。所有peers都提交并应用相同的事务序列并更新其状态。
   
# 总结

Hyperledger Fabric是一个区块链框架实现。 你可以很轻松的使用Hyperledger来构建一个私人或联盟网络，并为其编写智能合约。

当然Hyperledger相对其他的区块链框架而言还是比较复杂的，因为它是专为企业级应用而生的。后面我们会详细讲解。