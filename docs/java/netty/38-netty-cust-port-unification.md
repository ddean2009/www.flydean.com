---
slug: /38-netty-cust-port-unification
---

# 62. netty系列之:使用同一端口运行不同协议



# 简介

在之前的文章中，我们介绍了在同一个netty程序中支持多个不同的服务，它的逻辑很简单，就是在一个主程序中启动多个子程序，每个子程序通过一个BootStrap来绑定不同的端口，从而达到访问不同端口就访问了不同服务的目的。

但是多个端口虽然区分度够高，但是使用起来还是有诸多不便，那么有没有可能只用一个端口来统一不同的协议服务呢？

今天给大家介绍一下在netty中使用同一端口运行不同协议的方法,这种方法叫做port unification。

# SocksPortUnificationServerHandler

在讲解自定义port unification之前，我们来看下netty自带的port unification，比如SocksPortUnificationServerHandler。

我们知道SOCKS的主要协议有3中，分别是SOCKS4、SOCKS4a和SOCKS5，他们属于同一种协议的不同版本，所以肯定不能使用不同的端口，需要在同一个端口中进行版本的判断。

具体而言，SocksPortUnificationServerHandler继承自ByteToMessageDecoder，表示是将ByteBuf转换成为对应的Socks对象。

那他是怎么区分不同版本的呢？

在decode方法中，传入了要解码的ByteBuf in，首先获得它的readerIndex：

```
int readerIndex = in.readerIndex();
```

我们知道SOCKS协议的第一个字节表示的是版本，所以从in ByteBuf中读取第一个字节作为版本号：

```
byte versionVal = in.getByte(readerIndex);
```

有了版本号就可以通过不同的版本号进行处理，具体而言，对于SOCKS4a，需要添加Socks4ServerEncoder和Socks4ServerDecoder：

```
case SOCKS4a:
            logKnownVersion(ctx, version);
            p.addAfter(ctx.name(), null, Socks4ServerEncoder.INSTANCE);
            p.addAfter(ctx.name(), null, new Socks4ServerDecoder());
            break;
```

对于SOCKS5来说，需要添加Socks5ServerEncoder和Socks5InitialRequestDecoder两个编码和解码器：

```
case SOCKS5:
            logKnownVersion(ctx, version);
            p.addAfter(ctx.name(), null, socks5encoder);
            p.addAfter(ctx.name(), null, new Socks5InitialRequestDecoder());
            break;
```

这样，一个port unification就完成了，其思路就是通过传入的同一个端口的ByteBuf的首字节，来判断对应的SOCKS的版本号，从而针对不同的SOCKS版本进行处理。

# 自定义PortUnificationServerHandler

在本例中，我们将会创建一个自定义的Port Unification，用来同时接收HTTP请求和gzip请求。

在这之前，我们先看一下两个协议的magic word，也就是说我们拿到一个ByteBuf，怎么能够知道这个是一个HTTP协议，还是传输的一个gzip文件呢？

先看下HTTP协议，这里我们默认是HTTP1.1,对于HTTP1.1的请求协议，下面是一个例子：

```
GET / HTTP/1.1
Host: www.flydean.com
```

HTTP请求的第一个单词就是HTTP请求的方法名，具体而言有八种方法，分别是：

OPTIONS 
返回服务器针对特定资源所支持的HTTP请求方法。也可以利用向Web服务器发送'*'的请求来测试服务器的功能性。 
HEAD 
向服务器索要与GET请求相一致的响应，只不过响应体将不会被返回。这一方法可以在不必传输整个响应内容的情况下，就可以获取包含在响应消息头中的元信息。 
GET 
向特定的资源发出请求。注意：GET方法不应当被用于产生“副作用”的操作中，例如在Web Application中。其中一个原因是GET可能会被网络蜘蛛等随意访问。 
POST 
向指定资源提交数据进行处理请求（例如提交表单或者上传文件）。数据被包含在请求体中。POST请求可能会导致新的资源的建立和/或已有资源的修改。 
PUT 
向指定资源位置上传其最新内容。 
DELETE 
请求服务器删除Request-URI所标识的资源。 
TRACE 
回显服务器收到的请求，主要用于测试或诊断。 
CONNECT 
HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器。 

那么需要几个字节来区分这八个方法呢？可以看到一个字节是不够的，因为我们有POST和PUT，他们的第一个字节都是P。所以应该使用2个字节来作为magic word。

对于gzip协议来说，它也有特殊的格式，其中gzip的前10个字节是header，其中第一个字节是0x1f，第二个字节是0x8b。

这样我们用两个字节也能区分gzip协议。

这样，我们的handler逻辑就出来了。首先从byteBuf中取出前两个字节，然后对其进行判断，区分出是HTTP请求还是gzip请求：

```
    private boolean isGzip(int magic1, int magic2) {
        return magic1 == 31 && magic2 == 139;
    }

    private static boolean isHttp(int magic1, int magic2) {
        return
                magic1 == 'G' && magic2 == 'E' || // GET
                        magic1 == 'P' && magic2 == 'O' || // POST
                        magic1 == 'P' && magic2 == 'U' || // PUT
                        magic1 == 'H' && magic2 == 'E' || // HEAD
                        magic1 == 'O' && magic2 == 'P' || // OPTIONS
                        magic1 == 'P' && magic2 == 'A' || // PATCH
                        magic1 == 'D' && magic2 == 'E' || // DELETE
                        magic1 == 'T' && magic2 == 'R' || // TRACE
                        magic1 == 'C' && magic2 == 'O';   // CONNECT
    }
```

对应的，我们还需要对其添加相应的编码和解码器，对于gzip来说，netty提供了ZlibCodecFactory：

```
p.addLast("gzipEncoder", ZlibCodecFactory.newZlibEncoder(ZlibWrapper.GZIP));
p.addLast("gzipDecoder", ZlibCodecFactory.newZlibDecoder(ZlibWrapper.GZIP));
```

对于HTTP来说，netty也提供了HttpRequestDecoder和HttpResponseEncoder还有HttpContentCompressor来对HTTP消息进行编码解码和压缩。

```
p.addLast("decoder", new HttpRequestDecoder());
p.addLast("encoder", new HttpResponseEncoder());
p.addLast("compressor", new HttpContentCompressor());
```

# 总结

添加了编码和解码器之后，如果你想自定义一些操作，只需要再添加自定义的对应的消息handler即可，非常的方便。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)
