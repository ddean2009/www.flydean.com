# Shutdown SpringBoot App

Spring Boot使用ApplicationContext来创建，初始化和销毁所用的bean。本文将会讲解如何shut down一个spring boot应用程序。

## Shutdown Endpoint

Spring Boot actuator自带了shutdown的endpoint。首先我们添加pom依赖：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
~~~

接下来我们需要开启shutdown的配置：

~~~shell
management.endpoints.web.exposure.include=*
management.endpoint.shutdown.enabled=true
~~~

上面的配置对外暴露了 /shutdown 接口。我们可以直接这样调用：

~~~shell
curl -X POST localhost:8080/actuator/shutdown
~~~

## close Application Context

我们也可以直接调用Application Context的close() 方法来关闭Application Context。 

~~~java

@SpringBootApplication
public class ConfigurableApp {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx = new
                SpringApplicationBuilder(ConfigurableApp.class).web(WebApplicationType.NONE).run();
        System.out.println("Spring Boot application started");
        ctx.getBean(TerminateBean.class);
        ctx.close();
    }
}
~~~

为了验证App是否被关闭，我们可以在TerminateBean中添加@PreDestroy来监测App是否被关闭：

~~~java
@Component
public class TerminateBean {

    @PreDestroy
    public void onDestroy() throws Exception {
        System.out.println("Spring Container is destroyed!");
    }
}
~~~

这是程序的输出：

~~~shell
2020-02-03 23:12:08.583  INFO 30527 --- [           main] com.flydean.ConfigurableApp              : Started ConfigurableApp in 2.922 seconds (JVM running for 3.559)
Spring Boot application started
Spring Container is destroyed!
~~~

还有一种办法就是暴露close接口如下所示：

~~~java
@RestController
public class ShutdownController implements ApplicationContextAware {

    private ApplicationContext context;

    @PostMapping("/shutdownContext")
    public void shutdownContext() {
        ((ConfigurableApplicationContext) context).close();
    }

    @Override
    public void setApplicationContext(ApplicationContext ctx) throws BeansException {
        this.context = ctx;

    }
}
~~~

这样我们就可以通过/shutdownContext接口来关闭ApplicationContext。

## 退出SpringApplication

上篇文章我们讲过可以通过实现ExitCodeGenerator 接口来返回特定的exit code：

~~~java
@SpringBootApplication
public class ExitCodeApp implements ExitCodeGenerator {
    public static void main(String[] args) {
        System.exit(SpringApplication.exit(SpringApplication.run(ExitCodeApp.class, args)));
    }

    @Override
    public int getExitCode() {
        return 11;
    }
}
~~~

## 从外部程序kill App

熟悉shell的同学都知道如果想在外部kill一个程序，需要知道该App的pid，Spring Boot也可以很方便的生成pid：

~~~java
@SpringBootApplication
public class KillApp {
    public static void main(String[] args) {
        SpringApplicationBuilder app = new SpringApplicationBuilder(KillApp.class)
                .web(WebApplicationType.NONE);
        app.build().addListeners(new ApplicationPidFileWriter("./bin/shutdown.pid"));
        app.run();
    }
}
~~~

上面的程序将会在./bin/shutdown.pid生成应用程序的pid,供shell使用。

我们可以这样使用：

~~~shell
kill $(cat ./bin/shutdown.pid)
~~~

本文的例子可以参考 [https://github.com/ddean2009/learn-springboot2/tree/master/springboot-shutdown](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-shutdown)




