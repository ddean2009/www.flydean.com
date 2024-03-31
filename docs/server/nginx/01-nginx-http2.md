轻松让你的nginx服务器支持HTTP2协议

[toc]

# 简介

nginx是一个高效的web服务器，因为其独特的响应处理机制和低内存消耗，深得大家的喜爱，并且nginx可和多种协议配合使用，而HTTP2协议又是一个非常优秀的协议，如果将两者结合起来会产生意想不到的效果，今天我们将会讲解如何在nginx中配置HTTP2协议。

# HTTP1.1和HTTP2

HTTP的全称是Hypertext Transfer Protocol，是在1989年World Wide Web发展起来之后出现的标准协议，用来在WWW上传输数据。HTTP/1.1是1997年在原始的HTTP协议基础上进行的补充和优化。

到了2015年，为了适应快速发送的web应用和现代浏览器的需求，发展出了新的HTTP/2协议，主要在手机浏览器、延时处理、图像处理和视频处理方面进行了优化。

相对于HTTP1.1来说，HTTP2有如下几个优点：

1. 使用多路复用技术，在同一个连接中可以并行处理多个请求。
2. 可以压缩HTTP头，减少请求的大小。
3. 数据传输格式是以二进制进行的，所以传输更加有效。
4. 服务器可以向客户端推送数据，从而让应用程序可以处理更加复杂的功能。

> 尽管HTTP2并不要求使用加密，但是对于现代浏览器来说如Google Chrome 和 Mozilla Firefox默认HTTP2和HTTPS是一起使用的，所以如果你想配置HTTP2的话，还是需要同时配置SSL。

# 安装最新的nginx

在写本文的时候，nginx最新的版本是1.21.1。我们可以从nginx官网上下载对应的编译好的文件，直接解压即可运行。或者可以下载它的源文件，手动进行编译安装。

如果你是在mac环境，可以直接使用brew命令来进行安装：

```
brew install nginx
```
安装完毕之后会告诉我们一些有用的信息：

```
Docroot is: /usr/local/var/www

The default port has been set in /usr/local/etc/nginx/nginx.conf to 8080 so that
nginx can run without sudo.

nginx will load all files in /usr/local/etc/nginx/servers/.

To have launchd start nginx now and restart at login:
  brew services start nginx
Or, if you don't want/need a background service you can just run:
  nginx
```

这里就不一一详细讲解了，感兴趣的朋友可以自行探索。

# 开启HTTP2支持

从上面可以知道，nginx默认的配置文件是/usr/local/etc/nginx/nginx.conf，打开该文件可以看到最后一行：

```
include servers/*;
```

所以我们可以在servers中新建一个www.flydean.com.conf的文件作为今天要开启HTTP2支持的域名。

默认情况下，nginx监听的端口是80，如下所示：

```
listen 80 default_server;
listen [::]:80 default_server;
```

为什么会有两个listen呢？第一个listen指的是所有的IPv4连接，第二个listen指的是IPv6连接。

因为HTTP2需要开启SSL支持，所以我们这里将其修改为443，并且加上http2支持如下所示：

```
        listen       443 ssl http2;
        server_name  www.flydean.com;
```

上面的配置中我们还指定了server_name，这就是要访问的域名地址，这里我们使用www.flydean.com。

# 添加SSL支持

要想添加SSL支持就需要添加证书，一种方式是购买或者在网上有一些免费的SSL证书可用，如果只是在测试环境中的话，还可以生成自签名证书。

这里我们介绍一下如何生的自签名证书。这里我们使用openssl命令来完成这个工作。

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout selfsigned.key -out selfsigned.crt
Generating a RSA private key
```

执行完成上面的命令，会要求你输入一些证书的信息如下：

```
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:SH
Locality Name (eg, city) []:SH
Organization Name (eg, company) [Internet Widgits Pty Ltd]:flydean
Organizational Unit Name (eg, section) []:flydean
Common Name (e.g. server FQDN or YOUR name) []:127.0.0.1
Email Address []:flydean@163.com
```

然后就生成了两个文件：selfsigned.crt和selfsigned.key。

这里稍微讲解一下自签名证书生成的命令。

openssl是一个非常强大的密钥生成工具，可以完成绝大多数的密钥生成工作。

req表示的是这是一个X.509 certificate signing request (CSR)。

-x509表示我们希望生成的是一个自签名的证书。

-nodes表示我们不需要对生成的密钥进行密码加密。

-days 365表示证书的有效期。

-newkey rsa:2048表示使用RSA算法同时生成证书和key，key的长度是2048。

-keyout:指定key的生成路径。

-out:指定证书的生成路径。

这里即使是使用了SSL，为了保证安全，我们还可以使用一项叫做完美的向前保密的技术，这里需要生成Diffie-Hellman group：

```
openssl dhparam -out dhparam.pem 2048
```

这个命令会需要一些时间，生成之后，我们就可以开始nginx的SSL配置了。

```
        ssl_certificate      ssl/selfsigned.crt;
        ssl_certificate_key  ssl/selfsigned.key;
```

# 修改加密算法

我们知道已经存在很多加密算法，随着密码学技术的发展，很多算法已经被证明是不安全的。所以这里我们需要对默认的加密算法进行修改。

默认的算法是：

```
        ssl_ciphers  HIGH:!aNULL:!MD5;
```

我们将其修改为：

```
ssl_ciphers EECDH+CHACHA20:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
```

# Diffie–Hellman对消息进行加密

虽然我们使用private key配置了客户端和服务器端的加密连接，在建立连接之后，在ServerKeyExchange这一步，双方还会询问对信息的加密方式来用来构建加密通道。

ServerKeyExchange的内容可能包含两种形式：

* 如果选择的是RSA协议，那么传递的就是RSA构建公钥密码的参数（E，N）。我们回想一下RSA中构建公钥的公式：$密文=明文^E\ mod\ N$， 只要知道了E和N，那么就知道了RSA的公钥，这里传递的就是E，N两个数字。

* 如果选择的是Diff-Hellman密钥交换协议，那么传递的就是密钥交换的参数.

这里我们选择使用Diffie–Hellman，还记得上一小节，我们创建的Diffie–Hellman文件吗？这里直接使用即可。

默认情况下Nginx使用的是1028-bit DHE (Ephemeral Diffie-Hellman) key,这个比较容易被破解，所以需要使用我们自己生成的文件。

```
       ssl_dhparam  ssl/dhparam.pem;
```

# 重定向所有的HTTP请求到HTTPS

默认情况下我们访问网站都是HTTP的，所以需要将HTTP请求重定向到HTTPS：

```
server {
       listen         80;
       listen    [::]:80;
       server_name    www.flydean.com;
       return         301 https://$server_name$request_uri;
}
```

# 启动nginx并测试

好了，到此为止所有的nginx配置都完成了，我们使用下面的命令测试nginx文件和启动：

```
nginx -t
nginx: the configuration file /usr/local/etc/nginx/nginx.conf syntax is ok
nginx: configuration file /usr/local/etc/nginx/nginx.conf test is successful

nginx
```

要访问网站，还需要配置一下host将 www.flydean.com 指到你的nginx server上。

然后就可以访问www.flydean.com了。

这里可能会出现一个问题，如果你是自签名的证书，在chrome默认的安全环境中会认为这个证书是无效的，还需要将该证书加入证书的信任链中。

怎么看出这个网站到底使用的那种协议呢？

打开浏览器的调试开关，到网络的tab，点击访问的页面，可以看到下面的内容：

![](https://img-blog.csdnimg.cn/659f38b67beb4038b83cc83cebb3749d.png)

可以看到版本是HTTP/2并且响应头带有X-Firefox-Spdy h2。

# 总结

好了，你已经可以配置一个完美的HTTPS并且支持HTTP2协议的网站了。恭喜！







