---
slug: /Significant-Changes-in-JDK11-Release
---

# 1. JDK11的重要新特性

## JDK11发布啦
JDK11 在2018年9月25发布。它是一个LTS版本。这就意味着这，我们会从JDK8直接升级到JDK11。 

那么JDK11有些什么变化呢？就我看来，JDK11最大的变化就是删除。

## Oracle不再提供JRE和Server JRE下载

先前的发行版有两种类型的运行时映像：JRE是Java SE Platform的完整实现，而JDK则将整个JRE包含在jre/目录中，还包括开发工具和库。

在JDK11中，JRE已经被删除了，这意味着后面要下载只有一个JDK可以下载了。

用户可以使用jlink来创建自定义的，更小的运行时环境。

## 删除部署工具

Java部署技术在JDK 9中已弃用，在JDK 11中已删除。

JDK 11中已删除了Java applet和Web Start功能，包括Java插件，Java Applet Viewer，Java Control Panel和Java Web Start以及javaws工具。

## JavaFX不再包含在JDK中

你可以自行从https://openjfx.io/下载。

## 删除Java EE和CORBA模块

在JDK 11中，删除了Java EE和CORBA模块。

删除的模块是：

* java.xml.ws：用于XML Web服务的Java API（JAX-WS），用于Java平台的Web服务元数据和用于Java的带有附件的SOAP（SAAJ）
  
* java.xml.bind：用于XML绑定的Java体系结构（JAXB）

* java.xml.ws.annotation：Java SE定义的JSR-250通用注释的子集，以支持Web服务

* java.corba：CORBA

* java.transaction：Java SE定义的Java事务API的子集，以支持CORBA对象事务服务

* java.activation：JavaBeans激活框架

* java.se.ee：以上六个模块的Aggregator模块

* jdk.xml.ws：用于JAX-WS的工具

* jdk.xml.bind：用于JAXB的工具
  
在不更改内部版本的情况下，无法引用这些API中的类的现有代码。同样，除非对应用程序的部署方式进行了更改，否则在类路径上引用这些API中的类的代码将因NoDefClassFoundError或ClassNotFoundException而失败。





