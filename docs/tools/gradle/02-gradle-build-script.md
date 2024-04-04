---
slug: /gradle-build-script
---

# 2. gradle中的build script详解

# 简介

build.gradle是gradle中非常重要的一个文件，因为它描述了gradle中可以运行的任务，今天本文将会带大家体验一下如何创建一个build.gradle文件和如何编写其中的内容。

# project和task

gradle是一个构建工具，所谓构建工具就是通过既定的各种规则，将原代码或者原文件通过一定的task处理过后，打包生成目标文件的步骤。

所以我们在gradle中有两个非常重要的概念，分别是项目和任务。

每一个gradle的构建任务可以包含一个或者多个项目，项目可以有多种类型，比如是一个web项目或者一个java lib项目等。为了实现project要完成的目标，需要定义一个个的task来辅助完成目标。

task主要用来执行特定的任务，比如编译class文件，打包成jar，生成javadoc等等。

# 一个例子

接下来我们使用一个具体的例子来讲解一下，gradle到底是怎么用的。

首先我们创建一个新的project目录：

~~~sh
$ mkdir gradle-test
$ cd gradle-test
~~~

gradle提供了一个init方法，来方便的创建gradle项目的骨架，我们用下看：

~~~sh
gradle init
Starting a Gradle Daemon (subsequent builds will be faster)

Select type of project to generate:
  1: basic
  2: application
  3: library
  4: Gradle plugin
Enter selection (default: basic) [1..4] 2

Select implementation language:
  1: C++
  2: Groovy
  3: Java
  4: Kotlin
  5: Scala
  6: Swift
Enter selection (default: Java) [1..6] 3

Split functionality across multiple subprojects?:
  1: no - only one application project
  2: yes - application and library projects
Enter selection (default: no - only one application project) [1..2] 1

Select build script DSL:
  1: Groovy
  2: Kotlin
Enter selection (default: Groovy) [1..2] 1

Select test framework:
  1: JUnit 4
  2: TestNG
  3: Spock
  4: JUnit Jupiter
Enter selection (default: JUnit 4) [1..4] 1

Project name (default: gradle-test):
Source package (default: gradle.test):

> Task :init
Get more help with your project: https://docs.gradle.org/6.7/samples/sample_building_java_applications.html

BUILD SUCCESSFUL in 45s
2 actionable tasks: 2 executed
~~~

按照你的需要，经过一系列的选择之后，就可以生成一个基本的gradle项目了。

我们看下生成的文件和目录：

~~~sh
.
├── app
│   ├── build.gradle
│   └── src
│       ├── main
│       │   ├── java
│       │   │   └── gradle
│       │   │       └── test
│       │   │           └── App.java
│       │   └── resources
│       └── test
│           ├── java
│           │   └── gradle
│           │       └── test
│           │           └── AppTest.java
│           └── resources
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
└── settings.gradle

14 directories, 8 files
~~~

其中gradle-wrapper是帮你自动设置和安装gradle的工具，同时它还提供了gradlew和gradlew.bat这两个执行文件，用来执行gradle的任务。

我们主要看其中的两个配置文件，settings.gradle和build.gradle。

settings.gradle中配置的是gradle中要build的项目信息：

~~~java
rootProject.name = 'gradle-test'
include('app')
~~~

上面的例子中，rootProject.name指定了项目的名字，include('app')表示需要引入一个叫做app的子项目，这个子项目中包含着实际的要打包的内容。

再看一下app中的build.gradle文件：

~~~java
plugins {
    // Apply the application plugin to add support for building a CLI application in Java.
    id 'application'
}

repositories {
    // Use JCenter for resolving dependencies.
    jcenter()
}

dependencies {
    // Use JUnit test framework.
    testImplementation 'junit:junit:4.13'

    // This dependency is used by the application.
    implementation 'com.google.guava:guava:29.0-jre'
}

application {
    // Define the main class for the application.
    mainClass = 'gradle.test.App'
}
~~~

很简单，指定了插件，仓库地址，依赖包和应用程序的main class路径。

一切准备好之后，我们就可以进行构建和运行了。

有两种方式来运行，一种方式就是使用系统自带的gradle命令，一种方式就是使用刚刚gradle为你生成的gradlew。

~~~java
gradle run

> Configure project :app
Repository ${repo.url} replaced by $REPOSITORY_URL .

> Task :app:run
Hello World!
~~~

~~~java
gradle build

> Configure project :app
Repository ${repo.url} replaced by $REPOSITORY_URL .

BUILD SUCCESSFUL in 2s
7 actionable tasks: 6 executed, 1 up-to-date
~~~

你还可以带上 --scan 参数将build上传到gradle scan中，得到更加详细的构建分析：

~~~java
./gradlew build --scan

BUILD SUCCESSFUL in 0s
7 actionable tasks: 7 executed

Publishing a build scan to scans.gradle.com requires accepting the Gradle Terms of Service defined at https://gradle.com/terms-of-service.
Do you accept these terms? [yes, no] yes

Gradle Terms of Service accepted.

Publishing build scan...
https://gradle.com/s/5u4w3gxeurtd2
~~~

# task详细讲解

上面的例子中，我们使用的都是gradle默认的tasks，并没有看到自定义task的使用，接下来我们将会探讨一下，如何在build.gradle编写自己的task。

这里我们使用的groovy来编写build.gradle，所以我们可以像运行代码一样来运行它。

## task脚本

先创建一个非常简单的task：

~~~java
task hello {
    doLast {
        println 'Hello www.flydean.com!'
    }
}
~~~

上面定义了一个名叫hello的task，并且会在执行最后输出 "Hello www.flydean.com!"。

我们这样运行：

~~~sh
gradle -q hello
Hello www.flydean.com!
~~~

-q的意思是悄悄的执行，将会忽略gradle自身的log信息。我们把要执行的task名字写在gradle后面就可以了。

如果你熟悉ant命令的话，可以看到gradle的task和ant很类似，不过更加的强大。

因为是groovy脚本，所以我们可以在其中执行代码：

~~~java
task upper {
    doLast {
        String someString = 'www.flydean.com'
        println "Original: $someString"
        println "Upper case: ${someString.toUpperCase()}"
    }
}
~~~

运行结果：

~~~java
> gradle -q upper
Original: www.flydean.com
Upper case: WWW.FLYDEAN.COM
~~~

或者执行times操作：

~~~java
task count {
    doLast {
        4.times { print "$it " }
    }
}
~~~

~~~java
> gradle -q count
0 1 2 3
~~~

## task依赖

gradle中的一个task可以依赖其他的task：

~~~java
task hello {
    doLast {
        println 'Hello www.flydean.com!'
    }
}
task intro {
    dependsOn hello
    doLast {
        println "I'm flydean"
    }
}
~~~

上面两个task的顺序是无关的，可以依赖的写在前面，被依赖的写在后面，或者反过来都成立。

## 动态task

除了静态的task之外，我们还可以通过代码来动态创建task：

~~~java
4.times { counter ->
    task "task$counter" {
        doLast {
            println "I'm task number $counter"
        }
    }
}
~~~

~~~sh
> gradle -q task1
I'm task number 1
~~~

我们还可以将task看做成为一个对象，调用gradle的api进行操作：

~~~java
4.times { counter ->
    task "task$counter" {
        doLast {
            println "I'm task number $counter"
        }
    }
}
task0.dependsOn task2, task3
~~~

上面的例子中，我们调用API手动创建了task之间的依赖关系：

~~~sh
> gradle -q task0
I'm task number 2
I'm task number 3
I'm task number 0
~~~

还可以task之间的属性调用：

~~~java
task myTask {
    ext.myProperty = "www.flydean.com"
}

task printTaskProperties {
    doLast {
        println myTask.myProperty
    }
}
~~~

## 默认task

如果不想每次都在调用gradle命令的时候手动指定某个具体的task名字，我们可以使用defaultTasks：

~~~java
defaultTasks 'clean', 'run'

task clean {
    doLast {
        println 'Default Cleaning!'
    }
}

task run {
    doLast {
        println 'Default Running!'
    }
}

task other {
    doLast {
        println "I'm not a default task!"
    }
}
~~~

上面的代码执行gradle和gradle clean run是相当的。

## build script的外部依赖

既然build script可以用groovy代码来编写，那么如果我们想要在build script中使用外部的jar包怎么办呢？

这个时候，我们可以将外部依赖放到buildscript()方法中，后面的task就可以使用引入的依赖了：

~~~java
import org.apache.commons.codec.binary.Base64

buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath group: 'commons-codec', name: 'commons-codec', version: '1.2'
    }
}

task encode {
    doLast {
        def byte[] encodedString = new Base64().encode('hello world\n'.getBytes())
        println new String(encodedString)
    }
}
~~~

上面的例子中，encode使用了一个外部的依赖包Base64，这个依赖包是在buildscript方法中引入的。

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！












