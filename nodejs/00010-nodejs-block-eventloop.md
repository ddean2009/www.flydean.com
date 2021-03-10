为什么我们不要在nodejs中阻塞event loop

# 简介

我们知道event loop是nodejs中事件处理的基础，event loop中主要运行的初始化和callback事件。除了event loop之外，nodejs中还有Worker Pool用来处理一些耗时的操作，比如I/O操作。

nodejs高效运行的秘诀就是使用异步IO从而可以使用少量的线程来处理大量的客户端请求。

而同时，因为使用了少量的线程，所以我们在编写nodejs程序的时候，一定要特别小心。

# event loop和worker pool

在nodejs中有两种类型的线程。第一类线程就是Event Loop也可以被称为主线程，第二类就是一个Worker Pool中的n个Workers线程。

如果这两种线程执行callback花费了太多的时间，那么我们就可以认为这两个线程被阻塞了。

线程阻塞第一方面会影响程序的性能，因为某些线程被阻塞，就会导致系统资源的占用。因为总的资源是有限的，这样就会导致处理其他业务的资源变少，从而影响程序的总体性能。

第二方面，如果经常会有线程阻塞的情况，很有可能被恶意攻击者发起DOS攻击，导致正常业务无法进行。

nodejs使用的是事件驱动的框架，Event Loop主要用来处理为各种事件注册的callback，同时也负责处理非阻塞的异步请求，比如网络I/O。

而由libuv实现的Worker Pool主要对外暴露了提交task的API，从而用来处理一些比较昂贵的task任务。这些任务包括CPU密集性操作和一些阻塞型IO操作。

而nodejs本身就有很多模块使用的是Worker Pool。

比如IO密集型操作：

DNS模块中的dns.lookup(), dns.lookupService()。

和除了fs.FSWatcher()和 显式同步的文件系统的API之外，其他多有的File system模块都是使用的Worker Pool。

CPU密集型操作：

Crypto模块：crypto.pbkdf2(), crypto.scrypt(), crypto.randomBytes(), crypto.randomFill(), crypto.generateKeyPair()。

Zlib模块：除了显示同步的API之外，其他的API都是用的是worker pool。

一般来说使用Worker Pool的模块就是这些了，除此之外，你还可以使用nodejs的C++ add-on来自行提交任务到Worker Pool。

## event loop和worker pool中的queue

在之前的文件中，我们讲到了event loop中使用queue来存储event的callback，实际上这种描述是不准确的。

event loop实际上维护的是一个文件描述符集合。这些文件描述符使用的是操作系统内核的 epoll (Linux), kqueue (OSX), event ports (Solaris), 或者 IOCP (Windows)来对事件进行监听。

当操作系统检测到事件准备好之后，event loop就会调用event所绑定的callback事件，最终执行callback。

相反的，worker pool就真的是保存了要执行的任务队列，这些任务队列中的任务由各个worker来执行。当执行完毕之后，Woker将会通知Event Loop该任务已经执行完毕。

# 阻塞event loop

因为nodejs中的线程有限，如果某个线程被阻塞，就可能会影响到整个应用程序的执行，所以我们在程序设计的过程中，一定要小心的考虑event loop和worker pool，避免阻塞他们。

event loop主要关注的是用户的连接和响应用户的请求，如果event loop被阻塞，那么用户的请求将会得不到及时响应。

因为event loop主要执行的是callback，所以，我们的callback执行时间一定要短。

## event loop的时间复杂度

时间复杂度一般用在判断一个算法的运行速度上，这里我们也可以借助时间复杂度这个概念来分析一下event loop中的callback。

如果所有的callback中的时间复杂度都是一个常量的话，那么我们可以保证所有的callback都可以很公平的被执行。

但是如果有些callback的时间复杂度是变化的，那么就需要我们仔细考虑了。

~~~js
app.get('/constant-time', (req, res) => {
  res.sendStatus(200);
});
~~~

先看一个常量时间复杂度的情况，上面的例子中我们直接设置了respose的status，是一个常量时间操作。

~~~js
app.get('/countToN', (req, res) => {
  let n = req.query.n;

  // n iterations before giving someone else a turn
  for (let i = 0; i < n; i++) {
    console.log(`Iter ${i}`);
  }

  res.sendStatus(200);
});
~~~

上面的例子是一个O(n)的时间复杂度，根据request中传入的n的不同，我们可以得到不同的执行时间。

~~~js
app.get('/countToN2', (req, res) => {
  let n = req.query.n;

  // n^2 iterations before giving someone else a turn
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      console.log(`Iter ${i}.${j}`);
    }
  }

  res.sendStatus(200);
});
~~~

上面的例子是一个O(n^2)的时间复杂度。

这种情况应该怎么处理呢？首先我们需要估算出系统能够承受的响应极限值，并且设定用户传入的参数极限值，如果用户传入的数据太长，超出了我们的处理范围，则可以直接从用户输入端进行限制，从而保证我们的程序的正常运行。

## Event Loop中不推荐使用的Node.js核心模块

在nodejs中的核心模块中，有一些方法是同步的阻塞API，使用起来开销比较大，比如压缩，加密，同步IO，子进程等等。

这些API的目的是供我们在REPL环境中使用的，我们不应该直接在服务器端程序中使用他们。

有哪些不推荐在server端使用的API呢？

* Encryption:
crypto.randomBytes (同步版本)
crypto.randomFillSync
crypto.pbkdf2Sync

* Compression:
zlib.inflateSync
zlib.deflateSync

* File system:
不要使用fs的同步API

* Child process:
child_process.spawnSync
child_process.execSync
child_process.execFileSync

## partitioning 或者 offloading

为了不阻塞event loop，同时给其他event一些运行机会，我们实际上有两种解决办法，那就是partitioning和offloading。

partitioning就是分而治之，把一个长的任务，分成几块，每次执行一块，同时给其他的event一些运行时间，从而不再阻塞event loop。

举个例子：

~~~js
for (let i = 0; i < n; i++)
  sum += i;
let avg = sum / n;
console.log('avg: ' + avg);
~~~

比如我们要计算n个数的平均数。上面的例子中我们的时间复杂度是O(n)。

~~~js
function asyncAvg(n, avgCB) {
  // Save ongoing sum in JS closure.
  var sum = 0;
  function help(i, cb) {
    sum += i;
    if (i == n) {
      cb(sum);
      return;
    }

    // "Asynchronous recursion".
    // Schedule next operation asynchronously.
    setImmediate(help.bind(null, i+1, cb));
  }

  // Start the helper, with CB to call avgCB.
  help(1, function(sum){
      var avg = sum/n;
      avgCB(avg);
  });
}

asyncAvg(n, function(avg){
  console.log('avg of 1-n: ' + avg);
});
~~~

这里我们用到了setImmediate，将sum的任务分解成一步一步的。虽然asyncAvg需要执行很多次，但是每一次的event loop都可以保证不被阻塞。

partitioning虽然逻辑简单，但是对于一些大型的计算任务来说，并不合适。并且partitioning本身还是运行在event loop中的，它并没有享受到多核系统带来的优势。

这个时候我们就需要将任务offloading到worker Pool中。

使用Worker Pool有两种方式，第一种就是使用nodejs自带的Worker Pool，我们可以自行开发C++ addon或者node-webworker-threads。

第二种方式就是自行创建Worker Pool，我们可以使用Child Process 或者 Cluster来实现。

当然offloading也有缺点，它的最大缺点就是和Event Loop的交互损失。


# V8引擎的限制

nodejs是运行在V8引擎上的，通常来说V8引擎已经足够优秀足够快了，但是还是存在两个例外，那就是正则表达式和JSON操作。

## REDOS正则表达式DOS攻击

正则表达式有什么问题呢？正则表达式有一个悲观回溯的问题。

什么是悲观回溯呢？

我们举个例子，假如大家对正则表达式已经很熟悉了。

假如我们使用/^(x*)y$/ 来和字符串xxxxxxy来进行匹配。

匹配之后第一个分组（也就是括号里面的匹配值）是xxxxxx。

如果我们把正则表达式改写为 /^(x*)xy$/ 再来和字符串xxxxxxy来进行匹配。 匹配的结果就是xxxxx。

这个过程是怎么样的呢？

首先(x*)会尽可能的匹配更多的x，知道遇到字符y。 这时候(x*)已经匹配了6个x。

接着正则表达式继续执行(x*)之后的xy，发现不能匹配，这时候(x*)需要从已经匹配的6个x中，吐出一个x，然后重新执行正则表达式中的xy，发现能够匹配，正则表达式结束。

这个过程就是一个回溯的过程。

如果正则表达式写的不好，那么就有可能会出现悲观回溯。

还是上面的例子，但是这次我们用/^(x*)y$/ 来和字符串xxxxxx来进行匹配。

按照上面的流程，我们知道正则表达式需要进行6次回溯，最后匹配失败。

考虑一些极端的情况，可能会导致回溯一个非常大的次数，从而导致CPU占用率飙升。

我们称正则表达式的DOS攻击为REDOS。

举个nodejs中REDOS的例子：

~~~js
app.get('/redos-me', (req, res) => {
  let filePath = req.query.filePath;

  // REDOS
  if (filePath.match(/(\/.+)+$/)) {
    console.log('valid path');
  }
  else {
    console.log('invalid path');
  }

  res.sendStatus(200);
});
~~~

上面的callback中，我们本意是想匹配 /a/b/c这样的路径。但是如果用户输入filePath=///.../\n，假如有100个/,最后跟着换行符。

那么将会导致正则表达式的悲观回溯。因为`.`表示的是匹配除换行符 \n 之外的任何单字符。但是我们只到最后才发现不能够匹配，所以产生了REDOS攻击。

如何避免REDOS攻击呢？

一方面有一些现成的正则表达式模块，我们可以直接使用，比如safe-regex，rxxr2和node-re2等。

一方面可以到www.regexlib.com网站上查找要使用的正则表达式规则，这些规则是经过验证的，可以减少自己编写正则表达式的失误。

## JSON DOS攻击

通常我们会使用JSON.parse 和 JSON.stringify 这两个JSON常用的操作，但是这两个操作的时间是和输入的JSON长度相关的。

举个例子：

~~~js
var obj = { a: 1 };
var niter = 20;

var before, str, pos, res, took;

for (var i = 0; i < niter; i++) {
  obj = { obj1: obj, obj2: obj }; // Doubles in size each iter
}

before = process.hrtime();
str = JSON.stringify(obj);
took = process.hrtime(before);
console.log('JSON.stringify took ' + took);

before = process.hrtime();
pos = str.indexOf('nomatch');
took = process.hrtime(before);
console.log('Pure indexof took ' + took);

before = process.hrtime();
res = JSON.parse(str);
took = process.hrtime(before);
console.log('JSON.parse took ' + took);
~~~

上面的例子中我们对obj进行解析操作，当然这个obj比较简单，如果用户传入了一个超大的json文件，那么就会导致event loop的阻塞。

解决办法就是限制用户的输入长度。或者使用异步的JSON API：比如JSONStream和Big-Friendly JSON。

# 阻塞Worker Pool

nodejs的理念就是用最小的线程来处理最大的客户连接。上面我们也讲过了要把复杂的操作放到Worker Pool中来借助线程池的优势来运行。

但是线程池中的线程个数也是有限的。如果某一个线程执行了一个long run task，那么就等于线程池中少了一个worker线程。

恶意攻击者实际上是可以抓住系统的这个弱点，来实施DOS攻击。

所以对Worker Pool中long run task的最优解决办法就是partitioning。从而让所有的任务都有平等的执行机会。

当然，如果你可以很清楚的区分short task和long run task，那么我们实际上可以分别构造不同的worker Pool来分别为不同的task任务类型服务。

# 总结

event loop和worker pool是nodejs中两种不同的事件处理机制，我们需要在程序中根据实际问题来选用。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





