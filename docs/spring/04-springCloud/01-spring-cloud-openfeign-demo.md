---
slug: /spring-cloud-openfeign-demo
---

# 1. Spring Cloud OpenFeign Demo

之前项目中需要在Spring Cloud中使用OpenFeign的情况，Spring Cloud的版本是目前最新的Greenwich.SR2版本，对应的Spring boot是2.1.7.RELEASE。

在网上找了很多资料，大多言之不详，并且版本也比较低，不适合我的最新版本Spring Cloud的需求。 所以决定还是自己写个教程。

本教程要解决如下几个问题：

1. 怎么配置OpenFeignServer
2. 怎么配置OpenFeignClient
3. 多个参数传递问题
4. FeignClient的日志问题
5. 多个FeignClient使用同一个name的问题

## 怎么配置OpenFeignServer

我们知道OpenFeign是用在Spring Cloud中的声明式的web service client。

OpenFeignServer就是一个普通的Rest服务，不同的是我们需要将他注册到eureka server上面，方便后面的OpenFeignClient调用。

启动类如下：

~~~java
@SpringBootApplication
@EnableDiscoveryClient
public class OpenFeignServer {
        public static void main(String[] args) {
            SpringApplication.run(OpenFeignServer.class, args);
    }
}
~~~

我们定义了两个Rest服务:

OrderController:

~~~java
@Slf4j
@RestController
@RequestMapping(path = "/order")
public class OrderController {

    /**
     * PostMapping with @RequestBody
     * @param user
     */
    @PostMapping("doOrder")
    public void doOrder(@RequestBody User user){
        log.info("do order !!!!");
    }
}
~~~

UserController:

~~~java
@RestController
@RequestMapping(path = "/user")
public class UserController {

    /**
     * GetMapping example with @RequestParam
     * @param userId
     * @return userName
     */
    @GetMapping("getUserName")
    public String getUserName(@RequestParam("userId") String userId){
        if("100".equals(userId)) {
            return "张学友";
        }else{
            return "刘德华";
        }
    }

    /**
     * GetMapping example with @RequestParam and @SpringQueryMap
     * @param userId
     * @param user
     * @return userAge
     */
    @GetMapping("getUserAge")
    public String getUserAge(@RequestParam("userId") String userId, @SpringQueryMap User user){
        if("100".equals(userId)) {
            return "20";
        }else{
            return "18";
        }
    }
}
~~~

我们将其注册到eureka上面，名字为openfeign-server

~~~xml
spring:
  application:
    name: openfeign-server
~~~

## 怎么配置OpenFeignClient

OpenFeignClient的pom依赖如下：

~~~xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
~~~

配置OpenFeignClient只需要使用@FeignClient来注解一个interface即可，如下所示：

~~~java
@FeignClient(value = "openfeign-server")
@RequestMapping(path = "/user")
public interface UserClient {

    @GetMapping("getUserName")
    public String getUserName(@RequestParam("userId") String userId);

    @GetMapping("getUserAge")
    public String getUserAge(@RequestParam("userId") String userId, @SpringQueryMap User user);
}
~~~

其中@FeignClient中的value是要调用的服务的注册名，即OpenFeignServer在eureka的注册名。

FeignClient的 Request路径，方式和参数要和被调用的Rest服务保持一致。

这样我们就可以像下面一样来调用OpenFeignClient了：

~~~java
@Slf4j
@RestController
public class UserController {

    @Autowired
    private UserClient userClient;

    @GetMapping("getUserName2")
    public void getUserName(){
        log.info(userClient.getUserName("100"));
    }
}
~~~

## 多个参数传递问题

一般我们会使用@GetMapping和@PostMapping两种方式来调用Rest服务。

而接收的参数则会使用@RequestParam和@RequestBody来获取。

首先我们讲一下@RequestBody，@RequestBody只能用在Post请求，并且一个Post请求只能有一个@RequestBody。 @RequestBody的参数可以包括复杂类型。

然后我们讲一下@RequestParam，@RequestParam可以用在Post和Get请求中，但是要注意：@RequestParam 的参数只能是基本类型或者Enum，或者List和Map（List和Map里面也只能是基本类型）。所以@RequestParam可以和@RequestBody一起使用。

如果我们是Get请求，但是又有复合类型怎么办？ 比如我们想传递一个User对象。User对象里面只有普通的两个String属性。 这里我们可以使用@SpringQueryMap：

~~~java
    @GetMapping("getUserAge")
    public String getUserAge(@RequestParam("userId") String userId, @SpringQueryMap User user);
~~~

注意：@SpringQueryMap后面的参数只能是普通的POJO，不能是复合类型，否则解析不了。如果必须使用复合类型，那么使用@RequestBody吧。

## FeignClient的日志问题

OpenFeign的Logger.Level有4种级别：

* NONE 没有日志
* BASIC 请求方法，请求URL，返回Code和执行时间
* HEADERS 请求和返回的头部基本信息
* FULL 请求和返回的头部，内容，元数据

要想使用这些级别，必须将OpenFeignClient的logger设置成debug级别：

~~~xml
#日志配置
logging:
  level:
    com:
      flydean: debug
~~~

同时我们在代码中配置OpenFeign的日志级别：

~~~java
@Configuration
public class CustFeignLogConfig {
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}
~~~

这样我们在日志里面就可以看到DEBUG的所有HTTP请求信息。

## 多个FeignClient使用同一个name的问题

其实这里我们的Server定义了两个Rest服务，User和Order。

上面我们讲到了可以这样定义UserClient：

~~~java
@FeignClient(value = "openfeign-server")
@RequestMapping(path = "/user")
public interface UserClient {
    ...
}
~~~

如果我们同样的这样定义OrderClient：

~~~java
@FeignClient(value = "openfeign-server")
@RequestMapping(path = "/order")
public interface OrderClient {
    ...
}
~~~

运行时候就会报错。 原因是两个FeignClient使用了同一个value！

那怎么解决这个问题呢？

~~~java
/**
 * 因为@FeignClient的value不能重复，所以需要在这里以自定义的方式来创建
 * @author wayne
 * @version FeignClientController,  2019/9/5 7:07 下午
 */
@Data
@Component
@Import(FeignClientsConfiguration.class)
public class FeignClientController {

    private OrderClient orderClient;
    private UserClient userClient;

    public FeignClientController(Decoder decoder, Encoder encoder, Client client, Contract contract) {
        this.orderClient = Feign.builder().client(client)
                .encoder(encoder)
                .decoder(decoder)
                .contract(contract)
                //默认是Logger.NoOpLogger
                .logger(new Slf4jLogger(OrderClient.class))
                //默认是Logger.Level.NONE
                .logLevel(Logger.Level.FULL)
                .target(OrderClient.class, "http://openfeign-server");

        this.userClient = Feign.builder().client(client)
                .encoder(encoder)
                .decoder(decoder)
                .contract(contract)
                //默认是Logger.NoOpLogger
                .logger(new Slf4jLogger(UserClient.class))
                //默认是Logger.Level.NONE
                .logLevel(Logger.Level.FULL)
                .target(UserClient.class, "http://openfeign-server");
    }
}
~~~

方法就是手动创建FeignClient, 上面的例子中，我们手动创建了OrderClient和UserClient两个FeignClient。

注意下面的代码片段，手动创建的FeignClient默认是没有logger和logLevel的。所以上面我们配置好的log信息对手动创建的FeignClient是无效的。 下面展示了如何手动添加：

~~~java
//默认是Logger.NoOpLogger
                .logger(new Slf4jLogger(OrderClient.class))
                //默认是Logger.Level.NONE
                .logLevel(Logger.Level.FULL)
~~~

## 如何运行

本项目的模块都是以spring boot构建的，直接在编译器中运行Main方法即可启动。

1. 启动openfeign-registry-server

openfeign-registry-server会启动eureka server,供后面的OpenFeignServer和OpenFeignClient注册。

2. 启动openfeign-server

3. 启动openfeign-client

4. 测试openFeignClient

get请求url：  http://localhost:8000/getUserName1

查看日志，看看输出吧。

本项目代码地址 ：[spring-cloud-openfeign-demo](https://github.com/ddean2009/spring-cloud-openfeign-demo)
