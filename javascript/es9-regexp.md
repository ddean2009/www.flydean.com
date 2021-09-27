ES9的新特性:正则表达式RegExp

# 简介

正则表达式是我们做数据匹配的时候常用的一种工具，虽然正则表达式的语法并不复杂，但是如果多种语法组合起来会给人一种无从下手的感觉。

于是正则表达式成了程序员的噩梦。今天我们来看一下如何在ES9中玩转正则表达式。

# Numbered capture groups

我们知道正则表达式可以分组，分组是用括号来表示的，如果想要获取到分组的值，那么就叫做capture groups。

通常来说，我们是通过序号来访问capture groups的，这叫做Numbered capture groups。

举个例子：

~~~js
const RE_DATE = /([0-9]{4})-([0-9]{2})-([0-9]{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj[1]; // 1999
const month = matchObj[2]; // 12
const day = matchObj[3]; // 31
~~~

上面的正则表达式要匹配年月日，然后通过exec方法，返回match的数组。这个数组存储的是匹配的groups信息。

因为我们有三个括号，所以可以匹配三个group。然后通过1，2，3来访问特定的group。

我们把上面的matchObj输出看一下其中的内容：

~~~js
[
  '1999-12-31',
  '1999',
  '12',
  '31',
  index: 0,
  input: '1999-12-31',
  groups: undefined
]
~~~

可以看到matchObj是一个数组，index 0存储的是要匹配的字符串。这里我们看到matchObj还有一个groups是undefined，这个groups就是命名groups。

# Named capture groups

上面讲到了numbered capture groups是通过序列号来访问到匹配的数据。但是匹配到的group是没有名字的。

我们看下怎么才能够给这些groups起个名字：

~~~js
const RE_DATE = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj.groups.year; // 1999
const month = matchObj.groups.month; // 12
const day = matchObj.groups.day; // 31
~~~

看下matchObj的内容：

~~~js
[
  '1999-12-31',
  '1999',
  '12',
  '31',
  index: 0,
  input: '1999-12-31',
  groups: [Object: null prototype] { year: '1999', month: '12', day: '31' }
]
~~~

可以看到，这次多了groups的信息。

如果要匹配我们之前匹配过的group信息，则可以使用numbered groups的 \k 或者 named groups的 \k&lt;name>.

我们看一个例子：

~~~js
const RE_TWICE = /^(?<word>[a-z]+)!\k<word>$/;
RE_TWICE.test('abc!abc'); // true
RE_TWICE.test('abc!ab'); // false
~~~

~~~js
const RE_TWICE = /^(?<word>[a-z]+)!\1$/;
RE_TWICE.test('abc!abc'); // true
RE_TWICE.test('abc!ab'); // false
~~~

两种语法都可以使用。

Named capture groups还可以和replace一起使用。

有了group name，我们可以直接在replace中使用group name来做引用：

~~~js
const RE_DATE = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/;
console.log('1999-12-31'.replace(RE_DATE,
    '$<month>/$<day>/$<year>'));
    // 12/31/1999
~~~

replace的第二个参数还可以是一个函数，函数的参数就是我们group出来的一些内容：

~~~js
const RE_DATE = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/;
console.log('1999-12-31'.replace(
    RE_DATE,
    (g0,y,m,d,offset,input, {year, month, day}) => // (A)
        month+'/'+day+'/'+year));
    // 12/31/1999
~~~

上面的例子中，g0 = 1999-12-31 表示匹配的子字符串。 y, m, d 匹配的是numbered groups 1，2，3。

input 是整个的输入。{year, month, day} 匹配的是named groups。

# RegExp中Unicode属性的转义

在Unicode标准中，每一个字符都有属性，简单点说属性就是用来描述这个字符的。

比如说General_Category表示的是字符的分类： x: General_Category = Lowercase_Letter

White_Space表示的是空格，tabs和换行： \t: White_Space = True

Age表示的是该字符什么时候被加入到Unicode中等等。

这些属性还有对应的缩写： Lowercase_Letter = Ll ， Currency_Symbol = Sc 等等。

举个例子，比如说我们想匹配空格。传统做法是这样做的：

~~~js
> /^\s+$/.test('\t \n\r')
true
~~~

前面是正则表达式，然后使用一个test方法来匹配字符串，最终得到的true。

刚刚讲到了unicode的属性，我们也可以用属性来匹配：

~~~js
> /^\p{White_Space}+$/u.test('\t \n\r')
true
~~~

属性匹配使用的是`\p`, 后面跟的是属性值。

注意，我们还要在正则表达式后面加上u，以表示使用的是Unicode属性转义。

# lookaround assertion

lookaround assertion可以被翻译为环视断言，它是正则表达式中的一种结构，用来判断要匹配的对象的前后环境是什么样的。

有两种lookaround assertion，一种是Lookahead一种是Lookbehind。

我们先看一下Lookahead的使用：

~~~js
const RE_AS_BS = /aa(?=bb)/;
const match1 = RE_AS_BS.exec('aabb');
console.log(match1[0]); // 'aa'

const match2 = RE_AS_BS.exec('aab');
console.log(match2); // null
~~~

lookahead就是向前查看，上面我们使用的是`(?=bb)` 来向前匹配bb。

> 注意，虽然正则表达式匹配上了aabb，但是match中并不包含bb。

结果是第一个匹配上了，第二个没有匹配。

除了是用`?=` 之外，我们还可以使用`?!`  表示不等：

~~~js
> const RE_AS_NO_BS = /aa(?!bb)/;
> RE_AS_NO_BS.test('aabb')
false
> RE_AS_NO_BS.test('aab')
true
> RE_AS_NO_BS.test('aac')
true
~~~

再来看一下Lookbehind的使用。

Lookbehind和Lookahead查询的方向刚刚相反。

向后匹配是使用`?<=`来表示的，我们来看一个例子：

~~~js
const RE_DOLLAR_PREFIX = /(?<=\$)foo/g;
'$foo %foo foo'.replace(RE_DOLLAR_PREFIX, 'bar');
    // '$bar %foo foo'
~~~

上面的例子中，我们匹配了最前面的$，然后使用bar替换掉了foo。

同样的，我们也可以使用`?<!` 来表示非相等的情况：

~~~js
const RE_NO_DOLLAR_PREFIX = /(?<!\$)foo/g;
'$foo %foo foo'.replace(RE_NO_DOLLAR_PREFIX, 'bar');
    // '$foo %bar bar'
~~~

# dotAll flag

正常情况下dot . 代表的是一个字符，但是这个字符不能够代表行的结束符：

~~~js
> /^.$/.test('\n')
false
~~~

而dotAll是在 dot . 匹配后面引入的s, 它可以被用来匹配行的结束符：

~~~js
> /^.$/s.test('\n')
true
~~~

在ES中，有下面几种字符表示的都是行的结束符：

* U+000A LINE FEED (LF) (\n)
* U+000D CARRIAGE RETURN (CR) (\r)
* U+2028 LINE SEPARATOR
* U+2029 PARAGRAPH SEPARATOR

# 总结

以上就是ES9中引入的正则表达式RegExp的新特性了，希望大家能够喜欢。


> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！   








