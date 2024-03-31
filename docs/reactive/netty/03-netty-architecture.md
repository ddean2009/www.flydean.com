---
slug: /03-netty-architecture
---

# 3. netty系列之:netty架构概述



# 简介

Netty为什么这么优秀，它在JDK本身的NIO基础上又做了什么改进呢？它的架构和工作流程如何呢？请走进今天的netty系列文章之:netty架构概述。

# netty架构图

netty的主要作用就是提供一个简单的NIO框架可以和上层的各种协议相结合，最终实现高性能的服务器。下面是netty官网提供的架构图：

![](https://img-blog.csdnimg.cn/dda8e9896b454c6f8c42300c1170a0c3.png)

从上图可以看到netty的核心主要分成三部分，分别是可扩展的event model、统一的API、和强大的Byte Buffer。这三个特性是netty的制胜法宝。

下面会从这几个方面对netty的特性进行详细说明，务必让读者了解到netty的优秀之处。

# 丰富的Buffer数据机构

首先从最底层的Buffer数据结构开始，netty提供了一个io.netty.buffer的包，该包里面定义了各种类型的ByteBuf和其衍生的类型。

netty Buffer的基础是ByteBuf类，这是一个抽象类，其他的Buffer类基本上都是由该类衍生而得的，这个类也定义了netty整体Buffer的基调。

netty重写ByteBuf其目的是让最底层的ByteBuf比JDK自带的更快更适合扩展。具体而言，netty的ByteBuf要比JDK中的ByteBuffer要快，同时，扩展也更加容易，大家可以根据需要Buf进行自定义。另外netty有一些内置的复合缓冲区类型，所以可以实现透明的零拷贝。对于动态缓冲区类型来说，可以和StringBuffer一样按需扩展，非常好用。

## 零拷贝

什么是零拷贝呢？零拷贝的意思是在需要拷贝的时候不做拷贝。我们知道数据在使用底层协议进行传输的过程中是会被封装成为一个个的包进行传输。当传输的数据过大，一个包放不下的时候，还需要对数据进行拆分，目的方在接收到数据之后，需要对收到的数据进行组装，一般情况下这个组装的操作是对数据的拷贝，将拆分过后的对象拷贝到一个长的数据空间中。

比如下面的例子所示，将底层的TCP包组合称为顶层的HTTP包，但是并没有进行拷贝：

![](https://img-blog.csdnimg.cn/5cefd4a7dcf64051af18800c42605675.png)

具体怎么拷贝呢？在上一篇文章中，我们知道netty提供了一个工具类方法Unpooled,这个工具类中有很多wrapped开头的方法，我们举几个例子：

```
 public static ByteBuf wrappedBuffer(byte[]... arrays) {
        return wrappedBuffer(arrays.length, arrays);
    }

public static ByteBuf wrappedBuffer(ByteBuf... buffers) {
        return wrappedBuffer(buffers.length, buffers);
    }

public static ByteBuf wrappedBuffer(ByteBuffer... buffers) {
        return wrappedBuffer(buffers.length, buffers);
    }
```

上面三个方法分别是封装byte数组、封装ByteBuf和封装ByteBuffer，这些方法都是零拷贝。大家可以在实际的项目中根据实际情况，自行选用。

# 统一的API

一般来说，在传统的JDK的IO API中，根据传输类型或者协议的不同，使用的API也是不同的。我们需要对不同的传输方式开发不同的应用程序，不能做到统一。这样的结果就是无法平滑的迁移，并且在程序扩展的时候需要进行额外的处理。

> 什么是传输方式呢？这里是指以什么样的方式来实现IO，比如传统的阻塞型IO，我们可以称之为OIO，java的new IO可以称之为NIO，异步IO可以称之为AIO等等。

并且JDK中的传统IO和NIO是割裂的，如果在最开始你使用的是传统IO，那么当你的客户数目增长到一定的程度准备切换到NIO的时候，就会发现切换起来异常复杂，因为他们是割裂的。

为了解决这个问题，netty提供了一个统一的类Channel来提供统一的API。

先看下Channel中定义的方法：

![](https://img-blog.csdnimg.cn/82c99c6dc89c4dd19675b6b2079539f2.png)

从上图我们可以看到使用Channel可以判断channel当前的状态，可以对其进行参数配置，可以对其进行I/O操作，还有和channel相关的ChannelPipeline用来处理channel关联的IO请求和事件。

使用Channel就可以对NIO的TCP/IP,OIO的TCP/IP,OIO的UDP/IP和本地传输都能提供很好的支持。

传输方式的切换，只需要进行很小的成本替换。

当然，如果你对现有的实现都不满意的话，还可以对核心API进行自定义扩展。

# 事件驱动

netty是一个事件驱动的框架，事件驱动框架的基础就是事件模型，Netty专门为IO定义了一个非常有效的事件模型。可以在不破坏现有代码的情况下实现自己的事件类型。netty中自定义的事件类型通过严格的类型层次结构跟其他事件类型区分开来，所以可扩展性很强。

netty中的事件驱动是由ChannelEvent、ChannelHandler和ChannelPipeline共同作用的结果。其中ChannelEvent表示发生的事件，ChannelHandler定义了如何对事件进行处理，而ChannelPipeline类似一个拦截器，可以让用户自行对定义好的ChannelHandler进行控制，从而达到控制事件处理的结果。

我们看一个简单的自定义Handler：

```
public class MyHandler extends SimpleChannelInboundHandler<Object> {

    @Override
    public void channelRead0(ChannelHandlerContext ctx, Object msg) throws Exception {
        // 对消息进行处理
        ByteBuf in = (ByteBuf) msg;
        try {
            log.info("收到消息:{}",in.toString(io.netty.util.CharsetUtil.US_ASCII));
        }finally {
            ReferenceCountUtil.release(msg);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        //异常处理
        cause.printStackTrace();
        ctx.close();
    }
}
```

上面的例子中，我们定义了如何对接收到的消息和异常进行处理。在后续的文章中我们会详细对ChannelEvent、ChannelHandler和ChannelPipeline之间的交互使用进行介绍。

# 其他优秀的特性

除了上面提到的三大核心特性之外，netty还有其他几个优点，方便程序员的开发工作。

比如对SSL / TLS的支持，对HTTP协议的实现，对WebSockets 实现和Google Protocol Buffers的实现等等，表明netty在各个方面多个场景都有很强的应用能力。

# 总结

netty是由三个核心组件构成：缓冲区、通道和事件模型，通过理解这三个核心组件是如何相互工作的，那么再去理解建立在netty之上的高级功能就不难了。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)






