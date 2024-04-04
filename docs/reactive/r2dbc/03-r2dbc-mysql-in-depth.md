---
slug: /03-r2dbc-mysql-in-depth
---

# 3. 深入理解r2dbc-mysql

# 简介

mysql应该是我们在日常工作中使用到的一个非常普遍的数据库，虽然mysql现在是oracle公司的，但是它是开源的，市场占有率还是非常高的。

今天我们将会介绍r2dbc在mysql中的使用。

# r2dbc-mysql的maven依赖

要想使用r2dbc-mysql，我们需要添加如下的maven依赖：

~~~xml
<dependency>
    <groupId>dev.miku</groupId>
    <artifactId>r2dbc-mysql</artifactId>
    <version>0.8.2.RELEASE</version>
</dependency>
~~~

当然，如果你想使用snapshot版本的话，可以这样：

~~~xml
<dependency>
    <groupId>dev.miku</groupId>
    <artifactId>r2dbc-mysql</artifactId>
    <version>${r2dbc-mysql.version}.BUILD-SNAPSHOT</version>
</dependency>

<repository>
    <id>sonatype-snapshots</id>
    <name>SonaType Snapshots</name>
    <url>https://oss.sonatype.org/content/repositories/snapshots</url>
    <snapshots>
        <enabled>true</enabled>
    </snapshots>
</repository>
~~~

# 创建connectionFactory

创建connectionFactory的代码实际上使用的r2dbc的标准接口，所以和之前讲到的h2的创建代码基本上是一样的：

~~~java
// Notice: the query string must be URL encoded
ConnectionFactory connectionFactory = ConnectionFactories.get(
    "r2dbcs:mysql://root:database-password-in-here@127.0.0.1:3306/r2dbc?" +
    "zeroDate=use_round&" +
    "sslMode=verify_identity&" +
    "useServerPrepareStatement=true&" +
    "tlsVersion=TLSv1.3%2CTLSv1.2%2CTLSv1.1&" +
    "sslCa=%2Fpath%2Fto%2Fmysql%2Fca.pem&" +
    "sslKey=%2Fpath%2Fto%2Fmysql%2Fclient-key.pem&" +
    "sslCert=%2Fpath%2Fto%2Fmysql%2Fclient-cert.pem&" +
    "sslKeyPassword=key-pem-password-in-here"
)

// Creating a Mono using Project Reactor
Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

不同的是ConnectionFactories传入的参数不同。

我们也支持unix domain socket的格式：

~~~java
// Minimum configuration for unix domain socket
ConnectionFactory connectionFactory = ConnectionFactories.get("r2dbc:mysql://root@unix?unixSocket=%2Fpath%2Fto%2Fmysql.sock")

Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

同样的，我们也支持从ConnectionFactoryOptions中创建ConnectionFactory：

~~~java
ConnectionFactoryOptions options = ConnectionFactoryOptions.builder()
    .option(DRIVER, "mysql")
    .option(HOST, "127.0.0.1")
    .option(USER, "root")
    .option(PORT, 3306)  // optional, default 3306
    .option(PASSWORD, "database-password-in-here") // optional, default null, null means has no password
    .option(DATABASE, "r2dbc") // optional, default null, null means not specifying the database
    .option(CONNECT_TIMEOUT, Duration.ofSeconds(3)) // optional, default null, null means no timeout
    .option(SSL, true) // optional, default sslMode is "preferred", it will be ignore if sslMode is set
    .option(Option.valueOf("sslMode"), "verify_identity") // optional, default "preferred"
    .option(Option.valueOf("sslCa"), "/path/to/mysql/ca.pem") // required when sslMode is verify_ca or verify_identity, default null, null means has no server CA cert
    .option(Option.valueOf("sslCert"), "/path/to/mysql/client-cert.pem") // optional, default null, null means has no client cert
    .option(Option.valueOf("sslKey"), "/path/to/mysql/client-key.pem") // optional, default null, null means has no client key
    .option(Option.valueOf("sslKeyPassword"), "key-pem-password-in-here") // optional, default null, null means has no password for client key (i.e. "sslKey")
    .option(Option.valueOf("tlsVersion"), "TLSv1.3,TLSv1.2,TLSv1.1") // optional, default is auto-selected by the server
    .option(Option.valueOf("sslHostnameVerifier"), "com.example.demo.MyVerifier") // optional, default is null, null means use standard verifier
    .option(Option.valueOf("sslContextBuilderCustomizer"), "com.example.demo.MyCustomizer") // optional, default is no-op customizer
    .option(Option.valueOf("zeroDate"), "use_null") // optional, default "use_null"
    .option(Option.valueOf("useServerPrepareStatement"), true) // optional, default false
    .option(Option.valueOf("tcpKeepAlive"), true) // optional, default false
    .option(Option.valueOf("tcpNoDelay"), true) // optional, default false
    .option(Option.valueOf("autodetectExtensions"), false) // optional, default false
    .build();
ConnectionFactory connectionFactory = ConnectionFactories.get(options);

// Creating a Mono using Project Reactor
Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

或者下面的unix domain socket格式：

~~~java
// Minimum configuration for unix domain socket
ConnectionFactoryOptions options = ConnectionFactoryOptions.builder()
    .option(DRIVER, "mysql")
    .option(Option.valueOf("unixSocket"), "/path/to/mysql.sock")
    .option(USER, "root")
    .build();
ConnectionFactory connectionFactory = ConnectionFactories.get(options);

Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

# 使用MySqlConnectionFactory创建connection

上面的例子中，我们使用的是通用的r2dbc api来创建connection，同样的，我们也可以使用特有的MySqlConnectionFactory来创建connection：

~~~java
MySqlConnectionConfiguration configuration = MySqlConnectionConfiguration.builder()
    .host("127.0.0.1")
    .user("root")
    .port(3306) // optional, default 3306
    .password("database-password-in-here") // optional, default null, null means has no password
    .database("r2dbc") // optional, default null, null means not specifying the database
    .serverZoneId(ZoneId.of("Continent/City")) // optional, default null, null means query server time zone when connection init
    .connectTimeout(Duration.ofSeconds(3)) // optional, default null, null means no timeout
    .sslMode(SslMode.VERIFY_IDENTITY) // optional, default SslMode.PREFERRED
    .sslCa("/path/to/mysql/ca.pem") // required when sslMode is VERIFY_CA or VERIFY_IDENTITY, default null, null means has no server CA cert
    .sslCert("/path/to/mysql/client-cert.pem") // optional, default has no client SSL certificate
    .sslKey("/path/to/mysql/client-key.pem") // optional, default has no client SSL key
    .sslKeyPassword("key-pem-password-in-here") // optional, default has no client SSL key password
    .tlsVersion(TlsVersions.TLS1_3, TlsVersions.TLS1_2, TlsVersions.TLS1_1) // optional, default is auto-selected by the server
    .sslHostnameVerifier(MyVerifier.INSTANCE) // optional, default is null, null means use standard verifier
    .sslContextBuilderCustomizer(MyCustomizer.INSTANCE) // optional, default is no-op customizer
    .zeroDateOption(ZeroDateOption.USE_NULL) // optional, default ZeroDateOption.USE_NULL
    .useServerPrepareStatement() // Use server-preparing statements, default use client-preparing statements
    .tcpKeepAlive(true) // optional, controls TCP Keep Alive, default is false
    .tcpNoDelay(true) // optional, controls TCP No Delay, default is false
    .autodetectExtensions(false) // optional, controls extension auto-detect, default is true
    .extendWith(MyExtension.INSTANCE) // optional, manual extend an extension into extensions, default using auto-detect
    .build();
ConnectionFactory connectionFactory = MySqlConnectionFactory.from(configuration);

// Creating a Mono using Project Reactor
Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

或者下面的unix domain socket方式：

~~~java
// Minimum configuration for unix domain socket
MySqlConnectionConfiguration configuration = MySqlConnectionConfiguration.builder()
    .unixSocket("/path/to/mysql.sock")
    .user("root")
    .build();
ConnectionFactory connectionFactory = MySqlConnectionFactory.from(configuration);

Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

# 执行statement

首先看一个简单的不带参数的statement:

~~~java
connection.createStatement("INSERT INTO `person` (`first_name`, `last_name`) VALUES ('who', 'how')")
    .execute(); // return a Publisher include one Result
~~~

然后看一个带参数的statement:

~~~java
connection.createStatement("INSERT INTO `person` (`birth`, `nickname`, `show_name`) VALUES (?, ?name, ?name)")
    .bind(0, LocalDateTime.of(2019, 6, 25, 12, 12, 12))
    .bind("name", "Some one") // Not one-to-one binding, call twice of native index-bindings, or call once of name-bindings.
    .add()
    .bind(0, LocalDateTime.of(2009, 6, 25, 12, 12, 12))
    .bind(1, "My Nickname")
    .bind(2, "Naming show")
    .returnGeneratedValues("generated_id")
    .execute(); // return a Publisher include two Results.
~~~

> 注意，如果参数是null的话，可以使用bindNull来进行null值的绑定。

接下来我们看一个批量执行的操作：

~~~java
connection.createBatch()
    .add("INSERT INTO `person` (`first_name`, `last_name`) VALUES ('who', 'how')")
    .add("UPDATE `earth` SET `count` = `count` + 1 WHERE `id` = 'human'")
    .execute(); // return a Publisher include two Results.
~~~

# 执行事务

我们看一个执行事务的例子：

~~~java
connection.beginTransaction()
    .then(Mono.from(connection.createStatement("INSERT INTO `person` (`first_name`, `last_name`) VALUES ('who', 'how')").execute()))
    .flatMap(Result::getRowsUpdated)
    .thenMany(connection.createStatement("INSERT INTO `person` (`birth`, `nickname`, `show_name`) VALUES (?, ?name, ?name)")
        .bind(0, LocalDateTime.of(2019, 6, 25, 12, 12, 12))
        .bind("name", "Some one")
        .add()
        .bind(0, LocalDateTime.of(2009, 6, 25, 12, 12, 12))
        .bind(1, "My Nickname")
        .bind(2, "Naming show")
        .returnGeneratedValues("generated_id")
        .execute())
    .flatMap(Result::getRowsUpdated)
    .then(connection.commitTransaction());
~~~

# 使用线程池

为了提升数据库的执行效率，减少建立连接的开销，一般数据库连接都会有连接池的概念，同样的r2dbc也有一个叫做r2dbc-pool的连接池。

r2dbc-pool的依赖：

~~~xml
<dependency>
  <groupId>io.r2dbc</groupId>
  <artifactId>r2dbc-pool</artifactId>
  <version>${version}</version>
</dependency>
~~~

如果你想使用snapshot版本，也可以这样指定：

~~~xml
<dependency>
  <groupId>io.r2dbc</groupId>
  <artifactId>r2dbc-pool</artifactId>
  <version>${version}.BUILD-SNAPSHOT</version>
</dependency>

<repository>
  <id>spring-libs-snapshot</id>
  <name>Spring Snapshot Repository</name>
  <url>https://repo.spring.io/libs-snapshot</url>
</repository>
~~~

看一下怎么指定数据库连接池：

~~~java
ConnectionFactory connectionFactory = ConnectionFactories.get("r2dbc:pool:<my-driver>://<host>:<port>/<database>[?maxIdleTime=PT60S[&…]");

Publisher<? extends Connection> connectionPublisher = connectionFactory.create();
~~~

可以看到，我们只需要在连接URL上面添加pool这个driver即可。

同样的，我们也可以通过ConnectionFactoryOptions来创建：

~~~java
ConnectionFactory connectionFactory = ConnectionFactories.get(ConnectionFactoryOptions.builder()
   .option(DRIVER, "pool")
   .option(PROTOCOL, "postgresql") // driver identifier, PROTOCOL is delegated as DRIVER by the pool.
   .option(HOST, "…")
   .option(PORT, "…") 
   .option(USER, "…")
   .option(PASSWORD, "…")
   .option(DATABASE, "…")
   .build());

Publisher<? extends Connection> connectionPublisher = connectionFactory.create();

// Alternative: Creating a Mono using Project Reactor
Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

最后， 你也可以直接通过创建ConnectionPoolConfiguration来使用线程池：

~~~java
ConnectionFactory connectionFactory = …;

ConnectionPoolConfiguration configuration = ConnectionPoolConfiguration.builder(connectionFactory)
   .maxIdleTime(Duration.ofMillis(1000))
   .maxSize(20)
   .build();

ConnectionPool pool = new ConnectionPool(configuration);
 

Mono<Connection> connectionMono = pool.create();

// later

Connection connection = …;
Mono<Void> release = connection.close(); // released the connection back to the pool

// application shutdown
pool.dispose();
~~~



> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](http://www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！





