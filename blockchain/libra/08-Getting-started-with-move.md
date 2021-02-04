来了，你最爱的Move语言

## Move语言

Move是一种新的编程语言，旨在为Libra区块链提供安全且可编程的基础。 Libra区块链中的帐户就是由任意数量的Move resources和Move modules组成的。 提交给Libra区块链的每个交易都使用Move编写的交易脚本来对其逻辑进行编码。 

交易脚本通过调用module声明的procedures来更新区块链的全局状态。

## Move的核心概念

### Move交易脚本

每个Libra交易都包含一个Move交易脚本，该脚本对验证程序代表客户执行的逻辑进行编码（例如，将Libra从A的帐户转移到B的帐户）。

通过调用一个或多个Move模块的procedures，事务脚本与发布在Libra区块链的全局存储中的Move resources进行交互。

事务脚本并不会在全局状态中存储，并且其他事务脚本也无法调用它。 它是一个一次性程序。

### Move modules

Move modules定义了用来更新Libra区块链的全局状态的规则。 modules相当于其他区块链中的智能合约。 它声明了可以在用户帐户下发布的resources类型。 Libra区块链中的每个帐户都是一个容器，用于容纳任意数量的resources和modules。

module主要用来声明结构类型（包括资源，这是一种特殊的结构）和procedures。

Move module的procedures定义了用于创建，访问和销毁其声明的类型的规则。

modules是可重用的。 在一个module中声明的结构类型可以使用在另一个module中声明的结构类型，并且在一个module中声明的可以procedure调用在另一个module中声明的public procedures。 一个module可以调用在其他Move module中声明的procedures。 事务脚本可以调用已发布module的任何public procedures。

最后，Libra用户将能够使用自己的帐户发布modules。

### Move resources

Move的主要功能是能够定义自定义资源类型。 资源类型主要对数字资产进行编码。

资源在Libra中随处可见。 它们可以存储为数据结构，可以作为参数传递给过程，可以从过程中返回，等等。

Move type system为资源提供了特殊的安全保证。 Move resources永远不能被复制，重用或丢弃。 资源类型只能由定义该类型的模块创建或销毁。这是由Move虚拟机通过字节码验证来强制进行保证的。 Move虚拟机将拒绝运行尚未通过字节码验证程序的代码。

Libra货币是通过LibraCoin.T的资源类型来实现的。 和其他的资源一样，LibraCoin.T也是一种资源。

## 写一个Move程序

本节我会介绍怎么使用Move IR来编写事务脚本和模块。IR是即将推出的Move源语言的预览版本（不稳定）。 Move IR是Move字节码上的一个薄语法层，用于测试字节码验证程序和虚拟机，它对开发人员并不特别友好。 它足够高，可以编写人类可读的代码，但是也足够低，可以直接编译为Move字节码。

### 编写交易脚本

用户通过交易脚本来请求对Libra区块链的全局存储进行更新。几乎所有事务脚本中都会出现两个重要资源：LibraAccount.T和LibraCoin.T资源类型。 LibraAccount是module的名称，而T是该module声明的资源的名称。这是Move中的通用命名约定。module声明的“主要”类型通常称为T。

当我们说用户“在Libra区块链上的地址0xff拥有一个帐户”时，我们的意思是地址0xff拥有LibraAccount.T资源的实例。每个非空地址都有一个LibraAccount.T资源。此资源存储帐户数据，例如序列号，身份验证密钥和余额。要与帐户进行交互的Libra系统的任何部分都必须通过从LibraAccount.T资源中读取数据或调用LibraAccount module的procedures来进行此操作。

帐户余额是LibraCoin.T类型的资源。这是Libra货币的类型。与任何其他Move资源一样，此类型在语言上是一等公民。 

LibraCoin.T类型的资源可以存储在程序变量中，在过程之间传递，等等。

现在让我们看看程序员如何在事务脚本中与这些模块和资源进行交互。

~~~java
// Simple peer-peer payment example.

// Use LibraAccount module published on the blockchain at account address
// 0x0...0 (with 64 zeroes). 0x0 is shorthand that the IR pads out to
// 256 bits (64 digits) by adding leading zeroes.
import 0x0.LibraAccount;
import 0x0.LibraCoin;
main(payee: address, amount: u64) {
  // The bytecode (and consequently, the IR) has typed locals.  The scope of
  // each local is the entire procedure. All local variable declarations must
  // be at the beginning of the procedure. Declaration and initialization of
  // variables are separate operations, but the bytecode verifier will prevent
  // any attempt to use an uninitialized variable.
  let coin: LibraCoin.T;
  
  // Acquire a LibraCoin.T resource with value `amount` from the sender's
  // account.  This will fail if the sender's balance is less than `amount`.
  coin = LibraAccount.withdraw_from_sender(move(amount));
  // Move the LibraCoin.T resource into the account of `payee`. If there is no
  // account at the address `payee`, this step will fail
  LibraAccount.deposit(move(payee), move(coin));

  // Every procedure must end in a `return`. The IR compiler is very literal:
  // it directly translates the source it is given. It will not do fancy
  // things like inserting missing `return`s.
  return;
}
~~~

此交易脚本有一个不幸的问题-如果收款人下没有帐户，它将失败。 我们将通过修改脚本为收款人创建帐户（如果尚不存在）来解决此问题。

~~~java
// A small variant of the peer-peer payment example that creates a fresh
// account if one does not already exist.

import 0x0.LibraAccount;
import 0x0.LibraCoin;
main(payee: address, amount: u64) {
  let coin: LibraCoin.T;
  let account_exists: bool;

  // Acquire a LibraCoin.T resource with value `amount` from the sender's
  // account.  This will fail if the sender's balance is less than `amount`.
  coin = LibraAccount.withdraw_from_sender(move(amount));

  account_exists = LibraAccount.exists(copy(payee));

  if (!move(account_exists)) {
    // Creates a fresh account at the address `payee` by publishing a
    // LibraAccount.T resource under this address. If theres is already a
    // LibraAccount.T resource under the address, this will fail.
    create_account(copy(payee));
  }

  LibraAccount.deposit(move(payee), move(coin));
  return;
}
~~~

让我们看一个更复杂的例子。 在此示例中，我们将使用交易脚本向多个收件人付款，而不仅仅是一个。

~~~java
// Multiple payee example. This is written in a slightly verbose way to
// emphasize the ability to split a `LibraCoin.T` resource. The more concise
// way would be to use multiple calls to `LibraAccount.withdraw_from_sender`.

import 0x0.LibraAccount;
import 0x0.LibraCoin;
main(payee1: address, amount1: u64, payee2: address, amount2: u64) {
  let coin1: LibraCoin.T;
  let coin2: LibraCoin.T;
  let total: u64;

  total = move(amount1) + copy(amount2);
  coin1 = LibraAccount.withdraw_from_sender(move(total));
  // This mutates `coin1`, which now has value `amount1`.
  // `coin2` has value `amount2`.
  coin2 = LibraCoin.withdraw(&mut coin1, move(amount2));

  // Perform the payments
  LibraAccount.deposit(move(payee1), move(coin1));
  LibraAccount.deposit(move(payee2), move(coin2));
  return;
}
~~~

好了，这就是简单的交易脚本，虽然我们不了解Move IR的语法，但是直接看内容应该就很容易明白这个脚本到底在做什么了。

### 编写自己的Modules

上面的交易脚本使用了现有的LibraAccount和LibraCoin modules，那么我们怎么编写自己的Move modules呢？

考虑这种情况：B将来会在地址a创建一个帐户。 A想为B“专款”一些资金，以便他一旦创建就可以将其存入他的帐户。 但是，如果B从未创建该帐户，她还希望能够自己收回资金。

为了解决A的这个问题，我们将编写一个模块EarmarkedLibraCoin：

* 声明一个新的资源类型EarmarkedLibraCoin.T，该资源类型包装了Libra coin和收件人地址。
* 允许A创建此类类型并将其发布到她的帐户下（创建过程）。
* 允许B声明资源（claim_for_recipient过程）。
* 允许拥有EarmarkedLibraCoin.T的任何人销毁它并获得相应的coin（拆包程序）。

~~~java
// A module for earmarking a coin for a specific recipient
module EarmarkedLibraCoin {
  import 0x0.LibraCoin;

  // A wrapper containing a Libra coin and the address of the recipient the
  // coin is earmarked for.
  resource T {
    coin: LibraCoin.T,
    recipient: address
  }

  // Create a new earmarked coin with the given `recipient`.
  // Publish the coin under the transaction sender's account address.
  public create(coin: LibraCoin.T, recipient: address) {
    let t: Self.T;

    // Construct or "pack" a new resource of type T. Only procedures of the
    // `EarmarkedLibraCoin` module can create an `EarmarkedLibraCoin.T`.
    t = T {
      coin: move(coin),
      recipient: move(recipient),
    };

    // Publish the earmarked coin under the transaction sender's account
    // address. Each account can contain at most one resource of a given type;
    // this call will fail if the sender already has a resource of this type.
    move_to_sender<T>(move(t));
    return;
  }

  // Allow the transaction sender to claim a coin that was earmarked for her.
  public claim_for_recipient(earmarked_coin_address: address): Self.T acquires T {
    let t: Self.T;
    let t_ref: &Self.T;
    let sender: address;

    // Remove the earmarked coin resource published under `earmarked_coin_address`.
    // If there is no resource of type T published under the address, this will fail.
    t = move_from<T>(move(earmarked_coin_address));

    t_ref = &t;
    // This is a builtin that returns the address of the transaction sender.
    sender = get_txn_sender();
    // Ensure that the transaction sender is the recipient. If this assertion
    // fails, the transaction will fail and none of its effects (e.g.,
    // removing the earmarked coin) will be committed.  99 is an error code
    // that will be emitted in the transaction output if the assertion fails.
    assert(*(&move(t_ref).recipient) == move(sender), 99);

    return move(t);
  }

  // Allow the creator of the earmarked coin to reclaim it.
  public claim_for_creator(): Self.T acquires T {
    let t: Self.T;
    let sender: address;

    sender = get_txn_sender();
    // This will fail if no resource of type T under the sender's address.
    t = move_from<T>(move(sender));
    return move(t);
  }

  // Extract the Libra coin from its wrapper and return it to the caller.
  public unwrap(t: Self.T): LibraCoin.T {
    let coin: LibraCoin.T;
    let recipient: address;

    // This "unpacks" a resource type by destroying the outer resource, but
    // returning its contents. Only the module that declares a resource type
    // can unpack it.
    T { coin, recipient } = move(t);
    return move(coin);
  }

}
~~~

A可以通过创建交易脚本来为B创建专用coin，该交易脚本调用B地址a上的create和她拥有的LibraCoin.T。 创建a之后，B可以通过发送来自a的交易来claim coin。 这将调用claim_for_recipient，将结果传递给unwrap，并在他希望的任何地方存储返回的LibraCoin。 

如果B花费太长时间在a帐户下创建帐户，而A想要收回其资金，则可以通过使用Claim_for_creator然后取消unwrap来做到这一点。

好了，我们的程序就写完了。目前IR还是不稳定版本，关于IR语法的更详细内容，我会在后面的文章中讲到。








