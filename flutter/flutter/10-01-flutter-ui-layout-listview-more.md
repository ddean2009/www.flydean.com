flutter系列之:flutter中listview的高级用法

[toc]

# 简介

一般情况下，我们使用Listview的方式是构建要展示的item，然后将这些item传入ListView的构造函数即可，通常情况下这样做是够用了，但是不排除我们会有一些其他的特殊需求。

今天我们会来讲解一下ListView的一些高级用法。

# ListView的常规用法

ListView的常规用法就是直接使用ListView的构造函数来构造ListView中的各个item。

其中ListView有一个children属性，它接收一个widget的list，这个list就是ListView中要呈现的对象。

我们来构造一个拥有100个item的ListView对象：

```
class CommonListViewApp extends StatelessWidget{
  const CommonListViewApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return ListView(
      children: List<Widget>.generate(100, (i) => Text('列表 $i')),
    );
  }
}
```

上面的例子中，我们简单的使用List.generate方法生成了100个对象。

在item数目比较少的情况下是没有任何问题的，如果item数目比较多的情况下，直接将所有的item都取出来放在ListView中就不太现实了。

幸好，ListView还提供了一个ListView.builder的方法，这个方法会按需进行item的创建，所以在item数目比较多的情况下是非常好用的。

还是上面的例子，这次我们要生成10000个item对象，然后将这些对象放在ListView中去，应该如何处理呢？

因为这次我们要使用builder,所以没有必要在item生成的时候就创建好widget，我们可以将widget的创建放在ListView的builder中。

首先，我们构建一个items list，并将其传入MyApp的StatelessWidget中：

```
    MyApp(
      items: List<String>.generate(10000, (i) => '列表 $i'),
    )
```

然后就可以在MyApp的body中使用ListView.builder来构建item了：

```
body: ListView.builder(
          itemCount: items.length,
          prototypeItem: ListTile(
            title: Text(items.first),
          ),
          itemBuilder: (context, index) {
            return ListTile(
              title: Text(items[index]),
            );
          },
        )
```

ListView.builder是推荐用来创建ListView的方式，上面的完整代码如下：

```
import 'package:flutter/material.dart';

void main() {
  runApp(
    MyApp(
      items: List<String>.generate(10000, (i) => '列表 $i'),
    ),
  );
}

class MyApp extends StatelessWidget {
  final List<String> items;

  const MyApp({Key? key, required this.items}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const title = 'ListView的使用';

    return MaterialApp(
      title: title,
      home: Scaffold(
        appBar: AppBar(
          title: const Text(title),
        ),
        body: ListView.builder(
          itemCount: items.length,
          prototypeItem: ListTile(
            title: Text(items.first),
          ),
          itemBuilder: (context, index) {
            return ListTile(
              title: Text(items[index]),
            );
          },
        ),
      ),
    );
  }
}
```


# 创建不同类型的items

看到这里，可能有同学会问了，ListView中是不是只能创建一种item类型呢？答案当然是否定的。

不管是从ListView的构造函数构建还是从ListView.builder构建，我们都可以自由的创建不同类型的item。

当然最好的办法就是使用ListView.builder，根据传入的index的不同来创建不同的item。

还是上面的例子，我们可以在创建items数组的时候就根据i的不同来生成不同的item类型，也可以如下所示，在itemBuilder中根据index的不同来返回不同的item：

```
body: ListView.builder(
          itemCount: items.length,
          prototypeItem: ListTile(
            title: Text(items.first),
          ),
          itemBuilder: (context, index) {
            if(index %2 == 0) {
              return ListTile(
                title: Text(items[index]),
              );
            }else{
              return Text(items[index]);
            }
          },
        )
```

非常的方便。

创建不同item的完整代码如下：

```
import 'package:flutter/material.dart';

void main() {
  runApp(
    MyApp(
      items: List<String>.generate(10000, (i) => '列表 $i'),
    ),
  );
}

class MyApp extends StatelessWidget {
  final List<String> items;

  const MyApp({Key? key, required this.items}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    const title = 'ListView的使用';

    return MaterialApp(
      title: title,
      home: Scaffold(
        appBar: AppBar(
          title: const Text(title),
        ),
        body: ListView.builder(
          itemCount: items.length,
          prototypeItem: ListTile(
            title: Text(items.first),
          ),
          itemBuilder: (context, index) {
            if(index %2 == 0) {
              return ListTile(
                title: Text(items[index]),
              );
            }else{
              return Text(items[index]);
            }
          },
        ),
      ),
    );
  }
}
```

# 总结

ListView是我们在应用中会经常用到的一种widget，希望大家能够灵活掌握。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)
