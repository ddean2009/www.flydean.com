flutter系列之:Navigator的高级用法

[toc]

# 简介

上篇文章我们讲到了flutter中navigator的基本用法，我们可以使用它的push和pop方法来进行Router之间的跳转。

在flutter中一个Router就是一个widget，但是在Android中，一个Router就是Activity,在IOS中，一个Router是一个ViewController。

Router除了之前讲过的push和pop方法之外，还有一些更加高级的用法，一起来看看吧。

# named routes

虽然在flutter中navigator将routers以stack的形式进行存储，能做的也只是push和pop操作，但是事实上Router是可以有名字的。

想想也是，如果Router没有名字的话，那么如何顺利进行跳转呢？不可能每次都new一个Router出来吧。

navigator有一个方法叫做Navigator.pushNamed()用来将带名字的Router压入堆栈，我们来看下它的定义：

```
  static Future<T?> pushNamed<T extends Object?>(
    BuildContext context,
    String routeName, {
    Object? arguments,
  }) {
    return Navigator.of(context).pushNamed<T>(routeName, arguments: arguments);
  }
```

这个方法需要传入一个context和对应的routeName，同时还可以带一些参数。

那么怎么用这个方法呢？

首先我们需要定义一些Router，比如说在创建MaterialApp的时候可以传入routes参数，来设置named Routers：

```
MaterialApp(
  title: '这是named Routers',
  initialRoute: '/firstPage',
  routes: {
    '/firstPage': (context) => const FirstPage(),
    '/secondPage': (context) => const SecondPage(),
  },
)
```

上面的代码中我们分别定了两个routers，分别是firstPage和secondPage,他们分别对应一个自定义的widget。

定义好Router之后，我们就可以向下面这样使用了：

```
onPressed: () {
  Navigator.pushNamed(context, '/secondPage');
}
```

如果要返回第一个页面的话，那么可以调用Navigator.pop方法来实现：

```
onPressed: () {
  Navigator.pop(context);
}
```

# 给named route传参数

在上一节我们讲到pushNamed的时候，还介绍了它还可以接收参数arguments。从定义上可以看到arguments的类型是Object对象，也就是说任何对象都可以作为named route的参数。

那么我们先定义一个对象如下：

```
class TestArguments {
  final String name;
  final String description;

  TestArguments(this.name, this.description);
}
```

接下来我们需要创建一个能够接受这个参数的Routers。

因为所有的Routers都是Widget，所以我们需要创建一个Widget,并在这个widget内部接收传入的参数。

在flutter中有两种传递参数的方式，你可以使用ModalRoute.of()，也可以使用onGenerateRoute()。

我们先来看下ModalRoute.of的定义：

```
  static ModalRoute<T>? of<T extends Object?>(BuildContext context) {
    final _ModalScopeStatus? widget = context.dependOnInheritedWidgetOfExactType<_ModalScopeStatus>();
    return widget?.route as ModalRoute<T>?;
  }
```

它接收一个context参数，然后返回一个route对象。

具体的用法如下：

```
class FirstPage extends StatelessWidget {
  const FirstPage({super.key});

  static const routeName = '/firstPage';

  @override
  Widget build(BuildContext context) {

    final args = ModalRoute.of(context)!.settings.arguments as TestArguments;

    return Scaffold(
      appBar: AppBar(
        title: Text(args.name),
      ),
      body: Center(
        child: Text(args.description),
      ),
    );
  }
}
```

除了使用ModalRoute之外，还可以在onGenerateRoute()方法中进行参数传递。onGenerateRoute是在Route生成的时候触发的：

```
MaterialApp(

  onGenerateRoute: (settings) {
   
    if (settings.name == FirstPage.routeName) {
 
      final args = settings.arguments as TestArguments;

      return MaterialPageRoute(
        builder: (context) {
          return TestArguments(
            title: args.title,
            message: args.message,
          );
        },
      );
    }
    return null;
  },
)
```

onGenerateRoute接收一个settings对象，我们需要在settings对象中设置对应的name和arguments属性。所以我们需要这样调用：

```
    Navigator.pushNamed(
      context,
      FirstPage.routeName,
      arguments: TestArguments(
        '测试',
        '这是一个named Route',
      ),
    );
```

# 从Screen返回值

有时候我们需要从一个Screen返回到之前的Screen，并且不是简单的返回，我们还希望知道前一个screen返回了什么结果，然后可以根据前一个screen返回的不同结果来进行不同的处理。

这个时候就需要用到Navigator.pop的传参功能了。

比如我们在第一个页面中点击了按钮，跳转到第二个页面：

```
  final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const SecondScreen()),
    );
```

这里我们使用到了Navigator.push方法，并且返回了一个result的值。

我们可以使用这个值来进行一些逻辑判断。

那么这个result的值是哪里传递过来的呢？

没错，就是SecondScreen中的Navigator.pop方法：

```
Navigator.pop(context, 'Yes');
```

这里的'Yes'就会传递给result供我们进行逻辑判断。

# 向Screen传值

有时候我们需要在页面跳转的过程中传递一些参数，那么怎么才能实现Screen之间的参数传递呢？

因为在flutter中所有的Routers都是Widget，所以我们可以在跳转到新的页面的时候直接将参数以构造函数的方式传递给Routers Widget。

比如我们有下面的Screen Widget：

```
class NameScreen extends StatelessWidget {

  const NameScreen({super.key, required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('NameScreen'),
      ),

      body: 
      ...
      ;
  }
}
```

想要传值给它，可以在onTap方法中这样写：

```
onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => NameScreen(name: 'what is your name?'),
          ),
        );
```

# 总结

以上就是Navigator的更加高级的用法，我们可以通过Navigator来进行数据传递等操作，从而实现更加复杂的页面功能。











