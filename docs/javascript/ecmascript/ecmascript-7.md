---
slug: /ecmascript-7
---

# 5. ECMAScript 2016(ES7)新特性简介

# 简介

自从ES6（ECMAScript 2015）在2015年发布以来，ECMAScript以每年一个版本的速度持续向前发展。到现在已经是ECMAScript 2020了。

每个版本都有一些新的特性，今天本文将会讲解ES7中带来的新特性。

# TC39和ECMAScript

先讲一下ECMA的历史，ECMA在于1960年4月27日成立的制造商协会，其目的是统一标准，方便在不同的制造商之间移植。于是这个协会被命名为European Computer Manufacturers Association，简称ECMA。

在1994，为了体现ECMA协会的全球性活动，改名为欧洲标准化信息和通信系统协会 European association for standardizing information and communication systems。虽然名字还保留了欧洲的字样，但是其本身已经是一个国际性协会了。

我们大概看一下ECMA协会的会员都有哪些，优先级最高的会员叫做Ordinary Members，基本上都是国际的大公司组成的：

![](https://img-blog.csdnimg.cn/20201010203035109.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

然后次一级的叫做Associate Members:

![](https://img-blog.csdnimg.cn/20201010203305833.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到里面有几个中国的公司，说明中国已经在世界上的规则制定方面有了一定的话语权。

TC39就是ECMA协会下属的一个专门用来指定ECMAScript标准的委员会。TC的意思是 Technical Committees。

ECMA下属的TC有很多个，而TC39专门就是负责ECMAScript的发展。

TC39下面又分为两个Task groups。分别是：

* TC39-TG1  —  General ECMAScript® Language 负责ECMAScript的发展
* TC39-TG2  —  ECMAScript® Internationalization API Specification 负责ECMAScript国际化API的制定

我们知道ES5是在2009年制定的，而ECMAScript 2015 (ES6)是在2015年制定的，因为ES6包含了6年的改动，所以ES6的改动非常的大。

为了减少各大厂商对ECMA脚本的升级适应压力，从ES6之后，ECMA协会决定每年发一个ECMA版本。

下面给大家讲解一下ECMAScript是怎么发布的。ECMAScript的发布主要分为下面的5个阶段：

* Stage 0: strawman 

这是自由提交的阶段，但是提交者必须是TC39 member 或者TC39 contributor。

* Stage 1: proposal 

Stage 0的strawman被TC39 review之后，就到了proposal阶段。

在这个阶段必须知道谁来负责这个proposal,同时需要提交这个提案的示例，API以及语义和算法的实现。还需要指明这个提案和现有的功能之间的可能冲突的地方。

如果这个提案被TC39接受了。那么表示TC39将会继续跟进这个提案。

* Stage 2: draft

这个是提案的第一个版本，该提案还必须具有对该功能的语法和语义的形式化描述（使用ECMAScript规范的形式语言）。描述需要应尽可能完整，但可以包含待办事项和占位符。

* Stage 3: candidate

这个阶段的提案已经大部分完成了，需要根据用户的反馈来进行下一步的调整。

* Stage 4： finished

这个阶段的提案已经准备被包含在下一个ECMAScript的版本中了。

# ECMAScript 2016(ES7)的新特性

实际上，ECMAScript 2016(ES7)只有两个新特性：

* Array.prototype.includes
* Exponentiation operator (**)

## Array的新方法includes

ES7为Array添加了新的方法includes，我们看下使用的例子：

~~~js
> ['a', 'b', 'c'].includes('a')
true
> ['a', 'b', 'c'].includes('d')
false
~~~

看一下includes的定义：

~~~js
Array.prototype.includes(value : any) : boolean
~~~

如果value包含在Array中，那么将会返回true，如果没有包含则会返回false。

可以看到includes和indexOf比较类似：

~~~js
arr.includes(x)
~~~

等价于：

~~~
arr.indexOf(x) >= 0
~~~

他们的区别在于，includes可以查找NaN，而indexOf不能：

~~~js
> [NaN].includes(NaN)
true
> [NaN].indexOf(NaN)
-1
~~~

另外include是不区分+0和-0的：

~~~js
> [-0].includes(+0)
true
~~~

我们知道JS中的数组除了Array之外，还有Typed Array，比如：

* Int8Array
* Uint8Array
* Uint8ClampedArray
* Int16Array
* Uint16Array
* Int32Array
* Uint32Array
* Float32Array
* Float64Array
* BigInt64Array
* BigUint64Array

所以includes方法也适用于TypedArray:

~~~js
let tarr = Uint8Array.of(12, 5, 3);
console.log(tarr.includes(5)); // true
~~~

## 幂操作符 ** 

ES7引入了幂操作符 ** ：

~~~js
> 6 ** 2
36
~~~

上面的例子表示的是6的2次方。

x ** y 的值和 Math.pow(x, y) 是等价的。

我们看下幂操作符的基本使用：

~~~js
const squared = 3 ** 2; // 9

let num = 3;
num **= 2;
console.log(num); // 9

function dist(x, y) {
  return Math.sqrt(x**2 + y**2);
}
~~~

幂操作符的优先级是非常高的，** > * > + 

~~~js
> 2**2 * 2
8
> 2 ** (2*2)
16
~~~

# 总结

ES7的新特性就这两个，比较简单，今天就介绍到这里。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！









