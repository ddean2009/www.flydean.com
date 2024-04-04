---
slug: /Change-Default-Port-in-Spring-Boot
---

# 33. 如何在Spring boot中修改默认端口

# 介绍

Spring boot为应用程序提供了很多属性的默认值。但是有时候，我们需要自定义某些属性，比如：修改内嵌服务器的端口号。

本篇文章就来讨论这个问题。

# 使用Property文件

第一种方式，也是最常用的方式就是在属性文件中，覆盖默认的配置。对于服务器的端口来说，该配置就是：server.port。

默认情况下，server.port值是8080。 我们可以在application.properties中这样修改为8081:

~~~
server.port=8081
~~~

如果你使用的是application.yml，那么需要这样配置：

~~~
server:
  port : 8081
~~~

这两个文件都会在Spring boot启动的时候被加载。

如果同一个应用程序需要在不同的环境中使用不同的端口，这个时候你就需要使用到Spring Boot的profile概念，不同的profile使用不同的配置文件。 

比如你在application-dev.properties中：

~~~
server.port=8081
~~~

在application-qa.properties 中：

~~~
server.port=8082
~~~

# 在程序中指定

我们可以在程序中直接指定应用程序的端口，如下所示：

~~~java
@SpringBootApplication
public class CustomApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CustomApplication.class);
        app.setDefaultProperties(Collections
          .singletonMap("server.port", "8083"));
        app.run(args);
    }
}
~~~

另外一种自定义服务的方法就是实现WebServerFactoryCustomizer接口：

~~~java
@Component
public class ServerPortCustomizer
        implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {

    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        factory.setPort(8086);
//        factory.setAddress("");
    }
}
~~~

使用ConfigurableWebServerFactory可以自定义包括端口在内的其他很多服务器属性。

# 使用命令行参数

如果应用程序被打包成jar，我们也可以在命令行运行时候，手动指定 server.port 。

~~~
java -jar spring-5.jar --server.port=8083
~~~

或者这样：

~~~
java -jar -Dserver.port=8083 spring-5.jar
~~~

# 值生效的顺序

上面我们将了这么多修改自定义端口的方式，那么他们的生效顺序是怎么样的呢？

1. 内置的server配置
2. 命令行参数
3. property文件
4. @SpringBootApplication配置的主函数

更多教程请参考 [flydean的博客](http://www.flydean.com)
