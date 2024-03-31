---
slug: /17-netty-protobuf
---

# 41. netty系列之:在netty中使用protobuf协议



# 简介

netty中有很多适配不同协议的编码工具，对于流行的google出品的protobuf也不例外。netty为其提供了ProtobufDecoder和ProtobufEncoder两个工具还有对应的frame detection，接下来我们会通过一个例子来详细讲解如何在netty中使用protobuf。

# 定义protobuf

我们举个最简单的例子，首先定义一个需要在网络中进行传输的message，这里我们定义一个student对象，他有一个age和一个name属性，如下所示：

```
syntax = "proto3";

package com.flydean17.protobuf;

option java_multiple_files = true;
option java_package = "com.flydean17.protobuf";
option java_outer_classname = "StudentWrapper";

message Student {
  optional int32 age = 1;
  optional string name =2;
}
```

使用下面的命令，对其进行编译：

```
 protoc --experimental_allow_proto3_optional  -I=. --java_out=. student.proto

```

可以看到生成了3个文件，分别是Student,StudentOrBuilder和StudentWrapper。其中Student和StudentOrBuilder是我们真正需要用到的对象。

# 定义handler

在handler中，我们主要进行对消息进行处理，这里我们在clientHandler中进行消息的构建和发送，StudentClientHandler继承SimpleChannelInboundHandler并重新channelActive方法， 在该方法中我们使用protobuf的语法，构建一个新的Student实例，并给他设置好age和name两个属性。

然后使用ctx.write和ctx.flush方法将其发送到server端：

```
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // channel活跃
        //构建一个Student，并将其写入到channel中
        Student student= Student.newBuilder().setAge(22).setName("flydean").build();
        log.info("client发送消息{}",student);
        ctx.write(student);
        ctx.flush();
    }
```

StudentServerHandler也是继承SimpleChannelInboundHandler，并重写channelRead0方法，当server端读取到student消息的时候，日志输出，并将其回写到channel中，供clientHandler读取：

```
    public void channelRead0(ChannelHandlerContext ctx, Student student) throws Exception {
        log.info("server收到消息{}",student);
        // 写入消息
        ChannelFuture future = ctx.write(student);
    }
```

当client读取到消息之后，直接日志输出，不再做进一步处理，到此，一轮client和server端的交互就完成了：

```
    public void channelRead0(ChannelHandlerContext ctx, Student student) throws Exception {
        log.info("client收到消息{}",student);
    }
```

# 设置ChannelPipeline

在上一节，不管是在StudentClientHandler还是在StudentServerHandler中，我们都假设channel中传递的对象就是Student，而不是原始的ByteBuf。这是怎么做到的呢？

这里我们需要使用到netty提供的frame detection，netty为protobuf协议专门提供了ProtobufDecoder和ProtobufEncoder，用于对protobuf对象进行编码和解码。

但是这两个编码和解码器分别是MessageToMessageEncoder和MessageToMessageDecoder，他们是消息到消息的编码和解码器，所以还需要和frame detection配合使用。

netty同样提供了和protobuf配合使用的frame detector,他们是ProtobufVarint32FrameDecoder和ProtobufVarint32LengthFieldPrepender。

Varint32指的是protobuf的编码格式，第一个字节使用的是可变的varint。

有了frame detector和编码解码器，我们只需要将其顺序加入ChannelPipeline即可。

在客户端，StudentClientInitializer继承自ChannelInitializer，我们需要重写其initChannel方法：

```
    public void initChannel(SocketChannel ch) {
        ChannelPipeline p = ch.pipeline();

        p.addLast(new ProtobufVarint32FrameDecoder());
        p.addLast(new ProtobufDecoder(Student.getDefaultInstance()));

        p.addLast(new ProtobufVarint32LengthFieldPrepender());
        p.addLast(new ProtobufEncoder());

        p.addLast(new StudentClientHandler());
    }
```

在服务器端，同样StudentServerInitializer也继承自ChannelInitializer，也需要重写其initChannel方法：

```
    public void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline p = ch.pipeline();

        p.addLast(new ProtobufVarint32FrameDecoder());
        p.addLast(new ProtobufDecoder(Student.getDefaultInstance()));

        p.addLast(new ProtobufVarint32LengthFieldPrepender());
        p.addLast(new ProtobufEncoder());

        p.addLast(new StudentServerHandler());
    }
```

这样ChannelPipeline也设置完成了。

# 构建client和server端并运行

最后好做的就是构建client和server端并运行，这和普通的netty客户端和服务器端并没有什么区别：

构建StudentClient:

```
   public static void main(String[] args) throws Exception {

        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap b = new Bootstrap();
            b.group(group)
             .channel(NioSocketChannel.class)
             .handler(new StudentClientInitializer());
            // 建立连接
            Channel ch = b.connect(HOST, PORT).sync().channel();
            // 等待关闭
            ch.closeFuture().sync();
        } finally {
            group.shutdownGracefully();
        }
    }
```

构建StudentServer:

```
   public static void main(String[] args) throws Exception {
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new StudentServerInitializer());

            b.bind(PORT).sync().channel().closeFuture().sync();
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
```

运行可得：

```
server端：
[nioEventLoopGroup-3-1] INFO  c.f.protobuf.StudentServerHandler - server收到消息age: 22
name: "flydean"

[nioEventLoopGroup-2-1] INFO  c.f.protobuf.StudentClientHandler - client发送消息age: 22
name: "flydean"

client端：
[nioEventLoopGroup-2-1] INFO  c.f.protobuf.StudentClientHandler - client收到消息age: 22
name: "flydean"
```

可见Student消息已经发送和接收成功了。

# 总结

netty提供了很多和协议适配的工具类，这样我们就可以专注于业务逻辑，不需要考虑具体的编码转换的问题，非常好用。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)

