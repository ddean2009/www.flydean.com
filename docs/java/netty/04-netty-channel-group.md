---
slug: /04-1-netty-channel-group
---

# 6. netty系列之:channel和channelGroup



# 简介

channel是netty中数据传输和数据处理的渠道，也是netty程序中不可或缺的一环。在netty中channel是一个接口，针对不同的数据类型或者协议channel会有具体的不同实现。

虽然channel很重要，但是在代码中确实很神秘，基本上我们很少能够看到直接使用channel的情况，那么事实真的如此吗？和channel相关的ChannelGroup又有什么作用呢？一起来看看吧。

# 神龙见首不见尾的channel

其实netty的代码是有固定的模板的，首先根据是server端还是client端，然后创建对应的Bootstrap和ServerBootstrap。然后给这个Bootstrap配置对应的group方法。然后为Bootstrap配置channel和handler,最后启动Bootstrap即可。

这样一个标准的netty程序就完成了。你需要做的就是为其挑选合适的group、channel和handler。

我们先看一个最简单的NioServerSocketChannel的情况：

```
EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new ChatServerInitializer());

            b.bind(PORT).sync().channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
```

这里，我们将NioServerSocketChannel设置为ServerBootstrap的channel。

这样就完了吗？channel到底是在哪里用到的呢？

别急，我们仔细看一下try block中的最后一句：

```
b.bind(PORT).sync().channel().closeFuture().sync();
```

b.bind(PORT).sync()实际上返回了一个ChannelFuture对象，通过调用它的channel方法，就返回了和它关联的Channel对象。

然后我们调用了channel.closeFuture()方法。closeFuture方法会返回一个ChannelFuture对象，这个对象将会在channel关闭的时候收到通知。

而sync方法会实现同步阻塞，一直等到channel关闭为止，从而进行后续的eventGroup的shutdown操作。

在ServerBootstrap中构建模板中，channel其实有两个作用，第一个作用是指定ServerBootstrap的channel，第二个作用就是通过channel获取到channel关闭的事件，最终关闭整个netty程序。

虽然我们基本上看不到channel的直接方法调用，但是channel毋庸置疑，它就是netty的灵魂。

接下来我们再看一下具体消息处理的handler的基本操作：

```
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // channel活跃
        ctx.write("Channel Active状态!\r\n");
        ctx.flush();
    }
```

通常如果需要在handler中向channel写入数据，我们调用的是ChannelHandlerContext的write方法。这个方法和channel有什么关系呢？

首先write方法是ChannelOutboundInvoker接口中的方法，而ChannelHandlerContext和Channel都继承了ChannelOutboundInvoker接口，也就是说，ChannelHandlerContext和Channel都有write方法：

```
ChannelFuture write(Object msg);
```

因为这里我们使用的是NioServerSocketChannel，所以我们来具体看一下NioServerSocketChannel中write的实现。

经过检查代码我们会发现NioServerSocketChannel继承自AbstractNioMessageChannel,AbstractNioMessageChannel继承自AbstractNioChannel，AbstractNioChannel继承自AbstractChannel,而这个write方法就是AbstractChannel中实现的：

```
    public ChannelFuture write(Object msg) {
        return pipeline.write(msg);
    }
```

Channel的write方法，实际上调用了pipeline的write方法。下面是pipeLine中的write方法：

```
    public final ChannelFuture write(Object msg) {
        return tail.write(msg);
    }
```

这里的tail是一个AbstractChannelHandlerContext对象。

这样我们就得出了这样的结论：channel中的write方法最终实际上调用的是ChannelHandlerContext中的write方法。

所以上面的：

```
ctx.write("Channel Active状态!\r\n");
```

实际上可以直接从channel中调用：

```
Channel ch = b.bind(0).sync().channel();

// 将消息写入channel中
ch.writeAndFlush("Channel Active状态!\r\n").sync();
```

# channel和channelGroup

channel是netty的灵魂，对于Bootstrap来说，要获取到对应的channel，可以通过调用：

```
b.bind(PORT).sync().channel()
```

来得到，从上面代码中我们也可以看到一个Bootstrap只会对应一个channel。

> channel中有一个parent()方法，用来返回它的父channel，所以channel是有层级结构的，

我们再来看一下channelGroup的定义：

```
public interface ChannelGroup extends Set<Channel>, Comparable<ChannelGroup> 
```

可以看到ChannelGroup实际上是Channel的集合。ChannelGroup用来将类似的Channel构建成集合，从而可以对多个channel进行统一的管理。

可以能有小伙伴要问了，一个Bootstrap不是只对应一个channel吗？那么哪里来的channel的集合？

事实上，在一些复杂的程序中，我们可能启动多个Bootstrap来处理不同的业务，所以相应的就会有多个channel。

如果创建的channel过多，并且这些channel又是很同质化的时候，就有需求对这些channel进行统一管理。这时候就需要用到channelGroup了。

## channelGroup的基本使用

先看下channelGroup的基本使用，首先是创建一个channelGroup：

```
ChannelGroup recipients =
           new DefaultChannelGroup(GlobalEventExecutor.INSTANCE);
```

有了channelGroup之后，可以调用add方法，向其中添加不同的channel：

```
   recipients.add(channelA);
   recipients.add(channelB);
```

并且还可以统一向这些channel中发送消息：

```
recipients.write(Unpooled.copiedBuffer(
           "这是从channelGroup中发出的统一消息.",
           CharsetUtil.UTF_8));
```

基本上channelGroup提供了write，flush，flushAndWrite,writeAndFlush,disconnect,close,newCloseFuture等功能，用于对集合中的channel进行统一管理。

如果你有多个channel，那么可以考虑使用channelGroup。

另外channelGroup还有一些特性，我们来详细了解一下。

## 将关闭的channel自动移出

ChannelGroup是一个channel的集合，当然我们只希望保存open状态的channel，如果是close状态的channel，还要手动从ChannelGroup中移出的话实在是太麻烦了。

所以在ChannelGroup中，如果一个channel被关闭了，那么它会自动从ChannelGroup中移出，这个功能是怎么实现的呢？

先来看下channelGroup的add方法：

```
   public boolean add(Channel channel) {
        ConcurrentMap<ChannelId, Channel> map =
            channel instanceof ServerChannel? serverChannels : nonServerChannels;

        boolean added = map.putIfAbsent(channel.id(), channel) == null;
        if (added) {
            channel.closeFuture().addListener(remover);
        }

        if (stayClosed && closed) {
            channel.close();
        }

        return added;
    }
```

可以看到，在add方法中，为channel区分了是server channel还是非server channel。然后根据channel id将其存入ConcurrentMap中。

如果添加成功，则给channel添加了一个closeFuture的回调。当channel被关闭的时候，会去调用这个remover方法：

```
private final ChannelFutureListener remover = new ChannelFutureListener() {
        @Override
        public void operationComplete(ChannelFuture future) throws Exception {
            remove(future.channel());
        }
    };
```

remover方法会将channel从serverChannels或者nonServerChannels中移出。从而保证ChannelGroup中只保存open状态的channel。

## 同时关闭serverChannel和acceptedChannel

虽然 ServerBootstrap的bind方法只会返回一个channel，但是对于server来说，可以有多个worker EventLoopGroup,所以当客户端和服务器端建立连接之后建立的accepted Channel是server channel的子channel。

也就是说一个服务器端有一个server channel和多个accepted channel。

那么如果我们想要同时关闭这些channel的话， 就可以使用ChannelGroup的close方法。

因为如果Server channel和非Server channel在同一个ChannelGroup的话，所有的IO命令都会先发给server channel，然后才会发给非server channel。

所以我们可以将Server channel和非Server channel统统加入同一个ChannelGroup中，在程序的最后，统一调用ChannelGroup的close方法，从而达到该目的：

```
   ChannelGroup allChannels =
           new DefaultChannelGroup(GlobalEventExecutor.INSTANCE);
  
   public static void main(String[] args) throws Exception {
       ServerBootstrap b = new ServerBootstrap(..);
       ...
       b.childHandler(new MyHandler());
  
       // 启动服务器
       b.getPipeline().addLast("handler", new MyHandler());
       Channel serverChannel = b.bind(..).sync();
       allChannels.add(serverChannel);
  
       ... 等待shutdown指令 ...
  
       // 关闭serverChannel 和所有的 accepted connections.
       allChannels.close().awaitUninterruptibly();
   }
  
   public class MyHandler extends ChannelInboundHandlerAdapter {
        @Override
       public void channelActive(ChannelHandlerContext ctx) {
           // 将accepted channel添加到allChannels中
           allChannels.add(ctx.channel());
           super.channelActive(ctx);
       }
   }
```

## ChannelGroupFuture

另外，和channel一样，channelGroup的操作都是异步的，它会返回一个ChannelGroupFuture对象。

我们看下ChannelGroupFuture的定义：

```
public interface ChannelGroupFuture extends Future<Void>, Iterable<ChannelFuture>
```

可以看到ChannelGroupFuture是一个Future，同时它也是一个ChannelFuture的遍历器，可以遍历ChannelGroup中所有channel返回的ChannelFuture。

同时ChannelGroupFuture提供了isSuccess，isPartialSuccess,isPartialFailure等方法判断命令是否部分成功。

ChannelGroupFuture还提供了addListener方法用来监听具体的事件。

# 总结

channel是netty的核心，当我们有多个channel不便进行管理的时候，就可以使用channelGroup进行统一管理。

