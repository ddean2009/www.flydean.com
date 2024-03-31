---
slug: /14-dart-number-string
---

# 14. 在dart中使用数字和字符串



# 简介

 要想熟悉一种语言，最简单的做法就是熟悉dart提供的各种核心库。dart为我们提供了包括dart:core,dart:async,dart:math,dart:convert,dart:html和dart:io这几种常用的库。

 今天给大家介绍一下dart:core中的数字和字符串的使用。

 # 数字

dart:core中定义了三种类型的数字，分别是num,int和double。

num是所有数字的总称。int和double都是继承自num，是num的子类。

事实上，dart:core中还有以一种数据类型叫做BigInt,BigInt是一种独立的数据类型，并不是num的子类：

```
abstract class BigInt implements Comparable<BigInt>
```

数字中最常见的操作就是将字符串转换为数字,转换可以调用parse方法,先看下num中parse方法的定义：

```
  static num parse(String input, [@deprecated num onError(String input)?]) {
    num? result = tryParse(input);
    if (result != null) return result;
    if (onError == null) throw FormatException(input);
    return onError(input);
  }
```

传入的input可以是十进制、也可以是十六进制，如下所示：

```
assert(int.parse('18') == 18);
assert(int.parse('0x05') == 5);
assert(double.parse('0.50') == 0.5);
```

num.parse会将对应的字符转换成为int或者double类型:

```
assert(num.parse('18') is int);
assert(num.parse('0.50') is double);
```

parse方法还可以传入字符串对应的基数，比如是十进制还是十六进制：

```
assert(int.parse('11', radix: 16) == 17);
```

上面我们讲到了如何将字符串转换成为数字，下面是如何将数字转换成为字符串，num提供了toString()方法，可以方便的将int和double转换成为string。

```
assert(18.toString() == '18');

assert(3.1415.toString() == '3.1415');
```

对于小数来说，可以使用toStringAsFixed来指定小数的位数：

```
assert(3.1415.toStringAsFixed(2) == '3.14');
```

如果要使用科学记数法的话，可以使用toStringAsPrecision:

```
assert(314.15.toStringAsPrecision(2) == '3.1e+2');
```

# 字符串

所有的字符串在dart中都是以UTF-16进行编码的，dart中的string定义了很多常用的并且非常有用的方法。

比如在字符串中进行查询：

```
assert('www.flydean.com'.contains('flydean'));

assert('www.flydean.com'.startsWith('www'));

assert('www.flydean.com'.endsWith('com'));

assert('www.flydean.com'.indexOf('flydean') == 4);
```

从字符串中截取子串：

```
assert('www.flydean.com'.substring(4, 11) == 'flydean');
```

将字符串按照特定字符进行截取：

```
var parts = 'www.flydean.com'.split('.');
assert(parts.length == 3);
```

那么dart中对应中文的支持是这么样的呢? 因为dart中所有的字符都是以UTF-16来表示的，如果一个UTF-16单元能够表示对应的字符，则中文使用起来也是没有问题的：

```
  assert('你好吗？'.substring(1,2) == '好');
  assert('你好吗？'[1] == '好');
```

但是有些字符使用一个UTF-16单元是表示不了的，这时候就需要用到 characters 包对特定的字符进行处理。

字符串转换为大写或者小写：

```
assert('www.flydean.com'.toUpperCase() ==
    'WWW.FLYDEAN.COM');

// Convert to lowercase.
assert('WWW.FLYDEAN.COM'.toLowerCase() ==
    'www.flydean.com');
```

dart提供了 trim()方法，可以对字符串前后端的空格进行截取：

```
assert('  www.flydean.com  '.trim() == 'www.flydean.com');
```

# StringBuffer

除了显示的字符串来创建字符以外，dart还提供了StringBuffer类,通过StringBuffer类我们可以自由创建字符串：

```
var sb = StringBuffer();
sb
  ..write('www.flydean.com ')
  ..writeAll(['is', 'very', 'good'], ' ')
  ..write('.');

var fullString = sb.toString();
```

上面代码输出："www.flydean.com is very good."

其中writeAll() 将传入的字符数组以特定的连接符进行连接。

# 总结

以上就是dart中数字和字符串的介绍。





 





