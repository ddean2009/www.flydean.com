---
slug: /nodejs-kickoff
---

# 1. javascript开发后端程序的神器nodejs

# 简介

javascript虽然一直都可以做服务端编程语言，但是它更多的是以客户端编程语言来展示在世人面前的。也许javascript自己都忘记了还可以做服务器端编程，直到2009年nodejs的横空出世。

# nodejs的历史

javascript作为一门解释性语言，是不需要像C或者C++那样进行编译的。但是在早期的时候,javascript引擎的执行效率是比较低的，所以导致javascript只能做做dom操作。

随着ajax的兴起和现代web2.0的技术的发展，主流浏览器开发商尽可能的提升javascript的执行效率，最后Chrome V8出现了，Chrome V8是 Chromium 项目开源的 JavaScript 引擎，使得javascript的执行效率得到了极大的提升。

nodejs借着V8浴火重生了。

nodejs从一诞生就获得了极大的关注。比较javascript的开发者还是非常非常多的。而且一门语言可以通用前后端是多么的有吸引力。

nodejs从2009年发展到2020年的nodejs 14,经历了11年的历史，和它的先辈javascript相比还是很年轻，但是因为其开放性和包容性，nodejs在以一个非常快的速度向前发展。

# nodejs简介

nodejs借助于V8引擎和一组异步的 I/O 原生功能，极大的提升了nodejs的处理效率。

异步IO我们大家应该都很清楚，和同步IO相比，线程不用阻塞，可以去处理其他更有意义的事情。只是在响应返回的时候恢复操作，所以不会浪费CPU时间。

我们简单看一下nodejs的IO模型：

![](https://img-blog.csdnimg.cn/20200922234113468.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

一个好的语言需要有良好的生态系统相配合，因为语言本身只能提供最基本的一些操作，我们还需要第三方系统来丰富这个语言的生态。

而nodejs的npm仓库，托管着全球最大的开源库生态系统。

基本上使用nodejs你可以实现绝大多数需要的功能。

nodejs的另外一个特点就是简单，考虑一下我们最常用的web应用，如果用java来写，非常麻烦，你还需要一个web服务器。

在nodejs中，一切都是那么的简单：

~~~js
const http = require('http')

const hostname = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('welcome to www.flydean.com\n')
})

server.listen(port, hostname, () => {
  console.log(`please visit http://${hostname}:${port}/`)
})
~~~

上面的代码就创建了一个web服务，监听在3000端口，

我们首先引入了http模块，用来进行http处理。

接着使用http 的 createServer() 方法会创建新的 HTTP 服务器并返回它。

在createServer方法内部，我们可以设定要返回的对象。

最后启用server.listen功能，来监听特定的端口和服务器，当服务就绪之后，会调用后面的回调函数，执行特定的命令。

每当接收到新的请求的时候，就会触发request事件，request事件可以传递两个参数：

* request 是一个http.IncomingMessage对象，提供了请求的详细信息。
* response 是一个http.ServerResponse对象，用于返回数据给调用方。

在上面的例子中，我们并没有使用request,而是使用response直接构建了返回的对象。

我们设置了statusCode和header，最后使用end来关闭响应。

这就是一个简单使用的nodejs程序。

# nodejs的运行环境

nodejs作为js的一种，是一种解释性语言，一般解释性语言都有两种运行方式。

一种是直接运行，一种是开启一个解释性的环境，在其中运行，nodejs也不例外。

直接运行很简单，我们写好nodejs的程序之后，比如app.js,直接这样运行：

~~~js
node app.js
~~~

如果直接执行node命令，就会开启REPL模式：

~~~js
node
Welcome to Node.js v12.13.1.
Type ".help" for more information.
>
~~~

REPL 也被称为运行评估打印循环，是一种编程语言环境（主要是控制台窗口），它使用单个表达式作为用户输入，并在执行后将结果返回到控制台。

REPL有什么作用呢？

第一，我们可以直接在REPL中运行某些测试方法，已验证输出结果。

比如这样：

~~~js
> console.log('www.flydean.com');
www.flydean.com
~~~

除此之外REPL还有一些更加有用的功能，我们知道JS中一切皆对象，比如上面我们提到的http对象，如果我们想知道http对象的大概结构怎么办呢？

直接在REPL环境中输入http即可：

~~~js
> http
{
  _connectionListener: [Function: connectionListener],
  METHODS: [
    'ACL',         'BIND',       'CHECKOUT',
    'CONNECT',     'COPY',       'DELETE',
    'GET',         'HEAD',       'LINK',
    'LOCK',        'M-SEARCH',   'MERGE',
    'MKACTIVITY',  'MKCALENDAR', 'MKCOL',
    'MOVE',        'NOTIFY',     'OPTIONS',
    'PATCH',       'POST',       'PROPFIND',
    'PROPPATCH',   'PURGE',      'PUT',
    'REBIND',      'REPORT',     'SEARCH',
    'SOURCE',      'SUBSCRIBE',  'TRACE',
    'UNBIND',      'UNLINK',     'UNLOCK',
    'UNSUBSCRIBE'
  ],
  STATUS_CODES: {
    '100': 'Continue',
    '101': 'Switching Protocols',
    '102': 'Processing',
    '103': 'Early Hints',
    '200': 'OK',
    '201': 'Created',
    '202': 'Accepted',
    '203': 'Non-Authoritative Information',
    '204': 'No Content',
    '205': 'Reset Content',
    '206': 'Partial Content',
    '207': 'Multi-Status',
    '208': 'Already Reported',
    '226': 'IM Used',
    '300': 'Multiple Choices',
    '301': 'Moved Permanently',
    '302': 'Found',
    '303': 'See Other',
    '304': 'Not Modified',
    '305': 'Use Proxy',
    '307': 'Temporary Redirect',
    '308': 'Permanent Redirect',
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '402': 'Payment Required',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '406': 'Not Acceptable',
    '407': 'Proxy Authentication Required',
    '408': 'Request Timeout',
    '409': 'Conflict',
    '410': 'Gone',
    '411': 'Length Required',
    '412': 'Precondition Failed',
    '413': 'Payload Too Large',
    '414': 'URI Too Long',
    '415': 'Unsupported Media Type',
    '416': 'Range Not Satisfiable',
    '417': 'Expectation Failed',
    '418': "I'm a Teapot",
    '421': 'Misdirected Request',
    '422': 'Unprocessable Entity',
    '423': 'Locked',
    '424': 'Failed Dependency',
    '425': 'Unordered Collection',
    '426': 'Upgrade Required',
    '428': 'Precondition Required',
    '429': 'Too Many Requests',
    '431': 'Request Header Fields Too Large',
    '451': 'Unavailable For Legal Reasons',
    '500': 'Internal Server Error',
    '501': 'Not Implemented',
    '502': 'Bad Gateway',
    '503': 'Service Unavailable',
    '504': 'Gateway Timeout',
    '505': 'HTTP Version Not Supported',
    '506': 'Variant Also Negotiates',
    '507': 'Insufficient Storage',
    '508': 'Loop Detected',
    '509': 'Bandwidth Limit Exceeded',
    '510': 'Not Extended',
    '511': 'Network Authentication Required'
  },
  Agent: [Function: Agent] { defaultMaxSockets: Infinity },
  ClientRequest: [Function: ClientRequest],
  IncomingMessage: [Function: IncomingMessage],
  OutgoingMessage: [Function: OutgoingMessage],
  Server: [Function: Server],
  ServerResponse: [Function: ServerResponse],
  createServer: [Function: createServer],
  get: [Function: get],
  request: [Function: request],
  maxHeaderSize: [Getter],
  globalAgent: [Getter/Setter]
}
~~~

直接输出了http对象的简洁结构，我们还可以使用tab按钮来自动补全http的方法：

~~~js
> http.
http.__defineGetter__      http.__defineSetter__      http.__lookupGetter__      http.__lookupSetter__      http.__proto__             http.constructor
http.hasOwnProperty        http.isPrototypeOf         http.propertyIsEnumerable  http.toLocaleString        http.toString              http.valueOf

http.Agent                 http.ClientRequest         http.IncomingMessage       http.METHODS               http.OutgoingMessage       http.STATUS_CODES
http.Server                http.ServerResponse        http._connectionListener   http.createServer          http.get                   http.globalAgent
http.maxHeaderSize         http.request
~~~

PREL还支持一些特定的点操作：

~~~js
> .help
.break    Sometimes you get stuck, this gets you out
.clear    Alias for .break
.editor   Enter editor mode
.exit     Exit the repl
.help     Print this help message
.load     Load JS from a file into the REPL session
.save     Save all evaluated commands in this REPL session to a file
~~~

> PERL还有一个特殊变量 _ ,如果在某些代码之后输入 _，则会打印最后一次操作的结果。

# process

process 对象是一个全局变量，提供了有关当前 Node.js 进程的信息并对其进行控制。 作为全局变量，它始终可供 Node.js 应用程序使用，无需使用 require()。 它也可以使用 require() 显式地访问。

因为process代表的是nodejs的进程信息，所以可以处理进程终止，读取环境变量，接收命令行参数等作用。

## 终止进程

先看一下怎么使用process来终止进程：

~~~js
process.exit(0)
~~~

0表示正常退出，当然，我们可以传入不同的退出码，表示不同的含义。

正常情况下，如果没有异步操作正在等待，那么 Node.js 会以状态码 0 退出，其他情况下，会用如下的状态码:

1 未捕获异常 - 一个未被捕获的异常, 并且没被 domain 或 'uncaughtException' 事件处理器处理。

2 - 未被使用 (Bash 为防内部滥用而保留)

3 内部的 JavaScript 解析错误 - Node.js 内部的 JavaScript 源代码在引导进程中导致了一个语法解析错误。一般只会在开发 Node.js 本身的时候出现。

4 内部的 JavaScript 执行失败 - 引导进程执行 Node.js 内部的 JavaScript 源代码时，返回函数值失败。一般只会在开发 Node.js 本身的时候出现。

5 致命错误 - 在 V8 中有一个致命的错误。 比较典型的是以 FATALERROR 为前缀从 stderr 打印出来的消息。

6 非函数的内部异常处理 - 发生了一个内部异常，但是内部异常处理函数被设置成了一个非函数，或者不能被调用。

7 内部异常处理运行时失败 - 有一个不能被捕获的异常，在试图处理这个异常时，处理函数本身抛出了一个错误。比如, 如果一个 'uncaughtException' 或者 domain.on('error') 处理函数抛出了一个错误。

8 - 未被使用，在之前版本的 Node.js, 退出码 8 有时候表示一个未被捕获的异常。

9 - 不可用参数 - 某个未知选项没有确定，或者没给必需要的选项填值。

10 内部的 JavaScript 运行时失败 - 调用引导函数时，引导进程执行 Node.js 内部的 JavaScript 源代码抛出错误。 一般只会在开发 Node.js 本身的时候出现。

12 不可用的调试参数 

13 未完成的Top-Level Await: await传入的Promise一直没有调用resolve方法

128 退出信号 - 如果 Node.js 接收到致命信号, 诸如 SIGKILL 或 SIGHUP，那么它的退出代码将是 128 加上信号的码值。 例如，信号 SIGABRT 的值为 6，因此预期的退出代码将为 128 + 6 或 134。

我们可以通过process的on方法，来监听信号事件：

~~~js
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('进程已终止')
  })
})
~~~

>  什么是信号？信号是一个 POSIX 内部通信系统：发送通知给进程，以告知其发生的事件。

或者我们可以从程序内部发送这个信号：

~~~js
process.kill(process.pid, 'SIGTERM')
~~~

## env

因为process进程是和外部环境打交道的，process提供了env属性，该属性承载了在启动进程时设置的所有环境变量。

默认情况下，env中的NODE_ENV被设置为development。

~~~js
process.env.NODE_ENV // "development"
~~~

我们可以通过修改这个环境变量，来切换nodejs的不同运行环境。

## argv

process提供了argv来接收外部参数。

比如：

~~~js
node app.js joe
~~~

argv是一个包含所有命令行调用参数的数组。

上面的例子中，第一个参数是 node 命令的完整路径。第二个参数是正被执行的文件的完整路径。所有其他的参数从第三个位置开始。

要想获取joe，我们可以这样做：

~~~js
const args = process.argv.slice(2)
args[0]
~~~

如果是key=value的情况，我们可以这样传参数，并且使用minimist 库来处理参数：

~~~js
node app.js --name=joe

const args = require('minimist')(process.argv.slice(2))
args['name'] //joe
~~~

## CLI交互

从 nodejs7开始，nodejs提供了readline模块，可以从process.stdin获取输入：

~~~js
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question(`how are you?`, answer => {
  console.log(`${answer}!`)
  readline.close()
})
~~~

如果需要更加复杂的操作，则可以使用Inquirer.js：

~~~js
const inquirer = require('inquirer')

var questions = [
  {
    type: 'input',
    name: 'hello',
    message: "how are you?"
  }
]

inquirer.prompt(questions).then(answers => {
  console.log(`${answers['hello']}!`)
})
~~~

# exports模块

nodejs拥有内置的模块系统，当我们需要使用其他lib提供的功能时候，我们可以使用require来引入其他lib公开的模块。

但是前提是该lib需要公开，也就是exports对应的模块出来。

nodejs的对象导出有两种方式module.exports和将对象添加为 exports 的属性。

先看第一种方式，square 模块定义在 square.js 中：

~~~js
module.exports = class Square {
  constructor(width) {
    this.width = width;
  }

  area() {
    return this.width ** 2;
  }
};
~~~

下面的例子中， bar.js 使用了导出 Square 类的 square 模块：

~~~js
const Square = require('./square.js');
const mySquare = new Square(2);
console.log(`mySquare 的面积是 ${mySquare.area()}`);
~~~

再看第二种方式，定义一个circle.js：

~~~js
const { PI } = Math;

exports.area = (r) => PI * r ** 2;

exports.circumference = (r) => 2 * PI * r;
~~~

使用：

~~~js
const circle = require('./circle.js');
console.log(`半径为 4 的圆的面积是 ${circle.area(4)}`);
~~~

两者都可以导出特定的模块，但是module.exports只会导出特定的对象，而exports是将对象添加为exports的属性，我们还需要根据属性名称来查找对象的属性。

# nodejs API

除了我们上面提到的http，process, nodejs还提供了很多其他非常有用的API ：

![](https://img-blog.csdnimg.cn/20200923142037166.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

# nodejs的框架

除了基本的nodejs之外，nodejs还有非常多优秀的框架，借助这些框架我们可以是nodejs程序的搭建更加容易和强大。

像AdonisJs，express，koa，Socket.io等等。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！






















