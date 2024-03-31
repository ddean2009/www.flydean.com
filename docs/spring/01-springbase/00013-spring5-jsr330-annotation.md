---
slug: /spring5-jsr330-annotation
---

# 13. jsr330 annotation

之前的文章我们有讲过，从Spring3.0之后，除了Spring自带的注解，我们也可以使用JSR330的标准注解。不过需要加入maven依赖如下：
~~~xml
    <dependencies>
    <dependency>
        <groupId>javax.inject</groupId>
        <artifactId>javax.inject</artifactId>
        <version>1</version>
    </dependency>
    </dependencies>
~~~

下面是标准注解和Spring注解的区别：

Spring|javax.inject.*|javax.inject限制/描述
-|-|-|
@Autowired| @Inject|@Inject没有required属性，可以使用Java8的Optional代替
@Component|	@Named / @ManagedBean | JSR-330没有提供组合模式，只有一种方式来标记命名组件
@Scope("singleton")|@Singleton|JSR-330默认范围类似Spring的prototype，但是为了和Spring的默认值保持一致，在Spring中定义的JSR-330 bean默认是singleton。如果要使用其他的作用范围，那么需要使用Spring的@Scope注解。javax.inject也提供了一个@Scope注解。但是这个注解仅用来创建你自己的注解。
@Qualifier|@Qualifier / @Named|javax.inject.Qualifier只是一个用来构建自定义Qualifier的元注解。具体的字符串限定符（如带value的Spring的@Qualifier）可以通过javax.inject.Named关联。
@Value|-|没有相同功能
@Required|-|没有相同功能
@Lazy|-|没有相同功能
ObjectFactory|Provider|javax.inject.Provider是Spring的ObjectFactory的直接替代品，它只使用了较短的get（）方法名。它还可以与Spring的@Autowired结合使用，或者与无注解的构造函数和setter方法结合使用。

下面我们分别来介绍。

## @Inject 和 @Named 

@Inject可以用来替换@Autowired：
~~~java
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    public void listMovies() {
        this.movieFinder.findMovies();
    }
}
~~~

与@Autowired一样，你可以在字段级、方法级和构造函数参数级使用@Inject。此外，可以将注入点声明为Provider，允许通过Provider.get() 调用按需访问较短作用域的bean或延迟访问其他bean。下面是Provider的例子：
~~~java
public class SimpleMovieProviderLister {
    private Provider<MovieFinder> movieFinder;

    @Inject
    public void setMovieFinder(Provider<MovieFinder> movieFinder) {
        this.movieFinder = movieFinder;
    }

    public void listMovies() {
        this.movieFinder.get().findMovies();
    }
}
~~~

可以使用@Named注解来为注入的参数限定名字：
~~~java
    @Inject
    public void setMovieFinderNamed(@Named("main") MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }
~~~

与@Autowired一样，@Inject也可以与java.util.Optional或@Nullable一起使用。下面是例子：
~~~java
    @Inject
    public void setMovieFinder(Optional<MovieFinder> movieFinder) {
    }

    @Inject
    public void setMovieFinder(@Nullable MovieFinder movieFinder) {
    }
~~~

## @Named 和 @ManagedBean

除了使用@Component，你也可以使用@javax.inject.Named 或者 javax.annotation.ManagedBean，如下：

~~~java
@Named("movieListener")  // @ManagedBean("movieListener") could be used as well
public class SimpleMovieNamedLister {
    
    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

}
~~~

本节的例子可以参考[jsr330](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-jsr330-annotation/)
