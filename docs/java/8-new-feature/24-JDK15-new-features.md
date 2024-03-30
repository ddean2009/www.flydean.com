---
slug: /JDK15-new-features
---

# 24. JDK 15 JAVA 15的新特性展望

伴随着2020的寒冬和新冠病毒的肆虐，JAVA迎来了久未已久的JAVA 14。自从2017年JAVA 9发布之后，JAVA的发布版本跟上了敏捷开发的步伐，小步快跑，Java平台发布节奏已从每3年以上的主要版本转变为每6个月发布一次功能。现在，每年的3月和9月都会发布新的版本功能。

三月已过，九月还远吗？

在JAVA 14中，推出了swith的最终版本，并且支持了NVM。

今天本文将会展望一下JAVA 15中会带给我们的新特性。 

总体来说有5个JEP将会提交到JAVA 15。

什么？你问我JEP是什么？

JEP的全称就是JDK Enhancement Proposals,简单点讲就像是一个个对JAVA进行改进提案，这些提案会在合适的时间合适的地点被加入JDK的特定版本。

下面看下5大提案都有些什么内容：

# JEP 371: Hidden Classes

通常我们在使用大型的框架或者lambda表达式的时候，会动态生成很多类。但是不幸的是标准的定义类的API：ClassLoader::defineClass 和 Lookup::defineClass不能够区分出这些类是动态生成(运行时生成)的还是静态
生成（编译生成）的。

一般来说动态生成的类生命周期更短，并且其可见性要更低。但是现有的JDK并没有这个功能。

所有有了Hidden Classes的提案，通过Hidden Classes，不管是JDK还是JDK外部的框架，在生成动态类的时候都可以定义为Hidden Classes，这样可以更加有效的控制这些动态生成类的生命周期和可见性。

# JEP 372: 删除 Nashorn JavaScript Engine

实际上jdk.scripting.nashorn和jdk.scripting.nashorn.shell这两个在JDK11的时候已经被标记为deprecated。在JDK15中只是把他们删除而已。

# JEP 377: 新的垃圾回收器ZGC正式上线了

Z Garbage Collector（ZGC）是在JAVA 11中引入的垃圾回收器，但一直都是实验版本，在JDK 15中，终于要上线了。

ZGC是一个重新设计的并发的垃圾回收器，可以极大的提升GC的性能。

# JEP 378: Text Blocks 标准化

Text Blocks第一次是在JDK 13中以预览功能出现的JEP 355。然后在JDK 14中又出现了第二个版本JEP 368。终于在JDK 15中可以有最终版本了。

文本块是一种多行字符串文字，它避免了大多数转义序列的需要，以一种可预测的方式自动设置字符串的格式。

**HTML example**

传统方式：

~~~java
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello, world</p>\n" +
              "    </body>\n" +
              "</html>\n";
~~~

文本块方式：

~~~java
String html = """
              <html>
                  <body>
                      <p>Hello, world</p>
                  </body>
              </html>
              """;
~~~

**SQL example**

传统方式：

~~~java
String query = "SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`\n" +
               "WHERE `CITY` = 'INDIANAPOLIS'\n" +
               "ORDER BY `EMP_ID`, `LAST_NAME`;\n";
~~~

文本块方式：

~~~java
String query = """
               SELECT `EMP_ID`, `LAST_NAME` FROM `EMPLOYEE_TB`
               WHERE `CITY` = 'INDIANAPOLIS'
               ORDER BY `EMP_ID`, `LAST_NAME`;
               """;
~~~

# JEP 379: 新的垃圾回收器Shenandoah上线

Shenandoah和ZGC一样，是以实验特性在JAVA 12中引入的JEP 189。现在终于要在JAVA 15中转正了。

# 总结

上述就是5大很可能在JAVA 15中实现的新特性，希望大家能够喜欢。

> 欢迎关注我的公众号:程序那些事，更多精彩等着您！
> 
> 更多内容请访问 [www.flydean.com](www.flydean.com)






