---
slug: /28-dart-Libraries-effective
---

# 28. 手写Library,Library编写最佳实践



# 简介

Library是dart用来组织代码的一种非常有用的方式，通过定义不同的Library，可以将非常有用的dart代码进行封装，从而提供给其他的项目使用。虽然我们可以自由使用import或者export来对library进行导入和导入。但是什么样的用法才是最合适的用法呢？ 一起来看看吧。

# 使用part和part of

虽然很多程序员讨厌使用part，但是dart确实提供了part这种功能用来将一个大的lib拆分成多个小的文件。

没错，和part的中文含义一样，part就是将lib文件进行拆分用的。

part of表示当前文件是另外一个主文件的一部分。part表示主文件是由引用的文件组成的。

我们举个例子，假如现在有三个文件student_age.dart,student_name.dart和student.dart.

其中前面两个文件是后面一个文件的组成部分。

student_age.dart:

```
part of student;

int getAge(){
    return 18;
}
```

student_name.dart:

```
part of student;

String getName(){
    return "jack";
}
```

student.dart:

```
library student;

part 'some/other/student_age.dart';
part 'some/other/student_name.dart';
```

上面的代码有什么问题呢？

上面代码的问题在于对于student_age.dart来说，里面的part of只是指定了所属的library,但是我们读起来会一头雾水，因为不知道具体的library到底在什么地方。

所以应该这样写：

```
part of '../../student.dart';
```

# src中的文件

默认情况下lib目录下的src文件只是package内部使用的，不允许被外部的项目所调用。

所以我们一定不要直接引入lib包中的src文件。

# package中的lib文件

对于package来说，lib中的文件是可以被导出的文件，但是我们在引入package的时候最好不要使用绝对路径或者相对路径直接导入lib中的文件。

而是需要使用import 'package:'.

举个例子，假如我们有下面结构的library文件：

```
my_package
└─ lib
   └─ api.dart
   test
   └─ api_test.dart
```

api.dart就是我们要导出的文件。如果我们在api_test.dart中需要引用api.dart，则可以有下面两种方式：

```
import 'package:my_package/api.dart';
```

和：

```
import '../lib/api.dart';
```

其中上面一种方式是官方推荐的方式，为什么不使用下面一种方式呢？这是因为相对路径的方式只能在包内部使用。并且dart官方不建议将lib放在引用路径中，如果要引用lib内部的文件， 一定要使用package:。

当然，如果是package内部的引用，则优先使用相对路径，比如：

```
my_package
└─ lib
   ├─ src
   │  └─ stuff.dart
   │  └─ utils.dart
   └─ api.dart
   test
   │─ api_test.dart
   └─ test_utils.dart

```

那么对应lib/api.dart来说，可以这样引用：

```
import 'src/stuff.dart';
import 'src/utils.dart';
```

对于utils.dart来说，可以这样引用：

```
import '../api.dart';
import 'stuff.dart';
```

对于test/api_test.dart来说，可以这样引用：

```
import 'package:my_package/api.dart'; 

import 'test_utils.dart';
```

总之，不要在import的路径中出现lib。

# 总结

以上就是dart中Library编写最佳实践。













