---
slug: /11-flutter-ui-layout-stack
---

# 13. flutter中常用的Stack layout详解

# 简介

对于现代APP的应用来说，为了更加美观，通常会需要用到不同图像的堆叠效果，比如在一个APP用户背景头像上面添加一个按钮，表示可以修改用户信息等。

要实现这样的效果，我们需要在一个Image上面堆叠其他的widget对象，flutter为我们提供了这样的一个非常方便的layout组件叫做Stack，今天和大家一起来聊一聊Stack的使用。

# Stack详解

我们先来看下Stack的定义：

```
class Stack extends MultiChildRenderObjectWidget 
```

Stack继承自MultiChildRenderObjectWidget，表示在stack中可以render多个child widget对象。

因为Stack中的child是重叠关系，所以需要对child进行定位，根据定位的不同Stack中的child可以分为两种类型，分别是positioned和non-positioned。

所谓positioned，是指child widget被包装在Positioned中。什么是Positioned呢？

Positioned是专门用来定位Stack中的child位置的一个widget。所以Positioned必须用在Stack中，并且Positioned和Stack的路径之间只能存在StatelessWidget或者StatefulWidget这两种widget。

如果一个对象被包含在Positioned中，那么这个对象就是一个Stack中的positioned对象。

Positioned中除了封装的child之外，还有6个属性，如下所示：

```
  const Positioned({
    Key? key,
    this.left,
    this.top,
    this.right,
    this.bottom,
    this.width,
    this.height,
    required Widget child,
  })
```

这六个属性分别是left，top，right,bottom,width和height。其中left，top，right,bottom分别表示到左，顶，右，底的距离，这个距离是相对stack来说的。而width和height则表示的是Positioned的宽度和高度。

事实上，使用left和right可以定义出width,使用top和bottom可以定义出height。

如果在一个轴方向的三个值都不存在，那么会使用Stack.alignment来定位子元素。

如果六个值都不存在，那么这个child就是一个non-positioned的child。

对于non-positioned的child，是通过Stack的alignment来进行布局的,默认情况下是按top left corners进行布局的。

## Stack的属性

我们接下来看一下Stack中有哪些属性，下面是Stack的构造函数：

```
  Stack({
    Key? key,
    this.alignment = AlignmentDirectional.topStart,
    this.textDirection,
    this.fit = StackFit.loose,
    @Deprecated(
      'Use clipBehavior instead. See the migration guide in flutter.dev/go/clip-behavior. '
      'This feature was deprecated after v1.22.0-12.0.pre.',
    )
    this.overflow = Overflow.clip,
    this.clipBehavior = Clip.hardEdge,
    List<Widget> children = const <Widget>[],
  })
```

可以看到Stack中有alignment,textDirection,fit,overflow和clipBehavior这几个属性。

首先来看alignment，这里的alignment是一个AlignmentGeometry对象，主要用来布局non-positioned children。

AlignmentGeometry中有两个需要设置的属性，分别是start和y。

start表示的是横线定位范围，它的取值比较奇怪，-1表示的是start side的边缘位置，而1表示的是end side的边缘位置。如果取值超过了这个范围，则表示对应的位置超过了边缘位置。

start的位置跟TextDirection是相关联的，如果TextDirection的值是ltr，也就是说从左到右排列，那么start就在最左边，如果TextDirection的值是rtl，也就是说从右到左排列，那么start就是在最右边。

有横向位置就有纵向位置，这个纵向位置用y来表示，它的正常取值范围也是-1到1，当然你也可以超出这个范围。

为了用户更加方便的使用AlignmentGeometry，AlignmentGeometry提供了一些便捷的方法,如topStart,topCenter,topEnd等，大家可以自行选取。

接下来的属性是textDirection，textDirection是一个TextDirection对象，它有两个值，分别是rtl和ltr,在讲解alignment的时候,我们已经提到过textDirection，它会影响alignment中横向的布局。

接下来是StackFit类型的fit属性，StackFit有三个值，分别是loose,expand和passthrough。

loose表示的是一个松散结构，比如Stack规定的size是300x500,那么它的child的宽度可以从0-300，child的高度可以从0-500.

expand表示是一个扩充的效果，比如Stack规定的size是300x500,那么它的child的宽度就是300，child的高度就是500.

passthrough表示传递给stack的限制会原封不动的传递给他的child，不会进行任何修改。

overflow表示children超出展示部分是否会被剪切。不过这个属性已经是Deprecated,flutter推荐我们使用clipBehavior这个属性来代替。

clipBehavior是一个Clip对象，它的默认值是Clip.hardEdge。其他的几个值还有none,hardEdge,antiAlias和antiAliasWithSaveLayer。

none表示不进行任何裁剪，hardEdge的裁剪速度最快，但是精确度不高。antiAlias速度比hardEdge慢一点，但是有光滑的边缘。antiAliasWithSaveLayer是最慢的，应该很少被使用。

# Stack的使用

有了上面的讲解，接下来我们看一下Stack的具体使用。

在我们这个例子中，我们在Stack中设置一个背景图片，然后在图片上叠加一个文本。

那么应该怎么实现呢？

首先我们需要设置Stack的alignment方式，我们希望文本和图片的中心重合，也就是说把文字放在图片中间，我们将Stack的alignment设置为Alignment.center。

接下来是一个背景图片，因为原始图片是一个正方形的图片，我们需要对图片进行裁剪成圆形，这里使用一个非常方便的类CircleAvatar来创建圆形的图标：

```
 const CircleAvatar(
          backgroundImage: AssetImage('images/head.jpg'),
          radius: 100,
        ),
```

上面的代码能够创建一个半径是100的圆。

然后是文本的创建，可以给Text设置文本内容和对应的style：

```
Text(
            '编辑',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          )
```

然后把Text封装在Container中，并使用BoxDecoration给他指定一个背景：

```
Container(
          decoration: const BoxDecoration(
            color: Colors.green,
          ),
          child: const Text(
              ...
```

最后将上面的代码组合起来就是我们最后的Stack：


```
 Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        const CircleAvatar(
          backgroundImage: AssetImage('images/head.jpg'),
          radius: 100,
        ),
        Container(
          decoration: const BoxDecoration(
            color: Colors.green,
          ),
          child: const Text(
            '编辑',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
```

运行生成的界面如下：

![](https://img-blog.csdnimg.cn/d6b4dcc8737c4a8398532590f5b28ce1.png)

# 总结

以上就是Stack的使用，通过堆叠组件，我们可以实现很多炫酷的功能。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)







