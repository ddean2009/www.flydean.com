---
slug: /08-python-io
---

# 8. Python基础之:Python中的IO



# 简介

IO就是输入和输出，任何一个程序如果和外部希望有交互的话，都需要使用到IO。相对于java而言，Python中的IO更加的简单，易用。

本文将会详细介绍Python中的IO操作。

# linux输入输出

linux中有三种标准输入输出，分别是STDIN，STDOUT，STDERR，对应的数字是0，1，2。

STDIN是标准输入，默认从键盘读取信息；

STDOUT是标准输出，默认将输出结果输出至终端；

STDERR是标准错误，默认将输出结果输出至终端。

我们常用的 2>&1，指将标准输出、标准错误指定为同一输出路径 。

# 格式化输出

python中，我们可以使用print方法来输出信息。

我们看下print函数的定义：

~~~python
print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)
~~~

print函数将 *objects* 打印到 *file* 指定的文本流，以 *sep* 分隔并在末尾加上 *end*。 *sep*, *end*, *file* 和 *flush* 如果存在，那么必须以关键字参数的形式给出。

所有非关键字参数都会被转换为字符串，并会被写入到流，以 *sep* 分割，并在末尾加上 *end*。 *sep* 和 *end* 都必须为字符串；它们也可以为 `None`，这意味着使用默认值。 如果没有给出 *objects*，则 `print()` 将只写入 *end*。

*file* 参数必须是一个具有 `write(string)` 方法的对象；如果参数不存在或为 `None`，则将使用 `sys.stdout`。 由于要打印的参数会被转换为文本字符串，因此 `print()`不能用于二进制模式的文件对象。 对于这些对象，可以使用 `file.write(...)`。

输出是否被缓存通常决定于 *file*，但如果 *flush* 关键字参数为真值，输出流会被强制刷新。

可以看到print的输出格式还是比较简单的。我们接下来看一下怎么丰富输出的格式。

## f格式化

如果想要格式化字符串，可以在字符串的开始引号之前加上 `f` 或 `F`。

这样的话，我们可以直接在字符串中引入变量值，只需要把变量放在  `{` 和 `}`  中间即可。

~~~python
>>> year = 2016
>>> event = 'Referendum'
>>> f'Results of the {year} {event}'
'Results of the 2016 Referendum'
~~~

除了在{ }中放入Python变量之外，还可以在其中放入函数：

~~~python
>>> import math
>>> print(f'The value of pi is approximately {math.pi:.3f}.')
The value of pi is approximately 3.142.
~~~

在 `':'` 后传递一个整数可以让该字段成为最小字符宽度。方便列对齐:

~~~python
>>> table = {'Sjoerd': 4127, 'Jack': 4098, 'Dcab': 7678}
>>> for name, phone in table.items():
...     print(f'{name:10} ==> {phone:10d}')
...
Sjoerd     ==>       4127
Jack       ==>       4098
Dcab       ==>       7678
~~~

{ }中的变量后面还可以跟着转值符号：`'!a'` 表示应用 `ascii()` ，`'!s'` 表示应用 `str()`，还有 `'!r'` 表示应用 `repr()`：

~~~python
>>> animals = 'eels'
>>> print(f'My hovercraft is full of {animals}.')
My hovercraft is full of eels.
>>> print(f'My hovercraft is full of {animals!r}.')
My hovercraft is full of 'eels'.
~~~

## format格式化

除此之外，str本身自带一个功能强大的**format** 函数：

~~~python
str.format(*args, **kwargs)
~~~

调用此方法的字符串可以包含字符串字面值或者以花括号 `{}` 括起来的替换域，每个替换域可以包含一个位置参数的数字索引，或者一个关键字参数的名称。 返回的字符串副本中每个替换域都会被替换为对应参数的字符串值。

~~~python
>>> "The sum of 1 + 2 is {0}".format(1+2)
'The sum of 1 + 2 is 3'
~~~

再看一个使用索引的例子：

~~~python
>>> print('{0} and {1}'.format('spam', 'eggs'))
spam and eggs
>>> print('{1} and {0}'.format('spam', 'eggs'))
eggs and spam
~~~

看一个关键字的例子：

~~~python
>>> print('This {food} is {adjective}.'.format(
...       food='spam', adjective='absolutely horrible'))
This spam is absolutely horrible.
~~~

再看一个组合的例子：

~~~python
>>> print('The story of {0}, {1}, and {other}.'.format('Bill', 'Manfred',
                                                       other='Georg'))
The story of Bill, Manfred, and Georg.
~~~

还有非常复杂的组合的例子：

~~~python
>>> table = {'Sjoerd': 4127, 'Jack': 4098, 'Dcab': 8637678}
>>> print('Jack: {0[Jack]:d}; Sjoerd: {0[Sjoerd]:d}; '
...       'Dcab: {0[Dcab]:d}'.format(table))
Jack: 4098; Sjoerd: 4127; Dcab: 8637678
~~~

或者使用 '**' 符号将 table 作为关键字参数传递：

~~~python
>>> table = {'Sjoerd': 4127, 'Jack': 4098, 'Dcab': 8637678}
>>> print('Jack: {Jack:d}; Sjoerd: {Sjoerd:d}; Dcab: {Dcab:d}'.format(**table))
Jack: 4098; Sjoerd: 4127; Dcab: 8637678
~~~



还可以使用n类型  `'{:n}'`  来格式化数字：

~~~python
>>> yes_votes = 42_572_654
>>> no_votes = 43_132_495
>>> percentage = yes_votes / (yes_votes + no_votes)
>>> '{:-9} YES votes  {:2.2%}'.format(yes_votes, percentage)
' 42572654 YES votes  49.67%'
~~~

## repr和str

如果我们只是想要将Python对象转换为字符串，那么可以使用`repr()`或者`str()`, `str()` 函数是用于返回人类可读的值的表示，而 `repr()`是用于生成解释器可读的表示。

举个例子：

~~~python
>>> s = 'Hello, world.'
>>> str(s)
'Hello, world.'
>>> repr(s)
"'Hello, world.'"
>>> str(1/7)
'0.14285714285714285'
>>> x = 10 * 3.25
>>> y = 200 * 200
>>> s = 'The value of x is ' + repr(x) + ', and y is ' + repr(y) + '...'
>>> print(s)
The value of x is 32.5, and y is 40000...
>>> # The repr() of a string adds string quotes and backslashes:
... hello = 'hello, world\n'
>>> hellos = repr(hello)
>>> print(hellos)
'hello, world\n'
>>> # The argument to repr() may be any Python object:
... repr((x, y, ('spam', 'eggs')))
"(32.5, 40000, ('spam', 'eggs'))"
~~~

str对象还提供了一些对字符串进行手动格式化的方法：

~~~Python
>>> for x in range(1, 11):
...     print(repr(x).rjust(2), repr(x*x).rjust(3), end=' ')
...     # Note use of 'end' on previous line
...     print(repr(x*x*x).rjust(4))
...
 1   1    1
 2   4    8
 3   9   27
 4  16   64
 5  25  125
 6  36  216
 7  49  343
 8  64  512
 9  81  729
10 100 1000
~~~

字符串对象的 `str.rjust()`方法通过在左侧填充空格来对给定宽度的字段中的字符串进行右对齐。类似的方法还有 `str.ljust()`和 `str.center()`。

如果输入的字符串太长，它们不会截断字符串，而是原样返回。

如果想保证字符串的长度，则可以使用切片： `x.ljust(n)[:n]` 。

还可以使用str.zfill()来用0填充字符串：

~~~python
>>> '12'.zfill(5)
'00012'
>>> '-3.14'.zfill(7)
'-003.14'
>>> '3.14159265359'.zfill(5)
'3.14159265359'
~~~

## %格式化方法

% 也可以用来格式化字符串，给定 `'string' % values`，则 `string` 中的 `%` 实例会以零个或多个 `values` 元素替换。 此操作通常被称为字符串插值。

~~~python
>>> import math
>>> print('The value of pi is approximately %5.3f.' % math.pi)
The value of pi is approximately 3.142.
~~~

# 读写文件

python中文件读取非常简单，使用`open()`方法即可。

`open()`会返回一个文件对象。我们看一下它的定义：

~~~python
open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None)
~~~

第一个参数是文件名。

第二个参数是文件打开的模式，可用的模式有：

| 字符  | 意义                             |
| :---- | :------------------------------- |
| `'r'` | 读取（默认）                     |
| `'w'` | 写入，并先截断文件               |
| `'x'` | 排它性创建，如果文件已存在则失败 |
| `'a'` | 写入，如果文件存在则在末尾追加   |
| `'b'` | 二进制模式                       |
| `'t'` | 文本模式（默认）                 |
| `'+'` | 打开用于更新（读取与写入）       |

默认模式为 `'r'` 。

看一个open文件的例子：

~~~Python
>>> f = open('workfile', 'w')
~~~

文件打开了，自然需要被关闭，所以我们需要显示调用 `f.close()` 方法：

```
>>> f.close()
```

有没有类似java中的try with resource的自动关闭文件的功能呢？

我们可以使用with，这样文件在使用完毕之后，会自动被关闭，非常的好用。

~~~python
>>> with open('workfile') as f:
...     read_data = f.read()

>>> # We can check that the file has been automatically closed.
>>> f.closed
True
~~~

文件被关闭之后，如果想要再次读取，就会报错：

~~~python
>>> f.close()
>>> f.read()
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ValueError: I/O operation on closed file.
~~~

## 文件对象的方法

获取到文件对象之后，我们就可以调用文件中的方法了。

`f.read(size)` 会读取一些数据并将其作为字符串（在文本模式下）或字节串对象（在二进制模式下）返回。

*size* 是一个可选的数值参数。 当 *size* 被省略或者为负数时，将读取并返回整个文件的内容；当取其他值时，将读取并返回至多 *size* 个字符（在文本模式下）或 *size* 个字节（在二进制模式下）。 如果已到达文件末尾，`f.read()` 将返回一个空字符串 (`''`)。

~~~python
>>> f.read()
'This is the entire file.\n'
>>> f.read()
''
~~~

`f.readline()` 从文件中读取一行；换行符（`\n`）留在字符串的末尾，如果文件不以换行符结尾，则在文件的最后一行省略。如果 `f.readline()` 返回一个空的字符串，则表示已经到达了文件末尾，而空行使用 `'\n'` 表示，该字符串只包含一个换行符。

~~~python
>>> f.readline()
'This is the first line of the file.\n'
>>> f.readline()
'Second line of the file\n'
>>> f.readline()
''
~~~

还有一种更加简单的读取方法，就是从文件中遍历：

~~~python
>>> for line in f:
...     print(line, end='')
...
This is the first line of the file.
Second line of the file
~~~

如果你想以列表的形式读取文件中的所有行，你也可以使用 `list(f)` 或 `f.readlines()`。

`f.write(string)` 会把 *string* 的内容写入到文件中，并返回写入的字符数。

~~~Python
>>> f.write('This is a test\n')
15
~~~

如果是在文本模式下，那么在写入文件之前，需要把对象转换成为文本形式，我们可以使用`str()`来进行转换。

~~~python
>>> value = ('the answer', 42)
>>> s = str(value)  # convert the tuple to string
>>> f.write(s)
18
~~~

使用`f.seek(offset, whence)`可以定位文件指针的位置，然后后续会从该位置开始进行读取操作。

*whence* 的 0 值表示从文件开头起算，1 表示使用当前文件位置，2 表示使用文件末尾作为参考点。 *whence* 如果省略则默认值为 0，即使用文件开头作为参考点。

~~~python
>>> f = open('workfile', 'rb+')
>>> f.write(b'0123456789abcdef')
16
>>> f.seek(5)      # Go to the 6th byte in the file
5
>>> f.read(1)
b'5'
>>> f.seek(-3, 2)  # Go to the 3rd byte before the end
13
>>> f.read(1)
b'd'
~~~

## 使用json

JSON是一个很方便进行信息交流的文件格式。我们看下怎么使用JSON来将对象转换为字符串：

~~~python
>>> import json
>>> json.dumps([1, 'simple', 'list'])
'[1, "simple", "list"]'
~~~

dumps是将对象转换为json str。 json还有一个dump方法，可以直接将对象存入到文件中。

~~~python
json.dump(x, f)
~~~

要从文件中解析出json字符串，可以使用load：

~~~python
x = json.load(f)
~~~

> JSON 中的键-值对中的键永远是 `str`类型的。当一个对象被转化为 JSON 时，字典中所有的键都会被强制转换为字符串。这所造成的结果是字典被转换为 JSON 然后转换回字典时可能和原来的不相等。换句话说，如果 x 具有非字符串的键，则有 `loads(dumps(x)) != x`。


> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

