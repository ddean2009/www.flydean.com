flutter系列之:按比例缩放的AspectRatio和FractionallySizedBox

[toc]

# 简介

我们在构建UI的时候，为了适应不同的屏幕大小，通常需要进行一些自适应的配置，而最常见的自适应就是根据某个宽度或者高度自动进行组件的缩放。

今天要给大家介绍两个可以自动缩放的组件AspectRatio和FractionallySizedBox。

# AspectRatio

AspectRatio的目的就是将其child按比例缩放。

先来看下AspectRatio的定义：

```
class AspectRatio extends SingleChildRenderObjectWidget
```

可以看到AspectRatio继承自SingleChildRenderObjectWidget，表示用来呈现一个single child。

AspectRatio需要的属性有两个，分别是aspectRatio和子元素child。

aspectRatio是一个double类型的数据，为了方便起见，我们一般使用比例的格式来进行表示，比如3.0/2.0等。

虽然我们知道3/2的结果是1.5，但是我们最好不要自行计算结果，因为使用3.0/2.0更加直观。

AspectRatio的逻辑是首先获得最大的width或者height，然后根据width或者height来计算height和width。接下来我们来看几个具体的例子，来详细了解AspectRatio。

首先是一个无限宽度但是高度为150的container，然后再container的child中使用了AspectRatio组件，如下所示：

```
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blue,
      alignment: Alignment.center,
      width: double.infinity,
      height: 150.0,
      child: AspectRatio(
        aspectRatio: 3 / 2,
        child: Container(
          color: Colors.red,
        ),
      ),
    );
```

这里的aspectRatio=3/2, 那么怎么来计算aspectRatio的大小呢？

对于aspectRatio的父widget来说，他的宽度是无限的，他的高度是150，所以aspectRatio的高度是可以确定的，也就是150，我们根据aspectRatio的比例，计算出它的width=150/2 * 3 = 225, 如下所示：

![](https://img-blog.csdnimg.cn/6e9f0a933e4e4ccdbc6477bb5bbf0b22.png)

再看下面的一个例子:

```
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blue,
      alignment: Alignment.center,
      width: 150.0,
      height: 150.0,
      child: AspectRatio(
        aspectRatio: 2.0,
        child: Container(
          color: Colors.red,
        ),
      ),
    );
  }
```

这个例子中Container的width和height是相等的。

在它的child中使用的aspectRatio=2.0。如果child的height选择=150，那么对应的width就应该是300，很明显超出了Container的范围，所以这里选择的是width=150， 而对应的height=75， 入下图所示：

![](https://img-blog.csdnimg.cn/8448384cb9164e058087d94945841b37.png)

那么问题来了， 如果AspectRatio指定了大小应该怎么处理呢？

比如我们给aspectRatio的child添加一个width和height限制：

```
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blue,
      alignment: Alignment.center,
      width: 150.0,
      height: 150.0,
      child: AspectRatio(
        aspectRatio: 2.0,
        child: Container(
          color: Colors.red,
          width: 50,
          height: 50,
        ),
      ),
    );
  }
```

你会发现这个width和height对Container的大小是没有效果的。

这里就要谈到之前我们提到的constraints了，对于AspectRatio来说，他希望子child填充满它的空间，所以child会继承这个constraints，从而展示相同的界面。

# FractionallySizedBox

FractionallySizedBox和AspectRatio有些类似，不过FractionallySizedBox是按照可用空间的大小来进行比例设置的。

首先来看下FractionallySizedBox的定义：

```
class FractionallySizedBox extends SingleChildRenderObjectWidget
```

可以看到FractionallySizedBox和AspectRatio一样继承自SingleChildRenderObjectWidget。

FractionallySizedBox有三个属性，分别是alignment,widthFactor和heightFactor。

其中alignment表示的是FractionallySizedBox中子child的排列方式。

而widthFactor和heightFactor是double类型的，表示的是对应的缩放比例。

接下来，我们看一下FractionallySizedBox的具体使用。

```
  Widget build(BuildContext context) {

    return FractionallySizedBox(
      widthFactor: 1,
      heightFactor: 0.25,
      alignment: FractionalOffset.center,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(
            color: Colors.red,
            width: 4,
          ),
        ),
      ),
    );
  }
```

这里我们设置对应的widthFactor=1和heightFactor=0.25， 也就是说widht和可用空间的width是一致的，而height只有原来的1/4。 

为了方便起见，我们将child用一个DecoratedBox封装起来，用来展示box的边界，最后得到的界面如下所示：

![](https://img-blog.csdnimg.cn/3c833ec3e4304977b6652f9e74f4fa71.png)

# 总结

熟练使用AspectRatio和FractionallySizedBox可以很方便的按比例来绘制界面的元素，非常好用。


本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)
