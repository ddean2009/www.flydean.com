---
slug: /03-flutter-state
---

# 3. 用来管理复杂状态的State详解



# 简介

Flutter的基础是widget,根据是否需要跟用户进行交互，widget则可以分为StatelessWidget和StatefulWidget。StatelessWidget只能根据传入的状态进行简单的初始化widget，如果要实现跟用户交互这种复杂的功能，则需要用到StatefulWidget。

但是对于StatefulWidget本身来说，它并不存储任何状态，所有的状态都是存放在和StatefulWidget关联的State中的。

今天，让我们来探索一下StatefulWidget和State的关系。

# StatefuWidget和State

StatefulWidget的定义很简单，它是一个abstract class,继承它只需要实现一个createState的方法：

```
abstract class StatefulWidget extends Widget {
 
  const StatefulWidget({ Key? key }) : super(key: key);

  @override
  StatefulElement createElement() => StatefulElement(this);

  @protected
  @factory
  State createState(); 
}
```

注意，这里的createState是一个工厂类方法。这就意味着一个StatefulWidget可以创建多个State。

比如，如果从树中删除一个StatefulWidget，稍后再次将其插入到树中，Flutter将再次调用StatefulWidget.createState 来创建一个新的 State对象。

那么State中可以访问创建它的StatefulWidget吗？答案是肯定的。

在State中定义了一个T类型的widget, 这个T是StatefulWidget的子类：

```
abstract class State<T extends StatefulWidget> with Diagnosticable {
  T get widget => _widget!;
  T? _widget;
```

这里的_widget是不需要我们自行去设置的，这个_widget是由flutter框架在调用initState之前设置的。该_widget实际上就是和State关联的StatefulWidget。

我们可以直接在在State中使用widget来引用它。

# State的生命周期

讲完StatefulWidget和State的关系之后，接下来我们来了解一下State是如何变化的，通俗的讲，就是State的生命周期是怎么样的。

通常来说，一个State的生命周期有4个状态，分别是created,initialized,ready和defunct状态，这四个状态是定义在枚举类_StateLifecycle中的：

```
enum _StateLifecycle {
  /// State已经被创建成功了，State.initState方法被调用。
  created,

  /// State.initState方法虽然被调用了，但是State对象还没有构建完毕。 这时候会调用State.didChangeDependencies方法.
  initialized,

  /// State对象创建成功，State.dispose方法还没有被调用。
  /// called.
  ready,

  /// State.dispose方法被调用过了，State对象不允许再调用build方法。
  defunct,
}

```

我们详细来讲解一下State的生命周期。

首先，flutter为了创建State对象，会调用StatefulWidget.createState方法。因为StatefulWidget.createState方法只是简单的new一个State对象，所以这个时候State对象就处于created的状态。

这个新创建的State对象会和一个BuildContext相关联.注意这个关联关系是永久性的，不会发生变化的。

虽然关联关系不会发生变化，但是BuildContext本身是可以在树上进行移动的。这时候的State处于mounted状态。

接下来，flutter会调用State中的 initState方法。

对于State的具体实现来说，需要重写这个initState的方法，根据和State关联的BuildContext和Widget来初始化State的状态。其中BuildContext和Widget可以通过使用State的context和widget属性来访问获取。

然后flutter框架会调用state的didChangeDependencies方法。

什么时候会去调用这个方法呢？根据flutter的说法，当State依赖的对象发生变化的时候就会调用。

举个例子，如果在State的build方法中引用了一个InheritedWidget对象，而这个InheritedWidget对象后来发生了变化。这个时候flutter就会调用didChangeDependencies方法。

我们看下State中该方法的定义：

```
  void didChangeDependencies() { }
```

可以看到这个方法本身是一个空的方法体，因为并不是抽象方法，所以子类并不需要强制实现它。

为什么一般来说State的子对象并不需要重写这个方法呢？这是因为flutter如果检测到依赖有变化的时候，会去调用State的build方法。通常来说，我们并不需要这么频繁的进行重构。

当然，也会有一些特殊的情况，比如实时网络通讯这种实时性要求很高的情况。

这个时候，State对象完全初始化完毕了，接着就可以无限次数调用build方法，来重构用户界面。

State还可以主动调用setState方法来重构子树。

除了State主动调用setState方法之外，还有一些外部的变动会导致State的变动，比如：

```
void didUpdateWidget(covariant T oldWidget) { }
```

这个方法什么时候会被调用呢？

我们知道Widget是不会变的，每个Widget都有一个唯一的key用来标记，但是parent Widget可以使用同一个key和runtimeType来对当前的widget进行修改。因为Widget是不变的，所以生成一个新的widget。这时候flutter就会调用State中的didUpdateWidget方法，并且将老的Widget作为参数传入。

注意，flutter框架会在调用didUpdateWidget之后自动调用build方法，所以我们在写程序的过程中，注意不要重复调用。

如果是在开发过程中，flutter还支持热重载，这时候会调用state的reassemble方法：

```
void reassemble() { }
```

flutter框架会在触发热重载之后，调用build方法，所以一般来说，我们并不需要重写reassemble方法。

刚刚我们提到了parent Widget可能修改当前Widget的配置文件，如果修改了当前Widget的key，那么老的widget就处于一个deactivate 的状态，widget中的deactivate 方法就会被调用：

```
  void deactivate() {
    super.deactivate();
    assert(
      !renderObject.attached,
      'A RenderObject was still attached when attempting to deactivate its '
      'RenderObjectElement: $renderObject',
    );
  }
```

我们可以重写这个方法，来处理一些资源的清理工作。

注意，现在这个widget是deactivate状态，但是并不意味这它就没有用了。因为flutter还可以将这个widget再重新插入对象树中，继续使用。reinsert是通过调用State对象的build方法来实现的。

这个操作只要是在一个animation frame结束之前操作都是可以的。这样做的好处就是，state还可以保留部分资源并不释放，从而提升效率。

最后，如果State确实是不需要使用了，就会调用State的dispose 方法：

```
  void dispose() {
    assert(_debugLifecycleState == _StateLifecycle.ready);
    assert(() {
      _debugLifecycleState = _StateLifecycle.defunct;
      return true;
    }());
  }
```

当State的dispose方法被调用之后，State就处于unmounted状态。这时候State的setState方法就不能再被调用了，这就表示State的生命周期结束了。

# 总结

以上就是State和State的生命周期相关的介绍。










