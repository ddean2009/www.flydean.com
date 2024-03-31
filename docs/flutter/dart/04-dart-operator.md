---
slug: /04-dart-operator
---

# 4. dart语言中的特殊操作符



# 简介

有运算就有操作符，dart中除了普通的算术运算的操作符之外，还有自定义的非常特殊的操作符，今天带大家一起来探索一下dart中的特殊操作符。

# 普通操作符

普通操作符就很好解释了，就是加减乘除，逻辑运算符，比较运算符和位运算符等。

这些操作符和其他语言的操作符没什么差别，这里就不详细介绍了。大家看几个普通操作符的例子：

```
a++
a + b
a = b
a == b
c ? a : b
assert(2 == 2);
assert(2 != 3);
assert(3 > 2);
assert(2 < 3);
```

# 类型测试操作符

dart中的类型测试符类似JAVA中的instance of操作，主要有三个，分别是as,is和is!

其中is是类型判断操作符，而as是类型转换操作符，也就是常说的强制转换。

对下面的语句来说，如果obj是T的子类或者实现了T的接口，那么就会返回true。

```
obj is T 
```

而下面的语句则会始终返回true：

```
obj is Object?
```

dart中的as操作符表示的是类型转换，转换类型之后就可以使用对应类型中的方法了。如下所示：

```
(student as Student).firstName = 'Bob';
```

那么问题来了，上面的写法和下面的写法有什么区别吗?

```
if (student is Person) {
  // Type check
  student.firstName = 'Bob';
}
```

第一种写法中，如果student是空，或者不是Student的实例，则会报错,而第二种并不会。

# 条件运算符

dart中也支持条件运算符，最常见的就是三元运算符：

```
condition ? expr1 : expr2
```

表示如果condition是true，则返回expr1， 否则返回expr2。

我们在日常的工作中，经常会有一些判空操作，dart为我们提供了非常简便的判空操作符：

```
expr1 ?? expr2
```

上式表示如果expr1为空，则选择expr2。举个例子：

```
String playerName(String? name) => name ?? 'Guest';
```

# 级联符号

级联符号是 .. 或者?.. , 用来在同一对象上进行序列操作，级联操作可以让我们少写很多代码，可以在创建一个对象的同时，给对象赋值：

```
var paint = Paint()
  ..color = Colors.black
  ..strokeCap = StrokeCap.round
  ..strokeWidth = 5.0;
```

上面的代码等同于：

```
var paint = Paint();
paint.color = Colors.black;
paint.strokeCap = StrokeCap.round;
paint.strokeWidth = 5.0;
```

如果对象可能为空，则可以在第一个级联操作符之前加上?,这样如果对象为空的话，后续的级联操作都不会进行，如下所示：

```
var paint = Paint()
  ?..color = Colors.bla
  ..strokeCap = Stroke
  ..strokeWidth = 5.0;
```

# 类中的自定义操作符

在dart中可以实现类似C++那种操作符的重写功能。可以实现对象之间的加减乘除之类的运算。

比如下面的类中，我们自定义了类之间的加法和减法运算：

```
class Vector {
  final int x, y;

  Vector(this.x, this.y);

  Vector operator +(Vector v) => Vector(x + v.x, y + v.y);
  Vector operator -(Vector v) => Vector(x - v.x, y - v.y);

  // Operator == and hashCode not shown.
  // ···
}

void main() {
  final v = Vector(2, 3);
  final w = Vector(2, 2);

  assert(v + w == Vector(4, 5));
  assert(v - w == Vector(0, 1));
}
```

自定义操作符是用operator关键字来修饰的，非常的方便。

# 总结

以上就是dart中的操作符的介绍和使用。






