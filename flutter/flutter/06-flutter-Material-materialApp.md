flutter系列之:Material主题的基础-MaterialApp

[toc]

# 简介

为了简化大家的使用，虽然flutter推荐所有的widget都有自己来进行搭建，但是在大框架上面，flutter提供了Material和Cupertino两种主题风格的Widgets集合，大家可以在这两种风格的继承上进行个性化定制和开发。

这两种风格翻译成中文就是：材料和库比蒂诺？什么鬼....我们还是使用默认的英文名来称呼它们吧。

本文我们将会深入讲解Material主题的基础-MaterialApp。

# MaterialApp初探

如果你使用最新的android Studio创建一个flutter项目的话，android Studio会自动为你创建一个基于flutter的应用程序。

我们来看下自动创建的main.dart文件：

```
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    )
  }
```

这个build方法返回的widget就是这个flutter应用程序的根Widget。可以看到，默认情况下是返回一个MaterialApp。

在上面的样例代码中，为MaterialApp设置了tile,theme和home属性。

title是MaterialApp的标题，theme是整个MaterialApp的主题，home表示的是app进入时候应该展示的主页面。

默认情况下MyHomePage会返回一个类似下面代码的Scaffold：

```
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const <Widget>[
            Text(
              'home page',
            ),
          ],
        ),
      ),
    );
```

这样我们可以得到常见的MaterialApp界面：

![](https://img-blog.csdnimg.cn/0d87aabe814d41ee96e090a97806d335.png)

# MaterialApp详解

有了上面的框架，我们就可以在home中构建自己的组件，从而开始flutter的愉快app之旅。

那么MaterialApp还有其他的什么功能吗？它的底层原理是怎么样的呢？一起来看看吧。

首先是MaterialApp的定义：

```
class MaterialApp extends StatefulWidget
```

可以看到MaterialApp是一个StatefulWidget，表示MaterialApp可能会根据用户的输入不同，重新build子组件，因为通常来说MaterialApp表示一个应用程序总体，所以它需要考虑很多复杂的交互情况，使用StatefulWidget是很合理的。


## MaterialApp中的theme

接下来我们看下MaterialApp可以配置的主题。

MaterialApp中有下面几种theme:

```
  final ThemeData? theme;

  final ThemeData? darkTheme;

  final ThemeData? highContrastTheme;

  final ThemeData? highContrastDarkTheme;

  final ThemeMode? themeMode;
```
ThemeData用来定义widget的主题样式，ThemeData包括colorScheme和textTheme两部分。

为了简单起见，flutter提供了两个简洁的Theme创建方式，分别是ThemeData.light和ThemeData.dark。 当然你也可以使用ThemeData.from从ColorScheme中创建新的主题。

那么问题来了，一个app为什么有这么多ThemeData呢？

默认情况下theme就是app将会使用的theme，但是考虑到现在流行的theme切换的情况，所以也提供了darkTheme这个选项。

如果theme和darkTheme都设置的话，那么将会根据themeMode来决定具体到底使用哪个主题。

> 注意，默认的主题是ThemeData.light()

highContrastTheme和highContrastDarkTheme的存在也是因为在某些系统中需要high contrast和dark的主题版本，这些ThemeData是可选的。

themeMode这个字段，如果取ThemeMode.system,那么默认会使用系统的主题配置，具体而言，是通过调用MediaQuery.platformBrightnessOf来查询系统到底是Brightness.light还是Brightness.dark.

虽然默认是ThemeMode.system，但是你也可以指定其为ThemeMode.light或者ThemeMode.dark.

## MaterialApp中的routes

和web页面的首页一样，在MaterialApp中，我们也需要定义一些页面跳转的路由信息。

在讲解routes之前，我们需要明白flutter中有两个和路由相关的定义，分别是routes和Navigator。

其中routes是路由的定义，它表示的是不同路径对应的widget地址，比如下面的routers的定义：

```
routes: <String, WidgetBuilder> {
       '/a': (BuildContext context) => MyPage(title: 'page A'),
       '/b': (BuildContext context) => MyPage(title: 'page B'),
       '/c': (BuildContext context) => MyPage(title: 'page C'),
     },
```

routers的类型是Map<String, WidgetBuilder>，对应的key就是路由地址，value就是路由地址对应的WidgetBuilder。

Navigator是一个Widget，用来对routers进行管理。

Navigator可以通过是用Navigator.pages、Navigator.push或者Navigator.pop来对routers进行管理。举个例子：

push:

```
 Navigator.push(context, MaterialPageRoute<void>(
   builder: (BuildContext context) {
     return Scaffold(
       appBar: AppBar(title: Text('My Page')),
       body: Center(
         child: TextButton(
           child: Text('POP'),
           onPressed: () {
             Navigator.pop(context);
           },
         ),
       ),
     );
   },
 ));
```

pop:

```
Navigator.pop(context);
```

对于MaterialApp来说，如果是`/` route,那么将会查找MaterialApp中的home属性对应的Widget,如果home对应的Widget不存在，那么会使用routers里面配置的。

如果上面的信息都没有，则说明需要创建router，则会调用onGenerateRoute方法来创建新的routers。

所以说onGenerateRoute是用来处理home和routers方法中没有定义的路由。你也可以将其看做是一种创建动态路由的方法。

最后，如果所有的route规则都不匹配的话，则会调用onUnknownRoute。

如果home,routes,onGenerateRoute,onUnknownRoute全都为空，并且builder不为空的话，那么将不会创建任何Navigator。

## MaterialApp中的locale

local是什么呢？local在国际化中表示的是一种语言，通过使用Local，你不用再程序中硬编码要展示的文本，从而做到APP的国际化支持。

dart中的local可以这样使用：

```
const Locale swissFrench = Locale('fr', 'CH');
const Locale canadianFrench = Locale('fr', 'CA');
```

在MaterialApp中,需要同时配置localizationsDelegates和supportedLocales:

```
MaterialApp(
  localizationsDelegates: [
    // ... app-specific localization delegate[s] here
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ],
  supportedLocales: [
    const Locale('en', 'US'), // English
    const Locale('he', 'IL'), // Hebrew
    // ... other locales the app supports
  ],
  // ...
)
```

supportedLocales中配置的是支持的locales，localizationsDelegates用来生成WidgetsLocalizations和MaterialLocalizations.

有关locale的具体使用，可以关注后续的文章。

# MaterialApp和WidgetsApp

MaterialApp是一个StatefulWidget,那么和它绑定的State叫做：_MaterialAppState, _MaterialAppStatez中有个build方法，返回的widget到底是什么呢？

```
    return ScrollConfiguration(
      behavior: widget.scrollBehavior ?? const MaterialScrollBehavior(),
      child: HeroControllerScope(
        controller: _heroController,
        child: result,
      ),
    );
```

可以看到，最终返回的是一个ScrollConfiguration，它的本质是返回一个包装在HeroControllerScope中的result。

什么是Hero呢？Hero在flutter中是一个组件，用来表示在路由切换的过程中，可以从老的路由fly到新的路由中。这样的一个飞行的动画，也叫做Hero动画。

而这个result其实是一个WidgetsApp。

WidgetsApp就是MaterialApp底层的Widget,它包装了应用程序通常需要的许多小部件。

WidgetsApp的一个主要功能就是将系统后退按钮绑定到弹出导航器或退出应用程序。

从实现上讲，MaterialApp 和 CupertinoApp 都使用它来实现应用程序的基本功能。

# 总结

MaterialApp作为Material风格的第一入口，希望大家能够熟练掌握它的用法。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)





