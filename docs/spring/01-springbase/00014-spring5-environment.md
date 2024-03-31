---
slug: /spring5-environment
---

# 14. Spring的Environment接口

Spring的Environment接口有两个关键的作用：1. Profile， 2.properties。可以看下该接口的定义：
~~~java
public interface Environment extends PropertyResolver {

	/**
	 * Return the set of profiles explicitly made active for this environment. Profiles
	 * are used for creating logical groupings of bean definitions to be registered
	 * conditionally, for example based on deployment environment. Profiles can be
	 * activated by setting {@linkplain AbstractEnvironment#ACTIVE_PROFILES_PROPERTY_NAME
	 * "spring.profiles.active"} as a system property or by calling
	 * {@link ConfigurableEnvironment#setActiveProfiles(String...)}.
	 * <p>If no profiles have explicitly been specified as active, then any
	 * {@linkplain #getDefaultProfiles() default profiles} will automatically be activated.
	 * @see #getDefaultProfiles
	 * @see ConfigurableEnvironment#setActiveProfiles
	 * @see AbstractEnvironment#ACTIVE_PROFILES_PROPERTY_NAME
	 */
	String[] getActiveProfiles();

	/**
	 * Return the set of profiles to be active by default when no active profiles have
	 * been set explicitly.
	 * @see #getActiveProfiles
	 * @see ConfigurableEnvironment#setDefaultProfiles
	 * @see AbstractEnvironment#DEFAULT_PROFILES_PROPERTY_NAME
	 */
	String[] getDefaultProfiles();

	/**
	 * Return whether one or more of the given profiles is active or, in the case of no
	 * explicit active profiles, whether one or more of the given profiles is included in
	 * the set of default profiles. If a profile begins with '!' the logic is inverted,
	 * i.e. the method will return {@code true} if the given profile is <em>not</em> active.
	 * For example, {@code env.acceptsProfiles("p1", "!p2")} will return {@code true} if
	 * profile 'p1' is active or 'p2' is not active.
	 * @throws IllegalArgumentException if called with zero arguments
	 * or if any profile is {@code null}, empty, or whitespace only
	 * @see #getActiveProfiles
	 * @see #getDefaultProfiles
	 * @see #acceptsProfiles(Profiles)
	 * @deprecated as of 5.1 in favor of {@link #acceptsProfiles(Profiles)}
	 */
	@Deprecated
	boolean acceptsProfiles(String... profiles);

	/**
	 * Return whether the {@linkplain #getActiveProfiles() active profiles}
	 * match the given {@link Profiles} predicate.
	 */
	boolean acceptsProfiles(Profiles profiles);

}
~~~

它继承了PropertyResolver：
~~~java
public interface PropertyResolver {

	/**
	 * Return whether the given property key is available for resolution,
	 * i.e. if the value for the given key is not {@code null}.
	 */
	boolean containsProperty(String key);

	/**
	 * Return the property value associated with the given key,
	 * or {@code null} if the key cannot be resolved.
	 * @param key the property name to resolve
	 * @see #getProperty(String, String)
	 * @see #getProperty(String, Class)
	 * @see #getRequiredProperty(String)
	 */
	@Nullable
	String getProperty(String key);

	/**
	 * Return the property value associated with the given key, or
	 * {@code defaultValue} if the key cannot be resolved.
	 * @param key the property name to resolve
	 * @param defaultValue the default value to return if no value is found
	 * @see #getRequiredProperty(String)
	 * @see #getProperty(String, Class)
	 */
	String getProperty(String key, String defaultValue);

	/**
	 * Return the property value associated with the given key,
	 * or {@code null} if the key cannot be resolved.
	 * @param key the property name to resolve
	 * @param targetType the expected type of the property value
	 * @see #getRequiredProperty(String, Class)
	 */
	@Nullable
	<T> T getProperty(String key, Class<T> targetType);

	/**
	 * Return the property value associated with the given key,
	 * or {@code defaultValue} if the key cannot be resolved.
	 * @param key the property name to resolve
	 * @param targetType the expected type of the property value
	 * @param defaultValue the default value to return if no value is found
	 * @see #getRequiredProperty(String, Class)
	 */
	<T> T getProperty(String key, Class<T> targetType, T defaultValue);

	/**
	 * Return the property value associated with the given key (never {@code null}).
	 * @throws IllegalStateException if the key cannot be resolved
	 * @see #getRequiredProperty(String, Class)
	 */
	String getRequiredProperty(String key) throws IllegalStateException;

	/**
	 * Return the property value associated with the given key, converted to the given
	 * targetType (never {@code null}).
	 * @throws IllegalStateException if the given key cannot be resolved
	 */
	<T> T getRequiredProperty(String key, Class<T> targetType) throws IllegalStateException;

	/**
	 * Resolve ${...} placeholders in the given text, replacing them with corresponding
	 * property values as resolved by {@link #getProperty}. Unresolvable placeholders with
	 * no default value are ignored and passed through unchanged.
	 * @param text the String to resolve
	 * @return the resolved String (never {@code null})
	 * @throws IllegalArgumentException if given text is {@code null}
	 * @see #resolveRequiredPlaceholders
	 * @see org.springframework.util.SystemPropertyUtils#resolvePlaceholders(String)
	 */
	String resolvePlaceholders(String text);

	/**
	 * Resolve ${...} placeholders in the given text, replacing them with corresponding
	 * property values as resolved by {@link #getProperty}. Unresolvable placeholders with
	 * no default value will cause an IllegalArgumentException to be thrown.
	 * @return the resolved String (never {@code null})
	 * @throws IllegalArgumentException if given text is {@code null}
	 * or if any placeholders are unresolvable
	 * @see org.springframework.util.SystemPropertyUtils#resolvePlaceholders(String, boolean)
	 */
	String resolveRequiredPlaceholders(String text) throws IllegalArgumentException;

}
~~~

Profile是一个Bean的逻辑分组，只有在给定的配置文件处于活动状态时，才会在容器中注册。

Properties主要用来从各种源：属性文件、JVM系统属性、系统环境变量、JNDI、servlet上下文参数、特殊属性对象、映射对象等读取属性的定义。

## Profiles

在开发中，我们可以需要在不同的环境定义不同的配置，例如：

* 在开发中处理内存中的数据源，而不是在QA或生产中从JNDI中查找相同的数据源。
* 仅在将应用程序部署到性能环境中时注册监控基础结构。
* 为客户A和客户B部署注册定制的bean实现。

假如我们有两个数据源，一个是在测试环境使用，一个是在线上环境使用，则可以通过profile来指定不同的环境。如下所示：
~~~java
@Configuration
@Profile("development")
public class StandaloneDataConfig {

    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.HSQL)
                .addScript("classpath:com/bank/config/sql/schema.sql")
                .addScript("classpath:com/bank/config/sql/test-data.sql")
                .build();
    }
}
~~~

~~~java
@Configuration
@Profile("production")
public class JndiDataConfig {

    @Bean(destroyMethod="")
    public DataSource dataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
~~~

@Profile里面的表达式可以是简单的字符串，也可以支持运算符，如：

* ! 逻辑非
* & 逻辑与
* | 逻辑或

可以将@Profile用作元注解，以创建自定义组合注解。以下示例定义了一个自定义的@Production注解，您可以将其用作@Profile（“production”）的替换：

~~~java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Profile("production")
public @Interface Production {
}
~~~

@Profile也可以用在方法级别用来包含一个特殊的bean或者配置类。如下所示：

~~~java
@Configuration
public class AppConfig {

    @Bean("dataSource")
    @Profile("development") 
    public DataSource standaloneDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .addScript("classpath:com/bank/config/sql/test-data.sql")
            .build();
    }

    @Bean("dataSource")
    @Profile("production") 
    public DataSource jndiDataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
~~~

**Profiles在XML中使用**

可以在XML中使用profile属性，如下所示：

~~~xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:jdbc="http://www.springframework.org/schema/jdbc"
    xmlns:jee="http://www.springframework.org/schema/jee"
    xsi:schemaLocation="...">

    <!-- other bean definitions -->

    <beans profile="development">
        <jdbc:embedded-database id="dataSource">
            <jdbc:script location="classpath:com/bank/config/sql/schema.sql"/>
            <jdbc:script location="classpath:com/bank/config/sql/test-data.sql"/>
        </jdbc:embedded-database>
    </beans>

    <beans profile="production">
        <jee:jndi-lookup id="dataSource" jndi-name="java:comp/env/jdbc/datasource"/>
    </beans>
</beans>
~~~

**激活Profile**

上面我们定义好了Profile，但是怎么激活他们？

激活一个概要文件可以用几种方法完成，但最简单的方法是通过应用程序上下文提供的环境API以编程方式完成。以下示例显示了如何执行此操作：
~~~java
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
        ctx.getEnvironment().setActiveProfiles("development");
        ctx.register(AppConfig.class, StandaloneDataConfig.class, JndiDataConfig.class);
        ctx.refresh();
    }
~~~

此外，还可以通过spring.profiles.active属性声明性地激活概要文件，该属性可以通过系统环境变量、jvm系统属性、web.xml中的servlet上下文参数指定，甚至可以作为JNDI中的条目指定.
如下所示：

>-Dspring.profiles.active="profile1,profile2"

你也可以同时激活多个pofile

>ctx.getEnvironment().setActiveProfiles("profile1", "profile2");

**默认Profile**

默认的Profile表示该Profile默认被激活，如下所示：
~~~java
@Configuration
@Profile("default")
public class DefaultDataConfig {

    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .build();
    }
}
~~~

如果没有Profile被激活，那么dataSource就会被创建，你可以看成创建bean的默认方式。如果其他的Profile被激活了，那么默认的Profile就不会被使用。

您可以在环境中使用SetDefaultProfiles（）更改默认profile的名称，或者声明性地使用spring.profiles.default属性更改默认概要文件的名称。

## PropertySource

下面是使用PropertySource的例子：
~~~java
    public static void main(String[] args) {
        ApplicationContext ctx = new GenericApplicationContext();
        Environment env = ctx.getEnvironment();
        boolean containsMyProperty = env.containsProperty("my-property");
        System.out.println("Does my environment contain the 'my-property' property? " + containsMyProperty);
    }
~~~

这里Spring查询是否定义了my-property属性，这里的StandardEnvironment定义了两组PropertySource对象进行查询，

~~~java
	/** System environment property source name: {@value}. */
	public static final String SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME = "systemEnvironment";

	/** JVM system properties property source name: {@value}. */
	public static final String SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME = "systemProperties";
~~~

一个表示一组JVM系统属性（System.GetProperties（）），另一个表示一组系统环境变量（System.getEnv（））。

对于常见的StandardServletEnvironment，property的查询优先级如下：

* ServletConfig参数（如果适用-例如，对于DispatcherServlet上下文）
* ServletContext参数（web.xml context-param 项）
* JNDI环境变量（Java:COMP/Env/条目）
* JVM系统属性（-d命令行参数）
* JVM系统环境（操作系统环境变量）

## 使用@PropertySource

@PropertySource注解提供了方便和声明式的机制为Spring的添加PropertySource.

下面的@Configuration类使用@PropertySource 来调用testBean.getName() 返回 myTestBean：

~~~java
@Configuration
@PropertySource("classpath:app.properties")
public class PropertiesConfig {


    @Autowired
    Environment env;

    @Bean
    public TestBean testBean() {
        TestBean testBean = new TestBean();
        testBean.setName(env.getProperty("testbean.name"));
        return testBean;
    }
}
~~~

@Propertysource资源位置中存在的任何$…占位符将根据已针对环境注册的属性源集进行解析，如下示例所示：

~~~java
@PropertySource("classpath:/com/${my.placeholder:default/path}/app.properties")
~~~

假设my.placeholder存在于已注册的某个属性源中（例如，系统属性或环境变量），则将占位符解析为相应的值。如果不是，则default/path用作默认值。如果未指定默认值且无法解析属性，则将引发IllegalArgumentException。

本节的例子可以参考[Environment](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-environment/)
