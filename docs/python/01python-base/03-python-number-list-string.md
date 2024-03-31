---
slug: /03-python-number-list-string
---

# 3. Python基础之:数字字符串和列表



# 简介

Python的主要应用是进行科学计算，科学计算的基础就是数字，字符串和列表。本文将会详细的给大家介绍一下这三个数据类型的使用情况。

# 数字

数字是任何科学计算中非常中要的类型，在Python中最常见的数字类型就是int和float。

看几个基本的数字操作：

~~~shell
In [8]: 1+1
Out[8]: 2

In [9]: 3*2 + 10
Out[9]: 16

In [10]: (65 + 23) / 4
Out[10]: 22.0
~~~

上面我们可以看到，没有小数的是int类型，带有小数的是float类型。

除法运算 (`/`) 永远返回浮点数类型。如果要做 floor division得到一个整数结果（忽略小数部分）你可以使用 `//` 运算符；如果要计算余数，可以使用 `%`

~~~shell
In [11]: 54 / 4
Out[11]: 13.5

In [12]: 54 // 4
Out[12]: 13

In [13]: 54 % 4
Out[13]: 2
~~~

** 可以表示乘方运算：

~~~shell
In [14]: 4 ** 3
Out[14]: 64
~~~

我们可以将数字的运算赋值给特定的变量，并且可以使用该变量进行后续的运算。

~~~shell
In [15]: a = 12

In [16]: b = 14

In [17]: a * b
Out[17]: 168
~~~

在交互式环境中，_表示上一个输出：

~~~shell
In [17]: a * b
Out[17]: 168

In [18]: 100 + _
Out[18]: 268
~~~

除了int和float，Python还支持其他的数据类型，比如Decimal和Fraction，甚至还支持复数。

# 字符串

Python中字符串有三种表示形式，可以使用单引号，双引号和三引号来表示。

~~~shell
In [19]: site1 = 'www.flydean.com'

In [20]: site2= "www.flydean.com"

In [21]: site3= """www.flydean.com"""
~~~

三引号主要用于跨行输出，字符串中的回车换行会自动包含到字符串中，如果不想包含，在行尾添加一个 `\` 即可。如下:

~~~shell
print("""\
Usage: thingy [OPTIONS]
     -h                        Display this usage message
     -H hostname               Hostname to connect to
""")
~~~

如果需要转义的话，可以使用反斜杠 \ 

~~~shell
In [22]: site4 = "www.\"flydean\".com"

In [23]: site4
Out[23]: 'www."flydean".com'
~~~

如果你不希望前置了 `\` 的字符转义成特殊字符，可以使用 *原始字符串* 方式，在引号前添加 `r` 即可:

~~~shell
In [24]: print(r"www.\"flydean\".com")
www.\"flydean\".com
~~~

字符串通过 + 来进行连接，也可以使用 * 来进行复制：

~~~shell
In [25]: "www" + "flydean.com"
Out[25]: 'wwwflydean.com'

In [26]: "www.flydean.com" * 3
Out[26]: 'www.flydean.comwww.flydean.comwww.flydean.com'
~~~

相邻的两个或多个 *字符串字面值* （引号引起来的字符）将会自动连接到一起.

~~~shell
In [27]: "www" "flydean.com"
Out[27]: 'wwwflydean.com'
~~~

> 注意，上面的自动连接操作，只能对两个字面量有效，如果是变量的话则会报错。

字符串会被看做是由字符组成的数组，所以可以通过string[index]的形式来进行访问。

~~~shell
In [28]: site5 = "www.flydean.com"

In [29]: site5[3]
Out[29]: '.'
~~~

如果索引是负数的话，会从右边开始计数：

~~~shell
In [30]: site5[-3]
Out[30]: 'c'
~~~

因为-0 和 0 是一样的，所以负数是从 -1 开始的。

除了索引，字符串还支持 *切片*。索引可以得到单个字符，而 *切片* 可以获取子字符串:

~~~shell
In [31]: site5[1:5]
Out[31]: 'ww.f'
~~~

注意切片的开始总是被包括在结果中，而结束不被包括。这使得 `s[:i] + s[i:]` 总是等于 `s`

~~~shell
In [33]: site5[:4]+site5[4:]
Out[33]: 'www.flydean.com'
~~~

切片的索引有默认值，省略开始索引时默认为0。

如果索引超出了字符串的范围就会发送越界错误。

~~~shell
In [34]: site5[100]
---------------------------------------------------------------------------
IndexError                                Traceback (most recent call last)
<ipython-input-34-fc1f475f725b> in <module>()
----> 1 site5[100]

IndexError: string index out of range
~~~

但是，切片中的越界索引会被自动处理:

~~~shell
In [36]: site5[:100]
Out[36]: 'www.flydean.com'
~~~

因为字符串是不可变的，所以我们不能通过索引的形式来对字符串进行修改：

~~~shell
In [37]: site[2] = "A"
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-37-9147d44bd80c> in <module>()
----> 1 site[2] = "A"

TypeError: 'str' object does not support item assignment
~~~

len用来统计字符串的长度：

~~~shell
In [38]: len(site5)
Out[38]: 15
~~~

# 字符串对象str

字符串的本质是字符串对象str。

可以看下str的基本方法：

~~~shell
In [39]: site5.
           capitalize()   encode()       format()       isalpha()      islower()      istitle()      lower()        replace()      rpartition()   splitlines()   title()
           casefold()     endswith()     format_map()   isdecimal()    isnumeric()    isupper()      lstrip()       rfind()        rsplit()       startswith()   translate()
           center()       expandtabs()   index()        isdigit()      isprintable()  join()         maketrans()    rindex()       rstrip()       strip()        upper()
           count()        find()         isalnum()      isidentifier() isspace()      ljust()        partition()    rjust()        split()        swapcase()     zfill()
~~~

感兴趣的同学可以自行去研究。

# 列表

列表是用方括号表示的数据的集合。列表中的数据可以是多种数据类型，但是一般情况下，我们在一个列表中使用同一个数据类型。

~~~shell
In [40]: ages = [ 10, 14, 18, 20 ,25]

In [41]: ages
Out[41]: [10, 14, 18, 20, 25]
~~~

和字符串一样，列表也支持索引和切片。事实上，只要是 [sequence](https://docs.python.org/zh-cn/3.9/glossary.html#term-sequence)  类型的数据类型，都支持索引和切片。

~~~shell
In [42]: ages[3]
Out[42]: 20

In [43]: ages[:2]
Out[43]: [10, 14]

In [44]: ages[:]
Out[44]: [10, 14, 18, 20, 25]
~~~

> 注意，列表的切片会返回一个新的列表。但是这个新的列表是浅拷贝，意味着新列表的元素是原列表中元素的引用。

列表还支持拼接操作：

~~~shell
In [45]: ages + [9, 11]
Out[45]: [10, 14, 18, 20, 25, 9, 11]
~~~

和String的不可变性不同，列表是可变的，这就意味着我们可以通过索引来修改列表的值：

~~~shell
In [46]: ages[0] = 100

In [47]: ages
Out[47]: [100, 14, 18, 20, 25]
~~~

列表的底层类型是list，我们可以看下list中的方法：

~~~shell
In [51]: ages.
               append()  count()   insert()  reverse()
               clear()   extend()  pop()     sort()
               copy()    index()   remove()
~~~

我们可以使用append来附加list的值，也可以使用count来统计list的元素个数等等。

上面我们提到了，列表的切片是原列表的引用，所以我们可以通过给切片赋值，来修改原始列表的值：

~~~shell
>>> letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
>>> letters
['a', 'b', 'c', 'd', 'e', 'f', 'g']
>>> # replace some values
>>> letters[2:5] = ['C', 'D', 'E']
>>> letters
['a', 'b', 'C', 'D', 'E', 'f', 'g']
>>> # now remove them
>>> letters[2:5] = []
>>> letters
['a', 'b', 'f', 'g']
>>> # clear the list by replacing all the elements with an empty list
>>> letters[:] = []
>>> letters
[]
~~~

列表还可以进行嵌套，构建多层的列表：

~~~shell
>>> a = ['a', 'b', 'c']
>>> n = [1, 2, 3]
>>> x = [a, n]
>>> x
[['a', 'b', 'c'], [1, 2, 3]]
>>> x[0]
['a', 'b', 'c']
>>> x[0][1]
'b'
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
