---
slug: /springboot-custom-autoconfig
---

# 24. 自定义spring boot的自动配置

上篇文章我们讲了spring boot中自动配置的深刻含义和内部结构，这篇文章我们讲一下怎么写出一个自己的自动配置。为了方便和通用起见，这篇文章将会实现一个mysql数据源的自动配置。

## 添加Maven依赖

我们需要添加mysql和jpa的数据源：

~~~xml
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.18</version>
        </dependency>
    </dependencies>
~~~

## 创建自定义 Auto-Configuration

我们知道 Auto-Configuration实际上就是一种配置好的@Configuration,所以我们需要创建一个MySQL 的@Configuration， 如下：

~~~java
@Configuration
public class MySQLAutoconfiguration {
}
~~~

下一步就是将这个配置类注册到resources下面的/META-INF/spring.factories作为org.springframework.boot.autoconfigure.EnableAutoConfiguration的一个实现：

~~~java
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.flydean.config.MySQLAutoconfiguration
~~~

如果我们希望自定义的@Configuration拥有最高的优先级，我们可以添加@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE) 如下所示：

~~~java
@Configuration
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
public class MySQLAutoconfiguration {
}
~~~

> 注意， 自动配置的bean只有在该bean没有在应用程序中配置的时候才会自动被配置。如果应用程序中已经配置了该bean，则自动配置的bean会被覆盖。

### 添加Class Conditions

我们的mysqlConfig只有在DataSource这个类存在的时候才会被自动配置。则可以使用@ConditionalOnClass。 如果某个类不存在的时候生效则可以使用@ConditionalOnMissingClass。

~~~java
@Configuration
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnClass(DataSource.class)
public class MySQLAutoconfiguration {
}
~~~

### 添加 bean Conditions

如果我们需要的不是类而是bean的实例，则可以使用@ConditionalOnBean 和 @ConditionalOnMissingBean。

在本例中，我们希望当dataSource的bean存在的时候实例化一个LocalContainerEntityManagerFactoryBean：

~~~java
   @Bean
    @ConditionalOnBean(name = "dataSource")
    @ConditionalOnMissingBean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em
                = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource());
        em.setPackagesToScan("com.flydean.config.example");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        if (additionalProperties() != null) {
            em.setJpaProperties(additionalProperties());
        }
        return em;
    }
~~~

同样的，我们可以定义一个transactionManager， 只有当JpaTransactionManager不存在的时候才创建：

~~~java
@Bean
@ConditionalOnMissingBean(type = "JpaTransactionManager")
JpaTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
    JpaTransactionManager transactionManager = new JpaTransactionManager();
    transactionManager.setEntityManagerFactory(entityManagerFactory);
    return transactionManager;
}
~~~

### Property Conditions

如果我们想在Spring配置文件中的某个属性存在的情况下实例化bean，则可以使用@ConditionalOnProperty。 首先我们需要加载这个Spring的配置文件：

~~~java
@PropertySource("classpath:mysql.properties")
public class MySQLAutoconfiguration {
    //...
}
~~~

我们希望属性文件里usemysql=local的时候创建一个DataSource， 则可以这样写：

~~~java
    @Bean
    @ConditionalOnProperty(
            name = "usemysql",
            havingValue = "local")
    @ConditionalOnMissingBean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();

        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost:3306/myDb?createDatabaseIfNotExist=true");
        dataSource.setUsername("mysqluser");
        dataSource.setPassword("mysqlpass");
        return dataSource;
    }
~~~

### Resource Conditions

当我们需要根据resource文件是否存在来实例化bean的时候，可以使用@ConditionalOnResource 。

~~~java
    @ConditionalOnResource(
            resources = "classpath:mysql.properties")
    @Conditional(HibernateCondition.class)
    Properties additionalProperties() {
        Properties hibernateProperties = new Properties();

        hibernateProperties.setProperty("hibernate.hbm2ddl.auto",
                env.getProperty("mysql-hibernate.hbm2ddl.auto"));
        hibernateProperties.setProperty("hibernate.dialect",
                env.getProperty("mysql-hibernate.dialect"));
        hibernateProperties.setProperty("hibernate.show_sql",
                env.getProperty("mysql-hibernate.show_sql") != null
                        ? env.getProperty("mysql-hibernate.show_sql") : "false");
        return hibernateProperties;
    }
~~~

我们需要在mysql.properties添加相应的配置：

~~~java
mysql-hibernate.dialect=org.hibernate.dialect.MySQLDialect
mysql-hibernate.show_sql=true
mysql-hibernate.hbm2ddl.auto=create-drop
~~~

### Custom Conditions

除了使用@Condition** 之外，我们还可以继承SpringBootCondition来实现自定义的condition。 如下所示：

~~~java
public class HibernateCondition extends SpringBootCondition {

    private static String[] CLASS_NAMES
            = { "org.hibernate.ejb.HibernateEntityManager",
            "org.hibernate.jpa.HibernateEntityManager" };

    @Override
    public ConditionOutcome getMatchOutcome(ConditionContext context,
                                            AnnotatedTypeMetadata metadata) {

        ConditionMessage.Builder message
                = ConditionMessage.forCondition("Hibernate");
        return Arrays.stream(CLASS_NAMES)
                .filter(className -> ClassUtils.isPresent(className, context.getClassLoader()))
                .map(className -> ConditionOutcome
                        .match(message.found("class")
                                .items(ConditionMessage.Style.NORMAL, className)))
                .findAny()
                .orElseGet(() -> ConditionOutcome
                        .noMatch(message.didNotFind("class", "classes")
                                .items(ConditionMessage.Style.NORMAL, Arrays.asList(CLASS_NAMES))));
    }
}
~~~

## 测试

接下来我们可以测试了:

~~~java
@RunWith(SpringRunner.class)
@SpringBootTest(
        classes = AutoconfigurationApplication.class)
@EnableJpaRepositories(
        basePackages = { "com.flydean.repository" })
public class AutoconfigurationTest {

    @Autowired
    private MyUserRepository userRepository;

    @Test
    public void whenSaveUser_thenOk() {
        MyUser user = new MyUser("user@email.com");
        userRepository.save(user);
    }
}
~~~

这里我们因为没有自定义dataSource所以会自动使用自动配置里面的mysql数据源。

## 停止自动配置

如果我们不想使用刚刚创建的自动配置该怎么做呢？在@SpringBootApplication中exclude MySQLAutoconfiguration.class即可：

~~~java
@SpringBootApplication(exclude={MySQLAutoconfiguration.class})
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-custom-autoconfig](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-custom-autoconfig)

更多教程请参考 [flydean的博客](http://www.flydean.com)







