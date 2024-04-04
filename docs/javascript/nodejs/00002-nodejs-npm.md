---
slug: /nodejs-npm
---

# 2. 在nodejs中使用npm包管理器

# 简介

nodejs的强大一方面在于语言特性和V8引擎结合焕发的生命活力，另一方面就是强大的第三方包。除了nodejs服务端应用之外，前端的许许多多lib都加入了第三方包的阵营。

作为一个通吃前后端的语言，可想而知这个第三方包会有多大。为了方便的对第三方lib进行管理，nodejs在诞生初期就引入了npm包管理系统，通过它，我们可以轻松的对众多lib进行管理。

> 除了npm，还可以使用yarn来对包进行管理。

# npm

npm一般是和nodejs一起安装的，我们可以直接执行npm来看下它的使用：

![](https://img-blog.csdnimg.cn/20200923143406925.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

看起来npm的命令还是非常多的。大家可以使用npm help命令来查看具体的某个命令的执行情况。

这里，我们主要介绍几个最最常用的命令。

## 安装依赖

安装依赖，我们可以使用：

~~~js
npm install <package-name>
~~~

install可以带下面几个参数：

~~~js
common options: [-P|--save-prod|-D|--save-dev|-O|--save-optional] [-E|--save-exact] [-B|--save-bundle] [--no-save] [--dry-run]
~~~

我们试一下上篇文章讲的inquirer：

~~~js
npm install inquirer
~~~

这个命令会在当前目录下面生成一个node_modules目录，并且将inquirer相关的依赖包安装到这个目录下面。

同时会生成一个package-lock.json文件，这个文件的作用我们后面再讲。

虽然这个install命令可以安装项目依赖的lib，但是如果在项目多人共享开发的情况下，就很难维护一个共有的lib库。

这个时候就需要引入package.json了。

我们将上面的命令改写一下：

~~~js
npm install --save inquirer
~~~

> 注意，这个命令执行成功的前提是你已经创建好了package.json文件。

执行这个命令，我们可以看到在package.json文件中多出了：

~~~js
  "dependencies": {
    "inquirer": "^7.3.3"
  },
~~~

我们可以使用不同的save选项，来生成不同的依赖：

~~~js
  "devDependencies": {},
  "optionalDependencies": {},
  "bundleDependencies": [
    "inquirer"
  ]
~~~

其中devDependencies表示的是开发依赖项，在生成环境中并不需要，那么在生产环境中，我们可以使用：

~~~js
npm install --production
~~~

以避免安装这些开发依赖项。

npm install默认会在当前目录安装所需的lib包，如果有些lib包需要被全局所使用的，那么install还支持一个-g选项，使用这个选项会将相应的lib安装到全局的地址。



## 安装特定版本的依赖

默认情况下，npm install会安装最新的lib包，但是有时候我们会想要安装特定版本的lib，那么可以使用 @ 语法来安装 npm 软件包的旧版本：

~~~js
npm install <package>@<version>
~~~

在安装之前，我们可能想要知道一下这个包到底有哪些版本，我们可以这样npm view &lt;package> versions：

~~~js
npm view inquirer versions

[
  '0.1.0',  '0.1.1',  '0.1.2',  '0.1.3',  '0.1.4',  '0.1.5',  '0.1.6',
  '0.1.7',  '0.1.8',  '0.1.9',  '0.1.11', '0.1.12', '0.2.0',  '0.2.1',
  '0.2.2',  '0.2.3',  '0.2.4',  '0.2.5',  '0.3.0',  '0.3.1',  '0.3.2',
  '0.3.3',  '0.3.4',  '0.3.5',  '0.4.0',  '0.4.1',  '0.5.0',  '0.5.1',
  '0.6.0',  '0.7.1',  '0.7.2',  '0.7.3',  '0.8.0',  '0.8.2',  '0.8.3',
  '0.8.4',  '0.8.5',  '0.9.0',  '0.10.0', '0.10.1', '0.11.0', '0.11.1',
  '0.11.2', '0.11.3', '0.11.4', '0.12.0', '1.0.0',  '1.0.1',  '1.0.2',
  '1.0.3',  '1.1.0',  '1.1.1',  '1.1.2',  '1.1.3',  '1.2.1',  '1.2.2',
  '1.2.3',  '2.0.0',  '3.0.0',  '3.0.1',  '3.0.2',  '3.0.3',  '3.0.4',
  '3.0.5',  '3.0.6',  '3.1.0',  '3.1.1',  '3.2.0',  '3.2.1',  '3.2.2',
  '3.2.3',  '3.3.0',  '4.0.0',  '4.0.1',  '4.0.2',  '5.0.0',  '5.0.1',
  '5.1.0',  '5.2.0',  '6.0.0',  '6.1.0',  '6.2.0',  '6.2.1',  '6.2.2',
  '6.3.1',  '6.4.0',  '6.4.1',  '6.5.0',  '6.5.1',  '6.5.2',  '7.0.0',
  '7.0.1',  '7.0.2',  '7.0.3',  '7.0.4',  '7.0.5',  '7.0.6',  '7.0.7',
  '7.1.0',  '7.2.0',  '7.3.0',  '7.3.1',  '7.3.2',  '7.3.3'
]
~~~

然后找到要安装的版本安装即可。

如果我们想要找的该lib的最新版本，则可以使用：

~~~js
npm view inquirer version
7.3.3
~~~

## 查看已安装的npm软件包

我们可以使用npm list来查看有已安装的 npm 软件包（包括它们的依赖包）的最新版本：

~~~js
└─┬ inquirer@7.3.3
  ├─┬ ansi-escapes@4.3.1
  │ └── type-fest@0.11.0
  ├─┬ chalk@4.1.0
  │ ├─┬ ansi-styles@4.2.1
  │ │ ├── @types/color-name@1.1.1
  │ │ └─┬ color-convert@2.0.1
  │ │   └── color-name@1.1.4
~~~

list可以加上--depth参数表示列出的包的层级关系：

~~~js
npm list --depth=0

nodejstest@1.0.0 /Users/flydean/data/git/nodejs/nodejstest
└── inquirer@7.3.3
~~~

或者可以指定要list的包名：

~~~js
npm list inquirer 

nodejstest@1.0.0 /Users/flydean/data/git/nodejs/nodejstest
└── inquirer@7.3.3
~~~

## 版本规则

在nodejs中，所有的版本号都是这样的格式：x.y.z。

其中第一个数字是主版本，第二个数字是次版本，第三个数字是补丁版本。

通常来说，如果升级之后，做了不兼容的API更改，则需要升级主版本。如果是向后兼容的API更改，则升级次要版本，如果是向后兼容的bug修复版本的话，则升级补丁版本。

npm在版本的选择中，制定了一些特殊的符号，表示特别的意思：

^: 如果写入的是 ^0.13.0，则当运行 npm update 时，会更新到补丁版本和次版本：即 0.13.1、0.14.0、依此类推。

~: 如果写入的是 〜0.13.0，则当运行 npm update 时，会更新到补丁版本：即 0.13.1 可以，但 0.14.0 不可以。

\>: 接受高于指定版本的任何版本。

\>=: 接受等于或高于指定版本的任何版本。

<=: 接受等于或低于指定版本的任何版本。

<: 接受低于指定版本的任何版本。

=: 接受确切的版本。

-: 接受一定范围的版本。例如：2.1.0 - 2.6.2。

||: 组合集合。例如 < 2.1 || > 2.6。

无符号: 仅接受指定的特定版本（例如 1.2.1）。

latest: 使用可用的最新版本。

## 依赖包更新

有时候，我们需要更新package.json中指定的依赖包，我们可以使用npm update，按照上一节所讲的规则，npm update只会更新次版本和补丁版本，而不会更新主版本。

并且只会修改package-lock.json，而package.json 则保持不变。

如果要查找package.json中是否有可用的更新，可以使用npm outdated：

~~~js
npm outdated

Package                   Current  Wanted  Latest  Location
streamsoftco-development   1.0.61  1.0.61   2.0.2  volunteer
~~~

如果你想更新到主版本，npm update肯定是做不到的。这时候我们需要一个全局的模块：npm-check-updates：

~~~js
npm install -g npm-check-updates
~~~

然后运行：

~~~js
ncu -u
~~~

这会升级 package.json 文件的 dependencies 和 devDependencies 中的所有版本，以便 npm 可以安装新的主版本。

然后运行：

~~~js
npm update
~~~

即可更新到最新版本。

## 卸载npm包

有安装就有卸载，我们可以使用：

~~~js
npm uninstall <package-name>
~~~

来方便的卸载npm包。

如果我们添加了--save，还会从pacakge.json中将其移除。

当然，如果你是开发依赖性，那么需要使用--save-dev，如果你是全局选项，则需要添加 -g。


# npx包运行器

npx是从npm5.2版本之后引入的一个命令。

npm虽然是强大的包管理工具，但是所有的依赖包都需要下载到本地的node_modules文件夹，非常的不方便。

如果我们只是想运行一下某个依赖包中的命令怎么办？

下载下来太麻烦，所以npx出现了。

JS的依赖包和java不一样，java的依赖一般就是jar文件，而JS的依赖包中除了js文件之外，还可能有可执行文件。

使用npm将lib下载下来之后，我们还需要找到具体的可执行文件的路径才能执行，非常的不方便，使用npx就可以轻松的避免这个问题：

运行 npx commandname 会自动地在项目的 node_modules 文件夹中找到命令的正确引用，而无需知道确切的路径，也不需要在全局和用户路径中安装软件包。

npx还可以不下载依赖文件，直接运行某个命令，并且还可以指定依赖的版本号，从而运行特定的命令：

~~~js
npx node@12 -v

v12.18.4
~~~

当然了，npx不仅仅可以运行npm中的代码，还可以直接从 URL 运行任意代码片段。

比如运行GitHub gist 上面的代码：

~~~js
npx https://gist.github.com/zkat/4bc19503fe9e9309e2bfaa2c58074d32
~~~

> 注意，运行第三方URL上面的代码一定要保证其安全可靠，否则会产生安全问题。

# package.json

package.json文件像是一个项目的管理目录，里面列出了这个项目的一些描述信息，依赖选项和脚本信息。

package.json本身就是一个json文件，我们看一个简单的例子：

~~~js
{
  "name": "nodejstest",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "inquirer": "^7.3.2"
  },
  "devDependencies": {},
  "optionalDependencies": {},
  "bundleDependencies": [
    "inquirer"
  ]
}
~~~

这个文件主要有下面几个选项：

name： 程序或者软件包的名字

version： 当前版本号

description：程序的描述信息

main： 程序的入口

private：表示程序是否是私有的，如果是私有的，则不会被发布到npm中去。

scripts： 定义了一些可以直接运行的脚本

dependencies： 该程序依赖的npm包

devDependencies： 该程序的开发依赖包

engines： 该程序运行的nodejs版本号

browserslist： 支持的浏览器版本

# package-lock.json

package-lock.json是在nodejs5中引入的。

为什么会有这个文件呢？

我们知道，当我们使用npm install的时候，根据pacakge.json中指定的依赖版本不同，可能会安装不同的依赖包版本。

比如，^0.15.0， 这个表示npm install的时候会安装0.16.0版本。

如果是在团队合作开发的情况下，可能不同的人npm install出来的依赖包版本是不同的。

虽然只是小版本的改变，但是也有可能引入问题。为了解决这个问题，nodejs 引入了package-lock.json。

这个文件里面指定了依赖lib的特定版本号。

~~~js
{
  "name": "nodejstest",
  "version": "1.0.0",
  "lockfileVersion": 1,
  "requires": true,
  "dependencies": {
    "@types/color-name": {
      "version": "1.1.1",
      "resolved": "https://registry.npm.taobao.org/@types/color-name/download/@types/color-name-1.1.1.tgz",
      "integrity": "sha1-HBJhu+qhCoBVu8XYq4S3sq/IRqA="
    },
    "ansi-escapes": {
      "version": "4.3.1",
      "resolved": "https://registry.npm.taobao.org/ansi-escapes/download/ansi-escapes-4.3.1.tgz",
      "integrity": "sha1-pcR8xDGB8fOP/XB2g3cA05VSKmE=",
      "requires": {
        "type-fest": "^0.11.0"
      }
    },
~~~

package-lock.json也是一个json文件，我们可以看到，在dependencies中，不仅指定了版本号，还指定了下载地址，非常的方便。

> 注意，我们使用npm update的时候，只会更新package-lock.json，不会更新pacakge.json.

有了package-lock.json，下一次执行npm install的时候就会直接从package-lock.json中读取信息。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！










