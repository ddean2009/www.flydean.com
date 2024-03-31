---
slug: /19-netty-http-client-request
---

# 43. netty系列之:自建客户端和HTTP服务器交互



# 简介

上一篇文章，我们搭建了一个支持中文的HTTP服务器，并且能够从浏览器访问，并获取到相应的结果。虽然浏览器在日常的应用中很普遍，但是有时候我们也有可能从自建的客户端来调用HTTP服务器的服务。

今天给大家介绍如何自建一个HTTP客户端来和HTTP服务器进行交互。

# 使用客户端构建请求

在上一篇文章中，我们使用浏览器来访问服务器，并得到到了响应的结果，那么如何在客户端构建请求呢？

netty中的HTTP请求可以分成两个部分，分别是HttpRequest和HttpContent。其中HttpRequest只包含了请求的版本号和消息头的信息，HttpContent才包含了真正的请求内容信息。

但是如果要构建一个请求的话，需要同时包含HttpRequest和HttpContent的信息。netty提供了一个请求类叫做DefaultFullHttpRequest，这个类同时包含了两部分的信息，可以直接使用。

使用DefaultFullHttpRequest的构造函数，我们就可以构造出一个HttpRequest请求如下：

```
HttpRequest request = new DefaultFullHttpRequest(
                    HttpVersion.HTTP_1_1, HttpMethod.GET, uri.getRawPath(), Unpooled.EMPTY_BUFFER);
```

上面的代码中，我们使用的协议是HTTP1.1，方法是GET，请求的content是一个空的buffer。

构建好基本的request信息之后，我们可能还需要在header中添加一下额外的信息，比如connection，accept-encoding还有cookie的信息。

比如设置下面的信息：

```
request.headers().set(HttpHeaderNames.HOST, host);
            request.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
            request.headers().set(HttpHeaderNames.ACCEPT_ENCODING, HttpHeaderValues.GZIP);
```

还有设置cookie：

```
request.headers().set(
                    HttpHeaderNames.COOKIE,
                    ClientCookieEncoder.STRICT.encode(
                            new DefaultCookie("name", "flydean"),
                            new DefaultCookie("site", "www.flydean.com")));
```

设置cookie我们使用的是ClientCookieEncoder.encode方法，ClientCookieEncoder有两种encoder模式，一种是STRICT，一种是LAX。

在STRICT模式下，会对cookie的name和value进行校验和排序。

和encoder对应的就是ClientCookieDecoder，用于对cookie进行解析。

设置好我们所有的request之后就可以写入到channel中了。

# accept-encoding

在客户端写入请求的时候，我们在请求头上添加了accept-encoding，并将其值设置为GZIP，表示客户端接收的编码方式是GZIP。

如果服务器端发送了GZIP的编码内容之后，客户端怎么进行解析呢？我们需要对GZIP的编码格式进行解码。

netty提供了HttpContentDecompressor类，可以对gzip或者deflate格式的编码进行解码。在解码之后，会同时修改响应头中的“Content-Encoding”和“Content-Length”。

我们只需要将其添加到pipline中即可。

和它对应的类是HttpContentCompressor，用于对HttpMessage和HttpContent进行gzip或者deflate编码。

所以说HttpContentDecompressor应该被添加到client的pipline中，而HttpContentCompressor应该被添加到server端的pipline中。

# server解析HTTP请求

server需要一个handler来解析客户端请求过来的消息。对于服务器来说，解析客户端的请求应该注意哪些问题呢？

首先要注意的是客户端100 Continue请求的问题。

在HTTP中有一个独特的功能叫做，100 (Continue) Status，就是说client在不确定server端是否会接收请求的时候，可以先发送一个请求头，并在这个头上加一个"100-continue"字段，但是暂时还不发送请求body。直到接收到服务器端的响应之后再发送请求body。

如果服务器收到100Continue请求的话，直接返回确认即可：

```
if (HttpUtil.is100ContinueExpected(request)) {
                send100Continue(ctx);
            }

    private static void send100Continue(ChannelHandlerContext ctx) {
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, CONTINUE, Unpooled.EMPTY_BUFFER);
        ctx.write(response);
    }
```

如果不是100请求的话，server端就可以准备要返回的内容了：

这里用一个StringBuilder来存储要返回的内容：

```
StringBuilder buf = new StringBuilder();
```

为什么要用StringBuf呢？是因为有可能server端一次并不能完全接受客户端的请求，所以将所有的要返回的内容都放到buffer中，等全部接受之后再一起返回。

我们可以向server端添加欢迎信息，可以可以添加从客户端获取的各种信息：

```
buf.setLength(0);
            buf.append("欢迎来到www.flydean.com\r\n");
            buf.append("===================================\r\n");

            buf.append("VERSION: ").append(request.protocolVersion()).append("\r\n");
            buf.append("HOSTNAME: ").append(request.headers().get(HttpHeaderNames.HOST, "unknown")).append("\r\n");
            buf.append("REQUEST_URI: ").append(request.uri()).append("\r\n\r\n");
```

还可以向buffer中添加请求头信息：

```
HttpHeaders headers = request.headers();
            if (!headers.isEmpty()) {
                for (Entry<String, String> h: headers) {
                    CharSequence key = h.getKey();
                    CharSequence value = h.getValue();
                    buf.append("HEADER: ").append(key).append(" = ").append(value).append("\r\n");
                }
                buf.append("\r\n");
            }
```

可以向buffer中添加请求参数信息：

```
            QueryStringDecoder queryStringDecoder = new QueryStringDecoder(request.uri());
            Map<String, List<String>> params = queryStringDecoder.parameters();
            if (!params.isEmpty()) {
                for (Entry<String, List<String>> p: params.entrySet()) {
                    String key = p.getKey();
                    List<String> vals = p.getValue();
                    for (String val : vals) {
                        buf.append("PARAM: ").append(key).append(" = ").append(val).append("\r\n");
                    }
                }
                buf.append("\r\n");
            }
```

要注意的是当读取到HttpContent的时候的处理方式。如果读取的消息是HttpContent，那么将content的内容添加到buffer中：

```
if (msg instanceof HttpContent) {
            HttpContent httpContent = (HttpContent) msg;

            ByteBuf content = httpContent.content();
            if (content.isReadable()) {
                buf.append("CONTENT: ");
                buf.append(content.toString(CharsetUtil.UTF_8));
                buf.append("\r\n");
                appendDecoderResult(buf, request);
            }
```

那么怎么判断一个请求是否结束了呢？netty提供了一个类叫做LastHttpContent，这个类表示的是消息的最后一部分，当收到这一部分消息之后，我们就可以判断一个HTTP请求已经完成了，可以正式的返回消息了：

```
if (msg instanceof LastHttpContent) {
                log.info("LastHttpContent:{}",msg);
                buf.append("END OF CONTENT\r\n");
```

要写回channel，同样需要构建一个DefaultFullHttpResponse，这里使用buffer来进行构建：

```
FullHttpResponse response = new DefaultFullHttpResponse(
                HTTP_1_1, currentObj.decoderResult().isSuccess()? OK : BAD_REQUEST,
                Unpooled.copiedBuffer(buf.toString(), CharsetUtil.UTF_8));
```

然后添加一些必须的header信息就可以调用ctx.write进行回写了。

# 总结

本文介绍了如何在client构建HTTP请求，并详细讲解了HTTP server对HTTP请求的解析流程。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)



