# 将Spring Boot应用程序注册成为系统服务

在之前的文章中，我们提到了很多Spring Boot的技巧，那么当我们创建好了Spring Boot应用程序之后，怎么在生成环境中运行呢？如果只是以原始的java -jar 的方式来运行的话，不能保证程序的健壮性和稳定性，最好的办法是将程序注册成为服务来使用。

本文将会讲解如何将Spring Boot应用程序注册成为Linux和windows的服务。

## 前期准备

首先我们需要将应用程序打包成为一个可执行的jar包，我们需要添加如下依赖：

~~~xml
<packaging>jar</packaging>
 
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
</parent>
 
<dependencies>
    ....
</dependencies>
 
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <executable>true</executable>
            </configuration>
        </plugin>
    </plugins>
</build>
~~~

这里的packaging我们需要选择jar。添加spring-boot-maven-plugin是为了将app打包成为可执行的jar包。

## 打包成可执行jar包

写好了应用程序，我们可以执行：

~~~shell
mvn clean package
~~~

来打包应用程序，这里我们打包之后的jar包名字为：springboot-run-as-service-0.0.1-SNAPSHOT.jar。 


## 注册成为liunx服务

在linux中，我们可以选择System V init script或者Systemd 配置文件，前者逐渐在被后者替代。

为了安全起见，我们需要创建一个运行用户，并给jar包赋予相应的权限：

~~~shell
$ sudo useradd flydean
$ sudo passwd flydean
$ sudo chown flydean:flydean your-app.jar
$ sudo chmod 500 your-app.jar
~~~

### System V Init

创建一个文件链接到init.d目录，如下：

~~~shell
sudo ln -s /path/to/your-app.jar /etc/init.d/your-app
~~~

接下来我们就可以启动应用程序了：

~~~shell
sudo service your-app start
~~~

service命令支持start, stop, restart 和 status。同时它还提供了如下的功能：

* your-app 将会以flydean用户启动
* 程序运行的pid存储在/var/run/your-app/your-app.pid
* 应用程序的日志在/var/log/your-app.log

### Systemd

使用Systemd，我们需要在 /etc/systemd/system 创建一个your-app.service文件：

~~~shell
[Unit]
Description=A Spring Boot application
After=syslog.target
 
[Service]
User=flydean
ExecStart=/path/to/your-app.jar SuccessExitStatus=100 
 
[Install] 
WantedBy=multi-user.target
~~~

接下来我们可以使用systemctl start|stop|restart|status your-app来管理你的服务了。

### Upstart

Upstart是一个事件驱动的服务管理器，如果你使用Ubuntu，将会被默认安装。

我们来创建一个your-app.conf ：

~~~shell
# Place in /home/{user}/.config/upstart
 
description "Some Spring Boot application"
 
respawn # attempt service restart if stops abruptly
 
exec java -jar /path/to/your-app.jar
~~~

## 在Windows中安装

在windows中，我们也有很多方式，如下：

### Windows Service Wrapper

Windows Service Wrapper 又叫 winsw是一个开源软件，winsw需要和一个配置文件your-app.xml配合使用：

~~~xml
<service>
    <id>MyApp</id>
    <name>MyApp</name>
    <description>This runs Spring Boot as a Service.</description>
    <env name="MYAPP_HOME" value="%BASE%"/>
    <executable>java</executable>
    <arguments>-Xmx256m -jar "%BASE%\your-app.jar"</arguments>
    <logmode>rotate</logmode>
</service>
~~~

> 注意，你需要修改winsw.exe成为your-app.exe来和your-app.xml配合使用。

### Java Service Wrapper

Java Service Wrapper 提供了非常强大的配置，他可以让你的应用程序在windows和Linux下面使用。有兴趣的同学可以自行去学习。






