---
slug: /springboot-Internationalization
---

# 18. Spring Boot国际化支持

国际化支持应该是所有的做国际化网站都需要考虑的一个问题，Spring Boot为国际化提供了强有力的支持，本文将会通过一个例子来讲解Spring Boot的国际化。

## 添加Maven支持

Spring Boot本身就支持国际化，我们这里添加一个模板支持来通过页面来展示，我们这里添加thymeleaf模板：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
~~~

## LocaleResolver

我们需要为系统指定一个默认的LocaleResolver：

~~~java
@Bean
public LocaleResolver localeResolver() {
    SessionLocaleResolver slr = new SessionLocaleResolver();
    slr.setDefaultLocale(Locale.US);
    return slr;
}
~~~

上面的例子中我们自定义了一个SessionLocaleResolver，并且指定了默认的Locale。

## LocaleChangeInterceptor

接下来，我们定义一个LocaleChangeInterceptor来接收Locale的变动。这里我们通过lang参数来接收。

~~~java
@Bean
public LocaleChangeInterceptor localeChangeInterceptor() {
    LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
    lci.setParamName("lang");
    return lci;
}
~~~

当然，我们需要将这个Interceptor注册到SpringMVC中：

~~~java
@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(localeChangeInterceptor());
}
~~~

## 定义Message Sources

默认情况下，Spring Boot会在src/main/resources查找message文件，默认的message文件是messages.properties,如果指定了某种语言，那么就是messages_XX.properties，其中XX是Local code。 

messages.properties是key value的格式，如果在对应的local文件中没找到相应的key，则会在默认的messages.properties中查找。

我们默认定义英语的messages.properties如下：

~~~txt
greeting=Hello! Welcome to our website!
lang.change=Change the language
lang.eng=English
lang.fr=French
~~~

同时我们定义一个法语的message文件messages_fr.properties ：

~~~txt
greeting=Bonjour! Bienvenue sur notre site!
lang.change=Changez la langue
lang.eng=Anglais
lang.fr=Francais
~~~

## Controller文件

我们定义一个跳转的controller文件：

~~~java
@Controller
public class PageController {

    @GetMapping("/international")
    public String getInternationalPage() {
        return "international";
    }
}
~~~

## html文件

相应的html文件如下:

~~~html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="ISO-8859-1" />
    <title>Home</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script>
        $(document).ready(function() {
            $("#locales").change(function () {
                var selectedOption = $('#locales').val();
                if (selectedOption != ''){
                    window.location.replace('international?lang=' + selectedOption);
                }
            });
        });
    </script>
</head>
<body>
<h1 th:text="#{greeting}"></h1>

<br /><br />
<span th:text="#{lang.change}"></span>:
<select id="locales">
    <option value=""></option>
    <option value="en" th:text="#{lang.eng}"></option>
    <option value="fr" th:text="#{lang.fr}"></option>
</select>
</body>
</html>
~~~

## 运行应用程序

好了，接下来我们可以运行了。

如果我们访问http://localhost:8080/international?lang=en ， 则会读取默认的英语资源：

![](https://img-blog.csdnimg.cn/20200209224847574.png)

通过切换到法语环境：http://localhost:8080/international?lang=fr， 我们可以看到：

![](https://img-blog.csdnimg.cn/20200209225039717.png)

环境已经切换过来了。

本文的例子可以参考：[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-Internationalization](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-Internationalization)

更多教程请参考 [flydean的博客](www.flydean.com)


