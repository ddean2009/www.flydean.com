---
slug: /nodejs-event-more
---

# 9. nodejs事件和事件循环详解

# 简介

上篇文章我们简单的介绍了nodejs中的事件event和事件循环event loop。本文本文将会更进一步，继续讲解nodejs中的event，并探讨一下setTimeout，setImmediate和process.nextTick的区别。

# nodejs中的事件循环

虽然nodejs是单线程的，但是nodejs可以将操作委托给系统内核，系统内核在后台处理这些任务，当任务完成之后，通知nodejs,从而触发nodejs中的callback方法。

这些callback会被加入轮循队列中，最终被执行。

通过这样的event loop设计，nodejs最终可以实现非阻塞的IO。

nodejs中的event loop被分成了一个个的phase，下图列出了各个phase的执行顺序：

![](https://img-blog.csdnimg.cn/20200929155754234.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

每个phase都会维护一个callback queue,这是一个FIFO的队列。

当进入一个phase之后，首先会去执行该phase的任务，然后去执行属于该phase的callback任务。

当这个callback队列中的任务全部都被执行完毕或达到了最大的callback执行次数之后，就会进入下一个phase。

> 注意， windows和linux的具体实现有稍许不同，这里我们只关注最重要的几个phase。

问题：phase的执行过程中，为什么要限制最大的callback执行次数呢？

回答：在极端情况下，某个phase可能会需要执行大量的callback，如果执行这些callback花费了太多的时间，那么将会阻塞nodejs的运行，所以我们设置callback执行的次数限制，以避免nodejs的长时间block。

# phase详解

上面的图中，我们列出了6个phase，接下来我们将会一一的进行解释。

## timers

timers的中文意思是定时器，也就是说在给定的时间或者时间间隔去执行某个callback函数。

通常的timers函数有这样两种：setTimeout和setInterval。

一般来说这些callback函数会在到期之后尽可能的执行，但是会受到其他callback执行的影响。 我们来看一个例子：

~~~js
const fs = require('fs');

function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 100);

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  const startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});
~~~

上面的例子中，我们调用了someAsyncOperation，这个函数首先回去执行readFile方法，假设这个方法耗时95ms。接着执行readFile的callback函数，这个callback会执行10ms。最后才回去执行setTimeout中的callback。

所以上面的例子中，虽然setTimeout指定要在100ms之后运行，但是实际上还要等待95 + 10 = 105 ms之后才会真正的执行。

## pending callbacks

这个phase将会执行一些系统的callback操作，比如在做TCP连接的时候，TCP socket接收到了ECONNREFUSED信号，在某些liunx操作系统中将会上报这个错误，那么这个系统的callback将会放到pending callbacks中运行。

或者是需要在下一个event loop中执行的I/O callback操作。

## idle, prepare

idle, prepare是内部使用的phase，这里就不过多介绍。

## poll轮询

poll将会检测新的I/O事件，并执行与I / O相关的回调，注意这里的回调指的是除了关闭callback，timers，和setImmediate之外的几乎所有的callback事件。

poll主要处理两件事情：轮询I/O，并且计算block的时间，然后处理poll queue中的事件。

如果poll queue非空的话，event loop将会遍历queue中的callback，然后一个一个的同步执行，知道queue消费完毕，或者达到了callback数量的限制。

因为queue中的callback是一个一个同步执行的，所以可能会出现阻塞的情况。

如果poll queue空了，如果代码中调用了setImmediate，那么将会立马跳到下一个check phase，然后执行setImmediate中的callback。 如果没有调用setImmediate，那么会继续等待新来的callback被加入到queue中，并执行。

## check

主要来执行setImmediate的callback。

setImmediate可以看做是一个运行在单独phase中的独特的timer，底层使用的libuv API来规划callbacks。

一般来说，如果在poll phase中有callback是以setImmediate的方式调用的话，会在poll queue为空的情况下，立马结束poll phase，进入check phase来执行对应的callback方法。

## close callbacks

最后一个phase是处理close事件中的callbacks。 比如一个socket突然被关闭，那么将会触发一个close事件，并调用相关的callback。

# setTimeout 和 setImmediate的区别

setTimeout和setImmediate有什么不同呢？

从上图的phase阶段可以看出，setTimeout中的callback是在timer phase中执行的，而setImmediate是在check阶段执行的。

从语义上讲，setTimeout指的是，在给定的时间之后运行某个callback。而setImmediate是在执行完当前loop中的 I/O操作之后，立马执行。

那么这两个方法的执行顺序上有什么区别呢？

下面我们举两个例子，第一个例子中两个方法都是在主模块中运行：

~~~js
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
~~~

这样运行两个方法的执行顺序是不确定，因为可能受到其他执行程序的影响。

第二个例子是在I/O模块中运行这两个方法：

~~~js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
~~~

你会发现，在I/O模块中，setImmediate一定会在setTimeout之前执行。

## 两者的共同点

setTimeout和setImmediate两者都有一个返回值，我们可以通过这个返回值，来对timer进行clear操作：

~~~js
const timeoutObj = setTimeout(() => {
  console.log('timeout beyond time');
}, 1500);

const immediateObj = setImmediate(() => {
  console.log('immediately executing immediate');
});

const intervalObj = setInterval(() => {
  console.log('interviewing the interval');
}, 500);

clearTimeout(timeoutObj);
clearImmediate(immediateObj);
clearInterval(intervalObj);
~~~

clear操作也可以clear intervalObj。

## unref 和 ref

setTimeout和setInterval返回的对象都是Timeout对象。

如果这个timeout对象是最后要执行的timeout对象，那么可以使用unref方法来取消其执行，取消执行完毕，可以使用ref来恢复它的执行。

~~~js
const timerObj = setTimeout(() => {
  console.log('will i run?');
});

timerObj.unref();

setImmediate(() => {
  timerObj.ref();
});
~~~

> 注意，如果有多个timeout对象，只有最后一个timeout对象的unref方法才会生效。

# process.nextTick

process.nextTick也是一种异步API，但是它和timer是不同的。

如果我们在一个phase中调用process.nextTick，那么nextTick中的callback会在这个phase完成，进入event loop的下一个phase之前完成。

这样做就会有一个问题，如果我们在process.nextTick中进行递归调用的话，这个phase将会被阻塞，影响event loop的正常执行。

那么，为什么我们还会有process.nextTick呢？

考虑下面的一个例子：

~~~js
let bar;

function someAsyncApiCall(callback) { callback(); }

someAsyncApiCall(() => {
  console.log('bar', bar); // undefined
});

bar = 1;
~~~

上面的例子中，我们定义了一个someAsyncApiCall方法，里面执行了传入的callback函数。

这个callback函数想要输出bar的值，但是bar的值是在someAsyncApiCall方法之后被赋值的。

这个例子最终会导致输出的bar值是undefined。

我们的本意是想让用户程序执行完毕之后，再调用callback，那么我们可以使用process.nextTick来对上面的例子进行改写：

~~~js
let bar;

function someAsyncApiCall(callback) {
  process.nextTick(callback);
}

someAsyncApiCall(() => {
  console.log('bar', bar); // 1
});

bar = 1;
~~~

我们再看一个实际中使用的例子：

~~~js
const server = net.createServer(() => {}).listen(8080);

server.on('listening', () => {});
~~~

上面的例子是最简单的nodejs创建web服务。

上面的例子有什么问题呢？listen(8000) 方法将会立马绑定8000端口。但是这个时候，server的listening事件绑定代码还没有执行。

这里实际上就用到了process.nextTick技术，从而不管我们在什么地方绑定listening事件，都可以监听到listen事件。

## process.nextTick 和 setImmediate 的区别

process.nextTick 是立马在当前phase执行callback，而setImmediate是在check阶段执行callback。

所以process.nextTick要比setImmediate的执行顺序优先。

实际上，process.nextTick和setImmediate的语义应该进行互换。因为process.nextTick表示的才是immediate,而setImmediate表示的是next tick。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！



