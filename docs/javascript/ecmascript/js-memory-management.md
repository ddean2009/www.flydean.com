---
slug: /js-memory-management
---

# 15. javascript中的内存管理

# 简介

在c语言中，我们需要手动分配和释放对象的内存，但是在java中，所有的内存管理都交给了java虚拟机，程序员不需要在手动进程内存的分配和释放，大大的减少了程序编写的难度。

同样的，在javascript中，内存管理也是自动进行的，虽然有自动的内存管理措施，但是这并不意味着程序员就不需要关心内存管理了。

本文将会进行详细的介绍javascript中的内存管理策略。

# 内存生命周期

对于任何程序来说，内存的生命周期通常都是一样的。

可以分为三步：

1. 在可用空间分配内存
2. 使用该内存空间
3. 在使用完毕之后，释放该内存空间

所有的程序都需要手动执行第二步，对于javascript来说，第1，3两步是隐式实现的。

我们看下javascript中分配内存空间的例子。

通过初始化分配内存空间：

~~~js
var n = 123; // 为数字分配内存
var s = 'azerty'; // 为String分配内存

var o = {
  a: 1,
  b: null
}; // 为对象分配内存

// 为数组分配内存
var a = [1, null, 'abra']; 

function f(a) {
  return a + 2;
} // 为函数分配内存
~~~

通过函数调用分配内存空间：

~~~js
var d = new Date(); // 通过new分配date对象

var e = document.createElement('div'); // 分配一个DOM对象

var s = 'azerty';
var s2 = s.substr(0, 3); // 因为js中字符串是不可变的，所以substr的操作将会创建新的字符串

var a = ['ouais ouais', 'nan nan'];
var a2 = ['generation', 'nan nan'];
var a3 = a.concat(a2); 
// 同样的，concat操作也会创建新的字符串
~~~

释放空间最难的部分就是需要判断空间什么时候不再被使用。在javascript中这个操作是由GC垃圾回收器来执行的。

垃圾回收器的作用就是在对象不再被使用的时候进行回收。

# JS中的垃圾回收器

判断一个对象是否可以被回收的一个非常重要的标准就是引用。

如果一个对象被另外一个对象所引用，那么这个对象肯定是不能够被回收的。

## 引用计数垃圾回收算法

引用计数垃圾回收算法是一种比较简单和简洁的垃圾回收算法。他把对象是否能够被回收转换成了对象是否仍然被其他对象所引用。

如果对象没有被引用，那么这个对象就是可以被垃圾回收的。

我们举一个引用计数的例子：

~~~js
var x = { 
  a: {
    b: 2
  }
}; 
//我们创建了两个对象，a对象和a外面用大括号创建的对象。
// 我们将大括号创建的对象引用赋值给了x变量，所以x拥有大括号创建对象的引用，该对象不能够被回收。
// 同时，因为a对象是创建在大括号对象内部的，所以大括号对象默认拥有a对象的引用
// 因为两个对象都有引用，所以都不能够被垃圾回收

var y = x;  //我们将x赋值给y，大括号对象现在拥有两个引用

x = 1;   // 我们将1赋值给x，这样只有y引用了大括号的对象

var z = y.a;  // 将y中的a对象引用赋值给z，a对象拥有两个引用

y = 'flydean';  // 重新赋值给y，大括号对象的引用数为0，大括号对象可以被回收了，但是因为其内部的a对象还有一个z在被引用
                // 所以暂时不能被回收

z = null;       // z引用也被重新赋值，a对象的引用数为0，两个对象都可以被回收了
~~~

引用计数的一个缺点就是可能会出现循环引用的情况。

考虑下面的一个例子：

~~~js
function f() {
  var x = {};
  var y = {};
  x.a = y;        // x references y
  y.a = x;        // y references x

  return 'flydean';
}

f();
~~~

在上面的例子中，x中的a属性引用了y。而y中的a属性又引用了x。

从而导致循环引用的情况，最终导致内存泄露。

在实际的应用中，IE6 和IE7 对DOM对象使用的就是引用计数的垃圾回收算法，所以可能会出现内存泄露的情况。

~~~js
var div;
window.onload = function() {
  div = document.getElementById('myDivElement');
  div.circularReference = div;
  div.lotsOfData = new Array(10000).join('*');
};
~~~

上面的例子中，DOM中的myDivElement元素使用circularReference引用了他本身，如果在引用计数的情况下，myDivElement是不会被回收的。

当myDivElement中包含了大量的数据的时候，即使myDivElement从DOM tree中删除了，myDivElement也不会被垃圾回收，从而导致内存泄露。

## Mark-and-sweep回收算法

讲到这里，大家是不是觉得JS的垃圾回收算法和java中的很类似，java中也有引用计数和mark-and-sweep清除算法。

这种回收算法的判断标准是对象不可达。

在javascript中，通过扫描root对象（JS中的root对象那些全局对象），然后找到这些root对象的引用对象，然后再找到这些被引用对象的引用对象，一层一层的往后查找。

最后垃圾回收器会找到所有的可达的对象和不可达的对象。

使用不可达来标记不再被使用的对象可以有效的解决引用计数法中出现的循环引用的问题。

事实上，现在基本上所有的现代浏览器都支持Mark-and-sweep回收算法。

# 调试内存问题

如果发送了内存泄露，我们该怎么调试和发现这个问题呢？

在nodejs中我们可以添加--inspect，然后借助Chrome Debugger来完成这个工作：

~~~js
node --expose-gc --inspect index.js
~~~

上面的代码将会开启nodejs的调试功能。

我们看下输出结果：

~~~js
Debugger listening on ws://127.0.0.1:9229/88c23ae3-9081-41cd-98b0-d0f7ebceab5a
For help, see: https://nodejs.org/en/docs/inspector
~~~

结果告诉了我们两件事情，第一件事情就是debugger监听的端口。默认情况下将会开启127.0.0.1的9229端口。并且分配了一个唯一的UUID以供区分。

第二件事情就是告诉我们nodejs使用的调试器是Inspector。

使用Chrome devTools进行调试的前提是我们已经开启了 --inspect模式。

在chrome中输入chrome://inspect：

![](https://img-blog.csdnimg.cn/2020092722070968.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

我们可看到chrome inspect的界面，如果你本地已经有开启inspect的nodejs程序的话，在Remote Target中就可以直接看到。

选中你要调试的target，点击inspect，即可开启Chrome devTools调试工具：

![](https://img-blog.csdnimg.cn/20200927180744257.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

你可以对程序进行profile，也可以进行调试。

# 闭包Closures中的内存泄露

所谓闭包就是指函数中的函数，内部函数可以访问外部函数的参数或者变量，从而导致外部函数内部变量的引用。

我们看一个简单闭包的例子：

~~~js
 function parentFunction(paramA)
 {
 var a = paramA;
 function childFunction()
 {
 return a + 2;
 }
 return childFunction();
 }
~~~

上面的例子中，childFunction引用了parentFunction的变量a。只要childFunction还在被使用，a就无法被释放，从而导致parentFunction无法被垃圾回收。事实上Closure默认就包含了对父function的引用。

我们看下面的例子：

~~~html
 <html>
 <body>
 <script type="text/javascript">
 document.write("Program to illustrate memory leak via closure");
 window.onload=function outerFunction(){
 var obj = document.getElementById("element");
 obj.onclick=function innerFunction(){
 alert("Hi! I will leak");
 };
 obj.bigString=new Array(1000).join(new Array(2000).join("XXXXX"));
 // This is used to make the leak significant
 };
 </script>
 <button id="element">Click Me</button>
 </body>
 </html>
~~~

上面的例子中，obj引用了 DOM 对象element，而element的onclick是outerFunction的内部函数，从而导致了对外部函数的引用，从而引用了obj。

这样最终导致循环引用，造成内存泄露。

怎么解决这个问题呢？

一个简单的办法就是在使用完obj之后，将其赋值为null，从而中断循环引用的关系：

~~~html
 <html>
 <body>
 <script type="text/javascript">
 document.write("Avoiding memory leak via closure by breaking the circular
 reference");
 window.onload=function outerFunction(){
 var obj = document.getElementById("element");
 obj.onclick=function innerFunction()
 {
 alert("Hi! I have avoided the leak");
 // Some logic here
 };
 obj.bigString=new Array(1000).join(new Array(2000).join("XXXXX"));
 obj = null; //This breaks the circular reference
 };
 </script>
 <button id="element">"Click Here"</button>
 </body>
 </html>
~~~

还有一种很简洁的办法就是不要使用闭包，将其分成两个独立的函数：

~~~html
 <html>
 <head>
 <script type="text/javascript">
 document.write("Avoid leaks by avoiding closures!");
 window.onload=function()
 {
 var obj = document.getElementById("element");
 obj.onclick = doesNotLeak;
 }
 function doesNotLeak()
 {
 //Your Logic here
 alert("Hi! I have avoided the leak");
 }
 </script>
 </head>
 <body>
 <button id="element">"Click Here"</button>
 </body>
 </html>
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！













