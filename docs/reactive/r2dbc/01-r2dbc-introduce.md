---
slug: /01-r2dbc-introduce
---

# 1. 响应式关系数据库处理R2DBC

# 简介

之前我们提到过，对于底层的数据源来说，MongoDB, Redis, 和 Cassandra 可以直接以reactive的方式支持Spring Data。而其他很多关系型数据库比如Postgres, Microsoft SQL Server, MySQL, H2 和 Google Spanner 则可以通过使用R2DBC 来实现对reactive的支持。

今天我们就来具体讲解一下R2DBC的使用。

# R2DBC介绍

之前我们介绍了Reactor还有基于其之上的Spring WebFlux框架。包括vert.x，rxjava等等reactive技术。我们实际上在应用层已经有很多优秀的响应式处理框架。

但是有一个问题就是所有的框架都需要获取底层的数据，而基本上关系型数据库的底层读写都还是同步的。

为了解决这个问题，出现了两个标准，一个是oracle提出的 ADBC (Asynchronous Database Access API)，另一个就是Pivotal提出的R2DBC (Reactive Relational Database Connectivity)。 

R2DBC是基于Reactive Streams标准来设计的。通过使用R2DBC，你可以使用reactive API来操作数据。

同时R2DBC只是一个开放的标准，而各个具体的数据库连接实现，需要实现这个标准。

今天我们以r2dbc-h2为例，讲解一下r2dbc在Spring webFlux中的使用。

# 项目依赖

我们需要引入r2dbc-spi和r2dbc-h2两个库，其中r2dbc-spi是接口，而r2dbc-h2是具体的实现。

同时我们使用了Spring webflux,所以还需要引入spring-boot-starter-webflux。

具体的依赖如下：

~~~xml
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

# 创建ConnectionFactory

ConnectionFactory是数据库连接的一个具体实现，通过ConnectionFactory我们可以创建到数据库的连接。

先看一下数据库的配置文件，为了方便起见，这里我们使用的是内存数据库H2 ：

~~~shell
r2dbc.url=r2dbc:h2:mem://./r2dbc
r2dbc.user=sa
r2dbc.password=password
~~~

第一个url指定的是数据库的连接方式，下面两个是数据库的用户名和密码。

接下来我们看一下，怎么通过这些属性来创建ConnectionFactory：

~~~java
    @Bean
    public ConnectionFactory connectionFactory() {
        ConnectionFactoryOptions baseOptions = ConnectionFactoryOptions.parse(url);
        ConnectionFactoryOptions.Builder ob = ConnectionFactoryOptions.builder().from(baseOptions);
        if (!StringUtil.isNullOrEmpty(user)) {
            ob = ob.option(USER, user);
        }
        if (!StringUtil.isNullOrEmpty(password)) {
            ob = ob.option(PASSWORD, password);
        }
        return ConnectionFactories.get(ob.build());
    }
~~~

通过url可以parse得到ConnectionFactoryOptions。然后通过ConnectionFactories的get方法创建ConnectionFactory。

如果我们设置了USER或者PASSWORD，还可以加上这两个配置。

# 创建Entity Bean

这里，我们创建一个简单的User对象：

~~~java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Users {

    private Long id;
    private String firstname;
    private String lastname;
}
~~~

# 初始化数据库

虽然H5有很多更加简单的方式来初始化数据库，比如直接读取SQL文件，这里为了说明R2DBC的使用，我们使用手动的方式来创建：

~~~java
    @Bean
    public CommandLineRunner initDatabase(ConnectionFactory cf) {

        return (args) ->
                Flux.from(cf.create())
                        .flatMap(c ->
                                Flux.from(c.createBatch()
                                        .add("drop table if exists Users")
                                        .add("create table Users(" +
                                                "id IDENTITY(1,1)," +
                                                "firstname varchar(80) not null," +
                                                "lastname varchar(80) not null)")
                                        .add("insert into Users(firstname,lastname)" +
                                                "values('flydean','ma')")
                                        .add("insert into Users(firstname,lastname)" +
                                                "values('jacken','yu')")
                                        .execute())
                                        .doFinally((st) -> c.close())
                        )
                        .log()
                        .blockLast();
    }
~~~

上面的代码中，我们使用c.createBatch()来向数据库插入一些数据。

除了createBatch,还可以使用create来创建单个的执行语句。

# 获取所有的用户

在Dao中，我们提供了一个findAll的方法：

~~~java
    public Flux<Users> findAll() {

        return Mono.from(connectionFactory.create())
                .flatMap((c) -> Mono.from(c.createStatement("select id,firstname,lastname from users")
                        .execute())
                        .doFinally((st) -> close(c)))
                .flatMapMany(result -> Flux.from(result.map((row, meta) -> {
                    Users acc = new Users();
                    acc.setId(row.get("id", Long.class));
                    acc.setFirstname(row.get("firstname", String.class));
                    acc.setLastname(row.get("lastname", String.class));
                    return acc;
                })));
    }
~~~

简单解释一下上面的使用。

因为是一个findAll方法，我们需要找出所有的用户信息。所以我们返回的是一个Flux而不是一个Mono。

怎么从Mono转换成为一个Flux呢？

这里我们使用的是flatMapMany，将select出来的结果，分成一行一行的，最后转换成为Flux。

# Prepare Statement

为了防止SQL注入，我们需要在SQL中使用Prepare statement:

~~~java
    public Mono<Users> findById(long id) {

        return Mono.from(connectionFactory.create())
                .flatMap(c -> Mono.from(c.createStatement("select id,firstname,lastname from Users where id = $1")
                        .bind("$1", id)
                        .execute())
                        .doFinally((st) -> close(c)))
                .map(result -> result.map((row, meta) ->
                        new Users(row.get("id", Long.class),
                                row.get("firstname", String.class),
                                row.get("lastname", String.class))))
                .flatMap( p -> Mono.from(p));
    }
~~~

看下我们是怎么在R2DBC中使用prepare statement的。

# 事务处理

接下来我们看一下怎么在R2DBC中使用事务：

~~~java
    public Mono<Users> createAccount(Users account) {

        return Mono.from(connectionFactory.create())
                .flatMap(c -> Mono.from(c.beginTransaction())
                        .then(Mono.from(c.createStatement("insert into Users(firstname,lastname) values($1,$2)")
                                .bind("$1", account.getFirstname())
                                .bind("$2", account.getLastname())
                                .returnGeneratedValues("id")
                                .execute()))
                        .map(result -> result.map((row, meta) ->
                                new Users(row.get("id", Long.class),
                                        account.getFirstname(),
                                        account.getLastname())))
                        .flatMap(pub -> Mono.from(pub))
                        .delayUntil(r -> c.commitTransaction())
                        .doFinally((st) -> c.close()));

    }
~~~

上面的代码中，我们使用了事务，具体的代码有两部分：

~~~java
c -> Mono.from(c.beginTransaction())
.delayUntil(r -> c.commitTransaction())
~~~

开启是的时候需要使用beginTransaction，后面提交就需要调用commitTransaction。

# WebFlux使用

最后，我们需要创建WebFlux应用来对外提供服务：

~~~java
    @GetMapping("/users/{id}")
    public Mono<ResponseEntity<Users>> getUsers(@PathVariable("id") Long id) {

        return usersDao.findById(id)
                .map(acc -> new ResponseEntity<>(acc, HttpStatus.OK))
                .switchIfEmpty(Mono.just(new ResponseEntity<>(null, HttpStatus.NOT_FOUND)));
    }

    @GetMapping("/users")
    public Flux<Users> getAllAccounts() {
        return usersDao.findAll();
    }

    @PostMapping("/createUser")
    public Mono<ResponseEntity<Users>> createUser(@RequestBody Users user) {
        return usersDao.createAccount(user)
                .map(acc -> new ResponseEntity<>(acc, HttpStatus.CREATED))
                .log();
    }
~~~

# 执行效果

最后，我们运行一下代码，执行下users:

~~~shell
 curl "localhost:8080/users"       
[{"id":1,"firstname":"flydean","lastname":"ma"},{"id":2,"firstname":"jacken","lastname":"yu"}]%    
~~~

完美，实验成功。

本文的代码：[webflux-with-r2dbc](https://github.com/ddean2009/learn-reactive/tree/master/webflux-with-r2dbc)


> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！




