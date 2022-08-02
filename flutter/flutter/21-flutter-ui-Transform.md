flutter系列之:flutter中的变形金刚Transform

[toc]

# 简介

虽然我们在开发APP的过程中是以功能为主，但是有时候为了美观或者其他的特殊的需求，需要对组件进行一些变换。在Flutter中这种变换就叫做Transform。

flutter的强大之处在于，可以对所有的widget进行Transform，因此可以做出非常酷炫的效果。

# Transform简介

在Flutter中，Transform本身也是一个Widget，它主要是把变换作用在它的子widget上。我们先来看下Transform的定义和构造函数：

```
class Transform extends SingleChildRenderObjectWidget

  const Transform({
    Key? key,
    required this.transform,
    this.origin,
    this.alignment,
    this.transformHitTests = true,
    this.filterQuality,
    Widget? child,
  }) : assert(transform != null),
       super(key: key, child: child);
```

可以看到Transform需要transform，origin,alignment,transformHitTests和filterQuality这几个属性。

其中transform是一个Matrix4对象，它是一个4维的矩阵，用来描述child应该怎么被transform。

origin是一个Offset对象，表示的是原始坐标系的值，默认是左上角。origin和transform是有关联关系的，我们可以通过修改origin来达到不同的transform的效果。

alignment是origin的对其方式，是一个AlignmentGeometry对象。

filterQuality是在进行图像变换的过程中，图像的取样质量。

除了上面这个默认的构造函数之外，为了简单起见Transform还提供了几个有特殊作用的构造函数：

```
  Transform.rotate({
    Key? key,
    required double angle,
    this.origin,
    this.alignment = Alignment.center,
    this.transformHitTests = true,
    this.filterQuality,
    Widget? child,
  }) : transform = Matrix4.rotationZ(angle),
       super(key: key, child: child);
```
Transform.rotate就是对子child进行旋转变换。

通过传入angle属性，实现子child沿Z轴旋转。

```
  Transform.translate({
    Key? key,
    required Offset offset,
    this.transformHitTests = true,
    this.filterQuality,
    Widget? child,
  }) : transform = Matrix4.translationValues(offset.dx, offset.dy, 0.0),
       origin = null,
       alignment = null,
       super(key: key, child: child);
```

Transform.translate是通过改变offset的值来修改原始坐标系的位置。

```
  Transform.scale({
    Key? key,
    required double scale,
    this.origin,
    this.alignment = Alignment.center,
    this.transformHitTests = true,
    this.filterQuality,
    Widget? child,
  }) : transform = Matrix4.diagonal3Values(scale, scale, 1.0),
       super(key: key, child: child);
```

Transform.scale通过传入scale，来对子child进行放大缩小。

从上面的不同构造函数可以看出来，实际上最终都将传入的参数转换成为Matrix4的transform对象。

如果你对Matrix4熟悉的话，那么可以用最直接的构造函数，直接传入Matrix4。

# Transform的使用

上面我们介绍了Transform.rotate，Transform.translate和Transform.scale这几个构造函数，接下来我们将会使用具体的例子来进行详细的讲解。

首先是Transform.rotate，用来对子组件进行旋转，下面是一个使用的例子：

```
  Widget build(BuildContext context) {
    return Center(
      child: Transform.rotate(
        angle: pi/4,
        child: const Icon(
            Icons.airplanemode_active,
            size: 200,
          color: Colors.blue,
        ),
      ));
  }
```

上面的例子将一个飞机的Icon旋转pi/4,也就是45度，最后生成的界面如下：

![](https://img-blog.csdnimg.cn/f39c0c23e19f456c840043ac29a2a3ee.png)


接下来是Transform.translate，这个方法主要是对子组件进行坐标轴变换，需要传入一个offset选项，如下所示：

```
    return Transform.translate(
          offset:const Offset(50.0, 100.0),
          child: const Icon(
            Icons.airplanemode_active,
            size: 200,
            color: Colors.blue,
          ),
        );
```

上面我们还是使用了飞机的图标，不过对他进行了坐标轴变换，最后得出的界面如下：

![](https://img-blog.csdnimg.cn/d3d3bf16e6154e0a9697fa7fe3b46c23.png)

最后我们要展示的是Transform.scale，用来对子组件进行缩放。

上面我们的图标size是200，我们可以将其缩放为50%，如下所示：

```
    return Transform.scale(
      scale: 0.5,
      child: const Icon(
        Icons.airplanemode_active,
        size: 200,
        color: Colors.blue,
      ),
    );
```

运行我们可以得到下面的界面：

![](https://img-blog.csdnimg.cn/b4b0d76e7f34404d830c1104abb4922e.png)

是不是变小了很多？

# 总结

Transform是一个功能强大的widget，通过Transform我们可以做出很多非常有趣的效果。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)









