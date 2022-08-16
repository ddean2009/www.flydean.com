flutter系列之:查询设备信息的利器:MediaQuery

[toc]

# 简介

移动的开发中，大家可能最头疼的就是不同设备的规格了，现在设备这么多，如何才能在诸多的设备中找到合适的widget的位置来进行绘制呢？

不用怕，在flutter中为我们提供了一个叫做MediaQuery的利器，大家一起来看看吧。

# MediaQuery详解

MediaQuery从名字上来看，它的意思是媒体查询。它可以查询的东西就多了，可以查询当前你app的窗口信息，查询你指定的某个widget的信息等等，非常的强大。

我们先来看下MediaQuery到底是什么。 具体来说MediaQuery继承自InheritedWidget:

```
class MediaQuery extends InheritedWidget 
```

那么什么是InheritedWidget呢？为什么MediaQuery需要继承InheritedWidget呢？

很多时候，我们需要从widget的子widget中获取到父widget对象，InheritedWidget就是一个可以提供简单获取方法的对象。

在InheritedWidget中可以实现of方法，通过调用BuildContext.dependOnInheritedWidgetOfExactType来从context中获取最临近的InheritedWidget对象。

这里，因为MediaQuery是一个媒体查询工具，所以我们可能需要在很多地方随时随地的进行对象的获取，那么这里使用InheritedWidget就是再好不过了。

## MediaQuery的属性

MediaQuery的自有属性只有两个，分别是MediaQueryData类型的data和Widget类型的child。

MediaQueryData是一个类似于结构体的类，用来存储各种Media的状态信息。

我们先来看下MediaQueryData的构造函数：

```
const MediaQueryData({
    this.size = Size.zero,
    this.devicePixelRatio = 1.0,
    this.textScaleFactor = 1.0,
    this.platformBrightness = Brightness.light,
    this.padding = EdgeInsets.zero,
    this.viewInsets = EdgeInsets.zero,
    this.systemGestureInsets = EdgeInsets.zero,
    this.viewPadding = EdgeInsets.zero,
    this.alwaysUse24HourFormat = false,
    this.accessibleNavigation = false,
    this.invertColors = false,
    this.highContrast = false,
    this.disableAnimations = false,
    this.boldText = false,
    this.navigationMode = NavigationMode.traditional,
  })
```

可以看到，MediaQueryData中包含了很多有用的属性，我们来详细看一下具体的内容。

首先是表示media logical pixels大小的size。大家要注意的是，这里的size表示的是逻辑pixels的大小。

有logical pixels，就有Physical pixels,前者表示的逻辑大小，在任何设备上都是一样的，而后者表示的是真实的物理设备所支持的像素大小。这两种是可以不同的。一个物理像素可能代表多个逻辑像素，这个对应关系就是由devicePixelRatio这个属性来决定的。

devicePixelRatio表示的是一个物理像素代表多少个逻辑像素。devicePixelRatio并不要求是整数，比如在Nexus 6中，这个devicePixelRatio=3.5。

接下来是textScaleFactor，表示一个逻辑像素能够表示多少个字体像素。或者你可以将其理解为字体的放大程度。

比如textScaleFactor=1.5，那么它的意思是呈现出来的字体要比给定的字体大50%。

然后是platformBrightness，表示的是设备的明亮程度。最常见的比如说明亮模式或者黑暗模式等。

viewInsets指的是被系统UI所完全遮罩的部分，比如说我们在进行键盘输入的时候，会弹起键盘界面。

padding表示的是被系统UI所部分遮罩,并不能完全看见的部分，通常是系统状态栏，比如iphone中的刘海等。

viewPadding表示的是被系统UI所部分遮罩,并不能完全看见的部分，通常是系统状态栏，比如iphone中的刘海等。

哇喔，看起来padding和viewPadding是一样的，那么事实是否如此呢？

这两者通常情况下是一样的，只有在出现键盘输入界面的时候两者就会发生不同。

简单来说，viewPadding是固定的，它的大小不会随键盘的显示而发生变化，Padding是可变化的，当键盘弹起，系统状态栏被遮罩的时候，它的bottom值就是0。

systemGestureInsets是一个特殊的手势区域，在这个区域里面只能识别部分的手势指令，而不能识别所有的手势指令，所以需要这样的一个属性。

alwaysUse24HourFormat表示是否使用24小时的时间格式。

accessibleNavigation表示用户是否使用了一些accessibility服务来和应用进行交互。

还有其他的一些属性比如highContrast,disableAnimations,boldText,navigationMode和orientation等基础的属性可以使用。

MediaQuery的另外一个属性就是child了。 

## MediaQuery的构造函数

MediaQuery除了最常规的构造函数之外，还有三个构造函数，分别是MediaQuery.removePadding,MediaQuery.removeViewInsets和MediaQuery.removeViewPadding。

这三个构造函数都是通过传入一个指定的context和child来构造MediaQuery，但是他们都相应的移出了一些属性。根据名字就可以看出来，这三个分别移出的是padding，viewInsets和viewPadding。

我们以removePadding为例，看一下具体的实现流程：

```
  factory MediaQuery.removePadding({
    Key? key,
    required BuildContext context,
    bool removeLeft = false,
    bool removeTop = false,
    bool removeRight = false,
    bool removeBottom = false,
    required Widget child,
  }) {
    return MediaQuery(
      key: key,
      data: MediaQuery.of(context).removePadding(
        removeLeft: removeLeft,
        removeTop: removeTop,
        removeRight: removeRight,
        removeBottom: removeBottom,
      ),
      child: child,
    );
  }
```

removePadding方法需要传入四个额外的参数来表示是否需要移出padding的left,top,right或者bottom。

我们可以看到返回了一个新的MediaQuery，其中data部分使用了`MediaQuery.of(context)`来获取context最近的MediaQuery，然后调用它的removePadding方法将对应的padding属性删除。

# MediaQuery的使用

讲完MediaQuery的构造函数，接下来我们看一下MediaQuery常用的使用场景。

其实MediaQuery最常见的用处就是来判断设备的大小，从而根据不同设备的大小来进行页面的调整。

比如下面的getSize方法：

```
enum ScreenSize { Small, Normal, Large, ExtraLarge }

ScreenSize getSize(BuildContext context) {
  double deviceWidth = MediaQuery.of(context).size.shortestSide;
  if (deviceWidth > 900) return ScreenSize.ExtraLarge;
  if (deviceWidth > 600) return ScreenSize.Large;
  if (deviceWidth > 300) return ScreenSize.Normal;
  return ScreenSize.Small;
}
```

我们通过`MediaQuery.of(context)`拿到MediaQuery，然后通过size的shortestSide属性获得设备的宽度，然后根据设备的宽度跟特定的宽度进行对比，从而判断设备屏幕的大小。

当然，MediaQuery还可以用在其他需要检测Media属性的地方，大家可以仔细体会。

# 总结

MediaQuery是flutter中一个非常方便的工具，用来检测media的属性情况，根据MediaQuery，我们可以做出更加富有交互性的APP。







