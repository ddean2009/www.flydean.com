---
slug: /08-flutter-ui-layout-container
---

# 9. flutter中常用的container layout详解



# 简介

在上一篇文章中，我们列举了flutter中的所有layout类，并且详细介绍了两个非常常用的layout:Row和Column。

掌握了上面两个基本的layout还是不够的，如果需要应付日常的layout使用，我们还需要掌握多一些layout组件。今天我们会介绍一个功能强大的layout:Container layout。

# Container的使用

Container是一个空白的容器，通常可以用Container来封装其他的widget。那么为什么还需要把widget封装在Container中呢？这是因为Container中包含了一些特殊的功能。

比如Container中可以设置背景颜色或者背景图片，并且可以设置padding, margins和borders。这就为组件的自定义提供了诸多空间。

首先看一下Container的定义和构造函数：

```
class Container extends StatelessWidget {
  Container({
    Key? key,
    this.alignment,
    this.padding,
    this.color,
    this.decoration,
    this.foregroundDecoration,
    double? width,
    double? height,
    BoxConstraints? constraints,
    this.margin,
    this.transform,
    this.transformAlignment,
    this.child,
    this.clipBehavior = Clip.none,
  })
```

可以看到Container是一个StatelessWidget，它的构造函数可以传入多个非常有用的属性，用来控制Container的表现。

Container中有padding,decoration,constraints和margin这些和位置相关的一些属性，他们有什么关系呢？

container首先将child用padding包裹起来，padding可以用decoration进行填充。

填充后的padding又可以应用constraints来进行限制(比如width和height)，然后这个组件又可以使用margin空白包裹起来。

接下来我们看一个简单的Container中包含Column和Row的例子。

首先构造一个container widget，它包含一个Column：

```
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
      ),
      child: Column(
        children: [
          buildBoxRow(),
          buildBoxRow(),
        ],
      ),
    );
  }
```

这里给Container设置了一个BoxDecoration，用于指定Container的背景颜色。

在Child中给定了一个Column widget，它的child是一个Row对象。

```
  Widget buildBoxRow()  => Row(
    textDirection: TextDirection.ltr,
    children: [
      Container(
        width: 100,
        child: Image.asset("images/head.jpg")
      )
    ],
  );
```

这里的Row中又是一个包含了Image的Container对象。

最后运行，我们可以得到下面的界面：

![](https://img-blog.csdnimg.cn/2384330abab24717b56b6d3d0a49f1a3.png)

Container中包含两行，每行包含一个Image对象。

# 旋转Container

默认情况下Container是一个正常布局的widget，但是有时候我们可能需要实现一些特殊效果，比如说组件的旋转，Container提供的transform属性可以很方便的做到这一点。

对于Container来说，transform是在组件绘制中最先被应用的，transform之后会进行decoration的绘制，然后进行child的绘制，最后进行foregroundDecoration的绘制。

还是上面的例子，我们试一下transform属性是如何工作的，我们在包含image的container中加入transform属性：

```
  Widget buildBoxRow()  => Row(
    textDirection: TextDirection.ltr,
    children: [
      Container(
          transform: Matrix4.rotationZ(0.2),
        width: 100,
        child: Image.asset("images/head.jpg")
      )
    ],
  );
```

最后生成的APP如下：

![](https://img-blog.csdnimg.cn/361770b52462447f8019aaab3325b465.png)

可以看到图片已经沿Z轴进行了旋转。

这里的旋转使用的是Matrix4.rotationZ,也就是沿Z轴选择，当然你可以可以使用rotationX或者rotationY，分别沿X轴或者Y轴旋转。

如果选择rotationX,那么看起来的图像应该是这样的：

![](https://img-blog.csdnimg.cn/3121dd46c3ce4396a9cd589ed1c56a31.png)

事实上，Matrix4不仅仅可以沿单独的轴进行旋转，还可以选择特定的向量方向进行选择。

比如下面的两个方法：

```
  /// Translation matrix.
  factory Matrix4.translation(Vector3 translation) => Matrix4.zero()
    ..setIdentity()
    ..setTranslation(translation);

  /// Translation matrix.
  factory Matrix4.translationValues(double x, double y, double z) =>
      Matrix4.zero()
        ..setIdentity()
        ..setTranslationRaw(x, y, z);
```

Matrix4还可以沿三个方向进行进行放大缩写，如下面的方法：

```
  /// Scale matrix.
  factory Matrix4.diagonal3Values(double x, double y, double z) =>
      Matrix4.zero()
        .._m4storage[15] = 1.0
        .._m4storage[10] = z
        .._m4storage[5] = y
        .._m4storage[0] = x;
```

感兴趣的朋友可以自行尝试。

# Container中的BoxConstraints

在Container中设置Constraints的时候，我们使用的是BoxConstraints。BoxConstraints有四个包含数字的属性，分别是minWidth,maxWidth,minHeight和maxHeight。

所以BoxConstraints提供了这四个值的构造函数：

```
  const BoxConstraints({
    this.minWidth = 0.0,
    this.maxWidth = double.infinity,
    this.minHeight = 0.0,
    this.maxHeight = double.infinity,
  }) : assert(minWidth != null),
       assert(maxWidth != null),
       assert(minHeight != null),
       assert(maxHeight != null);
```

BoxConstraints还有两个构造函数分别是loose和tight：

```
BoxConstraints.loose(Size size) 
BoxConstraints.tight(Size size) 
```

这两个有什么区别呢？如果一个axis的最小值是0的话，那么这个BoxConstraints就是loose。

如果一个axis的最大值和最小值是相等的情况，那么这个BoxConstraints就是tight。

BoxConstraints中还有一个非常常用的方法如下：

```
 BoxConstraints.expand({double? width, double? height}) 
```

expand的意思就是最大值和最小值都是infinity的，具体的定义可以从方法的实现中看出：

```
  const BoxConstraints.expand({
    double? width,
    double? height,
  }) : minWidth = width ?? double.infinity,
       maxWidth = width ?? double.infinity,
       minHeight = height ?? double.infinity,
       maxHeight = height ?? double.infinity;
```

# 总结

Container是一个非常常用的layout组件，大家可以熟练的使用起来。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)







