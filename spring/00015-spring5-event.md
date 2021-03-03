[toc]

Spring提供了很方便的事件的处理机制，包括事件类ApplicationEvent和事件监听类ApplicationListener。 他实现的是设计者模式，如果实现了ApplicationListener接口的bean部署到Spring容器中，则每次ApplicationEvent发布到ApplicationContext时，都会通知该bean。

>从Spring4.2开始，提供了基于注解的事件，即事件对象不一定要从ApplicationEvent来扩展。Spring会自动将其封装成一个事件对象。

下面是Spring的标准事件描述：

Event|解释
-|-
ContextRefreshedEvent|在初始化或刷新ApplicationContext时发布（例如，通过在ConfigurableApplicationContext接口上使用refresh（）方法）。这里，“初始化”意味着加载所有bean，检测并激活后处理器bean，预先实例化单例，并且ApplicationContext对象准备好使用。只要上下文未关闭，只要所选的ApplicationContext实际上支持此类“热”刷新，就可以多次触发刷新。例如，XMLWebApplicationContext支持热刷新，但GenericApplicationContext不支持。
ContextStartedEvent|在可配置的ApplicationContext接口上使用start（）方法启动ApplicationContext时发布。这里，“启动”意味着所有生命周期bean都会收到一个显式的启动信号。通常，此信号用于在显式停止后重新启动bean，但也可以用于启动尚未配置为自动启动的组件（例如，初始化时尚未启动的组件）。
ContextStoppedEvent|在可配置的ApplicationContext接口上使用stop（）方法停止ApplicationContext时发布。这里，“停止”意味着所有生命周期bean都会收到一个明确的停止信号。停止的上下文可以通过start（）调用重新启动。
ContextClosedEvent|在可配置的ApplicationContext接口上使用close（）方法关闭ApplicationContext时发布。这里，“关闭”意味着所有的单例beans都被销毁了。封闭的环境达到了生命的尽头。无法刷新或重新启动。
RequestHandledEvent|一个特定于Web的事件，告诉所有bean HTTP请求已被服务。此事件在请求完成后发布。此事件仅适用于使用Spring的DispatcherServlet的Web应用程序。

## 基于继承的Event

你也可以自定义事件，下面是一个继承ApplicationEvent的例子：

~~~java
public class BlackListEvent extends ApplicationEvent {

    private final String address;
    private final String content;

    public BlackListEvent(Object source, String address, String content) {
        super(source);
        this.address = address;
        this.content = content;
    }
}
~~~

若要发布自定义ApplicationEvent，在ApplicationEventPublisher上调用PublishEvent（）方法。通常可以通过实现ApplicationEventPublisherAware接口来实现，如下所示：

~~~java
public class EmailService implements ApplicationEventPublisherAware {

    private List<String> blackList;
    private ApplicationEventPublisher publisher;

    public void setBlackList(List<String> blackList) {
        this.blackList = blackList;
    }

    public void setApplicationEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void sendEmail(String address, String content) {
        if (blackList.contains(address)) {
            publisher.publishEvent(new BlackListEvent(this, address, content));
            return;
        }
    }
}
~~~

在配置时，Spring容器检测到EmailService实现了ApplicationEventPublisherAware，并自动调用setApplicationEventPublisher（）。实际上，传入的参数是Spring容器本身。您正在通过其applicationEventPublisher接口与应用程序上下文进行交互。

要接收定制的applicationEvent，可以创建一个实现applicationListener的类，并将其注册为SpringBean。下面的示例显示了这样的类：

~~~java
public class BlackListNotifier implements ApplicationListener<BlackListEvent> {

    private String notificationAddress;

    public void setNotificationAddress(String notificationAddress) {
        this.notificationAddress = notificationAddress;
    }

    public void onApplicationEvent(BlackListEvent event) {
        // notify appropriate parties via notificationAddress...
    }
}
~~~

这里使用了ApplicationListener 的BlackListEvent泛型。意味着onApplicationEvent（）方法可以保持类型安全，避免任何向下强制转换的需要。

>但请注意，默认情况下，事件侦听器同步接收事件。这意味着publishEvent（）方法将一直阻塞，直到所有侦听器完成对事件的处理。

下面是注册和配置bean的例子：
~~~xml
<bean id="emailService" class="example.EmailService">
    <property name="blackList">
        <list>
            <value>known.spammer@example.org</value>
            <value>known.hacker@example.org</value>
            <value>john.doe@example.org</value>
        </list>
    </property>
</bean>

<bean id="blackListNotifier" class="example.BlackListNotifier">
    <property name="notificationAddress" value="blacklist@example.org"/>
</bean>
~~~

>Spring的事件机制是为同一应用程序上下文中SpringBean之间的简单通信而设计的。对于更复杂的企业集成需求，可以使用Spring Integration的AMQP模型来处理。

## 基于注解的Event

从Spring4.2开始，您可以使用EventListener注解在托管bean的任何公共方法上注册事件侦听器。BlackListNotifier程序可以改写如下：

~~~java
public class BlackListNotifierAnnotation {

    private String notificationAddress;

    public void setNotificationAddress(String notificationAddress) {
        this.notificationAddress = notificationAddress;
    }

    @EventListener
    public void processBlackListEvent(BlackListEvent event) {
        // notify appropriate parties via notificationAddress...
    }
}
~~~

如果您的方法应该监听多个事件，或者您想要定义它而不使用任何参数，那么也可以在注解本身上指定事件类型。以下示例显示了如何执行此操作：
~~~java
    @EventListener({ContextStartedEvent.class, ContextRefreshedEvent.class})
    public void handleContextStart() {
    }
~~~

还可以使用定义spEL表达式的注解的条件属性添加其他运行时筛选，该表达式应与实际调用特定事件的方法相匹配。

下面的例子显示了如何重写通知程序，以便仅在事件的内容属性等于my-event时调用：
~~~java
    @EventListener(condition = "#blEvent.content == 'my-event'")
    public void processBlackListSPELEvent(BlackListEvent blEvent) {
        // notify appropriate parties via notificationAddress...
    }
~~~

下表列出了上下文可用的项，以便您可以将它们用于条件事件处理：

name|Location|描述|例子
-|-|-|-
Event|root object|真实的ApplicationEvent|#root.event
Arguments array|root object|调用目标的参数|#root.args[0]
Argument name|evaluation context|任何方法参数的名称。如果由于某种原因，名称不可用（例如，因为没有调试信息），参数名称也可以在 #a<#arg>下使用，其中#arg表示参数索引（从0开始）。|#blEvent or #a0 (也可以使用 #p0 or #p<#arg>)

## 异步侦听器

如果希望特定的侦听器异步处理事件，可以重用常规的@Async支持。下面是@Async的例子：
~~~java
    @Async
    @EventListener
    public void processBlackListEvent(BlackListEvent event) {
        // notify appropriate parties via notificationAddress...
    }
~~~

**Listeners排序**

如果需要先调用一个监听器，然后再调用另一个监听器，则可以将@order注解添加到方法声明中，如下所示：
~~~java
    @EventListener
    @Order(12)
    public void processBlackListEvent(BlackListEvent event) {
        // notify appropriate parties via notificationAddress...
    }
~~~

本文的例子可以参考： [event](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-event/)