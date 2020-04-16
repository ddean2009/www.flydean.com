# Spring Boot的TestRestTemplate使用

TestRestTemplate和RestTemplate很类似，不过它是专门用在测试环境中的，本文我们将会讲述TestRestTemplate的一些常用方法。

如果我们在测试环境中使用@SpringBootTest，则可以直接使用TestRestTemplate。

## 添加maven依赖

要使用TestRestTemplate，我们需要首先添加如下的maven依赖：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-test</artifactId>
</dependency>
~~~

## TestRestTemplate VS RestTemplate

TestRestTemplate和RestTemplate的功能很类似，都可以用来和HTTP API进行交互。实际上TestRestTemplate就是RestTemplate的封装。 我们看下TestRestTemplate的代码：

~~~java
public class TestRestTemplate {

	private final RestTemplateBuilder builder;

	private final HttpClientOption[] httpClientOptions;

	private final RestTemplate restTemplate;
    ...

    	public void setUriTemplateHandler(UriTemplateHandler handler) {
		this.restTemplate.setUriTemplateHandler(handler);
	}

...
~~~

以setUriTemplateHandler为例，我们看到实际上TestRestTemplate调用了restTemplate里面的具体方法。

我们看一下TestRestTemplate基本的使用：

~~~java
    @Test
    public void testGet (){
        TestRestTemplate testRestTemplate = new TestRestTemplate();
        ResponseEntity<String> response = testRestTemplate.
                getForEntity(FOO_RESOURCE_URL + "/1", String.class);

        assertThat(response.getStatusCode(), equalTo(HttpStatus.OK));
    }
~~~

## 使用Basic Auth Credentials

TestRestTemplate封装了基本的Auth Credentials，我们可以这样使用：

~~~java
TestRestTemplate testRestTemplate
 = new TestRestTemplate("user", "passwd");
ResponseEntity<String> response = testRestTemplate.
  getForEntity(URL_SECURED_BY_AUTHENTICATION, String.class);
  
assertThat(response.getStatusCode(), equalTo(HttpStatus.OK));
~~~


## 使用HttpClientOption

HttpClientOption提供了如下几个选项：ENABLE_COOKIES, ENABLE_REDIRECTS, 和 SSL。

我们看下TestRestTemplate怎么使用：

~~~java
TestRestTemplate testRestTemplate = new TestRestTemplate("user", 
  "passwd", TestRestTemplate.HttpClientOption.ENABLE_COOKIES);
ResponseEntity<String> response = testRestTemplate.
  getForEntity(URL_SECURED_BY_AUTHENTICATION, String.class);
  
assertThat(response.getStatusCode(), equalTo(HttpStatus.OK))；
~~~

如果我们不需要认证，则可以这样使用：

~~~java
TestRestTemplate(TestRestTemplate.HttpClientOption.ENABLE_COOKIES)
~~~

我们也可以在创建TestRestTemplate之后添加认证：

~~~java
TestRestTemplate testRestTemplate = new TestRestTemplate();
ResponseEntity<String> response = testRestTemplate.withBasicAuth(
  "user", "passwd").getForEntity(URL_SECURED_BY_AUTHENTICATION, 
  String.class);
  
assertThat(response.getStatusCode(), equalTo(HttpStatus.OK));
~~~

## 使用RestTemplateBuilder

RestTemplateBuilder为我们提供了自定义RestTemplate的机会，我们可以使用它来对RestTemplate进行封装：

~~~java
RestTemplateBuilder restTemplateBuilder = new RestTemplateBuilder();
restTemplateBuilder.configure(restTemplate);
TestRestTemplate testRestTemplate = new TestRestTemplate(restTemplateBuilder);
ResponseEntity<String> response = testRestTemplate.getForEntity(
  FOO_RESOURCE_URL + "/1", String.class);
  
assertThat(response.getStatusCode(), equalTo(HttpStatus.OK));
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-testRestTemplate](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-testRestTemplate)
