---
slug: /nodejs-async
---

# 3. 深入理解nodejs中的异步编程

# 简介

因为javascript默认情况下是单线程的，这意味着代码不能创建新的线程来并行执行。但是对于最开始在浏览器中运行的javascript来说，单线程的同步执行环境显然无法满足页面点击，鼠标移动这些响应用户的功能。于是浏览器实现了一组API，可以让javascript以回调的方式来异步响应页面的请求事件。

更进一步，nodejs引入了非阻塞的 I/O ，从而将异步的概念扩展到了文件访问、网络调用等。

今天，我们将会深入的探讨一下各种异步编程的优缺点和发展趋势。

# 同步异步和阻塞非阻塞

在讨论nodejs的异步编程之前，让我们来讨论一个比较容易混淆的概念，那就是同步，异步，阻塞和非阻塞。

所谓阻塞和非阻塞是指进程或者线程在进行操作或者数据读写的时候，是否需要等待，在等待的过程中能否进行其他的操作。

如果需要等待，并且等待过程中线程或进程无法进行其他操作，只能傻傻的等待，那么我们就说这个操作是阻塞的。

反之，如果进程或者线程在进行操作或者数据读写的过程中，还可以进行其他的操作，那么我们就说这个操作是非阻塞的。

同步和异步，是指访问数据的方式，同步是指需要主动读取数据，这个读取过程可能是阻塞或者是非阻塞的。而异步是指并不需要主动去读取数据，是被动的通知。

很明显，javascript中的回调是一个被动的通知，我们可以称之为异步调用。

# javascript中的回调

javascript中的回调是异步编程的一个非常典型的例子：

~~~js
document.getElementById('button').addEventListener('click', () => {
  console.log('button clicked!');
})
~~~

上面的代码中，我们为button添加了一个click事件监听器，如果监听到了click事件，则会出发回调函数，输出相应的信息。

回调函数就是一个普通的函数，只不过它被作为参数传递给了addEventListener，并且只有事件触发的时候才会被调用。

上篇文章我们讲到的setTimeout和setInterval实际上都是异步的回调函数。

## 回调函数的错误处理

在nodejs中怎么处理回调的错误信息呢？nodejs采用了一个非常巧妙的办法，在nodejs中，任何回调函数中的第一个参数为错误对象，我们可以通过判断这个错误对象的存在与否，来进行相应的错误处理。

~~~js
fs.readFile('/文件.json', (err, data) => {
  if (err !== null) {
    //处理错误
    console.log(err)
    return
  }

  //没有错误，则处理数据。
  console.log(data)
})
~~~

## 回调地狱

javascript的回调虽然非常的优秀，它有效的解决了同步处理的问题。但是遗憾的是，如果我们需要依赖回调函数的返回值来进行下一步的操作的时候，就会陷入这个回调地狱。

叫回调地狱有点夸张了，但是也是从一方面反映了回调函数所存在的问题。

~~~js
fs.readFile('/a.json', (err, data) => {
  if (err !== null) {
    fs.readFile('/b.json',(err,data) =>{
        //callback inside callback
    })
  }
})
~~~

怎么解决呢？

别怕ES6引入了Promise，ES2017引入了Async/Await都可以解决这个问题。

# ES6中的Promise

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

# async和await

Promise当然很好，我们将回调地狱转换成了链式调用。我们用then来将多个Promise连接起来，前一个promise resolve的结果是下一个promise中then的参数。

链式调用有什么缺点呢？

比如我们从一个promise中，resolve了一个值，我们需要根据这个值来进行一些业务逻辑的处理。

假如这个业务逻辑很长，我们就需要在下一个then中写很长的业务逻辑代码。这样让我们的代码看起来非常的冗余。

那么有没有什么办法可以直接返回promise中resolve的结果呢？

答案就是await。

当promise前面加上await的时候，调用的代码就会停止直到 promise 被解决或被拒绝。

注意await一定要放在async函数中，我们来看一个async和await的例子：

~~~js
const logAsync = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve('小马哥'), 5000)
  })
}
~~~

上面我们定义了一个logAsync函数，该函数返回一个Promise，因为该Promise内部使用了setTimeout来resolve，所以我们可以将其看成是异步的。

要是使用await得到resolve的值，我们需要将其放在一个async的函数中：

~~~js
const doSomething = async () => {
  const resolveValue = await logAsync();
  console.log(resolveValue);
}
~~~

## async的执行顺序

await实际上是去等待promise的resolve结果我们把上面的例子结合起来：

~~~js
const logAsync = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve('小马哥'), 1000)
    })
}

const doSomething = async () => {
    const resolveValue = await logAsync();
    console.log(resolveValue);
}

console.log('before')
doSomething();
console.log('after')
~~~

上面的例子输出：

~~~js
before
after
小马哥
~~~

可以看到，aysnc是异步执行的，并且它的顺序是在当前这个周期之后。

## async的特点

async会让所有后面接的函数都变成Promise，即使后面的函数没有显示的返回Promise。

~~~js
const asyncReturn = async () => {
    return 'async return'
}

asyncReturn().then(console.log)
~~~

因为只有Promise才能在后面接then，我们可以看出async将一个普通的函数封装成了一个Promise：

~~~js
const asyncReturn = async () => {
    return Promise.resolve('async return')
}

asyncReturn().then(console.log)
~~~

# 总结

promise避免了回调地狱，它将callback inside callback改写成了then的链式调用形式。

但是链式调用并不方便阅读和调试。于是出现了async和await。

async和await将链式调用改成了类似程序顺序执行的语法，从而更加方便理解和调试。

我们来看一个对比，先看下使用Promise的情况：

~~~js
const getUserInfo = () => {
  return fetch('/users.json') // 获取用户列表
    .then(response => response.json()) // 解析 JSON
    .then(users => users[0]) // 选择第一个用户
    .then(user => fetch(`/users/${user.name}`)) // 获取用户数据
    .then(userResponse => userResponse.json()) // 解析 JSON
}

getUserInfo()
~~~

将其改写成async和await：

~~~js
const getUserInfo = async () => {
  const response = await fetch('/users.json') // 获取用户列表
  const users = await response.json() // 解析 JSON
  const user = users[0] // 选择第一个用户
  const userResponse = await fetch(`/users/${user.name}`) // 获取用户数据
  const userData = await userResponse.json() // 解析 JSON
  return userData
}

getUserInfo()
~~~

可以看到业务逻辑变得更加清晰。同时，我们获取到了很多中间值，这样也方便我们进行调试。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！







