---
slug: /07-python-pandas-missingdata
---

# 7. Pandas高级教程之:处理缺失数据



# 简介

在数据处理中，Pandas会将无法解析的数据或者缺失的数据使用NaN来表示。虽然所有的数据都有了相应的表示，但是NaN很明显是无法进行数学运算的。

本文将会讲解Pandas对于NaN数据的处理方法。

# NaN的例子

上面讲到了缺失的数据会被表现为NaN，我们来看一个具体的例子：

我们先来构建一个DF：

```
In [1]: df = pd.DataFrame(np.random.randn(5, 3), index=['a', 'c', 'e', 'f', 'h'],
   ...:                   columns=['one', 'two', 'three'])
   ...: 

In [2]: df['four'] = 'bar'

In [3]: df['five'] = df['one'] > 0

In [4]: df
Out[4]: 
        one       two     three four   five
a  0.469112 -0.282863 -1.509059  bar   True
c -1.135632  1.212112 -0.173215  bar  False
e  0.119209 -1.044236 -0.861849  bar   True
f -2.104569 -0.494929  1.071804  bar  False
h  0.721555 -0.706771 -1.039575  bar   True
```

上面DF只有acefh这几个index，我们重新index一下数据：

```
In [5]: df2 = df.reindex(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])

In [6]: df2
Out[6]: 
        one       two     three four   five
a  0.469112 -0.282863 -1.509059  bar   True
b       NaN       NaN       NaN  NaN    NaN
c -1.135632  1.212112 -0.173215  bar  False
d       NaN       NaN       NaN  NaN    NaN
e  0.119209 -1.044236 -0.861849  bar   True
f -2.104569 -0.494929  1.071804  bar  False
g       NaN       NaN       NaN  NaN    NaN
h  0.721555 -0.706771 -1.039575  bar   True
```

数据缺失，就会产生很多NaN。

为了检测是否NaN，可以使用isna()或者notna() 方法。

```
In [7]: df2['one']
Out[7]: 
a    0.469112
b         NaN
c   -1.135632
d         NaN
e    0.119209
f   -2.104569
g         NaN
h    0.721555
Name: one, dtype: float64

In [8]: pd.isna(df2['one'])
Out[8]: 
a    False
b     True
c    False
d     True
e    False
f    False
g     True
h    False
Name: one, dtype: bool

In [9]: df2['four'].notna()
Out[9]: 
a     True
b    False
c     True
d    False
e     True
f     True
g    False
h     True
Name: four, dtype: bool
```

注意在Python中None是相等的：

```
In [11]: None == None                                                 # noqa: E711
Out[11]: True
```

但是np.nan是不等的：

```
In [12]: np.nan == np.nan
Out[12]: False
```

# 整数类型的缺失值

NaN默认是float类型的，如果是整数类型，我们可以强制进行转换：

```
In [14]: pd.Series([1, 2, np.nan, 4], dtype=pd.Int64Dtype())
Out[14]: 
0       1
1       2
2    <NA>
3       4
dtype: Int64
```

# Datetimes 类型的缺失值

时间类型的缺失值使用NaT来表示：

```
In [15]: df2 = df.copy()

In [16]: df2['timestamp'] = pd.Timestamp('20120101')

In [17]: df2
Out[17]: 
        one       two     three four   five  timestamp
a  0.469112 -0.282863 -1.509059  bar   True 2012-01-01
c -1.135632  1.212112 -0.173215  bar  False 2012-01-01
e  0.119209 -1.044236 -0.861849  bar   True 2012-01-01
f -2.104569 -0.494929  1.071804  bar  False 2012-01-01
h  0.721555 -0.706771 -1.039575  bar   True 2012-01-01

In [18]: df2.loc[['a', 'c', 'h'], ['one', 'timestamp']] = np.nan

In [19]: df2
Out[19]: 
        one       two     three four   five  timestamp
a       NaN -0.282863 -1.509059  bar   True        NaT
c       NaN  1.212112 -0.173215  bar  False        NaT
e  0.119209 -1.044236 -0.861849  bar   True 2012-01-01
f -2.104569 -0.494929  1.071804  bar  False 2012-01-01
h       NaN -0.706771 -1.039575  bar   True        NaT

In [20]: df2.dtypes.value_counts()
Out[20]: 
float64           3
datetime64[ns]    1
bool              1
object            1
dtype: int64
```

# None 和  np.nan 的转换

对于数字类型的，如果赋值为None，那么会转换为相应的NaN类型：

```
In [21]: s = pd.Series([1, 2, 3])

In [22]: s.loc[0] = None

In [23]: s
Out[23]: 
0    NaN
1    2.0
2    3.0
dtype: float64
```

如果是对象类型，使用None赋值，会保持原样：

```
In [24]: s = pd.Series(["a", "b", "c"])

In [25]: s.loc[0] = None

In [26]: s.loc[1] = np.nan

In [27]: s
Out[27]: 
0    None
1     NaN
2       c
dtype: object
```

# 缺失值的计算

缺失值的数学计算还是缺失值：

```
In [28]: a
Out[28]: 
        one       two
a       NaN -0.282863
c       NaN  1.212112
e  0.119209 -1.044236
f -2.104569 -0.494929
h -2.104569 -0.706771

In [29]: b
Out[29]: 
        one       two     three
a       NaN -0.282863 -1.509059
c       NaN  1.212112 -0.173215
e  0.119209 -1.044236 -0.861849
f -2.104569 -0.494929  1.071804
h       NaN -0.706771 -1.039575

In [30]: a + b
Out[30]: 
        one  three       two
a       NaN    NaN -0.565727
c       NaN    NaN  2.424224
e  0.238417    NaN -2.088472
f -4.209138    NaN -0.989859
h       NaN    NaN -1.413542
```

但是在统计中会将NaN当成0来对待。

```
In [31]: df
Out[31]: 
        one       two     three
a       NaN -0.282863 -1.509059
c       NaN  1.212112 -0.173215
e  0.119209 -1.044236 -0.861849
f -2.104569 -0.494929  1.071804
h       NaN -0.706771 -1.039575

In [32]: df['one'].sum()
Out[32]: -1.9853605075978744

In [33]: df.mean(1)
Out[33]: 
a   -0.895961
c    0.519449
e   -0.595625
f   -0.509232
h   -0.873173
dtype: float64
```

如果是在cumsum或者cumprod中，默认是会跳过NaN，如果不想统计NaN，可以加上参数skipna=False

```
In [34]: df.cumsum()
Out[34]: 
        one       two     three
a       NaN -0.282863 -1.509059
c       NaN  0.929249 -1.682273
e  0.119209 -0.114987 -2.544122
f -1.985361 -0.609917 -1.472318
h       NaN -1.316688 -2.511893

In [35]: df.cumsum(skipna=False)
Out[35]: 
   one       two     three
a  NaN -0.282863 -1.509059
c  NaN  0.929249 -1.682273
e  NaN -0.114987 -2.544122
f  NaN -0.609917 -1.472318
h  NaN -1.316688 -2.511893
```

# 使用fillna填充NaN数据

数据分析中，如果有NaN数据，那么需要对其进行处理，一种处理方法就是使用fillna来进行填充。

下面填充常量：

```
In [42]: df2
Out[42]: 
        one       two     three four   five  timestamp
a       NaN -0.282863 -1.509059  bar   True        NaT
c       NaN  1.212112 -0.173215  bar  False        NaT
e  0.119209 -1.044236 -0.861849  bar   True 2012-01-01
f -2.104569 -0.494929  1.071804  bar  False 2012-01-01
h       NaN -0.706771 -1.039575  bar   True        NaT

In [43]: df2.fillna(0)
Out[43]: 
        one       two     three four   five            timestamp
a  0.000000 -0.282863 -1.509059  bar   True                    0
c  0.000000  1.212112 -0.173215  bar  False                    0
e  0.119209 -1.044236 -0.861849  bar   True  2012-01-01 00:00:00
f -2.104569 -0.494929  1.071804  bar  False  2012-01-01 00:00:00
h  0.000000 -0.706771 -1.039575  bar   True                    0
```

还可以指定填充方法，比如pad：

```
In [45]: df
Out[45]: 
        one       two     three
a       NaN -0.282863 -1.509059
c       NaN  1.212112 -0.173215
e  0.119209 -1.044236 -0.861849
f -2.104569 -0.494929  1.071804
h       NaN -0.706771 -1.039575

In [46]: df.fillna(method='pad')
Out[46]: 
        one       two     three
a       NaN -0.282863 -1.509059
c       NaN  1.212112 -0.173215
e  0.119209 -1.044236 -0.861849
f -2.104569 -0.494929  1.071804
h -2.104569 -0.706771 -1.039575
```

可以指定填充的行数：

```
In [48]: df.fillna(method='pad', limit=1)
```

fill方法统计：

| 方法名           | 描述     |
| :--------------- | :------- |
| pad / ffill      | 向前填充 |
| bfill / backfill | 向后填充 |

可以使用PandasObject来填充：

```
In [53]: dff
Out[53]: 
          A         B         C
0  0.271860 -0.424972  0.567020
1  0.276232 -1.087401 -0.673690
2  0.113648 -1.478427  0.524988
3       NaN  0.577046 -1.715002
4       NaN       NaN -1.157892
5 -1.344312       NaN       NaN
6 -0.109050  1.643563       NaN
7  0.357021 -0.674600       NaN
8 -0.968914 -1.294524  0.413738
9  0.276662 -0.472035 -0.013960

In [54]: dff.fillna(dff.mean())
Out[54]: 
          A         B         C
0  0.271860 -0.424972  0.567020
1  0.276232 -1.087401 -0.673690
2  0.113648 -1.478427  0.524988
3 -0.140857  0.577046 -1.715002
4 -0.140857 -0.401419 -1.157892
5 -1.344312 -0.401419 -0.293543
6 -0.109050  1.643563 -0.293543
7  0.357021 -0.674600 -0.293543
8 -0.968914 -1.294524  0.413738
9  0.276662 -0.472035 -0.013960

In [55]: dff.fillna(dff.mean()['B':'C'])
Out[55]: 
          A         B         C
0  0.271860 -0.424972  0.567020
1  0.276232 -1.087401 -0.673690
2  0.113648 -1.478427  0.524988
3       NaN  0.577046 -1.715002
4       NaN -0.401419 -1.157892
5 -1.344312 -0.401419 -0.293543
6 -0.109050  1.643563 -0.293543
7  0.357021 -0.674600 -0.293543
8 -0.968914 -1.294524  0.413738
9  0.276662 -0.472035 -0.013960
```

上面操作等同于：

```
In [56]: dff.where(pd.notna(dff), dff.mean(), axis='columns')
```

# 使用dropna删除包含NA的数据

除了fillna来填充数据之外，还可以使用dropna删除包含na的数据。

```
In [57]: df
Out[57]: 
   one       two     three
a  NaN -0.282863 -1.509059
c  NaN  1.212112 -0.173215
e  NaN  0.000000  0.000000
f  NaN  0.000000  0.000000
h  NaN -0.706771 -1.039575

In [58]: df.dropna(axis=0)
Out[58]: 
Empty DataFrame
Columns: [one, two, three]
Index: []

In [59]: df.dropna(axis=1)
Out[59]: 
        two     three
a -0.282863 -1.509059
c  1.212112 -0.173215
e  0.000000  0.000000
f  0.000000  0.000000
h -0.706771 -1.039575

In [60]: df['one'].dropna()
Out[60]: Series([], Name: one, dtype: float64)
```

# 插值interpolation

数据分析时候，为了数据的平稳，我们需要一些插值运算interpolate() ，使用起来很简单：

```
In [61]: ts
Out[61]: 
2000-01-31    0.469112
2000-02-29         NaN
2000-03-31         NaN
2000-04-28         NaN
2000-05-31         NaN
                ...   
2007-12-31   -6.950267
2008-01-31   -7.904475
2008-02-29   -6.441779
2008-03-31   -8.184940
2008-04-30   -9.011531
Freq: BM, Length: 100, dtype: float64
```

```
In [64]: ts.interpolate()
Out[64]: 
2000-01-31    0.469112
2000-02-29    0.434469
2000-03-31    0.399826
2000-04-28    0.365184
2000-05-31    0.330541
                ...   
2007-12-31   -6.950267
2008-01-31   -7.904475
2008-02-29   -6.441779
2008-03-31   -8.184940
2008-04-30   -9.011531
Freq: BM, Length: 100, dtype: float64
```

插值函数还可以添加参数，指定插值的方法，比如按时间插值：

```
In [67]: ts2
Out[67]: 
2000-01-31    0.469112
2000-02-29         NaN
2002-07-31   -5.785037
2005-01-31         NaN
2008-04-30   -9.011531
dtype: float64

In [68]: ts2.interpolate()
Out[68]: 
2000-01-31    0.469112
2000-02-29   -2.657962
2002-07-31   -5.785037
2005-01-31   -7.398284
2008-04-30   -9.011531
dtype: float64

In [69]: ts2.interpolate(method='time')
Out[69]: 
2000-01-31    0.469112
2000-02-29    0.270241
2002-07-31   -5.785037
2005-01-31   -7.190866
2008-04-30   -9.011531
dtype: float64
```

按index的float value进行插值：

```
In [70]: ser
Out[70]: 
0.0      0.0
1.0      NaN
10.0    10.0
dtype: float64

In [71]: ser.interpolate()
Out[71]: 
0.0      0.0
1.0      5.0
10.0    10.0
dtype: float64

In [72]: ser.interpolate(method='values')
Out[72]: 
0.0      0.0
1.0      1.0
10.0    10.0
dtype: float64
```

除了插值Series，还可以插值DF：

```
In [73]: df = pd.DataFrame({'A': [1, 2.1, np.nan, 4.7, 5.6, 6.8],
   ....:                    'B': [.25, np.nan, np.nan, 4, 12.2, 14.4]})
   ....: 

In [74]: df
Out[74]: 
     A      B
0  1.0   0.25
1  2.1    NaN
2  NaN    NaN
3  4.7   4.00
4  5.6  12.20
5  6.8  14.40

In [75]: df.interpolate()
Out[75]: 
     A      B
0  1.0   0.25
1  2.1   1.50
2  3.4   2.75
3  4.7   4.00
4  5.6  12.20
5  6.8  14.40
```

interpolate还接收limit参数，可以指定插值的个数。

```
In [95]: ser.interpolate(limit=1)
Out[95]: 
0     NaN
1     NaN
2     5.0
3     7.0
4     NaN
5     NaN
6    13.0
7    13.0
8     NaN
dtype: float64
```

# 使用replace替换值

replace可以替换常量，也可以替换list：

```
In [102]: ser = pd.Series([0., 1., 2., 3., 4.])

In [103]: ser.replace(0, 5)
Out[103]: 
0    5.0
1    1.0
2    2.0
3    3.0
4    4.0
dtype: float64
```

```
In [104]: ser.replace([0, 1, 2, 3, 4], [4, 3, 2, 1, 0])
Out[104]: 
0    4.0
1    3.0
2    2.0
3    1.0
4    0.0
dtype: float64
```

可以替换DF中特定的数值：

```
In [106]: df = pd.DataFrame({'a': [0, 1, 2, 3, 4], 'b': [5, 6, 7, 8, 9]})

In [107]: df.replace({'a': 0, 'b': 5}, 100)
Out[107]: 
     a    b
0  100  100
1    1    6
2    2    7
3    3    8
4    4    9
```

可以使用插值替换：

```
In [108]: ser.replace([1, 2, 3], method='pad')
Out[108]: 
0    0.0
1    0.0
2    0.0
3    0.0
4    4.0
dtype: float64
```



> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
