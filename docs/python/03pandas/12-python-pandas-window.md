---
slug: /12-python-pandas-window
---

# 12. Pandas高级教程之:window操作



# 简介

在数据统计中，经常需要进行一些范围操作，这些范围我们可以称之为一个window 。Pandas提供了一个rolling方法，通过滚动window来进行统计计算。

本文将会探讨一下rolling中的window用法。

# 滚动窗口

我们有5个数，我们希望滚动统计两个数的和，那么可以这样：

```
In [1]: s = pd.Series(range(5))

In [2]: s.rolling(window=2).sum()
Out[2]: 
0    NaN
1    1.0
2    3.0
3    5.0
4    7.0
dtype: float64
```

 rolling 对象可以通过for来遍历：

```
In [3]: for window in s.rolling(window=2):
   ...:     print(window)
   ...: 
0    0
dtype: int64
0    0
1    1
dtype: int64
1    1
2    2
dtype: int64
2    2
3    3
dtype: int64
3    3
4    4
dtype: int64
```

pandas中有四种window操作，我们看下他们的定义：

| 名称                               | 方法        | 返回对象                  | 是否支持时间序列 | 是否支持链式**groupby**操作 |
| :--------------------------------- | :---------- | :------------------------ | :--------------- | :-------------------------- |
| 固定或者可滑动的窗口               | `rolling`   | `Rolling`                 | Yes              | Yes                         |
| scipy.signal库提供的加权非矩形窗口 | `rolling`   | `Window`                  | No               | No                          |
| 累积值的窗口                       | `expanding` | `Expanding`               | No               | Yes                         |
| 值上的累积和指数加权窗口           | `ewm`       | `ExponentialMovingWindow` | No               | Yes (as of version 1.2)     |

​	看一个基于时间rolling的例子：

```
In [4]: s = pd.Series(range(5), index=pd.date_range('2020-01-01', periods=5, freq='1D'))

In [5]: s.rolling(window='2D').sum()
Out[5]: 
2020-01-01    0.0
2020-01-02    1.0
2020-01-03    3.0
2020-01-04    5.0
2020-01-05    7.0
Freq: D, dtype: float64
```

设置min_periods可以指定window中的最小的NaN的个数：

```
In [8]: s = pd.Series([np.nan, 1, 2, np.nan, np.nan, 3])

In [9]: s.rolling(window=3, min_periods=1).sum()
Out[9]: 
0    NaN
1    1.0
2    3.0
3    3.0
4    2.0
5    3.0
dtype: float64

In [10]: s.rolling(window=3, min_periods=2).sum()
Out[10]: 
0    NaN
1    NaN
2    3.0
3    3.0
4    NaN
5    NaN
dtype: float64

# Equivalent to min_periods=3
In [11]: s.rolling(window=3, min_periods=None).sum()
Out[11]: 
0   NaN
1   NaN
2   NaN
3   NaN
4   NaN
5   NaN
dtype: float64
```

## Center window

默认情况下window的统计是以最右为准，比如window=5,那么前面的0，1，2，3 因为没有达到5，所以为NaN。

```
In [19]: s = pd.Series(range(10))

In [20]: s.rolling(window=5).mean()
Out[20]: 
0    NaN
1    NaN
2    NaN
3    NaN
4    2.0
5    3.0
6    4.0
7    5.0
8    6.0
9    7.0
dtype: float64
```

可以对这种方式进行修改，设置  center=True  可以从中间统计：

```
In [21]: s.rolling(window=5, center=True).mean()
Out[21]: 
0    NaN
1    NaN
2    2.0
3    3.0
4    4.0
5    5.0
6    6.0
7    7.0
8    NaN
9    NaN
dtype: float64
```

# Weighted window 加权窗口

使用 win_type 可以指定加权窗口的类型。其中win_type 必须是scipy.signal 中的window类型。

举几个例子：

```
In [47]: s = pd.Series(range(10))

In [48]: s.rolling(window=5).mean()
Out[48]: 
0    NaN
1    NaN
2    NaN
3    NaN
4    2.0
5    3.0
6    4.0
7    5.0
8    6.0
9    7.0
dtype: float64

In [49]: s.rolling(window=5, win_type="triang").mean()
Out[49]: 
0    NaN
1    NaN
2    NaN
3    NaN
4    2.0
5    3.0
6    4.0
7    5.0
8    6.0
9    7.0
dtype: float64

# Supplementary Scipy arguments passed in the aggregation function
In [50]: s.rolling(window=5, win_type="gaussian").mean(std=0.1)
Out[50]: 
0    NaN
1    NaN
2    NaN
3    NaN
4    2.0
5    3.0
6    4.0
7    5.0
8    6.0
9    7.0
dtype: float64
```

# 扩展窗口

扩展窗口会产生聚合统计信息的值，其中包含该时间点之前的所有可用数据。 

```
In [51]: df = pd.DataFrame(range(5))

In [52]: df.rolling(window=len(df), min_periods=1).mean()
Out[52]: 
     0
0  0.0
1  0.5
2  1.0
3  1.5
4  2.0

In [53]: df.expanding(min_periods=1).mean()
Out[53]: 
     0
0  0.0
1  0.5
2  1.0
3  1.5
4  2.0
```

# 指数加权窗口

指数加权窗口与扩展窗口相似，但每个先验点相对于当前点均按指数加权。

加权计算的公式是这样的：

$y_t=Σ^t_{i=0}{w_ix_{t-i}\over{Σ^t_{i=0}w_i}}$

其中$x_t$是输入，$y_t$是输出，$w_i$是权重。

EW有两种模式，一种模式是  `adjust=True` ，这种情况下   $𝑤_𝑖=(1−𝛼)^𝑖$  

一种模式是  `adjust=False` ，这种情况下：
$$
y_0=x_0\\n

y_t=(1-a)y_{t-1}+ax_t
$$


其中 0<𝛼≤1, 根据EM方式的不同a可以有不同的取值：

$$a=\{ {{2\over {s+1}} \qquad span模式 其中s >= 1\\ {1\over{1+c}}\qquad center of mass c>=0 \\ 1-exp^{log0.5\over h} \qquad half-life h > 0 }$$

举个例子：

```
In [54]: df = pd.DataFrame({"B": [0, 1, 2, np.nan, 4]})

In [55]: df
Out[55]: 
     B
0  0.0
1  1.0
2  2.0
3  NaN
4  4.0

In [56]: times = ["2020-01-01", "2020-01-03", "2020-01-10", "2020-01-15", "2020-01-17"]

In [57]: df.ewm(halflife="4 days", times=pd.DatetimeIndex(times)).mean()
Out[57]: 
          B
0  0.000000
1  0.585786
2  1.523889
3  1.523889
4  3.233686
```

