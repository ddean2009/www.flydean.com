flutter系列之:flutter中的builder

[toc]

# 简介

flutter中有很多种Builder，虽然所有的builder都是构造器，但是不同的builder之间还是有很多差距的。今天我们来详细介绍一下Builder，LayoutBuilder，StatefulBuilder这几个builder的使用。

# Builder

Builder是flutter中最常用的builder，它是一个StatelessWidget,如下所示：

```
class Builder extends StatelessWidget
```

我们看下它的构造函数：

```
  const Builder({
    Key? key,
    required this.builder,
  }) : assert(builder != null),
       super(key: key);
```

可以看到Builder和普通的StatelessWidget的最大的差别就是需要传入一个builder属性，这个builder是一个WidgetBuilder类型的属性，

WidgetBuilder是这样定义的：

```
typedef WidgetBuilder = Widget Function(BuildContext context);
```

可以看到WidgetBuilder实际上是一个返回Widget的函数，这个函数在Builder被包含在parent's build方法中的时候，会被调用。

那么使用Builder和普通的StatelessWidget有什么区别呢？

我们举个例子，首先是在Scaffold中直接包含一个包括TextButton的Center widget，如下所示：

```
Widget build(BuildContext context) {
  return Scaffold(
    body: Center(
      child: TextButton(
        child: Text('TextButton'),
      )
    ),
  );
}
```

上面的Center也可以使用Builder来封装：

```
Widget build(BuildContext context) {
  return Scaffold(
    body: Builder(
      builder: (BuildContext context) {
        return Center(
          child: TextButton(
            child: Text('TextButton'),
          ),
        );
      },
    ),
  );
}
```

初看起来两者没有太大的区别，但是不同的是在下面的例子中，我们使用了Builder来构建body。

Builder的builder方法中我们传入了一个context，这个context是当前builder的context，我们可以通过这个context来获取到一些平时比较难获取到的对象。

对于Scaffold来说，它提供了一个of方法，可以根据传入的context来找到离context最近的Scaffold。这也是我们使用builder的目的：

```
Widget build(BuildContext context) {
  return Scaffold(
    body: Builder(
      builder: (BuildContext context) {
        return Center(
          child: TextButton(
            onPressed: () {
              print(Scaffold.of(context).hasAppBar);
            },
            child: Text('TextButton'),
          ),
        );
      },
    ),
  );
}
```

如上，我们可以在builder中，调用`Scaffold.of(context)`方法来获取对应的Scaffold对象。

如果只是使用普通的StatelessWidget的话，是没法拿到Scaffold对象的。

# StatefulBuilder

上一节我们提到的Buidler实际上是一个StatelessWidget，表明builder是无状态的。

而StatefulBuilder则和Builder不同，它是有状态的：

```
class StatefulBuilder extends StatefulWidget
```

可以看到StatefulBuilder继承自StatefulWidget。

和Builder很类似，StatefulBuilder也有一个builder属性，不过这个builder属性的类型是StatefulWidgetBuilder:

```
typedef StatefulWidgetBuilder = Widget Function(BuildContext context, StateSetter setState);
```

可以看到StatefulWidgetBuilder被调用的时候，不仅传入了BuildContext，还同时调用了setState方法。

StateSetter方法会导致Widget重构。

如果我们创建的widget是一个StatefulWidget的话，那么就可以尝试使用StatefulBuilder来代替：

```
 Widget build(BuildContext context) {
    return Center(
      child: Builder(
        builder: (BuildContext context) {
          int clicked = 0;
          return Center(
            child: StatefulBuilder(
              builder: (BuildContext context, StateSetter setState) {
                    return TextButton(onPressed: (){
                      setState(() => {clicked = 1 });
                    },
                        child: Text('TextButton'));
                  }),
                );
        },
      ),
    );
  }
```

# LayoutBuilder

Builder可以传递BuildContext， StatefulBuilder可以传递StateSetter，LayoutBuilder和上面提到的两个Builder很类似，不同的是LayoutBuilder可以提供父widget的大小。

我们先来看下LayoutBuilder的定义：

```
class LayoutBuilder extends ConstrainedLayoutBuilder<BoxConstraints> 
```

可以看到LayoutBuilder继承的类是不同的。

LayoutBuilder需要传入一个builder属性，这个builder是一个LayoutWidgetBuilder对象：

```
typedef LayoutWidgetBuilder = Widget Function(BuildContext context, BoxConstraints constraints);
```

具体的使用方法和Builder很类似，不同的是我们可以根据传入的BoxConstraints来进行对应的逻辑判断。

看一个具体的例子：

```
class LayoutBuilderApp extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        if (constraints.maxWidth > 500) {
          return buildWidget1();
        } else {
          return buildWidget2();
        }
      },
    );
  }

  Widget buildWidget1() {
    return Center(
      child: Container(
        height: 700.0,
        width: 700.0,
        color: Colors.blue,
      ),
    );
  }

  Widget buildWidget2() {
    return Center(
      child: Container(
        height: 200.0,
        width: 200.0,
        color: Colors.yellow,
      ),
    );
  }
```

上面的例子中，我们根据BoxConstraints的大小，来返回不同的Widget组件。

这在某些情况下是非常有用的。

# 总结

本文介绍了三个常用的Builder，大家可以仔细体会。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)












