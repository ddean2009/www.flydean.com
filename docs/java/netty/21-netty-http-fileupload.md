---
slug: /21-netty-http-fileupload
---

# 45. netty系列之:搭建HTTP上传文件服务器



# 简介

上一篇的文章中，我们讲到了如何从HTTP服务器中下载文件，和搭建下载文件服务器应该注意的问题，使用的GET方法。本文将会讨论一下常用的向服务器提交数据的POST方法和如何向服务器上传文件。

# GET方法上传数据

按照HTTP的规范，PUT一般是向服务器上传数据，虽然不提倡，但是也可以使用GET向服务器端上传数据。

先看下GET客户端的构建中需要注意的问题。

GET请求实际上就是一个URI，URI后面带有请求的参数，netty提供了一个QueryStringEncoder专门用来构建参数内容：

```
// HTTP请求
        QueryStringEncoder encoder = new QueryStringEncoder(get);
        // 添加请求参数
        encoder.addParam("method", "GET");
        encoder.addParam("name", "flydean");
        encoder.addParam("site", "www.flydean.com");
        URI uriGet = new URI(encoder.toString());
```

有了请求URI，就可以创建HttpRequest了，当然这个HttpRequest中还需要有对应的HTTP head数据：

```
HttpRequest request = new DefaultHttpRequest(HttpVersion.HTTP_1_1, HttpMethod.GET, uriGet.toASCIIString());
        HttpHeaders headers = request.headers();
        headers.set(HttpHeaderNames.HOST, host);
        headers.set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
        headers.set(HttpHeaderNames.ACCEPT_ENCODING, HttpHeaderValues.GZIP + "," + HttpHeaderValues.DEFLATE);
        headers.set(HttpHeaderNames.ACCEPT_LANGUAGE, "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
        headers.set(HttpHeaderNames.REFERER, uriSimple.toString());
        headers.set(HttpHeaderNames.USER_AGENT, "Netty Simple Http Client side");
        headers.set(HttpHeaderNames.ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");

        headers.set(
                HttpHeaderNames.COOKIE, ClientCookieEncoder.STRICT.encode(
                        new DefaultCookie("name", "flydean"),
                        new DefaultCookie("site", "www.flydean.com"))
        );
```

我们知道HttpRequest中只有两部分数据，分别是HttpVersion和HttpHeaders。HttpVersion就是HTTP协议的版本号，HttpHeaders就是设置的header内容。

对于GET请求来说，因为所有的内容都包含在URI中，所以不需要额外的HTTPContent，直接发送HttpRequest到服务器就可以了。

```
channel.writeAndFlush(request);
```

然后看下服务器端接收GET请求之后怎么进行处理。

服务器端收到HttpObject对象的msg之后，需要将其转换成HttpRequest对象，就可以通过protocolVersion(),uri()和headers()拿到相应的信息。

对于URI中的参数，netty提供了QueryStringDecoder类可以方便的对URI中参数进行解析：

```
//解析URL中的参数
            QueryStringDecoder decoderQuery = new QueryStringDecoder(request.uri());
            Map<String, List<String>> uriAttributes = decoderQuery.parameters();
            for (Entry<String, List<String>> attr: uriAttributes.entrySet()) {
                for (String attrVal: attr.getValue()) {
                    responseContent.append("URI: ").append(attr.getKey()).append('=').append(attrVal).append("\r\n");
                }
            }
```

# POST方法上传数据

对于POST请求，它比GET请求多了一个HTTPContent，也就是说除了基本的HttpRequest数据之外，还需要一个PostBody。

如果只是一个普通的POST，也就是POST内容都是key=value的形式，则比较简单，如果POST中包含有文件，那么会比较复杂，需要用到ENCTYPE="multipart/form-data"。

netty提供了一个HttpPostRequestEncoder类，用于快速对request body进行编码，先看下HttpPostRequestEncoder类的完整构造函数：

```
public HttpPostRequestEncoder(
            HttpDataFactory factory, HttpRequest request, boolean multipart, Charset charset,
            EncoderMode encoderMode)
```

其中request就是要编码的HttpRequest，multipart表示是否是"multipart/form-data"的格式，charset编码方式，默认情况下是CharsetUtil.UTF_8。encoderMode是编码的模式，目前有三种编码模式，分别是RFC1738，RFC3986和HTML5。

默认情况下的编码模式是RFC1738，这也是大多数form提交数据的编码方式。但是它并不适用于OAUTH，如果要使用OAUTH的话，则可以使用RFC3986。HTML5禁用了multipart/form-data的混合模式。

最后，我们讲讲HttpDataFactory。factory主要用来创建InterfaceHttpData。它有一个minSize参数，如果创建的HttpData大小大于minSize则会存放在磁盘中，否则直接在内存中创建。

InterfaceHttpData有三种HttpData的类型，分别是Attribute, FileUpload和InternalAttribute。

Attribute就是POST请求中传入的属性值。FileUpload就是POST请求中传入的文件，还有InternalAttribute是在encoder内部使用的，这里不过多讨论。

因此，根据传入的minSize参数大小，Attribute和FileUpload可以被分成下面几种：

MemoryAttribute, DiskAttribute or MixedAttribute
MemoryFileUpload, DiskFileUpload or MixedFileUpload

在这一节我们先看一下在POST请求中并不上传文件的处理方式，首先创建HTTP request和PostBody encoder：

```
// 构建HTTP request
        HttpRequest request = new DefaultHttpRequest(HttpVersion.HTTP_1_1, HttpMethod.POST, uriSimple.toASCIIString());

 HttpPostRequestEncoder bodyRequestEncoder =
                new HttpPostRequestEncoder(factory, request, false);  
```

向request中添加headers：

```
// 添加headers
        for (Entry<String, String> entry : headers) {
            request.headers().set(entry.getKey(), entry.getValue());
        }
```

然后再向bodyRequestEncoder中添加form属性：

```
// 添加form属性
        bodyRequestEncoder.addBodyAttribute("method", "POST");
        bodyRequestEncoder.addBodyAttribute("name", "flydean");
        bodyRequestEncoder.addBodyAttribute("site", "www.flydean.com");
        bodyRequestEncoder.addBodyFileUpload("myfile", file, "application/x-zip-compressed", false);
```

注意，上面我们向bodyRequestEncoder中添加了method,name和site这几个属性。然后添加了一个FileUpload。但是因为我们的编码方式并不是"multipart/form-data"，所以这里传递的只是文件名，并不是整个文件。

最后，我们要调用bodyRequestEncoder的finalizeRequest方法，返回最终要发送的request。在finalizeRequest的过程中，还会根据传输数据的大小来设置transfer-encoding是否为chunked。

如果传输的内容比较大，则需要分段进行传输，这时候需要设置transfer-encoding = chunked，否则不进行设置。

最后发送请求：

```
// 发送请求
        channel.write(request);
```

在server端，我们同样需要构造一个HttpDataFactory，然后使用这个factory来构造一个HttpPostRequestDecoder，来对encoder出来的数据进行decode：

```
HttpDataFactory factory =
            new DefaultHttpDataFactory(DefaultHttpDataFactory.MINSIZE);
//POST请求
decoder = new HttpPostRequestDecoder(factory, request);
```

因为server端收到的消息根据发送消息的长度可以能是HttpContent，也可能是LastHttpContent。如果是HttpContent，我们将解析的结果放到一个StringBuilder中缓存起来，等接收到LastHttpContent再一起发送出去即可。

在收到HttpContent之后，我们调用decoder.offer方法，对HttpContent进行解码：

```
decoder.offer(chunk);
```

在decoder内部有两个存储HttpData数据的容器，分别是：

```
List<InterfaceHttpData> bodyListHttpData
和
Map<String, List<InterfaceHttpData>> bodyMapHttpData
```

decoder.offer就是对chunk进行解析，然后将解析过后的数据填充到bodyListHttpData和bodyMapHttpData中。

解析过后，就可以对解析过后的数据进行读取了。

可以通过decoder的hasNext和next方法对bodyListHttpData进行遍历，从而获取到对应的InterfaceHttpData。

通过data.getHttpDataType()可以拿到InterfaceHttpData的数据类型，上面也讲过了有Attribute和FileUpload两种类型。


# POST方法上传文件

如果要POST文件，客户端在创建HttpPostRequestEncoder的时候传入multipart=true即可：

```
 HttpPostRequestEncoder bodyRequestEncoder =
                new HttpPostRequestEncoder(factory, request, true);
```

然后分别调用setBodyHttpDatas和finalizeRequest方法，生成HttpRequest就可以向channel写入了：

```
// 添加body http data
        bodyRequestEncoder.setBodyHttpDatas(bodylist);
        // finalize request，判断是否需要chunk
        request = bodyRequestEncoder.finalizeRequest();
        // 发送请求头
        channel.write(request);
```

要注意，如果是transfer-encoding = chunked，那么这个HttpRequest只是请求头的信息，我们还需要手动将HttpContent写入到channel中：

```
        // 判断bodyRequestEncoder是否是Chunked，发送请求内容
        if (bodyRequestEncoder.isChunked()) {
            channel.write(bodyRequestEncoder);
        }
```

在server端，通过判断InterfaceHttpData的getHttpDataType，如果是FileUpload类型，则说明拿到了上传的文件，则可以通过下面的方法来读取到文件的内容：

```
FileUpload fileUpload = (FileUpload) data;
responseContent.append(fileUpload.getString(fileUpload.getCharset()));
```

这样我们就可以在服务器端拿到客户端传过来的文件了。

# 总结

HTTP的文件上传需要考虑的问题比较多，大家有不明白的可以参考我的例子。或者留言给我一起讨论。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)





