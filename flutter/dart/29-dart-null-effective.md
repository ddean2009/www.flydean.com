dart系列之:null使用最佳实践

[toc]

# 简介

null可能是大家在编写程序中最为头疼的一个东西，稍不留意的情况下就有可能使用到了这个空字符。所以dart在2.12引入了nll safety，默认情况下强制所有的类型都不为null，只有在你认为它可以为null的时候才可以设置为null。

虽然有了null safety,但是这里还有一些我们需要考虑的null的最佳实践。

# 不需要初始化对象为null

在dart2.12之后，所有的对象都强制为非空的，除非你显示指定其为可空的对象。

如果一个对象可以为空，那么我们可以这样指定：

```
String? name;
```

如果定义一个对象可以为空，那么对dart来说会隐式对其初始化为null。

所以下面的显示初始化为null是完全没有必要的：

```
String? name=null;
```

同样的，如果参数是一个可以为空的对象，那么dart也会将其初始化为null，我们也没有必要显示去设置其值：

```
void echoName(String? name){
    print(name);
}
```

# null的三元操作符

所谓三元就是有三个变量，我们常见的三元操作符就是?:，通常来说是这样用的：

```
name==null?true:false;
```

上面的逻辑实际上是把一个null转换成了一个bool类型。

为了实现这个功能，dart提供了一个更加简洁的操作符？？， 可以这样使用：

```
name??false;
```

上面的代码表示如果name是空，则返回false。

注意，这里只是返回值改变了，但是name值本身并没有变化，也不会将name从一个可为空的类型，变成不为空的类型。所以如果我们在if语句里面对字符进行判断，则还是需要显示进行null的比较：

```
int measureMessage(String? message) {
  if (message != null && message.isNotEmpty) {
      // dart知道message不为空
    return message.length;
  }

  return 0;
}
```

如果这样编写，则会出现异常：

```
int measureMessage(String? message) {
  if (message?.isNotEmpty ?? false) {
    //dart并不知道message不为空
    return message!.length;
  }

  return 0;
}

```

# 如果在使用中需要判断类型是否为空，则不要使用late

late是做什么用的呢？late表示该类型目前不会初始化，但是会在未来的某个时间对其进行初始化。

所以，如果你用late表示某个类型，那么在后续使用的时候是不需要进行手动判断该类型是否为空的。

如果你仍然要手动判断，那么就没必要设置该类型为late。

# 本地变量的类型提升

dart有一个非常好的特性，就是当我们判断一个变量不为空之后，该变量就会被提升为非空变量。

当提升为非空变量之后，就可以自由访问该非空变量内部的属性和方法了。

但是可惜的是，dart中的类型提升只是针对与local变量或者参数而言的，对于类变量或者是top level的变量并不适用，所以我们需要将这些变量拷贝到本地变量，从而使用类型提升的特性。

我们看下面的例子：

```
class UploadException {
  final Response? response;

  UploadException([this.response]);

  @override
  String toString() {
    var response = this.response;
    if (response != null) {
      return 'Could not complete upload to ${response.url} '
          '(error code ${response.errorCode}): ${response.reason}.';
    }

    return 'Could not upload (no response).';
  }
}
```

其中UploadException中的response是一个顶级变量，虽然我们对其进行测试是否为空，但是在使用的过程中还是不能直接访问其内部的属性，因为response可能为空。

为了使用dart的类型提升的特性，我们可以将顶级的变量赋值给一个本地变量，从而在null测试之后，自动将其提升为非空的类型，从而直接访问其内部的属性。

# 总结

以上就是dart中null用法的最佳实践。




