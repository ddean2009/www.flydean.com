---
slug: /spring5-aop-overview
---

# 19. AOP

写过程序的都知道OOP即面向对象编程。

从最开始的面向过程编程，到后面的面向对象编程，程序的编写方式发生了重大的变化，面向对象编程将业务逻辑封装成一个一个的对象，所有的操作都转换为对对象的操作。

面向对象编程现在使用的非常普遍，一般来说只要是高级语言都支持，但是它也有缺点，比如如果我们想做一些横跨对象的操作（如统计各个对象里面某个方法的执行时间），这时候面向对象可以能力有不逮。我们可能需要在每个对象里面都添加一些统计时间的代码，那么有没有更好的方法来处理这个问题呢？ 

面向方面编程（AOP）通过提供对程序结构的另一种思考方式来补充面向对象编程（OOP）。OOP中模块化的关键单元是类，而AOP中模块化的单元是方面。方面支持跨多个类型和对象的关注点（如事务管理）的模块化。（在AOP文献中，这种关注通常被称为“横切”关注。）

## AOP的概念

AOP的英文全称是Aspect-oriented Programming (AOP) 。面向方面的编程。它有如下几个概念：

* 方面（Aspect）：跨越多个类的模块化关注点。事务管理是企业Java应用程序中横切关注点的一个很好的例子。在SpringAOP中，方面是通过使用常规类（基于模式的方法）或使用@Aspect注解（@Aspectj样式）注解的常规类来实现的。

* 连接点（Join point）：程序执行过程中的一点，如方法的执行或异常的处理。在SpringAOP中，连接点总是表示一个方法执行。

* 通知（Advice）：一个方面在特定连接点采取的行动。不同类型的通知包括“环绕”、“前“和”后”通知。许多AOP框架（包括Spring）将通知建模为拦截器，并在连接点周围维护拦截器链。
  
* 切点（Pointcut）：与连接点匹配的谓词。通知与切入点表达式关联，并在与切入点匹配的任何连接点上运行（例如，使用特定名称执行方法）。pointcut表达式匹配的连接点概念是AOP的核心，Spring默认使用AspectJ pointcut表达式语言。
 
* 说明（Introduction）：代表类型声明其他方法或字段。SpringAOP允许您向任何advised对象引入新的接口（和相应的实现）。例如，您可以使用一个Introduction使bean实现一个IsModified接口，以简化缓存。（introduction在AspectJ社区中称为类型间声明。）
  
* 目标对象（Target object）：由一个或多个方面advised的对象。也称为“advised 对象”。因为SpringAOP是通过使用运行时代理实现的，所以这个对象始终是一个代理对象。
  
* AOP代理：由AOP框架创建的用于实现aspect contracts（通知方法执行等）的对象。在Spring框架中，AOP代理是JDK动态代理或CGLIB代理。
  
* 编织（Weaving）：将aspects与其他应用程序类型或对象链接，以创建advised的对象。这可以在编译时（例如，使用AspectJ编译器）、加载时或运行时完成。Spring AOP和其他纯Java AOP框架一样，在运行时进行编织。


## Spring AOP简介

Spring AOP是纯Java实现的。不需要特殊的编译过程。

SpringAOP目前只支持方法上面的连接点，并没有实现字段连接。如果要实现这样的功能可以考虑使用AspectJ。

面向方面的集大成者是AspectJ, 它提供了面向方面编程的非常全面的功能，SpringAOP从未试图与AspectJ竞争，以提供全面的AOP解决方案。我们相信，基于代理的框架（如SpringAOP）和全面的框架（如AspectJ）都是有价值的，它们是互补的，而不是竞争中的。Spring无缝地将SpringAOP和IOC与AspectJ集成在一起。

SpringAOP的AOP方法不同于大多数其他AOP框架。目的并不是提供最完整的AOP实现。相反，其目的是在AOP实现和SpringIOC之间提供紧密的集成，以帮助解决企业应用程序中的常见问题。

## Spring AOP通知类型

Spring AOP包含以下几种通知类型：

* Before advice:在连接点之前运行但不能阻止执行到连接点的通知（除非它抛出异常）。
* After returning advice:在连接点正常完成后要运行的通知（例如，如果方法返回并且不引发异常）。
* After throwing advice: 如果方法通过引发异常而退出，则要执行的通知。
* After (finally) advice:无论连接点退出的方式如何（正常或异常返回），都要执行的通知。
* Around advice:环绕连接点（如方法调用）的通知。这是最有力的通知。around通知可以在方法调用前后执行自定义行为。它还负责通过返回自己的返回值或引发异常来选择是继续到连接点还是快捷地执行通知的方法。

最常使用的是Around advice,他的功能也最强大。他可以实现其他advice的功能，但是我们建议使用功能最小的通知类型，因为这样的模型更加简单，并减少你的编写程序出错几率。

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-aop-overview/)


