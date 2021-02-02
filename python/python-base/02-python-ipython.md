[toc]

Python基础之:Python解释器和IPython

# 简介

今天给大家介绍一下Python的一个功能非常强大的解释器IPython。虽然Python本身自带解释器，但是相对而言IPython的功能更加的强大。

# Python解释器

Python是自带解释器的，我们在命令行输入python即可进入python的解释器环境：

~~~python
$> python
Python 2.7.15 (default, Oct  2 2018, 11:47:18)
[GCC 4.2.1 Compatible Apple LLVM 10.0.0 (clang-1000.11.45.2)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> site = "www.flydean.com"
>>> site
'www.flydean.com'
>>>
~~~

python解释器的提示符是`>>>`。

python提供了一个非常有用的命令help，我们可以使用help来查看要使用的命令。

~~~shell
>>> help
Type help() for interactive help, or help(object) for help about object.
~~~

在Python3中，还提供了tab的补全功能：

~~~shell
>>> site
'www.flydean.com'
>>> site.
site.capitalize(    site.expandtabs(    site.isalpha(       site.isprintable(   site.lower(         site.rindex(        site.splitlines(    site.upper(
site.casefold(      site.find(          site.isdecimal(     site.isspace(       site.lstrip(        site.rjust(         site.startswith(    site.zfill(
site.center(        site.format(        site.isdigit(       site.istitle(       site.maketrans(     site.rpartition(    site.strip(
site.count(         site.format_map(    site.isidentifier(  site.isupper(       site.partition(     site.rsplit(        site.swapcase(
site.encode(        site.index(         site.islower(       site.join(          site.replace(       site.rstrip(        site.title(
site.endswith(      site.isalnum(       site.isnumeric(     site.ljust(         site.rfind(         site.split(         site.translate(
~~~

使用起来非常的方便。

和Python自带的解释器之外，还有一个更加强大的解释器叫做IPython。我们一起来看看。

# IPython

IPython是一个非常强大的解释器，通常它是和jupyter notebook一起使用的。在IPython3.X中，IPython和Jupyter是作为一个整体一起发布的。但是在IPython4.X之后，Jupyter已经作为一个单独的项目，从IPython中分离出来了。

使用IPython很简单，输入IPython命令即可：

~~~shell
$> ipython
Python 3.6.4 |Anaconda, Inc.| (default, Jan 16 2018, 12:04:33)
Type 'copyright', 'credits' or 'license' for more information
IPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.

In [1]: site= "www.flydean.com"

In [2]: site
Out[2]: 'www.flydean.com'
~~~

IPython的提示符是`In [1]:`

基本上Python自带的命令在IPython中都是可以使用的。

IPython提供了4个非常有用的命令：

| command   | description                                               |
| --------- | --------------------------------------------------------- |
| ?         | Introduction and overview of IPython’s features.          |
| %quickref | Quick reference.                                          |
| help      | Python’s own help system.                                 |
| object?   | Details about ‘object’, use ‘object??’ for extra details. |

## 魔法函数

IPython中有两种魔法函数，一种是**Line magics**，一种是**Cell magics**。

**Line magics** 接收本行的输入作为函数的输入，是以`%`开头的。而**Cell magics**可以接收多行的数据，直到你输入空白回车为止。是以`%%`开头的。

比如我们想要看一个timeit的魔法函数的用法，可以使用`Object?`来表示：

~~~shell
$> In [4]: %timeit?
Docstring:
Time execution of a Python statement or expression

Usage, in line mode:
  %timeit [-n<N> -r<R> [-t|-c] -q -p<P> -o] statement
or in cell mode:
  %%timeit [-n<N> -r<R> [-t|-c] -q -p<P> -o] setup_code
  code
  code...
~~~

timeit用来统计程序的执行时间，我们分别看下Line magics和Cell magics的使用：

~~~shell
In [4]: %timeit?

In [5]: %timeit range(1000)
199 ns ± 3.8 ns per loop (mean ± std. dev. of 7 runs, 1000000 loops each)

In [6]: %%timeit range(1000)
   ...: range(1000)
   ...:
208 ns ± 12.1 ns per loop (mean ± std. dev. of 7 runs, 1000000 loops each)
~~~

> 事实上，如果只是LIne magics的话，我们可以省略前面的%，但是对于Cell magics来说，是不能省略的。

~~~shell
In [7]: timeit range(1000)

200 ns ± 4.03 ns per loop (mean ± std. dev. of 7 runs, 10000000 loops each)
~~~

常见的魔法函数有下面几种：

- 代码相关的: [`%run`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-run), [`%edit`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-edit), [`%save`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-save), [`%macro`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-macro), [`%recall`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-recall), etc.
- shell环境相关的: [`%colors`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-colors), [`%xmode`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-xmode), [`%automagic`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-automagic), etc.
- 其他的函数: [`%reset`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-reset), [`%timeit`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-timeit), [`%%writefile`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#cellmagic-writefile), [`%load`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-load), or `%paste`.

## 运行和编辑

使用[`%run`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-run) 可以方便的运行外部的python脚本。

~~~shell
In [8]: run?
Docstring:
Run the named file inside IPython as a program.

Usage::

  %run [-n -i -e -G]
       [( -t [-N<N>] | -d [-b<N>] | -p [profile options] )]
       ( -m mod | file ) [args]
~~~

run有几个非常有用的参数，比如-t 可以用来统计程序的时间。-d可以进行调试环境，-p可以进行profiler分析。

使用[`%edit`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-edit) 可以编辑多行代码，在退出之后，IPython将会执行他们。

如果不想立即执行的话，可以加上-x参数。

## Debug

可以使用[`%debug`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-debug) 或者 [`%pdb`](https://ipython.readthedocs.io/en/stable/interactive/magics.html#magic-pdb) 来进入IPython的调试环境：

~~~shell
In [11]: debug
> /Users/flydean/.pyenv/versions/anaconda3-5.1.0/lib/python3.6/site-packages/IPython/core/compilerop.py(99)ast_parse()
     97         Arguments are exactly the same as ast.parse (in the standard library),
     98         and are passed to the built-in compile function."""
---> 99         return compile(source, filename, symbol, self.flags | PyCF_ONLY_AST, 1)
    100
    101     def reset_compiler_flags(self):

ipdb>
~~~



~~~shell
In [12]: pdb
Automatic pdb calling has been turned ON

In [13]: pdb
Automatic pdb calling has been turned OFF
~~~

或者可以使用  `%run -d theprogram.py` 来调试一个外部程序。

## History

IPython可以存储你的输入数据和程序的输出数据，IPython的一个非常重要的功能就是可以获取到历史的数据。

在交互环境中，一个简单的遍历历史输入命令的方式就是使用up- 和 down- 箭头。

更强大的是，IPython将所有的输入和输出都保存在In 和 Out这两个变量中，比如In[4]。

~~~shell
In [1]: site = "www.flydean.com"

In [2]: site
Out[2]: 'www.flydean.com'

In [3]: In
Out[3]: ['', 'site = "www.flydean.com"', 'site', 'In']
~~~

可以使用 _ih[n]来访问特定的input：

~~~shell
In [4]: _ih[2]
Out[4]: 'site'
~~~

_i, _ii, _iii 可以分别表示前一个，前前一个和前前前一个输入。

除此之外，全局变量 _i<n> 也可以用来访问输入，也就是说：

~~~shell
_i<n> == _ih[<n>] == In[<n>]
_i14 == _ih[14] == In[14]
~~~

同样的，对于输出来说也存在着三种访问方式：

~~~shell
_<n> == _oh[<n>] == Out[<n>]
_12 == Out[12] == _oh[12]
~~~



最后的三个输出也可以通过 `_`, `__` 和 `___`来获取。

还可以使用%history来列出之前的历史数据进行选择。

history可以和 %edit`, `%rerun`, `%recall`, `%macro`, `%save` 和 `%pastebin 配和使用：

通过传入数字，可以选择历史的输入行号。

~~~shell
%pastebin 3 18-20
~~~

上面的例子会选择第3行和第18-20行输入。

## 运行系统命令

使用!可以直接运行系统命令：

~~~shell
In [27]: !pwd
/Users/flydean/Downloads
~~~

还可以用变量接收运行的结果，比如 ：  files = !ls  

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！







