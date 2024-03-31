---
slug: /10-python-class
---

# 10. Python基础之:Python中的类



# 简介

class是面向对象编程的一个非常重要的概念，python中也有class，并且支持面向对象编程的所有标准特性：继承，多态等。

本文将会详细讲解Python中class的信息。

# 作用域和命名空间

在详细讲解class之前，我们来看一下作用域和命名空间的概念。

命名空间(Namespace)是从名称到对象的映射，大部分的命名空间都是通过 Python 字典来实现的。

命名空间主要是为了避免程序中的名字冲突。只要名字在同一个命名空间中保持唯一即可，不同的命令空间中的名字互不影响。

Python中有三种命名空间：

- **内置名称（built-in names**）， Python 语言内置的名称，比如函数名 abs、char 和异常名称 BaseException、Exception 等等。
- **全局名称（global names）**，模块中定义的名称，记录了模块的变量，包括函数、类、其它导入的模块、模块级的变量和常量。
- **局部名称（local names）**，函数中定义的名称，记录了函数的变量，包括函数的参数和局部定义的变量。（类中定义的也是）

命名空间的搜索顺序是 局部名称-》全局名称-》内置名称。

在不同时刻创建的命名空间拥有不同的生存期。包含内置名称的命名空间是在 Python 解释器启动时创建的，永远不会被删除。模块的全局命名空间是在在模块定义被读入时创建.

通常，模块命名空间也会持续到解释器退出。

被解释器的顶层调用执行的语句，比如从一个脚本文件读取的程序或交互式地读取的程序，被认为是 `__main__` 模块调用的一部分，因此它们也拥有自己的全局命名空间。（内置名称实际上也存在于一个模块中；这个模块称作 builtins 。）

一个 *作用域* 是一个命名空间可直接访问的 Python 程序的文本区域。

Python中有四种作用域：

- **Local**：最内层，包含局部变量，比如一个函数/方法内部。
- **Enclosing**：包含了非局部(non-local)也非全局(non-global)的变量。比如两个嵌套函数，一个函数（或类） A 里面又包含了一个函数 B ，那么对于 B 中的名称来说 A 中的作用域就为 nonlocal。
- **Global**：当前脚本的最外层，比如当前模块的全局变量。
- **Built-in**： 包含了内建的变量/关键字等。，最后被搜索

作用域的搜索顺序是 Local -> Enclosing -> Global -> Built-in

Python中用nonlocal关键字声明为Enclosing范围，用global关键字声明为全局范围。

我们来看一个global 和 nonlocal 会如何影响变量绑定的例子：

~~~python
def scope_test():
    def do_local():
        spam = "local spam"

    def do_nonlocal():
        nonlocal spam
        spam = "nonlocal spam"

    def do_global():
        global spam
        spam = "global spam"

    spam = "test spam"
    do_local()
    print("After local assignment:", spam)
    do_nonlocal()
    print("After nonlocal assignment:", spam)
    do_global()
    print("After global assignment:", spam)

scope_test()
print("In global scope:", spam)
~~~

上面程序输出：

~~~python
After local assignment: test spam
After nonlocal assignment: nonlocal spam
After global assignment: nonlocal spam
In global scope: global spam
~~~

函数内的变量默认是local作用域，如果要在函数的函数中修改外部函数的变量，那么需要将这个变量声明为nonlocal, 最后在模块顶层或者程序文件顶层的变量是全局作用域，如果需要引用修改的话需要声明为global作用域。

# class

Python中的类是用class来定义的，我们看一个最简单的class定义：

~~~python
class ClassName:
    <statement-1>
    .
    .
    .
    <statement-N>
~~~

类定义中的代码将创建一个新的命名空间，里面的变量都被看做是局部作用域。所有对局部变量的赋值都是在这个新命名空间之内。

## 类对象

class定义类之后，就会生成一个类对象。我们可以通过这个类对象来访问类中定义的属性和方法。

比如我们定义了下面的类：

~~~python
class MyClass:
    """A simple example class"""
    i = 12345

    def f(self):
        return 'hello world'
~~~

类中定义了一个属性 i 和一个方法 f。那么我们可以通过 MyClass.i` 和 `MyClass.f  来访问他们。

> 注意，Python中没有像java中的private，public这一种变量访问范围控制。你可以把Python class中的变量和方法都看做是public的。

我们可以直接通过给 `MyClass.i` 赋值来改变 i 变量的值。

~~~python
In [2]: MyClass.__doc__
Out[2]: 'A simple example class'

In [3]: MyClass.i=100

In [4]: MyClass
Out[4]: __main__.MyClass

In [5]: MyClass.i
Out[5]: 100
~~~

Class中，我们还定义了class的文档，可以直接通过 `__doc__` 来访问。

## 类的实例

实例化一个类对象，可以将类看做是无参的函数即可。

~~~python
In [6]: x = MyClass()

In [7]: x.i
Out[7]: 100
~~~

上面我们创建了一个MyClass的实例，并且赋值给x。

通过访问x中的i值，我们可以发现这个i值是和MyClass类变量中的i值是一致的。

实例化操作（“调用”类对象）会创建一个空对象。 如果你想在实例化的时候做一些自定义操作，那么可以在类中定义一个 `__init__()` 方法时，类的实例化操作会自动为新创建的类实例发起调用 `__init__()`。

~~~python
def __init__(self):
    self.data = []
~~~

 `__init__()`方法还可以接受参数，这些参数是我们在实例化类的时候传入的：

~~~Python
>>> class Complex:
...     def __init__(self, realpart, imagpart):
...         self.r = realpart
...         self.i = imagpart
...
>>> x = Complex(3.0, -4.5)
>>> x.r, x.i
(3.0, -4.5)
~~~

### 实例对象的属性

还是上面class，我们定义了一个i属性和一个f方法：

~~~python
class MyClass:
    """A simple example class"""
    i = 12345

    def f(self):
        return 'hello world'
~~~

我们可以通过实例对象来访问这个属性：

~~~python
In [6]: x = MyClass()

In [7]: x.i
Out[7]: 100
~~~

甚至我们可以在实例对象中创建一个不属于类对象的属性：

~~~python
In [8]: x.y=200

In [9]: x.y
Out[9]: 200
~~~

甚至使用完之后，不保留任何记录：

~~~python
x.counter = 1
while x.counter < 10:
    x.counter = x.counter * 2
print(x.counter)
del x.counter
~~~

### 方法对象

我们有两种方式来访问函数中定义的方法，一种是通过类对象，一种是通过实例对象，看下两者有什么不同：

~~~python
In [10]: x.f
Out[10]: <bound method MyClass.f of <__main__.MyClass object at 0x7fb69fc5f438>>

In [11]: x.f()
Out[11]: 'hello world'

In [12]:  MyClass.f
Out[12]: <function __main__.MyClass.f>

In [13]:  MyClass.f()
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-13-e50d25278077> in <module>()
----> 1 MyClass.f()

TypeError: f() missing 1 required positional argument: 'self'
~~~

从上面的输出我们可以看出，MyClass.f 是一个函数，而x.f 是一个object对象。

还记得f方法的定义吗？f方法有一个self参数，如果作为函数来调用的话，一定要传入所有需要的参数才可以，这也就是为什么直接调用MyClass.f() 报错，而 x.f() 可以直接运行的原因。

虽然方法的第一个参数常常被命名为 `self`。 这也不过就是一个约定: `self` 这一名称在 Python 中绝对没有特殊含义。

方法对象的特殊之处就在于实例对象会作为函数的第一个参数被传入。 在我们的示例中，调用 `x.f()` 其实就相当于 `MyClass.f(x)`。 总之，调用一个具有 *n* 个参数的方法就相当于调用再多一个参数的对应函数，这个参数值为方法所属实例对象，位置在其他参数之前。

为什么方法对象不需要传入self这个参数呢？从 x.f的输出我们可以看出，这个方法已经绑定到了一个实例对象，所以self参数会被自动传入。

方法可以通过使用 `self` 参数的方法属性调用其他方法:

~~~python
class Bag:
    def __init__(self):
        self.data = []

    def add(self, x):
        self.data.append(x)

    def addtwice(self, x):
        self.add(x)
        self.add(x)
~~~



## 类变量和实例变量

在类变量和实例变量的使用中，我们需要注意哪些问题呢？

一般来说，实例变量用于每个实例的唯一数据，而类变量用于类的所有实例共享的属性和方法。

~~~python
class Dog:

    kind = 'canine'         # class variable shared by all instances

    def __init__(self, name):
        self.name = name    # instance variable unique to each instance

>>> d = Dog('Fido')
>>> e = Dog('Buddy')
>>> d.kind                  # shared by all dogs
'canine'
>>> e.kind                  # shared by all dogs
'canine'
>>> d.name                  # unique to d
'Fido'
>>> e.name                  # unique to e
'Buddy'
~~~

所以，如果是实例变量，那么需要在初始化方法中进行赋值和初始化。如果是类变量，可以直接定义在类的结构体中。

举个正确使用实例变量的例子：

~~~python
class Dog:

    def __init__(self, name):
        self.name = name
        self.tricks = []    # creates a new empty list for each dog

    def add_trick(self, trick):
        self.tricks.append(trick)

>>> d = Dog('Fido')
>>> e = Dog('Buddy')
>>> d.add_trick('roll over')
>>> e.add_trick('play dead')
>>> d.tricks
['roll over']
>>> e.tricks
['play dead']
~~~

如果同样的属性名称同时出现在实例和类中，则属性查找会优先选择实例:

~~~python
>>> class Warehouse:
        purpose = 'storage'
        region = 'west'

>>> w1 = Warehouse()
>>> print(w1.purpose, w1.region)
storage west
>>> w2 = Warehouse()
>>> w2.region = 'east'
>>> print(w2.purpose, w2.region)
storage east
~~~

## 继承

看下Python中继承的语法：

~~~Python
class DerivedClassName(BaseClassName):
    <statement-1>
    .
    .
    .
    <statement-N>
~~~

如果基类定义在另一个模块中的时候：

~~~python
class DerivedClassName(modname.BaseClassName):
~~~

如果请求的属性在类中找不到，搜索将转往基类中进行查找。 如果基类本身也派生自其他某个类，则此规则将被递归地应用。

派生类可能会重写其基类的方法。 因为方法在调用同一对象的其他方法时没有特殊权限，所以调用同一基类中定义的另一方法的基类方法最终可能会调用覆盖它的派生类的方法。 

Python中有两个内置函数可以用来方便的判断是继承还是实例：

- 使用 isinstance() 来检查一个实例的类型: 

  例如：isinstance(obj, int) 仅会在 obj.`__class__` 为 int 或某个派生自 int 的类时为 True。

- 使用 issubclass() 来检查类的继承关系:

  例如： issubclass(bool, int) 为 True，因为 bool 是 int 的子类。 但是，issubclass(float, int) 为 False，因为 float 不是 int 的子类。

Python也支持多重继承：

~~~python
class DerivedClassName(Base1, Base2, Base3):
    <statement-1>
    .
    .
    .
    <statement-N>
~~~

如果某一属性在 `DerivedClassName` 中未找到，则会到 `Base1` 中搜索它，然后（递归地）到 `Base1` 的基类中搜索，如果在那里未找到，再到 `Base2` 中搜索，依此类推。

## 私有变量

虽然Python中并没有强制的语法规定私有变量，但是大多数 Python 代码都遵循这样一个约定：带有一个下划线的名称 (例如 `_spam`) 应该被当作是 API 的非公有部分 (无论它是函数、方法或是数据成员)。 

这只是我们在写Python程序时候的一个实现细节，并不是语法的强制规范。

既然有私有变量，那么在继承的情况下就有可能出现私有变量覆盖的情况，Python是怎么解决的呢？

Python中可以通过变量名改写的方式来避免私有变量的覆盖。

 任何形式为 `__spam` 的标识符（至少带有两个前缀下划线，至多一个后缀下划线）的文本将被替换为 `_classname__spam`，其中 `classname` 为去除了前缀下划线的当前类名称。 这种改写不考虑标识符的句法位置，只要它出现在类定义内部就会进行。

举个例子：

~~~Python

class Mapping:
    def __init__(self, iterable):
        self.items_list = []
        self.__update(iterable)

    def update(self, iterable):
        for item in iterable:
            self.items_list.append(item)

    __update = update   # private copy of original update() method

class MappingSubclass(Mapping):

    def update(self, keys, values):
        # provides new signature for update()
        # but does not break __init__()
        for item in zip(keys, values):
            self.items_list.append(item)
~~~



上面的示例即使在 `MappingSubclass` 引入了一个 `__update` 标识符的情况下也不会出错，因为它会在 `Mapping` 类中被替换为 `_Mapping__update` 而在 `MappingSubclass` 类中被替换为 `_MappingSubclass__update`。

请注意传递给 `exec()` 或 `eval()` 的代码不会将发起调用类的类名视作当前类；这类似于 `global` 语句的效果，因此这种效果仅限于同时经过字节码编译的代码。

# 迭代器

对于大多数容器对象来说，可以使用for语句来遍历容器中的元素。

~~~python
for element in [1, 2, 3]:
    print(element)
for element in (1, 2, 3):
    print(element)
for key in {'one':1, 'two':2}:
    print(key)
for char in "123":
    print(char)
for line in open("myfile.txt"):
    print(line, end='')
~~~

其底层原理就是for 语句会在容器对象上调用 iter()方法。 该函数返回一个定义了 `__next__()` 方法的迭代器对象，此方法将逐一访问容器中的元素。 当元素用尽时，`__next__()` 将引发 StopIteration 异常来通知终止 for 循环。 

你可以使用 next() 内置函数来调用 `__next__()` 方法；下面的例子展示了如何使用：

~~~python
>>> s = 'abc'
>>> it = iter(s)
>>> it
<iterator object at 0x00A1DB50>
>>> next(it)
'a'
>>> next(it)
'b'
>>> next(it)
'c'
>>> next(it)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    next(it)
StopIteration
~~~

知道了迭代器的原理之后，我们就可以为自定义的class添加迭代器对象了，我们需要定义一个 `__iter__()` 方法来返回一个带有 `__next__()` 方法的对象。 如果类已定义了 `__next__()`，则 `__iter__()` 可以简单地返回 self:

~~~python
class Reverse:
    """Iterator for looping over a sequence backwards."""
    def __init__(self, data):
        self.data = data
        self.index = len(data)

    def __iter__(self):
        return self

    def __next__(self):
        if self.index == 0:
            raise StopIteration
        self.index = self.index - 1
        return self.data[self.index]
~~~

# 生成器

生成器 是一个用于创建迭代器的简单而强大的工具。 它们的写法类似于标准的函数，但当它们要返回数据时会使用 yield 语句。 每次在生成器上调用 next() 时，它会从上次离开的位置恢复执行（它会记住上次执行语句时的所有数据值）。

看一个生成器的例子：

~~~Pyhton

def reverse(data):
    for index in range(len(data)-1, -1, -1):
        yield data[index]
>>>
>>> for char in reverse('golf'):
...     print(char)
...
f
l
o
g
~~~

可以用生成器来完成的操作同样可以用前一节所描述的基于类的迭代器来完成。 但生成器的写法更为紧凑，因为它会自动创建 `__iter__()` 和 `__next__()` 方法。

生成器还可以用表达式代码的方式来执行，这样的写法和列表推导式类似，但外层为圆括号而非方括号。 

~~~python
>>> sum(i*i for i in range(10))                 # sum of squares
285

>>> xvec = [10, 20, 30]
>>> yvec = [7, 5, 3]
>>> sum(x*y for x,y in zip(xvec, yvec))         # dot product
260

>>> unique_words = set(word for line in page  for word in line.split())

>>> valedictorian = max((student.gpa, student.name) for student in graduates)

>>> data = 'golf'
>>> list(data[i] for i in range(len(data)-1, -1, -1))
['f', 'l', 'o', 'g']
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

