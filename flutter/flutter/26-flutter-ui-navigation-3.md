flutter系列之:创建一个内嵌的navigation

[toc]

# 简介

我们在flutter中可以使用Navigator.push或者Navigator.pushNamed方法来向Navigator中添加不同的页面，从而达到页面调整的目的。

一般情况下这样已经足够了，但是有时候我们有多个Navigator的情况下，上面的使用方式就不够用了。比如我们有一个主页面app的Navigator，然后里面有一个匹配好友的功能，这个功能有多个页面，因为匹配好友功能的多个页面实际上是一个完整的流程，所以这些页面需要被放在一个子Navigator中，并和主Navigator区分开。

那么应该如何处理呢？

# 搭建主Navigator

主Navigator是我们app的一些主要界面，这里我们有三个界面，分别是主home界面，一个setting配置界面和好友匹配界面。

其中好友匹配界面包含了三个子界面，这三个子界面将会用到子路由。

先来看下主路由，主路由的情况跟普通的路由没啥区别，这里我们首先定义和home和setting匹配的两个widget：HomePage和SettingsPage:

```
class HomePage extends StatelessWidget {
  const HomePage({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              SizedBox(
                width: 250,
                height: 250,
                child: Center(
                  child: Icon(
                    Icons.home,
                    size: 175,
                    color: Colors.blue,
                  ),
                ),
              ),
              SizedBox(height: 32),
              Text(
                '跳转到好友匹配页面',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).pushNamed(routeFriendMatch);
        },
        child: const Icon(Icons.add),
      ),
    );
  }
```

HomePage很简单，它包含了一个floatingActionButton，当点击它的时候会调用 Navigator.pushNamed方法进行路由切换。

然后是SettingsPage,它是一个简单的Column：

```
class SettingsPage extends StatelessWidget {
  const SettingsPage({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(8, (index) {
            return  ListTile(
              title: Text('设置项$index'),
            );
          }),
        ),
      ),
    );
  }
```

最后一个页面是FriendMatchFlow,这个页面比较复杂，我们在下一个再进行讲解。

然后我们为主路由在onGenerateRoute方法中进行定义：

```
void main() {
  runApp(
    MaterialApp(
      onGenerateRoute: (settings) {
        late Widget page;
        if (settings.name == routeHome) {
          page = const HomePage();
        } else if (settings.name == routeSettings) {
          page = const SettingsPage();
        } else if (settings.name == routeFriendMatch) {
          page = const FriendMatchFlow(
            setupPageRoute: routeFriendMatchPage,
          );
        }

        return MaterialPageRoute<dynamic>(
          builder: (context) {
            return page;
          },
          settings: settings,
        );
      },
      debugShowCheckedModeBanner: false,
    ),
  );
}
```

主路由很简单，跟普通的路由没有太多的区别。

# 构建子路由

接下来是构建子路由的步骤。在主路由中，如果路由的名称是routeFriendMatch，那么就会跳转到FriendMatchFlow。

而这个flow页面实际上是由几个子页面组成的：选择好友页面，等待页面，匹配页面和匹配完毕页面。

具体的页面代码这里就不写了，我们主要来讲一下子路由的使用。

对于FriendMatchFlow来说，它本身是一个Navigator,所以我们的build方法是这样的：

```
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _isExitDesired,
      child: Scaffold(
        appBar: _buildFlowAppBar(),
        body: Navigator(
          key: _navigatorKey,
          initialRoute: widget.setupPageRoute,
          onGenerateRoute: _onGenerateRoute,
        ),
      ),
    );
  }
```

因为他需要根据用户的不同点击来进行内部路由的切换，所以需要保存对当前子Navigator的应用，所以这里FriendMatchFlow是一个StatefulWidget,并且上面的_navigatorKey是一个GlobalKey对象，以提供对子Navigator的引用：

```
  final _navigatorKey = GlobalKey<NavigatorState>();
```

这里的_onGenerateRoute方法，跟主路由也是很类似的，主要定义的是子路由中页面的跳转：

```
  Route _onGenerateRoute(RouteSettings settings) {
    late Widget page;
    switch (settings.name) {
      case routeFriendMatchPage:
        page = WaitingPage(
          message: '匹配附近的好友...',
          onWaitComplete: _onDiscoveryComplete,
        );
        break;
      case routeFriendSelectPage:
        page = SelectFriendPage(
          onFriendSelected: _onFriendSelected,
        );
        break;
      case routeFriendConnectingPage:
        page = WaitingPage(
          message: '匹配中...',
          onWaitComplete: _onConnectionEstablished,
        );
        break;
      case routeFriendFinishedPage:
        page = FinishedPage(
          onFinishPressed: _exitSetup,
        );
        break;
    }
```

这里的on***Selected是VoidCallback回调，用来进行路由的切换：

```
  void _onDiscoveryComplete() {
    _navigatorKey.currentState!.pushNamed(routeFriendSelectPage);
  }

  void _onFriendSelected(String deviceId) {
    _navigatorKey.currentState!.pushNamed(routeFriendConnectingPage);
  }

  void _onConnectionEstablished() {
    _navigatorKey.currentState!.pushNamed(routeFriendFinishedPage);
  }
```

可以看到上面的路由切换实际上是在子路由上切换，跟父路由无关。

如果想要直接从子路由跳出到父路由该怎么处理呢？很简单，调用Navigator.of的pop方法即可：

```
  void _exitSetup() {
    Navigator.of(context).pop();
  }
```

这里的context默认是全局的context,所以会导致主路由的跳转变化。

# 总结

以上的代码运行结果如下：

![](https://img-blog.csdnimg.cn/b74575a3d26948758ab0c92e55ee2d77.png)

虽然上面的例子看起来复杂，但是大家只要记住了不同的路由使用不同的Navigator范围进行跳转就行了。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)












