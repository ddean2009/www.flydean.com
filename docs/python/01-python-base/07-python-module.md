---
slug: /07-python-module
---

# 7. Python基础之:Python中的模块



# 简介

Python的解释环境是很好用，但是如果我们需要编写一个大型的程序的时候，解释环境就完全不够用了。这个时候我们需要将python程序保存在一个文件里。通常这个文件是以.py结尾的。

对于大型的应用程序来说，一个文件可能是不够的，这个时候我们需要在文件中引用其他的文件，这样文件就叫做模块。

模块是一个包含Python定义和语句的文件。文件名就是模块名后跟文件后缀 `.py` 。在模块内部，模块名可以通过全局变量 `__name__`  获得。

# 模块基础

还是之前的斐波拉赫数列的例子，我们在fibo.py文件中存放了函数的实现：

~~~python

def fib(n):    # write Fibonacci series up to n
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()

~~~

编写完毕之后，我们可以在Python的解释环境中导入它：

~~~python
>>> import fibo
~~~

然后直接使用即可：

~~~python
>>> fibo.fib(1000)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987
~~~

常用的函数，我们可以将其赋值给一个变量：

~~~python
>>> fib = fibo.fib
>>> fib(1000)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987
~~~

或者，我们在导入的时候，直接给这个模块起个名字：

~~~python
>>> import fibo as fib
>>> fib.fib(500)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
~~~

或者导入模块中的函数：

~~~python
>>> from fibo import fib as fibonacci
>>> fibonacci(500)
0 1 1 2 3 5 8 13 21 34 55 89 144 233 377
~~~

每个模块都有它自己的私有符号表，该表用作模块中定义的所有函数的全局符号表。因此，模块的作者可以在模块内使用全局变量，而不必担心与用户的全局变量发生意外冲突。

# 执行模块

前面我们提到了可以使用import来导入一个模块，并且 `__name__` 中保存的是模块的名字。

和java中的main方法一样，如果我们想要在模块中进行一些测试工作，有没有类似java中main方法的写法呢？

先看一个例子：

~~~python
if __name__ == "__main__":
    import sys
    fib(int(sys.argv[1]))
~~~

 在模块中，我们需要进行一个判断  `__name__` 是不是被赋值为 `"__main__"`。

我们这样来执行这个模块：

~~~python
python fibo.py <arguments>
~~~

以脚本执行的情况下，模块的  `__name__`  属性会被赋值为 `__main__` , 这也是例子中为什么要这样写的原因。

看下执行效果：

~~~Python
$ python fibo.py 50
0 1 1 2 3 5 8 13 21 34
~~~

如果是以模块导入的话，那么将不会被执行：

~~~python
>>> import fibo
>>>
~~~

# 模块搜索路径

使用import导入模块的时候，解释器首先会去找该名字的内置模块，如果没找到的话，解释器会从 `sys.path`变量给出的目录列表里寻找。

`sys.path`的初始目录包括：

* 当前目录
* PYTHONPATH 指定的目录
* 安装的默认值

# dir

要想查看模块中定义的内容，可以使用dir函数。

~~~python
>>> a = [1, 2, 3, 4, 5]
>>> import fibo
>>> fib = fibo.fib
>>> dir()
['__builtins__', '__name__', 'a', 'fib', 'fibo', 'sys']
~~~

上面的例子列出了当前模块中定义的内容，包括变量，模块，函数等。

> 注意， `dir()` 不会列出内置函数和变量的名称。如果你想要这些，它们的定义是在标准模块 `builtins` 中。

我们可以给dir加上参数，来获取特定模块的内容：

~~~python
>>> import builtins
>>> dir(builtins)  
['ArithmeticError', 'AssertionError', 'AttributeError', 'BaseException',
 'BlockingIOError', 'BrokenPipeError', 'BufferError', 'BytesWarning',
 'ChildProcessError', 'ConnectionAbortedError', 'ConnectionError',
 'ConnectionRefusedError', 'ConnectionResetError', 'DeprecationWarning',
 'EOFError', 'Ellipsis', 'EnvironmentError', 'Exception', 'False',
 'FileExistsError', 'FileNotFoundError', 'FloatingPointError',
 'FutureWarning', 'GeneratorExit', 'IOError', 'ImportError',
 'ImportWarning', 'IndentationError', 'IndexError', 'InterruptedError',
 'IsADirectoryError', 'KeyError', 'KeyboardInterrupt', 'LookupError',
 'MemoryError', 'NameError', 'None', 'NotADirectoryError', 'NotImplemented',
 'NotImplementedError', 'OSError', 'OverflowError',
 'PendingDeprecationWarning', 'PermissionError', 'ProcessLookupError',
 'ReferenceError', 'ResourceWarning', 'RuntimeError', 'RuntimeWarning',
 'StopIteration', 'SyntaxError', 'SyntaxWarning', 'SystemError',
 'SystemExit', 'TabError', 'TimeoutError', 'True', 'TypeError',
 'UnboundLocalError', 'UnicodeDecodeError', 'UnicodeEncodeError',
 'UnicodeError', 'UnicodeTranslateError', 'UnicodeWarning', 'UserWarning',
 'ValueError', 'Warning', 'ZeroDivisionError', '_', '__build_class__',
 '__debug__', '__doc__', '__import__', '__name__', '__package__', 'abs',
 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes', 'callable',
 'chr', 'classmethod', 'compile', 'complex', 'copyright', 'credits',
 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'exit',
 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr',
 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass',
 'iter', 'len', 'license', 'list', 'locals', 'map', 'max', 'memoryview',
 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property',
 'quit', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars',
 'zip']
~~~

# 包

java中有package的概念，用来隔离程序代码。同样的在Python中也有包。

我们看一个Python中包的例子：

~~~python
sound/                          Top-level package
      __init__.py               Initialize the sound package
      formats/                  Subpackage for file format conversions
              __init__.py
              wavread.py
              wavwrite.py
              aiffread.py
              aiffwrite.py
              auread.py
              auwrite.py
              ...
      effects/                  Subpackage for sound effects
              __init__.py
              echo.py
              surround.py
              reverse.py
              ...
      filters/                  Subpackage for filters
              __init__.py
              equalizer.py
              vocoder.py
              karaoke.py
              ...
~~~



上面我们定义了4个包，分别是sound,sound.formats, sound.effects, sound.filters。

> 注意，如果是包的话，里面一定要包含 `__init__.py` 文件。

 `__init__.py`  可以是一个空文件，也可以执行包的初始化代码或设置 `__all__` 变量。

当导入的时候， python就会在  `sys.path`  路径中搜索该包。

包的导入有很多种方式，我们可以导入单个模块：

~~~python
import sound.effects.echo
~~~

但是这样导入之后，使用的时候必须加载全名：

~~~python
sound.effects.echo.echofilter(input, output, delay=0.7, atten=4)
~~~

如果不想加载全名，可以这样导入：

~~~python
from sound.effects import echo
~~~

那么就可以这样使用了：

~~~python
echo.echofilter(input, output, delay=0.7, atten=4)
~~~

还可以直接导入模块中的方法：

~~~Python
from sound.effects.echo import echofilter
~~~

然后这样使用：

~~~python
echofilter(input, output, delay=0.7, atten=4)
~~~

如果一个包里面的子包比较多，我们可能会希望使用 *  来一次性导入：

~~~python
 from sound.effects import * 
~~~

那么如何去控制到底会导入effects的哪一个子包呢？

我们可以在 `__init__.py` 中定义一个名叫  `__all__`  的列表，在这个列表中列出将要导出的子包名，如下所示：

~~~python
__all__ = ["echo", "surround", "reverse"]
~~~

这样`from sound.effects import *` 将导入 `sound` 包的三个命名子模块。

如果没有定义 `__all__`，`from sound.effects import *` 语句 *不会* 从包 `sound.effects` 中导入所有子模块到当前命名空间；它只会导入包 `sound.effects`。

## 包的相对路径

Import 可以指定相对路径，我们使用 . 来表示当前包， 使用 .. 来表示父包。

如下所示：

~~~python
from . import echo
from .. import formats
from ..filters import equalizer
~~~

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

