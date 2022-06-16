flutter系列之:移动端的手势基础GestureDetector

[toc]

# 简介

移动的和PC端有什么不同呢？同样的H5可以运行在APP端，也可以运行在PC端。两者最大的区别就是移动端可以用手势。手势可以做到一些比如左滑右滑，上滑下滑，缩放等操作。

原生的andorid和IOS当然可以做到这些事情,作为一个移动的的开发框架flutter，自然也能够支持手势。flutter中的手势支持叫做GestureDetector，一起来看看flutter中的手势基础吧。

# Pointers和Listener

我们先来考虑一下最简单的手势是什么呢？很明显，最简单的手势就是模拟鼠标的点击操作。我们可以将其称之为Pointer event,也就是各种点击事件。

flutter中有四种Pointer事件，这些事件如下所示：

* PointerDownEvent --表示用手点击了屏幕，接触到了一个widget。
* PointerMoveEvent --表示手指从一个位置移动到另外一个位置。
* PointerUpEvent --手指从点击屏幕变成了离开屏幕。
* PointerCancelEvent --表示手指离开了该应用程序。

那么点击事件的传递机制是什么样的呢？

以手指点击屏幕的PointerDownEvent事件为例，当手指点击屏幕的时候，flutter首先会去定位该点击位置存在的widget,然后将该点击事件传递给该位置的最小widget.

然后点击事件从最新的widget向上开始冒泡，并将其分派到从最里面的widget到树根的路径上的所有widget中。

> 注意，flutter中并没有取消或停止进一步分派Pointer事件的机制。

要想监听这写Pointer事件，最简单直接的办法就是使用Listener:

```
class Listener extends SingleChildRenderObjectWidget {
  /// Creates a widget that forwards point events to callbacks.
  ///
  /// The [behavior] argument defaults to [HitTestBehavior.deferToChild].
  const Listener({
    Key? key,
    this.onPointerDown,
    this.onPointerMove,
    this.onPointerUp,
    this.onPointerHover,
    this.onPointerCancel,
    this.onPointerSignal,
    this.behavior = HitTestBehavior.deferToChild,
    Widget? child,
  }) : assert(behavior != null),
       super(key: key, child: child);

```

可以看到Listener也是一种widget，并且可以监听多种Pointer的事件。

我们可以把要监听Pointer的widget封装在Listener中，这样就可以监听各种Pointer事件了，具体的例子如下：

```
Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints.tight(const Size(300.0, 200.0)),
      child: Listener(
        onPointerDown: _incrementDown,
        onPointerMove: _updateLocation,
        onPointerUp: _incrementUp,
        child: Container(
          color: Colors.lightBlueAccent,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Text(
                  'You have pressed or released in this area this many times:'),
              Text(
                '$_downCounter presses\n$_upCounter releases',
                style: Theme.of(context).textTheme.headline4,
              ),
              Text(
                'The cursor is here: (${x.toStringAsFixed(2)}, ${y.toStringAsFixed(2)})',
              ),
            ],
          ),
        ),
      ),
    );

 void _incrementDown(PointerEvent details) {
    _updateLocation(details);
    setState(() {
      _downCounter++;
    });
  }

  void _incrementUp(PointerEvent details) {
    _updateLocation(details);
    setState(() {
      _upCounter++;
    });
  }

  void _updateLocation(PointerEvent details) {
    setState(() {
      x = details.position.dx;
      y = details.position.dy;
    });
  }
```

但是对于Lisenter来说只能监听最原始的Pointer事件，所以如果想监听更多类型的手势事件的话，则可以使用GestureDetector.

# GestureDetector

GestureDetector可以检测下面这些手势，包括：

1. Tap

Tap表示的是用户点击的事件，Tap有下面几种事件：

```
onTapDown
onTapUp
onTap
onTapCancel
```
2. Double tap

Double tap表示的是双击事件，Double tap只有一种类型：

```
onDoubleTap
```
3. Long press

Long press表示的是长按。也只有下面一种类型：

```
onLongPress
```

4. Vertical drag

Vertical drag表示的是垂直方向的拉,它有三个事件，分别是：

```
onVerticalDragStart
onVerticalDragUpdate
onVerticalDragEnd
```

5. Horizontal drag

有垂直方向的拉，就有水平方向的拉，Horizontal drag表示的是水平方向的拉,它同样有三个事件，分别是：

```
onHorizontalDragStart
onHorizontalDragUpdate
onHorizontalDragEnd
```

6. Pan

Pan这个东西可以看做是Vertical drag和Horizontal drag的合集， 因为有时候我们是希望同时可以水平或者垂直移动,在这种情况下面，我们就需要使用到Pan的事件：

```
onPanStart
onPanUpdate
onPanEnd
```

> 注意， Pan是和单独的Vertical drag、Horizontal drag是相互冲突的，不能同时使用。

要想监听上面的这些事件，我们可以使用GestureDetector，先看下GestureDetector的定义：

```
class GestureDetector extends StatelessWidget {
  GestureDetector({
    Key? key,
    this.child,
    this.onTapDown,
    this.onTapUp,
    this.onTap,
    this.onTapCancel,
    this.onSecondaryTap,
    this.onSecondaryTapDown,
    this.onSecondaryTapUp,
    this.onSecondaryTapCancel,
    this.onTertiaryTapDown,
    this.onTertiaryTapUp,
    this.onTertiaryTapCancel,
    this.onDoubleTapDown,
    this.onDoubleTap,
    this.onDoubleTapCancel,
    this.onLongPressDown,
    this.onLongPressCancel,
    this.onLongPress,
    this.onLongPressStart,
    this.onLongPressMoveUpdate,
    this.onLongPressUp,
    this.onLongPressEnd,
    this.onSecondaryLongPressDown,
    this.onSecondaryLongPressCancel,
    this.onSecondaryLongPress,
    this.onSecondaryLongPressStart,
    this.onSecondaryLongPressMoveUpdate,
    this.onSecondaryLongPressUp,
    this.onSecondaryLongPressEnd,
    this.onTertiaryLongPressDown,
    this.onTertiaryLongPressCancel,
    this.onTertiaryLongPress,
    this.onTertiaryLongPressStart,
    this.onTertiaryLongPressMoveUpdate,
    this.onTertiaryLongPressUp,
    this.onTertiaryLongPressEnd,
    this.onVerticalDragDown,
    this.onVerticalDragStart,
    this.onVerticalDragUpdate,
    this.onVerticalDragEnd,
    this.onVerticalDragCancel,
    this.onHorizontalDragDown,
    this.onHorizontalDragStart,
    this.onHorizontalDragUpdate,
    this.onHorizontalDragEnd,
    this.onHorizontalDragCancel,
    this.onForcePressStart,
    this.onForcePressPeak,
    this.onForcePressUpdate,
    this.onForcePressEnd,
    this.onPanDown,
    this.onPanStart,
    this.onPanUpdate,
    this.onPanEnd,
    this.onPanCancel,
    this.onScaleStart,
    this.onScaleUpdate,
    this.onScaleEnd,
    this.behavior,
    this.excludeFromSemantics = false,
    this.dragStartBehavior = DragStartBehavior.start,
  })
```

可以看到GestureDetector是一个无状态的Widget，它和Listner一样，可以接受一个child Widget，然后监听了很多手势的事件。

所以， 一般来说，我们这样来使用它：

```
GestureDetector(
              onTap: () {
                setState(() {
                  // Toggle light when tapped.
                  _lightIsOn = !_lightIsOn;
                });
              },
              child: Container(
                color: Colors.yellow.shade600,
                padding: const EdgeInsets.all(8),
                // Change button text when light changes state.
                child: Text(_lightIsOn ? 'TURN LIGHT OFF' : 'TURN LIGHT ON'),
              ),
            ),
```

> 注意， 如果GestureDetector中有child，那么onTap的作用范围就在子child的范围。如果GestureDetector中并没有child，那么其作用范围就是GestureDetector的父widget的范围。


# 手势冲突

因为手势的监听有很多种方式，但是这些方式并不是完全独立的，有时候这些手势可能是互相冲突的。比如前面我们提到的Pan和Vertical drag、Horizontal drag。

如果遇到这样的情况，那么futter会自行进行冲突解决，去选择到底用户执行的是哪个操作。

比如，当用户同时进行水平和垂直拖动的时候，两个识别器在接收到指针向下事件时都会开始观察指针移动事件。 

如果指针水平移动超过一定数量的逻辑像素，则水平识别器获胜，然后将该手势解释为水平拖动。 类似地，如果用户垂直移动超过一定数量的逻辑像素，则垂直识别器获胜。

# 总结

手势识别是移动端的优势项目，大家可以尝试在需要的地方使用GestureDetector，可以达到意想不到的用户效果哦。








