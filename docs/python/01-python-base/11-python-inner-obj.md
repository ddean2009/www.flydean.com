---
slug: /11-python-inner-obj
---

# 11. Python基础之:Python中的内部对象



# 简介

Python中内置了很多非常有用的对象，本文将会介绍Python中的内置函数，内置常量，内置类型和内置异常。

# 内置函数

Python 解释器内置了很多函数和类型，您可以在任何时候使用它们。

|               |             | 内置函数     |              |                |
| :------------ | :---------- | :----------- | :----------- | :------------- |
| abs()         | delattr()   | hash()       | memoryview() | set()          |
| all()         | dict()      | help()       | min()        | setattr()      |
| any()         | dir()       | hex()        | next()       | slice()        |
| ascii()       | divmod()    | id()         | object()     | sorted()       |
| bin()         | enumerate() | input()      | oct()        | staticmethod() |
| bool()        | eval()      | int()        | open()       | str()          |
| breakpoint()  | exec()      | isinstance() | ord()        | sum()          |
| bytearray()   | filter()    | issubclass() | pow()        | super()        |
| bytes()       | float()     | iter()       | print()      | tuple()        |
| callable()    | format()    | len()        | property()   | type()         |
| chr()         | frozenset() | list()       | range()      | vars()         |
| classmethod() | getattr()   | locals()     | repr()       | zip()          |
| compile()     | globals()   | map()        | reversed()   | `__import__()` |
| complex()     | hasattr()   | max()        | round()      |                |

# 内置常量

Python中内置了少量的常量，我们可以直接在代码中使用他们。

* **False**

表示的是bool类型的假值。

* **True**

表示的是bool类型的真值。

* **None**

是NoneType类型的唯一值。None表示缺少值。

* **NotImplemented**

是`__eq__()`, `__lt__()`, `__add__()`, `__rsub__()`的特殊返回值，表示会在假值的时候返回**NotImplemented**。

* **Ellipsis**

等同于字面值 `…` ，主要与用户定义的容器数据类型的扩展切片语法结合使用。

* **`__debug__`**

编译器内部的变量，用来表示是否开启debug模式。

# 内置类型

python中的主要内置类型有数字、序列、映射、类、实例和异常。

## 逻辑值检测

在python中，任何对象都可以做逻辑值的检测。

一个对象在默认情况下均被视为真值，除非当该对象被调用时其所属类定义了 `__bool__()`方法且返回 `False` 或是定义了 `__len__()` 方法且返回零。

下面是集中被认为是false值的对象：

- 被定义为假值的常量: `None` 和 `False`。
- 任何数值类型的零: `0`, `0.0`, `0j`, `Decimal(0)`, `Fraction(0, 1)`
- 空的序列和多项集: `''`, `()`, `[]`, `{}`, `set()`, `range(0)`

### 逻辑值的布尔运算

布尔运算主要有 or, not和and：

| 运算      | 结果                                       |
| :-------- | :----------------------------------------- |
| `x or y`  | if *x* is false, then *y*, else *x*        |
| `x and y` | if *x* is false, then *x*, else *y*        |
| `not x`   | if *x* is false, then `True`, else `False` |

### 比较运算

| 运算     | 含义           |
| :------- | :------------- |
| `<`      | 严格小于       |
| `<=`     | 小于或等于     |
| `>`      | 严格大于       |
| `>=`     | 大于或等于     |
| `==`     | 等于           |
| `!=`     | 不等于         |
| `is`     | 对象标识       |
| `is not` | 否定的对象标识 |

具有不同标识的类的实例比较结果通常为不相等，除非类定义了 `__eq__()`方法。

## 数字类型

Python中有三种不同的数据类型：*整数*, *浮点数* 和 *复数*。

所有数字类型（复数除外）都支持下列运算：

| 运算     | 结果               |
| :------- | :----------------- |
| `x + y`  | *x* 和 *y* 的和    |
| `x - y`  | *x* 和 *y* 的差    |
| `x * y`  | *x* 和 *y* 的乘积  |
| `x / y`  | *x* 和 *y* 的商    |
| `x // y` | *x* 和 *y* 的商数  |
| `x % y`  | `x / y` 的余数     |
| `-x`     | *x* 取反           |
| `+x`     | *x* 不变           |
| `abs(x)` | *x* 的绝对值或大小 |

对于int 和 float 还支持下面的运算：

| 运算            | 结果                                                         |
| :-------------- | :----------------------------------------------------------- |
| `math.trunc(x)` | *x* 截断为 `Integral`                                        |
| `Round(x[, n])` | *x* 舍入到 *n* 位小数，半数值会舍入到偶数。 如果省略 *n*，则默认为 0。 |
| `math.floor(x)` | <= x 的最大 `Integral`                                       |
| `math.ceil(x)`  | >= x 的最小 `Integral`                                       |

### 整数类型的位运算

对于整数来说，还支持位运算：

| 运算     | 结果                   |
| :------- | :--------------------- |
| `x | y`  | *x* 和 *y* 按位 *或*   |
| `x ^ y`  | *x* 和 *y* 按位 *异或* |
| `x & y`  | *x* 和 *y* 按位 *与*   |
| `x << n` | *x* 左移 *n* 位        |
| `x >> n` | *x* 右移 *n* 位        |
| `~x`     | *x* 逐位取反           |

### 整数类型的附加方法

int 还有一些额外的方法：

`int.bit_length`()

返回以二进制表示一个整数所需要的位数，不包括符号位和前面的零:

~~~python
>>> n = -37
>>> bin(n)
'-0b100101'
>>> n.bit_length()
6
~~~

`int.to_bytes`(*length*, *byteorder*, *, *signed=False*)

返回表示一个整数的字节数组。

~~~python
(1024).to_bytes(2, byteorder='big')
b'\x04\x00'
(1024).to_bytes(10, byteorder='big')
b'\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00'
(-1024).to_bytes(10, byteorder='big', signed=True)
b'\xff\xff\xff\xff\xff\xff\xff\xff\xfc\x00'
x = 1000
x.to_bytes((x.bit_length() + 7) // 8, byteorder='little')
b'\xe8\x03'
~~~

*byteorder* 参数确定用于表示整数的字节顺序。 如果 *byteorder* 为 `"big"`，则最高位字节放在字节数组的开头。 如果 *byteorder* 为 `"little"`，则最高位字节放在字节数组的末尾。

*signed* 参数确定是否使用二的补码来表示整数。 

### 浮点类型的附加方法

`float.is_integer`()

如果 float 实例可用有限位整数表示则返回 `True`，否则返回 `False`:

~~~python
>>> (-2.0).is_integer()
True
>>> (3.2).is_integer()
False
~~~

`float.hex`()

以十六进制字符串的形式返回一个浮点数表示。

## 迭代器

迭代器主要用在容器的遍历中。

如果容器需要提供迭代支持，必须定义下面的方法：

`container.__iter__`()

这个方法返回一个迭代器对象。这个迭代器对象需要提供下面的两个方法：

`iterator.__iter__`()

返回迭代器对象本身。

`iterator.__next__`()

从容器中返回下一项。

## 序列类型

有三种基本序列类型：list, tuple 和 range 对象。 

下面是通用的序列操作：

| 运算                   | 结果                                                         |
| :--------------------- | :----------------------------------------------------------- |
| `x in s`               | 如果 *s* 中的某项等于 *x* 则结果为 `True`，否则为 `False`    |
| `x not in s`           | 如果 *s* 中的某项等于 *x* 则结果为 `False`，否则为 `True`    |
| `s + t`                | *s* 与 *t* 相拼接                                            |
| `s * n` 或 `n * s`     | 相当于 *s* 与自身进行 *n* 次拼接                             |
| `s[i]`                 | *s* 的第 *i* 项，起始为 0                                    |
| `s[i:j]`               | *s* 从 *i* 到 *j* 的切片                                     |
| `s[i:j:k]`             | *s* 从 *i* 到 *j* 步长为 *k* 的切片                          |
| `len(s)`               | *s* 的长度                                                   |
| `min(s)`               | *s* 的最小项                                                 |
| `max(s)`               | *s* 的最大项                                                 |
| `s.index(x[, i[, j]])` | *x* 在 *s* 中首次出现项的索引号（索引号在 *i* 或其后且在 *j* 之前） |
| `s.count(x)`           | *x* 在 *s* 中出现的总次数                                    |

可变序列类型的操作：

| 运算                      | 结果                                                         |
| :------------------------ | :----------------------------------------------------------- |
| `s[i] = x`                | 将 *s* 的第 *i* 项替换为 *x*                                 |
| `s[i:j] = t`              | 将 *s* 从 *i* 到 *j* 的切片替换为可迭代对象 *t* 的内容       |
| `del s[i:j]`              | 等同于 `s[i:j] = []`                                         |
| `s[i:j:k] = t`            | 将 `s[i:j:k]` 的元素替换为 *t* 的元素                        |
| `del s[i:j:k]`            | 从列表中移除 `s[i:j:k]` 的元素                               |
| `s.append(x)`             | 将 *x* 添加到序列的末尾 (等同于 `s[len(s):len(s)] = [x]`)    |
| `s.clear()`               | 从 *s* 中移除所有项 (等同于 `del s[:]`)                      |
| `s.copy()`                | 创建 *s* 的浅拷贝 (等同于 `s[:]`)                            |
| `s.extend(t)` 或 `s += t` | 用 *t* 的内容扩展 *s* (基本上等同于 `s[len(s):len(s)] = t`)  |
| `s *= n`                  | 使用 *s* 的内容重复 *n* 次来对其进行更新                     |
| `s.insert(i, x)`          | 在由 *i* 给出的索引位置将 *x* 插入 *s* (等同于 `s[i:i] = [x]`) |
| `s.pop([i])`              | 提取在 *i* 位置上的项，并将其从 *s* 中移除                   |
| `s.remove(x)`             | 删除 *s* 中第一个 `s[i]` 等于 *x* 的项目。                   |
| `s.reverse()`             | 就地将列表中的元素逆序。                                     |

序列类型包括列表，元组，range对象和文本序列str。

这里重点看下str的方法：

| 运算                                                | 结果                                                         |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `str.capitalize`()                                  | 返回原字符串的副本，其首个字符大写，其余为小写。             |
| `str.casefold`()                                    | 返回原字符串消除大小写的副本。 消除大小写的字符串可用于忽略大小写的匹配。 |
| str.center(width[, fillchar])                       | 返回长度为 *width* 的字符串，原字符串在其正中。 使用指定的 *fillchar* 填充两边的空位（默认使用 ASCII 空格符）。 如果 *width* 小于等于 `len(s)` 则返回原字符串的副本。 |
| `str.count`(*sub*[, *start*[, *end*]])              | 反回子字符串 *sub* 在 [*start*, *end*] 范围内非重叠出现的次数。 可选参数 *start* 与 *end* 会被解读为切片表示法。 |
| `str.encode`(*encoding="utf-8"*, *errors="strict"*) | 返回原字符串编码为字节串对象的版本。 默认编码为 'utf-8'。errors 的默认值为 'strict'，表示编码错误会引发 UnicodeError。 其他可用的值为 'ignore', 'replace', 'xmlcharrefreplace', 'backslashreplace' 以及任何其他通过 codecs.register_error() 注册的值 |
| `str.endswith`(*suffix*[, *start*[, *end*]])        | 如果字符串以指定的 *suffix* 结束返回 `True`，否则返回 `False`。 *suffix* 也可以为由多个供查找的后缀构成的元组。 |
| `str.expandtabs`(*tabsize=8*)                       | 返回字符串的副本，其中所有的制表符会由一个或多个空格替换，具体取决于当前列位置和给定的制表符宽度。 |
| str.find(sub[, start[, end]])                       | 返回子字符串 *sub* 在 `s[start:end]` 切片内被找到的最小索引。 |
| str.format(args*, *kwargs*)                         | 执行字符串格式化操作。                                       |
| `str.format_map`(*mapping*)                         | 类似于 str.format(**mapping)，不同之处在于 mapping 会被直接使用而不是复制到一个 dict。 |
| `str.index`(*sub*[, *start*[, *end*]])              | 类似于 find()，但在找不到子类时会引发 ValueError。           |
| `str.isalnum`()                                     | 如果字符串中的所有字符都是字母或数字且至少有一个字符，则返回 `True` ， 否则返回 `False` 。 |
| str.isalpha()                                       | 如果字符串中的所有字符都是字母，并且至少有一个字符，返回 `True` ，否则返回 `False` 。 |
| str.isascii()                                       | 如果字符串为空或字符串中的所有字符都是 ASCII ，返回 `True` ，否则返回 `False` 。 |
| str.isdecimal()                                     | 如果字符串中的所有字符都是十进制字符且该字符串至少有一个字符，则返回 `True` ， 否则返回 `False` 。 |
| `str.isdigit`()                                     | 如果字符串中的所有字符都是数字，并且至少有一个字符，返回 `True` ，否则返回 `False` 。 |
| `str.isidentifier`()                                | 如果字符串是有效的标识符，返回 `True`                        |
| `str.islower`()                                     | 如果字符串中至少有一个区分大小写的字符 且此类字符均为小写则返回 True ，否则返回 False 。 |
| `str.isnumeric`()                                   | 如果字符串中至少有一个字符且所有字符均为数值字符则返回 `True` ，否则返回 `False` 。 |
| str.isprintable()                                   | 如果字符串中所有字符均为可打印字符或字符串为空则返回 `True` ，否则返回 `False` 。 |
| str.isspace()                                       | 如果字符串中只有空白字符且至少有一个字符则返回 `True` ，否则返回 `False` 。 |
| `str.istitle`()                                     | 如果字符串中至少有一个字符且为标题字符串则返回 True ，例如大写字符之后只能带非大写字符而小写字符必须有大写字符打头。 否则返回 False 。 |
| str.isupper()                                       | 如果字符串中至少有一个区分大小写的字符 4 且此类字符均为大写则返回 True ，否则返回 False 。 |
| str.join(iterable)                                  | 返回一个由 *iterable* 中的字符串拼接而成的字符串。           |
| `str.ljust`(*width*[, *fillchar*])                  | 返回长度为 *width* 的字符串，原字符串在其中靠左对齐。        |
| `str.lower`()                                       | 返回原字符串的副本，其所有区分大小写的字符 均转换为小写。    |
| `str.lstrip`([*chars*])                             | 返回原字符串的副本，移除其中的前导字符。                     |
| `str.partition`(*sep*)                              | 在 *sep* 首次出现的位置拆分字符串，返回一个 3 元组，其中包含分隔符之前的部分、分隔符本身，以及分隔符之后的部分。 |
| str.removeprefix(prefix, /)                         | 如果字符串以 *前缀* 字符串开头，返回 `string[len(prefix):]` 。否则，返回原始字符串的副本 |
| `str.removesuffix`(*suffix*, */*)                   | 如果字符串以 *后缀* 字符串结尾，并且 *后缀* 非空，返回 `string[:-len(suffix)]` 。否则，返回原始字符串的副本 |
| str.replace(old, new[, count])                      | 返回字符串的副本，其中出现的所有子字符串 *old* 都将被替换为 *new*。 如果给出了可选参数 *count*，则只替换前 *count* 次出现。 |
| `str.rfind`(*sub*[, *start*[, *end*]])              | 返回子字符串 *sub* 在字符串内被找到的最大（最右）索引，这样 *sub* 将包含在 `s[start:end]` 当中。 |
| `str.rindex`(*sub*[, *start*[, *end*]])             | 类似于 rfind()，但在子字符串 sub 未找到时会引发 ValueError。 |
| str.rjust(width[, fillchar])                        | 返回长度为 *width* 的字符串，原字符串在其中靠右对齐。        |
| str.rpartition(sep)                                 | 在 *sep* 最后一次出现的位置拆分字符串，返回一个 3 元组，其中包含分隔符之前的部分、分隔符本身，以及分隔符之后的部分。 如果分隔符未找到，则返回的 3 元组中包含两个空字符串以及字符串本身。 |
| `str.rsplit`(*sep=None*, *maxsplit=-1*)             | 返回一个由字符串内单词组成的列表，使用 *sep* 作为分隔字符串。 如果给出了 *maxsplit*，则最多进行 *maxsplit* 次拆分，从 *最右边* 开始。 |
| `str.rstrip`([*chars*])                             | 返回原字符串的副本，移除其中的末尾字符。                     |
| str.split(sep=None, maxsplit=-1)                    | 返回一个由字符串内单词组成的列表，使用 *sep* 作为分隔字符串。 如果给出了 *maxsplit*，则最多进行 *maxsplit* 次拆分（因此，列表最多会有 `maxsplit+1` 个元素）。 如果 *maxsplit* 未指定或为 `-1`，则不限制拆分次数（进行所有可能的拆分）。 |
| str.splitlines([keepends])                          | 返回由原字符串中各行组成的列表，在行边界的位置拆分。 结果列表中不包含行边界，除非给出了 *keepends* 且为真值。 |
| str.startswith(prefix[, start[, end]])              | 如果字符串以指定的 *prefix* 开始则返回 `True`，否则返回 `False`。 *prefix* 也可以为由多个供查找的前缀构成的元组。 如果有可选项 *start*，将从所指定位置开始检查。 如果有可选项 *end*，将在所指定位置停止比较。 |
| `str.strip`([*chars*])                              | 返回原字符串的副本，移除其中的前导和末尾字符。 *chars* 参数为指定要移除字符的字符串。 如果省略或为 `None`，则 *chars* 参数默认移除空格符。 实际上 *chars* 参数并非指定单个前缀或后缀；而是会移除参数值的所有组合: |
| str.swapcase()                                      | 返回原字符串的副本，其中大写字符转换为小写，反之亦然。       |
| `str.title`()                                       | 返回原字符串的标题版本，其中每个单词第一个字母为大写，其余字母为小写。 |
| `str.upper`()                                       | 返回原字符串的副本，其中所有区分大小写的字符均转换为大写。   |
| `str.zfill`(*width*)                                | 返回原字符串的副本，在左边填充 ASCII `'0'` 数码使其长度变为 *width*。 正负值前缀 (`'+'`/`'-'`) 的处理方式是在正负符号 *之后* 填充而非在之前。 如果 *width* 小于等于 `len(s)` 则返回原字符串的副本。 |

还包括几个二进制序列类型：  `bytes`, `bytearray`, `memoryview`。

bytes 对象是由单个字节构成的不可变序列。

表示 bytes 字面值的语法与字符串字面值的大致相同，只是添加了一个 `b` 前缀。

bytearray 对象是 `bytes` 对象的可变对应物。bytearray 对象没有专属的字面值语法，它们总是通过调用构造器来创建。

我们看下bytes和bytearray的基本操作：

| 运算                                                | 描述                                                         |
| --------------------------------------------------- | ------------------------------------------------------------ |
| bytearray.count(sub[, start[, end]])                | 返回子序列 *sub* 在 [*start*, *end*] 范围内非重叠出现的次数。 可选参数 *start* 与 *end* 会被解读为切片表示法。 |
| bytearray.removeprefix(prefix, /)                   | 如果二进制数据以 *前缀* 字符串开头，返回 `bytes[len(prefix):]` 。否则，返回原始二进制数据的副本 |
| bytearray.removesuffix(suffix, /)                   | 如果二进制数据以 *后缀* 字符串结尾，并且 *后缀* 非空，返回 `bytes[:-len(suffix)]` 。否则，返回原始二进制数据的副本 |
| bytearray.decode(encoding="utf-8", errors="strict") | 返回从给定 bytes 解码出来的字符串。 默认编码为 `'utf-8'`。   |
| bytearray.endswith(suffix[, start[, end]])          | 如果二进制数据以指定的 *suffix* 结束则返回 `True`，否则返回 `False`。 |
| bytearray.find(sub[, start[, end]])                 | 返回子序列 *sub* 在数据中被找到的最小索引，*sub* 包含于切片 `s[start:end]` 之内。 |
| bytearray.index(sub[, start[, end]])                | 类似于 find()，但在找不到子序列时会引发 ValueError。         |
| bytearray.join(iterable)                            | 返回一个由 *iterable* 中的二进制数据序列拼接而成的 bytes 或 bytearray 对象。 |
| bytearray.maketrans(from, to)                       | 返回一个可用于 bytes.translate() 的转换对照表，它将把 from 中的每个字符映射为 to 中相同位置上的字符；from 与 to 必须都是 字节类对象 并且具有相同的长度。 |
| bytearray.partition(sep)                            | 在 *sep* 首次出现的位置拆分序列，返回一个 3 元组，其中包含分隔符之前的部分、分隔符本身或其 bytearray 副本，以及分隔符之后的部分。 |
| bytearray.replace(old, new[, count])                | 返回序列的副本，其中出现的所有子序列 *old* 都将被替换为 *new*。 如果给出了可选参数 *count*，则只替换前 *count* 次出现。 |
| bytearray.rfind(sub[, start[, end]])                | 返回子序列 *sub* 在序列内被找到的最大（最右）索引，这样 *sub* 将包含在 `s[start:end]` 当中。 可选参数 *start* 与 *end* 会被解读为切片表示法。 如果未找到则返回 `-1`。 |
| bytearray.rindex(sub[, start[, end]])               | 类似于 rfind()，但在子序列 sub 未找到时会引发 ValueError。   |
| bytearray.rpartition(sep)                           | 在 *sep* 最后一次出现的位置拆分序列，返回一个 3 元组，其中包含分隔符之前的部分，分隔符本身或其 bytearray 副本，以及分隔符之后的部分。 |
| bytearray.startswith(prefix[, start[, end]])        | 如果二进制数据以指定的 *prefix* 开头则返回 `True`，否则返回 `False`。 |
| bytearray.translate(table, /, delete=b'')           | 返回原 bytes 或 bytearray 对象的副本，移除其中所有在可选参数 *delete* 中出现的 bytes，其余 bytes 将通过给定的转换表进行映射，该转换表必须是长度为 256 的 bytes 对象。 |
| bytearray.center(width[, fillbyte])                 | 返回原对象的副本，在长度为 width 的序列内居中，使用指定的 fillbyte 填充两边的空位（默认使用 ASCII 空格符）。 对于 bytes 对象，如果 width 小于等于 len(s) 则返回原序列的副本。 |
| bytearray.ljust(width[, fillbyte])                  | 返回原对象的副本，在长度为 *width* 的序列中靠左对齐。        |
| bytearray.lstrip([chars])                           | 返回原序列的副本，移除指定的前导字节。                       |
| bytearray.rjust(width[, fillbyte])                  | 返回原对象的副本，在长度为 *width* 的序列中靠右对齐。        |
| bytearray.rsplit(sep=None, maxsplit=-1)             | 将二进制序列拆分为相同类型的子序列，使用 *sep* 作为分隔符。  |
| bytearray.rstrip([chars])                           | 返回原序列的副本，移除指定的末尾字节。                       |
| bytearray.split(sep=None, maxsplit=-1)              | 将二进制序列拆分为相同类型的子序列，使用 *sep* 作为分隔符。  |
| bytearray.strip([chars])                            | 返回原序列的副本，移除指定的开头和末尾字节。                 |
| bytearray.capitalize()                              | 返回原序列的副本，其中每个字节将都将被解读为一个 ASCII 字符，并且第一个字节的字符大写而其余的小写。 非 ASCII 字节值将保持原样不变。 |
| bytearray.expandtabs(tabsize=8)                     | 返回序列的副本，其中所有的 ASCII 制表符会由一个或多个 ASCII 空格替换，具体取决于当前列位置和给定的制表符宽度。 |
| bytearray.isalnum()                                 | 如果序列中所有字节都是字母类 ASCII 字符或 ASCII 十进制数码并且序列非空则返回 `True` ，否则返回 `False` 。 |
| bytearray.isalpha()                                 | 如果序列中所有字节都是字母类 ASCII 字符并且序列不非空则返回 `True` ，否则返回 `False` 。 |
| bytearray.isascii()                                 | 如果序列为空或序列中所有字节都是 ASCII 字节则返回 `True` ，否则返回 `False` 。 |
| bytearray.isdigit()                                 | 如果序列中所有字节都是 ASCII 十进制数码并且序列非空则返回 `True` ，否则返回 `False` 。 |
| bytearray.islower()                                 | 如果序列中至少有一个小写的 ASCII 字符并且没有大写的 ASCII 字符则返回 `True` ，否则返回 `False` 。 |
| `bytearray.isspace`()                               | 如果序列中所有字节都是 ASCII 空白符并且序列非空则返回 `True` ，否则返回 `False` 。 |
| bytearray.istitle()                                 | 如果序列为 ASCII 标题大小写形式并且序列非空则返回 `True` ，否则返回 `False` 。 |
| bytearray.isupper()                                 | 如果序列中至少有一个大写字母 ASCII 字符并且没有小写 ASCII 字符则返回 `True` ，否则返回 `False` 。 |
| bytearray.lower()                                   | 返回原序列的副本，其所有大写 ASCII 字符均转换为对应的小写形式。 |
| bytearray.splitlines(keepends=False)                | 返回由原二进制序列中各行组成的列表，在 ASCII 行边界符的位置拆分。 |
| bytearray.swapcase()                                | 返回原序列的副本，其所有小写 ASCII 字符均转换为对应的大写形式，反之亦反。 |
| bytearray.title()                                   | 返回原二进制序列的标题版本，其中每个单词以一个大写 ASCII 字符为开头，其余字母为小写。 不区别大小写的字节值将保持原样不变。 |
| bytearray.upper()                                   | 返回原序列的副本，其所有小写 ASCII 字符均转换为对应的大写形式。 |
| bytearray.zfill(width)                              | 返回原序列的副本，在左边填充 `b'0'` 数码使序列长度为 *width*。 正负值前缀 (`b'+'`/ `b'-'`) 的处理方式是在正负符号 *之后* 填充而非在之前。 |
|                                                     |                                                              |

memoryview 对象允许 Python 代码访问一个对象的内部数据，只要该对象支持 缓冲区协议 而无需进行拷贝。

 obj 必须支持缓冲区协议。 支持缓冲区协议的内置对象包括 bytes 和 bytearray。

## 集合类型

集合中存放的是不重复的数据。主要有set 和 frozenset两种。

set 类型是可变的 --- 其内容可以使用 add() 和 remove() 这样的方法来改变。 由于是可变类型，它没有哈希值，且不能被用作字典的键或其他集合的元素。 

frozenset 类型是不可变并且为 hashable --- 其内容在被创建后不能再改变；因此它可以被用作字典的键或其他集合的元素。

看下集合的基本操作：

| 运算                                         | 描述                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| len(s)                                       | 返回集合 *s* 中的元素数量（即 *s* 的基数）。                 |
| x in s                                       | 检测 *x* 是否为 *s* 中的成员。                               |
| x not in s                                   | 检测 *x* 是否非 *s* 中的成员。                               |
| isdisjoint(other)                            | 如果集合中没有与 *other* 共有的元素则返回 `True`。 当且仅当两个集合的交集为空集合时，两者为不相交集合。 |
| issubset(other) 或者 set <= other            | 检测是否集合中的每个元素都在 *other* 之中。                  |
| set < other                                  | 检测集合是否为 *other* 的真子集，即 `set <= other and set != other`。 |
| issuperset(other) 或者 set >= other          | 检测是否 *other* 中的每个元素都在集合之中。                  |
| set > other                                  | 检测集合是否为 *other* 的真超集，即 `set >= other and set != other`。 |
| union(*others) 或者 set \| other \| ...      | 返回一个新集合，其中包含来自原集合以及 others 指定的所有集合中的元素。 |
| intersection(*others) 或者set & other & ...  | 返回一个新集合，其中包含原集合以及 others 指定的所有集合中共有的元素。 |
| difference(*others) 或者 set - other - ...   | 返回一个新集合，其中包含原集合中在 others 指定的其他集合中不存在的元素。 |
| symmetric_difference(other) 或者 set ^ other | 返回一个新集合，其中的元素或属于原集合或属于 *other* 指定的其他集合，但不能同时属于两者。 |
| copy()                                       | 返回原集合的浅拷贝。                                         |

## 映射类型

python中的映射类型是dict。只要是hashable的对象都可以作为dict的key。

字典可用多种方式来创建:

- 使用花括号内以逗号分隔 `键: 值` 对的方式: `{'jack': 4098, 'sjoerd': 4127}` or `{4098: 'jack', 4127: 'sjoerd'}`
- 使用字典推导式: `{}`, `{x: x ** 2 for x in range(10)}`
- 使用类型构造器: `dict()`, `dict([('foo', 100), ('bar', 200)])`, `dict(foo=100, bar=200)`

如果没有给出位置参数，将创建一个空字典。

字典的操作：

| 运算                             | 描述                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| **list(d)**                      | 返回字典 *d* 中使用的所有键的列表。                          |
| **len(d)**                       | 返回字典 *d* 中的项数。                                      |
| **d[key]**                       | 返回 *d* 中以 *key* 为键的项。                               |
| **d[key] = value**               | 将 `d[key]` 设为 *value*。                                   |
| **del d[key]**                   | 将 `d[key]` 从 *d* 中移除。                                  |
| **key in d**                     | 如果 *d* 中存在键 *key* 则返回 `True`，否则返回 `False`。    |
| **key not in d**                 | 等价于 `not key in d`。                                      |
| **iter(d)**                      | 返回以字典的键为元素的迭代器。 这是 `iter(d.keys())` 的快捷方式。 |
| `clear`()                        | 移除字典中的所有元素。                                       |
| `copy`()                         | 返回原字典的浅拷贝。                                         |
| `get`(*key*[, *default*])        | 如果 *key* 存在于字典中则返回 *key* 的值，否则返回 *default*。 如果 *default* 未给出则默认为 `None` |
| `items`()                        | 返回由字典键组成的一个新视图。                               |
| `pop`(*key*[, *default*])        | 如果 *key* 存在于字典中则将其移除并返回其值，否则返回 *default*。 |
| `popitem`()                      | 从字典中移除并返回一个 `(键, 值)` 对。 键值对会按 LIFO 的顺序被返回。 |
| **reversed(d)**                  | 返回一个逆序获取字典键的迭代器。 这是 `reversed(d.keys())` 的快捷方式。 |
| `setdefault`(*key*[, *default*]) | 如果字典存在键 *key* ，返回它的值。如果不存在，插入值为 *default* 的键 *key* ，并返回 *default* 。 *default* 默认为 `None`。 |
| `update`([*other*])              | 使用来自 *other* 的键/值对更新字典，覆盖原有的键。 返回 `None`。 |
| `values`()                       | 返回由字典值组成的一个新视图。                               |
| **d \| other**                   | 合并 *d* 和 *other* 中的键和值来创建一个新的字典，两者必须都是字典。当 *d* 和 *other* 有相同键时， *other* 的值优先。 |
| **d \|= other**                  | 用 other 的键和值更新字典 d ，other 可以是 mapping 或 iterable 的键值对。当 d 和 other 有相同键时， other 的值优先。 |

### 字典视图对象

由 dict.keys(), dict.values() 和 dict.items() 所返回的对象是 视图对象。 该对象提供字典条目的一个动态视图，这意味着当字典改变时，视图也会相应改变。

字典视图可以被迭代以产生与其对应的数据，并支持成员检测：

| 运算                   | 描述                                                         |
| ---------------------- | ------------------------------------------------------------ |
| **len(dictview)**      | 返回字典中的条目数。                                         |
| **iter(dictview)**     | 返回字典中的键、值或项（以 `(键, 值)` 为元素的元组表示）的迭代器。 |
| **x in dictview**      | 如果 *x* 是对应字典中存在的键、值或项（在最后一种情况下 *x* 应为一个 `(键, 值)` 元组） 则返回 `True`。 |
| **reversed(dictview)** | 返回一个逆序获取字典键、值或项的迭代器。 视图将按与插入时相反的顺序进行迭代。 |

# 内置异常

Python中所有的异常都来自BaseException ，我们看下内置异常的层级结构：

~~~shell
BaseException
 +-- SystemExit
 +-- KeyboardInterrupt
 +-- GeneratorExit
 +-- Exception
      +-- StopIteration
      +-- StopAsyncIteration
      +-- ArithmeticError
      |    +-- FloatingPointError
      |    +-- OverflowError
      |    +-- ZeroDivisionError
      +-- AssertionError
      +-- AttributeError
      +-- BufferError
      +-- EOFError
      +-- ImportError
      |    +-- ModuleNotFoundError
      +-- LookupError
      |    +-- IndexError
      |    +-- KeyError
      +-- MemoryError
      +-- NameError
      |    +-- UnboundLocalError
      +-- OSError
      |    +-- BlockingIOError
      |    +-- ChildProcessError
      |    +-- ConnectionError
      |    |    +-- BrokenPipeError
      |    |    +-- ConnectionAbortedError
      |    |    +-- ConnectionRefusedError
      |    |    +-- ConnectionResetError
      |    +-- FileExistsError
      |    +-- FileNotFoundError
      |    +-- InterruptedError
      |    +-- IsADirectoryError
      |    +-- NotADirectoryError
      |    +-- PermissionError
      |    +-- ProcessLookupError
      |    +-- TimeoutError
      +-- ReferenceError
      +-- RuntimeError
      |    +-- NotImplementedError
      |    +-- RecursionError
      +-- SyntaxError
      |    +-- IndentationError
      |         +-- TabError
      +-- SystemError
      +-- TypeError
      +-- ValueError
      |    +-- UnicodeError
      |         +-- UnicodeDecodeError
      |         +-- UnicodeEncodeError
      |         +-- UnicodeTranslateError
      +-- Warning
           +-- DeprecationWarning
           +-- PendingDeprecationWarning
           +-- RuntimeWarning
           +-- SyntaxWarning
           +-- UserWarning
           +-- FutureWarning
           +-- ImportWarning
           +-- UnicodeWarning
           +-- BytesWarning
           +-- ResourceWarning
~~~

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
