---
slug: /15-python-pandas-time
---

# 15. Pandas高级教程之:时间处理



# 简介

时间应该是在数据处理中经常会用到的一种数据类型，除了Numpy中datetime64 和 timedelta64 这两种数据类型之外，pandas 还整合了其他python库比如  `scikits.timeseries`  中的功能。

# 时间分类

pandas中有四种时间类型：

1. Date times :  日期和时间，可以带时区。和标准库中的  `datetime.datetime` 类似。
2. Time deltas： 绝对持续时间，和 标准库中的  `datetime.timedelta`  类似。
3. Time spans： 由时间点及其关联的频率定义的时间跨度。
4. Date offsets：基于日历计算的时间 和 dateutil.relativedelta.relativedelta 类似。

我们用一张表来表示：

| 类型         | 标量class    | 数组class        | pandas数据类型                           | 主要创建方法                        |
| :----------- | :----------- | :--------------- | :--------------------------------------- | :---------------------------------- |
| Date times   | `Timestamp`  | `DatetimeIndex`  | `datetime64[ns]` or `datetime64[ns, tz]` | `to_datetime` or `date_range`       |
| Time deltas  | `Timedelta`  | `TimedeltaIndex` | `timedelta64[ns]`                        | `to_timedelta` or `timedelta_range` |
| Time spans   | `Period`     | `PeriodIndex`    | `period[freq]`                           | `Period` or `period_range`          |
| Date offsets | `DateOffset` | `None`           | `None`                                   | `DateOffset`                        |

看一个使用的例子：

```
In [19]: pd.Series(range(3), index=pd.date_range("2000", freq="D", periods=3))
Out[19]: 
2000-01-01    0
2000-01-02    1
2000-01-03    2
Freq: D, dtype: int64
```

看一下上面数据类型的空值：

```
In [24]: pd.Timestamp(pd.NaT)
Out[24]: NaT

In [25]: pd.Timedelta(pd.NaT)
Out[25]: NaT

In [26]: pd.Period(pd.NaT)
Out[26]: NaT

# Equality acts as np.nan would
In [27]: pd.NaT == pd.NaT
Out[27]: False
```

# Timestamp

 Timestamp  是最基础的时间类型，我们可以这样创建：

```
In [28]: pd.Timestamp(datetime.datetime(2012, 5, 1))
Out[28]: Timestamp('2012-05-01 00:00:00')

In [29]: pd.Timestamp("2012-05-01")
Out[29]: Timestamp('2012-05-01 00:00:00')

In [30]: pd.Timestamp(2012, 5, 1)
Out[30]: Timestamp('2012-05-01 00:00:00')
```

## DatetimeIndex

 Timestamp 作为index会自动被转换为DatetimeIndex：

```
In [33]: dates = [
   ....:     pd.Timestamp("2012-05-01"),
   ....:     pd.Timestamp("2012-05-02"),
   ....:     pd.Timestamp("2012-05-03"),
   ....: ]
   ....: 

In [34]: ts = pd.Series(np.random.randn(3), dates)

In [35]: type(ts.index)
Out[35]: pandas.core.indexes.datetimes.DatetimeIndex

In [36]: ts.index
Out[36]: DatetimeIndex(['2012-05-01', '2012-05-02', '2012-05-03'], dtype='datetime64[ns]', freq=None)

In [37]: ts
Out[37]: 
2012-05-01    0.469112
2012-05-02   -0.282863
2012-05-03   -1.509059
dtype: float64
```

## date_range 和 bdate_range

还可以使用 date_range 来创建DatetimeIndex：

```
In [74]: start = datetime.datetime(2011, 1, 1)

In [75]: end = datetime.datetime(2012, 1, 1)

In [76]: index = pd.date_range(start, end)

In [77]: index
Out[77]: 
DatetimeIndex(['2011-01-01', '2011-01-02', '2011-01-03', '2011-01-04',
               '2011-01-05', '2011-01-06', '2011-01-07', '2011-01-08',
               '2011-01-09', '2011-01-10',
               ...
               '2011-12-23', '2011-12-24', '2011-12-25', '2011-12-26',
               '2011-12-27', '2011-12-28', '2011-12-29', '2011-12-30',
               '2011-12-31', '2012-01-01'],
              dtype='datetime64[ns]', length=366, freq='D')
```

 `date_range` 是日历范围，`bdate_range` 是工作日范围：

```
In [78]: index = pd.bdate_range(start, end)

In [79]: index
Out[79]: 
DatetimeIndex(['2011-01-03', '2011-01-04', '2011-01-05', '2011-01-06',
               '2011-01-07', '2011-01-10', '2011-01-11', '2011-01-12',
               '2011-01-13', '2011-01-14',
               ...
               '2011-12-19', '2011-12-20', '2011-12-21', '2011-12-22',
               '2011-12-23', '2011-12-26', '2011-12-27', '2011-12-28',
               '2011-12-29', '2011-12-30'],
              dtype='datetime64[ns]', length=260, freq='B')
```

两个方法都可以带上 `start`, `end`, 和 `periods `参数。

```
In [84]: pd.bdate_range(end=end, periods=20)
In [83]: pd.date_range(start, end, freq="W")
In [86]: pd.date_range("2018-01-01", "2018-01-05", periods=5)
```

## `origin`

使用 `origin`参数，可以修改 `DatetimeIndex` 的起点：

```
In [67]: pd.to_datetime([1, 2, 3], unit="D", origin=pd.Timestamp("1960-01-01"))
Out[67]: DatetimeIndex(['1960-01-02', '1960-01-03', '1960-01-04'], dtype='datetime64[ns]', freq=None)
```

默认情况下   `origin='unix'`,  也就是起点是 `1970-01-01 00:00:00`. 

```
In [68]: pd.to_datetime([1, 2, 3], unit="D")
Out[68]: DatetimeIndex(['1970-01-02', '1970-01-03', '1970-01-04'], dtype='datetime64[ns]', freq=None)
```

## 格式化

使用format参数可以对时间进行格式化：

```
In [51]: pd.to_datetime("2010/11/12", format="%Y/%m/%d")
Out[51]: Timestamp('2010-11-12 00:00:00')

In [52]: pd.to_datetime("12-11-2010 00:00", format="%d-%m-%Y %H:%M")
Out[52]: Timestamp('2010-11-12 00:00:00')
```

# Period

 Period 表示的是一个时间跨度,通常和freq一起使用：

```
In [31]: pd.Period("2011-01")
Out[31]: Period('2011-01', 'M')

In [32]: pd.Period("2012-05", freq="D")
Out[32]: Period('2012-05-01', 'D')
```

Period可以直接进行运算：

```
In [345]: p = pd.Period("2012", freq="A-DEC")

In [346]: p + 1
Out[346]: Period('2013', 'A-DEC')

In [347]: p - 3
Out[347]: Period('2009', 'A-DEC')

In [348]: p = pd.Period("2012-01", freq="2M")

In [349]: p + 2
Out[349]: Period('2012-05', '2M')

In [350]: p - 1
Out[350]: Period('2011-11', '2M')
```

> 注意，Period只有具有相同的freq才能进行算数运算。包括 offsets 和 timedelta

```
In [352]: p = pd.Period("2014-07-01 09:00", freq="H")

In [353]: p + pd.offsets.Hour(2)
Out[353]: Period('2014-07-01 11:00', 'H')

In [354]: p + datetime.timedelta(minutes=120)
Out[354]: Period('2014-07-01 11:00', 'H')

In [355]: p + np.timedelta64(7200, "s")
Out[355]: Period('2014-07-01 11:00', 'H')
```

Period作为index可以自动被转换为PeriodIndex：

```
In [38]: periods = [pd.Period("2012-01"), pd.Period("2012-02"), pd.Period("2012-03")]

In [39]: ts = pd.Series(np.random.randn(3), periods)

In [40]: type(ts.index)
Out[40]: pandas.core.indexes.period.PeriodIndex

In [41]: ts.index
Out[41]: PeriodIndex(['2012-01', '2012-02', '2012-03'], dtype='period[M]', freq='M')

In [42]: ts
Out[42]: 
2012-01   -1.135632
2012-02    1.212112
2012-03   -0.173215
Freq: M, dtype: float64
```

可以通过  pd.period_range 方法来创建 PeriodIndex：

```
In [359]: prng = pd.period_range("1/1/2011", "1/1/2012", freq="M")

In [360]: prng
Out[360]: 
PeriodIndex(['2011-01', '2011-02', '2011-03', '2011-04', '2011-05', '2011-06',
             '2011-07', '2011-08', '2011-09', '2011-10', '2011-11', '2011-12',
             '2012-01'],
            dtype='period[M]', freq='M')
```

还可以通过PeriodIndex直接创建：

```
In [361]: pd.PeriodIndex(["2011-1", "2011-2", "2011-3"], freq="M")
Out[361]: PeriodIndex(['2011-01', '2011-02', '2011-03'], dtype='period[M]', freq='M')
```

# DateOffset

 DateOffset表示的是频率对象。它和Timedelta很类似，表示的是一个持续时间，但是有特殊的日历规则。比如Timedelta一天肯定是24小时，而在 DateOffset中根据夏令时的不同，一天可能会有23，24或者25小时。

```
# This particular day contains a day light savings time transition
In [144]: ts = pd.Timestamp("2016-10-30 00:00:00", tz="Europe/Helsinki")

# Respects absolute time
In [145]: ts + pd.Timedelta(days=1)
Out[145]: Timestamp('2016-10-30 23:00:00+0200', tz='Europe/Helsinki')

# Respects calendar time
In [146]: ts + pd.DateOffset(days=1)
Out[146]: Timestamp('2016-10-31 00:00:00+0200', tz='Europe/Helsinki')

In [147]: friday = pd.Timestamp("2018-01-05")

In [148]: friday.day_name()
Out[148]: 'Friday'

# Add 2 business days (Friday --> Tuesday)
In [149]: two_business_days = 2 * pd.offsets.BDay()

In [150]: two_business_days.apply(friday)
Out[150]: Timestamp('2018-01-09 00:00:00')

In [151]: friday + two_business_days
Out[151]: Timestamp('2018-01-09 00:00:00')

In [152]: (friday + two_business_days).day_name()
Out[152]: 'Tuesday'
```

 DateOffsets 和**Frequency** 运算是先关的，看一下可用的**Date Offset** 和它相关联的 **Frequency**：


| Date Offset                                  | Frequency String  | 描述                    |
| :------------------------------------------- | :---------------- | :---------------------- |
| `DateOffset`                                 | None              | 通用的offset 类         |
| `BDay` or `BusinessDay`                      | `'B'`             | 工作日                  |
| `CDay` or `CustomBusinessDay`                | `'C'`             | 自定义的工作日          |
| `Week`                                       | `'W'`             | 一周                    |
| `WeekOfMonth`                                | `'WOM'`           | 每个月的第几周的第几天  |
| `LastWeekOfMonth`                            | `'LWOM'`          | 每个月最后一周的第几天  |
| `MonthEnd`                                   | `'M'`             | 日历月末                |
| MonthBegin                                   | `'MS'`            | 日历月初                |
| `BMonthEnd` or `BusinessMonthEnd`            | `'BM'`            | 营业月底                |
| `BMonthBegin` or `BusinessMonthBegin`        | `'BMS'`           | 营业月初                |
| `CBMonthEnd` or `CustomBusinessMonthEnd`     | `'CBM'`           | 自定义营业月底          |
| `CBMonthBegin` or `CustomBusinessMonthBegin` | `'CBMS'`          | 自定义营业月初          |
| `SemiMonthEnd`                               | `'SM'`            | 日历月末的第15天        |
| `SemiMonthBegin`                             | `'SMS'`           | 日历月初的第15天        |
| `QuarterEnd`                                 | `'Q'`             | 日历季末                |
| `QuarterBegin`                               | `'QS'`            | 日历季初                |
| `BQuarterEnd`                                | `'BQ`             | 工作季末                |
| `BQuarterBegin`                              | `'BQS'`           | 工作季初                |
| `FY5253Quarter`                              | `'REQ'`           | 零售季（ 52-53 week)    |
| `YearEnd`                                    | `'A'`             | 日历年末                |
| `YearBegin`                                  | `'AS'` or `'BYS'` | 日历年初                |
| `BYearEnd`                                   | `'BA'`            | 营业年末                |
| `BYearBegin`                                 | `'BAS'`           | 营业年初                |
| `FY5253`                                     | `'RE'`            | 零售年 (aka 52-53 week) |
| `Easter`                                     | None              | 复活节假期              |
| `BusinessHour`                               | `'BH'`            | business hour           |
| `CustomBusinessHour`                         | `'CBH'`           | custom business hour    |
| `Day`                                        | `'D'`             | 一天的绝对时间          |
| `Hour`                                       | `'H'`             | 一小时                  |
| `Minute`                                     | `'T'` or `'min'`  | 一分钟                  |
| `Second`                                     | `'S'`             | 一秒钟                  |
| `Milli`                                      | `'L'` or `'ms'`   | 一微妙                  |
| `Micro`                                      | `'U'` or `'us'`   | 一毫秒                  |
| `Nano`                                       | `'N'`             | 一纳秒                  |

DateOffset还有两个方法  `rollforward()` 和 `rollback()` 可以将时间进行移动：

```
In [153]: ts = pd.Timestamp("2018-01-06 00:00:00")

In [154]: ts.day_name()
Out[154]: 'Saturday'

# BusinessHour's valid offset dates are Monday through Friday
In [155]: offset = pd.offsets.BusinessHour(start="09:00")

# Bring the date to the closest offset date (Monday)
In [156]: offset.rollforward(ts)
Out[156]: Timestamp('2018-01-08 09:00:00')

# Date is brought to the closest offset date first and then the hour is added
In [157]: ts + offset
Out[157]: Timestamp('2018-01-08 10:00:00')
```

上面的操作会自动保存小时，分钟等信息，如果想要设置为  00:00:00  ， 可以调用normalize() 方法：

```
In [158]: ts = pd.Timestamp("2014-01-01 09:00")

In [159]: day = pd.offsets.Day()

In [160]: day.apply(ts)
Out[160]: Timestamp('2014-01-02 09:00:00')

In [161]: day.apply(ts).normalize()
Out[161]: Timestamp('2014-01-02 00:00:00')

In [162]: ts = pd.Timestamp("2014-01-01 22:00")

In [163]: hour = pd.offsets.Hour()

In [164]: hour.apply(ts)
Out[164]: Timestamp('2014-01-01 23:00:00')

In [165]: hour.apply(ts).normalize()
Out[165]: Timestamp('2014-01-01 00:00:00')

In [166]: hour.apply(pd.Timestamp("2014-01-01 23:30")).normalize()
Out[166]: Timestamp('2014-01-02 00:00:00')
```

# 作为index

时间可以作为index，并且作为index的时候会有一些很方便的特性。

可以直接使用时间来获取相应的数据：

```
In [99]: ts["1/31/2011"]
Out[99]: 0.11920871129693428

In [100]: ts[datetime.datetime(2011, 12, 25):]
Out[100]: 
2011-12-30    0.56702
Freq: BM, dtype: float64

In [101]: ts["10/31/2011":"12/31/2011"]
Out[101]: 
2011-10-31    0.271860
2011-11-30   -0.424972
2011-12-30    0.567020
Freq: BM, dtype: float64
```

获取全年的数据：

```
In [102]: ts["2011"]
Out[102]: 
2011-01-31    0.119209
2011-02-28   -1.044236
2011-03-31   -0.861849
2011-04-29   -2.104569
2011-05-31   -0.494929
2011-06-30    1.071804
2011-07-29    0.721555
2011-08-31   -0.706771
2011-09-30   -1.039575
2011-10-31    0.271860
2011-11-30   -0.424972
2011-12-30    0.567020
Freq: BM, dtype: float64
```

获取某个月的数据：

```
In [103]: ts["2011-6"]
Out[103]: 
2011-06-30    1.071804
Freq: BM, dtype: float64
```

DF可以接受时间作为loc的参数：

```
In [105]: dft
Out[105]: 
                            A
2013-01-01 00:00:00  0.276232
2013-01-01 00:01:00 -1.087401
2013-01-01 00:02:00 -0.673690
2013-01-01 00:03:00  0.113648
2013-01-01 00:04:00 -1.478427
...                       ...
2013-03-11 10:35:00 -0.747967
2013-03-11 10:36:00 -0.034523
2013-03-11 10:37:00 -0.201754
2013-03-11 10:38:00 -1.509067
2013-03-11 10:39:00 -1.693043

[100000 rows x 1 columns]

In [106]: dft.loc["2013"]
Out[106]: 
                            A
2013-01-01 00:00:00  0.276232
2013-01-01 00:01:00 -1.087401
2013-01-01 00:02:00 -0.673690
2013-01-01 00:03:00  0.113648
2013-01-01 00:04:00 -1.478427
...                       ...
2013-03-11 10:35:00 -0.747967
2013-03-11 10:36:00 -0.034523
2013-03-11 10:37:00 -0.201754
2013-03-11 10:38:00 -1.509067
2013-03-11 10:39:00 -1.693043

[100000 rows x 1 columns]
```

时间切片：

```
In [107]: dft["2013-1":"2013-2"]
Out[107]: 
                            A
2013-01-01 00:00:00  0.276232
2013-01-01 00:01:00 -1.087401
2013-01-01 00:02:00 -0.673690
2013-01-01 00:03:00  0.113648
2013-01-01 00:04:00 -1.478427
...                       ...
2013-02-28 23:55:00  0.850929
2013-02-28 23:56:00  0.976712
2013-02-28 23:57:00 -2.693884
2013-02-28 23:58:00 -1.575535
2013-02-28 23:59:00 -1.573517

[84960 rows x 1 columns]
```

## 切片和完全匹配

考虑下面的一个精度为分的Series对象：

```
In [120]: series_minute = pd.Series(
   .....:     [1, 2, 3],
   .....:     pd.DatetimeIndex(
   .....:         ["2011-12-31 23:59:00", "2012-01-01 00:00:00", "2012-01-01 00:02:00"]
   .....:     ),
   .....: )
   .....: 

In [121]: series_minute.index.resolution
Out[121]: 'minute'
```

时间精度小于分的话，返回的是一个Series对象：

```
In [122]: series_minute["2011-12-31 23"]
Out[122]: 
2011-12-31 23:59:00    1
dtype: int64
```

时间精度大于分的话，返回的是一个常量：

```
In [123]: series_minute["2011-12-31 23:59"]
Out[123]: 1

In [124]: series_minute["2011-12-31 23:59:00"]
Out[124]: 1
```

同样的，如果精度为秒的话，小于秒会返回一个对象，等于秒会返回常量值。

# 时间序列的操作

## Shifting

使用shift方法可以让 time series 进行相应的移动：

```
In [275]: ts = pd.Series(range(len(rng)), index=rng)

In [276]: ts = ts[:5]

In [277]: ts.shift(1)
Out[277]: 
2012-01-01    NaN
2012-01-02    0.0
2012-01-03    1.0
Freq: D, dtype: float64
```

通过指定 freq ， 可以设置shift的方式：

```
In [278]: ts.shift(5, freq="D")
Out[278]: 
2012-01-06    0
2012-01-07    1
2012-01-08    2
Freq: D, dtype: int64

In [279]: ts.shift(5, freq=pd.offsets.BDay())
Out[279]: 
2012-01-06    0
2012-01-09    1
2012-01-10    2
dtype: int64

In [280]: ts.shift(5, freq="BM")
Out[280]: 
2012-05-31    0
2012-05-31    1
2012-05-31    2
dtype: int64
```

## 频率转换

时间序列可以通过调用 asfreq 的方法转换其频率：

```
In [281]: dr = pd.date_range("1/1/2010", periods=3, freq=3 * pd.offsets.BDay())

In [282]: ts = pd.Series(np.random.randn(3), index=dr)

In [283]: ts
Out[283]: 
2010-01-01    1.494522
2010-01-06   -0.778425
2010-01-11   -0.253355
Freq: 3B, dtype: float64

In [284]: ts.asfreq(pd.offsets.BDay())
Out[284]: 
2010-01-01    1.494522
2010-01-04         NaN
2010-01-05         NaN
2010-01-06   -0.778425
2010-01-07         NaN
2010-01-08         NaN
2010-01-11   -0.253355
Freq: B, dtype: float64
```

asfreq还可以指定修改频率过后的填充方法：

```
In [285]: ts.asfreq(pd.offsets.BDay(), method="pad")
Out[285]: 
2010-01-01    1.494522
2010-01-04    1.494522
2010-01-05    1.494522
2010-01-06   -0.778425
2010-01-07   -0.778425
2010-01-08   -0.778425
2010-01-11   -0.253355
Freq: B, dtype: float64
```

#  Resampling 重新取样

给定的时间序列可以通过调用resample方法来重新取样：

```
In [286]: rng = pd.date_range("1/1/2012", periods=100, freq="S")

In [287]: ts = pd.Series(np.random.randint(0, 500, len(rng)), index=rng)

In [288]: ts.resample("5Min").sum()
Out[288]: 
2012-01-01    25103
Freq: 5T, dtype: int64
```

 resample 可以接受各类统计方法，比如： `sum`, `mean`, `std`, `sem`, `max`, `min`, `median`, `first`, `last`, `ohlc`。

```
In [289]: ts.resample("5Min").mean()
Out[289]: 
2012-01-01    251.03
Freq: 5T, dtype: float64

In [290]: ts.resample("5Min").ohlc()
Out[290]: 
            open  high  low  close
2012-01-01   308   460    9    205

In [291]: ts.resample("5Min").max()
Out[291]: 
2012-01-01    460
Freq: 5T, dtype: int64
```
