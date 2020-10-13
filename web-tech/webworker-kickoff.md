web worker的介绍和使用

# 简介

什么是web worker呢？从名字上就可以看出，web worker就是在web应用程序中使用的worker。这个worker是独立于web主线程的，在后台运行的线程。

web worker的优点就是可以将工作交给独立的其他线程去做，这样就不会阻塞主线程。

# Web Workers的基本概念和使用

web workers是通过使用Worker(）来创建的。

Worker可以指定后台执行的脚本，并在脚本执行完毕之后通常creator。

worker有一个构造函数如下：

~~~js
Worker("path/to/worker/script") 
~~~

我们传入要执行脚本的路径，即可创建worker。

Workers中也可以创建新的Workers,前提是这些worker都是同一个origin。

我们看一下worker的定义：

~~~js
interface Worker extends EventTarget, AbstractWorker {
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
    onmessageerror: ((this: Worker, ev: MessageEvent) => any) | null;

    postMessage(message: any, transfer: Transferable[]): void;
    postMessage(message: any, options?: PostMessageOptions): void;

    terminate(): void;
    addEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof WorkerEventMap>(type: K, listener: (this: Worker, ev: WorkerEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var Worker: {
    prototype: Worker;
    new(stringUrl: string | URL, options?: WorkerOptions): Worker;
};
~~~

可以看到Worker的构造函数可以传入两个参数，第一个参数可以是string也可以是URL，表示要执行的脚本路径。

第二个参数是WorkerOptions选项，表示worker的类型，名字和权限相关的选项。

~~~js
interface WorkerOptions {
    credentials?: RequestCredentials;
    name?: string;
    type?: WorkerType;
}
~~~

除此之外，worker可以监听onmessage和onmessageerror两个事件。

提供了两个方法：postMessage和terminate。

worker和主线程都可以通过postMessage来给对方发送消息，也可以用onmessage来接收对方发送的消息。

还可以添加和移除EventListener。

我们看一个使用worker的例子：

~~~js
const first = document.querySelector('#number1');
const second = document.querySelector('#number2');

const result = document.querySelector('.result');

if (window.Worker) {
	const myWorker = new Worker("worker.js");

	first.onchange = function() {
	  myWorker.postMessage([first.value, second.value]);
	  console.log('Message posted to worker');
	}

	second.onchange = function() {
	  myWorker.postMessage([first.value, second.value]);
	  console.log('Message posted to worker');
	}

	myWorker.onmessage = function(e) {
		result.textContent = e.data;
		console.log('Message received from worker');
	}
} else {
	console.log('Your browser doesn\'t support web workers.')
}
~~~

上面的例子创建了一个woker，并向worker post了一个消息。

再看一下worker.js的内容是怎么样的：

~~~js
onmessage = function(e) {
  console.log('Worker: Message received from main script');
  const result = e.data[0] * e.data[1];
  if (isNaN(result)) {
    postMessage('Please write two numbers');
  } else {
    const workerResult = 'Result: ' + result;
    console.log('Worker: Posting message back to main script');
    postMessage(workerResult);
  }
}
~~~

我们在主线程中向worker postmessage，在worker中通过onmessage监听消息，然后又在worker中post message，可以在main线程中通过onmessage来监听woker发送的消息。

这样就做到了一次完美的交互。

再看一下worker的兼容性：

![](https://img-blog.csdnimg.cn/20201006122512486.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到，基本上所有的浏览器都支持worker，不过有些浏览器只支持部分的方法。

如果想要立马结束一个worker，我们可以使用terminate：

~~~js
myWorker.terminate();
~~~

要想处理worker的异常，可以使用onerror来处理异常。

如果worker的script比较复杂，需要用到其他的script文件，我们可以使用importScripts来导入其他的脚本：

~~~js
importScripts();                         /* imports nothing */
importScripts('foo.js');                 /* imports just "foo.js" */
importScripts('foo.js', 'bar.js');       /* imports two scripts */
importScripts('//example.com/hello.js'); /* You can import scripts from other origins */
~~~

# Web Workers的分类

Web Workers根据工作环境的不同，可以分为DedicatedWorker和SharedWorker两种。

DedicatedWorker的Worker只能从创建该Woker的脚本中访问，而SharedWorker则可以被多个脚本所访问。

上面的例子中我们创建的worker就是DedicatedWorker。

怎么创建sharedWorker呢?

~~~js
var myWorker = new SharedWorker('worker.js');
~~~

SharedWorker有一个单独的SharedWorker类，和dedicated worker不同的是SharedWorker是通过port对象来进行交互的。

我们看一个shared worker的例子：

~~~js
var first = document.querySelector('#number1');
var second = document.querySelector('#number2');

var result1 = document.querySelector('.result1');

if (!!window.SharedWorker) {
  var myWorker = new SharedWorker("worker.js");

  first.onchange = function() {
    myWorker.port.postMessage([first.value, second.value]);
    console.log('Message posted to worker');
  }

  second.onchange = function() {
    myWorker.port.postMessage([first.value, second.value]);
    console.log('Message posted to worker');
  }

  myWorker.port.onmessage = function(e) {
    result1.textContent = e.data;
    console.log('Message received from worker');
    console.log(e.lastEventId);
  }
}
~~~

所有的postMessage和onmessage都是基于myWorker.port来的。

再看一下worker的代码：

~~~js
onconnect = function(e) {
  var port = e.ports[0];

  port.onmessage = function(e) {
    var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    port.postMessage(workerResult);
  }

}
~~~

worker也是通过port来进行通信。

这里我们使用了onconnect用来监听父线程的onmessage事件或者start事件，这两种事件都可以启动一个SharedWorker。

再看一下sharedWorker的浏览器兼容性：

![](https://img-blog.csdnimg.cn/20201006234340881.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到，比worker的兼容性要低很多，只有部分浏览器才支持这个高级特性。

# worker和main thread之间的数据传输

我们知道worker和main thread之间是通过postMessage和onMessage进行交互的。这里面涉及到了数据传输的问题。

实际上数据在worker和main thread之间是以拷贝的方式并且是以序列化的形式进行传输的。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！






