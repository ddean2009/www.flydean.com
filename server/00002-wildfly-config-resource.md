wildfly 21的配置文件和资源管理 

# 简介

在上一篇文章我们介绍了wildfly 21的基本使用和管理界面。今天我们将会详细讲解一下wildfly的配置文件和资源管理。

# wildfly的配置文件

不管是在standalone还是在domain模式下，有两个配置文件是非常重要的，他们是standalone.xml和domain.xml。

> 其他的standalone-*.xml可以参考standalone.xml来配置

我们看下standalone.xml的大体结构：

~~~xml
<server xmlns="urn:jboss:domain:14.0">
<extensions>
...
</extensions>
<management>
...
</management>
<profile>
...
</profile>
<interfaces>
    ...
</interfaces>
<socket-binding-group name="standard-sockets" default-interface="public" port-offset="${jboss.socket.binding.port-offset:0}">
    ...
</socket-binding-group>
</server>
~~~

server主要有5部分，分别是extensions，management，profile，interfaces和socket-binding-group。

## extensions

extensions表示的是核心应用程序之外的module。因为有了这些外部的module，所以wildfly核心应用程序是非常简单和轻量级的。

这些外部的module是放在modules文件夹的。我们可以通过使用extension标签来引用他们：

~~~xml
<extensions>
    [...]
    <extension module="org.jboss.as.transactions"/>
    <extension module="org.jboss.as.webservices" />
    <extension module="org.jboss.as.weld" />
    [...]
    <extension module="org.wildfly.extension.undertow"/>
</extensions>
~~~

## profile

profile是由多个subsystem组成的。subsystem是通过extension添加到核心服务器的一组新增的功能。

我们看一个profile和subsystem的例子：

~~~xml
<profile>
        <subsystem xmlns="urn:jboss:domain:logging:8.0">
            <console-handler name="CONSOLE">
                <level name="INFO"/>
                <formatter>
                    <named-formatter name="COLOR-PATTERN"/>
                </formatter>
            </console-handler>
            <periodic-rotating-file-handler name="FILE" autoflush="true">
                <formatter>
                    <named-formatter name="PATTERN"/>
                </formatter>
                <file relative-to="jboss.server.log.dir" path="server.log"/>
                <suffix value=".yyyy-MM-dd"/>
                <append value="true"/>
            </periodic-rotating-file-handler>
            <logger category="com.arjuna">
                <level name="WARN"/>
            </logger>
            <logger category="io.jaegertracing.Configuration">
                <level name="WARN"/>
            </logger>
            <logger category="org.jboss.as.config">
                <level name="DEBUG"/>
            </logger>
            <logger category="sun.rmi">
                <level name="WARN"/>
            </logger>
            <root-logger>
                <level name="INFO"/>
                <handlers>
                    <handler name="CONSOLE"/>
                    <handler name="FILE"/>
                </handlers>
            </root-logger>
            <formatter name="PATTERN">
                <pattern-formatter pattern="%d{yyyy-MM-dd HH:mm:ss,SSS} %-5p [%c] (%t) %s%e%n"/>
            </formatter>
            <formatter name="COLOR-PATTERN">
                <pattern-formatter pattern="%K{level}%d{HH:mm:ss,SSS} %-5p [%c] (%t) %s%e%n"/>
            </formatter>
        </subsystem>
</profile>
~~~

上面的代码配置了一个jboss:domain:logging，设置了日志的格式，日志级别等信息。

基本上domain.xml和standalone.xml中的profile的内容是一样的，不同的是domain.xml中可以配置多个profile，而standalone.xml只能有一个profile。

## path

在上面的日志配置中，我们在periodic-rotating-file-handler 中使用了 file的path属性。需要在path属性中指定日志文件的位置。

~~~xml
<file relative-to="jboss.server.log.dir" path="server.log"/>
~~~

这里我们使用的是server.log，实际上wildfly中有很多内置的path变量：

* jboss.home.dir - WildFly的root目录
  
* user.home - 用户的home目录
  
* user.dir - 用户的当前工作目录
  
* java.home - java安装目录
  
* jboss.server.base.dir - server实例的root目录
  
* jboss.server.config.dir - server实例的配置文件目录
  
* jboss.server.data.dir - server实例的数据目录
  
* jboss.server.log.dir - server实例的日志目录
  
* jboss.server.temp.dir - server实例的temp目录
  
* jboss.controller.temp.dir - controller实例的temp目录
  
* jboss.domain.servers.dir - 在managed domain模式下，host controller为servers创建的工作目录

除了最上面的5个路径之外，用户可以自定义或者重写其他的内置路径：

~~~xml
<path name="example" path="example" relative-to="jboss.server.data.dir"/>
~~~

其中name表示的是path的名字，path是路径的值，如果没有relative-to就是绝对路径，带上relative-to就是相对路径。

relative-to表示的是相对路径的基准。

上面的格式只能在standalone.xml文件中使用。如果要在domain.xml中使用则必须下面的格式：

~~~xml
<path name="x"/>
~~~

这里的name只是对host.xml文件中的path定义的一个引用：

~~~xml
<path name="x" path="/var/x" />
~~~

## interface

iterface表示的是网络接口，可以是hostname也可以是IP地址，是给后面的sockets绑定使用的。

我们看一个interface的例子：

~~~xml
    <interfaces>
        <interface name="management">
            <inet-address value="${jboss.bind.address.management:127.0.0.1}"/>
        </interface>
        <interface name="public">
            <inet-address value="${jboss.bind.address:127.0.0.1}"/>
        </interface>
    </interfaces>
~~~

同样的，如果是在domain.xml中的interface标签只能包含name属性：

~~~xml
<interface name="internal"/>
~~~

这个引用是定义在host.xml中的。

## socket-binding

socket-binding定义的是网络的出口，通过指定绑定的ip和接口，最终可通过该地址来访问相应的服务：

~~~xml
    <socket-binding-group name="standard-sockets" default-interface="public" port-offset="${jboss.socket.binding.port-offset:0}">
        <socket-binding name="ajp" port="${jboss.ajp.port:8009}"/>
        <socket-binding name="http" port="${jboss.http.port:8080}"/>
        <socket-binding name="https" port="${jboss.https.port:8443}"/>
        <socket-binding name="management-http" interface="management" port="${jboss.management.http.port:9990}"/>
        <socket-binding name="management-https" interface="management" port="${jboss.management.https.port:9993}"/>
        <socket-binding name="txn-recovery-environment" port="4712"/>
        <socket-binding name="txn-status-manager" port="4713"/>
        <outbound-socket-binding name="mail-smtp">
            <remote-destination host="${jboss.mail.server.host:localhost}" port="${jboss.mail.server.port:25}"/>
        </outbound-socket-binding>
    </socket-binding-group>
~~~

上面的例子中，我们定义了ajp,http,https的地址，并且还有几个管理端，事务，邮件的地址。

注意，我们有一个属性叫做port-offset，这个可以设置标准接口的偏移量，特别方便在标准接口被占用的情况下使用。

比如，我们默认的http端口是8080，如果这个端口已经被占用了，那么我们可以传入一个port-offset= 100，这样http端口就变成了8180,非常方便。

## management

management是对wildfly管理端的配置，我们知道可以通过wildfly的web端或者cli端进行wildfly的管理。

我们看下management的定义：

~~~xml
    <management>
        <security-realms>
            <security-realm name="ManagementRealm">
                <authentication>
                    <local default-user="$local" skip-group-loading="true"/>
                    <properties path="mgmt-users.properties" relative-to="jboss.server.config.dir"/>
                </authentication>
                <authorization map-groups-to-roles="false">
                    <properties path="mgmt-groups.properties" relative-to="jboss.server.config.dir"/>
                </authorization>
            </security-realm>
        </security-realms>
        <audit-log>
            <formatters>
                <json-formatter name="json-formatter"/>
            </formatters>
            <handlers>
                <file-handler name="file" formatter="json-formatter" path="audit-log.log" relative-to="jboss.server.data.dir"/>
            </handlers>
            <logger log-boot="true" log-read-only="false" enabled="false">
                <handlers>
                    <handler name="file"/>
                </handlers>
            </logger>
        </audit-log>
        <management-interfaces>
            <http-interface security-realm="ManagementRealm">
                <http-upgrade enabled="true"/>
                <socket-binding http="management-http"/>
            </http-interface>
        </management-interfaces>
        <access-control provider="simple">
            <role-mapping>
                <role name="SuperUser">
                    <include>
                        <user name="$local"/>
                    </include>
                </role>
            </role-mapping>
        </access-control>
    </management>
~~~

上面的例子中，我们通过management-interfaces指定了管理端的访问地址，和要使用到的安全策略。

在security-realms中，我们可以定义多种security-realm。在security-realm中可以定义用户信息和group信息。

# 资源管理

wildfly提供了两种资源管理的方式，一种就是通过web端http://host:9990/console ，一种就是通过命令行：

~~~sh
./bin/jboss-cli.sh
You are disconnected at the moment. Type 'connect' to connect to the server
or 'help' for the list of supported commands.
[disconnected /]
 
[disconnected /] connect
[standalone@localhost:9990 /]
~~~

web端大家应该都很清楚怎么使用，这里重点介绍一下命令行端的使用情况。

我们通过help --commands可以拿到命令行状态下可以执行的命令：

~~~sh
attachment                              deployment enable-all                   module                                  security enable-http-auth-http-server
batch                                   deployment info                         patch apply                             security enable-http-auth-management
cd                                      deployment list                         patch history                           security enable-sasl-management
clear                                   deployment undeploy                     patch info                              security enable-ssl-http-server
command                                 deployment undeploy-cli-archive         patch inspect                           security enable-ssl-management
command-timeout                         deployment-info                         pwd                                     security reorder-sasl-management
connect                                 deployment-overlay                      quit                                    set
connection-info                         echo                                    read-attribute                          shutdown
data-source                             echo-dmr                                read-operation                          try
deploy                                  for                                     reload                                  undeploy
deployment deploy-cli-archive           grep                                    run-batch                               unset
deployment deploy-file                  help                                    security disable-http-auth-http-server  version
deployment deploy-url                   history                                 security disable-http-auth-management   xa-data-source
deployment disable                      if                                      security disable-sasl-management
deployment disable-all                  jdbc-driver-info                        security disable-ssl-http-server
deployment enable                       ls                                      security disable-ssl-management
~~~

除此之外，命令行还对资源提供了一系列的操作符来对资源进行操作。

在wildfly中，可管理的对象都被看做是一个一个的资源，我们可以通过资源的路径来访问到这个资源。

比如，我想看一下server下面名字是default-server的资源，则可以这样：

~~~
 /server=default-server 
~~~

资源路径可以连写，比如：

~~~
/subsystem=undertow/server=default-server/http-listener=default
~~~

这些都是有效的资源路径。

有了资源路径，我们还需要提供操作符来对资源进行操作，wildfly提供了下面的操作符：

~~~sh
add

read-attribute

read-children-names

read-children-resources

read-children-types

read-operation-description

read-operation-names

read-resource

read-resource-description

remove

validate-address

write-attribute
~~~

我们可以在操作符前面加上冒号，来具体使用他们：

~~~sh
/subsystem=logging:read-operation-names
~~~

上面的例子将会获取对logging子系统的操作符：

~~~sh
{
    "outcome" => "success",
    "result" => [
        "add",
        "list-add",
        "list-clear",
        "list-get",
        "list-log-files",
        "list-remove",
        "map-clear",
        "map-get",
        "map-put",
        "map-remove",
        "query",
        "read-attribute",
        "read-attribute-group",
        "read-attribute-group-names",
        "read-children-names",
        "read-children-resources",
        "read-children-types",
        "read-log-file",
        "read-operation-description",
        "read-operation-names",
        "read-resource",
        "read-resource-description",
        "remove",
        "undefine-attribute",
        "whoami",
        "write-attribute"
    ]
}
~~~

# 总结

本文讲解了wildfly的配置文件和资源管理相关的操作，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！













