---
slug: /spring5-schema-aop
---

# 21. 基于Schema的AOP

## 基于Schema的AOP

上篇文章我们讲到了使用注解的形式来使用Spring AOP。本文我们介绍如何使用XML Schema的形式使用Spring AOP。

要想使用本文的AOP命名空间标记，需要导入xmlns:aop="http://www.springframework.org/schema/aop"。

在Spring配置中，所有Aspect和Advisor元素都必须放在<aop:config>元素中（在应用程序上下文配置中可以有多个<aop:config>元素）。<aop:config>元素可以包含pointcut、advisor和aspect元素（请注意，这些元素必须按该顺序声明）。

## 定义Aspect

一个aspect是定义在Spring应用程序上下文的java bean对象。

你可以使用<aop:aspect>元素声明一个方面，并使用ref属性引用相应的bean，如下示例所示：

~~~xml
    <aop:config>
        <aop:aspect id="concurrentOperationRetry" ref="concurrentOperationExecutor">
        </aop:aspect>
    </aop:config>

<bean id="concurrentOperationExecutor"
          class="com.flydean.aspect.ConcurrentOperationExecutor">
        <property name="maxRetries" value="3"/>
        <property name="order" value="100"/>
    </bean>
~~~

## 定义Pointcut

你可以在<aop:config>中使用aop:pointcut来定义一个Pointcut，如下所示：

~~~xml
    <aop:config>
            <aop:pointcut id="idempotentOperation"
                          expression="execution(* com.flydean.service.*.*(..))
                                        and
                         @annotation(com.flydean.beans.Idempotent)"/>

    </aop:config>
~~~

定义在顶层<aop:config>中的<aop:pointcut>可以在多个aspects和advisors之间共享。

当组合切入点子表达式时，可以使用and、or和not关键字来代替&& || 和！，如下所示：

~~~xml
 <aop:pointcut id="businessService"
            expression="execution(* com.xyz.myapp.service.*.*(..)) && this(service)"/>
~~~

~~~xml
   <aop:pointcut id="businessService"
            expression="execution(* com.xyz.myapp.service.*.*(..)) and this(service)"/>
~~~

## 定义Advice

schema-based AOP 支持使用与@Aspectj样式相同的五种建议，它们具有完全相同的语义。

**Before Advice**

在匹配的方法执行之前运行通知。它通过在<aop:aspect>中声明使用的<aop:before>元素，如下示例所示：

~~~xml
    <aop:before
        pointcut-ref="dataAccessOperation"
        method="doAccessCheck"/>
~~~

**After Returning Advice**

After Returning Advice，在匹配的方法执行正常完成时运行。它在一个<aop:aspect>中声明，方式与之前的通知相同。下面的示例演示如何声明它：

~~~xml

    <aop:after-returning
        pointcut-ref="dataAccessOperation"
        method="doAccessCheck"/>
~~~

正如在@Aspectj样式中一样，您可以在通知正文中获得返回值。为此，请使用returning来指定应将返回值传递到的参数的名称，如下示例所示：

~~~xml
   <aop:after-returning
        pointcut-ref="dataAccessOperation"
        returning="retVal"
        method="doAccessCheck"/>
~~~

doAccessCheck方法必须要有声明名为retval的参数。如下所示：

~~~java
public void doAccessCheck(Object retVal) {...
~~~

**After Throwing Advice**

当匹配的方法引发异常退出时执行。它通过在<aop:aspect>中声明after-throwing 元素来实现，如下示例所示：

~~~xml
    <aop:after-throwing
        pointcut-ref="dataAccessOperation"
        method="doRecoveryActions"/>
~~~

同样的，你可以在通知方法中获得抛出的异常，如下所示：

~~~xml
    <aop:after-throwing
        pointcut-ref="dataAccessOperation"
        throwing="dataAccessEx"
        method="doRecoveryActions"/>
~~~

doRecoveryActions方法必须有声明名为DataAccessEx的参数，如下所示：

~~~java
public void doRecoveryActions(DataAccessException dataAccessEx) {...
~~~

**After (Finally) Advice**

无论匹配的方法执行如何退出，after（finally）通知都会运行。可以使用after元素声明它，如下示例所示：

~~~xml
   <aop:after
        pointcut-ref="dataAccessOperation"
        method="doReleaseLock"/>
~~~

**Around Advice**

最后一种advice是around advice的。around通知运行“around”匹配的方法执行。它有机会在方法执行之前和之后都进行工作，并确定何时、如何以及该方法真正开始执行。

你可以使用aop:around元素来声明around advice。advice方法的第一个参数必须是ProceedingJoinPoint类型。

~~~xml
   <aop:around
        pointcut-ref="businessService"
        method="doBasicProfiling"/>
~~~

doBasicProfiling advice的实现如下：

~~~java
public Object doBasicProfiling(ProceedingJoinPoint pjp) throws Throwable {
    // start stopwatch
    Object retVal = pjp.proceed();
    // stop stopwatch
    return retVal;
}
~~~

## advice参数

如果您希望显式地为advice方法指定参数名，可以使用advice元素的arg-names属性来指定参数名，下面是例子：

~~~xml
    <aop:config>
        <aop:aspect ref="profiler">

            <aop:pointcut id="theExecutionOfSomePersonServiceMethod"
                          expression="execution(* com.flydean.service.PersonService.getPerson(String,int))
                and args(name, age)"/>

            <aop:around pointcut-ref="theExecutionOfSomePersonServiceMethod"
                        method="profile"/>

        </aop:aspect>
    </aop:config>
~~~

相应的aspect bean定义如下：

~~~java
public class SimpleProfiler {

    public Object profile(ProceedingJoinPoint call, String name, int age) throws Throwable {
        StopWatch clock = new StopWatch("Profiling for '" + name + "' and '" + age + "'");
        try {
            clock.start(call.toShortString());
            return call.proceed();
        } finally {
            clock.stop();
            System.out.println(clock.prettyPrint());
        }
    }
}
~~~

profile接收两个参数。

## Advisors

“Advisors”的概念来自于Spring中定义的AOP支持，在AspectJ中没有直接的等价物。Advisors就像一个独立的小方面，只有一条advice。

Spring使用<aop:advisor>元素支持Advisor概念。您通常会看到它与事务性advice结合使用，后者在Spring中也有自己的名称空间支持。以下示例展示了advisor：

~~~xml
<aop:config>

    <aop:pointcut id="businessService"
        expression="execution(* com.xyz.myapp.service.*.*(..))"/>

    <aop:advisor
        pointcut-ref="businessService"
        advice-ref="tx-advice"/>

</aop:config>

<tx:advice id="tx-advice">
    <tx:attributes>
        <tx:method name="*" propagation="REQUIRED"/>
    </tx:attributes>
</tx:advice>
~~~

本文的例子可以参考[aop2](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-schema-aop/)
