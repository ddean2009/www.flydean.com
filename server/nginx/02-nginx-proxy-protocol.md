在nginx中使用proxy protocol

[toc]

# 简介

我们已经介绍了haproxy提出的proxy protocol协议，通过proxy protocol协议，服务器端可以获得客户端的真实IP地址和端口，从而可以进行一些非常有意义的操作。

为什么获得客户端的真实IP地址会非常有意义呢？

考虑一个藏在proxy背后的数据库，如果有多个客户端通过proxy进行数据库的连接，事实上因为都是通过代理进行连接，所以数据库中的所有的操作都是proxy服务器的IP地址，这在对数据库的性能监控和优化是不利的，因为我们不知道真实异常的服务器IP地址。

这种情况下就需要用到proxy protocol协议,让数据库可以反映出真实客户端的IP地址，从而便于数据库的监控和问题定位。

事实上，数据库只是一个特定的例子，我们在很多其他的情况下也可能需要知道客户端真实IP的情况。

以现在最流行的http服务器和代理服务器nginx为例，我们来看一下如何在nginx中配置proxy protocol。

# proxy protocol在nginx中应用

我们知道nginx是一个web服务器和代理服务器，它一般工作在proxy server或者负载均衡软件（Haproxy,Amazon Elastic Load Balancer (ELB)的后面。

客户端首先请求proxy server或者LSB负载均衡软件，然后再到nginx进行真实的web访问。

因为经过了多层软件，所以客户端的一些信息比如ip地址，端口号等可能就会被隐藏，这对于我们问题分析，数据统计都是不利的。因为对于nginx来说，我们希望能够获得真实的客户端IP地址，这样才能获取真实的请求环境。

这种情况下就需要用到PROXY protocol了。

如果前面所说的proxy或者LSB都实现了PROXY protocol协议的话，不管是HTTP, SSL, HTTP/2, SPDY, WebSocket 还是 TCP协议，nginx都可以拿到客户端的原始IP地址，从而根据原始IP地址进行一些特殊的操作，比如屏蔽恶意IP的访问，根据IP不同展示不同的语言或者页面，或者更加简单的日志记录和统计等，都非常有效。

当然，如果想要支持PROXY protocol，对nginx的版本也是有要求的，具体版本需求如下：

* 想要支持PROXY protocol v2，需要NGINX Plus R16或者NGINX Open Source 1.13.11。
* 想要支持ROXY protocol for HTTP,需要NGINX Plus R3或者NGINX Open Source  1.5.12。
* 想要支持TCP client‑side PROXY protocol，需要NGINX Plus R7或者 NGINX Open Source 1.9.3。
* 想要支持PROXY protocol for TCP，需要NGINX Plus R11 或者 NGINX Open Source 1.11.4。
  
在nginx中可以通过下面的变量来获得对应的客户端信息，具体而言如下所示：

`$proxy_protocol_addr`和`$proxy_protocol_port ` 分别表示的是原始客户端的IP地址和端口号。

 `$remote_addr` 和 `$remote_port`表示的是load balancer的的IP地址和端口。

 如果你使用了RealIP扩展模块，那么这个模块会重写`$remote_addr` 和 `$remote_port`这两个值，将其替换成原始客户端的IP地址和端口号。

然后使用`$realip_remote_addr` 和 `$realip_remote_port`来表示load balancer的的IP地址和端口。

在RealIP扩展模块中，`$proxy_protocol_addr`和`$proxy_protocol_port` 表示的含义不变，还是原始客户端的IP地址和端口号。

# 在nginx中配置使用proxy protocol

上面我们提到了nginx中proxy protocol的基本应用，下面来讲一下如何在nginx中进行具体的配置。

## 在nginx中启用proxy protocol

如果你的nginx已经是支持proxy protocol的版本，那么启用proxy protocol非常简单，只需要在server中的listen中添加proxy_protocol即可，如下所示：

```
http {
    #...
    server {
        listen 80   proxy_protocol;
        listen 443  ssl proxy_protocol;
        #...
    }
}
   
stream {
    #...
    server {
        listen 112233 proxy_protocol;
        #...
    }
}
```

可能大家比较熟悉的是http block，这表示的是nginx对http/https的支持。stream模块可能大家比较陌生，这是nginx提供的对tcp/udp协议的支持。

通过上面的配置，nginx可以实现在tcp/udp协议和http/https协议同时支持proxy protocol。

## 使用Real‑IP modules

Real‑IP modules是nginx自带的一个模块，可以通过下面的命令来查看nginx是否有安装real-ip模块：

```
nginx -V 2>&1 | grep -- 'http_realip_module'
nginx -V 2>&1 | grep -- 'stream_realip_module'
```

如果你当前使用的版本没有real ip,也不要急，这时候你可能需要从源代码进行编译。

在编译的过程中，我们需要执行一个configure命令，在这个configure命令中可以指定要开启的功能，比如stream或者http_ssl_module：

```
$ ./configure
--sbin-path=/usr/local/nginx/nginx
--conf-path=/usr/local/nginx/nginx.conf
--pid-path=/usr/local/nginx/nginx.pid
--with-pcre=../pcre-8.44
--with-zlib=../zlib-1.2.11
--with-http_ssl_module
--with-stream
--with-mail
```

如果要开启real-ip功能，则可以添加：

```
--with-http_realip_module
```

如果nginx是运行在SLB或者proxy之后的，那么可以通过set_real_ip_from命令来指定代理或者负载均衡服务器的IP范围，如下所示：

```
server {
    #...
    set_real_ip_from 192.168.1.0/24;
   #...
}
```

然后我们需要将proxy或者SLB的IP地址替换成为真实客户端的地址，那么可以这样使用：

```
http {
    server {
        #...
        real_ip_header proxy_protocol;
      }
}
```

## 请求转发

不管是http还是stream block，都可能遇到请求向后续的upstream进行转发的情况，对于upstream来说，他们希望收到的是真实客户端IP地址，而不是proxy或者slb的地址，那么可以通过下面的设置来解决：

```
http {
    proxy_set_header X-Real-IP       $proxy_protocol_addr;
    proxy_set_header X-Forwarded-For $proxy_protocol_addr;
}
```

```
stream {
    server {
        listen 12345;
        proxy_pass example.com:12345;
        proxy_protocol on;
    }
}
```

http和stream的设置方式是不同的。

## 日志记录

日志是一个非常重要的功能，对于定位问题，执行数据统计分析都非常有用，当然我们需要的是真实的客户端IP地址。

我们可以通过使用变量$proxy_protocol_addr在http和stream block中记录对应的日志，如下所示：

```
http {
    #...
    log_format combined '$proxy_protocol_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        '"$http_referer" "$http_user_agent"';
}
```

```
stream {
    #...
    log_format basic '$proxy_protocol_addr - $remote_user [$time_local] '
                      '$protocol $status $bytes_sent $bytes_received '
                      '$session_time';
}
```

# 总结

通过上面的设置，nginx已经可以使用proxoy protocol了，这会让我们的后续分析工作变得更加轻松。


