---
slug: /0001-flask-overview
---

# 1. 快速上手python的简单web框架flask



# 简介

python可以做很多事情，虽然它的强项在于进行向量运算和机器学习、深度学习等方面。但是在某些时候，我们仍然需要使用python对外提供web服务。

比如我们现在有一个用python写好的模型算法，这个模型算法需要接收前端的输入，然后进行模拟运算，最终得到最后的输出。这个流程是一个典型的web服务，与其我们使用java或者nodejs来搭建一个web服务器，不如我们就使用python自己的web框架来实现这一目标，减少技术栈的同时，还可以实现代码逻辑的统一，何乐而不为呢？

其实python的web框架也有很多种，比如django、flask等等。

这本系列的文章中，我们会介绍flask这个轻量级的web框架。

# web框架的重要组成部分

相信大家都用过不少web框架吧，从java的spring MVC，到nodejs的express和koa，有功能复杂的，也有功能简单的。

但是不管他们的功能如何，其最重要最基本的一个功能就是能够提供web服务，也就是说可以接收HTTP或者HTTPS的请求，然后返回对应的数据。这个功能通常包含的是核心的路由跳转功能。

有了这个核心的功能，web框架基本上就可以正常运行了。配合上现在流行的前后端分离技术，一切水到渠成。

如果不想用前后端分离，那么web框架还需要涉及到页面的呈现技术。一般来说都会使用模板引擎作为前端页面的呈现形式。

然后配合上对数据库、缓存、消息队列、静态资源、日志、调试等附加的功能，一个完整的web框架就完成了。

flask虽然是一个轻量级web框架，但是该有的功能它全都有。

它的核心是提供了对web路由的支持，同时支持Jinja的模板语言。

# 快速上手flask

flask是一个非常简单优雅的web框架，flask需要Python 3.7及以上版本的支持。

为了区分python的不同开发环境，我们在使用flask的时候，可以使用python自带的venv来创建不同的虚拟环境。venv跟conda的env很类似，都是用来创建虚拟环境，从而实现不同的环境进行分离的作用。

使用venv非常简单，如果你用的开发工具是pycharm，那么在创建python的flask项目的时候，会自动选择对应的虚拟环境创建工具，这里我们选择使用venv即可自动创建。

![](https://img-blog.csdnimg.cn/0a79ff71b56742388a864bae62df75b1.png)

当然你也可以使用下面的命令来手动创建venv：

```
$ mkdir learn-flask
$ cd learn-flask
$ python3 -m venv venv
```

创建好venv之后，使用下面的命令来激活这个env：

```
. venv/bin/activate
```

venv安装完毕之后，我们可以使用下面的命令安装flask：

```
pip install Flask
```

安装完毕之后，你可以在python项目site-packages里面找到flask对应的依赖包：

![](https://img-blog.csdnimg.cn/b5782ff83f764a0a9861ad73ae914bb9.png)

可以看到里面出了flask之外，还有其他的一些第三方依赖包，这些都是可以在后续的flask应用中使用到的。

## flask的第一个应用

flask的依赖包都安装好之后，我们就可以写一个最最简单的web应用程序了，我们把这个应用程序命名为first.py:

```
from flask import Flask

app = Flask(__name__)

@app.route('/')
def first():
    return "<p>这是我的第一个flask程序!</p>"

if __name__ == '__main__':
    app.run()

```

和普通的python程序不同的是，这里我们先实例化了一个Flask对象，然后用类似注解的方式定义了一个route在fist这个方法上。

程序写好了，如果你在pycharm IDE中，那么可以右键运行，可以得到下面的内容：

```
FLASK_APP = first.py
FLASK_ENV = development
FLASK_DEBUG = 0
In folder /Users/data/git/ddean2009/learn-flask
/Users/data/git/ddean2009/learn-flask/venv/bin/python -m flask run 
 * Serving Flask app 'first.py'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
```

可以看到IDE为我们设置了几个环境变量，分别是FLASK_APP：表示要运行的app名称。FLASK_ENV：表示现在的运行环境是开发环境还是线上环境。FLASK_DEBUG表示是否是debug模式。

最终我们可以访问默认的http://127.0.0.1:5000,可以得到下面的内容：

![](https://img-blog.csdnimg.cn/991cd420f8504c1aa4a86e5e70a87137.png)

说明整个程序运行成功了。

如果你想通过命令行来执行flask的应用，那么可以用下面的命令：

```
flask --app first run
```

注意，这里我们添加了--app这个参数来指定要运行的app名称。如果不指定的话，flask会去寻找名叫app.py或者wsgi.py的文件。如果你有这两个文件，那么就可以直接使用flask run来运行了。

这里的flask相当于python -m flask。

默认情况下flask的应用程序只能通过本地的浏览器来访问，如果你想通过远程来访问的话，可以指定访问的host，如下所示：

```
flask run --host=0.0.0.0
```

到此，我们的一个基本的最简单的flask web应用就完成了。

什么？你还要了解更多？别急，下面我们再详细介绍一些web应用程序所必须了解的知识。

# flask中的路由

路由也叫Routing,它是web应用程序中的灵魂，通过路由来定义各种URL和访问路径。

在flask中，可以使用@app.route来对路由进行定义。@app.route类似于注解，可以放置在python的方法之上。

route中可以定义路由的名称，路由的名称可以跟方法的名称不一样：

```
@app.route('/test')
def test123():
    return '我是一个测试'
```

路由的名称还可以是动态的，可以取一个跟注解方法中参数的名称一样的参数名作为路由的参数用一个尖括号括起来,如下所示：

```
from markupsafe import escape

@app.route('/student/<name>')
def what_is_your_name(name):
    return f'你的名字是: {escape(name)}'
```

这里的方法体中我们调用了python的f函数来对字符串进行格式化，在内部为了防止web输入端的恶意注入,这里引用了markupsafe的escape方法，可以对输入的字符串进行转义，从而避免了恶意的攻击。

除了在路径中指定参数之外，我们还可以自行指定参数的类型，在flask中路径参数可以设置为下面的几种类型：


| 类型 | 说明 |
| -------- | ------------------------------------------ |
| `string` | 默认类型，可以接收除了/之外的任何字符串 |
| `int`    | 可以接收正整数                 |
| `float`  | 可以接收正的浮点数     |
| `path`   | 和string类似，但是可以接收/     |
| `uuid`   | 接收uuid字符串 |

比如我们想传入一个路径，那么可以将其定义为path类型：

```
@app.route('/path/<path:subpath>')
def what_is_your_path(subpath):
    return f'你的路径是: {escape(subpath)}'
```

上面我们提到了string和path的区别，就在于path可以接收/,而string不能。

那么在flask中/有什么特殊的含义吗？

我们知道/是用做路径分割的，在flask中包含/和不包含/还是有一定的区别的。以下面的代码为例：

```
@app.route('/withslash/')
def with_slash():
    return '这是带slash的'

@app.route('/withoutslash')
def with_out_slash():
    return '这是不带slash的'
```

withslash的定义中带了slash后缀，所以不管你访问`/withslash`还是`/withslash/`, 都会被跳转到`withslash/`。

但是因为withoutslash没有带slash，所以你只能访问`/withoutslash`，但是不能访问`/withoutslash/`,否则你可能得到一个404 “Not Found”错误。

## 不同的http方法

默认情况下@app.route对外提供的是GET方法，如果你想对外提供一些不同的http方法，那么可以在@app.route中使用methods:

```
@app.route('/diffMethod', methods=['GET', 'POST'])
def diff_method():
    if request.method == 'POST':
        return '这是post'
    else:
        return '这是get'
```

当然，你还可以使用@app.get或者@app.post把不同方法的请求分开：

```
@app.get('/getMethod')
def get_method():
     return '这是get'

@app.post('/postMethod')
def post_method():
     return '这是post'
```

## 静态文件

web应用中少不了的是一些静态资源，比如图片，js或者css等。这些静态资源可以看做是一种特殊的路由规则。在flask中，可以通过创建特殊的static目录来达到这一目的。如下所示：

```
url_for('static', filename='style.css')
```

这里面我们用到了url_for这个方法，这个方法实际上是用来构建对应方法的url的，可以举下面的几个例子来对url_for有个深入的了解。

urL_for的第一个参数是方法名，后面接的是url中定义的变量，如果url中并没有这个变量，那么将会以参数的形式附加在url的后面：

```
@app.route('/')
def index():
    return 'index'

@app.route('/login')
def login():
    return 'login'

@app.route('/user/<username>')
def profile(username):
    return f'{username}\'s profile'

with app.test_request_context():
    print(url_for('index'))
    print(url_for('login'))
    print(url_for('login', next='/'))
    print(url_for('profile', username='John Doe'))
```

输出的内容如下：

```
/
/login
/login?next=/
/user/John%20Doe
```

## 使用模板

如果我们只是用return来返回简单的字符串或者变量，那么肯定满足不了现代应用的需求了。

为了实现复杂的页面功能，我们通常会使用模板。flask使用的是Jinja2这个模板语言。

怎么使用模板呢？我们在返回的时候，可以使用render_template方法：

```
from flask import render_template

@app.route('/template/<name>')
def use_template(name=None):
    return render_template('hello.html', name=name)
```

其中hello.html是模板文件的名字，name是模板文件中定义的变量。



# 总结

以上就是flask的基本使用了，掌握到这些内容之后，相信大家已经可以使用flask做出一个简单的web应用了。



















