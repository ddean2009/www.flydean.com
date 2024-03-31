---
slug: /13-dart-generators
---

# 13. 在dart中使用生成器



# 简介

ES6中在引入异步编程的同时，也引入了Generators,通过yield关键词来生成对应的数据。同样的dart也有yield关键词和生成器的概念。

什么时候生成器呢？所谓生成器就是一个能够持续产生某些数据的装置,也叫做generator。

# 两种返回类型的generator

根据是同步生成还是异步生成，dart返回的结果也是不同的。

如果是同步返回，那么返回的是一个Iterable对象.

如果是异步返回，那么返回的是一个Stream对象。

同步的generator使用sync*关键词如下：

```
Iterable<int> naturalsTo(int n) sync* {
  int k = 0;
  while (k < n) yield k++;
}
```

异步的generator使用的是async* 关键词如下：

```
Stream<int> asynchronousNaturalsTo(int n) async* {
  int k = 0;
  while (k < n) yield k++;
}
```

生成关键词使用的是yield。

如果yield后面跟着的本身就是一个generator，那么需要使用yield*。 

```
Iterable<int> naturalsDownFrom(int n) sync* {
  if (n > 0) {
    yield n;
    yield* naturalsDownFrom(n - 1);
  }
}
```

# Stream的操作

stream表示的是流，得到这个流之后，我们需要从流中取出对应的数据。

从Stream中取出数据有两种方式，第一种就是使用Stream本身的API来获取Stream中的数据。

最简单的就是调用stream的listen方法：

```
  StreamSubscription<T> listen(void onData(T event)?,
      {Function? onError, void onDone()?, bool? cancelOnError});
```

listen可以接数据的处理方法,具体使用如下：

```
 final startingDir = Directory(searchPath);
      startingDir.list().listen((entity) {
        if (entity is File) {
          searchFile(entity, searchTerms);
        }
      });
```

默认的方法是onData方法。

另外一种就是今天要讲解的await for.

await for的语法如下：

```
await for (varOrType identifier in expression) {
  // Executes each time the stream emits a value.
}
```
要注意的是上面的expression必须是一个Stream对象。并且await for必须用在async中，如下：

```
Future<void> main() async {
  // ...
  await for (final request in requestServer) {
    handleRequest(request);
  }
  // ...
}
```

如果要想中断对stream的监听，则可以使用break或者return。

# 总结

以上就是dart中生成器的使用了。




