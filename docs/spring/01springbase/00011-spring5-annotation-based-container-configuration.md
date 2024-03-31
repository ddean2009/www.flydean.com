---
slug: /spring5-annotation-based-container-configuration
---

# 11. spring中的注解

Spring的容器配置可以有两种方式，一种基于XML文件， 一种基于注解。注解注入在XML注入之前执行。因此，当两个同时使用时，XML配置会覆盖注解注入的属性。 

本文会主要介绍 @Required，@Autowired， @PostConstruct, @PreDestroy 和 @Resource 这几个注解。

这几个注解都是由 <context:annotation-config/> 来引入的。本质上引入这个配置会隐式的注册AutoWiredAnnotationBeanPostProcessor（提供@Autowired），CommonAnnotationBeanPostProcessor（提供@PostConstruct, @PreDestroy, @Resource），RequiredAnnotationBeanPostProcessor（提供 @Required),从而提供各个注解的功能。

下面我们会分别介绍各个注解的功能。

## @Required

@Required 一般用在方法上面，表示该方法的参数必须能通过配置或者自动装载来填充。通常如果某个属性是必须的，我们会使用这个注解。

不过从Spring Framework 5.1开始，@Required注解正式被弃用，取而代之的是使用构造函数注入用于所需的属性，或使用InitializingBean.afterPropertiesSet（）的自定义实现以及bean属性setter方法。

示例代码如下：
~~~java
public class RequiredBean {

    private BeanA  beanA;

    @Required
    public void setBeanA(BeanA beanA){
        this.beanA=beanA;

    }
}
~~~

## @Autowired

@Autowired 就是自动注入所需要的字段，参数等。JSR 330的@Inject注解可以代替spring的@Autowired注解。 

你可以将@Autowired注解到构造器中，如下所示：
~~~java
public class AutowiredBean {

    private BeanA beanA;

    @Autowired
    public AutowiredBean(BeanA beanA){
        this.beanA=beanA;
    }
}
~~~

从SpringFramework4.3开始，如果目标bean只定义了一个构造函数，那么就不再需要在此类构造函数上使用@Autowired注解。但是，如果有多个构造函数可用，则必须至少对其中一个进行注解，以告诉容器使用哪一个。

@Autowired也可以注解到传统的setter方法，如下例子所示：
~~~java
public class AutowiredBean {

    private BeanB beanB;

    @Autowired
    public void setBeanB(BeanB beanB){
        this.beanB=beanB;
    }
}

~~~

也可以把注解应用到任何名字和多个参数，如下所示：
~~~java
    @Autowired
    public void configAB(BeanA beanA , BeanB beanB){
        this.beanA=beanA;
        this.beanB=beanB;
        
    }
~~~

@Autowired也可以用在字段上,如下所示：

~~~java
    @Autowired
    private BeanC beanC;
~~~

还可以通过将注解添加到需要该类型数组的字段或方法，那么可以从ApplicationContext中获取到该特定类型的所有bean，如下例所示：

~~~java
    @Autowired
    private BeanC[] beanCList;
~~~

如果希望数组或列表中的项按特定顺序排序,目标bean可以实现org.springframework.core.Ordered接口，或者可以使用@Order或标准的@Priority注解。
否则，它们的顺序遵循容器中相应目标bean定义的注册顺序。

Map实例也可以被注入，只要key是String类型。Map value包括了所有的类型匹配的Bean，keys是该bean的名字。如下所示：
~~~java
    @Autowired
    public void configMapA(Map<String,BeanA> mapA){
    this.mapA=mapA;
    }
~~~

@Autowired有个required属性，如果要注入的bean有可能不存在，则可以如下所示：
~~~java
    @Autowired(required = false)
    public void setBeanC(BeanC beanC){
    }
~~~
建议使用@Autowired的'required'属性而不是使用setter方法上的@Required注解。“required”属性表示自动装载需要该属性, 如果无法自动装载，则忽略该属性。而对于@Required来说，如果未定义任何值，则会报异常。

也可以通过Java 8的java.util.Optional表示特定依赖项的非必需性质，如下示例显示：

~~~java
    @Autowired
    public void setMovieFinder(Optional<BeanC> BeanC) {
    }
~~~

在Spring Framework 5.0中，你也可以使用@Nullable注解：

~~~java
    @Autowired
    public void setMovieFinderC(@Nullable BeanC beanC) {
    }
~~~

Spring可以使用@Autowired来自动解析一些默认存在的bean如：BeanFactory、ApplicationContext、Environment、ResourceLoader、ApplicationEventPublisher和MessageSource。这些接口及其扩展接口（如ConfigurableApplicationContext或ResourcePatternResolver）。
如下所示，自动注入ApplicationContext：
~~~java
    @Autowired
    private ApplicationContext context;
~~~

注意： @Autowired, @Inject, @Value, 和 @Resource 注解是在Spring的BeanPostProcessor中处理的，这意味着你不能将这些注解用在你自己的BeanPostProcessor，BeanFactoryPostProcessor类型。

## @primary

当按类型注入的时候，可能会有多个候选项，则可以通过@Primary注解表示优先的对象。如下所示：
~~~java
@Configuration
public class ConfigBean {

    @Bean
    @Primary
    public BeanA firstBeanA() { return new BeanA(); }

    @Bean
    public BeanA secondBeanA() {  return new BeanA();}

}
~~~

## @Qualifier

@Primary是一种在多个实例中按类型使用自动装载的有效方法，但是如果你希望对注入的Bean进行更细粒度的控制时候，可以使用@Qualifier。如下所示：

~~~java
    @Bean
    @Qualifier("main")
    public BeanC beanC() {  return new BeanC();}
~~~

~~~java
    @Autowired
    @Qualifier("main")
    private BeanA beanA;

    @Autowired
    public void setBeanA(@Qualifier("main") BeanA beanA){

    }
~~~

限定符的值并不是唯一的，它只是一个过滤标准。

@Autowired一般用来通过类型匹配，@Resource则是通过名称匹配。

也可以创建自定义注解：
~~~java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Genre {

        String value();
}
~~~

## 泛型
除了@Qualifier注解外，还可以使用Java泛型类型作为隐式的限定形式。例如，假设您具有以下配置：

~~~java
public class StringStore implements Store<String> {
}

public class IntegerStore implements Store<Integer> {
}
~~~

~~~java
    @Bean
    public StringStore stringStore() {
        return new StringStore();
    }

    @Bean
    public IntegerStore integerStore() {
        return new IntegerStore();
    }
~~~
~~~java
public class GenericBean {

    @Autowired
    private Store<String> s1; // <String> qualifier, injects the stringStore bean

    @Autowired
    private Store<Integer> s2; // <Integer> qualifier, injects the integerStore bean

    // Inject all Store beans as long as they have an <Integer> generic
    // Store<String> beans will not appear in this list
    @Autowired
    private List<Store<Integer>> s;

}
~~~

## @Resource

@Resource用在字段或者Setter方法上，默认情况下@Resource通过名字来注入。

~~~java
public class ResourceBean {
    
    @Resource(name = "beanA")
    private BeanA BeanA;
}
~~~

如果未显式指定名称，则从字段名或setter方法派生默认名称.

在@Resource用法中，如果没有指定显式名称，并且类似于@Autowired，@Resource会找到一个主类型匹配，而不是指定的bean，并解析已知的可解析依赖项：BeanFactory、ApplicationContext、ResourceLoader、ApplicationEventPublisher，和MessageSource接口。

## @PostConstruct和@PreDestroy

这两个注解主要用做生命周期回调。如下所示：
~~~java
public class ConstructBean   {

    @PostConstruct
    public void populateMovieCache() {
        // populates the movie cache upon initialization...
    }

    @PreDestroy
    public void clearMovieCache() {
        // clears the movie cache upon destruction...
    }
}
~~~

与@Resource一样，@PostConstruct和@PreDestroy注解类型是JDK 6到8标准Java库的一部分。然而，整个javax.annotation包与JDK 9中的核心Java模块分离，并最终在JDK 11中被删除。如果需要，javax.annotation-api工件现在需要通过maven central获得，只需像其他库一样添加到应用程序的类路径中即可。

本文的代码可以参考[annotation-config](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-annotation-based-container-configuration/)
