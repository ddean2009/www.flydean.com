dart系列之:创建Library package

[toc]

# 简介

在dart系统中，有pubspec.yaml文件的应用就可以被成为一个package。而Libray package是一类特殊的package，这种包可以被其他的项目所依赖. 也就是通常所说的库。

如果你也想你写的dart程序可以上传到pub.dev上，或者提供给别人使用，则来看看这篇文章吧。

# Library package的结构

先看下library package的结构:

```
app3
├── lib
│   └── main.dart
└── pubspce.yaml
```

这是一个最简单的Library package的结构，在root目录下面，我们有一个pubspce.yaml文件。然后还有一个lib目录存放的是library的代码。

一般来说lib下面的库是可以供外部进行引用的。如果是library内部的文件，则可以放到lib/src目录下面，这里面的文件表示是private的,是不应该被别的程序引入的。

如果想要将src中的包导出供外部使用，则可以在lib下面的dart文件中使用export，将需要用到的lib导出。这样其他用户只需要import这个一个文件即可。

export的例子如下：

```
library animation;

export 'src/animation/animation.dart';
export 'src/animation/animation_controller.dart';
export 'src/animation/animations.dart';
export 'src/animation/curves.dart';
export 'src/animation/listener_helpers.dart';
export 'src/animation/tween.dart';
export 'src/animation/tween_sequence.dart';
```

上面的代码是flutter的animation库。

# 导入library

怎么使用呢？我们可以使用import语句来导入对应的lib：

```
import 'package:flutter/animation.dart';
```

如果是内部文件的导入，则可以使用相对路径。只有在导入外部package的时候才需要加上package：前缀。

# 条件导入和导出library

因为dart是设计在可以在不同的平台上进行工作，所以一个library在不同的平台可能需要导入或者导出不同的library文件， 这就叫做条件导入和导出。

比如可以通过判断dart库是io库还是html库来选择导出不同的文件：

```
export 'src/hw_none.dart' // Stub implementation
    if (dart.library.io) 'src/hw_io.dart' // dart:io implementation
    if (dart.library.html) 'src/hw_html.dart'; // dart:html implementation
```

上面的意思是，如果在app中能够使用dart:io，那么就导出src/hw_io.dart.

如果能够使用dart:html,那么就导出src/hw_html.dart，否则就导出src/hw_none.dart。

如果是条件导入的话，将export改成import即可。

# 添加其他有效的文件

因为不同的library有不同的作用，所以通常需要添加一些额外的文件来保证library的有效性和完整性。

为了保证library的有效性，需要添加测试代码，测试代码通常放在test目录中。

如果是创建命令行工具，则需要将对应的工具放到tools目录中。

另外还有 README.md 和 CHANGELOG.md等文件。

# library的文档

dart文档可以使用 dartdoc这个工具来生成。dart中的文档格式是以///开头的，如下：

```
/// The event handler responsible for updating the badge in the UI.
void updateBadge() {
  ...
}
```

# 发布到pub.dev

一个最好共享library的方式就是将其发送到pub.dev上。具体的命令是：pub publish。

# 总结

以上就是dart中创建library的全部内容。












