---
slug: /07-flutter-ui-layout-overview
---

# 8. UI layout简介



# 简介

对于一个前端框架来说，除了各个组件之外，最重要的就是将这些组件进行连接的布局了。布局的英文名叫做layout，就是用来描述如何将组件进行摆放的一个约束。

在flutter中，基本上所有的对象都是widget,对于layout来说也不例外。也就是说在flutter中layout也是用代码来完成的，这和其他的用配置文件来描述layout的语言有所不同。

你可以把layout看做是一种看不见的widget，这些看不见的widget是用来作用在可见的widget对象上，给他们实施一些限制。

# flutter中layout的分类

flutter中的layout widget有很多，他们大概可以分为三类，分别是只包含一个child的layout widget，可以包含多个child的layout widget和可滑动的Sliver widgets。

这三种layout也有很多种具体的实现，对于Single-child layout widgets来说，包含下面这些widgets：

* Align -- 用来对其包含在其中的组件进行对其操作。
* AspectRatio -- 对其中的组件进行比例缩放。
* Baseline -- 通过使用子组件的baseline来进行定位。
* Center -- 自组件位于中间。
* ConstrainedBox -- 类似于IOS中的constrain,表示子组件的限制条件。
* Container -- 一个常用的widget，可以用来包含多个其他的widget。
* CustomSingleChildLayout -- 将其单个子项的布局推迟。
* Expanded -- 将Row, Column 或者 Flex的child进行扩展。
* FittedBox -- 根据fit来缩放和定位其child。
* FractionallySizedBox -- 将child按照总可用空间进行调整。
* IntrinsicHeight -- 一个将其child调整为child固有高度的小部件。
* IntrinsicWidth -- 一个将其child调整为child固有宽度的小部件。
* LimitedBox -- 限制一个box的size。
* Offstage -- 将child放入render tree中，但是却并不触发任何重绘。
* OverflowBox -- 允许child覆盖父组件的限制。
* Padding -- 为child提供padding。
* SizedBox -- 给定size的box。
* SizedOverflowBox -- 可以覆盖父组件限制的box。
* Transform -- 子组件可以变换。

以上是包含单个child的layout组件，下面是可以包含多个child的layout组件：

* Column -- 表示一列child。
* CustomMultiChildLayout -- 使用代理来定位和缩放子组件。
* Flow -- 流式布局。
* GridView -- 网格布局。
* IndexedStack -- 从一系列的child中展示其中的一个child。
* LayoutBuilder -- 可以依赖父组件大小的widget tree。
* ListBody -- 根据给定的axis来布局child。
* ListView -- 可滚动的列表。
* Row -- 表示一行child。
* Stack -- 栈式布局的组件。
* Table -- 表格形式的组件。
* Wrap -- 可以对子child进行动态调整的widget。

可滑动的Sliver widgets有下面几种：

* CupertinoSliverNavigationBar -- 是一种IOS风格的导航bar。
* CustomScrollView -- 可以自定义scroll效果的ScrollView。
* SliverAppBar -- material风格的app bar,其中包含了CustomScrollView。
* SliverChildBuilderDelegate -- 使用builder callback为slivers提供child的委托。
* SliverChildListDelegate -- 使用list来为livers提供child的委托。
* SliverFixedExtentList -- 固定axis extent的sliver。
* SliverGrid -- child是二维分布的sliver。
* SliverList -- child是线性布局的sliver。
* SliverPadding -- 提供padding的sliver。
* SliverPersistentHeader -- 可变size的sliver。
* SliverToBoxAdapter -- 包含单个box widget的Sliver。

# 常用layout举例

上面我们列出了所有的flutter layout，他们几乎满足了我们在程序中会用到的所有layout需求，这里我们以两个最基本和最常用的layout：Row和Column为例，来详细讲解layout的使用。

Row和Column都属于上面讲到的多个child的layout widget，它里面可以包含多个其他的widget组件。

先看一下Row和column的定义。

```
class Row extends Flex {
  Row({
    Key? key,
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
    MainAxisSize mainAxisSize = MainAxisSize.max,
    CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.center,
    TextDirection? textDirection,
    VerticalDirection verticalDirection = VerticalDirection.down,
    TextBaseline? textBaseline, // NO DEFAULT: we don't know what the text's baseline should be
    List<Widget> children = const <Widget>[],
  }) : super(
    children: children,
    key: key,
    direction: Axis.horizontal,
    mainAxisAlignment: mainAxisAlignment,
    mainAxisSize: mainAxisSize,
    crossAxisAlignment: crossAxisAlignment,
    textDirection: textDirection,
    verticalDirection: verticalDirection,
    textBaseline: textBaseline,
  );
}
```

```
class Column extends Flex {
  Column({
    Key? key,
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
    MainAxisSize mainAxisSize = MainAxisSize.max,
    CrossAxisAlignment crossAxisAlignment = CrossAxisAlignment.center,
    TextDirection? textDirection,
    VerticalDirection verticalDirection = VerticalDirection.down,
    TextBaseline? textBaseline,
    List<Widget> children = const <Widget>[],
  }) : super(
    children: children,
    key: key,
    direction: Axis.vertical,
    mainAxisAlignment: mainAxisAlignment,
    mainAxisSize: mainAxisSize,
    crossAxisAlignment: crossAxisAlignment,
    textDirection: textDirection,
    verticalDirection: verticalDirection,
    textBaseline: textBaseline,
  );
}
```

可以看到Row和Column都继承自Flex，并且他们的构造方法都是调用了Flex的构造方法，两者的区别就在于direction不同，Row的direction是Axis.horizontal，而Column的direction是Axis.vertical。

那么什么是Flex呢？

Flex是一个widget，在Flex中的子组件会按照某一个指定的方向进行展示。这个方向是可以控制的，比如横向或者竖向，如果你已经提前知道了主轴的方向，那么可以使用Row或者Column来替代Flex，因为这样更加简洁。

在Flex中，如果想要child在某个方向填满可用空间，则可以将该child包装在Expanded中。

要注意的是，Flex是不可滚动的，如果Flex中的child太多，超出了Flex中的可用空间，那么Flex将会报错，所以如果你需要展示很多child的情况下，可以考虑使用可滚动的组件，比如ListView。

如果你只有一个child，那么就没有必要使用Flex或者Row和Column了，可以考虑使用Align或者Center来对child进行定位。

在Flex中有几个非常重要的参数，比如mainAxisAlignment表示的是子组件沿主轴方向的排列规则，mainAxisSize表示的是主轴的size大小，crossAxisAlignment表示的是和主轴垂直轴的子组件排列规则。当然还有它最最重要的children属性，children是一个Widget的list列表，用来存储要展示的子组件。

以Row为例，我们创建一个简单的RowWidget:

```
class RowWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      textDirection: TextDirection.ltr,
      children: [
        YellowBox(),
        YellowBox(),
        YellowBox(),
      ],
    );
  }
}
```

这里我们返回了一个Row对象，设置了textDirection和children属性。

children里面是自定义的YellowBox：

```
class YellowBox extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50,
      height: 50,
      decoration: BoxDecoration(
        color: Colors.yellow,
        border: Border.all(),
      ),
    );
  }
}
```

YellowBox是一个长和宽都是50的正方形。我们这里使用了BoxDecoration对其上色。

最后将RowWidget放到Scaffold的body里面，如下所示：

```
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: RowWidget()
    );
  }
```

我们可以看到下面的图像：

![](https://img-blog.csdnimg.cn/662c55fd20a3491fa0f2df4afe451a2f.png)

大家可以看到YellowBox是紧贴在一起的，如果我们想要均匀分别该如何做呢？

我们可以在Row中添加一个属性叫做mainAxisAlignment,取值如下：

```
mainAxisAlignment: MainAxisAlignment.spaceEvenly
```

重新运行，生成的图像如下：

![](https://img-blog.csdnimg.cn/de27d7a4b9ab4f9c8fa8b4e464d70dba.png)

上面我们还提到了一个Expanded组件，可以用来填充剩余的可用空间，我们把最后一个YellowBox用Expanded围起来，如下所示：

```
    return Row(
      textDirection: TextDirection.ltr,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        YellowBox(),
        YellowBox(),
        Expanded(
          child: YellowBox(),
        )
      ],
    );
```

生成的图像如下：

![](https://img-blog.csdnimg.cn/b0bcbbd09fec4c61b78d135ec1cfe3e5.png)

可以看到最后一个Box填充到了整个Row剩余的空间。

大家要注意，这时候mainAxisAlignment是没有效果的。

如果观察Expanded的构造函数，可以看到Expanded还有一个flex属性:

```
  const Expanded({
    Key? key,
    int flex = 1,
    required Widget child,
  }) : super(key: key, flex: flex, fit: FlexFit.tight, child: child);
```

flex属性表示的是flex factor,默认值是1，还是上面的例子，我们将flex调整为2，看看效果：

```
children: [
        YellowBox(),
        YellowBox(),
        Expanded(
          flex:2,
          child: YellowBox(),
        )
      ],
```

运行的结果和flex=1是一样的，为什么呢？

事实上这个flex表示的是相对于其他Expanded的组件所占用的空间比例。我们可以讲所有的子组件都用Expanded进行扩充，然后再看看效果：

```
      children: [
        Expanded(
          child: YellowBox(),
        ),
        Expanded(
          child: YellowBox(),
        ),
        Expanded(
          flex: 2,
          child: YellowBox(),
        )
      ],
```

运行结果如下：

![](https://img-blog.csdnimg.cn/0063257f7d7246c39d693a6398fe8662.png)

可以看到最后一个child占用的空间是前面两个的两倍。

如果我们想要在YellowBox中间添加空格怎么办呢？有两种方法。

第一种方法是使用SizedBox，如下：

```
children: [
        Expanded(
          child: YellowBox(),
        ),
        SizedBox(
          width: 100,
        ),
        Expanded(
          child: YellowBox(),
        ),
        Expanded(
          flex: 2,
          child: YellowBox(),
        )
      ],
```

![](https://img-blog.csdnimg.cn/c570f90a0daf435a9e5bfe58ca67daff.png)

SizedBox里面可以包含子child，从而重新设置子child的长度和高度。如果不包含子child则会生成一个空格。

还有一种方式是使用Spacer,如下所示：

```
      children: [
        Expanded(
          child: YellowBox(),
        ),
        Spacer(flex: 2),
        Expanded(
          child: YellowBox(),
        ),
        Expanded(
          flex: 2,
          child: YellowBox(),
        )
      ],
```

生成的图像如下：

![](https://img-blog.csdnimg.cn/1e86c5b6f6be48748b66afa195bd4d86.png)

Spacer和SizedBox都可以生成空白，不同的是Spacer可以和flex一起使用，而SizedBox必须固定size大小。

# 总结

以上就是fluter中layout和的分类和基本layout Row和Column的使用情况了。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)
