---
slug: /gradle-kick-off
---

# 1. 最新版gradle安装使用简介

# 简介

gradle的最新版本是6.7，从2009年的第一个版本，到2020年的6.7，已经发展了11年了。gradle是作为android的官方构建工具引入的，除了java，它还能够支持多种语言的构建，所以用途非常广泛。

![](https://img-blog.csdnimg.cn/20201027165404549.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

gradle是开源的构建工具，你可以使用groovy或者kotlin来编写gradle的脚本，所以说gradle是一个非常强大的，高度定制化的和非常快速的构建工具。

根据我的了解，虽然gradle非常强大，但是对于java程序员来说，一般还是都使用的maven，或者同时提供maven和gradle两种构建方式。

为什么会这样呢？个人觉得有两个原因：

第一个原因是gradle安装文件和依赖包的网络环境，如果单单依靠国内的网络环境的话，非常难安装完成。

第二个原因就是gradle中需要自己编写构建脚本，相对于纯配置的脚本来说，比较复杂。

# 安装gradle和解决gradle安装的问题

gradle需要java8的支持，所以，你首先需要安装好JDK8或者以上的版本。

~~~sh
❯ java -version
java version "1.8.0_151"
Java(TM) SE Runtime Environment (build 1.8.0_151-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.151-b12, mixed mode)
~~~

安装gradle有两种方式，一种就是最简单的从官网上面下载安装包。然后解压在某个目录，最后将PATH指向该目录下的bin即可：

~~~sh
❯ mkdir /opt/gradle
❯ unzip -d /opt/gradle gradle-6.7-bin.zip
❯ ls /opt/gradle/gradle-6.7
LICENSE  NOTICE  bin  README  init.d  lib  media

export PATH=$PATH:/opt/gradle/gradle-6.7/bin
~~~

如果你想使用包管理器，比如MAC上面的brew来进行管理的话，则可以这样安装：

~~~sh
brew install gradle
~~~

但是这样安装很有可能在下载gradle安装包的时候卡住。

~~~sh
==> Downloading https://services.gradle.org/distributions/gradle-6.4.1-bin.zip
##O#- #
~~~

怎么办呢？

这时候我们需要自行下载gradle-6.4.1-bin.zip安装包，然后将其放入http服务器中，让这个压缩包可以通过http协议来访问。

简单点的做法就是将这个zip文件拷贝到IDEA中，利用IDEA本地服务器的预览功能，获得zip的http路径，比如：http://localhost:63345/gradle/gradle-6.7-all.zip.

接下来就是最精彩的部分了，我们需要修改gradle.rb文件：

~~~sh
brew edit gradle
~~~

使用上面的命令可以修改gracle.rb文件，我们替换掉下面的一段：

~~~sh
  homepage "https://www.gradle.org/"
  url "https://services.gradle.org/distributions/gradle-6.7-all.zip"
  sha256 "0080de8491f0918e4f529a6db6820fa0b9e818ee2386117f4394f95feb1d5583"
~~~

url替换成为http://localhost:63345/gradle/gradle-6.7-all.zip，而sha256可以使用 sha256sum gradle-6.7-all.zip这个命令来获取。

替换之后，重新执行brew install gradle即可安装完成。

安装完毕之后，我们使用gradle -v命令可以验证是否安装成功：

~~~sh
gradle -v

Welcome to Gradle 6.7!
~~~

# Gradle特性

gradle作为一种新的构建工具，因为它是依赖于groovy和kotlin脚本的，基于脚本的灵活性，我们通过自定义脚本基本上可以做任何想要的构建工作。

虽然说gradle可以做任何构建工作，但是gradle现在还是有一定的限制，那就是项目的依赖项目前只支持于maven和Ivy兼容的存储库以及文件系统。

gradle通过各种预定义的插件，可以轻松的构建通用类型的项目，并且支持自定义的插件类型。

另外一个非常重要的特性是gradle是以任务为基础的，每一个build都包含了一系列的task，这些task又有各自的依赖关系，然后这些task一起构成了一个有向无环图Directed Acyclic Graphs (DAGs)。

有了这个DAG，gradle就可以决定各个task的顺序，并执行他们。

我们看两个task DAG的例子，一个是通用的task，一个是专门的编译java的例子：

![](https://img-blog.csdnimg.cn/20201027202527959.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

task可以依赖task，我们看个例子：

~~~java
task hello {
    doLast {
        println 'Hello world!'
    }
}
task intro {
    dependsOn hello
    doLast {
        println "I'm Gradle"
    }
}
~~~

一个task可以包含Actions，inputs和Outputs。根据需要这些类型可以自由组合。

## 标准task

Gradle包含了下面7种标准的task：

* clean ：用来删除build目录和里面的一切。

* check：这是一个生命周期任务，通常做一些验证工作，比如执行测试任务等。

* assemble ：这是一个生命周期任务，用来生成可分发的文件，比如jar包。

* build： 也是一个生命周期任务，用来执行测试任务和生成最后的production文件。通常我们不在build中直接做任何特定的任务操作，它一般是其他任务的组合。

* buildConfiguration： 组装configuration中指定的archives。

* uploadConfiguration： 除了执行buildConfiguration之外，还会执行上传工作。

* cleanTask： 删除特定的某个task的执行结果。

## Build phases

一个gradle的build包含了三个phases：

* Initialization： 初始化阶段。gradle支持一个或者多个project的build。在初始化阶段，gradle将会判断到底有哪些project将会执行，并且为他们分别创建一个project实例。

* Configuration： 配置阶段。gradle将会执行build脚本，然后分析出要运行的tasks。

* Execution： 执行阶段。gradle将会执行configuration阶段分析出来的tasks。

# Gradle Wrapper

上面讲的是gradle的手动安装，如果是在多人工作的环境中使用了gradle，有没有什么办法可以不用手动安装gradle就可以自动运行gradle程序呢？

方法当然有，那就是gradle wrapper:

![](https://img-blog.csdnimg.cn/20201027173846957.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

gradle wrapper是一个工具，通过它我们可以方便的对本地的gradle进行管理。

上图列出了gradle wrapper的工作流程，第一步是去下载gradle的安装文件，第二步是将这个安装文件解压到gradle的用户空间，第三步就是使用这个解压出来的gradle了。

我们先看下怎么创建gradle wrapper：

虽然Gradle wrapper的作用是帮我们下载和安装gradle，但是要生成gradle wrapper需要使用gradle命令才行。也就是说有了wrapper你可以按照成功gradle，有了gradle你才可以生成gradle wrapper。

假如我们已经手动按照好了gradle，那么可以执行下面的命令来生成gradle wrapper：

~~~sh
$ gradle wrapper
> Task :wrapper

BUILD SUCCESSFUL in 0s
1 actionable task: 1 executed
~~~

先看下生成出来的文件结构：

~~~sh
.
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
└── gradlew.bat
~~~

gradle/wrapper/gradle-wrapper.properties 是 wrapper的配置文件，我们看下里面的内容：

~~~sh
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-6.7-all.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
~~~

其中distributionUrl就是我们要下载的gradle的路径，其他的配置是gradle的安装目录。

一般来说有两种安装文件类型：bin和all。bin和all的区别在于，bin只有安装文件，而all还包含了gradle的文档和样例代码。

我们可以通过--distribution-type参数来修改安装文件的类型。此外还有 --gradle-version ，--gradle-distribution-url和--gradle-distribution-sha256-sum 这几个参数可以使用。

~~~sh
$ gradle wrapper --gradle-version 6.7 --distribution-type all
> Task :wrapper

BUILD SUCCESSFUL in 0s
1 actionable task: 1 executed
~~~

除了配置文件之外，我们还有3个文件：

* gradle-wrapper.jar： wrapper业务逻辑的实现文件。

* gradlew, gradlew.bat ：使用wrapper执行build的执行文件。也就是说我们可以使用wrapper来执行gradle的build任务。

## wrapper的使用

我们可以这样使用gradlew,来执行build：

~~~sh
gradlew.bat build
~~~

> 注意，如果你是第一次在项目中执行build命令的话，将会自动为你下载和安装gradle。

## wrapper的升级

如果我们想要升级gradle的版本，也很简单：

~~~sh
./gradlew wrapper --gradle-version 6.7
~~~

或者直接修改 gradle-wrapper.properties 也可以。

# 一个简单的build.gradle

我们看一个非常简单的gradle的例子：

~~~java
plugins {
    id 'application' 
}

repositories {
    jcenter() 
}

dependencies {
    testImplementation 'junit:junit:4.13' 

    implementation 'com.google.guava:guava:29.0-jre' 
}

application {
    mainClass = 'demo.App' 
}
~~~

上面我们需要安装一个application plugin，使用的是jcenter的依赖仓库，还指定了几个具体的依赖项。最后，指明了我们应用程序的mainClass。

# gradle使用maven仓库

build.gradle中的repositories指明的是使用的仓库选项。

默认情况下gradle有自己的本地仓库,一般在~/.gradle目录下面，如果我们之前用的是maven仓库，那么在本地的maven仓库中已经存在了很多依赖包了，如何重用呢？

我们可以这样修改repositories：

~~~java
    mavenLocal()
    mavenCentral()
~~~

这样的话, 就会优先从maven的仓库中查找所需的jar包。

# 总结

本文只是一个很简单的gradle介绍，让大家对gradle有一个基本的了解，后面我们会详细的介绍gradle的各种用法，敬请期待。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！










