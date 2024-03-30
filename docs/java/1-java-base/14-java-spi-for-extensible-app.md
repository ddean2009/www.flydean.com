---
slug: /java-spi-for-extensible-app
---

# 14. 在java中使用SPI创建可扩展的应用程序

# 简介

什么是可扩展的应用程序呢？可扩展的意思是不需要修改原始代码，就可以扩展应用程序的功能。我们将应用程序做成插件或者模块。

这样可以在不修改原应用的基础上，对系统功能进行升级或者定制化。

本文将会向大家介绍如何通过java中的SPI机制实现这种可扩展的应用程序。

# SPI简介

SPI的全称是Java Service Provider Interface。是java提供的一种服务发现的机制。

通过遵循相应的规则编写应用程序之后，就可以使用ServiceLoader来加载相应的服务了。

SPI的实现主要分为4个部分：

1. Service Provider Interface: SPI是一个interface或者是抽象类，其中定义了我们需要扩展实现的功能。
2. Service Providers：这是SPI的具体实现，提供了具体的实现功能
3. SPI Configuration File：SPI的配置文件，通过在配置文件我们来配置相关的SPI发现信息。
4. ServiceLoader: ServiceLoader是用来加载和发现服务的java类，并提供了很多有用的方法。

# SPI的普通java实现

讲完SPI的定义，大家可能还是不清楚SPI到底是做什么的，又该怎么使用它。

不用急，我们下面通过一个例子来说明。

首先创建一个module:SPI-service,里面主要定义了一个ModuleService接口：

~~~java
public interface ModuleService {
}
~~~

![](https://img-blog.csdnimg.cn/20200711103146283.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

然后再分别创建两个module，作为ModuleService的实现：

~~~java
public class ModuleServiceA implements ModuleService {

    public ModuleService getModuleService(){
        return new ModuleServiceA();
    }
}
~~~

~~~java
public class ModuleServiceB implements ModuleService {

    public ModuleService getModuleService(){
        return new ModuleServiceB();
    }
}
~~~

接着分别在两个module中创建META-INF/services文件夹，并且在里面创建两个以 Service Provider Interface限定名为名字的文件，这里文件名是：com.flydean.base.service.ModuleService，文件里面存放的是SPI的具体实现类：

~~~java
com.flydean.base.servicea.ModuleServiceA
com.flydean.base.serviceb.ModuleServiceB
~~~

![](https://img-blog.csdnimg.cn/20200711103500719.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

![](https://img-blog.csdnimg.cn/20200711103530437.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

最后，我们需要创建一个使用SPI的类：

~~~java
public class ModuleController {

    public static void main(String[] args) {
        List<ModuleService> moduleServices = ServiceLoader
                .load(ModuleService.class).stream()
                .map(ServiceLoader.Provider::get)
                .collect(toList());
        log.info("{}", moduleServices);
    }
}
~~~

![](https://img-blog.csdnimg.cn/20200711103750916.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

为了更好的展示扩展应用的实际使用，我们分别创建4个模块。在实际应用中，只需要将这些jar包加入应用程序的classpath即可。

运行看下输出结果：

~~~java
[com.flydean.base.servicea.ModuleServiceA@16f65612, 
com.flydean.base.serviceb.ModuleServiceB@311d617d]
~~~

从结果看到，我们获得了两个ModuleService。证明系统扩展成功。

# SPI在JPMS模块化系统下的实现

上面我们讲的是基本的操作，考虑一下，如果是在JDK9之后，引入了JPMS模块化系统之后，应该怎么使用SPI呢？

代码肯定是一样，我们需要修改的是SPI配置文件。

如果在JPMS中，我们就不需要使用META-INF/services了，我们只需要创建相应的module-info.java文件即可。

先看下SPI模块的module-info.java文件：

~~~java
module com.flydean.service {
    exports com.flydean.service;
}
~~~

这个模块我们对外暴露了service package，供其他模块调用。

![](https://img-blog.csdnimg.cn/20200711104305359.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

接下来是SPI的实现模块：

~~~java
module com.flydean.servicea {
    requires com.flydean.service;
    provides com.flydean.service.ModuleService with com.flydean.servicea.ModuleServiceA;
    exports com.flydean.servicea;
}
~~~

这里我们使用了provides命令，定义了两个类的关联关系。

![](https://img-blog.csdnimg.cn/20200711104500113.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

最后是调用的模块：

~~~java
module com.flydean.controller {
    uses com.flydean.service.ModuleService;
    requires com.flydean.service;
    requires lombok;
    requires slf4j.api;
}
~~~

这里我们使用uses关键词来引用ModuleService。

![](https://img-blog.csdnimg.cn/20200711104618595.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_0,text_aHR0cDovL3d3dy5mbHlkZWFuLmNvbQ==,size_30,color_8F8F8F,t_70)

# 总结

本文介绍了SPI在模块化和非模块化系统中的应用。

本文中的例子：[learn-java-base-9-to-20](https://github.com/ddean2009/learn-java-base-9-to-20)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！

![](https://img-blog.csdnimg.cn/20200709152618916.png)
