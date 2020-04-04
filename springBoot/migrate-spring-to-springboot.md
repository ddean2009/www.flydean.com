从Spring迁移到Spring Boot

Spring Boot给我们的开发提供了一系列的便利，所以我们可能会希望将老的Spring 项目转换为新的Spring Boot项目，本篇文章将会探讨如何操作。 

> 请注意，Spring Boot并不是取代Spring，它只是添加了一些自动配置的东西，从而让Spring程序更快更好

## 添加Spring Boot starters

要想添加Spring Boot，最简单的办法就是添加Spring Boot Starters。 

~~~java
<parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.2.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
~~~

## 添加应用程序入口

每一个Spring Boot程序都需要一个应用程序入口，通常是一个使用@SpringBootApplication注解的main程序：

~~~java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
~~~

@SpringBootApplication注解是下列注解的组合：

@Configuration ，@EnableAutoConfiguration，@ComponentScan 。

默认情况下@SpringBootApplication会扫描本package和子package的所有类。所以一般来说SpringBootApplication会放在顶层包下面。

## Import Configuration和Components

Spring Boot通常使用自动配置，但是我们也可以手动Import现有的java配置或者xml配置。

对于现有的配置，我们有两个选项，一是将这些配置移动到主Application同一级包或者子包下面，方便自动扫描。
二是显式导入。

我们看一下怎么显示导入：

~~~java
@SpringBootApplication
@ComponentScan(basePackages="com.flydean.config")
@Import(UserRepository.class)
public class Application {
    //...
}
~~~

如果是xml文件，你也可以这样使用@ImportResource导入：

~~~java
@SpringBootApplication
@ImportResource("applicationContext.xml")
public class Application {
    //...
}
~~~

## 迁移应用程序资源

默认情况下Spring Boot 会查找如下的资源地址：

~~~java
/resources
/public
/static
/META-INF/resources
~~~

想要迁移的话 我们可以迁移现有资源到上诉的资源地址，也可以使用下面的方法：

~~~java
spring.resources.static-locations=classpath:/images/,classpath:/jsp/
~~~

## 迁移应用程序属性文件

Spring Boot 会在如下的地方查找application.properties或者application.yml 文件：

~~~java
* 当前目录
* 当前目录的/config子目录
* 在classpath中的/config目录
* classpath root
~~~

我们可以将属性文件移动到上面提到的路径下面。

## 迁移Spring Web程序

如果要迁移Spring Web程序，我们需要如下几步：

1. 添加spring-boot-starter-web依赖：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
~~~

通过Spring Boot的自动配置，会自动检测classpath中的依赖包，从而自动开启@EnableWebMvc，同时创建一个DispatcherServlet。

如果我们在@Configuration类中使用了@EnableWebMvc注解，则自动配置会失效。

该自动配置同时自动配置了如下3个bean：
* HttpMessageConverter用来转换JSON 和 XML。
* /error mapping用来处理所有的错误
* /static, /public, /resources 或者 /META-INF/resources的静态资源支持。

2. 配置View模板

对于web页面，通常不再推荐JSP，而是使用各种模板技术来替换：Thymeleaf, Groovy, FreeMarker, Mustache。 我们要做的就是添加如下依赖：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
~~~

template文件在/resources/templates下面。

如果我们仍然需要是用JSP，则需要显示配置如下：

~~~java
spring.mvc.view.prefix=/WEB-INF/views/
spring.mvc.view.suffix=.jsp
~~~








