[toc]

## Spring Bean 的生命周期回调

Spring中的Bean是随着Spring容器产生的，当Spring容器关闭的时候，相应的Bean也会消失。当然这个和Bean自身的作用域范围也有关系，但是通常都逃不过 初始化，运行，关闭这三个状态。

在Spring中，我们通常需要在Bean刚刚初始化的时候，或者Bean被销毁的时候做一些额外的资源处理的事情。Spring提供了InitializingBean和DisposableBean接口，前者调用afterPropertiesSet（），为后者调用destroy（），以便bean在初始化和销毁bean时执行某些操作。

如下所示：
~~~java
public class SampleInitializingBean implements InitializingBean {

    @Override
    public void afterPropertiesSet() throws Exception {
    log.info("inside afterPropertiesSet");
    }
}
~~~

~~~java
public class SampleDisposableBean implements DisposableBean {


    @Override
    public void destroy() throws Exception {
        log.info("destroy");
    }
}
~~~

当然这样做就和Spring的代码耦合了。我们可以使用JSR-250 的@PostConstruct和@PreDestroy注解，这样就和Spring框架解耦了。

第三种方法就是使用配置的init-method和destroy-method，或者使用@Bean的initMethod属性和@Bean的destroyMethod属性。

如下所示：
~~~xml
    <bean id="exampleInitBean" class="com.flydean.beans.ExampleBean" 
          init-method="init" destroy-method="destroy"/>
~~~

下面是@Bean注解的例子：
~~~java
    @Bean(initMethod = "init",destroyMethod = "destroy")
    public ExampleBean getExampleBean(){
        return new ExampleBean();
    }
~~~

也可以为所有的bean都添加一个默认的初始化方法,和销毁方法：
~~~xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd"
    default-init-method="init" default-destroy-method="destroy">
~~~

## 总结生命周期机制
从Spring2.5之后，你有3种方式来控制bean的生命周期：

* InitializingBean和DisposableBean回调接口
* 自定义init() 和destroy() 方法。
* @PostConstruct 和 @PreDestroy注解. 

如果为initialization配置了多种生命周期的多个名字，那么执行顺序如下：

* @PostConstruct 的方法注解
* InitializingBean接口里面的afterPropertiesSet() 方法
* 自定义的init() 方法

同样的Destroy也是一样的顺序：
* @PreDestroy 的方法注解
* DisposableBean接口里面的destroy() 方法
* 自定义的destroy() 方法

## startup和Shutdown回调

上面我们讲了在bean初始化和销毁的时候的回调。一般来说就已经够用了。如果需要自己管理生命周期对象，比如启动和停止一些后台进程的时候，Spring提供了Lifecycle接口。

~~~java
public interface Lifecycle {

    void start();

    void stop();

    boolean isRunning();
}
~~~

任何Spring管理的对象都可以实现Lifecycle接口。当ApplicationContext收到一个start或者stop信号时，他会将该信号传递给所有的Lifecycle接口的实现。

Spring提供了LifecycleProcessor接口，该接口的默认实现是DefaultLifecycleProcessor ：

~~~java
public interface LifecycleProcessor extends Lifecycle {

	/**
	 * Notification of context refresh, e.g. for auto-starting components.
	 */
	void onRefresh();

	/**
	 * Notification of context close phase, e.g. for auto-stopping components.
	 */
	void onClose();

}
~~~

 onRefresh()和onClose()会去调用实现了Lifecycle接口的start（）和close（）方法。

 如果需要实现启动和关闭回调的顺序，则可以实现SmartLifecycle接口，该接口提供了getPhase（）方法:

~~~java
 public interface SmartLifecycle extends Lifecycle, Phased {

    boolean isAutoStartup();

    void stop(Runnable callback);
}
~~~

启动时，具有最低phase的对象首先启动。停止时，按相反顺序执行。

## 优雅的关闭Spring IoC容器

如果是Spring WEB应用程序，Spring的web基础的ApplicationContext实现，已经有代码优雅的关闭 Spring IoC 容器。

这里我们考虑非web情况，我们需要注册一个shutdown hook到JVM中。这样将保证优雅的关闭，并且在单例bean中调用相关的销毁方法，让所有的资源得到释放。

调用ConfigurableApplicationContext接口中的registerShutdownHook()来注册一个shutdown hook， 如下所示：

~~~java
    public static void main(final String[] args) throws Exception {
        ConfigurableApplicationContext ctx = new ClassPathXmlApplicationContext("bean-lifecycle.xml");

        // add a shutdown hook for the above context...
        ctx.registerShutdownHook();

        // app runs here...

        // main method exits, hook is called prior to the app shutting down...
    }
~~~

本节的代码可以参考[bean-lifecycle](https://github.com/ddean2009/spring5-core-workshop)




更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-bean-lifecycle/)







