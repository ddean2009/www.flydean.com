---
slug: /03-python-pandas-data-structures
---

# 3. Pandas之:深入理解Pandas的数据结构



# 简介

本文将会讲解Pandas中基本的数据类型Series和DataFrame，并详细讲解这两种类型的创建，索引等基本行为。

使用Pandas需要引用下面的lib：

```
In [1]: import numpy as np

In [2]: import pandas as pd
```

# Series

Series是一维带label和index的数组。我们使用下面的方法来创建一个Series：

```
>>> s = pd.Series(data, index=index)
```

这里的data可以是Python的字典，np的ndarray，或者一个标量。

index是一个横轴label的list。接下来我们分别来看下怎么创建Series。

## 从**ndarray**创建

```
s = pd.Series(np.random.randn(5), index=['a', 'b', 'c', 'd', 'e'])

s
Out[67]: 
a   -1.300797
b   -2.044172
c   -1.170739
d   -0.445290
e    1.208784
dtype: float64
```

使用index获取index：

```
s.index
Out[68]: Index(['a', 'b', 'c', 'd', 'e'], dtype='object')
```

## 从dict创建

```
d = {'b': 1, 'a': 0, 'c': 2}

pd.Series(d)
Out[70]: 
a    0
b    1
c    2
dtype: int64
```

## 从标量创建

```
pd.Series(5., index=['a', 'b', 'c', 'd', 'e'])
Out[71]: 
a    5.0
b    5.0
c    5.0
d    5.0
e    5.0
dtype: float64
```

## Series 和 ndarray

Series和ndarray是很类似的，在Series中使用index数值表现的就像ndarray:

```
s[0]
Out[72]: -1.3007972194268396

s[:3]
Out[73]: 
a   -1.300797
b   -2.044172
c   -1.170739
dtype: float64

s[s > s.median()]
Out[74]: 
d   -0.445290
e    1.208784
dtype: float64

s[[4, 3, 1]]
Out[75]: 
e    1.208784
d   -0.445290
b   -2.044172
dtype: float64
```

## Series和dict

如果使用label来访问Series，那么它的表现就和dict很像：

```
s['a']
Out[80]: -1.3007972194268396

s['e'] = 12.

s
Out[82]: 
a    -1.300797
b    -2.044172
c    -1.170739
d    -0.445290
e    12.000000
dtype: float64
```

## 矢量化操作和标签对齐

Series可以使用更加简单的矢量化操作：

```
s + s
Out[83]: 
a    -2.601594
b    -4.088344
c    -2.341477
d    -0.890581
e    24.000000
dtype: float64

s * 2
Out[84]: 
a    -2.601594
b    -4.088344
c    -2.341477
d    -0.890581
e    24.000000
dtype: float64

np.exp(s)
Out[85]: 
a         0.272315
b         0.129487
c         0.310138
d         0.640638
e    162754.791419
dtype: float64
```

## Name属性

Series还有一个name属性，我们可以在创建的时候进行设置：

```
s = pd.Series(np.random.randn(5), name='something')

s
Out[88]: 
0    0.192272
1    0.110410
2    1.442358
3   -0.375792
4    1.228111
Name: something, dtype: float64
```

s还有一个rename方法，可以重命名s：

```
s2 = s.rename("different")
```

# **DataFrame**

DataFrame是一个二维的带label的数据结构，它是由Series组成的，你可以把DataFrame看成是一个excel表格。DataFrame可以由下面几种数据来创建：

* 一维的ndarrays, lists, dicts, 或者 Series
* 结构化数组创建
* 2维的numpy.ndarray
* 其他的DataFrame



## 从Series创建

可以从Series构成的字典中来创建DataFrame：

```
d = {'one': pd.Series([1., 2., 3.], index=['a', 'b', 'c']),'two': pd.Series([1., 2., 3., 4.], index=['a', 'b', 'c', 'd'])}

df = pd.DataFrame(d)

df
Out[92]: 
   one  two
a  1.0  1.0
b  2.0  2.0
c  3.0  3.0
d  NaN  4.0
```

进行index重排：

```
pd.DataFrame(d, index=['d', 'b', 'a'])
Out[93]: 
   one  two
d  NaN  4.0
b  2.0  2.0
a  1.0  1.0
```

进行列重排：

```
pd.DataFrame(d, index=['d', 'b', 'a'], columns=['two', 'three'])
Out[94]: 
   two three
d  4.0   NaN
b  2.0   NaN
a  1.0   NaN
```

## 从ndarrays 和 lists创建

```
d = {'one': [1., 2., 3., 4.],'two': [4., 3., 2., 1.]}

pd.DataFrame(d)
Out[96]: 
   one  two
0  1.0  4.0
1  2.0  3.0
2  3.0  2.0
3  4.0  1.0

pd.DataFrame(d, index=['a', 'b', 'c', 'd'])
Out[97]: 
   one  two
a  1.0  4.0
b  2.0  3.0
c  3.0  2.0
d  4.0  1.0
```

## 从结构化数组创建

可以从结构化数组中创建DF：

```
In [47]: data = np.zeros((2, ), dtype=[('A', 'i4'), ('B', 'f4'), ('C', 'a10')])

In [48]: data[:] = [(1, 2., 'Hello'), (2, 3., "World")]

In [49]: pd.DataFrame(data)
Out[49]: 
   A    B         C
0  1  2.0  b'Hello'
1  2  3.0  b'World'

In [50]: pd.DataFrame(data, index=['first', 'second'])
Out[50]: 
        A    B         C
first   1  2.0  b'Hello'
second  2  3.0  b'World'

In [51]: pd.DataFrame(data, columns=['C', 'A', 'B'])
Out[51]: 
          C  A    B
0  b'Hello'  1  2.0
1  b'World'  2  3.0
```

## 从字典list创建

```
In [52]: data2 = [{'a': 1, 'b': 2}, {'a': 5, 'b': 10, 'c': 20}]

In [53]: pd.DataFrame(data2)
Out[53]: 
   a   b     c
0  1   2   NaN
1  5  10  20.0

In [54]: pd.DataFrame(data2, index=['first', 'second'])
Out[54]: 
        a   b     c
first   1   2   NaN
second  5  10  20.0

In [55]: pd.DataFrame(data2, columns=['a', 'b'])
Out[55]: 
   a   b
0  1   2
1  5  10
```

## 从元组中创建

可以从元组中创建更加复杂的DF：

```
In [56]: pd.DataFrame({('a', 'b'): {('A', 'B'): 1, ('A', 'C'): 2},
   ....:               ('a', 'a'): {('A', 'C'): 3, ('A', 'B'): 4},
   ....:               ('a', 'c'): {('A', 'B'): 5, ('A', 'C'): 6},
   ....:               ('b', 'a'): {('A', 'C'): 7, ('A', 'B'): 8},
   ....:               ('b', 'b'): {('A', 'D'): 9, ('A', 'B'): 10}})
   ....: 
Out[56]: 
       a              b      
       b    a    c    a     b
A B  1.0  4.0  5.0  8.0  10.0
  C  2.0  3.0  6.0  7.0   NaN
  D  NaN  NaN  NaN  NaN   9.0
```

## 列选择，添加和删除

可以像操作Series一样操作DF：

```
In [64]: df['one']
Out[64]: 
a    1.0
b    2.0
c    3.0
d    NaN
Name: one, dtype: float64

In [65]: df['three'] = df['one'] * df['two']

In [66]: df['flag'] = df['one'] > 2

In [67]: df
Out[67]: 
   one  two  three   flag
a  1.0  1.0    1.0  False
b  2.0  2.0    4.0  False
c  3.0  3.0    9.0   True
d  NaN  4.0    NaN  False
```

可以删除特定的列，或者pop操作：

```
In [68]: del df['two']

In [69]: three = df.pop('three')

In [70]: df
Out[70]: 
   one   flag
a  1.0  False
b  2.0  False
c  3.0   True
d  NaN  False
```

如果插入常量，那么会填满整个列：

```
In [71]: df['foo'] = 'bar'

In [72]: df
Out[72]: 
   one   flag  foo
a  1.0  False  bar
b  2.0  False  bar
c  3.0   True  bar
d  NaN  False  bar
```

默认会插入到DF中最后一列，可以使用insert来指定插入到特定的列：

```
In [75]: df.insert(1, 'bar', df['one'])

In [76]: df
Out[76]: 
   one  bar   flag  foo  one_trunc
a  1.0  1.0  False  bar        1.0
b  2.0  2.0  False  bar        2.0
c  3.0  3.0   True  bar        NaN
d  NaN  NaN  False  bar        NaN
```

使用assign 可以从现有的列中衍生出新的列：

```
In [77]: iris = pd.read_csv('data/iris.data')

In [78]: iris.head()
Out[78]: 
   SepalLength  SepalWidth  PetalLength  PetalWidth         Name
0          5.1         3.5          1.4         0.2  Iris-setosa
1          4.9         3.0          1.4         0.2  Iris-setosa
2          4.7         3.2          1.3         0.2  Iris-setosa
3          4.6         3.1          1.5         0.2  Iris-setosa
4          5.0         3.6          1.4         0.2  Iris-setosa

In [79]: (iris.assign(sepal_ratio=iris['SepalWidth'] / iris['SepalLength'])
   ....:      .head())
   ....: 
Out[79]: 
   SepalLength  SepalWidth  PetalLength  PetalWidth         Name  sepal_ratio
0          5.1         3.5          1.4         0.2  Iris-setosa     0.686275
1          4.9         3.0          1.4         0.2  Iris-setosa     0.612245
2          4.7         3.2          1.3         0.2  Iris-setosa     0.680851
3          4.6         3.1          1.5         0.2  Iris-setosa     0.673913
4          5.0         3.6          1.4         0.2  Iris-setosa     0.720000
```

> 注意， assign 会创建一个新的DF，原DF保持不变。

下面用一张表来表示DF中的index和选择：

| 操作                  | 语法            | 返回结果  |
| :-------------------- | :-------------- | :-------- |
| 选择列                | `df[col]`       | Series    |
| 通过label选择行       | `df.loc[label]` | Series    |
| 通过数组选择行        | `df.iloc[loc]`  | Series    |
| 行的切片              | `df[5:10]`      | DataFrame |
| 使用boolean向量选择行 | `df[bool_vec]`  | DataFrame |


> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
