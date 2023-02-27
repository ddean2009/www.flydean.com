flutter系列之:在flutter中使用导航Navigator

[toc]

# 简介

一个APP如果没有页面跳转那么是没有灵魂的，页面跳转的一个常用说法就是Navigator,flutter作为一个最为优秀的前端框架，Navigator肯定是必不可少的，那么在flutter中如何使用Navigator呢？

一起来看看吧。

# flutter中的Navigator

Navigator是flutter中用来导航的关键组件。我们先来看下Navigator的定义:

```
class Navigator extends StatefulWidget
```

Navigator首先是一个StatefulWidget，为什么是一个有状态的widget呢？这是因为Navigator需要在内部报错一些路由的信息，事实上Navigator中保存的就是一个栈结构的历史访问过的widget。

我们来看下它的构造函数，然后理解一下它内部的各个属性的含义：

```
  const Navigator({
    Key? key,
    this.pages = const <Page<dynamic>>[],
    this.onPopPage,
    this.initialRoute,
    this.onGenerateInitialRoutes = Navigator.defaultGenerateInitialRoutes,
    this.onGenerateRoute,
    this.onUnknownRoute,
    this.transitionDelegate = const DefaultTransitionDelegate<dynamic>(),
    this.reportsRouteUpdateToEngine = false,
    this.observers = const <NavigatorObserver>[],
    this.restorationScopeId,
  })
```

在这些属性中onGenerateRoute,pages,onGenerateInitialRoutes,transitionDelegate和observers这几个参数必须是非null。

首先是pages，pages是一个List对象:

```
  final List<Page<dynamic>> pages;
```

这里的pages存储的就是历史访问信息，Navigator的所有操作都是围绕着pages来的。

如果我们想在page切换的过程中添加一些动画，那么就可以用到transitionDelegate，如果我们要弹出一些page的话，那么可能会希望用到onPopPage callback方法来对pages list进行一些特殊处理。

另外initialRoute是需要第一个展示的route，Navigator还提供了两个方法用来在生成Route的时候进行触发：onGenerateRoute，onGenerateInitialRoutes。

Navigator提供了一系列的pop和push方法用来对路由进行跳转。

下面我们将会通过一个具体的例子来对Navigator进行详细的讲解。

# Navigator的使用

在这个例子中我们会使用Navigator的两个最基本的方法push和pop来进行路由的切换。

先来看下push方法的定义：

```
  static Future<T?> push<T extends Object?>(BuildContext context, Route<T> route) {
    return Navigator.of(context).push(route);
  }
```

push是一个静态方法，这意味着我们可以通过使用Navigator.push来进行调用。

push方法需要传入两个参数，分别是context和route。

为什么会有context呢？这是因为Navigator是和context相关联的，不同的context可以有不同的Navigator。

Route就是要导入的路由。

可以看到方法内部实际上是调用了Navigator.of方法，最后返回的是一个Future对象。

我们的例子是两个图片widget的简单切换。点击一个图像widget会调整到另外一个图像widget上，在另外一个图像widget上点击，会跳转回前一个widget。

我们可以这样定义第一个widget：

```
class FirstPage extends StatelessWidget {
  const FirstPage({Key? key}) : super(key: key);

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('First Page'),
      ),
      body: GestureDetector(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (context) {
            return const SecondPage();
          }));
        },
        child: Image.network(
          'http://www.flydean.com/wp-content/uploads/2019/06/cropped-head5.jpg',
        ),
      ),
    );
  }
```

这里的body我们放置了一个Image对象，然后在它的点击onTap操作时，调用了Navigator.push方法。

因为push方法需要一个Route对象，这里我们使用了最简单的MaterialPageRoute，然后返回第二个图像widget对象。

再来看看第二个图像Widget的定义：

```
class SecondPage extends StatelessWidget {
  const SecondPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        onTap: () {
          Navigator.pop(context);
        },
        child: Center(
          child: Image.network(
            'https://img-blog.csdnimg.cn/bb5b19255ab6406cb6bdc467ecc40462.webp',
          ),
        ),
      ),
    );
  }
}
```

和第一个图像widget一样，它的body也是一个image,然后在点击ontap方法中跳回到第一个图片widget去。

这里的跳回方法使用的是 Navigator.pop，我们来看下pop方法的实现：

```
  static void pop<T extends Object?>(BuildContext context, [ T? result ]) {
    Navigator.of(context).pop<T>(result);
  }
```

和push一样，pop方法也接收一个context对象，但是它还有一个可选的result参数。最后实际调用的是Navigator.of(context).pop方法。

result是做什么的呢？

还记得push方法吗？push方法会返回一个Future，也就是说push方法是有结果的，这个结果是从哪里来的呢？这个结果就是pop时候传进来的。

当我们调用push方法的时候，就会把这个result放在Future中返回。

运行上面的代码，首先我们得到第一个页面的widget：

![](https://img-blog.csdnimg.cn/ccbd05692a284a429799f5e4e89b0678.png)

点击就会调整到第二个图片widget:

![](https://img-blog.csdnimg.cn/e4483cce8a4244d3a6468d7b981f182b.png)

再次点击就会跳回第一个页面，非常的神奇。

# 总结

Navigator是每个flutter app都少不了的组件，希望大家能够掌握。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)











