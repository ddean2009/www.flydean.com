---
slug: /springboot-exitcode
---

# 25. Spring Boot的exit code

任何应用程序都有exit code，这个code是int值包含负值，在本文中我们将会探讨Spring Boot中的 exit code。

## Spring Boot的exit code

Spring Boot如果启动遇到错误，则会返回1.正常退出的话则会返回0.

Spring Boot向JVM注册了shutdown hooks来保证应用程序优雅的退出。Spring Boot还提供了org.springframework.boot.ExitCodeGenerator接口，来方便自定义退出code.

## 自定义Exit Codes

Spring Boot提供了三种方式来让我们自定义exit code。

ExitCodeGenerator，ExitCodeExceptionMapper和ExitCodeEvent。下面我们分别来讲解。

### ExitCodeGenerator

实现ExitCodeGenerator接口，我们需要自己实现getExitCode()方法来自定义返回代码：

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

这里我们调用了System.exit方法来返回特定的代码。

### ExitCodeExceptionMapper

如果我们遇到runtime exception的时候，可以使用ExitCodeExceptionMapper来做错误代码的映射如下：

~~~java
    @Bean
    CommandLineRunner createException() {
        return args -> Integer.parseInt("test") ;
    }

    @Bean
    ExitCodeExceptionMapper exitCodeToExceptionMapper() {
        return exception -> {
            // set exit code base on the exception type
            if (exception.getCause() instanceof NumberFormatException) {
                return 80;
            }
            return 1;
        };
    }
~~~

上面的例子我们创建了一个CommandLineRunner bean，在实例化的过程中会抛出NumberFormatException，然后在ExitCodeExceptionMapper中，我们会捕捉到这个异常，返回特定的返回值。

### ExitCodeEvent

我们还可以使用ExitCodeEvent来捕捉异常事件如下所示：

~~~java
@Bean
DemoListener demoListenerBean() {
    return new DemoListener();
}
 
private static class DemoListener {
    @EventListener
    public void exitEvent(ExitCodeEvent event) {
        System.out.println("Exit code: " + event.getExitCode());
    }
}
~~~

当应用程序退出的时候，exitEvent() 方法会被调用。

本文的例子可以参考：[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-exitcode](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-exitcode)
