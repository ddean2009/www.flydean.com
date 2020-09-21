深度剖析面向对象的javascript

# 简介

本将会深入讲解面向对象在javascript中的应用，并详细介绍三种对象的生成方式：构造函数，原型链，类。

# 什么是对象

虽然说程序员不缺对象，随时随地都可以new一个出来，但是在程序的世界中，对象到底是什么呢？

对象是单个实物的抽象。

对象是一个容器，封装了属性（property）和方法（method）。

而面向对象是相对于面向过程来讲的，面向对象方法，把相关的数据和方法组织为一个整体来看待，从更高的层次来进行系统建模，更贴近事物的自然运行模式。

面向对象的好处就是可抽象，封装和可重用性，同时提供了继承和多态等非常有用的特性。

而随着JS的发展，已经超越了最开始的脚本语言，尤其是nodejs的出现之后，更是极大的丰富了js的工作能力。

所以JS也需要进行对象化。

一般来说，在JS中构建对象有三种方式：

* 构造函数（constructor）
* 原型链（prototype）
* 类(class) ---ES6提供

接下来，我们一一来讲解。

# 构造函数

构造函数是专门用来生成对象的函数。它提供模板，描述对象的基本结构。

一个构造函数，可以生成多个对象，这些对象都有相同的结构。构造函数的写法就是一个普通的函数，但是有自己的特征和用法.

~~~js
var Book  = function () {
    this.name = 'www.flydean.com';
}
~~~

Book就是构造函数，它提供模板，用来生成实例对象。为了与普通函数区别，构造函数名字的第一个字母通常大写。

## 构造函数的特点

构造函数首先是一个函数，也就是说是function开头的函数。其次函数体内部使用了this关键字，代表了所要生成的对象实例。

在使用构造函数的时候，必需用new命令，调用Book函数。

new命令的作用，就是执行构造函数，返回一个实例对象。

~~~js
var Book  = function () {
    this.name = 'www.flydean.com';
}

var b1 = new Book();
console.log(b1.name);
~~~

上面的例子输出结果：

~~~js
www.flydean.com
~~~

如果我们忘了使用new，会发生什么情况呢？

~~~js
var Book  = function () {
    this.name = 'www.flydean.com';
}

var b2 = Book();
console.log(name);
console.log(b2.name);
~~~

第一个输出会输出www.flydean.com

而第二个则会报一个错误：

~~~js
TypeError: Cannot read property 'name' of undefined
~~~

因为这样调用的this指向的是global,所以this.name变成了全局变量。

为了避免这种忘记写new的问题，可以在第一行加上use strict，在严格模式中，函数内部的this不能指向全局对象，默认等于undefined，导致不加new调用会报错。

如果不想使用use strict,则可以在构造函数内部判断是否使用new命令，如果发现没有使用，则直接返回一个实例对象。






















