[toc]

最近在翻译[Spring Framework Documentation 5.1.8.RELEASE](https://github.com/ddean2009/Spring-Framework-Documentation). 觉得还是可以系统的将Spring5的知识点系统的再整理一下，于是有了这个Spring5参考指南系列，教程会一直更新，翻译也会同步进行，敬请期待。

## 为什么使用Spring5 

Spring经过这么多年的发展，已经成为既定的企业级J2EE标准，其最大的优点即是轻量级和其最核心的IOC容器。 Spring最新的版本已经到了5.1.8，Spring5提供了很多新的特性，个人认为最主要的有3点：

*  使用JDK8的新特性
 最引人注意的是Spring5使用了JDK8中的lambda表达式，让代码变得更加简洁。
 
*  响应式编程支持
响应式编程是Spring5中最主要的特性之一，响应式编程提供了另一种编程风格，专注于构建对事件做出响应的应用程序。 Spring5 包含响应流和 Reactor。

*  响应式web框架
Spring5提供了一个最新的响应式Web框架，Spring WebFlux，在编程理念和使用习惯方面和之前的传统Web框架都有了很大的区别。

当然，我们要拥抱新技术新变化，那么快来学习Spring5吧。

## 什么是IOC容器

IOC也称为依赖注入（DI）。它是指对象仅通过构造函数参数、工厂方法的参数或从工厂方法构造或返回对象实例后，通过在其上设置的属性来定义其依赖项（即与之一起工作的其他对象）的过程。

简单点说就是通过配置的参数来构造对象，然后通过配置的属性来实例化其依赖对象。一切都是通过配置来完成的，而不是使用通常的Java new方法来创建对象，也不需要手动去查找或者实例化其依赖对象，一切的一切都是通过Spring IOC容器来实现的。

IOC容器的两个主要包是：org.spring framework.beans和org.springframework.context包。

如果想使用IOC容器，下面两个依赖是必须的：

~~~xml
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-core</artifactId>
      <version>5.1.8.RELEASE</version>
    </dependency>

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>5.1.8.RELEASE</version>
    </dependency>
~~~

IOC容器中有两个非常重要的类：BeanFactory和ApplicationContext。 

ApplicationContext是BeanFactory的子类，BeanFactory提供了对Bean的操作接口，ApplicationContext则是表示容器本身，提供了bean操作之外的如AOP接入，事件处理，消息资源接入和应用程序上下文等非常有用的特性。

org.springframework.context.ApplicationContext接口代表着SpringIOC容器，它负责实例化、配置和组装bean。容器通过读取配置元数据获取关于要实例化、配置和组装的对象的指令。配置元数据以XML、Java注释或Java代码来表示。它定义了组成应用程序的对象以及这些对象之间的丰富依赖关系。

如果你是创建一个单体应用，那么Spring提供了两个非常有用的ApplicationContext实现，ClassPathXMLApplicationContext或FileSystemXMLApplicationContext。

ClassPathXMLApplicationContext是从类路径去加载要装载的配置，FileSystemXMLApplicationContext是从文件路径去装载。

你只需要在配置中，定义你需要使用的业务对象（POJO),在创建和初始化ApplicationContext之后，您就拥有了一个完全配置且可执行的系统或应用程序.

![](https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/images/container-magic.png)

## 配置元数据

配置配置，Spring的本质就是通过配置来展示和构建业务对象，通常来说，我们可以使用XML文件来配置，当然现在我们也可以使用Java注解和Java代码来实现。

Spring配置由容器必须管理的至少一个或多个bean定义组成。基于XML的配置元数据通常使用<bean></bean>来表示。Java配置通常在@Configuration中使用@bean注解的方法。

下面是一个基本的基于XML的定义 daos.xml：

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="accountDao"
          class="com.flydean.daos.JpaAccountDao">
        <!-- additional collaborators and configuration for this bean go here -->
    </bean>

    <bean id="itemDao" class="com.flydean.daos.JpaItemDao">
        <!-- additional collaborators and configuration for this bean go here -->
    </bean>

    <!-- more bean definitions for data access objects go here -->

</beans>
~~~

其中id是bean的唯一标记，class是bean的类路径。

## 实例化容器

Spring容器有很多种实例化方法，比如上面讲的单体应用的两个类：

~~~java
ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");
~~~

上面已经列出了daos.xml , 这里我们再列出services.xml :

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        https://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- services -->

    <bean id="petStore" class="com.flydean.services.PetStoreService">
        <property name="accountDao" ref="accountDao"/>
        <property name="itemDao" ref="itemDao"/>
        <!-- additional collaborators and configuration for this bean go here -->
        <constructor-arg ref="accountDao"/>
    </bean>

    <!-- more bean definitions for services go here -->

</beans>
~~~

service.xml 里面主要定义了对在定义在daos.xml中的bean的引用。这里的引用方式是通过ref.  ref引用了daos.xml里面bean的id。

## XML嵌套

除了上面例子中在创建ApplicationContext的时候，加载多个xml文件，其实我们也可以在xml中通过import来引入其他的xml文件。

~~~xml
    <import resource="daos.xml"/>
~~~

resource配置的是要引入的xml的路径，可以使用相对路径和绝对路径。不建议使用相对路径“..”来引用父目录中的文件。这样做会创建对当前应用程序外部文件的依赖关系。直接使用绝对路径又会影响不同部署环境下文件路径的位置。所以比较好的方法是在运行时根据JVM系统属性解析的“$…”占位符。


## groovy bean定义DSL

除了xml定义，Spring也可以使用groovy bean来配置。

下面是daos.groovy的定义：

~~~java
import com.flydean.daos.JpaAccountDao;
import com.flydean.daos.JpaItemDao;


beans{

    accountDao(JpaAccountDao){

    }

    itemDao(JpaItemDao){

    }
}
~~~
很简单，就是定义了2个bean。

下面是services.groovy的定义：
~~~java
import com.flydean.services.PetStoreService

beans {

    petStore(PetStoreService, accountDao){

        accountDao=accountDao
        itemDao=itemDao
    }
}
~~~

## 使用容器

ApplicationContext是高级工厂的接口，它能够维护不同bean的注册及其依赖。通过使用方法T getBean(String name, Class<T> requiredType)，获取到bean的实例。 ApplicationContext允许您读取bean定义并访问它们，如下例所示：
~~~java
        // create and configure beans
        ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");

        // retrieve configured instance
        PetStoreService service = context.getBean("petStore", PetStoreService.class);

        // use configured instance
        List<String> userList = service.getUsernameList();
~~~

上面讲到了groovy bean配置， 下面是怎么使用groovy bean：

~~~java
        // create and configure beans with groovy
        //daos.groovy 必须写在services.groovy前面，否则会报bean找不到的错误
        ApplicationContext context = new GenericGroovyApplicationContext("daos.groovy","services.groovy");

        // retrieve configured instance
        PetStoreService service = context.getBean("petStore", PetStoreService.class);

        // use configured instance
        List<String> userList = service.getUsernameList();
~~~

使用groovy的时候请注意， daos.groovy 必须写在services.groovy前面，否则会报bean找不到的错误。

还可以使用XmlBeanDefinitionReader和GenericApplicationContext结合的方式：

~~~java
        GenericApplicationContext context = new GenericApplicationContext();
        //reader with xml
        new XmlBeanDefinitionReader(context).loadBeanDefinitions("services.xml", "daos.xml");
~~~

你也可以使用GroovyBeanDefinitionReader来加载Groovy文件，如下所示：

~~~java
GenericApplicationContext context = new GenericApplicationContext();
new GroovyBeanDefinitionReader(context).loadBeanDefinitions("services.groovy", "daos.groovy");

~~~

本教程的源代码可以参照：[spring5-core-workshop](https://github.com/ddean2009/spring5-core-workshop) 中的container模块。

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-reference-ioc/)