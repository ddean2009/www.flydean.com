---
slug: /37-netty-cust-socks-server
---

# 61. netty系列之:从零到壹,搭建一个SOCKS代理服务器



# 简介

上一篇文章，我们讲到了netty对SOCKS消息提供了SocksMessage对象的封装，并且区分SOCKS4和SOCKS5，同时提供了连接和响应的各种状态。

有了SOCKS消息的封装之后，我们还需要做些什么工作才能搭建一个SOCKS服务器呢？

# 使用SSH搭建SOCKS服务器

其实最简单的办法就是使用SSH工具来建立SOCKS代理服务器。

先看下SSH建立SOCKS服务的命令：

```
ssh -f -C -N -D bindaddress:port name@server
```

-f 表示SSH作为守护进程进入后台执行。

-N 表示不执行远程命令,只用于端口转发。

-D 表示是端口上的动态转发。这个命令支持SOCKS4和SOCKS5。

-C 表示发送前压缩数据。

bindaddress 本地服务器的绑定地址。

port 表示本地服务器的指定侦听端口。

name 表示ssh服务器登录名。

server表示ssh服务器地址。

上面命令的意思是，在本机建立端口绑定，然后将其转发到远程的代理服务器上。

比如我们可以在本机开一个2000的端口，将其转发到远程168.121.100.23这台机子上：

```
ssh -f -N -D 0.0.0.0:2000 root@168.121.100.23
```

有了代理服务器之后，就可以使用了，首先介绍一个怎么在curl命令中使用SOCKS代理。

我们想通过代理服务器，访问www.flydean.com，该怎么做呢？

```
curl -x socks5h://localhost:2000 -v -k -X GET http://www.flydean.com:80
```

要想检测SOCKS的连接，还可以使用netcat命令如下：

```
ncat –proxy 127.0.0.1:2000 –proxy-type socks5 www.flydean.com 80 -nv

```

# 使用netty搭建SOCKS服务器

使用netty搭建SOCKS服务器的关键是使用netty服务器做中继，它需要建立两个连接，一个是客户端到代理服务器的连接，一个是代理服务器到目标地址的连接。接下来，我们一步一步探讨如何在netty中构建SOCKS服务器。

搭建服务器的基本步骤和普通的服务器基本一致，要注意的就是对消息的编码、解码和在消息读取处理过程中的转发。

## encoder和decoder

对于一种协议来说，最终要的就是对应的encoder和decoder，用于协议对象和ByteBuf之间进行转换。

netty提供的SOCKS转换器叫做SocksPortUnificationServerHandler。先看下它的定义：

```
public class SocksPortUnificationServerHandler extends ByteToMessageDecoder
```

它继承自ByteToMessageDecoder表示是ByteBuf和Socks对象之间的转换。

所以我们在ChannelInitializer中只需要加上SocksPortUnificationServerHandler和自定义的处Socks消息的handler即可：

```
    public void initChannel(SocketChannel ch) throws Exception {
        ch.pipeline().addLast(
                new LoggingHandler(LogLevel.DEBUG),
                new SocksPortUnificationServerHandler(),
                SocksServerHandler.INSTANCE);
    }
```

等等，不对呀!有细心的小伙伴可能发现了，SocksPortUnificationServerHandler只是一个decoder，我们还缺少一个encoder，用来将Socks对象转换成本ByteBuf，这个encoder在哪里呢？

别急，我们再回到SocksPortUnificationServerHandler中，在它的decode方法中，有这样一段代码：

```
 case SOCKS4a:
            logKnownVersion(ctx, version);
            p.addAfter(ctx.name(), null, Socks4ServerEncoder.INSTANCE);
            p.addAfter(ctx.name(), null, new Socks4ServerDecoder());
            break;
        case SOCKS5:
            logKnownVersion(ctx, version);
            p.addAfter(ctx.name(), null, socks5encoder);
            p.addAfter(ctx.name(), null, new Socks5InitialRequestDecoder());
            break;
```

原来是在decode方法里面，根据Socks的版本不同，给ctx添加了对应的encoder和decoder，非常的巧妙。

对应的encoder分别是Socks4ServerEncoder和Socks5ServerEncoder。

# 建立连接

对于Socks4来说，只有一个建立连接的请求类型，在netty中用Socks4CommandRequest来表示。

所以我们只需要在channelRead0中判断请求的版本即可：

```
case SOCKS4a:
                Socks4CommandRequest socksV4CmdRequest = (Socks4CommandRequest) socksRequest;
                if (socksV4CmdRequest.type() == Socks4CommandType.CONNECT) {
                    ctx.pipeline().addLast(new SocksServerConnectHandler());
                    ctx.pipeline().remove(this);
                    ctx.fireChannelRead(socksRequest);
                } else {
                    ctx.close();
                }
```

这里我们添加了一个自定义的SocksServerConnectHandler，用来处理Socks连接，这个自定义handler会在后面进行详细讲解，这里大家知道它使用来建立连接即可。

对于Socks5来说，就比较复杂点，包含了初始化请求、认证请求和建立连接三个部分，所以需要分别处理：

```
case SOCKS5:
                if (socksRequest instanceof Socks5InitialRequest) {
                    ctx.pipeline().addFirst(new Socks5CommandRequestDecoder());
                    ctx.write(new DefaultSocks5InitialResponse(Socks5AuthMethod.NO_AUTH));
                } else if (socksRequest instanceof Socks5PasswordAuthRequest) {
                    ctx.pipeline().addFirst(new Socks5CommandRequestDecoder());
                    ctx.write(new DefaultSocks5PasswordAuthResponse(Socks5PasswordAuthStatus.SUCCESS));
                } else if (socksRequest instanceof Socks5CommandRequest) {
                    Socks5CommandRequest socks5CmdRequest = (Socks5CommandRequest) socksRequest;
                    if (socks5CmdRequest.type() == Socks5CommandType.CONNECT) {
                        ctx.pipeline().addLast(new SocksServerConnectHandler());
                        ctx.pipeline().remove(this);
                        ctx.fireChannelRead(socksRequest);
                    } else {
                        ctx.close();
                    }
```

注意，这里我们的认证请求只支持用户名密码认证。

# ConnectHandler

既然是作为一个代理服务器，就需要建立两个连接，一个是客户端到代理服务器的连接，一个是代理服务器到目标服务器的连接。

对于netty来说，这两个连接可以用两个Bootstrap来建立。

其中客户端到代理服务器端的连接我们在启动netty服务器的时候已经建立了，所以需要在ConnectHandler中，建立一个新的代理服务器到目标服务器的连接：

```
private final Bootstrap b = new Bootstrap();

Channel inboundChannel = ctx.channel();
            b.group(inboundChannel.eventLoop())
                    .channel(NioSocketChannel.class)
                    .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000)
                    .option(ChannelOption.SO_KEEPALIVE, true)
                    .handler(new ClientPromiseHandler(promise));

            b.connect(request.dstAddr(), request.dstPort()).addListener(future -> {
                if (future.isSuccess()) {
                    // 成功建立连接
                } else {
                    // 关闭连接
                    ctx.channel().writeAndFlush(
                            new DefaultSocks4CommandResponse(Socks4CommandStatus.REJECTED_OR_FAILED)
                    );
                    closeOnFlush(ctx.channel());
                }
            });
```

新的Bootstrap需要从接收到的Socks消息中取出目标服务器的地址和端口，然后建立连接。

然后判断新建立连接的状态，如果成功则添加一个转发器将outboundChannel的消息转发到inboundChannel中，同时将inboundChannel的消息转发到outboundChannel中，从而达到服务器代理的目的。

```
 final Channel outboundChannel = future.getNow();
                        if (future.isSuccess()) {
                            ChannelFuture responseFuture = ctx.channel().writeAndFlush(
                                    new DefaultSocks4CommandResponse(Socks4CommandStatus.SUCCESS));
                            //成功建立连接，删除SocksServerConnectHandler，添加RelayHandler
                            responseFuture.addListener(channelFuture -> {
                                ctx.pipeline().remove(SocksServerConnectHandler.this);
                                outboundChannel.pipeline().addLast(new RelayHandler(ctx.channel()));
                                ctx.pipeline().addLast(new RelayHandler(outboundChannel));
                            });
                        } else {
                            ctx.channel().writeAndFlush(
                                    new DefaultSocks4CommandResponse(Socks4CommandStatus.REJECTED_OR_FAILED));
                            closeOnFlush(ctx.channel());
                        }
```

# 总结

说白了，代理服务器就是建立两个连接，将其中一个连接的消息转发给另外一个连接。这种操作在netty中是非常简便的。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)


