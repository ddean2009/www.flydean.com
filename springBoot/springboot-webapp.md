在Spring Boot中配置web app

本文将会介绍怎么在Spring Boot中创建和配置一个web应用程序。

## 添加依赖

如果要使用Spring web程序，则需要添加如下依赖：

~~~xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
~~~

## 配置端口

正如我们之前文章中提到的，要想配置端口需要在application.properties文件中配置如下：

~~~java
server.port=8083
~~~

如果你是用的是yaml文件，则：

~~~java
server:
    port: 8083
~~~

或者通过java文件的形式：

~~~java
@Component
public class CustomizationBean implements
        WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Override
    public void customize(ConfigurableServletWebServerFactory container) {
        container.setPort(8083);
    }
}
~~~

## 配置Context Path

默认情况下，Spring MVC的context path是‘/’, 如果你想修改，那么可以在配置文件application.properties中修改：

~~~java
server.servlet.contextPath=/springbootapp
~~~

如果是yaml文件：

~~~java
server:
    servlet:
        contextPath:/springbootapp
~~~

同样的，可以在java代码中修改：

~~~java
@Component
public class CustomizationBean
  implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {
  
    @Override
    public void customize(ConfigurableServletWebServerFactorycontainer) {
        container.setContextPath("/springbootapp");
    }
}
~~~

## 配置错误页面

默认情况下Spring Boot会开启一个whitelabel的功能来处理错误，这个功能本质上是自动注册一个BasicErrorController如果你没有指定错误处理器的话。同样的，这个错误控制器也可以自定义：

~~~java
@RestController
public class MyCustomErrorController implements ErrorController {

    private static final String PATH = "/error";

    @GetMapping(value=PATH)
    public String error() {
        return "Error haven";
    }

    @Override
    public String getErrorPath() {
        return PATH;
    }
}
~~~

当然，和之前讲过的自定义服务器信息一样，你也可以自定义错误页面，就像在web.xml里面添加error-page：

~~~java
@Component
public class CustomizationBean
  implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {
  
    @Override
    public void customize(ConfigurableServletWebServerFactorycontainer) {        
        container.addErrorPages(new ErrorPage(HttpStatus.BAD_REQUEST, "/400"));
        container.addErrorPages(new ErrorPage("/errorHaven"));
    }
}
~~~

通过这个功能，你可以对错误进行更加细致的分类。

## 在程序中停止Spring Boot

SpringApplication提供了一个静态的exit()方法，可以通过它来关停一个Spring Boot应用程序:

~~~java
    @Autowired
    public void shutDown(ApplicationContext applicationContext) {
        SpringApplication.exit(applicationContext, new ExitCodeGenerator() {
            @Override
            public int getExitCode() {
                return 0;
            }
        });
    }
~~~

第二个参数是一个ExitCodeGenerator的实现，主要用来返回ExitCode。


## 配置日志级别

我们可以在配置文件中这样配置日志级别：

~~~java
logging.level.org.springframework.web: DEBUG
logging.level.org.hibernate: ERROR
~~~

## 注册Servlet

有时候我们需要将程序运行在非嵌套的服务器中，这时候有可能会需要自定义servlet的情况，Spring Boot 也提供了非常棒的支持，我们只需要在ServletRegistrationBean中，注册servlet即可：

~~~java
    @Bean
    public ServletRegistrationBean servletRegistrationBean() {

        ServletRegistrationBean bean = new ServletRegistrationBean(
                new SpringHelloWorldServlet(), "/springHelloWorld/*");
        bean.setLoadOnStartup(1);
        bean.addInitParameter("message", "SpringHelloWorldServlet special message");
        return bean;
    }
~~~

## 切换嵌套服务器

默认情况下，Spring Boot会使用tomcat作为嵌套的内部服务器，如果想切换成jetty则可以这样：

~~~xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <exclusions>
            <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-tomcat</artifactId>
            </exclusion>
        </exclusions>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jetty</artifactId>
    </dependency>
</dependencies>
~~~

exclude自带的Tomcat，并额外添加spring-boot-starter-jetty即可。

本文的例子可参考： [https://github.com/ddean2009/learn-springboot2/tree/master/springboot-config-webapp](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-config-webapp)

更多教程请参考 [flydean的博客](www.flydean.com)







