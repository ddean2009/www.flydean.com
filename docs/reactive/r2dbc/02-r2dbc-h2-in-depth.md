---
slug: /02-r2dbc-h2-in-depth
---

# 2. 深入理解h2和r2dbc-h2

# 简介

本文将会介绍R2DBC的H2实现r2dbc-h2的使用方法和要注意的事项。一起来看看吧。

# H2数据库简介

什么是H2数据库呢？

H2是一个Java SQL database，它是一个开源的数据库，运行起来非常快。

H2流行的原因是它既可以当做一个独立的服务器，也可以以一个嵌套的服务运行，并且支持纯内存形式运行。

H2的jar包非常小，只有2M大小，所以非常适合做嵌套式数据库。

如果作为嵌入式数据库，则需要将h2*.jar添加到classpath中。

下面是一个简单的建立H2连接的代码：

~~~java
import java.sql.*;
public class Test {
    public static void main(String[] a)
            throws Exception {
        Connection conn = DriverManager.
            getConnection("jdbc:h2:~/test", "sa", "");
        // add application code here
        conn.close();
    }
}
~~~

如果给定地址的数据库并不存在，


同时H2还提供了一个简单的管理界面，使用下面的命令就可以启动H2管理界面：

~~~shell
java -jar h2*.jar
~~~

默认情况下访问http://localhost:8082就可以访问到管理界面：

![](https://img-blog.csdnimg.cn/20200913220015317.png)

![](https://img-blog.csdnimg.cn/20200913220102162.png)


# r2dbc-h2

r2dbc-h2是r2dbc spi的一种实现。同样的使用r2dbc-h2也提供了两种h2的模式，一种是文件系统，一种是内存。

同时还提供了事务支持，prepared statements和batch statements等特性的支持。

# r2dbc-h2的Maven依赖

要想使用r2dbc-h2，我们需要添加如下依赖：

~~~xml
<dependency>
  <groupId>io.r2dbc</groupId>
  <artifactId>r2dbc-h2</artifactId>
  <version>${version}</version>
</dependency>
~~~

如果你体验snapshot版本，可以添加下面的依赖：

~~~xml
<dependency>
  <groupId>io.r2dbc</groupId>
  <artifactId>r2dbc-h2</artifactId>
  <version>${version}.BUILD-SNAPSHOT</version>
</dependency>

<repository>
  <id>spring-libs-snapshot</id>
  <name>Spring Snapshot Repository</name>
  <url>https://repo.spring.io/libs-snapshot</url>
</repository>
~~~

# 建立连接

h2有两种连接方式，file和内存，我们分别看一下都是怎么建立连接的：

~~~java
ConnectionFactory connectionFactory = ConnectionFactories.get("r2dbc:h2:mem:///testdb");

Publisher<? extends Connection> connectionPublisher = connectionFactory.create();
~~~

~~~java
ConnectionFactory connectionFactory = ConnectionFactories.get("r2dbc:h2:file//my/relative/path");

Publisher<? extends Connection> connectionPublisher = connectionFactory.create();
~~~

我们还可以通过ConnectionFactoryOptions来创建更加详细的连接信息：

~~~java
ConnectionFactoryOptions options = builder()
    .option(DRIVER, "h2")
    .option(PROTOCOL, "...")  // file, mem
    .option(HOST, "…")
    .option(USER, "…")
    .option(PASSWORD, "…")
    .option(DATABASE, "…")
    .build();

ConnectionFactory connectionFactory = ConnectionFactories.get(options);

Publisher<? extends Connection> connectionPublisher = connectionFactory.create();

// Alternative: Creating a Mono using Project Reactor
Mono<Connection> connectionMono = Mono.from(connectionFactory.create());
~~~

上面的例子中，我们使用到了driver,protocol, host,username,password和database这几个选项，除此之外H2ConnectionOption中定义了其他可以使用的Option：

~~~java
public enum H2ConnectionOption {

    /**
     * FILE|SOCKET|NO
     */
    FILE_LOCK,

    /**
     * TRUE|FALSE
     */
    IFEXISTS,

    /**
     * Seconds to stay open or {@literal -1} to to keep in-memory DB open as long as the virtual machine is alive.
     */
    DB_CLOSE_DELAY,

    /**
     * TRUE|FALSE
     */
    DB_CLOSE_ON_EXIT,

    /**
     * DML or DDL commands on startup, use "\\;" to chain multiple commands
     */
    INIT,

    /**
     * 0..3 (0=OFF, 1=ERROR, 2=INFO, 3=DEBUG)
     */
    TRACE_LEVEL_FILE,

    /**
     *  Megabytes (to override the 16mb default, e.g. 64)
     */
    TRACE_MAX_FILE_SIZE,

    /**
     * 0..3 (0=OFF, 1=ERROR, 2=INFO, 3=DEBUG)
     */
    TRACE_LEVEL_SYSTEM_OUT,

    LOG,

    /**
     * TRUE|FALSE
     */
    IGNORE_UNKNOWN_SETTINGS,

    /**
     * r|rw|rws|rwd (r=read, rw=read/write)
     */
    ACCESS_MODE_DATA,

    /**
     * DB2|Derby|HSQLDB|MSSQLServer|MySQL|Oracle|PostgreSQL|Ignite
     */
    MODE,

    /**
     *  TRUE|FALSE
     */
    AUTO_SERVER,

    /**
     * A port number
     */
    AUTO_SERVER_PORT,

    /**
     * Bytes (e.g. 512)
     */
    PAGE_SIZE,

    /**
     * Number of threads (e.g. 4)
     */
    MULTI_THREADED,

    /**
     * TQ|SOFT_LRU
     */
    CACHE_TYPE,

    /**
     * TRUE|FALSE
     */
    PASSWORD_HASH;
}
~~~

当然还有最直接的database选项：

~~~java
r2dbc:h2:file//../relative/file/name
r2dbc:h2:file///absolute/file/name
r2dbc:h2:mem:///testdb
~~~

我们还可以通过H2特有的代码H2ConnectionFactory来创建：

~~~java
H2ConnectionFactory connectionFactory = new H2ConnectionFactory(H2ConnectionConfiguration.builder()
    .inMemory("...")
    .option(H2ConnectionOption.DB_CLOSE_DELAY, "-1")
    .build());

Mono<Connection> connection = connectionFactory.create();
~~~

~~~java
CloseableConnectionFactory connectionFactory = H2ConnectionFactory.inMemory("testdb");

Mono<Connection> connection = connectionFactory.create();
~~~

# 参数绑定

在使用prepare statement的时候，我们需要进行参数绑定：

~~~java
connection
    .createStatement("INSERT INTO person (id, first_name, last_name) VALUES ($1, $2, $3)")
    .bind("$1", 1)
    .bind("$2", "Walter")
    .bind("$3", "White")
    .execute()
~~~

除了$符号绑定之外，还支持index绑定，如下所示：

~~~java
Statement statement = connection.createStatement("SELECT title FROM books WHERE author = $1 and publisher = $2");
statement.bind(0, "John Doe");
statement.bind(1, "Happy Books LLC");
~~~

# 批处理

我们来看下r2dbc-h2是怎么来进行批处理的：

~~~java
Batch batch = connection.createBatch();
Publisher<? extends Result> publisher = batch.add("SELECT title, author FROM books")
    .add("INSERT INTO books VALUES('John Doe', 'HappyBooks LLC')")
    .execute();
~~~

# 事务和Savepoint

r2dbc还支持事务和savepoint,我们可以在事务中rollback到特定的savepoint。具体的代码如下：

~~~java
Publisher<Void> begin = connection.beginTransaction();

Publisher<Void> insert1 = connection.createStatement("INSERT INTO books VALUES ('John Doe')").execute();

Publisher<Void> savepoint = connection.createSavepoint("savepoint");

Publisher<Void> insert2 = connection.createStatement("INSERT INTO books VALUES ('Jane Doe')").execute();


Publisher<Void> partialRollback = connection.rollbackTransactionToSavepoint("savepoint");


Publisher<Void> commit = connection.commit();
~~~

> 本文作者：flydean程序那些事
> 
> 本文链接：[www.flydean.com](www.flydean.com)
> 
> 本文来源：flydean的博客
> 
> 欢迎关注我的公众号:「程序那些事」最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！









