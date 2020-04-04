## Spring Cloud sleuth with zipkin over RabbitMQ demo

本项目是sleuth和zipkin在spring cloud环境中使用，其中sleuth和zipkin是通过RabbitMQ进行通信，同时zipkin的数据是存储在mysql中。

Spring Cloud的版本是目前最新的Greenwich.SR2版本，对应的Spring boot是2.1.8.RELEASE。

本教程要解决的问题：

1. zipkin server的搭建（基于mysql和rabbitMQ）
2. 客户端环境的依赖
3. 如何调用

## zipkin server的搭建（基于mysql和rabbitMQ）

最新的zipkin官网建议使用zipkin提供的官方包来启动zipkin server。 步骤如下：

1. 下载最新的zipkin server jar包：

    curl -sSL https://zipkin.io/quickstart.sh | bash -s

2. 配置环境变量，并启动zipkin server，见startServer.sh：

~~~shell
#!/bin/bash

#rabbit mq config
export RABBIT_CONCURRENCY=1
export RABBIT_CONNECTION_TIMEOUT=60000
export RABBIT_QUEUE=zipkin
export RABBIT_ADDRESSES=127.0.0.1:5672
export RABBIT_PASSWORD=guest
export RABBIT_USER=guest
export RABBIT_VIRTUAL_HOST=zipkin
export RABBIT_USE_SSL=false

#mysql config
export STORAGE_TYPE=mysql
export MYSQL_DB=zipkin
export MYSQL_USER=root
export MYSQL_PASS=123456
export MYSQL_HOST=127.0.0.1
export MYSQL_TCP_PORT=3306
export MYSQL_MAX_CONNECTIONS=10
export MYSQL_USE_SSL=false

nohup java -jar zipkin.jar  &

echo $! > pid.txt
~~~

请将rabbit mq 和 mysql 的配置修改成你对应的环境变量。

3. mysql数据库脚本：

[官方脚本地址](https://github.com/openzipkin/zipkin/blob/master/zipkin-storage/mysql-v1/src/main/resources/mysql.sql
)

这里我也列出来了：

~~~sql
--
-- Copyright 2015-2019 The OpenZipkin Authors
--
-- Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
-- in compliance with the License. You may obtain a copy of the License at
--
-- http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software distributed under the License
-- is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
-- or implied. See the License for the specific language governing permissions and limitations under
-- the License.
--

CREATE TABLE IF NOT EXISTS zipkin_spans (
  `trace_id_high` BIGINT NOT NULL DEFAULT 0 COMMENT 'If non zero, this means the trace uses 128 bit traceIds instead of 64 bit',
  `trace_id` BIGINT NOT NULL,
  `id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `remote_service_name` VARCHAR(255),
  `parent_id` BIGINT,
  `debug` BIT(1),
  `start_ts` BIGINT COMMENT 'Span.timestamp(): epoch micros used for endTs query and to implement TTL',
  `duration` BIGINT COMMENT 'Span.duration(): micros used for minDuration and maxDuration query',
  PRIMARY KEY (`trace_id_high`, `trace_id`, `id`)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED CHARACTER SET=utf8 COLLATE utf8_general_ci;

ALTER TABLE zipkin_spans ADD INDEX(`trace_id_high`, `trace_id`) COMMENT 'for getTracesByIds';
ALTER TABLE zipkin_spans ADD INDEX(`name`) COMMENT 'for getTraces and getSpanNames';
ALTER TABLE zipkin_spans ADD INDEX(`remote_service_name`) COMMENT 'for getTraces and getRemoteServiceNames';
ALTER TABLE zipkin_spans ADD INDEX(`start_ts`) COMMENT 'for getTraces ordering and range';

CREATE TABLE IF NOT EXISTS zipkin_annotations (
  `trace_id_high` BIGINT NOT NULL DEFAULT 0 COMMENT 'If non zero, this means the trace uses 128 bit traceIds instead of 64 bit',
  `trace_id` BIGINT NOT NULL COMMENT 'coincides with zipkin_spans.trace_id',
  `span_id` BIGINT NOT NULL COMMENT 'coincides with zipkin_spans.id',
  `a_key` VARCHAR(255) NOT NULL COMMENT 'BinaryAnnotation.key or Annotation.value if type == -1',
  `a_value` BLOB COMMENT 'BinaryAnnotation.value(), which must be smaller than 64KB',
  `a_type` INT NOT NULL COMMENT 'BinaryAnnotation.type() or -1 if Annotation',
  `a_timestamp` BIGINT COMMENT 'Used to implement TTL; Annotation.timestamp or zipkin_spans.timestamp',
  `endpoint_ipv4` INT COMMENT 'Null when Binary/Annotation.endpoint is null',
  `endpoint_ipv6` BINARY(16) COMMENT 'Null when Binary/Annotation.endpoint is null, or no IPv6 address',
  `endpoint_port` SMALLINT COMMENT 'Null when Binary/Annotation.endpoint is null',
  `endpoint_service_name` VARCHAR(255) COMMENT 'Null when Binary/Annotation.endpoint is null'
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED CHARACTER SET=utf8 COLLATE utf8_general_ci;

ALTER TABLE zipkin_annotations ADD UNIQUE KEY(`trace_id_high`, `trace_id`, `span_id`, `a_key`, `a_timestamp`) COMMENT 'Ignore insert on duplicate';
ALTER TABLE zipkin_annotations ADD INDEX(`trace_id_high`, `trace_id`, `span_id`) COMMENT 'for joining with zipkin_spans';
ALTER TABLE zipkin_annotations ADD INDEX(`trace_id_high`, `trace_id`) COMMENT 'for getTraces/ByIds';
ALTER TABLE zipkin_annotations ADD INDEX(`endpoint_service_name`) COMMENT 'for getTraces and getServiceNames';
ALTER TABLE zipkin_annotations ADD INDEX(`a_type`) COMMENT 'for getTraces and autocomplete values';
ALTER TABLE zipkin_annotations ADD INDEX(`a_key`) COMMENT 'for getTraces and autocomplete values';
ALTER TABLE zipkin_annotations ADD INDEX(`trace_id`, `span_id`, `a_key`) COMMENT 'for dependencies job';

CREATE TABLE IF NOT EXISTS zipkin_dependencies (
  `day` DATE NOT NULL,
  `parent` VARCHAR(255) NOT NULL,
  `child` VARCHAR(255) NOT NULL,
  `call_count` BIGINT,
  `error_count` BIGINT,
  PRIMARY KEY (`day`, `parent`, `child`)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED CHARACTER SET=utf8 COLLATE utf8_general_ci;
~~~

在正式环境中，官方推荐的使用Elastricsearch做数据存储，因为zipkin收集的数据会比较多，使用mysql可能会有性能问题。后面有机会我们再讲怎么用Elastricsearch作数据存储。

4. 运行 sh startServer.sh即可启动zipkin server.


## 客户端环境的依赖

如果想要在客户端使用sleuth+ rabbitMQ，需要如下配置：

~~~xml
<dependencyManagement> 
      <dependencies>
          <dependency>
              <groupId>org.springframework.cloud</groupId>
              <artifactId>spring-cloud-dependencies</artifactId>
              <version>${release.train.version}</version>
              <type>pom</type>
              <scope>import</scope>
          </dependency>
      </dependencies>
</dependencyManagement>

<dependency> 
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-zipkin</artifactId>
</dependency>
<dependency> 
    <groupId>org.springframework.amqp</groupId>
    <artifactId>spring-rabbit</artifactId>
</dependency>
~~~

本实例中我们使用了eureka, 其实它不是必须的。大家在实际使用中可以自己取舍。

我们看一下zipkin客户端的配置文件：

~~~xml
spring:
  application:
    name: service2

  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    virtual-host: zipkin
  zipkin:
    sender:
      type: rabbit
    rabbitmq:
      queue: zipkin
  sleuth:
    sampler:
      probability: 1.0
~~~

spring.application.name 很好理解，就是应用程序的名字，会被默认作为zipkin服务的名字。

我们使用rabbitMQ ,所以需要spring.rabbitmq的配置信息。

spring.zipkin.sender.type=rabbit 表示我们需要使用rabbit MQ来收集信息。当然你也可以设置成为web或者kafka。

这里spring.zipkin.rabbitmq.queue=zipkin表示使用MQ时候的queue名字，默认是zipkin。

spring.sleuth.sampler.probability=1.0 这个是采样信息，1.0表示是100%采集。如果要在线上使用，可以自定义这个百分百。

## 如何调用

最后我们看下如何调用。

在service2中，我们定义了如下的方法：

~~~java
@RestController
@RequestMapping("/serviceTwo")
public class ServiceTwoController {

    @GetMapping("callServiceTwo")
    public String callServiceOne(){
        log.info("service two is called!");
        return "service two is called!";
    }
}
~~~

我们在service1中用restTemplet来调用它：

~~~java
@RestController
@RequestMapping("/serviceOne")
public class ServiceOneController {

    @GetMapping("callServiceOne")
    public String callServiceOne(){
        log.info("service one is called!");
        restTemplate().getForObject("http://localhost:9000/serviceTwo/callServiceTwo",String.class);
        return "service one and two are called!";
    }

    @Bean
    RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
~~~

这样，我们用get 去请求http://loalhost/serviceOne/callServiceOne 就会将调用信息发送到MQ，并被zipkin Server 处理。 我们就可以在zipkin web页面看到调用信息啦 。

have fun !

更多教程请参考 [flydean的博客](www.flydean.com)