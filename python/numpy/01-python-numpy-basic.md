NumPy之:NumPy简介教程

[toc]

# 简介

NumPy是一个开源的Python库，主要用在数据分析和科学计算，基本上可以把NumPy看做是Python数据计算的基础，因为很多非常优秀的数据分析和机器学习框架底层使用的都是NumPy。比如：Pandas, SciPy, Matplotlib, scikit-learn, scikit-image 等。

NumPy库主要包含多维数组和矩阵数据结构。 它为ndarray（一个n维数组对象）提供了对其进行有效操作的方法。 NumPy可以用于对数组执行各种数学运算。 并且提供了可在这些数组和矩阵上运行的庞大的高级数学函数库。

# 安装NumPy

有很多方式可以按照NumPy：

~~~pyton
pip install numpy
~~~

如果你使用的是conda，那么可以：

~~~python
conda install numpy
~~~

或者直接使用Anaconda. 它是一系列数据分析包的集合。

# Array和List

Python中有一个数据类型叫做List，list中可以存储不同种类的对象。在应用程序中这样做没有什么问题，但是如果是在科学计算中，我们希望一个数组中的元素类型必须是一致的，所以有了NumPy中的Array。

NumPy可以快速的创建Array，并且对其中的数据进行操作。

NumPy中的Array要比Python中的List要快得多，并且占用更少的内存空间。

看下两者之间的性能差异：

~~~python
In [1]: import numpy as np
   ...: my_arr = np.arange(1000000)
   ...: my_list = list(range(1000000))
   ...: %time for _ in range(10): my_arr2 = my_arr * 2
   ...: %time for _ in range(10): my_list2 = [x * 2 for x in my_list]
   ...:
CPU times: user 12.3 ms, sys: 7.88 ms, total: 20.2 ms
Wall time: 21.4 ms
CPU times: user 580 ms, sys: 172 ms, total: 752 ms
Wall time: 780 ms
~~~

上面的例子对一个包含一百万的数据进行乘2操作，可以看到，使用NumPy的效率是Python的几十倍，如果在大型数据项目中这个效率会造成非常大的性能影响。

## 创建Array

上面的例子中，我们已经创建了一个array，使用的是np.arange方法。

我们还可以通过List来创建Array，List可以是一维列表，也可以是多维列表：

~~~python
>>> a = np.array([1, 2, 3, 4, 5, 6])

>>> a = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
~~~

和List一样，Array也可以通过index来访问：

~~~python
>>> print(a[0])
[1 2 3 4]
~~~

接下来我们介绍几个常用的名词：

* **vector**  — 表示的是一维数组
* **matrix** — 表示的是二维数组
* **tensor** — 表示的是三维或者更高维度的数组

在NumPy中维度也被称之为 **axes** 。

下面我们来看下其他几种创建Array的方法：

最简单的就是np.array，之前的例子中我们已经提到过了。

如果要快速的创建都是0 的数组，我们可以使用zeros：

~~~python
>>> np.zeros(2)
array([0., 0.])
~~~

或者都填充为1：

~~~python
>>> np.ones(2)
array([1., 1.])
~~~

还可以创建空的数组：

~~~python
In [2]: np.empty(2)
Out[2]: array([0.        , 2.00389455])
~~~

> 注意，empty方法中的内容并不一定是空的，而是随机填充数据，所以我们在使用empty创建数组之后，一定要记得覆盖其中的内容。使用empty的好处就是创建的速度比较快。

还可以在range范围内填充数组：

~~~python
In [3]: np.arange(10)
Out[3]: array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
~~~

可以指定间隔：

~~~python
In [4]: np.arange(1,10,2)
Out[4]: array([1, 3, 5, 7, 9])
~~~

使用linspace可以创建等分的数组：

~~~Python
In [5]: np.linspace(0, 10, num=5)
Out[5]: array([ 0. ,  2.5,  5. ,  7.5, 10. ])
~~~

默认情况下创建的数组内容类型是np.float64，我们还可以将其切换成整数：np.int64

~~~python
In [6]: x = np.ones(2, dtype=np.int64)

In [7]: x
Out[7]: array([1, 1])
~~~

# Array操作

## sort

我们可以使用sort对数组进行排序：

~~~Python
In [8]: arr = np.array([2, 1, 5, 3, 7, 4, 6, 8])

In [10]: np.sort(arr)
Out[10]: array([1, 2, 3, 4, 5, 6, 7, 8])
~~~

==sort==是对Array中的元素进行排序， 除了sort之外还有其他的一些排序的方法。

还可以使用argsort，argsort是一种间接排序的方法，他返回的是排序好的原数组的index：

~~~python
In [11]: x = np.array([10, 5, 6])

In [12]: np.argsort(x)
Out[12]: array([1, 2, 0])
~~~

上面我们对array进行==argsort==，排序之后应该返回，5，6，10。 5的index是1，6 的index是2，10的index是0，所以返回1，2，0。

==lexsort==和argsort一样都是间接排序法，返回的都是排序过后的index，不同是lexsort 可以进行多key的排序。

~~~python
surnames =    ('Hertz',    'Galilei', 'Hertz')
first_names = ('Heinrich', 'Galileo', 'Gustav')
ind = np.lexsort((first_names, surnames))
ind
array([1, 2, 0])
~~~

上面的lexsort是先按照surnames排序，然后再按照first_names进行排序。

> lexsort 的排序顺序是从后到前。也就是最后一个传入的key最先排序。

==searchsorted==用来查找要插入元素的index值，举个例子：

~~~Python
np.searchsorted([1,2,3,4,5], 3)
2
np.searchsorted([1,2,3,4,5], 3, side='right')
3
np.searchsorted([1,2,3,4,5], [-10, 10, 2, 3])
array([0, 5, 1, 2])
~~~

==partition==是对要排序的数据进行分割，举个例子：

~~~python
a = np.array([3, 4, 2, 1])
np.partition(a, 3)
array([2, 1, 3, 4])
~~~

第一个参数是一个Array，第二个参数是要分隔的基准元素，这个基准元素的位置和排序过后的位置是一样的，其他的元素比基准元素小的放在前面，比基准元素大的放在后面。

还可以按照多个元素进行分割：

~~~python
np.partition(a, (1, 3))
array([1, 2, 3, 4])
~~~

## concatenate

concatenate用来连接多个数组。

~~~python
>>> a = np.array([1, 2, 3, 4])
>>> b = np.array([5, 6, 7, 8])

>>> np.concatenate((a, b))
array([1, 2, 3, 4, 5, 6, 7, 8])
~~~

还可以连接多维数组：

~~~python
>>> x = np.array([[1, 2], [3, 4]])
>>> y = np.array([[5, 6]])
>>> np.concatenate((x, y), axis=0)
array([[1, 2],
       [3, 4],
       [5, 6]])
~~~

## 统计信息

 `ndarray.ndim` 用来统计数组的维数：

~~~python
>>> array_example = np.array([[[0, 1, 2, 3],
...                            [4, 5, 6, 7]],
...
...                           [[0, 1, 2, 3],
...                            [4, 5, 6, 7]],
...
...                           [[0 ,1 ,2, 3],
...                            [4, 5, 6, 7]]])
~~~

```
>>> array_example.ndim
3
```

 `ndarray.size` 用来统计数组中的元素个数：

~~~python
>>> array_example.size
24
~~~

`ndarray.shape` 输出数组的形状：

~~~python
>>> array_example.shape
(3, 2, 4)
~~~

说明上面的数组是一个3 * 2 * 4 的数组。

## reshape

使用reshape可以重新构造一个数组。

~~~python
>>> a = np.arange(6)
>>> print(a)
[0 1 2 3 4 5]

>>> b = a.reshape(3, 2)
>>> print(b)
[[0 1]
 [2 3]
 [4 5]]
~~~

上面我们将一个一维的数组转成了一个3* 2 的数组。

reshape还可以接受多个参数：

~~~python
>>> numpy.reshape(a, newshape=(1, 6), order='C')
array([[0, 1, 2, 3, 4, 5]])
~~~

第一个参数是要重构的数组，第二个参数新的shape，order可以取三个值，C，F或者A。

C表示按照C的index方式进行排序，F表示按照Fortran的index方式进行排序。A表示自动选择。

在Fortran中，当移动存储在内存中的二维数组的元素时，第一个索引是变化最快的索引。 当第一个索引更改时移动到下一行时，矩阵一次存储一列。另一方面，在C中，最后一个索引变化最快。 

## 增加维度

np.newaxis可以给现有的数组增加一个维度：

~~~python
>>> a = np.array([1, 2, 3, 4, 5, 6])
>>> a.shape
(6,)

>>> a2 = a[np.newaxis, :]
>>> a2.shape
(1, 6)

>>> col_vector = a[:, np.newaxis]
>>> col_vector.shape
(6, 1)
~~~

还可以使用expand_dims来指定axis的位置：

~~~python
>>> b = np.expand_dims(a, axis=1)
>>> b.shape
(6, 1)

>>> c = np.expand_dims(a, axis=0)
>>> c.shape
(1, 6)

~~~

## index和切片

数组的index和切片跟Python中的list是类似的：

~~~Python
>>> data = np.array([1, 2, 3])

>>> data[1]
2
>>> data[0:2]
array([1, 2])
>>> data[1:]
array([2, 3])
>>> data[-2:]
array([2, 3])
~~~

除此之外，数组还支持更多更强大的index操作：

~~~python
>>> a = np.array([[1 , 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])

>>> print(a[a < 5])
[1 2 3 4]
~~~

上面我们找出了a中所有元素小于5的值。

~~~python
In [20]: a<5
Out[20]:
array([[ True,  True,  True,  True],
       [False, False, False, False],
       [False, False, False, False]])
~~~

可以看到a< 5 其实返回的也是一个数组，这个数组的元素shape和原数组是一样的，只不过里面的值是true和false，表示是否应该被选择出来。

同样的，我们可以挑出所有大于5的元素：

~~~python
>>> five_up = (a >= 5)
>>> print(a[five_up])
[ 5  6  7  8  9 10 11 12]
~~~

选出所有可以被2整除的数：

~~~python
>>> divisible_by_2 = a[a%2==0]
>>> print(divisible_by_2)
[ 2  4  6  8 10 12]
~~~

还可以使用 &  和 | 运算符：

~~~python
>>> c = a[(a > 2) & (a < 11)]
>>> print(c)
[ 3  4  5  6  7  8  9 10]
~~~

还可以使用nonzero来打印出满足条件的index信息：

~~~python
In [23]: a = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])

In [24]: b = np.nonzero(a < 5)

In [25]: b
Out[25]: (array([0, 0, 0, 0]), array([0, 1, 2, 3]))
  
>>> print(a[b])
[1 2 3 4]
~~~

上面返回的元组中，第一个值表示的是行号，第二个值表示的是列。

## 从现有数据中创建Array

我们可以使用 slicing , indexing,np.vstack(),np.hstack(),np.hsplit(),.view(),copy() 来从现有数据中创建Array。

前面的例子中，我们看到可以使用List和切片来创建新的数组：

~~~python
>>> a = np.array([1,  2,  3,  4,  5,  6,  7,  8,  9, 10])
>>> arr1 = a[3:8]
>>> arr1
array([4, 5, 6, 7, 8])
~~~

两个现有的数组可以进行垂直或者水平堆叠：

~~~python
>>> a1 = np.array([[1, 1],
...                [2, 2]])

>>> a2 = np.array([[3, 3],
...                [4, 4]])

>>> np.vstack((a1, a2))
array([[1, 1],
       [2, 2],
       [3, 3],
       [4, 4]])

>>> np.hstack((a1, a2))
array([[1, 1, 3, 3],
       [2, 2, 4, 4]])
~~~

使用hsplit 可以将大的数组分割成为几个小的数组：

~~~python
>>> x = np.arange(1, 25).reshape(2, 12)
>>> x
array([[ 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12],
       [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]])

>>> np.hsplit(x, 3)
[array([[1,  2,  3,  4],
        [13, 14, 15, 16]]), array([[ 5,  6,  7,  8],
        [17, 18, 19, 20]]), array([[ 9, 10, 11, 12],
        [21, 22, 23, 24]])]

~~~

## 算数运算

array的加法：

```
>>> data = np.array([1, 2])
>>> ones = np.ones(2, dtype=int)
>>> data + ones
array([2, 3])
```

其他的运算：

```
>>> data - ones
array([0, 1])
>>> data * data
array([1, 4])
>>> data / data
array([1., 1.])
```

array求和：

```
>>> a = np.array([1, 2, 3, 4])

>>> a.sum()
10
```

如果是求和多维数组的话，需要指定维度：

~~~python
>>> b = np.array([[1, 1], [2, 2]])
>>> b.sum(axis=0)
array([3, 3])

>>> b.sum(axis=1)
array([2, 4])
~~~

## 其他有用操作

这里列出了其他的有用操作：

~~~python
>>> data.max()
2.0
>>> data.min()
1.0
>>> data.sum()
3.0
~~~

对于二维数组来说，sum默认会求和所有的元素，min也会从所有元素中查找最小的：

~~~python
>>> a = np.array([[0.45053314, 0.17296777, 0.34376245, 0.5510652],
...               [0.54627315, 0.05093587, 0.40067661, 0.55645993],
...               [0.12697628, 0.82485143, 0.26590556, 0.56917101]])

>>> a.sum()
4.8595784

>>> a.min()
0.05093587
~~~

我们还可以指定维度：

~~~python
>>> a.min(axis=0)
array([0.12697628, 0.05093587, 0.26590556, 0.5510652 ])
~~~

# 矩阵

矩阵就是 2 * 2 的数组：

~~~python
>>> data = np.array([[1, 2], [3, 4]])
>>> data
array([[1, 2],
       [3, 4]])
~~~

矩阵同样可以进行统计操作：

~~~python
>>> data.max()
4
>>> data.min()
1
>>> data.sum()
10
~~~

默认情况是累加所有的元素，我们也可以指定特定的累加维度：

~~~python
>>> data.max(axis=0)
array([3, 4])
>>> data.max(axis=1)
array([2, 4])
~~~

矩阵的运算：

~~~python
>>> data = np.array([[1, 2], [3, 4]])
>>> ones = np.array([[1, 1], [1, 1]])
>>> data + ones
array([[2, 3],
       [4, 5]])
~~~

如果是多维的和低维的进行运算，那么将会使用内置的broadcast机制，将低维的进行广播：

~~~python
>>> data = np.array([[1, 2], [3, 4], [5, 6]])
>>> ones_row = np.array([[1, 1]])
>>> data + ones_row
array([[2, 3],
       [4, 5],
       [6, 7]])
~~~

# 生成随机数

在机器学习中，生成随机数是一个非常重要的功能。我们看下如何在Numpy中生成随机数。

```
>>> rng = np.random.default_rng(0)
>>> rng.random(3)
array([0.63696169, 0.26978671, 0.04097352])

>>> rng.random((3, 2))
array([[0.01652764, 0.81327024],
       [0.91275558, 0.60663578],
       [0.72949656, 0.54362499]])  # may vary
       
>>> rng.integers(5, size=(2, 4))
array([[2, 1, 1, 0],
       [0, 0, 0, 4]])  # may vary
```

# unique

 `np.unique`可以统计数组的唯一值：

~~~Python
>>> a = np.array([11, 11, 12, 13, 14, 15, 16, 17, 12, 13, 11, 14, 18, 19, 20])

>>> unique_values = np.unique(a)
>>> print(unique_values)
[11 12 13 14 15 16 17 18 19 20]
~~~

还可以返回index或者count：

```
>>> unique_values, indices_list = np.unique(a, return_index=True)
>>> print(indices_list)
[ 0  2  3  4  5  6  7 12 13 14]
```

```
>>> unique_values, occurrence_count = np.unique(a, return_counts=True)
>>> print(occurrence_count)
[3 2 2 2 1 1 1 1 1 1]
```

对矩阵也适用：

```
>>> a_2d = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [1, 2, 3, 4]])

>>> unique_values = np.unique(a_2d)
>>> print(unique_values)
[ 1  2  3  4  5  6  7  8  9 10 11 12]
```

如果想得到唯一的行或者列，可以传入axis参数：

~~~python
>>> unique_rows = np.unique(a_2d, axis=0)
>>> print(unique_rows)
[[ 1  2  3  4]
 [ 5  6  7  8]
 [ 9 10 11 12]]
~~~

# 矩阵变换

我们可以使用transpose来把矩阵的行和列进行调换：

~~~python
>>> arr = np.arange(6).reshape((2, 3))
>>> arr
array([[0, 1, 2],
       [3, 4, 5]])

>>> arr.transpose()
array([[0, 3],
       [1, 4],
       [2, 5]])
~~~

# 反转数组

使用flip可以反转数组：

```
>>> arr = np.array([1, 2, 3, 4, 5, 6, 7, 8])
>>> reversed_arr = np.flip(arr)
>>> print('Reversed Array: ', reversed_arr)
Reversed Array:  [8 7 6 5 4 3 2 1]
```

如果是2维的数组：

~~~Python
>>> arr_2d = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])

>>> reversed_arr = np.flip(arr_2d)
>>> print(reversed_arr)
[[12 11 10  9]
 [ 8  7  6  5]
 [ 4  3  2  1]]
~~~

默认会反转行和列，我们也可以只反转行或者列：

~~~python
>>> reversed_arr_rows = np.flip(arr_2d, axis=0)
>>> print(reversed_arr_rows)
[[ 9 10 11 12]
 [ 5  6  7  8]
 [ 1  2  3  4]]

>>> reversed_arr_columns = np.flip(arr_2d, axis=1)
>>> print(reversed_arr_columns)
[[ 4  3  2  1]
 [ 8  7  6  5]
 [12 11 10  9]]
~~~

还可以只反转一行或者一列：

~~~python

>>> arr_2d[1] = np.flip(arr_2d[1])
>>> print(arr_2d)
[[ 1  2  3  4]
 [ 8  7  6  5]
 [ 9 10 11 12]]

>>> arr_2d[:,1] = np.flip(arr_2d[:,1])
>>> print(arr_2d)
[[ 1 10  3  4]
 [ 8  7  6  5]
 [ 9  2 11 12]]
~~~

# flatten 和 ravel

flatten 可以将数组变成一维的：

~~~Python
>>> x = np.array([[1 , 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])

>>> x.flatten()
array([ 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12])
~~~

flatten之后的数组和原数组是无关的，我们修改flatten之后的数组不会改变之前的数组内容：

~~~Python
>>> a1 = x.flatten()
>>> a1[0] = 99
>>> print(x)  # Original array
[[ 1  2  3  4]
 [ 5  6  7  8]
 [ 9 10 11 12]]
>>> print(a1)  # New array
[99  2  3  4  5  6  7  8  9 10 11 12]
~~~

但是如果使用ravel，对新数组的修改同样也会改变原始数组：

~~~python
>>> a2 = x.ravel()
>>> a2[0] = 98
>>> print(x)  # Original array
[[98  2  3  4]
 [ 5  6  7  8]
 [ 9 10 11 12]]
>>> print(a2)  # New array
[98  2  3  4  5  6  7  8  9 10 11 12]
~~~

# save 和 load

NumPy 的对象可以通过save和load存放到文件和从文件中加载：

~~~python
>>> a = np.array([1, 2, 3, 4, 5, 6])

>>> np.save('filename', a)

>>> b = np.load('filename.npy')
~~~

如果想以文本的方式来存储，那么可以使用np.savetxt：

~~~Python
>>> csv_arr = np.array([1, 2, 3, 4, 5, 6, 7, 8])

>>> np.savetxt('new_file.csv', csv_arr)

>>> np.loadtxt('new_file.csv')
array([1., 2., 3., 4., 5., 6., 7., 8.])
~~~

# CSV

NumPy有专门的方法来对CSV文件进行操作：

~~~python
>>> import pandas as pd

>>> # If all of your columns are the same type:
>>> x = pd.read_csv('music.csv', header=0).values
>>> print(x)
[['Billie Holiday' 'Jazz' 1300000 27000000]
 ['Jimmie Hendrix' 'Rock' 2700000 70000000]
 ['Miles Davis' 'Jazz' 1500000 48000000]
 ['SIA' 'Pop' 2000000 74000000]]

>>> # You can also simply select the columns you need:
>>> x = pd.read_csv('music.csv', usecols=['Artist', 'Plays']).values
>>> print(x)
[['Billie Holiday' 27000000]
 ['Jimmie Hendrix' 70000000]
 ['Miles Davis' 48000000]
 ['SIA' 74000000]]
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！