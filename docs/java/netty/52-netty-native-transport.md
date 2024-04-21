---
slug: /52-netty-native-transport
---

# 76. netty系列之:在netty中使用native传输协议



# 简介

对于IO来说，除了传统的block IO,使用最多的就是NIO了，通常我们在netty程序中最常用到的就是NIO,比如NioEventLoopGroup,NioServerSocketChannel等。

我们也知道在IO中有比NIO更快的IO方式，比如kqueue和epoll，但是这两种方式需要native方法的支持，也就是说需要在操作系统层面提供服务。

如果我们在支持Kqueue或者epoll的服务器上，netty是否可以提供对这些优秀IO的支持呢？

答案是肯定的。但是首先kqueue和epoll需要JNI支持，也就是说JAVA程序需要调用本地的native方法。

# native传输协议的依赖

要想使用kequeue和epoll这种native的传输方式，我们需要额外添加项目的依赖,如果是linux环境，则可以添加如下的maven依赖环境：

```
  <dependencies>
    <dependency>
      <groupId>io.netty</groupId>
      <artifactId>netty-transport-native-epoll</artifactId>
      <version>${project.version}</version>
      <classifier>linux-x86_64</classifier>
    </dependency>
    ...
  </dependencies>
```

其中version需要匹配你所使用的netty版本号，否则可能出现调用异常的情况。

classifier表示的是系统架构，它的值可以是linux-x86_64，也可以是linux-aarch_64.

如果你使用的mac系统，那么可以这样引入：

```
  <dependencies>
    <dependency>
      <groupId>io.netty</groupId>
      <artifactId>netty-transport-native-kqueue</artifactId>
      <version>${project.version}</version>
      <classifier>osx-x86_64</classifier>
    </dependency>
    ...
  </dependencies>
```

netty除了单独的个体包之外，还有一个all in one的netty-all包，如果你使用了这个all in one的包，那么不需要额外添加native的依赖。

如果netty提供的系统架构并没有你正在使用的，那么你需要手动进行编译，以下是编译所依赖的程序包, 如果是在RHEL/CentOS/Fedora系统中，则使用：

```
sudo yum install autoconf automake libtool make tar \
                 glibc-devel \
                 libgcc.i686 glibc-devel.i686
```

如果是在Debian/Ubuntu系统中，则使用：

```
sudo apt-get install autoconf automake libtool make tar \
                     gcc
```

如果是在MacOS/BSD系统中，则使用：

```
brew install autoconf automake libtool
```

# netty本地传输协议的使用

安装好依赖包之后，我们就可以在netty中使用这些native传输协议了。

native传输协议的使用和NIO的使用基本一致，我们只需要进行下面的替换即可。

如果是在liunx系统中，则进行下面的替换：

```

    NioEventLoopGroup → EpollEventLoopGroup
    NioEventLoop → EpollEventLoop
    NioServerSocketChannel → EpollServerSocketChannel
    NioSocketChannel → EpollSocketChannel

```

如果是在mac系统中，则进行下面的替换：

```

    NioEventLoopGroup → KQueueEventLoopGroup
    NioEventLoop → KQueueEventLoop
    NioServerSocketChannel → KQueueServerSocketChannel
    NioSocketChannel → KQueueSocketChannel

```

这里还是使用我们熟悉的聊天服务为例，首先看下基于Kqueue的netty服务器端应该怎么写：

```
EventLoopGroup bossGroup = new KQueueEventLoopGroup(1);
        EventLoopGroup workerGroup = new KQueueEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(KQueueServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new NativeChatServerInitializer());

            Channel channel = b.bind(PORT).sync().channel();
            log.info("server channel:{}", channel);
            channel.closeFuture().sync();
```

和NIO一样，在服务器端我们需要使用KQueueEventLoopGroup创建两个EventLoopGroup，一个是bossGroup, 一个是workerGroup。

然后将这两个group传入到ServerBootstrap中，并且添加KQueueServerSocketChannel作为channel。

其他的内容和NIO server的内容是一样的。

接下来我们看下基于Kqueue的netty客户端改如何跟server端建立连接：

```
EventLoopGroup group = new KQueueEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(KQueueSocketChannel.class)
             .handler(new NativeChatClientInitializer());

            // 建立连接
            Channel ch = b.connect(HOST, PORT).sync().channel();
            log.info("client channel: {}", ch);
```

这里使用的是KQueueEventLoopGroup，并将KQueueEventLoopGroup放到Bootstrap中，并且为Bootstrap提供了和server端一致的KQueueSocketChannel。

然后就是客户端向channel中写消息，这里我们直接从命令行输入：

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
```

上面代码的意思是将命令行收到的消息写入到channel中，如果输入的是'再见'，则关闭channel。

为了能够处理字符串，这里用到了三个编码解码器：

```
        // 添加行分割器
        pipeline.addLast(new DelimiterBasedFrameDecoder(8192, Delimiters.lineDelimiter()));
        // 添加String Decoder和String Encoder,用来进行字符串的转换
        pipeline.addLast(new StringEncoder());
        pipeline.addLast(new StringDecoder());
```

分别是行分割器，字符编码器和字符解码器。

运行一下看，程序运行没问题，客户端和服务器端可以进行通讯。

# 总结

这里我们只以Kqueue为例介绍了netty中native传输协议的使用，具体的代码，大家可以参考：

[learn-netty4](https://github.com/ddean2009/learn-netty4)
