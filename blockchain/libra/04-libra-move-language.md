Libra教程之:move语言的特点和例子

## move语言的特点

Libra的目标是打造一个全球话的金融和货币的平台，从而赋能地球上的几十亿人。那么作为Libra的move语言就需要在安全性和可编程性上面提供大力的支持。

为了实现这样的目标，move遵从如下四大设计原则：

### 资源优先

在区块链中我们需要通过程序来存取数字资产，这个数字资产和普通程序中的变量（如booleans，integers，strings）有着明显的区别。我们需要一个特别的方式来表示区块链中的数字资产。

Move语言中的resource就是特别为数字资产定义的，它有这样的特点：

resource是不能被拷贝和隐式销毁的，它只能在不同的用户之间移动。这个特性是在Move的类型定义中已经声明了的。除了这个特殊的限制，resource和其他普通的资源一样，可以存储在数据结构中，可以作为参数传给过程等。

资源优先的概念为程序员写出安全和有效的代码提供了非常大的帮助。

Libra coin就是一种resource，因为它将和现实世界的货币相对应，所以它可以被创建，修改，或者销毁。我们需要做的就是通过modules来控制好操作coin的权限。

move中的modules有点像以太坊中的智能合约，module声明了resource类型和过程（业务逻辑：如何创建，移动，销毁coin）。module中的定义的type和过程可以被其他的module进行调用。

### 灵活性

move的灵活性体现在可以通过transaction脚本来自由组合各种transaction来实现不同的功能，一个脚本可以调用多个transaction，

在move中modules/resources/procedures的关系有点像面向对象程序语言中classes/objects/methods的关系。

### 安全性

move定义了资源的安全性，类型的安全性和内存的安全性，任何违背这些安全性的操作都会被拒绝。

一般来说，有两种方式来实现这个功能：1.在高级别的语言定义上，通过编译器来检查这些异常。 2. 在低级别的虚拟机汇编语言上检查这些异常。

move是这两种方式中间的一种方式：Move执行的字节码比汇编语言要高级一点，但是又比编程语言又低级一点。move的字节码提交到链上后，会被字节码验证器校验，然后经由字节码解释器执行。

### 可验证性

最好的验证方式就是将字节码提交到链上进行真实的验证，但这样很明显会加重链的负担，影响交易的速度，所以在move中我们尽可能多的在链上做轻量级的验证，而在语言级别做线下的静态验证。

## Move语句初探

本节我们会通过一个例子来详细的讲解Move语言的具体特性。本节的例子是使用move IR来编写的，这是一个实验性的版本，正式的move语言还在编写中。

### 点对点支付交易脚本

~~~script
public main(payee: address, amount: u64) {
let coin: 0x0.Currency.Coin = 0x0.Currency.withdraw_from_sender(copy(amount));
0x0.Currency.deposit(copy(payee), move(coin));
}
~~~

上面是一段简单的交易脚本，main方法有两个输入，一个是地址，一个是要支付的数目。

逻辑其实很简单，从发送者的账户里面减去amount, 然后将它转给接收者。

0x0是module的存储地址，Currency是module的名字，0x0.Currency.Coin 代表的就是资源了。

在上面的章节中我们讲到了，coin是resource，只能move不能copy，尝试将move(coin)替换成copy（coin）会报错。

其他的非resource的资源像是payee和amout可以被move也可以被copy.

如果我们添加这样一行：

0x0.Currency.deposit(copy(some_other_payee), move(coin))

则coin将会被使用两次，这在逻辑上是有问题的，在Move语言中，

move(coin)方法在使用一次过后会变得不可用，从而导致第二次move失败，从而有效的保障了应用逻辑。

coin只能也必须移动一次，如果把move（coin）删除，同样会的到一个错误。这样做的目的是有效的避免程序员的疏忽导致的应用逻辑错误。

### Currency Module

上面我们定义了一个Currency的module。这里我们讲一下Currency是怎么实现的。

Libra有两种程序，一种是transaction脚本，一种是module，脚本会去调用module里面的过程来更新全局状态。

transaction脚本是一种只能执行一次的脚本，执行完之后就不能再用了，而module是发布在全局状态里面的长期存在的代码。

全局状态是一个账户地址到账户的映射，如下图所示，0x0，0x1，0x2都是账户的地址。

![](https://img-blog.csdnimg.cn/20191018223916659.png)

每个地址里面可以包含任意个module和资源。例如0x0地址的账户包含了一个module：0x0.Currency和一个resource：0x0.Currency.Coin.

知道了账户的结构之后，我们看下module是怎么定义资源的：

~~~shell
module Currency {
resource Coin { value: u64 }
// ...
}
~~~

上面的代码定义了一个Coin的resource，它有一个value字段，类型是u64。 

接下来我们看下存储这个操作是怎么定义的：

~~~shell
public deposit(payee: address, to_deposit: Coin) {
let to_deposit_value: u64 = Unpack<Coin>(move(to_deposit));
let coin_ref: &mut Coin = BorrowGlobal<Coin>(move(payee));
let coin_value_ref: &mut u64 = &mut move(coin_ref).value;
let coin_value: u64 = *move(coin_value_ref);
*move(coin_value_ref) = move(coin_value) + move(to_deposit_value);
}
~~~

这个过程主要做了这样几件事情：

1. 销毁输入的Coin，并且记录下它的值。
2. 获取存在payee中的Coin的reference。
3. 把输入的Coin加到payee上。

Unpack&lt;T> 是唯一的销毁T的方式，unpack会销毁T，然后返回T对应的值。

BorrowGlobal&lt;T> 接收一个地址作为参数，然后返回一个指向该地址里的T实例的引用。

同样的，我们看下withdraw_from_sender 是怎么实现的：

~~~shell
public withdraw_from_sender(amount: u64): Coin {
let transaction_sender_address: address = GetTxnSenderAddress();
let coin_ref: &mut Coin = BorrowGlobal<Coin>(move(transaction_sender_address));
let coin_value_ref: &mut u64 = &mut move(coin_ref).value;
let coin_value: u64 = *move(coin_value_ref);
RejectUnless(copy(coin_value) >= copy(amount));
*move(coin_value_ref) = move(coin_value) - copy(amount);
let new_coin: Coin = Pack<Coin>(move(amount));
return move(new_coin);
}
~~~

这个过程做了这样3件事情：

1. 获得发送者地址里面coin的唯一引用。
2. 减去相应的数量。
3. 创建并返回一个新的coin。

其中Pack&lt;T>是Unpack&lt;T>的反向操作。用来创建T资源。





