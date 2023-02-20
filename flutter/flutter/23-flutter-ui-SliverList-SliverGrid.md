flutter系列之:使用SliverList和SliverGird

[toc]

# 简介

在上一篇文章我们讲解SliverAppBar的时候有提到过，Sliver的组件一般都用在CustomScrollView中。除了SliverAppBar之外，我们还可以为CustomScrollView添加List或者Grid来实现更加复杂的组合效果。

今天要向大家介绍的就是SliverList和SliverGird。

# SliverList和SliverGird详解

从名字就可以看出SliverList和SliverGird分别是List和Grid的一种，他们和List与Grid最大的区别在于，他们可以控制子widget在main axis和cross axis之间的间隔，并且可以通过Extent属性来控制子widget的大小，非常的强大。

我们先来看下这两个组件的定义和构造函数：

```
class SliverList extends SliverMultiBoxAdaptorWidget {
  /// Creates a sliver that places box children in a linear array.
  const SliverList({
    Key? key,
    required SliverChildDelegate delegate,
  }) : super(key: key, delegate: delegate);
```

SliverList继承自SliverMultiBoxAdaptorWidget，它的构造函数比较简单，需要传入一个SliverChildDelegate的参数，这里的SliverChildDelegate使用的是delegate的方法来创建SliverList的子组件。

SliverChildDelegate是一个抽象类，它有两个实现类，分别是SliverChildBuilderDelegate和SliverChildListDelegate。

其中SliverChildBuilderDelegate是用的builder模式来生成子widget，在上一篇文章中，我们构建SliverList就是使用的这个builder类。

SliverChildBuilderDelegate使用builder来生成子Widget，而SliverChildListDelegate需要传入一个childList来完成构造，也就是说SliverChildListDelegate需要一个确切的childList，而不是用builder来构建。

要注意的是SliverList并不能指定子widget的extent大小，如果你想指定List中的子widget的extent大小的话，那么可以使用SliverFixedExtentList:

```
class SliverFixedExtentList extends SliverMultiBoxAdaptorWidget {
  const SliverFixedExtentList({
    Key? key,
    required SliverChildDelegate delegate,
    required this.itemExtent,
  }) : super(key: key, delegate: delegate);
```

可以看到SliverFixedExtentList和SliverList相比，多了一个itemExtent参数，用来控制子widget在main axis上的大小。

然后我们再来看一下SliverGird：

```
class SliverGrid extends SliverMultiBoxAdaptorWidget {
  /// Creates a sliver that places multiple box children in a two dimensional
  /// arrangement.
  const SliverGrid({
    Key? key,
    required SliverChildDelegate delegate,
    required this.gridDelegate,
  }) : super(key: key, delegate: delegate);
```

SliverGrid也是继承自SliverMultiBoxAdaptorWidget，和SliverList一样，它也有一个SliverChildDelegate的参数，另外它还多了一个gridDelegate的参数用来控制gird的布局。

这里的gridDelegate是一个SliverGridDelegate类型的参数,用来控制children的size和position。

SliverGridDelegate也是一个抽象类，它有两个实现类，分别是SliverGridDelegateWithMaxCrossAxisExtent和SliverGridDelegateWithFixedCrossAxisCount,这两个实现类的区别就在于MaxCrossAxisExtent和FixedCrossAxisCount的区别。

怎么理解MaxCrossAxisExtent呢？比如说这个Grid是竖向的，然后Gird的宽度是500.0,如果MaxCrossAxisExtent=100，那么delegate将会创建5个column，每个column的宽度是100。

crossAxisCount则是直接指定cross axis的child个数有多少。

# SliverList和SliverGird的使用

有了上面介绍的SliverList和SliverGird的构造函数,接下来我们具体来看下如何在项目中使用SliverList和SliverGird。

默认情况下SliverList和SliverGird是需要和CustomScrollView一起使用的，所以我们先创建一个CustomScrollView，在它的slivers属性中，放入一个SliverAppBar组件：

```
CustomScrollView(
      slivers: <Widget>[
        const SliverAppBar(
          pinned: true,
          snap: false,
          floating: false,
          expandedHeight: 200.0,
          flexibleSpace: FlexibleSpaceBar(
            title: Text('SliverList and SliverGrid'),
          ),
        ),
      ],
    );
```

SliverAppBar只是一个AppBar，运行可以得到下面的界面：

![](https://img-blog.csdnimg.cn/979a93ccb3ba4cb1893684755db0ae49.png)

我们还需要为它继续添加其他的slivers组件。

首先给他添加一个SliverGrid：

```
SliverGrid(
          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 200.0,
            mainAxisSpacing: 20.0,
            crossAxisSpacing: 50.0,
            childAspectRatio: 4.0,
          ),
          delegate: SliverChildBuilderDelegate(
                (BuildContext context, int index) {
              return Container(
                alignment: Alignment.center,
                color: Colors.green[100 * (index % 9)],
                child: Text('grid item $index'),
              );
            },
            childCount: 20,
          ),
        ),
```

这里我们设置了gridDelegate属性，并且自定义了SliverChildBuilderDelegate，用来生成20个Container。

运行得到的界面如下：

![](https://img-blog.csdnimg.cn/91c003fe73814442b0d5656646a3d45d.png)

然后为其添加SliverList:

```
SliverList(
          delegate: SliverChildBuilderDelegate(
                (BuildContext context, int index) {
              return Container(
                color: index.isOdd ? Colors.white : Colors.green,
                height: 50.0,
                child: Center(
                  child: ListTile(
                    title: Text(
                      '100' + index.toString(),
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    leading: Icon(
                      Icons.account_box,
                      color: Colors.green[100 * (index % 9)],
                    ),
                  ),
                ),
              );
            },
            childCount: 15,
          ),
        ),
```

因为SliverList只需要传入一个delegate参数，这里我们生成了15个child组件。生成的界面如下：

![](https://img-blog.csdnimg.cn/e2531b7aa8de47fe91cf18033611acaf.png)

因为SliverList不能控制List中子widget的extent，所以我们再添加一个SliverFixedExtentList看看效果：

```
SliverFixedExtentList(
          itemExtent: 100.0,
          delegate: SliverChildBuilderDelegate(
                (BuildContext context, int index) {
              return Container(
                color: index.isOdd ? Colors.white : Colors.green,
                height: 50.0,
                child: Center(
                  child: ListTile(
                    title: Text(
                      '200' + index.toString(),
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    leading: Icon(
                      Icons.account_box,
                      color: Colors.green[100 * (index % 9)],
                    ),
                  ),
                ),
              );
            },
            childCount: 15,
          ),
```

SliverFixedExtentList和SliverList相比多了一个itemExtent属性，这里我们将其设置为100，运行可以得到下面的界面：

![](https://img-blog.csdnimg.cn/de0f6604e2d642b1a80a1cadf4dad999.png)

可以看到List中的子Widget高度发生了变化。

# 总结

在CustomScrollView中使用SliverList和SliverGird，可以实现灵活的呈现效果。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)

