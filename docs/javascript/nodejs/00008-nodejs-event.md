---
slug: /nodejs-event
---

# 8. nodejs事件和事件循环简介

# 简介

熟悉javascript的朋友应该都使用过事件，比如鼠标的移动，鼠标的点击，键盘的输入等等。我们在javascript中监听这些事件，从而触发相应的处理。

同样的nodejs中也有事件，并且还有一个专门的events模块来进行专门的处理。

同时事件和事件循环也是nodejs构建异步IO的非常重要的概念。

今天我们来详细了解一下。

# 事件

nodejs为事件提供了一个专门的模块：lib/events.js。

还记得我们在讲使用nodejs构建web服务器吗？

~~~js
const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('welcome to www.flydean.com\n')
})
~~~

这里，每个请求都会触发request事件。

nodejs的核心API是基于异步事件驱动来进行架构的，所以nodejs中有非常多的事件。

比如：net.Server 会在每次有新连接时触发事件，fs.ReadStream 会在打开文件时触发事件，stream会在数据可读时触发事件。

我们看一下怎么来构建一个nodejs的事件：

~~~js
const EventEmitter = require('events')
const eventEmitter = new EventEmitter()
~~~

events常用的方法有两个，分别是on和emit。

on用来监听事件，emit用来触发事件。

~~~js
eventEmitter.on('fire', () => {
  console.log('开火')
})

eventEmitter.emit('fire')
~~~

emit还可以带参数，我们看下一个参数的情况：

~~~js
eventEmitter.on('fire', who => {
  console.log(`开火 ${who}`)
})

eventEmitter.emit('fire', '美帝')
~~~

再看看两个参数的情况：

~~~js
eventEmitter.on('fire', (who, when) => {
  console.log(`开火 ${who} ${when}`)
})

eventEmitter.emit('fire', '川建国'，'now')
~~~

默认情况下，EventEmitter以注册的顺序同步地调用所有监听器。这样可以确保事件的正确排序，并有助于避免竞态条件和逻辑错误。

如果需要异步执行，则可以使用setImmediate() 或者 process.nextTick()来切换到异步执行模式。

~~~js
eventEmitter.on('fire', (who, when) => {
    setImmediate(() => {
      console.log(`开火 ${who} ${when}`);
  });
})

eventEmitter.emit('fire', '川建国'，'now')
~~~

除此之外，events还支持其他几个方法：

once(): 添加单次监听器

removeListener() / off(): 从事件中移除事件监听器

removeAllListeners(): 移除事件的所有监听器

# 事件循环

我们知道nodejs的代码是运行在单线程环境中的，每次只会去处理一件事情。

这一种处理方式，避免了多线程环境的数据同步的问题，大大的提升了处理效率。

所谓事件循环，就是指处理器在一个程序周期中，处理完这个周期的事件之后，会进入下一个事件周期，处理下一个事件周期的事情，这样一个周期一个周期的循环。

## 事件循环的阻塞

如果我们在事件处理过程中，某个事件的处理发生了阻塞，则会影响其他的事件的执行，所以我们可以看到在JS中，几乎所有的IO都是非阻塞的。这也是为什么javascript中有这么多回调的原因。

## 事件循环举例

我们看一个简单的事件循环的例子：

~~~js
const action2 = () => console.log('action2')

const action3 = () => console.log('action3')

const action1 = () => {
    console.log('action1')
    action2()
    action3()
}

action1()
~~~

上面的代码输出：

~~~js
action1
action2
action3
~~~

## 栈和消息队列

我们知道函数间的调用是通过栈来实现的，上面的例子中，我们的调用顺序也是通过栈来实现的。

但并不是函数中所有的方法都会入栈，还有一些方法会被放入消息队列。

我们再举一个例子：

~~~js
const action2 = () => console.log('action2')

const action3 = () => console.log('action3')

const action1 = () => {
    console.log('action1')
    setTimeout(action2, 0)
    action3()
}

action1()
~~~

上面的代码运行结果：

~~~js
action1
action3
action2
~~~

结果不一样了。这是因为settimeout触发了定时器，当定时器到期的时候，回调函数会被放入消息队列中等待被处理，而不是放入栈中。

事件循环会优先处理栈中的事件，只有栈中没有任何数据的时候，才会去转而消费消息队列中的事件。

虽然上面例子中setTimeout的timeout时间是0，但是还是要等到action3执行完毕才能执行。

> 注意，setTimeout中的timeout并不是在当前线程进行等待的，它是由浏览器或者其他JS执行环境来调用的。

## 作业队列和promise

ES6中的Promise引入了作业队列的概念，使用作业队列将会尽快地执行异步函数的结果，而不是放在调用堆栈的末尾。

举个例子：

~~~js
const action2 = () => console.log('action2')

const action3 = () => console.log('action3')

const action1 = () => {
    console.log('action1')
    setTimeout(action2, 0)
    new Promise((resolve, reject) =>
        resolve('应该在action3之后、action2之前')
    ).then(resolve => console.log(resolve))
    action3()
}

action1()
~~~

输出结果：

~~~js
action1
action3
应该在action3之后、action2之前
action2
~~~

这是因为，在当前函数结束之前 resolve 的 Promise 会在当前函数之后被立即执行。

也就是说先执行栈，再执行作业队列，最后执行消息队列。

## process.nextTick()

先给大家一个定义叫做tick，一个tick就是指一个事件周期。而process.nextTick()就是指在下一个事件循环tick开始之前，调用这个函数：

~~~js
process.nextTick(() => {
  console.log('i am the next tick');
})
~~~

所以nextTick一定要比消息队列的setTimeout要快。

## setImmediate()

nodejs提供了一个setImmediate方法，来尽快的执行代码。

~~~js
setImmediate(() => {
  console.log('I am immediate!');
})
~~~

setImmediate中的函数会在事件循环的下一个迭代中执行。

setImmediate() 和 setTimeout(() => {}, 0)的功能基本上是类似的。它们都会在事件循环的下一个迭代中运行。

## setInterval()

如果想要定时执行某些回调函数，则需要用到setInterval。

~~~js
setInterval(() => {
  console.log('每隔2秒执行一次');
}, 2000)
~~~

要清除上面的定时任务，可以使用clearInterval：

~~~js
const id = setInterval(() => {
  console.log('每隔2秒执行一次');
}, 2000)

clearInterval(id)
~~~

注意，setInterval是每隔n毫秒启动一个函数，不管该函数是否执行完毕。

如果一个函数执行时间太长，就会导致下一个函数同时执行的情况，怎么解决这个问题呢？

我们可以考虑在回调函数内部再次调用setTimeout，这样形成递归的setTimeout调用：

~~~js
const myFunction = () => {
  console.log('做完后，隔2s再次执行！');

  setTimeout(myFunction, 2000)
}

setTimeout(myFunction, 2000)
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





















