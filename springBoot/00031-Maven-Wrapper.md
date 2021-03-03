# Maven Wrapper简介

## 简介

开发java项目少不了要用到maven或者gradle,对比gradle而言，可能maven要更加常用一些。要使用maven那就必要要安装maven,如果有些用户不想安装maven怎么办？或者说用户不想全局安装maven,那么可以使用项目级别的Maven Wrapper来实现这个功能。

如果大家使用IntelliJ IDEA来开发Spring boot项目, 如果选择从Spring Initializr来创建项目，则会在项目中自动应用Maven Wrapper。简单点说就是在项目目录下面会多出两个文件： mvnw 和  mvnw.cmd。

## Maven Wrapper的结构

mvnw是Linux系统的启动文件。

mvnw.cmd是windows系统的启动文件。

本文不会详细讲解启动文件的内部信息，有兴趣的小伙伴可以自行去研究。除了这两个启动文件，在项目中还会生成一个.mvn的隐藏文件夹。如下图所示：

![](https://img-blog.csdnimg.cn/2020011614430243.png)

我们再看下 .mvn/wrapper/maven-wrapper.properties ：

~~~
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.6.3/apache-maven-3.6.3-bin.zip
wrapperUrl=https://repo.maven.apache.org/maven2/io/takari/maven-wrapper/0.5.6/maven-wrapper-0.5.6.jar
~~~

这个文件指定了maven和maven wrapper的版本。

## 下载Maven Wrapper

如果不是使用IntelliJ IDEA，我们该怎么样下载Maven Wrapper呢？

在程序的主目录下面：

~~~
mvn -N io.takari:maven:wrapper
~~~

如果要指定maven版本：

~~~
mvn -N io.takari:maven:wrapper -Dmaven=3.5.2
~~~

-N 意思是 –non-recursive，只会在主目录下载一次。

## 使用

Maven Wrapper的使用和maven命令是一样的，比如：

~~~
./mvnw clean install
./mvnw spring-boot:run
~~~

更多教程请参考 [flydean的博客](www.flydean.com)

