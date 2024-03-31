---
slug: /nodejs-http-in-depth
---

# 11. 深入理解nodejs的HTTP处理流程

# 简介

我们已经知道如何使用nodejs搭建一个HTTP服务，今天我们会详细的介绍nodejs中的HTTP处理流程，从而对nodejs的HTTP进行深入的理解。

# 使用nodejs创建HTTP服务

使用nodejs创建HTTP服务很简单，nodejs提供了专门的HTTP模块，我们可以使用其中的createServer方法来轻松创建HTTP服务：

~~~js
const http = require('http');

const server = http.createServer((request, response) => {
  // magic happens here!
});
~~~

首先createServer方法传入的是一个callback函数，这个callback函数将会在每次服务端接收到客户端的请求时调用。所以这个callback函数，也叫做 request handler.

再看看createServer的返回值，createServer返回的是一个EventEmitter对象。

之前我们也介绍过了EventEmitter，它可以发送和接收事件，所以我们可以使用on来监听客户端的事件。

上面的代码相当于：

~~~js
const server = http.createServer();
server.on('request', (request, response) => {
  // the same kind of magic happens here!
});
~~~

当发送request事件的时候，就会触发后面的handler method，并传入request和response参数。我们可以在这个handler中编写业务逻辑。

当然，为了让http server正常运行，我们还需要加上listen方法，来绑定ip和端口，以最终启动服务。

~~~js
const hostname = '127.0.0.1'
const port = 3000

server.listen(port, hostname, () => {
  console.log(`please visit http://${hostname}:${port}/`)
})
~~~

# 解构request

上面的request参数实际上是一个http.IncomingMessage对象，我们看下这个对象的定义：

~~~js
    class IncomingMessage extends stream.Readable {
        constructor(socket: Socket);

        aborted: boolean;
        httpVersion: string;
        httpVersionMajor: number;
        httpVersionMinor: number;
        complete: boolean;
        /**
         * @deprecate Use `socket` instead.
         */
        connection: Socket;
        socket: Socket;
        headers: IncomingHttpHeaders;
        rawHeaders: string[];
        trailers: NodeJS.Dict<string>;
        rawTrailers: string[];
        setTimeout(msecs: number, callback?: () => void): this;
        /**
         * Only valid for request obtained from http.Server.
         */
        method?: string;
        /**
         * Only valid for request obtained from http.Server.
         */
        url?: string;
        /**
         * Only valid for response obtained from http.ClientRequest.
         */
        statusCode?: number;
        /**
         * Only valid for response obtained from http.ClientRequest.
         */
        statusMessage?: string;
        destroy(error?: Error): void;
    }
~~~

通常我们需要用到request中的method，url和headers属性。

怎么从request中拿到这些属性呢？对的，我们可以使用ES6中解构赋值：

~~~js
const { method, url } = request;

const { headers } = request;
const userAgent = headers['user-agent'];
~~~

其中request的headers是一个IncomingHttpHeaders，它继承自NodeJS.Dict。

# 处理Request Body

从源码可以看出request是一个Stream对象，对于stream对象来说，我们如果想要获取其请求body的话，就不像获取静态的method和url那么简单了。

我们通过监听Request的data和end事件来处理body。

~~~js
let body = [];
request.on('data', (chunk) => {
  body.push(chunk);
}).on('end', () => {
  body = Buffer.concat(body).toString();
  // at this point, `body` has the entire request body stored in it as a string
});
~~~

因为每次data事件，接收到的chunk实际上是一个Buffer对象。我们将这些buffer对象保存起来，最后使用Buffer.concat来对其进行合并，最终得到最后的结果。

> 直接使用nodejs来处理body看起来有点复杂，幸运的是大部分的nodejs web框架，比如koa和express都简化了body的处理。

# 处理异常

异常处理是通过监听request的error事件来实现的。

如果你在程序中并没有捕获error的处理事件，那么error将会抛出并终止你的nodejs程序，所以我们一定要捕获这个error事件。

~~~js
request.on('error', (err) => {
  // This prints the error message and stack trace to `stderr`.
  console.error(err.stack);
});
~~~

# 解构response

response是一个http.ServerResponse类：

~~~js
    class ServerResponse extends OutgoingMessage {
        statusCode: number;
        statusMessage: string;

        constructor(req: IncomingMessage);

        assignSocket(socket: Socket): void;
        detachSocket(socket: Socket): void;
        // https://github.com/nodejs/node/blob/master/test/parallel/test-http-write-callbacks.js#L53
        // no args in writeContinue callback
        writeContinue(callback?: () => void): void;
        writeHead(statusCode: number, reasonPhrase?: string, headers?: OutgoingHttpHeaders): this;
        writeHead(statusCode: number, headers?: OutgoingHttpHeaders): this;
        writeProcessing(): void;
    }
~~~

对于response来说，我们主要关注的是statusCode：

~~~js
response.statusCode = 404; 
~~~

Response Headers：

response提供了setHeader方法来设置相应的header值。

~~~js
response.setHeader('Content-Type', 'application/json');
response.setHeader('X-Powered-By', 'bacon');
~~~

还有一个更加直接的同时写入head和status code：

~~~js
response.writeHead(200, {
  'Content-Type': 'application/json',
  'X-Powered-By': 'bacon'
});
~~~

最后，我们需要写入response body，因为response是一个WritableStream，所以我们可以多次写入，最后以end方法结束：

~~~js
response.write('<html>');
response.write('<body>');
response.write('<h1>Hello, World!</h1>');
response.write('</body>');
response.write('</html>');
response.end();
~~~

或者我们可以用一个end来替换：

~~~js
response.end('<html><body><h1>Hello, World!</h1></body></html>');
~~~

综上，我们的代码是这样的：

~~~js
const http = require('http');

http.createServer((request, response) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    // BEGINNING OF NEW STUFF

    response.on('error', (err) => {
      console.error(err);
    });

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    // Note: the 2 lines above could be replaced with this next one:
    // response.writeHead(200, {'Content-Type': 'application/json'})

    const responseBody = { headers, method, url, body };

    response.write(JSON.stringify(responseBody));
    response.end();
    // Note: the 2 lines above could be replaced with this next one:
    // response.end(JSON.stringify(responseBody))

    // END OF NEW STUFF
  });
}).listen(8080);
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！









