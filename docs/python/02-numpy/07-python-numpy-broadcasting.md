---
slug: /07-python-numpy-broadcasting
---

# 7. NumPy之:理解广播



# 简介

广播描述的是NumPy如何计算不同形状的数组之间的运算。如果是较大的矩阵和较小的矩阵进行运算的话，较小的矩阵就会被广播，从而保证运算的正确进行。

本文将会以具体的例子详细讲解NumPy中广播的使用。

# 基础广播

正常情况下，两个数组需要进行运算，那么每个数组的对象都需要有一个相对应的值进行计算才可以。比如下面的例子：

~~~python
a = np.array([1.0, 2.0, 3.0])
b = np.array([2.0, 2.0, 2.0])
a * b
array([ 2.,  4.,  6.])
~~~

但是如果使用Numpy的广播特性，那么就不必须元素的个数准确对应。

比如，我们可以讲一个数组乘以常量：

```
a = np.array([1.0, 2.0, 3.0])
>>> b = 2.0
>>> a * b
array([ 2.,  4.,  6.])
```

下面的例子和上面的例子是等价的，Numpy会自动将b进行扩展。

NumPy足够聪明，可以使用原始标量值而无需实际制作副本，从而使广播操作尽可能地节省内存并提高计算效率。

第二个示例中的代码比第一个示例中的代码更有效，因为广播在乘法过程中移动的内存更少（b是标量而不是数组）。

# 广播规则

如果两个数组操作，NumPy会对两个数组的对象进行比较，从最后一个维度开始，如果两个数组的维度满足下面的两个条件，我们就认为这两个数组是兼容的，可以进行运算：

1. 维度中的元素个数是相同的
2. 其中一个维数是1

如果上面的两个条件不满足的话，就会抛出异常： ValueError: operands could not be broadcast together。

维度中的元素个数是相同的，并不意味着要求两个数组具有相同的维度个数。

比如表示颜色的`256x256x3` 数组，可以和一个一维的3个元素的数组相乘：

```
Image  (3d array): 256 x 256 x 3
Scale  (1d array):             3
Result (3d array): 256 x 256 x 3
```

相乘的时候，维度中元素个数是1的会被拉伸到和另外一个维度中的元素个数一致：

```
A      (4d array):  8 x 1 x 6 x 1
B      (3d array):      7 x 1 x 5
Result (4d array):  8 x 7 x 6 x 5
```

上面的例子中，第二维的1被拉伸到7，第三维的1被拉伸到6，第四维的1被拉伸到5。

还有更多的例子：

```
B      (1d array):      1
Result (2d array):  5 x 4

A      (2d array):  5 x 4
B      (1d array):      4
Result (2d array):  5 x 4

A      (3d array):  15 x 3 x 5
B      (3d array):  15 x 1 x 5
Result (3d array):  15 x 3 x 5

A      (3d array):  15 x 3 x 5
B      (2d array):       3 x 5
Result (3d array):  15 x 3 x 5

A      (3d array):  15 x 3 x 5
B      (2d array):       3 x 1
Result (3d array):  15 x 3 x 5
```

下面是不匹配的例子：

```
A      (1d array):  3
B      (1d array):  4 # trailing dimensions do not match

A      (2d array):      2 x 1
B      (3d array):  8 x 4 x 3 # second from last dimensions mismatched
```

再举个实际代码的例子：

```
>>> x = np.arange(4)
>>> xx = x.reshape(4,1)
>>> y = np.ones(5)
>>> z = np.ones((3,4))

>>> x.shape
(4,)

>>> y.shape
(5,)

>>> x + y
ValueError: operands could not be broadcast together with shapes (4,) (5,)

>>> xx.shape
(4, 1)

>>> y.shape
(5,)

>>> (xx + y).shape
(4, 5)

>>> xx + y
array([[ 1.,  1.,  1.,  1.,  1.],
       [ 2.,  2.,  2.,  2.,  2.],
       [ 3.,  3.,  3.,  3.,  3.],
       [ 4.,  4.,  4.,  4.,  4.]])

>>> x.shape
(4,)

>>> z.shape
(3, 4)

>>> (x + z).shape
(3, 4)

>>> x + z
array([[ 1.,  2.,  3.,  4.],
       [ 1.,  2.,  3.,  4.],
       [ 1.,  2.,  3.,  4.]])
```

广播还提供了一个非常方便的进行两个1维数组进行外部乘积的运算：

```
>>> a = np.array([0.0, 10.0, 20.0, 30.0])
>>> b = np.array([1.0, 2.0, 3.0])
>>> a[:, np.newaxis] + b
array([[  1.,   2.,   3.],
       [ 11.,  12.,  13.],
       [ 21.,  22.,  23.],
       [ 31.,  32.,  33.]])
```

其中a[:, np.newaxis] 将1维的数组转换成为4维的数组：

~~~python
In [230]: a[:, np.newaxis]
Out[230]:
array([[ 0.],
       [10.],
       [20.],
       [30.]])
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
