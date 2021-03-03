[toc]

## 什么是AspectJ注解

想要在Spring中使用AOP，和通用的Spring Bean一样有两种方式，一种就是注解，一种就是XML配置，本文主要讲解如何通过注解开启Spring AOP。

@AspectJ是一种将aspects声明为用注解来注解Java类的样式。@Aspectj样式是作为Aspectj 5版本的一部分由Aspectj项目引入的。Spring使用和AspectJ相同的注解，它使用了AspectJ提供的用于切入点解析和匹配的库。但是，AOP运行时仍然是纯SpringAOP，并且不依赖于AspectJ编译器或weaver。

## 启用AOP

Spring中使用@Aspectj特性需要Spring的支持，一旦启用@AspectJ , Spring将会为目标Bean自动生成代理，从而来拦截方法调用，或者根据需要调用通知。

>注意，如果要启用@AspectJ支持，必须在classpath包含aspectjweaver.jar。

启用@AspectJ支持很简单，只需要在@Configuration 中添加@EnableAspectJAutoProxy 即可，如下所示：

~~~java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {

}
~~~

## 定义Aspect

如果想要定义一个Aspect， 只需要在Spring Bean上面加上@Aspect注解即可，如下所示：

~~~java
@Aspect
@Component
public class NotVeryUsefulAspect {
}
~~~

## 定义Pointcut

SpringAOP只支持方法层的切入点，也就是说你只能在方法上面定义Pointcut.

一个切入点声明有两部分：一个包含一个名称和任何参数的签名，一个能精确地确定我们感兴趣的执行方法的切入点表达式。在aop的@Aspectj注解样式中，通过常规方法定义提供切入点签名，并使用@Pointcut注解指示切入点表达式（作为切入点签名的方法必须具有void返回类型）。

下面的例子定义一个名为anyOldTransfer的切入点，该切入点与名为Transfer的任何方法的执行相匹配：

~~~java
@Aspect
@Component
public class NotVeryUsefulAspect {

    @Pointcut("execution(* transfer(..))")// the pointcut expression
    private void anyOldTransfer() {}// the pointcut signature

}
~~~

>构成@Pointcut的是一个正则的aspectj 5 pointcut表达式。更多详细信息，我们会在接下来的教程中详细说明。

## 切入点指示符（PCD）

上面的例子我们看到在@Pointcut注解中可以使用execution， 表示执行方法的Pointcut，其实@Pointcut注解支持很多AspectJ切入点指示符（PCD），如下所示：

* execution：用于匹配方法执行连接点。这是使用SpringAOP时要使用的主要切入点指示符。
* within：特定类型中的连接点。
* this：bean引用（SpringAOP代理）是给定类型的实例。
* target：目标对象（要代理的应用程序对象）是给定类型的实例。
* args：参数是给定类型的实例。
* @target：执行对象的类具有给定类型的注解。
* @Args：传递的实际参数的运行时类型具有给定类型的注解。
* @within：与具有给定注解的类型中的联接点匹配。
* @Annotation：在SpringAOP中执行的方法具有给定注解的连接点。

**例子**

SpringAOP用户最经常使用执行切入点指示符。执行表达式的格式如下：

~~~java
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern?name-pattern(param-pattern)
            throws-pattern?)
~~~

除返回类型模式（前面代码段中的ret-type-pattern）、名称模式和参数模式之外的所有部分都是可选的。返回类型模式确定方法的返回类型，以便匹配连接点。\*最常用作返回类型模式。它匹配任何返回类型。只有当方法返回给定类型时，完全限定的类型名才匹配。名称模式与方法名匹配。您可以使用\*通配符作为名称模式的全部或部分。如果指定声明类型模式，请包含后缀.将其连接到名称模式组件。参数模式稍微复杂一点：（）匹配不带参数的方法，而（..）匹配任何数量（零个或多个）的参数。（\*）模式与采用任何类型参数的方法匹配。（*，string）匹配接受两个参数的方法。第一个可以是任何类型，而第二个必须是字符串。

以下示例显示了一些常见的切入点表达式：

* 执行任何公共方法：
~~~java
execution(public * *(..))
~~~

* 执行任何以set开头的方法：
~~~java
execution(* set*(..))
~~~

* 执行任何定义在AccountService类的方法：
~~~java
execution(* com.xyz.service.AccountService.*(..))
~~~

* 执行任何定义在service包中的方法：
~~~java
execution(* com.xyz.service.*.*(..))
~~~

* 执行任何定义在service包或者他的一个子包中的方法：
~~~java
execution(* com.xyz.service..*.*(..))
~~~

* 任何在service包中的连接点（仅仅是Spring AOP中执行的方法）
~~~java
within(com.xyz.service.*)
~~~

* service包或其子包中的任何连接点（仅在SpringAOP中执行的方法）：
~~~java
within(com.xyz.service..*)
~~~

* 任何实现了AccountService接口的代理连接点（仅在SpringAOP中执行的方法）：
~~~java
this(com.xyz.service.AccountService)
~~~

>this通常被用在绑定form中。

* 任何实现了AccountService接口的目标对象连接点（仅在SpringAOP中执行的方法）：
~~~java
target(com.xyz.service.AccountService)
~~~

>target更加通常被用在绑定form中。

* 任何接收一个运行时是Serializable类型参数的连接点（仅在SpringAOP中执行的方法）：
~~~java
args(java.io.Serializable)
~~~
>args通常被用在绑定form中。

注意，在本例中给出的切入点与execution(* *(java.io.Serializable))不同。如果在运行时传递的参数是Serializable的，则args版本匹配；如果方法签名声明了Serializable的单个参数，则执行版本匹配。

* 任何目标对象有@Transactional 注解的连接点（仅在SpringAOP中执行的方法）：
~~~java
@target(org.springframework.transaction.annotation.Transactional)
~~~

>@target也可以被用在绑定form中。

* 目标对象的声明类型具有@transactional注解的任何连接点（仅在Spring AOP中执行的方法）：
~~~java
@within(org.springframework.transaction.annotation.Transactional)
~~~

>@within也可以被用在绑定form中。

* 执行方法具有@transactional注解的任何连接点（仅在Spring AOP中执行方法）：
~~~java
@Annotation(org.springframework.transaction.annotation.Transactional)
~~~

>@Annotation也可以被用在绑定form中。

* 接受单个参数的任何连接点（仅在Spring AOP中执行方法），并且传递参数的运行时类型具有@Classified annotation:
~~~java
@Args(com.xyz.security.Classified)
~~~

>@Args也可以被用在绑定form中。

* 名为tradeService的SpringBean上的任何连接点（仅在SpringAOP中执行方法）：
~~~java
bean(tradeService)
~~~

* SpringBean上的任何连接点（仅在SpringAOP中执行方法），其名称与通配符表达式*Service匹配：

~~~java
bean(*Service)
~~~

>其他的AspectJ支持的pointcut指示符（call、get、set、preinitialization、staticinitialization、initialization、handler、adviceexecution、withincode、cflow、cflowbelow、if、@this和@withincode）在Spring中是不支持的，会引发IllegalArgumentException。

除了标准的PCD之外，Spring还有一个基于特定名字的Spring Bean或一组Spring Bean（使用通配符时）PCD：

~~~java
bean(idOrNameOfBean)
~~~

其中idorNameOfBean可以是任何Spring Bean的名称，可以使用\*通配符进行名称匹配。

bean PCD仅在SpringAOP中受支持，在native AspectJ中不支持。它是AspectJ定义的标准PCD的特定于Spring的扩展，因此不能用于native AspectJ中。

~~~java
    @Pointcut("bean(serviceA)")
    private void beanServiceA() {}
~~~

## 切入点组合

切入点表达式可以通过&&、|| 和！组合在一起，并可以按名称来引用，下面是例子：

~~~java
@Pointcut("execution(public * *(..))")
private void anyPublicOperation() {} 

@Pointcut("within(com.flydean.service.*)")
private void inTrading() {}

@Pointcut("anyPublicOperation() && inTrading()")
private void tradingOperation() {}
~~~

> 按名称应用Pointcut时，支持正常的java可见性规则。（可以在同一类型中看到私有切入点、在层次结构中看到protected切入点、在任何地方看到公共切入点等）。

>注意，可见性并不影响Pointcut匹配。

## Advice

Advice是与切入点相关连的，Advice是在切入点匹配的方法上面执行before, after, 或 around Advice。

切入点表达式有两种表现方式：1. 可以是对命名切入点的简单引用，2. 可以就地声明切入点表达式。

**下面是Before Advice的例子**

~~~java
    @Before("com.flydean.aspect.SystemArchitecture.businessService()")
    public void doAccessCheck() {
        // ...
    }


    @Before("execution(* com.flydean.service.*.*(..))")
    public void doServiceCheck() {
        // ...
    }
~~~

**After Returning Advice**

~~~java
    @AfterReturning("com.flydean.aspect.SystemArchitecture.businessService()")
    public void doBusinessCheck() {
        // ...
    }
~~~

有时，您需要访问通知主体中返回的实际值。您可以使用@AfterReturn的形式绑定返回值以获得该访问，如下示例所示：

~~~java
    @AfterReturning(
            pointcut="com.flydean.aspect.SystemArchitecture.businessService()",
            returning="retVal")
    public void doAccessCheck(Object retVal) {
        // ...
    }
~~~

returning属性中使用的名称必须与advice方法中参数的名称相对应。当方法执行返回时，返回值作为相应的参数值传递给通知方法。返回子句还限制只匹配那些返回指定类型值的方法执行（在本例中是Object，它匹配任何返回值）。

**After Throwing Advice**

当匹配的方法抛出异常退出时，After throwing advice执行，你可以使用@AfterThrowing来声明它：

~~~java
    @AfterThrowing("com.flydean.aspect.SystemArchitecture.businessService()")
    public void doRecoveryActions() {
        // ...
    }
~~~

如果你希望只有在抛出给定类型的异常时才运行通知，并且通常还需要访问通知正文中抛出的异常。可以使用throwing属性来限制匹配（如果需要-使用throwable作为异常类型），并将引发的异常绑定到advice参数。以下示例显示了如何执行此操作：

~~~java
    @AfterThrowing(
            pointcut="com.flydean.aspect.SystemArchitecture.businessService()",
            throwing="ex")
    public void doRecoveryActions(Exception ex) {
        // ...
    }
~~~

throwing属性中使用的名称必须与advice方法中参数的名称相对应。当通过引发异常退出方法执行时，异常作为相应的参数值传递给通知方法。

**After (Finally) Advice**

After (Finally) Advice当匹配的方法执行退出时执行，通过@After注解来定义。After advice 必须能够处理正常返回和异常返回的情况。它通常用于释放资源和类似用途。下面的示例演示如何在finally advice之后使用：

~~~java
    @After("com.flydean.aspect.SystemArchitecture.businessService()")
    public void doReleaseLock() {
        // ...
    }
~~~

**Around Advice**

around advice运行“around”匹配方法的执行。它有机会在方法执行之前和之后都进行工作，并确定何时、如何以及即使该方法真正开始执行。

使用@Around注解声明around通知。advice方法的第一个参数必须是ProceedingJoinPoint类型。在通知正文中，对ProceedingJoinPoint调用proceed（）会导致执行基础方法。proceed方法也可以传入Object[]。数组中的值在方法执行过程中用作参数。

~~~java
    @Around("com.flydean.aspect.SystemArchitecture.businessService()")
    public Object doBasicProfiling(ProceedingJoinPoint pjp) throws Throwable {
        // start stopwatch
        Object retVal = pjp.proceed();
        // stop stopwatch
        return retVal;
    }
~~~

## 访问JoinPoint

任何advice方法都可以将org.aspectj.lang.joinpoint类型的参数声明为其第一个参数（请注意，需要使用around advice从而声明ProceedingJoinPoint类型作为第一个参数，该参数是JoinPoint的子类）。JoinPoint接口提供了许多有用的方法：

* getArgs(): 返回方法参数
* getThis(): 返回代理对象
* getTarget(): 返回目标对象
* getSignature(): 返回被advice的方法描述
* toString():打印被advice方法的有用描述


## Advice参数

前面的例子我们看到了如何绑定返回值或异常值。如果想在通知主题中使用参数，可以使用参数绑定的形式。

在args表达式中使用参数名代替类型名，则在调用通知时，相应参数的值将作为参数值传递。

~~~java
    @Before("com.flydean.aspect.SystemArchitecture.businessService() && args(account,..)")
    public void validateAccount(Account account) {
        // ...
    }
~~~

pointcut中的args(account,..)部分有两个主要目的：首先，它将匹配限制为只执行那些方法，其中该方法至少接受一个参数，并且传递给该参数的参数是帐户的实例。其次，它通过account参数使实际的account对象可用于advice。

另一种编写方法是声明一个切入点，该切入点在与连接点匹配时“提供”account对象值，然后从通知中引用命名的切入点。如下所示：

~~~java
    @Pointcut("com.flydean.aspect.SystemArchitecture.businessService() && args(account,..)")
    private void accountDataAccessOperation(Account account) {}

    @Before("accountDataAccessOperation(account)")
    public void validateAccountA(Account account) {
        // ...
    }
~~~

## Advice参数和泛型

SpringAOP可以处理类声明和方法参数中使用的泛型。假设您有一个如下的泛型类型：

~~~java
public interface Sample<T> {
    void sampleGenericMethod(T param);
    void sampleGenericCollectionMethod(Collection<T> param);
}
~~~

通过将advice参数键入要拦截方法的参数类型，可以将方法类型的拦截限制为某些参数类型：

~~~java
    @Before("execution(* * ..Sample+.sampleGenericMethod(*)) && args(param)")
    public void beforeSampleMethod(MyType param) {
        // Advice implementation
    }
~~~

这种方法不适用于泛型集合.

## Advice Ordering

当在不同aspects定义的两条advice都需要在同一连接点上运行时，除非您另有指定，否则执行顺序是未定义的。您可以通过指定优先级来控制执行顺序。这可以通过在Aspect类中实现org.springframework.core.Ordered接口或使用order注解来以正常的Spring方式完成。给定两个aspects，从ordered.getValue（）返回较低值（或注解值）的方面具有较高的优先级。

给定两个before advice，最高优先级的advice首先运行。

给定两条after advice，最高优先级的通知将在第二运行。

## Introductions
Introductions能够为建议的对象提供指定的接口实现。

可以使用@DeclareParents注解来声明要实现的接口和默认的实现对象。

例如，给定一个名为UsageTracked的接口和一个名为DefaultUsageTracked的接口的实现，下面的方面声明com.flydean.service的所有方法也实现UsageTracked了接口：

~~~java
@Aspect
@Component
public class UsageTracking {

    @DeclareParents(value="com.flydean.service.*+", defaultImpl= DefaultUsageTracked.class)
    public static UsageTracked mixin;

    @Before("com.flydean.aspect.SystemArchitecture.businessService() && this(usageTracked)")
    public void recordUsage(UsageTracked usageTracked) {
        usageTracked.incrementUseCount();
    }
}
~~~

下面是调用的例子：

~~~java
        ServiceA serviceA=(ServiceA)classPathXmlApplicationContext.getBean("serviceA");
        UsageTracked usageTracked=(UsageTracked)serviceA;
        usageTracked.incrementUseCount();
~~~

其中serviceA是com.flydean.service包里面的方法。我们通过Introductions为其添加了一个incrementUseCount的方法。

本节的例子可以参考[aop1](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-aspectj-annotation/)




