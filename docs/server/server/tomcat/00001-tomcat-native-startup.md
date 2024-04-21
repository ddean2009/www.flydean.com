---
slug: /tomcat-native-startup
---

# 使用Tomcat Native提升Tomcat IO效率

# 简介

IO有很多种，从最开始的Block IO，到nonblocking IO，再到IO多路复用和异步IO，一步一步的将IO的性能提升做到极致。

今天我们要介绍一下怎么使用Tomcat Native来提升Tomcat IO的效率。

# Tomcat的连接方式

Tomcat中使用连接器来处理与外部客户端的通信。Connecter主要用来接受外部客户端的请求，并转交给处理引擎处理。

在Tomcat中有两种Connector。一种是 HTTP connector， 一种是AJP connector。

HTTP connector大家应该很好理解，它也是tomcat默认使用的连接器。

还有一个连接器叫做AJP，AJP主要是用来和web服务器进行通信用的，因为AJP协议的速度要比HTTP的快，所以AJP除了用来和其他webserver进行通信之外，还可以通过AJP来构建tomcat集群。

这两种方式都支持4中协议，分别是BIO，NIO，NIO2和APR。

~~~java
#以下四种Connector实现都是直接处理来自客户端Http请求
org.apache.coyote.http11.Http11Protocol : 支持HTTP/1.1 协议的连接器。

org.apache.coyote.http11.Http11NioProtocol : 支持HTTP/1.1 协议+New IO的连接器。

org.apache.coyote.http11.Http11Nio2Protocol : 支持HTTP/1.1 协议+New IO2的连接器。

org.apache.coyote.http11.Http11AprProtocol : 使用APR（Apache portable runtime)技术的连接器,利用Native


#以下四种实现方法则是与web server打交道
org.apache.coyote.ajp.AjpProtocol：使用AJP协议的连接器，实现与web server（如Apache httpd）之间的通信

org.apache.coyote.ajp.AjpNioProtocol：SJP协议+ New IO

org.apache.coyote.ajp.AjpNio2Protocol：SJP协议+ New IO2

org.apache.coyote.ajp.AjpAprProtocol：AJP + APR
~~~

讲下他们的区别，BIO就是block IO是最最基础的IO方式， 我们通过这样来配置：

~~~xml
<Connector  port=”8080”  
protocol=”HTTP/1.1”
  
maxThreads=”150”  
connectionTimeout=”20000”   
redirectPort=”8443” />
~~~

Tomcat7以下版本在默认情况下是以bio模式运行的。自Tomcat 8.5 版本开始，Tomcat就移除了对BIO的支持。

New IO是基于java.nio包及其子包的一种IO方式。能提供非阻塞IO方式，比传统的BIO拥有与更加高效的运行效率。

我们这样配置New IO:

~~~xml
<Connector port="8080" protocol="org.apache.coyote.http11.Http11NioProtocol"
connectionTimeout="20000"
redirectPort="8443" />
~~~

New IO和New IO2有什么区别呢？

New IO2是tomcat8中引入的IO方式，我们可以这样配置：

~~~xml
<Connector port="8080" protocol="org.apache.coyote.http11.Http11Nio2Protocol"
connectionTimeout="20000"
redirectPort="8443" />
~~~

apr这种方式就高级了，这个是我们今天要讲解的tomcat native的主要作用。

# APR和Tomcat Native 

apr的全称是Apache Portable Runtime，它是一个高度可移植的库，它是Apache HTTP Server 2.x的核心。 APR有许多用途，包括访问高级IO功能（例如sendfile，epoll和OpenSSL），操作系统级别的功能（生成随机数，系统状态等）和本机进程处理（共享内存，NT管道和Unix套接字）。

Tomcat可以通过JNI的形式调用Apache HTTP服务器的核心动态链接库来处理文件读取或网络传输操作，从而大大地提高Tomcat对静态文件的处理性能。

通过使用APR我们可以获得如下的特性：

1. Non-blocking I/O和请求连接保持。
2. 支持OpenSSL和TLS/SSL。

Tomcat Native是一个库，通过这个库，Tomcat可以使用APR。

所以使用Tomcat Native的前提是需要安装好APR library，OpenSSL和JDK。

我们可以通过下面的方式来安装apr和openssl：

debian based linux系统：

~~~java
apt-get install libapr1.0-dev libssl-dev
~~~

rpm based Linux 系统：

~~~java
yum install apr-devel openssl-devel
~~~

在windows下面，tcnative是以一个dll的形式来提供的，我们直接下载使用就可以了。

但是在linux下面，因为平台不同，所以在linux下面tcnative是需要自行编译的。

一般来说我们可以在 bin/tomcat-native.tar.gz 找到tcnative的源码包。将其解压。

先运行configure命令：

~~~shell
./configure --with-apr=/usr/bin/apr-1-config \
            --with-java-home=/home/jfclere/JAVA/jdk1.7.0_80/ \
            --with-ssl=yes \
            --prefix=$CATALINA_HOME
~~~

再进行make操作：

~~~shell
make && make install
~~~

生成的lib文件将会被放入$CATALINA_HOME/lib中。

# 在tomcat中使用APR

安装好tcnative之后，我们就可以在tomcat中使用APR了。

先检查一下conf/server.xml中是否有下面的配置：

~~~xml
<Listener className="org.apache.catalina.core.AprLifecycleListener" SSLEngine="on" />
~~~

然后我们需要修改 $CATALINA_HOME/bin/setenv.sh 将tc-native 的lib文件添加到LD_LIBRARY_PATH中。

~~~shell
LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$CATALINA_HOME/lib
export LD_LIBRARY_PATH
~~~

最后添加APR的连接：

~~~xml
<Connector port="8080" protocol="org.apache.coyote.http11.Http11AprProtocol"
connectionTimeout="20000"
redirectPort="8443" />
~~~

运行即可。

从日志中，我们会发现下面的内容：

~~~shell
org.apache.catalina.core.AprLifecycleListener init
INFO: Loaded APR based Apache Tomcat Native library 1.x.y.
org.apache.catalina.core.AprLifecycleListener init
INFO: APR capabilities: IPv6 [true], sendfile [true], accept filters [false], random [true].
org.apache.coyote.http11.Http11AprProtocol init
INFO: Initializing Coyote HTTP/1.1 on http-8080
~~~

说明APR安装完毕并且已经在被使用了。

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！








