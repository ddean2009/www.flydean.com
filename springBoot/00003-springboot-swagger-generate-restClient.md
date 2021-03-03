# Spring Boot中使用Swagger CodeGen生成REST client

Swagger是一个非常好用的API工具，我们会使用Swagger来暴露API给外界测试，那么有没有简单的办法来生成对应的调client呢？ 

Swagger CodeGen是一个REST 客户端生成工具，它可以从Open API的规范定义文件中生成对应的REST Client代码。本文我们将会举例说明如何通过OpenAPI 规范定义文件自动生成REST Client。

## 什么是Open API规范定义文件呢？ 

OpenAPI规范（OAS）为RESTful API定义了一个与语言无关的标准接口，使人类和计算机都可以发现和理解服务的功能，而无需访问源代码，文档或通过网络流量检查。 正确定义后，使用者可以使用最少的实现逻辑来理解远程服务并与之交互。

然后，文档生成工具可以使用OpenAPI定义来显示API，代码生成工具可以使用各种编程语言，测试工具和许多其他用例来生成服务器和客户端。

值得一提的是OpenAPI规范最早也是Swagger提出来的，后面被捐赠给了社区。

推荐的OpenAPI 文档名字通常为openapi.json 或者 openapi.yaml。

我们看一个swagger自带的 petstore open api 例子： https://petstore.swagger.io/v2/swagger.json

~~~json
 {
  "swagger": "2.0",
  "info": {
    "description": "This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key `special-key` to test the authorization filters.",
    "version": "1.0.3",
    "title": "Swagger Petstore",
    "termsOfService": "http://swagger.io/terms/",
    "contact": {
      "email": "apiteam@swagger.io"
    },
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    }
  },
  "host": "petstore.swagger.io",
  "basePath": "/v2",
  "tags": [
     ...
  ],
  "schemes": [
    "https",
    "http"
  ],
  "paths": {
    ...
       
  "definitions": {
     ...
     
  },
  "externalDocs": {
    "description": "Find out more about Swagger",
    "url": "http://swagger.io"
  }
}
~~~

我们可以看到在这个open API 定义文件里面包含了我们在swagger界面上看到的一切，paths，definitions等。

## 生成Rest Client

有了Open Api定义文件之后，我们就可以使用 swagger-codegen-cli 来生成对应的rest client文件了。

目前为止，最新的swagger-codegen-cli版本是2.4.12， 我们可以从这里下载 https://search.maven.org/classic/remotecontent?filepath=io/swagger/swagger-codegen-cli/2.4.12/swagger-codegen-cli-2.4.12.jar。 

下载到本地之后，我们可以通过如下命令来生成rest client：

~~~shell
java -jar swagger-codegen-cli-2.4.12.jar generate \
  -i http://petstore.swagger.io/v2/swagger.json \
  --api-package com.flydean.client.api \
  --model-package com.flydean.client.model \
  --invoker-package com.flydean.client.invoker \
  --group-id com.flydean \
  --artifact-id springboot-generate-restclient \
  --artifact-version 0.0.1-SNAPSHOT \
  -l java \
  --library resttemplate \
  -o springboot-generate-restclient
~~~

上述的参数包含：

* -i 指定了open api 定义文件的地址
* –api-package, –model-package, –invoker-package 指定了生成文件的package
* –group-id, –artifact-id, –artifact-version 指定生成的maven 项目的属性
* -l 指明生成的代码编程语言
* –library 指定了实际的实现框架
* -o 指定输出文件目录

Swagger Codegen 支持如下的Java 库：

* jersey1 – Jersey1 + Jackson
* jersey2 – Jersey2 + Jackson
* feign – OpenFeign + Jackson
* okhttp-gson – OkHttp + Gson
* retrofit (Obsolete) – Retrofit1/OkHttp + Gson
* retrofit2 – Retrofit2/OkHttp + Gson
* rest-template – Spring RestTemplate + Jackson
* rest-easy – Resteasy + Jackson

## 在Spring Boot中使用

我们把生成的代码拷贝到我们的Spring Boot项目中。然后通过下面的代码来启动应用程序:

~~~java
@SpringBootApplication
public class GenerateClientApp {

    public static void main(String[] args) {
        SpringApplication.run(GenerateClientApp.class, args);
    }


    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

}
~~~

我们再定义一个controller：

~~~java
@RestController
public class PetController {

    @Autowired
    private PetApi petApi;

    @GetMapping("/api/findAvailablePets")
    public List<Pet> findAvailablePets() {
        return petApi.findPetsByStatus(Arrays.asList("available"));
    }
}
~~~

现在通过curl localhost:8080/api/findAvailablePets就可以远程调用http://petstore.swagger.io/v2/swagger.json 里面暴露的接口了。

##  API Client 配置

默认情况下ApiClient是默认的不需要认证的，如果需要认证，可以自定义ApiClient如下：

~~~java
@Bean
public ApiClient apiClient() {
    ApiClient apiClient = new ApiClient();
 
    OAuth petStoreAuth = (OAuth) apiClient.getAuthentication("petstore_auth");
    petStoreAuth.setAccessToken("special-key");
 
    return apiClient;
}
~~~

## 使用Maven plugin

除了使用cli命令之外，我们还可以在pom中添加plugin来实现这个功能：

~~~xml
<build>
    <plugins>
    <plugin>
        <groupId>io.swagger</groupId>
        <artifactId>swagger-codegen-maven-plugin</artifactId>
        <version>2.4.12</version>
        <executions>
            <execution>
                <goals>
                    <goal>generate</goal>
                </goals>
                <configuration>
                    <inputSpec>swagger.json</inputSpec>
                    <language>java</language>
                    <library>resttemplate</library>
                </configuration>
            </execution>
        </executions>
    </plugin>
    </plugins>
    </build>
~~~

## 在线生成API

我们可以通过http://generator.swagger.io来在线生成API代码：

~~~shell
curl -X POST -H "content-type:application/json" \
-d '{"swaggerUrl":"http://petstore.swagger.io/v2/swagger.json"}' \
http://generator.swagger.io/api/gen/clients/java
~~~

该命令会返回一个包含代码的zip包供你下载。

本文的例子可以参考 [https://github.com/ddean2009/learn-springboot2/tree/master/springboot-generate-restclient](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-generate-restclient)

更多教程请参考 [flydean的博客](www.flydean.com)