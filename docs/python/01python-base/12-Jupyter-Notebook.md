---
slug: /12-Jupyter-Notebook
---

# 12. 可视化运行Python的神器Jupyter Notebook



# 简介

如果我们想要运行Python，通常有两种方式，第一种方式就是在Python或者IPython的解释器环境中进行交互式运行，还有一种方式就是程序员最喜欢的编写.py文件，在文件中编写python代码，然后运行。

如果我们想写一篇关于Python的文章，文章里面有代码，还希望代码能够在当前页面运行，可不可以做到呢？

可以的，那就是使用我们今天要介绍的Jupyter Notebook。

# Jupyter Notebook

Jupyter项目是从Ipython项目中分出去的，在Ipython3.x之前，他们两个是在一起发布的。在Ipython4.x之后，Jupyter作为一个单独的项目进行开发和管理。因为Jupyter不仅仅可以运行Python程序，它还可以执行其他流程编程语言的运行。

Jupyter Notebook包括三个部分，第一个部分是一个web应用程序，提供交互式界面，可以在交互式界面中运行相应的代码。

![](https://img-blog.csdnimg.cn/20201214153708581.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上图是NoteBook的交互界面，我们可以对文档进行编辑，运行等操作。

主要的功能如下：

- 在浏览器中进行代码编辑，自动语法突出显示，缩进和制表符完成/自检功能。

- 从浏览器执行代码的能力，并将计算结果附加到生成它们的代码上。

- 使用诸如HTML，LaTeX，PNG，SVG等富媒体表示来显示计算结果。例如，可以内嵌包含matplotlib库渲染的具有出版质量的图形。

- 使用Markdown标记语言在浏览器中对富文本进行的编辑（可以为代码提供注释）不仅限于纯文本。

- 使用LaTeX轻松在markdown单元中包含数学符号的能力，并由MathJax本地呈现。



第二个部分就是NoteBook的文档了，这个文档存储了要运行的代码和一些描述信息。一般这个文档是以.ipynb的后缀进行存储的。

notebook文档是以json的形式存储的，并用base64进行编码。使用json的好处就是可以在不同的服务器中方便的进行数据的交互。

Notebook documents中除了可运行的代码文件，还可以存储说明等解释性内容，从而将代码和解释内容完美结合，尤其适合做学习笔记使用。

笔记本可以通过nbconvert命令导出为多种静态格式，包括HTML，reStructuredText，LaTeX，PDF等多种格式。

另外文档还可以方便的在网络上进行共享。

第三个部分就是代码运行的核心**Kernels**，通过不同的**Kernels**搭配，notebook可以支持运行多种程序。比如：Python，java，go，R，ruby，nodejs等等。

这些Kernels和notebook之间是以Json的形式通过MQ来进行通信的。



# 启动notebook server

有了文档之后，如果我们想要运行文档，需要启动notebook server。

~~~shell
jupyter notebook
~~~

默认情况下会开启下面的URL： http://127.0.0.1:8888

启动的时候还可指定要打开的.ipynb文件：

~~~shell
jupyter notebook my_notebook.ipynb
~~~

具体的notebook界面的操作这里就不多介绍了，基本上和普通的编译器差不多。大家可以自行探索。

# notebook document 的结构

notebook中包含了多个cells，每个cell中包含了多行文本输入字段，可以通过Shift-Enter 或者工具栏中的播放按钮来执行其中的代码。

这里的cell有三种类型，分别是code cells，markdown cells和raw cells。

## code cells

代码单元允许您编辑和编写新代码，并突出显示完整的语法和制表符。 您使用的编程语言取决于内核，默认内核（IPython）运行Python代码。

执行代码单元时，它包含的代码将发送到与笔记本关联的内核。 然后，从该计算返回的结果将在笔记本中显示为单元格的输出。 输出不仅限于文本，还有许多其他可能的输出形式，包括matplotlib图形和HTML表格（例如，在pandas数据分析包中使用的表格）。 

我们看一个code cells的例子：

~~~python
#%%

import numpy as np
my_arr = np.arange(1000000)
my_list = list(range(1000000))
~~~

每个单元格是以  `#%%` 来进行分隔的。

Ipython本身还支持多种富文本的展示格式，包括HTML，JSON，PNG，JPEG，SVG，LaTeX等。

Ipython提供了一个display方法，我们可以使用display来展示要呈现的对象：

~~~python
from IPython.display import display
~~~

`display(obj)` 将会寻找这个对象所有可能的展示类型，并从中挑选一个最适合的类型进行展示，并将结果存储在Notebook文档里面。

如果你想展示特定类型的对象，那么可以这样：

~~~python
from IPython.display import (
    display_pretty, display_html, display_jpeg,
    display_png, display_json, display_latex, display_svg
)
~~~

举个展示图片的例子：

~~~python
from IPython.display import Image
i = Image(filename='../images/ipython_logo.png')
i
display(i)
~~~

上面的例子中i包含了一个Image对象，直接调用i即可展示，我们也可以显示的调用`display(i)`。

其他的富文本类型可以参考Image，使用方法都是类似的。

## markdown cells

markdown是一种简介的标记语言，使用起来非常简单，使用范围非常广泛，所以notebook document也支持markdown的语法。

先看一个markdown cell的例子：

~~~python
#%% md

```python
$ python
Python 3.6.0 | packaged by conda-forge | (default, Jan 13 2017, 23:17:12)
[GCC 4.8.2 20140120 (Red Hat 4.8.2-15)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> a = 5
>>> print(a)
5
```
~~~

markdown中的语法在notebook中都是可以用的。

还支持标准的LaTeX 和 AMS-LaTeX语法。

## raw cells

原始单元格提供了一个可以直接写入输出的位置。 notebook不会对原始单元格中的内容进行计算。

# 以模块的形式导入Jupyter Notebooks



有时候我们希望以模块的形式导入Jupyter Notebooks，但是可惜的是，Jupyter Notebooks并不是一个标准的python程序，不过Python提供了一些钩子程序，让我们能够方便的进行导入。

首先，我们需要导入一些基本的API ：

~~~python
import io, os, sys, types

from IPython import get_ipython
from nbformat import read
from IPython.core.interactiveshell import InteractiveShell
~~~

接下来需要注册NotebookFinder到sys.meta_path：

~~~Python
sys.meta_path.append(NotebookFinder())
~~~

这个NotebookFinder就是定义的钩子。

我们看下NotebookFinder的定义：

~~~python
class NotebookFinder(object):
    """Module finder that locates Jupyter Notebooks"""
    def __init__(self):
        self.loaders = {}

    def find_module(self, fullname, path=None):
        nb_path = find_notebook(fullname, path)
        if not nb_path:
            return

        key = path
        if path:
            # lists aren't hashable
            key = os.path.sep.join(path)

        if key not in self.loaders:
            self.loaders[key] = NotebookLoader(path)
        return self.loaders[key]
~~~

里面使用了两个重要的方法，find_notebook用来找到notebook，和NotebookLoader，用来加载notebook。

看下find_notebook的定义：

```
def find_notebook(fullname, path=None):
    """find a notebook, given its fully qualified name and an optional path

    This turns "foo.bar" into "foo/bar.ipynb"
    and tries turning "Foo_Bar" into "Foo Bar" if Foo_Bar
    does not exist.
    """
    name = fullname.rsplit('.', 1)[-1]
    if not path:
        path = ['']
    for d in path:
        nb_path = os.path.join(d, name + ".ipynb")
        if os.path.isfile(nb_path):
            return nb_path
        # let import Notebook_Name find "Notebook Name.ipynb"
        nb_path = nb_path.replace("_", " ")
        if os.path.isfile(nb_path):
            return nb_path
```

看下NotebookLoader的定义：

```
class NotebookLoader(object):
    """Module Loader for Jupyter Notebooks"""
    def __init__(self, path=None):
        self.shell = InteractiveShell.instance()
        self.path = path

    def load_module(self, fullname):
        """import a notebook as a module"""
        path = find_notebook(fullname, self.path)

        print ("importing Jupyter notebook from %s" % path)

        # load the notebook object
        with io.open(path, 'r', encoding='utf-8') as f:
            nb = read(f, 4)


        # create the module and add it to sys.modules
        # if name in sys.modules:
        #    return sys.modules[name]
        mod = types.ModuleType(fullname)
        mod.__file__ = path
        mod.__loader__ = self
        mod.__dict__['get_ipython'] = get_ipython
        sys.modules[fullname] = mod

        # extra work to ensure that magics that would affect the user_ns
        # actually affect the notebook module's ns
        save_user_ns = self.shell.user_ns
        self.shell.user_ns = mod.__dict__

        try:
          for cell in nb.cells:
            if cell.cell_type == 'code':
                # transform the input to executable Python
                code = self.shell.input_transformer_manager.transform_cell(cell.source)
                # run the code in themodule
                exec(code, mod.__dict__)
        finally:
            self.shell.user_ns = save_user_ns
        return mod
```

有了他们，我们就可以直接import我们自己编写的notebook了。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
