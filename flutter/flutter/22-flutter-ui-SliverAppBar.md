flutter系列之:flutter中的SliverAppBar

[toc]

# 简介

对于一个APP来说，肯定会有一个AppBar，这个AppBar一般包含了APP的导航信息等。虽然我们可以用一个固定的组件来做为AppBar，但是这样就会丢失很多特效，比如将AppBar固定在顶部，AppBar可以在滑动的过程中进行大小变换等。

当然这一切都不需要自己来实现，flutter已经为我们提供了一个非常强大的AppBar组件，这个组件叫做SliverAppBar。

# SliverAppBar详解

我们先来看下SliverAppBar的定义：

```
class SliverAppBar extends StatefulWidget
```

可以看到SliverAppBar是一个StatefulWidget，它里面的状态包含的是一些配置信息，包括FloatingHeaderSnapConfiguration,OverScrollHeaderStretchConfiguration和PersistentHeaderShowOnScreenConfiguration等。

SliverAppBar可以接收很多属性，我们接下来会讲解其中最重要和最常用的几个属性。

* forceElevated

forceElevated是一个bool值，表示是否显示AppBar的阴影效果,默认值是false。

* primary

primary使用来配置AppBar的属性，表示AppBar是否显示在界面的Top位置。如果设置为true，那么AppBar将会被放置在Top的位置，并且使用的高度是系统status bar的高度。

* floating

floating是一个非常重要的属性，因为对于SliverAppBar来说，当界面向远离SliverAppBar的方向滚动的时候，SliverAppBar会隐藏或者缩写为status bar的高度，floating的意思就是当我们向SliverAppBar滑动的时候，SliverAppBar是否浮动展示。

* pinned

表示SliverAppBar在滚动的过程中是否会固定在界面的边缘。

* snap

snap是和floating一起使用的属性，snap表示当向SliverAppBar滚动的时候，SliverAppBar是否立即展示完全。

* automaticallyImplyLeading

automaticallyImplyLeading是用在AppBar中的属性，表示是否需要实现leading widget。

其中最常用的就是floating，pinned和snap这几个属性。

另外还有一个flexibleSpace组件，他是SliverAppBar在float的时候展示的widget，通常和expandedHeight配合使用。

# SliverAppBar的使用

上面讲解了SliverAppBar的构造函数和基础属性，接下来我们通过具体的例子来讲解SliverAppBar如何使用。

通常来说SliverAppBar是和CustomScrollView一起使用的，也就是说SliverAppBar会被封装在CustomScrollView中。

CustomScrollView中除了SliverAppBar之外，还可以添加其他的sliver组件。

首先我们定义一个SliverAppBar：

```
SliverAppBar(
          pinned: true,
          snap: true,
          floating: true,
          expandedHeight: 200.0,
          flexibleSpace: FlexibleSpaceBar(
            title: const Text('SliverAppBar'),
            background: Image.asset("images/head.jpg"),
          ),
        ),
```

这里我们设置pinned，snap和floating的值都为true，然后设置了expandedHeight和flexibleSpace。

这里的flexibleSpaces是一个FlexibleSpaceBar对象，这里我们设置了title和background属性。

接着我们需要把SliverAppBar放到CustomScrollView中进行展示。

```
 Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: <Widget>[
        SliverAppBar(
         ...
        ),
        SliverList(
          delegate: SliverChildBuilderDelegate(
                (BuildContext context, int index) {
              return Container(
                color: index.isOdd ? Colors.white : Colors.green,
                height: 100.0,
                child: Center(
                  child: ListTile(
                    title: Text(
                      '1888888888' + index.toString(),
                      style: TextStyle(fontWeight: FontWeight.w500),
                    ),
                    leading: Icon(
                      Icons.contact_phone,
                      color: Colors.blue[500],
                    ),
                  ),
                ),
              );
            },
            childCount: 10,
          ),
        ),
      ],
    );
```

在SliverAppBar之外，我们还提供了一个SliverList，这里使用了SliverChildBuilderDelegate来构造10个ListTile对象。

最后运行可以得到下面的界面：

![](https://img-blog.csdnimg.cn/ce3a3a2fe19e4d17b3a88cbe059c194b.png)

默认情况下SliverAppBar是展开状态，如果我们将下面的SliverList向上滑动，flexibleSpace就会被隐藏，我们可以得到下面的界面：

![](https://img-blog.csdnimg.cn/60c7624eff474518b26dd76c1d691b09.png)

当我们向上慢慢滑动的时候，因为设置的是floating=true, 并且snap=true，所以只要向上滑动，就会展示所有的flexibleSpace:

![](https://img-blog.csdnimg.cn/6167ae414a854f8eabd01089d596b25f.png)

当我们将floating设置为false的时候，只有向上滑动到顶端的时候，flexibleSpace才会全部展示出来。

# 总结

简单点说，SliverAppBar就是一个在滑动中可变大小的AppBar,我们可以通过设置不同的参数来实现不同的效果。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)





