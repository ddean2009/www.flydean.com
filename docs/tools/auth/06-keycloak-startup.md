---
slug: /06-keycloak-startup
---

# 6. 开源认证和访问控制的利器keycloak使用简介

# 简介

keycloak是一个开源的进行身份认证和访问控制的软件。是由Red Hat基金会开发的，我们可以使用keycloak方便的向应用程序和安全服务添加身份认证，非常的方便。

keycloak还支持一些高级的特性，比如身份代理，社交登录等等。

本文将会带领大家进入keycloak的神秘世界。

# 安装keycloak

keycloak有很多种安装模式，这里我们先介绍最简单的standalone模式。

要安装keycloak，我们需要下载keycloak的zip包。在我写这篇文章的时候，keycloak的最新版本是11.0.2。

下载链接如下： https://downloads.jboss.org/keycloak/11.0.2/keycloak-11.0.2.zip 

下载完毕，解压，

~~~shell
cd bin
./standalone.sh
~~~

我们可以简单的挑选一些启动日志来分析一下：

~~~shell
=========================================================================

  JBoss Bootstrap Environment

  JBOSS_HOME: /Users/flydean/data/git/security/keycloak-11.0.2

  JAVA: /Library/Java/JavaVirtualMachines/jdk1.8.0_171.jdk/Contents/Home/bin/java

  JAVA_OPTS:  -server -Xms64m -Xmx512m -XX:MetaspaceSize=96M -XX:MaxMetaspaceSize=256m -Djava.net.preferIPv4Stack=true -Djboss.modules.system.pkgs=org.jboss.byteman -Djava.awt.headless=true

=========================================================================

22:08:04,231 INFO  [org.jboss.modules] (main) JBoss Modules version 1.10.1.Final
22:08:08,706 INFO  [org.jboss.msc] (main) JBoss MSC version 1.4.11.Final
22:08:08,721 INFO  [org.jboss.threads] (main) JBoss Threads version 2.3.3.Final
22:08:08,921 INFO  [org.jboss.as] (MSC service thread 1-2) WFLYSRV0049: Keycloak 11.0.2 (WildFly Core 12.0.3.Final) starting
~~~

可以看到keycloak底层实际上使用的是WildFly服务器，WildFly服务器的前身就是JBoss，也是由red hat主导的。所以keycloak使用WildFly还是很合理的。

当我们看到下面的日志的时候，就意味着keycloak启动好了。

~~~shell
22:08:26,436 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0060: Http management interface listening on http://127.0.0.1:9990/management
22:08:26,437 INFO  [org.jboss.as] (Controller Boot Thread) WFLYSRV0051: Admin console listening on http://127.0.0.1:9990
~~~

接下来，我们需要为keycloak创建admin用户。

# 创建admin用户

启动好keycloak之后，我们就可以登录到web页面 http://localhost:8080/auth 创建admin用户了。

![](https://img-blog.csdnimg.cn/2020091522151448.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

这是创建用户的界面，我们输入用户名和密码，点击create，就可以创建admin用户了。

创建完admin用户，点击登录到admin console，就会跳转到admin console的登录页面 http://localhost:8080/auth/admin/

输入用户名密码，点击登录。

![](https://img-blog.csdnimg.cn/20200915221904300.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

然后就进入到了管理界面：

![](https://img-blog.csdnimg.cn/20200915222014442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到管理界面提供的功能还是非常丰富的。

我们可以对realm,clients,roles,identity providers,user federation,authentication等进行配置和定义。

还可以对groups,users,sessions,events等进行管理，非常强大和方便。


# 创建realm和普通用户

realm翻译成中文就是域，我们可以将它看做是一个隔离的空间，在realm中我们可以创建users和applications。

keycloak中有两种realm空间，一种是Master realm，一种是Other realms。

![](https://img-blog.csdnimg.cn/2020091522330333.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

master realm是指我们使用admin用户登录进来的realm空间，这个realm只是用来创建其他realm的。

other realms是由master realm来创建的，admin可以创建users和applications,而这些applications是由users所有的。

点击add realm按钮，我们进入add realm界面，输入realm的名字，就可以创建realm了。

![](https://img-blog.csdnimg.cn/20200915225220203.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

上面的例子中，我们创建了一个叫做WildFly的realm。

接下来，我们为WildFly创建新的user：

![](https://img-blog.csdnimg.cn/20200915225516170.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

输入用户名，点击save。

选择新创建user的credentials页面，输入要创建的密码，点击set password，那么新创建用户的密码则创建完毕。

![](https://img-blog.csdnimg.cn/20200915230140596.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

接下来，我们使用新创建的用户flydean来登录realm WildFly,登录url如下：

http://localhost:8080/auth/realms/WildFly/account 

输入用户名和密码，进入用户管理页面：

![](https://img-blog.csdnimg.cn/20200915230729893.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

我们将用户所需要的资料填充完毕，以供后面使用。

# 使用keycloak来保护你的应用程序

因为keycloak底层使用的是WildFly，为了简单起见，这里我们也使用keycloak来保护一个WildFly程序。

我从WildFly的官网下载最新版本的WildFly，然后解压备用。

因为keycloak和WildFly都是在同一台机子上面启用。所以默认情况下端口都是一样的8080。

接下来，我们需要修改一下keycloak的端口，以避免端口冲突。

~~~shell
cd bin
./standalone.sh -Djboss.socket.binding.port-offset=100
~~~

我们重启一下keycloak,在启动命令中添加了jboss.socket.binding.port-offset，这个是相对于标准端口的偏移量。

比如之前我们的端口是8080，那么现在端口就是8180。

看一下，现在的管理页面链接是不是变到了 http://localhost:8180/auth/admin/ 。

## 安装WildFly client adapter

为了无缝集成WildFly，keycloak提供了多种adapter供我们使用：

![](https://img-blog.csdnimg.cn/20200916095420781.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到除了WildFly,keycloak还可以支持Jetty和Tomcat，我们可以在后面的文章中来讲解如何集成keycloak到Jetty和Tomcat。

同时，client Adapters还有两种协议格式，openid connect和SAML 2.0,我们也会在后面的文章中具体介绍一下这两种协议，敬请期待。

好了，先下载WildFly adapter,将adapter放到WildFly的跟目录下面：

~~~shell
server/wildfly-20.0.1.Final : ls
LICENSE.txt                              bin                                      domain                                   modules
README.txt                               copyright.txt                            jboss-modules.jar                        standalone
appclient                                docs                                     keycloak-wildfly-adapter-dist-11.0.2.zip welcome-content
~~~

解压adapter,解压之后，进入wildfly-20.0.1.Final/bin目录，运行：

~~~shell
./jboss-cli.sh --file=adapter-elytron-install-offline.cli
~~~

如果你得到下面的输出结果：

~~~shell
{"outcome" => "success"}
{"outcome" => "success"}
{"outcome" => "success"}
{"outcome" => "success"}
~~~

那就说明adapter安装成功了，这个脚本会修改…​/standalone/configuration/standalone.xml。

然后我们可以启动WildFly了：

~~~java
./standalone.sh
~~~

## 注册WildFly应用程序

回到我们的admin console： http://localhost:8180/auth/admin/

选择我们之前创建的realm：WildFly，在clients选项中，我们创建新的client：

![](https://img-blog.csdnimg.cn/20200916111255160.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

创建完成之后，我们进入到installation tab：

![](https://img-blog.csdnimg.cn/20200916111523297.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

选择keycloak OIDC JSON,点击Download，下载keycloak.json文件。

然后选择Keycloak OIDC JBoss Subsystem XML，点击下载，下载keycloak-oidc-subsystem.xml文件。

接下来，我们需要修改WildFly配置信息。

进入WildFly的standalone/configuration目录，修改standalone.xml文件如下：

~~~xml
        <subsystem xmlns="urn:jboss:domain:keycloak:1.1">
                <secure-deployment name="vanilla.war">
                <realm>WildFly</realm>
    <auth-server-url>http://localhost:8180/auth/</auth-server-url>
    <public-client>true</public-client>
    <ssl-required>EXTERNAL</ssl-required>
    <resource>vanilla</resource>
</secure-deployment>
        </subsystem>
~~~

这个subsystem的内容实际上就是我们刚刚保存的keycloak-oidc-subsystem.xml里面的内容。

这里我们需要知道secure-deployment的war名字，也就是我们接下来将要部署的应用程序的名字。

重启WildFly。

## 安装vanilla应用程序

为了简单起见，我们直接从 https://github.com/keycloak/keycloak-quickstarts 中下载示例代码项目 app-profile-jee-vanilla。

~~~shell
git clone https://github.com/keycloak/keycloak-quickstarts
cd keycloak-quickstarts/app-profile-jee-vanilla/config
~~~

将刚刚下载的keycloak.json拷贝到当前目录。

然后切换到keycloak-quickstarts父目录，执行：

~~~java
mvn clean wildfly:deploy
~~~

这个命令将会打包成为适合WildFly执行的war包，也就是我们要的vanilla.war。

将打包好的vanilla.war拷贝到WildFly目录下的standalone/deployments。

WildFly会自动重新部署该应用程序。

这时候我们访问下应用程序 http://localhost:8080/vanilla ：

![](https://img-blog.csdnimg.cn/20200916135635573.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

可以看到登录界面。点击登录。

先看下登录链接，自动跳转到了 http://localhost:8180/auth/realms/WildFly/protocol/openid-connect/auth?response_type=code&client_id=vanilla&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fvanilla%2Fprofile.jsp&state=8521b8ab-83f7-4fec-9ced-8c90a3d42839&login=true&scope=openid

这也就是keycloak登录域WildFly的登录界面，不过后面带上了redirect_uri参数，说明登录成功后，会跳转回vanilla程序的界面。

我们使用之前创建的用户名和密码登录看看。

![](https://img-blog.csdnimg.cn/20200916135947257.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_25,color_8F8F8F,t_70)

登录成功。

# 总结

上面的例子我们演示了如何配置keycloak，并且创建一个realm供第三方程序使用。还举了一个无侵入的例子来和keycloak对接。

当然，有朋友会问了，vanilla程序是怎么和keycloak对接的呢？如果我们要写一个自己的程序，应该怎么做呢？

别急，细节我会在后面的文章进行分享，敬请期待。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！













