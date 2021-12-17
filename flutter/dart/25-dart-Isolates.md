dart系列之:隔离机制

[toc]

# 简介

之前介绍了很多dart中的异步编程技巧，不知道大家有没有发现一个问题，如果是在java的异步编程中，肯定会提到锁和并发机制，但是对于dart来说，好像从来没有听到多线程和并发的问题，这是为什么呢？

今天，给大家讲解一下dart中的隔离机制，大家就明白了。

# dart中的隔离机制

dart是一个单线程的语言，但是作为一个单线程的语言，dart却支持Future,Stream等异步特性。这一切都是隔离机制和事件循环带来的结果。

首先看一下dart中的隔离机制。

所谓隔离指的是dart运行的一个特定的空间，这个空间拥有单独的内存和单线程的事件循环。

如下图所示：

在java或者c++等其他语言中，多个线程是共享内存空间的，虽然带来了并发和数据沟通的方便途径，但是同时也造成了并发编程的困难。

因为我们需要考虑多线程之间数据的同步，于是额外多出了很多锁的机制，详细了解或者用过的人应该都会很烦恼。

多线程最大的缺陷就是要求程序员的罗辑思维和编程技巧足够优秀，这样才能够设计出完美运行的多线程程序。

但是在dart中，这些都不是什么问题。dart中所有的线程都拥有自己的运行空间，这个线程的工作就是运行事件循环。

那么问题来了，主线程在处理事件循环，但是如果遇到了一个非常耗时的操作，该怎么办呢? 如果直接在主线程中运行，则可能会导致主线程的阻塞。

dart也充分考虑到了这个问题，所以dart提供了一个Isolate的类来对隔离进行管理。

因为dart程序本身就在一个Isolate中运行，所以如果在dart中定义一个Isolate，那么这个Isolate通常表示的是另外一个，需要和当前Isolate进行通信的Isolate。

# 生成一个Isolate

那么如何在当前的dart程序中生成一个Isolate呢？

Isolate提供了三种生成方法。

一个非常常用的是Isolate的工厂方法spawn:

```
  external static Future<Isolate> spawn<T>(
      void entryPoint(T message), T message,
      {bool paused = false,
      bool errorsAreFatal = true,
      SendPort? onExit,
      SendPort? onError,
      @Since("2.3") String? debugName});
```

spawn会创建一个新的Isolate，调用它需要传入几个参数：

entryPoint表示的是生成新Isolate的时候需要调用的函数。entryPoint接受一个message参数。通常来说message是一个SendPort对象，用于两个Isolate之间的沟通。

paused表示新生成的Isolate是否处于暂停状态，他相当于：

```
isolate.pause(isolate.pauseCapability)
```

如果后续需要取消暂停状态，则可以调用：

```
isolate.resume(isolate.pauseCapability)
```

errorsAreFatal 对应的是setErrorsFatal方法。

onExit对应的是addOnExitListener, onError对应的是addErrorListener。

debugName表示的是Isolate在调试的时候展示的名字。

如果spawn出错，则会抛出IsolateSpawnException异常：

```
class IsolateSpawnException implements Exception {
  /// Error message reported by the spawn operation.
  final String message;
  @pragma("vm:entry-point")
  IsolateSpawnException(this.message);
  String toString() => "IsolateSpawnException: $message";
}
```

spawn方法生成的是和当前代码一样的Isolate。如果想要使用不同的代码来生成，则可以使用spawnUri,通过传入对应的Uri地址，从而生成不一样的code。

```
external static Future<Isolate> spawnUri(
      Uri uri,
      List<String> args,
      var message,
      {bool paused = false,
      SendPort? onExit,
      SendPort? onError,
      bool errorsAreFatal = true,
      bool? checked,
      Map<String, String>? environment,
      @Deprecated('The packages/ dir is not supported in Dart 2')
          Uri? packageRoot,
      Uri? packageConfig,
      bool automaticPackageResolution = false,
      @Since("2.3")
          String? debugName});
```

还有一种方式，就是使用Isolate的构造函数：

```
Isolate(this.controlPort, {this.pauseCapability, this.terminateCapability});
```

它有三个参数，第一个参数是controlPort，代表另外一个Isolate的控制权，后面两个capabilities是原isolate的子集，表示是否有pause或者terminate的权限。

一般用法如下：

```
Isolate isolate = findSomeIsolate();
Isolate restrictedIsolate = Isolate(isolate.controlPort);
untrustedCode(restrictedIsolate);
```

# Isolate之间的交互

所有的dart代码都是运行在Isolate中的，然后代码只能够访问同一个isolate内的class和value。那么多个isolate之间通信，可以ReceivePort和SendPort来实现。

先看下SendPort,SendPort是Capability的一种：

```
abstract class SendPort implements Capability 
```

SendPort用于向ReceivePort发送message, message可以有很多类型,包括：

Null，bool,int,double,String,List,Map,TransferableTypedData,SendPort和Capability。

> 注意，send动作是立马完成的。

事实上，SendPort是由ReceivePort来创建的。一个ReceivePort可以接收多个SendPort。

ReceivePort是Stream的一种：

```
abstract class ReceivePort implements Stream<dynamic>
```

作为Stream,它提供了一个listen用来处理接收到的消息：

```
  StreamSubscription<dynamic> listen(void onData(var message)?,
      {Function? onError, void onDone()?, bool? cancelOnError});
```

# 一个例子

讲了那么多原理，有的同学可能会问了，那么到底怎么用呢？

例子来了：

```
import 'dart:isolate';

var isolate;

void entryPoint(SendPort sendPort) {
  int counter = 0;
  sendPort.send("counter:$counter");
}
void main() async{
  final receiver = ReceivePort();
  receiver.listen((message) {
    print( "接收到消息 $message");
  });
  isolate = await Isolate.spawn(entryPoint, receiver.sendPort);
}
```

在主线程中，我们创建了一个ReceivePort，然后调用了它的listen方法来监听sendPort发过来的消息。

然后spawn出一个新的Isolate，这个Isolate会在初始化之后，调用entryPoint方法。

在这个entryPoint方法中又使用sendPort向ReceivePort发送消息。

最终运行，打印：

```
接收到消息 counter:0
```

# 总结

以上就是dart中的隔离机制和Isolate的使用。



