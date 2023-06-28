flutter系列之:做一个图像滤镜

[toc]

# 简介

很多时候，我们需要一些特效功能，比如给图片做个滤镜什么的，如果是h5页面，那么我们可以很容易的通过css滤镜来实现这个功能。

那么如果在flutter中，如果要实现这样的滤镜功能应该怎么处理呢？一起来看看吧。

# 我们的目标

在继续进行之前，我们先来讨论下本章到底要做什么。最终的目标是希望能够实现一个图片的滤镜功能。

那么我们的app界面实际上可以分为两个部分。第一个部分就是带滤镜效果的图片，第二个部分就是可以切换的滤镜按钮。

接下来我们一步步来看如何实现这些功能。

# 带滤镜的图片

要实现这个功能其实比较简单，我们构建一个widget，因为这个widget中的图片需要根据自身选择的滤镜颜色来改变图片的状态，所以这里我们需要的是一个StatefulWidget,在state里面，存储的就是当前的_filterColor。

构建一个图片的widget的代码可以如下所示：

```
class ImageFilterApp extends StatefulWidget {
  const ImageFilterApp({super.key});

  @override
  State<ImageFilterApp> createState() =>
      _ImageFilterAppState();
}

class _ImageFilterAppState
    extends State<ImageFilterApp> {
  final _filters = [
    Colors.white,
    ...Colors.primaries
  ];

  final _filterColor = ValueNotifier<Color>(Colors.white);

  void _onFilterChanged(Color value) {
    _filterColor.value = value;
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black,
      child: Stack(
        children: [
          Positioned.fill(
            child: _buildPhotoWithFilter(),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoWithFilter() {
    return ValueListenableBuilder(
      valueListenable: _filterColor,
      builder: (context, value, child) {
        final color = value;
        return Image.asset(
          'images/head.jpg',
          color: color.withOpacity(0.5),
          colorBlendMode: BlendMode.color,
          fit: BoxFit.cover,
        );
      },
    );
  }
}
```

在build方法中，我们返回了一个Positioned.fill填充的widget，这个widget可以把app的视图填满。

在_buildPhotoWithFilter方法中，我们返回了Image.asset，里面可以设置image的color和colorBlendMode。这两个值就是图片滤镜的关键。

就这么简单？一个图片滤镜就完成了？对的就是这么简单。图片滤镜就是Image.asset中自带的功能。

但是在实际的应用中，这个color不会是固定的，是需要根据我们的不同选择而进行变化的。为了能够接受到这个变化的值，我们使用了ValueListenableBuilder，通过传入一个可变的ValueNotifier，来实现监听color变化的结果。

```
  final _filterColor = ValueNotifier<Color>(Colors.white);

  void _onFilterChanged(Color value) {
    _filterColor.value = value;
  }
```

另外，我们提供了一个触发_filterColor的值进行变化的方法_onFilterChanged。

上面的代码运行的结果如下：

![](https://img-blog.csdnimg.cn/3eb76320bc304968aaad0674a206e151.png)

很好，现在我们已经有了一个带有颜色filter功能的界面了。 接下来我们还需要一个filter的按钮，来触发filter颜色的变化。

# 打造filter按钮

这里我们的filter包含了Colors.primaries中所有的颜色再加上一个自定义的白色。

每一个filter按钮其实都可以用一个widget来表示。我们希望是一个圆形的filter按钮，里面有一个图片的小的缩略图来展示filter的效果。

另外通过tap对应的filter按钮，还可以实现color切换的功能。

所以对于Filter按钮widget来说，可以接收两个参数，一个是当前的color，另外一个是tap之后的VoidCallback onFilterSelected, 所以最终我们的FilterItem是下面的样子的：

```
class FilterItem extends StatelessWidget {
  const FilterItem({
    super.key,
    required this.color,
    this.onFilterSelected,
  });

  final Color color;
  final VoidCallback? onFilterSelected;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onFilterSelected,
      child: AspectRatio(
        aspectRatio: 1.0,
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: ClipOval(
            child: Image.asset(
                'images/head.jpg',
              color: color.withOpacity(0.5),
              colorBlendMode: BlendMode.hardLight,
            ),
          ),
        ),
      ),
    );
  }
```

# 打造可滑动按钮

上一节我们创建好了filter按钮，接下来就是把filter按钮组装起来，形成一个可滑动的filter按钮组件。

要想滑动widget，我们可以使用Scrollable组件，通过传入一个PageController来控制PageView的展示。

Scrollable出了controller之外，还有一个非常重要的属性就是viewportBuilder。在viewportBuilder中可以传入viewportOffset。

当Scrollable滑动的时候，viewportOffset中的pixels是会动态变化的。我们可以根据viewportOffset中的pixels的变化来重绘filter按钮。

如果要根据viewportOffset的变化来重新定位child组件的位置的话，最好的方式就是将其包裹在Flow组件中。

因为Flow提供了一个FlowDelegate,我们可以在FlowDelegate中根据viewportOffset的不同来重绘filter widget。这个FlowDelegate的实现如下：

```
class CarouselFlowDelegate extends FlowDelegate {
  CarouselFlowDelegate({
    required this.viewportOffset,
    required this.filtersPerScreen,
  }) : super(repaint: viewportOffset);

  final ViewportOffset viewportOffset;
  final int filtersPerScreen;

  @override
  void paintChildren(FlowPaintingContext context) {
    print(viewportOffset.pixels);

    final count = context.childCount;

    //绘制宽度
    final size = context.size.width;

    // 一个单独item的宽度
    final itemExtent = size / filtersPerScreen;

    // active item的index
    final active = viewportOffset.pixels / itemExtent;
    print('active$active');

    // 要绘制的最小的index,在active item的左边最多绘制3个items
    final min = math.max(0, active.floor() - 3).toInt();

    //要绘制的最大index，在active item的右边最多绘制3个items
    final max = math.min(count - 1, active.ceil() + 3).toInt();

    // 重新绘制要展示的item
    for (var index = min; index <= max; index++) {
      final itemXFromCenter = itemExtent * index - viewportOffset.pixels;
      final percentFromCenter = 1.0 - (itemXFromCenter / (size / 2)).abs();
      final itemScale = 0.5 + (percentFromCenter * 0.5);
      final opacity = 0.25 + (percentFromCenter * 0.75);

      final itemTransform = Matrix4.identity()
        ..translate((size - itemExtent) / 2)
        ..translate(itemXFromCenter)
        ..translate(itemExtent / 2, itemExtent / 2)
        ..multiply(Matrix4.diagonal3Values(itemScale, itemScale, 1.0))
        ..translate(-itemExtent / 2, -itemExtent / 2);

      context.paintChild(
        index,
        transform: itemTransform,
        opacity: opacity,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CarouselFlowDelegate oldDelegate) {
    //viewportOffset被替换的情况下触发
    return oldDelegate.viewportOffset != viewportOffset;
  }
}
```

在paintChildren的最后，我们通过调用context.paintChild来重绘child。

可以看到这里传入了三个参数，第一个参数是child的index，这个index指的是创建Flow时候传入的children数组中的index：

```
      Flow(
        delegate: CarouselFlowDelegate(
          viewportOffset: viewportOffset,
          filtersPerScreen: _filtersPerScreen,
        ),
        children: [
          for (int i = 0; i < filterCount; i++)
            FilterItem(
              onFilterSelected: () => _onFilterTapped(i),
              color: itemColor(i),
            ),
        ],
      )
```

最后，我们把创建Flow的方法_buildCarousel放到Scrollable中去,并将viewportOffset作为Flow的构造函数参数传入，从而实现Flow根据Scrollable的滑动而发送相应的变化：

```
Widget build(BuildContext context) {
    return Scrollable(
      controller: _controller,
      axisDirection: AxisDirection.right,
      physics: const PageScrollPhysics(),
      viewportBuilder: (context, viewportOffset) {
        return LayoutBuilder(
          builder: (context, constraints) {
            final itemSize = constraints.maxWidth * _viewportFractionPerItem;
            viewportOffset
              ..applyViewportDimension(constraints.maxWidth)
              ..applyContentDimensions(0.0, itemSize * (filterCount - 1));

            return Stack(
              alignment: Alignment.bottomCenter,
              children: [
                _buildCarousel(
                  viewportOffset: viewportOffset,
                  itemSize: itemSize,
                ),
              ],
            );
          },
        );
      },
    );
```

# 最后要解决的问题

到目前为止，一切看起来都很好。但是如果你仔细研究的话可能会产生一个疑问。那就是Scrollable的controller是PageController,我们是通过PageController中的page来切换对应的filter颜色的：

```
  void _onPageChanged() {
    print('page${_controller.page}');
    final page = (_controller.page ?? 0).round();
    if (page != _page) {
      _page = page;
      widget.onFilterChanged(widget.filters[page]);
    }
  }
```

那么这个page是如何变化的呢？什么时候从0变成1呢？

我们先来看下PageController的构造函数：

```
    _controller = PageController(
      initialPage: _page,
      viewportFraction: _viewportFractionPerItem,
    );
```

除了初始化的initialPage之外，还有一个viewportFraction。这个值就是指一个view可以被分成多少个page。

以我的iphone14为例，它的constraints.maxWidth=390.0, 如果被分成5份的话，一份的值是78.0。 也就是说当Scrollable滑动78，的时候，page就从0变成1了。这和我们在Flow中重绘child时候，取的index是一致的。

最后，效果图如下：

![](https://img-blog.csdnimg.cn/4ed4fcc0e2364a9e866430575204e3c5.png)

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)










