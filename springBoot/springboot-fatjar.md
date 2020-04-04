使用spring boot创建fat jar APP

## 介绍

在很久很很久以前，我们部署web程序的方式是怎么样的呢？配置好服务器，将自己写的应用程序打包成war包，扔进服务器中指定的目录里面。当然免不了要配置一些负责的xml和自定义一些servlet。

现在有了spring boot，一切都变了，我们可以将web应用程序打包成fat jar包，直接运行就行了。

本文将会关注于怎么使用Spring Boot创建一个fat jar包。

所有你需要做的就是添加如下依赖：

~~~xml
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
~~~

## build和run

有了上面的配置，只需要使用

~~~
mvn clean install 
~~~

就可以生成相应的jar包了。 

如果要运行它，使用：

~~~
java -jar <artifact-name>
~~~

即可。非常简洁。

如果你要在服务器上面永久运行该服务，即使登录的用户退出服务器，则可以使用nohup命令：

~~~shell
nohup java -jar <artifact-name>
~~~

## fat jar和 fat war

在上面的例子中，所有的依赖jar包都会被打包进入这一个fat jar中，如果你使用了tomcat,那么tomcat也会被打包进去。

但有时候我们还是需要打包成war包，部署在服务器中，这种情况只需要将pom.xml中的packaging属性修改为war即可。

## 更多配置

大多情况下，我们不需要额外的配置，如果我们有多个main class,我们需要指定具体的哪个类：

~~~xml
    <properties>
        <start-class>com.flydean.FatJarApp</start-class>
    </properties>
~~~

如果你没有从spring-boot-starter-parent继承，那么你需要将main class添加到maven plugin中：

~~~xml
<plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>com.flydean.FatJarApp</mainClass>
                    <layout>ZIP</layout>
                </configuration>
            </plugin>
        </plugins>
~~~

有些情况下，你需要告诉maven来unpack一些依赖：

~~~xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <requiresUnpack>
            <dependency>
                <groupId>org.jruby</groupId>
                <artifactId>jruby-complete</artifactId>
            </dependency>
        </requiresUnpack>
    </configuration>
</plugin>
~~~

本文的代码请参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-fatjar](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-fatjar)

