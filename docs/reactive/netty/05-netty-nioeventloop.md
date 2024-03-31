---
slug: /05-2-netty-nioeventloop
---

# 14. netty系列之:NIO和netty详解



# 简介

netty为什么快呢？这是因为netty底层使用了JAVA的NIO技术，并在其基础上进行了性能的优化，虽然netty不是单纯的JAVA nio，但是netty的底层还是基于的是nio技术。

nio是JDK1.4中引入的，用于区别于传统的IO，所以nio也可以称之为new io。

nio的三大核心是Selector,channel和Buffer，本文我们将会深入探究NIO和netty之间的关系。

# NIO常用用法

在讲解netty中的NIO实现之前，我们先来回顾一下JDK中NIO的selector，channel是怎么工作的。对于NIO来说selector主要用来接受客户端的连接，所以一般用在server端。我们以一个NIO的服务器端和客户端聊天室为例来讲解NIO在JDK中是怎么使用的。

因为是一个简单的聊天室，我们选择Socket协议为基础的ServerSocketChannel,首先就是open这个Server channel:

```
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
serverSocketChannel.bind(new InetSocketAddress("localhost", 9527));
serverSocketChannel.configureBlocking(false);
```

然后向server channel中注册selector:

```
Selector selector = Selector.open();
serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
```

虽然是NIO，但是对于Selector来说，它的select方法是阻塞方法，只有找到匹配的channel之后才会返回，为了多次进行select操作，我们需要在一个while循环里面进行selector的select操作：

```
while (true) {
            selector.select();
            Set<SelectionKey> selectedKeys = selector.selectedKeys();
            Iterator<SelectionKey> iter = selectedKeys.iterator();
            while (iter.hasNext()) {
                SelectionKey selectionKey = iter.next();
                if (selectionKey.isAcceptable()) {
                    register(selector, serverSocketChannel);
                }
                if (selectionKey.isReadable()) {
                    serverResponse(byteBuffer, selectionKey);
                }
                iter.remove();
            }
            Thread.sleep(1000);
        }
```

selector中会有一些SelectionKey,SelectionKey中有一些表示操作状态的OP Status,根据这个OP Status的不同，selectionKey可以有四种状态，分别是isReadable,isWritable,isConnectable和isAcceptable。

当SelectionKey处于isAcceptable状态的时候，表示ServerSocketChannel可以接受连接了，我们需要调用register方法将serverSocketChannel accept生成的socketChannel注册到selector中，以监听它的OP READ状态，后续可以从中读取数据：

```
    private static void register(Selector selector, ServerSocketChannel serverSocketChannel)
            throws IOException {
        SocketChannel socketChannel = serverSocketChannel.accept();
        socketChannel.configureBlocking(false);
        socketChannel.register(selector, SelectionKey.OP_READ);
    }
```

当selectionKey处于isReadable状态的时候，表示可以从socketChannel中读取数据然后进行处理：

```
    private static void serverResponse(ByteBuffer byteBuffer, SelectionKey selectionKey)
            throws IOException {
        SocketChannel socketChannel = (SocketChannel) selectionKey.channel();
        socketChannel.read(byteBuffer);
        byteBuffer.flip();
        byte[] bytes= new byte[byteBuffer.limit()];
        byteBuffer.get(bytes);
        log.info(new String(bytes).trim());
        if(new String(bytes).trim().equals(BYE_BYE)){
            log.info("说再见不如不见！");
            socketChannel.write(ByteBuffer.wrap("再见".getBytes()));
            socketChannel.close();
        }else {
            socketChannel.write(ByteBuffer.wrap("你是个好人".getBytes()));
        }
        byteBuffer.clear();
    }
```

上面的serverResponse方法中，从selectionKey中拿到对应的SocketChannel，然后调用SocketChannel的read方法，将channel中的数据读取到byteBuffer中，要想回复消息到channel中，还是使用同一个socketChannel，然后调用write方法回写消息给client端，到这里一个简单的回写客户端消息的server端就完成了。

接下来就是对应的NIO客户端，在NIO客户端需要使用SocketChannel,首先建立和服务器的连接：

```
socketChannel = SocketChannel.open(new InetSocketAddress("localhost", 9527));
```

然后就可以使用这个channel来发送和接受消息了：

```
    public String sendMessage(String msg) throws IOException {
        byteBuffer = ByteBuffer.wrap(msg.getBytes());
        String response = null;
        socketChannel.write(byteBuffer);
        byteBuffer.clear();
        socketChannel.read(byteBuffer);
        byteBuffer.flip();
        byte[] bytes= new byte[byteBuffer.limit()];
        byteBuffer.get(bytes);
        response =new String(bytes).trim();
        byteBuffer.clear();
        return response;
    }
```

向channel中写入消息可以使用write方法，从channel中读取消息可以使用read方法。

这样一个NIO的客户端就完成了。

虽然以上是NIO的server和client的基本使用，但是基本上涵盖了NIO的所有要点。接下来我们来详细了解一下netty中NIO到底是怎么使用的。

# NIO和EventLoopGroup

以netty的ServerBootstrap为例，启动的时候需要指定它的group,先来看一下ServerBootstrap的group方法：

```
public ServerBootstrap group(EventLoopGroup group) {
        return group(group, group);
    }

public ServerBootstrap group(EventLoopGroup parentGroup, EventLoopGroup childGroup) {
    ...
}
```

ServerBootstrap可以接受一个EventLoopGroup或者两个EventLoopGroup，EventLoopGroup被用来处理所有的event和IO，对于ServerBootstrap来说，可以有两个EventLoopGroup，对于Bootstrap来说只有一个EventLoopGroup。两个EventLoopGroup表示acceptor group和worker group。

EventLoopGroup只是一个接口，我们常用的一个实现就是NioEventLoopGroup,如下所示是一个常用的netty服务器端代码：

```
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
                    .channel(NioServerSocketChannel.class)
                    .childHandler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        public void initChannel(SocketChannel ch) throws Exception {
                            ch.pipeline().addLast(new FirstServerHandler());
                        }
                    })
                    .option(ChannelOption.SO_BACKLOG, 128)
                    .childOption(ChannelOption.SO_KEEPALIVE, true);

            // 绑定端口并开始接收连接
            ChannelFuture f = b.bind(port).sync();
            // 等待server socket关闭
            f.channel().closeFuture().sync();
```

这里和NIO相关的有两个类，分别是NioEventLoopGroup和NioServerSocketChannel，事实上在他们的底层还有两个类似的类分别叫做NioEventLoop和NioSocketChannel，接下来我们分别讲解一些他们的底层实现和逻辑关系。

# NioEventLoopGroup

NioEventLoopGroup和DefaultEventLoopGroup一样都是继承自MultithreadEventLoopGroup：

```
public class NioEventLoopGroup extends MultithreadEventLoopGroup 
```

他们的不同之处在于newChild方法的不同，newChild用来构建Group中的实际对象，NioEventLoopGroup来说，newChild返回的是一个NioEventLoop对象，先来看下NioEventLoopGroup的newChild方法：

```
    protected EventLoop newChild(Executor executor, Object... args) throws Exception {
        SelectorProvider selectorProvider = (SelectorProvider) args[0];
        SelectStrategyFactory selectStrategyFactory = (SelectStrategyFactory) args[1];
        RejectedExecutionHandler rejectedExecutionHandler = (RejectedExecutionHandler) args[2];
        EventLoopTaskQueueFactory taskQueueFactory = null;
        EventLoopTaskQueueFactory tailTaskQueueFactory = null;

        int argsLength = args.length;
        if (argsLength > 3) {
            taskQueueFactory = (EventLoopTaskQueueFactory) args[3];
        }
        if (argsLength > 4) {
            tailTaskQueueFactory = (EventLoopTaskQueueFactory) args[4];
        }
        return new NioEventLoop(this, executor, selectorProvider,
                selectStrategyFactory.newSelectStrategy(),
                rejectedExecutionHandler, taskQueueFactory, tailTaskQueueFactory);
    }
```

这个newChild方法除了固定的executor参数之外，还可以根据NioEventLoopGroup的构造函数传入的参数来实现更多的功能。

这里参数中传入了SelectorProvider、SelectStrategyFactory、RejectedExecutionHandler、taskQueueFactory和tailTaskQueueFactory这几个参数，其中后面的两个EventLoopTaskQueueFactory并不是必须的。

最后所有的参数都会传递给NioEventLoop的构造函数用来构造出一个新的NioEventLoop。

在详细讲解NioEventLoop之前，我们来研读一下传入的这几个参数类型的实际作用。

## SelectorProvider

SelectorProvider是JDK中的类，它提供了一个静态的provider()方法可以从Property或者ServiceLoader中加载对应的SelectorProvider类并实例化。

另外还提供了openDatagramChannel、openPipe、openSelector、openServerSocketChannel和openSocketChannel等实用的NIO操作方法。

## SelectStrategyFactory

SelectStrategyFactory是一个接口，里面只定义了一个方法，用来返回SelectStrategy:

```
public interface SelectStrategyFactory {

    SelectStrategy newSelectStrategy();
}
```

什么是SelectStrategy呢？

先看下SelectStrategy中定义了哪些Strategy:

```
    int SELECT = -1;

    int CONTINUE = -2;

    int BUSY_WAIT = -3;
```

SelectStrategy中定义了3个strategy,分别是SELECT、CONTINUE和BUSY_WAIT。

我们知道一般情况下，在NIO中select操作本身是一个阻塞操作，也就是block操作，这个操作对应的strategy是SELECT,也就是select block状态。

如果我们想跳过这个block，重新进入下一个event loop,那么对应的strategy就是CONTINUE。

BUSY_WAIT是一个特殊的strategy，是指IO 循环轮询新事件而不阻塞,这个strategy只有在epoll模式下才支持，NIO和Kqueue模式并不支持这个strategy。

## RejectedExecutionHandler

RejectedExecutionHandler是netty自己的类，和 java.util.concurrent.RejectedExecutionHandler类似，但是是特别针对SingleThreadEventExecutor来说的。这个接口定义了一个rejected方法，用来表示因为SingleThreadEventExecutor容量限制导致的任务添加失败而被拒绝的情况：

```
void rejected(Runnable task, SingleThreadEventExecutor executor);
```

## EventLoopTaskQueueFactory

EventLoopTaskQueueFactory是一个接口，用来创建存储提交给EventLoop的taskQueue：

```
Queue<Runnable> newTaskQueue(int maxCapacity);
```

这个Queue必须是线程安全的，并且继承自java.util.concurrent.BlockingQueue.

讲解完这几个参数，接下来我们就可以详细查看NioEventLoop的具体NIO实现了。

# NioEventLoop

首先NioEventLoop和DefaultEventLoop一样，都是继承自SingleThreadEventLoop：

```
public final class NioEventLoop extends SingleThreadEventLoop
```

表示的是使用单一线程来执行任务的EventLoop。

首先作为一个NIO的实现，必须要有selector，在NioEventLoop中定义了两个selector，分别是selector和unwrappedSelector：

```
    private Selector selector;
    private Selector unwrappedSelector;
```

在NioEventLoop的构造函数中，他们是这样定义的：

```
        final SelectorTuple selectorTuple = openSelector();
        this.selector = selectorTuple.selector;
        this.unwrappedSelector = selectorTuple.unwrappedSelector;
```

首先调用openSelector方法，然后通过返回的SelectorTuple来获取对应的selector和unwrappedSelector。

这两个selector有什么区别呢？

在openSelector方法中，首先通过调用provider的openSelector方法返回一个Selector，这个Selector就是unwrappedSelector：

```
final Selector unwrappedSelector;
unwrappedSelector = provider.openSelector();
```

然后检查DISABLE_KEY_SET_OPTIMIZATION是否设置，如果没有设置那么unwrappedSelector和selector实际上是同一个Selector：

DISABLE_KEY_SET_OPTIMIZATION表示的是是否对select key set进行优化:

```
if (DISABLE_KEY_SET_OPTIMIZATION) {
      return new SelectorTuple(unwrappedSelector);
   }

        SelectorTuple(Selector unwrappedSelector) {
            this.unwrappedSelector = unwrappedSelector;
            this.selector = unwrappedSelector;
        }
```

如果DISABLE_KEY_SET_OPTIMIZATION被设置为false，那么意味着我们需要对select key set进行优化，具体是怎么进行优化的呢？

先来看下最后的返回：

```
return new SelectorTuple(unwrappedSelector,
                                 new SelectedSelectionKeySetSelector(unwrappedSelector, selectedKeySet));
```

最后返回的SelectorTuple第二个参数就是selector，这里的selector是一个SelectedSelectionKeySetSelector对象。

SelectedSelectionKeySetSelector继承自selector，构造函数传入的第一个参数是一个delegate,所有的Selector中定义的方法都是通过调用
delegate来实现的，不同的是对于select方法来说，会首先调用selectedKeySet的reset方法,下面是以isOpen和select方法为例观察一下代码的实现：

```
    public boolean isOpen() {
        return delegate.isOpen();
    }

    public int select(long timeout) throws IOException {
        selectionKeys.reset();
        return delegate.select(timeout);
    }
```

selectedKeySet是一个SelectedSelectionKeySet对象，是一个set集合，用来存储SelectionKey，在openSelector()方法中，使用new来实例化这个对象：

```
final SelectedSelectionKeySet selectedKeySet = new SelectedSelectionKeySet();
```

netty实际是想用这个SelectedSelectionKeySet类来管理Selector中的selectedKeys，所以接下来netty用了一个高技巧性的对象替换操作。

首先判断系统中有没有sun.nio.ch.SelectorImpl的实现：

```
        Object maybeSelectorImplClass = AccessController.doPrivileged(new PrivilegedAction<Object>() {
            @Override
            public Object run() {
                try {
                    return Class.forName(
                            "sun.nio.ch.SelectorImpl",
                            false,
                            PlatformDependent.getSystemClassLoader());
                } catch (Throwable cause) {
                    return cause;
                }
            }
        });
```

SelectorImpl中有两个Set字段：

```
    private Set<SelectionKey> publicKeys;
    private Set<SelectionKey> publicSelectedKeys;
```

这两个字段就是我们需要替换的对象。如果有SelectorImpl的话，首先使用Unsafe类，调用PlatformDependent中的objectFieldOffset方法拿到这两个字段相对于对象示例的偏移量，然后调用putObject将这两个字段替换成为前面初始化的selectedKeySet对象：

```
Field selectedKeysField = selectorImplClass.getDeclaredField("selectedKeys");
Field publicSelectedKeysField = selectorImplClass.getDeclaredField("publicSelectedKeys");

if (PlatformDependent.javaVersion() >= 9 && PlatformDependent.hasUnsafe()) {
    // Let us try to use sun.misc.Unsafe to replace the SelectionKeySet.
    // This allows us to also do this in Java9+ without any extra flags.
    long selectedKeysFieldOffset = PlatformDependent.objectFieldOffset(selectedKeysField);
    long publicSelectedKeysFieldOffset =
            PlatformDependent.objectFieldOffset(publicSelectedKeysField);

    if (selectedKeysFieldOffset != -1 && publicSelectedKeysFieldOffset != -1) {
        PlatformDependent.putObject(
                unwrappedSelector, selectedKeysFieldOffset, selectedKeySet);
        PlatformDependent.putObject(
                unwrappedSelector, publicSelectedKeysFieldOffset, selectedKeySet);
        return null;
    }
```

如果系统设置不支持Unsafe，那么就用反射再做一次：

```
 Throwable cause = ReflectionUtil.trySetAccessible(selectedKeysField, true);
 if (cause != null) {
     return cause;
 }
 cause = ReflectionUtil.trySetAccessible(publicSelectedKeysField, true);
 if (cause != null) {
     return cause;
 }
 selectedKeysField.set(unwrappedSelector, selectedKeySet);
 publicSelectedKeysField.set(unwrappedSelector, selectedKeySet);
```

在NioEventLoop中我们需要关注的一个非常重要的重写方法就是run方法，在run方法中实现了如何执行task的逻辑。

还记得前面我们提到的selectStrategy吗？run方法通过调用selectStrategy.calculateStrategy返回了select的strategy，然后通过判断
strategy的值来进行对应的处理。

如果strategy是CONTINUE，这跳过这次循环，进入到下一个loop中。

BUSY_WAIT在NIO中是不支持的，如果是SELECT状态，那么会在curDeadlineNanos之后再次进行select操作：

```
strategy = selectStrategy.calculateStrategy(selectNowSupplier, hasTasks());
  switch (strategy) {
  case SelectStrategy.CONTINUE:
      continue;
  case SelectStrategy.BUSY_WAIT:
      // fall-through to SELECT since the busy-wait is not supported with NIO
  case SelectStrategy.SELECT:
      long curDeadlineNanos = nextScheduledTaskDeadlineNanos();
      if (curDeadlineNanos == -1L) {
          curDeadlineNanos = NONE; // nothing on the calendar
      }
      nextWakeupNanos.set(curDeadlineNanos);
      try {
          if (!hasTasks()) {
              strategy = select(curDeadlineNanos);
          }
      } finally {
          // This update is just to help block unnecessary selector wakeups
          // so use of lazySet is ok (no race condition)
          nextWakeupNanos.lazySet(AWAKE);
      }
      // fall through
  default:
```

如果strategy > 0,表示有拿到了SelectedKeys,那么需要调用processSelectedKeys方法对SelectedKeys进行处理：

```
    private void processSelectedKeys() {
        if (selectedKeys != null) {
            processSelectedKeysOptimized();
        } else {
            processSelectedKeysPlain(selector.selectedKeys());
        }
    }
```

上面提到了NioEventLoop中有两个selector，还有一个selectedKeys属性，这个selectedKeys存储的就是Optimized SelectedKeys，如果这个值不为空，就调用processSelectedKeysOptimized方法，否则就调用processSelectedKeysPlain方法。

processSelectedKeysOptimized和processSelectedKeysPlain这两个方法差别不大，只是传入的要处理的selectedKeys不同。

处理的逻辑是首先拿到selectedKeys的key，然后调用它的attachment方法拿到attach的对象：

```
final SelectionKey k = selectedKeys.keys[i];
            selectedKeys.keys[i] = null;

            final Object a = k.attachment();

            if (a instanceof AbstractNioChannel) {
                processSelectedKey(k, (AbstractNioChannel) a);
            } else {
                NioTask<SelectableChannel> task = (NioTask<SelectableChannel>) a;
                processSelectedKey(k, task);
            }
```

如果channel还没有建立连接，那么这个对象可能是一个NioTask,用来处理channelReady和channelUnregistered的事件。

如果channel已经建立好连接了，那么这个对象可能是一个AbstractNioChannel。

针对两种不同的对象，会去分别调用不同的processSelectedKey方法。

对第一种情况，会调用task的channelReady方法：

```
task.channelReady(k.channel(), k);
```

对第二种情况，会根据SelectionKey的readyOps()的各种状态调用ch.unsafe()中的各种方法，去进行read或者close等操作。

# 总结

NioEventLoop虽然也是一个SingleThreadEventLoop,但是通过使用NIO技术，可以更好的利用现有资源实现更好的效率，这也就是为什么我们在项目中使用NioEventLoopGroup而不是DefaultEventLoopGroup的原因。





















