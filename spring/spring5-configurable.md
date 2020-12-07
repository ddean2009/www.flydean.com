[toc]

## 遇到的问题

前面的文章我们讲到了在Spring中使用Aspect。但是Aspect的都是Spring管理的Bean。 现在有一个问题，实际工作中，我们经常会想new一个Bean，然后在这个Bean中注入Spring管理的其他Bean。但是new出来的bean已经脱离Spring的管控了。

该怎么处理呢？ 

## @Configurable

Spring提供了一个@Configurable的注解，可以实现这个功能，我们看一个例子：

~~~java
@Configurable(autowire= Autowire.BY_NAME， preConstruction = true)
public class Account {

    private static Logger log= LoggerFactory.getLogger(Account.class);

    private String name;

    @Autowired
    private BeanA beanA;

    public  Account(){
        log.info("init Account");
    }

    public Object getBeanA() {
        return beanA;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
~~~

这里定义了一个Account类，它里面有依赖的BeanA，我们想在new Account()的时候， 直接使用Spring注入的BeanA。

preConstruction = true 表示依赖的Bean在构造函数调用之前就被注入了。

autowire= Autowire.BY_NAME 表示依赖的Bean是按名字来自动装配。当然也可以使用autowire= Autowire.BY_TYPE，按类型来装配。

同时我们需要开启SpringConfig支持：

~~~java
@Configuration
@EnableSpringConfigured
public class AppConfig {
}
~~~

最后看下我们怎么调用：

~~~java
public class ConfigurableApp {

    private static Logger log= LoggerFactory.getLogger(ConfigurableApp.class);

    public static void main(String[] args) {
        ApplicationContext applicationContext=new ClassPathXmlApplicationContext("bean-config.xml");

        Account accountA=new Account();
        log.info(accountA.getBeanA().toString());

    }
}
~~~

输出结果如下：

~~~java
07:37:27.917 [main] INFO com.flydean.beans.Account - init Account
07:37:27.917 [main] INFO com.flydean.ConfigurableApp - com.flydean.beans.BeanA@54c5a2ff
~~~

可以看到虽然Account是new出来的，但是BeanA依然被注入到实例中。

## 原理

单独使用@Configurable没有任何作用。

Spring-Aspects.jar中的AnnotationBeanConfigurerAspect，才是让@Configurable起作用的根本。本质上，aspect是，“从用@Configurable注解的类型的新对象的初始化返回后，根据注解的属性使用spring配置新创建的对象”。在此上下文中，“初始化”是指新实例化的对象（例如，用new运算符实例化的对象）以及正在进行反序列化的可序列化对象（例如，通过 readResolve()）。

## 重要配置

下面是最最重要的pom配置了，这里我使用了aspectj-maven-plugin 这个插件来对spring-aspects.jar进行编织。 如下所示：

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>spring5-core-workshop</artifactId>
        <groupId>com.flydean</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>aop-advanced</artifactId>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-tx</artifactId>
            <version>5.1.3.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-aspects</artifactId>
            <version>5.1.3.RELEASE</version>
        </dependency>

    </dependencies>

    <build>
        <!-- To define the plugin version in your parent POM -->
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.codehaus.mojo</groupId>
                    <artifactId>aspectj-maven-plugin</artifactId>
                    <version>1.11</version>
                </plugin>
            </plugins>
        </pluginManagement>
        <!-- To use the plugin goals in your POM or parent POM -->
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>aspectj-maven-plugin</artifactId>

                <configuration>
                    <complianceLevel>1.8</complianceLevel>
                    <source>1.8</source>
                    <target>1.8</target>
                    <outxml>true</outxml>
                    <verbose>true</verbose>
                    <showWeaveInfo>true</showWeaveInfo>
                    <aspectLibraries>
                        <aspectLibrary>
                            <groupId>org.springframework</groupId>
                            <artifactId>spring-aspects</artifactId>
                        </aspectLibrary>
                    </aspectLibraries>
                </configuration>


                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>       <!-- use this goal to weave all your main classes -->
                            <goal>test-compile</goal>  <!-- use this goal to weave all your test classes -->
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>
~~~

本文的例子可以参考[aop-advanced](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-configurable/)