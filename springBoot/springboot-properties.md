Spring Boot中的Properties

## 简介

本文我们将会讨怎么在Spring Boot中使用Properties。使用Properties有两种方式，一种是java代码的注解，一种是xml文件的配置。本文将会主要关注java代码的注解。

## 使用注解注册一个Properties文件

注册Properties文件我们可以使用@PropertySource 注解，该注解需要配合@Configuration 一起使用。

~~~java
@Configuration
@PropertySource("classpath:foo.properties")
public class PropertiesWithJavaConfig {
    //...
}
~~~

我们也可以使用placeholder来动态选择属性文件：

~~~java
@PropertySource({ 
  "classpath:persistence-${envTarget:mysql}.properties"
})
~~~

@PropertySource也可以多次使用来定义多个属性文件：

~~~java
@PropertySource("classpath:foo.properties")
@PropertySource("classpath:bar.properties")
public class PropertiesWithJavaConfig {
    //...
}
~~~

我们也可以使用@PropertySources来包含多个@PropertySource：

~~~java
@PropertySources({
    @PropertySource("classpath:foo.properties"),
    @PropertySource("classpath:bar.properties")
})
public class PropertiesWithJavaConfig {
    //...
}
~~~

## 使用属性文件

最简单直接的使用办法就是使用@Value注解：

~~~java
@Value( "${jdbc.url}" )
private String jdbcUrl;
~~~

我们也可以给属性添加默认值：

~~~java
@Value( "${jdbc.url:aDefaultUrl}" )
private String jdbcUrl;
~~~

如果要在代码中使用属性值，我们可以从Environment API中获取：

~~~java
@Autowired
private Environment env;
...
dataSource.setUrl(env.getProperty("jdbc.url"));
~~~

## Spring Boot中的属性文件

默认情况下Spring Boot 会读取application.properties文件作为默认的属性文件。当然，我们也可以在命令行提供一个不同的属性文件：

~~~shell
java -jar app.jar --spring.config.location=classpath:/another-location.properties
~~~

如果是在测试环境中，我们可以使用@TestPropertySource 来指定测试的属性文件：

~~~java
@RunWith(SpringRunner.class)
@TestPropertySource("/foo.properties")
public class FilePropertyInjectionUnitTest {
 
    @Value("${foo}")
    private String foo;
 
    @Test
    public void whenFilePropertyProvided_thenProperlyInjected() {
        assertThat(foo).isEqualTo("bar");
    }
}
~~~

除了属性文件，我们也可以直接以key=value的形式：

~~~java
@RunWith(SpringRunner.class)
@TestPropertySource(properties = {"foo=bar"})
public class PropertyInjectionUnitTest {
 
    @Value("${foo}")
    private String foo;
 
    @Test
    public void whenPropertyProvided_thenProperlyInjected() {
        assertThat(foo).isEqualTo("bar");
    }
}
~~~

使用@SpringBootTest，我们也可以使用类似的功能：

~~~java
@RunWith(SpringRunner.class)
@SpringBootTest(properties = {"foo=bar"}, classes = SpringBootPropertiesTestApplication.class)
public class SpringBootPropertyInjectionIntegrationTest {
 
    @Value("${foo}")
    private String foo;
 
    @Test
    public void whenSpringBootPropertyProvided_thenProperlyInjected() {
        assertThat(foo).isEqualTo("bar");
    }
}
~~~

## @ConfigurationProperties

如果我们有一组属性，想将这些属性封装成一个bean，则可以考虑使用@ConfigurationProperties。 

~~~java
@ConfigurationProperties(prefix = "database")
public class Database {
    String url;
    String username;
    String password;
 
    // standard getters and setters
}
~~~

属性文件如下：

~~~shell
database.url=jdbc:postgresql:/localhost:5432/instance
database.username=foo
database.password=bar
~~~

Spring Boot将会自动将这些属性文件映射成java bean的属性，我们需要做的就是定义好prefix。

## yaml文件

Spring Boot也支持yaml形式的文件，yaml对于层级属性来说更加友好和方便，我们可以看下properties文件和yaml文件的对比：

~~~shell
database.url=jdbc:postgresql:/localhost:5432/instance
database.username=foo
database.password=bar
secret: foo
~~~

~~~shell
database:
  url: jdbc:postgresql:/localhost:5432/instance
  username: foo
  password: bar
secret: foo
~~~

> 注意yaml文件不能用在@PropertySource中。如果你使用@PropertySource，则必须指定properties文件。

## Properties环境变量

我们可以这样传入property环境变量：

~~~shell
java -jar app.jar --property="value"
~~~

~~shell
java -Dproperty.name="value" -jar app.jar
~~~

或者这样：

~~~shell
export name=value
java -jar app.jar
~~~

环境变量有什么用呢？ 当指定了特定的环境变量时候，Spring Boot会自动去加载application-environment.properties文件，Spring Boot默认的属性文件也会被加载，只不过优先级比较低。

## java代码配置

除了注解和默认的属性文件，java也可以使用PropertySourcesPlaceholderConfigurer来在代码中显示加载：

~~~java
@Bean
public static PropertySourcesPlaceholderConfigurer properties(){
    PropertySourcesPlaceholderConfigurer pspc
      = new PropertySourcesPlaceholderConfigurer();
    Resource[] resources = new ClassPathResource[ ]
      { new ClassPathResource( "foo.properties" ) };
    pspc.setLocations( resources );
    pspc.setIgnoreUnresolvablePlaceholders( true );
    return pspc;
}
~~~

本文的例子可以参考：[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-properties](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-properties)

