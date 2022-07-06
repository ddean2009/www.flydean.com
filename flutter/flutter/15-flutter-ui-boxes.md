flutter系列之:flutter中常用的box

[toc]

# 简介

flutter中的layout有很多，基本上看layout的名字就知道这个layout到底是做什么用的。比如说这些layout中的Box，从名字就知道这是一个box的布局，不过flutter中的box还有很多种，今天我们来介绍最常用的LimitedBox,SizedBox和FittedBox。

# LimitedBox

LimitedBox是一种限制大小的Box，先来看下LimitedBox的定义：

```
class LimitedBox extends SingleChildRenderObjectWidget 
```

可以看到LimitedBox继承自SingleChildRenderObjectWidget，表示LimitedBox中可以有一个single child。

那么LimitedBox一般用在什么地方呢？

考虑在一个可滚动列表的情况下，比如ListView,因为他是unbounded的，如果ListView的子widget是Container的话，Container会尽可能的小，这很明显不是我们所想要的，我们以下面的代码为例：

```
  Widget build(BuildContext context) {
    return ListView(
      children: [
        for(var i=0; i < 10 ; i++)
          Container(
            color: list[i % 4],
          )
      ],
    );
  }
```

在ListView中，我们添加了一个Container,这些Container中只设置了color，并且并未设置任何大小，那么将会得到下面的界面：

![](https://img-blog.csdnimg.cn/be9088a24f694e02a638dbf880e90673.png)

可以看到现在看到的界面是空白的。

当然，你可以给Container设置height属性来达到对应的目的：

```
  Widget build(BuildContext context) {
    return ListView(
      children: [
        for(var i=0; i < 10 ; i++)
          Container(
            height: 100,
            color: list[i % 4],
          )
      ],
    );
  }
```

或者使用LimitedBox来达到同样的效果：

```
  Widget build(BuildContext context) {
    return ListView(
      children: [
        for(var i=0; i < 10 ; i++)
          LimitedBox(
            maxHeight: 100,
            child: Container(
              // height: 100,
              color: list[i % 4],
            ),
          )
      ],
    );
  }
```

我们可以得到下面的界面：

![](https://img-blog.csdnimg.cn/869ae6d679114bd9a445093af3ea41d8.png)

# SizedBox

SizedBox从名字就知道是给box一个指定的size。

先来看下Sizedbox的定义：

```
class SizedBox extends SingleChildRenderObjectWidget
```

可以看到SizedBox继承自SingleChildRenderObjectWidget，表示它可以包含一个child widget。

然后再来看下它的构造函数：

```
const SizedBox({ Key? key, this.width, this.height, Widget? child })
```

SizedBox主要接受width,height和它的child widget。SizedBox主要用来强制它的child widget的width和height保持一致。

我们来看一个具体的例子:

```
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200.0,
      height: 200.0,
      child: Container(
        color: Colors.blue,
      ),
    );
  }
```

上面的例子中我们指定了固定SizedBox。最后得到的界面如下：

![](https://img-blog.csdnimg.cn/c024a79a814b4f5f9faee19827328a61.png)

事实上SizedBox的width和height并不一定是固定的值，我们可以将他们设置为double.infinity，表示child widget会尽可能的填充。

比如下面的例子:

```
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: double.infinity,
      child: Container(
        color: Colors.blue,
      ),
    );
  }
```

展示的界面是这样的:

![](https://img-blog.csdnimg.cn/445e1bfb97124d59a1ce3902089e00f6.png)

SizedBox也提供了一个expand方法来提供类似的功能:

```
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Container(
        color: Colors.blue,
      ),
    );
  }
```

上面的代码和使用double.infinity是等价的。

SizedBox还可以不包含任何child,在这种情况下，SizedBox表示的就是一个空白gap。

# FittedBox

FittedBox就是填充box的意思，可以按照指定的fit规则来填充它的child。

先来看下FittedBox的定义：

```
class FittedBox extends SingleChildRenderObjectWidget {
```

FittedBox继承自SingleChildRenderObjectWidget，表示它也只包含一个child。

再看下FittedBox的构造函数：

```
  const FittedBox({
    Key? key,
    this.fit = BoxFit.contain,
    this.alignment = Alignment.center,
    this.clipBehavior = Clip.none,
    Widget? child,
  })
```

FittedBox有几个非常有意思的参数，首先是fit，表示如何填充Box,它是一个BoxFit对象，BoxFit有几个值，用来描述fix的方式。

比如fill表示填充到box中，不管之前child的长宽比，而contain表示的是尽可能的包含child。

alignment是一个AlignmentGeometry，表示的是child的排列方式。

clipBehavior表示的是Box和child重叠的时候的剪切方式。

我们看一个具体的例子:

```
  Widget build(BuildContext context) {
    return FittedBox(
      fit: BoxFit.fill,
      child: Image.asset('images/head.jpg'),
    );
  }
```

上面例子中，我们使用了BoxFit.fill来填充，我们看下具体的效果：

![](https://img-blog.csdnimg.cn/4b937fec17954bd0b598bc6c057f8ec2.png)


# 总结

这几个box是我们在日常的工作中经常会用到的box。大家可以熟练掌握。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)






