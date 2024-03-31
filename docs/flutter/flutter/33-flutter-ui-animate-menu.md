---
slug: /33-flutter-ui-animate-menu
---

# 36. 做一个会飞的菜单



# 简介

flutter中自带了drawer组件，可以实现通用的菜单功能，那么有没有一种可能，我们可以通过自定义动画来实现一个别样的菜单呢？

答案是肯定的，一起来看看吧。

# 定义一个菜单项目

因为这里的主要目的是实现菜单的动画，所以这里的菜单比较简单，我们的menu是一个StatefulWidget,里面就是一个Column组件，column中有四行诗：

```
  static const _menuTitles = [
    '迟日江山丽',
    '春风花草香',
    '泥融飞燕子',
    '沙暖睡鸳鸯',
  ];

    Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child:_buildContent()
    );
  }


  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        ..._buildListItems()
      ],
    );
  }

  List<Widget> _buildListItems() {
    final listItems = <Widget>[];
    for (var i = 0; i < _menuTitles.length; ++i) {
      listItems.add(
         Padding(
            padding: const EdgeInsets.symmetric(horizontal: 36.0, vertical: 16),
            child: Text(
              _menuTitles[i],
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w500,
              ),
            ),
      )
      );
    }
    return listItems;
  }
```

# 让menu动起来

怎么让menu动起来呢？我们需要给最外层的AnimateMenuApp添加一个AnimationController,所以需要在_AnimateMenuAppState添加SingleTickerProviderStateMixin的mixin,如下所示：

```
class _AnimateMenuAppState extends State<AnimateMenuApp>
    with SingleTickerProviderStateMixin {
  late AnimationController _drawerSlideController;
```

然后在initState中对_drawerSlideController进行初始化：

```
  void initState() {
    super.initState();

    _drawerSlideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );
  }
```

在让menu动起来之前，我们需要设计一下动画的样式。假如我们的动画是让menu从右向左飞出。那么我们可以使用FractionalTranslation来进行offset进行位置变换。

并且当菜单没有开启的时候，我们需要显示一个空的组件，这里用SizedBox来替代。

当菜单开启的时候，就执行这个FractionalTranslation的动画，所以我们的build方法需要这样写：

```
  Widget _buildDrawer() {
    return AnimatedBuilder(
      animation: _drawerSlideController,
      builder: (context, child) {
        return FractionalTranslation(
          translation: Offset(1.0 - _drawerSlideController.value, 0.0),
          child: _isDrawerClosed() ? const SizedBox() : const Menu(),
        );
      },
    );
  }
```

FractionalTranslation中的Offset是根据_drawerSlideController的value来进行变化的。

那么_drawerSlideController的value怎么变化呢？

我们定义一个_toggleDrawer方法，在点击菜单按钮的时候来触发这个方法，从而实现_drawerSlideController的value变化：

```
  void _toggleDrawer() {
    if (_isDrawerOpen() || _isDrawerOpening()) {
      _drawerSlideController.reverse();
    } else {
      _drawerSlideController.forward();
    }
  }
```

同时，我们定义下面几个判断菜单状态的方法：

```
  bool _isDrawerOpen() {
    return _drawerSlideController.value == 1.0;
  }

  bool _isDrawerOpening() {
    return _drawerSlideController.status == AnimationStatus.forward;
  }

  bool _isDrawerClosed() {
    return _drawerSlideController.value == 0.0;
  }
```

因为菜单图标需要根据菜单状态来发生改变，菜单的状态又是依赖于_drawerSlideController，所以，我们把IconButton放到一个AnimatedBuilder里面，从而实现动态变化的效果：

```
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text(
        '动画菜单',
        style: TextStyle(
          color: Colors.black,
        ),
      ),
      backgroundColor: Colors.transparent,
      elevation: 0.0,
      automaticallyImplyLeading: false,
      actions: [
        AnimatedBuilder(
          animation: _drawerSlideController,
          builder: (context, child) {
            return IconButton(
              onPressed: _toggleDrawer,
              icon: _isDrawerOpen() || _isDrawerOpening()
                  ? const Icon(
                Icons.clear,
                color: Colors.black,
              )
                  : const Icon(
                Icons.menu,
                color: Colors.black,
              ),
            );
          },
        ),
      ],
    );
  }
```

最后实现的效果如下：

![](https://img-blog.csdnimg.cn/2b5f016244c346bdac9f5f6efc06b41d.gif)

# 添加菜单内部的动画

上面的例子中整个菜单是作为一个整体来动画的，有没有可能菜单里面的每一个item也有自己的动画呢？

答案当然是肯定的。

我们只需要在上面的基础上将menu组件添加动画支持即可：

```
class _MenuState extends State<Menu> with SingleTickerProviderStateMixin
```

动画中的位移我们选择使用Transform.translate，同时还添加了淡入淡出的效果，也就是把上面例子中的Padding用AnimatedBuilder包裹起来，如下所示：

```
  List<Widget> _buildListItems() {
    final listItems = <Widget>[];
    for (var i = 0; i < _menuTitles.length; ++i) {
      listItems.add(
        AnimatedBuilder(
          animation: _itemController,
          builder: (context, child) {
            final animationPercent = Curves.easeOut.transform(
              _itemSlideIntervals[i].transform(_itemController.value),
            );
            final opacity = animationPercent;
            final slideDistance = (1.0 - animationPercent) * 150;

            return Opacity(
              opacity: opacity,
              child: Transform.translate(
                offset: Offset(slideDistance, 0),
                child: child,
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 36.0, vertical: 16),
            child: Text(
              _menuTitles[i],
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ),
      );
    }
    return listItems;
  }
```

AnimatedBuilder中的builder返回的是一个Opacity对象，里面包含了opacity和child两个属性。其中最终要的一个变化值是animationPercent，这个值是根据_itemController的value和初始设置的各个item的变化时间来决定的。

每个item的值是不一样的：

```
  void _createAnimationIntervals() {
    for (var i = 0; i < _menuTitles.length; ++i) {
      final startTime = _initialDelayTime + (_staggerTime * i);
      final endTime = startTime + _itemSlideTime;
      _itemSlideIntervals.add(
        Interval(
          startTime.inMilliseconds / _animationDuration.inMilliseconds,
          endTime.inMilliseconds / _animationDuration.inMilliseconds,
        ),
      );
    }
  }
```

最后运行结果如下：

![](https://img-blog.csdnimg.cn/da63cbf7d9cc448393782a1c11cda27c.gif)

# 总结

在flutter中一切皆可动画，我们只需要掌握动画创作的诀窍即可。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)






