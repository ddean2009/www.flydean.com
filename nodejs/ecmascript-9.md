ECMAScript 2018(ES9)新特性简介

# 简介

ES9是ECMA协会在2018年6月发行的一个版本，因为是ECMAScript的第九个版本，所以也称为ES9.

今天我们讲解一下ES9的新特性。

ES9引入了3大特性和2个小的特性，我们接下来一一讲解。

# 异步遍历

在ES6中，引入了同步iteration的概念，随着ES8中的Async操作符的引用，在ES9中引入了异步遍历的新特性Async iteration。

具体的内容可以参考我之前的文章 [ES9的新特性:异步遍历Async iteration]()

# Rest/Spread操作符和对象构建

Rest和Spread的操作符都是 ... , 只不过使用的场景和目的不一样。

rest主要用在对象的解构，目前只支持对象的解构和不确定的参数描述。

Spread主要用在字面量对象的构建上。

下面我们分别来介绍：

## Rest

如果用在对象的解构中，除了已经手动指定的属性名之外，rest将会拷贝对象其他的所有可枚举（enumerable）的属性。

~~~js
const obj = {foo: 1, bar: 2, baz: 3};
const {foo, ...rest} = obj;
    // Same as:
    // const foo = 1;
    // const rest = {bar: 2, baz: 3};
~~~

如果用在参数中，rest表示的是所有剩下的参数：

~~~js
function func({param1, param2, ...rest}) { // rest operator
    console.log('All parameters: ',
        {param1, param2, ...rest}); // spread operator
    return param1 + param2;
}
~~~

注意，在Obj字面量中，rest运算符只能放在obj的最顶层，并且只能使用一次，还要放在最后。

~~~js
const {...rest, foo} = obj; // SyntaxError
const {foo, ...rest1, ...rest2} = obj; // SyntaxError
~~~

当然你还可以嵌套使用rest运算符：

~~~js
const obj = {
    foo: {
        a: 1,
        b: 2,
        c: 3,
    },
    bar: 4,
    baz: 5,
};
const {foo: {a, ...rest1}, ...rest2} = obj;
// Same as:
// const a = 1;
// const rest1 = {b: 2, c: 3};
// const rest2 = {bar: 4, baz: 5};
~~~

## Spread

spread主要被用来展开对象，能够被展开对象的属性一定要是可枚举的enumerable。

~~~js
> const obj = {foo: 1, bar: 2};
> {...obj, baz: 3}
{ foo: 1, bar: 2, baz: 3 }
~~~

如果对象的属性key一样，那么后面属性值会覆盖之前的属性值：

~~~js
> const obj = {foo: 1, bar: 2, baz: 3};
> {...obj, foo: true}
{ foo: true, bar: 2, baz: 3 }
> {foo: true, ...obj}
{ foo: 1, bar: 2, baz: 3 }
~~~

## 创建和拷贝对象

使用Object.assign和Spread操作符可以很方便的进行对象的拷贝。

我们看一个最简单的对象拷贝的例子：

~~~js
const clone1 = {...obj};
const clone2 = Object.assign({}, obj);
~~~

但是这样的拷贝有个缺点，就是只能拷贝自有的可枚举的属性。

并且拷贝之后对象的prototypes是Object.prototype，也就是说没有继承被拷贝对象的prototype。

~~~js
> Object.getPrototypeOf(clone1) === Object.prototype
true
> Object.getPrototypeOf(clone2) === Object.prototype
true
> Object.getPrototypeOf({}) === Object.prototype
true
~~~

如果想要同时拷贝对象的prototype，则可以这样做：

~~~js
const clone1 = {__proto__: Object.getPrototypeOf(obj), ...obj};
const clone2 = Object.assign(
    Object.create(Object.getPrototypeOf(obj)), obj);
~~~

或者指定对象内置的__proto__属性，或者从obj的prtotype创建一个新的对象。

> 注意，对象内置的__proto__属性只在部分浏览器中支持。

Object.assign和spread只能拷贝可枚举的属性，如果是set，get属性或者想要拷贝属性的attributes（writable, enumerable），那么就需要用到我们之前讲到的Object.getOwnPropertyDescriptors。

~~~js
const clone1 = Object.defineProperties({},
    Object.getOwnPropertyDescriptors(obj));

const clone2 = Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj));
~~

> 注意，我们使用的所有的拷贝都是浅拷贝。如果被拷贝的对象内部又有对象的话，拷贝的只是这个对象的引用

~~~js
const original = { prop: {} };
const clone = Object.assign({}, original);

console.log(original.prop === clone.prop); // true
original.prop.foo = 'abc';
console.log(clone.prop.foo); // abc
~~~

## Spread和bject.assign() 的区别

assgin在拷贝对象的时候，会调用相应属性的set方法，而spread不会。

举个例子，我们先给Object.prototype定义一个set方法：

~~~js
Object.defineProperty(Object.prototype, 'foo', {
    set(value) {
        console.log('SET', value);
    },
});
const obj = {foo: 123};
~~~

然后看一下拷贝的区别：

~~~js
> Object.assign({}, obj)
SET 123
{}

> { ...obj }
{ foo: 123 }
~~~

可以看到assign会触发set方法，而spread不会。

另外，如果对象属性是不可写的，那么assign将会报错，而spread不会。

我们先定义一个不可写的对象：

~~~js
Object.defineProperty(Object.prototype, 'bar', {
    writable: false,
    value: 'abc',
});
~~~

看下赋值操作：

~~~js
> const tmp = {};
> tmp.bar = 123;
TypeError: Cannot assign to read only property 'bar'

> Object.assign({}, obj)
TypeError: Cannot assign to read only property 'bar'

> { ...obj }
{ bar: 123 }
~~~

# 正则表达式

ES9的正则表达式新特性可以参考我的文章 [ES9的新特性:正则表达式RegExp]()

# promise.finally

promise除了then和catch方法之外，还引入了新的finally方法。

和java中的finally一样，promise.finally一定会被执行。

~~~js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
~~~

和java一样，我们可以在finally中做一些资源清理的工作：

~~~js
let connection;
db.open()
.then(conn => {
    connection = conn;
    return connection.select({ name: 'Jane' });
})
.then(result => {
    ...
})
···
.catch(error => {
    // handle errors
})
.finally(() => {
    connection.close();
});
~~~

上面的例子中，我们开启了一个数据库的连接，在使用完之后，我们在finally中对其进行close操作。

# 模板文字和带标签的模板文字

模板文字和带标签的模板文字是在ES6中引入的，在ES9中进行了修正。

我们先看下什么是模本文字，模板文字（Template literals）就是在反引号中输入的文字，在其中可以使用${···})来进行变量的解析，并且还支持回车换行。

~~~js
const firstName = 'Jane';
console.log(`Hello ${firstName}!
How are you
today?`);

// Output:
// Hello Jane!
// How are you
// today?
~~~

而带标签的模板文字是指在模板文字之前放上一个函数调用：

~~~js
String.raw`\u{4B}`
'\u{4B}'
~~~

这里String.raw被称为tag function,我们看下raw的定义：

~~~js
raw(template: TemplateStringsArray, ...substitutions: any[]): string;
~~~

上面的代码还可以改写为：

~~~js
String.raw`\u004B`
'\u004B'
~~~

`\u{4B}`和 `\u004B` 都是字符K的unicode表示。

上面的raw其实可以这样表示：

~~~js
function tagFunc(tmplObj, substs) {
    return {
        Cooked: tmplObj,
        Raw: tmplObj.raw,
    };
}
~~~

我们可以这样使用：

~~~js
> tagFunc`\u{4B}`;
{ Cooked: [ 'K' ], Raw: [ '\\u{4B}' ] }
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
















