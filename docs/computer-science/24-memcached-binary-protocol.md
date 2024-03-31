---
slug: /24-memcached-binary-protocol
---

# 24. 网络协议之:memcached binary protocol详解



# 简介

前面讲到了memcached的文本协议，虽然文本协议看起来非常简单,但是对于客户端来说一般还是会选择效率更高的二进制协议。

二进制协议的本质和文本协议是一样的，只是他们的表现方式不同而已。本文将会详细介绍memcached中二进制协议的实现细节。

# memcached的协议包

对于memcached的请求包和响应包来说，除了请求头有所区别之外，其他的格式都是一样的。

所以对memcached的请求和响应都可以用同一个包的格式来表示:

![](https://img-blog.csdnimg.cn/469f275dcb4c4260b864e5bb107c2c72.png)

前面的24个byte是包头部分，接下来的是命令行的额外数据extra,memcached中的key和value。

上面也提到了，请求包和响应包的区别就是header,下面是请求包头和响应包头的定义：

请求包头：

![](https://img-blog.csdnimg.cn/e9d5a55213a549e4a0ade718adddccf9.png)

响应包头：

![](https://img-blog.csdnimg.cn/e5abd776f76f4b32a808f99e2734ea36.png)

包头中各个字段的含义如下：

* Magic: 魔法数字，用来区分包头是请求包头还是响应包头

如果是请求,那么对应的Magic= 0x80，如果是响应,那么对应的Magic= 0x81。

在最初的设计中，Magic应该和协议的版本相对应的，当版本升级之后，对应的Magic也要进行相应的调整。但是到目前为止，binary协议的magic值还没有变化过。

* Opcode: 操作符，也就是对应的命令

memcached协议中有下面这些操作符：

![](https://img-blog.csdnimg.cn/38bf547680dc4843bba1a864978b8083.png)

其中带星号的表示该命令未定，未来可能会有修改。

以Q结尾的命令，表示这个命令是一个quiet的版本，它会忽略不感兴趣的返回数据。

* Key length: key的长度

* Status: 请求响应response的状态

response的值有下面几种：

![](https://img-blog.csdnimg.cn/2c30ed1bb0244db885f6725b59c56a1f.png)

* Extras length: command extras的长度

* Data type:保留字段

data type是一个保留字段，目前只有一个固定的值：0x00。

* vbucket id: 命令对应的virtual bucket

* Total body length:extra + key + value的总长度

* Opaque: 请求生成的一个数据，会被原封不动在对应的响应中返回

* CAS:数据的一个唯一标记

## memcached命令举例

为了更好的理解memcached的二进制协议，我们以几个常用的命令为例，来看一下memcached具体的请求和响应流程。

最常用的就是get请求，用于向服务器端请某个key对应的值。

假如现在客户端要向服务器端get一个key=hello的数据，那么请求的包如下所示：

![](https://img-blog.csdnimg.cn/02f3d8fec9c04cea9b12c9d3cd2cdc96.png)

其中Magic=0x80, Opcode=0x00,Key length=0x0005,Total body=0x00000005,Key="Hello"

如果服务器端存在对应的key的值，那么将会返回如下的数据包：

![](https://img-blog.csdnimg.cn/e815319365014445b0b3efcd8ae7b8d3.png)

我们要注意下面几个跟request值不同的字段：

其中Magic=0x81表示这个是一个response, 因为这是一个response,所以对应的Key length=0x0000。

另外response中包含了get请求中并不存在的Extra length和Extras Flags,这里他们的值分别是0x04和0xdeadbeef，表示Extra length是4个bytes，它的值是0xdeadbeef。

那么这个Extras Flags值是哪里来的呢？如果对比之前讲到的text协议，就可以知道，Extras Flags是在set key value的时候传入的，这个Flags会存放到服务器端，并在get请求中返回。

最后，response中包含了要返回的值"World"。

如果服务器端并没有这个key的值，那么对应的返回包可能是这样的：

![](https://img-blog.csdnimg.cn/bddd90a7226f4d4ea1cb5a299845baed.png)

其中Status=0x0001，表示是一个异常返回。

对应的value是："Not found"。

之前还提到了一个以Q结尾的命令行版本，比如getQ，它和get的区别是getQ会把请求的key也放在response包中返回：

![](https://img-blog.csdnimg.cn/7a5bb32b98a9460297c275e083b16f41.png)

因为最后的值中包含了key，所以这里的Key length是有值的，他就是key的长度=0x0005。

最后的返回数据部分包含了两部分，分别是Key="Hello",value="World"。

# 总结

以上我们介绍了memcached二进制协议的基本格式，并举例说明了get请求的具体使用和包的内容。有了这些知识，我们就可以开发一个支持memcached二净值协议的客户端了。












