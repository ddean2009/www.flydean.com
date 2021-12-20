dart系列之:这里不需要特例,dart代码最佳实践

[toc]

# 简介

每种语言都有自己的代码风格，这种代码风格是跟语言特性息息相关的。如果在编码的过程中遵循这种统一的编码规则，会给我们的业务带来非常多的便利。

同样的，对应dart而已，也有属于自己的编码风格，一起来看看吧。

# 命名规则

一般来说，这个世界上有三种命名规则，分别是UpperCamelCase,lowerCamelCase和lowercase_with_underscores.

UpperCamelCase表示的是驼峰格式，也就是首字母大写，其他的字母小写。

而lowerCamelCase也是驼峰格式，不同的是它的第一个单词的首字母是小写的。

lowercase_with_underscores则是将单词用下划线进行连接。

对于类,typedef,枚举这些类型，一般都使用的是UpperCamelCase模式：

```
class ClassRoom {}

typedef Predicate<T> = bool Function(T value);
```

对于类的实例来说，使用lowerCamelCase：

```
const classRoom = ClassRoom();
```

对于方法名来说，也使用lowerCamelCase：

```
void main() {
}
```

之前我们讲到了dart 2.7引入的extension,extension也需要使用UpperCamelCase：

```
extension StringCompare on String { ... }
```

对于libraries, packages, 目录和源文件来说，使用lowercase_with_underscores,如下所示：

```
library common_convert.string_convert;

import 'lib_one.dart';
import 'lib_two.dart';
```

如果要将import的lib进行重命名，则需要使用lowercase_with_underscores，如下所示：

```
import 'lib_one.dart' as lib_one;
```

对于某些回调函数中的参数，如果并没有使用到的话，则可以用_来代替：

```
futureOfVoid.then((_) {
  print('Operation complete.');
});
```

如果是private属性，则推荐在名字前面加上_，表示它是一个私有值。

# import中的顺序

在dart中，我们需要使用到其他的package，一般来说我们在编码过程中并不会特别注意到import的顺序。

不过dart对于import的顺序也是有推荐的。

首先 “dart:”，需要放在所有其他的import之前：

```
import 'dart:html';

import 'package:bar/bar.dart';
```

而"package:" 需要放在内部项目引用之前：

```
import 'package:foo/foo.dart';

import 'util.dart';
```

如果需要导出的话，export需要和import区分开：

```
import 'src/foo_bar.dart';

export 'src/error.dart';
```

然后按照上面提到的顺序对具体的import按字母表的顺序进行排序。

# 格式化 

对于dart来说，dart语言本身是不识别空格的，但是对于人类来说，需要通过空格来格式化代码，从而达到可良好阅读的目的。

为了统一格式，dart提供了dart format命令.

虽然dart format命令为你做了99%的工作，但是还有1%的工作是你需要自己做的 。

比如：一行不超过80个字符，所有的流控制语句都用大括号括起来等等其他一些要注意的工作。

# 总结

以上就是dart中的代码风格总结。



