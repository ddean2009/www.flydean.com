dart系列之:你的地盘你做主,使用Extension对类进行扩展

[toc]

# 简介

一般情况要扩展一个类，需要继承这个类，这是在大多数java或者其他面向对象语言中要做的事情。

但是有些时候扩展类并不是特别好用，首先在有些语言中，有些类是禁止被扩展的。即使可以被扩展，但是扩展之后的类是一个新的类，而不是原来的父类，所以在使用的过程中可能会出现一些类型转换的问题。

那么在dart中是怎么解决这个问题的呢？

# dart中extension的使用

dart在2.7之后，引入了extension，用来对类的方法进行扩展。

到底怎么扩展呢？我们举个例子.

我们可以将字符串转换为int，通过调用int的parse方法，如下所示：

```
int.parse('18')
```

但是通过int类来进行转换通常不太直观，我们希望能够在String类中提供一个toInt的方法，可以直接调用，将字符串转换成为int。

```
'18'.toInt()
```

但是很遗憾，String并没有提供toInt的方法，所以我们可以通过extension来对String进行扩展：

```
extension StringToNumber on String {
  int toInt() {
    return int.parse(this);
  }
  // ···
}
```

如果这个文件的名字叫做string_to_number.dart，那么我们可以这样使用：

```
import 'string_to_number.dart';
// ···
print('18'.parseInt()); 
```

dart中方法扩展最为方便的是，你只要引入对应的lib，使用的时候甚至都不知道在使用lib的扩展。

当然，并不是所有的类都可以使用extention进行扩展。比如dynamic类型就不能进行扩展。

但是使用var类型，只要该类型可以被推断出来，那么就可以使用extention扩展。

# API冲突

既然可以对lib进行扩展，那么就有可能出现API冲突的情况。那么怎么解决API冲突呢?

比如我们需要使用两个lib扩展文件，extention1.dart和extention2.dart.但是两个扩展文件中都定义了parseInt方法对String进行扩展。

如果同时引用的话，就会出现问题。

这时候可以使用show或者hide来限制具体使用哪一个扩展文件的中的方法。

```
import 'extention1.dart';

import 'extention2.dart' hide StringToNumber2;

print('18'.parseInt());
```

还有一种情况就是显示调用extension，如下所示：

```
import 'extention1.dart';

import 'extention2.dart';

print(StringToNumber('18').parseInt());
print(StringToNumber2('18').parseInt());
```

通过extention的名字来进行区分。

如果两个extention的名字也相同的话，那么可以通过prefix来进行区分：

```
import 'extention1.dart';

import 'extention2.dart' as ext2;

print(StringToNumber('18').parseInt());
print(ext2.StringToNumber('18').parseInt());
```

# extention的实现

实现扩展很简单，实现语法如下：

```
extension <extension name> on <type> {
  (<member definition>)*
}
```

下面是一个扩展String的例子：

```
extension NumberParsing on String {
  int parseInt() {
    return int.parse(this);
  }

  double parseDouble() {
    return double.parse(this);
  }
}

```

extension还可以扩展泛型参数：

```
extension MyFancyList<T> on List<T> {
  int get doubleLength => length * 2;
  List<T> operator -() => reversed.toList();
  List<List<T>> split(int at) => [sublist(0, at), sublist(at)];
}
```

上面的实现是对List<T> 进行扩展，添加了getter,操作符和split方法。

# 总结

以上就是2.7的新特性，类的扩展。
















