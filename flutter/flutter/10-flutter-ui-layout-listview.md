flutter系列之:flutter中常用的ListView layout详解

[toc]

# 简介

ListView是包含多个child组件的widget，在ListView中所有的child widget都是以list的形式来呈现的，你可以自定义List的方向，但是和GridView不同的是ListView中的每一个List里面都只包含一个widget。

今天我们来详细了解一下ListView的底层实现和具体的应用。

# ListView详解

和GridView一样，ListView也是继承自ScrollView，表示它是一个可以滚动的View。

具体而言，ListView首先继承自BoxScrollView：

```
class ListView extends BoxScrollView
```

然后BoxScrollView又继承自ScrollView:

```
abstract class BoxScrollView extends ScrollView 
```

## ListView中的特有属性

首先我们来看下ListView中的特有属性，ListView和它的父类相比，多了三个属性，分别是itemExtent,prototypeItem和childrenDelegate。

其中itemExtent是一个double类型的数据，如果给定的是一个非空值，那么表示的是child在scroll方向的extent大小。这个属性主要用来控制children的extend信息，这样每个child就不需要自行来判断自己的extend。

使用itemExtent的好处在于，ListView可以统一的在滚动机制上进行优化，从而提升性能表现。

prototypeItem是一个widget，从名字就可以看出，这个一个prototype的widget，也就是说是一个原型，其他的child可以参照这个原型widget的大小进行extent的设置。

ListView中的最后一个自定义属性是childrenDelegate，这个childrenDelegate和GridView中的含义是一样的，用来生成ListView中child。

之前我们在讲解GirdView的时候有提到过，GirdView中还有一个自定义的属性叫做gridDelegate，这个gridDelegate是一个SliverGridDelegate的实例，用来控制子组件在GridView中的布局。

因为ListView的子组件的布局是已经确定的，所以就不再需要gridDelegate了，这是ListView和GridView的一大区别。

ListView作为一个继承的类，需要实现一个buildChildLayout的方法：

```
  @override
  Widget buildChildLayout(BuildContext context) {
    if (itemExtent != null) {
      return SliverFixedExtentList(
        delegate: childrenDelegate,
        itemExtent: itemExtent!,
      );
    } else if (prototypeItem != null) {
      return SliverPrototypeExtentList(
        delegate: childrenDelegate,
        prototypeItem: prototypeItem!,
      );
    }
    return SliverList(delegate: childrenDelegate);
  }
```

这个方法的实现逻辑和我们之前讲到的三个属性是相关联的，在buildChildLayout中，如果itemExtent有值的话，因为itemExtent本身就是一个固定值，所以返回的是SliverFixedExtentList。

如果itemExtent没有设置，并且prototypeItem有值的话，返回的是一个SliverPrototypeExtentList。

最后，如果itemExtent和prototypeItem都没有设置的话，返回的是一个SliverList对象。

## ListView的构造函数

和GridView一样，为了满足我们的多样性的设计需求，ListView也提供了多个构造函数。

首先我们来看下ListView的最基本的构造函数：

```
ListView({
    Key? key,
    Axis scrollDirection = Axis.vertical,
    bool reverse = false,
    ScrollController? controller,
    bool? primary,
    ScrollPhysics? physics,
    bool shrinkWrap = false,
    EdgeInsetsGeometry? padding,
    this.itemExtent,
    this.prototypeItem,
    bool addAutomaticKeepAlives = true,
    bool addRepaintBoundaries = true,
    bool addSemanticIndexes = true,
    double? cacheExtent,
    List<Widget> children = const <Widget>[],
    int? semanticChildCount,
    DragStartBehavior dragStartBehavior = DragStartBehavior.start,
    ScrollViewKeyboardDismissBehavior keyboardDismissBehavior = ScrollViewKeyboardDismissBehavior.manual,
    String? restorationId,
    Clip clipBehavior = Clip.hardEdge,
  })
```

这里itemExtent和prototypeItem这两个属性是外部传入的，childrenDelegate是通过其他的参数构造而来的：

```
 childrenDelegate = SliverChildListDelegate(
         children,
         addAutomaticKeepAlives: addAutomaticKeepAlives,
         addRepaintBoundaries: addRepaintBoundaries,
         addSemanticIndexes: addSemanticIndexes,
       ),
```

ListView中所有的child组件都在List Widget的children中。

这个默认的构造函数，适用于child比较少的情况，因为需要一次传入所有的child组件到list中，所以对性能的影响还是挺大的，并且传入的child是不可变的。

如果child比较多的情况下，就需要使用到其他的构造函数了,比如 ListView.builder。

ListView.builder使用的是builder模式来构建child组件，具体而言他的childrenDelegate实现如下：

```
childrenDelegate = SliverChildBuilderDelegate(
         itemBuilder,
         childCount: itemCount,
         addAutomaticKeepAlives: addAutomaticKeepAlives,
         addRepaintBoundaries: addRepaintBoundaries,
         addSemanticIndexes: addSemanticIndexes,
       ),
```

这里的childrenDelegate是一个SliverChildBuilderDelegate,通过传入itemBuilder和总的itemCount就可以实现动态创建child的功能。

在ListView的实际使用过程中，为了页面好看或者更有区分度，我们一般会在list的item中添加一些分隔符separator,为了自动化实现这个功能，ListView提供了一个ListView.separated的构造函数，用来提供list item中间的分隔符。

ListView.separated需要传入两个IndexedWidgetBuilder,分别是itemBuilder和separatorBuilder。

下面是childrenDelegate的具体实现：

```
 childrenDelegate = SliverChildBuilderDelegate(
         (BuildContext context, int index) {
           final int itemIndex = index ~/ 2;
           final Widget widget;
           if (index.isEven) {
             widget = itemBuilder(context, itemIndex);
           } else {
             widget = separatorBuilder(context, itemIndex);
             assert(() {
               if (widget == null) {
                 throw FlutterError('separatorBuilder cannot return null.');
               }
               return true;
             }());
           }
           return widget;
         },
         childCount: _computeActualChildCount(itemCount),
         addAutomaticKeepAlives: addAutomaticKeepAlives,
         addRepaintBoundaries: addRepaintBoundaries,
         addSemanticIndexes: addSemanticIndexes,
         semanticIndexCallback: (Widget _, int index) {
           return index.isEven ? index ~/ 2 : null;
         },
       ),
```

可以看到，如果index是even的话就会使用itemBuilder生成一个widget，如果index是odd的话，就会使用separatorBuilder来生成一个separator的widget。

最后，ListView还有一个更加开放的构造函数ListView.custom,custom和其他构造函数不同的地方在于他可以自定义childrenDelegate，从而提供了更多的扩展空间。

# ListView的使用

有了上面的构造函数，我们可以很方便的根据自己的需要来使用ListView，下面是一个简单的使用图片做child的例子：

```
class ListViewApp extends StatelessWidget{
  const ListViewApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (BuildContext context, int index) {
        return Container(
            constraints: const BoxConstraints(maxWidth:100,maxHeight: 100),
            child: Image.asset('images/head.jpg')
        );
      },
    );
  }
}
```

上面的例子中，我们使用的是ListView.builder构造函数，返回的Widget中，中的widget个数是5，每个item是由itemBuilder来生成的。

这里我们把Image封装在一个Container中，并且为Container设置了一个constraints来控制图片的大小。

最终生成的界面如下：

![](https://img-blog.csdnimg.cn/89b2e12877e446c6b459d5b40214f3b2.png)

上面的例子中，item之间是没有分隔符的，我们可以讲上面的例子进行稍微的修改一下，使用ListView.separated来构造ListView，如下所示：

```
class ListViewSeparatedApp extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
           itemCount: 10,
           separatorBuilder: (BuildContext context, int index) => const Divider(),
           itemBuilder: (BuildContext context, int index) {
             return Container(
                 constraints: const BoxConstraints(maxWidth:50,maxHeight: 50),
               child: Image.asset('images/head.jpg')
             );
           },
         );
  }
}
```

这里我们需要传入separatorBuilder来作为分隔符，为了简单起见，我们直接使用了Divider这个widget。

最后生成的界面如下：

![](https://img-blog.csdnimg.cn/ccfc30955f0446968f76e481b68e3082.png)

# 总结

以上就是ListView的介绍和基本的使用。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)



