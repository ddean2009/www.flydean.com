---
slug: /springboot-admin
---

# 27. Spring Boot Admin的使用

前面的文章我们讲了Spring Boot的Actuator。但是Spring Boot Actuator只是提供了一个个的接口，需要我们自行集成到监控程序中。今天我们将会讲解一个优秀的监控工具Spring Boot Admin。 它采用图形化的界面，让我们的Spring Boot管理更加简单。

先上图给大家看一下Spring Boot Admin的界面：

![](https://img-blog.csdnimg.cn/20200212233941237.png)

从界面上面我们可以看到Spring Boot Admin提供了众多强大的监控功能。那么开始我们的学习吧。

## 配置Admin Server

既然是管理程序，肯定有一个server，配置server很简单，我们添加这个依赖即可：

~~~xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-server</artifactId>
    <version>2.2.2</version>
</dependency>
~~~

同时我们需要在main程序中添加@EnableAdminServer来启动admin server。

~~~java
@EnableAdminServer
@SpringBootApplication
public class SpringBootAdminServerApplication {
 
    public static void main(String[] args) {
        SpringApplication.run(SpringBootAdminServerApplication.class, args);
    }
}
~~~

## 配置admin client

有了server，我们接下来配置需要监控的client应用程序，在本文中，我们自己监控自己，添加client依赖如下：

~~~xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-starter-client</artifactId>
    <version>2.2.2</version>
</dependency>
~~~

我们需要为client指定要注册到的admin server：

~~~txt
spring.boot.admin.client.url=http://localhost:8080
~~~

因为Spring Boot Admin依赖于 Spring Boot Actuator, 从Spring Boot2 之后，我们需要主动开启暴露的主键，如下：

~~~txt
management.endpoints.web.exposure.include=*
management.endpoint.health.show-details=always
~~~

## 配置安全主键

通常来说，我们需要一个登陆界面，以防止未经授权的人访问。spring boot admin提供了一个UI供我们使用，同时我们添加Spring Security依赖：

~~~xml
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>spring-boot-admin-server-ui-login</artifactId>
    <version>1.5.7</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
~~~

添加了Spring Security，我们需要自定义一些配置：

~~~java
@Configuration
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    private final AdminServerProperties adminServer;
 
    public WebSecurityConfig(AdminServerProperties adminServer) {
        this.adminServer = adminServer;
    }
 
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        SavedRequestAwareAuthenticationSuccessHandler successHandler = 
          new SavedRequestAwareAuthenticationSuccessHandler();
        successHandler.setTargetUrlParameter("redirectTo");
        successHandler.setDefaultTargetUrl(this.adminServer.getContextPath() + "/");
 
        http
            .authorizeRequests()
                .antMatchers(this.adminServer.getContextPath() + "/assets/**").permitAll()
                .antMatchers(this.adminServer.getContextPath() + "/login").permitAll()
                .anyRequest().authenticated()
                .and()
            .formLogin()
                .loginPage(this.adminServer.getContextPath() + "/login")
                .successHandler(successHandler)
                .and()
            .logout()
                .logoutUrl(this.adminServer.getContextPath() + "/logout")
                .and()
            .httpBasic()
                .and()
            .csrf()
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers(
                  new AntPathRequestMatcher(this.adminServer.getContextPath() + 
                    "/instances", HttpMethod.POST.toString()), 
                  new AntPathRequestMatcher(this.adminServer.getContextPath() + 
                    "/instances/*", HttpMethod.DELETE.toString()),
                  new AntPathRequestMatcher(this.adminServer.getContextPath() + "/actuator/**"))
                .and()
            .rememberMe()
                .key(UUID.randomUUID().toString())
                .tokenValiditySeconds(1209600);
    }
}
~~~

接下来，我们在配置文件中指定服务器的用户名和密码：

~~~txt
spring.boot.admin.client.username=admin
spring.boot.admin.client.password=admin
~~~

作为一个客户端，连接服务器的时候，我们也需要提供相应的认证信息如下：

~~~txt
spring.boot.admin.client.instance.metadata.user.name=admin
spring.boot.admin.client.instance.metadata.user.password=admin

spring.boot.admin.client.username=admin
spring.boot.admin.client.password=admin
~~~

好了，登录页面和权限认证也完成了。 

## Hazelcast集群

Spring Boot Admin 支持Hazelcast的集群，我们先添加依赖如下：

~~~xml
<dependency>
    <groupId>com.hazelcast</groupId>
    <artifactId>hazelcast</artifactId>
    <version>3.12.2</version>
</dependency>
~~~

然后添加Hazelcast的配置：

~~~java
@Configuration
public class HazelcastConfig {
 
    @Bean
    public Config hazelcast() {
        MapConfig eventStoreMap = new MapConfig("spring-boot-admin-event-store")
          .setInMemoryFormat(InMemoryFormat.OBJECT)
          .setBackupCount(1)
          .setEvictionPolicy(EvictionPolicy.NONE)
          .setMergePolicyConfig(new MergePolicyConfig(PutIfAbsentMapMergePolicy.class.getName(), 100));
 
        MapConfig sentNotificationsMap = new MapConfig("spring-boot-admin-application-store")
          .setInMemoryFormat(InMemoryFormat.OBJECT)
          .setBackupCount(1)
          .setEvictionPolicy(EvictionPolicy.LRU)
          .setMergePolicyConfig(new MergePolicyConfig(PutIfAbsentMapMergePolicy.class.getName(), 100));
 
        Config config = new Config();
        config.addMapConfig(eventStoreMap);
        config.addMapConfig(sentNotificationsMap);
        config.setProperty("hazelcast.jmx", "true");
 
        config.getNetworkConfig()
          .getJoin()
          .getMulticastConfig()
          .setEnabled(false);
        TcpIpConfig tcpIpConfig = config.getNetworkConfig()
          .getJoin()
          .getTcpIpConfig();
        tcpIpConfig.setEnabled(true);
        tcpIpConfig.setMembers(Collections.singletonList("127.0.0.1"));
        return config;
    }
}
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-admin](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-admin)

