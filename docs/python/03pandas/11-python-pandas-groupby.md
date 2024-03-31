---
slug: /11-python-pandas-groupby
---

# 11. Pandas高级教程之:GroupBy用法



# 简介

pandas中的DF数据类型可以像数据库表格一样进行groupby操作。通常来说groupby操作可以分为三部分：分割数据，应用变换和和合并数据。

本文将会详细讲解Pandas中的groupby操作。

# 分割数据

分割数据的目的是将DF分割成为一个个的group。为了进行groupby操作，在创建DF的时候需要指定相应的label：

```
df = pd.DataFrame(
   ...:     {
   ...:         "A": ["foo", "bar", "foo", "bar", "foo", "bar", "foo", "foo"],
   ...:         "B": ["one", "one", "two", "three", "two", "two", "one", "three"],
   ...:         "C": np.random.randn(8),
   ...:         "D": np.random.randn(8),
   ...:     }
   ...: )
   ...:

df
Out[61]: 
     A      B         C         D
0  foo    one -0.490565 -0.233106
1  bar    one  0.430089  1.040789
2  foo    two  0.653449 -1.155530
3  bar  three -0.610380 -0.447735
4  foo    two -0.934961  0.256358
5  bar    two -0.256263 -0.661954
6  foo    one -1.132186 -0.304330
7  foo  three  2.129757  0.445744
```

默认情况下，groupby的轴是x轴。可以一列group，也可以多列group：

```
In [8]: grouped = df.groupby("A")

In [9]: grouped = df.groupby(["A", "B"])
```

## 多index

在*0.24*版本中，如果我们有多index，可以从中选择特定的index进行group：

```
In [10]: df2 = df.set_index(["A", "B"])

In [11]: grouped = df2.groupby(level=df2.index.names.difference(["B"]))

In [12]: grouped.sum()
Out[12]: 
            C         D
A                      
bar -1.591710 -1.739537
foo -0.752861 -1.402938
```

##  get_group

get_group 可以获取分组之后的数据：

```
In [24]: df3 = pd.DataFrame({"X": ["A", "B", "A", "B"], "Y": [1, 4, 3, 2]})

In [25]: df3.groupby(["X"]).get_group("A")
Out[25]: 
   X  Y
0  A  1
2  A  3

In [26]: df3.groupby(["X"]).get_group("B")
Out[26]: 
   X  Y
1  B  4
3  B  2
```

## dropna

默认情况下，NaN数据会被排除在groupby之外，通过设置 dropna=False 可以允许NaN数据：

```
In [27]: df_list = [[1, 2, 3], [1, None, 4], [2, 1, 3], [1, 2, 2]]

In [28]: df_dropna = pd.DataFrame(df_list, columns=["a", "b", "c"])

In [29]: df_dropna
Out[29]: 
   a    b  c
0  1  2.0  3
1  1  NaN  4
2  2  1.0  3
3  1  2.0  2
```

```
# Default ``dropna`` is set to True, which will exclude NaNs in keys
In [30]: df_dropna.groupby(by=["b"], dropna=True).sum()
Out[30]: 
     a  c
b        
1.0  2  3
2.0  2  5

# In order to allow NaN in keys, set ``dropna`` to False
In [31]: df_dropna.groupby(by=["b"], dropna=False).sum()
Out[31]: 
     a  c
b        
1.0  2  3
2.0  2  5
NaN  1  4
```

## groups属性

groupby对象有个groups属性，它是一个key-value字典，key是用来分类的数据，value是分类对应的值。

```
In [34]: grouped = df.groupby(["A", "B"])

In [35]: grouped.groups
Out[35]: {('bar', 'one'): [1], ('bar', 'three'): [3], ('bar', 'two'): [5], ('foo', 'one'): [0, 6], ('foo', 'three'): [7], ('foo', 'two'): [2, 4]}

In [36]: len(grouped)
Out[36]: 6
```

## index的层级

对于多级index对象，groupby可以指定group的index层级：

```
In [40]: arrays = [
   ....:     ["bar", "bar", "baz", "baz", "foo", "foo", "qux", "qux"],
   ....:     ["one", "two", "one", "two", "one", "two", "one", "two"],
   ....: ]
   ....: 

In [41]: index = pd.MultiIndex.from_arrays(arrays, names=["first", "second"])

In [42]: s = pd.Series(np.random.randn(8), index=index)

In [43]: s
Out[43]: 
first  second
bar    one      -0.919854
       two      -0.042379
baz    one       1.247642
       two      -0.009920
foo    one       0.290213
       two       0.495767
qux    one       0.362949
       two       1.548106
dtype: float64
```

group第一级：

```
In [44]: grouped = s.groupby(level=0)

In [45]: grouped.sum()
Out[45]: 
first
bar   -0.962232
baz    1.237723
foo    0.785980
qux    1.911055
dtype: float64
```

group第二级：

```
In [46]: s.groupby(level="second").sum()
Out[46]: 
second
one    0.980950
two    1.991575
dtype: float64
```

# group的遍历

得到group对象之后，我们可以通过for语句来遍历group：

```
In [62]: grouped = df.groupby('A')

In [63]: for name, group in grouped:
   ....:     print(name)
   ....:     print(group)
   ....: 
bar
     A      B         C         D
1  bar    one  0.254161  1.511763
3  bar  three  0.215897 -0.990582
5  bar    two -0.077118  1.211526
foo
     A      B         C         D
0  foo    one -0.575247  1.346061
2  foo    two -1.143704  1.627081
4  foo    two  1.193555 -0.441652
6  foo    one -0.408530  0.268520
7  foo  three -0.862495  0.024580
```

如果是多字段group，group的名字是一个元组：

```
In [64]: for name, group in df.groupby(['A', 'B']):
   ....:     print(name)
   ....:     print(group)
   ....: 
('bar', 'one')
     A    B         C         D
1  bar  one  0.254161  1.511763
('bar', 'three')
     A      B         C         D
3  bar  three  0.215897 -0.990582
('bar', 'two')
     A    B         C         D
5  bar  two -0.077118  1.211526
('foo', 'one')
     A    B         C         D
0  foo  one -0.575247  1.346061
6  foo  one -0.408530  0.268520
('foo', 'three')
     A      B         C        D
7  foo  three -0.862495  0.02458
('foo', 'two')
     A    B         C         D
2  foo  two -1.143704  1.627081
4  foo  two  1.193555 -0.441652
```

# 聚合操作

分组之后，就可以进行聚合操作：

```
In [67]: grouped = df.groupby("A")

In [68]: grouped.aggregate(np.sum)
Out[68]: 
            C         D
A                      
bar  0.392940  1.732707
foo -1.796421  2.824590

In [69]: grouped = df.groupby(["A", "B"])

In [70]: grouped.aggregate(np.sum)
Out[70]: 
                  C         D
A   B                        
bar one    0.254161  1.511763
    three  0.215897 -0.990582
    two   -0.077118  1.211526
foo one   -0.983776  1.614581
    three -0.862495  0.024580
    two    0.049851  1.185429
```

对于多index数据来说，默认返回值也是多index的。如果想使用新的index，可以添加 as_index = False：

```
In [71]: grouped = df.groupby(["A", "B"], as_index=False)

In [72]: grouped.aggregate(np.sum)
Out[72]: 
     A      B         C         D
0  bar    one  0.254161  1.511763
1  bar  three  0.215897 -0.990582
2  bar    two -0.077118  1.211526
3  foo    one -0.983776  1.614581
4  foo  three -0.862495  0.024580
5  foo    two  0.049851  1.185429

In [73]: df.groupby("A", as_index=False).sum()
Out[73]: 
     A         C         D
0  bar  0.392940  1.732707
1  foo -1.796421  2.824590
```

上面的效果等同于reset_index 

```
In [74]: df.groupby(["A", "B"]).sum().reset_index()
```

 grouped.size() 计算group的大小：

```
In [75]: grouped.size()
Out[75]: 
     A      B  size
0  bar    one     1
1  bar  three     1
2  bar    two     1
3  foo    one     2
4  foo  three     1
5  foo    two     2
```

 grouped.describe() 描述group的信息：

```
In [76]: grouped.describe()
Out[76]: 
      C                                                    ...         D                                                  
  count      mean       std       min       25%       50%  ...       std       min       25%       50%       75%       max
0   1.0  0.254161       NaN  0.254161  0.254161  0.254161  ...       NaN  1.511763  1.511763  1.511763  1.511763  1.511763
1   1.0  0.215897       NaN  0.215897  0.215897  0.215897  ...       NaN -0.990582 -0.990582 -0.990582 -0.990582 -0.990582
2   1.0 -0.077118       NaN -0.077118 -0.077118 -0.077118  ...       NaN  1.211526  1.211526  1.211526  1.211526  1.211526
3   2.0 -0.491888  0.117887 -0.575247 -0.533567 -0.491888  ...  0.761937  0.268520  0.537905  0.807291  1.076676  1.346061
4   1.0 -0.862495       NaN -0.862495 -0.862495 -0.862495  ...       NaN  0.024580  0.024580  0.024580  0.024580  0.024580
5   2.0  0.024925  1.652692 -1.143704 -0.559389  0.024925  ...  1.462816 -0.441652  0.075531  0.592714  1.109898  1.627081

[6 rows x 16 columns]
```

## 通用聚合方法

下面是通用的聚合方法：

| 函数         | 描述            |
| :----------- | :-------------- |
| `mean()`     | 平均值          |
| `sum()`      | 求和            |
| `size()`     | 计算size        |
| `count()`    | group的统计     |
| `std()`      | 标准差          |
| `var()`      | 方差            |
| `sem()`      | 均值的标准误    |
| `describe()` | 统计信息描述    |
| `first()`    | 第一个group值   |
| `last()`     | 最后一个group值 |
| `nth()`      | 第n个group值    |
| `min()`      | 最小值          |
| `max()`      | 最大值          |

## 同时使用多个聚合方法

可以同时指定多个聚合方法：

```
In [81]: grouped = df.groupby("A")

In [82]: grouped["C"].agg([np.sum, np.mean, np.std])
Out[82]: 
          sum      mean       std
A                                
bar  0.392940  0.130980  0.181231
foo -1.796421 -0.359284  0.912265
```

可以重命名：

```
In [84]: (
   ....:     grouped["C"]
   ....:     .agg([np.sum, np.mean, np.std])
   ....:     .rename(columns={"sum": "foo", "mean": "bar", "std": "baz"})
   ....: )
   ....: 
Out[84]: 
          foo       bar       baz
A                                
bar  0.392940  0.130980  0.181231
foo -1.796421 -0.359284  0.912265
```

## NamedAgg

 NamedAgg 可以对聚合进行更精准的定义，它包含 column 和aggfunc 两个定制化的字段。

```
In [88]: animals = pd.DataFrame(
   ....:     {
   ....:         "kind": ["cat", "dog", "cat", "dog"],
   ....:         "height": [9.1, 6.0, 9.5, 34.0],
   ....:         "weight": [7.9, 7.5, 9.9, 198.0],
   ....:     }
   ....: )
   ....: 

In [89]: animals
Out[89]: 
  kind  height  weight
0  cat     9.1     7.9
1  dog     6.0     7.5
2  cat     9.5     9.9
3  dog    34.0   198.0

In [90]: animals.groupby("kind").agg(
   ....:     min_height=pd.NamedAgg(column="height", aggfunc="min"),
   ....:     max_height=pd.NamedAgg(column="height", aggfunc="max"),
   ....:     average_weight=pd.NamedAgg(column="weight", aggfunc=np.mean),
   ....: )
   ....: 
Out[90]: 
      min_height  max_height  average_weight
kind                                        
cat          9.1         9.5            8.90
dog          6.0        34.0          102.75
```

或者直接使用一个元组：

```
In [91]: animals.groupby("kind").agg(
   ....:     min_height=("height", "min"),
   ....:     max_height=("height", "max"),
   ....:     average_weight=("weight", np.mean),
   ....: )
   ....: 
Out[91]: 
      min_height  max_height  average_weight
kind                                        
cat          9.1         9.5            8.90
dog          6.0        34.0          102.75
```

## 不同的列指定不同的聚合方法

通过给agg方法传入一个字典，可以指定不同的列使用不同的聚合：

```
In [95]: grouped.agg({"C": "sum", "D": "std"})
Out[95]: 
            C         D
A                      
bar  0.392940  1.366330
foo -1.796421  0.884785
```

# 转换操作

转换是将对象转换为同样大小对象的操作。在数据分析的过程中，经常需要进行数据的转换操作。

可以接lambda操作：

```
In [112]: ts.groupby(lambda x: x.year).transform(lambda x: x.max() - x.min())
```

填充na值：

```
In [121]: transformed = grouped.transform(lambda x: x.fillna(x.mean()))
```

# 过滤操作

filter方法可以通过lambda表达式来过滤我们不需要的数据：

```
In [136]: sf = pd.Series([1, 1, 2, 3, 3, 3])

In [137]: sf.groupby(sf).filter(lambda x: x.sum() > 2)
Out[137]: 
3    3
4    3
5    3
dtype: int64
```

# Apply操作

有些数据可能不适合进行聚合或者转换操作，Pandas提供了一个 `apply` 方法，用来进行更加灵活的转换操作。

```
In [156]: df
Out[156]: 
     A      B         C         D
0  foo    one -0.575247  1.346061
1  bar    one  0.254161  1.511763
2  foo    two -1.143704  1.627081
3  bar  three  0.215897 -0.990582
4  foo    two  1.193555 -0.441652
5  bar    two -0.077118  1.211526
6  foo    one -0.408530  0.268520
7  foo  three -0.862495  0.024580

In [157]: grouped = df.groupby("A")

# could also just call .describe()
In [158]: grouped["C"].apply(lambda x: x.describe())
Out[158]: 
A         
bar  count    3.000000
     mean     0.130980
     std      0.181231
     min     -0.077118
     25%      0.069390
                ...   
foo  min     -1.143704
     25%     -0.862495
     50%     -0.575247
     75%     -0.408530
     max      1.193555
Name: C, Length: 16, dtype: float64
```

可以外接函数：

```
In [159]: grouped = df.groupby('A')['C']

In [160]: def f(group):
   .....:     return pd.DataFrame({'original': group,
   .....:                          'demeaned': group - group.mean()})
   .....: 

In [161]: grouped.apply(f)
Out[161]: 
   original  demeaned
0 -0.575247 -0.215962
1  0.254161  0.123181
2 -1.143704 -0.784420
3  0.215897  0.084917
4  1.193555  1.552839
5 -0.077118 -0.208098
6 -0.408530 -0.049245
7 -0.862495 -0.503211
```
