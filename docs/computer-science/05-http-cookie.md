HTTP系列之:HTTP中的cookies

[toc]

# 简介

如果小伙伴最近有访问国外的一些标准网站的话，可能经常会弹出一个对话框，说是本网站为了更好的体验和跟踪，需要访问你的cookies，问你同意不同意，对于这种比较文明的做法，我一般是点同意的。

但是转头一想，为什么访问国内的网站从来没有弹出过这个提示呢？这是一个值得深思的问题，或许当你看完这篇文章之后，就有了答案。

# cookies的作用

那么cookies有什么作用呢？HTTP cookies就是服务器端发送给浏览器端的一小部分数据，浏览器接收到这个数据之后，可以存起来自己用，也可以在后续发送到server端进行一些数据的校验。

通过在cookies中存储一些有用的数据，可以将无状态的HTTP协议变成有状态的session连接，或者用来保存登录的权限，下次不用密码即可登陆，非常有用。

一般来说，cookies用在三个方面：

1. session的管理，用来保存登录状态，从而让HTTP请求可以带上状态信息。
2. 用户自定义的设置，这些用户特殊的字段，需要保存在cookies中。
3. 跟踪用户的行为信息。

在很久很久以前，还没有现代浏览器的时候，客户端的唯一存储就是cookies，所以cookies也作为客户端存储来使用的，但是有了现代的浏览器之后，一般是建议把客户端存储的数据放到其他存储方式中。

为什么呢？

因为每次请求cookies中的数据会自动带上，并且发送到server端，所以如果cookies中存储了太多的数据，就会导致服务器性能的下降。

# 创建cookies

因为cookies是客户端的本地存储，所以如果服务器端想要设置客户端的cookies时，通过在响应头中设置Set-Cookie，浏览器接收到这个响应头之后，就会将对应的cookies内容存储到浏览器本地。

然后在后续的服务器请求中都会带上Cookie header。同时cookie还可以带上过期时间、发送限制等属性。

先来看下Set-Cookie的格式：

```
Set-Cookie: <cookie-name>=<cookie-value>
```

举个例子，下面是一个server端的响应：

```
HTTP/2.0 200 OK
Content-Type: text/html
Set-Cookie: name=flydean
Set-Cookie: site=www.flydean.com

```

当浏览器接收到这个响应之后，就会在本地的cookies中设置对应的值，并且在后续的请求中将这些值以cookies的header形式带上：

```
GET /test.html HTTP/2.0
Host: www.flydean.com
Cookie: name=flydean; site=www.flydean.com
```

在netty中提供了一个Cookie的类，专门用来表示cookies，这个类中提供了cookies的基本属性，然后通过使用：

```
response.headers().add(HttpHeaderNames.SET_COOKIE, ServerCookieEncoder.STRICT.encode(cookie));

```

来对响应头进行设置。

# cookies的生存时间

HTTP的cookies有两种，一种是session cookies，这种cookies会在session结束之后自行删除。

还有一种cookies通过指定Expires或者 Max-Age 来设置过期时间：

```
Set-Cookie: id=abcdef; Expires=Thu, 31 May 2021 08:00:00 GMT;
```

其中Expires是HTTP1.0中定义的header，Max-Age是HTTP1.1中定义的header。

# cookies的权限控制

HTTP提供了两个属性来对cookies的权限进行控制，分别是Secure和HttpOnly。

如果cookies中带有Secure属性，那么cookies只会在使用HTTPS协议的时候发送给服务器。如果使用的是HTTP协议，则不会发送cookies信息。

并且，如果是在http的情况下，server端是不允许给cookie设置Secure属性的。

但是设置了Secure属性并不意味着cookies就是安全的，因为可以从其他的手段拿到浏览器端的cookies。

还有一个属性是HttpOnly，如果cookies设置了HttpOnly，那么cookies是不允许被JavaScript访问的，通过设置HttpOnly，我们可以提升客户端数据的安全性：

```
Set-Cookie: id=abcdef; Expires=Thu, 21 May 2021 08:00:00 GMT; Secure; HttpOnly
```

cookies还可以添加Domain和Path属性，用于标记cookies可以发送到的URL。

其中Domain表示域名，而Path表示路径。

如果Domain没有设置，则默认是设置cookies的host，这个host是不包含子domain的。如果手动指定了Domain，那么子domain是会包含在内的。

比如如果我们设置了Domain=flydean.com，那么子domain：doc.flydean.com也会共享这个cookies。

Path用来匹配URL的路径，只有匹配到的URL才可以发送cookies。

另外HTTP还提供了一个SameSite属性，表示如果是在CORS环境情况下，是否发送cookies到第三方网站，这样可以在一定程度上保护网站的信息。

SameSite有三个可能的值，分别是Strict, Lax, 和 None。如果在Strict情况下，那么cookie仅发送到与创建它的站点相同的站点。Lax跟Strict类似，不同之处在于当用户导航到cookie的原始站点时发送cookie，比如通过访问外部站点的链接。 None可以在原始网站和跨站资源访问中使用，但是必须要在安全的环境中进行（设置Secure属性）。如果没有设置SameSite，那么表现是和Lax一致的。

例如：

```
Set-Cookie: name=flydean; SameSite=Strict
```

# 第三方cookies

我们知道cookies是和domain相关的，如果cookies的domain是和当前访问的页面相同的话，这个cookies就叫做 first-party cookies。如果和当前的访问页面不同，比如访问第三方的图片、脚本、css等，第三方的服务器有可能会发送他们自己的cookies，这种cookies叫做第三方cookies，第三方cookies主要被用来广告或者跟踪用户的行为信息。

对于有些浏览器来说，可能会禁用第三方的cookies，这有可能会导致访问网站的一些功能问题，大家可以主要观察一下。

# 总结

使用cookies可以辅助我们做很多事情，但是也要注意cookies的安全性。



