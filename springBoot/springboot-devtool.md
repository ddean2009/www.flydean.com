# Spring Boot devtool的使用

Spring Boot为我们提供了一个便捷的开发Spring Boot应用程序的环境，同时为了方便我们的开发Spring Boot应用程序，Spring Boot 推出了Spring Boot devtool的工具来方便我们更加快速的开发和测试Spring Boot应用程序。 

我们将会从下面几个方面来详细讲解Spring Boot devtool的功能。

## 添加Spring Boot devtool依赖

添加Spring Boot devtool依赖很简单：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
~~~

这样就添加好了，我们可以开始使用Spring boot devtool带给我们的优秀功能了。

## 默认属性

Spring Boot为我们提供了很多自动配置来提高我们开发的效率，比如会缓存模板引擎例如thymeleaf， 但是如果我们在开发过程汇中可能需要快速的看到修改的结果，这个时候我们就不需要这个缓存配置了，这时候我们就需要配置：

spring.thymeleaf.cache=false

如果添加了spring-boot-devtools， 上述的配置就不需要手动添加，devtool会自动帮我们添加好。

## 自动重启

在开发过程中，如果我们修改了某些java文件，我们可能需要重启下项目来观看修改后的结果，如果使用spring-boot-devtools，当classpath中有文件变动时候，devtools会自动帮你重启服务器。

> 注意，这里的重启的条件是classpath的文件要有变化，如果你在使用IDEA开发的话，请勾选“Build project automatically” 选项，如下图示所示，否则你需要重新build项目来使重启生效。

![](https://img-blog.csdnimg.cn/20200211102604236.png)

## Live Reload

Live Reload主要针对资源文件的，我们的APP启动之后，可以看到一个：

~~~txt
o.s.b.d.a.OptionalLiveReloadServer       : LiveReload server is running on port 35729
~~~

当资源文件变动的时候，方便前端刷新。

如果要用到这个live reload的功能，需要在chrome浏览器中安装一个Remote Live Reload 的插件。

![](https://img-blog.csdnimg.cn/20200211103238686.png)

这个插件主要是通过引入的脚本livereload.js在 livereload 服务和浏览器之间建立了一个 WebSocket 连接。每当监测到文件的变动，livereload 服务就会向浏览器发送一个信号，浏览器收到信号后就刷新页面，实现了实时刷新的效果。

## 全局配置

spring-boot-devtools 提供了一个全局配置文件，方便你的开发环境配置，该文件在$HOME 目录下面的 .spring-boot-devtools.properties 。 

本文的例子可以参考 [https://github.com/ddean2009/learn-springboot2/tree/master/springboot-devtool](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-devtool)

更多教程请参考 [flydean的博客](www.flydean.com)