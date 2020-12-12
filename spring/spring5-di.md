[toc]

## 依赖注入

依赖注入就是在Spring创建Bean的时候，去实例化该Bean构造函数所需的参数，或者通过Setter方法去设置该Bean的属性。

Spring的依赖注入有两种基于构造函数的依赖注入和基于setter的依赖注入。

**基于构造函数的依赖注入**

构造函数的注入是通过构造函数的参数来实现的。如下所示：

~~~java
public class ExampleBean {

    // Number of years to calculate the Ultimate Answer
    private int years;

    // The Answer to Life, the Universe, and Everything
    private String ultimateAnswer;

    public ExampleBean(int years, String ultimateAnswer) {
        this.years = years;
        this.ultimateAnswer = ultimateAnswer;
    }
}

~~~

该Bean有一个两个参数的构造函数，那么怎么注入这些参数呢？
有三种方法。

方法1：按构造函数的类型匹配：

~~~xml
    <bean id="exampleBeanA" class="com.flydean.beans.ExampleBean">
        <constructor-arg type="int" value="7500000"/>
        <constructor-arg type="java.lang.String" value="42"/>
    </bean>
~~~

这里通过指定参数的类型，即可以指定哪个参数是years，哪个参数是ultimateAnswer。

方法2：构造函数索引：

~~~xml
    <bean id="exampleBeanB" class="com.flydean.beans.ExampleBean">
        <constructor-arg index="0" value="7500000"/>
        <constructor-arg index="1" value="42"/>
    </bean>
~~~

Spring中可以通过构造函数的索引来指定特定的参数。要注意Spring的索引是从0开始的。

方法3：构造函数名字匹配：

~~~xml
    <bean id="exampleBeanC" class="com.flydean.beans.ExampleBeanWithConstructorProperties">
        <constructor-arg name="years" value="7500000"/>
        <constructor-arg name="ultimateAnswer" value="42"/>
    </bean>
~~~

如果通过构造函数的名字来匹配，需要注意必须在编译的时候开启调试标志，要不然Spring不能在构造函数中找到参数名。

如果不想启用调试标志，则必须使用@ConstructorProperties JDK注解显式命名构造函数参数。

~~~java
public class ExampleBeanWithConstructorProperties {

    // Number of years to calculate the Ultimate Answer
    private int years;

    // The Answer to Life, the Universe, and Everything
    private String ultimateAnswer;

    @ConstructorProperties({"years", "ultimateAnswer"})
    public ExampleBeanWithConstructorProperties(int years, String ultimateAnswer) {
        this.years = years;
        this.ultimateAnswer = ultimateAnswer;
    }
}
~~~

**基于Setter的注入**

Setter注入主要用来无参构造器或者获得对象实例之后才设置对象的属性。下面是Setter的例子：

~~~java
public class SimpleMovieLister {

    // the SimpleMovieLister has a dependency on the MovieFinder
    private MovieFinder movieFinder;

    // a setter method so that the Spring container can inject a MovieFinder
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // business logic that actually uses the injected MovieFinder is omitted...
}
~~~

对于的XML文件如下：

~~~xml
    <!--Setter DI -->
    <bean id="movieFinder" class="com.flydean.beans.MovieFinder"/>

    <bean id="simpleMovieLister" class="com.flydean.beans.SimpleMovieLister">
        <property name="movieFinder" ref="movieFinder"/>
    </bean>
~~~

除了XML配置，也可以使用注解：@Component、@Controller。或者使用@Configuration注解中的@Bean方法。

**如何选择？**

既然有这样两种注入方式，我们怎么选择呢？

通常来说，对于必须的属性，我们通过构造函数来注入。对于可选属性，我们通过Setter注入。当然你也可以在Setter方法中使用@Required注解。

当然如果第三方类不公开任何setter方法，那么构造函数注入可能是DI的唯一可用形式。

**循环依赖**

循环依赖主要出现在构造函数注入的情况。

类A通过构造函数注入需要类B的实例，类B通过构造函数注入需要类A的实例。如果为要相互注入的类A和类B配置bean，那么SpringIOC容器在运行时检测到这个循环引用，会抛出BeanCurrentlyInCreationException。

解决方式就是使用Setter注入。


## 依赖注入的配置详解 ##

**基本类型，字符串或者其他**

如果< property/>元素的value属性是基本类型，Spring会将其转换为类需要的类型，配置如下：

~~~xml
    <!--Setter DI -->
    <bean id="movieFinder" class="com.flydean.beans.MovieFinder">
        <property name="name" value="movie"/>
        <property name="number" value="123456"/>
    </bean>
~~~

这是一个常见的Setter注入。为了简洁，也可以使用p-namespace，如下：

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="movieFinder" class="com.flydean.beans.MovieFinder"
          p:name="movie"
          p:number="123456"/>
</beans>
~~~

Spring容器使用JavaBeans属性编辑器机制将< value/>元素中的文本转换为java.util.properties实例。这是一个很好的快捷方式，如下所示：

~~~xml
    <bean id="mappings"
          class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">

        <!-- typed as a java.util.Properties -->
        <property name="properties">
            <value>
                jdbc.driver.className=com.mysql.jdbc.Driver
                jdbc.url=jdbc:mysql://localhost:3306/mydb
            </value>
        </property>
    </bean>
~~~
注意上面例子中的value里面的值。

**ref**

通过< ref/>标记的bean属性允许在同一容器或父容器中创建对任何bean的引用，而不管它是否在同一XML文件中。bean属性的值可以与目标bean的id属性相同，也可以与目标bean的name属性中的一个值相同。以下示例显示如何使用ref元素：

~~~xml
<ref bean="someBean"/>
~~~

**内部bean**

在< property/> 或者 < constructor-arg/>元素内部的< bean/>元素可以定义一个内部bean,下面是个例子：

~~~xml
    <bean id="simpleMovieLister" class="com.flydean.beans.SimpleMovieLister">
        <property name="movieFinder">
            <bean class="com.flydean.beans.MovieFinder">
                <property name="name" value="movie"/>
                <property name="number" value="123456"/>
            </bean>
        </property>
    </bean>
~~~

内部bean定义不需要ID或名称。如果指定，容器也不会使用这个值作为标识符。容器在创建时也忽略作用域标志，因为内部bean总是匿名的，并且总是用外部bean创建的。不可能单独访问内部bean，也不可能将它们注入到除封闭bean之外的协作bean中。

**集合**

< list/>, < set/>, < map/>,和 < props/> 分别被用来设置Java Collection类型List, Set, Map，和 Properties 类型的属性和参数。 下面是个例子：

~~~xml
    <bean id="movieFinderE" class="com.flydean.beans.MovieFinder"></bean>

    <bean class="com.flydean.beans.CollectionBean">
        <property name="properties">
            <props>
                <prop key="administrator">administrator@example.org</prop>
                <prop key="support">support@example.org</prop>
                <prop key="development">development@example.org</prop>
            </props>
        </property>

        <property name="arrayList">
            <list>
                <value>"a list element followed by a reference"</value>
            </list>
        </property>

        <property name="hashMap">
            <map>
                <entry key="an entry" value="just some string"/>
                <entry key ="a ref" value-ref="movieFinderE"/>
            </map>
        </property>

        <property name="hashSet">
            <set>
                <value>just some string</value>
                <ref bean="movieFinderE" />
            </set>
        </property>
    </bean>
~~~

**强类型集合**

通过在Java 5中引入泛型类型，可以使用强类型集合。也就是说，可以声明集合类型，使其只能包含（例如）字符串元素。如果使用Spring将强类型集合注入bean，则可以利用Spring的类型转换支持，以便在将强类型集合实例的元素添加到集合之前将其转换为适当的类型。下面的Java类和bean定义的例子：

~~~java
public class SomeClass {

    private Map<String, Float> accounts;

    public void setAccounts(Map<String, Float> accounts) {
        this.accounts = accounts;
    }
}
~~~

~~~xml
        <bean id="something" class="com.flydean.beans.SomeClass">
            <property name="accounts">
                <map>
                    <entry key="one" value="9.99"/>
                    <entry key="two" value="2.75"/>
                    <entry key="six" value="3.99"/>
                </map>
            </property>
        </bean>
~~~

**Null和Empty字符串值**

Null和空字符串是不一样的，如下：
~~~xml
<bean class="ExampleBean">
    <property name="email" value=""/>
</bean>
~~~
上面的例子相当于：
~~~java
exampleBean.setEmail("");
~~~

下面是怎么设置null：
~~~xml
<bean class="ExampleBean">
    <property name="email">
        <null/>
    </property>
</bean>
~~~
上面的例子相当于：
~~~java
exampleBean.setEmail(null);
~~~

**c-namespace**

上面讲到了p-namespace专门是设置bean的属性用的，同样的c-namespace是用来设置构造函数参数的，如下所示：

~~~xml
    <bean id="exampleBeanA" class="com.flydean.beans.ExampleBean">
        <constructor-arg type="int" value="7500000"/>
        <constructor-arg type="java.lang.String" value="42"/>
    </bean>

    <bean id="exampleBeanB" class="com.flydean.beans.ExampleBean"
    c:years ="10" c:ultimateAnswer="answer"
    />
~~~

## depends-on

通常一个bean依赖另一个bean，我们会在XML中使用< ref/>来引用，但是这种依赖关系并不直接。我们可以使用depends-on属性来显式强制一个或多个bean在使用此元素的bean初始化之前进行初始化,如下所示：

~~~xml
    <bean id="beanA" class="com.flydean.beans.SomeClass" depends-on="beanB"></bean>

    <bean id="beanB" class="com.flydean.beans.MovieFinder"></bean>
~~~

## lazy-init 

正常来说ApplicationContext中配置成单例模式的bean都会随Spring启动而初始化，如果有特殊的需要，想延长初始化该bean，则可以使用 lazy-init 。一个lazy-initialized bean告诉IOC容器在第一次请求bean实例时创建它，而不是在启动时。

~~~xml
<bean id="beanD" class="com.flydean.beans.MovieFinder" lazy-init="true"></bean>
~~~

但是，当一个惰性初始化bean是一个非惰性初始化的singleton bean的依赖项时，ApplicationContext会在启动时创建惰性初始化bean，因为它必须满足singleton的依赖项。

您还可以通过在< beans/>元素上使用默认的lazy init属性在容器级别控制lazy初始化，下面的示例显示：

~~~xml
<beans default-lazy-init="true">
    <!-- no beans will be pre-instantiated... -->
</beans>
~~~

## 自动装载

如果你想让Spring自动帮你注入bean的依赖bean时候，可以使用Spring的autowiring功能。autowiring 有4种模式：

| 模式 | 说明 |
| --- | --- |
| no | （默认）无自动装载。bean必须引用由ref定义的元素。对于较大的部署，不建议更改默认设置，因为显式指定合作者可以提供更大的控制度和清晰性。在某种程度上，它记录了系统的结构。 |
| byName | 按属性名称自动装载。Spring寻找与需要自动装载的属性同名的bean。例如，如果bean定义被设置为按名称自动装载，并且它包含一个master属性（即，它有一个setMaster（..）方法），那么spring将查找名为master的bean定义并使用它来设置该属性。 |
| byType |如果容器中只有一个属性类型的bean，则允许自动装载属性。如果存在多个，则会引发一个致命的异常，这表示您不能为该bean使用byType自动装载。如果没有匹配的bean，则不会发生任何事情（未设置属性）。  |
|constructor  | 类似于byType，但适用于构造函数参数。如果容器中不只有一个构造函数参数类型的bean，则会引发致命错误。 |

**自动注入的限制和缺陷**

虽然自动注入用起来很爽，但是它也有如下的缺陷：

* property和constructor-arg的显示设置会覆盖自动注入，并且自动注入不能注入简单类型。

* 自动注入不如显示配置精确。

* 自动注入可能和容器中的很多bean相匹配。可能会出现问题。

**从自动装载中排除Bean**

使用autowire-candidate属性设置为false，可以防止bean被自动注入。该属性只会影响按类型注入的方式。如果按name注入，则不受影响。

下面是自动注入的例子：

~~~xml
    <bean id="simpleMovieLister" class="com.flydean.beans.SimpleMovieLister" autowire="byType">
    </bean>

    <!--Setter DI -->
    <bean id="movieFinder" class="com.flydean.beans.MovieFinder">
        <property name="name" value="movie"/>
        <property name="number" value="123456"/>
    </bean>
~~~

SimpleMovieLister如下：

~~~java
package com.flydean.beans;

import lombok.Data;

@Data
public class SimpleMovieLister {

    // the SimpleMovieLister has a dependency on the MovieFinder
    private MovieFinder movieFinder;

    // a setter method so that the Spring container can inject a MovieFinder
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // business logic that actually uses the injected MovieFinder is omitted...
}
~~~
在上面的例子中，movieFinder属性将会被自动注入。

## 方法注入

在bean的生命周期不同的时候，如果一个bean要依赖于另外一个bean则可能出现问题。 比如一个单例模式的beanA 依赖于多例模式的beanB。 因为beanA是单例模式的，所以在创建beanA的时候就已经将其依赖的beanB创建了，不可能在每次beanA需要beanB的时候都创建一个新的beanB的实例。

解决方法有很多种，我们一一进行讲解。

**方法1：实现ApplicationContextAware**

如果实现了ApplicationContextAware，则可以通过getBean方法在每次需要beanB的时候，请求他的新的实例，如下：

~~~java

public class CommandManager implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    public Object process(Map commandState) {
        // grab a new instance of the appropriate Command
        Command command = createCommand();
        // set the state on the (hopefully brand new) Command instance
        command.setState(commandState);
        return command.execute();
    }

    protected Command createCommand() {
        // notice the Spring API dependency!
        return this.applicationContext.getBean("command", Command.class);
    }

    public void setApplicationContext(
            ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
~~~

这种方法并不可取的，因为业务代码和Spring框架产生了耦合。方法注入是Spring IoC 容器的一个高级特性，它可以很好的处理这种情况。

**查找方法注入**

查找方法注入是指容器重写container-managed bean上的方法，并返回容器中另一个命名bean。查找通常涉及一个原型bean，如前一节中描述的场景中所示。Spring框架通过使用cglib库中的字节码动态生成覆盖该方法的子类来实现该方法注入。

因为使用了cglib，所以bean不能是final类，方法也不能是final类型。

查找方法不适用于工厂方法，尤其不适用于配置类中的@Bean方法，因为在这种情况下，容器不负责创建实例，因此无法动态创建运行时生成的子类。

下面是一个查找方法的例子：

~~~java
public abstract class CommandManagerB {

    public Object process(Map commandState) {
        // grab a new instance of the appropriate Command interface
        AsyncCommand command = createCommand();
        return null;
    }

    // okay... but where is the implementation of this method?
    public abstract AsyncCommand createCommand();
}
~~~

这里我们定义了一个抽象类，要查找的方法就是createCommand。返回的对象类，如下：

~~~java
public class AsyncCommand {
}
~~~

下面是XML配置文件：

~~~xml
    <!-- a stateful bean deployed as a prototype (non-singleton) -->
    <bean id="myCommand" class="com.flydean.beans.AsyncCommand" scope="prototype">
        <!-- inject dependencies here as required -->
    </bean>

    <!-- commandProcessor uses statefulCommandHelper -->
    <bean id="commandManager" class="com.flydean.beans.CommandManagerB">
        <lookup-method name="createCommand" bean="myCommand"/>
    </bean>
~~~

CommandMangerB每次调用createCommand，都会返回一个新的AsyncCommand实例。

在基于注解的情况下，也可以这样使用：

~~~java
public abstract class CommandManagerC {

    public Object process(Object commandState) {
        Command command = createCommand();
        return command.execute();
    }

    @Lookup("myCommand")
    protected abstract Command createCommand();
}
~~~

其中@Lookup("myCommand") 中的名字也可以省略，则按照默认的类型来解析。

**任意方法替换**

我们甚至可以使用replaced-method替换bean的方法实现。我们有个MyValueCalculator类，有一个我们想重写的方法computeValue。

~~~java
public class MyValueCalculator {

    public String computeValue(String input) {
        // some real code...
        return "abc";
    }

    // some other methods...
}
~~~

一个实现了org.springframework.beans.factory.support.MethodReplacer接口的类提供了新的方法，如下所示：

~~~java
public class ReplacementComputeValue implements MethodReplacer {

    public Object reimplement(Object o, Method m, Object[] args) throws Throwable {
        // get the input value, work with it, and return a computed result
        String input = (String) args[0];
        return "def";
    }
}
~~~

bean的定义如下：
~~~xml
    <bean id="myValueCalculator" class="com.flydean.beans.MyValueCalculator">
        <!-- arbitrary method replacement -->
        <replaced-method name="computeValue" replacer="replacementComputeValue">
            <arg-type>String</arg-type>
        </replaced-method>
    </bean>

    <bean id="replacementComputeValue" class="com.flydean.beans.ReplacementComputeValue"/>
~~~

本章的例子可以参考[bean-di](https://github.com/ddean2009/spring5-core-workshop)中的bean-di部分。


更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-di/)







