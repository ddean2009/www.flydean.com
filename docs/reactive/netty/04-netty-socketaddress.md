---
slug: /04-6-netty-socketaddress
---

# 11. netty系列之:netty中SocketAddress详解



# 简介

Socket是一种建立客户端和服务器端连接的方式，这种方式在netty中尤其常见，在socket中客户端和服务器端需要一种机制来确定如何连接到对方，这种机制就是SocketAddress。

今天我们来详细讲解一下SocketAddress在netty中的实现。

# SocketAddress

SocketAddress听名字就知道它是一个地址，事实上它是在JDK中定义的，我们来看下它的具体定义：

```
public abstract class SocketAddress implements java.io.Serializable {

    static final long serialVersionUID = 5215720748342549866L;

}
```

SocketAddress在java.net包中，表示的是一个网络地址。

但是我们检查代码可以看到，SocketAddress中并没有任何内容，它的所有实现都在它的子类中，那么SocketAddress到底有那些实现类呢？

我们以一个图来观察一下，SocketAddress和它的子类实现：

<img src="https://img-blog.csdnimg.cn/cf8b4415dfeb4d25a1c4249abf84c828.png" style="zoom:67%;" />

可以看到，SocketAddress继承自Serializable，为什么要继承自Serializable呢？很明显SocketAddress要在网络中进行传输，所以必须要进行序列化。

SocketAddress有4个直接实现的子类分别是LocalAddress,EmbeddedSocketAddress,DomainSocketAddress,InetSocketAddress，还有两个间接实现的子类,分别是DatagramSocketAddress和DomainDatagramSocketAddress。

我们一起来看一下他们到底是什么用的。

# LocalAddress

首先是LocalAddress，LocalAddress表示的是本地的数据传输地址。localAddress中有两个属性：

```
    private final String id;
    private final String strVal;
```

这两个属性是从netty的channel中得到的，我们看下他们的实现逻辑：

```
    LocalAddress(Channel channel) {
        StringBuilder buf = new StringBuilder(16);
        buf.append("local:E");
        buf.append(Long.toHexString(channel.hashCode() & 0xFFFFFFFFL | 0x100000000L));
        buf.setCharAt(7, ':');
        id = buf.substring(6);
        strVal = buf.toString();
    }
```

可以看出，LocalAddress的id是依赖于channel的hashCode来生成，然后进行拼接而成的，拼接后的StringBuilder中的前6个字符就是id，整个StringBuilder的值就是strVal。

而这个ID的作用就是用判断不同的LocalAddress是否相同：

```
    public int compareTo(LocalAddress o) {
        return id.compareTo(o.id);
    }
```

可以看到因为LocalAddress并没有涉及到IP地址，所以它只能在本地使用。

# EmbeddedSocketAddress

先来看下这个类的定义：

```
final class EmbeddedSocketAddress extends SocketAddress {
    private static final long serialVersionUID = 1400788804624980619L;

    @Override
    public String toString() {
        return "embedded";
    }
}
```

可以看到它自定义了一个toString方法，所以这个类的用处不对，主要使用在EmbeddedChannel中,表示嵌套的channel中的地址。

因为channel是嵌套的，所以它的LOCAL_ADDRESS和REMOTE_ADDRESS实际上是不存在的。

# InetSocketAddress

这个类应该是我们最常用到的socketAddress，因为它代表的是一个IP Socket Address,也就是IP address + port number, 这个IP地址也可以用hostname来替代。

InetSocketAddress中只有一个InetSocketAddressHolder类型的属性holder,而这个holder事实上是一个内部类，它定义了三个属性，分别是：

```
        private String hostname;

        private InetAddress addr;

        private int port;
```

这三个属性正好对于了我们之前降到的IP socket address的几个特征。

其中InetAddress表示的是一个ip地址。

对于域名来说，有个解析的过程，所以InetSocketAddress提供了一个isUnresolved的方法判断。

# DatagramSocketAddress

DatagramSocketAddress是InetSocketAddress的子类，表示的是使用UDP协议的地址。

UDP Socket在JDK中有个专门的类叫做DatagramSocket，DatagramSocketAddress就是对应DatagramSocket的地址。

还记得UDP有什么特征吗？UDP和TCP相比的最大特点就是UDP非常简单，它自管发送消息就行了，不需要知道消息是否被收到。所以对于UDP来说，知道要接受的地址就够了，这个地址就是DatagramSocketAddress。

可以看到DatagramSocketAddress中有一个receivedAmount属性：

```
    private final int receivedAmount;
```

receivedAmount表示的是这个地址接收到的bytes数目。

注意这个类只在netty内部使用，主要用在Socket类中的两个方法，从ByteBuffer和memoryAddress中创建DatagramSocketAddress：

```
    public final DatagramSocketAddress recvFrom(ByteBuffer buf, int pos, int limit) throws IOException {
        return recvFrom(fd, buf, pos, limit);
    }

    public final DatagramSocketAddress recvFromAddress(long memoryAddress, int pos, int limit) throws IOException {
        return recvFromAddress(fd, memoryAddress, pos, limit);
    }
```

# DomainSocketAddress

一般来说Socket Address需要一个IP地址，用来寻找到目标地址，但是对于UNIX来说，一切都是文件，为了提升UNIX平台中的数据传输效率，UNIX平台引入了一个新的数据在不同进程中交换的方法，这个方法就叫做Unix domain socket或者IPC socket。

DomainSocketAddress不是用IP进行传输的，而是用UNIX文件进行数据交换。

从类的实现来说，DomainSocketAddress中定义了一个socketPath的字符串，表示数据沟通的文件路径,也就是socketPath：

```
    public DomainSocketAddress(String socketPath) {
        this.socketPath = ObjectUtil.checkNotNull(socketPath, "socketPath");
    }
```

那么如何表明两个DomainSocketAddress是同一个address呢?

```
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DomainSocketAddress)) {
            return false;
        }

        return ((DomainSocketAddress) o).socketPath.equals(socketPath);
    }
```

可以看到，只要是socketPath相同，那么这两个DomainSocketAddress就是相同的。

# DomainDatagramSocketAddress

最后一个要讲的类是DomainDatagramSocketAddress，从名字可以看出，它是使用IPC来进行沟通的DatagramSocketAddress。

同样的，这个类中也有一个receivedAmount，表示这个地址接收到的字节数：

```
private final int receivedAmount;
```

和DatagramSocketAddress一样，DomainDatagramSocketAddress也是一个内部使用的类。它也是用在Socket类中，用来从buf和memoryAddress中返回一个DomainDatagramSocketAddress：

```
    public final DomainDatagramSocketAddress recvFromDomainSocket(ByteBuffer buf, int pos, int limit)
            throws IOException {
        return recvFromDomainSocket(fd, buf, pos, limit);
    }

    public final DomainDatagramSocketAddress recvFromAddressDomainSocket(long memoryAddress, int pos, int limit)
            throws IOException {
        return recvFromAddressDomainSocket(fd, memoryAddress, pos, limit);
```

这里的Socket是一个JNI的bridge类，上面所提到的方法实际上都调用的是native方法。

# 总结

以上就是SocketAddress和它的各种address实现，当然我们最常用到的还是InetSocketAddress这个以IP为基础的Socket Address.

















