小师妹学JavaIO之:用Selector来说再见

## 简介

NIO有三宝:Buffer,Channel，Selector少不了。本文将会介绍NIO三件套中的最后一套Selector，并在理解Selector的基础上，协助小师妹发一张好人卡。我们开始吧。

## Selector介绍

小师妹：F师兄，最近我的桃花有点旺，好几个师兄莫名其妙的跟我打招呼，可是我一心向着工作，不想谈论这些事情。毕竟先有事业才有家嘛。我又不好直接拒绝，有没有什么比较隐晦的方法来让他们放弃这个想法？

> 更多内容请访问[www.flydean.com](www.flydean.com)

这个问题，我沉思了大约0.001秒，于是给出了答案：给他们发张好人卡吧，应该就不会再来纠缠你了。

小师妹：F师兄，如果给他们发完好人卡还没有用呢？

那就只能切断跟他们的联系了，来个一刀两断。哈哈。

这样吧，小师妹你最近不是在学NIO吗？刚好我们可以用Selector来模拟一下发好人卡的过程。

假如你的志伟师兄和子丹师兄想跟你建立联系，每个人都想跟你建立一个沟通通道，那么你就需要创建两个channel。

两个channel其实还好，如果有多个人都想同时跟你建立联系通道，那么要维持这些通道就需要保持连接，从而浪费了资源。

但是建立的这些连接并不是时时刻刻都有消息在传输，所以其实大多数时间这些建立联系的通道其实是浪费的。

如果使用Selector就可以只启用一个线程来监听通道的消息变动，这就是Selector。

![](https://img-blog.csdnimg.cn/20200520142919874.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

从上面的图可以看出，Selector监听三个不同的channel，然后交给一个processor来处理，从而节约了资源。

## 创建Selector

先看下selector的定义：

~~~java
public abstract class Selector implements Closeable
~~~

Selector是一个abstract类，并且实现了Closeable，表示Selector是可以被关闭的。

虽然Selector是一个abstract类，但是可以通过open来简单的创建：

~~~java
Selector selector = Selector.open();
~~~ 

如果细看open的实现可以发现一个很有趣的现象：

~~~java
public static Selector open() throws IOException {
        return SelectorProvider.provider().openSelector();
    }
~~~

open方法调用的是SelectorProvider中的openSelector方法。

再看下provider的实现：

~~~java
 public SelectorProvider run() {
   if (loadProviderFromProperty())
        return provider;
    if (loadProviderAsService())
        return provider;
      provider = sun.nio.ch.DefaultSelectorProvider.create();
      return provider;
    }
 });
~~~

有三种情况可以加载一个SelectorProvider，如果系统属性指定了java.nio.channels.spi.SelectorProvider，那么从指定的属性加载。

如果没有直接指定属性，则从ServiceLoader来加载。

最后如果都找不到的情况下，使用默认的DefaultSelectorProvider。

关于ServiceLoader的用法，我们后面会有专门的文章来讲述。这里先不做多的解释。

## 注册Selector到Channel中

~~~java
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        serverSocketChannel.bind(new InetSocketAddress("localhost", 9527));
        serverSocketChannel.configureBlocking(false);
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
~~~

如果是在服务器端，我们需要先创建一个ServerSocketChannel，绑定Server的地址和端口，然后将Blocking设置为false。因为我们使用了Selector，它实际上是一个非阻塞的IO。

> 注意FileChannels是不能使用Selector的，因为它是一个阻塞型IO。

小师妹：F师兄，为啥FileChannel是阻塞型的呀？做成非阻塞型的不是更快？

小师妹，我们使用FileChannel的目的是什么？就是为了读文件呀，读取文件肯定是一直读一直读，没有可能读一会这个channel再读另外一个channel吧，因为对于每个channel自己来讲，在文件没读取完之前，都是繁忙状态，没有必要在channel中切换。

最后我们将创建好的Selector注册到channel中去。

## SelectionKey

SelectionKey表示的是我们希望监听到的事件。

总的来说，有4种Event：

* SelectionKey.OP_READ 表示服务器准备好，可以从channel中读取数据。
* SelectionKey.OP_WRITE 表示服务器准备好，可以向channel中写入数据。
* SelectionKey.OP_CONNECT 表示客户端尝试去连接服务端
* SelectionKey.OP_ACCEPT 表示服务器accept一个客户端的请求

~~~java
public static final int OP_READ = 1 << 0;
public static final int OP_WRITE = 1 << 2;
public static final int OP_CONNECT = 1 << 3;
public static final int OP_ACCEPT = 1 << 4;
~~~

我们可以看到上面的4个Event是用位运算来定义的，如果将这个四个event使用或运算合并起来，就得到了SelectionKey中的interestOps。

和interestOps类似，SelectionKey还有一个readyOps。

一个表示感兴趣的操作，一个表示ready的操作。

最后，SelectionKey在注册的时候，还可以attach一个Object，比如我们可以在这个对象中保存这个channel的id：

~~~java
SelectionKey key = channel.register(
  selector, SelectionKey.OP_ACCEPT, object);
key.attach(Object);
Object object = key.attachment();
~~~

object可以在register的时候传入，也可以调用attach方法。

最后，我们可以通过key的attachment方法，获得该对象。

## selector 和 SelectionKey

我们通过selector.select()这个一个blocking操作，来获取一个ready的channel。

然后我们通过调用selector.selectedKeys()来获取到SelectionKey对象。

在SelectionKey对象中，我们通过判断ready的event来处理相应的消息。

## 总的例子

接下来，我们把之前将的串联起来，先建立一个小师妹的ChatServer：

~~~java
public class ChatServer {

    private static String BYE_BYE="再见";

    public static void main(String[] args) throws IOException, InterruptedException {
        Selector selector = Selector.open();
        ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
        serverSocketChannel.bind(new InetSocketAddress("localhost", 9527));
        serverSocketChannel.configureBlocking(false);
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
        ByteBuffer byteBuffer = ByteBuffer.allocate(512);

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
                    serverResonse(byteBuffer, selectionKey);
                }
                iter.remove();
            }
            Thread.sleep(1000);
        }
    }

    private static void serverResonse(ByteBuffer byteBuffer, SelectionKey selectionKey)
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

    private static void register(Selector selector, ServerSocketChannel serverSocketChannel)
            throws IOException {
        SocketChannel socketChannel = serverSocketChannel.accept();
        socketChannel.configureBlocking(false);
        socketChannel.register(selector, SelectionKey.OP_READ);
    }
}
~~~

上面例子有两点需要注意，我们在循环遍历中，当selectionKey.isAcceptable时，表示服务器收到了一个新的客户端连接，这个时候我们需要调用register方法，再注册一个OP_READ事件到这个新的SocketChannel中，然后继续遍历。

第二，我们定义了一个stop word，当收到这个stop word的时候，会直接关闭这个client channel。

再看看客户端的代码：

~~~java
public class ChatClient {

    private static SocketChannel socketChannel;
    private static ByteBuffer byteBuffer;

    public static void main(String[] args) throws IOException {

        ChatClient chatClient = new ChatClient();
        String response = chatClient.sendMessage("hello 小师妹！");
        log.info("response is {}", response);
        response = chatClient.sendMessage("能不能？");
        log.info("response is {}", response);
        chatClient.stop();

    }

    public void stop() throws IOException {
        socketChannel.close();
        byteBuffer = null;
    }

    public ChatClient() throws IOException {
        socketChannel = SocketChannel.open(new InetSocketAddress("localhost", 9527));
        byteBuffer = ByteBuffer.allocate(512);
    }

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
}
~~~

客户端代码没什么特别的，需要注意的是Buffer的读取。

最后输出结果：

~~~java
server收到： INFO com.flydean.ChatServer - hello 小师妹！
client收到: INFO com.flydean.ChatClient - response is 你是个好人
server收到： INFO com.flydean.ChatServer - 能不能？
client收到： INFO com.flydean.ChatClient - response is 再见
~~~

解释一下整个流程：志伟跟小师妹建立了一个连接，志伟向小师妹打了一个招呼，小师妹给志伟发了一张好人卡。志伟不死心，想继续纠缠，小师妹回复再见，然后自己关闭了通道。

## 总结

本文介绍了Selector和channel在发好人卡的过程中的作用。

flydean版本：
* [区块链从入门到放弃系列教程-涵盖密码学,超级账本,以太坊,Libra,比特币等持续更新](http://www.flydean.com/blockchain/)
* [Spring Boot 2.X系列教程:七天从无到有掌握Spring Boot-持续更新](http://www.flydean.com/learn-spring-boot/)
* [Spring 5.X系列教程:满足你对Spring5的一切想象-持续更新](http://www.flydean.com/spring5/)
* [java程序员从小工到专家成神之路（2020版）-持续更新中,附详细文章教程](https://blog.csdn.net/superfjj/article/details/105482751)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！











