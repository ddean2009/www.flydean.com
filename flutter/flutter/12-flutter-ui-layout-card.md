
flutter系列之:Material中的3D组件Card

[toc]

# 简介

除了通用的组件之外，flutter还提供了两种风格的特殊组件，其中在Material风格中，有一个Card组件，可以很方便的绘制出卡片风格的界面，并且还带有圆角和阴影，非常的好用，我们一起来看看吧。

# Card详解

在详细讲解Card之前，我们考虑一下什么时候会用到Card？

一提到Card大家第一印象就是名片，在名片中描述了一个人的相关信息，比如姓名，电话和邮箱等。而Card就是将一组相关的信息放在一起呈现的组件。

我们来看下Card的定义：

```
class Card extends StatelessWidget 
```

可以看到Card是一个无状态的Widget,Card的构造函数需要传入比较多的参数，下面是Card的构造函数：

```
  const Card({
    Key? key,
    this.color,
    this.shadowColor,
    this.elevation,
    this.shape,
    this.borderOnForeground = true,
    this.margin,
    this.clipBehavior,
    this.child,
    this.semanticContainer = true,
  })
```

color表示的是Card的背景颜色，如果不设置的话，会使用ThemeData.cardTheme中指定的color，如果CardTheme.color也是空的话，那么会使用ThemeData.cardColor来替代。

shadowColor表示的是Card阴影的颜色，如果不设置的话，会使用ThemeData.cardTheme的shadowColor来代替，如果CardTheme.shadowColor也是空的话，那么会使用ThemeData.shadowColor来替代。

elevation是Card在Z轴的位置，通过设置这个值，我们可以控制Card下面shadow的大小。

shape是Card的形状，它是一个ShapeBorder对象，有很多已知的实现，比如CircleBorder,RoundedRectangleBorder,ContinuousRectangleBorder,BeveledRectangleBorder等。

borderOnForeground表示是否将Card的border在child之前展示。

clipBehavior是Card的裁剪规则。margin是card周围的空白部分。

semanticContainer是一个bool值，表示Card中的child是否都具有相同的semantic，或者说他们的类型是一致的。

最后一个参数就是child了，表示Card中的子元素。虽然Card中的child只有一个，但是这个child可以是可以包含多个child的widget，比如Row或者Column等。

# Card的使用

通过上面的讲解，我们对Card的使用也有了基本的了解，接下来我们可以通过一个具体的例子，来看看Card具体是如何使用的。

虽然Card里面包含了一个child widget，这个child widget可以是任何值，但是通常来说还是和Column或者Row一起使用的比较多。

这里我们使用Column来创建一个类似于名片的界面。

Column中有一个children的属性，可以包含多个子元素，我们可以在每一行中放上图片或者文字，如果要想进行复杂的布局，还可以自由进行复杂的组合。

但是对于类似名片这种常见的应用，flutter早就为我们想好了，所以他提供了一个叫做ListTile的组件。

ListTile是一个固定高度的Row，并且可以包含一个leading icon或者trailing icon。还可以包含title，subtitle还有一些点击的交互，非常的方便。

具体ListTile的使用，大家可以去参考具体的API，这里就不过多讲述。

这里我们只是借用ListTile来构造我们需要的效果。

不同的ListTile组件，可以用Divider来进行分割，让界面更加美观。

下面是我们CardApp的代码：

```
class CardApp extends StatelessWidget{
  const CardApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 210,
      child: Card(
        child: Column(
          children: [
            const ListTile(
              title: Text(
                'Han MeiMei',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              subtitle: Text('上海，张江'),
              leading: SizedBox(
                width: 20,
                child:Center(
                    child: CircleAvatar(
                      backgroundImage: AssetImage('images/head.jpg'),
                      radius: 10,
                    ))
              ),
            ),
            const Divider(),
            ListTile(
              title: const Text(
                '18888888888',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              leading: Icon(
                Icons.contact_phone,
                color: Colors.blue[500],
              ),
            ),
            ListTile(
              title: const Text('hanmeimei@163.com'),
              leading: Icon(
                Icons.contact_mail,
                color: Colors.blue[500],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

将CardApp放在Scaffold的body中运行，可以得到下面的界面：

![](https://img-blog.csdnimg.cn/0d68eed0f9074782a72121797c1ade2b.png)

大家可以看到Card的底部是有明显的3D效果的。这里我们使用了三个ListTile，其中第一个同时包含了title和subTtile这两个属性。

前面两个ListTile使用Divider进行分割，非常的好用。

# 总结

以上就是flutter中Card的使用了，大家可以结合ListTile一起构建更加美观和复杂的系统。




