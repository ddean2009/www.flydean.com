---
slug: /spring5-resources
---

# 16. 资源resources

Spring定义了Resource接口用来对资源的访问，一般来说资源有两种形式，一种是URL的形式从外部链接加载，一种是File的形式从系统本身查找。

Spring的Resource提供了如下接口：

~~~java
public interface Resource extends InputStreamSource {

    boolean exists();

    boolean isOpen();

    URL getURL() throws IOException;

    File getFile() throws IOException;

    Resource createRelative(String relativePath) throws IOException;

    String getFilename();

    String getDescription();

}
~~~

Resource继承了InputStreamSource接口，下面是其定义：
~~~java
public interface InputStreamSource {

    InputStream getInputStream() throws IOException;

}
~~~

## 内置Resource实现

Spring有如下几种内置资源实现：

* UrlResource
* ClassPathResource
* FileSystemResource
* ServletContextResource
* InputStreamResource
* ByteArrayResource

**UrlResource**

UrlResource封装了java.net.URL，可用于访问通常可通过url访问的任何对象，如文件、HTTP目标、FTP目标和其他对象。所有URL可以使用一个标准化前缀来表示一个URL类型。例如：
file：用于访问文件系统路径。
http：用于通过HTTP协议访问资源。
ftp：用于通过FTP访问资源。

**ClassPathResource**

表示从类路径加载资源。如果资源路径带上前缀ClassPath:，那么会隐式的解析为ClassPathResource。 

注意，如果类资源文件是在文件系统中，则该资源实现会被解析为java.io.File， 如果是在Jar包中，则会使用java.net.URL来解析。

**FileSystemResource**

他是java.io.File和java.nio.file.Path的Resource实现，支持解析为File或者URL。

**ServletContextResource**

这是ServletContext的Resource实现，用于解释相关Web应用程序根目录中的相对路径。

**InputStreamResource**

InputStreamResource 是InputStream 的Resource实现。只有在其他Resource实现不可用的时候才考虑使用它。

和其他的Resource实现相反，它是一个already-opened resource的描述器，所以isOpen()会返回true。 如果你想保存资源描述器或者多次读取一个stream， 那么不要使用它。

**ByteArrayResource**

是byte array的Resource实现， 它创建了ByteArrayInputStream。

它对于从任何给定的字节数组加载内容都很有用，而不必求助于单次使用的InputStreamResource。

## ResourceLoader

ResourceLoader用来返回Resource实例，下面是其定义：

~~~java
public interface ResourceLoader {

    Resource getResource(String location);

}
~~~

所有的 application contexts 都实现了ResourceLoader类。因此所有的application contexts 都可以用来获取Resource。

当在特定的应用程序上下文上调用getResource（），并且指定的位置路径没有特定的前缀时，将返回适合该特定应用程序上下文的资源类型。例如，假设对ClassPathXmlApplicationContext实例执行了以下代码片段：

~~~java
Resource template = ctx.getResource("some/resource/path/myTemplate.txt");
~~~

在ClassPathXmlApplicationContext中，这个方法返回ClassPathResource，如果在FileSystemXmlApplicationContext中，方法返回FileSystemResource。 在WebApplicationContext， 方法返回ServletContextResource。 他会返回和ApplicationContext相对应的Resource实现。

当然，你可以强制ClassPathResource使用，而不管ApplicationContext到底是什么。这样做你需要添加classpath:前缀。如下：

~~~java
Resource template = ctx.getResource("classpath:some/resource/path/myTemplate.txt");
~~~

同样的，你可以强制使用UrlResource通过添加标准的java.net.URL前缀。
~~~java
Resource template = ctx.getResource("file:///some/resource/path/myTemplate.txt");

Resource template = ctx.getResource("https://myhost.com/resource/path/myTemplate.txt");
~~~

## ResourceLoaderAware

ResourceLoaderAware接口是一个特殊的回调，表明该组件需要提供一个ResourceLoader的引用。 下面是ResourceLoaderAware的定义：
~~~java
public interface ResourceLoaderAware {

    void setResourceLoader(ResourceLoader resourceLoader);
}
~~~

当一个类实现了ResourceLoaderAware并被部署到application context，那么整个类就被识别为ResourceLoaderAware。 application context会去调用setResourceLoader(ResourceLoader)方法，并将其自身作为参数传入（所有的Spring application contexts 都实现了ResourceLoader 接口）。

在应用程序组件中，你也可以使用自动装载ResourceLoader，来替代使用ResourceLoaderAware接口。可以使用传统的constructor或者byType的自动装载模式。或者使用注解的方式。

## 资源作为依赖

如果想将静态资源注入到Bean中，可以简单的将String路径转换为Resource对象。 如果Bean定义了一个Resource类型的template属性，那么下面就是一个很简单的资源配置的例子：
~~~java
@Data
public class BeanA {

    private Resource template;

}
~~~

~~~xml
    <bean id="myBean" class="com.flydean.beans.BeanA">
        <property name="template" value="bean.properties"/>
    </bean>
~~~

## 构造ClassPathXmlApplicationContext-快捷方式

ClassPathXmlApplicationContext提供了一个快捷方式来查找需要加载的资源路径。

只需提供一个字符串数组，该数组只包含XML文件本身的文件名（不包含前导路径信息），还提供一个类。然后，ClassPathXmlApplicationContext从提供的类中派生路径信息。

如下：
~~~java
    public static void main(String[] args) {
        ApplicationContext ctx = new ClassPathXmlApplicationContext(
                new String[] {"beanA.xml"}, BeanA.class);
    }
~~~

下面是文件结构：

~~~java
com/
  flydean/
   beans/
    beanA.xml
    BeanA.class
~~~

## 资源路径通配符

**Ant-style Patterns**

定义资源路径可以是用Ant-style的通配符，下面是 Ant-style patterns 的路径例子：

~~~java
/WEB-INF/*-context.xml
com/mycompany/**/applicationContext.xml
file:C:/some/path/*-context.xml
classpath:com/mycompany/**/applicationContext.xml
~~~

**classpath*:前缀**

构造基于XML的application context，路径地址可以使用classpath*: 前缀，如下：

~~~java
ApplicationContext ctx =
    new ClassPathXmlApplicationContext("classpath*:conf/appContext.xml");
~~~
classpath* 和 classpath 有什么区别呢？

classpath* 会去查找所有匹配的classpath， 而classpath 只会找到第一个匹配的资源。

## FileSystemResource注意事项

未连接到FileSystemApplicationContext的FileSystemResource（即，当FileSystemApplicationContext不是实际的ResourceLoader时）会按预期处理绝对和相对路径。相对路径相对于当前工作目录，而绝对路径相对于文件系统的根目录。

但是，由于向后兼容性（历史）的原因，当FileSystemApplicationContext是ResourceLoader时，这一点会发生变化。FileSystemApplicationContext强制所有附加的FileSystemResource实例将所有位置路径视为相对路径，不管它们是否以前导斜杠开头。实际上，这意味着以下示例是等效的：

~~~java
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("conf/context.xml");

ApplicationContext ctx =
    new FileSystemXmlApplicationContext("/conf/context.xml");
~~~

在实践中，如果需要真正的绝对文件系统路径，则应避免将绝对路径与FileSystemResource或FileSystemXmlApplicationContext一起使用，并通过使用file: URL 前缀强制使用UrlResource。以下示例说明了如何执行此操作：

~~~java
// actual context type doesn't matter, the Resource will always be UrlResource
ctx.getResource("file:///some/resource/path/myTemplate.txt");

// force this FileSystemXmlApplicationContext to load its definition via a UrlResource
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("file:///conf/context.xml");
~~~

本节的例子可参考[resources](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-resources/)
