---
slug: /spring5-ioc-extend
---

# 10. IOC扩展

Spring提供了一系列的接口来提供对Spring容器的扩展功能。下面我们一一介绍。

## BeanPostProcessor自定义bean

前面一篇文章我们在自定义bean中提到，可以实现Spring的InitializingBean和DisposableBean接口来实现自定义bean的生命周期。如果是容器级别的，Spring提供了更加强大的BeanPostProcessor，来实现在容器级对Bean的扩展。

BeanPostProcessor接口定义了两个方法：
~~~java
	default Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}
~~~
该方法在调用容器初始化方法（如InitializingBean.afterPropertiesSet（）或任何声明的init方法）之前，以及在任何bean初始化之后，被调用。

~~~java
	default Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}
~~~
该方法在容器初始化方法之后被调用。

BeanPostProcessor可以配置多个，如果想控制多个BeanPostProcessor的顺序，可以实现Ordered接口，来定义他们的顺序。

虽然BeanPostProcessor是通过ApplicationContext自动检测的，你也可通过ConfigurableBeanFactory的addBeanPostProcessor来手动注册。手动注册则其Ordered失效，以手动注册的先后为准。

还要注意，以编程方式注册的BeanPostProcessor实例总是在注册为自动检测的实例之前进行处理，而不接收任何显式排序。

所有BeanPostProcessor实例和这些实例直接引用的bean都在启动时实例化，因为AOP自动代理是作为BeanPostProcessor本身实现的，所以BeanPostProcessor实例和它们直接引用的bean都不符合自动代理的条件。

下面是一个调用的例子：
~~~xml
    <bean id="beanA" class="com.flydean.beans.BeanA"/>
    <bean id="beanB" class="com.flydean.beans.BeanB"/>

    <bean class="com.flydean.beans.InstantiationTracingBeanPostProcessor"/>
~~~
调用实现：
~~~java
    public static void main(final String[] args) throws Exception {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("bean-post-processor.xml");
        BeanA beanA = (BeanA) ctx.getBean("beanA");
        System.out.println(beanA);
    }
~~~

## BeanFactoryPostProcessor自定义配置元数据

BeanFactoryPostProcessor接口的语义与BeanPostProcessor的语义相似，但有一个主要区别：BeanFactoryPostProcessor对Bean配置元数据进行操作。也就是说，Spring IOC容器允许BeanFactoryPostProcessor读取配置元数据，并可能在容器实例化BeanFactoryPostProcessor实例以外的任何bean之前对其进行更改。

BeanFactoryPostProcessor也可以配置多个，并通过实现Ordered接口来确定执行顺序。BeanFactoryPostProcessor定义了一个方法：

~~~java
	void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;
~~~
通过该方法可以获取到可配置的beanFactory从而对bean定义进行修改。

Spring提供了很多预定义的bean工厂后处理器，例如PropertyOverrideConfigurer和PropertyPlaceholderConfigurer。下面我们通过例子来说明怎么使用。

**PropertyOverrideConfigurer类名替换**

PropertyPlaceholderConfigurer主要用于从外部的Property文件读取属性，用来替换定义好的配置，这样做可以使部署应用程序的人员自定义特定于环境的属性，如数据库URL和密码，而不必为容器修改一个或多个XML定义主文件从而增加复杂性或风险。

下面是配置的XML文件：
~~~xml
    <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="locations" value="classpath:jdbc.properties"/>
    </bean>

    <bean id="dataSource" destroy-method="close"
          class="com.flydean.beans.BasicDataSource">
        <property name="driverClassName" value="${jdbc.driverClassName}"/>
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>
~~~

这个例子展示了属性被配置在外部的Properties文件中。在运行时，使用PropertyPlaceholderConfigurer将元数据替换成DataSource中的某些属性。要替换的值被指定为${property-name}格式的占位符，该格式遵循ant和log4j以及JSP EL样式。

真实的值取自外部的Java Properties格式的文件：
~~~java
jdbc.driverClassName=org.hsqldb.jdbcDriver
jdbc.url=jdbc:hsqldb:hsql://production:9002
jdbc.username=sa
jdbc.password=root
~~~

**PropertyOverrideConfigurer属性覆盖**

PropertyOverrideConfigurer可以用来覆盖Bean属性的默认值，或者设置新的值。我们看一个例子：

~~~xml
    <bean class="org.springframework.beans.factory.config.PropertyOverrideConfigurer">
        <property name="locations" value="classpath:override.properties"/>
        <property name="properties">
            <value>beanOverride.url=com.something.DefaultStrategy</value>
        </property>
    </bean>
    <bean name="beanOverride" class="com.flydean.beans.BeanOverride"/>
~~~

对应的类是：
~~~java
@Data
public class BeanOverride {

    private String name="beanA";
    private String url="http://www.163.com";

}
~~~
它的默认属性会被覆盖。

## 使用FactoryBean自定义实例化逻辑

FactoryBean接口提供3个方法：
* Object getObject(): 返回工厂创建的实例，该实例可能是被共享的， 取决于该实例是单例还是多例模式。
* boolean isSingleton():判断FactoryBean返回的是单例还是多例。
* Class getObjectType():返回getObject() 方法返回的类型，如果提前不知道类型，那么返回null。

我们可以实现FactoryBean接口来自定义Bean的实现逻辑。

~~~java
public class BeanFactoryBean implements FactoryBean {

    @Resource
    private BeanA beanA;

    @Override
    public Object getObject() throws Exception {
        return beanA;
    }

    @Override
    public Class<?> getObjectType() {
        return BeanA.class;
    }
}
~~~

下面是其配置：
~~~xml
    <context:annotation-config/>
    <bean id="beanA" class="com.flydean.beans.BeanA"/>

    <bean id="beanFactoryBean" class="com.flydean.beans.BeanFactoryBean"/>
~~~

如何使用？
~~~java
    public static void main(final String[] args) throws Exception {
        ApplicationContext ctx = new ClassPathXmlApplicationContext("bean-factory.xml");
        BeanFactoryBean beanFactoryBean = (BeanFactoryBean) ctx.getBean("&beanFactoryBean");
        System.out.println(beanFactoryBean.getObject());
        System.out.println(beanFactoryBean.getObjectType());

        BeanA beanA=(BeanA)ctx.getBean("beanFactoryBean");
        System.out.println(beanA);
    }
~~~
当需要向容器请求实际的FactoryBean实例本身而不是它生成的bean时，在调用ApplicationContext的getbean（）方法时，在bean的ID前面加上符号（&）。因此，对于ID为beanFactoryBean的给定FactoryBean，在容器上调用getBean（“beanFactoryBean”）返回FactoryBean生成的bean，而调用getBean（“&beanFactoryBean”）则返回FactoryBean实例本身。

本节的例子可以参考：[ioc-extend](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-ioc-extend/)





