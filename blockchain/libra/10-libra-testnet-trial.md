Libra testnet使用指南

## Libra testnet网络

Libra的测试网络testnet已经上线了，那么我们该怎么做才能在testnet上给自己转账一千万，从此出任CEO，赢取白富美，走上人生巅峰呢？ 跟着我的节奏，来吧。

testnet只是一个测试网络，有的小伙伴在想我是不是可以搭个私链发个币，然后再上交易所呢？ 完全没问题，在币圈只有想不到的，没有做不到的，搭私链的问题，我会在文章中最后一个章节讲到。

本文档将指导你完成在Libra区块链上的第一笔交易。 运行之前有一些准备工作要做：

* 你正在Linux（基于Red Hat或Debian的）或macOS系统上运行。
* 你的互联网连接稳定。
* git已安装在你的系统上。
* Homebrew安装在macOS系统上。
* yum或者apt-get已安装在Linux系统上。

目前本教程只能正常运行在Linux和macOS环境中，请小伙伴自行检查。

## 下载和安装Libra

**克隆Libra核心存储库**

    git clone https://github.com/libra/libra.git

**checkout testnet分支**

    git checkout testnet

**安装依赖**

要设置Libra Core，请切换到libra目录并运行安装脚本以安装依赖，如下所示：

~~~shell
cd libra
./scripts/dev_setup.sh
~~~

**上面的安装脚本会执行如下操作：**

* 安装rustup：rustup是Rust编程语言的安装程序。
* 安装所需版本的rust-toolchain。
* 安装CMake，用来管理构建过程。
* 安装protoc：protocol buffers的编译器。
* 安装Go：building protocol buffers。

## 编译Libra client并连接到Testnet网络

运行下面的命令来编译Libra client和连接到Testnet网络：

    ./scripts/cli/start_cli_testnet.sh

该命令利用cargo（Rust的包管理器）构建并运行客户端，并将客户端连接到测试网上的验证者节点。

客户端连接到测试网上的节点后，你将看到以下输出。 要随时退出客户端，请使用quit命令。

~~~shell
usage: <command> <args>

Use the following commands:

account | a
  Account operations
query | q
  Query operations
transfer | transferb | t | tb
  <sender_account_address>|<sender_account_ref_id> <receiver_account_address>|<receiver_account_ref_id> <number_of_coins> [gas_unit_price (default=0)] [max_gas_amount (default 10000)] Suffix 'b' is for blocking.
  Transfer coins from account to another.
help | h
  Prints this help
quit | q!
  Exit this client


Please, input commands:

libra%
~~~

## 创建两个A和B的两个账号

之前的文章中，我们一直在讲A转账10个币给B的故事，那么这里我们就来试验一下，到底是怎么转的。

### 检查libra cli Client是否运行

libra％命令行提示符表示你的Libra CLI客户端正在运行。 要查看account命令的帮助信息，请输入“ account”，如下所示：

~~~shell
libra% account
usage: account <arg>

Use the following args for this command:

create | c
  Create an account. Returns reference ID to use in other operations
list | la
  Print all accounts that were created or loaded
recover | r <file path>
  Recover Libra wallet from the file path
write | w <file name>
  Save Libra wallet mnemonic recovery seed to disk
mint | mintb | m | mb <receiver account> <number of coins>
  Mint coins to the account. Suffix 'b' is for blocking
~~~

### 创建A的账户

请注意，使用CLI创建帐户不会更新区块链，而只会创建本地密钥对。

要创建爱丽丝的帐户，请输入以下命令：

    libra％account create

成功样例输出：

~~~shell
>> Creating/retrieving next account from wallet
Created/retrieved account #0 address 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8
~~~

0是A帐户的索引，十六进制字符串是A帐户的地址。 索引只是引用A帐户的一种方式。 帐户索引是本地CLI索引，可以在其他CLI命令中使用，以使用户方便地参考他们创建的帐户。 该索引对区块链没有意义。 仅当通过挖矿将钱添加到Alice的帐户中，或者通过其他用户的转账将资金转移到Alice的帐户中时，才会在区块链上创建Alice的帐户。 请注意，你也可以在CLI命令中使用十六进制地址。 帐户索引只是为了方便账户地址的引用。

## 创建B的账户

同样的方式，我们创建B的账户。

~~~shell
>> Creating/retrieving next account from wallet
Created/retrieved account #1 address 8337aac709a41fe6be03cad8878a0d4209740b1608f8a81566c9a7d4b95a2ec7
~~~

1是B帐户的索引，十六进制字符串是B帐户的地址。 

## 查看账户列表

使用如下命令来查看你的账户列表：

    libra% account list

可能的输出如下：

~~~shell
User account index: 0, address: 3ed8e5fafae4147b2a105a0be2f81972883441cfaaadf93fc0868e7a0253c4a8, sequence number: 0
User account index: 1, address: 8337aac709a41fe6be03cad8878a0d4209740b1608f8a81566c9a7d4b95a2ec7, sequence number: 0
~~~

帐户的序列号指示已从该帐户发送的交易数量。 每次执行从该帐户发送的交易并将其存储在区块链中时，它都会增加。

## 给A和B添加Libra币

testnet的挖矿是通过Faucet完成的。 Faucet是与测试网一起运行的服务。 此服务仅在testnet使用，在mainnet是不存在的。 当然它创建的Libra币是没有现实价值的。 假设你已经创建了分别具有索引0和索引1的A和B的帐户，则可以按照以下步骤将Libra添加到这两个帐户中。

### 给A添加110 LBR

    libra% account mint 0 110

0是A帐户的索引。
110是Libra要添加到A帐户的数量。
成功的mint命令还将在区块链上创建A的帐户。

成功的输出如下：

~~~shell
>> Minting coins
Mint request submitted
~~~

请注意，提交请求后，这意味着已将其成功添加到（测试网中验证者节点的）内存池中。 它不一定意味着它将成功完成。 稍后，我们将查询帐户余额以确认mint是否成功。

### 给B添加40 LBR

同样的我们给B也添加40 LBR。

    libra% account mint 1 40

### 查询余额

我们可以输入如下命令来查询上面的mint是否成功执行：

    libra% query balance 0

    Balance is: 110

    libra% query balance 1

    Balance is: 40

## 转账

最激动人心的时刻到了，我们要开始转账了。 我们会将10 LBR从A的账户转给B。 看下如何操作：

    libra% transfer 0 1 10

0 是A的index。

1 是B的index。

10 是要转账的LBR数目。

是不是很简单。它的输出如下：

~~~shell
>> Transferring
Transaction submitted to validator
To query for transaction status, run: query txn_acc_seq 0 0 <fetch_events=true|false>
~~~

你可以使用命令查询txn_acc_seq 0 0 true（通过帐户和序列号进行交易）来检索有关刚提交的交易的信息。第一个参数是发送者帐户的本地索引，第二个参数是帐户的序列号。

你刚刚将事务提交到testnet上的验证器节点，该事务已包含在验证器的内存池中。这不一定意味着你的交易已执行。从理论上讲，如果系统运行缓慢或过载，则需要花费一些时间才能看到结果，并且你可能必须通过查询帐户进行多次检查。要查询索引为0的帐户，可以使用命令query account_state 0。

如果你想立马返回交易结果，那么可以使用transferb命令（如下所示）代替transfer命令。它仅在将交易提交到区块链后，transferb才会提交交易并返回到客户端提示。一个例子如下所示：

libra% transferb 0 1 10

## 查看是否转账成功

~~~shell
libra% query balance 0
Balance is: 100
libra% query balance 1
Balance is: 50
~~~

好啦，你的第一个交易完成了。就是这么简单。

## 搭建私链

如果你不想使用testnet, 那么可以参照如下方法来搭建一个私链。

转到Libra Core repository的根目录，然后运行libra_swarm，如下所示：

~~~shell
$ cd ~/libra
$ cargo run -p libra_swarm -- -s
~~~

-p libra_swarm 使用cargo来运行libra_swarm软件包，该软件包启动由一个节点组成的本地区块链。

-s选项启动本地客户端以连接到本地区块链。

要查看用于启动节点并连接到Libra区块链的其他选项，请运行：

$cargo -p libra_swarm -- -h

cargo运行命令可能需要一些时间才能运行。 如果该命令的执行没有错误，则说明你的系统上正在运行Libra CLI客户端实例和Libra验证器节点。 成功执行后，你应该看到包含CLI客户端菜单和libra％提示符的输出。















