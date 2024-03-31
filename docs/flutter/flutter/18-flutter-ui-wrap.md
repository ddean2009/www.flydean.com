---
slug: /18-flutter-ui-wrap
---

# 20. flutter中的Wrap



# 简介

我们在flutter中使用能够包含多个child的widget的时候，经常会遇到超出边界范围的情况，尤其是在Column和Row的情况下，那么我们有没有什么好的解决办法呢？答案就是今天我们要讲解的Wrap。

# Row和Column的困境

Row和Column中可以包含多个子widget，如果子widget超出了Row或者Column的范围会出现什么情况呢？

我们以Row的情况举个例子：

```
  Widget build(BuildContext context) {
    return Row(
      textDirection: TextDirection.ltr,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        YellowBox(),
        YellowBox(),
        Expanded(
          child: YellowBox(),
        ),
        YellowBox(),
      ],
    );
  }
```

上面的例子中，我们在Row中添加了几个YellowBox，YellowBox是一个width=100,height=50的长方形：

```
  Widget build(BuildContext context) {
    return Container(
      width: 100,
      height: 50,
      decoration: BoxDecoration(
        color: Colors.yellow,
        border: Border.all(),
      ),
    );
  }
```

运行上面的代码，我们可以得到这样的界面：

![](https://img-blog.csdnimg.cn/58910ef9890140fdb0b9a3fd1d9a62ea.png)

如果在Row中多添加几个YellowBox会有什么效果呢？

我们在上面的Row中多添加一个yellowBox：

```
  Widget build(BuildContext context) {
    return Row(
      textDirection: TextDirection.ltr,
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        YellowBox(),
        YellowBox(),
        Expanded(
          child: YellowBox(),
        ),
        YellowBox(),
        YellowBox(),
      ],
    );
  }
```

运行可以得到下面的界面：

![](https://img-blog.csdnimg.cn/fc8925378dca404183f4c8f8f7495a19.png)

可以看到，因为Row中的子widget太多了，已经超出了Row的范围，界面上已经报错了。

要解决这个问题，就需要使用到Wrap组件。

# Wrap组件详解

先来看下Wrap的定义：

```
class Wrap extends MultiChildRenderObjectWidget
```

Wrap继承自MultiChildRenderObjectWidget，表示可以包含多个子child。

接下来是Wrap的构造函数：

```
  Wrap({
    Key? key,
    this.direction = Axis.horizontal,
    this.alignment = WrapAlignment.start,
    this.spacing = 0.0,
    this.runAlignment = WrapAlignment.start,
    this.runSpacing = 0.0,
    this.crossAxisAlignment = WrapCrossAlignment.start,
    this.textDirection,
    this.verticalDirection = VerticalDirection.down,
    this.clipBehavior = Clip.none,
    List<Widget> children = const <Widget>[],
  }) : assert(clipBehavior != null), super(key: key, children: children);
```

构造函数中列出了Wrap中常用的属性。

其中direction表示子组件的排列方向。alignment表示的是子组件的对其方式。spacing表示子组件的间隔。

跟spacing类似的还有一个runSpacing属性，两者有什么区别呢？ 我们还是通过一个具体的例子来查看。

```
  Widget build(BuildContext context) {
    return Wrap(
      direction: Axis.horizontal,
      textDirection: TextDirection.ltr,
      children: [
        YellowBox(),
        YellowBox(),
        // Expanded(
        //   child: YellowBox(),
        // ),
        YellowBox(),
        YellowBox(),
        YellowBox(),
      ],
    );
```

还是上面的例子，这里我们使用Wrap来替换Row，这里我们使用了direction选项，表示是在横向方向进行Wrap。

然后在children中添加了5个YellowBox。

注意，这里不能使用Expanded，否则会报错，所以我们把Expanded注释掉了，运行可以得到下面的界面：

![](https://img-blog.csdnimg.cn/4348b5438a0a42b491b8a99892ca140f.png)

可以看到YellowBox是按行的方向来排列的，超出一行的范围之后就会自动换行，这也就是Wrap的功能。

我们在讲解Wrap的时候，还提到了两个属性，分别是spacing和runSpacing。两者有什么区别呢？

先看下spacing:

```
  Widget build(BuildContext context) {
    return Wrap(
      direction: Axis.horizontal,
      spacing: 10,
      textDirection: TextDirection.ltr,
      children: [
        YellowBox(),
        YellowBox(),
        // Expanded(
        //   child: YellowBox(),
        // ),
        YellowBox(),
        YellowBox(),
        YellowBox(),
      ],
    );
  }
```

我们先给Wrap添加spacing属性，运行可以得到下面的界面：

![](https://img-blog.csdnimg.cn/a7c0c0ebbb8b4e9b82f62c568aa658c0.png)

可以看到YellowBox之间是用spacing来进行分割的。

那么如果我们希望在Wrap换行的时候，两行之间也有一些间距应该怎么处理呢？

这个时候就需要用到runSpacing属性了：

```
  Widget build(BuildContext context) {
    return Wrap(
      direction: Axis.horizontal,
      spacing: 10,
      runSpacing: 10,
      textDirection: TextDirection.ltr,
      children: [
        YellowBox(),
        YellowBox(),
        // Expanded(
        //   child: YellowBox(),
        // ),
        YellowBox(),
        YellowBox(),
        YellowBox(),
      ],
    );
  }
```

运行可以得到下面的界面：

![](https://img-blog.csdnimg.cn/5e08111e00c340369b08373f0d0ea19b.png)

Wrap已经完美的运行了。

# 总结

Wrap可以通过使用不同的direction来替换Row或者Column，我们在组件可能会超出范围的时候，就可以考虑使用Wrap了。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)





