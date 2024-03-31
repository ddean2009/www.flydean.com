---
slug: /02-dart-buildin-type
---

# 2. dart语言中的内置类型

# 简介

和所有的编程语言一样，dart有他内置的语言类型，这些内置类型都继承自Object，当然这些内置类型是dart语言的基础，只有掌握了这些内置类型才能够在使用dart语言的时候得心应手。

今天就给大家讲解一下dart语言的内置类型。

# Null

在dart中用null来表示空。那么null和Null有什么关系呢？

Null是一个类,先看下Null的定义：

```
class Null {
  factory Null._uninstantiable() {
    throw UnsupportedError('class Null cannot be instantiated');
  }

  external int get hashCode;

  /** Returns the string `"null"`. */
  String toString() => "null";
}
```

可以看到Null类型的string表示就是null。而相应的null是一个关键字，其对应的就是Null类。

# 数字

dart中的数字对应的类是num,他有两个子类，分别是int和double。

int表示不大于64 bits的整数。因为dart可以运行在不同的平台中，所以不同平台表示的范围也是不同的。

在原生平台，比如android或者IOS平台，int的范围可以达到 -2^63 到 2^63 - 1。 但是在web环境中，可表示的范围是-2^53 到 2^53 - 1.

double相应的表示的是浮点类型。

对于数字来说，基本的运算操作符像是 +, -, / 和 *都是定义在num类中。当然还有其他一些常规的操作符。

如果需要更加复杂的运算，则可以使用dart:math库。

下面是几个数字使用的例子：

```
int age =18;
int number= 20;
double money = 10.1;
```

# 字符串

字符串是经常会使用的一种类型。dart中字符串对应的类是String。也可以直接用字面量表示如下：

```
var name ='jack';
var site ="www.flydean.com";
```

字符串可以用单引号也可以用双引号来表示。dart中字符串使用的是UTF-16编码。

dart中的字符串中，还可以带上变量值,他的格式是 ${expression}. 

```
var age=10;
var words ='your age is ${age}!';
```

两个字符串可以用==来比较是否相等，字符比较的是对应的字符编码序列，如果字符编码序列相等，那么对应的字符串就相等。

字符串的连接可以使用+。

```
var hello ="hello " + "word";
```

还有一种创建字符串的方法是使用三个单引号或者三个双引号。

```
var string1= '''
this is a string!
''';

var string2 = """
this is string again!
""";
```

默认情况下string中的字符表示就是字符本身，如果要转换成其原始含义的话，则可以在字符串前面加上r：

```
var string3 =r'this is line one \n this is line two';
```

# 布尔值

布尔值在dart中用bool来表示。bool值只有两个字符串表示，分别是true和false。

因为dart是类型安全的，也就是说在需要使用bool类型的时候，不能用其他类型代替。

比如我们要判断字符串是否为空，可以这样判断：

```
var name='';
if(name.isEmpty){
    do something
}
```

# 列表

dart中的列表用List来表示，当然也可以直接使用下面的字面量表示：

```
var list = [1, 2, 3];
```

列表的index从0开始，以length-1结束。

从dart 2.3开始，引入了扩展符...和可为空的扩展符...? ,扩展符可以用将一个已知的list展开成其对应的元素,从而可以方便的构建list的组合：

```
var list = [1, 2, 3];
var list2 = [0, ...list];
```

dart中提供一个很神奇的功能，就是可以在构建list的过程中使用if和for语句，来动态生成list中的元素：

```
var nav = [
  'Home',
  'Furniture',
  'Plants',
  if (promoActive) 'Outlet'
];
```

或者：

```
var listOfInts = [1, 2, 3];
var listOfStrings = [
  '#0',
  for (var i in listOfInts) '#$i'
];
```

# set和map

dart中的集合用Set来表示。

set表示的是不重复的元素的集合，如下所示：

```
var names = {'jack', 'mark', 'max'};
```

dart中的映射用Map来表示。

Map的创建和set很类似，但是包含了key和value：

```
var students = {'jack':18, 'mark':19, 'max':20};
```

大家可以发现，set和map是很类似的，那么问题来了， 怎么表示一个空的set或者map呢？

因为set中的元素是单个的，而map中的元素是键值对，所以我们可以这样的表示：

```
var names = <String>{};
var gifts = Map<String, String>();
```

但是如果不指定类型，那么默认创建的就是一个map：

```
var map = {};
```

要获取map中的值，可以这样使用：

```
var gifts = Map<String, String>();
gifts['first'] = 'partridge';
gifts['second'] = 'turtledoves';
```

map和set都支持扩展符...和可为空扩展符...? , 同样也支持集合内的if和for操作。












