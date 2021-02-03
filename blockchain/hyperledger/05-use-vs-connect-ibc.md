使用VSCode连接到IBM Cloud区块链网络

上篇文章我们讲到怎么在IBM Cloud搭建区块链环境并且将本地的智能合约导出并安装在IBM Cloud网络环境中。

本篇文章我们会继续讲解如何通过本地的VSCode来远程连接和调用部署在远程的IBM Cloud上的智能合约。

# 从IBM Cloud控制面板导出连接信息

如果客户端需要连接到Fabric网络，需要通过gateway来连接。如果是实际的应用程序，需要通过使用Hyperledger Fabric SDKs作为gateway来连接Fabric网络。

本质上VSCode也是一个客户端，所以VSCode也可以通过gateway来连接远程Fabric网络。VSCode的IBM blockchain extention已经在插件面板上提供了FABRIC GATEWAYS选项，我们直接在这里使用即可。下面看下如何配置一个FABRIC GATEWAY。

通过该GATEWAY,我们可以在VSCode中，远程submit/evaluate网络中的tranaction.

1. 首先创建和注册一个连接账号（enroll ID + secret）。

在上篇文章中，我们讲到过如何在CA中创建新的ID。这个创建的过程就是enroll的过程，将这个个ID在CA中注册，并配置相应的权限。

![](https://img-blog.csdnimg.cn/20200113175431960.png)


在Nodes面板中，在Certif Authorities中，我们找到之前创建的CA : Org1 CA。 点击Register user。输入vscode和vscodepw作为id和secret。选择Client作为类型，affiliation选择org1。 maximum enrollments留空。点击next即可创建新的id。

> 注意这里maximum enrollments的作用，maximum enrollments指定了最大的enrollment次数，如果设定为1，则该ID只能被enroll一次，后面就没有用了。这对于赋予指定用户的权限的时候非常有用。

2. 导出Connection profile

我们需要使用到Connection profile才能连接到Fabric网络。在Smart contracts面板选中之前实例化的智能合约，点击... 选择Connect with SDK，选择org1msp 和 Org1 CA 作为你的MSP和Certificate Authority, 然后点击 Download connection profile，下载出来。

# 在VSCode中创建gateway和wallet 

1. 创建gateway

打开IBM Blockchain Platform，在FABRIC GATEWAYS 点击 + ， 输入ibm_cloud作为你的gateway名字， 接下来它需要你选择一个profile，选择上面从IBM Cloud上面下载的profile, 然后gateway就创建好了。 

点击该gateway, 他需要你选择一个wallet,下面我们看下怎么创建wallet。

2. 创建wallet

在FABRIC WALLETS 中点击 + ， 选择Create a new wallet and add an identity， 给它起个名字：ibm_cloud_wallet， 给identity起个名字：id，输入org1msp作为mspid, 选择Select a gateway and provide an enrollment ID and secret， 选择你刚刚创建的ibm_cloud， 输入vscode和vscodepw作为id和security。 接下来你就可以在FABRIC WALLETS中看到创建的identity了。

背后的故事： 刚刚我们实际上发送了一个enroll请求到IBM Cloud上面的CA，并且获得了一个ID，并存储在本地的wallet里面，以供后面使用。

添加wallet之后，如果你再次点击ibm_cloud， 还是会要你去选择一个wallet, 这时候可以右键点击ibm_cloud，选择Associate A Wallet， 将 ibm_cloud_wallet和ibm_cloud关联起来，这样就不用每次都再次选择了。 

# 在VSCode中提交transaction

现在我们已经有了可以连接到IBM Cloud的gateway了。接下来， 我们看一下怎么在VSCode中提交transaction。

1. 在FABRIC GATEWAYS中点击ibm_cloud。
2. 打开Channels > channel1 > demoContract@0.0.1 
3. 右键点击myAssetExists，选择Evaluate Transaction. 输入["001"] 作为key，因为我们现在没有任何值，所以你会看到：
   
    `[SUCCESS] Returned value from myAssetExists: false`

4. 右键点击createMyAsset,选择 Submit Transaction 输入 ["001", "hello ibm cloud"] ，我们就创建好了一个asset。
5. 接下来我们选择readMyAsset的 Evaluate Transaction 接下来输入 ["001"],我们可以看到asset成功创建了。

    `[SUCCESS] Returned value from readMyAsset: {"value":"hello ibm cloud"}`

恭喜你，你已经可以从本地的VSCode远程了解IBM Cloud Fabric网络了。

