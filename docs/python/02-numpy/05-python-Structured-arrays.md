---
slug: /05-python-Structured-arrays
---

# 5. NumPy之:结构化数组详解



# 简介

普通的数组就是数组中存放了同一类型的对象。而结构化数组是指数组中存放不同对象的格式。

今天我们来详细探讨一下NumPy中的结构化数组。

# 结构化数组中的字段field

因为结构化数组中包含了不同类型的对象，所以每一个对象类型都被称为一个field。

每个field都有3部分，分别是：string类型的name，任何有效dtype类型的type，还有一个可选的*title*。

看一个使用filed构建dtype的例子：

~~~python
In [165]: np.dtype([('name', 'U10'), ('age', 'i4'), ('weight', 'f4')])
Out[165]: dtype([('name', '<U10'), ('age', '<i4'), ('weight', '<f4')])
~~~

我们可以使用上面的dtype类型来构建一个新的数组：

~~~python
In [166]: x = np.array([('Rex', 9, 81.0), ('Fido', 3, 27.0)],
     ...:     dtype=[('name', 'U10'), ('age', 'i4'), ('weight', 'f4')])
     ...:

In [167]: x
Out[167]:
array([('Rex', 9, 81.), ('Fido', 3, 27.)],
      dtype=[('name', '<U10'), ('age', '<i4'), ('weight', '<f4')])
~~~

x是一个1维数组，每个元素都包含三个字段，name，age和weight。并且分别指定了他们的数据类型。

可以通过index来访问一行数据：

~~~python
In [168]: x[1]
Out[168]: ('Fido', 3, 27.)
~~~

也可以通过name来访问一列数据 ：

~~~python
In [170]: x['name']
Out[170]: array(['Rex', 'Fido'], dtype='<U10')
~~~

还可以给所有的列统一赋值：

~~~python
In [171]: x['age']
Out[171]: array([9, 3], dtype=int32)

In [172]: x['age'] = 10

In [173]: x
Out[173]:
array([('Rex', 10, 81.), ('Fido', 10, 27.)],
      dtype=[('name', '<U10'), ('age', '<i4'), ('weight', '<f4')])
~~~

# 结构化数据类型

上面的例子让我们对结构化数据类型有了一个基本的认识。结构化数据类型就是一系列的filed的集合。

## 创建结构化数据类型

结构化数据类型是从基础类型创建的，主要有下面几种方式：

### 从元组创建

每个元组都是(fieldname, datatype, shape)这样的格式，其中shape 是可选的。fieldname 是 field的title。

~~~python
In [174]: np.dtype([('x', 'f4'), ('y', np.float32), ('z', 'f4', (2, 2))])
Out[174]: dtype([('x', '<f4'), ('y', '<f4'), ('z', '<f4', (2, 2))])
~~~

如果fieldname是空字符的话，会以f开头的形式默认创建。

~~~python
In [177]: np.dtype([('x', 'f4'), ('', 'i4'), ('z', 'i8')])
Out[177]: dtype([('x', '<f4'), ('f1', '<i4'), ('z', '<i8')])
~~~

### 从逗号分割的dtype创建

可以选择从逗号分割的dtype类型创建：

~~~python
In [178]: np.dtype('i8, f4, S3')
Out[178]: dtype([('f0', '<i8'), ('f1', '<f4'), ('f2', 'S3')])

In [179]: np.dtype('3int8, float32, (2, 3)float64')
Out[179]: dtype([('f0', 'i1', (3,)), ('f1', '<f4'), ('f2', '<f8', (2, 3))])
~~~

### 从字典创建

从字典创建是这样的格式： {'names': ..., 'formats': ..., 'offsets': ..., 'titles': ..., 'itemsize': ...}

这种写法可以指定name列表和formats列表。

*offsets* 指的是每个字段的byte offsets。titles 是字段的title，*itemsize* 是整个dtype的size。

~~~Python
In [180]: np.dtype({'names': ['col1', 'col2'], 'formats': ['i4', 'f4']})
Out[180]: dtype([('col1', '<i4'), ('col2', '<f4')])

In [181]: np.dtype({'names': ['col1', 'col2'],
     ...: ...           'formats': ['i4', 'f4'],
     ...: ...           'offsets': [0, 4],
     ...: ...           'itemsize': 12})
     ...:
Out[181]: dtype({'names':['col1','col2'], 'formats':['<i4','<f4'], 'offsets':[0,4], 'itemsize':12})
~~~

## 操作结构化数据类型

可以通过dtype 的 names 和fields 字段来访问结构化数据类型的属性：

~~~Python
>>> d = np.dtype([('x', 'i8'), ('y', 'f4')])
>>> d.names
('x', 'y')
~~~

~~~python
>>> d.fields
mappingproxy({'x': (dtype('int64'), 0), 'y': (dtype('float32'), 8)})
~~~

## Offsets 和Alignment

对于结构化类型来说，因为一个dtype中包含了多种数据类型，默认情况下这些数据类型是不对齐的。

我们可以通过下面的例子来看一下各个类型的偏移量：

~~~Python
>>> def print_offsets(d):
...     print("offsets:", [d.fields[name][1] for name in d.names])
...     print("itemsize:", d.itemsize)
>>> print_offsets(np.dtype('u1, u1, i4, u1, i8, u2'))
offsets: [0, 1, 2, 6, 7, 15]
itemsize: 17
~~~

如果在创建dtype类型的时候，指定了align=True，那么这些类型之间可能会按照C-struct的结构进行对齐。

对齐的好处就是可以提升处理效率。我们看一个对齐的例子：

~~~python
>>> print_offsets(np.dtype('u1, u1, i4, u1, i8, u2', align=True))
offsets: [0, 1, 4, 8, 16, 24]
itemsize: 32
~~~

## Field Titles

每个Filed除了name之外，还可以包含title。

有两种方式来指定title，第一种方式：

~~~python
In [182]: np.dtype([(('my title', 'name'), 'f4')])
Out[182]: dtype([(('my title', 'name'), '<f4')])
~~~

第二种方式：

~~~Python
In [183]: np.dtype({'name': ('i4', 0, 'my title')})
Out[183]: dtype([(('my title', 'name'), '<i4')])
~~~

看一下fields的结构：

~~~Python
In [187]: d.fields
Out[187]:
mappingproxy({'my title': (dtype('float32'), 0, 'my title'),
              'name': (dtype('float32'), 0, 'my title')})
~~~

# 结构化数组

从结构化数据类型创建结构化数组之后，我们就可以对结构化数组进行操作了。

## 赋值

我们可以从元组中对结构化数组进行赋值：

~~~python
>>> x = np.array([(1, 2, 3), (4, 5, 6)], dtype='i8, f4, f8')
>>> x[1] = (7, 8, 9)
>>> x
array([(1, 2., 3.), (7, 8., 9.)],
     dtype=[('f0', '<i8'), ('f1', '<f4'), ('f2', '<f8')])
~~~

还可以从标量对结构化数组进行赋值：

~~~Python
>>> x = np.zeros(2, dtype='i8, f4, ?, S1')
>>> x[:] = 3
>>> x
array([(3, 3., True, b'3'), (3, 3., True, b'3')],
      dtype=[('f0', '<i8'), ('f1', '<f4'), ('f2', '?'), ('f3', 'S1')])
>>> x[:] = np.arange(2)
>>> x
array([(0, 0., False, b'0'), (1, 1., True, b'1')],
      dtype=[('f0', '<i8'), ('f1', '<f4'), ('f2', '?'), ('f3', 'S1')])
~~~

结构化数组还可以赋值给非机构化数组，但是前提是结构化数组只有一个filed：

~~~Python
>>> twofield = np.zeros(2, dtype=[('A', 'i4'), ('B', 'i4')])
>>> onefield = np.zeros(2, dtype=[('A', 'i4')])
>>> nostruct = np.zeros(2, dtype='i4')
>>> nostruct[:] = twofield
Traceback (most recent call last):
...
TypeError: Cannot cast array data from dtype([('A', '<i4'), ('B', '<i4')]) to dtype('int32') according to the rule 'unsafe'
~~~

结构化数组还可以互相赋值：

~~~Python
>>> a = np.zeros(3, dtype=[('a', 'i8'), ('b', 'f4'), ('c', 'S3')])
>>> b = np.ones(3, dtype=[('x', 'f4'), ('y', 'S3'), ('z', 'O')])
>>> b[:] = a
>>> b
array([(0., b'0.0', b''), (0., b'0.0', b''), (0., b'0.0', b'')],
      dtype=[('x', '<f4'), ('y', 'S3'), ('z', 'O')])
~~~

## 访问结构化数组

之前讲到了，可以通过filed的名字来访问和修改一列数据：

~~~python
>>> x = np.array([(1, 2), (3, 4)], dtype=[('foo', 'i8'), ('bar', 'f4')])
>>> x['foo']
array([1, 3])
>>> x['foo'] = 10
>>> x
array([(10, 2.), (10, 4.)],
      dtype=[('foo', '<i8'), ('bar', '<f4')])
~~~

返回的数值是原始数组的一个视图，他们是共享内存空间的，所以修改视图同时也会修改原数据。

看一个filed是多维数组的情况：

~~~Python
In [188]: np.zeros((2, 2), dtype=[('a', np.int32), ('b', np.float64, (3, 3))])
Out[188]:
array([[(0, [[0., 0., 0.], [0., 0., 0.], [0., 0., 0.]]),
        (0, [[0., 0., 0.], [0., 0., 0.], [0., 0., 0.]])],
       [(0, [[0., 0., 0.], [0., 0., 0.], [0., 0., 0.]]),
        (0, [[0., 0., 0.], [0., 0., 0.], [0., 0., 0.]])]],
      dtype=[('a', '<i4'), ('b', '<f8', (3, 3))])
~~~

上面构建了一个2 * 2 的矩阵，这个矩阵中的第一列是int类型，第二列是一个3 * 3 的float矩阵。

我们可以这样来查看各个列的shape值：

~~~Python
>>> x = np.zeros((2, 2), dtype=[('a', np.int32), ('b', np.float64, (3, 3))])
>>> x['a'].shape
(2, 2)
>>> x['b'].shape
(2, 2, 3, 3)
~~~

除了单列的访问之外，我们还可以一次访问多列数据：

~~~Python
>>> a = np.zeros(3, dtype=[('a', 'i4'), ('b', 'i4'), ('c', 'f4')])
>>> a[['a', 'c']]
array([(0, 0.), (0, 0.), (0, 0.)],
     dtype={'names':['a','c'], 'formats':['<i4','<f4'], 'offsets':[0,8], 'itemsize':12})
~~~

多列同时赋值：

~~~python
>>> a[['a', 'c']] = (2, 3)
>>> a
array([(2, 0, 3.), (2, 0, 3.), (2, 0, 3.)],
      dtype=[('a', '<i4'), ('b', '<i4'), ('c', '<f4')])
~~~

简单的交换列的数据：

~~~python
>>> a[['a', 'c']] = a[['c', 'a']]
~~~

# Record Arrays

结构化数组只能通过index来访问，很不方便，为此NumPy提供了一个多维数组的子类 numpy.recarray, 然后可以通过属性来访问。

我们来看几个例子：

~~~python
>>> recordarr = np.rec.array([(1, 2., 'Hello'), (2, 3., "World")],
...                    dtype=[('foo', 'i4'),('bar', 'f4'), ('baz', 'S10')])
>>> recordarr.bar
array([ 2.,  3.], dtype=float32)
>>> recordarr[1:2]
rec.array([(2, 3., b'World')],
      dtype=[('foo', '<i4'), ('bar', '<f4'), ('baz', 'S10')])
>>> recordarr[1:2].foo
array([2], dtype=int32)
>>> recordarr.foo[1:2]
array([2], dtype=int32)
>>> recordarr[1].baz
b'World'
~~~

recarray返回的结果是一个rec.array。除了使用np.rec.array来创建之外，还可以使用view：

~~~Python
In [190]: arr = np.array([(1, 2., 'Hello'), (2, 3., "World")],
     ...: ...                dtype=[('foo', 'i4'),('bar', 'f4'), ('baz', 'a10')])
     ...:

In [191]: arr
Out[191]:
array([(1, 2., b'Hello'), (2, 3., b'World')],
      dtype=[('foo', '<i4'), ('bar', '<f4'), ('baz', 'S10')])

In [192]: arr.view(dtype=np.dtype((np.record, arr.dtype)),
     ...: ...                      type=np.recarray)
     ...:
Out[192]:
rec.array([(1, 2., b'Hello'), (2, 3., b'World')],
          dtype=[('foo', '<i4'), ('bar', '<f4'), ('baz', 'S10')])
~~~

如果是rec.array对象，它的dtype类型会被自动转换成为np.record类型：

~~~python
In [200]: recordarr.dtype
Out[200]: dtype((numpy.record, [('foo', '<i4'), ('bar', '<f4'), ('baz', 'S10')]))
~~~

想要转换回原始的np.ndarray类型可以这样：

~~~Python
In [202]: recordarr.view(recordarr.dtype.fields or recordarr.dtype, np.ndarray)
Out[202]:
array([(1, 2., b'Hello'), (2, 3., b'World')],
      dtype=[('foo', '<i4'), ('bar', '<f4'), ('baz', 'S10')])
~~~

如果通过index或者field来访问rec.array对象的字段，如果字段是结构类型，那么会返回numpy.recarray，如果是非结构类型，则会返回numpy.ndarray：

~~~Python
>>> recordarr = np.rec.array([('Hello', (1, 2)), ("World", (3, 4))],
...                 dtype=[('foo', 'S6'),('bar', [('A', int), ('B', int)])])
>>> type(recordarr.foo)
<class 'numpy.ndarray'>
>>> type(recordarr.bar)
<class 'numpy.recarray'>
~~~


> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
