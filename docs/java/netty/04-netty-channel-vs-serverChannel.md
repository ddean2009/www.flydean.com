---
slug: /04-2-netty-channel-vs-serverChannel
---

# 8. netty系列之:channel,ServerChannel和netty中的实现



# 简介

我们知道channel是netty中用于沟通ByteBuf和Event的桥梁，在netty服务的创建过程中，不管是客户端的Bootstrap还是服务器端的ServerBootstrap，都需要调用channel方法来指定对应的channel类型。

那么netty中channel到底有哪些类型呢？他们具体是如何工作的呢？一起来看看。

# channel和ServerChannel

Channel在netty中是一个interface，在Channel中定义了很多非常有用的方法。通常来说如果是客户端的话，对应的channel就是普通的channel。如果是服务器端的话，对应的channel就应该是ServerChannel。

那么客户端channel和服务器端channel有什么区别呢？我们先来看下ServerChannel的定义：

```
public interface ServerChannel extends Channel {
    // This is a tag interface.
}
```

可以看到ServerChannel继承自Channel，表示服务端的Channel也是Channel的一种。

但是很奇怪的是，你可以看到ServerChannel中并没有新增任何新的方法。也就是说ServerChannel和Channel在定义上本质是一样的。你可以把ServerChannel看做是一个tag interface而已。

那么channel和ServerChannel有什么联系呢？

我们知道在Channel中定义了一个parent方法：

```
Channel parent();
```

这个parent方法返回的是该channel的父channel。我们以最简单的LocalChannel和LocalServerChannel为例，来查看一下他们的父子关系到底是怎么创建的。

首先parent的值是通过LocalChannel和LocalServerChannel的公共父类AbstractChannel来实现的：

```
    protected AbstractChannel(Channel parent) {
        this.parent = parent;
        id = newId();
        unsafe = newUnsafe();
        pipeline = newChannelPipeline();
    }
```

对于LocalChannel来说，可以通过它的构造函数来设置parent channel：

```
    protected LocalChannel(LocalServerChannel parent, LocalChannel peer) {
        super(parent);
        config().setAllocator(new PreferHeapByteBufAllocator(config.getAllocator()));
        this.peer = peer;
        localAddress = parent.localAddress();
        remoteAddress = peer.localAddress();
    }
```

我们知道当client端想要连接到server端的时候，需要调用client channel的connect方法，对于LocalChannel来说，它的connect方法实际上调用的是pipeline的connect方法：

```
public ChannelFuture connect(SocketAddress remoteAddress) {
        return pipeline.connect(remoteAddress);
    }
```

最终会调用LocalChannel中的LocalUnsafe.connect方法。

而在LocalUnsafe.connect方法中又会调用serverChannel.serve方法。

serverChannel的newLocalChannel方法会创建新的LocalChannel并返回：

```
    protected LocalChannel newLocalChannel(LocalChannel peer) {
        return new LocalChannel(this, peer);
    }
```

这里使用newLocalChannel方法创建的LocalChannel就是serverChannel的子channel。

最后返回的LocalChannel会作为client端LocalChannel的peer channel而存在。

# netty中channel的实现

在netty中channel和Serverchannel有很多个实现类，用来完成不同的业务功能。

为了循序渐进一步步了解netty中channel的秘密，这里我们先来探讨一下netty中channel的基本实现LocalChannel和LocalServerChannel的工作原理。

下图是LocalChannel和LocalServerChannel的主要继承和依赖关系：

<img src="https://img-blog.csdnimg.cn/1d9c19d567084c199dfade76c8a0d52a.png" style="zoom:67%;" />

从图中可以看到，LocalChannel继承自AbstractChannel而LocalServerChannel则继承自AbstractServerChannel。

因为ServerChannel继承自Channel,所以很自然的AbstractServerChannel又继承自AbstractChannel。

接下来，我们通过对比分析AbstractChannel和AbstractServerChannel，LocalChannel和LocalServerChannel来一探netty中channel实现的底层原理。

## AbstractChannel和AbstractServerChannel

AbstractChannel是对Channel的最基本的实现。先来看下AbstractChannel中都有那些功能。

首先AbstractChannel中定义了Channel接口中要返回的一些和channel相关的基本属性,包括父channel，channel id,pipline,localAddress,remoteAddress,eventLoop等,如下所示：

```
    private final Channel parent;
    private final ChannelId id;
    private final DefaultChannelPipeline pipeline;
    private volatile SocketAddress localAddress;
    private volatile SocketAddress remoteAddress;
    private volatile EventLoop eventLoop;

    private final Unsafe unsafe;
```

要注意的是AbstractChannel中还有一个非常中要的Unsafe属性。

Unsafe本身就是Channel接口中定义的一个内部接口,它的作用就是为各个不同类型的transport提供特定的实现。

从名字可以看出Unsafe是一个不安全的实现，它只是在netty的源代码中使用，它是不能出现在用户代码中的。或者你可以将Unsafe看做是底层的实现，而包裹他的AbstractChannel或者其他的Channel是对底层实现的封装，对于普通用户来说，他们只需要使用Channel就可以了，并不需要深入到更底层的内容。

另外，对于Unsafe来说，除了下面几个方法之外，剩余的方法必须从 I/O thread中调用：

```
localAddress()
remoteAddress()
closeForcibly()
register(EventLoop, ChannelPromise)
deregister(ChannelPromise)
voidPromise()
```

和一些基本的状态相关的数据：

```
private volatile boolean registered;
private boolean closeInitiated;
```

除了基本的属性设置和读取之外，我们channel中最终要的方法主要有下面几个：

1. 用于建立服务器端服务的bind方法：

```
public ChannelFuture bind(SocketAddress localAddress) {
        return pipeline.bind(localAddress);
    }
```

2. 用于客户端建立和服务器端连接的connect方法：

```
public ChannelFuture connect(SocketAddress remoteAddress) {
        return pipeline.connect(remoteAddress);
    }
```

3. 断开连接的disconnect方法：

```
public ChannelFuture disconnect() {
        return pipeline.disconnect();
    }
```

4. 关闭channel的close方法：

```
public ChannelFuture close() {
        return pipeline.close();
    }
```

5. 取消注册的deregister方法：

```
public ChannelFuture deregister() {
        return pipeline.deregister();
    }
```

6. 刷新数据的flush方法：

```
    public Channel flush() {
        pipeline.flush();
        return this;
    }
```

7. 读取数据的read方法：

```
    public Channel read() {
        pipeline.read();
        return this;
    }
```

8. 写入数据的方法：

```
    public ChannelFuture write(Object msg) {
        return pipeline.write(msg);
    }
```

可以看到这些channel中的读写和绑定工作都是由和channel相关的pipeline来执行的。

其实也很好理解，channel只是一个通道，和数据相关的操作，还是需要在管道中执行。

我们以bind方法为例子，看一下AbstractChannel中的pipline是怎么实现的。

在AbstractChannel中，默认的pipeline是DefaultChannelPipeline,它的bind方法如下：

```
        public void bind(
                ChannelHandlerContext ctx, SocketAddress localAddress, ChannelPromise promise) {
            unsafe.bind(localAddress, promise);
        }
```

这里的unsafe实际上就是AbstractChannel中的unsafe，unsafe中的bind方法最终会调用AbstractChannel中的dobind方法：

```
protected abstract void doBind(SocketAddress localAddress) throws Exception;
```

所以归根到底，如果是基于AbstractChannel的各种实现，那么只需要实现它的这些do*方法即可。

好了，AbstractChannel的介绍完毕了。 我们再来看一下AbstractServerChannel。AbstractServerChannel继承自AbstractChannel并且实现了ServerChannel接口。

```
public abstract class AbstractServerChannel extends AbstractChannel implements ServerChannel 
```

我们知道ServerChannel和Channel实际上是相同的，所以AbstractServerChannel只是在AbstractChannel的实现上进行了一些调整。

在AbstractServerChannel中，我们一起来观察一下AbstractServerChannel和AbstractChannel到底有什么不同。

首先是AbstractServerChannel的构造函数：

```
protected AbstractServerChannel() {
        super(null);
    }
```

构造函数中，super的parent channel是null，表示ServerChannel本身并不存在父channel，这是ServerChannel和client channel
的第一个不同之处。因为server channel可以通过worker event loop来接受client channel，所以server channel是client channel的父channel。

另外，我们还观察几个方法的实现:

```
public SocketAddress remoteAddress() {
        return null;
    }
```

对于ServerChannel来说不需要主动连接到远程的Server，所以并没有remoteAddress。

另外，因为断开连接是由client端主动调用的，所以server channel的doDisconnect会抛出不支持该操作的异常：

```
    protected void doDisconnect() throws Exception {
        throw new UnsupportedOperationException();
    }
```

同时ServerChannel只是用来负责accept和client channel建立关联关系，所以server channel本身并不支持向channel内进行的write操作,所以这个doWrite方法也是不支持的：

```
    protected void doWrite(ChannelOutboundBuffer in) throws Exception {
        throw new UnsupportedOperationException();
    }
```

最后ServerChannel只支持bind操作，所以DefaultServerUnsafe中的connect方法也会抛出UnsupportedOperationException.

## LocalChannel和LocalServerChannel

LocalChannel和LocalServerChannel是AbstractChannel和AbstractServerChannel的最基本的实现。从名字就可以看出来，这两个Channel是本地channel，我们来看一下这两个Channel的具体实现。

首先我们来看一下LocalChannel，LocalChannel有几点对AbstractChannel的扩展。

第一个扩展点是LocalChannel中添加了channel的几个状态：

```
private enum State { OPEN, BOUND, CONNECTED, CLOSED }
```

通过不同的状态，可以对channel进行更加细粒度的控制。

另外LocalChannel中添加了一个非常重要的属性：

```
private volatile LocalChannel peer;
```

因为LocalChannel表示的是客户端channel，所以这个peer表示的是client channel对等的server channel。接下来我们看一下具体的实现。

首先是LocalChannel的构造函数:

```
    protected LocalChannel(LocalServerChannel parent, LocalChannel peer) {
        super(parent);
        config().setAllocator(new PreferHeapByteBufAllocator(config.getAllocator()));
        this.peer = peer;
        localAddress = parent.localAddress();
        remoteAddress = peer.localAddress();
    }
```

LocalChannel可以接受一个LocalServerChannel作为它的parent，还有一个LocalChannel作为它的对等channel。

那么这个peer是怎么创建的呢？

我们来看一下LocalUnsafe中connect的逻辑。

```
            if (state != State.BOUND) {
                // Not bound yet and no localAddress specified - get one.
                if (localAddress == null) {
                    localAddress = new LocalAddress(LocalChannel.this);
                }
            }

            if (localAddress != null) {
                try {
                    doBind(localAddress);
                } catch (Throwable t) {
                    safeSetFailure(promise, t);
                    close(voidPromise());
                    return;
                }
            }
```

首先判断当前channel的状态，如果是非绑定状态，那么需要进行绑定操作。首先根据传入的LocalChannel创建对应的LocalAddress。

这个LocalAddress只是LocalChannel的一种表现形式，并没有什么特别的功能。

我们来看一下这个doBind方法：

```
    protected void doBind(SocketAddress localAddress) throws Exception {
        this.localAddress =
                LocalChannelRegistry.register(this, this.localAddress,
                        localAddress);
        state = State.BOUND;
    }
```

LocalChannelRegistry中维护了一个static的map，这个map中存放的就是注册过的Channel.

这里注册是为了在后面方便的拿到对应的channel。

注册好localChannel之后，接下来就是根据注册好的remoteAddress来获取对应的LocalServerChannel,最后调用LocalServerChannel的serve方法创建一个新的peer channel：

```
Channel boundChannel = LocalChannelRegistry.get(remoteAddress);
            if (!(boundChannel instanceof LocalServerChannel)) {
                Exception cause = new ConnectException("connection refused: " + remoteAddress);
                safeSetFailure(promise, cause);
                close(voidPromise());
                return;
            }

            LocalServerChannel serverChannel = (LocalServerChannel) boundChannel;
            peer = serverChannel.serve(LocalChannel.this);
```

serve方法首先会创建一个新的LocalChannel：

```
    protected LocalChannel newLocalChannel(LocalChannel peer) {
        return new LocalChannel(this, peer);
    }
```

如果我们把之前的Localchannel称为channelA，这里创建的新的LocalChannel称为channelB。那么最后的结果就是channelA的peer是channelB，而channelB的parent是LocalServerChannel，channelB的peer是channelA。

这样就构成了一个对等channel之间的关系。

接下来我们看下localChannel的read和write到底是怎么工作的。

首先看一下LocalChannel的doWrite方法：

```
Object msg = in.current();
...
peer.inboundBuffer.add(ReferenceCountUtil.retain(msg));
in.remove();
...
finishPeerRead(peer);
```

首先从ChannelOutboundBuffer拿到要写入的msg，将其加入peer的inboundBuffer中，最后调用finishPeerRead方法。

从方法名字可以看出finishPeerRead就是调用peer的read方法。

事实上该方法会调用peer的readInbound方法，从刚刚写入的inboundBuffer中读取消息：

```
    private void readInbound() {
        RecvByteBufAllocator.Handle handle = unsafe().recvBufAllocHandle();
        handle.reset(config());
        ChannelPipeline pipeline = pipeline();
        do {
            Object received = inboundBuffer.poll();
            if (received == null) {
                break;
            }
            pipeline.fireChannelRead(received);
        } while (handle.continueReading());

        pipeline.fireChannelReadComplete();
    }
```

所以，对于localChannel来说，它的写实际上写入到peer的inboundBuffer中。然后再调用peer的读方法，从inboundBuffer中读取数据。

相较于localChannel来说，localServerChannel多了一个serve方法，用来创建peer channel,并调用readInbound开始从inboundBuffer中读取数据。

# 总结

本章详细介绍了channel和serverChannel的区别，和他们的最简单的本地实现。希望大家对channel和serverChannel的工作原理有了最基本的了解。











