dart系列之:时间你慢点走,我要在dart中抓住你

[toc]

# 简介

时间和日期是我们经常会在程序中使用到的对象。但是对时间和日期的处理因为有不同时区的原因，所以一直以来都不是很好用。就像在java中，为时间和日期修改和新增了多次API，那么作为新生的语言dart而言，会有什么不一样的地方吗？

dart中关于日期和时间的两个非常重要的类是DateTime和Duration.

其中DateTime表示的是时间，而Duration表示的是时间差。

# DateTime

先看一下DateTime的使用。

DateTime表示的是一个时间点。因为世界时钟有UTC和本地时间两种。所以，在使用DataTime的时候，也可以使用这两种时钟。

最简单的就是获取当前的时间：

```
var now = DateTime.now();
```

如果要创建指定日期的时间，则可以将年月日传入DateTime的构造函数：

```
var now = DateTime(2021, 11, 20); 
```

注意，上面创建的日期是本地日期。

如果要创建UTC time，则可以使用DateTime.utc方法：

```
var utc = DateTime.utc(2021, 11, 20);
```

还有一种表示时间的方法是unix time， Unix time指的是从1970年1月1日开始所经过的秒数.

DateTime有两种表示Unix time时间的方法，分别是：

```
  DateTime.fromMicrosecondsSinceEpoch(10000);
  DateTime.fromMillisecondsSinceEpoch(10000);
```

他们的区别在于，一个表示的是微秒，一个表示的是毫秒。

DateTime还可以将字符串转换成为DateTime对象：

```
var time= DateTime.parse('2002-02-27T14:00:00-0500');
```

事实上，DateTime.parse可以接受多种字符类型，如下所示：

```
 `"2012-02-27"`
`"2012-02-27 13:27:00"`
 `"2012-02-27 13:27:00.123456789z"`
`"2012-02-27 13:27:00,123456789z"`
`"20120227 13:27:00"`
`"20120227T132700"`
`"20120227"`
`"+20120227"`
 `"2012-02-27T14Z"`
`"2012-02-27T14+00:00"`
```

# Duration

Duration表示的是两个时间之间的差值。

来看下Duration的构造函数：

```
  const Duration(
      {int days = 0,
      int hours = 0,
      int minutes = 0,
      int seconds = 0,
      int milliseconds = 0,
      int microseconds = 0})
      : this._microseconds(microsecondsPerDay * days +
            microsecondsPerHour * hours +
            microsecondsPerMinute * minutes +
            microsecondsPerSecond * seconds +
            microsecondsPerMillisecond * milliseconds +
            microseconds);
```

可以看到Duration可以表示从天到microseconds的间隔，已经足够用了. 应该怎么使用呢？

```
var time = DateTime.now();

// 添加一年
var nextYear = time.add(const Duration(days: 365));
assert(nextYear.year == 2022);
```

同样的，我们可以对还可以减去Duration:

```
var time = DateTime.now();

//减少一年
var lastYear = time.subtract(const Duration(days: 365));
assert(lastYear.year == 2020);
```

当然还可以计算两个日期的差值：

```
var duration = nextYear.difference(time);
assert(duration.inDays == 365);
```

# 总结

以上就是dart中对时间和日期的支持。



