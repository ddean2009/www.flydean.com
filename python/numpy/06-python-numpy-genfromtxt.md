NumPy之:使用genfromtxt导入数据

[toc]

# 简介

在做科学计算的时候，我们需要从外部加载数据，今天给大家介绍一下NumPy中非常有用的一个方法genfromtxt。genfromtxt可以分解成两步，第一步是从文件读取数据，并转化成为字符串。第二步就是将字符串转化成为指定的数据类型。

# genfromtxt介绍

先看下genfromtxt的定义：

~~~Python
numpy.genfromtxt(fname, dtype=<class 'float'>, comments='#', delimiter=None, skip_header=0, skip_footer=0, converters=None, missing_values=None, filling_values=None, usecols=None, names=None, excludelist=None, deletechars=" !#$%&'()*+, -./:;<=>?@[\]^{|}~", replace_space='_', autostrip=False, case_sensitive=True, defaultfmt='f%i', unpack=None, usemask=False, loose=True, invalid_raise=True, max_rows=None, encoding='bytes')
~~~

genfromtxt可以接受多个参数，这么多参数中只有fname是必须的参数，其他的都是可选的。

fname可以有多种形式，可以是**file, str, pathlib.Path, list of str, 或者generator**。

如果是单独的str，那么默认是本地或者远程文件的名字。如果是list of str，那么每个str都被当做文件中的一行数据。如果传入的是远程的文件，这个文件会被自动下载到本地目录中。

genfromtxt还可以自动识别文件是否是压缩类型，目前支持两种压缩类型：gzip 和 bz2。

接下来我们看下genfromtxt的常见应用：

使用之前，通常需要导入两个库：

~~~Python
from io import StringIO
import numpy as np
~~~

StringIO会生成一个String对象，可以作为genfromtxt的输入。

我们先定义一个包含不同类型的StringIO:

~~~Python
s = StringIO(u"1,1.3,abcde")
~~~

这个StringIO包含一个int,一个float和一个str。并且分割符是 `,`。

我们看下genfromtxt最简单的使用：

~~~python
In [65]: data = np.genfromtxt(s)

In [66]: data
Out[66]: array(nan)
~~~

因为默认的分隔符是delimiter=None，所以StringIO中的数据会被作为一个整体转换成数组，结果就是nan。

下面我们添加一个逗号分割符：

~~~python
In [67]: _ = s.seek(0)

In [68]: data = np.genfromtxt(s,delimiter=",")

In [69]: data
Out[69]: array([1. , 1.3, nan])
~~~

这次有输出了，但是最后一个字符串因为不能被转换成为float，所以得到了nan。

> 注意，我们第一行需要重置StringIO的指针到文件的开头。这里我们使用 s.seek(0)。

那么怎么把最后一个str也进行转换呢？我们需要手动指定dtype：

~~~python
In [74]: _ = s.seek(0)

In [75]: data = np.genfromtxt(s,dtype=float,delimiter=",")

In [76]: data
Out[76]: array([1. , 1.3, nan])
~~~

上面我们指定了所有的数组类型都是float，我们还可以分别为数组的每个元素指定类型：

~~~python
In [77]: _ = s.seek(0)

In [78]: data = np.genfromtxt(s,dtype=[int,float,'S5'],delimiter=",")

In [79]: data
Out[79]: array((1, 1.3, b'abcde'), dtype=[('f0', '<i8'), ('f1', '<f8'), ('f2', '<U')])
~~~

我们分别使用int，float和str来对文件中的类型进行转换,可以看到得到了正确的结果。

除了指定类型，我们还可以指定名字，上面的例子中，我们没有指定名字，所以使用的是默认的f0,f1,f2。看一个指定名字的例子：

~~~python
In [214]: data = np.genfromtxt(s, dtype="i8,f8,S5",names=['myint','myfloat','mystring'], delimiter=",")

In [215]: data
Out[215]:
array((1, 1.3, b'abcde'),
      dtype=[('myint', '<i8'), ('myfloat', '<f8'), ('mystring', 'S5')])
~~~

分隔符除了使用字符之外，还可以使用index：

~~~pythonIn [216]: s = StringIO(u"11.3abcde")
In [216]: s = StringIO(u"11.3abcde")
In [217]: data = np.genfromtxt(s, dtype=None, names=['intvar','fltvar','strvar'],
     ...:  delimiter=[1,3,5])

In [218]: data
Out[218]:
array((1, 1.3, b'abcde'),
      dtype=[('intvar', '<i8'), ('fltvar', '<f8'), ('strvar', 'S5')])
~~~

上面我们使用index作为s的分割。

# 多维数组

如果数据中有换行符，那么可以使用genfromtxt来生成多维数组：

~~~Python
>>> data = u"1, 2, 3\n4, 5, 6"
>>> np.genfromtxt(StringIO(data), delimiter=",")
array([[ 1.,  2.,  3.],
       [ 4.,  5.,  6.]])
~~~

# autostrip

使用`autostrip` 可以删除数据两边的空格：

~~~Python
>>> data = u"1, abc , 2\n 3, xxx, 4"
>>> # Without autostrip
>>> np.genfromtxt(StringIO(data), delimiter=",", dtype="|U5")
array([['1', ' abc ', ' 2'],
       ['3', ' xxx', ' 4']], dtype='<U5')
>>> # With autostrip
>>> np.genfromtxt(StringIO(data), delimiter=",", dtype="|U5", autostrip=True)
array([['1', 'abc', '2'],
       ['3', 'xxx', '4']], dtype='<U5')
~~~

# comments

默认的comments 是 #  ，数据中所有以# 开头的都被看做是注释。

```
>>> data = u"""#
... # Skip me !
... # Skip me too !
... 1, 2
... 3, 4
... 5, 6 #This is the third line of the data
... 7, 8
... # And here comes the last line
... 9, 0
... """
>>> np.genfromtxt(StringIO(data), comments="#", delimiter=",")
array([[1., 2.],
       [3., 4.],
       [5., 6.],
       [7., 8.],
       [9., 0.]])
```

# 跳过行和选择列

可以使用`skip_header` 和 `skip_footer` 来跳过返回的数组特定的行：

```
>>> data = u"\n".join(str(i) for i in range(10))
>>> np.genfromtxt(StringIO(data),)
array([ 0.,  1.,  2.,  3.,  4.,  5.,  6.,  7.,  8.,  9.])
>>> np.genfromtxt(StringIO(data),
...               skip_header=3, skip_footer=5)
array([ 3.,  4.])
```

可以使用`usecols` 来选择特定的行数：

```
>>> data = u"1 2 3\n4 5 6"
>>> np.genfromtxt(StringIO(data), usecols=(0, -1))
array([[ 1.,  3.],
       [ 4.,  6.]])
```

如果列还有名字的话，可以用`usecols` 来选择列的名字：

```
>>> data = u"1 2 3\n4 5 6"
>>> np.genfromtxt(StringIO(data),
...               names="a, b, c", usecols=("a", "c"))
array([(1.0, 3.0), (4.0, 6.0)],
      dtype=[('a', '<f8'), ('c', '<f8')])
>>> np.genfromtxt(StringIO(data),
...               names="a, b, c", usecols=("a, c"))
    array([(1.0, 3.0), (4.0, 6.0)],
          dtype=[('a', '<f8'), ('c', '<f8')])
```


> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！