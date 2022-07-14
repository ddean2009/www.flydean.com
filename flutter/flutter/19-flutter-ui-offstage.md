flutter系列之:flutter中的offstage

[toc]

# 简介

我们在使用flutter的过程中，有时候需要控制某些组件是否展示，一种方法是将这个组件从render tree中删除，这样这个组件就相当于没有出现一样，但是有时候，我们只是不想展示这个widget，但是这个组件还是存在的，并且可以接受键盘输入，还可以使用CPU。它和真正的组件唯一不同的就是他是不可见的。

这样的组件就叫做Offstage。 今天给大家详细介绍一下Offstage的使用。

# Offstage详解

我们首先来看下Offstage的定义：

```
class Offstage extends SingleChildRenderObjectWidget
```

可以看到，Offstage是一个包含单个child的Widget。接下来看下它的构造函数：

```
  const Offstage({ Key? key, this.offstage = true, Widget? child })
    : assert(offstage != null),
      super(key: key, child: child);
```

Offstage主要包含两个属性，分别是表示是否是offstage状态的bool值offstage，如果offstage=true，那么Offstage的子child就会处于隐藏状态。这时候子child不会占用任何空间。

剩下的一个属性就是child了。

那么Offstage是如何控制child是否offstage的呢？

我们看下它的createRenderObject方法：

```
  RenderOffstage createRenderObject(BuildContext context) => RenderOffstage(offstage: offstage);
```

可以看到返回的是一个RenderOffstage对象，其中接受一个offstage参数。

如果深入研究RenderOffstage的话，可以看到他的paint方法是这样的：

```
  void paint(PaintingContext context, Offset offset) {
    if (offstage)
      return;
    super.paint(context, offset);
  }
```

如果offstage是true的话，paint方法直接返回，不会进行任何的绘制。这也就是Offstage的秘密。

# Offstage的使用

从上面讲解的Offstage的构造函数我们知道，Offstage需要一个bool的offstage属性。所以这个offstage属性是可以变换的，从而触发offstage的不同状态。

因为offstage需要这样的一个状态，所以我们在使用offstage的时候，一般来说是创建一个StatefulWidget,从而在StatefulWidget中保持这样的一个offstage属性。

比如我们创建一个OffstageApp，这是一个StatefulWidget,在它的createState方法中，返回一个`State<OffstageApp>`对象，在createState方法中，我们定义一个_offstage属性。

通过使用这个_offstage，我们可以创建Offstage如下：

```
Offstage(
          offstage: _offstage,
          child: SizedBox(
            key: _key,
            width: 150.0,
            height: 150.0,
            child: Container(
              color: Colors.red,
            ),
          ),
        )
```

这里我们设置Offstage的offstage为刚刚设置的_offstage。

另外为了展示方便，我们将Offstage的child设置为一个SizedBox，里面包含了一个红色的Container。

SizedBox包含了width和height属性，方便我们后续的测试。

默认情况下，因为_offstage=true，所以这个Offstage是不可见的，那么怎么将其可见呢？

我们提供一个ElevatedButton,在它的onPressed方法中，我们调用setState方法来修改_offstage，如下所示：

```
ElevatedButton(
          child: const Text('切换offstage'),
          onPressed: () {
            setState(() {
              _offstage = !_offstage;
            });
          },
        ),
```

另外，我们还需要一个ElevatedButton来检测Offstage的大小，看看在_offstage发生变化的时候，Offstage到底会不会发生变化。

```
 ElevatedButton(
              child: const Text('检测SizedBox大小'),
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content:
                    Text('SizedBox is ${_getSizedBoxSize()}'),
                  ),
                );
              })
```

这里的_getSizedBoxSize实现如下：

```
  Size _getSizedBoxSize() {
    final RenderBox renderBox =
    _key.currentContext!.findRenderObject()! as RenderBox;
    return renderBox.size;
  }
```

我们通过Offstage的_key,来获取到它的Context，从而找到对应的RenderBox，拿到它的大小。

好了，这样我们的代码就写好了，最后将OffstageApp放到Scaffold中运行，我们可以得到下面的界面：

![](https://img-blog.csdnimg.cn/06376add35f0446e8ff6d30a7e19d47b.png)

默认Offstage是不会展示的。

如果我们点击下面的检测SizeBox大小的按钮，可以得到下面的界面：

![](https://img-blog.csdnimg.cn/613d1c3da38e4562a6d51d8958609a1d.png)

可以看到虽然Offstage没有展示，但是还是获取到了它的大小。

然后我们点击切换Offstage按钮，可以得到下面的界面：

![](https://img-blog.csdnimg.cn/46dcd3dc865e4403b93448a29432591b.png)

界面完美的展示了。

# 总结

Offstage是一个非常方便的组件，可以用来隐藏我们不需要展示的组件，但是仍然可以获得它的大小。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)





