# 在Spring Boot中自定义filter

本文我们将会讲解如何在Spring Boot中自定义filter并指定执行顺序。

定义Filter很简单，我们只需要实现Filter接口即可，同时我们可指定@Order来确定其执行顺序，我们定义两个filter如下：

~~~java
@Slf4j
@Component
@Order(1)
public class TransactionFilter implements Filter {

    @Override
    public void doFilter(
    ServletRequest request,
    ServletResponse response,
    FilterChain chain) throws IOException, ServletException

    {

        HttpServletRequest req = (HttpServletRequest) request;
        log.info(
                "Starting a transaction for req : {}",
                req.getRequestURI());

        chain.doFilter(request, response);
        log.info(
                "Committing a transaction for req : {}",
                req.getRequestURI());
    }

    // other methods
}
~~~

~~~java
@Slf4j
@Component
@Order(2)
public class RequestResponseLoggingFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        log.info(
                "Logging Request  {} : {}", req.getMethod(),
                req.getRequestURI());
        chain.doFilter(request, response);
        log.info(
                "Logging Response :{}",
                res.getContentType());
    }

    // other methods
}
~~~

> 注意在Spring Boot中我们需要使用@Component来实例化Filter从而在Spring Boot中生效。

@Order指定了两个fiter的顺序。

上面的例子我们指定了两个fiter对于所有的url生效，如果我们希望filter对于特定的某些url生效该怎么办呢？

我们可使用FilterRegistrationBean来手动注册对于的Filter：

~~~java
    @Bean
    public FilterRegistrationBean<UrlFilter> loggingFilter(){
        FilterRegistrationBean<UrlFilter> registrationBean
                = new FilterRegistrationBean<>();

        registrationBean.setFilter(new UrlFilter());
        registrationBean.addUrlPatterns("/users/*");

        return registrationBean;
    }
~~~

上面我们同时指定了filter对应的urlPatttern。

本文的例子可以参考 [https://github.com/ddean2009/learn-springboot2/tree/master/springboot-filter](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-filter)

更多教程请参考 [flydean的博客](www.flydean.com)


