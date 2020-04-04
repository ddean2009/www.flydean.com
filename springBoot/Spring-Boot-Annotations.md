Spring Boot注解

## 简介

Spring Boot通过自动配置让我们更加简单的使用Spring。在本文中我们将会介绍org.springframework.boot.autoconfigure 和org.springframework.boot.autoconfigure.condition 里面经常会用到的一些注解。

## @SpringBootApplication

首先我们看一下@SpringBootApplication：

~~~java
@SpringBootApplication
public class AnotationApp {
    public static void main(String[] args) {
        SpringApplication.run(AnotationApp.class, args);
    }
}
~~~

@SpringBootApplication被用在Spring Boot应用程序的Main class中，表示整个应用程序是Spring Boot。

 @SpringBootApplication实际上是@Configuration, @EnableAutoConfiguration 和 @ComponentScan 的集合。

 ## @EnableAutoConfiguration

 @EnableAutoConfiguration 意味着开启了自动配置。这意味着Spring Boot会去在classpath中查找自动配置的beans，并且自动应用他们。

 注意， @EnableAutoConfiguration需要和@Configuration配合使用。

 ~~~java
 @Configuration
@EnableAutoConfiguration
public class VehicleFactoryConfig {
}
 ~~~

 ## 条件自动配置

 有时候，我们在自定义自动配置的时候，希望根据某些条件来开启自动配置，Spring Boot 提供了一些有用的注解。

 这些注解可以和@Configuration 类 或者 @Bean 方法一起使用。

 ## @ConditionalOnClass 和 @ConditionalOnMissingClass

 这两个注解的意思是，如果注解参数中的类存在或者不存在则Spring会去实例化自动配置的bean。

 ~~~java
 @Configuration
@ConditionalOnClass(DataSource.class)
public class MySQLAutoconfiguration {
}
 ~~~

 @ConditionalOnBean 和 @ConditionalOnMissingBean

 这两个和上面的区别在于，这两个是判断是否有实例化的bean存在。

 ~~~java
 @Bean
@ConditionalOnBean(name = "dataSource")
LocalContainerEntityManagerFactoryBean entityManagerFactory() {
    // ...
}
~~~

## @ConditionalOnProperty

使用这个注解我们可以判断Property的某些属性是不是需要的值：

~~~java
@Bean
@ConditionalOnProperty(
    name = "usemysql", 
    havingValue = "local"
)
DataSource dataSource() {
    // ...
}
~~~

## @ConditionalOnResource

只有当某些resource存在的时候，才会起作用。

~~~java
@ConditionalOnResource(resources = "classpath:mysql.properties")
Properties additionalProperties() {
    // ...
}
~~~

## @ConditionalOnWebApplication 和 @ConditionalOnNotWebApplication

这两个注解通过判断是否web应用程序。

~~~java
    @Bean
    @ConditionalOnWebApplication
    HealthCheckController healthCheckController() {
        // ...
        return null;
    }
~~~

## @ConditionalExpression

这个注解可以使用SpEL构造更加复杂的表达式：

~~~java
@Bean
@ConditionalOnExpression("${usemysql} && ${mysqlserver == 'local'}")
DataSource dataSource() {
    // ...
}
~~~

## @Conditional

还有一种更加复杂的应用叫@Conditional，它的参数是一个自定义的condition类。

~~~java
    @Bean
    @Conditional(HibernateCondition.class)
    Properties newAdditionalProperties() {
        //...
        return null;
    }
~~~

~~~java
public class HibernateCondition implements Condition {
    @Override
    public boolean matches(ConditionContext conditionContext, AnnotatedTypeMetadata annotatedTypeMetadata) {
        return false;
    }
}
~~~

这个类需要实现matches方法。



