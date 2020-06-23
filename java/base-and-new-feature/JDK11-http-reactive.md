JDK11的新特性:HTTP API和reactive streams

# 简介

在[JDK11的新特性:新的HTTP API](http://www.flydean.com/jdk11-http-api/)中，我们介绍了通过新的HTTP API，我们可以发送同步或者异步的请求，并获得的返回的结果。

今天我们想探讨一下这些同步或者异步请求和响应和reactive streams的关系。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# 怎么在java中使用reactive streams

reactive streams的介绍大家可以参考[reactive stream协议详解](http://www.flydean.com/reactive-stream-protocol/),使用reactive streams的目的就是为了解决发送者和消费者之间的通信问题，发送者不会发送超出消费者能力的信息。

我们再回顾一下reactive streams中的几个关键概念：

*  Publisher 负责产生消息或者事件，并提供了一个subscribed接口来和Subscriber进行连接。

* Subscriber 用来subscribe一个Publisher，并提供了onNext方法来处理新的消息，onError来处理异常，onComplete提供给Publisher调用来结束监听。

* Subscription 负责连接Publisher和Subscriber，可以用来请求消息或者取消收听。

更进一步，如果我们想要自己实现一个reactive streams，我们需要做这些事情：

1. 创建Publisher和Subscriber

* 创建Publisher和Subscriber。
* 调用Publisher.subscribe(Subscriber)建立Publisher和Subscriber之间的连接。
* Publisher创建一个Subscription，并调用Subscriber.onSubscription(Subscription)方法。
* Subscriber将Subscription保存起来，供后面使用。

2. 发送和接收信息

* Subscriber调用Subscription.request(n) 方法请求n个消息。
* Publisher调用Subscriber.onNext(item) 将请求的消息发送给Subscriber。
* 按照需要重复上诉过程。

3. 取消或者结束

* Publisher调用Subscriber.OnError(err) 或者 Subscriber.onComplete()方法。
* Subscriber调用Subscription.cancel()方法。

# POST请求的例子

还记得上篇文章我们讲HTTP API新特性的时候，我们使用的例子吗？

例子中，我们使用了一个HttpRequest.BodyPublisher，用来构建Post请求，而BodyPublisher就是一个Flow.Publisher：

~~~java
public interface BodyPublisher extends Flow.Publisher<ByteBuffer>
~~~

也就是说从BodyPublisher开始，就已经在使用reactive streams了。

为了能够更好的了解reactive streams的工作原理，我们创建几个wrapper类将Publisher,Subscriber,Subscription包装起来，输出相应的日志。

代码有点多我们就不一一列出来了，这里只列一个CustBodyPublisher的具体实现：

~~~java
public class CustBodyPublisher implements HttpRequest.BodyPublisher {

    private final HttpRequest.BodyPublisher bodyPublisher;

    public CustBodyPublisher(HttpRequest.BodyPublisher bodyPublisher){
        this.bodyPublisher=bodyPublisher;
    }
    @Override
    public long contentLength() {
        long contentLength=bodyPublisher.contentLength();
        log.info("contentLength:{}",contentLength);
        return contentLength;
    }

    @Override
    public void subscribe(Flow.Subscriber<? super ByteBuffer> subscriber) {
        log.info("CustBodyPublisher subscribe {}",subscriber);
        bodyPublisher.subscribe(new CustSubscriber(subscriber));
    }
}
~~~

wrapper类很简单，通过构造函数传入要wrapper的类，然后在相应的方法中调用实际wrapper类的方法。

最后，我们将之前使用的调用HTTP API的例子改造一下：

~~~java
    public void testCustPost() throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder().build();

        HttpRequest.BodyPublisher requestBody = HttpRequest.BodyPublishers
                .ofString("{ 我是body }");
        CustBodyPublisher custBodyPublisher= new CustBodyPublisher(requestBody);
        HttpRequest postRequest = HttpRequest.newBuilder()
                .POST(custBodyPublisher)
                .uri(URI.create("http://www.flydean.com"))
                .build();

        HttpResponse<String> response = client
                .send(postRequest, HttpResponse.BodyHandlers.ofString());

        log.info("response {}",response);
    }
~~~

注意这里CustBodyPublisher custBodyPublisher= new CustBodyPublisher(requestBody)，我们创建了一个新的wrapper类。

运行它，观察输出结果：

~~~java
[HttpClient-1-Worker-0] INFO com.flydean.CustBodyPublisher - contentLength:14
[HttpClient-1-Worker-0] INFO com.flydean.CustBodyPublisher - CustBodyPublisher subscribe jdk.internal.net.http.Http1Request$FixedContentSubscriber@672776b6
[HttpClient-1-Worker-0] INFO com.flydean.CustSubscriber - CustSubscriber onSubscribe jdk.internal.net.http.PullPublisher$Subscription@580ce038
[HttpClient-1-Worker-0] INFO com.flydean.CustSubscription - CustSubscription request 1
[HttpClient-1-Worker-0] INFO com.flydean.CustSubscriber - CustSubscriber onNext length 14
[HttpClient-1-Worker-0] INFO com.flydean.CustSubscription - CustSubscription request 1
[HttpClient-1-Worker-0] INFO com.flydean.CustSubscriber - CustSubscriber onComplete
[main] INFO com.flydean.ReactiveHttpUsage - response (POST http://www.flydean.com) 200
~~~

可以看到reactive stream的具体工作流程。首先创建了CustBodyPublisher，然后调用了subscribe方法。

接着CustSubscriber调用onSubscribe创建了Subscription。

每次CustSubscription的request方法都会导致CustSubscriber的onNext方法被调用。

最后当CustSubscription再次请求无结果的时候，CustSubscriber调用onComplete方法结束整个流程。

> 注意，上面的例子中，我们wrapper调用的是BodyPublishers.ofString，其实BodyPublishers中内置了多种BodyPublisher的实现。感兴趣的朋友可以自行探索。

# 总结

本文讲解了新的HTTP API中reactive Streams的使用。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/
ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)



