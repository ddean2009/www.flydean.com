---
slug: /js-built-in-objects-structures
---

# 13. javascript中的内置对象和数据结构

# 简介

基本上所有的程序员都使用过javascript，我们在web中使用javascript，我们在服务器端使用nodejs，js给大家的第一映像就是简单，但是可能并不是所有人都系统的了解过js中的内置对象和数据结构。

今天，一起来看看吧。

# 基础类型

js是一种弱类型的动态语言，虽然是弱类型的，但是js本身定义了很多种数据类型。

js中有7种基础类型：分别是undefined，Boolean，Number，String，BigInt，Symbol和null。

## undefined

undefined会自动赋值给刚刚声明的变量。举个例子：

~~~js
var x; //create a variable but assign it no value

console.log("x's value is", x) //logs "x's value is undefined"
~~~

## Boolean和Boolean对象

Boolean的值就是true 或者 false。

除了基础类型的Boolean值外，还有一个Boolean对象，用来封装boolean值。

如果是用new Boolean来构造Boolean对象的话，下面的例子中Boolean的初始值都是false：

~~~js
var bNoParam = new Boolean();
var bZero = new Boolean(0);
var bNull = new Boolean(null);
var bEmptyString = new Boolean('');
var bfalse = new Boolean(false);
~~~

下面boolean对象的初始值都是true：

~~~js
var btrue = new Boolean(true);
var btrueString = new Boolean('true');
var bfalseString = new Boolean('false');
var bSuLin = new Boolean('Su Lin');
var bArrayProto = new Boolean([]);
var bObjProto = new Boolean({});
~~~

注意，我们不要使用Boolean对象来进行if条件的判断，任何Boolean对象，即使是初始值是false的Boolean对象，if条件判断，都是true：

~~~js
var x = new Boolean(false);
if (x) {
  // this code is executed
}

var x = false;
if (x) {
  // this code is not executed
}
~~~

如果非要使用if条件判断，我们可以使用Boolean函数或者！！如下所示：

~~~js
var x = Boolean(expression);     // use this...
var x = !!(expression);          // ...or this
var x = new Boolean(expression); // don't use this!
~~~

## Number和BigInt

Number和BigInt是JS中的两个数字类型，其中Number表示的双精度64位二进制格式，其范围是-(2<sup>53</sup> − 1) and 2<sup>53</sup> − 1.

除此之外，Number还有三个值：+Infinity, -Infinity, 和 NaN。

前面两个表示的是正负最大值。NaN表示的是 Not-A-Number。

我们可以通过isNaN来判断是否是一个Number：

~~~js
function sanitise(x) {
  if (isNaN(x)) {
    return NaN;
  }
  return x;
}

console.log(sanitise('1'));
// expected output: "1"

console.log(sanitise('NotANumber'));
// expected output: NaN
~~~

BigInt表示任意精度的整数，使用BigInt可以进行超出Number精度整数的运算。

我们可以通过在整数后面加上n来表示BigInt。

~~~js
> const x = 2n ** 53n;
9007199254740992n
> const y = x + 1n; 
9007199254740993n
~~~

> 注意，和Boolean一样，Number和BitInt也有wrapper对象类型。

看下Number的wrapper：

~~~js
Number('123')  // returns the number 123
Number('123') === 123  // true

Number("unicorn")  // NaN
Number(undefined)  // NaN
~~~

看下BitInt的wrapper类型：

~~~js
const theBiggestInt = 9007199254740991n

const alsoHuge = BigInt(9007199254740991)
// ↪ 9007199254740991n

const hugeString = BigInt("9007199254740991")
// ↪ 9007199254740991n

const hugeHex = BigInt("0x1fffffffffffff")
// ↪ 9007199254740991n

const hugeBin = BigInt("0b11111111111111111111111111111111111111111111111111111")
// ↪ 9007199254740991n
~~~

## String

js中的String是不可变的，同样的String基础类型也有和它对应的String wrapper对象。

String基础类型和不使用new的String函数是一致的：

~~~js
const string1 = "A string primitive";
const string2 = String('A string primitive');
~~~

上面两个String是一致的。但是如果使用new来构造String对象，那么两者是不一样的：

~~~js
let s_prim = 'foo'
let s_obj = new String(s_prim)

console.log(typeof s_prim) // Logs "string"
console.log(typeof s_obj)  // Logs "object"

let s1 = '2 + 2'              // creates a string primitive
let s2 = new String('2 + 2')  // creates a String object
console.log(eval(s1))         // returns the number 4
console.log(eval(s2))         // returns the string "2 + 2"
~~~

我们可以通过String对象的valueOf()方法，获得其String基础类型。

## Symbol

Symbol是一个唯一的不可变的基础类型，一般用在对象的key中。

~~~js
// Here are two symbols with the same description:
let Sym1 = Symbol("Sym")
let Sym2 = Symbol("Sym")
  
console.log(Sym1 === Sym2) // returns "false"
~~~

Symbol是不支持new操作的：

~~~js
let sym = new Symbol()  // TypeError
~~~

如果你真的想创建Symbol对象，则可以使用Object()：

~~~js
let sym = Symbol('foo')
typeof sym      // "symbol" 
let symObj = Object(sym)
typeof symObj   // "object"
~~~

## null

null表示引用的是无效的Object对象或者地址。

虽然null可以看做是primitive，但是null其实是一个Object，所有的对象都来自null：

~~~js
typeof null === 'object' // true
~~~

# Object

Object是js中的一种数据类型，几乎所有的对象都继承自Object，它存储的是key-value形式的数据，我们可以通过使用Ojbect()方法或者new Object()或者Object字面量的方式来创建Object。

~~~js
let o = {}
let o = {a: 'foo', b: 42, c: {}}

let a = 'foo', b = 42, c = {}
let o = {a: a, b: b, c: c}
~~~

> 注意使用Object()或者new Object()是一样的效果，都会得到一个Object对象。

在ES2015之后，我们还可以使用动态的对象属性：

~~~js
let param = 'size'
let config = {
  [param]: 12,
  ['mobile' + param.charAt(0).toUpperCase() + param.slice(1)]: 4
}

console.log(config) // {size: 12, mobileSize: 4}
~~~

# Function

Function也是一个Object，JS中的所有函数都是Function对象。

~~~js
(function(){}).constructor === Function
~~~

那么通过Function构造函数和function函数定义创建出来的函数有什么区别呢？

使用new Function创建的函数，其作用域范围是global，我们看一下具体的例子：

~~~js
var x = 10;

function createFunction1() {
    var x = 20;
    return new Function('return x;'); // this |x| refers global |x|
}

function createFunction2() {
    var x = 20;
    function f() {
        return x; // this |x| refers local |x| above
    }
    return f;
}

var f1 = createFunction1();
console.log(f1());          // 10
var f2 = createFunction2();
console.log(f2());          // 20
~~~

# Date

Date是js中用来操作时间的Object。我们看下Date的常用例子：

~~~js
let today = new Date()
let birthday = new Date('December 17, 1995 03:24:00')
let birthday = new Date('1995-12-17T03:24:00')
let birthday = new Date(1995, 11, 17)            // the month is 0-indexed
let birthday = new Date(1995, 11, 17, 3, 24, 0)
let birthday = new Date(628021800000)            // passing epoch timestamp

let [month, date, year]    = ( new Date() ).toLocaleDateString().split("/")
let [hour, minute, second] = ( new Date() ).toLocaleTimeString().slice(0,7).split(":")
~~~

# Array

JS内置了很多种不同类型的Array，最常用的就是Array字面量和Array Object。

我们看下怎么创建一个Array：

~~~js
let fruits = ['Apple', 'Banana'];

console.log(fruits.length); // 2
console.log(fruits[0]);     // "Apple"

let fruits = new Array('Apple', 'Banana');

console.log(fruits.length); // 2
console.log(fruits[0]);     // "Apple"
~~~

遍历Array：

~~~js
let fruits = ['Apple', 'Banana']
fruits.forEach(function(item, index, array) {
  console.log(item, index)
})
// Apple 0
// Banana 1
~~~

添加Item到Array：

~~~js
let newLength = fruits.push('Orange')
// ["Apple", "Banana", "Orange"]
~~~

从最后删除item：

~~~js
let last = fruits.pop() // remove Orange (from the end)
// ["Apple", "Banana"]
~~~

从前面删除item：

~~~js
let first = fruits.shift() // remove Apple from the front
// ["Banana"]
~~~

从前面添加item：

~~~js
let newLength = fruits.unshift('Strawberry') // add to the front
// ["Strawberry", "Banana"]
~~~

删除某个index的item：

~~~js
let removedItem = fruits.splice(pos, 1) // this is how to remove an item

// ["Strawberry", "Mango"]
~~~

删除多个item：

~~~js
let vegetables = ['Cabbage', 'Turnip', 'Radish', 'Carrot']
console.log(vegetables)
// ["Cabbage", "Turnip", "Radish", "Carrot"]

let pos = 1
let n = 2

let removedItems = vegetables.splice(pos, n)
// this is how to remove items, n defines the number of items to be removed,
// starting at the index position specified by pos and progressing toward the end of array.

console.log(vegetables)
// ["Cabbage", "Carrot"] (the original array is changed)

console.log(removedItems)
// ["Turnip", "Radish"]
~~~

拷贝array：

~~~js
let shallowCopy = fruits.slice() // this is how to make a copy
// ["Strawberry", "Mango"]
~~~

除了Array之外，JS还内置了特定类型的Array：

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

这些特定类型的Array中只能存储特定类型的值。

# Keyed collections

除了数组之外，JS中还有key-value的集合，比如：Map，Set，WeakMap和WeakSet。

对Map来说，我们可以通过使用set，get，has，delete等犯法来对Map进行操作：

~~~js
let contacts = new Map()
contacts.set('Jessie', {phone: "213-555-1234", address: "123 N 1st Ave"})
contacts.has('Jessie') // true
contacts.get('Hilary') // undefined
contacts.set('Hilary', {phone: "617-555-4321", address: "321 S 2nd St"})
contacts.get('Jessie') // {phone: "213-555-1234", address: "123 N 1st Ave"}
contacts.delete('Raymond') // false
contacts.delete('Jessie') // true
console.log(contacts.size) // 1
~~~

遍历Map：

~~~js
let myMap = new Map()
myMap.set(0, 'zero')
myMap.set(1, 'one')

for (let [key, value] of myMap) {
  console.log(key + ' = ' + value)
}
// 0 = zero
// 1 = one

for (let key of myMap.keys()) {
  console.log(key)
}
// 0
// 1

for (let value of myMap.values()) {
  console.log(value)
}
// zero
// one

for (let [key, value] of myMap.entries()) {
  console.log(key + ' = ' + value)
}
// 0 = zero
// 1 = one
~~~

使用forEach来遍历map：

~~~js
myMap.forEach(function(value, key) {
  console.log(key + ' = ' + value)
})
// 0 = zero
// 1 = one
~~~

Set中存储的是唯一的对象。

我们看下Set的操作：

~~~js
let mySet = new Set()

mySet.add(1)           // Set [ 1 ]
mySet.add(5)           // Set [ 1, 5 ]

mySet.has(1)              // true
mySet.delete(1)    // removes 1 from the set
~~~

set的遍历：

~~~js
// logs the items in the order: 1, "some text", {"a": 1, "b": 2}, {"a": 1, "b": 2} 
for (let item of mySet) console.log(item)
~~~

WeakMap,WeakSet和Map于Set的区别在于，WeakMap的key只能是Object对象，不能是基本类型。

为什么会有WeakMap呢？

对于JS中的Map来说，通常需要维护两个数组，第一个数组中存储key，第二个数组中存储value。每次添加和删除item的时候，都需要同时操作两个数组。

这种实现有两个缺点，第一个缺点是每次查找的时候都需要遍历key的数组，然后找到对应的index，再通过index来从第二个数组中查找value。

第二个缺点就是key和value是强绑定的，即使key不再被使用了，也不会被垃圾回收。

所以引入了WeakMap的概念，在WeakMap中，key和value没有这样的强绑定关系，key如果不再被使用的话，可以被垃圾回收器回收。

因为引用关系是weak的，所以weakMap不支持key的遍历，如果你想遍历key的话，请使用Map。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！











