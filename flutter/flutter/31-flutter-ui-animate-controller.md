flutter系列之:使用AnimationController来控制动画效果

[toc]

# 简介

之前我们提到了flutter提供了比较简单好用的AnimatedContainer和SlideTransition来进行一些简单的动画效果，但是要完全实现自定义的复杂的动画效果，还是要使用AnimationController。

今天我们来尝试使用AnimationController来实现一个拖拽图片，然后返回原点的动画。

# 构建一个要动画的widget

在本文的例子中，我们希望能够让一个图片可以实现拖拽然后自动返回原来位置的效果。

为了实现这个功能，我们首先构建一个放在界面中间的图片。

```
      child: Align(
        alignment: Alignment.center,
        child: Card(
          child: Image(image: AssetImage('images/head.jpg'))
        ),
      )
```

这里使用了Align组件，将一个图片对象放在界面中间。

接下来我们希望这个widget可以拖拽，那么把这个child放到一个GestureDetector中，这样就可以相应拖拽对应的响应。

```
 Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return GestureDetector(

      onPanUpdate: (details) {
        setState(() {
          _animateAlign += Alignment(
            details.delta.dx / (size.width / 2),
            details.delta.dy / (size.height / 2),
          );
        });
      },

      child: Align(
        alignment: _animateAlign,
        child: Card(
          child: widget.child,
        ),
      ),
    );
  }
```

为了能实现拖动的效果，我们需要在GestureDetector的onPanUpdate方法中对Align的位置进行修改，所以我们需要调用setState方法。

在setState方法中，我们根据手势的位置来调整Alignment的位置，所以这里需要用到MediaQuery来获取屏幕的大小。

但是现在实现的效果是图像随手势移动而移动，我们还需要实现在手放开之后，图像自动回复到原来位置的动画效果。

# 让图像动起来

因为这次需要变动的是Alignment，所以我们先定义一个包含Alignment的Animation属性：

```
  late Animation<Alignment> _animation;
```

接下来我们需要定义一个AnimationController,用来控制动画信息,并且指定我们需要的动画起点和终点：

```
  late AnimationController _controller;

      _animation = _controller.drive(
      AlignmentTween(
        begin: _animateAlign,
        end: Alignment.center,
      ),
    );
```

我们动画的起点位置就是当前image所在的Alignment,终点就在Alignment.center。

Alignment有一个专门表示位置信息的类叫做AlignmentTween，如上代码所示。

有了起点和终点， 我们还需要指定从起点移动到终点的方式，这里模拟使用弹簧效果，所以使用SpringSimulation。

SpringSimulation需要提供对spring的描述，起点距离，结束距离和初始速度。

```
    const spring = SpringDescription(
      mass: 30,
      stiffness: 1,
      damping: 1,
    );

    final simulation = SpringSimulation(spring, 0, 1, -1);
```

我们使用上面创建的simulation，来实现动画：

```
    _controller.animateWith(simulation);
```

最后我们需要在手势结束的时候来执行这个动画即可：

```
      onPanEnd: (details) {
        _runAnimation();
      },
```

最后，运行效果如下所示：

![](https://img-blog.csdnimg.cn/cdf8516d4f5448b1a573380268eb762a.gif)

# 总结

AnimationController是一个很强大的组件，但是使用起来也不是那么的复杂， 我们只需要定义好起点和终点，然后指定动画效果即可。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)










