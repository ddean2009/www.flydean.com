万字长文深度剖析面向对象的javascript

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

~~~js
function Person(firstname,lastname){

    if(!(this instanceof Person)){
        return new Person(firstname,lastname);
    }
    this.firstname= firstname;
    this.firstname = lastname;
}

console.log(Person("jack","ma").firstname);
console.log((new Person("jack","ma")).firstname);
~~~

## new命令的原理

使用new命令时，它后面的函数调用就不是正常的调用，而是依次执行下面的步骤:

1. 创建一个空对象，作为将要返回的对象实例
2. 将这个空对象的原型，指向构造函数的prototype属性
3. 将这个空对象赋值给函数内部的this关键字
4. 开始执行构造函数内部的代码

如果构造函数内部有return语句，而且return后面跟着一个对象，new命令会返回return语句指定的对象；否则，就会不管return语句，返回this对象。

~~~js
var Book  = function () {
    this.name = 'www.flydean.com';
    return {author:'flydean'};
}

console.log((new Book()).author);
~~~

函数内部可以使用new.target属性。如果当前函数是new命令调用，new.target指向当前函数，否则为undefined。

通过new.target我们也可以用来判断对象是否通过new来创建：

~~~js
function f(){
    if(! new.target){
        throw new Error('请使用new命令！');
    }
}
f();
~~~

构造函数作为模板，可以生成实例对象。但是，有时只能拿到实例对象，而该对象根本就不是由构造函数生成的，这时可以使用Object.create()方法，直接以某个实例对象作为模板，生成一个新的实例对象。

~~~js
var book2 = {
    name : '三毛流浪记',
    author : '三毛',
    getName : function () {
        console.log('book name is:' + this.name);
    }
}
var book3 = Object.create(book2);
console.log(book3.name);
book3.getName();
~~~

# prototype对象

构造函数有什么缺点呢？构造函数的缺点就是会将构造函数内部的对象都复制一份：

~~~js
function Book(){
    this.name ='www.flydean.com';
    this.getName =function (){
        console.log('flydean');
    }
}

var book1 = new Book();
var book2  = new Book();

console.log(book1.getName  === book2.getName);
~~~

输出结果是 false。说明每次new一个对象，对象中的方法也被拷贝了一份。而这并不是必须的。

JavaScript 的每个对象都继承另一个对象，后者称为“原型”（prototype）对象。只有null除外，它没有自己的原型对象。

原型对象上的所有属性和方法，都能被派生对象共享。这就是 JavaScript 继承机制的基本设计。

通过构造函数生成实例对象时，会自动为实例对象分配原型对象。每一个构造函数都有一个prototype属性，这个属性就是实例对象的原型对象。

~~~js
function Book(name){
    this.name = name;
}

Book.prototype.author ='flydean';
var book1 = new Book();
var book2 = new Book();
console.log(book1.author);
console.log(book2.author);
~~~

上面例子中的author属性会被Book的所有实例所继承，Book的prototype对象，就是book1和book2的原型对象。

原型对象的属性不是实例对象自身的属性。只要修改原型对象，变动就立刻会体现在所有实例对象上。

由于原型本身也是对象，又有自己的原型，所以形成了一条原型链（prototype chain）。

如果一层层地上溯，所有对象的原型最终都可以上溯到Object.prototype，即Object构造函数的prototype属性指向的那个对象。

Object.prototype对象有没有它的原型呢？回答可以是有的，就是没有任何属性和方法的null对象，而null对象没有自己的原型。

~~~js
console.log(Object.getPrototypeOf(Object.prototype));
//null
~~~

prototype对象有一个constructor属性，默认指向prototype对象所在的构造函数.

~~~js
function Book(name){
    this.name = name;
}
var book3 =new Book();
console.log(book3.constructor);
console.log(book3.constructor === Book.prototype.constructor);
console.log(book3.hasOwnProperty(constructor));
~~~

还是刚刚的book，book3.constructor就是function Book本身。它也等于Book.prototype.constructor。

constructor属性的作用，是分辨原型对象到底属于哪个构造函数。

因为prototype是一个对象，所以对象可以被赋值，也就是说prototype可以被改变：

~~~js
function A(){}
var a = new A();
console.log(a instanceof A);
function B(){}
A.prototype = B.prototype;
console.log(a instanceof A);
~~~

上面的例子中，我们修改了A.prototype,最后a instanceof A值是false。

为了保证不会出现这样错误匹配的问题，我们再构建prototype的时候，一定不要直接重写整个的prototype，只需要修改其中的某个属性就好：

~~~js
//不要这样写
A.prototype  ={
    method1:function (){}
}

//比较好的写法
A.prototype  ={
    constructor:A,
    method1:function (){}
}
//更好的写法
A.prototype.method1 = function (){}
~~~

# Object的prototype操作

## Object.getPrototypeOf

Object.getPrototypeOf方法返回一个对象的原型。这是获取原型对象的标准方法.

~~~js

//空对象的prototype是Object.prototype
console.log(Object.getPrototypeOf({}) === Object.prototype);

//function的prototype是Function.prototype
function f(){}
console.log(Object.getPrototypeOf(f)  === Function.prototype);

function F(){this.name ='flydean'}
var f1 =new F();
console.log(Object.getPrototypeOf(f1) === F.prototype);

var f2 = new f();
console.log(Object.getPrototypeOf(f2) === f.prototype);

~~~

上面4个的输出结果都是true。

## Object.setPrototypeOf

Object.setPrototypeOf方法可以为现有对象设置原型，返回一个新对象。

Object.setPrototypeOf方法接受两个参数，第一个是现有对象，第二个是原型对象。

~~~js
var a = {name: 'flydean'};
var b = Object.setPrototypeOf({},a);
console.log(b.name);
~~~

## Object.prototype.isPrototypeOf()

对象实例的isPrototypeOf方法，用来判断一个对象是否是另一个对象的原型.

~~~js
var a = {name: 'flydean'};
var b = Object.setPrototypeOf({},a);
console.log(a.isPrototypeOf(b));
~~~

## Object.prototype.__proto__

__proto__属性（前后各两个下划线）可以改写某个对象的原型对象。

还是刚才的例子，这次我们使用__proto__来改写对象的原型。

~~~js
var a = {name: 'flydean'};

var c ={};
c.__proto__ = a;
console.log(Object.getPrototypeOf(c));
~~~

__proto__属性只有浏览器才需要部署，其他环境可以没有这个属性，而且前后的两根下划线，表示它本质是一个内部属性，不应该对使用者暴露。

因此，应该尽量少用这个属性，而是用Object.getPrototypeof()（读取）和Object.setPrototypeOf()（设置），进行原型对象的读写操作。

## 三种获取原型对象的方法 

综上，我们有三种获取原型对象的方法：

* obj.__proto__
* obj.constructor.prototype
* Object.getPrototypeOf(obj)

# this对象 

this总是返回一个对象，简单说，就是返回属性或方法“当前”所在的对象。

~~~js
var book = {
    name :'flydean',
    getName : function (){
        return '书名：'+ this.name;
    }
}

console.log(book.getName());
//书名：flydean
~~~

这里this的指向是可变的，我们看一个例子 ：

~~~js
var book = {
    name :'flydean',
    getName : function (){
        return '书名：'+ this.name;
    }
}

var car ={
    name :'car'
}

car.getName = book.getName;
console.log(car.getName());
//书名：car
~~~

当 A 对象的方法被赋予 B 对象，该方法中的this就从指向 A 对象变成了指向 B 对象

上面的例子中，我们把book中的getName方法赋值给了car对象，this对象现在就指向了car。

如果某个方法位于多层对象的内部，这时this只是指向当前一层的对象，而不会继承更上面的层。

~~~js
var book1 = {
    name :'flydean',
    book2: {
        getName : function (){
            return '书名：'+ this.name;
        }
    }
}
console.log(book1.book2.getName());
//书名：undefined
~~~

上面的例子中，this是定义在对象中的函数中，如果是在函数中的函数中定义的this，代表什么呢？

~~~js
var book3 = {
    name :'flydean',
    book4: function(){
        console.log('book4');
        var getName = function (){
            console.log(this); //Window
        }();
    }
}
book3.book4();
~~~

如果在函数中的函数中使用了this，那么内层的this指向的是全局的window对象。

所以我们在使用的过程中要避免多层 this。由于this的指向是不确定的，所以切勿在函数中包含多层的this。

如果在全局环境使用this，它指的就是顶层对象window。

数组的map和foreach方法，允许提供一个函数作为参数。这个函数内部不应该使用this。

~~~js
var book5 ={
    name : 'flydean',
    author : ['max','jacken'],
    f: function (){
        this.author.forEach(function (item) {
            console.log(this.name+' '+item);
        })
    }
}
book5.f();
//undefined max
//undefined jacken
~~~

foreach方法的回调函数中的this，其实是指向window对象，因此取不到o.v的值。原因跟上一段的多层this是一样的，就是内层的this不指向外部，而指向顶层对象。

怎么解决呢？我们使用一个中间变量：

~~~js
var book6 ={
    name : 'flydean',
    author : ['max','jacken'],
    f: function (){
        var that = this;
        this.author.forEach(function (item) {
            console.log(that.name+' '+item);
        })
    }
}
book6.f();
//flydean max
//flydean jacken
~~~

或者将this当作foreach方法的第二个参数，固定它的运行环境：

~~~js
var book7 ={
    name : 'flydean',
    author : ['max','jacken'],
    f: function (){
        this.author.forEach(function (item) {
            console.log(this.name+' '+item);
        },this)
    }
}
book7.f();
//flydean max
//flydean jacken
~~~

# 绑定this的方法

JavaScript提供了call、apply、bind这三个方法，来切换/固定this的指向.

## call

函数实例的call方法，可以指定函数内部this的指向（即函数执行时所在的作用域），然后在所指定的作用域中，调用该函数.

~~~js
var book = {};

var f = function () {
    return this;
}
f()  === this ; //true
f.call(book) === book; //true
~~~

上面例子中，如果直接调用f(),那么返回的就是全局的window对象。如果传入book对象，那么返回的就是book对象。

call方法的参数，应该是一个对象。如果参数为空、null和undefined，则默认传入全局对象。

如果call方法的参数是一个原始值，那么这个原始值会自动转成对应的包装对象，然后传入call方法。

~~~js
var f = function () {
    return this;
}

console.log(f.call(100));
//[Number: 100]
~~~

call方法还可以接受多个参数.

~~~js
func.call(thisValue,arg1,arg2, ...);
~~~

call的第一个参数就是this所要指向的那个对象，后面的参数则是函数调用时所需的参数。

call一般用在调用对象的原始方法：

~~~js
var person =  {};

person.hasOwnProperty('getName');//false

//覆盖person的getName方法
person.getName  = function(){
    return true;
}

person.hasOwnProperty('getName');//true
Object.prototype.hasOwnProperty.call(person,'getName');//false
~~~

## apply

apply方法的作用与call方法类似，也是改变this指向，然后再调用该函数。唯一的区别就是，它接收一个数组作为函数执行时的参数.

~~~js
func.apply(thisValue,[arg1,arg2,...])
~~~

## bind

call和apply是改变this的指向，然后调用该函数，而bind方法用于将函数体内的this绑定到某个对象，然后返回一个新函数.

~~~js
var d = new Date();

console.log(d.getTime()); //1600755862787

var getTime= d.getTime;
console.log(getTime());//TypeError: this is not a Date object.
~~~

上面的例子中，getTime方法里面调用了this，如果直接把d.getTime赋值给getTime变量，那么this将会指向全局的window对象，导致运行错误。

我们可以这样修改：

~~~js
var d = new Date();

console.log(d.getTime()); //1600755862787

var getTime2= d.getTime.bind(d);
console.log(getTime2());
~~~

bind比call方法和apply方法更进一步的是，除了绑定this以外，还可以绑定原函数的参数。

~~~js
var add = function(x,y){
    return x +this.m +  y + this.n;
}
var addObj ={
    m: 10,
    n: 10
}

var newAdd = add.bind(addObj,2);
console.log(newAdd(3));//25
~~~

上面的例子中，bind将两个参数的add方法，替换成了1个参数的add方法。

> 注意，bind每次调用都会返回一个新的函数，从而导致无法取消之前的绑定。

# 继承

## 构造函数的继承

构造函数的继承第一步是在子类的构造函数中，调用父类的构造函数,让子类实例具有父类实例的属性。

然后让子类的原型指向父类的原型，这样子类就可以继承父类原型。

~~~js
function Person (){
    this.name = 'person';
}

function Boy(){
    Person.call(this);
    this.title = 'boy';
}

Boy.prototype= Object.create(Person.prototype);
Boy.prototype.constructor=Boy;
Boy.prototype.getTitle=function (){console.log(this.title)};

var b =new Boy();
b.getTitle();
console.log(b);
~~

调用父类的构造函数是初始化实例对象的属性。子类的原型指向父类的原型是为了基础父类的原型对象的属性。

另外一种写法是Boy.prototype等于一个父类实例：

~~~js
Boy.prototype = new Person();
~~~

上面这种写法也有继承的效果，但是子类会具有父类实例的方法。有时，这可能不是我们需要的，所以不推荐使用这种写法.

JavaScript 不提供多重继承功能，即不允许一个对象同时继承多个对象。但是，可以通过变通方法，实现这个功能:

~~~js
function Person1 (){
    this.name = 'person';
}
function Person2 (){
    this.sex = '男';
}

function Boy(){
    Person1.call(this);
    Person2.call(this);
    this.title = 'boy';
}

//继承Person1
Boy.prototype= Object.create(Person1.prototype);
//继承链加上Person2
Object.assign(Boy.prototype,Person2.prototype);

Boy.prototype.constructor=Boy;
Boy.prototype.getTitle=function (){console.log(this.title)};

var b =new Boy();
b.getTitle();
console.log(b);
//Boy { name: 'person', sex: '男', title: 'boy' }
~~~

# class

ES6 的class可以看作只是一个语法糖，它的绝大部分功能，ES5 都可以做到，新的class写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已.

~~~js
class Person {
    constructor(name,sex) {
        this.name=name;
        this.sex =sex;
    }

    toString(){
        return this.name + ' '+ this.sex;
    }
}
~~~

构造函数的prototype属性，在ES6 的“类”上面继续存在。事实上，类的所有方法都定义在类的prototype属性上面。

上面的类等同于：

~~~js
Person.prototype = {
       constructor(name,sex) {
        this.name=name;
        this.sex =sex;
    }

    toString(){
        return this.name + ' '+ this.sex;
    } 
}
~~~

## 表达式属性名

class还支持动态的表达式属性名：

~~~js
let methodName = 'getName';

class Person {
    constructor(name,sex) {
        this.name=name;
        this.sex =sex;
    }

    toString(){
        return this.name + ' '+ this.sex;
    }

    [methodName](){
        return this.name;
    }
}
~~~

## 静态方法

类相当于实例的原型，所有在类中定义的方法，都会被实例继承。如果在一个方法前，加上static关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就称为“静态方法”。

~~~js
class Person {
    constructor(name,sex) {
        this.name=name;
        this.sex =sex;
    }

    static getSex(){
        return '男';
    }
}

console.log(Person.getSex()); //男

let  p  = new Person();
console.log(p.getSex());//TypeError: p.getSex is not a function
~~~

## 静态属性

静态属性指的是 Class 本身的属性，即Class.propName，而不是定义在实例对象（this）上的属性.

~~~js

class Person {
    constructor(name,sex) {
        this.name=name;
        this.sex =sex;
    }
}
Person.address ='address';
console.log(Person.address);
~~~


目前，只有这种写法可行，因为 ES6 明确规定，Class 内部只有静态方法，没有静态属性.

## class的继承

class的继承一般使用extends关键字：

~~~js
class Boy extends Person{
    constructor(name,sex,address) {
        super(name,sex); //调用父类的构造函数
        this.address =address;
    }

    toString() {
        return super.toString();//调用父类的方法
    }
}
~~~

在子类的构造函数中，只有调用super之后，才可以使用this关键字，否则会报错。这是因为子类实例的构建，是基于对父类实例加工，只有super方法才能返回父类实例。

super作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次super函数。

super作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。

上面的例子，我们在子类Boy中的toString普通方法中，调用了super.toString(),之前我们也讲了，类的所有方法都定义在类的prototype属性上面。所以super.toString就是Person中定义的toString方法。

由于super指向父类的原型对象，所以定义在父类实例上的方法或属性，是无法通过super调用的。

定义在父类实例上的方法或属性就是指在constructor中定义的方法或者属性。

Person类，在constructor中定义了name属性。我们看一下在Boy中的普通方法中访问会有什么问题：

~~~js
class Boy extends Person{
    constructor(name,sex,address) {
        super(name,sex); //调用父类的构造函数
        console.log(super.name);  //undefined
        console.log(this.name);  //hanmeimei
        this.address =address;
    }

    toString() {
        return super.toString();//调用父类的方法
    }

    getName(){
        console.log(super.name);  //undefined
        console.log(this.name);    //hanmeimei
    }
}

var b =new Boy('hanmeimei','女','北京');
b.getName();
~~~

# 总结

JS中的面向对象主要有构造函数，原型链，类三种方式，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！










































































