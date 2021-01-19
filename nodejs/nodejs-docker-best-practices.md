使用nodejs构建Docker image最佳实践

# 简介

docker容器的出现，彻底的改变了应用程序的运行方式，而nodejs同样的也颠覆了后端应用程序的开发模式。两者结合起来，就会产生意想不到的作用。

本文将会以一个常用的nodejs程序为例，分析怎么使用docker来构建nodejs image.

# 准备nodejs应用程序

一个标准的nodejs程序，需要一个package.json文件来描述应用程序的元数据和依赖关系，然后通过npm install来安装应用的依赖关系，最后通过node app.js来运行程序。

本文将会创建一个简单的koa应用程序，来说明docker的使用。

首先创建package.json文件：

~~~js
{
  "name": "koa-docker",
  "description": "怎么将nodejs koa程序打包成docker应用",
  "version": "0.0.1",
  "dependencies": {
    "ejs": "^2.5.6",
    "fs-promise": "^2.0.3",
    "koa": "^2.2.0",
    "koa-basic-auth": "^2.0.0",
    "koa-body": "^4.0.8",
    "koa-compose": "^4.0.0",
    "koa-csrf": "^3.0.6",
    "koa-logger": "^3.0.0",
    "@koa/router": "^8.0.5",
    "koa-session": "^5.0.0",
    "koa-static": "^3.0.0",
    "koa-views": "^6.0.2"
  },
  "scripts": {
    "test": "NODE_ENV=test mocha --harmony --reporter spec --require should */test.js",
    "lint": "eslint ."
  },
  "engines": {
    "node": ">= 7.6"
  },
  "license": "MIT"
}

~~~

上面的package.json文件制定了项目的依赖。

接下来，我们需要使用npm install来安装项目的依赖，安装好的项目依赖文件将会放在本地的node_modules文件夹中。

然后我们就可以编写服务程序了：

~~~js
const Koa = require('koa');
const app = module.exports = new Koa();

app.use(async function(ctx) {
  ctx.body = 'Hello www.flydean.com';
});

if (!module.parent) app.listen(3000);

~~~

上面是一个非常简单的koa服务端程序，监听在3000端口，并且对每次请求都会返回‘Hello www.flydean.com’。

运行node app.js 我们就可以开启web服务了。

好了，我们的服务程序搭建完毕，接下来，我们看一下docker打包nodejs程序的最佳实践。

# 创建Dockerfile文件

为了创建docker image，我们需要一个Dockerfile文件，作为该image的描述。

我们一步一步的讲解，如何创建这个Dockerfile文件。

1. 引入base image。

为了运行docker程序，我们需要指定一个基本的image，比如操作系统，node为我们提供了一个封装好的image，我们可以直接引用：

~~~js
FROM node:12
~~~

我们指定了node的12版本，这个版本已经安装好了最新的LTS node 12，使用这个image我们就可以不需要自己来安装node的相关环境，非常的方便。

2. 指定工作目录

有了image，接下来就需要我们指定docker中的工作目录：

~~~js
# Create app directory
WORKDIR /data/app
~~~

3. 安装node_modules

接下来我们需要将package*.json文件拷贝进image中，并且运行npm install来安装依赖库：

~~~js
COPY package*.json ./

RUN npm install
~~~

上面我们拷贝的是package*.json，因为如果我们本地运行过npm install命令的话，将会生成一个pacakge-lock.json文件。这个文件是为了统一依赖包版本用的。我们需要一并拷贝。

拷贝完之后就可以运行npm install来安装依赖包了。

问题？为什么我们只拷贝了pacakge.json,而不是拷贝整个工作目录呢？

回答：docker file中的每一个命令，都会导致创建一个新的layer，上面的docker file中，只要pakage.json没有被修改，新创建的docker image其实是可以共享layer缓存的。

但是如果我们直接添加本地的工作目录，那么只要我们的工作目录有文件被修改，会导致整个docker image重新构建。所以为了提升构建效率和速度，我们只拷贝package.json。

4. 拷贝应用程序并运行

最后的工作就是拷贝应用程序app.js然后运行了：

~~~js
# 拷贝应用程序
COPY app.js .

# 暴露端口
EXPOSE 8080

# 运行命令
CMD [ "node", "app.js" ]
~~~

最后，我们的dockerfile文件应该是这样的：

~~~js
FROM node:12

# Create app directory
WORKDIR /data/app

COPY package*.json ./

RUN npm install

# 拷贝应用程序
COPY app.js .

# 暴露端口
EXPOSE 8080

# 运行命令
CMD [ "node", "app.js" ]
~~~

# 创建.dockerignore文件

我们知道git会有一个.gitignore文件，同样的docker也有一个.dockerignore文件，这个文件的作用就是避免你的本地文件被拷贝到docker image中。

~~~js
node_modules
~~~

比如我们可以在其中指定node_modules，使其不会被拷贝。

# 创建docker image

创建docker image很简单，我们可以使用下面的命令：

~~~js
docker build -t flydean/koa-web-app .
~~~

创建完毕之后，我们可以使用docker images来查看刚刚创建好的image :

~~~js
docker images

# Example
REPOSITORY                      TAG        ID              CREATED
node                            12         1934b0b038d1    5 days ago
flydean/koa-web-app             latest     d64d3505b0d2    1 minute ago
~~~

# 运行docker程序

最后，我们可以通过docker run命令来运行应用程序

~~~js
docker run -p 54321:8080 -d flydean/koa-web-app
~~~

然后我们就可以通过本地的54321端口来访问应用程序了。

# node的docker image需要注意的事项

这里我们来探讨一下创建docker image需要注意的事项。

1. 不要使用root用户来运行应用程序

默认情况下，docker中的应用程序会以root用户来运行，为了安全起见，建议大家以普通用户来运行应用程序，我们可以在docker file中指定：

~~~js
FROM node:12
...
# 在最后，以node用户来运行应用程序
USER node
~~~

或者我们在运行的时候以  -u "node"  作为启动参数来指定运行的用户。

~~~js
docker run \
  -u "node"
  flydean/koa-web-app 
~~~

2. 指定运行时候的NODE_ENV

node的应用程序很多时候需要依赖于NODE_ENV来指定运行时环境，我们可以以参数的形式传递给docker run命令：

~~~js
docker run \
-e "NODE_ENV=production"
  flydean/koa-web-app 
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！


