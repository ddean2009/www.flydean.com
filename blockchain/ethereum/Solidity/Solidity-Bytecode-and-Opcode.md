Solidity的Bytecode和Opcode简介

随着我们更深入地编写智能合约，我们将遇到诸如“ PUSH1”，“ SSTORE”，“ CALLVALUE”等术语。 他们是什么，我们什么时候应该使用到他们？

要了解这些命令，我们必须更深入地了解以太坊虚拟机（EVM）。本文将会尝试尽可能简单地解释一些EVM基础。希望大家都有所收获。

像许多其他流行的编程语言一样，Solidity是一种高级编程语言。 我们可以读懂，但是机器却不能够。 如果大家学过诸如java,c++等编程语言，应该会很容易明白这个道理。

当我们安装诸如geth之类的以太坊客户端时，它还附带了以太坊虚拟机，这是专门为运行智能合约而创建的轻量级操作系统。

当我们使用solc编译器编译Solidity代码时，它将代码转换为只有EVM可以理解的字节码。

让我们以一个非常简单的合同为例：

~~~
pragma solidity ^0.4.26;
contract OpcodeContract {
    uint i = (10 + 2) * 2;
}
~~~

如果我们在remix浏览器中运行此代码，然后单击合同详细信息，则会看到很多信息。

![](https://img-blog.csdnimg.cn/20200106144800259.png)

在这种情况下，编译后的代码为：

~~~
BYTECODE
{
    "linkReferences": {},
    "object": "60806040526018600055348015601457600080fd5b5060358060226000396000f3006080604052600080fd00a165627a7a72305820db1d567e501f1682876df36eea80a02d25a8b2adb186da705e2e98e134b08cc60029",
    "opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x18 PUSH1 0x0 SSTORE CALLVALUE DUP1 ISZERO PUSH1 0x14 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x35 DUP1 PUSH1 0x22 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 DUP1 REVERT STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 0xdb SAR JUMP PUSH31 0x501F1682876DF36EEA80A02D25A8B2ADB186DA705E2E98E134B08CC6002900 ",
    "sourceMap": "25:54:0:-;;;64:12;55:21;;25:54;8:9:-1;5:2;;;30:1;27;20:12;5:2;25:54:0;;;;;;;"
}
~~~

其中object就是编译后的代码。他们是最终合同的十六进制表示形式，也称为字节码。 

在remix浏览器的“ Web3 Deploy”部分下，我们看到：

~~~
...
var opcodecontractContract = web3.eth.contract([]);
var opcodecontract = opcodecontractContract.new(
   {
     from: web3.eth.accounts[0], 
     data: '0x60806040526018600055348015601457600080fd5b5060358060226000396000f3006080604052600080fd00a165627a7a72305820db1d567e501f1682876df36eea80a02d25a8b2adb186da705e2e98e134b08cc60029', 
     gas: '4700000'
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })
 ~~~

 简单来说，这意味着当我们部署合同时，我们需要将编译后的16进制码当成data传递，并且建议的gas为4700000。

任何以“ 0x”开头的内容都表示该值采用十六进制格式。 十六进制前面的“ 0x”并不是强制的，因为EVM会将任何值都视为十六进制。

我们还看到了操作代码（又称Opcode）：

~~~
"opcodes": "PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x18 PUSH1 0x0 SSTORE CALLVALUE DUP1 ISZERO PUSH1 0x14 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x35 DUP1 PUSH1 0x22 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 DUP1 REVERT STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 0xdb SAR JUMP PUSH31 0x501F1682876DF36EEA80A02D25A8B2ADB186DA705E2E98E134B08CC6002900 ",
~~~

操作码是程序的低级可读指令。 所有操作码都具有对应的十六进制值，例如“ MSTORE”为“ 0x52”，SSTORE”为“ 0x55”……等等。

具体的操作码对应的数值可以参考以太坊相关资料。

EVM虚拟机是一中堆栈虚拟机，所谓堆栈就是后进先出结构，用计算机科学术语来说，我们称为LIFO。

举个例子，上面的智能合约，如果在普通算术中，我们这样写方程式:

~~~
// Answer is 14. we do multiplication before addition.
10 + 2 * 2
~~~

在EVM堆栈虚拟机中，它按照LIFO原理工作，所以我们需要这样写：

~~~
2 2 * 10 + 
~~~

这意味着，首先将“ 2”放入堆栈，然后再放入另一个“ 2”，然后再进行乘法运算。 结果是“ 4”放在在堆栈顶部。 现在在“ 4”的顶部加上数字“ 10”，最后将两个数字加在一起。 堆栈的最终值为14。

这种算术类型称为后缀表示法。

将数据放入堆栈的动作称为“ PUSH”指令，将数据从堆栈中删除的动作称为“ POP”指令。 很明显，我们在上面的示例中看到的最常见的操作码是“ PUSH1”，这意味着将1个字节的数据放入堆栈中。
因此，此指令：

~~~
PUSH1 0x80
~~~

表示将1字节值“ 0x80”放入堆栈中。 “ PUSH1”的十六进制值恰是“ 0x60”。 删除非强制性的“ 0x”，我们可以将此逻辑以字节码形式写为“ 6080”。
让我们更进一步。

~~~
PUSH1 0x80 PUSH1 0x40 MSTORE
~~~

再次查看以太坊的操作码图表，我们看到MSTORE（0x52）接受2个输入，但不产生任何输出。 上面的操作码表示：
PUSH1（0x60）：将0x80放入堆栈。
PUSH1（0x40）：将0x40放入堆栈。
MSTORE（0x52）：分配0x80的内存空间并移至0x40的位置。
结果字节码为：

~~~
6080604052
~~~

实际上，在任何固定字节码的开头，我们总会看到这个魔术数字“ 6080604052”，因为它是智能合约引导的方式。

请注意，这里不能将0x40或0x60解释为实数40或60。由于它们是十六进制，所以40实际上等于十进制的64（16 x 4），而80等于十进制的128（16 x 8）。

简而言之，“ PUSH1 0x80 PUSH1 0x40 MSTORE”正在做的是分配128个字节的内存并将指针移到第64个字节的开头。现在，我们有64个字节用于暂存空间，而64个字节用于临时内存存储。

在EVM中，有3个地方可以存储数据。首先，在堆栈中，按照上面的示例，我们刚刚使用了“ PUSH”操作码在此处存储数据。其次，在使用“ MSTORE”操作码的内存（RAM）中，最后在使用“ SSTORE”存储数据的磁盘存储中。将数据存储到磁盘存储所需的gas最昂贵，而将数据存储到堆栈中的gas则最便宜。

我们在Solidity中的智能合约中，有时候也会用到Assembly Language，这个Assembly Language就是使用这样的汇编Opcode来操作EVM字节码。他理解起来比较难，但是通过使用它可以节省燃料和做一些无法通过Solidity完成的事情。

本文仅介绍了字节码和一些操作码的基础。后面会有更多的文章来详细介绍Assembly Language和EVM虚拟机。 敬请期待。






