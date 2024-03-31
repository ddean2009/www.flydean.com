---
slug: /gradle-vs-maven
---

# 5. 深入了解gradle和maven的区别

# 简介

gradle和maven都可以用来构建java程序，甚至在某些情况下，两者还可以互相转换，那么他们两个的共同点和不同点是什么？我们如何在项目中选择使用哪种技术呢？一起来看看吧。

# gradle和maven的比较

虽然gradle和maven都可以作为java程序的构建工具。但是两者还是有很大的不同之处的。我们可以从下面几个方面来进行分析。

## 可扩展性

Google选择gradle作为android的构建工具不是没有理由的，其中一个非常重要的原因就是因为gradle够灵活。一方面是因为gradle使用的是groovy或者kotlin语言作为脚本的编写语言，这样极大的提高了脚本的灵活性，但是其本质上的原因是gradle的基础架构能够支持这种灵活性。

你可以使用gradle来构建native的C/C++程序，甚至扩展到任何语言的构建。

相对而言，maven的灵活性就差一些，并且自定义起来也比较麻烦，但是maven的项目比较容易看懂，并且上手简单。

所以如果你的项目没有太多自定义构建需求的话还是推荐使用maven，但是如果有自定义的构建需求，那么还是投入gradle的怀抱吧。

## 性能比较

虽然现在大家的机子性能都比较强劲，好像在做项目构建的时候性能的优势并不是那么的迫切，但是对于大型项目来说，一次构建可能会需要很长的时间，尤其对于自动化构建和CI的环境来说，当然希望这个构建是越快越好。

Gradle和Maven都支持并行的项目构建和依赖解析。但是gradle的三个特点让gradle可以跑的比maven快上一点：

* 增量构建

gradle为了提升构建的效率，提出了增量构建的概念，为了实现增量构建，gradle将每一个task都分成了三部分，分别是input输入，任务本身和output输出。下图是一个典型的java编译的task。

![](https://img-blog.csdnimg.cn/20201028104251422.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

以上图为例，input就是目标jdk的版本，源代码等，output就是编译出来的class文件。

增量构建的原理就是监控input的变化，只有input发送变化了，才重新执行task任务，否则gradle认为可以重用之前的执行结果。

所以在编写gradle的task的时候，需要指定task的输入和输出。

并且要注意只有会对输出结果产生变化的才能被称为输入，如果你定义了对初始结果完全无关的变量作为输入，则这些变量的变化会导致gradle重新执行task，导致了不必要的性能的损耗。

还要注意不确定执行结果的任务，比如说同样的输入可能会得到不同的输出结果，那么这样的任务将不能够被配置为增量构建任务。

* 构建缓存

gradle可以重用同样input的输出作为缓存，大家可能会有疑问了，这个缓存和增量编译不是一个意思吗？

在同一个机子上是的，但是缓存可以跨机器共享.如果你是在一个CI服务的话，build cache将会非常有用。因为developer的build可以直接从CI服务器上面拉取构建结果，非常的方便。

* Gradle守护进程

gradle会开启一个守护进程来和各个build任务进行交互，优点就是不需要每次构建都初始化需要的组件和服务。

同时因为守护进程是一个一直运行的进程，除了可以避免每次JVM启动的开销之外，还可以缓存项目结构，文件，task和其他的信息，从而提升运行速度。

我们可以运行 gradle --status 来查看正在运行的daemons进程。

从Gradle 3.0之后，daemons是默认开启的，你可以使用 org.gradle.daemon=false 来禁止daemons。

我们可以通过下面的几个图来直观的感受一下gradle和maven的性能比较：

* 使用gradle和maven构建 Apache Commons Lang 3的比较：
  
![](https://img-blog.csdnimg.cn/20201028205153551.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

* 使用gradle和maven构建小项目（10个模块，每个模块50个源文件和50个测试文件）的比较：

![](https://img-blog.csdnimg.cn/2020102820530754.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

* 使用gradle和maven构建大项目（500个模块，每个模块100个源文件和100个测试文件）的比较：

![](https://img-blog.csdnimg.cn/20201028205402145.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到gradle性能的提升是非常明显的。

## 依赖的区别

gralde和maven都可以本地缓存依赖文件，并且都支持依赖文件的并行下载。

在maven中只可以通过版本号来覆盖一个依赖项。而gradle更加灵活，你可以自定义依赖关系和替换规则，通过这些替换规则，gradle可以构建非常复杂的项目。

# 从maven迁移到gradle

因为maven出现的时间比较早，所以基本上所有的java项目都支持maven，但是并不是所有的项目都支持gradle。如果你有需要把maven项目迁移到gradle的想法，那么就一起来看看吧。

根据我们之前的介绍，大家可以发现gradle和maven从本质上来说就是不同的，gradle通过task的DAG图来组织任务，而maven则是通过attach到phases的goals来执行任务。

虽然两者的构建有很大的不同，但是得益于gradle和maven相识的各种约定规则，从maven移植到gradle并不是那么难。

要想从maven移植到gradle，首先要了解下maven的build生命周期，maven的生命周期包含了clean，compile，test，package，verify，install和deploy这几个phase。

我们需要将maven的生命周期phase转换为gradle的生命周期task。这里需要使用到gradle的Base Plugin，Java Plugin和Maven Publish Plugin。

先看下怎么引入这三个plugin：

~~~java
plugins {
    id 'base'
    id 'java'
    id 'maven-publish'
}
~~~

clean会被转换成为clean task，compile会被转换成为classes task，test会被转换成为test task，package会被转换成为assemble task，verify 会被转换成为check task，install会被转换成为 Maven Publish Plugin 中的publishToMavenLocal task，deploy 会被转换成为Maven Publish Plugin 中的publish task。

有了这些task之间的对应关系，我们就可以尝试进行maven到gradle的转换了。

## 自动转换

我们除了可以使用 gradle init 命令来创建一个gradle的架子之外，还可以使用这个命令来将maven项目转换成为gradle项目，gradle init命令会去读取pom文件，并将其转换成为gradle项目。

## 转换依赖

gradle和maven的依赖都包含了group ID, artifact ID 和版本号。两者本质上是一样的，只是形式不同，我们看一个转换的例子：

~~~xml
<dependencies>
    <dependency>
        <groupId>log4j</groupId>
        <artifactId>log4j</artifactId>
        <version>1.2.12</version>
    </dependency>
</dependencies>
~~~

上是一个maven的例子，我们看下gradle的例子怎写：

~~~java
dependencies {
    implementation 'log4j:log4j:1.2.12'  
}
~~~

可以看到gradle比maven写起来要简单很多。

注意这里的implementation实际上是由 Java Plugin 来实现的。

我们在maven的依赖中有时候还会用到scope选项，用来表示依赖的范围，我们看下这些范围该如何进行转换：

* compile： 

在gradle可以有两种配置来替换compile，我们可以使用implementation或者api。

前者在任何使用Java Plugin的gradle中都可以使用，而api只能在使用Java Library Plugin的项目中使用。

当然两者是有区别的，如果你是构建应用程序或者webapp，那么推荐使用implementation，如果你是在构建Java libraries，那么推荐使用api。

* runtime：

可以替换成 runtimeOnly 。

* test：

gradle中的test分为两种，一种是编译test项目的时候需要，那么可以使用testImplementation，一种是运行test项目的时候需要，那么可以使用testRuntimeOnly。

* provided：

可以替换成为compileOnly。

* import：

在maven中，import经常用在dependencyManagement中，通常用来从一个pom文件中导入依赖项，从而保证项目中依赖项目版本的一致性。

在gradle中，可以使用 platform() 或者 enforcedPlatform() 来导入pom文件：

~~~java
dependencies {
    implementation platform('org.springframework.boot:spring-boot-dependencies:1.5.8.RELEASE') 

    implementation 'com.google.code.gson:gson' 
    implementation 'dom4j:dom4j'
}
~~~

比如上面的例子中，我们导入了spring-boot-dependencies。因为这个pom中已经定义了依赖项的版本号，所以我们在后面引入gson的时候就不需要指定版本号了。

platform和enforcedPlatform的区别在于，enforcedPlatform会将导入的pom版本号覆盖其他导入的版本号：

~~~java
dependencies {
    // import a BOM. The versions used in this file will override any other version found in the graph
    implementation enforcedPlatform('org.springframework.boot:spring-boot-dependencies:1.5.8.RELEASE')

    // define dependencies without versions
    implementation 'com.google.code.gson:gson'
    implementation 'dom4j:dom4j'

    // this version will be overridden by the one found in the BOM
    implementation 'org.codehaus.groovy:groovy:1.8.6'
}
~~~

## 转换repositories仓库

gradle可以兼容使用maven或者lvy的repository。gradle没有默认的仓库地址，所以你必须手动指定一个。

你可以在gradle使用maven的仓库：

~~~java
repositories {
    mavenCentral()
}
~~~

我们还可以直接指定maven仓库的地址：

~~~java
repositories {
    maven {
        url "http://repo.mycompany.com/maven2"
    }
}
~~~

如果你想使用maven本地的仓库，则可以这样使用：

~~~java
repositories {
    mavenLocal()
}
~~~

但是mavenLocal是不推荐使用的，为什么呢？

mavenLocal只是maven在本地的一个cache，它包含的内容并不完整。比如说一个本地的maven repository module可能只包含了jar包文件，并没有包含source或者javadoc文件。那么我们将不能够在gradle中查看这个module的源代码，因为gradle会首先在maven本地的路径中查找这个module。

并且本地的repository是不可信任的，因为里面的内容可以轻易被修改，并没有任何的验证机制。

## 控制依赖的版本

如果同一个项目中对同一个模块有不同版本的两个依赖的话，默认情况下Gradle会在解析完DAG之后，选择版本最高的那个依赖包。

但是这样做并不一定就是正确的， 所以我们需要自定义依赖版本的功能。

首先就是上面我们提到的使用platform()和enforcedPlatform() 来导入BOM（packaging类型是POM的）文件。

如果我们项目中依赖了某个module，而这个module又依赖了另外的module，我们叫做传递依赖。在这种情况下，如果我们希望控制传递依赖的版本，比如说将传递依赖的版本升级为一个新的版本，那么可以使用dependency constraints：

~~~java
dependencies {
    implementation 'org.apache.httpcomponents:httpclient'
    constraints {
        implementation('org.apache.httpcomponents:httpclient:4.5.3') {
            because 'previous versions have a bug impacting this application'
        }
        implementation('commons-codec:commons-codec:1.11') {
            because 'version 1.9 pulled from httpclient has bugs affecting this application'
        }
    }
}
~~~

> 注意，dependency constraints只对传递依赖有效，如果上面的例子中commons-codec并不是传递依赖，那么将不会有任何影响。

> 同时 Dependency constraints需要Gradle Module Metadata的支持，也就是说只有你的module是发布在gradle中才支持这个特性，如果是发布在maven或者ivy中是不支持的。

上面讲的是传递依赖的版本升级。同样是传递依赖，如果本项目也需要使用到这个传递依赖的module，但是需要使用到更低的版本（因为默认gradle会使用最新的版本），就需要用到版本降级了。

~~~java
dependencies {
    implementation 'org.apache.httpcomponents:httpclient:4.5.4'
    implementation('commons-codec:commons-codec') {
        version {
            strictly '1.9'
        }
    }
}
~~~

我们可以在implementation中指定特定的version即可。

strictly表示的是强制匹配特定的版本号，除了strictly之外，还有require，表示需要的版本号大于等于给定的版本号。prefer，如果没有指定其他的版本号，那么就使用prefer这个。reject，拒绝使用这个版本。

除此之外，你还可以使用Java Platform Plugin来指定特定的platform，从而限制版本号。

最后看一下如何exclude一个依赖：

~~~java
dependencies {
    implementation('commons-beanutils:commons-beanutils:1.9.4') {
        exclude group: 'commons-collections', module: 'commons-collections'
    }
}
~~~

## 多模块项目

maven中可以创建多模块项目：

~~~xml
<modules>
    <module>simple-weather</module>
    <module>simple-webapp</module>
</modules>
~~~

我们可以在gradle中做同样的事情settings.gradle：

~~~java
rootProject.name = 'simple-multi-module'  

include 'simple-weather', 'simple-webapp'  
~~~

## profile和属性

maven中可以使用profile来区别不同的环境，在gradle中，我们可以定义好不同的profile文件，然后通过脚本来加载他们：

build.gradle：

~~~java
if (!hasProperty('buildProfile')) ext.buildProfile = 'default'  

apply from: "profile-${buildProfile}.gradle"  

task greeting {
    doLast {
        println message  
    }
}
~~~

profile-default.gradle：

~~~java
ext.message = 'foobar'  
~~~

profile-test.gradle：

~~~java
ext.message = 'testing 1 2 3'
~~~

我们可以这样来运行：

~~~java
> gradle greeting
foobar

> gradle -PbuildProfile=test greeting
testing 1 2 3
~~~

## 资源处理

在maven中有一个process-resources阶段，可以执行resources:resources用来进行resource文件的拷贝操作。

在Gradle中的Java plugin的processResources task也可以做相同的事情。

比如我可以执行copy任务：

~~~java
task copyReport(type: Copy) {
    from file("$buildDir/reports/my-report.pdf")
    into file("$buildDir/toArchive")
}
~~~

更加复杂的拷贝：

~~~java
task copyPdfReportsForArchiving(type: Copy) {
    from "$buildDir/reports"
    include "*.pdf"
    into "$buildDir/toArchive"
}
~~~

当然拷贝还有更加复杂的应用。这里就不详细讲解了。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！








