---
slug: /koa-startup
---

第四代Express框架koa简介

# 简介

熟悉Spring MVC的朋友应该都清楚Spring MVC是基于servlet的代码框架，这是最传统的web框架。然后在Spring5中引入了Spring WebFlux，这是基于reactive-netty的异步IO框架。

同样的，nodejs在最初的Express 3基础上发展起来了异步的koa框架。koa使用了promises和aysnc来避免JS中的回调地狱，并且简化了错误处理。

今天我们要来介绍一下这个优秀的nodejs框架koa。

# koa和express

koa不再使用nodejs的req和res，而是封装了自己的ctx.request和ctx.response。

express可以看做是nodejs的一个应用框架，而koa则可以看成是nodejs 的http模块的抽象。

和express提供了Middleware，Routing，Templating，Sending Files和JSONP等特性不同的是，koa的功能很单一，如果你想使用其他的一些功能比如routing，sending files等功能，可以使用koa的第三方中间件。

koa并不是来替换express的，就像spring webFlux并不是用来替换spring MVC的。koa只是用Promises改写了控制流，并且避免了回调地狱，并提供了更好的异常处理机制。

# koa使用介绍

koa需要node v7.6.0+版本来支持ES2015和async function。

我们看一个最最简单的koa应用：

~~~js
const Koa = require('koa');
const app = module.exports = new Koa();

app.use(async function(ctx) {
  ctx.body = 'Hello World';
});

if (!module.parent) app.listen(3000);
~~~

koa应用程序就是一个包含了很多个中间件的对象，这些中间件将会按照类似stack的执行顺序一个相应request。

## 中间件的级联关系

koa.use中传入的是一个function，我们也可以称之为中间件。

koa可以use很多个中间件，举个例子：

~~~js
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  await next();
  console.log('log3');
});

app.use(async (ctx, next) => {
  await next();
  console.log('log2');
});

app.use(async ctx => {
  console.log('log3');
});

app.listen(3000);
~~~

上面的例子中，我们调用了多次next,只要我们调用next，调用链就会传递到下一个中间件进行处理，一直到某个中间件不再调用next
为止。

上面的代码运行输出：

~~~js
log1
log2
log3
~~~

## koa的构造函数

我们看下koa的构造函数：

~~~js
constructor(options) {
    super();
    options = options || {};
    this.proxy = options.proxy || false;
    this.subdomainOffset = options.subdomainOffset || 2;
    this.proxyIpHeader = options.proxyIpHeader || 'X-Forwarded-For';
    this.maxIpsCount = options.maxIpsCount || 0;
    this.env = options.env || process.env.NODE_ENV || 'development';
    if (options.keys) this.keys = options.keys;
    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    // util.inspect.custom support for node 6+
    /* istanbul ignore else */
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }
~~~

可以看到koa接收下面几个参数：

* app.env 默认值是NODE_ENV或者development
* app.keys 为cookie签名的keys

看下怎么使用：

~~~js
app.keys = ['secret1', 'secret2'];
app.keys = new KeyGrip(['secret1', 'secret2'], 'sha256');

ctx.cookies.set('name', 'jack', { signed: true });
~~~

* app.proxy 是否支持代理
* app.subdomainOffset 表示子域名是从第几级开始的，这个参数决定了request.subdomains的返回结果，默认值为2
* app.proxyIpHeader proxy ip header默认值是X-Forwarded-For
* app.maxIpsCount 从proxy ip header读取的最大ip个数，默认值是0表示无限制。

我们可以这样用：

~~~js
const Koa = require('koa');
const app = new Koa({ proxy: true });
~~~

或者这样用：

~~~js
const Koa = require('koa');
const app = new Koa();
app.proxy = true;
~~~

## 启动http server

koa是一种web框架，web框架就需要开启http服务，要启动http服务，需要调用nodejs中的Server#listen()方法。

在koa中，我们可以很方便的使用koa#listen方法来启动这个http server:

~~~js
const Koa = require('koa');
const app = new Koa();
app.listen(3000);
~~~

上面的代码相当于：

~~~js
const http = require('http');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
~~~

当然你可以同时创建http和https的服务：

~~~js
const http = require('http');
const https = require('https');
const Koa = require('koa');
const app = new Koa();
http.createServer(app.callback()).listen(3000);
https.createServer(app.callback()).listen(3001);
~~~

## 自定义中间件

koa中的中间件是参数值为(ctx, next)的function。在这些方法中，需要手动调用next()以传递到下一个middleware。

下面看一下自定义的中间件：

~~~js
async function responseTime(ctx, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
}

app.use(responseTime);
~~~
* 给中间件起个名字：

虽然中间件function只接收参数(ctx, next)，但是我可以将其用一个wrapper方法包装起来，在wrapper方法中，我们给中间件起个名字 ：

~~~js
function logger(name) {
  return async function logger(ctx, next) {
      console.log(name);
      await next();
  };    
}
~~~

* 自定义中间件的扩展：

上面的wrapper创建方式还有另外一个好处，就是可以在自定义中间件中访问传入的参数，从而可以根据传入的参数，对自定义中间件进行扩展。

~~~js
function logger(format) {
  format = format || ':method ":url"';

  return async function (ctx, next) {
    const str = format
      .replace(':method', ctx.method)
      .replace(':url', ctx.url);

    console.log(str);

    await next();
  };
}

app.use(logger());
app.use(logger(':method :url'));
~~~

* 组合多个中间件：

当有多个中间件的情况下，我们可以使用compose将其合并：

~~~js
const compose = require('koa-compose');
const Koa = require('koa');
const app = module.exports = new Koa();

// x-response-time

async function responseTime(ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', ms + 'ms');
}

// logger

async function logger(ctx, next) {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  if ('test' != process.env.NODE_ENV) {
    console.log('%s %s - %s', ctx.method, ctx.url, ms);
  }
}

// response

async function respond(ctx, next) {
  await next();
  if ('/' != ctx.url) return;
  ctx.body = 'Hello World';
}

// composed middleware

const all = compose([
  responseTime,
  logger,
  respond
]);

app.use(all);

if (!module.parent) app.listen(3000);
~~~

## 异常处理

在koa中怎么进行异常处理呢？

通用的方法就是try catch:

~~~js

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    err.status = err.statusCode || err.status || 500;
    throw err;
  }
});

~~~

当然你也可以自定义默认的error处理器：

~~~js
app.on('error', err => {
  log.error('server error', err)
});
~~~

我们还可以传入上下文信息：

~~~js
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！










