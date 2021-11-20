dart系列之:dart中的异步编程

[toc]

# 简介

熟悉javascript的朋友应该知道，在ES6中引入了await和async的语法，可以方便的进行异步编程,从而摆脱了回调地狱。dart作为一种新生的语言，没有理由不继承这种优秀的品质。很自然的，dart中也有await和async语言，一起来看看吧。

# 为什么要用异步编程

那么为什么要用异步编程呢？ 只用同步不能够解决吗？

其实大多情况下同步已经够用了，但是在下面的几种情况下，同步的场景还是有缺陷的。

1. 需要花很长时间从网络上下载数据的情况。
2. 读取数据库的耗时情况。
3. 从文件读取数据的情况。

总结而言，如果某些操作需要花费大量的时间，那么就可以用到异步编程了。

# 怎么使用

async是方法的描述符，如果要使用await，则必须配合async一起使用：

```
Future<void> checkVersion() async {
  var version = await lookUpVersion();
  // Do something with version
}
```

> 注意，await后面一般接着的是Future对象。

先看一个错误使用异步编程的例子：

```

String createOrderMessage() {
  var order = fetchUserOrder();
  return 'Your order is: $order';
}

Future<String> fetchUserOrder() =>
    Future.delayed(
      const Duration(seconds: 2),
      () => 'Order one!',
    );

void main() {
  print(createOrderMessage());
}
```

上面的代码本意是打印出从数据库耗时取出的数据，但是结果并不是想象的那样，其原因就是fetchUserOrder方法是一个异步方法，所以不会立即返回，从而导致结果打印失败。

将上面的代码用async改写：

```
Future<String> createOrderMessage() async {
  var order = await fetchUserOrder();
  return 'Your order is: $order';
}

Future<String> fetchUserOrder() =>
    Future.delayed(
      const Duration(seconds: 2),
      () => 'Large Latte',
    );

Future<void> main() async {
  print('Fetching user order...');
  print(await createOrderMessage());
}
```

# Future

上面我们在使用async和await的过程中使用到了Future。在java中Future表示的是线程的执行结果。在dart中Future表示的是一个异步执行的结果。

Future有两种状态：uncompleted 或者 completed。

当最开始执行一个异步函数的时候，会返回一个未完成的Future。这个未完成的Future会等等异步执行的完成或者失败。

不管异步程序是成功还是失败，最终都会返回一个完成状态。

async返回的Future可以接泛型，表示的时候返回的具体类型，比如Future<String> 表示的是返回一个字符串,而 Future<void>表示不返回任何值。

下面是两个不同返回的例子：

```
Future<String> fetchUserOrder() {
  return Future.delayed(const Duration(seconds: 2), () => 'Large Latte');
}

Future<void> fetchUserOrder() {
  return Future.delayed(const Duration(seconds: 2), () => print('Large Latte'));
}
```

下面是一个异常的例子：

```
Future<void> fetchUserOrder() {
  return Future.delayed(const Duration(seconds: 2),
      () => throw Exception('Logout failed: user ID is invalid'));
}
```

# 异步异常处理 

在async的函数中，对await的异步方法中抛出的异常，可以直接是用try catch来进行异常的捕获：

```
try {
  print('Awaiting user order...');
  var order = await fetchUserOrder();
} catch (err) {
  print('Caught error: $err');
}
```

# 在同步函数中调用异步函数

上面介绍的fetchUserOrder()返回的是一个Future<String>，表示的是一个异步执行的过程。

那么如果是一个同步的方法，比如main()函数中，如何去调用异步方法，并且得到返回值呢？

await肯定是不行的，因为await只能在async的方法中调用。这个时候就可以用到then语句：

```
fetchUserOrder().then(order=>'do something');
```
then语句会等待异步执行返回结果，然后对结果进行处理，实际上就等同于javascript中的回调。

# 总结

以上就是dart中async和await的用法。





