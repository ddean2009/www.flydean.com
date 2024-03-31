---
slug: /js-closure
---

# 14. javascript中的闭包closure详解

# 简介

闭包closure是javascript中一个非常强大的功能。所谓闭包就是函数中的函数，内部函数可以访问外部函数的作用域范围，从而可以使用闭包来做一些比较强大的工作。

今天将会给大家详细介绍一下闭包。

# 函数中的函数

我们提到了函数中的函数可以访问父函数作用域范围的变量，我们看一个例子：

~~~js
function parentFunction() {
  var address = 'flydean.com'; 
  function alertAddress() { 
    alert(address); 
  }
  alertAddress();
}
parentFunction();
~~~

上面的例子中，我们在parentFunction中定义了一个变量address，在parentFunction内部定义了一个alertAddress方法，在该方法内部访问外部函数中定义的address变量。

上面代码运行是没问题的，可以正确的访问到数据。

# Closure闭包

函数中的函数有了，那么什么是闭包呢？

我们看下面的例子：

~~~js
function parentFunction() {
  var address = 'flydean.com'; 
  function alertAddress() { 
    alert(address); 
  }
  return alertAddress;
}
var myFunc = parentFunction();
myFunc();
~~~

这个例子和第一个例子很类似，不同之处就是我们将内部函数返回了，并且赋值给了myFunc。

接下来我们直接调用了myFunc。

myFunc中访问了parentFunction中的address变量，虽然parentFunction已经执行完毕返回。

但是我们在调用myFunc的时候，任然可以访问到address变量。这就是闭包。

闭包的这个特性非常拥有，我们可以使用闭包来生成function factory,如下所示：

~~~js
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

var add5 = makeAdder(5);
var add10 = makeAdder(10);

console.log(add5(2));  // 7
console.log(add10(2)); // 12
~~~

其中add5和add10都是闭包，他们是由makeAdder这个function factory创建出来的。通过传递不同的x参数，我们得到了不同的基数的add方法。

最终生成了两个不同的add方法。

使用function factory的概念，我们可以考虑一个闭包的实际应用，比如我们在页面上有三个button，通过点击这些button可实现修改字体的功能。

我们可以先通过function factory来生成三个方法：

~~~js
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);
~~~

有了这三个方法，我们把DOM元素和callback方法绑定起来：

~~~js
document.getElementById('size-12').onclick = size12;
document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
~~~

# 使用闭包实现private方法

对比java来说，java中有private访问描述符，通过private，我们可以指定方法只在class内部访问。

当然，在JS中并没有这个东西，但是我们可以使用闭包来达到同样的效果。

~~~js
var counter = (function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }

  return {
    increment: function() {
      changeBy(1);
    },

    decrement: function() {
      changeBy(-1);
    },

    value: function() {
      return privateCounter;
    }
  };
})();

console.log(counter.value());  // 0.

counter.increment();
counter.increment();
console.log(counter.value());  // 2.

counter.decrement();
console.log(counter.value());  // 1.
~~~

我们在父function中定义了privateCounter属性和changeBy方法，但是这些方法只能够在内部function中访问。

我们通过闭包的概念，将这些属性和方法封装起来，暴露给外部使用，最终达到了私有变量和方法封装的效果。

# 闭包的Scope Chain

对于每个闭包来说，都有一个作用域范围，包括函数本身的作用域，父函数的作用域和全局的作用域。

如果我们在函数内部嵌入了新的函数，那么就会形成一个作用域链，我们叫做scope chain。

看下面的一个例子：

~~~js
// global scope
var e = 10;
function sum(a){
  return function(b){
    return function(c){
      // outer functions scope
      return function(d){
        // local scope
        return a + b + c + d + e;
      }
    }
  }
}

console.log(sum(1)(2)(3)(4)); // log 20
~~~

# 闭包常见的问题

第一个常见的问题就是在循环遍历中使用闭包，我们看一个例子：

~~~js
function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function setupHelp() {
  var helpText = [
      {'id': 'email', 'help': 'Your e-mail address'},
      {'id': 'name', 'help': 'Your full name'},
      {'id': 'age', 'help': 'Your age (you must be over 16)'}
    ];

  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = function() {
      showHelp(item.help);
    }
  }
}

setupHelp();
~~~

上面的例子中，我们创建了一个setupHelp函数，setupHelp中，onfocus方法被赋予了一个闭包，所以闭包中的item可以访问到外部function中定义的item变量。

因为在循环里面赋值，所以我们实际上创建了3个闭包，但是这3个闭包共享的是同一个外部函数的作用域范围。

我们的本意是，不同的id触发不同的help消息。但是如果我们真正执行就会发现，不管是哪一个id，最终的消息都是最后一个。

因为onfocus是在闭包创建完毕之后才会触发，这个时候item的值实际上是变化的，在循环结束之后，item的值已经指向了最后一个元素，所以全部显示的是最后一条数据的help消息。

怎么解决这个问题呢？

最简单的办法使用ES6中引入的let描述符，从而将item定义为block的作用域范围，每次循环都会创建一个新的item，从而保持闭包中的item的值不变。

~~~js
  for (let i = 0; i < helpText.length; i++) {
    let item = helpText[i];
    document.getElementById(item.id).onfocus = function() {
      showHelp(item.help);
    }
  }
~~~

还有一种方法，就是再创建一个闭包：

~~~js

function makeHelpCallback(help) {
  return function() {
    showHelp(help);
  };
}

  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = makeHelpCallback(item.help);
  }
~~~

这里用到了之前我们提到的function factory的概念，我们为不同的闭包创建了不同的作用域环境。

还有一种方法就是将item包含在一个新的function作用域范围之内，从而每次创建都是新的item，这个和let的原理是相似的：

~~~js
  for (var i = 0; i < helpText.length; i++) {
    (function() {
       var item = helpText[i];
       document.getElementById(item.id).onfocus = function() {
         showHelp(item.help);
       }
    })(); 
  }
~~~

第二个常见的问题就是内存泄露。


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

上面的例子中，childFunction引用了parentFunction的变量a。只要childFunction还在被使用，a就无法被释放，从而导致parentFunction无法被垃圾回收。

# 闭包性能的问题

我们定义了一个对象，并且通过闭包来访问其私有属性：

~~~js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}
~~~

上面的对象会有什么问题呢？

上面对象的问题就在于，对于每一个new出来的对象，getName和getMessage方法都会被复制一份，一方面是内容的冗余，另一方面是性能的影响。

通常来说，我们将对象的方法定义在prototype上面：

~~~js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
~~~

> 注意，我们不要直接重写整个prototype，这样会导致未知的错误，我们只需要根据需要重写特定的方法即可。

# 总结

闭包是JS中非常强大和有用的概念，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





