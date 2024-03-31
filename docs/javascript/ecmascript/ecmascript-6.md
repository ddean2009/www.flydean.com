---
slug: /ecmascript-6
---

# 4. ECMAScript 6新特性简介

# 简介

ECMAScript 6.0（以下简称 ES6）是 JavaScript 语言的下一代标准，正式发布与2015年6月。它的目标，是使得JavaScript语言可以用来编写复杂的大型应用程序，成为企业级开发语言。

今天我们将会讲解一下ES6中引入的语法新特性。

# ECMAScript和JavaScript的关系

1996年11月，JavaScript 的创造者 Netscape 公司，决定将 JavaScript 提交给国际标准化组织ECMA.

1997年, ECMA 发布262号标准文件 ECMAScript 1.0。

ECMAScript 和 JavaScript 的关系是，前者是后者的规格，后者是前者的一种实现。

我们看一下ECMAScript的发行历史：

![](https://img-blog.csdnimg.cn/20200918214714471.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

从2015年ES2015，也就是ES6发布以来，ECMAScript以每年一个版本的发行速度发行到了ES2020。

后面的文章我们会讲解一下这些新版本的ECMAScript的新特性。

# let和const

ES6中引入了let和const,是为了解决之前的var变量的种种问题。

在ES6之前，JS中变量的作用域有两种：全局作用域和函数作用域。

全局作用域很好理解，我们在浏览器控制台或者 Node.js 交互终端中开始编写 JavaScript 时，即进入了所谓的全局作用域。

全局作用域的变量可以在任何其他作用域中访问。

函数作用域就是定义在函数内部的变量，在函数内部都可以访问到该变量。

这两种作用域会有一些问题：

1. 变量提升

var命令会发生”变量提升”现象，即变量可以在声明之前使用，值为undefined.

~~~js
// var 的情况 
console.log(foo);  // 输出undefined 
var foo = 2; 
~~~

2. 变量覆盖

当我们在函数作用域使用全局变量的时候，如果函数作用域中定义了同样名字的变量，不管是在哪里定义的，都会覆盖掉全局的变量。如下所示：

~~~js
var tmp = new Date(); 
function f() { 
console.log(tmp); 
if (false) { var tmp = "hello world"; 
} } 
f(); // undefined
~~~

3. 变量泄露

变量泄露的意思是，我们本来只希望在小范围作用域使用的变量，结果泄露到了范围外面，如下所示：

~~~js
var s = 'hello'; 
for (var i = 0; i < s.length; i++) { 
console.log(s[i]); 
} 
console.log(i); // 5
~~~

为了解决上面两个问题，ES6引入了let和const。

这两个都是块级作用域。不同的是const定义的变量初始化之后就不能变化了。

什么是块级作用域呢？类似于 if、switch 条件选择或者 for、while 这样的循环体即是所谓的块级作用域,或者更简单一点使用大括号括起来的就叫做块级作用域。

块级作用域的最大好处就是不会产生作用域提升，如下所示：

~~~js
{ 
let a = 10; 
var b = 1; 
} 
a // ReferenceError: a is not defined. 
b // 1
~~~

# 解构赋值

什么是解构赋值呢？

ES6 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为解构。

如下所示：

~~~js
let [a, b, c] = [1, 2, 3];
let [ , , third] = ["foo", "bar", "baz"];
let [x, , y] = [1, 2, 3];
let [head, ...tail] = [1, 2, 3, 4];

let [x, y] = [1, 2, 3];

~~~

解构赋值还可以设定默认值，我们来看下面的几个例子：

~~~js
let [foo = true] = []; 
foo // true

let [x, y = 'b'] = ['a']; 
// x='a', y='b' 

let [x, y = 'b'] = ['a', undefined]; 
// x='a', y='b’

let [x = 1] = [undefined]; 
x // 1
let [x = 1] = [null]; 
x // null
~~~

如果解构的默认值是一个函数，那么可以触发惰性赋值：

~~~js
function f() { 
console.log('aaa'); 
} 

let [x = f()] = [1];
~~~

上面的例子中，f函数将不会被执行。

除了解构变量之外，还可以解构对象：

~~~js
let { bar, foo } = { foo: "aaa", bar: "bbb" }; 
foo // "aaa" 
bar // "bbb" 

let { baz } = { foo: "aaa", bar: "bbb" }; 
baz // undefined

var { foo: baz } = { foo: 'aaa', bar: 'bbb' }; 
baz // "aaa" 

let obj = { first: 'hello', last: 'world' }; 
let { first: f, last: l } = obj; 
f // 'hello' 
l // 'world'
~~~

解构还支持嵌套的结构：

~~~js
let obj = { p: [ 'Hello', { y: 'World' } ] }; 

let { p: [x, { y }] } = obj; 

x // "Hello" 
y // "World"
~~~

解构赋值有两个非常重要的作用。

第一就是交换变量：

~~~js
let x = 1; 
let y = 2; 
[x, y] = [y, x];
~~~

我们就可以不再使用中间变量，直接进行两个变量值的交互。

第二个作用就是从函数中返回多个值：

~~~js
// 返回一个数组 
function example() { return [1, 2, 3]; } 
let [a, b, c] = example(); 

// 返回一个对象 
function example() { return { foo: 1, bar: 2 }; } 
let { foo, bar } = example();

//提取JSON数据
let jsonData = { id: 42, status: "OK", data: [867, 5309] }; 
let { id, status, data: number } = jsonData;
~~~

# 数组的扩展

ES6中的Array.from方法用于将下面两类对象转为真正的数组：

* 类似数组的对象（array-like object）
* 可遍历（iterable）的对象（包括ES6新增的数据结构Set和Map）。

什么是类似数组对象呢？

所谓类似数组的对象，本质特征只有一点，即必须有length属性。因此，任何有length属性的对象，都可以通过Array.from方法转为数组。

下面的变量就是类数组变量：

~~~js
let arrayLike = { '0': 'a', '1': 'b', '2': 'c', length: 3 }; 
~~~

这个类数组对象怎么转换成为数组呢？

~~~js
// ES5的写法 
var arr1 = [].slice.call(arrayLike); 
// ['a', 'b', 'c']

// ES6的写法 let arr2 = Array.from(arrayLike); 
// ['a', 'b', 'c']
~~~

我们看下通常的使用场景：

~~~js
// NodeList对象 
let ps = document.querySelectorAll('p'); 
Array.from(ps).forEach(function (p) { console.log(p); }); 

// arguments对象 
function foo() { var args = Array.from(arguments); 
// ... 
}
~~~

什么是可遍历对象呢？

只要是部署了Iterator接口的数据结构，都叫做可遍历对象。

我们看下下面的例子：

~~~js
Array.from('hello') // ['h', 'e', 'l', 'l', 'o'] 
let namesSet = new Set(['a', 'b']) 
Array.from(namesSet) // ['a', 'b']
~~~

同时还引入了扩展运算符（...），通过扩展运算符，也可以很方便的转换为数组对象：

~~~js
function foo() { var args = [...arguments]; } // arguments对象 
[...document.querySelectorAll('div')] // NodeList对象 
~~~

Array.from方法还可以接收第二个参数，用来对数组中的元素进行操作：

~~~js
Array.from(arrayLike, x => x * x); 
// 等同于 
Array.from(arrayLike).map(x => x * x); 

Array.from([1, 2, 3], (x) => x * x) 
// [1, 4, 9]
~~~

Array.of方法可以很方便的创建新的数组：

~~~js
Array.of(3, 11, 8) // [3,11,8] 
Array.of(3) // [3] 
Array.of(3).length // 1

Array() // [] 
Array(3) // [, , ,] 
Array(3, 11, 8) // [3, 11, 8]
~~~

# 函数的扩展

ES6，可以支持函数的默认值了：

~~~js
function log(x, y = 'World') { console.log(x, y); } 
function Point(x = 0, y = 0) { this.x = x; this.y = y; }
~~~

函数的默认值可以和解构赋值默认值组合起来使用：

~~~js
function foo({x, y = 5}) { console.log(x, y); } 
foo({}) // undefined, 5 
foo({x: 1}) // 1, 5 
foo({x: 1, y: 2}) // 1, 2 
foo() // TypeError: Cannot read property 'x' of undefined
~~~

接下来，我们看一个复杂的例子：

~~~js
// 写法一 
function m1({x = 0, y = 0} = {}) 
{ return [x, y]; } 

// 写法二 
function m2({x, y} = { x: 0, y: 0 }) 
{ return [x, y]; }
~~~

我们来看一下，上面的两种写法有什么不同呢？

当函数没有参数的情况：

~~~js
m1() // [0, 0] 
m2() // [0, 0] 
~~~

当x和y都有值的情况：

~~~js
m1({x: 3, y: 8}) // [3, 8] 
m2({x: 3, y: 8}) // [3, 8] 
~~~

当x有值，y无值的情况 ：

~~~js
m1({x: 3}) // [3, 0] 
m2({x: 3}) // [3, undefined] 
~~~

当x和y都无值的情况：

~~~js
m1({}) // [0, 0]; 
m2({}) // [undefined, undefined] 
m1({z: 3}) // [0, 0] 
m2({z: 3}) // [undefined, undefined]
~~~

看出区别了吗？ m1的解构赋值，对于x,y来说是有默认值0的。而m2的解构赋值对于x,y来说是没有默认值的。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！















