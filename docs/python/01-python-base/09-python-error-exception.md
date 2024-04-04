---
slug: /09-python-error-exception
---

# 9. Python基础之:Python中的异常和错误



# 简介

和其他的语言一样，Python中也有异常和错误。在 Python 中，所有异常都是 `BaseException` 的类的实例。 今天我们来详细看一下Python中的异常和对他们的处理方式。

# Python中的内置异常类

Python中所有异常类都来自**BaseException**，它是所有内置异常的基类。

虽然它是所有异常类的基类，但是对于用户自定义的类来说，并不推荐直接继承BaseException,而是继承Exception.

先看下Python中异常类的结构关系：

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

其中**BaseException**，**Exception**，**ArithmeticError**，**BufferError**，**LookupError** 主要被作为其他异常的基类。

# 语法错误

在Python中，对于异常和错误通常可以分为两类，第一类是语法错误，又称解析错误。也就是代码还没有开始运行，就发生的错误。

其产生的原因就是编写的代码不符合Python的语言规范：

~~~python
>>> while True print('Hello world')
  File "<stdin>", line 1
    while True print('Hello world')
                   ^
SyntaxError: invalid syntax
~~~

上面代码原因是 print 前面少了 冒号。

# 异常

即使我们的程序符合python的语法规范，但是在执行的时候，仍然可能发送错误，这种在运行时发送的错误，叫做异常。

看一下下面的异常：

~~~python
>>> 10 * (1/0)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ZeroDivisionError: division by zero
>>> 4 + spam*3
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'spam' is not defined
>>> '2' + 2
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: Can't convert 'int' object to str implicitly
~~~

# 异常处理

程序发生了异常之后该怎么处理呢？

我们可以使用try except 语句来捕获特定的异常。

~~~python
>>> while True:
...     try:
...         x = int(input("Please enter a number: "))
...         break
...     except ValueError:
...         print("Oops!  That was no valid number.  Try again...")
...
~~~

上面代码的执行流程是，首先执行try中的子语句，如果没有异常发生，那么就会跳过except,并完成try语句的执行。

如果try中的子语句中发生了异常，那么将会跳过try子句中的后面部分，进行except的异常匹配。如果匹配成功的话，就会去执行except中的子语句。

如果发生的异常和 except 子句中指定的异常不匹配，则将其传递到外部的 `try`语句中。

一个try中可以有多个except 子句，我们可以这样写：

~~~python
    try:
        raise cls()
    except D:
        print("D")
    except C:
        print("C")
    except B:
        print("B")
~~~

一个except也可以带多个异常：

~~~python
... except (RuntimeError, TypeError, NameError):
...     pass
~~~

except 子句还可以省略异常名，用来匹配所有的异常：

~~~
import sys

try:
    f = open('myfile.txt')
    s = f.readline()
    i = int(s.strip())
except OSError as err:
    print("OS error: {0}".format(err))
except ValueError:
    print("Could not convert data to an integer.")
except:
    print("Unexpected error:", sys.exc_info()[0])
    raise
~~~

`try` ... `except`语句有一个可选的 *else 子句*，在使用时必须放在所有的 except 子句后面。对于在 try 子句不引发异常时必须执行的代码来说很有用。 例如:

~~~python
for arg in sys.argv[1:]:
    try:
        f = open(arg, 'r')
    except OSError:
        print('cannot open', arg)
    else:
        print(arg, 'has', len(f.readlines()), 'lines')
        f.close()
~~~

except可以指定异常变量的名字 `instance` ，这个变量代表这个异常实例。

我们可以通过instance.args来输出异常的参数。

同时，因为异常实例定义了  `__str__()`，所以可以直接使用print来输出异常的参数。而不需要使用 `.args`。 

我们看一个例子：

~~~python
>>> try:
...     raise Exception('spam', 'eggs')
... except Exception as inst:
...     print(type(inst))    # the exception instance
...     print(inst.args)     # arguments stored in .args
...     print(inst)          # __str__ allows args to be printed directly,
...                          # but may be overridden in exception subclasses
...     x, y = inst.args     # unpack args
...     print('x =', x)
...     print('y =', y)
...
<class 'Exception'>
('spam', 'eggs')
('spam', 'eggs')
x = spam
y = eggs
~~~

上面的例子中，我们在try字句中抛出了一个异常，并且指定了2个参数。

# 抛出异常

我们可以使用raise语句来抛出异常。

~~~python
>>> raise NameError('HiThere')
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: HiThere
~~~

raise的参数是一个异常，这个异常可以是异常实例或者是一个异常类。

> 注意，这个异常类必须是`Exception`的子类。

如果传递的是一个异常类，那么将会调用无参构造函数来隐式实例化：

~~~python
raise ValueError  # shorthand for 'raise ValueError()'
~~~

如果我们捕获了某些异常，但是又不想去处理，那么可以在except语句中使用raise，重新抛出异常。

~~~python
>>> try:
...     raise NameError('HiThere')
... except NameError:
...     print('An exception flew by!')
...     raise
...
An exception flew by!
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
NameError: HiThere
~~~

# 异常链

如果我们通过except捕获一个异常A之后，可以通过raise语句再次抛出一个不同的异常类型B。

那么我们看到的这个异常信息就是B的信息。但是我们并不知道这个异常B是从哪里来的，这时候，我们就可以用到异常链。

异常链就是抛出异常的时候，使用raise from语句：

~~~python
>>> def func():
...     raise IOError
...
>>> try:
...     func()
... except IOError as exc:
...     raise RuntimeError('Failed to open database') from exc
...
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
  File "<stdin>", line 2, in func
OSError

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "<stdin>", line 4, in <module>
RuntimeError: Failed to open database
~~~

上面的例子中，我们在捕获IOError之后，又抛出了RuntimeError，通过使用异常链，我们很清晰的看出这两个异常之间的关系。

默认情况下，如果异常是从except 或者 finally 中抛出的话，会自动带上异常链信息。

如果你不想带上异常链，那么可以  `from None` 。

~~~python
try:
    open('database.sqlite')
except IOError:
    raise RuntimeError from None

Traceback (most recent call last):
  File "<stdin>", line 4, in <module>
RuntimeError
~~~

# 自定义异常

用户可以继承 Exception 来实现自定义的异常，我们看一些自定义异常的例子：

~~~python
class Error(Exception):
    """Base class for exceptions in this module."""
    pass

class InputError(Error):
    """Exception raised for errors in the input.

    Attributes:
        expression -- input expression in which the error occurred
        message -- explanation of the error
    """

    def __init__(self, expression, message):
        self.expression = expression
        self.message = message

class TransitionError(Error):
    """Raised when an operation attempts a state transition that's not
    allowed.

    Attributes:
        previous -- state at beginning of transition
        next -- attempted new state
        message -- explanation of why the specific transition is not allowed
    """

    def __init__(self, previous, next, message):
        self.previous = previous
        self.next = next
        self.message = message
~~~

# finally

try语句可以跟着一个finally语句来实现一些收尾操作。

~~~python
>>> try:
...     raise KeyboardInterrupt
... finally:
...     print('Goodbye, world!')
...
Goodbye, world!
KeyboardInterrupt
Traceback (most recent call last):
  File "<stdin>", line 2, in <module>
~~~

`finally` 子句将作为 `try` 语句结束前的最后一项任务被执行， 无论try中是否产生异常，finally语句中的代码都会被执行。

如果 `finally` 子句中包含一个 `return` 语句，则返回值将来自 `finally` 子句的某个 `return` 语句的返回值，而非来自 `try` 子句的 `return` 语句的返回值。

~~~python
>>> def bool_return():
...     try:
...         return True
...     finally:
...         return False
...
>>> bool_return()
False
~~~

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
