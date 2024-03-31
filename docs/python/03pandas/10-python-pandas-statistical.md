---
slug: /10-python-pandas-statistical
---

# 10. Pandas高级教程之:统计方法



# 简介

数据分析中经常会用到很多统计类的方法，本文将会介绍Pandas中使用到的统计方法。

# 变动百分百

Series和DF都有一个`pct_change()` 方法用来计算数据变动的百分比。这个方法在填充NaN值的时候特别有用。

```
ser = pd.Series(np.random.randn(8))

ser.pct_change()
Out[45]: 
0         NaN
1   -1.264716
2    4.125006
3   -1.159092
4   -0.091292
5    4.837752
6   -1.182146
7   -8.721482
dtype: float64

ser
Out[46]: 
0   -0.950515
1    0.251617
2    1.289537
3   -0.205155
4   -0.186426
5   -1.088310
6    0.198231
7   -1.530635
dtype: float64
```

 pct_change还有个periods参数，可以指定计算百分比的periods，也就是隔多少个元素来计算：

```
In [3]: df = pd.DataFrame(np.random.randn(10, 4))

In [4]: df.pct_change(periods=3)
Out[4]: 
          0         1         2         3
0       NaN       NaN       NaN       NaN
1       NaN       NaN       NaN       NaN
2       NaN       NaN       NaN       NaN
3 -0.218320 -1.054001  1.987147 -0.510183
4 -0.439121 -1.816454  0.649715 -4.822809
5 -0.127833 -3.042065 -5.866604 -1.776977
6 -2.596833 -1.959538 -2.111697 -3.798900
7 -0.117826 -2.169058  0.036094 -0.067696
8  2.492606 -1.357320 -1.205802 -1.558697
9 -1.012977  2.324558 -1.003744 -0.371806
```

# Covariance协方差

Series.cov() 用来计算两个Series的协方差，会忽略掉NaN的数据。

```
In [5]: s1 = pd.Series(np.random.randn(1000))

In [6]: s2 = pd.Series(np.random.randn(1000))

In [7]: s1.cov(s2)
Out[7]: 0.0006801088174310875
```

同样的，DataFrame.cov()  会计算对应Series的协方差，也会忽略NaN的数据。

```
In [8]: frame = pd.DataFrame(np.random.randn(1000, 5), columns=["a", "b", "c", "d", "e"])

In [9]: frame.cov()
Out[9]: 
          a         b         c         d         e
a  1.000882 -0.003177 -0.002698 -0.006889  0.031912
b -0.003177  1.024721  0.000191  0.009212  0.000857
c -0.002698  0.000191  0.950735 -0.031743 -0.005087
d -0.006889  0.009212 -0.031743  1.002983 -0.047952
e  0.031912  0.000857 -0.005087 -0.047952  1.042487
```

 DataFrame.cov 带有一个min_periods参数，可以指定计算协方差的最小元素个数，以保证不会出现极值数据的情况。

```
In [10]: frame = pd.DataFrame(np.random.randn(20, 3), columns=["a", "b", "c"])

In [11]: frame.loc[frame.index[:5], "a"] = np.nan

In [12]: frame.loc[frame.index[5:10], "b"] = np.nan

In [13]: frame.cov()
Out[13]: 
          a         b         c
a  1.123670 -0.412851  0.018169
b -0.412851  1.154141  0.305260
c  0.018169  0.305260  1.301149

In [14]: frame.cov(min_periods=12)
Out[14]: 
          a         b         c
a  1.123670       NaN  0.018169
b       NaN  1.154141  0.305260
c  0.018169  0.305260  1.301149
```

# Correlation相关系数

corr()  方法可以用来计算相关系数。有三种相关系数的计算方法：

| 方法名              | 描述                 |
| :------------------ | :------------------- |
| `pearson (default)` | 标准相关系数         |
| `kendall`           | Kendall Tau相关系数  |
| `spearman`          | 斯皮尔曼等级相关系数 |

```
n [15]: frame = pd.DataFrame(np.random.randn(1000, 5), columns=["a", "b", "c", "d", "e"])

In [16]: frame.iloc[::2] = np.nan

# Series with Series
In [17]: frame["a"].corr(frame["b"])
Out[17]: 0.013479040400098775

In [18]: frame["a"].corr(frame["b"], method="spearman")
Out[18]: -0.007289885159540637

# Pairwise correlation of DataFrame columns
In [19]: frame.corr()
Out[19]: 
          a         b         c         d         e
a  1.000000  0.013479 -0.049269 -0.042239 -0.028525
b  0.013479  1.000000 -0.020433 -0.011139  0.005654
c -0.049269 -0.020433  1.000000  0.018587 -0.054269
d -0.042239 -0.011139  0.018587  1.000000 -0.017060
e -0.028525  0.005654 -0.054269 -0.017060  1.000000
```

corr同样也支持 min_periods  ：

```
In [20]: frame = pd.DataFrame(np.random.randn(20, 3), columns=["a", "b", "c"])

In [21]: frame.loc[frame.index[:5], "a"] = np.nan

In [22]: frame.loc[frame.index[5:10], "b"] = np.nan

In [23]: frame.corr()
Out[23]: 
          a         b         c
a  1.000000 -0.121111  0.069544
b -0.121111  1.000000  0.051742
c  0.069544  0.051742  1.000000

In [24]: frame.corr(min_periods=12)
Out[24]: 
          a         b         c
a  1.000000       NaN  0.069544
b       NaN  1.000000  0.051742
c  0.069544  0.051742  1.000000
```

 corrwith 可以计算不同DF间的相关系数。

```
In [27]: index = ["a", "b", "c", "d", "e"]

In [28]: columns = ["one", "two", "three", "four"]

In [29]: df1 = pd.DataFrame(np.random.randn(5, 4), index=index, columns=columns)

In [30]: df2 = pd.DataFrame(np.random.randn(4, 4), index=index[:4], columns=columns)

In [31]: df1.corrwith(df2)
Out[31]: 
one     -0.125501
two     -0.493244
three    0.344056
four     0.004183
dtype: float64

In [32]: df2.corrwith(df1, axis=1)
Out[32]: 
a   -0.675817
b    0.458296
c    0.190809
d   -0.186275
e         NaN
dtype: float64
```

# rank等级

rank方法可以对Series中的数据进行排列等级。什么叫等级呢？ 我们举个例子：

```
s = pd.Series(np.random.randn(5), index=list("abcde"))

s
Out[51]: 
a    0.336259
b    1.073116
c   -0.402291
d    0.624186
e   -0.422478
dtype: float64

s["d"] = s["b"]  # so there's a tie

s
Out[53]: 
a    0.336259
b    1.073116
c   -0.402291
d    1.073116
e   -0.422478
dtype: float64

s.rank()
Out[54]: 
a    3.0
b    4.5
c    2.0
d    4.5
e    1.0
dtype: float64
```

上面我们创建了一个Series，里面的数据从小到大排序 ：

```
-0.422478 < -0.402291 <  0.336259 <  1.073116 < 1.073116
```

所以相应的rank就是  1 ， 2 ，3 ，4 ， 5.  

因为我们有两个值是相同的，默认情况下会取两者的平均值，也就是 4.5.

除了 default_rank  ， 还可以指定max_rank ，这样每个值都是最大的5 。

还可以指定 NA_bottom  ， 表示对于NaN的数据也用来计算rank，并且会放在最底部，也就是最大值。

还可以指定 pct_rank ， rank值是一个百分比值。

```
df = pd.DataFrame(data={'Animal': ['cat', 'penguin', 'dog',
...                                    'spider', 'snake'],
...                         'Number_legs': [4, 2, 4, 8, np.nan]})
>>> df
    Animal  Number_legs
0      cat          4.0
1  penguin          2.0
2      dog          4.0
3   spider          8.0
4    snake          NaN
```

```
df['default_rank'] = df['Number_legs'].rank()
>>> df['max_rank'] = df['Number_legs'].rank(method='max')
>>> df['NA_bottom'] = df['Number_legs'].rank(na_option='bottom')
>>> df['pct_rank'] = df['Number_legs'].rank(pct=True)
>>> df
    Animal  Number_legs  default_rank  max_rank  NA_bottom  pct_rank
0      cat          4.0           2.5       3.0        2.5     0.625
1  penguin          2.0           1.0       1.0        1.0     0.250
2      dog          4.0           2.5       3.0        2.5     0.625
3   spider          8.0           4.0       4.0        4.0     1.000
4    snake          NaN           NaN       NaN        5.0       NaN
```

rank还可以指定按行  (`axis=0`) 或者 按列 (`axis=1`)来计算。

```
In [36]: df = pd.DataFrame(np.random.randn(10, 6))

In [37]: df[4] = df[2][:5]  # some ties

In [38]: df
Out[38]: 
          0         1         2         3         4         5
0 -0.904948 -1.163537 -1.457187  0.135463 -1.457187  0.294650
1 -0.976288 -0.244652 -0.748406 -0.999601 -0.748406 -0.800809
2  0.401965  1.460840  1.256057  1.308127  1.256057  0.876004
3  0.205954  0.369552 -0.669304  0.038378 -0.669304  1.140296
4 -0.477586 -0.730705 -1.129149 -0.601463 -1.129149 -0.211196
5 -1.092970 -0.689246  0.908114  0.204848       NaN  0.463347
6  0.376892  0.959292  0.095572 -0.593740       NaN -0.069180
7 -1.002601  1.957794 -0.120708  0.094214       NaN -1.467422
8 -0.547231  0.664402 -0.519424 -0.073254       NaN -1.263544
9 -0.250277 -0.237428 -1.056443  0.419477       NaN  1.375064

In [39]: df.rank(1)
Out[39]: 
     0    1    2    3    4    5
0  4.0  3.0  1.5  5.0  1.5  6.0
1  2.0  6.0  4.5  1.0  4.5  3.0
2  1.0  6.0  3.5  5.0  3.5  2.0
3  4.0  5.0  1.5  3.0  1.5  6.0
4  5.0  3.0  1.5  4.0  1.5  6.0
5  1.0  2.0  5.0  3.0  NaN  4.0
6  4.0  5.0  3.0  1.0  NaN  2.0
7  2.0  5.0  3.0  4.0  NaN  1.0
8  2.0  5.0  3.0  4.0  NaN  1.0
9  2.0  3.0  1.0  4.0  NaN  5.0
```
