---
slug: /07-Gradle-Nexus-Publish-Plugin
---

# 7. 使用gradle插件发布项目到nexus中央仓库



# 简介

Sonatype 提供了一个叫做开源软件资源库托管Open Source Software Repository Hosting (OSSRH) 的工具，帮助我们来方便的将项目发布到中心仓库中。

但是这个工具和我们的项目构建是割裂的，尤其是在CI集成构建中，很难做到自动化。

Gradle是一个很好的构建工具，灵活而又强大，可不可以直接在Gradle中的任务中直接构建和上传到中央仓库或者其他自定义的nexus仓库中呢？答案是肯定的。

# Gradle Nexus Publish Plugin历史

今天要给大家介绍的gradle插件名字叫做Gradle Nexus Publish Plugin，最近才发布了1.0.0版本，有小伙伴可能要问了，gradle出来这么久了，最近才有这样的插件吗？

其实不然，我们来讲一下gradle Nexus发布插件的历史。

2015年，Marcin Zajączkowski创建了gradle-nexus-staging-plugin，该插件可在Nexus存储库管理器中关闭和释放staging存储库。使用这个插件就可以直接从代码中将Gradle项目发布到Maven Central仓库。多年来，它已经在全球各地被多个项目所采用。

但是这个插件存在一个小问题: 由于Gradle发布过程中的技术限制，因此需要使用启发式技术来跟踪隐式创建的staging存储库，对于给定状态的多个存储库，通常会发布失败。尤其是在持续集成服务Travis CI在2019年末更改其网络架构之后，这个插件问题就更多了。

基于这个问题，马克·菲利普（Marc Philipp）创建了另外一个插件Nexus Publish Plugin，该插件丰富了Gradle中的发布机制，可以显式创建staging存储库并直接向其发布（上传）组件。

通常我们需要将这两个插件一起使用，但是，一个功能需要使用到两个插件还是会让用户感到困惑。所以Gradle Nexus Publish Plugin在2020/2021年应运而生了，它的目的就是合并上面两个插件的功能。

# 插件的使用

在gradle中使用该插件很简单，首先需要引入这个插件：

```
plugins {
    id("io.github.gradle-nexus.publish-plugin") version "«version»"
}
```

> 注意，这个插件必须在 Gradle 5.0 或者之后的版本使用，并且在根项目中引入。

接下来，我们需要定义要发布的仓库，如果是通过Sonatype's OSSRH Nexus发布到Maven的中央仓库，那么需要添加sonatype()，如下所示：

```
nexusPublishing {
    repositories {
        sonatype()
    }
}
```

在sonatype()中，实际上定义了nexusUrl 和 snapshotRepositoryUrl。

发布到中央仓库是需要用户名密码的，我们需要设置sonatypeUsername 和 sonatypePassword 这两个项目的属性。一种方法是在~/.gradle/gradle.properties 中进行配置，或者设置 ORG_GRADLE_PROJECT_sonatypeUsername 和  ORG_GRADLE_PROJECT_sonatypePassword 这两个环境变量。

或者，可以直接在sonatype 中进行定义：

```
nexusPublishing {
    repositories {
        sonatype {
            username = "your-username"
            password = "your-password"
        }
    }
}
```

最后，调用publishToSonatype和 closeAndReleaseSonatypeStagingRepository就可以分别发布到Sonatype和关闭并发布到中央仓库了。

> 注意，上面的closeAndReleaseSonatypeStagingRepository实际上是包含了两步操作：close和release。我们也可以仅仅调用closeSonatypeStagingRepository，然后手动登录Nexus UI，进行release操作。

下面是两个分别使用groovy和Kotlin的具体的例子：

## Groovy DSL

```
plugins {
    id "java-library"
    id "maven-publish"
    id "io.github.gradle-nexus.publish-plugin" version "«version»"
}

publishing {
    publications {
        mavenJava(MavenPublication) {
            from(components.java)
        }
    }
}

nexusPublishing {
    repositories {
        myNexus {
            nexusUrl = uri("https://your-server.com/staging")
            snapshotRepositoryUrl = uri("https://your-server.com/snapshots")
            username = "your-username" // defaults to project.properties["myNexusUsername"]
            password = "your-password" // defaults to project.properties["myNexusPassword"]
        }
    }
}
```

## Kotlin DSL

```
plugins {
    `java-library`
    `maven-publish`
    id("io.github.gradle-nexus.publish-plugin") version "«version»"
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            from(components["java"])
        }
    }
}

nexusPublishing {
    repositories {
        create("myNexus") {
            nexusUrl.set(uri("https://your-server.com/staging"))
            snapshotRepositoryUrl.set(uri("https://your-server.com/snapshots"))
            username.set("your-username") // defaults to project.properties["myNexusUsername"]
            password.set("your-password") // defaults to project.properties["myNexusPassword"]
        }
    }
}
```

默认情况下nexusPublishing中的connectTimeout和clientTimeout是5分钟，可以根据自己的需要进行调整。

# 插件背后的故事

我们来看一下这个插件背后是怎么工作的。

首先定义的`nexusPublishing { repositories { ... } }` 会拦截所有子项目的 `maven-publish` 插件，用来修改发布地址。

如果项目的版本号不是以`-SNAPSHOT`结尾，这说明是发布版本，那么会创建一个`initialize${repository.name.capitalize()}StagingRepository` 任务，开启一个新的staging仓库，并且设置好对应的URL。在多项目构建中，所有拥有相同nexusUrl 的子项目，将会使用同样的staging仓库。

`initialize${repository.name.capitalize()}StagingRepository`为每个配置好的仓库地址，生成发布任务。

为每个发布任务生成一个 `publishTo${repository.name.capitalize()}` 生命周期task。

在发布任务之后分别创建 `close${repository.name.capitalize()}StagingRepository` 和 `release${repository.name.capitalize()}StagingRepository` 任务。

# 总结

这么好用的插件，赶紧去试试吧。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
