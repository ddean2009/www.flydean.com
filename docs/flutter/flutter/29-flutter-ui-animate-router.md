---
slug: /29-flutter-ui-animate-router
---

# 32. 如何自定义动画路由



# 简介

flutter中有默认的Route组件，叫做MaterialPageRoute，一般情况下我们在flutter中进行跳转的话，只需要向Navigator中传入一个MaterialPageRoute就可以了。

但是MaterialPageRoute太普通了，如果我们想要做点不同的跳转特效应该如何处理呢？

一起来看看吧。

# 自定义跳转使用

正常情况下，我们进行路由跳转需要用到Navigator和MaterialPageRoute，如下所示：

```
 Navigator.push(context, MaterialPageRoute(builder: (context) {
            return const NextPage();
```

如果要实现特定的路由动画，那么需要进行路由的自定义。

在flutter中也就是要使用PageRouteBuilder来自定义一个Route。

先来看下PageRouteBuilder的定义：

```
class PageRouteBuilder<T> extends PageRoute<T> {

  PageRouteBuilder({
    super.settings,
    required this.pageBuilder,
    this.transitionsBuilder = _defaultTransitionsBuilder,
    this.transitionDuration = const Duration(milliseconds: 300),
    this.reverseTransitionDuration = const Duration(milliseconds: 300),
    this.opaque = true,
    this.barrierDismissible = false,
    this.barrierColor,
    this.barrierLabel,
    this.maintainState = true,
    super.fullscreenDialog,
  })
```

PageRouteBuilder也是PageRoute的一种，在构建PageRouteBuilder的时候，通过控制不同的属性值，我们可以自由控制pageBuilder，transitionsBuilder，transitionDuration，reverseTransitionDuration等特性。

可以看到自由程度还是非常高的。

其中pageBuilder是路由将会跳转的页面，这个是必须要指定的，要不然路由也就没有意义了。

另外路由转换的效果可以经由transitionsBuilder来设置。

这里的RouteTransitionsBuilder是一个Function，返回一个Widget：

```
typedef RouteTransitionsBuilder = Widget Function(BuildContext context, Animation<double> animation, Animation<double> secondaryAnimation, Widget child);

```

所以理论上，我们可以返回任何widget，但是一般来说，我们会返回一个AnimatedWidget,表示一个动画效果。

# flutter动画基础

flutter中有个专门的动画包叫做flutter/animation.dart, flutter中所有动画的核心叫做Animation。

Animation中定义了很多listener用来监控动画的变动情况，并且还提供了一个AnimationStatus来存储当前的动画状态：

```
abstract class Animation<T> extends Listenable implements ValueListenable<T> {
  const Animation();

  AnimationWithParentMixin<T>

  @override
  void addListener(VoidCallback listener);

  @override
  void removeListener(VoidCallback listener);

  void addStatusListener(AnimationStatusListener listener);

  void removeStatusListener(AnimationStatusListener listener);

  AnimationStatus get status;
```

AnimationStatus是一个枚举类，它包含了现在动画的各种状态：

```
enum AnimationStatus {
  dismissed,

  forward,

  reverse,

  completed,
}
```

dismissed表示动画暂停在开头。

forward表示动画在从头到尾播放。

reverse表示动画在从尾到头播放。

completed表示动画播放完毕，停在了结尾。

有了动画的表示之后，如何对动画进行控制呢？这里就需要用到AnimationController了。

AnimationController可以控制动画的duration,动画的最低值lowerBound默认是0.0，动画的最高值upperBound默认是1.0等等。

默认情况AnimationController中从最低值到最高值是线性变化的，如果你想设置不同的Bound值,那么可以尝试自定义 Animatable, 如果你想动画的变动是非线性的，那么可以尝试继承Animation来实现自己的变动曲线。

# 实现一个自定义的route

这里我们使用flutter中的SlideTransition，SlideTransition是一个AnimatedWidget,它表示的是一个组件的位置变化的动画。

```
class SlideTransition extends AnimatedWidget {
  const SlideTransition({
    super.key,
    required Animation<Offset> position,
    this.transformHitTests = true,
    this.textDirection,
    this.child,
  }) : assert(position != null),
       super(listenable: position);
```

看下它的构造函数，可以看到SlideTransition需要一个position的属性，这个position是一个Animation对象，里面包含的是Offset。

同时这个position是一个listenable对象，通过监听里面Offset的变化，从而重新build对应的widget从而实现动画的效果。

Offset是一个表示位置的类，(0,0) 表示这个widget的左顶点在屏幕的左上角，同样的(1,1)表示这个widget的左顶点在屏幕的右下角。

因为route过后是一个新的页面，我们希望出现一个页面从右下角移动到左上角的动画，那么我们可以这样做：

```
Route customRoute() {
  return PageRouteBuilder(
    pageBuilder: (context, animation, secondaryAnimation) => const SecondPage(),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(1.0, 1.0);
      const end = Offset.zero;
      const curve = Curves.easeOut;

      var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));

      return SlideTransition(
        position: animation.drive(tween),
        child: child,
      );
    },
  );
}
```

这里的begin和end表示widget从屏幕的右下角移动到了屏幕的左上角。

Tween表示的是开始值和结束值之间的线性插值，是一个动态过程，另外我们还可以这个插值变动的曲线，这里使用了CurveTween，选中了Curves.easeOut这种曲线类型。

最后调用animation.drive方法把Tween和Animation关联起来，这样一个路由动画就完成了。

# 总结

最后程序运行的结果如下:

![](https://img-blog.csdnimg.cn/dda59ed24e3545f1bd72c1fe2adf1814.gif)

其实flutter中的动画很简单，大家记住就是widget位置沿不同的曲线变化即可。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)







