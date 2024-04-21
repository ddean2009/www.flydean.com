---
slug: /20-netty-fileserver
---

# 44. netty系列之:搭建自己的下载文件服务器



# 简介

上一篇文章我们学习了如何在netty中搭建一个HTTP服务器，讨论了如何对客户端发送的请求进行处理和响应，今天我们来讨论一下在netty中搭建文件服务器进行文件传输中应该注意的问题。

# 文件的content-type

客户端向服务器端请求一个文件，服务器端在返回的HTTP头中会包含一个content-type的内容，这个content-type表示的是返回的文件类型。这个类型应该怎么确认呢？

一般来说，文件类型是根据文件的的扩展名来确认的，根据 RFC 4288的规范，所有的网络媒体类型都必须注册。apache也提供了一个文件MIME type和扩展名的映射关系表。

因为文件类型比较多，我们看几个比较常用到的类型如下：


MIME type | 扩展名
---------|----------
 image/jpeg | jpg
 image/jpeg | jpeg
 image/png | png
 text/plain|txt text conf def list log in
image/webp|webp
application/vnd.ms-excel|	xls
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet	|xlsx
application/msword|doc
application/vnd.openxmlformats-officedocument.wordprocessingml.document|docx
application/vnd.openxmlformats-officedocument.presentationml.presentation|pptx
application/vnd.ms-powerpoint|ppt
application/pdf|pdf

JDK提供了一个MimetypesFileTypeMap的类，这个类提供了一个getContentType方法，可以根据请求的文件path信息，来推断其MIME type类型：

```
    private static void setContentTypeHeader(HttpResponse response, File file) {
        MimetypesFileTypeMap mimeTypesMap = new MimetypesFileTypeMap();
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, mimeTypesMap.getContentType(file.getPath()));
    }
```

# 客户端缓存文件

对于HTTP的文件请求来说，为了保证请求的速度，会使用客户端缓存的机制。比如客户端向服务器端请求一个文件A.txt。服务器在接收到该请求之后会将A.txt文件发送给客户端。

其请求流程如下：

```
   步骤1：客户端请求服务器端的文件
   ===================
   GET /file1.txt HTTP/1.1
```

```
   步骤2：服务器端返回文件，并且附带额外的文件时间信息：
   ===================
   HTTP/1.1 200 OK
   Date:               Mon, 23 Aug 2021 17:52:30 GMT+08:00
   Last-Modified:      Tue, 10 Aug 2021 18:05:35 GMT+08:00
   Expires:            Mon, 23 Aug 2021 17:53:30 GMT+08:00
   Cache-Control:      private, max-age=60
```

一般来说如果客户端是现代浏览器的话，就会把A.txt缓存起来。在下次调用的时候只需要在head中添加If-Modified-Since，询问服务器该文件是否被修改了即可，如果文件没有被修改，则服务器会返回一个304 Not Modified，客户端得到该状态之后就会使用本地的缓存文件。

```
   步骤3：客户端再次请求该文件
   ===================
   GET /file1.txt HTTP/1.1
   If-Modified-Since:  Mon, 23 Aug 2021 17:55:30 GMT+08:00
  
   步骤4：服务器端响应该请求
   ===================
   HTTP/1.1 304 Not Modified
   Date:               Mon, 23 Aug 2021 17:55:32 GMT+08:00
```

在服务器的代码层面，我们首先需要返回一个响应中通常需要的日期字段，如Date、Last-Modified、Expires、Cache-Control等：

```
 SimpleDateFormat dateFormatter = new SimpleDateFormat(HTTP_DATE_FORMAT, Locale.US);
        dateFormatter.setTimeZone(TimeZone.getTimeZone(HTTP_DATE_GMT_TIMEZONE));

        // 日期 header
        Calendar time = new GregorianCalendar();
        log.info(dateFormatter.format(time.getTime()));

        response.headers().set(HttpHeaderNames.DATE, dateFormatter.format(time.getTime()));

        // 缓存 headers
        time.add(Calendar.SECOND, HTTP_CACHE_SECONDS);
        response.headers().set(HttpHeaderNames.EXPIRES, dateFormatter.format(time.getTime()));
        response.headers().set(HttpHeaderNames.CACHE_CONTROL, "private, max-age=" + HTTP_CACHE_SECONDS);
        response.headers().set(
                HttpHeaderNames.LAST_MODIFIED, dateFormatter.format(new Date(fileToCache.lastModified())));
```

然后在收到客户端的二次请求之后，需要比较文件的最后修改时间和If-Modified-Since中自带的时间，如果没有发送变化，则发送304状态：

```
FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, NOT_MODIFIED, Unpooled.EMPTY_BUFFER);
        setDateHeader(response);
```

# 其他HTTP中常用的处理

我们讨论了文件类型和缓存，对于一个通用的HTTP服务器来说，还需要考虑很多其他常用的处理，比如异常、重定向和Keep-Alive设置。

对于异常，我们需要根据异常的代码来构造一个DefaultFullHttpResponse，并且设置相应的CONTENT_TYPE头即可，如下所示：

```
FullHttpResponse response = new DefaultFullHttpResponse(
                HTTP_1_1, status, Unpooled.copiedBuffer("异常: " + status + "\r\n", CharsetUtil.UTF_8));
        response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");
```

重定向同样需要构建一个DefaultFullHttpResponse，其状态是302 Found，并且在响应头中设置location为要跳转的URL地址即可：

```
FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, FOUND, Unpooled.EMPTY_BUFFER);
        response.headers().set(HttpHeaderNames.LOCATION, newUri);
```

Keep-Alive是HTTP中为了避免每次请求都建立连接而做的一个优化方式。在HTTP/1.0中默认是的keep-alive是false，在HTTP/1.1中默认的keep-alive是true。如果在header中手动设置了connection：false，则server端请求返回也需要同样设置connection：false。

另外，因为HTTP/1.1中默认的keep-alive是true，如果通过HttpUtil.isKeepAlive判断通过之后，还需要判断是否是HTTP/1.0，并显示设置keep-alive为true。

```
final boolean keepAlive = HttpUtil.isKeepAlive(request);
        HttpUtil.setContentLength(response, response.content().readableBytes());
        if (!keepAlive) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE);
        } else if (request.protocolVersion().equals(HTTP_1_0)) {
            response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
        }
```

# 文件内容展示处理

文件内容展示处理是http服务器的核心，也是比较难以理解的地方。

首先要设置的是ContentLength，也就是响应的文件长度，这个可以使用file的length方法来获取：

```
RandomAccessFile raf；
raf = new RandomAccessFile(file, "r");
long fileLength = raf.length();
HttpUtil.setContentLength(response, fileLength);
```
然后我们需要根据文件的扩展名设置对应的CONTENT_TYPE，这个在第一小节已经介绍过了。

然后再设置date和缓存属性。这样我们就得到了一个只包含响应头的DefaultHttpResponse，我们先把这个只包含响应头的respose写到ctx中。

写完HTTP头，接下来就是写HTTP的Content了。

对于HTTP传递的文件来说，有两种处理方式，第一种方式情况下如果知道整个响应的content大小，则可以在后台直接进行整个文件的拷贝传输。如果服务器本身支持零拷贝的话，则可以使用DefaultFileRegion的transferTo方法将File或者Channel的文件进行转移。

```
sendFileFuture =
                    ctx.write(new DefaultFileRegion(raf.getChannel(), 0, fileLength), ctx.newProgressivePromise());
            // 结束部分
            lastContentFuture = ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
```

如果并不知道整个响应的context大小，则可以将大文件拆分成为一个个的chunk，并且在响应的头中设置transfer-coding为chunked，netty提供了HttpChunkedInput和ChunkedFile，用来将大文件拆分成为一个个的Chunk进行传输。

```
sendFileFuture =
                    ctx.writeAndFlush(new HttpChunkedInput(new ChunkedFile(raf, 0, fileLength, 8192)),
                            ctx.newProgressivePromise());
```

如果向channel中写入ChunkedFile，则需要添加相应的ChunkedWriteHandler对chunked文件进行处理。

```
pipeline.addLast(new ChunkedWriteHandler());
```

注意，如果是完整文件传输，则需要手动添加last content部分：

```
lastContentFuture = ctx.writeAndFlush(LastHttpContent.EMPTY_LAST_CONTENT);
```

如果是ChunkedFile，last content部分已经包含在了chunkedFile中，不需要再手动添加了。

# 文件传输进度

ChannelFuture可以添加对应的listner，用来监控文件传输的进度，netty提供了一个ChannelProgressiveFutureListener，用于监控文件的进程，可以重写operationProgressed和operationComplete方法对进度监控进行定制：

```
        sendFileFuture.addListener(new ChannelProgressiveFutureListener() {
            @Override
            public void operationProgressed(ChannelProgressiveFuture future, long progress, long total) {
                if (total < 0) {
                    log.info(future.channel() + " 传输进度: " + progress);
                } else {
                    log.info(future.channel() + " 传输进度: " + progress + " / " + total);
                }
            }

            @Override
            public void operationComplete(ChannelProgressiveFuture future) {
                log.info(future.channel() + " 传输完毕.");
            }
        });
```

# 总结

我们考虑了一个HTTP文件服务器最基本的一些考虑因素，现在可以使用这个文件服务器来提供服务啦！

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)




