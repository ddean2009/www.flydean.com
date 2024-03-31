---
slug: /17-jboss-marshalling
---

# 40. netty系列之:使用Jboss Marshalling来序列化java对象



# 简介

在JAVA程序中经常会用到序列化的场景，除了JDK自身提供的Serializable之外，还有一些第三方的产品可以实现对JAVA对象的序列化。其中比较有名的就是Google protobuf。当然，也有其他的比较出名的序列化工具，比如Kryo和JBoss Marshalling。

今天想给大家介绍的就是JBoss Marshalling，为什么要介绍JBoss Marshalling呢？

用过google protobuf的朋友可能都知道，虽然protobuf好用，但是需要先定义序列化对象的结构才能生成对应的protobuf文件。如果怕麻烦的朋友可能就不想考虑了。

JBoss Marshalling就是在JDK自带的java.io.Serializable中进行优化的一个序列化工具，用起来非常的简单，并且和java.io.Serializable兼容，所以是居家必备开发程序的好帮手。

根据JBoss官方的介绍，JBoss Marshalling和JDK java.io.Serializable相比有两个非常大的优点，第一个优点就是JBoss Marshalling解决了java.io.Serializable中使用的一些不便和问题。第二个优点就是JBoss Marshalling完全是可插拔的，这样就提供了对JBoss Marshalling框架进行扩展的可能，那么一起来看看JBoss Marshalling的使用吧。

# 添加JBoss Marshalling依赖

如果想用JBoss Marshalling，那么第一步就是添加JBoss Marshalling的依赖。

很奇怪的是如果你到JBoss Marshalling的官网上，可能会发现JBoss Marshalling很久都没有更新了，它的最新版本还是2011-04-27年出的1.3.0.CR9版本。

但是不要急，如果你去maven仓库搜一下，会发现最新的版本是2021年5月发行的2.0.12.Final版本。

所以这里我们就拿最新的2.0.12.Final版本为例进行讲解。

如果仔细观察JBoss Marshalling的maven仓库，可以看到JBoss Marshalling包含了4个依赖包，分别是JBoss Marshalling API,JBoss Marshalling River Protocol,JBoss Marshalling Serial Protocol和JBoss Marshalling OSGi Bundle。

JBoss Marshalling API是我们在程序中需要调用的API接口，这个是必须要包含的。JBoss Marshalling River Protocol和JBoss Marshalling Serial Protocol是marshalling的两种实现方式，可以根据需要自行取舍。

JBoss官网并没有太多关于这两个序列化实现的细节，我只能说，根据我的了解river的压缩程度更高。其他更多细节和实现可能只有具体阅读源码才知道了。

JBoss Marshalling OSGi Bundle是一个基于OSGi的可插拔的框架。

如果我们只是做对象的序列化，那么只需要使用JBoss Marshalling API和JBoss Marshalling River Protocol就行了。

```
        <dependency>
            <groupId>org.jboss.marshalling</groupId>
            <artifactId>jboss-marshalling</artifactId>
            <version>2.0.12.Final</version>
        </dependency>
        <dependency>
            <groupId>org.jboss.marshalling</groupId>
            <artifactId>jboss-marshalling-river</artifactId>
            <version>2.0.12.Final</version>
        </dependency>
```

# JBoss Marshalling的使用

添加了依赖之后，我们就可以开始使用JBoss Marshalling了。JBoss Marshalling的使用非常简单，首先我们要根据选择的marshalling方式创建MarshallerFactory:

```
 // 使用river作为marshalling的方式
        MarshallerFactory marshallerFactory = Marshalling.getProvidedMarshallerFactory("river");
```

这里我们选择使用river作为marshalling的序列化方式。

有了MarshallerFactory,我们还需要一个MarshallingConfiguration为MarshallerFactory提供一些必要的序列化参数。

一般来说，我们可以控制MarshallingConfiguration的下面一些属性：

```
MarshallingConfiguration configuration = new MarshallingConfiguration();
 configuration.setVersion(4);
 configuration.setClassCount(10);
 configuration.setBufferSize(8096);
 configuration.setInstanceCount(100);
 configuration.setExceptionListener(new MarshallingException());
 configuration.setClassResolver(new SimpleClassResolver(getClass().getClassLoader()));
```

setVersion是设置使用的marshalling protocol的版本号，这个版本号非常重要，因为依赖的protocol实现可能根据会根据需要进行序列化实现的升级，可能产生不兼容的情况。通过设置版本号，可以保证升级之后的protocol也能兼容之前的序列化版本。

setClassCount是预设要序列化对象中的class个数。

setInstanceCount是预设序列化对象中的class实例个数。

setBufferSize设置读取数据的buff大小，通过调节这个属性可以调整序列化的性能。

setExceptionListener添加序列化异常的时候的异常监听器。

setClassResolver用来设置classloader。

JBoss Marshalling的强大之处在于我们在序列化的过程中还可以对对象进行拦截，从而进行日志输出或者其他的业务操作。

configuration提供了两个方法，分别是setObjectPreResolver和setObjectResolver。

这两个方法接受一个ObjectResolver对象，可以用来对对象进行处理。

两个方法的不同在于执行的顺序，preResolver在所有的resolver之前执行。

做好上面的配置之后，我们就可以正式开始编码了。

```
            final Marshaller marshaller = marshallerFactory.createMarshaller(configuration);
            try(FileOutputStream os = new FileOutputStream(fileName)){
                marshaller.start(Marshalling.createByteOutput(os));
                marshaller.writeObject(obj);
                marshaller.finish();
            }
```

上面的例子中，通过调用marshaller的start方法开启序列化，然后调用marshaller.writeObject写入对象。

最后调用marshaller.finish结束序列化。

整个序列化的代码如下所示：

```
    public void marshallingWrite(String fileName, Object obj) throws IOException {
        // 使用river作为marshalling的方式
        MarshallerFactory marshallerFactory = Marshalling.getProvidedMarshallerFactory("river");
        // 创建marshalling的配置
        MarshallingConfiguration configuration = new MarshallingConfiguration();
        // 使用版本号4
        configuration.setVersion(4);

            final Marshaller marshaller = marshallerFactory.createMarshaller(configuration);
            try(FileOutputStream os = new FileOutputStream(fileName)){
                marshaller.start(Marshalling.createByteOutput(os));
                marshaller.writeObject(obj);
                marshaller.finish();
            }
    }

    public static void main(String[] args) throws IOException {
        MarshallingWriter writer = new MarshallingWriter();
        Student student= new Student("jack", 18, "first grade");
        writer.marshallingWrite("/tmp/marshall.txt",student);
    }
```

非常的简洁明了。

注意，这里我们序列化了一个Student对象，这个对象一定要实现java.io.Serializable接口，否则会抛出类型下面的异常：

```
Exception in thread "main" java.io.NotSerializableException: 
	at org.jboss.marshalling.river.RiverMarshaller.doWriteObject(RiverMarshaller.java:274)
	at org.jboss.marshalling.AbstractObjectOutput.writeObject(AbstractObjectOutput.java:58)
	at org.jboss.marshalling.AbstractMarshaller.writeObject(AbstractMarshaller.java:111)
```

接下来就是序列化的反向动作反序列化了。

代码很简单，我们直接上代码：

```
   public void marshallingRead(String fileName) throws IOException, ClassNotFoundException {
        // 使用river协议创建MarshallerFactory
        MarshallerFactory marshallerFactory = Marshalling.getProvidedMarshallerFactory("river");
        // 创建配置文件
        MarshallingConfiguration configuration = new MarshallingConfiguration();
        // 使用版本号4
        configuration.setVersion(4);
            final Unmarshaller unmarshaller = marshallerFactory.createUnmarshaller(configuration);
            try(FileInputStream is = new FileInputStream(fileName)){
                unmarshaller.start(Marshalling.createByteInput(is));
                Student student=(Student)unmarshaller.readObject();
                log.info("student:{}",student);
                unmarshaller.finish();
            }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        MarshallingReader reader= new MarshallingReader();
        reader.marshallingRead("/tmp/marshall.txt");
    }
```

运行上面的代码，我们可能得到下面的输出：

```
[main] INFO  c.f.marshalling.MarshallingReader - student:Student(name=jack, age=18, className=first grade)
```

可见读取序列化的对象已经成功。

# 总结

以上就是JBoss Marshalling的基本使用。通常对我们程序员来说，这个基本的使用已经足够了。除非你有根据复杂的序列化需求，比如对象中的密码需要在序列化的过程中进行替换，这种需求可以使用我们前面提到的ObjectResolver来实现。

本文的例子可以参考：[learn-netty4](https://github.com/ddean2009/learn-netty4)







