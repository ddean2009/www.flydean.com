[toc]

# 什么是ERC20
代币大家应该都很熟悉了，代币也叫 token, 他不是像比特币，以太坊等虚拟币这样建立在大量技术人员的辛苦工作基础之上，用于维持公链运行的虚拟货币。代币一般是依赖于以太坊平台，就是一个以太坊平台上面的一个智能合约里面记录的数字。

所以说token没有任何价值，每个人都可以在1分钟之类创建出无限的token。那么为什么现在有这么多的token价格这么高，还有这么多人去交易呢？ 一般来说，发行token的人会将整个token绑定一个很有前途的项目，什么纳米科技，卫星技术，新型动力，怎么牛逼怎么往上面靠，然后找几个币圈有名气的人站台，然后通过各种渠道发布这个token很了不起的舆论，接下来就是上交易所收割韭菜了，至于他们当时标榜的跨时代的项目就不知道是不是能够真的完成了，毕竟钱已经收到口袋里面了。

不可否认，有些token确实很有良心，也真的按照设想的去做了事情。这里不深究发行token的对与错，这里我们讲下ERC20。 

大家都来发token，那么这么多的token没有一个统一的标准，不好在以太坊平台进行通用的转让呀，为了便于token的流通，于是出现了一个token的标准叫做ERC20，简单点说，ERC20规定了token智能合约必须要实现的9个方法和2个事件。

具体的方法和事件名请看 [ERC-20标准说明](https://eips.ethereum.org/EIPS/eip-20)

# Application Binary Interface(ABI) 
这篇文章其实是讲ERC20攻击的，要想攻击ERC20，我们首先要知道怎么去跟以太坊虚拟机进行交互。在以太坊Ethereum 生态系统中， 应用二进制接口Application Binary Interface(ABI) 是从区块链外部与合约进行交互以及合约与合约间进行交互的一种标准方式。 数据会根据其类型按照约定的方法进行编码。

简单点说，一个ABI包括一个函数选择器和函数的参数。

函数选择器是一个函数调用数据的前 4 字节，指定了要调用的函数。这4个字节是函数签名通过 Keccak（SHA-3）哈希之后的前 4 字节。

函数的参数会被编码成32字节，不足32字节的将会补全。ERC20 Short Address Attack 就是在这个函数补全上面出现的。

# ERC20 Short Address Attack
我们先看一个简单的token合约，用来转账。

~~~
pragma solidity ^0.4.11;
 
contract MyToken {
mapping (address => uint) balances;
 
event Transfer(address indexed _from, address indexed _to, uint256 _value);
 
function MyToken() {
balances[tx.origin] = 10000;
}
 
function sendCoin(address to, uint amount) returns(bool sufficient) {
if (balances[msg.sender] < amount) return false;
balances[msg.sender] -= amount;
balances[to] += amount;
Transfer(msg.sender, to, amount);
return true;
}
 
function getBalance(address addr) constant returns(uint) {
return balances[addr];
}
}

~~~

很简单的一个智能合约， 这里我们看下sendCoin的方法，他接收2个参数，一个是接收token的地址，一个是数目。

如果想进行调用，那么生成的ABI可能是这样的：

~~~
0x90b98a11
00000000000000000000000062bec9abe373123b9aabbcce608f94eb8644163e
0000000000000000000000000000000000000000000000000000000000000004
~~~
其中：
0x90b98a11 是Keccak (SHA-3) 运算之后的方法标记 sha3(sendCoin(address,uint))。
00000000000000000000000062bec9abe373123b9aabbcce608f94eb8644163e 是 20字节的目标地址，被补全到32字节。
0000000000000000000000000000000000000000000000000000000000000004 是 1个字节的4被补全到32字节。

# 开始攻击
如果攻击者不按常理出牌，并不将参数补全到32字节，那么总的ABI长度会比预料的要小，那么会出现什么问题呢？ 

还是上面的例子，我们要发送4个token到62bec9abe373123b9aabbcce608f94eb8644163e。 
但是我们把地址的最后1个字节“3e”去掉，那么ABI如下所示：

~~~
0x90b98a11
00000000000000000000000062bec9abe373123b9aabbcce608f94eb8644163e00
00000000000000000000000000000000000000000000000000000000000004
                                                              ^^ 
~~~
我们可以看到，最后的04后面其实是少了一个字节的。

那么如果我们把这个ABI传给以太坊虚拟机，会出现什么问题呢？

以太坊虚拟机会将ABI补全，就是在04后面加一个字节00。

参数如下：

~~~
_from: 0x58bad47711113aea5bc5de02bce6dd332211aabb
_to: 0x62bec9abe373123b9aabbcce608f94eb8644163e00
_value: 2048

~~~
我们看到两个变化，第一目标地址变了，第二转移的数值变了：4<<8 = 2048。
这个就是ERC20 Short Address Attack。

# 怎么利用？
1. 攻击者构建一个最后一个字节为0的地址A。
2. 攻击者找到一个发行token的智能合约，在这个智能合约里面，向A存入500token。
3. 攻击者从智能合约转出500token到地址A，但是将地址A最后一个字节的0去掉。
4. 地址A最后1个字节会被补全，而转账的500token就变成了500<<8。

# 攻击防范
防范起来其实很简单，做好必要的参数校验即可。

下面的代码加了一个modifier onlyPayloadSize 。  在这个modifier里面，我们做了参数长度的校验。


~~~
pragma solidity ^0.4.11;
 
contract MyToken {
mapping (address => uint) balances;
 
event Transfer(address indexed _from, address indexed _to, uint256 _value);
 
function MyToken() {
balances[tx.origin] = 10000;
}

    modifier onlyPayloadSize(uint size) {
     assert(msg.data.length == size + 4);
     _;
   }

 
function sendCoin(address to, uint amount) onlyPayloadSize(2 * 32) returns(bool sufficient) {
if (balances[msg.sender] < amount) return false;
balances[msg.sender] -= amount;
balances[to] += amount;
Transfer(msg.sender, to, amount);
return true;
}
 
function getBalance(address addr) constant returns(uint) {
return balances[addr];
}
}

~~~

更多教程请参考 [flydean的博客](http://www.flydean.com/erc20-short-address-attack/)