flutter系列之:在flutter中自定义themes

[toc]

# 简介

一般情况下我们在flutter中搭建的app基本上都是用的是MaterialApp这种设计模式，MaterialApp中为我们接下来使用的按钮，菜单等提供了统一的样式，那么这种样式能不能进行修改或者自定义呢？

答案是肯定的，一起来看看吧。

# MaterialApp中的themes

MaterialApp也是一种StatefulWidget,在MaterialApp中跟theme相关的属性有这样几个：

```
  final ThemeData? theme;
  final ThemeData? darkTheme;
  final ThemeData? highContrastTheme;
  final ThemeData? highContrastDarkTheme;
  final ThemeMode? themeMode;
```

先来看下ThemeMode的定义：

```
enum ThemeMode {
  system,
  light,
  dark,
}
```

ThemeMode是一个枚举类，里面有三个枚举值，分别是system，light和dark。

我们都知道现在手机有一个暗黑模式，ThemeMode的这三种模式就是为了适应暗黑模式而生的。

system表示是系统默认的模式，light是明亮模式，dark是暗黑模式。

而ThemeData则定义了主题中各种组件或者行动的配色。

那么如果我们想要实现自定义themes的功能，就可以利用这个ThemeData类来重写其中要重写的颜色。

ThemeData中还有专门为color变化定义的ColorScheme，还有为Text变化设置的TextTheme，这两个theme实际上是一系列的color集合。

除了ThemeData，flutter中还有一个类叫做Theme。

Theme是一个StatelessWidget，这个widget中包含了ThemeData，它提供了一个Theme.of方法来让子widget获得最近的ThemeData数据。

这就意味着，在flutter中，子widget可以使用和父widget不同的主题，非常的棒。

# 自定义themes的使用

那么如何使用自定义themes呢？有两种方式。

第一种就是在使用MaterialApp的时候传入自定义的themes，如下所示：

```
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}
```

但是这种操作实际是传入了一个全新的ThemeData，假如我们只想修改部分ThemeData中的数据应该如何处理呢？

我们可以使用Theme.of方法从当前的Theme中拷贝一份，然后再调用copyWith方法，传入要修改的自定义属性即可。

如下所示：

```
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: Theme.of(context).copyWith(useMaterial3: true),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}
```

前面我们提到了Theme这个widget，我们还可以将要自定义Theme的widget用Theme包裹起来，理论上我们可以将任何widget都用Theme来进行包装。

比如之前的floatingActionButton的实现是直接返回一个FloatingActionButton：

```
floatingActionButton: FloatingActionButton(
          onPressed: _incrementCounter,
          tooltip: 'Increment',
          child: const Icon(Icons.add),
        )
```

然后我们可以把FloatingActionButton用Theme包装起来，如下所示：

```
floatingActionButton: Theme(
        data: Theme.of(context).copyWith(focusColor: Colors.yellow),
        child: FloatingActionButton(
          onPressed: _incrementCounter,
          tooltip: 'Increment',
          child: const Icon(Icons.add),
        ),
      )
```

这样不同的组件就拥有了不同的theme。

# 总结

当我们需要自定义theme或者不同theme的时候，就可以考虑使用本文中使用的方法来进行theme的自定义了。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)




