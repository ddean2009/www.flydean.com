flutter系列之:widgets,构成flutter的基石

[toc]

# 简介

flutter中所有的组件都是由widgets组成的，flutter中有各种各样的widgets，这些widgets构成了flutter这个大厦。

那么flutter中的widget有什么特点呢？我们应该怎么学习widget呢？ 一起来看看吧。


# StatelessWidget和StatefulWidget
实时上，flutter中的widgets是受到React的启发来实现的。flutter中的widget可以分为StatefulWidget和StatelessWidget,分别代表有状态的Widgets和无状态的Widgets。

有状态和无状态，大家听起来是不是很熟悉，我们在应用程序中也经常会用到有状态的Bean和无状态的Bean。他们的原理和flutter的两类Widget其实是差不多的。

StatelessWidget因为是无状态的，所以它只会根据初始传入的配置信息来构建Widget，因为Widget是不可变的，所以StatelessWidget创建出来就不会再变化。

对于StatefulWidget来说，除了根据初始传入的配置来创建Widget之外，它内部还包含了一个State。这个State用来和用户的行为进行交互，从而对State中的值进行修改。当State被修改后，和其绑定的Widget会根据特定的算法进行比较，看是否需要进行重绘，从而将用户的交互反映在用户界面上。

widget提供了一个build方法，build方法返回一个Widget，用于生成最后的RenderObject对象。

build方法的定义如下：

```
Widget build(BuildContext context);
```

但事实上，只有StatelessWidget中才有build方法。那么StatefulWidget为什么没有build方法呢？

StatefulWidget虽然没有build方法，但是它有一个createState方法用来创建跟它关联的State：

```
State createState(); 
```

而这个build方法是放在State里面的。

# StatelessWidget详解

什么样的组件可以做成无状态的组件呢？那些不需要和用户交互的组件就可以。

flutter中的无状态Widget都有那些呢？

这里列出几个flutter中基本和经常使用的StatelessWidget:

Text: 用来创建文本。

Row和Column: 表示的是纵向扩展和横向扩展的行和列。Row和Column是基于web的flexbox布局。

还有一个基于web的绝对定位的布局叫做Positioned,Positioned通常是和Stack一起使用的。

Stack就是一个栈的结构，在Stack中你可以将一个widget放在另外一个widget的上面。

Positioned用在Stack中，可以相对于top, right, bottom或者left边界进行相对定位，非常好用。

另外一个常用的组件就是Container，它表示的是一个长方形的元素,Container可以用BoxDecoration来修饰,用来表示背景、边框和阴影等。

Container还可以包含margins,padding和尺寸限制等特性。

接下来我们来通过一个具体的例子来说明StatelessWidget到底是怎么使用的。

假如我们想构建一个下面样式的界面，该怎么做呢？

![](https://img-blog.csdnimg.cn/ca25af386869417db0514f0ed5faaead.png)

这个界面可以分为两部分，上面的一般称之为appBar，下面的一般叫做content。

appBar按列的布局又可以分为三部分，第一部分是一个IconButton表示导航菜单,第二部分是一个Text表示页面标题，第三部分也是一个IconButton表示搜索按钮。 这三部分按照Row来进行组合.

那么按照Flutter的widget的构建原则，我们可以把appBar构建成一个Widget。因为这个Widget的行为只跟初始化状态有关，所以可以将其设置成为StatelessWidget:

```
class MyAppBar extends StatelessWidget {
  const MyAppBar({required this.title, Key? key}) : super(key: key);

  final Widget title;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56.0, // bar的高度
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      decoration: BoxDecoration(color: Colors.blue[500]),
      // 按Row来进行布局
      child: Row(
        children: [
          const IconButton(
            icon: Icon(Icons.menu),
            tooltip: '导航菜单',
            onPressed: null, // 目前不可点击
          ),
          // Expanded组件，用于填充所有可用的空间
          Expanded(
            child: title,
          ),
          const IconButton(
            icon: Icon(Icons.search),
            tooltip: '搜索',
            onPressed: null,
          ),
        ],
      ),
    );
  }
}
```

上面的代码中，我们把Row包含在一个Container中，然后将这个Container返回作为appBar的实际内容。

UI下面的部分比较简单， 就是一个居中的Text。我们将其合和appBar合并起来，放在一个Column中，按行进行分割：

```
class MyScaffold extends StatelessWidget {
  const MyScaffold({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      // 构建一个两行的column，一个是bar， 一个是具体的内容
      child: Column(
        children: [
          MyAppBar(
            title: Text(
              'StatelessWidget',
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .primaryTextTheme
                  .headline6,
            ),
          ),
          const Expanded(
            child: Center(
              child: Text('这是一个Text组件!'),
            ),
          ),
        ],
      ),
    );
  }
}
```

它也是一个StatelessWidget，在build方法中返回了Material这个widget。

然后，我们将MyScaffold包装在一个MaterialApp中，作为最后返回的MyApp:

```
class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // 这是应用程序的根widget
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '第一个StatelessWidget',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      home: const SafeArea(
        child: MyScaffold(),
      ),
    );
  }
}
```

最后在runApp方法中运行MyApp即可：

```
void main() {
  runApp(const MyApp());
}
```

# StatefulWidget详解

上面我们讲解了一个如何使用StatelessWidget来构造一个app的方法。大家应该对基本的流程有所熟悉。

这里要注意的是，StatelessWidget并不是说widget中不能存储任何变量，如上面的例子所示，MyAppBar这个StatelessWidget其实是包含一个title的Widget,但是这个widget是final的，也就是说定义过一次之后就不能够再变化，所以叫做StatelessWidget。

StatefulWidget和StatelessWidget不同的地方在于，StatefulWidget可以和一个State进行关联。State中可以包含一些可变的属性，这些属性可以跟用户的操作进行交互，从而完成一些比较复杂的功能。

假如我们需要下面的一个界面，界面右下方有一个按钮，点击一次，可以将中间的数字加一。

![](https://img-blog.csdnimg.cn/227f3faf0b1d4147a9a44b55a0a59fd8.png)

这是一个很明显的和用户交互的行为。这里我们就可以用到StatefulWidget。

这里我们创建一个MyHomePage的StatefulWidget，并创建一个_MyHomePageState的state和其进行关联：

```
class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}
```

注意，可变属性是存在和StatefulWidget关联的state中的，而不是StatefulWidget本身。

所以我们需要在_MyHomePageState中定义一个int的_counter变量，用来存储用户点击次数。然后定义一个_incrementCounter用来对_counter进行累加。

在_incrementCounter需要调用setState方法用来对State的状态进行刷新。

```
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }
```

然后在State中的build方法中就可以返回对应UI的Widget了。这里我们使用Scaffold组件，这个组件自带了appBar和body:

```
Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              '按钮被点了:',
            ),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
            const Text(
              '次',
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
```

这里body中我们选择使用Center组件用来展示内容信息。而浮动的按钮则使用FloatingActionButton，它的onPressed方法会触发我们前面写的_incrementCounter方法，用来将_counter加一。

最后将我们构建的组件传入MaterialApp中，如下所示：

```
class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // 根Widget
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '第一个StatefulWidget',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      home: const MyHomePage(title: 'StatefulWidget'),
    );
  }
}
```

# 总结

以上，我们简单的讲解了StatelessWidget和StatefulWidget的简单使用情况。后续我们将会这些组件进行深入，敬请期待。

本文的代码可以参考：[https://github.com/ddean2009/learn-flutter](https://github.com/ddean2009/learn-flutter),觉得好的话，请点个赞，谢谢。

























