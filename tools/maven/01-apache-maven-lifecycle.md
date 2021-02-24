Maven的build生命周期和常用plugin

# 简介

Maven和gradle应该是现代java程序员中使用的最多的两种构建工具。在它们出现之前，则是ant的天下。

Maven为我们封装了很多构建中非常有用的操作，我们只需要执行简单的几个mvn命令即可。

今天我们要讨论一下mvn命令之下的生命周期的构建。

> 更多内容请访问[www.flydean.com](www.flydean.com)

# lifecycle和Phases

所谓lifecycle，可以理解为可以执行一组命令的集合，用来执行具体的某些操作。

Maven默认有三种lifecycle：default，clean和site。default主要用来处理项目的开发，clean主要用来负责项目的清理，site主要用来生成项目的文档。

lifecycle是由一个或者多个phase组成的。

以default为例，它大概由23个phases组成，这些phases将会按顺序执行来完成default的lifecycle。

我们选取default lifecycle中非常常见的几个phase来说明一下：

* validate - 用来验证项目是否正确或者项目所需要的信息是否可用。
* compile - 用来编译项目代码
* test - 执行代码中的单元测试
* package - 将编译后的代码进行打包，打包可有很多种方式，比如：jar，war等
* verify - 执行集成测试
* install - 将项目安装到本地仓库中，供有依赖关系的其他项目使用
* deploy - 将项目部署到远程仓库，以便共享给其他的用户

上面的phase执行是有顺序的，比如我们如果执行mvn verify，则会顺序执行validate，compile，test和package。

# Phases和Goals

Phases是一种任务的集合，它是由一个或者多个Goals组成的。Goals可以包含在Phases里面执行，也可以单独用命令执行。

那么Goals又是从哪里来的呢？Goals是定义在maven中的plugin中的。

我们看下面一张直观的图：

![](https://img-blog.csdnimg.cn/20200507214918473.png)

下图列出了现有lifecycle中的phase，和相应phase所对应的plugin。

我们可以看到基本每个phase都和一个plugin中的golas是相对于应的。

除了使用命名直接指定要执行的phase以外，还可以直接指定goals：

~~~java
mvn clean dependency:copy-dependencies package
~~~

上面的命令中clean和package是phase，而copy-dependencies则是goals。

# 常用plugin介绍

这里我们介绍两个非常常用的maven plugin，maven-dependency-plugin和maven-jar-plugin。

## maven-dependency-plugin

maven中的依赖jar包是存放在maven的本地仓库中的，如果项目中依赖了某些jar包，在部署的时候还需要这些依赖的jar包拷贝出来，非常不方便，有了maven-dependency-plugin，则可以借用它的copy-dependencies来将项目的依赖jar包拷贝出啦，如下所示：

~~~java
 <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-dependency-plugin</artifactId>
            <version>3.1.2</version>
            <executions>
                <execution>
                    <id>copy</id>
                    <phase>package</phase>
                    <goals>
                        <goal>copy-dependencies</goal>
                    </goals>
                    <configuration>
                        <outputDirectory>
                            ${project.build.directory}/lib
                        </outputDirectory>
                    </configuration>
                </execution>
            </executions>
        </plugin>
~~~

goals是和相应的phase相关联的，在上面的例子中，我们将copy-dependencies和package相关联，则在我们执行mvn package的时候就会自动执行copy-dependencies，从配置文件可以知道，我们将会把项目的依赖jar包拷贝到项目的build目录的lib目录下。

## maven-jar-plugin

有了依赖的lib，可以将main程序打包成为一个可执行的jar包。这时候我们就需要使用到maven-jar-plugin。

~~~java
<plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.2.0</version>
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>com.flydean.MavenClass</mainClass>
                    </manifest>
                </archive>
            </configuration>
        </plugin>
~~~

为了生成可执行的jar包，我们需要在MANIFEST.MF文件中添加mainClass文件的路径，这样在执行jar包的时候，无需额外的参数即可运行。

遗憾的是，如果我们的class文件用到了外部jar包的依赖时候，jar包直接运行会出错，因为找不到所依赖的jar包。

在介绍maven-dependency-plugin的时候，我们已经把所用到的lib拷贝出来了，这里我们可以直接使用：

~~~java
<plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.2.0</version>
            <configuration>
                <archive>
                    <manifest>
                        <addClasspath>true</addClasspath>
                        <classpathPrefix>lib/</classpathPrefix>
                        <mainClass>com.flydean.MavenClass</mainClass>
                    </manifest>
                </archive>
            </configuration>
        </plugin>
~~~

多加了两个addClasspath的参数，我们将打包好的jar包解压缩。

可以看到里面多了一个MANIFEST.MF的文件：

~~~java
Manifest-Version: 1.0
Created-By: Maven Jar Plugin 3.2.0
Build-Jdk-Spec: 14
Class-Path: lib/lombok-1.18.10.jar lib/logback-classic-1.2.3.jar lib/log
 back-core-1.2.3.jar lib/slf4j-api-1.7.25.jar
Main-Class: com.flydean.MavenClass
~~~

这个文件里面包含了一些jar包的元数据，并且里面添加了Class-Path和Main-Class文件，这时候执行运行jar包就可以直接执行了。

# 总结

本文介绍了maven构建时候的生命周期，并介绍了两个经常会使用到的plugin。

本文的例子[https://github.com/ddean2009/
learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:程序那些事，更多精彩等着您！



