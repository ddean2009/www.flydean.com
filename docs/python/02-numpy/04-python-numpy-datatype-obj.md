---
slug: /04-python-numpy-datatype-obj
---

# 4. NumPy之:数据类型对象dtype



# 简介

之前讲到了NumPy中有多种数据类型，每种数据类型都是一个dtype(numpy.dtype )对象。今天我们来详细讲解一下dtype对象。

# dtype的定义

先看下dtype方法的定义：

~~~Python
class numpy.dtype(obj, align=False, copy=False)
~~~

其作用就是将对象obj转成dtype类型的对象。

它带了两个可选的参数:

* align - 是否按照C编译器的结构体输出格式对齐对象。

* Copy - 是拷贝对象，还是对对象的引用。

dtype可以用来描述数据的类型（int，float，Python对象等），描述数据的大小，数据的字节顺序（小端或大端）等。

# 可转换为dtype的对象

可转换的obj对象可以有很多种类型，我们一一来进行讲解

## dtype对象

如果obj对象本身就是一个dtype对象，那么可以进行无缝转换。

## None

不传的话，默认就是`float_`，这也是为什么我们创建数组默认都是float类型的原因。

## 数组标量类型

内置的数组标量可以被转换成为相关的data-type对象。

> 前面一篇文章我们讲到了什么是数组标量类型。数组标量类型是可以通过np.type来访问的数据类型。 比如： `np.int32`, `np.complex128`等。

我们看下数组标量的转换：

~~~Python
In [85]: np.dtype(np.int32)
Out[85]: dtype('int32')

In [86]: np.dtype(np.complex128)
Out[86]: dtype('complex128')
~~~

这些以np开头的内置数组标量类型可以参考我之前写的文章 “NumPy之:数据类型” 。

> 注意，数组标量并不是dtype对象，虽然很多情况下，可以在需要使用dtype对象的时候都可以使用数组标量。

## 通用类型

一些通用类型对象，可以被转换成为相应的dtype类型：

| 通用类型对象                    | dtype类型 |
| ------------------------------- | --------- |
| `number`, `inexact`, `floating` | float     |
| `complexfloating`               | `cfloat`  |
| `integer`, `signedinteger`      | `int_`    |
| `unsignedinteger`               | `uint`    |
| `character`                     | `string`  |
| `generic`, `flexible`           | `void`    |

## 内置Python类型

一些Python内置的类型和数组标量类型是等价的，也可以被转换成为dtype：

| Python类型   | dtype类型 |
| ------------ | --------- |
| int          | `int_`    |
| bool         | `bool_`   |
| float        | `float_`  |
| complex      | `cfloat`  |
| bytes        | `bytes_`  |
| str          | `str_`    |
| buffer       | `void`    |
| (all others) | `object_` |

看下内置Python类型转换的例子：

~~~Python
In [82]: np.dtype(float)
Out[82]: dtype('float64')

In [83]: np.dtype(int)
Out[83]: dtype('int64')

In [84]:  np.dtype(object)
Out[84]: dtype('O')
~~~

## 带有.dtype属性的对象

任何type对象只要包含`dtype`属性，并且这个属性属于可以转换的范围的话，都可以被转换成为dtype。

## 一个字符的string对象

对于每个内置的数据类型来说都有一个和它对应的字符编码，我们也可以使用这些字符编码来进行转换：

~~~python
In [134]: np.dtype('b')  # byte, native byte order
Out[134]: dtype('int8')

In [135]: np.dtype('>H')  # big-endian unsigned short
Out[135]: dtype('>u2')

In [136]: np.dtype('<f') # little-endian single-precision float
Out[136]: dtype('float32')

In [137]: np.dtype('d') # double-precision floating-point number
Out[137]: dtype('float64')
~~~

## 数组类型的String

Numpy中数组类型的对象有一个属性叫做**typestr**。

typestr描述了这个数组中存放的数据类型和长度。

typestr由三部分组成，第一部分是描述数据字节顺序： `<` 小端  `>` 大端。

第二部分是数组里面元素的基本类型：

| 类型 | 描述                                                         |
| ---- | ------------------------------------------------------------ |
| `t`  | Bit field (following integer gives the number of bits in the bit field). |
| `b`  | Boolean (integer type where all values are only True or False) |
| `i`  | Integer                                                      |
| `u`  | Unsigned integer                                             |
| `f`  | Floating point                                               |
| `c`  | Complex floating point                                       |
| `m`  | Timedelta                                                    |
| `M`  | Datetime                                                     |
| `O`  | Object (i.e. the memory contains a pointer to PyObject)      |
| `S`  | String (fixed-length sequence of char)                       |
| `U`  | Unicode (fixed-length sequence of Py_UNICODE)                |
| `V`  | Other (void * – each item is a fixed-size chunk of memory)   |

最后一部分就是数据的长度。

dtype支持下面几种类型的转换：

| 类型         | 描述                                    |
| ------------ | --------------------------------------- |
| `'?'`        | boolean                                 |
| `'b'`        | (signed) byte                           |
| `'B'`        | unsigned byte                           |
| `'i'`        | (signed) integer                        |
| `'u'`        | unsigned integer                        |
| `'f'`        | floating-point                          |
| `'c'`        | complex-floating point                  |
| `'m'`        | timedelta                               |
| `'M'`        | datetime                                |
| `'O'`        | (Python) objects                        |
| `'S'`, `'a'` | zero-terminated bytes (not recommended) |
| `'U'`        | Unicode string                          |
| `'V'`        | raw data (`void`)                       |

我们看几个例子：

~~~Python
In [137]: np.dtype('d')
Out[137]: dtype('float64')

In [138]: np.dtype('i4')
Out[138]: dtype('int32')

In [139]: np.dtype('f8')
Out[139]: dtype('float64')

In [140]:  np.dtype('c16')
Out[140]: dtype('complex128')

In [141]: np.dtype('a25')
Out[141]: dtype('S25')

In [142]: np.dtype('U25')
Out[142]: dtype('<U25')
~~~

## 逗号分割的字符串

逗号分割的字符串可以用来表示结构化的数据类型。

对于这种结构化的数据类型也可以转换成为dtpye格式，转换后的dtype，将会以f1，f2, … fn-1作为名字来保存对应的格式数据。我们举个例子：

~~~Python
In [143]: np.dtype("i4, (2,3)f8, f4")
Out[143]: dtype([('f0', '<i4'), ('f1', '<f8', (2, 3)), ('f2', '<f4')])
~~~

上面的例子中，f0保存的是32位的整数，f1保存的是 2 x 3  数组的64-bit 浮点数。f2是一个32-bit 的浮点数。

再看另外一个例子：

~~~python
In [144]: np.dtype("a3, 3u8, (3,4)a10")
Out[144]: dtype([('f0', 'S3'), ('f1', '<u8', (3,)), ('f2', 'S10', (3, 4))])
~~~

## 类型字符串

所有在`numpy.sctypeDict`.keys()中的字符，都可以被转换为dtype：

~~~Python
In [146]: np.sctypeDict.keys()
Out[146]: dict_keys(['?', 0, 'byte', 'b', 1, 'ubyte', 'B', 2, 'short', 'h', 3, 'ushort', 'H', 4, 'i', 5, 'uint', 'I', 6, 'intp', 'p', 7, 'uintp', 'P', 8, 'long', 'l', 'L', 'longlong', 'q', 9, 'ulonglong', 'Q', 10, 'half', 'e', 23, 'f', 11, 'double', 'd', 12, 'longdouble', 'g', 13, 'cfloat', 'F', 14, 'cdouble', 'D', 15, 'clongdouble', 'G', 16, 'O', 17, 'S', 18, 'unicode', 'U', 19, 'void', 'V', 20, 'M', 21, 'm', 22, 'bool8', 'Bool', 'b1', 'float16', 'Float16', 'f2', 'float32', 'Float32', 'f4', 'float64', 'Float64', 'f8', 'float128', 'Float128', 'f16', 'complex64', 'Complex32', 'c8', 'complex128', 'Complex64', 'c16', 'complex256', 'Complex128', 'c32', 'object0', 'Object0', 'bytes0', 'Bytes0', 'str0', 'Str0', 'void0', 'Void0', 'datetime64', 'Datetime64', 'M8', 'timedelta64', 'Timedelta64', 'm8', 'int64', 'uint64', 'Int64', 'UInt64', 'i8', 'u8', 'int32', 'uint32', 'Int32', 'UInt32', 'i4', 'u4', 'int16', 'uint16', 'Int16', 'UInt16', 'i2', 'u2', 'int8', 'uint8', 'Int8', 'UInt8', 'i1', 'u1', 'complex_', 'int0', 'uint0', 'single', 'csingle', 'singlecomplex', 'float_', 'intc', 'uintc', 'int_', 'longfloat', 'clongfloat', 'longcomplex', 'bool_', 'unicode_', 'object_', 'bytes_', 'str_', 'string_', 'int', 'float', 'complex', 'bool', 'object', 'str', 'bytes', 'a'])
~~~

使用的例子：

~~~Python
In [147]: np.dtype('uint32')
Out[147]: dtype('uint32')

In [148]: np.dtype('float64')
Out[148]: dtype('float64')
~~~



## 元组

通过使用dtype构成的元组，我们可以生成新的dtype。

元组也有很多种方式。

### (flexible_dtype, itemsize)

对于不固定长度的dtype，可以指定size：

~~~python
In [149]: np.dtype((np.void, 10))
Out[149]: dtype('V10')

In [150]: np.dtype(('U', 10))
Out[150]: dtype('<U10')
~~~

### (fixed_dtype, shape)

对于固定长度的dtype，可以指定shape：

~~~python
In [151]:  np.dtype((np.int32, (2,2)))
Out[151]: dtype(('<i4', (2, 2)))

In [152]: np.dtype(('i4, (2,3)f8, f4', (2,3)))
Out[152]: dtype(([('f0', '<i4'), ('f1', '<f8', (2, 3)), ('f2', '<f4')], (2, 3)))
~~~

### [(field_name, field_dtype, field_shape), ...]

list中的元素是一个个的field，每个field都是由2-3个部分组成的，分别是field名字，field类型，field的shape。

*field_name*如果是 ’ ‘的话，就会使用默认的f1，f2 ….作为名字。*field_name* 也可以是一个2元组，由title 和 name 组成。

*field_dtype* 就是field的dtype类型。

shape是一个可选字段，如果*field_dtype*是一个数组的话，就需要指定shape。

~~~python
In [153]: np.dtype([('big', '>i4'), ('little', '<i4')])
Out[153]: dtype([('big', '>i4'), ('little', '<i4')])
~~~

上面是两个字段，一个是大端的32位的int，一个是小端的32位的int。

~~~python
In [154]: np.dtype([('R','u1'), ('G','u1'), ('B','u1'), ('A','u1')])
Out[154]: dtype([('R', 'u1'), ('G', 'u1'), ('B', 'u1'), ('A', 'u1')])
~~~

四个字段，每个都是无符号整形。

### {'names': ..., 'formats': ..., 'offsets': ..., 'titles': ..., 'itemsize': ...}

这种写法可以指定name列表和formats列表：

~~~python
In [157]: np.dtype({'names': ['r','g','b','a'], 'formats': [np.uint8, np.uint8, np.uint8, np.uint8]})
Out[157]: dtype([('r', 'u1'), ('g', 'u1'), ('b', 'u1'), ('a', 'u1')])
~~~

*offsets* 指的是每个字段的byte offsets。titles 是字段的title，*itemsize* 是整个dtype的size。

~~~python
In [158]: np.dtype({'names': ['r','b'], 'formats': ['u1', 'u1'],
     ...:                'offsets': [0, 2],
     ...:                'titles': ['Red pixel', 'Blue pixel']})
     ...:
Out[158]: dtype({'names':['r','b'], 'formats':['u1','u1'], 'offsets':[0,2], 'titles':['Red pixel','Blue pixel'], 'itemsize':3})
~~~

### (base_dtype, new_dtype)

可以将基本的dtype类型转换为结构化的dtype类型：

~~~python
In [159]: np.dtype((np.int32,{'real':(np.int16, 0),'imag':(np.int16, 2)}))
Out[159]: dtype([('real', '<i2'), ('imag', '<i2')])
~~~

32位的int转换成两个16位的int。

~~~Python
In [161]: np.dtype(('i4', [('r','u1'),('g','u1'),('b','u1'),('a','u1')]))
Out[161]: dtype([('r', 'u1'), ('g', 'u1'), ('b', 'u1'), ('a', 'u1')])
~~~

32位的int，转换成4个unsigned integers。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！









