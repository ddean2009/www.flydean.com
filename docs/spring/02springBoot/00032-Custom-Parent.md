---
slug: /Custom-Parent
---

# 32. 自定义parent POM

## 概述

在之前的Spring Boot例子中，我们都会用到这样的parent POM。

~~~xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.2.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
~~~

这个parent指定了spring-boot所需要的依赖。但是有时候如果我们的项目已经有一个parent了，这时候需要引入spring boot该怎么处理呢？

本文将会解决这个问题。

## 不使用Parent POM来引入Spring boot

parent pom.xml主要处理的是依赖和使用的插件管理。使用起来会非常简单，这也是我们在Spring boot中常用的方式。

在实际中，如果我们因为种种原因，不能使用Spring boot自带的parent,那么我们可以这样做：

~~~xml
<dependencyManagement>
     <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.2.2.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
~~~

将spring-boot-dependencies作为一个依赖放入dependencyManagement标签即可。注意，这里的scope要使用import。

接下来，我们就可以随意使用spring boot的依赖了，例如：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
~~~

另一方面，如果不使用parent POM，Spring boot自带的plugin，需要我们自己引入：

~~~xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
~~~

## 覆盖依赖项版本

如果我们需要使用和parent POM中定义的不同的依赖项版本，则可以在dependencyManagement中重写。 

~~~xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
            <version>1.5.5.RELEASE</version>
        </dependency>
    </dependencies>
    // ...
</dependencyManagement>
~~~

当然，你也可以在每次引入依赖的时候，指定所需要的版本。





