---
slug: /bean-creation
---

# 6. 在Spring中创建Bean

## Spring容器中的Bean

Bean在Spring中就是一个业务组件，我们通过创建各种Bean来完成最终的业务逻辑功能。

在容器内部，每个bean的定义可以被表示为BeanDefinition，通过BeanDefinition可以获得bean的很多信息包括：包名，bean的作用域，生命周期，bean的引用和依赖等。

通过ApplicationContext的getBeanFactory（）方法，能够获得DefaultListableBeanFactory的实现。实现类有两个方法可以将用户自定义的bean注册到Spring容器中。两个方法是：

* registerSingleton(String beanName, Object singletonObject) 

* registerBeanDefinition(String beanName, BeanDefinition beanDefinition)

其中，registerSingleton通过bean名字，和bean实例在注册。registerBeanDefinition则通过bean名字和beanDefinition来注册。

如果想自己构建beanDefinition比较麻烦，他需要实现的方法比较多。

使用方式如下：

~~~java
// create and configure beans
ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");

//从ApplicationContext 中获取 DefaultListableBeanFactory
DefaultListableBeanFactory beanFactory=(DefaultListableBeanFactory)context.getBeanFactory();

BeanDefinition beanDefinition=beanFactory.getBeanDefinition("daoA");

System.out.println(beanDefinition.getBeanClassName());

    DaoC daoC=new DaoC();
 //将daoC注册到spring容器中
   beanFactory.registerSingleton("daoC", daoC);

 //也可以注册beanDefinition
// beanFactory.registerBeanDefinition();

//从Spring容器中获取到刚刚手动注册的bean
System.out.println(context.getBean("daoC"));
~~~

## Bean的命名

Bean可以通过id和name属性来命名，id是全局唯一的，name可以有多个，可以通过逗号，分号或者空格来区分多个name。

当然id和name不是必须的，如果你不指定bean的标志符，SPring容器会为你自动分配一个。这种没有名字的Bean一般用在内部bean或者自动装载的情况。 

bean命名一般采用开头小写的驼峰模式。如：accountManager, accountService, userDao, loginController等。

使用<alias/>也可以为bean定义别名，一般用在大型系统中，将引入的外部bean和自身的系统命名保持一致。

~~~xml
<alias name="myApp-dataSource" alias="subsystemA-dataSource"/>
<alias name="myApp-dataSource" alias="subsystemB-dataSource"/>
~~~

如果你使用Java配置，那么可以使用@Bean来为Bean命名。

## Bean的实例化

实例化bean一般有3种方式，通过构造函数实例化，通过静态工程方法实例化，通过实例的工厂方法实例化。

一般来说我们使用构造函数在Spring容器中创建bean。这个和用new创建bean并将其注入到Spring容器中在本质上是一样的。

工厂方法用的比较少，如果我们需要每次生成一个新的对象时候，就可以考虑使用工厂方法了。工厂方法在后面的作用域范围一文中，我们还会详细的讲解怎么使用。

**构造函数实例化**

在Spring中，bean的构造函数跟普通构造函数没有什么区别，最常见的就是无参构造函数：

~~~xml
<bean id="exampleBean" class="examples.ExampleBean"/>
~~~

当然也可以创建带参数的构造函数：

~~~xml
    <bean id="petStore" class="com.flydean.services.PetStoreService">
        <constructor-arg ref="accountDao"/>
    </bean>
~~~

**静态工厂方法**

静态工厂方法通过class属性指定包含静态工厂方法的类，使用名为factory-method的属性指定工厂方法本身的名称。

这个指定的方法用来返回需要的实例。

~~~xml
    <!-- factory method -->
    <bean id="clientService"
          class="com.flydean.services.ClientService"
          factory-method="createInstance"/>
~~~

ClientService的代码如下：

~~~java
public class ClientService {
    private static ClientService clientService = new ClientService();
    private ClientService() {}

    /**
     * 工厂方法，必须是静态方法
     * @return
     */
    public static ClientService createInstance() {
        return clientService;
    }
}
~~~

大家注意，这里的createInstance方法必须是静态的。

**实例工厂方法**

和静态工厂方法一样，实例工厂方法只不过是使用实例中的方法来创建相应的bean对象。

这样在factory-bean定义工厂bean实例，在factory-method中定义需要创建bean的方法：

~~~xml
    <!--factory bean-->
    <bean id="serviceLocator" class="com.flydean.services.DefaultServiceLocator">
    </bean>

    <bean id="serviceA"
          factory-bean="serviceLocator"
          factory-method="createServiceAInstance"/>

    <bean id="serviceB"
          factory-bean="serviceLocator"
          factory-method="createServiceBInstance"/>
~~~

DefaultServiceLocator代码如下：

~~~java
public class DefaultServiceLocator {

    private static ServiceA serviceA = new ServiceA();

    private static ServiceB serviceB = new ServiceB();

    public ServiceA createServiceAInstance() {
        return serviceA;
    }

    public ServiceB createServiceBInstance() {
        return serviceB;
    }
}
~~~

本篇文章的代码请参照[bean-creation](https://github.com/ddean2009/spring5-core-workshop) 中的bean-creation部分。

更多教程请参考 [flydean的博客](http://www.flydean.com/bean-creation/)
