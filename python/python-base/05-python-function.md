Python基础之:函数

[toc]

# 简介

函数是结构化编程的基础，也是代码复用的基石。Python中通过def来自定义函数。本文将会深入探索Python中函数的秘密。

# 内置函数

除了用户的自定义函数之外，Python内置了一些非常有用的函数：

|                                                              | 内置函数                                                     |                                                              |                                                              |                                                              |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| [`abs()`](https://docs.python.org/zh-cn/3.9/library/functions.html#abs) | [`delattr()`](https://docs.python.org/zh-cn/3.9/library/functions.html#delattr) | [`hash()`](https://docs.python.org/zh-cn/3.9/library/functions.html#hash) | [`memoryview()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-memoryview) | [`set()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-set) |
| [`all()`](https://docs.python.org/zh-cn/3.9/library/functions.html#all) | [`dict()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-dict) | [`help()`](https://docs.python.org/zh-cn/3.9/library/functions.html#help) | [`min()`](https://docs.python.org/zh-cn/3.9/library/functions.html#min) | [`setattr()`](https://docs.python.org/zh-cn/3.9/library/functions.html#setattr) |
| [`any()`](https://docs.python.org/zh-cn/3.9/library/functions.html#any) | [`dir()`](https://docs.python.org/zh-cn/3.9/library/functions.html#dir) | [`hex()`](https://docs.python.org/zh-cn/3.9/library/functions.html#hex) | [`next()`](https://docs.python.org/zh-cn/3.9/library/functions.html#next) | [`slice()`](https://docs.python.org/zh-cn/3.9/library/functions.html#slice) |
| [`ascii()`](https://docs.python.org/zh-cn/3.9/library/functions.html#ascii) | [`divmod()`](https://docs.python.org/zh-cn/3.9/library/functions.html#divmod) | [`id()`](https://docs.python.org/zh-cn/3.9/library/functions.html#id) | [`object()`](https://docs.python.org/zh-cn/3.9/library/functions.html#object) | [`sorted()`](https://docs.python.org/zh-cn/3.9/library/functions.html#sorted) |
| [`bin()`](https://docs.python.org/zh-cn/3.9/library/functions.html#bin) | [`enumerate()`](https://docs.python.org/zh-cn/3.9/library/functions.html#enumerate) | [`input()`](https://docs.python.org/zh-cn/3.9/library/functions.html#input) | [`oct()`](https://docs.python.org/zh-cn/3.9/library/functions.html#oct) | [`staticmethod()`](https://docs.python.org/zh-cn/3.9/library/functions.html#staticmethod) |
| [`bool()`](https://docs.python.org/zh-cn/3.9/library/functions.html#bool) | [`eval()`](https://docs.python.org/zh-cn/3.9/library/functions.html#eval) | [`int()`](https://docs.python.org/zh-cn/3.9/library/functions.html#int) | [`open()`](https://docs.python.org/zh-cn/3.9/library/functions.html#open) | [`str()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-str) |
| [`breakpoint()`](https://docs.python.org/zh-cn/3.9/library/functions.html#breakpoint) | [`exec()`](https://docs.python.org/zh-cn/3.9/library/functions.html#exec) | [`isinstance()`](https://docs.python.org/zh-cn/3.9/library/functions.html#isinstance) | [`ord()`](https://docs.python.org/zh-cn/3.9/library/functions.html#ord) | [`sum()`](https://docs.python.org/zh-cn/3.9/library/functions.html#sum) |
| [`bytearray()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-bytearray) | [`filter()`](https://docs.python.org/zh-cn/3.9/library/functions.html#filter) | [`issubclass()`](https://docs.python.org/zh-cn/3.9/library/functions.html#issubclass) | [`pow()`](https://docs.python.org/zh-cn/3.9/library/functions.html#pow) | [`super()`](https://docs.python.org/zh-cn/3.9/library/functions.html#super) |
| [`bytes()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-bytes) | [`float()`](https://docs.python.org/zh-cn/3.9/library/functions.html#float) | [`iter()`](https://docs.python.org/zh-cn/3.9/library/functions.html#iter) | [`print()`](https://docs.python.org/zh-cn/3.9/library/functions.html#print) | [`tuple()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-tuple) |
| [`callable()`](https://docs.python.org/zh-cn/3.9/library/functions.html#callable) | [`format()`](https://docs.python.org/zh-cn/3.9/library/functions.html#format) | [`len()`](https://docs.python.org/zh-cn/3.9/library/functions.html#len) | [`property()`](https://docs.python.org/zh-cn/3.9/library/functions.html#property) | [`type()`](https://docs.python.org/zh-cn/3.9/library/functions.html#type) |
| [`chr()`](https://docs.python.org/zh-cn/3.9/library/functions.html#chr) | [`frozenset()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-frozenset) | [`list()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-list) | [`range()`](https://docs.python.org/zh-cn/3.9/library/functions.html#func-range) | [`vars()`](https://docs.python.org/zh-cn/3.9/library/functions.html#vars) |
| [`classmethod()`](https://docs.python.org/zh-cn/3.9/library/functions.html#classmethod) | [`getattr()`](https://docs.python.org/zh-cn/3.9/library/functions.html#getattr) | [`locals()`](https://docs.python.org/zh-cn/3.9/library/functions.html#locals) | [`repr()`](https://docs.python.org/zh-cn/3.9/library/functions.html#repr) | [`zip()`](https://docs.python.org/zh-cn/3.9/library/functions.html#zip) |
| [`compile()`](https://docs.python.org/zh-cn/3.9/library/functions.html#compile) | [`globals()`](https://docs.python.org/zh-cn/3.9/library/functions.html#globals) | [`map()`](https://docs.python.org/zh-cn/3.9/library/functions.html#map) | [`reversed()`](https://docs.python.org/zh-cn/3.9/library/functions.html#reversed) | [`__import__()`](https://docs.python.org/zh-cn/3.9/library/functions.html#__import__) |
| [`complex()`](https://docs.python.org/zh-cn/3.9/library/functions.html#complex) | [`hasattr()`](https://docs.python.org/zh-cn/3.9/library/functions.html#hasattr) | [`max()`](https://docs.python.org/zh-cn/3.9/library/functions.html#max) | [`round()`](https://docs.python.org/zh-cn/3.9/library/functions.html#round) |                                                              |

# 自定义函数

Python中使用def来定义函数，并使用return来返回特定的值。

看一个简单的函数的例子：

~~~shell
def my_function(x, y, z):
      if z > 1:
         return z * (x + y)
     else:
         return z / (x + y)
~~~

把我们之前讲的斐波拉赫数列的例子重新用函数来定义，可以这样写：

~~~shell
def fib(n):   
     a, b = 0, 1
     while a < n:
         print(a, end=' ')
         a, b = b, a+b
     print()
     
# 调用函数
fib(1000)
~~~

函数的内容需要使用空格或者tab来进行缩进。

## 参数的默认值

在Python中，我们可以给参数设置默认值，这样如果在函数调用的过程中没有传递参数的时候，就会使用默认值作为参数。

在我们之前定义的函数my_function中，我们可以给z设置一个默认值：

~~~python
def my_function(x, y, z=10):
      if z > 1:
         return z * (x + y)
     else:
         return z / (x + y)
~~~

这样我们在调用my_function可以只用传递两个参数，最后的z可以使用默认的参数值。

注意，默认值只会执行一次，如果你传入的参数是可变对象（列表，字典和类实例）的话，我们需要注意这个问题：

~~~shell
def f(a, L=[]):
    L.append(a)
    return L

print(f(1))
print(f(2))
print(f(3))

# 输出
[1]
[1, 2]
[1, 2, 3]
~~~

如果不想在后面的调用中共享默认值，那么可以把默认值的赋值放到函数体内部：

~~~shell
def f(a, L=None):
    if L is None:
        L = []
    L.append(a)
    return L
~~~

## 关键字参数

我们可以使用key=value的方式对函数进行调用。

还是前面的函数：

~~~shell
def my_function(x, y, z=10):
      if z > 1:
         return z * (x + y)
     else:
         return z / (x + y)
~~~

我们可以这样调用：

~~~shell
my_function(1,y=3,z=5)
my_function(1,y=3)
~~~

但是不能这样用：

~~~shell
my_function(y=3,1)
~~~

关键字的参数必须要放在非关键词参数的后面。也不能对参数进行多次赋值：

~~~shell
>>> def function(a):
...     pass
...
>>> function(0, a=0)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: function() got multiple values for keyword argument 'a'
~~~

通过上面的讨论我们可以看出，Python函数中的参数有两种，一种是带默认值的参数，一种是不带默认值的参数。

> 注意，不带默认值的参数一定要在带默认值的参数之前 。

看一个错误的例子：

~~~shell
In [69]: def fa(a=100,b,c=200):
    ...:     pass
  File "<ipython-input-69-d5678b64f352>", line 1
    def fa(a=100,b,c=200):
          ^
SyntaxError: non-default argument follows default argument
~~~

而向函数传递参数也有两种方式，一种是不带关键字的传递，一种是带关键字的传递。

> 注意，非关键词参数的传递一定要在关键词参数传递之前。

举个错误的例子：

~~~shell
In [70]: def fa(a,b=100,c=200):
    ...:     pass
    ...:

In [71]: fa(a=100,30)
  File "<ipython-input-71-5a229b8e420e>", line 1
    fa(a=100,30)
            ^
SyntaxError: positional argument follows keyword argument
~~~

那么问题来了，如果有多个关键词参数和多个非关键词参数，有没有简便的方法来定义这样的函数呢？

有的，那就是 `*arguments` 和 `**keywords`

`*arguments`用来接收所有多余的非关键词参数。而`**keywords`用来接收所有额外的关键词参数。

> 注意，`*arguments`一定要出现在 `**keywords` 的前面。

举个例子：

~~~shell
def cheeseshop(kind, *arguments, **keywords):
    print("-- Do you have any", kind, "?")
    print("-- I'm sorry, we're all out of", kind)
    for arg in arguments:
        print(arg)
    print("-" * 40)
    for kw in keywords:
        print(kw, ":", keywords[kw])
~~~

我们可以这样调用：

~~~shell
cheeseshop("Limburger", "It's very runny, sir.",
           "It's really very, VERY runny, sir.",
           shopkeeper="Michael Palin",
           client="John Cleese",
           sketch="Cheese Shop Sketch")
~~~

将会得到下面的结果：

~~~shell
-- Do you have any Limburger ?
-- I'm sorry, we're all out of Limburger
It's very runny, sir.
It's really very, VERY runny, sir.
----------------------------------------
shopkeeper : Michael Palin
client : John Cleese
sketch : Cheese Shop Sketch
~~~

## 特殊参数

函数可以按位置传参，可以按照关键词传参，也可以混合传参。

在某些情况下，我们可能需要限制传参的类型，比如只接收按位置传递，只接收按关键词传递，或者只接受混合传递。

看下特殊参数的定义：

~~~python
def f(pos1, pos2, /, pos_or_kwd, *, kwd1, kwd2):
      -----------    ----------     ----------
        |             |                  |
        |        按位置或者关键词           |
        |                                - 只允许按关键词传递
         -- 只允许按位置传递
~~~

> 注意，参数之间是以 / 和 * 来进行区分的。

我们举个例子：

~~~python
>>> def standard_arg(arg):
...     print(arg)
...
>>> def pos_only_arg(arg, /):
...     print(arg)
...
>>> def kwd_only_arg(*, arg):
...     print(arg)
...
>>> def combined_example(pos_only, /, standard, *, kwd_only):
...     print(pos_only, standard, kwd_only)
~~~

上面定义了4种传参方式的函数。

第一个函数就是标准形式，可以按位置传递，也可以按关键词传递。

第二个函数只允许按照位置传递。

第三个函数只允许按照关键词来传递。

第四个函数是混合模式。

## 参数解包

有时候我们需要将列表或者字典的值转换为函数的参数。那么就需要用到参数解包的功能。

`*` 操作符 可以用来解包列表和元组。

~~~python
>>> list(range(3, 6))            # normal call with separate arguments
[3, 4, 5]
>>> args = [3, 6]
>>> list(range(*args))            # call with arguments unpacked from a list
[3, 4, 5]
~~~

`**` 操作符 可以用来解包字典。

~~~python
>>> def parrot(voltage, state='a stiff', action='voom'):
...     print("-- This parrot wouldn't", action, end=' ')
...     print("if you put", voltage, "volts through it.", end=' ')
...     print("E's", state, "!")
...
>>> d = {"voltage": "four million", "state": "bleedin' demised", "action": "VOOM"}
>>> parrot(**d)
~~~

## Lambda

熟悉java的朋友可能知道，在JDK8中，Java引入了Lambda表达式。同样的Python中也有Lambda。

你可以将Lambda看做是匿名函数。可以在任何需要函数的地方使用Lambda表达式。

看一个Lambda的例子：

~~~python
>>> def make_incrementor(n):
...     return lambda x: x + n
...
>>> f = make_incrementor(42)
>>> f(0)
42
>>> f(1)
43
~~~

还可以将lambda的返回值作为参数：

~~~python
>>> pairs = [(1, 'one'), (2, 'two'), (3, 'three'), (4, 'four')]
>>> pairs.sort(key=lambda pair: pair[1])
>>> pairs
[(4, 'four'), (1, 'one'), (3, 'three'), (2, 'two')]
~~~

## 函数标注

之前我们讨论的是简单的自定义函数形式，我们并不知道函数的参数类型和返回值类型，其实函数可以写得更加详细一些，这就要用到函数标注了。

所谓函数标注就是用户自定义函数中的类型的可选元数据信息。

函数标注是以字典的形式存放在 `__annotations__`  属性中的。我们在参数的名称后面加上冒号，后面跟一个表达式，那么这个表达式会被求值为标注的值。对于返回值来说，返回值标注的定义是加上一个组合符号 `->`，后面跟一个表达式，该标注位于形参列表和表示 def 语句结束的冒号之间。

举个例子：

~~~python
>>> def f(ham: str, eggs: str = 'eggs') -> str:
...     print("Annotations:", f.__annotations__)
...     print("Arguments:", ham, eggs)
...     return ham + ' and ' + eggs
...
>>> f('spam')
Annotations: {'ham': <class 'str'>, 'return': <class 'str'>, 'eggs': <class 'str'>}
Arguments: spam eggs
'spam and eggs'
~~~

其实使用函数标注写出来的程序更加清晰，可读性更高。

