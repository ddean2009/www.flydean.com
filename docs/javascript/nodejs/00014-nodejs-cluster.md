---
slug: /nodejs-cluster
---

# 14. 在nodejs中创建cluster

# 简介

在前面的文章中，我们讲到了可以通过worker_threads来创建新的线程，可以使用child_process来创建新的子进程。本文将会介绍如何创建nodejs的集群cluster。

# cluster集群

我们知道，nodejs的event loop或者说事件响应处理器是单线程的，但是现在的CPU基本上都是多核的，为了充分利用现代CPU多核的特性，我们可以创建cluster，从而使多个子进程来共享同一个服务器端口。

也就是说，通过cluster，我们可以使用多个子进程来服务处理同一个端口的请求。

先看一个简单的http server中使用cluster的例子：

~~~js
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  // 工作进程可以共享任何 TCP 连接。
  // 在本例子中，共享的是 HTTP 服务器。
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('你好世界\n');
  }).listen(8000);

  console.log(`工作进程 ${process.pid} 已启动`);
}
~~~

# cluster详解

cluster模块源自于lib/cluster.js，我们可以通过cluster.fork()来创建子工作进程，用来处理主进程的请求。

## cluster中的event

cluster继承自events.EventEmitter，所以cluster可以发送和接收event。

cluster支持7中event，分别是disconnect，exit，fork，listening，message，online和setup。

在讲解disconnect之前，我们先介绍一个概念叫做IPC，IPC的全称是Inter-Process Communication，也就是进程间通信。

IPC主要用来进行主进程和子进程之间的通信。一个工作进程在创建后会自动连接到它的主进程。 当 'disconnect' 事件被触发时才会断开连接。

触发disconnect事情的原因有很多，可以是主动调用worker.disconnect()，也可以是工作进程退出或者被kill掉。

~~~js
cluster.on('disconnect', (worker) => {
  console.log(`工作进程 #${worker.id} 已断开连接`);
});
~~~

exit事件会在任何一个工作进程关闭的时候触发。一般用来监测cluster中某一个进程是否异常退出，如果退出的话使用cluster.fork创建新的进程，以保证有足够多的进程来处理请求。

~~~js
cluster.on('exit', (worker, code, signal) => {
  console.log('工作进程 %d 关闭 (%s). 重启中...',
              worker.process.pid, signal || code);
  cluster.fork();
});
~~~

fork事件会在调用cluster.fork方法的时候被触发。

~~~js
const timeouts = [];
function errorMsg() {
  console.error('连接出错');
}

cluster.on('fork', (worker) => {
  timeouts[worker.id] = setTimeout(errorMsg, 2000);
});
~~~

主进程和工作进程的listening事件都会在工作进程调用listen方法的时候触发。

~~~js
cluster.on('listening', (worker, address) => {
  console.log(
    `工作进程已连接到 ${address.address}:${address.port}`);
});
~~~

其中worker代表的是工作线程，而address中包含三个属性：address、 port 和 addressType。 其中addressType有四个可选值：

* 4 (TCPv4)
* 6 (TCPv6)
* -1 (Unix 域 socket)
* 'udp4' or 'udp6' (UDP v4 或 v6)

message事件会在主进程收到子进程发送的消息时候触发。

当主进程生成工作进程时会触发fork，当工作进程运行时会触发online。

setupMaster方法被调用的时候，会触发setup事件。

## cluster中的方法

cluster中三个方法，分别是disconnect，fork和setupMaster。

~~~js
cluster.disconnect([callback])
~~~

调用cluster的disconnect方法，实际上会在cluster中的每个worker中调用disconnect方法。从而断开worker和主进程的连接。

当所有的worker都断开连接之后，会执行callback。

~~~js
cluster.fork([env])
~~~

fork方法，会从主进程中创建新的子进程。其中env是要添加到进程环境变量的键值对。

fork将会返回一个cluster.Worker对象，代表工作进程。

最后一个方法是setupMaster：

~~~js
cluster.setupMaster([settings])
~~~

默认情况下，cluster通过fork方法来创建子进程，但是我们可以通过setupMaster来改变这个行为。通过设置settings变量，我们可以改变后面fork子进程的行为。

我们看一个setupMaster的例子：

~~~js
const cluster = require('cluster');
cluster.setupMaster({
  exec: 'worker.js',
  args: ['--use', 'https'],
  silent: true
});
cluster.fork(); // https 工作进程
cluster.setupMaster({
  exec: 'worker.js',
  args: ['--use', 'http']
});
cluster.fork(); // http 工作进程
~~~

## cluster中的属性

通过cluster对象，我们可以通过isMaster和isWorker来判断进程是否主进程。

可以通过worker来获取当前工作进程对象的引用：

~~~js
const cluster = require('cluster');

if (cluster.isMaster) {
  console.log('这是主进程');
  cluster.fork();
  cluster.fork();
} else if (cluster.isWorker) {
  console.log(`这是工作进程 #${cluster.worker.id}`);
}
~~~

可以通过workers来遍历活跃的工作进程对象：

~~~js
// 遍历所有工作进程。
function eachWorker(callback) {
  for (const id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}
eachWorker((worker) => {
  worker.send('通知所有工作进程');
});
~~~

每个worker都有一个id编号，用来定位该worker。

# cluster中的worker

worker类中包含了关于工作进程的所有的公共的信息和方法。cluster.fork出来的就是worker对象。

worker的事件和cluster的很类似，支持6个事件：disconnect，error，exit，listening，message和online。

worker中包含3个属性，分别是：id，process和exitedAfterDisconnect。

其中id是worker的唯一标记。

worker中的process，实际上是ChildProcess对象，是通过child_process.fork()来创建出来的。

因为在worker中，process属于全局变量，所以我们可以直接在worker中使用process来进行发送消息。

exitedAfterDisconnect表示如果工作进程由于 .kill() 或 .disconnect() 而退出的话，值就是true。如果是以其他方式退出的话，返回值就是false。如果工作进程尚未退出，则为 undefined。

我们可以通过worker.exitedAfterDisconnect 来区分是主动退出还是被动退出，主进程可以根据这个值决定是否重新生成工作进程。

~~~js
cluster.on('exit', (worker, code, signal) => {
  if (worker.exitedAfterDisconnect === true) {
    console.log('这是自发退出，无需担心');
  }
});

// 杀死工作进程。
worker.kill();
~~~

worker还支持6个方法，分别是：send，kill，destroy，disconnect，isConnected，isDead。

这里我们主要讲解一下send方法来发送消息：

~~~js
worker.send(message[, sendHandle[, options]][, callback])
~~~

可以看到send方法和child_process中的send方法参数其实是很类似的。而本质上，worker.send在主进程中，这会发送消息给特定的工作进程。 相当于 ChildProcess.send()。在工作进程中，这会发送消息给主进程。 相当于 process.send()。

~~~js
if (cluster.isMaster) {
  const worker = cluster.fork();
  worker.send('你好');

} else if (cluster.isWorker) {
  process.on('message', (msg) => {
    process.send(msg);
  });
}
~~~

在上面的例子中，如果是在主进程中，那么可以使用worker.send来发送消息。而在子进程中，则可以使用worker中的全局变量process来发送消息。

# 总结

使用cluster可以充分使用多核CPU的优势，希望大家在实际的项目中应用起来。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！












