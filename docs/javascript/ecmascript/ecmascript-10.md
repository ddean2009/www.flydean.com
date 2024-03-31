---
slug: /ecmascript-10
---

# 1. ECMAScript 2019(ES10)新特性简介

# 简介

ES10是ECMA协会在2019年6月发行的一个版本，因为是ECMAScript的第十个版本，所以也称为ES10.

今天我们讲解一下ES10的新特性。

ES10引入了2大特性和4个小的特性，我们接下来一一讲解。

# Array的新方法flat和flatMap

在ES10中，给Array引入了两个新的方法，分别是flat和flatMap。

先来看一下flat。

我们看一下 Array&lt;T>.prototype.flat()  的定义：

~~~js
.flat(depth = 1): any[]
~~~

flat的作用是将Array中的Array中的内容取出来，放到最顶层Array中。我们可以传入一个depth参数，表示的是需要flat的Array层级。

举个例子：

~~~js
> [ 1,2, [3,4], [[5,6]] ].flat(0) // no change
[ 1, 2, [ 3, 4 ], [ [ 5, 6 ] ] ]

> [ 1,2, [3,4], [[5,6]] ].flat(1)
[ 1, 2, 3, 4, [ 5, 6 ] ]

> [ 1,2, [3,4], [[5,6]] ].flat(2)
[ 1, 2, 3, 4, 5, 6 ]
~~~

当depth=0的时候，就表示不会对Array内置的Array进行flat操作。

我们再看一下Array&lt;T>.prototype.flatMap()的定义：

~~~js
 .flatMap<U>(
  callback: (value: T, index: number, array: T[]) => U|Array<U>,
  thisValue?: any
): U[]
~~~

flatMap是map和flat的结合，下面的两个操作是等价的：

~~~js
arr.flatMap(func)
arr.map(func).flat(1)
~~~

我们看几个flatMap的例子：

~~~js
> ['a', 'b', 'c'].flatMap(x => x)
[ 'a', 'b', 'c' ]
> ['a', 'b', 'c'].flatMap(x => [x])
[ 'a', 'b', 'c' ]
> ['a', 'b', 'c'].flatMap(x => [[x]])
[ [ 'a' ], [ 'b' ], [ 'c' ] ]

> ['a', 'b', 'c'].flatMap((x, i) => new Array(i+1).fill(x))
[ 'a', 'b', 'b', 'c', 'c', 'c' ]
~~~

# Object的新方法fromEntries

Object.fromEntries的主要作用就是通过给定的[key,value]，来创建新的Object对象。

~~~js
var newObj =  Object.fromEntries([['foo',1], ['bar',2]]);
console.log(newObj);
{ foo: 1, bar: 2 }
~~~

上面例子中，我们通过给定的两个key-value对，创建了新的object对象。

和fromEntries相反的方法，就是Object.entries,用来遍历对象属性。

还是刚刚的例子，我们再调用一下Object.entries方法：

~~~js
console.log(Object.entries(newObj));
[ [ 'foo', 1 ], [ 'bar', 2 ] ]
~~~

# String的新方法trimStart和trimEnd

JS中已经有了trim的方法，可以消除String前后的空格。

~~~js
> '  abc  '.trim()
'abc'
~~~

但有时候可能需要消除前面或者后面的空格，ES10引入了trimStart和trimEnd方法：

~~~js
> '  abc  '.trimStart()
'abc  '
> '  abc  '.trimEnd()
'  abc'
~~~

> 注意，有些浏览器可能已经有了trimLeft和trimRight方法，在EMCAScript规范中，他们和trimStart，trimEnd是等价的。

# 可访问的Symbol的description属性

我们在创建Symbol的时候，可以传入一个description作为参数来构建Symbol：

~~~js
const sym = Symbol('www.flydean.com');
~~~

在ES10之前，我们想要访问Symbol的description是这样做的：

~~~js
console.log(String(sym));
//Symbol(www.flydean.com)
~~~

现在我们可以直接通过description属性来访问了：

~~~js
console.log(sym.description);
//www.flydean.com
~~~

# 可忽略的catch参数

在传统的写法中，catch是要接受一个error参数的：

~~~js
try {
  // ···
} catch (error) {
  // ···
}
~~~

但有时候我们已经知道这个异常是不重要的，或者说，我们想忽略掉这个异常，那么在ES10中，我们可以省略这个error参数：

~~~js
try {
  // ···
} catch {
  // ···
}
~~~

# Array的稳定排序

Array有个sort功能，可以根据元素内容进行排序。

ES10中引入了稳定排序的概念，也就是说如果排序的key是相同的，那么这些相同key的顺序在排序中是不会发生变化的。

举个例子：

~~~js
const arr = [
  { key: 'b', value: 1 },
  { key: 'a', value: 2 },
  { key: 'b', value: 3 },
];
~~~

~~~js
arr.sort((x, y) => x.key.localeCompare(y.key, 'en-US'));
~~~

我们根据key来进行排序，从而让a，排在b前面，但是两个key=b的元素位置是不会变化的。

~~~js
console.log(arr);
[
  { key: 'a', value: 2 },
  { key: 'b', value: 1 },
  { key: 'b', value: 3 }
]
~~~

# JSON.stringify

JSON是一个很方便的数据传输格式，它不像XML那么复杂，优点就是体积小，便于传输。

根据RFC3629的规范，在公共环境中传输JSON，必须使用UTF-8进行编码。

>  JSON text exchanged between systems that are not part of a closed
>  ecosystem MUST be encoded using UTF-8 [RFC3629].

在讲JSON.stringify之前，我们先回顾一下ES6中的Escape sequences。

ES6中有三种escape:

1. Hex escape:16进制escape。转义的是2位的16进制。

~~~js
  > '\x7A' === 'z'
  true
~~~

2. Unicode escape：转义的是4位的16进制

~~~js
 > '\u007A' === 'z'
  true
~~~

3. Unicode code point escape：转义的是1位或者多位的16进制

~~~js
  > '\u{7A}' === 'z'
  true
~~~

最后一个转义是在ES6中引入的。

unicode字符集最后是要存储到文件或者内存里面的，直接存储的话，空间占用太大。那怎么存呢？使用固定的1个字节，2个字节还是用变长的字节呢？于是我们根据编码方式的不同，分成了UTF-8，UTF-16，UTF-32等多种编码方式。

其中UTF-8是一种变长的编码方案，它使用1-4个字节来存储。UTF-16使用2个或者4个字节来存储。

而UTF-32是使用4个字节来存储。这三种编码方式中，只有UTF-8是兼容ASCII的，这也是为什么国际上UTF-8编码方式比较通用的原因（毕竟计算机技术都是西方人搞出来的）。

我们知道在Unicode编码中，U+D800到U+DFFF的这些字符是预留给UTF-16使用，如果我们输入的是这个范围内的字符的话，是无法被转换成为UTF-8格式的。

这就是原来的JSON.stringify可能出现的问题。

在ES10中，JSON.stringify对于这些不可转换成UTF-8的字符，直接返回对应的code unit escape sequences。

~~~js
console.log(JSON.stringify('\u{D800}'));
"\ud800"
~~~

# JSON 被归为ECMAScript的子集

在之前，JSON不是ECMAScript的子集，从而导致有些可以在JSON中包含的字符，不能够在ECMAScript的字面量中出现，比如U+2028 和U+2029 ：

~~~js
const sourceCode = '"\u2028"';
eval(sourceCode); // SyntaxError

JSON.parse(json); // OK
~~~

这次改变之后，我们在编码的时候就不需要再去区分是JSON还是ECMAScript了。

# Function的toString方法

在ES10中，如果Function可以通过以ECMAScript源代码的方式表示的话，则toString会直接返回这个函数的代码：

~~~js
> class C { foo() { /*hello*/ } }
> C.prototype.foo.toString()
'foo() { /*hello*/ }'
~~~

如果是一些native的方法，比如底层c或者c++实现的代码，则直接返回`[native code]`:

~~~js
> Math.pow.toString()
'function pow() { [native code] }'
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！

