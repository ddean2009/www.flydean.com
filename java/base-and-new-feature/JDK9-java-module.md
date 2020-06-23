JDK9的新特性:JPMS模块化

# 简介

JDK9引入了一个新的特性叫做JPMS（Java Platform Module System），也可以叫做Project Jigsaw。模块化的本质就是将一个大型的项目拆分成为一个一个的模块，每个模块都是独立的单元，并且不同的模块之间可以互相引用和调用。

在module中会有元数据来描述该模块的信息和该模块与其他模块之间的关系。这些模块组合起来，构成了最后的运行程序。

听起来是不是和gradle或者maven中的模块很像？

通过组件化，我们可以根据功能来区分具体的模块，从而保持模块内的高聚合，模块之间的低耦合。

另外，我们可以通过模块化来隐藏接口的具体实现内容，从而不影响模块之间的调用。

最后，我们可以通过显示声明来描述模块之间的依赖关系。从而让开发者更好的理解系统的应用逻辑。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# JDK9中模块的实现

在JDK9之前，java是通过不同的package和jar来做功能的区分和隔离的。

但在JDK9中，一切都发送了变化。

首先是JDK9本身的变化，JDK现在是以不同的模块来区分的，如果你展开IDE中JDK的依赖,会看到java.base,java.compiler等模块。

![](https://img-blog.csdnimg.cn/20200504225913427.png)

其中java.base模块比较特殊，它是独立的模块，这就意味着它并不依赖于其他任何模块，并且java.base是其他模块的基础，所以在其他模块中并不需要显式引用java.base。

我们再总结一下：

class是字段和方法的集合，package是class的集合，而module是package的集合。

一般来说使用模块和不使用模块对用户来说基本上是感觉不到的，因为你可以将模块的jar包当成普通的jar包来使用，也可以将普通的jar包当成模块的jar包来使用。

> 当使用普通的jar包时，JDK将会采用一种Automatic modules的策略将普通jar包当成module jar包来看待。

那么module和普通的jar包有什么区别呢？

1. module中包含有一个module-info.class文件，这个文件定义了module本身的信息和跟外部module之间的关系。

2. 要使用module jar包，需要将该jar包放入modulepath而不是classpath。

下面我们在具体的例子中详细探索一下module的使用。

# JDK中的module

刚刚讲到了JDK也是以模块来区分的，并且所有模块的基础都是java.base。我们可以使用java --list-modules 来列出现有的所有module：

~~~java
java --list-modules 

java.base@14.0.1
java.compiler@14.0.1
java.datatransfer@14.0.1
java.desktop@14.0.1
java.instrument@14.0.1
java.logging@14.0.1
java.management@14.0.1
java.management.rmi@14.0.1
....
~~~

也可以使用java --describe-module 来查看具体module的信息：

~~~java
java --describe-module java.base

java.base@14.0.1
exports java.io
exports java.lang
exports java.lang.annotation
exports java.lang.constant
exports java.lang.invoke
exports java.lang.module
exports java.lang.ref
exports java.lang.reflect
exports java.lang.runtime
...
~~~

我们再具体看一下module-info.class文件中的内容：

~~~java
module java.base {
    exports java.io;
    exports java.lang;
    exports java.lang.annotation;
    ...
~~~

文件很长，具体就不一一列举了，有兴趣的朋友可以自行参阅。

看到了JDK自带的module，接下来我们创建几个自己的module来看看。

# 创建自己的module

假如我们有一个controller，一个service的接口，和两个service的实现。

为了简单起见，我们将这四个类分在不同的module中。

在IDEA中创建一个module很简单，只需要在java文件夹中添加module-info.java文件就可以了。如下图所示：

![](https://img-blog.csdnimg.cn/20200504231722599.png)

代码其实很简单，Controller引用了Service接口，而两个Service的实现又实现了Service接口。

看下controller和service两个模块的的module-info文件：

~~~java
module com.flydean.controller {
    requires com.flydean.service;
    requires lombok;
}
~~~

~~~java
module com.flydean.service {
    exports com.flydean.service;
}
~~~

requires表示该模块所要用到的模块名字。exports表示该模块暴露的模块中的包名。如果模块不暴露出去，其他模块是无法引用这些包的。

看下在命令行怎么编译，打包和运行module：

~~~java
$ javac
    --module-path mods
    -d classes/com.flydean.controller
    ${source-files}
$ jar --create
    --file mods/com.flydean.controller.jar
    --main-class com.flydean.controller.ModuleController.Main
    -C classes/com.flydean.controller .
$ java
    --module-path mods
    --module com.flydean.controller
~~~



# 深入理解module-info

上一节我们将了module-info中的requires和exports。这一节我们来更多的讲解module-info中的其他用法。

## transitive

先看下modulea的代码：

~~~java
    public ModuleService getModuleService(){
        return new ModuleServiceA();
    }
~~~

getModuleService方法返回了一个ModuleService，这个ModuleService属于模块com.flydean.service，我们看下module-info的定义：

~~~java
module com.flydean.servicea {
    requires com.flydean.service;
    exports com.flydean.servicea;
}
~~~

看起来好像没什么问题，但是如果有其他的模块来使用servicea的getModuleService方法就会有问题，因为该方法返回了模块com.flydean.service中定义的类。所以这里我们需要用到transitive。

~~~java
module com.flydean.servicea {
    requires transitive com.flydean.service;
    exports com.flydean.servicea;
}
~~~

transitive意味着所有读取com.flydean.servicea的模块也可以读取 com.flydean.service。

## static

有时候，我们在代码中使用到了某些类，那么编译的时候必须要包含这些类的jar包才能够编译通过。但是在运行的时候我们可能不会用到这些类，这样我们可以使用static来表示，该module是可选的。

比如下面的module-info:

~~~java
module com.flydean.controller {
    requires com.flydean.service;
    requires static com.flydean.serviceb;
}
~~~

## exports to

在module info中，如果我们只想将包export暴露给具体的某个或者某些模块，则可以使用exports to:

~~~java
module com.flydean.service {
    exports com.flydean.service to com.flydean.controller;
}
~~~

上面我们将com.flydean.service只暴露给了com.flydean.controller。

## open pacakge

使用static我们可以在运行时屏蔽模块，而使用open我们可以将某些package编译时不可以，但是运行时可用。

~~~java
module com.flydean.service {
    opens com.flydean.service.subservice;
    exports com.flydean.service to com.flydean.controller, com.flydean.servicea, com.flydean.serviceb;
}
~~~

上面的例子中com.flydean.service.subservice是在编译时不可用的，但是在运行时可用。一般来说在用到反射的情况下会需要这样的定义。

## provides with

假如我们要在Controller中使用service的具体实现，比如servicea和serviceb。一种方法是我们直接在controller模块中使用servicea和serviceb，这样就高度耦合了。

在模块中，我们可以使用provides with来对模块之间的耦合进行解耦。

我们看下代码：

~~~java
module com.flydean.controller {
    uses com.flydean.service.ModuleService;
    requires com.flydean.service;
    requires lombok;
    requires slf4j.api;
}
~~~

~~~java
module com.flydean.servicea {
    requires transitive com.flydean.service;
    provides com.flydean.service.ModuleService with com.flydean.servicea.ModuleServiceA;
    exports com.flydean.servicea;
}
~~~

~~~java
module com.flydean.serviceb {
    requires transitive com.flydean.service;
    provides com.flydean.service.ModuleService with com.flydean.serviceb.ModuleServiceB;
    exports com.flydean.serviceb;
}
~~~

在controller中，我们使用uses来暴露要实现的接口。而在具体的实现模块中使用provides with来暴露具体的实现。

怎么使用呢？我们在controller中：

~~~java
public static void main(String[] args) {
    List<ModuleService> moduleServices = ServiceLoader
    .load(ModuleService.class).stream()
    .map(ServiceLoader.Provider::get)
    .collect(toList());
    log.info("{}",moduleServices);
    }
~~~

这里我们使用了ServiceLoader来加载接口的实现。这是一种很好的解耦方式，这样我可以将具体需要使用的模块放在modulepath中，实现动态的修改实现。

> 要想在maven环境中顺利完成编译，maven-compiler-plugin的版本必须要在3.8.1以上。

# 总结

本文介绍了JDK9中module的使用，并在具体的中介绍了更多的module-info的语法。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/
ddean2009/learn-java-base-9-to-20)

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 更多内容请访问 [www.flydean.com](www.flydean.com)















