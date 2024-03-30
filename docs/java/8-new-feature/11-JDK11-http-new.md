---
slug: /JDK11-http-new
---

# 11. JDK11的新特性:新的HTTP API

# 简介

JDK11之前，java的HTTP功能很弱，只提供了HttpURLConnection来进行HTTP连接，并且使用起来非常复杂。所以一般大家都是用第三方的HTTP client（Apache HttpComponents 或者 OkHttp）来进行HTTP请求。

一切在JDK11的时候完全变了，在java.net.http包，最新的HttpClient, HttpRequest 和 HttpResponse完全可以满足你的需求。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# 使用HTTP Client请求的基本流程

通常我们要在代码中做一个HTTP请求，通常有三个步骤。

1. 构建一个HTTP client。
2. 生成一个HTTP Request。
3. 使用HTTP Client发送HTTP Request得到一个HTTP Response。

## 创建HTTP Client

做HTTP请求，需要建立一个HTTP客户端和HTTP server之间的连接，HTTP协议是非常复杂的，有很多可控的参数。所以需要有一个HttpClient来进行相关的配置。

~~~java
        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();
~~~

创建HttpClient很简单，使用newBuilder就可以了，我们可以指定version,connectTimeout,proxy,SSL,认证或者cookie等。

## 创建HTTP Request

同样的，使用HttpRequest.newBuilder()就可以用来创建HTTP Request。

~~~java
HttpRequest getRequest = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create("http://www.flydean.com"))
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36")
                .build();
~~~

上面的例子我们创建了一个get请求，并设置了请求的url和head。

如果是post请求，则需要构建一个request body：

~~~java
HttpRequest.BodyPublisher requestBody = HttpRequest.BodyPublishers
                .ofString("{ 我是body }");
        HttpRequest postRequest = HttpRequest.newBuilder()
                .POST(requestBody)
                .uri(URI.create("http://www.flydean.com"))
                .build();
~~~

## 发送HTTP请求 

有了client和request，我们就可以发送HTTP请求了。

~~~java
HttpResponse<String> response = client.send( getRequest, HttpResponse.BodyHandlers.ofString());
        String respnseBody = response.body();
        log.info(respnseBody);
~~~

这样一个完美的HTTP请求就完成了。

# 异步HTTP请求

上面的例子我们使用client.send来发送http请求，这个请求实际上是同步的，这意味着我们的程序必须一直等待，直到返回请求结果。

HttpClient还提供了一个sendAsync的异步执行的方法。该方法返回一个CompletableFuture。

还是看个例子：

~~~java
    public void useAsyncHttp()  {
        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();

        CompletableFuture<Void> completableFuture=checkUri(client,URI.create("http://www.flydean.com"));
        //获取completableFuture的值
        completableFuture.join();
    }

    private CompletableFuture<Void> checkUri(HttpClient httpClient, URI uri){
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(uri)
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36")
                .build();

        return httpClient.sendAsync(request,HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::statusCode)
                .thenApply(statusCode -> statusCode == 200 )
                .exceptionally(ex -> false)
                .thenAccept(valid ->
                {
                    if (valid) {
                        log.info("uri {} is valid",uri);
                    } else {
                        log.info("uri {} is not valid", uri);
                    }
                });
    }
~~~

上面的例子中我们获取了HTTP请求，然后调用了CompletableFuture的thenApply和thenAccept对结果进行过滤和处理。

CompletableFuture是Future和CompletionStage的混合体。Future大家都很熟悉了，可以通过get方法获取异步执行的结果。而CompletionStage代表的是一个异步计算的stage,不同的stage可以互相依赖，通过then***方法来组成一个级联操作。和Stream的操作有点像，和ES6中的promise的then一样，使用CompletionStage可以避免回调地狱。CompletionStage可以将异步回调转换成级联操作。

关于CompletableFuture的更多内容，可以参考[关于CompletableFuture的一切，看这篇文章就够了](http://www.flydean.com/java-completablefuture/)

thenApply的参数是一个Function，thenAccept是一个Consumer。

最后，我们需要调用completableFuture.join()来保证completableFuture的异步操作执行完成。

当然调用completableFuture.get()方法也是可以的。

# 总结

本文讲解了JDK11新创建的HTTP Client操作，并进一步讨论了CompletableFuture的使用。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/
ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)



