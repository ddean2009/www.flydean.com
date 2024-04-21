---
slug: /22-netty-cors
---

# 46. netty系列之:在netty中处理CORS



# 简介

CORS的全称是跨域资源共享，他是一个基于HTTP-header检测的机制，通过对HTTP-header进行控制，可以实现对跨域资源的权限管理功能。在之前的CORS详解文章中，我们已经对CORS有了基本的解释。

本文将会从netty的实现角度，讲解如何在netty中实现CORS。

# 服务端的CORS配置

熟悉CORS的朋友应该知道，CORS所有的操作都是在HTTP协议之上通过控制HTTP头来实现的。所以说如果要在服务器端实现CORS的支持，事实上也是对HTTP协议的头进行各种设置完成的。

为了方便大家的使用，netty提供了一个CorsConfig类，来统一CORS的头设置。

先看下CorsConfig类中定义的属性：

```
    private final Set<String> origins;
    private final boolean anyOrigin;
    private final boolean enabled;
    private final Set<String> exposeHeaders;
    private final boolean allowCredentials;
    private final long maxAge;
    private final Set<HttpMethod> allowedRequestMethods;
    private final Set<String> allowedRequestHeaders;
    private final boolean allowNullOrigin;
    private final Map<CharSequence, Callable<?>> preflightHeaders;
    private final boolean shortCircuit;
```

这些属性和CORS的HTTP头设置是一一对应的。比如说origins表示的是允许的源，anyOrigin表示允许所有的源。

是和下面的设置对应的：

```
Origin: <origin>
```

exposeHeaders是和Access-Control-Expose-Headers一一对应的，表示服务器端允许客户端获取CORS资源的同时能够访问到的header信息。其格式如下：

```
Access-Control-Expose-Headers: <header-name>[, <header-name>]*
```

allowCredentials表示是否开启CORS的权限认证。表示服务器端是否接受客户端带有credentials字段的请求。如果用在preflight请求中，则表示后续的真实请求是否支持credentials，其格式如下：

```
Access-Control-Allow-Credentials: true
```

allowedRequestMethods表示访问资源允许的方法，主要用在preflight request中。其格式如下：

```
Access-Control-Allow-Methods: <method>[, <method>]*
```

allowedRequestHeaders用在preflight request中，表示真正能够被用来做请求的header字段，其格式如下：

```
Access-Control-Allow-Headers: <header-name>[, <header-name>]*
```

当客户端发送OPTIONS方法给服务器的时候，为了安全起见，因为服务器并不一定能够接受这些OPTIONS的方法，所以客户端需要首先发送一个
preflighted requests，等待服务器响应，等服务器确认之后，再发送真实的请求。我们举一个例子。preflightHeaders表示的就是服务器允许额preflight的请求头。

shortCircuit表示请求是否是一个有效的CORS请求，如果请求被拒绝之后，就会返回一个true。

# CorsConfigBuilder

CorsConfig使用来表示Cors的配置类，那么怎么去构造这个配置类呢？我们看下CorsConfig的构造函数：

```
    CorsConfig(final CorsConfigBuilder builder) {
        origins = new LinkedHashSet<String>(builder.origins);
        anyOrigin = builder.anyOrigin;
        enabled = builder.enabled;
        exposeHeaders = builder.exposeHeaders;
        allowCredentials = builder.allowCredentials;
        maxAge = builder.maxAge;
        allowedRequestMethods = builder.requestMethods;
        allowedRequestHeaders = builder.requestHeaders;
        allowNullOrigin = builder.allowNullOrigin;
        preflightHeaders = builder.preflightHeaders;
        shortCircuit = builder.shortCircuit;
    }
```

可以看到CorsConfig是通过CorsConfigBuilder来构造的。通过设置CorsConfigBuilder中的各种属性即可。CorsConfigBuilder中提供了多种设置属性的方法。

![](https://img-blog.csdnimg.cn/5c1ced36f1d84bdda67329044f47c767.png)

可以使用这样的方法来构造CorsConfig如下：

```
CorsConfig corsConfig = CorsConfigBuilder.forAnyOrigin().allowNullOrigin().allowCredentials().build();
```

# CorsHandler

有了corsConfig，我们还需要将这个config配置在netty的handler中，netty提供了一个CorsHandler类来专门处理corsConfig,这个类就叫CorsHandler。

首先看下CorsHandler的构造函数：

```
    public CorsHandler(final CorsConfig config) {
        this(Collections.singletonList(checkNotNull(config, "config")), config.isShortCircuit());
    }

    public CorsHandler(final List<CorsConfig> configList, boolean isShortCircuit) {
        checkNonEmpty(configList, "configList");
        this.configList = configList;
        this.isShortCircuit = isShortCircuit;
    }
```
CorsHandler有两个构造函数，一个是传入CorsConfig，一个是传入一个CorsConfig的列表。

CorsHandler的主要工作原理就是在channelRead的时候，对responseHeader进行处理，设置CORS头。

# netty对cors的支持

上面我们已经讲过了netty中cors的核心类和方法，最后一步就是把cors的支持类加入到netty的pipeline中，其核心代码如下：

```
    public void initChannel(SocketChannel ch) {

        ChannelPipeline pipeline = ch.pipeline();
        pipeline.addLast(new HttpResponseEncoder());
        pipeline.addLast(new HttpRequestDecoder());
        pipeline.addLast(new HttpObjectAggregator(65536));
        pipeline.addLast(new ChunkedWriteHandler());

        CorsConfig corsConfig = CorsConfigBuilder.forAnyOrigin().allowNullOrigin().allowCredentials().build();
        pipeline.addLast(new CorsHandler(corsConfig));

        pipeline.addLast(new CustResponseHandler());
    }
```

# 总结

cors比较简单，netty也为其提供了足够的方法支持。大家可以直接使用。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)








