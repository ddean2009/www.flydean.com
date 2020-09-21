ES6中的Promise和Generator详解

# 简介

ES6中除了上篇文章讲过的语法新特性和一些新的API之外，还有两个非常重要的新特性就是Promise和Generator,今天我们将会详细讲解一下这两个新特性。

# Promise

## 什么是Promise

Promise 是异步编程的一种解决方案，比传统的解决方案“回调函数和事件”更合理和更强大。

所谓Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。

从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。

## Promise的特点

Promise有两个特点：

1. 对象的状态不受外界影响。

Promise对象代表一个异步操作，有三种状态：Pending（进行中）、Resolved（已完成，又称 Fulfilled）和Rejected（已失败）。

只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。

2. 一旦状态改变，就不会再变，任何时候都可以得到这个结果。

Promise对象的状态改变，只有两种可能：从Pending变为Resolved和从Pending变为Rejected。

这与事件（Event）完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

## Promise的优点

Promise将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。

Promise对象提供统一的接口，使得控制异步操作更加容易。

## Promise的缺点

1. 无法取消Promise，一旦新建它就会立即执行，无法中途取消。
   
2. 如果不设置回调函数，Promise内部抛出的错误，不会反应到外部。
   
3. 当处于Pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## Promise的用法

Promise对象是一个构造函数，用来生成Promise实例：

~~~js
var promise = new Promise(function(resolve, reject) { 
// ... some code 
if (/* 异步操作成功 */){ 
resolve(value); 
} else { reject(error); } 
}
);
~~~

promise可以接then操作，then操作可以接两个function参数，第一个function的参数就是构建Promise的时候resolve的value，第二个function的参数就是构建Promise的reject的error。

~~~js
promise.then(function(value) { 
// success 
}, function(error) { 
// failure }
);
~~~

我们看一个具体的例子：

~~~js
function timeout(ms){
    return new Promise(((resolve, reject) => {
        setTimeout(resolve,ms,'done');
    }))
}

timeout(100).then(value => console.log(value));
~~~

Promise中调用了一个setTimeout方法，并会定时触发resolve方法，并传入参数done。

最后程序输出done。

## Promise的执行顺序

Promise一经创建就会立马执行。但是Promise.then中的方法，则会等到一个调用周期过后再次调用，我们看下面的例子：

~~~js
let promise = new Promise(((resolve, reject) => {
    console.log('Step1');
    resolve();
}));

promise.then(() => {
    console.log('Step3');
});

console.log('Step2');

输出：
Step1
Step2
Step3
~~~

## Promise.prototype.then()

then方法返回的是一个新的Promise实例（注意，不是原来那个Promise实例）。因此可以采用链式写法，即then方法后面再调用另一个then方法.

~~~js
getJSON("/users.json").then(function(json){
    return json.name;
}).then(function(name){
    console.log(name);
});
~~~

上面的代码使用then方法，依次指定了两个回调函数。第一个回调函数完成以后，会将返回结果作为参数，传入第二个回调函数

## Promise.prototype.catch()

Promise.prototype.catch方法是.then(null, rejection)的别名，用于指定发生错误时的回调函数。

~~~js
getJSON("/users.json").then(function(json){
    return json.name;
}).catch(function(error){
    console.log(error);
});
~~~

Promise 对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个catch语句捕获

~~~js
getJSON("/users.json").then(function(json){
    return json.name;
}).then(function(name){
    console.log(name);
}).catch(function(error){
    //处理前面所有产生的错误
    console.log(error);
});
~~~

## Promise.all()

Promise.all方法用于将多个Promise实例，包装成一个新的Promise实例

~~~js
var p = Promise.all([p1,p2,p3]);
~~~

1. 只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。
2. 只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。

## Promise.race()

Promise.race方法同样是将多个Promise实例，包装成一个新的Promise实例

~~~js
var p = Promise.race([p1,p2,p3]);
~~~

只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数.

## Promise.resolve()

Promise.resolve()将现有对象转为Promise对象.

~~~js
Promise.resolve('js');
//等价于
new Promise(resolve => resolve('js'));
~~~

那么什么样的对象能够转化成为Promise对象呢？

1. 参数是一个Promise实例
2. 参数是一个thenable对象
3. 参数不是具有then方法的对象，或根本就不是对象
4. 不带有任何参数

## Promise.reject()

Promise.reject(reason)方法也会返回一个新的 Promise 实例，该实例的状态为rejected

~~~js
var p = Promise.reject('error');
//等价于
var p = new Promise((resolve,reject) => reject('error'));
~~~

Promise.reject()方法的参数，会原封不动地作为reject的理由，变成后续方法的参数。这一点与Promise.resolve方法不一致

## done()

Promise对象的回调链，不管以then方法或catch方法结尾，要是最后一个方法抛出错误，都有可能无法捕捉到（因为Promise内部的错误不会冒泡到全局）。因此，我们可以提供一个done方法，总是处于回调链的尾端，保证抛出任何可能出现的错误

~~~js
asyncFunc().then(f1).catch(f2).then(f3).done();
~~~

## finally()

finally方法用于指定不管Promise对象最后状态如何，都会执行的操作。它与done方法的最大区别，它接受一个普通的回调函数作为参数，该函数不管怎样都必须执行.

~~~js
server.listen(1000).then(function(){
    //do something
}.finally(server.stop);
~~~

# Generator

## 什么是Generator

Generator 函数是 ES6 提供的一种异步编程解决方案

从语法上，首先可以把它理解成，Generator函数是一个状态机，封装了多个内部状态

执行 Generator 函数会返回一个遍历器对象.

形式上，Generator 函数是一个普通函数，但是有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用yield语句，定义不同的内部状态。

举个例子：

~~~js
function * helloWorldGenerator(){
    yield 'hello';
    yield 'world';
    return 'ending';
}

var gen = helloWorldGenerator();
~~~

输出结果：

~~~js
console.log(gen.next());
console.log(gen.next());
console.log(gen.next());

{ value: 'hello', done: false }
{ value: 'world', done: false }
{ value: 'ending', done: true }
~~~

## yield

遍历器对象的next方法的运行逻辑如下:

（1）遇到yield语句，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回的对象的value属性值。

（2）下一次调用next方法时，再继续往下执行，直到遇到下一个yield语句。

（3）如果没有再遇到新的yield语句，就一直运行到函数结束，直到return语句为止，并将return语句后面的表达式的值，作为返回的对象的value属性值。

（4）如果该函数没有return语句，则返回的对象的value属性值为undefined。

> 注意，yield句本身没有返回值，或者说总是返回undefined。

next方法可以带一个参数，该参数就会被当作上一个yield语句的返回值。

~~~js
function * f() {
    for( let i =0; true; i++){
        let reset = yield i;
        if(reset){
            i = -1;
        }
    }
}

let g = f();
console.log(g.next());
console.log(g.next());
console.log(g.next(true));
~~~

输出结果：

~~~js
{ value: 0, done: false }
{ value: 1, done: false }
{ value: 0, done: false }
~~~

可以看到最后的一步，我们使用next传入的true替代了i的值，最后导致i= -1 + 1 = 0.

我们再看一个例子：

~~~js
function * f2(x){
    var y = 2 * ( yield ( x + 1));
    var z = yield (y / 3);
    return (x + y + z);
}

var r1= f2(5);
console.log(r1.next());
console.log(r1.next());
console.log(r1.next());

var r2= f2(5);
console.log(r2.next());
console.log(r2.next(12));
console.log(r2.next(13));
~~~

输出结果：

~~~js
{ value: 6, done: false }
{ value: NaN, done: false }
{ value: NaN, done: true }

{ value: 6, done: false }
{ value: 8, done: false }
{ value: 42, done: true }
~~~

如果next不传值的话，yield本身是没有返回值的，所以我们会得到NaN。

但是如果next传入特定的值，则该值会替换该yield，成为真正的返回值。

## yield *

如果在 Generator 函数内部，调用另一个 Generator 函数，默认情况下是没有效果的

~~~js
function * a1(){
    yield 'a';
    yield 'b';
}

function * b1(){
    yield 'x';
    a1();
    yield 'y';
}

for(let v of b1()){
    console.log(v);
}
~~~

输出结果：

~~~js
x
y
~~~

可以看到，在b1中调用a1是没有效果的。

将上面的例子修改一下：

~~~js
function * a1(){
    yield 'a';
    yield 'b';
}

function * b1(){
    yield 'x';
    yield * a1();
    yield 'y';
}

for(let v of b1()){
    console.log(v);
}
~~~

输出结果：

~~~js
x
a
b
y
~~~

##  异步操作的同步化表达

Generator函数的暂停执行的效果，意味着可以把异步操作写在yield语句里面，等到调用next方法时再往后执行。这实际上等同于不需要写回调函数了，因为异步操作的后续操作可以放在yield语句下面，反正要等到调用next方法时再执行。所以，Generator函数的一个重要实际意义就是用来处理异步操作，改写回调函数。

我们看一个怎么通过Generator来获取一个Ajax的结果。

~~~js
function * ajaxCall(){
    let result = yield request("http://www.flydean.com");
    let resp = JSON.parse(result);
    console.log(resp.value);
}

function request(url){
    makeAjaxCall(url, function(response){
        it.next(response);
    });
}

var it = ajaxCall();
it.next();
~~~

我们使用一个yield来获取异步执行的结果。但是我们如何将这个yield传给result变量呢？要记住yield本身是没有返回值的。

我们需要调用generator的next方法，将异步执行的结果传进去。这就是我们在request方法中做的事情。

# Generator 的异步应用

什么是异步应用呢？

所谓"异步"，简单说就是一个任务不是连续完成的，可以理解成该任务被人为分成两段，先执行第一段，然后转而执行其他任务，等做好了准备，再回过头执行第二段。

比如，有一个任务是读取文件进行处理，任务的第一段是向操作系统发出请求，要求读取文件。然后，程序执行其他任务，等到操作系统返回文件，再接着执行任务的第二段（处理文件）。这种不连续的执行，就叫做异步。

相应地，连续的执行就叫做同步。由于是连续执行，不能插入其他任务，所以操作系统从硬盘读取文件的这段时间，程序只能干等着。

ES6诞生以前，异步编程的方法，大概有下面四种。
回调函数
事件监听
发布/订阅
Promise 对象

## 回调函数

~~~js
fs.readFile(fileA, 'utf-8', function(error,data){
    fs.readFile(fileB, 'utf-8', function(error,data){
}
})
~~~

如果依次读取两个以上的文件，就会出现多重嵌套。代码不是纵向发展，而是横向发展，很快就会乱成一团，无法管理。因为多个异步操作形成了强耦合，只要有一个操作需要修改，它的上层回调函数和下层回调函数，可能都要跟着修改。这种情况就称为"回调函数地狱"（callback hell）。

## Promise

Promise 对象就是为了解决这个问题而提出的。它不是新的语法功能，而是一种新的写法，允许将回调函数的嵌套，改成链式调用。

~~~js
let readFile = require('fs-readfile-promise');
readFile(fileA).then(function(){
    return readFile(fileB);
}).then(function(data){
    console.log(data);
})
~~~

## Thunk函数和异步函数自动执行

在讲Thunk函数之前，我们讲一下函数的调用有两种方式，一种是传值调用，一种是传名调用。

"传值调用"（call by value），即在进入函数体之前，就计算x + 5的值（等于6），再将这个值传入函数f。C语言就采用这种策略。

“传名调用”（call by name），即直接将表达式x + 5传入函数体，只在用到它的时候求值。

编译器的“传名调用”实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体。这个临时函数就叫做 Thunk 函数。

举个例子：

~~~js
function f(m){
    return m * 2;
}

f(x + 5);
~~~

上面的代码等于：

~~~js
var thunk = function () {
    return x + 5;
}
function f(thunk){
    return thunk() * 2;
}
~~~

在 JavaScript 语言中，Thunk函数替换的不是表达式，而是多参数函数，将其替换成一个只接受回调函数作为参数的单参数函数。

怎么解释呢？

比如nodejs中的：

~~~js
fs.readFile(filename,[encoding],[callback(err,data)])
~~~

readFile接收3个参数，其中encoding是可选的。我们就以两个参数为例。

一般来说，我们这样调用：

~~~js
fs.readFile(fileA,callback);
~~~

那么有没有办法将其改写成为单个参数的function的级联调用呢？

~~~js
var Thunk = function (fn){
    return function (...args){
        return functon (callback){
            return fn.call(this,...args, callback);
        }
    }
}

var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
~~~

可以看到上面的Thunk将两个参数的函数改写成为了单个参数函数的级联方式。或者说Thunk是接收一个callback并执行方法的函数。

这样改写有什么用呢？Thunk函数现在可以用于 Generator 函数的自动流程管理。

之前在讲Generator的时候，如果Generator中有多个yield的异步方法，那么我们需要在next方法中传入这些异步方法的执行结果。

手动传入异步执行结果当然是可以的。但是有没有自动执行的办法呢？

~~~js
let fs = require('fs');
let thunkify = require('thunkify');
let readFileThunk = thunkify(fs.readFile);

let gen = function * (){
    let r1 = yield readFileThunk('/tmp/file1');
    console.log(r1.toString());

    let r2 = yield readFileThunk('/tmp/file2');
    console.log(r2.toString());
}

let g = gen();

function run(fn){
    let gen = fn();

    function next (err, data){
        let result = gen.next(data);
        if(result.done) return;
        result.value(next);
    }
    next();
}

run(g);
~~~

gen.next返回的是一个对象，对象的value就是Thunk函数，我们向Thunk函数再次传入next callback，从而出发下一次的yield操作。

有了这个执行器，执行Generator函数方便多了。不管内部有多少个异步操作，直接把 Generator 函数传入run函数即可。当然，前提是每一个异步操作，都要是Thunk函数，也就是说，跟在yield命令后面的必须是Thunk函数。

# 总结

Promise和Generator是ES6中引入的非常中要的语法，后面的koa框架就是Generator的一种具体的实现。我们会在后面的文章中详细讲解koa的使用，敬请期待。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！



























































