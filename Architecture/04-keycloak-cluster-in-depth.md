架构之:keycloak集群化的思考

# 简介

单体服务如果想要突破到高并发服务就需要升级为集群服务。同时集群化也为高可用打下了坚实的基础。纵观现在比较流行的服务或者中间件，不管是RabbitMQ还是redis都提供了集群的功能。

作为硬核工业代表的wildfly也不例外，最近研究了一下keycloak的集群,发现它的底层服务器用的也是wildfly,本文将会和大家探讨一下keycloak的集群的架构思路。

# keycloak中的集群

我们知道，keycloak中有两种模式，一种叫做Standalone,一种叫做domain。

这两种模式的区别只是在于部署文件是否被集中管理，如果部署文件需要一个一个的手动拷贝，那么就是standalone模式。如果是一键化的自动安装，那么就是domain模式。

standalone模式下有一个配置文件叫做 /standalone/configuration/standalone-ha.xml，这个就是在standalone模式下配置集群的xml文件了。

而domain模式下，配置文件都是在domain controller这个机子上进行配置的，具体的文件是 domain/configuration/domain.xml 。

我们看下ha具体是用的集群相关的组件：

~~~xml
<profile name="full-ha">
...
<subsystem xmlns="urn:jboss:domain:modcluster:5.0">
                <proxy name="default" advertise-socket="modcluster" listener="ajp">
                    <dynamic-load-provider>
                        <load-metric type="cpu"/>
                    </dynamic-load-provider>
                </proxy>
</subsystem>

<subsystem xmlns="urn:jboss:domain:infinispan:11.0">
...
</subsystem>

<subsystem xmlns="urn:jboss:domain:jgroups:8.0">
                <channels default="ee">
                    <channel name="ee" stack="udp" cluster="ejb"/>
                </channels>
                <stacks>
                    <stack name="udp">
                       ...
                    </stack>
                    <stack name="tcp">
                       ...
                    </stack>
                </stacks>
            </subsystem>
...
</profile>
~~~

主要用的是modcluster，infinispan和jgroups。

除此之外，keycloak还介绍了一种叫做跨数据中心的集群

![](https://img-blog.csdnimg.cn/20201021172024562.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这种模式主要用在服务是跨数据中心的情况，比如说异地机房这样的容灾性特别强的情况。

看完keycloak的基本集群搭建之后，我们来讲一下keycloak集群中一些比较关键的概念和使用。

# load balancing负载均衡

因为是集群结构，所以我们后端是有多台服务器的，那么用户通过客户端来访问我们服务的时候，究竟应该定位到哪一台服务器呢？

这时就要用到负载均衡软件了，也就是load balancing。

一般来说三种负载均衡的方式：

第一种，就是客户端负载均衡，客户端已经知道了服务端的多个服务地址，在发送请求的时候由客户端自行选择要请求的服务地址。

这种模式一般都要配置一个强力的客户端API，通过这个客户端API来进行路由功能，比如说Memcached。

Memcached的神奇来自两阶段哈希(two-stagehash)。Memcached就像一 个巨大的、存储了很多&lt;key,value>对的哈希表。通过key，可以存储或查询任意的数据。

客户端可以把数据存储在多台memcached上。当查询数据时，客户端首 先参考节点列表计算出key的哈希值(阶段一哈希)，进而选中一个节点;客户端将请求发送给选中的节点，然后memcached节点通过一个内部的哈希算法(阶段二哈希)，查找真正的数据(item)。

第二种，就是代理服务负载均衡，这种模式下，会有一个代理服务器和后端的多个服务进行连接，客户端是和这个代理服务器进行交互，由代理服务器来代替客户端选择到底要路由到哪个服务。

这种代理的路由的软件就多了，比如我们熟悉的nginx和HTTPD，还有ildFly with mod_cluster, HA Proxy, 或者其他的硬件负载均衡。

第三种，是路由负载均衡，在这种模式下，用户随机选择一个后端服务器进行请求连接，然后在服务器内部进行路由，将这个请求发送到其他的服务器中。

这种模式下，一般需要在服务器内部实现特定的负载均衡功能。

## 暴露客户端IP地址

不管使用的是什么模式的负载均衡，我们都有可能在业务中需要使用到客户访问的IP地址。

我们在特定的业务中需要获取到用户的ip地址来进行一些操作，比如记录用户的操作日志，如果不能够获取到真实的ip地址的话，则可能使用错误的ip地址。还有就是根据ip地址进行的认证或者防刷工作。

如果我们在服务之前使用了反向代理服务器的话，就会有问题。所以需要我们配置反向代理服务器，保证X-Forwarded-For和X-Forwarded-Proto这两个HTTP header的值是有效的。

然后服务器端就可以从X-Forwarded-For获取到客户的真实ip地址了。

在keycloak中，如果是http forwarding，则可以这样配置：

~~~xml
<subsystem xmlns="urn:jboss:domain:undertow:10.0">
   <buffer-cache name="default"/>
   <server name="default-server">
      <ajp-listener name="ajp" socket-binding="ajp"/>
      <http-listener name="default" socket-binding="http" redirect-socket="https"
          proxy-address-forwarding="true"/>
      ...
   </server>
   ...
</subsystem>
~~~

如果是AJP forward， 比如使用的是Apache HTTPD + mod-cluster， 则这样配置：

~~~xml
<subsystem xmlns="urn:jboss:domain:undertow:10.0">
     <buffer-cache name="default"/>
     <server name="default-server">
         <ajp-listener name="ajp" socket-binding="ajp"/>
         <http-listener name="default" socket-binding="http" redirect-socket="https"/>
         <host name="default-host" alias="localhost">
             ...
             <filter-ref name="proxy-peer"/>
         </host>
     </server>
        ...
     <filters>
         ...
         <filter name="proxy-peer"
                 class-name="io.undertow.server.handlers.ProxyPeerAddressHandler"
                 module="io.undertow.core" />
     </filters>
 </subsystem>
~~~

## sticky sessions 和 非sticky sessions

如果是在存在session的环境中，比如说web应用程序中，如果后端服务器是cluster的情况下还需要考虑session共享的问题。

因为对于每个服务器来说，它的session都是本地维护的，如果是多台服务器想要session共享该怎么办呢？

一种办法就是所有的服务器都将session存放在同一个外部缓存系统中，比如说redis。这样不管用户访问到哪个server，都可以读取到同一份session数据。

当然，这个缓存系统可以是单点也可以是集群，如果是不同的数据中心的话，缓存集群甚至还需要跨数据中心进行同步。

缓存同步当然是一个很好的办法，但是同步行动自然是有开销的。有没有更加简单方便的处理方式呢？ 比如固定一个用户只访问同一个服务器这样是不是就能解决缓存同步的问题呢？

这种固定用户访问特定某个服务器的模式，我们叫做sticky sessions模式。在这种模式下，可以不用考虑session同步的问题。当然，这种模式下，如果某个服务器down机了，用户的session就会丢失。所以还是要做一些session同步的工作，只不过不需要实时的同步而已。

另外，sticky session还有一个缺点：如果是后台的请求，则获取不到session的信息，也就无法实现sticky session，这个时候就需要进行后台数据的拷贝，这样才能保证不管请求发送到哪里都能够表现一致。

# shared databases

所有的应用都需要保存数据。通常来说，我们会有两种数据：

一种是数据库数据，这种数据将会永久存储用户信息。

一种是cache，用作数据库和应用程序的缓冲。

不管是哪种数据，都可以有集群模式，也就是多台服务器同时读写数据。这样对于共享的数据就涉及到了集群数据更新的问题。

集群数据的更新有两种更新模式：

一种是可靠优先，Active/Active mode，一个节点更新的数据会立马同步到另外一个节点。

一种是性能优先，Active/Passive mode，一个节点更新的数据不会立马同步到另外一个节点中。

可靠优先的运行逻辑是，一个更新请求需要等待所有的集群服务返回更新成功才算成功。而性能优先的运行逻辑就是更新完主数据就算成功了，其他的节点会去异步和主数据节点进行同步。

keycloak中使用的缓存是infinispan，并且构建了多种session缓存，不同的缓存使用的是不同的同步策略：

* authenticationSessions：这个缓存保存的是登录用户的信息，如果在sticky sessions模式下，是不需要进行数据同步的。

* Action tokens：如果用户需要异步的进行邮件验证，比如说忘记密码等操作，则需要用到这种类型的缓存。因为这种操作中的token只能够被使用一次，所以需要数据的同步。

* 非认证的session信息：因为不能保证sticky session模式的使用，所以需要复制。

* loginFailures: 统计用户的登录异常情况，不需要被复制。

在缓存保存数据，需要注意数据更新后的失效问题。

在keycloak中，使用了一个单独的work缓存，这个缓存是所有数据中心同步的，它不存储实际的数据，只存储要无效的数据通知。各个数据的服务从work缓存中读取无效的数据列表，进行相应的数据缓存无效化处理。

# multicasting

最后，如果集群需要动态发现和管理节点的功能的话，还需要进行IP广播。比如说可以使用JGroups来实现这个功能。

# 总结

keycloak的底层是wildfly，本身已经支持很多强大的工业组件，它的设计理念是让程序业务逻辑和其他的通用的生产级特性（高可用，负载均衡，缓存集群，消息队列等）区分开，只用专注于业务逻辑的实现和编写，其他的事情交给服务器去做即可。

大家可以多研究下这些优秀的服务器框架，可以得到一些不同的体会。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
