dart系列之:在dart中使用packages

[toc]

# 简介

java中使用jar包来封装有用的功能，然后将其分发到maven仓库中，供其他人使用。同样的在dart中也有类似的概念叫做packages。packages就是可以用来共享的软件包，可以包含libraries和tools。

你可以在pub.dev网站中查到dart中所有的共享packages的信息。 那么怎么在一个dart项目中使用这些packages呢？

# pubspec.yaml

简单点讲，一个dart的package就是包含pubspec.yaml的目录。pubspec.yaml是一个描述文件，用来表明该package的元信息，包括当前package的名字,版本号和依赖信息等。

要想使用pub.dev上的packages，只需要在pubspec.yaml引入对应的依赖即可。

我们举个例子:

```
name: app2
description: a demo app
version: 1.0.0+1

environment:
  sdk: ">=2.7.0 <3.0.0"

dependencies:
  image_picker: ^0.6.7+22
  video_player: ^0.10.12+5
```

这里我们的引入了两个依赖包，分别是image_picker和video_player。

# get packages

当我们修改了pubspec.yaml之后，其实对应的package并没有下载到本地来，还需要通过下面的命令来下载对应的packages：

```
 cd <path-to-my_app>
 dart pub get
```

 dart pub get会根据pubspec.yaml中配置的内容下载对应的包，并放置在系统缓存中。

 在Mac或者Linux系统中，这个缓存目录的地址是：~/.pub-cache,在windows中这个目录地址是：%LOCALAPPDATA%\Pub\Cache。

 > 当然，你也可以通过设置PUB_CACHE来更换这个地址。

 如果你依赖的包又依赖其他的包的话，其他依赖包也会被下载下来。

 当下载完依赖包之后，dart会在 .dart_tool/目录中创建一个 package_config.json文件，用来表示当前项目和系统缓存包的映射关系。

 # 使用packages

 万事俱备，只欠东风。现在包也有了，剩下就是使用了。

 使用libary可以用关键字import。如果是dart SDK中的包，则以dart:开头：

```
 import 'dart:html';

```

如果是第三方包，则以package: 开头：

```
import 'package:test/test.dart';
```

引入的libary还可以被重命名：

```
import 'package:lib1/lib1.dart';
import 'package:lib2/lib2.dart' as lib2;

// Uses Element from lib1.
Element element1 = Element();

// Uses Element from lib2.
lib2.Element element2 = lib2.Element();
```

还可以使用show和hide引入部分library:

```
// Import only foo.
import 'package:lib1/lib1.dart' show foo;

// Import all names EXCEPT foo.
import 'package:lib2/lib2.dart' hide foo;
```

默认情况下，引入的包是初始加载的，如果某些包特别大，或者你想要在使用的时候再进行加载，则可以使用deferred关键字进行延时加载：

```
import 'package:greetings/hello.dart' deferred as hello;
```

在使用的时候，需要显示调用loadLibrary() 方法，来加载对应的library：

```
Future<void> greet() async {
  await hello.loadLibrary();
  hello.printGreeting();
}
```

# 升级依赖

在第一次运行dart pub get 之后，dart会创建一个pubspec.lock文件，用来锁定依赖包的版本号，如果是在团队协作中，这个lock文件是特别有用的，它可以保证团队中所有成员使用的都是同一个版本的依赖包。


当你想升级对应的依赖的时候，可以使用dart pub upgrade命令，对依赖包进行升级。

dart pub upgrade会根据最新的可用包来生成最新的lock文件。

当然，你也可以指定升级某个特定的依赖包：

```
dart pub upgrade image_picker
```

要想查看最新依赖包的最新版本，可以使用：

```
dart pub outdated
```

# 总结

以上就是dart中packages的使用。



