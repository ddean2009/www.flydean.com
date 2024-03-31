---
slug: /custom-move-modules
---

# 9. 运行自定义move modules

## 简介

因为Libra和Move都是在不断发展的过程，在本文发布的时候，自定义Move modules还不能在testnet上面发布，只能在本地环境发布，下面我们将会看一下到底怎么才能在本地网络上面运行一个自定义Move程序。

## 创建Move modules

这里，我们创建了一个非常简单的名为MyModule的模块。 

该模块具有一个称为id的单一过程，该过程是一个操作coin的恒等过程。 它输入LibraCoin.T资源，最后将其返还给调用程序。 下面提供了此模块的Move IR代码，并将其保存在名为my_module.mvir的文件中。

~~~java
module MyModule {
  import 0x0.LibraCoin;

  // The identity function for coins: takes a LibraCoin.T as input and hands it back
  public id(c: LibraCoin.T): LibraCoin.T {
    return move(c);
  }
}
~~~

## 启动本地网络

启动本地网络很简单，需要用到libra仓库下面的libra_swarm包。启动命令如下：

~~~shell
$ cd libra
$ cargo run -p libra_swarm -- -s
~~~

上面的命令会创建一个本地网络的Libra区块链（生成节点的创世交易，初始密钥和引导程序配置），并启动一个本地验证节点。

最后它会启动一个Libra cli客户端，如下所示：

~~~shell
usage: <command> <args>

Use the following commands:

account | a
Account operations
query | q
Query operations
transfer | transferb | t | tb
<sender_account_address>|<sender_account_ref_id> <receiver_account_address>|<receiver_account_ref_id> <number_of_coins> [gas_unit_price_in_micro_libras (default=0)] [max_gas_amount_in_micro_libras (default 100000)] Suffix 'b' is for blocking.
Transfer coins (in libra) from account to another.
dev
Local Move development
help | h
Prints this help
quit | q!
Exit this client


Please, input commands:

libra%

~~~
接下来我们就可以通过命令行和libra进行交互了。

## 创建账号并送测试币

之前的文章我们也讲到了怎么创建账号，这里直接列命令：

~~~shell
libra% account create
>> Creating/retrieving next account from wallet
Created/retrieved account #0 address 810abcc08dbed34ea15d7eb261b8001da6a62d72acdbf87714dd243a175f9b62


libra% account mintb 0 100
>> Minting coins
waiting ....transaction is stored!
Finished minting!

~~~

我们给账户0创建了100个币。

## 编译Move Module

在上面我们已经把编辑好的Move module程序保存为my_module.mvir， 我们需要编译它：

~~~shell
libra% dev compile 0 <path to my_module.mvir> module
~~~

0表示这个module将使用0账户来发布。

module 表示你你正在编译一个Move module程序。如果你在编译交易脚本，那么将其替换为script .

成功编译模块后，你将在输出中看到以下消息，其中包含编译my_module.mvir生成的字节码文件的路径。

~~~shell
Successfully compiled a program at /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpigAZCx
~~~

## 发布编译好的Module

使用dev publish来发布上一步编译好的Module：

~~~shell
libra% dev publish 0 /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpigAZCx

waiting .....transaction is stored!
no events emitted.
Successfully published module
~~~

成功执行dev publish命令后，MyModule的字节码将在发送者的帐户下发布。 要使用MyModule中声明的过程和类型，其他事务脚本和模块可以使用import &lt;sender_address> .MyModule将其导入。

在&lt;sender_address>下发布的后续模块不得命名为MyModule。 每个帐户最多可以拥有一个给定名称的模块。 尝试在&lt;sender_address>下发布名为MyModule的第二个模块将导致事务失败。

## 创建交易脚本

我们编写如下的交易脚本，并将其保存为custom_script.mvir。

~~~shell
import 0x0.LibraAccount;
import 0x0.LibraCoin;
import {{sender}}.MyModule;

main(amount: u64) {
  let coin: LibraCoin.T;
  coin = LibraAccount.withdraw_from_sender(move(amount));
  //calls the id procedure defined in our custom module
  LibraAccount.deposit(get_txn_sender(), MyModule.id(move(coin)));
  return;
}
~~~

这个脚本就是简单的调用了MyModule的id过程。

在此脚本中，执行脚本时，{{sender}}将自动替换为发件人帐户地址。 或者，你可以import完全限定地址：

~~~shell
 import 0x810abcc08dbed34ea15d7eb261b8001da6a62d72acdbf87714dd243a175f9b62.MyModule;
 ~~~

## 编译编译脚本

同样使用dev compile来进行编译：

~~~shell
libra% dev compile 0 <path_to_custom_script.mvir> script
~~~

结果如下：

~~~shell
Successfully compiled a program at /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21
~~~

## 执行脚本

使用dev execute 命令来执行脚本。

~~~shell
libra% dev execute 0 /var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21 10
waiting .....transaction is stored!
Successfully finished execution
~~~

0是发送者的账户index.

/var/folders/tq/8gxrrmhx16376zxd5r4h9hhn_x1zq3/T/.tmpDZhL21是上面编译好的脚本地址。

10 是要调用的币的数量。

这样一个自定义Move module就完成并成功调用了。


