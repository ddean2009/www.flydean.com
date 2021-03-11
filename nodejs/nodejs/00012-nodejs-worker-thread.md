nodejs中使用worker_threads来创建新的线程

# 简介

之前的文章中提到了，nodejs中有两种线程，一种是event loop用来相应用户的请求和处理各种callback。另一种就是worker pool用来处理各种耗时操作。

nodejs的官网提到了一个能够使用nodejs本地woker pool的lib叫做webworker-threads。

可惜的是webworker-threads的最后一次更新还是在2年前，而在最新的nodejs 12中，根本无法使用。

而webworker-threads的作者则推荐了一个新的lib叫做web-worker。

web-worker是构建于nodejs的worker_threads之上的，本文将会详细讲解worker_threads和web-worker的使用。

# worker_threads

worker_threads模块的源代码源自lib/worker_threads.js，它指的是工作线程，可以开启一个新的线程来并行执行javascript程序。

worker_threads主要用来处理CPU密集型操作,而不是IO操作，因为nodejs本身的异步IO已经非常强大了。

worker_threads中主要有5个属性，3个class和3个主要的方法。接下来我们将会一一讲解。

## isMainThread

isMainThread用来判断代码是否在主线程中运行，我们看一个使用的例子：

~~~js
const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
    console.log('在主线程中');
  new Worker(__filename);
} else {
  console.log('在工作线程中');
  console.log(isMainThread);  // 打印 'false'。
}
~~~

上面的例子中，我们从worker_threads模块中引入了Worker和isMainThread，Worker就是工作线程的主类，我们将会在后面详细讲解，这里我们使用Worker创建了一个工作线程。

## MessageChannel

MessageChannel代表的是一个异步双向通信channel。MessageChannel中没有方法，主要通过MessageChannel来连接两端的MessagePort。

~~~js
    class MessageChannel {
        readonly port1: MessagePort;
        readonly port2: MessagePort;
    }
~~~

当我们使用new MessageChannel()的时候，会自动创建两个MessagePort。

~~~js
const { MessageChannel } = require('worker_threads');

const { port1, port2 } = new MessageChannel();
port1.on('message', (message) => console.log('received', message));
port2.postMessage({ foo: 'bar' });
// Prints: received { foo: 'bar' } from the `port1.on('message')` listener
~~~

通过MessageChannel，我们可以进行MessagePort间的通信。

## parentPort和MessagePort

parentPort是一个MessagePort类型，parentPort主要用于worker线程和主线程进行消息交互。

通过parentPort.postMessage()发送的消息在主线程中将可以通过worker.on('message')接收。

主线程中通过worker.postMessage()发送的消息将可以在工作线程中通过parentPort.on('message')接收。

我们看一下MessagePort的定义：

~~~js
class MessagePort extends EventEmitter {
        close(): void;
        postMessage(value: any, transferList?: Array<ArrayBuffer | MessagePort>): void;
        ref(): void;
        unref(): void;
        start(): void;

        addListener(event: "close", listener: () => void): this;
        addListener(event: "message", listener: (value: any) => void): this;
        addListener(event: string | symbol, listener: (...args: any[]) => void): this;

        emit(event: "close"): boolean;
        emit(event: "message", value: any): boolean;
        emit(event: string | symbol, ...args: any[]): boolean;

        on(event: "close", listener: () => void): this;
        on(event: "message", listener: (value: any) => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;

        once(event: "close", listener: () => void): this;
        once(event: "message", listener: (value: any) => void): this;
        once(event: string | symbol, listener: (...args: any[]) => void): this;

        prependListener(event: "close", listener: () => void): this;
        prependListener(event: "message", listener: (value: any) => void): this;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

        prependOnceListener(event: "close", listener: () => void): this;
        prependOnceListener(event: "message", listener: (value: any) => void): this;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

        removeListener(event: "close", listener: () => void): this;
        removeListener(event: "message", listener: (value: any) => void): this;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): this;

        off(event: "close", listener: () => void): this;
        off(event: "message", listener: (value: any) => void): this;
        off(event: string | symbol, listener: (...args: any[]) => void): this;
    }
~~~

MessagePort继承自EventEmitter，它表示的是异步双向通信channel的一端。这个channel就叫做MessageChannel，MessagePort通过MessageChannel来进行通信。

我们可以通过MessagePort来传输结构体数据，内存区域或者其他的MessagePorts。

从源代码中，我们可以看到MessagePort中有两个事件，close和message。

close事件将会在channel的中任何一端断开连接的时候触发，而message事件将会在port.postMessage时候触发，下面我们看一个例子：

~~~js
const { MessageChannel } = require('worker_threads');
const { port1, port2 } = new MessageChannel();

// Prints:
//   foobar
//   closed!
port2.on('message', (message) => console.log(message));
port2.on('close', () => console.log('closed!'));

port1.postMessage('foobar');
port1.close();
~~~

port.on('message')实际上为message事件添加了一个listener，port还提供了addListener方法来手动添加listener。

port.on('message')会自动触发port.start(）方法，表示启动一个port。

当port有listener存在的时候，这表示port存在一个ref，当存在ref的时候，程序是不会结束的。我们可以通过调用port.unref方法来取消这个ref。

接下来我们看一下怎么通过port来传输消息：

~~~js
port.postMessage(value[, transferList])
~~~

postMessage可以接受两个参数，第一个参数是value，这是一个JavaScript对象。第二个参数是transferList。

先看一个传递一个参数的情况：

~~~js
const { MessageChannel } = require('worker_threads');
const { port1, port2 } = new MessageChannel();

port1.on('message', (message) => console.log(message));

const circularData = {};
circularData.foo = circularData;
// Prints: { foo: [Circular] }
port2.postMessage(circularData);
~~~

通常来说postMessage发送的对象都是value的拷贝，但是如果你指定了transferList，那么在transferList中的对象将会被transfer到channel的接受端，并且不再存在于发送端，就好像把对象传送出去一样。

transferList是一个list，list中的对象可以是ArrayBuffer, MessagePort 和 FileHandle。

如果value中包含SharedArrayBuffer对象，那么该对象不能被包含在transferList中。

看一个包含两个参数的例子：

~~~js
const { MessageChannel } = require('worker_threads');
const { port1, port2 } = new MessageChannel();

port1.on('message', (message) => console.log(message));

const uint8Array = new Uint8Array([ 1, 2, 3, 4 ]);
// post uint8Array的拷贝:
port2.postMessage(uint8Array);

port2.postMessage(uint8Array, [ uint8Array.buffer ]);

//port2.postMessage(uint8Array);
~~~

上面的例子将输出：

~~~js
Uint8Array(4) [ 1, 2, 3, 4 ]
Uint8Array(4) [ 1, 2, 3, 4 ]
~~~

第一个postMessage是拷贝，第二个postMessage是transfer Uint8Array底层的buffer。

如果我们再次调用port2.postMessage(uint8Array)，我们会得到下面的错误：

~~~
DOMException [DataCloneError]: An ArrayBuffer is detached and could not be cloned.
~~~

buffer是TypedArray的底层存储结构，如果buffer被transfer，那么之前的TypedArray将会变得不可用。

## markAsUntransferable

要想避免这个问题，我们可以调用markAsUntransferable将buffer标记为不可transferable. 我们看一个markAsUntransferable的例子：

~~~js
const { MessageChannel, markAsUntransferable } = require('worker_threads');

const pooledBuffer = new ArrayBuffer(8);
const typedArray1 = new Uint8Array(pooledBuffer);
const typedArray2 = new Float64Array(pooledBuffer);

markAsUntransferable(pooledBuffer);

const { port1 } = new MessageChannel();
port1.postMessage(typedArray1, [ typedArray1.buffer ]);

console.log(typedArray1);
console.log(typedArray2);
~~~

## SHARE_ENV

SHARE_ENV是传递给worker构造函数的一个env变量，通过设置这个变量，我们可以在主线程与工作线程进行共享环境变量的读写。

~~~js
const { Worker, SHARE_ENV } = require('worker_threads');
new Worker('process.env.SET_IN_WORKER = "foo"', { eval: true, env: SHARE_ENV })
  .on('exit', () => {
    console.log(process.env.SET_IN_WORKER);  // Prints 'foo'.
  });
~~~

## workerData

除了postMessage()，还可以通过在主线程中传递workerData给worker的构造函数，从而将主线程中的数据传递给worker：

~~~js
const { Worker, isMainThread, workerData } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: 'Hello, world!' });
} else {
  console.log(workerData);  // Prints 'Hello, world!'.
}
~~~

## worker类

先看一下worker的定义：

~~~js
    class Worker extends EventEmitter {
        readonly stdin: Writable | null;
        readonly stdout: Readable;
        readonly stderr: Readable;
        readonly threadId: number;
        readonly resourceLimits?: ResourceLimits;

        constructor(filename: string | URL, options?: WorkerOptions);

        postMessage(value: any, transferList?: Array<ArrayBuffer | MessagePort>): void;
        ref(): void;
        unref(): void;

        terminate(): Promise<number>;

        getHeapSnapshot(): Promise<Readable>;

        addListener(event: "error", listener: (err: Error) => void): this;
        addListener(event: "exit", listener: (exitCode: number) => void): this;
        addListener(event: "message", listener: (value: any) => void): this;
        addListener(event: "online", listener: () => void): this;
        addListener(event: string | symbol, listener: (...args: any[]) => void): this;

       ... 
    }
~~~

worker继承自EventEmitter，并且包含了4个重要的事件：error，exit，message和online。

worker表示的是一个独立的 JavaScript 执行线程，我们可以通过传递filename或者URL来构造worker。

每一个worker都有一对内置的MessagePort，在worker创建的时候就会相互关联。worker使用这对内置的MessagePort来和父线程进行通信。

通过parentPort.postMessage()发送的消息在主线程中将可以通过worker.on('message')接收。

主线程中通过worker.postMessage()发送的消息将可以在工作线程中通过parentPort.on('message')接收。

当然，你也可以显式的创建MessageChannel 对象，然后将MessagePort作为消息传递给其他线程，我们看一个例子：

~~~js
const assert = require('assert');
const {
  Worker, MessageChannel, MessagePort, isMainThread, parentPort
} = require('worker_threads');
if (isMainThread) {
  const worker = new Worker(__filename);
  const subChannel = new MessageChannel();
  worker.postMessage({ hereIsYourPort: subChannel.port1 }, [subChannel.port1]);
  subChannel.port2.on('message', (value) => {
    console.log('接收到:', value);
  });
} else {
  parentPort.once('message', (value) => {
    assert(value.hereIsYourPort instanceof MessagePort);
    value.hereIsYourPort.postMessage('工作线程正在发送此消息');
    value.hereIsYourPort.close();
  });
}
~~~

上面的例子中，我们借助了worker和parentPort本身的消息传递功能，传递了一个显式的MessageChannel中的MessagePort。

然后又通过该MessagePort来进行消息的分发。

## receiveMessageOnPort

除了port的on('message')方法之外，我们还可以使用receiveMessageOnPort来手动接收消息：

~~~js
const { MessageChannel, receiveMessageOnPort } = require('worker_threads');
const { port1, port2 } = new MessageChannel();
port1.postMessage({ hello: 'world' });

console.log(receiveMessageOnPort(port2));
// Prints: { message: { hello: 'world' } }
console.log(receiveMessageOnPort(port2));
// Prints: undefined
~~~

## moveMessagePortToContext

先了解一下nodejs中的Context的概念，我们可以从vm中创建context，它是一个隔离的上下文环境，从而保证不同运行环境的安全性，我们看一个context的例子：

~~~js
const vm = require('vm');

const x = 1;

const context = { x: 2 };
vm.createContext(context); // 上下文隔离化对象。

const code = 'x += 40; var y = 17;';
// `x` and `y` 是上下文中的全局变量。
// 最初，x 的值为 2，因为这是 context.x 的值。
vm.runInContext(code, context);

console.log(context.x); // 42
console.log(context.y); // 17

console.log(x); // 1; y 没有定义。
~~~

在worker中，我们可以将一个MessagePort move到其他的context中。

~~~js
worker.moveMessagePortToContext(port, contextifiedSandbox)
~~~

这个方法接收两个参数，第一个参数就是要move的MessagePort,第二个参数就是vm.createContext()创建的context对象。

# worker_threads的线程池

上面我们提到了使用单个的worker thread，但是现在程序中一个线程往往是不够的，我们需要创建一个线程池来维护worker thread对象。

nodejs提供了AsyncResource类，来作为对异步资源的扩展。

AsyncResource类是async_hooks模块中的。

下面我们看下怎么使用AsyncResource类来创建worker的线程池。

假设我们有一个task，使用来执行两个数相加，脚本名字叫做task_processor.js：

~~~js
const { parentPort } = require('worker_threads');
parentPort.on('message', (task) => {
  parentPort.postMessage(task.a + task.b);
});
~~~

下面是worker pool的实现：

~~~js
const { AsyncResource } = require('async_hooks');
const { EventEmitter } = require('events');
const path = require('path');
const { Worker } = require('worker_threads');

const kTaskInfo = Symbol('kTaskInfo');
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

class WorkerPoolTaskInfo extends AsyncResource {
  constructor(callback) {
    super('WorkerPoolTaskInfo');
    this.callback = callback;
  }

  done(err, result) {
    this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy();  // `TaskInfo`s are used only once.
  }
}

class WorkerPool extends EventEmitter {
  constructor(numThreads) {
    super();
    this.numThreads = numThreads;
    this.workers = [];
    this.freeWorkers = [];

    for (let i = 0; i < numThreads; i++)
      this.addNewWorker();
  }

  addNewWorker() {
    const worker = new Worker(path.resolve(__dirname, 'task_processor.js'));
    worker.on('message', (result) => {
      // In case of success: Call the callback that was passed to `runTask`,
      // remove the `TaskInfo` associated with the Worker, and mark it as free
      // again.
      worker[kTaskInfo].done(null, result);
      worker[kTaskInfo] = null;
      this.freeWorkers.push(worker);
      this.emit(kWorkerFreedEvent);
    });
    worker.on('error', (err) => {
      // In case of an uncaught exception: Call the callback that was passed to
      // `runTask` with the error.
      if (worker[kTaskInfo])
        worker[kTaskInfo].done(err, null);
      else
        this.emit('error', err);
      // Remove the worker from the list and start a new Worker to replace the
      // current one.
      this.workers.splice(this.workers.indexOf(worker), 1);
      this.addNewWorker();
    });
    this.workers.push(worker);
    this.freeWorkers.push(worker);
    this.emit(kWorkerFreedEvent);
  }

  runTask(task, callback) {
    if (this.freeWorkers.length === 0) {
      // No free threads, wait until a worker thread becomes free.
      this.once(kWorkerFreedEvent, () => this.runTask(task, callback));
      return;
    }

    const worker = this.freeWorkers.pop();
    worker[kTaskInfo] = new WorkerPoolTaskInfo(callback);
    worker.postMessage(task);
  }

  close() {
    for (const worker of this.workers) worker.terminate();
  }
}

module.exports = WorkerPool;
~~~

我们给worker创建了一个新的kTaskInfo属性，并且将异步的callback封装到WorkerPoolTaskInfo中，赋值给worker.kTaskInfo.

接下来我们就可以使用workerPool了：

~~~js
const WorkerPool = require('./worker_pool.js');
const os = require('os');

const pool = new WorkerPool(os.cpus().length);

let finished = 0;
for (let i = 0; i < 10; i++) {
  pool.runTask({ a: 42, b: 100 }, (err, result) => {
    console.log(i, err, result);
    if (++finished === 10)
      pool.close();
  });
}
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





