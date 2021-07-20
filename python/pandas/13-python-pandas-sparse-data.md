Pandas高级教程之:稀疏数据结构

[toc]

# 简介

如果数据中有很多NaN的值，存储起来就会浪费空间。为了解决这个问题，Pandas引入了一种叫做Sparse data的结构，来有效的存储这些NaN的值。

# Spare data的例子

我们创建一个数组，然后将其大部分数据设置为NaN，接着使用这个数组来创建SparseArray：

```
In [1]: arr = np.random.randn(10)

In [2]: arr[2:-2] = np.nan

In [3]: ts = pd.Series(pd.arrays.SparseArray(arr))

In [4]: ts
Out[4]: 
0    0.469112
1   -0.282863
2         NaN
3         NaN
4         NaN
5         NaN
6         NaN
7         NaN
8   -0.861849
9   -2.104569
dtype: Sparse[float64, nan]
```

这里的dtype类型是Sparse[float64, nan]，它的意思是数组中的nan实际上并没有存储，只有非nan的数据才被存储，并且这些数据的类型是float64.

# SparseArray

`arrays.SparseArray` 是一个  [`ExtensionArray`](https://pandas.pydata.org/docs/reference/api/pandas.api.extensions.ExtensionArray.html#pandas.api.extensions.ExtensionArray)  ，用来存储稀疏的数组类型。

```
In [13]: arr = np.random.randn(10)

In [14]: arr[2:5] = np.nan

In [15]: arr[7:8] = np.nan

In [16]: sparr = pd.arrays.SparseArray(arr)

In [17]: sparr
Out[17]: 
[-1.9556635297215477, -1.6588664275960427, nan, nan, nan, 1.1589328886422277, 0.14529711373305043, nan, 0.6060271905134522, 1.3342113401317768]
Fill: nan
IntIndex
Indices: array([0, 1, 5, 6, 8, 9], dtype=int32)
```

使用 **numpy.asarray()**  可以将其转换为普通的数组：

```
In [18]: np.asarray(sparr)
Out[18]: 
array([-1.9557, -1.6589,     nan,     nan,     nan,  1.1589,  0.1453,
           nan,  0.606 ,  1.3342])
```

# SparseDtype

 SparseDtype 表示的是Spare类型。它包含两种信息，第一种是非NaN值的数据类型，第二种是填充时候的常量值，比如nan：

```
In [19]: sparr.dtype
Out[19]: Sparse[float64, nan]
```

可以像下面这样构造一个SparseDtype：

```
In [20]: pd.SparseDtype(np.dtype('datetime64[ns]'))
Out[20]: Sparse[datetime64[ns], NaT]
```

可以指定填充的值：

```
In [21]: pd.SparseDtype(np.dtype('datetime64[ns]'),
   ....:                fill_value=pd.Timestamp('2017-01-01'))
   ....: 
Out[21]: Sparse[datetime64[ns], Timestamp('2017-01-01 00:00:00')]
```

# Sparse的属性

可以通过 .sparse 来访问sparse：

```
In [23]: s = pd.Series([0, 0, 1, 2], dtype="Sparse[int]")

In [24]: s.sparse.density
Out[24]: 0.5

In [25]: s.sparse.fill_value
Out[25]: 0
```

# Sparse的计算

np的计算函数可以直接用在SparseArray中，并且会返回一个SparseArray。

```
In [26]: arr = pd.arrays.SparseArray([1., np.nan, np.nan, -2., np.nan])

In [27]: np.abs(arr)
Out[27]: 
[1.0, nan, nan, 2.0, nan]
Fill: nan
IntIndex
Indices: array([0, 3], dtype=int32)
```

# SparseSeries 和 SparseDataFrame

 SparseSeries 和 SparseDataFrame在1.0.0 的版本时候被删除了。取代他们的是功能更强的SparseArray。

看下两者的使用上的区别：

```
# Previous way
>>> pd.SparseDataFrame({"A": [0, 1]})
```

```
# New way
In [31]: pd.DataFrame({"A": pd.arrays.SparseArray([0, 1])})
Out[31]: 
   A
0  0
1  1
```

如果是SciPy 中的sparse 矩阵，那么可以使用 DataFrame.sparse.from_spmatrix() ：

```
# Previous way
>>> from scipy import sparse
>>> mat = sparse.eye(3)
>>> df = pd.SparseDataFrame(mat, columns=['A', 'B', 'C'])
```

```
# New way
In [32]: from scipy import sparse

In [33]: mat = sparse.eye(3)

In [34]: df = pd.DataFrame.sparse.from_spmatrix(mat, columns=['A', 'B', 'C'])

In [35]: df.dtypes
Out[35]: 
A    Sparse[float64, 0]
B    Sparse[float64, 0]
C    Sparse[float64, 0]
dtype: object
```