---
slug: /04-spring-data-r2dbc
---

# 4. 在Spring data中使用r2dbc

# 简介

上篇文章我们讲到了怎么在Spring webFlux中使用r2dbc,今天我们看一下怎么使用spring-data-r2dbc这个Spring data对r2dbc的封装来进行r2dbc操作。

# 依赖关系

要使用Spring-datea-r2dbc需要配置下面的依赖关系：

~~~xml

    <dependencies>
        <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-r2dbc</artifactId>
        <version>2.3.3.RELEASE</version>
    </dependency>

        <!-- R2DBC H2 Driver -->
        <dependency>
            <groupId>io.r2dbc</groupId>
            <artifactId>r2dbc-h2</artifactId>
            <version>${r2dbc-h2.version}</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>
~~~

# 数据库连接配置

Spring-data-r2dbc使用的是R2dbcProperties来进行配置文件的读取：

简单看一下R2dbcProperties的定义：

~~~java
@ConfigurationProperties(prefix = "spring.r2dbc")
public class R2dbcProperties {

	/**
	 * Database name. Set if no name is specified in the url. Default to "testdb" when
	 * using an embedded database.
	 */
	private String name;

	/**
	 * Whether to generate a random database name. Ignore any configured name when
	 * enabled.
	 */
	private boolean generateUniqueName;

	/**
	 * R2DBC URL of the database. database name, username, password and pooling options
	 * specified in the url take precedence over individual options.
	 */
	private String url;

	/**
	 * Login username of the database. Set if no username is specified in the url.
	 */
	private String username;

	/**
	 * Login password of the database. Set if no password is specified in the url.
	 */
	private String password;
~~~

相应的，看一下我们的配置文件是怎么样的：

~~~shell
spring.r2dbc.url=r2dbc:h2:mem://./testdb
spring.r2dbc.username=sa
spring.r2dbc.password=password
~~~

这里，我们使用的是H2数据库。

# 数据库初始化

数据库初始化过程中，我们需要创建一个users表格，这里我们在一个initDatabase bean中实现：

~~~java
    @Bean
    public ApplicationRunner initDatabase(DatabaseClient client, UsersDao usersDao) {
        List<String> statements = Arrays.asList(
                "DROP TABLE IF EXISTS USERS;",
                "CREATE TABLE IF NOT EXISTS USERS ( id SERIAL PRIMARY KEY, firstname VARCHAR(100) NOT NULL, lastname VARCHAR(100) NOT NULL);");

        statements.forEach(sql -> executeSql(client,sql)
                .doOnSuccess(count -> log.info("Schema created, rows updated: {}", count))
                .doOnError(error -> log.error("got error : {}",error.getMessage(),error))
                .subscribe()
        );

        return args ->getUser().flatMap(usersDao::save).subscribe(user -> log.info("User saved: {}", user));

    }

    private Flux<Users> getUser() {
        return Flux.just(new Users(null, "John", "Doe"), new Users(null, "Jane", "Doe"));
    }

    private Mono<Integer> executeSql(DatabaseClient client, String sql) {
        return client.execute(sql).fetch().rowsUpdated();
    }
~~~

上面的例子中，我们创建数据库分为了两部分，第一部分是数据库schema的操作，我们执行了drop和create table的操作。

第二部分是向数据库表中插入数据。

注意，上面的两部分操作都需要执行subscribe操作，以触发真正的Reactive操作。

# DAO操作

在DAO操作之前，我们需要创建Users entity：

~~~java
@Data
@AllArgsConstructor
public class Users {

    @Id
    private Integer id;
    private String firstname;
    private String lastname;

    boolean hasId() {
        return id != null;
    }
}
~~~

再看一下我们创建的UserDao：

~~~java
public interface UsersDao extends ReactiveCrudRepository<Users, Long> {

    @Query("select id, firstname, lastname from users c where c.lastname = :lastname")
    Flux<Users> findByLastname(String lastname);
}

~~~

注意，这里并不需要添加@Component注解，因为我们继承了ReactiveCrudRepository，会自动帮我们创建UsersDao的实例，我们直接使用就可以了。

ReactiveCrudRepository为我们封装了一些DAO的基本操作，比如save，saveAll, findById ,existsById等基础操作。

当然，我们也可以自定义自己的SQL语句，比如上面的findByLastname。

# Service操作和Transaction

我们看一下怎么使用UserDao来进行具体的方法操作：

~~~java
@Component
public class UsersService {

    @Resource
    private UsersDao usersDao;

    @Transactional
    public Mono<Users> save(Users user) {

        return usersDao.save(user).map(it -> {

            if (it.getFirstname().equals("flydean")) {
                throw new IllegalStateException();
            } else {
                return it;
            }
        });
    }

}
~~~

上面我们创建了一个save方法，用来保存相应的User对象。

# controller

最后，我们创建一个controller来对外暴露相应的方法：

~~~java
@RestController
@RequiredArgsConstructor
public class UsersController {

    private final UsersDao usersDao;

    @GetMapping("/users")
    public Flux<Users> findAll() {
        return usersDao.findAll();
    }
}
~~~

# 测试

好了，现在我们的程序已经写好了，可以进行测试了。

运行程序，执行：

~~~shell
curl "localhost:8080/users"    
[{"id":1,"firstname":"John","lastname":"Doe"},{"id":2,"firstname":"Jane","lastname":"Doe"}]%       
~~~

可以看到取出了相应的结果。

完美，实验成功。

本文的代码：[spring-data-r2dbc](https://github.com/ddean2009/learn-reactive/tree/master/spring-data-r2dbc)


> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！









