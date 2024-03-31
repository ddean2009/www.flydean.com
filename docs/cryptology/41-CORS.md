安全系列之:跨域资源共享CORS

[toc]

# 简介

什么是跨域资源共享呢? 我们知道一个域是由scheme、domain和port三部分来组成的，这三个部分可以唯一标记一个域，或者一个服务器请求的地址。跨域资源共享的意思就是服务器允许其他的域来访问它自己域的资源。

CORS是一个基于HTTP-header检测的机制，本文将会详细对其进行说明。

# CORS举例

为了安全起见，一般一个域发起的请求只能获取该域自己的资源，因为域资源内部的互相调用被认为是安全的。

但是随着现代浏览器技术和ajax技术的发展，渐渐的出现了从javascript中去请求其他域资源的需求，我们把这样的需求叫做跨域请求。

比如说客户端从域http://www.flydean.com向域http://www.abc.com/data.json请求数据。

那么客户端是怎么知道服务器是否支持CORS的呢？

这里会使用到一个叫做preflight的请求，这个请求只是向服务器确认是否支持要访问资源的跨域请求，当客户端得到响应之后，才会真正的去请求服务器中的跨域资源。

虽然是客户端去设置HTTP请求的header来进行CORS请求，但是服务端也需要进行一些设置来保证能够响应客户端的请求。所以本文同时适合前端开发者和后端开发者。

# CORS protocol 

没错，任意一种请求要想标准化，那么必须制定标准的协议，CORS也一样，CORS protocol主要定义了HTTP中的请求头和响应头。我们分别来详细了解。

## HTTP request headers

首先是HTTP的请求头。请求头是客户端请求资源时所带的数据。CORS请求头主要包含三部分。

第一部分是Origin，表示发起跨域资源请求的request或者preflight request源：

```
Origin: <origin>
```
Origin只包含server name信息，并不包含任何PATH信息。

> 注意，Origin的值可能为null

第二部分是Access-Control-Request-Method，这是一个preflight request，告诉服务器下一次真正会使用的HTTP资源请求方法：

```
Access-Control-Request-Method: <method>
```

第三部分是Access-Control-Request-Headers，同样也是一个preflight request，告诉服务器下一次真正使用的HTTP请求中要带的header数据。header中的数据是和server端的Access-Control-Allow-Headers相对应的。

```
Access-Control-Request-Headers: <field-name>[, <field-name>]*
```

## HTTP response headers

有了客户端的请求，还需要服务器端的响应，我们看下服务器端都需要设置那些HTTP header数据。

1. Access-Control-Allow-Origin

Access-Control-Allow-Origin表示服务器允许的CORS的域，可以指定特定的域，也可以使用*表示接收所有的域。

```
Access-Control-Allow-Origin: <origin> | *
```

> 要注意的是，如果请求带有认证信息，则不能使用*。

我们看一个例子：

```
Access-Control-Allow-Origin: http://www.flydean.com
Vary: Origin
```

上面例子表示服务器允许接收来自http://www.flydean.com的请求，这里指定了具体的某一个域，而不是使用*。因为服务器端可以设置一个允许的域列表，所以这里返回的只是其中的一个域地址，所以还需要在下面加上一个Vary:Origin头信息，表示Access-Control-Allow-Origin会随客户端请求头中的Origin信息自动发送变化。

2. Access-Control-Expose-Headers

Access-Control-Expose-Headers表示服务器端允许客户端获取CORS资源的同时能够访问到的header信息。其格式如下：

```
Access-Control-Expose-Headers: <header-name>[, <header-name>]*
```

例如：

```
Access-Control-Expose-Headers: Custom-Header1, Custom-Header2
```

上面的例子将向客户端暴露Custom-Header1, Custom-Header2两个header，客户端可以获取到这两个header的值。

3. Access-Control-Max-Age

Access-Control-Max-Age表示preflight request的请求结果将会被缓存多久，其格式如下：

```
Access-Control-Max-Age: <delta-seconds>
```

delta-seconds是以秒为单位。

4. Access-Control-Allow-Credentials

这个字段用来表示服务器端是否接受客户端带有credentials字段的请求。如果用在preflight请求中，则表示后续的真实请求是否支持credentials，其格式如下：

```
Access-Control-Allow-Credentials: true
```

5. Access-Control-Allow-Methods

这个字段表示访问资源允许的方法，主要用在preflight request中。其格式如下：

```
Access-Control-Allow-Methods: <method>[, <method>]*
```

6. Access-Control-Allow-Headers

用在preflight request中，表示真正能够被用来做请求的header字段，其格式如下：

```
Access-Control-Allow-Headers: <header-name>[, <header-name>]*
```

有了CORS协议的基本概念之后，我们就可以开始使用CORS来构建跨域资源访问了。

# 基本CORS

先来看一个最基本的CORS请求，比如现在我们的网站是http://www.flydean.com,在该网站中的某个页面中，我们希望获取到https://google.com/data/dataA,那么我们可以编写的JS代码如下：

```
const xhr = new XMLHttpRequest();
const url = 'https://google.com/data/dataA';

xhr.open('GET', url);
xhr.onreadystatechange = someHandler;
xhr.send();

```

该请求是一个最基本的CORS请求，我们看下客户端发送的请求包含哪些数据：

```
GET /data/dataA HTTP/1.1
Host: google.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: http://www.flydean.com
```

这个请求跟CORS有关的就是Origin，表示请求的源域是http://www.flydean.com。

可能的返回结果如下:

```
HTTP/1.1 200 OK
Date: Mon, 01 May 2021 00:23:53 GMT
Server: Apache/2
Access-Control-Allow-Origin: *
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Transfer-Encoding: chunked
Content-Type: application/xml

[…Data…]
```
上面的返回结果要注意的是Access-Control-Allow-Origin: *，表示服务器允许所有的Origin请求。

# Preflighted requests

上面的例子是一个最基本的请求，客户端直接向服务器端请求资源。接下来我们看一个Preflighted requests的例子，Preflighted requests的请求分两部分，第一部分是请求判断，第二部分才是真正的请求。

> 注意，GET请求是不会发送preflighted的。

什么时候会发送Preflighted requests呢？

当客户端发送OPTIONS方法给服务器的时候，为了安全起见，因为服务器并不一定能够接受这些OPTIONS的方法，所以客户端需要首先发送一个
preflighted requests，等待服务器响应，等服务器确认之后，再发送真实的请求。我们举一个例子。

```
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://google.com/data/dataA');flydean
xhr.setRequestHeader('cust-head', 'www.flydean.com');
xhr.setRequestHeader('Content-Type', 'application/xml');
xhr.onreadystatechange = handler;
xhr.send('<site>www.flydean.com</site>');

```

上例中，我们向服务器端发送了一个POST请求，在这个请求中我们添加了一个自定义的header：cust-head。因为这个header并不是HTTP1.1中标准的header，所以需要发送一个Preflighted requests先。

```
OPTIONS /data/dataA HTTP/1.1
Host: google.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Origin: http://www.flydean.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: cust-head, Content-Type
```

请求中添加了Access-Control-Request-Method和Access-Control-Request-Headers这两个多出来的字段。

得到的服务器响应如下：

```
HTTP/1.1 204 No Content
Date: Mon, 01 May 2021 01:15:39 GMT
Server: Apache/2
Access-Control-Allow-Origin: http://www.flydean.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: cust-head, Content-Type
Access-Control-Max-Age: 86400
Vary: Accept-Encoding, Origin
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
```

响应中返回了Access-Control-Allow-Origin，Access-Control-Allow-Methods和Access-Control-Allow-Headers。

当客户端收到服务器的响应之后，发现配后续的请求，就可以继续发送真实的请求了：

```
POST /data/dataA HTTP/1.1
Host: google.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
cust-head: www.flydean.com
Content-Type: text/xml; charset=UTF-8
Referer: http://www.flydean.com/index.html
Content-Length: 55
Origin: http://www.flydean.com
Pragma: no-cache
Cache-Control: no-cache

<site>www.flydean.com</site>
```

在真实的请求中，我们不需要再发送Access-Control-Request*头标记了，只需要发送真实的请求数据即可。

最后，我们得到server端的响应：

```
HTTP/1.1 200 OK
Date: Mon, 01 May 2021 01:15:40 GMT
Server: Apache/2
Access-Control-Allow-Origin: http://www.flydean.com
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 235
Keep-Alive: timeout=2, max=99
Connection: Keep-Alive
Content-Type: text/plain

[Some data]
```

# 带认证的请求

有时候，我们需要访问的资源需要带认证信息，这些认证信息是通过HTTP cookies来进行传输的，但是对于浏览器来说，默认情况下是不会进行认证的。要想进行认证，必须设置特定的标记：

```
const invocation = new XMLHttpRequest();
const url = 'https://google.com/data/dataA';

function corscall() {
  if (invocation) {
    invocation.open('GET', url, true);
    invocation.withCredentials = true;
    invocation.onreadystatechange = handler;
    invocation.send();
  }
}

```

上面的例子中，我们设置了withCredentials flag，表示这是一个带认证的请求。

其对应的请求如下：

```
GET data/dataA HTTP/1.1
Host: google.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Connection: keep-alive
Referer: http://www.flydean.com/index.html
Origin: http://www.flydean.com
Cookie: name=flydean
```

请求中我们带上了Cookie，服务器对应的响应如下：

```
HTTP/1.1 200 OK
Date: Mon, 01 May 2021 01:34:52 GMT
Server: Apache/2
Access-Control-Allow-Origin: http://www.flydean.com
Access-Control-Allow-Credentials: true
Cache-Control: no-cache
Pragma: no-cache
Set-Cookie: name=flydean; expires=Wed, 31-May-2021 01:34:53 GMT
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 106
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain

[text/plain payload]
```

服务器返回了Access-Control-Allow-Credentials: true，表示服务器接收credentials认证，并且返回了Set-Cookie选项对客户端的cookie进行更新。

要注意的是如果服务器支持credentials，那么返回的Access-Control-Allow-Origin，Access-Control-Allow-Headers和Access-Control-Allow-Methods的值都不能是*。

# 总结

本文简单介绍了HTTP协议中的CORS协议，要注意的是CORS实际上是HTTP请求头和响应头之间的交互。













