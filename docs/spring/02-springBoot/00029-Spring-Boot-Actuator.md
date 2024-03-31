---
slug: /Spring-Boot-Actuator
---

# 29. Spring Boot Actuator

Spring Boot Actuator 在Spring Boot第一个版本发布的时候就有了，它为Spring Boot提供了一系列产品级的特性：监控应用程序，收集元数据，运行情况或者数据库状态等。

使用Spring Boot Actuator我们可以直接使用这些特性而不需要自己去实现，它是用HTTP或者JMX来和外界交互。

## 开始使用Spring Boot Actuator 

要想使用Spring Boot Actuator，需要添加如下依赖：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
~~~

## 开始使用Actuator

配好上面的依赖之后，我们使用下面的主程序入口就可以使用Actuator了：

~~~java
@SpringBootApplication
public class ActuatorApp {
    public static void main(String[] args) {
        SpringApplication.run(ActuatorApp.class, args);
    }
}
~~~

启动应用程序，访问http://localhost:8080/actuator：

~~~java
{"_links":{"self":{"href":"http://localhost:8080/actuator","templated":false},"health":{"href":"http://localhost:8080/actuator/health","templated":false},"health-path":{"href":"http://localhost:8080/actuator/health/{*path}","templated":true},"info":{"href":"http://localhost:8080/actuator/info","templated":false}}}
~~~

我们可以看到actuator默认开启了两个入口：/health和/info。

如果我们在配置文件里面这样配置，则可以开启actuator所有的入口：

~~~java
management.endpoints.web.exposure.include=*
~~~

重启应用程序，再次访问http://localhost:8080/actuator：

~~~java
{"_links":{"self":{"href":"http://localhost:8080/actuator","templated":false},"beans":{"href":"http://localhost:8080/actuator/beans","templated":false},"caches-cache":{"href":"http://localhost:8080/actuator/caches/{cache}","templated":true},"caches":{"href":"http://localhost:8080/actuator/caches","templated":false},"health":{"href":"http://localhost:8080/actuator/health","templated":false},"health-path":{"href":"http://localhost:8080/actuator/health/{*path}","templated":true},"info":{"href":"http://localhost:8080/actuator/info","templated":false},"conditions":{"href":"http://localhost:8080/actuator/conditions","templated":false},"configprops":{"href":"http://localhost:8080/actuator/configprops","templated":false},"env":{"href":"http://localhost:8080/actuator/env","templated":false},"env-toMatch":{"href":"http://localhost:8080/actuator/env/{toMatch}","templated":true},"loggers-name":{"href":"http://localhost:8080/actuator/loggers/{name}","templated":true},"loggers":{"href":"http://localhost:8080/actuator/loggers","templated":false},"heapdump":{"href":"http://localhost:8080/actuator/heapdump","templated":false},"threaddump":{"href":"http://localhost:8080/actuator/threaddump","templated":false},"metrics":{"href":"http://localhost:8080/actuator/metrics","templated":false},"metrics-requiredMetricName":{"href":"http://localhost:8080/actuator/metrics/{requiredMetricName}","templated":true},"scheduledtasks":{"href":"http://localhost:8080/actuator/scheduledtasks","templated":false},"mappings":{"href":"http://localhost:8080/actuator/mappings","templated":false}}}
~~~

我们可以看到actuator暴露的所有入口。

## Health Indicators

Health入口是用来监控组件的状态的，通过上面的入口，我们可以看到Health的入口如下：

~~~java
"health":{"href":"http://localhost:8080/actuator/health","templated":false},"health-path":{"href":"http://localhost:8080/actuator/health/{*path}","templated":true},
~~~

有两个入口，一个是总体的health，一个是具体的health-path。

我们访问一下http://localhost:8080/actuator/health：

~~~java
{"status":"UP"}
~~~

上面的结果实际上是隐藏了具体的信息，我们可以通过设置

~~~java
management.endpoint.health.show-details=ALWAYS
~~~

来开启详情，开启之后访问如下：

~~~java
{"status":"UP","components":{"db":{"status":"UP","details":{"database":"H2","result":1,"validationQuery":"SELECT 1"}},"diskSpace":{"status":"UP","details":{"total":250685575168,"free":12428898304,"threshold":10485760}},"ping":{"status":"UP"}}}
~~~

其中的components就是health-path,我们可以访问具体的某一个components如http://localhost:8080/actuator/health/db: 

~~~java
{"status":"UP","details":{"database":"H2","result":1,"validationQuery":"SELECT 1"}}
~~~

就可以看到具体某一个component的信息。

这些Health components的信息都是收集实现了HealthIndicator接口的bean来的。

我们看下怎么自定义HealthIndicator：

~~~java
@Component
public class CustHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        int errorCode = check(); // perform some specific health check
        if (errorCode != 0) {
            return Health.down()
                    .withDetail("Error Code", errorCode).build();
        }
        return Health.up().build();
    }

    public int check() {
        // Our logic to check health
        return 0;
    }
}
~~~

再次查看http://localhost:8080/actuator/health， 我们会发现多了一个Cust的组件：

~~~java
"components":{"cust":{"status":"UP"} }
~~~

在Spring Boot 2.X之后，Spring添加了React的支持，我们可以添加ReactiveHealthIndicator如下：

~~~java
@Component
public class DownstreamServiceHealthIndicator implements ReactiveHealthIndicator {

    @Override
    public Mono<Health> health() {
        return checkDownstreamServiceHealth().onErrorResume(
                ex -> Mono.just(new Health.Builder().down(ex).build())
        );
    }

    private Mono<Health> checkDownstreamServiceHealth() {
        // we could use WebClient to check health reactively
        return Mono.just(new Health.Builder().up().build());
    }
}
~~~

再次查看http://localhost:8080/actuator/health，可以看到又多了一个组件：

~~~java
"downstreamService":{"status":"UP"}
~~~

## /info 入口

info显示了App的大概信息，默认情况下是空的。我们可以这样自定义：

~~~java
info.app.name=Spring Sample Application
info.app.description=This is my first spring boot application
info.app.version=1.0.0
~~~

查看：http://localhost:8080/actuator/info

~~~java
{"app":{"name":"Spring Sample Application","description":"This is my first spring boot application","version":"1.0.0"}}
~~~

## /metrics入口

/metrics提供了JVM和操作系统的一些信息，我们看下metrics的目录，访问：http://localhost:8080/actuator/metrics：


~~~java
{"names":["jvm.memory.max","jvm.threads.states","jdbc.connections.active","process.files.max","jvm.gc.memory.promoted","system.load.average.1m","jvm.memory.used","jvm.gc.max.data.size","jdbc.connections.max","jdbc.connections.min","jvm.gc.pause","jvm.memory.committed","system.cpu.count","logback.events","http.server.requests","jvm.buffer.memory.used","tomcat.sessions.created","jvm.threads.daemon","system.cpu.usage","jvm.gc.memory.allocated","hikaricp.connections.idle","hikaricp.connections.pending","jdbc.connections.idle","tomcat.sessions.expired","hikaricp.connections","jvm.threads.live","jvm.threads.peak","hikaricp.connections.active","hikaricp.connections.creation","process.uptime","tomcat.sessions.rejected","process.cpu.usage","jvm.classes.loaded","hikaricp.connections.max","hikaricp.connections.min","jvm.classes.unloaded","tomcat.sessions.active.current","tomcat.sessions.alive.max","jvm.gc.live.data.size","hikaricp.connections.usage","hikaricp.connections.timeout","process.files.open","jvm.buffer.count","jvm.buffer.total.capacity","tomcat.sessions.active.max","hikaricp.connections.acquire","process.start.time"]}
~~~

访问其中具体的某一个组件如下http://localhost:8080/actuator/metrics/jvm.memory.max：

~~~java
{"name":"jvm.memory.max","description":"The maximum amount of memory in bytes that can be used for memory management","baseUnit":"bytes","measurements":[{"statistic":"VALUE","value":3.456106495E9}],"availableTags":[{"tag":"area","values":["heap","nonheap"]},{"tag":"id","values":["Compressed Class Space","PS Survivor Space","PS Old Gen","Metaspace","PS Eden Space","Code Cache"]}]}
~~~

Spring Boot 2.X 的metrics是通过Micrometer来实现的，Spring Boot会自动注册MeterRegistry。 有关Micrometer和Spring Boot的结合使用我们会在后面的文章中详细讲解。


## 自定义Endpoint

Spring Boot的Endpoint也是可以自定义的：

~~~java
@Component
@Endpoint(id = "features")
public class FeaturesEndpoint {

    private Map<String, String> features = new ConcurrentHashMap<>();

    @ReadOperation
    public Map<String, String> features() {
        return features;
    }

    @ReadOperation
    public String feature(@Selector String name) {
        return features.get(name);
    }

    @WriteOperation
    public void configureFeature(@Selector String name, String value) {
        features.put(name, value);
    }

    @DeleteOperation
    public void deleteFeature(@Selector String name) {
        features.remove(name);
    }

}
~~~

访问http://localhost:8080/actuator/， 我们会发现多了一个入口： http://localhost:8080/actuator/features/ 。 

上面的代码中@ReadOperation对应的是GET， @WriteOperation对应的是PUT，@DeleteOperation对应的是DELETE。 

@Selector后面对应的是路径参数， 比如我们可以这样调用configureFeature方法：

~~~shell
POST /actuator/features/abc HTTP/1.1
Host: localhost:8080
Content-Type: application/json
User-Agent: PostmanRuntime/7.18.0
Accept: */*
Cache-Control: no-cache
Postman-Token: dbb46150-9652-4a4a-95cb-3a68c9aa8544,8a033af4-c199-4232-953b-d22dad78c804
Host: localhost:8080
Accept-Encoding: gzip, deflate
Content-Length: 15
Connection: keep-alive
cache-control: no-cache

{"value":true}
~~~

注意，这里的请求BODY是以JSON形式提供的：  

~~~shell
{"value":true}
~~~

请求URL：/actuator/features/abc 中的abc就是@Selector 中的 name。 

我们再看一下GET请求：

http://localhost:8080/actuator/features/

~~~shell
{"abc":"true"}
~~~

这个就是我们之前PUT进去的值。

## 扩展现有的Endpoints

我们可以使用@EndpointExtension （@EndpointWebExtension或者@EndpointJmxExtension）来实现对现有EndPoint的扩展：

~~~java
@Component
@EndpointWebExtension(endpoint = InfoEndpoint.class)
public class InfoWebEndpointExtension {
 
    private InfoEndpoint delegate;
 
    // standard constructor
 
    @ReadOperation
    public WebEndpointResponse<Map> info() {
        Map<String, Object> info = this.delegate.info();
        Integer status = getStatus(info);
        return new WebEndpointResponse<>(info, status);
    }
 
    private Integer getStatus(Map<String, Object> info) {
        // return 5xx if this is a snapshot
        return 200;
    }
}
~~~

上面的例子扩展了InfoEndpoint。 

本文所提到的例子可以参考：[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-actuator](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-actuator)











