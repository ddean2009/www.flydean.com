---
slug: /17-flutter-ui-indexed-stack
---

# 19. flutter中的IndexedStack



# 简介

之前我们介绍了一个flutter的栈结构的layout组件叫做Stack,通过Stack我们可以将一些widget叠放在其他widget之上，从而可以实现图像的组合功能，也是日常中最常用的一种组件了。今天我们要介绍的组件是Stack的近亲，叫做IndexedStack，它有什么功能呢？一起来看看吧。

# IndexedStack简介

从名字可以看出，IndexedStack是给Stack添加了一个index的功能，事实是否如此呢？我们先来看一下IndexedStack的定义：

```
class IndexedStack extends Stack 
```

可以看到IndexedStack继承自Stack，它实际上是Stack的子类，所以之前介绍的Stack有的功能IndexedStack全都有，并且IndexedStack是对Stack的功能进行了增强。

我们来看下它的构造函数：

```
  IndexedStack({
    Key? key,
    AlignmentGeometry alignment = AlignmentDirectional.topStart,
    TextDirection? textDirection,
    StackFit sizing = StackFit.loose,
    this.index = 0,
    List<Widget> children = const <Widget>[],
  }) : super(key: key, alignment: alignment, textDirection: textDirection, fit: sizing, children: children);
```

可以看到和Stack相比，IndexedStack多了一个index参数，但是这个参数并没有传入到super的构造函数中去，那么index到底是在哪里使用的呢？

别急，IndexedStack还重写了下面的两个方法,分别是createRenderObject和updateRenderObject：

```
  @override
  RenderIndexedStack createRenderObject(BuildContext context) {
    assert(_debugCheckHasDirectionality(context));
    return RenderIndexedStack(
      index: index,
      alignment: alignment,
      textDirection: textDirection ?? Directionality.maybeOf(context),
    );
  }

  @override
  void updateRenderObject(BuildContext context, RenderIndexedStack renderObject) {
    assert(_debugCheckHasDirectionality(context));
    renderObject
      ..index = index
      ..alignment = alignment
      ..textDirection = textDirection ?? Directionality.maybeOf(context);
  }
```

和Stack相比，IndexedStack在这两个方法中使用的是RenderIndexedStack，而Stack使用的是RenderStack。

所以虽然IndexedStack继承自Stack，但是两者在表现上是有本质区别的。

对于Stack来说，一个widget被放在另外一个widget之上，但是多个widget可以同时展示出来。而对于IndexedStack来说，它只会展示对应index的widget。

RenderIndexedStack也是继承自RenderStack:

```
class RenderIndexedStack extends RenderStack 
```

我们看下它的paintStack方法：

```
  @override
  void paintStack(PaintingContext context, Offset offset) {
    if (firstChild == null || index == null)
      return;
    final RenderBox child = _childAtIndex();
    final StackParentData childParentData = child.parentData! as StackParentData;
    context.paintChild(child, childParentData.offset + offset);
  }
```

可以看到在paintStack方法中，只绘制了和index对应的_childAtIndex这个组件，所以如果index不匹配的话，并不会展示出来。

IndexedStack的表现有点像我们常见的tab。

# IndexedStack的使用

从上面IndexedStack的构造函数中，我们知道IndexedStack需要传入一个index属性和对应的children。

在本例中，我们给IndexedStack传入一个可变的index属性，和4个child：

```
IndexedStack(
          index: _counter,
          children: [
            widgetOne(),
            widgetTwo(),
            widgetThree(),
            widgetFour(),
          ],
        )
```

_counter是定义在StatefulWidget中的变量。可以通过调用setState方法对index进行修改，从而实现动态切换child的目的。

这里的child widget很简单，我们使用了不同大小的SizedBox，SizedBox中设置不同的color来方便观察切换的效果：

```
  Widget widgetOne() {
    return SizedBox(
      width: 100,
      height: 100,
      child: Container(
        color: Colors.yellow,
      ),
    );
  }
```

最后，在Scaffold的floatingActionButton中调用_changeIndex方法实现index的改变，最终的代码如下：

```
class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _changeIndex() {
    setState(() {
      _counter = (_counter+1) % 4;
      print(_counter);
    });
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: IndexedStack(
          index: _counter,
          children: [
            widgetOne(),
            widgetTwo(),
            widgetThree(),
            widgetFour(),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _changeIndex,
        tooltip: 'change index',
        child: const Icon(Icons.arrow_back),
      ), 
    );
  }
```

程序运行之后的效果如下：

![](https://img-blog.csdnimg.cn/de2406cc0fd944a0b6e760367dfb9d79.png)

通过点击右下方的按钮，我们得到了不同的widget。

# 总结

IndexWidget和tab有点类似，大家可以在需要的时候使用。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)
