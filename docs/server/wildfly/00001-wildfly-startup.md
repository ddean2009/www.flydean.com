wildfly 21使用指南

# 简介

wildfly的前身是JBoss AS(JBoss Application Server)，为了区别于JBoss的企业级应用JBoss EAP。在v8的时候改名为wildfly。

wildfly的最新版本是21。今天给大家介绍一下wildfly 21的使用。

# wildfly简介

wildfly 21是wildfly系列的最新版本，它是Jakarta Platform规范的轻量级但是强大的实现。wildfly的一个最大的特点就是模块化，可以根据需要为应用服务器提供服务。

Jakarta EE的前称是Java EE，在2017年9月，Oracle将Java EE的源码贡献给了Eclipse Foundation，为了避免各种专利和品牌的问题，将Java EE改名为Jakarta EE。

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

# wildfly的安装和结构

wildfly安装非常简单，直接从官网下载zip包解压即可。

> 注意，wildfly是一个纯java编写的服务器，它的运行环境是java 8+.

下载到wildfly-21.0.0.Final.zip 之后，我们将其解压。接下来，我们探讨一下wildfly的结构和各个模块的作用。

~~~java
LICENSE.txt       appclient         copyright.txt     domain            modules           welcome-content
README.txt        bin               docs              jboss-modules.jar standalone
~~~


* appclient - application client 客户端

* bin - 各种脚本的位置

* docs - 各种文档信息和配置例子

* domain - domain mode 的专门目录

* standalone - standalone server 的专门目录

* modules - server中的各种模块

* welcome-content - 默认的欢迎页面

其中比较重要也是我们经常使用有下面几个部分。

## standalone

如果我们要使用standalone模式，那么这个目录就是我们需要关注的。我们看下standalone目录下都有什么内容：

* configuration - 配置文件目录

* data - server运行时的持久化存储信息

* deployments - 要部署的程序目录

* lib - server运行时依赖的lib

* log - 日志目录

* tmp - 临时文件

## domain

我们看下domain的目录结构：

* configuration - 配置文件目录

* content - Host Controller工作时候的内部区域

* lib - server运行时依赖的lib

* log - 日志目录

* tmp - 临时文件

* servers - 要部署的程序目录

# wildfly的配置文件

对于standalone模式来说，有下面几个配置文件：

* standalone.xml (default)

包含常用组件的默认配置文件。

* standalone-ha.xml

默认的高可用的配置文件。

* standalone-full.xml

包含所有组件的配置文件。

* standalone-full-ha.xml

包含所有组件的高可用配置文件。

* standalone-microprofile.xml

适用于微服务的配置文件。

* standalone-microprofile-ha.xml

适用于高可用微服务的配置文件。

在domain模式下，还有一个配置文件：

* domain.xml 

domain模式下的专有文件。

如果大家仔细观察这些配置文件，可以发现有很多extensions的配置，这些extensions是以module的形式放在modules目录的，我们可以根据需要自行配置：

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



# wildfly的启动

启动wildfly很简单，如果是standalone模式，则进入bin目录：

~~~js
./standalone.sh
~~~

如果是domain模式，则：

~~~js
./domain.sh
~~~

当然，你也可以指定其他的配置文件：

~~~js
./standalone.sh --server-config=standalone-full-ha.xml

./domain.sh --domain-config=my-domain-configuration.xml
~~~

运行之后，访问http://localhost:8080/， 你会得到wildfly的启动界面：

![](https://img-blog.csdnimg.cn/20201018225203939.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

# Administration Console

如果我们查看wildfly的启动页面，可以看到有一项Administration Console，点击进去可以得到下面的结果：

![](https://img-blog.csdnimg.cn/20201018225506380.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这是wildfly的管理页面，如果想要我们在wildfly中部署的程序，我们需要创建一个新的用户。

我们可以通过使用add-user.sh来创建：

~~~js
./add-user.sh
What type of user do you wish to add?
 a) Management User (mgmt-users.properties)
 b) Application User (application-users.properties)
(a):
~~~

这里我们只是想创建管理账号，所以选择a。

接下来需要我们输入关于这个用户的详细的信息：

~~~js
Enter the details of the new user to add.
Using realm 'ManagementRealm' as discovered from the existing property files.
Username : flydean
Password recommendations are listed below. To modify these restrictions edit the add-user.properties configuration file.
 - The password should be different from the username
 - The password should not be one of the following restricted values {root, admin, administrator}
 - The password should contain at least 8 characters, 1 alphabetic character(s), 1 digit(s), 1 non-alphanumeric symbol(s)
Password :
WFLYDM0098: The password should be different from the username
Are you sure you want to use the password entered yes/no? yes
Re-enter Password :
What groups do you want this user to belong to? (Please enter a comma separated list, or leave blank for none)[  ]:
About to add user 'flydean' for realm 'ManagementRealm'
Is this correct yes/no? yes
~~~

添加用户的命令最终会修改4个文件，分别是：

standalone/configuration/mgmt-users.properties
domain/configuration/mgmt-users.properties
standalone/configuration/mgmt-groups.properties
domain/configuration/mgmt-groups.properties

他们表示管理用户，和管理用户的组信息。

好了，创建好了用户，我们再次进入Administration Console页面。

输入用户名密码，我们会得到下面的页面：

![](https://img-blog.csdnimg.cn/20201018230405262.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到提供的功能还是非常多的。

我们可以部署新的服务，监控服务器状态，给wildfly打补丁，升级，配置子系统信息和管理用户等等。非常的强大。

默认情况下，Administration Console页面的链接是http://localhost:9990/console

除了web页面之外，我们还可以通过console命令来进行管理：

~~~js
$JBOSS_HOME/bin/jboss-cli.sh --connect
Connected to standalone controller at localhost:9990
~~~

如果是在本地执行这个cli命令，那么将不需要输入用户名密码，会直接相应的文件系统中读取用户信息。但是如果连接的是远程的服务器的话，则需要输入用户名和密码。

## 配置子系统

我们可以使用管理界面轻松的管理和配置wildfly的子系统。

![](https://img-blog.csdnimg.cn/20201018231553636.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

以datasource为例，我们可以在wildfly中创建好datasource子系统，从而在应用程序中直接使用即可。避免了应用程序中对数据源的多次定义和重复处理。

wildfly默认提供了一个h2的数据源：

~~~js
<subsystem xmlns="urn:jboss:domain:datasources:1.0">
    <datasources>
        <datasource jndi-name="java:jboss/datasources/ExampleDS" pool-name="ExampleDS">
            <connection-url>jdbc:h2:mem:test;DB_CLOSE_DELAY=-1</connection-url>
            <driver>h2</driver>
            <pool>
                <min-pool-size>10</min-pool-size>
                <max-pool-size>20</max-pool-size>
                <prefill>true</prefill>
            </pool>
            <security>
                <user-name>sa</user-name>
                <password>sa</password>
            </security>
        </datasource>
        <xa-datasource jndi-name="java:jboss/datasources/ExampleXADS" pool-name="ExampleXADS">
           <driver>h2</driver>
           <xa-datasource-property name="URL">jdbc:h2:mem:test</xa-datasource-property>
           <xa-pool>
                <min-pool-size>10</min-pool-size>
                <max-pool-size>20</max-pool-size>
                <prefill>true</prefill>
           </xa-pool>
           <security>
                <user-name>sa</user-name>
                <password>sa</password>
           </security>
        </xa-datasource>
        <drivers>
            <driver name="h2" module="com.h2database.h2">
                <xa-datasource-class>org.h2.jdbcx.JdbcDataSource</xa-datasource-class>
            </driver>
        </drivers>
  </datasources>
</subsystem>
~~~

我们可以根据需要创建和修改自己的数据源。

# 总结

以上就是wildfly的基本使用了，希望大家能够喜欢。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！









