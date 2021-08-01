小师妹学JavaIO之:Buffer和Buff

## 简介
小师妹在学习NIO的路上越走越远，唯一能够帮到她的就是在她需要的时候给她以全力的支持。什么都不说了，今天介绍的是NIO的基础Buffer。老铁给我上个Buff。

## Buffer是什么

小师妹：F师兄，这个Buffer是我们纵横王者峡谷中那句：老铁给我加个Buff的意思吗？

当然不是了，此Buffer非彼Buff，Buffer是NIO的基础，没有Buffer就没有NIO，没有Buffer就没有今天的java。

因为NIO是按Block来读取数据的，这个一个Block就可以看做是一个Buffer。我们在Buffer中存储要读取的数据和要写入的数据，通过Buffer来提高读取和写入的效率。

> 更多内容请访问[www.flydean.com](www.flydean.com)

还记得java对象的底层存储单位是什么吗？

小师妹：这个我知道，java对象的底层存储单位是字节Byte。

对，我们看下Buffer的继承图：

![](https://img-blog.csdnimg.cn/20200514142719108.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Buffer是一个接口，它下面有诸多实现，包括最基本的ByteBuffer和其他的基本类型封装的其他Buffer。

小师妹：F师兄，有ByteBuffer不就够了吗？还要其他的类型Buffer做什么？

小师妹，山珍再好，也有吃腻的时候，偶尔也要换个萝卜白菜啥的，你以为乾隆下江南都干了些啥？

ByteBuffer虽然好用，但是它毕竟是最小的单位，在它之上我们还有Char，int，Double，Short等等基础类型，为了简单起见，我们也给他们都搞一套Buffer。

## Buffer进阶

小师妹：F师兄，既然Buffer是这些基础类型的集合，为什么不直接用结合来表示呢？给他们封装成一个对象，好像有点多余。

我们既然在面向对象的世界，从表面来看自然是使用Object比较合乎情理，从底层的本质上看，这些封装的Buffer包含了一些额外的元数据信息，并且还提供了一些意想不到的功能。

![](https://img-blog.csdnimg.cn/20200519142644525.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

上图列出了Buffer中的几个关键的概念，分别是Capacity，Limit，Position和Mark。Buffer底层的本质是数组，我们以ByteBuffer为例，它的底层是：

~~~java
final byte[] hb; 
~~~

* Capacity表示的是该Buffer能够承载元素的最大数目，这个是在Buffer创建初期就设置的，不可以被改变。
* Limit表示的Buffer中可以被访问的元素个数，也就是说Buffer中存活的元素个数。
* Position表示的是下一个可以被访问元素的index，可以通过put和get方法进行自动更新。
* Mark表示的是历史index，当我们调用mark方法的时候，会把设置Mark为当前的position，通过调用reset方法把Mark的值恢复到position中。
  
## 创建Buffer

小师妹：F师兄呀，这么多Buffer创建起来是不是很麻烦？有没有什么快捷的使用办法？

一般来说创建Buffer有两种方法，一种叫做allocate，一种叫做wrap。

~~~java
public void createBuffer(){
        IntBuffer intBuffer= IntBuffer.allocate(10);
        log.info("{}",intBuffer);
        log.info("{}",intBuffer.hasArray());
        int[] intArray=new int[10];
        IntBuffer intBuffer2= IntBuffer.wrap(intArray);
        log.info("{}",intBuffer2);
        IntBuffer intBuffer3= IntBuffer.wrap(intArray,2,5);
        log.info("{}",intBuffer3);
        intBuffer3.clear();
        log.info("{}",intBuffer3);
        log.info("{}",intBuffer3.hasArray());
    }
~~~

allocate可以为Buffer分配一个空间，wrap同样为Buffer分配一个空间，不同的是这个空间背后的数组是自定义的，wrap还支持三个参数的方法，后面两个参数分别是offset和length。

~~~java
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=0 lim=10 cap=10]
INFO com.flydean.BufferUsage - true
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=0 lim=10 cap=10]
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=2 lim=7 cap=10]
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=0 lim=10 cap=10]
INFO com.flydean.BufferUsage - true
~~~

hasArray用来判断该Buffer的底层是不是数组实现的，可以看到，不管是wrap还是allocate，其底层都是数组。

> 需要注意的一点，最后，我们调用了clear方法，clear方法调用之后，我们发现Buffer的position和limit都被重置了。这说明wrap的三个参数方法设定的只是初始值，可以被重置。

## Direct VS non-Direct

小师妹：F师兄，你说了两种创建Buffer的方法，但是两种Buffer的后台都是数组，难道还有非数组的Buffer吗？

自然是有的,但是只有ByteBuffer有。ByteBuffer有一个allocateDirect方法，可以分配Direct Buffer。

小师妹：Direct和非Direct有什么区别呢？

![](https://img-blog.csdnimg.cn/20200513225239404.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_35,color_8F8F8F,t_70)

Direct Buffer就是说，不需要在用户空间再复制拷贝一份数据，直接在虚拟地址映射空间中进行操作。这叫Direct。这样做的好处就是快。缺点就是在分配和销毁的时候会占用更多的资源，并且因为Direct Buffer不在用户空间之内，所以也不受垃圾回收机制的管辖。

所以通常来说只有在数据量比较大，生命周期比较长的数据来使用Direct Buffer。

看下代码：

~~~java
public void createByteBuffer() throws IOException {
        ByteBuffer byteBuffer= ByteBuffer.allocateDirect(10);
        log.info("{}",byteBuffer);
        log.info("{}",byteBuffer.hasArray());
        log.info("{}",byteBuffer.isDirect());

        try (RandomAccessFile aFile = new RandomAccessFile("src/main/resources/www.flydean.com", "r");
             FileChannel inChannel = aFile.getChannel()) {
            MappedByteBuffer buffer = inChannel.map(FileChannel.MapMode.READ_ONLY, 0, inChannel.size());
            log.info("{}",buffer);
            log.info("{}",buffer.hasArray());
            log.info("{}",buffer.isDirect());
        }
    }
~~~

除了allocateDirect,使用FileChannel的map方法也可以得到一个Direct的MappedByteBuffer。

上面的例子输出结果：

~~~java
INFO com.flydean.BufferUsage - java.nio.DirectByteBuffer[pos=0 lim=10 cap=10]
INFO com.flydean.BufferUsage - false
INFO com.flydean.BufferUsage - true
INFO com.flydean.BufferUsage - java.nio.DirectByteBufferR[pos=0 lim=0 cap=0]
INFO com.flydean.BufferUsage - false
INFO com.flydean.BufferUsage - true
~~~

## Buffer的日常操作

小师妹:F师兄，看起来Buffer确实有那么一点复杂，那么Buffer都有哪些操作呢？

Buffer的操作有很多，下面我们一一来讲解。

### 向Buffer写数据

向Buffer写数据可以调用Buffer的put方法：

~~~java
public void putBuffer(){
        IntBuffer intBuffer= IntBuffer.allocate(10);
        intBuffer.put(1).put(2).put(3);
        log.info("{}",intBuffer.array());
        intBuffer.put(0,4);
        log.info("{}",intBuffer.array());
    }
~~~

因为put方法返回的还是一个IntBuffer类，所以Buffer的put方法可以像Stream那样连写。

同时，我们还可以指定put在什么位置。上面的代码输出：

~~~java
INFO com.flydean.BufferUsage - [1, 2, 3, 0, 0, 0, 0, 0, 0, 0]
INFO com.flydean.BufferUsage - [4, 2, 3, 0, 0, 0, 0, 0, 0, 0]
~~~

### 从Buffer读数据

读数据使用get方法，但是在get方法之前我们需要调用flip方法。

flip方法是做什么用的呢？上面讲到Buffer有个position和limit字段，position会随着get或者put的方法自动指向后面一个元素，而limit表示的是该Buffer中有多少可用元素。

如果我们要读取Buffer的值则会从positon开始到limit结束：

~~~java
public void getBuffer(){
        IntBuffer intBuffer= IntBuffer.allocate(10);
        intBuffer.put(1).put(2).put(3);
        intBuffer.flip();
        while (intBuffer.hasRemaining()) {
            log.info("{}",intBuffer.get());
        }
        intBuffer.clear();
    }
~~~

可以通过hasRemaining来判断是否还有下一个元素。通过调用clear来清除Buffer，以供下次使用。

### rewind Buffer

rewind和flip很类似，不同之处在于rewind不会改变limit的值，只会将position重置为0。

~~~java
public void rewindBuffer(){
        IntBuffer intBuffer= IntBuffer.allocate(10);
        intBuffer.put(1).put(2).put(3);
        log.info("{}",intBuffer);
        intBuffer.rewind();
        log.info("{}",intBuffer);
    }
~~~

上面的结果输出：

~~~java
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=3 lim=10 cap=10]
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=0 lim=10 cap=10]
~~~

### Compact Buffer

Buffer还有一个compact方法，顾名思义compact就是压缩的意思，就是把Buffer从当前position到limit的值赋值到position为0的位置：

~~~java
public void useCompact(){
        IntBuffer intBuffer= IntBuffer.allocate(10);
        intBuffer.put(1).put(2).put(3);
        intBuffer.flip();
        log.info("{}",intBuffer);
        intBuffer.get();
        intBuffer.compact();
        log.info("{}",intBuffer);
        log.info("{}",intBuffer.array());
    }
~~~

上面代码输出：

~~~java
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=0 lim=3 cap=10]
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=2 lim=10 cap=10]
INFO com.flydean.BufferUsage - [2, 3, 3, 0, 0, 0, 0, 0, 0, 0]
~~~

### duplicate Buffer

最后我们讲一下复制Buffer，有三种方法，duplicate，asReadOnlyBuffer，和slice。

duplicate就是拷贝原Buffer的position，limit和mark，它和原Buffer是共享原始数据的。所以修改了duplicate之后的Buffer也会同时修改原Buffer。

如果用asReadOnlyBuffer就不允许拷贝之后的Buffer进行修改。

slice也是readOnly的，不过它拷贝的是从原Buffer的position到limit-position之间的部分。

~~~java
public void duplicateBuffer(){
        IntBuffer intBuffer= IntBuffer.allocate(10);
        intBuffer.put(1).put(2).put(3);
        log.info("{}",intBuffer);
        IntBuffer duplicateBuffer=intBuffer.duplicate();
        log.info("{}",duplicateBuffer);
        IntBuffer readOnlyBuffer=intBuffer.asReadOnlyBuffer();
        log.info("{}",readOnlyBuffer);
        IntBuffer sliceBuffer=intBuffer.slice();
        log.info("{}",sliceBuffer);
    }
~~~

输出结果：

~~~java
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=3 lim=10 cap=10]
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=3 lim=10 cap=10]
INFO com.flydean.BufferUsage - java.nio.HeapIntBufferR[pos=3 lim=10 cap=10]
INFO com.flydean.BufferUsage - java.nio.HeapIntBuffer[pos=0 lim=7 cap=7]
~~~

## 总结

今天给小师妹介绍了Buffer的原理和基本操作。

本文的例子[https://github.com/ddean2009/learn-java-io-nio](https://github.com/ddean2009/learn-java-io-nio)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！