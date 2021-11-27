dart系列之:数学什么的就是小意思,看我dart如何玩转它

[toc]

# 简介

dart也可以进行数学运算，dart为数学爱好者专门创建了一个dart:math包来处理数学方面的各种操作。dart:math包提供了正弦，余弦，最大值，最小值和随机数等操作。

一起来看看dart:math包都能做什么吧。

# dart:math包的构成

如果你去查看dart:math的源代码，你会发现，dart:math包其实很简单，它里面只有4个文件。分别是：

math.dart,random.dart,point.dart和rectangle.dart。

后面两个文件，主要跟二维坐标有关，这里不详细说明。

我们常用到的就是前面两个文件，math和random。

# math

math中定义了我们在数学运算中常用到的一些常量，如：

```
const double e = 2.718281828459045;

const double ln10 = 2.302585092994046;

const double ln2 = 0.6931471805599453;

const double log2e = 1.4426950408889634;

const double log10e = 0.4342944819032518;

const double pi = 3.1415926535897932;

const double sqrt1_2 = 0.7071067811865476;

const double sqrt2 = 1.4142135623730951;
```

计算最大值和最小值：

```
assert(max(18, 20) == 20);
assert(min(18, 20) == 18);
```

使用三角函数：

```
assert(cos(pi) == -1.0);

var degrees = 30;
var radians = degrees * (pi / 180);

var sinOf30degrees = sin(radians);

assert((sinOf30degrees - 0.5).abs() < 0.01);
```

# Random

dart中的random包提供了一些比较有用的生成随机数的方法，先看下Random类的定义：

```
abstract class Random {
 
  external factory Random([int? seed]);

  external factory Random.secure();

  int nextInt(int max);

  double nextDouble();

  bool nextBool();
}
```

我们可以使用Random中提供的nextInt，nextDouble和nextBool来生成对应的随机数：

```
var random = Random();
random.nextDouble(); 
random.nextInt(10); 
random.nextBool(); 
```

默认情况下，Random生成的是伪随机数，要想生成更加安全的随机数，比如密码学意义上的随机数，Random还有一个更加安全的实现Random.secure()。

# 总结

以上就是dart中math库的介绍。










