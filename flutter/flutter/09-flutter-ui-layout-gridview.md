flutter系列之:flutter中常用的GridView layout详解

[toc]

# 简介 

GridView是一个网格化的布局，如果在填充的过程中子组件超出了展示的范围的时候，那么GridView会自动滚动。

因为这个滚动的特性，所以GridView是一个非常好用的Widget。今天我们一起来探索一下GridView这个layout组件的秘密。

# GridView详解

GridView是一个可滚动的view,也就是ScrollView,事实上GridView继承自BoxScrollView:

```
class GridView extends BoxScrollView
```

而它的父类BoxScrollView，则是继承自ScrollView:

```
abstract class BoxScrollView extends ScrollView 
```

可以看到BoxScrollView是一个抽象类，它有两个子类，分别是今天我们要讲的GridView和下期要讲的ListView。

这两个组件的区别是GridView是一个2D的布局，而ListView是一个线性layout的布局。

作为BoxScrollView的子类，GridView需要实现buildChildLayout方法如下所示：

```
  @override
  Widget buildChildLayout(BuildContext context) {
    return SliverGrid(
      delegate: childrenDelegate,
      gridDelegate: gridDelegate,
    );
  }
```

这里GridView返回了一个SliverGrid，这个SliverGrid中有两个属性，分别是childrenDelegate和gridDelegate。

其中gridDelegate是一个SliverGridDelegate的实例，用来控制子组件在GridView中的布局。

childrenDelegate是一个SliverChildDelegate的实例，用来生成GridView中的子组件。

这两个属性在GridView的构造函数中有使用，我们接下来会详细进行讲解。

## GridView的构造函数

GridView有很多个构造函数,首先是包含所有参数的全参数构造函数:

```
  GridView({
    Key? key,
    Axis scrollDirection = Axis.vertical,
    bool reverse = false,
    ScrollController? controller,
    bool? primary,
    ScrollPhysics? physics,
    bool shrinkWrap = false,
    EdgeInsetsGeometry? padding,
    required this.gridDelegate,
    bool addAutomaticKeepAlives = true,
    bool addRepaintBoundaries = true,
    bool addSemanticIndexes = true,
    double? cacheExtent,
    List<Widget> children = const <Widget>[],
    int? semanticChildCount,
    DragStartBehavior dragStartBehavior = DragStartBehavior.start,
    Clip clipBehavior = Clip.hardEdge,
    ScrollViewKeyboardDismissBehavior keyboardDismissBehavior = ScrollViewKeyboardDismissBehavior.manual,
    String? restorationId,
  })
```

在这个构造函数中，需要传入自定义的gridDelegate，所以在构造函数中gridDelegate是required状态：

```
required this.gridDelegate
```

上面提到了GridView中的两个自定义属性，还有一个是childrenDelegate,这个属性是根据传入的其他参数构造而成的，如下所示：

```
childrenDelegate = SliverChildListDelegate(
         children,
         addAutomaticKeepAlives: addAutomaticKeepAlives,
         addRepaintBoundaries: addRepaintBoundaries,
         addSemanticIndexes: addSemanticIndexes,
       ),
```

另外一个GridView的构造函数叫做GridView.builder，这个构造函数和默认的构造函数的区别在于childrenDelegate的实现不同，我们来看下GridView.builder中childrenDelegate的实现：

```
childrenDelegate = SliverChildBuilderDelegate(
         itemBuilder,
         childCount: itemCount,
         addAutomaticKeepAlives: addAutomaticKeepAlives,
         addRepaintBoundaries: addRepaintBoundaries,
         addSemanticIndexes: addSemanticIndexes,
       ),
```

对比发现，GridView.builder中的childrenDelegate多了两个参数，分别是itemBuilder和itemCount。

那么这个两个参数是做什么用的呢？

考虑一下一个有很多chil的GridView，为了提升GridView的展示性能，我们不可能一下取出所有的child元素进行构建，而是会在滚动中进行动态创建和绘制，而这里的itemCount就是child的最大容量。

而itemBuilder就是一个动态创建child的创建器，从而满足了动态创建child的需求。

接下来的构造函数叫做GridView.custom，因为叫做custom，所以这个构造函数的SliverGridDelegate和SliverChildDelegate都是可以自定义的，也就是说这两个参数都可以从外部传入,所以这两个参数都是必须的：

```
  required this.gridDelegate,
    required this.childrenDelegate
```

GirdView还有一个构造函数叫做GridView.count，这里的count是指GridView可以指定cross axis中可以包含的组件个数，所以这里的gridDelegate使用的是一个SliverGridDelegateWithFixedCrossAxisCount:

```
gridDelegate = SliverGridDelegateWithFixedCrossAxisCount(
         crossAxisCount: crossAxisCount,
         mainAxisSpacing: mainAxisSpacing,
         crossAxisSpacing: crossAxisSpacing,
         childAspectRatio: childAspectRatio,
       ),
```

可以设置crossAxisCount的值。

最后一个GridView的构造函数叫做GridView.extent，它和count的构造函数很类似，不过extent提供的是一个maximum cross-axis extent,而不是一个固定的count值,所以这里的gridDelegate是一个SliverGridDelegateWithMaxCrossAxisExtent对象：

```
gridDelegate = SliverGridDelegateWithMaxCrossAxisExtent(
         maxCrossAxisExtent: maxCrossAxisExtent,
         mainAxisSpacing: mainAxisSpacing,
         crossAxisSpacing: crossAxisSpacing,
         childAspectRatio: childAspectRatio,
       ),
```

怎么理解呢？举个例子，如果GirdView是竖向滚动的，并且它的width是400 pixels,如果这个时候maxCrossAxisExtent被设置为120，那么一行只能有三列。我们可以通过调整maxCrossAxisExtent的值，来调整view的展示情况。

我们可以根据需要来选择对应的构造函数，从而满足我们不同的需求。

# GridView的使用

有了GridView的构造函数，GridView使用起来就很简单了。

比如我们动态创建一个包含image的child，组成一个gridView：

```
class GridViewApp extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    return GridView.extent(
        maxCrossAxisExtent: 100,
        padding: const EdgeInsets.all(4),
        mainAxisSpacing: 4,
        crossAxisSpacing: 4,
        children: buildChild(10));
  }
```

这里的buildChild用来生成一个包含Widget的list，如下所示：

```
  List<Widget> buildChild(int number) {
    return List.generate(
        number, (i) => Container(
        child: Image.asset('images/head.jpg')));
  }
```

最后将构造的GridViewApp放到Scaffold的body中运行：

```
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: GridViewApp(),
      ),
    );
  }
```

最后我们可以得到下面的图像：

![](https://img-blog.csdnimg.cn/52b89d87889746d8b3c25256c6517bee.png)

这里我们使用的是GridView.extent构造函数，大家可以自行尝试其他的构造函数。

# 总结

GridView是一个我们在日常工作中经常会使用的组件，希望大家能够熟练掌握。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)








