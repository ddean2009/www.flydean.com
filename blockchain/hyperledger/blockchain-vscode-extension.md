使用IBM Blockchain Platform extension开发你的第一个fabric智能合约

IBM Blockchain Platform extension是VSCode的一个插件，最新版本是v1.0.17。 

该扩展支持Hyperledger Fabric和IBM Blockchain Platform的完整开发工作流程：

* 生成，编辑和打包智能合约
* 使用简单的预先配置的本地结构网络在本地部署和调试合同
* 连接到任何Fabric环境进行部署，包括IBM Blockchain Platform服务（在IBM Cloud上）或软件（本地和多云）
* 提交和评估交易，并开发客户应用程序

这个可谓是开发Fabric智能合约的神器，比之前的本地的自己搭环境不知道好哪去了。

那么有些小伙伴要问了，既然有这么好用的神器，有没有简单的介绍教程呢？ 

别急，下面就是。

# 安装IBM Blockchain Platform extension for VS Code

IBM Blockchain Platform extension是工作在VS Code上面的，VS Code是微软开源的编辑工具，也是一个非常好用的开发工具。

如果你已经有了VS Code，点击屏幕左侧边栏中的扩展程序。 在顶部，在扩展市场中搜索IBM Blockchain Platform。 单击安装，然后单击重新加载。那么就安装好了。

> 注意事项：
> 
> Fabric是在docker环境中运行的，智能合约现在可以用JavaScript, TypeScript, Java, Go 这四种语言来编写。所以你需要如下的环境：
> 
> VS Code version 1.32 or greater
> Node v8.x or greater and npm v5.x or greater
> Docker version v17.06.2-ce or greater
> Docker Compose v1.14.0 or greater

# 创建一个智能合约项目

IBM Blockchain Platform extension可以使用你选择的Hyperledger Fabric支持的编程语言生成智能合约框架。里面已经包含了简单有用的智能合约。

在本例中，我们将使用TypeScript作为例子。

在左侧边栏中，单击IBM Blockchain Platform图标（它看起来像一个正方形，如果这是你安装的最新扩展，则可能位于图标集的底部）。

将鼠标悬停在SMART CONTRACT PACKAGES面板上，单击“…”菜单，然后从下拉列表中选择“创建智能合约项目”。

选择一种智能合约语言。 JavaScript，TypeScript，Java和Go都可用。就本教程而言，请选择TypeScript。

然后会询问你是否要在生成的合同中命名资产（默认是“ MyAsset”），当然你可以修改成自己想要的资产名字。

选择一个位置来保存项目。单击浏览，然后单击新建文件夹，然后根据需要命名项目（例如，“ blockchainExtProject”）。

单击创建，然后选择刚创建的新文件夹，然后单击保存。

最后，从选项列表中选择“添加到工作区”。

该扩展程序将根据你选择的语言和资产名称生成一个框架合同。完成后，你可以导航到“资源管理器”视图（最有可能在左侧栏中的顶部图标，看起来像“文档”图标）并打开src / my-asset-contract.ts文件以查看你的智能合约代码脚手架。

生成的文件应该如下图所示：

![](https://img-blog.csdnimg.cn/20200108155613663.png)

接下来，我们将看一下生成的智能合约到底是做什么的。

# 理解智能合约

生成的智能合约代码支架提供了一些常见的操作示例，可用于与区块链分类账上的数据进行交互。 其中my-asset-contract.ts就是生成的智能合约代码。

~~~typescript
/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { MyAsset } from './my-asset';

@Info({title: 'MyAssetContract', description: 'My Smart Contract' })
export class MyAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async myAssetExists(ctx: Context, myAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(myAssetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createMyAsset(ctx: Context, myAssetId: string, value: string): Promise<void> {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (exists) {
            throw new Error(`The my asset ${myAssetId} already exists`);
        }
        const myAsset = new MyAsset();
        myAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(myAsset));
        await ctx.stub.putState(myAssetId, buffer);
    }

    @Transaction(false)
    @Returns('MyAsset')
    public async readMyAsset(ctx: Context, myAssetId: string): Promise<MyAsset> {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const myAsset = JSON.parse(buffer.toString()) as MyAsset;
        return myAsset;
    }

    @Transaction()
    public async updateMyAsset(ctx: Context, myAssetId: string, newValue: string): Promise<void> {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const myAsset = new MyAsset();
        myAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(myAsset));
        await ctx.stub.putState(myAssetId, buffer);
    }

    @Transaction()
    public async deleteMyAsset(ctx: Context, myAssetId: string): Promise<void> {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        await ctx.stub.deleteState(myAssetId);
    }

}

~~~


请注意以@Transaction开头的行：这些是定义合同交易的函数-这些东西使你可以与分类账进行交互。

我们先看看createMyAsset函数：

~~~typescript
    @Transaction()
    public async createMyAsset(ctx: Context, myAssetId: string, value: string): Promise<void> {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (exists) {
            throw new Error(`The my asset ${myAssetId} already exists`);
        }
        const myAsset = new MyAsset();
        myAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(myAsset));
        await ctx.stub.putState(myAssetId, buffer);
    }
~~~

@Transaction（）中的括号告诉你此函数会修改分类帐的内容。

该函数称为createMyAsset，它接受myAssetId和一个值，两者均为字符串。 提交此事务后，将使用关键字myAssetId和值创建一个新资产。 例如，假设你要创建“ 001”，“my first asset”； 然后稍后，当你读取键001的值时，你会知道该特定状态的值是“my first asset”。

现在，看看下一个事务：

~~~typescript
    @Transaction(false)
    @Returns('MyAsset')
    public async readMyAsset(ctx: Context, myAssetId: string): Promise<MyAsset> {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const myAsset = JSON.parse(buffer.toString()) as MyAsset;
        return myAsset;
    }
~~~

这个以@Transaction（false）开头-“ false”表示此函数通常不打算更改分类帐的内容。 这样的事务，称为“查询”。如你所见，此函数仅采用myAssetId并返回键所指向的任何状态的值。

可以详细看下合同中的其他交易。 然后，你可以继续打包和部署该合同，从而来使用它。

# 打包智能合约

现在，你已经创建了智能合约并了解其中的交易，是时候打包了。智能合约项目打包成.CDS文件，这是一种特殊类型的文件，可以安装在Hyperledger Fabric节点上。

在左侧边栏中，单击IBM Blockchain Platform图标。

将鼠标悬停在SMART CONTRACT PACKAGES面板上，单击“…”菜单，然后从下拉列表中选择“打包智能合约项目”。

如果一切顺利，你应该在列表中看到一个新程序包blockchainExtProject@0.0.1。

你刚创建的程序包可以安装到任何Hyperledger Fabric peer上（以正确的版本运行）。例如，你可以右键单击并选择“导出包”，然后使用IBM Blockchain Platform操作工具控制台将其部署到云环境中。现在，你将在VS Code扩展程序预配置的运行时本地部署程序包，因此现在无需导出程序包！

# Local Fabric Ops

名为LOCAL FABRIC OPS的面板（在IBM Blockchain Platform视图中）使你可以在本地计算机上使用Docker操作简单的Hyperledger Fabric runtime。 最开始的时候Fabric应该是停止的：

~~~
Local Fabric runtime is stopped. Click to start.
~~~

单击该消息，扩展将开始为你扩展Docker容器。然后，你应该会看到消息“ Local Fabric运行时正在开始……”，当任务完成时，你将看到一组可扩展/可折叠部分，分别标记为“智能合约”，“通道”，“节点”和“组织。”

下面是他们的简单描述：

* “智能合约”部分向你显示此网络上的实例化和已安装合约。本教程的接下来的两个步骤将向你展示如何安装并实例化打包的智能合约。
* 在通道下有一个称为“ mychannel”的通道。为了使用智能合约，必须在一个通道上实例化它。
* “节点”部分包含一个对等节点（peer0.org1.example.com）。命名遵循Hyperledger Fabric约定，你可以从“ org1”部分看到此peer归Org1所有。
* 还有一个证书颁发机构（CA）ca.org1.example.com和一个order节点orderer.example.com。
* 在这个简单的区块链网络中只有一个组织称为“ Org1”。只有一个组织的网络在现实世界中使用并不是很现实，因为重点是要在多个组织之间共享一个分类帐，但对于本地开发目的来说已经足够了。在“组织”下，你将看到Org1MSP：这是Org1的MSP ID。

现在，你已经启动了本地Fabric运行时，现在该安装并实例化智能合约了……

# 安装智能合约

在真实的网络中，每个将支持交易的组织都将在其peer节点上安装智能合约，然后在通道上实例化该合约。 现在本地Fabric运行时只有一个组织（Org1），一个同级（peer0.org1.example.com）和一个通道（mychannel）。

因此，你只需要在该单个peer上安装合同，然后便可以在mychannel中实例化该合同。 方法如下：

1. 在“本地FABRIC OPS”面板中，找到“ +安装”（在“智能合约”>“已安装”下），然后单击它。

2. 系统会要求你选择一个节点。 选择唯一的选项peer0.org1.example.com。

3. 然后，系统会要求你选择要安装的软件包。 blockchainExtProject@0.0.1。

你应该看到blockchainExtProject@0.0.1出现在智能合约>已安装列表下。

接下来，你将实例化智能合约…

# 实例化智能合约

在“本地FABRIC OPS”面板中，查找+实例化（在“智能合约”>“实例化”下），然后单击它。

系统会要求你选择一个channel。选择唯一的选项，mychannel。

然后，系统会要求你选择一个智能合约进行实例化。选择blockchainExtProject@0.0.1。

然后，系统将询问你要调用的函数。如果要在实例化过程中使用特定功能，则可以在此处输入内容。现在只需按Enter即可跳过此步骤。

然后，系统会询问你是否要提供私有数据配置文件。对于本教程，只需单击“否”.

实例化可能比安装花费更长的时间-请注意成功消息，并在“智能合约”>“实例化”列表中显示blockchainExtProject@0.0.1，以确认它是否有效！

现在你的界面应该是这样的：


![](https://img-blog.csdnimg.cn/20200108162115719.png)

# 提交和查询事务

Fabric网关和Hyperledger Fabric网络的peer进行连接，客户端应用程序可以使用该网关提交事务。当你在LOCAL FABRIC OPS中启动本地实例时，也会自动为你创建一个网关。你可以在FABRIC GATEWAYS下找到它，它称为“ local_fabric”。

要使用网关，你还需要用于在该网络上进行交易的身份。同样，对于本地Fabric运行时，已经为你设置了此时间。请注意，在FABRIC WALLETS下有一个名为local_fabric_wallet的钱包，其中包含一个名为admin的ID。如果将鼠标悬停在“ FABRIC GATEWAYS”面板中的“ local_fabric”上，你会看到它告诉你“关联的钱包：local_fabric_wallet”。

因此，你已经有了一个网关和一个带有单个身份的关联钱包，这意味着该网关可以使用了。

单击local_fabric（在FABRIC GATEWAYS下）以通过此网关连接。

展开channel，然后展开mychannel和blockchainExtProject@0.0.1。你将看到智能合约中定义的所有交易的列表。

现在你需要创建资产。右键单击createMyAsset，然后选择Submit Transaction。系统将要求你提供交易参数：尝试[“ 001”，“my asset one”]（或你喜欢的任何键和值，但请确保记住使用的键！）。

> 参数以JSON格式提交，因此请确保你完全按照显示的方式输入输入内容，以便你根据此交易要求提交由2个字符串组成的数组。

接下来，以类似方式提交updateMyAsset。这次，为参数提供相同的键和不同的值，例如[“ 001”，“my asset two”]。因此，现在分类帐中的键001的值应该是“my asset two”。让我们来检查一下……

readMyAsset用于读取而不是写入分类帐，因此这次选择查询交易。输入[“ 001”]（或任何你设置的键）作为参数。你应该在输出控制台中看到以下内容：

~~~
[SUCCESS] Returned value from readMyAsset: {"value":"my asset two"}
~~~

恭喜你，你已经完成了第一个智能合约！


