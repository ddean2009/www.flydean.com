---
slug: /run-Fabric-on-ibm-Cloud
---

# 6. 使用IBM Blockchain Platform打包智能合约

上篇文章我们讲了怎么使用IBM blockchain platform extension在VS Code编辑器中创建本地运行的智能合约。

创建完智能合约之后，可以在自己搭建的blockchain环境中运行，也可以在各大云平台上面运行。目前IBM，腾讯云，阿里云，AWS等都提供了区块链的SAAS服务，可以非常方便的对hyperledger fabric区块链网络进行管理和扩展，这篇文章主要描述如何在IBM Cloud平台上面运行Fabric智能合约。借此可以对部署fabric区块链的流程有个非常清楚的认识，这些步骤和流程即使在后面部署到自己搭建的网络上，也同样适用的。

# 打包智能合约

我们将在VS Code上使用IBM Blockchain Platform扩展来打包智能合约。

打开VS Code里面的智能合约面板，选择你要导出的智能合约，右键点击，选择“Export Package”，在您的计算机上找到一个位置并保存.cds文件。 稍后，我们将使用此程序包智能合约在IBM Blockchain Platform 2.0服务上进行部署。

![](https://img-blog.csdnimg.cn/2020010915580368.png)

现在，我们将开始在IBM Cloud上设置和配置Hyperledger Fabric网络。

# 创建IBM Cloud services

登录IBM Cloud,创建IBM Cloud Kubernetes服务。 您可以在目录中找到该服务。 IBM Cloud提供一个免费集群实例，并在30天后过期。 注意：Kubernetes服务设置可能需要20分钟才能完成。

![](https://img-blog.csdnimg.cn/2020010916111758.png)

# 创建fabric网络

在创建好了blockchain platform之后，就可以开始配置fabric网络了。

我们需要创建一个具有单个peer的组织，和该组织的MSP和CA（证书颁发机构）以及一个order组织，和它的MSP和CA。 我们将创建相应的identities以部署peer节点并操作节点。

## 创建org和相应的节点

* 创建peer org CA
    
    * 单击添加证书颁发机构。

    * 在“创建证书颁发机构”下单击“ IBM Cloud”，然后单击“下一步”。

    * 给它一个取名Org1CA。

    * 指定admin作为Admin ID和adminpw作为Admin Secret。


![](https://img-blog.csdnimg.cn/20200109161744309.png)

* 使用该CA来注册identities

    * 选择我们创建的org1 CA证书颁发机构。

    * 首先，我们将为组织“ org1”注册一个管理员。 单击注册用户按钮。 输入org1admin作为注册ID，并输入org1adminpw作为注册密码。 点击下一步，将此身份的类型设置为client，然后从下拉列表中选择关联所有组织。 我们将“最大注册人数”和“添加属性”字段留空。
  
    * 我们将重复该过程以创建peer的身份认证。 单击注册用户按钮。 使用peer1作为注册ID，以及peer1pw作为注册密码。 点击下一步，将此身份的类型设置为peer，然后从下拉列表中选择关联所有组织。 我们将“最大注册人数”和“添加属性”字段留空。

![](https://img-blog.csdnimg.cn/20200109162128737.png)


* 创建peer组织的MSP
    
    * 选择Organizations，点击Create MSP definition
    * 使用Org1 MSP作为“MSP Display name”，org1msp作为MSP ID。
    * 选择Org1 CA作为该组织的root CA 。
    * organization admin的Enroll ID和Enroll secret 分别为：org1admin 和 org1adminpw。Identity name 选择Org1 Admin。
    * 点击Generate和Export来生成该组织的admin identity并将其导出到本地文件系统。最后，点击Create MSP definition完成MSP的创建。

![](https://img-blog.csdnimg.cn/20200109162734197.png)

* 创建peer节点

    * 在Nodes页面，点击Add peer按钮，使用Peer Org1作为Display name。
    * 选择Org1 CA作为Certificate Authority。 
    * peer1和peer1pw作为Enroll ID 和 Enroll secret 。Org1 MSP作为 Administrator Certificate。
    * admin和adminpw作为 TLS Enroll ID和TLS Enroll secret。
    * Org1 Admin 作为Associate an identity 。



![](https://img-blog.csdnimg.cn/20200109163321413.png)


## 创建order org和相应节点

创建order org和peer org的步骤高度相似。

* 创建order org CA 

    * 点击Add Certificate Authority，设置Orderer CA为Display name。
    * admin和adminpw为Admin ID和Admin Secret。

* 使用该CA来注册order admin和 order认证

    * 选择Orderer CA，点击Register User。
    * ordereradmin和ordereradminpw作为Enroll ID和Enroll Secret。类型选择client。
    * 点击Register User， 输入orderer1和orderer1pw作为Enroll ID和 Enroll Secret 。类型选择peer。
  
![](https://img-blog.csdnimg.cn/20200109163806725.png)

* 创建order org的MSP

    * 点击Create MSP definition，Orderer MSP作为MSP Display name ，orderermsp作为MSP ID 。
    * Orderer CA作为Root Certificate Authority。
    * ordereradmin和ordereradminpw作为Enroll ID和 Enroll secret。Orderer Admin作为Identity name。
    * 点击Create MSP definition完成创建。

![](https://img-blog.csdnimg.cn/20200109164137280.png)

* 创建order节点

    * 点击Add orderer，Orderer作为Display name ，Orderer CA作为Certificate Authority。
    * orderer1，orderer1pw作为Enroll ID 和Enroll secret 。
    * Orderer MSP作为Administrator Certificate。
    * admin和adminpw作为TLS Enroll ID，TLS Enroll secret
    * Orderer Admin作为Associate an identity。

![](https://img-blog.csdnimg.cn/20200109164351137.png)

* 关联order和peer

    * 点击我们刚刚创建的Orderer。
    * 在Consortium Members下点击Add organization。
    * 选择Org1 MSP，点击提交。

![](https://img-blog.csdnimg.cn/20200109164606403.png)

## 创建和加入channel

* 创建channel

    * 点击Create channel，给channel起名：mychannel
    * 选择刚刚创建的order，选择Org1 MSP (org1msp)作为MSP。
    * Org1 Admin作为关联认证。
    * 点击添加，选中Operator。
    * 点击创建

![](https://img-blog.csdnimg.cn/20200109164911878.png)

* 把peer加入channel

    * 点击Join channel，选择Orderer，选择mychannel，选择要加入的peer： Peer Org1。  提交。

![](https://img-blog.csdnimg.cn/2020010916510466.png)

虽然很复杂，但是恭喜你，你已经创建好了fabric网络。

# 导入智能合约

* 安装智能合约

    * 点击Smart contracts，点击 Install smart contract，选择我们之前导出的智能合约。
    * 点击添加文件，点击安装。

![](https://img-blog.csdnimg.cn/20200109165346755.png)

* 实例化智能合约

    * 在smart contracts tab,找到你刚刚安装的智能合约。
    * 点击Instantiate，选择mychannel，选择org1msp。
    * 点击Instantiate。

好了，智能合约完美的部署到了IBM Cloud上面。

更多教程请参考 [flydean的博客](http://www.flydean.com)

