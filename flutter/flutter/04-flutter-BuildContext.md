flutter系列之:构建Widget的上下文环境BuildContext详解

[toc]

# 简介

我们知道Flutter中有两种Widget，分别是StatelessWidget和StatefulWidget，StatelessWidget中有一个build方法来创建对应的Widget，虽然StatefulWidget中没有对应的build方法，但是和StatefulWidget对应的State中也有同样的build方法。

这个build方法就是用来创建Widget的核心方法。

我们来看下build方法的定义：

```
Widget build(BuildContext context);
```

build方法传入一个BuildContext对象，返回一个Widget对象，也就是说这个BuildContext中包含了要创建的Widget的所有信息。这个BuildContext被称为是Widget的上下文构建环境。

那么BuildContext有什么特性呢？我们又该如何使用BuildContext呢？一起来看看吧。

# BuildContext的本质

还记得flutter中的三颗树吗？

![](https://img-blog.csdnimg.cn/55d579bdd3654858b096c49a78e37629.png)

他们分别是Widgets树，Element树和Render树。其中Widgets树和Element树是一一对应的。而Render树和Element中的RenderObjectElement是一一对应的。

事实上BuildContext就是一个Element对象。怎么说呢？

我们先看下BuildContext的定义：

```
abstract class BuildContext {

    Widget get widget;
    ...
}
```

BuildContext是一个抽象类，我们再看一下Element类的定义：

```
abstract class Element extends DiagnosticableTree implements BuildContext {

```

可以看到，Element对象实现了BuildContext接口,而每一个BuildContext都有一个和其绑定的Widget对象。

经过复杂的关系传递运算，我们可以知道Element对象和Widget对象从代码层面来说，确实是一一对应的。

# BuildContext和InheritedWidget

InheritedWidget是一种widget用来在tree中向下传递变动信息，在tree的子节点中，可以通过调用BuildContext.dependOnInheritedWidgetOfExactType在子节点中查找最近的父InheritedWidget，从而将当前的BuildContext绑定的widget和InheritedWidget建立绑定关系，从而在下次InheritedWidget发生变动的时候，会自动触发BuildContext绑定的widget的rebuild方法。

听起来好像很复杂的样子，但是实际上很简单，我们举个例子,首先我们需要定义一个Widget用来继承InheritedWidget:

```
class FrogColor extends InheritedWidget {
   const FrogColor({
     Key? key,
     required this.color,
     required Widget child,
   }) : super(key: key, child: child);

   final Color color;

   static FrogColor of(BuildContext context) {
     final FrogColor? result = context.dependOnInheritedWidgetOfExactType<FrogColor>();
     assert(result != null, 'No FrogColor found in context');
     return result!;
   }

   @override
   bool updateShouldNotify(FrogColor old) => color != old.color;
 }
```

在这个方法中，我们需要定义一个of方法，这个该方法中，我们调用context.dependOnInheritedWidgetOfExactType方法，用来查找离BuildContext最近的FrogColor。

然后可以这样使用：

```
class MyPage extends StatelessWidget {
   const MyPage({Key? key}) : super(key: key);

   @override
   Widget build(BuildContext context) {
     return Scaffold(
       body: FrogColor(
         color: Colors.green,
         child: Builder(
           builder: (BuildContext innerContext) {
             return Text(
               'Hello Frog',
               style: TextStyle(color: FrogColor.of(innerContext).color),
             );
           },
         ),
       ),
     );
   }
 }
```

我们的本意是希望child中的Text组件的style根据父widget中的FrogColor的color来进行变化。所以在子组件的style中调用了FrogColor.of(innerContext)方法，对InheritedWidget进行查找，同时建立绑定关系。

在BuildContext中，有两个查找并且进行绑定的方法,他们是：

```
InheritedWidget dependOnInheritedElement(InheritedElement ancestor, { Object aspect });

T? dependOnInheritedWidgetOfExactType<T extends InheritedWidget>({ Object? aspect });
```

两者的区别是，后者限定了查找的类型。

除了dependOn之外，BuildContext还提供了两个查找的方法：

```
InheritedElement? getElementForInheritedWidgetOfExactType<T extends InheritedWidget>();
T? findAncestorWidgetOfExactType<T extends Widget>();
T? findAncestorStateOfType<T extends State>();
T? findRootAncestorStateOfType<T extends State>();
T? findAncestorRenderObjectOfType<T extends RenderObject>();
```

他们和depend的区别是，他们不会建立依赖关系，只是单纯的进行查找。

# BuildContext的层级关系

因为每个widget都有一个BuildContext，所以我们在使用的过程中一定要注意传入的BuildContext到底绑定的是哪个widget。

如下面的代码所示：

```
class MyPage extends StatelessWidget {
   const MyPage({Key? key}) : super(key: key);

   @override
   Widget build(BuildContext context) {
     return Scaffold(
       body: FrogColor(
         color: Colors.green,
         child: Builder(
           builder: (BuildContext innerContext) {
             return Text(
               'Hello Frog',
               style: TextStyle(color: FrogColor.of(innerContext).color),
             );
           },
         ),
       ),
     );
   }
 }
```

在FrogColor的child中，我们创建了一个新的Builder，并提供了一个新的innerContext。

为什么要这样做呢？因为如果我们不创建子innnerContext的话，使用的context就是Scaffold的，这样FrogColor.of将会找不到要找的对象，从而报错。

所以我们在使用BuildContext的时候，一定要注意。

# 总结

BuildContext是构建Widget的基础，它也提供了一些非常有用的查找和绑定的功能，希望能对大家有所帮助。





