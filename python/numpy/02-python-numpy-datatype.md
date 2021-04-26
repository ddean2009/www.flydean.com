NumPy之:数据类型

[toc]

# 简介

我们知道Python中有4种数字类型，分别是int，float，bool和complex。作为科学计算的NumPy，其数据类型更加的丰富。

今天给大家详细讲解一下NumPy中的数据类型。

# 数组中的数据类型

NumPy是用C语言来实现的，我们可以对标一下NumPy中数组中的数据类型跟C语言中的数据类型：

| Numpy 中的类型           | C 中的类型            | 说明                                                         |
| :----------------------- | :-------------------- | :----------------------------------------------------------- |
| *np.bool_*               | `bool`                | Boolean (True or False) stored as a byte                     |
| *np.byte*                | `signed char`         | Platform-defined                                             |
| *np.ubyte*               | `unsigned char`       | Platform-defined                                             |
| *np.short*               | `short`               | Platform-defined                                             |
| *np.ushort*              | `unsigned short`      | Platform-defined                                             |
| *np.intc*                | `int`                 | Platform-defined                                             |
| *np.uintc*               | `unsigned int`        | Platform-defined                                             |
| *np.int_*                | `long`                | Platform-defined                                             |
| *np.uint*                | `unsigned long`       | Platform-defined                                             |
| *np.longlong*            | `long long`           | Platform-defined                                             |
| *np.ulonglong*           | `unsigned long long`  | Platform-defined                                             |
| *np.half* / *np.float16* |                       | Half precision float: sign bit, 5 bits exponent, 10 bits mantissa |
| *np.single*              | `float`               | Platform-defined single precision float: typically sign bit, 8 bits exponent, 23 bits mantissa |
| *np.double*              | `double`              | Platform-defined double precision float: typically sign bit, 11 bits exponent, 52 bits mantissa. |
| *np.longdouble*          | `long double`         | Platform-defined extended-precision float                    |
| *np.csingle*             | `float complex`       | Complex number, represented by two single-precision floats (real and imaginary components) |
| *np.cdouble*             | `double complex`      | Complex number, represented by two double-precision floats (real and imaginary components). |
| *np.clongdouble*         | `long double complex` | Complex number, represented by two extended-precision floats (real and imaginary components). |

我们在Ipython环境中随机查看一下上面的类型到底是什么：

~~~python
import numpy as np

In [26]: np.byte
Out[26]: numpy.int8

In [27]: np.bool_
Out[27]: numpy.bool_

In [28]: np.ubyte
Out[28]: numpy.uint8

In [29]: np.short
Out[29]: numpy.int16

In [30]: np.ushort
Out[30]: numpy.uint16
~~~

所以上面的数据类型，其底层还是固定长度的数据类型，我们看下到底有哪些：

| Numpy 类型                      | C 类型           | 说明                                                         |
| :------------------------------ | :--------------- | :----------------------------------------------------------- |
| *np.int8*                       | `int8_t`         | Byte (-128 to 127)                                           |
| *np.int16*                      | `int16_t`        | Integer (-32768 to 32767)                                    |
| *np.int32*                      | `int32_t`        | Integer (-2147483648 to 2147483647)                          |
| *np.int64*                      | `int64_t`        | Integer (-9223372036854775808 to 9223372036854775807)        |
| *np.uint8*                      | `uint8_t`        | Unsigned integer (0 to 255)                                  |
| *np.uint16*                     | `uint16_t`       | Unsigned integer (0 to 65535)                                |
| *np.uint32*                     | `uint32_t`       | Unsigned integer (0 to 4294967295)                           |
| *np.uint64*                     | `uint64_t`       | Unsigned integer (0 to 18446744073709551615)                 |
| *np.intp*                       | `intptr_t`       | Integer used for indexing, typically the same as `ssize_t`   |
| *np.uintp*                      | `uintptr_t`      | Integer large enough to hold a pointer                       |
| *np.float32*                    | `float`          |                                                              |
| *np.float64* / *np.float_*      | `double`         | Note that this matches the precision of the builtin python *float*. |
| *np.complex64*                  | `float complex`  | Complex number, represented by two 32-bit floats (real and imaginary components) |
| *np.complex128* / *np.complex_* | `double complex` | Note that this matches the precision of the builtin python *complex*. |

所有这些类型都是 dtype 对象的实例。常用的有5种基本类型，分别是bool，int，uint，float和complex。

类型后面带的数字表示的是该类型所占的字节数。

上面表格中有一些 Platform-defined的数据类型，这些类型是跟平台相关的，在使用的时候要特别注意。

这些dtype类型可以在创建数组的时候手动指定：

~~~python
>>> import numpy as np
>>> x = np.float32(1.0)
>>> x
1.0
>>> y = np.int_([1,2,4])
>>> y
array([1, 2, 4])
>>> z = np.arange(3, dtype=np.uint8)
>>> z
array([0, 1, 2], dtype=uint8)
~~~

由于历史原因，为了向下兼容，我们也可以在创建数组的时候指定字符格式的dtype。

~~~Python

>>> np.array([1, 2, 3], dtype='f')
array([ 1.,  2.,  3.], dtype=float32)
~~~

上面的 f 表示的是float类型。

## 类型转换

如果想要转换一个现有的数组类型，可以使用数组自带的astype方法，也可以调用np的强制转换方法：

~~~python
In [33]: z = np.arange(3, dtype=np.uint8)

In [34]: z
Out[34]: array([0, 1, 2], dtype=uint8)

In [35]: z.astype(float)
Out[35]: array([0., 1., 2.])

In [36]: np.int8(z)
Out[36]: array([0, 1, 2], dtype=int8)
~~~

> 注意，上面我们使用了 float ， Python将会把float 自动替换成为 np.float_，同样的简化格式还有 `int` == `np.int_`, `bool` == `np.bool_`,   `complex` == `np.complex_`. 其他的数据类型不能使用简化版本。

## 查看类型

查看一个数组的数据类型可以使用自带的dtype属性：

~~~python
In [37]: z.dtype
Out[37]: dtype('uint8')
~~~

dtype作为一个对象，本身也可以进行一些类型判断操作：

~~~python
>>> d = np.dtype(int)
>>> d
dtype('int32')

>>> np.issubdtype(d, np.integer)
True

>>> np.issubdtype(d, np.floating)
False
~~~

# 数据溢出

一般来说，如果超出了数据的范围是会报异常的。比如我们有一个非常长的int值：

~~~python
In [38]: a= 1000000000000000000000000000000000000000000000000000000000000000000000000000000

In [39]: a
Out[39]: 1000000000000000000000000000000000000000000000000000000000000000000000000000000

In [40]: np.int(1000000000000000000000000000000000000000000000000000000)
Out[40]: 1000000000000000000000000000000000000000000000000000000

In [41]: np.int32(1000000000000000000000000000000000000000000000000000000)
---------------------------------------------------------------------------
OverflowError                             Traceback (most recent call last)
<ipython-input-41-71feb4433730> in <module>()
----> 1 np.int32(1000000000000000000000000000000000000000000000000000000)
~~~

上面的数字太长了，超出了int32的范围，就会抛出异常。

但是NumPy的有些操作，如果超出范围之后，并不会报异常，而是正常范围，这时候我们就需要注意了：

~~~python
In [43]: np.power(100, 8, dtype=np.int32)
Out[43]: 1874919424

In [44]: np.power(100, 8, dtype=np.int64)
Out[44]: 10000000000000000
~~~

NumPy提供了两个方法来测量int和float的范围，numpy.iinfo 和 numpy.finfo ：

~~~Python
In [45]:  np.iinfo(int)
Out[45]: iinfo(min=-9223372036854775808, max=9223372036854775807, dtype=int64)

In [46]: np.iinfo(np.int32)
Out[46]: iinfo(min=-2147483648, max=2147483647, dtype=int32)

In [47]: np.iinfo(np.int64)
Out[47]: iinfo(min=-9223372036854775808, max=9223372036854775807, dtype=int64)
~~~

如果64位的int还是太小的话，可以使用np.float64，float64可以使用科学计数法，所以能够得到更大范围的结果，但是其精度可能会缩小。

~~~python
In [48]: np.power(100, 100, dtype=np.int64)
Out[48]: 0

In [49]: np.power(100, 100, dtype=np.float64)
Out[49]: 1e+200
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！