---
slug: /spring5-aop-proxy
---

# 22. AOP代理

## AOP代理

通常来说Spring AOP有两种代理方式，一种默认的JDK代理，只能代理接口，一种是CGLIB代理，可以代理具体的类对象。

SpringAOP默认为对AOP代理使用标准的JDK动态代理。如果业务对象不实现接口，则使用CGLIB。

如果使用CGLIB，要注意对于CGLIB，不能advice final方法，因为它们不能在运行时生成的子类中被重写。

由于Spring的AOP框架基于代理的特性，根据定义，**目标对象内的方法调用不会被拦截**。对于JDK代理，只能截获对代理的公共接口方法调用。使用cglib，可以截获代理上的公共和受保护的方法调用（如果需要，甚至可以截获包可见的方法）。

>如果需要拦截在目标类内的方法调用甚至构造函数，那么考虑使用Spring驱动的native AspectJ weaving，而不是Spring的基于代理的AOP框架。

要强制使用CGLIB代理，请将<aop:config>元素的proxy target class属性的值设置为true，如下所示：

~~~xml
<aop:config proxy-target-class="true">
    <!-- other beans defined here... -->
</aop:config>
~~~

要在使用@Aspectj auto proxy支持时强制cglib代理，请将<aop:aspectj-autoproxy>元素的proxy-target-class属性设置为true，如下所示：

~~~xml
<aop:aspectj-autoproxy proxy-target-class="true"/>
~~~

## AOP Proxies原理

SpringAOP是基于代理的，那什么是代理呢？

首先我们考虑一个最简单的POJO对象：

~~~java
public class SimplePojo implements Pojo {

    public void foo() {
        // this next method invocation is a direct call on the 'this' reference
        this.bar();
    }

    public void bar() {
        // some logic...
    }
}
~~~

如果直接调用该对象的方法，则运行原理如下所示：

![](https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/images/aop-proxy-plain-pojo-call.png)

调用方法如下：

~~~java
public class Main {

    public static void main(String[] args) {
        Pojo pojo = new SimplePojo();
        // this is a direct method call on the 'pojo' reference
        pojo.foo();
    }
}
~~~

如果是调用代理，则运行原理如下：

![](https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/images/aop-proxy-call.png)

调用方法如下：

~~~java
public class Main {

    public static void main(String[] args) {
        ProxyFactory factory = new ProxyFactory(new SimplePojo());
        factory.addInterface(Pojo.class);
        factory.addAdvice(new RetryAdvice());

        Pojo pojo = (Pojo) factory.getProxy();
        // this is a method call on the proxy!
        pojo.foo();
    }
}
~~~

本文的例子请参考[aop-proxy](https://github.com/ddean2009/spring5-core-workshop)


更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-aop-proxy/)
