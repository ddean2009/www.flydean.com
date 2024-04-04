---
slug: /gradle-build-java-projects
---

# 6. 在gradle中构建java项目

# 简介

之前的文章我们讲到了gradle的基本使用，使用gradle的最终目的就是为了构建java项目。今天本文将会详细的讲解如何在gradle中构建java项目。

# 构建java项目的两大插件

安装java项目的目的不同，构建java项目有两大插件，一个是application，表示构建的是java应用程序；一个是java-library，表示构建的是java库，供别的项目使用。

不管是构建应用程序还是java库，我们都可以很方便的使用gradle init来创新一个新的gradle项目：

~~~java
$ gradle init

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

Select build script DSL:
  1: Groovy
  2: Kotlin
Enter selection (default: Groovy) [1..2] 1

Select test framework:
  1: JUnit 4
  2: TestNG
  3: Spock
  4: JUnit Jupiter
Enter selection (default: JUnit 4) [1..4]

Project name (default: demo):
Source package (default: demo):


BUILD SUCCESSFUL
2 actionable tasks: 2 executed
~~~

application和library的不同之处在于第二步选择的不同。

两者在build.gradle中的不同在于plugins的不同，application的plugin是：

~~~java
plugins {
    id 'application' 
}
~~~

而library的plugin是：

~~~java
plugins {
    id 'java-library' 
}
~~~

还有一个不同之处是依赖的不同，先看一个application的依赖：

~~~java
dependencies {
    testImplementation 'junit:junit:4.13' 

    implementation 'com.google.guava:guava:29.0-jre' 
}
~~~

再看一个library的依赖：

~~~java
dependencies {
    testImplementation 'junit:junit:4.13' 

    api 'org.apache.commons:commons-math3:3.6.1' 

    implementation 'com.google.guava:guava:29.0-jre' 
}
~~~

因为library是需要给第三方应用程序使用的，所以这里多了一个api的使用，api表示是第三方应用程序也需要依赖这个包，而implementation表示的是该包只是在这个项目内部被依赖。

在构建libary的时候，还可以自定义manifest的信息：

~~~java
tasks.named('jar') {
    manifest {
        attributes('Implementation-Title': project.name,
                   'Implementation-Version': project.version)
    }
}
~~~

上面的例子将会在META-INF/MANIFEST.MF生成：

~~~java
Manifest-Version: 1.0
Implementation-Title: lib
Implementation-Version: 0.1.0
~~~

我们还可以指定编译的java版本号和lib的版本：

~~~java
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(11)
    }
}

version = '1.2.1'
~~~

# 管理依赖

java的依赖一般都是jar包组成的library。和maven一样，我们在gradle中指定依赖需要指定依赖的名字和版本号，依赖的范围：是运行时依赖还是编译时依赖，还有一个重要的就是在哪里可以找到这个library。

前面两个属性我们可以在dependencies中找到，后面一个我们可以在repositories中找到，看一个例子：

~~~java
repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.hibernate:hibernate-core:3.6.7.Final'
}
~~~

还可以使用这种形式的maven：

~~~java
repositories {
    maven {
        url "http://repo.mycompany.com/maven2"
    }
}
~~~

或者Ivy：

~~~java
repositories {
    ivy {
        url "http://repo.mycompany.com/repo"
    }
}
~~~

甚至可以使用本地的local dir：

~~~java
repositories {
    flatDir {
        dirs 'lib'
    }
    flatDir {
        dirs 'lib1', 'lib2'
    }
}
~~~

上面定义了一个mavenCentral的仓库，我们可以在这个仓库中去查找hibernate-core这个依赖的jar包。

在dependencies这一块，我们可以定义依赖包的工作范围：

* compileOnly： 表示依赖包只被用来编译代码，并不用在程序的运行。

* implementation：表示依赖包被用在编译和运行时。

* runtimeOnly： 只在运行时使用。

* testCompileOnly： 仅在test的编译时使用。

* testImplementation：在test的编译和运行时使用。

* testRuntimeOnly： 在test的运行时使用。

我们还可以添加动态的依赖：

~~~java
dependencies {
    implementation 'org.springframework:spring-web:5.+'
}
~~~

使用项目作为依赖：

~~~java
dependencies {
    implementation project(':shared')
}
~~~

# 编译代码

一般情况下你的源代码需要放在src/main/java 目录下，测试代码需要放在src/test/java下面。然后添加compileOnly 或者 implementation依赖，如果需要测试的话，添加testCompileOnly或者testImplementation依赖。

然后就可以运行compileJava和compileTestJava来编译代码了。

当然，如果你有自定义的源文件目录，也可以这样手动指定：

~~~java
sourceSets {
    main {
         java {
            srcDirs = ['src']
         }
    }

    test {
        java {
            srcDirs = ['test']
        }
    }
}
~~~

上面的代码中我们给srcDirs重新赋值了。如果我们只是想要在现有的代码路径上再添加一个新的路径，那么可以使用srcDir：

~~~java
sourceSets {
    main {
        java {
            srcDir 'thirdParty/src/main/java'
        }
    }
}
~~~

除了源代码的路径，我们还可以配置编译的参数，并指定编译的JDK版本号：

~~~java
compileJava {
    options.incremental = true
    options.fork = true
    options.failOnError = false
    options.release = 7
}
~~~

> 注意，gradle必须要在JDK8以上才能运行，但是我们可以指定gradle去使用Java 6 或者 Java 7去编译源代码。

我们还可以指定预览版本的特性：

~~~java
tasks.withType(JavaCompile) {
    options.compilerArgs += "--enable-preview"
}
tasks.withType(Test) {
    jvmArgs += "--enable-preview"
}
tasks.withType(JavaExec) {
    jvmArgs += "--enable-preview"
}
~~~

# 管理resource

java除了源代码文件之外，还有一些resource文件，比如配置文件，图片文件，语言文件等等。我们需要将这些配置文件拷贝到特定的目标目录中。

默认情况下，gradle会拷贝src/[sourceSet]/resources 中的文件到目标文件夹中。

我们看一个复杂的拷贝动作：

~~~java
task copyDocs(type: Copy) {
    from 'src/main/doc'
    into 'build/target/doc'
}

//for Ant filter
import org.apache.tools.ant.filters.ReplaceTokens

//for including in the copy task
def dataContent = copySpec {
    from 'src/data'
    include '*.data'
}

task initConfig(type: Copy) {
    from('src/main/config') {
        include '**/*.properties'
        include '**/*.xml'
        filter(ReplaceTokens, tokens: [version: '2.3.1'])
    }
    from('src/main/config') {
        exclude '**/*.properties', '**/*.xml'
    }
    from('src/main/languages') {
        rename 'EN_US_(.*)', '$1'
    }
    into 'build/target/config'
    exclude '**/*.bak'

    includeEmptyDirs = false

    with dataContent
}
~~~

# 打包和发布

我们可以根据不同的构建类型来打包对应的文件。比如对应java lib来说，我们可以同时上传源代码和java doc文件：

~~~java
java {
    withJavadocJar()
    withSourcesJar()
}
~~~

比如说我们还可以打包成一个fat jar包：

~~~java
plugins {
    id 'java'
}

version = '1.0.0'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'commons-io:commons-io:2.6'
}

task uberJar(type: Jar) {
    archiveClassifier = 'uber'

    from sourceSets.main.output

    dependsOn configurations.runtimeClasspath
    from {
        configurations.runtimeClasspath.findAll { it.name.endsWith('jar') }.collect { zipTree(it) }
    }
}
~~~

# 生成javadoc

gradle的java library插件有一个javadoc task，可以为java项目生成文档。它支持标准的javadoc，也支持其他类型的文档，比如说Asciidoc，我们看一个生成Asciidoc的例子：

~~~java
configurations {
    asciidoclet
}

dependencies {
    asciidoclet 'org.asciidoctor:asciidoclet:1.+'
}

task configureJavadoc {
    doLast {
        javadoc {
            options.doclet = 'org.asciidoctor.Asciidoclet'
            options.docletpath = configurations.asciidoclet.files.toList()
        }
    }
}

javadoc {
    dependsOn configureJavadoc
}
~~~

> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！


