nodejs的调试debug

# 简介

对于开发者来说，在开发应用程序的过程中，往往为了开发方便和解决bug需要借助于编程语言的调试功能。一般来说我们需要借助于强大IDE的调试功能来完成这项工作。nodejs也不例外。

今天我们来详细介绍一下如何调试nodejs程序。

# 开启nodejs的调试

还记得之前我们讲到的koa程序吗？本文将会以一个简单的koa服务端程序为例，来展开nodejs的调试。

先看下一个简单的koa服务app.js：

~~~js
const Koa = require('koa');
const app = module.exports = new Koa();

app.use(async function(ctx) {
  ctx.body = 'Hello World';
});

if (!module.parent) app.listen(3000);

~~~

上面的程序开启了3000端口，建立了一个http服务。每次请求的时候，都会返回hello World,非常的简单。

要想运行上面的程序，我们需要执行node app.js。 这会执行app.js但是并不会开启调试功能。

怎么进行调试呢？

我们需要加上 --inspect 参数：

~~~js
node --inspect app.js
~~~

上面的代码将会开启nodejs的调试功能。

我们看下输出结果：

~~~js
Debugger listening on ws://127.0.0.1:9229/88c23ae3-9081-41cd-98b0-d0f7ebceab5a
For help, see: https://nodejs.org/en/docs/inspector
~~~

结果告诉了我们两件事情，第一件事情就是debugger监听的端口。默认情况下将会开启127.0.0.1的9229端口。并且分配了一个唯一的UUID以供区分。

第二件事情就是告诉我们nodejs使用的调试器是Inspector。

Inspector是nodejs 8之后引入的，如果是在nodejs 7之前，那么使用的是legacy debugger。

# 调试的安全性

如果debugger连接到了nodejs运行环境中，如果有恶意攻击者的话，这个恶意攻击者可以在nodejs环境中运行任意代码。这会给我们的程序带来很大的安全隐患。

所以我们一定要注意调试的安全性。一般来说，我们不建议进行远程调试。

默认情况下 --inspect 绑定的是127.0.0.1，这样就只允许本地程序访问。并且任何本地运行的程序都有权限进行该程序的调试。

如果我们真的想将debug程序暴露给外部程序的话，那么可以指明本机的外网IP地址或者0.0.0.0（表示任何地址，无限制），这样远程机子就可以进行远程调试了。

如果我们想进行安全的remote debug该怎么处理呢？

首先，我们要开启本地的debug：

~~~js
node --inspect app.js
~~~

然后我们可以搭建一个ssh隧道，将本地的9221端口映射到远程服务器的9229端口：

~~~js
ssh -L 9221:localhost:9229 user@remote.example.com
~~~

这样我们就可以通过连接本地的9221端口，进行远程调试了。

# 使用WebStorm进行nodejs调试

JetBrains出品的WebStorm可谓是开发nodejs的利器，WebStorm自带有debug选项，如果开启该选项，则会在后台开启 --inspect:

![](https://img-blog.csdnimg.cn/20200927220121301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

使用WebStorm来进行调试和使用IDEA来进行java程序调试类似，这里就不多介绍了。

# 使用Chrome devTools进行调试

使用Chrome devTools进行调试的前提是我们已经开启了 --inspect模式。

在chrome中输入chrome://inspect：

![](https://img-blog.csdnimg.cn/2020092722070968.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

我们可看到chrome inspect的界面，如果你本地已经有开启inspect的nodejs程序的话，在Remote Target中就可以直接看到。

选中你要调试的target，点击inspect，即可开启Chrome devTools调试工具：

![](https://img-blog.csdnimg.cn/20200927180744257.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

你可以对程序进行profile，也可以进行调试。

这里我们关注的是调试，所以转到source一栏，添加你要调试的程序的源代码：

![](https://img-blog.csdnimg.cn/20200927180724122.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

加入断点即可开始调试了。和在chrome中调试web端的js是一样的。

# 使用node-inspect来进行调试

其实nodejs有一个自带的调试工具，叫做node-inspect，这是一个cli的调试工具。我们看一下怎么使用。

我们直接使用：

~~~js
node inspect app.js

< Debugger listening on ws://127.0.0.1:9229/f1c64736-47a1-42c9-9e9e-f2665073d3eb
< For help, see: https://nodejs.org/en/docs/inspector
< Debugger attached.
Break on start in app.js:1
> 1 const Koa = require('koa');
  2 const app = module.exports = new Koa();
  3 
debug> 

~~~

node inspect 做了两件事情，第一件事情就是生成子程序去运行node --inspect app.js,第二件事情就是在主程序中运行CLI调试窗口。

这个CLI调试程序为我们提供了一些非常有用的命令：

1. Stepping

* cont, c: 继续执行
* next, n: Step到下一步
* step, s: Step in
* out, o: Step out
* pause: 暂停运行的代码

2. Breakpoints

* setBreakpoint(), sb(): 在当前行设置断点
* setBreakpoint(line), sb(line): 在指定的行设置断点
* setBreakpoint('fn()'), sb(...): 在指定的function中设置断点
* setBreakpoint('script.js', 1), sb(...): 在指定的脚本文件中设置断点
* clearBreakpoint('script.js', 1), cb(...): 从文件中清除断点

3. Information

* backtrace, bt: 打印当前execution frame的backtrace信息
* list(5): 列出源代码前后的5行
* watch(expr): 添加监听表达式
* unwatch(expr): 删除监听表达式
* watchers: 列出所有的watchers
* repl: 打开repl表达式
* exec expr: 执行表达式

通过上面的命令，我们可以在CLI中进行比较复杂的调试活动。

# 其他的debug客户端

除了上面我们讲到的几个之外，我们还可以使用vscode，Visual Studio ，Eclipse IDE 等来进行nodejs的调试，这里就不一一详细介绍了。

感兴趣的朋友可以自行探索。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！











