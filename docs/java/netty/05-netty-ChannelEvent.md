---
slug: /05-netty-ChannelEvent
---

# 15. netty系列之:Event、Handler和Pipeline



# 简介

上一节我们讲解了netty中的Channel，知道了channel是事件处理器和外部联通的桥梁。今天本文将会详细讲解netty的剩下几个非常总要的部分Event、Handler和PipeLine。

# ChannelPipeline 

pipeLine是连接Channel和handler的桥梁，它实际上是一个filter的实现，用于控制其中handler的处理方式。

当一个channel被创建的时候，和它对应的ChannelPipeline也会被创建。

先看下ChannelPipeline的定义：

```
public interface ChannelPipeline
        extends ChannelInboundInvoker, ChannelOutboundInvoker, Iterable 

```

首先ChannelPipeline继承自Iterable，表示它是可遍历的，而遍历的结果就是其中一个个的Handler。

作为一个合格的Iterable，ChannelPipeline提供了一系列的add和remote方法，通过这些方法就可以向ChannelPipeline中添加或者移除Handler。因为ChannelPipeline是一个filter，而过滤器是需要指定对应的filter的顺序的，所以ChannelPipeline中有addFirst和addLast这种添加不同顺序的方法。

然后可以看到ChannelPipeline继承了ChannelInboundInvoker和ChannelOutboundInvoker两个接口。

先看一张channelPipeline的工作流程图：

![](https://img-blog.csdnimg.cn/c1978325b8844650b66baa7f37036fe1.png)
 
 可以看出ChannelPipeline主要有两种操作，一种是读入Inbound，一种是写出OutBound。

 对于Socket.read()这样的读入操作，调用的实际上就是ChannelInboundInvoker中的方法。对于外部的IO写入的请求，调用的就是ChannelOutboundInvoker中的方法。

 注意，Inbound和outbound的处理顺序是相反的，比如下面的例子：

```
    ChannelPipeline p = ...;
   p.addLast("1", new InboundHandlerA());
   p.addLast("2", new InboundHandlerB());
   p.addLast("3", new OutboundHandlerA());
   p.addLast("4", new OutboundHandlerB());
   p.addLast("5", new InboundOutboundHandlerX());

```

上面的代码中我们向ChannelPipeline添加了5个handler，其中2个InboundHandler,2个OutboundHandler和一个同时处理In和Out的Handler。

那么当channel遇到inbound event的时候，就会按照1，2，3，4，5的顺序进行处理，但是只有InboundHandler才能处理Inbound事件，所以，真正执行的顺序是1，2，5。

同样的当channel遇到outbound event的时候，会按照5,4,3,2,1的顺序进行执行，但是只有outboundHandler才能处理Outbound事件，所以真正执行的顺序是5，4，3.

简单的说，ChannelPipeline指定了Handler的执行顺序。

# ChannelHandler

netty是一个事件驱动的框架，所有的event都是由Handler来进行处理的。ChannelHandler可以处理IO、拦截IO或者将event传递给ChannelPipeline中的下一个Handler进行处理。

ChannelHandler的结构很简单，只有三个方法，分别是：

```
void handlerAdded(ChannelHandlerContext ctx) throws Exception;
void handlerRemoved(ChannelHandlerContext ctx) throws Exception;
void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception;

```

根据inbound和outbound事件的不同，ChannelHandler可以分为两类，分别是ChannelInboundHandler 和ChannelOutboundHandler.

因为这两个都是interface，实现起来比较麻烦，所以netty为大家提供了三个默认的实现：ChannelInboundHandlerAdapter，ChannelOutboundHandlerAdapter和ChannelDuplexHandler。前面两个很好理解，分别是inbound和outbound,最后一个可以同时处理inbound和outbound。

ChannelHandler是由ChannelHandlerContext提供的，并且和ChannelPipeline的交互也是通过ChannelHandlerContext来进行的。

# ChannelHandlerContext 

ChannelHandlerContext可以让ChannelHandler和ChannelPipeline或者其他的Handler进行交互。它就是一个上下文环境，使得Handler和Channel可以相互作用。

如可以在ChannelHandlerContext中，调用channel（）获得绑定的channel。可以通过调用handler（）获得绑定的Handler。通过调用fire*方法来触发Channel的事件。

看下ChannelHandlerContext的定义：

```
public interface ChannelHandlerContext extends AttributeMap, ChannelInboundInvoker, ChannelOutboundInvoker 

```

可以看到他是一个AttributeMap用来存储属性，还是一个ChannelInboundInvoker和ChannelOutboundInvoker用来触发和传播相应的事件。

对于Inbound来说传播事件的方法有：

```
ChannelHandlerContext.fireChannelRegistered()
ChannelHandlerContext.fireChannelActive()
ChannelHandlerContext.fireChannelRead(Object)
ChannelHandlerContext.fireChannelReadComplete()
ChannelHandlerContext.fireExceptionCaught(Throwable)
ChannelHandlerContext.fireUserEventTriggered(Object)
ChannelHandlerContext.fireChannelWritabilityChanged()
ChannelHandlerContext.fireChannelInactive()
ChannelHandlerContext.fireChannelUnregistered()

```

对于Outbound来说传播事件的方法有：

```
ChannelHandlerContext.bind(SocketAddress, ChannelPromise)
ChannelHandlerContext.connect(SocketAddress, SocketAddress, ChannelPromise)
ChannelHandlerContext.write(Object, ChannelPromise)
ChannelHandlerContext.flush()
ChannelHandlerContext.read()
ChannelHandlerContext.disconnect(ChannelPromise)
ChannelHandlerContext.close(ChannelPromise)
ChannelHandlerContext.deregister(ChannelPromise)
```

这些方法，在一个Handler中调用，然后将事件传递给下一个Handler，如下所示：

```
   public class MyInboundHandler extends ChannelInboundHandlerAdapter {
        @Override
       public void channelActive(ChannelHandlerContext ctx) {
           System.out.println("Connected!");
           ctx.fireChannelActive();
       }
   }
  
   public class MyOutboundHandler extends ChannelOutboundHandlerAdapter {
        @Override
       public void close(ChannelHandlerContext ctx, ChannelPromise promise) {
           System.out.println("Closing ..");
           ctx.close(promise);
       }
   }

```   


# ChannelHandler中的状态变量

ChannelHandler是一个Handler类，一般情况下，这个类的实例是可以被多个channel共同使用的，前提是这个ChannelHandler没有共享的状态变量。

但有时候，我们必须要在ChannelHandler中保持一个状态，那么就涉及到ChannelHandler中的状态变量的问题，看下面的一个例子：

```
  public interface Message {
       // your methods here
   }
  
   public class DataServerHandler extends SimpleChannelInboundHandler<Message> {
  
       private boolean loggedIn;
  
        @Override
       public void channelRead0(ChannelHandlerContext ctx, Message message) {
           if (message instanceof LoginMessage) {
               authenticate((LoginMessage) message);
               loggedIn = true;
           } else (message instanceof GetDataMessage) {
               if (loggedIn) {
                   ctx.writeAndFlush(fetchSecret((GetDataMessage) message));
               } else {
                   fail();
               }
           }
       }
       ...
   }
```

这个例子中，我们需要在收到LoginMessage之后，对消息进行认证，并保存认证状态，因为业务逻辑是这样的，所以必须要有一个状态变量。

那么这样带有状态变量的Handler就只能绑定一个channel，如果绑定多个channel就有可能出现状态不一致的问题。一个channel绑定一个Handler实例，很简单，只需要在initChannel方法中使用new关键字新建一个对象即可。

```
   public class DataServerInitializer extends ChannelInitializer<Channel> {
        @Override
       public void initChannel(Channel channel) {
           channel.pipeline().addLast("handler", new DataServerHandler());
       }
   }

```

那么除了新建handler实例之外，还有没有其他的办法呢？当然是有的，那就是 ChannelHandlerContext 中的AttributeKey属性。还是上面的例子，我们看一下使用AttributeKey应该怎么实现：

```
   public interface Message {
       // your methods here
   }
  
    @Sharable
   public class DataServerHandler extends SimpleChannelInboundHandler<Message> {
       private final AttributeKey<Boolean> auth =
             AttributeKey.valueOf("auth");
  
        @Override
       public void channelRead(ChannelHandlerContext ctx, Message message) {
           Attribute<Boolean> attr = ctx.attr(auth);
           if (message instanceof LoginMessage) {
               authenticate((LoginMessage) o);
               attr.set(true);
           } else (message instanceof GetDataMessage) {
               if (Boolean.TRUE.equals(attr.get())) {
                   ctx.writeAndFlush(fetchSecret((GetDataMessage) o));
               } else {
                   fail();
               }
           }
       }
       ...
   }

```

上例中，首先定义了一个AttributeKey，然后使用ChannelHandlerContext的attr方法将Attribute设置到ChannelHandlerContext中，这样该Attribute绑定到这个ChannelHandlerContext中了。后续即使使用同一个Handler在不同的Channel中该属性也是不同的。

下面是使用共享Handler的例子：

```
   public class DataServerInitializer extends ChannelInitializer<Channel> {
  
       private static final DataServerHandler SHARED = new DataServerHandler();
  
        @Override
       public void initChannel(Channel channel) {
           channel.pipeline().addLast("handler", SHARED);
       }
   }
```

注意，在定义DataServerHandler的时候，我们加上了@Sharable注解，如果一个ChannelHandler使用了@Sharable注解，那就意味着你可以只创建一次这个Handler，但是可以将其绑定到一个或者多个ChannelPipeline中。

> 注意，@Sharable注解是为java文档准备的，并不会影响到实际的代码执行效果。

# 异步Handler

之前介绍了，可以通过调用pipeline.addLast方法将handler加入到pipeline中，因为pipeline是一个filter的结构，所以加入的handler是顺序进行处理的。

但是，我希望某些handler是在新的线程中执行该怎么办？如果我们希望这些新的线程中执行的Handler是无序的又该怎么办？

比如我们现在有3个handler分别是MyHandler1，MyHandler2和MyHandler3。

顺序执行的写法是这样的：

```
ChannelPipeline pipeline = ch.pipeline();
  
   pipeline.addLast("MyHandler1", new MyHandler1());
   pipeline.addLast("MyHandler2", new MyHandler2());
   pipeline.addLast("MyHandler3", new MyHandler3());

```

如果要让MyHandler3在新的线程中执行，则可以加入group选项，从而让handler在新的group中运行：

```
static final EventExecutorGroup group = new DefaultEventExecutorGroup(16);
ChannelPipeline pipeline = ch.pipeline();
  
   pipeline.addLast("MyHandler1", new MyHandler1());
   pipeline.addLast("MyHandler2", new MyHandler2());
   pipeline.addLast(group，"MyHandler3", new MyHandler3());

```

但是上例中DefaultEventExecutorGroup加入的Handler也是会顺序执行的，如果确实不想顺序执行，那么可以尝试考虑使用UnorderedThreadPoolEventExecutor 。

# 总结

本文讲解了Event、Handler和PipeLine，并举例说明他们之间的关系和相互作用。后续会从netty的具体实践出发，进一步加深对netty的理解和应用，希望大家能够喜欢。










