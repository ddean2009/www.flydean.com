wildfly 21的domain配置

# 简介

wildfly可以使用Standalone模式或者domain模式启动，standalone模式就很简单了，可以看做是一个单独的服务器。今天我们将会详细讲解一下domain模式。

# wildfly模式简介

wildfly可以在两种模式下面工作，他们是standalone和managed domain。

standalone模式表示的是一个独立的服务器，它们可以通过使用standalone.sh来启动。如果使用的是standalone模式，但是又需要使用多服务器的集群模式，那么需要用户自己在应用层去处理。

如果想中心化管理多个多个服务的话，那么可以用到managed domain模式。

在managed domain模式下，wildfly可以通过一个domain controller来控制和管理其他的domain server。

我们看下managed domain下的服务器部署示意图：

![](https://img-blog.csdnimg.cn/2020101820342738.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上面示意图中，一个host表示的是一个实体或者虚拟机。在一个host中可以部署多个server instances。

我们可以通过domain.sh来启动host controller。

host controller负责启动和停止server服务，并且负责和Domain Controller进行交互。

host controller通过读取domain/configuration/host.xml的配置信息，来进行服务器的配置。

上图中有一个特殊的host controller叫做Domain Controller。Domain Controller负责整个domain的管理工作。

域控制器的主要职责是维护域的中央管理策略，以确保所有主机控制器都知道其当前内容，并协助主机控制器确保根据此策略配置任何正在运行的应用程序服务器实例。 默认情况下，此中央管理策略存储在Domain Controller主机的domain/configuration/domain.xml中。

server group中的一组server都有相同的配置，可以将它们看做是一个。一个 Domain Controller 可以管理多个server group.

我们看一个server group的定义：

~~~js
<server-group name="main-server-group" profile="default">
    <socket-binding-group ref="standard-sockets"/>
    <deployments>
        <deployment name="foo.war_v1" runtime-name="foo.war" />
        <deployment name="bar.ear" runtime-name="bar.ear" />
    </deployments>
</server-group>
~~~

最后一个概念就是server，server表示的是一个运行的应用程序。server和Host Controller 运行在不同的JVM中的，并且server是由Host Controller 来启动的。

> 注意，不管是standalone还是managed domain，这都是取决于你内部的服务是怎么管理的，是一个个单独的部署还是使用中心化的管理方式，他们和外部用户的服务方式是无关的，也就是说不管使用standalone还是managed domain,都可以搭建服务集群。

# domain controller的配置

domain controller是一个中心化的对domain进行管理的服务。我们需要一个host被配置为domain controller，还需要暴露它的管理接口以供被管理的host进行连接。

我们看下一个domain controller的配置：

~~~xml
<domain-controller>
   <local/>
</domain-controller>
~~~

上面的例子中，local表示的是本地host。

如果这个机子被当做是domain controller，那么必须配置和暴露管理接口：

~~~xml
<management-interfaces>
  <native-interface security-realm="ManagementRealm">
    <socket interface="management" port="${jboss.management.native.port:9999}"/>
  </native-interface>
  <http-interface security-realm="ManagementRealm">
    <socket interface="management" port="${jboss.management.http.port:9990}"/>
  </http-interface>
</management-interfaces>
~~~

其中，interface指向的management是在host.xml中配置的：

~~~xml
<interfaces>
   <interface name="management">
       <inet-address value="192.168.0.101"/>
   </interface>
</interfaces>
~~~

默认情况下master domain controller是需要认证才能被访问的，我们需要通过使用add-user来为slave domain controller 创建用户，以连接到master domain controller。

所以，我们在add-user的最后一步，我们需要输入y：

~~~sh
Is this new user going to be used for one AS process to connect to another AS process e.g. slave domain controller?
yes/no? y
To represent the user add the following to the server-identities definition <secret value="cE3EBEkE=" />
~~~

我们需要记住上面的xml格式的secret，以便在后续slave的配置中使用。

# Host controller的配置文件

有了domain controller，我们就可以通过host controller加入存在的domain了。

在做host controller的配置的时候，需要注意，host的逻辑名在一个domain内部必须是唯一的。并且host controller是通过IP地址来连接到domain controller的。

所以我们需要在host.xml中给host起一个唯一的名字：

~~~xml
<host xmlns="urn:jboss:domain:3.0"
     name="slave">
[...]
</host>
~~~

如果没有指定host的名字，将会使用jboss.host.name的值作为host的名字。如果这个值也没有设置，那么将会使用HOSTNAME或者COMPUTERNAME作为host的名字。

我们需要在hsot controller中指定domain controller的连接信息：

~~~xml
<domain-controller>
   <remote protocol="remote" host="192.168.0.101" port="9999" username="slave" security-realm="SlaveRealm"/>
</domain-controller>
~~~

这里我们需要指定一个security realm，用来存放slave的密码：

~~~xml
<security-realm name="SlaveRealm">
  <server-identities>
    <secret value="cE3EBEkE=" />
  </server-identities>
</security-realm>
~~~

这个secret，就是在使用user-add工具的时候创建的密码。

# 忽略域范围的资源

我们知道domain controller的职责就是保证所有正在运行的host controller都拥有和domain controller域范围配置一致的本地副本。

这些域范围的配置指的是不以 /host = * 开头的资源，比如那些保存在domain.xml中的资源。

如果host controller不是想做domain controller的备份，或者说host controller不想重新启动一个新的server group。那么host controller只需要保存已运行server group相关的域范围配置即可，并不需要保存所有的是域范围配置。

这样可以减少数据的传输，提升系统的效率。

如果要忽略域范围的资源我们可以使用ignore-unused-configuration="true"。

~~~xml
<domain-controller>
    <remote security-realm="ManagementRealm" ignore-unused-configuration="true">
        <discovery-options>
            <static-discovery name="primary" protocol="${jboss.domain.master.protocol:remote}" host="${jboss.domain.master.address}" port="${jboss.domain.master.port:9999}"/>
        </discovery-options>
    </remote>
</domain-controller>
~~~

# Server groups

 Server groups就是服务分组，它是由domain controller来定义的，每个server-group都需要和profile，socket-binding-group进行关联，我们看个例子：

 ~~~xml
 <server-groups>
    <server-group name="main-server-group" profile="default">
        <jvm name="default">
           <heap size="64m" max-size="512m"/>
           <permgen size="128m" max-size="128m"/>
        </jvm>
        <socket-binding-group ref="standard-sockets"/>
    </server-group>
    <server-group name="other-server-group" profile="bigger">
        <jvm name="default">
            <heap size="64m" max-size="512m"/>
        </jvm>
        <socket-binding-group ref="bigger-sockets"/>
    </server-group>
</server-groups>
~~~

上面配置中的socket-binding-group也是在domain.xml中定义的，指定了网络的interface和端口：

~~~xml
<socket-binding-groups>
    <socket-binding-group name="standard-sockets" default-interface="public">
        <socket-binding name="http" port="8080"/>
        [...]
    </socket-binding-group>
    <socket-binding-group name="bigger-sockets" include="standard-sockets" default-interface="public">
        <socket-binding name="unique-to-bigger" port="8123"/>
    </socket-binding-group>
</socket-binding-groups>
~~~

socket-binding-group还可以使用include来引用其他的socket-binding-group。

profile是subsystems的集合，subsystem就是应用程序需要的各种功能。

~~~xml
<profiles>
    <profile name="default">
        <subsystem xmlns="urn:jboss:domain:web:1.0">
            <connector name="http" scheme="http" protocol="HTTP/1.1" socket-binding="http"/>
            [...]
        </subsystem>
        <\!-\- The rest of the subsystems here \-->
        [...]
    </profile>
    <profile name="bigger">
        <subsystem xmlns="urn:jboss:domain:web:1.0">
            <connector name="http" scheme="http" protocol="HTTP/1.1" socket-binding="http"/>
            [...]
        </subsystem>
        <\!-\- The same subsystems as defined by 'default' here \-->
        [...]
        <subsystem xmlns="urn:jboss:domain:fictional-example:1.0">
            <socket-to-use name="unique-to-bigger"/>
        </subsystem>
    </profile>
</profiles>
~~~

# Servers

Servers是在host controller中定义的，而Servers group是在domain controller中定义的。

每个server都要属于一个server group，server就是服务，每个server都会启动一个jvm。 我们先看下server的定义：

~~~xml
<servers>
    <server name="server-one" group="main-server-group">
        <\!-\- server-one inherits the default socket-group declared in the server-group \-->
        <jvm name="default"/>
    </server>
 
    <server name="server-two" group="main-server-group" auto-start="true">
        <socket-binding-group ref="standard-sockets" port-offset="150"/>
        <jvm name="default">
            <heap size="64m" max-size="256m"/>
        </jvm>
    </server>
 
    <server name="server-three" group="other-server-group" auto-start="false">
        <socket-binding-group ref="bigger-sockets" port-offset="250"/>
    </server>
</servers>
~~~

在server中，我们可以重新定义socket-binding-group。

auto-start的意思是server是否回随着host controller的启动而启动。

最后，我们看下在host.xml中的jvm的定义：

~~~xml
<jvms>
    <jvm name="default">
        <heap size="64m" max-size="128m"/>
    </jvm>
</jvms>
~~~

我们可以在server中对其进行重写。

# 总结

以上就是wildfly中，对domain的配置规则，可以看到在domain中，可以启动多个server，配置和管理起来比tomcat要复杂很多，不过功能也相应的强大很多，我们可以借鉴这些优秀软件的设计思想，从而应用到我们的自己的程序中。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！






