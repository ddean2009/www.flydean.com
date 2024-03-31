---
slug: /26-netty-secure-http2
---

# 50. netty系列之:让TLS支持http2



# 简介

我们知道虽然HTTP2协议并不强制使用HTTPS，但是对大多数浏览器来说，如果要使用HTTP2的话，则必须使用HTTPS，所以我们需要了解如何在netty的TLS中支持http2。

# TLS的扩展协议NPN和ALPN

HTTP2协议是从spdy协议发展而来的，无论是spdy还是http2都为了能在HTTPS的环境下工作，发展出来了TLS协议的扩展。

他们分别叫做NPN(Next Protocol Negotiation) 和 ALPN (Application Layer Protocol Negotiation) 。

他们规定了在TLS协议握手之后，客户端和服务器端进行应用数据通信的协议。其中ALPN可以在客户端首次和服务器端进行握手的时候，就列出客户端支持的应用层数据协议，服务器端直接选择即可，因此可以比NPN少一个交互流程，更加优秀。

那么spdy和http2分别支持的协议都有哪些呢？

netty提供了一个ApplicationProtocolNames类，在其中定义了各自对应的协议，其中ALPN对应了http2和http1.1，而sydy对应了spdy/1，spdy/2，spdy/3：

```

    /**
     * HTTP version 2
     */
    public static final String HTTP_2 = "h2";

    /**
     * {@code "http/1.1"}: HTTP version 1.1
     */
    public static final String HTTP_1_1 = "http/1.1";

    /**
     * {@code "spdy/3.1"}: SPDY version 3.1
     */
    public static final String SPDY_3_1 = "spdy/3.1";

    /**
     * {@code "spdy/3"}: SPDY version 3
     */
    public static final String SPDY_3 = "spdy/3";

    /**
     * {@code "spdy/2"}: SPDY version 2
     */
    public static final String SPDY_2 = "spdy/2";

    /**
     * {@code "spdy/1"}: SPDY version 1
     */
    public static final String SPDY_1 = "spdy/1";
```

# SslProvider

目前来说，netty中有两种SSL的实现方式，一种是JDK，一种是OPENSSL，不同的实现方式对TLS协议扩展的支持也不一样。它提供了一个isAlpnSupported方法，根据传入provider的不同来判断，是否支持ALPN。

```
    public static boolean isAlpnSupported(final SslProvider provider) {
        switch (provider) {
            case JDK:
                return JdkAlpnApplicationProtocolNegotiator.isAlpnSupported();
            case OPENSSL:
            case OPENSSL_REFCNT:
                return OpenSsl.isAlpnSupported();
            default:
                throw new Error("Unknown SslProvider: " + provider);
        }
    }
```

如果你使用的是JDK8，那么运行之后，可能会得到下面的错误提示：

```
ALPN is only supported in Java9 or if you use conscrypt as your provider or have the jetty alpn stuff on the class path.
```

也就是说如果是用JDK作为默认的SSL provider的话，它是不支持ALPN的。必须升级到java9.

根据提示如果添加conscrypt到classpath中：

```
        <dependency>
            <groupId>org.conscrypt</groupId>
            <artifactId>conscrypt-openjdk-uber</artifactId>
            <version>2.5.2</version>
        </dependency>
```

运行之后会得到下面的错误：

```
Unable to wrap SSLEngine of type 'sun.security.ssl.SSLEngineImpl'
```

怎么办呢？答案就是使用Open SSL，还需要添加：

```
        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-tcnative-boringssl-static</artifactId>
            <version>2.0.40.Final</version>
        </dependency>
```

经过测试，完美执行。

# ApplicationProtocolConfig

ApplicationProtocolConfig是netty提供了传递给SSLEngine的协议配置类，它主要有四个属性：

```
    private final List<String> supportedProtocols;
    private final Protocol protocol;
    private final SelectorFailureBehavior selectorBehavior;
    private final SelectedListenerFailureBehavior selectedBehavior;
```
supportedProtocols是支持的数据传输协议，像上面的HTTP2，HTTP1.1或者spdy/1，spdy/2，spdy/3等。

protocol是TLS的扩展协议，像ALPN或者NPN等。

selectorBehavior是在选择协议的时候的表现方式，有3种方式：

FATAL_ALERT： 如果选择应用程序协议的节点没有找到匹配项，那么握手将会失败。
NO_ADVERTISE： 如果选择应用程序协议的节点没有找到匹配项，它将通过在握手中假装不支持 TLS 扩展。
CHOOSE_MY_LAST_PROTOCOL： 如果选择应用程序协议的节点没有找到匹配项，将会使用上一次建议使用的协议。

selectedBehavior是通知被选择的协议之后的表现方式，也有3种方式：

ACCEPT： 如果节点不支持对方节点选择的应用程序协议，则该节点默认不支持该TLS扩展，然后继续握手。
FATAL_ALERT： 如果节点不支持对方节点选择的应用程序协议，则握手失败。
CHOOSE_MY_LAST_PROTOCOL： 如果节点不支持对方节点选择的应用程序协议，将会使用上一次建议使用的协议。

# 构建SslContext

有了provider，ApplicationProtocolConfig 之后，就可以构建SslContext了。首先创建SSL provider：

```
 SslProvider provider =  SslProvider.isAlpnSupported(SslProvider.OPENSSL)  ? SslProvider.OPENSSL : SslProvider.JDK;
           
```

默认情况下使用JDK作为ssl provider，如果你使用的是OpenSSL的话，就使用OpenSSL。

我们使用SslContextBuilder.forServer来创建SslContext，这个方法需要传入certificate和privateKey，为了简单起见，我们使用自签名的SelfSignedCertificate：

```
 SelfSignedCertificate ssc = new SelfSignedCertificate();
            sslCtx = SslContextBuilder.forServer(ssc.certificate(), ssc.privateKey()).build();
```

还可以为其设置sslProvider，ciphers和applicationProtocolConfig等信息：

```
sslCtx = SslContextBuilder.forServer(ssc.certificate(), ssc.privateKey())
                .sslProvider(provider)
                //支持的cipher
                .ciphers(Http2SecurityUtil.CIPHERS, SupportedCipherSuiteFilter.INSTANCE)
                .applicationProtocolConfig(new ApplicationProtocolConfig(
                    Protocol.ALPN,
                    // 目前 OpenSsl 和 JDK providers只支持NO_ADVERTISE
                    SelectorFailureBehavior.NO_ADVERTISE,
                    // 目前 OpenSsl 和 JDK providers只支持ACCEPT
                    SelectedListenerFailureBehavior.ACCEPT,
                    ApplicationProtocolNames.HTTP_2,
                    ApplicationProtocolNames.HTTP_1_1))
                .build();
```

# ProtocolNegotiationHandler

最后，我们需要根据协商使用的不同协议，进行不同的处理。netty提供了一个ApplicationProtocolNegotiationHandler，自定义的话，只需要继承该类即可，比如，我们根据protocol的名称不同，来分别处理HTTP1和HTTP2请求：

```
   public class MyNegotiationHandler extends ApplicationProtocolNegotiationHandler {
       public MyNegotiationHandler() {
           super(ApplicationProtocolNames.HTTP_1_1);
       }
  
       protected void configurePipeline(ChannelHandlerContext ctx, String protocol) {
           if (ApplicationProtocolNames.HTTP_2.equals(protocol) {
               configureHttp2(ctx);
           } else if (ApplicationProtocolNames.HTTP_1_1.equals(protocol)) {
               configureHttp1(ctx);
           } else {
               throw new IllegalStateException("unknown protocol: " + protocol);
           }
       }
   }
```

然后将其加入到ChannelPipeline中即可：

```
   public class MyInitializer extends ChannelInitializer<Channel> {
       private final SslContext sslCtx;
  
       public MyInitializer(SslContext sslCtx) {
           this.sslCtx = sslCtx;
       }
  
       protected void initChannel(Channel ch) {
           ChannelPipeline p = ch.pipeline();
           p.addLast(sslCtx.newHandler(...)); // Adds SslHandler
           p.addLast(new MyNegotiationHandler());
       }
   }
```

# 总结

以上就是在netty中配置TLS支持HTTP2的完整流程了。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)













