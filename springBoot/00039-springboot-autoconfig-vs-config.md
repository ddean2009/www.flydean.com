# Spring Boot @EnableAutoConfiguration和@Configuration的区别

在Spring Boot中，我们会使用@SpringBootApplication来开启Spring Boot程序。在之前的文章中我们讲到了@SpringBootApplication相当于@EnableAutoConfiguration，@ComponentScan，@Configuration三者的集合。

其中@Configuration用在类上面，表明这个是个配置类，如下所示：

~~~java
@Configuration
public class MySQLAutoconfiguration {
    ...
}
~~~

而@EnableAutoConfiguration则是开启Spring Boot的自动配置功能。什么是自动配置功能呢？简单点说就是Spring Boot根据依赖中的jar包，自动选择实例化某些配置。

接下来我们看一下@EnableAutoConfiguration是怎么工作的。

先看一下@EnableAutoConfiguration的定义：

~~~java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {

	String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

	/**
	 * Exclude specific auto-configuration classes such that they will never be applied.
	 * @return the classes to exclude
	 */
	Class<?>[] exclude() default {};

	/**
	 * Exclude specific auto-configuration class names such that they will never be
	 * applied.
	 * @return the class names to exclude
	 * @since 1.3.0
	 */
	String[] excludeName() default {};

}
~~~

注意这一行： @Import(AutoConfigurationImportSelector.class) 

AutoConfigurationImportSelector实现了ImportSelector接口，并会在实例化时调用selectImports。下面是其方法：

~~~java
	public String[] selectImports(AnnotationMetadata annotationMetadata) {
		if (!isEnabled(annotationMetadata)) {
			return NO_IMPORTS;
		}
		AutoConfigurationMetadata autoConfigurationMetadata = AutoConfigurationMetadataLoader
				.loadMetadata(this.beanClassLoader);
		AutoConfigurationEntry autoConfigurationEntry = getAutoConfigurationEntry(autoConfigurationMetadata,
				annotationMetadata);
		return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
	}
~~~

这个方法中的getCandidateConfigurations会从类加载器中查找所有的META-INF/spring.factories，并加载其中实现了@EnableAutoConfiguration的类。 有兴趣的朋友可以具体研究一下这个方法的实现。

~~~java
private static Map<String, List<String>> loadSpringFactories(@Nullable ClassLoader classLoader) {
		MultiValueMap<String, String> result = cache.get(classLoader);
		if (result != null) {
			return result;
		}

		try {
			Enumeration<URL> urls = (classLoader != null ?
					classLoader.getResources(FACTORIES_RESOURCE_LOCATION) :
					ClassLoader.getSystemResources(FACTORIES_RESOURCE_LOCATION));
			result = new LinkedMultiValueMap<>();
			while (urls.hasMoreElements()) {
				URL url = urls.nextElement();
				UrlResource resource = new UrlResource(url);
				Properties properties = PropertiesLoaderUtils.loadProperties(resource);
				for (Map.Entry<?, ?> entry : properties.entrySet()) {
					String factoryTypeName = ((String) entry.getKey()).trim();
					for (String factoryImplementationName : StringUtils.commaDelimitedListToStringArray((String) entry.getValue())) {
						result.add(factoryTypeName, factoryImplementationName.trim());
					}
				}
			}
			cache.put(classLoader, result);
			return result;
		}
		catch (IOException ex) {
			throw new IllegalArgumentException("Unable to load factories from location [" +
					FACTORIES_RESOURCE_LOCATION + "]", ex);
		}
	}
~~~



我们再看一下spring-boot-autoconfigure-2.2.2.RELEASE.jar中的META-INF/spring.factories。

spring.factories里面的内容是key=value形式的，我们重点关注一下EnableAutoConfiguration：

~~~java
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration,\
org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration,\
org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration,\
org.springframework.boot.autoconfigure.cloud.CloudServiceConnectorsAutoConfiguration,\
org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration,\
...
~~~

这里只列出了一部分内容，根据上面的代码， 所有的EnableAutoConfiguration的实现都会被自动加载。这就是自动加载的原理了。 

如果我们仔细去看具体的实现：

~~~java
@Configuration(proxyBeanMethods = false)
@AutoConfigureAfter(JmxAutoConfiguration.class)
@ConditionalOnProperty(prefix = "spring.application.admin", value = "enabled", havingValue = "true",
		matchIfMissing = false)
public class SpringApplicationAdminJmxAutoConfiguration {
~~~

可以看到里面使用了很多@Conditional*** 的注解，这种注解的作用就是判断该配置类在什么时候能够起作用。









