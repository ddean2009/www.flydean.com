javascript中的Strict模式

# 简介

我们都知道javascript是一个弱类型语言，在ES5之前，javascript的程序编写具有很强的随意性，我可以称之为懒散模式（sloppy mode）。比如可以使用未定义的变量，可以给对象中的任意属性赋值并不会抛出异常等等。

在ES5中，引入了strict模式，我们可以称之为严格模式。相应的sloppy mode就可以被称为非严格模式。

严格模式并不是非严格模式的一个子集，相反的严格模式在语义上和非严格模式都发生了一定的变化，所以我们在使用过程中，一定要经过严格的测试。以保证在严格模式下程序的执行和非严格模式下的执行效果一致。

# 使用Strict mode

strict mode会改变javascript的一些表现，我们将会在下一节中进行详细的讲解。

这里先来看一下，怎么使用strict mode。

Strict mode主要用在一个完整的脚本或者function中，并不适用于block {}。 如果在block中使用strict mode是不会生效的。

除此之外，eval中的代码，Function代码，event handler属性和传递给WindowTimers.setTimeout()的string都可以看做是一个完整的脚本。我们可以在其中使用Strict mode。

如果是在script脚本中使用strict模式，可以直接在脚本的最上面加上"use strict"：

~~~js
// 整个脚本的strict模式
'use strict';
var v = "Hi! I'm a strict mode script!";
~~~

同样的我们也可以在function中使用strict模式：

~~~js
function strict() {
  // 函数的strict模式
  'use strict';
  function nested() { return 'And so am I!'; }
  return "Hi!  I'm a strict mode function!  " + nested();
}
function notStrict() { return "I'm not strict."; }
~~~

如果使用的是ES6中引入的modules，那么modules中默认就已经是strict模式了，我们不需要再额外的使用"use strict"：

~~~js
function myModule() {
    // 默认就是strict模式
}
export default myModule;
~~~

# strict mode的新特性

strict mode在语法和运行时的表现上面和非严格模式都发生了一定的变化，接下来，我们一一来看。

## 强制抛出异常

在js中，有很多情况下本来可能是错误的操作，但是因为语言特性的原因，并没有抛出异常，从而导致最终运行结果并不是所期待的。

如果使用strict模式，则会直接抛出异常。

比如在strict模式中，不允许使用未定义的全局变量：

~~~js
'use strict';

globalVar = 10; //ReferenceError: globalVar is not defined
~~~

这样实际上可以避免手误导致变量名字写错而导致的问题。

我再看一些其他的例子：

~~~js
'use strict';

// 赋值给不可写的全局变量，
var undefined = 5; // throws a TypeError
var Infinity = 5; // throws a TypeError

// 赋值给不可写的属性
var obj1 = {};
Object.defineProperty(obj1, 'x', { value: 42, writable: false });
obj1.x = 9; // throws a TypeError

// 赋值给一个get方法
var obj2 = { get x() { return 17; } };
obj2.x = 5; // throws a TypeError

// 赋值给一个禁止扩展的对象
var fixed = {};
Object.preventExtensions(fixed);
fixed.newProp = 'ohai'; // throws a TypeError
~~~

Strict模式可以限制删除不可删除的属性，比如构造函数的prototype：

~~~js
'use strict';
delete Object.prototype; // throws a TypeError
~~~

禁止对象和函数参数中的重复属性：

~~~js
'use strict';
var o = { p: 1, p: 2 }; // Duplicate declaration

function sum(a, a, c) { // Duplicate declaration
    'use strict';
    return a + a + c;
}
~~~

禁止设置基础类型的属性：

~~~js
(function() {
'use strict';

false.true = '';         // TypeError
(14).sailing = 'home';   // TypeError
'with'.you = 'far away'; // TypeError

})();
~~~

# 简化变量的使用

使用Strict模式可以简化变量的使用，让程序代码可读性更强。

首先，strict模式禁止使用with。

with很强大，我们可以通过将对象传递给with，从而影响变量查找的scope chain。也就是说当我们在with block中需要使用到某个属性的时候，除了在现有的scope chain中查找之外，还会在with传递的对象中查找。

~~~js
with (expression)
  statement
~~~

使用with通常是为了简化我们的代码，比如：

~~~js
var a, x, y;
var r = 10;

with (Math) {
  a = PI * r * r;
  x = r * cos(PI);
  y = r * sin(PI / 2);
}
~~~

上面的例子中，PI是Math对象中的变量，但是我们可以在with block中直接使用。有点像java中的import的感觉。

下面的例子将会展示with在使用中的问题：

~~~js
function f(x, o) {
  with (o) {
    console.log(x);
  }
}
~~~

我们在with block中输出x变量，从代码可以看出f函数传入了一个x变量。但是如果with使用的对象中如果也存在x属性的话，就会出现意想不到的问题。

所以，在strict模式中，with是禁止使用的。

其次是对eval的改动。

传统模式中，eval中定义的变量，将会自动被加入到包含eval的scope中。我们看个例子：

~~~js
var x = 17;
var evalX = eval("var x = 42; x;");
console.log(x);
~~~

因为eval中引入了新的变量x，这个x的值将会覆盖最开始定义的x=17. 最后我们得到结果是42.

如果加入use strict，eval中的变量将不会被加入到现有的Scope范围中，我们将会得到结果17.

~~~js
var x = 17;
var evalX = eval("'use strict'; var x = 42; x;");
console.log(x);
~~~

这样做的好处是为了避免eval对现有程序逻辑的影响。

在strict模式下面，还不允许delete name：

~~~js
'use strict';

var x;
delete x; // !!! syntax error

eval('var y; delete y;'); // !!! syntax error~~
~~~

# 简化arguments

在js中，arguments代表的是参数数组，首先在Strict模式下，arguments是不能作为变量名被赋值的：

~~~js
'use strict';
arguments++;
var obj = { set p(arguments) { } };
try { } catch (arguments) { }
function arguments() { }
var f = new Function('arguments', "'use strict'; return 17;");
~~~

上面执行都会报错。

另外，在普通模式下，arguments是和命名参数相绑定的，并且arguments[0]和arg同步变化，都表示的是第一个参数。

但是如果在strict模式下，arguments表示的是真正传入的参数。

我们举个例子：

~~~js
function f(a) {
    a = 42;
    return [a, arguments[0]];
}
var pair = f(17);
console.log(pair[0]);  // 42
console.log(pair[1]);  // 42
~~~

上面的例子中，arguments[0]是和命名参数a绑定的，不管f传入的是什么值，arguments[0]的值最后都是42.

如果换成strict模式：

~~~js
function f(a) {
    'use strict';
    a = 42;
    return [a, arguments[0]];
}
var pair = f(17);
console.log(pair[0]); // 42
console.log(pair[1]);  // 17
~~~

这个模式下arguments[0]接收的是实际传入的参数，我们得到结果17.

在Strict模式下，arguments.callee是被禁用的。通常来说arguments.callee指向的是当前执行的函数，这会阻止虚拟机对内联的优化，所以在Strict模式下是禁止的。

# 让javascript变得更加安全

在普通模式下，如果我们在一个函数f()中调用this，那么this指向的是全局对象。在strict模式下，这个this的值是undefined。

如果我们是通过call或者apply来调用的话，如果传入的是primitive value（基础类型），在普通模式下this会自动指向其box类（基础类型对应的Object类型，比如Boolean，Number等等）。如果传入的是undefined和null，那么this指向的是global Object。

而在strict模式下，this指向的是传入的值，并不会做转换或变形。

下面的值都是true：

~~~js
'use strict';
function fun() { return this; }
console.assert(fun() === undefined);
console.assert(fun.call(2) === 2);
console.assert(fun.apply(null) === null);
console.assert(fun.call(undefined) === undefined);
console.assert(fun.bind(true)() === true);
~~~

为什么会安全呢？这就意味着，在strict模式下，不能通过this来指向window对象，从而保证程序的安全性。

另外，在普通模式下，我们可以通过fun.caller或者fun.arguments来获取到函数的调用者和参数，这有可能会访问到一些private属性或者不安全的变量，从而造成安全问题。

在strict模式下，fun.caller或者fun.arguments是禁止的。

~~~js
function restricted() {
  'use strict';
  restricted.caller;    // throws a TypeError
  restricted.arguments; // throws a TypeError
}
function privilegedInvoker() {
  return restricted();
}
privilegedInvoker();
~~~

# 保留关键字和function的位置

为了保证JS标准的后续发展，在strict模式中，不允许使用关键字作为变量名，这些关键字包括implements, interface, let, package, private, protected, public, static 和 yield等。

~~~js
function package(protected) { // !!!
  'use strict';
  var implements; // !!!

  interface: // !!!
  while (true) {
    break interface; // !!!
  }

  function private() { } // !!!
}
function fun(static) { 'use strict'; } // !!!
~~~

而对于function来说，在普通模式下，function是可以在任何位置的，在strict模式下，function的定义只能在脚本的顶层或者function内部定义：

~~~js

'use strict';
if (true) {
  function f() { } // !!! syntax error
  f();
}

for (var i = 0; i < 5; i++) {
  function f2() { } // !!! syntax error
  f2();
}

function baz() { // kosher
  function eit() { } // also kosher
}
~~~

# 总结

Strict模式为JS的后续发展和现有编程模式的规范都起到了非常重要的作用。但是如果我们在浏览器端使用的话，还是需要注意浏览器的兼容性，并做好严格的测试。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！















