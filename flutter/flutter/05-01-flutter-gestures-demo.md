flutter系列之:移动端手势的具体使用

[toc]

# 简介

之前我们介绍了GestureDetector的定义和其提供的一些基本的方法，GestureDetector的好处就是可以把任何一个widget都赋予类似button的功能。

今天将会通过几个具体的例子来讲解一下GestureDetector的具体使用。

# 赋予widget可以点击的功能

一般情况下，我们的普通widget，比如文本是不能进行交互的，但是如果将其用GestureDetector进行包装之后，就可以将其伪装成为一个button。

比如我们有这样一个伪装成button的Container：

```
Container(
        padding: const EdgeInsets.all(12.0),
        decoration: BoxDecoration(
          color: Colors.green,
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: const Text('My Button'),
      )
```

这个Container的本质是一个Text，这个Container本身是没有交互功能的，那么如何对其添加交互功能呢？

最简单的办法就是将其使用GestureDetector包装起来，如下所示：

```
GestureDetector(
      // The custom button
      child: Container(
        padding: const EdgeInsets.all(12.0),
        decoration: BoxDecoration(
          color: Colors.green,
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: const Text('My Button'),
      ),
    )
```

接下来我们还要为其添加对应的手势，这里我们添加一个onTap方法，

```
GestureDetector(
      onTap: ()=> showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text('基本手势'),
          content: const Text('这是基本的手势，你学会了吗？'),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.pop(context, 'Cancel'),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, 'OK'),
              child: const Text('OK'),
            ),
          ],
        ),
      ),
      ...
```

这里onTap会调用一个showDialog来弹出一个对话框，运行之后结果如下：

![](https://img-blog.csdnimg.cn/9f91afe5ffc6481a94e24fc09d0464a9.png)

# 会动的组件

在上面的例子中，我们用手去tap按钮是没有互动效果的，也就是说按钮是不会变化的。

那么有没有可能模拟手指的按压效果呢？

答案是肯定的，flutter为我们提供了一个InkWell组件，这样手指按压下组件会产生波纹的效果。

那么InkWell和GestureDetector有什么联系呢？

InkWell和GestureDetector很类似，都提供了对手势的支持。

在InkWell中提供了多种GestureTapCallback接口，用接收手势的回调，非常的方便。

在使用上，InkWell和GestureDetector也很类似，我们可以完全照搬GestureDetector的用法。

还是上面的例子，我们可以将GestureDetector替换成为InkWell,如下所示：

```
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Tap'),
        ));
      },
      child: const Padding(
        padding: EdgeInsets.all(12.0),
        child: Text('Flat Button'),
      ),
    );
  }
```

这里，为了更好的观察手势按压之后的效果，这里onTap选择展示一个flutter自带的SnackBar。

# 可删除的组件

在app中的手势应用上，有一个比较常见的用法就是在list列表中，向左滑动一个item，会出现删除的按钮，这种滑动删除的效果，如何在flutter中实现呢？

flutter提供了一个Dismissible的组件来实现这个效果。

我们先来看下Dismissible的定义：

```
class Dismissible extends StatefulWidget {
    const Dismissible({
    required Key key,
    required this.child,
    this.background,
    this.secondaryBackground,
    this.confirmDismiss,
    this.onResize,
    this.onUpdate,
    this.onDismissed,
    this.direction = DismissDirection.horizontal,
    this.resizeDuration = const Duration(milliseconds: 300),
    this.dismissThresholds = const <DismissDirection, double>{},
    this.movementDuration = const Duration(milliseconds: 200),
    this.crossAxisEndOffset = 0.0,
    this.dragStartBehavior = DragStartBehavior.start,
    this.behavior = HitTestBehavior.opaque,
  }) : assert(key != null),
       assert(secondaryBackground == null || background != null),
       assert(dragStartBehavior != null),
       super(key: key);
```

可以看到Dismissible是一个StatefulWidget，它有两个必须的参数分别是key和child。

key用来标记要删除item的id，child是可以滑动删除的组件。

为了演示方便，我们使用ListView来展示如何使用Dismissible。

首先我们构建一个items的list，里面包含了每个item要展示的内容：

```
 final items = List<String>.generate(10, (i) => '动物 ${i + 1}');
```

然后使用ListView的builder方法来构建items。并且将每个items封装到Dismissible中去：

```
body: ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return Dismissible(
              key: Key(item),
              onDismissed: (direction) {
                setState(() {
                  items.removeAt(index);
                });
                ScaffoldMessenger.of(context)
                    .showSnackBar(SnackBar(content: Text('$item 被删除了')));
              },
              child: ListTile(
                title: Text(item),
              ),
            );
          },
        )
```
这里Dismissible的child是ListTile组件，里面的具体内容就是Text。

现在Dismissible实际上就可以工作了，当你滑动ListTile的时候，对应的item就会被删除。

为了明显起见，我们可以给Dismissible添加一个background属性，这样滑动删除的时候就有了一个背景颜色：

```
              background: Container(color: Colors.red),
```

另外，Dismissible还有一个confirmDismiss属性，可以用来判断是否真的要滑动删除，比如我们只允许从右到左滑动删除，那么可以这样做：

```
Dismissible(
  ...
confirmDismiss:confirmResult,
...
)

  Future<bool> confirmResult(DismissDirection direction) async {
    if(direction == DismissDirection.endToStart){
      return true;
    }
    return false;
  }
```

这里的confirmResult是一个异步函数，它接收一个DismissDirection的参数，这个参数表示的是滑动删除的方向，我们可以通过这个方向来判断是否真正的进行删除操作。

# 总结

以上就是日常手势的基本使用了，我们可以通过GestureDetector，InkWell和Dismissible来和手势进行结合来实现相应的功能。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)