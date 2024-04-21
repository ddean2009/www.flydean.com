---
slug: /10-netty-chat
---

# 20. netty系列之:文本聊天室



# 简介

经过之前的系列文章，我们已经知道了netty的运行原理，还介绍了基本的netty服务搭建流程和消息处理器的写法。今天本文会给大家介绍一个更加复杂的例子，文本聊天室。

# 聊天室的工作流程

今天要介绍的是文本聊天室，对于文本聊天室来说，首先需要建立一个服务器，用于处理各个客户端的连接，对于客户端来说，需要建立和服务器的连接，然后向服务器输入聊天信息。服务器收到聊天信息之后，会对消息进行响应，并将消息返回至客户端，这样一个聊天室的流程就完成了。 

# 文本处理器

之前的文章中，我们有提到过，netty的传输只支持ByteBuf类型，对于聊天室直接输入的字符串是不支持的，需要对字符串进行encode和decode转换。

之前我们介绍的encode和decode的类叫做ObjectDecoder和ObjectEncoder。今天我们再介绍两个专门处理字符串的StringDecoder和StringEncoder。

StringEncoder要比ObjectEncoder简单很多，因为对于对象来说，我们还需要在Byte数组的头部设置Byte数组的大小，从而保证对象所有数据读取正确。对于String来说，就比较简单了，只需要保证一次读入的数据都是字符串即可。

StringEncoder继承自MessageToMessageEncoder，其核心的encode代码如下：

```
    protected void encode(ChannelHandlerContext ctx, CharSequence msg, List<Object> out) throws Exception {
        if (msg.length() == 0) {
            return;
        }

        out.add(ByteBufUtil.encodeString(ctx.alloc(), CharBuffer.wrap(msg), charset));
    }
```

从上面的代码可以看出，核心实际上是调用了ByteBufUtil.encodeString方法，将String转换成了ByteBuf。

对于字符串编码来说，还需要界定一个编码的范围，比如我们需要知道需要一次编码多少字符串，一般来说我们通过回车符来界定一次字符串输入的结束。

netty也提供了这样的非常便利的类叫做DelimiterBasedFrameDecoder，通过传入不同的Delimiter,我们可以将输入拆分成不同的Frame,从而对一行字符串进行处理。

```
new DelimiterBasedFrameDecoder(8192, Delimiters.lineDelimiter()))

```

我再看一下StringDecoder的核心代码，StringDecoder继承自MessageToMessageDecoder：

```
    protected void decode(ChannelHandlerContext ctx, ByteBuf msg, List<Object> out) throws Exception {
        out.add(msg.toString(charset));
    }
```

通过调用ByteBuf的toString方法，将BuyteBuf转换成为字符串，并且输出到channel中。

# 初始化ChannelHandler

在initChannel的时候，我们需要向ChannelPipeline中添加有效的Handler。对于本例来说，需要添加StringDecoder、StringEncoder、DelimiterBasedFrameDecoder和真正处理消息的自定义handler。

我们将初始化Pipeline的操作都放在一个新的ChatServerInitializer类中，这个类继承自ChannelInitializer，其核心的initChannel方法如下：

```
    public void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline pipeline = ch.pipeline();
        // 添加行分割器
        pipeline.addLast(new DelimiterBasedFrameDecoder(8192, Delimiters.lineDelimiter()));
        // 添加String Decoder和String Encoder,用来进行字符串的转换
        pipeline.addLast(DECODER);
        pipeline.addLast(ENCODER);
        // 最后添加真正的处理器
        pipeline.addLast(SERVER_HANDLER);
    }
```

ChatServerInitializer在Bootstrap中的childHandler中进行添加：

```
childHandler(new ChatServerInitializer())
```

# 真正的消息处理逻辑

有了上面的逻辑之后，我们最后只需要专注于真正的消息处理逻辑即可。

这里我们的逻辑是当客户端输入“再见”的时候，就关闭channel，否则就将消息回写给客户端。

其核心逻辑如下：

```
 public void channelRead0(ChannelHandlerContext ctx, String request) throws Exception {
        // 如果读取到"再见"就关闭channel
        String response;
        // 判断是否关闭
        boolean close = false;
        if (request.isEmpty()) {
            response = "你说啥?\r\n";
        } else if ("再见".equalsIgnoreCase(request)) {
            response = "再见,我的朋友!\r\n";
            close = true;
        } else {
            response = "你是不是说: '" + request + "'?\r\n";
        }

        // 写入消息
        ChannelFuture future = ctx.write(response);
        // 添加CLOSE listener，用来关闭channel
        if (close) {
            future.addListener(ChannelFutureListener.CLOSE);
        }
    }
```

通过判断客户端的出入，来设置是否关闭按钮，这里的关闭channel是通过向ChannelFuture中添加ChannelFutureListener.CLOSE来实现的。

ChannelFutureListener.CLOSE是一个ChannelFutureListener，它会在channel执行完毕之后关闭channel，事实上这是一个非常优雅的关闭方式。

```
    ChannelFutureListener CLOSE = new ChannelFutureListener() {
        @Override
        public void operationComplete(ChannelFuture future) {
            future.channel().close();
        }
    };
```

对于客户端来说，其核心就是从命令行读取输入，这里使用InputStreamReader接收命令行输入，并使用BufferedReader对其缓存。

然后将命令行输入通过调用 ch.writeAndFlush写入到channel中，最后监听命令行输入，如果监听到“再见“，则等待server端关闭channel，其核心代码如下。

```
// 从命令行输入
            ChannelFuture lastWriteFuture = null;
            BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
            for (;;) {
                String line = in.readLine();
                if (line == null) {
                    break;
                }
                // 将从命令行输入的一行字符写到channel中
                lastWriteFuture = ch.writeAndFlush(line + "\r\n");
                // 如果输入'再见'，则等待server端关闭channel
                if ("再见".equalsIgnoreCase(line)) {
                    ch.closeFuture().sync();
                    break;
                }
            }

            // 等待所有的消息都写入channel中
            if (lastWriteFuture != null) {
                lastWriteFuture.sync();
            }
```

# 总结

经过上面的介绍，一个简单的聊天室就建成了。后续我们会继续探索更加复杂的应用，希望大家能够喜欢。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)





