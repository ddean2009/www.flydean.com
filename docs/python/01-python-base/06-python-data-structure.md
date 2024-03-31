---
slug: /06-python-data-structure
---

# 6. Python基础之:Python的数据结构



# 简介

不管是做科学计算还是编写应用程序，都需要使用到一些基本的数据结构，比如列表，元组，字典等。

本文将会详细讲解Python中的这些基础数据结构。

# 列表

列表也就是list，可以用方括号来表示：

~~~python
In [40]: ages = [ 10, 14, 18, 20 ,25]

In [41]: ages
Out[41]: [10, 14, 18, 20, 25]
~~~

list有一些非常有用的方法，比如**append**，**extend**，**insert**，**remove**，**pop**，**index**，**count**，**sort**，**reverse**，**copy**等。

举个例子：

~~~python
>>> fruits = ['orange', 'apple', 'pear', 'banana', 'kiwi', 'apple', 'banana']
>>> fruits.count('apple')
2
>>> fruits.count('tangerine')
0
>>> fruits.index('banana')
3
>>> fruits.index('banana', 4)  # Find next banana starting a position 4
6
>>> fruits.reverse()
>>> fruits
['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange']
>>> fruits.append('grape')
>>> fruits
['banana', 'apple', 'kiwi', 'banana', 'pear', 'apple', 'orange', 'grape']
>>> fruits.sort()
>>> fruits
['apple', 'apple', 'banana', 'banana', 'grape', 'kiwi', 'orange', 'pear']
>>> fruits.pop()
'pear'
~~~



## 列表作为栈使用

栈的特点是后进先出，而列表为我们提供了append和pop方法，所以使用列表来实现栈是非常简单的：

~~~python
>>> stack = [3, 4, 5]
>>> stack.append(6)
>>> stack.append(7)
>>> stack
[3, 4, 5, 6, 7]
>>> stack.pop()
7
>>> stack
[3, 4, 5, 6]
>>> stack.pop()
6
>>> stack.pop()
5
>>> stack
[3, 4]
~~~

## 列表作为队列使用

队列的特点是先进先出，但是使用列表在队列头部插入元素是很慢的，因为需要移动所有的元素。

我们可以使用 [`collections.deque`](https://docs.python.org/zh-cn/3.9/library/collections.html#collections.deque) 来快速的从两端操作：

~~~python
>>> from collections import deque
>>> queue = deque(["Eric", "John", "Michael"])
>>> queue.append("Terry")           # Terry arrives
>>> queue.append("Graham")          # Graham arrives
>>> queue.popleft()                 # The first to arrive now leaves
'Eric'
>>> queue.popleft()                 # The second to arrive now leaves
'John'
>>> queue                           # Remaining queue in order of arrival
deque(['Michael', 'Terry', 'Graham'])
~~~

## 列表推导式

要创建列表，通常的做法是使用for循环，来遍历列表，并为其设置值：

~~~python
>>> squares = []
>>> for x in range(10):
...     squares.append(x**2)
...
>>> squares
[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
~~~

或者我们可以使用列表推导式来更加简洁的生成列表：

~~~python
squares = [x**2 for x in range(10)]
~~~

列表推导式的结构是由一对方括号所包含的以下内容：一个表达式，后面跟一个 `for` 子句，然后是零个或多个 `for` 或 `if` 子句。

列表推导式将会遍历for字句中的元素，并且使用表达式来求值，将生成的元素作为新的列表元素返回。

看一个复杂点的：

~~~python
>>> [(x, y) for x in [1,2,3] for y in [3,1,4] if x != y]
[(1, 3), (1, 4), (2, 3), (2, 1), (2, 4), (3, 1), (3, 4)]
~~~

上面的表达式等价于：

~~~python
>>> combs = []
>>> for x in [1,2,3]:
...     for y in [3,1,4]:
...         if x != y:
...             combs.append((x, y))
...
>>> combs
[(1, 3), (1, 4), (2, 3), (2, 1), (2, 4), (3, 1), (3, 4)]
~~~

列表推导式还可以嵌套，假如我们有一个矩阵：

~~~python
>>> matrix = [
...     [1, 2, 3, 4],
...     [5, 6, 7, 8],
...     [9, 10, 11, 12],
... ]
~~~

可以使用下面的表达式将矩阵进行行列交换：

~~~python
>>> [[row[i] for row in matrix] for i in range(4)]
[[1, 5, 9], [2, 6, 10], [3, 7, 11], [4, 8, 12]]
~~~

或者使用更加简单的zip函数：

~~~python
>>> list(zip(*matrix))
[(1, 5, 9), (2, 6, 10), (3, 7, 11), (4, 8, 12)]
~~~

## del

删除列表中的某个元素可以使用del。del可以删除列表中的某个特定的值，也可以删除切片，甚至删除整个列表：

~~~python
>>> a = [-1, 1, 66.25, 333, 333, 1234.5]
>>> del a[0]
>>> a
[1, 66.25, 333, 333, 1234.5]
>>> del a[2:4]
>>> a
[1, 66.25, 1234.5]
>>> del a[:]
>>> a
[]

>>> del a
~~~

# 元组

元组跟列表很类似，不同的是元组是不可变的。

元组是以小括号来表示的，或者可以不使用括号。

~~~python
>>> t = 12345, 54321, 'hello!'
>>> t[0]
12345
>>> t
(12345, 54321, 'hello!')
>>> # Tuples may be nested:
... u = t, (1, 2, 3, 4, 5)
>>> u
((12345, 54321, 'hello!'), (1, 2, 3, 4, 5))
~~~

元组和List的操作很类似，都有切片和索引操作。

元组可以方便的进行解包：

~~~python
>>> x, y, z = t
~~~

# 集合

集合使用set函数或者花括号来表示的。

集合中的元素是不重复的，这个一点和java中的set很类似。

因为字典的表示也是花括号，所以如果你需要创建一个空集合的话，需要使用set，因为空的 {} 表示的是字典。

看一些集合的简单例子：

~~~python
>>> basket = {'apple', 'orange', 'apple', 'pear', 'orange', 'banana'}
>>> print(basket)                      # show that duplicates have been removed
{'orange', 'banana', 'pear', 'apple'}
>>> 'orange' in basket                 # fast membership testing
True
>>> 'crabgrass' in basket
False

>>> # Demonstrate set operations on unique letters from two words
...
>>> a = set('abracadabra')
>>> b = set('alacazam')
>>> a                                  # unique letters in a
{'a', 'r', 'b', 'c', 'd'}
>>> a - b                              # letters in a but not in b
{'r', 'd', 'b'}
>>> a | b                              # letters in a or b or both
{'a', 'c', 'r', 'd', 'b', 'm', 'z', 'l'}
>>> a & b                              # letters in both a and b
{'a', 'c'}
>>> a ^ b                              # letters in a or b but not both
{'r', 'd', 'b', 'm', 'z', 'l'}
~~~

和列表一样，集合也支持推导式：

~~~python
>>> a = {x for x in 'abracadabra' if x not in 'abc'}
>>> a
{'r', 'd'}
~~~

# 字典

字典也是用花括号来表示的，不同的是字典中的元素是以 key:value的形式呈现的。

下面是字典的一些基本操作：

~~~python
>>> tel = {'jack': 4098, 'sape': 4139}
>>> tel['guido'] = 4127
>>> tel
{'jack': 4098, 'sape': 4139, 'guido': 4127}
>>> tel['jack']
4098
>>> del tel['sape']
>>> tel['irv'] = 4127
>>> tel
{'jack': 4098, 'guido': 4127, 'irv': 4127}
>>> list(tel)
['jack', 'guido', 'irv']
>>> sorted(tel)
['guido', 'irv', 'jack']
>>> 'guido' in tel
True
>>> 'jack' not in tel
False
~~~

除了花括号，还可以使用dict函数来构建字典：

~~~python
>>> dict([('sape', 4139), ('guido', 4127), ('jack', 4098)])
{'sape': 4139, 'guido': 4127, 'jack': 4098}
~~~

如果关键字是简单的字符的话，可以直接这样写：

~~~python
>>> dict(sape=4139, guido=4127, jack=4098)
{'sape': 4139, 'guido': 4127, 'jack': 4098}
~~~

同样的推导式也可以使用：

~~~python
>>> {x: x**2 for x in (2, 4, 6)}
{2: 4, 4: 16, 6: 36}
~~~

# 循环

我们一般使用for语句来遍历集合或者字典，list等。

当我们遍历字典的时候，可以使用items()方法来同时获取到key和value：

~~~python
>>> knights = {'gallahad': 'the pure', 'robin': 'the brave'}
>>> for k, v in knights.items():
...     print(k, v)
...
gallahad the pure
robin the brave
~~~

如果是列表，那么可以使用enumerate 函数来获取到index和value：

~~~python
>>> for i, v in enumerate(['tic', 'tac', 'toe']):
...     print(i, v)
...
0 tic
1 tac
2 toe
~~~

之前我们还使用了zip函数，zip函数可以将多个序列中的元素一一匹配：

~~~python
>>> questions = ['name', 'quest', 'favorite color']
>>> answers = ['lancelot', 'the holy grail', 'blue']
>>> for q, a in zip(questions, answers):
...     print('What is your {0}?  It is {1}.'.format(q, a))
...
What is your name?  It is lancelot.
What is your quest?  It is the holy grail.
What is your favorite color?  It is blue.
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
