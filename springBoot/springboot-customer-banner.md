# Spring Boot 自定义banner

Spring Boot启动的时候会在命令行生成一个banner，其实这个banner是可以自己修改的，本文将会将会讲解如何修改这个banner。

首先我们需要将banner保存到一个文件中，网上有很多可以生成banner文件的网站，比如：patorjk.com/software/taag

![](https://img-blog.csdnimg.cn/20200205191800751.png)

我们生成了如下的banner：

~~~txt
  _____.__            .___                    
_/ ____\  | ___.__. __| _/____ _____    ____  
\   __\|  |<   |  |/ __ |/ __ \\__  \  /    \ 
 |  |  |  |_\___  / /_/ \  ___/ / __ \|   |  \
 |__|  |____/ ____\____ |\___  >____  /___|  /
            \/         \/    \/     \/     \/ 
~~~

将其保存为banner.txt，放在 resource目录下。

接下来我们需要指定使用该banner文件，在application.properties文件中定义如下：

~~~java
spring.banner.location=classpath:banner.txt
~~~

启动看看效果：

~~~txt
/Library/Java/JavaVirtualMachines/jdk1.8.0_171.jdk/Contents/Home/bin/java 
  _____.__            .___
_/ ____\  | ___.__. __| _/____ _____    ____
\   __\|  |<   |  |/ __ |/ __ \\__  \  /    \
 |  |  |  |_\___  / /_/ \  ___/ / __ \|   |  \
 |__|  |____/ ____\____ |\___  >____  /___|  /
            \/         \/    \/     \/     \/
~~~

除了使用txt文件，我们也可以使用图片如下：

~~~txt
spring.banner.image.location=classpath:banner.gif
spring.banner.image.width=  //TODO
spring.banner.image.height= //TODO
spring.banner.image.margin= //TODO
spring.banner.image.invert= //TODO
~~~

可以自定义图片的其他一些属性。好了，本文就介绍到这里。

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-customer-banner](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-customer-banner)

更多教程请参考 [flydean的博客](www.flydean.com)



