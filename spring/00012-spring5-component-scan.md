[toc]

## 组件扫描

上一篇文章我们讲到了annotation-config配置，它主要用于bean内部的属性注入。而bean本身则需要通过配置的方式来定义。如果想使用配置的方式来定义bean，则可以使用component-scan，如下：
~~~xml
<context:component-scan base-package="com.flydean"/>
~~~

component-scan会扫描类路径里面的注解注解，包括（@Component, @Repository, @Service,
	@Controller, @RestController, @ControllerAdvice, 和@Configuration ）， 当然component-scan默认包含了annotation-config，我们可以直接在这些配置bean中使用上篇文章讲到的注解。

## @Component

@Component表示该bean是一个组件，@Component是任何Spring管理的组件的通用原型。@Repository、@Service和@Controller是@Component针对更具体的用例（分别在持久性、服务和表示层中）的特殊注解。因此，您可以用@Component注解组件类，但是，通过用@Repository、@Service或@Controller注解它们，您的类更具有语义性。通常更适合在AOP中做进一步的业务逻辑处理。

##  元注解和组合注解
所谓元注解就是可以用在其他注解中的注解。 像之前提到的@Component就是@Service的元注解。如下：

~~~java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component 
public @interface Service {

    // ....
}
~~~
@Component会导致@Service和@Component一样被对待。
当然你也可以组合使用元注解，或者自定义元注解。例如，Spring的@SessionScope注解将作用域名称硬编码为session，但仍允许自定义proxyMode。以下列表显示了sessionScope注解的定义：
~~~java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Scope(WebApplicationContext.SCOPE_SESSION)
public @Interface SessionScope {

    /**
     * Alias for {@link Scope#proxyMode}.
     * <p>Defaults to {@link ScopedProxyMode#TARGET_CLASS}.
     */
    @AliasFor(annotation = Scope.class)
    ScopedProxyMode proxyMode() default ScopedProxyMode.TARGET_CLASS;

}
~~~

你可以不定义@SessionScope里面的proxyMode， 如下：
~~~java
@Service
@SessionScope
public class SessionScopedService {
    // ...
}
~~~

你也可以重写proxyMode，如下：
~~~java
@Service
@SessionScope(proxyMode = ScopedProxyMode.INTERFACES)
public class SessionScopedUserService implements UserService {
    // ...
}
~~~

#@ComponentScan和filters

上面我们讲到，要是要使用组件扫描，需要在XML配置<context:component-scan>, 其实也可以使用注解的形式，如下所示：
~~~java
@Configuration
@ComponentScan(basePackages = "com.flydean.beans")
public class AppConfig {

}
~~~
@ComponentScan可以配置一些filters用来过滤不需要的组件。如下所示：

~~~java
@Configuration
@ComponentScan(basePackages = "com.flydean.beans",
        includeFilters = @ComponentScan.Filter(type = FilterType.REGEX, pattern = ".*Stub.*Repository"),
        excludeFilters = @ComponentScan.Filter(BeanA.class))
public class BeanAConfig {
}
~~~

下表是支持的filter类型和例子：

Filter type | 表达式例子 |  描述 
-|-|-
annotation（默认） | org.example.SomeAnnotation | type基本的目标组件 
assignable | org.example.SomeClass | 目标组件可分配给（扩展或实现）的类（或接口）。 
aspectj | org.example..*Service+ | 匹配目标组件的AspectJ类型 
regex | org\\.example\\.Default.*|匹配目标主键内名的正则表达式
custom|org.example.MyTypeFilter|org.springframework.core.type .TypeFilter的自定义实现

## 组件内部定义Bean元数据

Spring组件还可以为容器提供bean定义元数据。您可以使用用于在@Configuration annotated类中定义bean元数据的相同@Bean注解来实现这一点。以下示例显示了如何执行此操作：

~~~java
@Component
public class FactoryMethodComponent {

    @Bean
    @Qualifier("public")
    public BeanA publicInstance() {
        return new BeanA();
    }

    public void doWork() {
        // Component method implementation omitted
    }
}

~~~

**InjectionPoint**

从SpringFramework4.3开始，还可以声明InjectionPoint类型的工厂方法参数,来创建Bean。

注意，这只适用于bean实例的实际创建，而不适用于现有实例的注入。因此，这个特性对于原型范围的bean最有意义。
~~~java
@Component
public class InjectPointFactoryMethodComponent {

    @Bean
    @Scope("prototype")
    public BeanA prototypeInstance(InjectionPoint injectionPoint) {
        return new BeanA("prototypeInstance for " + injectionPoint.getMember());
    }
}
~~~

常规Spring组件中的@Bean方法的处理方式与Spring@Configuration类中的对应方法不同。不同的是，@Component类没有用cglib来增强以截获方法和字段的调用。cglib代理是调用@Configuration classes中通过@Bean methods内的方法或字段创建对协作对象的bean元数据引用的方法。

你可以将@Bean方法声明为静态方法，允许在不将其包含的配置类创建为实例的情况下调用它们。在定义post-processor bean（例如，BeanFactoryPostProcessor或BeanPostProcessor类型）时，这是特别有意义的，因为这样的bean在容器生命周期的早期就被初始化，应该避免在此时触发配置的其他部分。

由于技术限制，对static @Bean方法的调用永远不会被容器截获，即使是在@Configuration类（如本节前面所述）中也是如此：cglib子类只能重写非静态方法。因此，直接调用另一个@Bean方法相当于标准Java的new方法，导致从工厂方法本身直接返回一个独立的实例。

要注意： @Configuration类中的常规@Bean方法必须是可重写的，也就是说，它们不能声明为私有或最终的。

## 为自动检测组件命名

默认情况下，可以提供value属性给@Component、@Repository、@Service和@Controller），从而为Bean命名。

如果这样的注解不包含value，则默认bean名称生成器将返回小写的非限定类名。例如，如果检测到以下组件类，则名称为myMovieLister和movieFinderImpl：
~~~java
@Service("myMovieLister")
public class SimpleMovieLister {
    // ...
}
~~~

~~~java
@Repository
public class MovieFinderImpl implements MovieFinder {
    // ...
}
~~~

如果您不想依赖默认的bean命名策略，可以提供一个自定义的bean命名策略。首先，实现BeanNameGenerator接口，并确保包含一个默认的无参数构造函数。然后，在配置扫描器时提供完全限定的类名，如下面的示例注解和bean定义所示：

~~~java
public class MyNameGenerator implements BeanNameGenerator {
    @Override
    public String generateBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
        return null;
    }
}
~~~

~~~java
@Configuration
@ComponentScan(basePackages = "com.flydean", nameGenerator = MyNameGenerator.class)
public class BeanNameConfig {
}
~~~

## 为自动检测的组件提供作用域

与一般的Spring管理组件一样，自动检测组件的默认和最常见的作用域是singleton。但是，有时您需要一个可以由@Scope注解指定的不同范围。可以在注解中提供作用域的名称，如下示例所示：

~~~java
@Scope("prototype")
@Component("beanA")
public class BeanA {

    public BeanA(){

    }

    public BeanA(String name){

    }
}
~~~

**自定义范围解析**

要为范围解析提供自定义策略，而不是依赖基于注解的方法，可以实现ScopeMetadataResolver接口。如下所示：
~~~java
public class MyScopeResolver implements ScopeMetadataResolver {
    @Override
    public ScopeMetadata resolveScopeMetadata(BeanDefinition definition) {
        return null;
    }
}
~~~
~~~java
@Configuration
@ComponentScan(basePackages = "com.flydean", scopeResolver = MyScopeResolver.class)
public class BeanScopeResolverConfig {
}
~~~

**scoped-proxy**

当使用某些非单例作用域时，可能需要为作用域对象生成代理。为此，组件扫描元素上可以有一个scoped-proxy 属性。三个可能的值是：no、interfaces和targetClass。例如，以下配置将生成标准JDK动态代理：

~~~java
@Configuration
@ComponentScan(basePackages = "com.flydean", scopedProxy = ScopedProxyMode.INTERFACES)
public class ScopedProxyConfig {
}
~~~

## 生成候选组件的索引

虽然类路径扫描速度非常快，但是可以通过在编译时创建一个静态候选列表来提高大型应用程序的启动性能。

要生成索引，需要每个模块添加一个附加依赖项，该模块包含作为组件扫描指令目标的组件。下面的示例说明如何使用Maven：
~~~xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context-indexer</artifactId>
        <version>5.1.8.RELEASE</version>
        <optional>true</optional>
    </dependency>
</dependencies>
~~~
这个过程生成一个包含在JAR文件中的META-INF/spring.components文件。

当在类路径上找到META-INF/Spring.components时，索引将自动启用。如果某个索引部分可用于某些库（或用例），但无法为整个应用程序生成，则可以通过将spring.index.ignore设置为true（作为系统属性或类路径根目录下的spring.properties文件）来回滚到常规类路径安排（就像根本没有索引一样）。

本节的例子可以参考 [component-scan](https://github.com/ddean2009/spring5-core-workshop).

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-component-scan/)

