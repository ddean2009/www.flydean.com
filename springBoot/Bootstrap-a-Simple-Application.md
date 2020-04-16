# 使用Spring Boot搭建你的第一个应用程序

Spring Boot是Spring平台的约定式的应用框架，使用Spring Boot可以更加方便简洁的开发基于Spring的应用程序，本篇文章通过一个实际的例子，来一步一步的演示如何创建一个基本的Spring Boot程序。


# 依赖配置

本例子使用Maven来做包的依赖管理，在pom.xml文件中我们需要添加Spring boot依赖：

~~~xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.2.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
~~~

同时我们要构建一个web应用程序，所以需要添加web依赖：

~~~xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
~~~

OOM框架，我们使用spring自带的jpa，数据库使用内存数据库H2：

~~~xml
 <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
~~~

# main程序配置

接下来我们需要创建一个应用程序的主类：

~~~java
@SpringBootApplication
public class App {

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

}
~~~

这里我们使用了注解： @SpringBootApplication。 它等同于三个注解：@Configuration, @EnableAutoConfiguration, 和 @ComponentScan同时使用。

最后，我们需要在resources目录中添加属性文件：application.properties。 在其中我们定义程序启动的端口：

~~~
server.port=8081
~~~

# MVC配置

spring MVC可以配合很多模板语言使用，这里我们使用Thymeleaf。

首先需要添加依赖：

~~~xml
<dependency> 
    <groupId>org.springframework.boot</groupId> 
    <artifactId>spring-boot-starter-thymeleaf</artifactId> 
</dependency>
~~~

然后在application.properties中添加如下配置：

~~~
spring.thymeleaf.cache=false
spring.thymeleaf.enabled=true
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
 
spring.application.name=Bootstrap Spring Boot
~~~

然后创建一个home页面：

~~~html
<html>
<head><title>Home Page</title></head>
<body>
<h1>Hello !</h1>
<p>Welcome to <span th:text="${appName}">Our App</span></p>
</body>
</html>
~~~

最后创建一个Controller指向这个页面：

~~~java
@Controller
public class SimpleController {
    @Value("${spring.application.name}")
    String appName;
 
    @GetMapping("/")
    public String homePage(Model model) {
        model.addAttribute("appName", appName);
        return "home";
    }
}
~~~

# 安全配置

本例主要是搭一个基本完整的框架，所以必须的安全访问控制也是需要的。我们使用Spring Security来做安全控制，加入依赖如下：

~~~xml
<dependency> 
    <groupId>org.springframework.boot</groupId> 
    <artifactId>spring-boot-starter-security</artifactId> 
</dependency>
~~~

当spring-boot-starter-security加入依赖之后，应用程序所有的入库会被默认加入权限控制，在本例中，我们还用不到这些权限控制，所以需要自定义SecurityConfig，放行所有的请求：

~~~java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
 
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .anyRequest()
            .permitAll()
            .and().csrf().disable();
    }
}
~~~

上例中，我们permit all请求。

后面我又会详细的关于Spring Security的教程。这里先不做深入讨论。

# 存储

本例中，我们定义一个Book类，那么需要定义相应的Entity类：

~~~java
@Entity
public class Book {
  
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
 
    @Column(nullable = false, unique = true)
    private String title;
 
    @Column(nullable = false)
    private String author;
}
~~~

和相应的Repository类：

~~~java
public interface BookRepository extends CrudRepository<Book, Long> {
    List<Book> findByTitle(String title);
}
~~~

最后，我们需要让应用程序发现我们配置的存储类，如下：

~~~
@EnableJpaRepositories("com.flydean.learn.repository")
@EntityScan("com.flydean.learn.entity")
@SpringBootApplication
public class App {

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

}
~~~

这里，我们使用@EnableJpaRepositories 来扫描repository类。

使用@EntityScan来扫描JPA entity类。

为了方便起见，我们使用内存数据库H2. 一旦H2在依赖包里面，Spring boot会自动检测到，并使用它。 我们需要配置一些H2的属性：

~~~
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.url=jdbc:h2:mem:bootapp;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=
~~~

和安全一样，存储也是一个非常重要和复杂的课题，我们也会在后面的文章中讨论。

# Web 页面和Controller

有了Book entity， 我们需要为Book写一个Controller，主要做增删改查的操作，如下所示：

~~~java
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @GetMapping
    public Iterable findAll() {
        return bookRepository.findAll();
    }

    @GetMapping("/title/{bookTitle}")
    public List findByTitle(@PathVariable String bookTitle) {
        return bookRepository.findByTitle(bookTitle);
    }

    @GetMapping("/{id}")
    public Book findOne(@PathVariable Long id) {
        return bookRepository.findById(id)
                .orElseThrow(BookNotFoundException::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book create(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        bookRepository.findById(id)
                .orElseThrow(BookNotFoundException::new);
        bookRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public Book updateBook(@RequestBody Book book, @PathVariable Long id) {
        if (book.getId() != id) {
            throw new BookIdMismatchException("ID mismatch!");
        }
        bookRepository.findById(id)
                .orElseThrow(BookNotFoundException::new);
        return bookRepository.save(book);
    }
}
~~~

这里我们使用@RestController 注解，表示这个Controller是一个API，不涉及到页面的跳转。

@RestController是@Controller 和 @ResponseBody 的集合。

# 异常处理

基本上我们的程序已经完成了，但是在Controller中，我们定义了一些自定义的异常：

~~~java
public class BookNotFoundException extends RuntimeException {
 
    public BookNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    // ...
}
~~~

那么怎么处理这些异常呢？我们可以使用@ControllerAdvice来拦截这些异常：

~~~java
@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {
 
    @ExceptionHandler({ BookNotFoundException.class })
    protected ResponseEntity<Object> handleNotFound(
      Exception ex, WebRequest request) {
        return handleExceptionInternal(ex, "Book not found", 
          new HttpHeaders(), HttpStatus.NOT_FOUND, request);
    }
 
    @ExceptionHandler({ BookIdMismatchException.class, 
      ConstraintViolationException.class, 
      DataIntegrityViolationException.class })
    public ResponseEntity<Object> handleBadRequest(
      Exception ex, WebRequest request) {
        return handleExceptionInternal(ex, ex.getLocalizedMessage(), 
          new HttpHeaders(), HttpStatus.BAD_REQUEST, request);
    }
}
~~~

这种异常捕获也叫做全局异常捕获。

# 测试

我们的Book API已经写好了，接下来我们需要写一个测试程序来测试一下。

这里我们使用@SpringBootTest ：

~~~java
@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public class SpringContextTest {

    @Test
    public void contextLoads() {
        log.info("contextLoads");
    }
}
~~~

webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT的作用是表示测试时候使用的Spring boot应用程序端口使用自定义在application.properties中的端口。

接下来我们使用RestAssured来测试BookController：

~~~java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
public class SpringBootBootstrapTest {

    private static final String API_ROOT
            = "http://localhost:8081/api/books";

    private Book createRandomBook() {
        Book book = new Book();
        book.setTitle(randomAlphabetic(10));
        book.setAuthor(randomAlphabetic(15));
        return book;
    }

    private String createBookAsUri(Book book) {
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(book)
                .post(API_ROOT);
        return API_ROOT + "/" + response.jsonPath().get("id");
    }


    @Test
    public void whenGetAllBooks_thenOK() {
        Response response = RestAssured.get(API_ROOT);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
    }

    @Test
    public void whenGetBooksByTitle_thenOK() {
        Book book = createRandomBook();
        createBookAsUri(book);
        Response response = RestAssured.get(
                API_ROOT + "/title/" + book.getTitle());

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertTrue(response.as(List.class)
                .size() > 0);
    }
    @Test
    public void whenGetCreatedBookById_thenOK() {
        Book book = createRandomBook();
        String location = createBookAsUri(book);
        Response response = RestAssured.get(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals(book.getTitle(), response.jsonPath()
                .get("title"));
    }

    @Test
    public void whenGetNotExistBookById_thenNotFound() {
        Response response = RestAssured.get(API_ROOT + "/" + randomNumeric(4));

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode());
    }

    @Test
    public void whenCreateNewBook_thenCreated() {
        Book book = createRandomBook();
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(book)
                .post(API_ROOT);

        assertEquals(HttpStatus.CREATED.value(), response.getStatusCode());
    }

    @Test
    public void whenInvalidBook_thenError() {
        Book book = createRandomBook();
        book.setAuthor(null);
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(book)
                .post(API_ROOT);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatusCode());
    }

    @Test
    public void whenUpdateCreatedBook_thenUpdated() {
        Book book = createRandomBook();
        String location = createBookAsUri(book);
        book.setId(Long.parseLong(location.split("api/books/")[1]));
        book.setAuthor("newAuthor");
        Response response = RestAssured.given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(book)
                .put(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());

        response = RestAssured.get(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());
        assertEquals("newAuthor", response.jsonPath()
                .get("author"));
    }

    @Test
    public void whenDeleteCreatedBook_thenOk() {
        Book book = createRandomBook();
        String location = createBookAsUri(book);
        Response response = RestAssured.delete(location);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode());

        response = RestAssured.get(location);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode());
    }
}
~~~

写好了测试类，运行就行了。

# 结论

你的第一个Spring Boot程序就完成了，后面的文章我们会继续丰富和改善这个基本框架，欢迎继续关注。

本文章的例子代码可以参考github： [bootstrap-sample-app](https://github.com/ddean2009/learn-springboot2/tree/master/bootstrap-sample-app)







