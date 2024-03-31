---
slug: /springboot-ConfigurationProperties
---

# 23. SpringBoot @ConfigurationProperties详解

## 简介

本文将会详细讲解@ConfigurationProperties在Spring Boot中的使用。

## 添加依赖关系

首先我们需要添加Spring Boot依赖：

~~~xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
~~~


## 一个简单的例子

@ConfigurationProperties需要和@Configuration配合使用，我们通常在一个POJO里面进行配置：

~~~java
@Data
@Configuration
@ConfigurationProperties(prefix = "mail")
public class ConfigProperties {

    private String hostName;
    private int port;
    private String from;
}
~~~

上面的例子将会读取properties文件中所有以mail开头的属性，并和bean中的字段进行匹配：

~~~shell
#Simple properties
mail.hostname=host@mail.com
mail.port=9000
mail.from=mailer@mail.com
~~~

Spring的属性名字匹配支持很多格式，如下所示所有的格式都可以和hostName进行匹配：

~~~shell
mail.hostName
mail.hostname
mail.host_name
mail.host-name
mail.HOST_NAME
~~~

如果你不想使用@Configuration， 那么需要在@EnableConfigurationProperties注解中手动导入配置文件如下：

~~~java
@SpringBootApplication
@EnableConfigurationProperties(ConfigProperties.class)
public class ConfigPropApp {
    public static void main(String[] args) {
        SpringApplication.run(ConfigPropApp.class,args);
    }
}
~~~

我们也可以在@ConfigurationPropertiesScan中指定Config文件的路径:

~~~java
@SpringBootApplication
@ConfigurationPropertiesScan("com.flydean.config")
public class ConfigPropApp {
    public static void main(String[] args) {
        SpringApplication.run(ConfigPropApp.class,args);
    }
}
~~~

这样的话程序只会在com.flydean.config包中查找config文件。

## 属性嵌套

我们可以嵌套class，list，map， 下面我们举个例子，先创建一个普通的POJO：

~~~java
@Data
public class Credentials {
    private String authMethod;
    private String username;
    private String password;
}
~~~

然后创建一个嵌套的配置文件：

~~~java
@Data
@Configuration
@ConfigurationProperties(prefix = "nestmail")
public class NestConfigProperties {
    private String host;
    private int port;
    private String from;
    private List<String> defaultRecipients;
    private Map<String, String> additionalHeaders;
    private Credentials credentials;
}
~~~

对应的属性文件如下：

~~~shell
# nest Simple properties
nestmail.hostname=mailer@mail.com
nestmail.port=9000
nestmail.from=mailer@mail.com

#List properties
nestmail.defaultRecipients[0]=admin@mail.com
nestmail.defaultRecipients[1]=owner@mail.com

#Map Properties
nestmail.additionalHeaders.redelivery=true
nestmail.additionalHeaders.secure=true

#Object properties
nestmail.credentials.username=john
nestmail.credentials.password=password
nestmail.credentials.authMethod=SHA1
~~~

## @ConfigurationProperties和@Bean

@ConfigurationProperties也可以和@Bean一起使用如下所示：

~~~java
@Data
public class Item {
    private String name;
    private int size;
}
~~~

看下怎么使用：

~~~java
@Data
@Configuration
public class BeanConfigProperties {
    @Bean
    @ConfigurationProperties(prefix = "item")
    public Item item() {
        return new Item();
    }
}
~~~

## 属性验证

@ConfigurationProperties可以使用标准的JSR-303格式来做属性验证。我们举个例子：

~~~java
@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "mail")
public class ConfigProperties {

    @NotEmpty
    private String hostName;
    @Min(1025)
    @Max(65536)
    private int port;
    @Pattern(regexp = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,6}$")
    private String from;
}
~~~

如果我们的属性不满足上诉条件，可能出现如下异常：

~~~shell
Binding to target org.springframework.boot.context.properties.bind.BindException: Failed to bind properties under 'mail' to com.flydean.config.ConfigProperties$$EnhancerBySpringCGLIB$$f0f87cb9 failed:

    Property: mail.port
    Value: 0
    Reason: 最小不能小于1025

    Property: mail.hostName
    Value: null
    Reason: 不能为空


Action:

Update your application's configuration


Process finished with exit code 1

~~~



## 属性转换

@ConfigurationProperties也支持多种属性转换，下面我们以Duration和DataSize为例：

我们定义两个Duration的字段：

~~~java
@ConfigurationProperties(prefix = "conversion")
public class PropertyConversion {
 
    private Duration timeInDefaultUnit;
    private Duration timeInNano;
    ...
}
~~~

在属性文件中定义这两个字段：

~~~shell
conversion.timeInDefaultUnit=10
conversion.timeInNano=9ns
~~~

我们看到上面的属性可以带单位的。可选的单位是：ns, us, ms, s, m, h 和 d，分别对应纳秒，微妙，毫秒，秒，分钟，小时和天。默认单位是毫秒。我们也可以在注解中指定单位：

~~~java
@DurationUnit(ChronoUnit.DAYS)
private Duration timeInDays;
~~~

对应的配置文件如下：

~~~shell
conversion.timeInDays=2
~~~

下面我们再看看DataSize怎么使用：

~~~java
private DataSize sizeInDefaultUnit;
 
private DataSize sizeInGB;
 
@DataSizeUnit(DataUnit.TERABYTES)
private DataSize sizeInTB;
~~~

对应的属性文件：

~~~shell
conversion.sizeInDefaultUnit=300
conversion.sizeInGB=2GB
conversion.sizeInTB=4
~~~

Datasize支持B, KB, MB, GB 和TB。

## 自定义Converter

同样的Spring Boot也支持自定义属性转换器。我们先定义一个POJO类：

~~~java
public class Employee {
    private String name;
    private double salary;
}
~~~

对应的属性文件：

~~~shell
conversion.employee=john,2000
~~~

我们需要自己实现一个Converter接口的转换类：

~~~java
@Component
@ConfigurationPropertiesBinding
public class EmployeeConverter implements Converter<String, Employee> {
 
    @Override
    public Employee convert(String from) {
        String[] data = from.split(",");
        return new Employee(data[0], Double.parseDouble(data[1]));
    }
}
~~~

本文的例子可以参看: [https://github.com/ddean2009/learn-springboot2/tree/master/springboot-ConfigurationProperties](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-ConfigurationProperties)

更多教程请参考 [flydean的博客](http://www.flydean.com/springboot-configurationproperties/)



