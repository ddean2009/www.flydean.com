使用nodejs和express搭建http web服务

# 简介

nodejs作为一个优秀的异步IO框架，其本身就是用来作为http web服务器使用的，nodejs中的http模块，提供了很多非常有用的http相关的功能。

虽然nodejs已经带有http的处理模块，但是对于现代web应用程序来说，这或许还不太够，于是我们有了express框架，来对nodejs的内容进行扩展。

今天我们将会介绍一下使用nodejs和express来开发web应用程序的区别。

# 使用nodejs搭建HTTP web服务

nodejs提供了http模块，我们可以很方便的使用http模块来创建一个web服务：

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

上面创建的http服务监听在3000端口。我们通过使用createServer方法来创建这个http服务。

该方法接受一个callback函数，函数的两个参数分别是 req (http.IncomingMessage 对象）和一个res（http.ServerResponse 对像)。

在上面的例子中，我们在response中设置了header和body值，并且以一个end方法来结束response。

## 请求nodejs服务

我们创建好http web服务之后，一般情况下是从web浏览器端进行访问和调用。但是我们有时候也需要从nodejs后端服务中调用第三方应用的http接口，下面的例子将会展示如何使用nodejs来调用http服务。

先看一个最简单的get请求：

~~~js
const http = require('http')
const options = {
  hostname: 'www.flydean.com',
  port: 80,
  path: '/',
  method: 'GET'
}

const req = http.request(options, res => {
  console.log(`status code: ${res.statusCode}`)

  res.on('data', d => {
    console.log(d);
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()
~~~

上面代码我们使用了http.request来创建一个request，并且传入了我们自带的options参数。

我们通过res的回调事件来进行相应的处理。

再看一个简单的post请求：

~~~js
const http = require('http')

const data = JSON.stringify({
  name: 'flydean'
})

const options = {
  hostname: 'www.flydean.com',
  port: 80,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = http.request(options, res => {
  console.log(`status code: ${res.statusCode}`)

  res.on('data', d => {
    console.log(d);
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data)
req.end()
~~~

post和get相似，不同的是options中的method不一样，同时put可以有多种请求类型，所以我们需要在headers中指定。

同样的，PUT 和 DELETE 也可以使用同样的方式来调用。

## 第三方lib请求post

直接使用nodejs底层的http.request有点复杂，我们需要自己构建options，如果使用第三方库，比如axios可以让post请求变得更加简单：

~~~js
const axios = require('axios')

axios
  .post('http://www.flydean.com', {
    name: 'flydean'
  })
  .then(res => {
    console.log(`status code: ${res.statusCode}`)
    console.log(res)
  })
  .catch(error => {
    console.error(error)
  })
~~~

上面的例子中，我们直接使用axios的post请求，并将请求结果封存成了promise，然后通过then和catch来进行相应数据的处理。非常的方便。

## 获取http请求的正文

在上面的例子中，我们通过监听req的data事件来输出http请求的正文：

~~~js
  res.on('data', d => {
    console.log(d);
  })
})
~~~

这样做其实是有问题的，并不一定能够获得完整的http请求的正文。

因为res的on data事件是在服务器获得http请求头的时候触发的，这个时候请求的正文可能还没有传输完成，换句话说，请求回调中的request是一个流对象。

我们需要这样处理：

~~~js
const server = http.createServer((req, res) => {
  let data = []
  req.on('data', chunk => {
    data.push(chunk)
  })
  req.on('end', () => {
    console.log(JSON.parse(data));
  })
})
~~~

当每次触发data事件的时候，我们将接受到的值push到一个数组里面，等所有的值都接收完毕，触发end事件的时候，再统一进行输出。

这样处理显然有点麻烦。

我们介绍一个在express框架中的简单方法，使用 body-parser 模块：

~~~js
const bodyParser = require('body-parser')

app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(bodyParser.json())

app.post('/', (req, res) => {
  console.log(req.body)
})
~~~

上面的例子中，body-parser对req进行了封装，我们只用关注与最后的结果即可。

# Express和使用express搭建http web服务

express是什么呢？

express是基于 Node.js 平台，快速、开放、极简的 web 开发框架。它提供一系列强大的特性，帮助你创建各种 Web 和移动设备应用。

丰富的 HTTP 快捷方法和任意排列组合的 Connect 中间件，让你创建健壮、友好的 API 变得既快速又简单。

Express 不对 Node.js 已有的特性进行二次抽象，我们只是在它之上扩展了 Web 应用所需的基本功能。

## express helloworld

我们看一下怎么使用Express来搭建一个helloworld：

~~~js
var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

~~~

简单的使用app.listen即可搭建好一个http web服务。

## express路由

有了web服务，我们需要对不同的请求路径和请求方式进行不同的处理，这时候就需要使用到了express路由功能：

~~~js
// 对网站首页的访问返回 "Hello World!" 字样
app.get('/', function (req, res) {
  res.send('Hello World!');});
// 网站首页接受 POST 请求
app.post('/', function (req, res) {
  res.send('Got a POST request');});
// /user 节点接受 PUT 请求
app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user');});
// /user 节点接受 DELETE 请求
app.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user');});
~~~

更高级一点的，我们还可以在请求路径中做路由匹配：

~~~js
// 匹配 acd 和 abcd
app.get('/ab?cd', function(req, res) {
  res.send('ab?cd');});
// 匹配 abcd、abbcd、abbbcd等
app.get('/ab+cd', function(req, res) {
  res.send('ab+cd');
});
// 匹配 abcd、abxcd、abRABDOMcd、ab123cd等
app.get('/ab*cd', function(req, res) {
  res.send('ab*cd');
});
// 匹配 /abe 和 /abcde
app.get('/ab(cd)?e', function(req, res) {
 res.send('ab(cd)?e');});

// 匹配任何路径中含有 a 的路径：
app.get(/a/, function(req, res) {
  res.send('/a/');
});

// 匹配 butterfly、dragonfly，不匹配 butterflyman、dragonfly man等
app.get(/.*fly$/, function(req, res) {
  res.send('/.*fly$/');
});

~~~

## Express 路由句柄中间件

有时候，一个请求可能有多个处理器，express提供了路由句柄（中间件）的功能，我们可自由组合处理程序。

> 注意，在路由句柄中，我们需要调用next方法，来触发下一个路由方法。

~~~js
var cb0 = function (req, res, next) {
  console.log('CB0');
  next();}
var cb1 = function (req, res, next) {
  console.log('CB1');
  next();}
app.get('/example/d', [cb0, cb1], function (req, res, next) {
  console.log('response will be sent by the next function ...');
  next();
}, function (req, res) {
  res.send('Hello from D!');
});
~~~

上面的请求会经过cb0，cb1和自定义的两个function，最终结束。

## Express 响应方法

express提供了很多响应方法API，可以方便我们的代码编写：

方法|描述
-|-
res.download()|提示下载文件。
res.end()|终结响应处理流程。
res.json()|发送一个 JSON 格式的响应。
res.jsonp()|发送一个支持 JSONP 的 JSON 格式的响应。
res.redirect()|重定向请求。
res.render()|渲染视图模板。
res.send()|发送各种类型的响应。
res.sendFile|以八位字节流的形式发送文件。
res.sendStatus()|设置响应状态代码，并将其以字符串形式作为响应体的一部分发送。

## Express 的静态资源

通常来说，静态资源是不需要服务端进行处理的，在express中，可以使用express.static来指定静态资源的路径：

~~~js
app.use(express.static('public'));
现在，public 目录下面的文件就可以访问了。
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/hello.html
//多个静态资源目录
app.use(express.static('public'));
app.use(express.static('files'));
//静态前缀
app.use('/static', express.static('public'));
http://localhost:3000/static/images/kitten.jpg
http://localhost:3000/static/css/style.css
~~~

## Express 使用模板引擎

web应用当然需要html文件，express中可以使用多种模板语言，让编写html页面更加容易。如果想要使用模板引擎。我们可以使用下面的步骤：

1. views, 放模板文件的目录，比如： app.set('views', './views')
2. view engine, 模板引擎，比如： app.set('view engine', 'jade')

3. 在 views 目录下生成名为 index.jade 的 Jade 模板文件，内容如下：

~~~html
html
  head
    title!= title
  body
    h1!= message
~~~

4. 在nodejs服务端配置route规则

~~~js
//配置route 规则
app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});
~~~

# 总结

nodejs和express是非常方便的http web服务框架，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





