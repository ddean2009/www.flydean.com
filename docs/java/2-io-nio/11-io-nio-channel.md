---
slug: /io-nio-channel
---

# 11. 小师妹学JavaIO之:NIO中Channel的妙用

## 简介

小师妹，你还记得我们使用IO和NIO的初心吗？

小师妹：F师兄，使用IO和NIO不就是为了让生活更美好，世界充满爱吗？让我等程序员可以优雅的将数据从一个地方搬运到另外一个地方。利其器，善其事，才有更多的时间去享受生活呀。

善，如果将数据比做人，IO，NIO的目的就是把人运到美国。

小师妹：F师兄，为什么要运到美国呀，美国现在新冠太严重了，还是待在中国吧。中国是世界上最安全的国家！

好吧，为了保险起见，我们要把人运到上海。人就是数据，怎么运过去呢？可以坐飞机，坐汽车，坐火车，这些什么飞机，汽车，火车就可以看做是一个一个的Buffer。

最后飞机的航线，汽车的公路和火车的轨道就可以看做是一个个的channel。

简单点讲，channel就是负责运送Buffer的通道。

![](https://img-blog.csdnimg.cn/20200520145243522.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

IO按源头来分，可以分为两种，从文件来的File IO，从Stream来的Stream IO。不管哪种IO，都可以通过channel来运送数据。

## Channel的分类

虽然数据的来源只有两种，但是JDK中Channel的分类可不少，如下图所示：

![](https://img-blog.csdnimg.cn/20200514143225602.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

先来看看最基本的，也是最顶层的接口Channel：

~~~java
public interface Channel extends Closeable {
    public boolean isOpen();
    public void close() throws IOException;

}
~~~

最顶层的Channel很简单，继承了Closeable接口，需要实现两个方法isOpen和close。

一个用来判断channel是否打开，一个用来关闭channel。

小师妹：F师兄，顶层的Channel怎么这么简单，完全不符合Channel很复杂的人设啊。

别急，JDK这么做其实也是有道理的，因为是顶层的接口，必须要更加抽象更加通用，结果，一通用就发现还真的就只有这么两个方法是通用的。

所以为了应对这个问题，Channel中定义了很多种不同的类型。

最最底层的Channel有5大类型，分别是：

### FileChannel

这5大channel中，和文件File有关的就是这个FileChannel了。

FileChannel可以从RandomAccessFile, FileInputStream或者FileOutputStream中通过调用getChannel()来得到。

也可以直接调用FileChannel中的open方法传入Path创建。

~~~java
public abstract class FileChannel
    extends AbstractInterruptibleChannel
    implements SeekableByteChannel, GatheringByteChannel, ScatteringByteChannel
~~~

我们看下FileChannel继承或者实现的接口和类。

AbstractInterruptibleChannel实现了InterruptibleChannel接口，interrupt大家都知道吧，用来中断线程执行的利器。来看一下下面一段非常玄妙的代码：

~~~java
protected final void begin() {
        if (interruptor == null) {
            interruptor = new Interruptible() {
                    public void interrupt(Thread target) {
                        synchronized (closeLock) {
                            if (closed)
                                return;
                            closed = true;
                            interrupted = target;
                            try {
                                AbstractInterruptibleChannel.this.implCloseChannel();
                            } catch (IOException x) { }
                        }
                    }};
        }
        blockedOn(interruptor);
        Thread me = Thread.currentThread();
        if (me.isInterrupted())
            interruptor.interrupt(me);
    }
~~~

上面这段代码就是AbstractInterruptibleChannel的核心所在。

首先定义了一个Interruptible的实例，这个实例中有一个interrupt方法，用来关闭Channel。

然后获得当前线程的实例，判断当前线程是否Interrupted，如果是的话，就调用Interruptible的interrupt方法将当前channel关闭。

SeekableByteChannel用来连接Entry或者File。它有一个独特的属性叫做position，表示当前读取的位置。可以被修改。

GatheringByteChannel和ScatteringByteChannel表示可以一次读写一个Buffer序列结合（Buffer Array）：

~~~java
public long write(ByteBuffer[] srcs, int offset, int length)
        throws IOException;
public long read(ByteBuffer[] dsts, int offset, int length)
        throws IOException;
~~~

### Selector和Channel

在讲其他几个Channel之前，我们看一个和下面几个channel相关的Selector：

![](https://img-blog.csdnimg.cn/20200520142919874.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

这里要介绍一个新的Channel类型叫做SelectableChannel，之前的FileChannel的连接是一对一的，也就是说一个channel要对应一个处理的线程。而SelectableChannel则是一对多的，也就是说一个处理线程可以通过Selector来对应处理多个channel。

SelectableChannel通过注册不同的SelectionKey，实现对多个Channel的监听。后面我们会具体的讲解Selector的使用，敬请期待。

### DatagramChannel

DatagramChannel是用来处理UDP的Channel。它自带了Open方法来创建实例。

来看看DatagramChannel的定义：

~~~java
public abstract class DatagramChannel
    extends AbstractSelectableChannel
    implements ByteChannel, ScatteringByteChannel, GatheringByteChannel, MulticastChannel
~~~

ByteChannel表示它同时是ReadableByteChannel也是WritableByteChannel，可以同时写入和读取。

MulticastChannel代表的是一种多播协议。正好和UDP对应。

### SocketChannel

SocketChannel是用来处理TCP的channel。它也是通过Open方法来创建的。

~~~java
public abstract class SocketChannel
    extends AbstractSelectableChannel
    implements ByteChannel, ScatteringByteChannel, GatheringByteChannel, NetworkChannel
~~~

SocketChannel跟DatagramChannel的唯一不同之处就是实现的是NetworkChannel借口。

NetworkChannel提供了一些network socket的操作，比如绑定地址等。

### ServerSocketChannel

ServerSocketChannel也是一个NetworkChannel，它主要用在服务器端的监听。

~~~java
public abstract class ServerSocketChannel
    extends AbstractSelectableChannel
    implements NetworkChannel
~~~

### AsynchronousSocketChannel

最后AsynchronousSocketChannel是一种异步的Channel：

~~~java
public abstract class AsynchronousSocketChannel
    implements AsynchronousByteChannel, NetworkChannel
~~~

为什么是异步呢？我们看一个方法：

~~~java
public abstract Future<Integer> read(ByteBuffer dst);
~~~

可以看到返回值是一个Future，所以read方法可以立刻返回，只在我们需要的时候从Future中取值即可。

## 使用Channel

小师妹：F师兄，讲了这么多种类的Channel，看得我眼花缭乱，能不能讲一个Channel的具体例子呢？

好的小师妹，我们现在讲一个使用Channel进行文件拷贝的例子，虽然Channel提供了transferTo的方法可以非常简单的进行拷贝，但是为了能够看清楚Channel的通用使用，我们选择一个更加常规的例子：

~~~java
public void useChannelCopy() throws IOException {
        FileInputStream input = new FileInputStream ("src/main/resources/www.flydean.com");
        FileOutputStream output = new FileOutputStream ("src/main/resources/www.flydean.com.txt");
        try(ReadableByteChannel source = input.getChannel(); WritableByteChannel dest = output.getChannel()){
            ByteBuffer buffer = ByteBuffer.allocateDirect(1024);
            while (source.read(buffer) != -1)
            {
                // flip buffer,准备写入
                buffer.flip();
                // 查看是否有更多的内容
                while (buffer.hasRemaining())
                {
                    dest.write(buffer);
                }
                // clear buffer，供下一次使用
                buffer.clear();
            }
        }
    }
~~~

上面的例子中我们从InputStream中读取Buffer，然后写入到FileOutputStream。

## 总结

今天讲解了Channel的具体分类，和一个简单的例子，后面我们会再体验一下Channel的其他例子，敬请期待。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！





